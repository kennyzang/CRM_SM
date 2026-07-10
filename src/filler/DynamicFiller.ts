/**
 * DynamicFiller — 动态控件填充器
 * 
 * 动态控件根据 renderMode.type 可以有不同的表现形式：
 * - singlist: 单选列表（类似 select）
 * - multilist: 多选列表（类似 select~multi）
 * - input: 输入框（类似 text）
 * - radio: 单选框
 * - checkbox: 多选框
 * - select: 单选下拉框
 * - multiSelect: 多选下拉框
 * - card: 单选卡片
 * - multiCard: 多选卡片
 * - panel: 单选层级
 * - multiPanel: 多选层级
 * - tree: 单选分类树
 * - multiTree: 多选分类树
 * 
 * 支持的字段结构：
 * {
 *   id: "fd_col_sabkub",
 *   fdType: "dynamic",
 *   label: "动态控件8",
 *   renderMode: {
 *     modelId: "xxx",
 *     modelName: "动态控件传值",
 *     type: "singlist"
 *   },
 *   options: [
 *     { label: "选项1", value: "1" },
 *     { label: "选项2", value: "2" }
 *   ]
 * }
 * 
 * API调用方式（参考用户提供的实际接口）：
 * POST /mkpaas/data/sys-xform/sysXFormCommonControl/executeListAll
 * {
 *   fdCommonControlId: "modelId",
 *   currentXformData: { fdId: "字段ID", fdFormId: "表单ID" },
 *   dynamicProps: []
 * }
 */
import { BaseFiller, FillerContext } from '@/filler/BaseFiller';

export class DynamicFiller extends BaseFiller {
  /**
   * 检测当前环境的上下文路径
   * SP3 环境使用 /mkpaas，其他环境可能为空
   */
  private detectContextPath(pageUrl: string): string {
    if (pageUrl.includes('/mkpaas/')) {
      return '/mkpaas';
    }
    return '';
  }

  /**
   * 获取动态控件的配置信息（displayField, valueField）
   * 
   * 对于 select/multiSelect 类型，需要从 getConfig API 获取字段映射配置
   */
  private async fetchControlConfig(modelId: string): Promise<{ displayField?: string; valueField?: string } | null> {
    const { page } = this.context;

    try {
      const pageUrl = page.url();
      const contextPath = this.detectContextPath(pageUrl);
      
      const config = await page.evaluate(async ({ contextPath, fdId }) => {
        const apiPath = `${contextPath}/data/sys-xform/sysXFormCommonControl/getConfig`;
        
        const res = await fetch(apiPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fdId })
        });

        if (!res.ok) return null;
        
        const result = await res.json();
        if (result?.data?.config) {
          return {
            displayField: result.data.config.displayField?.name,
            valueField: result.data.config.valueField?.name
          };
        }
        return null;
      }, { contextPath, fdId: modelId });

      if (config?.displayField && config?.valueField) {
        console.log(`[DynamicFiller] ✅ 获取到 controlConfig: displayField=${config.displayField}, valueField=${config.valueField}`);
      }
      
      return config;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.warn(`[DynamicFiller] 获取 controlConfig 失败:`, errorMessage);
      return null;
    }
  }

  /**
   * 从接口获取动态控件的真实数据
   * 
   * 请求格式参考实际测试验证结果
   */
  private async fetchDynamicOptions(modelId: string): Promise<any[]> {
    const { page, formId, field } = this.context;

    try {
      const pageUrl = page.url();
      const contextPath = this.detectContextPath(pageUrl);
      console.log(`[DynamicFiller] Detected context path: "${contextPath}"`);
      
      // 🔑 对于 select/multiSelect 类型，先获取 controlConfig 以正确提取字段名
      let fieldConfig: { displayField?: string; valueField?: string } | null = null;
      const renderType = field.renderMode?.type || '';
      if (['select', 'multiSelect', 'singlist', 'multilist'].includes(renderType)) {
        fieldConfig = await this.fetchControlConfig(modelId);
      }
      
      const data = await page.evaluate(async ({ contextPath, fdCommonControlId, fdFormId, fdId, config }) => {
        const apiPath = `${contextPath}/data/sys-xform/sysXFormCommonControl/executeListAll`;
        console.log(`[DynamicFiller] API path: ${apiPath}`);
        
        // 验证正确的请求格式
        const requestBody = {
          fdCommonControlId,
          currentXformData: {
            fdId,
            fdFormId
          },
          dynamicProps: []
        };
        
        console.log(`[DynamicFiller] Request body:`, JSON.stringify(requestBody));
        
        const res = await fetch(apiPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!res.ok) {
          console.warn(`[DynamicFiller] API请求失败: ${res.status} ${res.statusText}`);
          return [];
        }

        const result = await res.json();
        console.log(`[DynamicFiller] API response:`, JSON.stringify(result)?.substring(0, 500));
        
        // 如果有字段配置，使用正确的字段名提取数据
        const rawData = result?.data || [];
        if (config?.valueField && config?.displayField && Array.isArray(rawData)) {
          const mapped = rawData
            .map(item => ({
              _raw: item,
              fdId: item[config.valueField!] || item.fd_id || item.fdId,
              fdName: item[config.displayField!] || item[config.valueField!] || ''
            }))
            // 🔑 过滤掉无效数据：fdName 为空或等于字段名本身（如 "fd_col_xxx"）
            .filter(item => {
              const isValid = item.fdName && 
                              typeof item.fdName === 'string' && 
                              item.fdName.trim() !== '' &&
                              !item.fdName.startsWith('fd_col_');
              if (!isValid) {
                console.log(`[DynamicFiller] ⚠️ 过滤无效数据: fdId=${item.fdId?.substring(0, 16)}..., fdName="${item.fdName}"`);
              }
              return isValid;
            });
          
          console.log(`[DynamicFilter] ✅ 有效数据: ${mapped.length}/${rawData.length} 条`);
          return mapped;
        }
        
        return rawData;
      }, { 
        contextPath, 
        fdCommonControlId: modelId,
        fdFormId: formId,
        fdId: field.id,
        config: fieldConfig
      });

      console.log(`[DynamicFiller] Fetched ${data.length} options for modelId: ${modelId}`);
      return data;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.warn(`[DynamicFiller] 获取动态控件数据失败 (modelId: ${modelId}):`, errorMessage);
      return [];
    }
  }

  /**
   * 检查动态字段是否已有有效数据
   * 
   * 动态字段的值格式：
   * - 对象类型（单选）：{fdId: "xxx", fdName: "xxx"}
   * - 数组类型（多选）：[{fdId: "xxx", fdName: "xxx"}, ...]
   * - 字符串类型（input模式）："xxx"
   */
  protected async hasValue(): Promise<boolean> {
    const value = await this.getFieldValue();
    
    const valueStr = value === undefined || value === null ? String(value) : JSON.stringify(value).substring(0, 500);
    console.log(`[DynamicFiller.hasValue] Field "${this.context.field.label}" raw value:`, valueStr);
    
    // 标准空值检查
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    
    // 对于数组类型（多选），需要检查是否有有效数据
    if (Array.isArray(value)) {
      if (value.length === 0) return false;
      
      // 检查数组中是否有任何一个元素包含有效的 fdId 和 fdName
      const hasValidItem = value.some(item => 
        item && 
        typeof item === 'object' && 
        item.fdId && 
        typeof item.fdId === 'string' && 
        item.fdId.trim() !== ''
      );
      
      if (!hasValidItem) {
        console.log(`[DynamicFiller] Field "${this.context.field.label}" has empty array items, treating as empty`);
        return false;
      }
      
      return true;
    }
    
    // 对于对象类型（单选），检查是否有有效 fdId
    if (typeof value === 'object') {
      const objValue = value as { fdId?: string };
      if (objValue.fdId && typeof objValue.fdId === 'string' && objValue.fdId.trim() !== '') {
        return true;
      }
      return false;
    }
    
    // 字符串类型（input模式）已经在前面检查过了
    return true;
  }

  /**
   * 从 DOM 中提取 dynamic 控件的 modelId（fdCommonControlId）
   *
   * 当 Schema 中没有 renderMode 信息时，尝试从 MKXFORM 组件实例或 DOM 元素中获取
   * 优先使用 MKXFORM API，这是最可靠的方式
   * 
   * @returns modelId 字符串，或包含 modelId 和 type 的对象
   */
  
  /**
   * 从 DOM 结构检测动态控件的真实类型（单选/多选）
   */
  private async detectControlTypeFromDOM(): Promise<string> {
    const { page, field } = this.context;
    
    try {
      const detectedType = await page.evaluate(({ fieldId }) => {
        // 尝试多种选择器找到组件的 DOM 元素
        const selectors = [
          `[data-tid*="${fieldId}"]`,
          `[data-id$=".${fieldId}"]`,
          `[data-tid="comp-${fieldId}--dynamic"]`
        ];
        
        let cmpDom: Element | null = null;
        for (const selector of selectors) {
          cmpDom = document.querySelector(selector);
          if (cmpDom) break;
        }
        
        if (!cmpDom) {
          console.log(`[DynamicFiller.detectType] Cannot find DOM element for: ${fieldId}`);
          return 'singlist'; // 默认单选
        }
        
        console.log(`[DynamicFiller.detectType] Found element for ${fieldId}, checking structure...`);
        
        // 检查是否有 checkbox（多选）
        const hasCheckbox = !!cmpDom.querySelector(
          'input[type="checkbox"], .el-checkbox, [class*="checkbox"], .el-checkbox-group'
        );
        
        // 检查是否有 radio（单选）
        const hasRadio = !!cmpDom.querySelector(
          'input[type="radio"], .el-radio, [class*="radio"], .el-radio-group'
        );
        
        // 检查是否有多选相关类名
        const className = cmpDom.className || '';
        const hasMultiClass = /multi|multiple|check|checkbox/i.test(className);
        
        // 检查子元素数量（多选通常有多个选项）
        const options = cmpDom.querySelectorAll('[class*="option"], [class*="item"], label');
        const hasManyOptions = options.length > 2;
        
        console.log(`[DynamicFiller.detectType] Detection results:`);
        console.log(`  - hasCheckbox: ${hasCheckbox}`);
        console.log(`  - hasRadio: ${hasRadio}`);
        console.log(`  - hasMultiClass: ${hasMultiClass}`);
        console.log(`  - options count: ${options.length}`);
        
        // 判断逻辑
        if (hasCheckbox || hasMultiClass) {
          return 'multilist'; // 多选
        } else if (hasRadio) {
          return 'radio'; // 单选
        } else if (hasManyOptions && !hasRadio) {
          return 'multilist'; // 多个选项但没有 radio，可能是多选
        }
        
        return 'singlist'; // 默认单选
      }, { fieldId: field.id });
      
      return detectedType;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.warn(`[DynamicFiller] Failed to detect control type from DOM:`, errorMessage);
      return 'singlist';
    }
  }

  private async extractModelIdFromDOM(): Promise<string | { modelId: string; type?: string } | undefined> {
    const { page, field } = this.context;

    try {
      // 提取纯字段名（去掉明细表前缀）
      const pureFieldId = field.id.includes('.') ? field.id.split('.').pop() || field.id : field.id;
      
      console.log(`[DynamicFiller.extractModelId] Extracting modelId for: ${field.id} (pure: ${pureFieldId})`);

      // 方法1：通过 MKXFORM 组件实例获取（最可靠）
      const mkxformInfo = await page.evaluate(({ fieldId, pureId }) => {
        const mkxform = (window as any).MKXFORM;
        if (!mkxform) {
          console.log(`[DynamicFiller] MKXFORM not available`);
          return null;
        }

        // 尝试多种格式查找组件
        const possibleIds = [
          fieldId,                    // 原始ID (可能是 detailModelId.fieldId)
          pureId,                     // 纯字段ID
        ];
        
        let cmp: any = null;
        let usedId: string = '';
        
        for (const tryId of possibleIds) {
          cmp = mkxform.$(tryId);
          if (cmp) {
            usedId = tryId;
            console.log(`[DynamicFiller] ✅ Component found using: "${tryId}"`);
            break;
          } else {
            console.log(`[DynamicFiller] ❌ Not found using: "${tryId}"`);
          }
        }

        if (!cmp) {
          // 额外尝试：遍历所有组件查找匹配项
          console.log(`[DynamicFiller] Trying to find by iterating all components...`);
          const allComponents = Object.keys(mkxform || {}).filter((key: string) => key.startsWith('$'));
          
          const matchingKeys = allComponents.filter((key: string) => {
            const shortKey = key.replace(/^\$/, '');
            return shortKey.endsWith(pureId) || shortKey.endsWith(`.${pureId}`);
          });
          
          console.log(`[DynamicFiller] Matching keys for "${pureId}":`, matchingKeys);
          
          if (matchingKeys.length > 0) {
            cmp = mkxform.$(matchingKeys[0]);
            usedId = matchingKeys[0];
            console.log(`[DynamicFiller] ✅ Found component by iteration: "${usedId}"`);
          }
        }
        
        if (!cmp) {
          console.log(`[DynamicFiller] Component not found for any ID format`);
          return null;
        }

        const fibre = cmp._CURRENT_FIBRE;
        const props = fibre?.props || cmp.props;
        
        console.log(`[DynamicFiller] Component props.renderMode:`, JSON.stringify(props?.renderMode));
        console.log(`[DynamicFiller] Component props.type:`, props?.type);
        
        // 优先从 renderMode.modelId 获取（这是动态控件的标准结构）
        if (props?.renderMode?.modelId) {
          console.log(`[DynamicFiller] Found renderMode.modelId from MKXFORM: ${props.renderMode.modelId}`);
          console.log(`[DynamicFiller] Full renderMode object:`, JSON.stringify(props.renderMode, null, 2));
          
          // 尝试多种方式确定真实的控件类型
          let detectedType = props.renderMode.type;
          
          // 如果 type 是 singlist 或 undefined，尝试从 DOM 结构判断
          if (!detectedType || detectedType === 'singlist') {
            console.log(`[DynamicFiller] Type is "${detectedType}", trying to detect from DOM...`);
            
            // 获取组件的 DOM 元素
            const cmpDom = fibre?.dom || document.querySelector(`[data-tid*="${fieldId}"]`);
            if (cmpDom) {
              // 检查是否有 checkbox（多选）
              const hasCheckbox = cmpDom.querySelector('input[type="checkbox"], .el-checkbox, [class*="checkbox"]');
              const hasRadio = cmpDom.querySelector('input[type="radio"], .el-radio, [class*="radio"]');
              const hasMultiSelect = cmpDom.querySelector('[class*="multi"], [class*="multiple"]');
              
              console.log(`[DynamicFiller] DOM detection - hasCheckbox: ${!!hasCheckbox}, hasRadio: ${!!hasRadio}, hasMultiSelect: ${!!hasMultiSelect}`);
              
              if (hasCheckbox || hasMultiSelect) {
                detectedType = 'multilist'; // 多选类型
                console.log(`[DynamicFiller] Detected as MULTI-SELECT (checkbox/multi found)`);
              } else if (hasRadio) {
                detectedType = 'radio'; // 单选类型
                console.log(`[DynamicFiller] Detected as RADIO`);
              }
            }
          }
          
          return {
            modelId: props.renderMode.modelId,
            type: detectedType || 'singlist'
          };
        }
        
        // 备用：直接查找 fdCommonControlId 或 commonControlId
        const fdCommonControlId = props?.fdCommonControlId || props?.commonControlId;
        if (fdCommonControlId) {
          console.log(`[DynamicFiller] Found fdCommonControlId from MKXFORM: ${fdCommonControlId}`);
          return {
            modelId: fdCommonControlId,
            type: props?.renderMode?.type || props?.type || 'singlist'
          };
        }
        
        console.log(`[DynamicFiller] No modelId found in component props`);
        console.log(`[DynamicFiller] Available props keys:`, Object.keys(props || {}).slice(0, 20));
        return null;
      }, { fieldId: field.id, pureId: pureFieldId });

      if (mkxformInfo && mkxformInfo.modelId) {
        return mkxformInfo.modelId;
      }

      // 方法2：从 DOM 元素的 data 属性获取
      const domModelId = await page.evaluate(({ fieldId }) => {
        const selector = `[data-tid="comp-${fieldId}--dynamic"], [data-id$=".${fieldId}"]`;
        const el = document.querySelector(selector);
        if (!el) {
          console.log(`[DynamicFiller] Element not found for field: ${fieldId}`);
          return null;
        }

        const modelId = el.getAttribute('data-model-id') ||
                       el.getAttribute('data-control-id') ||
                       el.getAttribute('data-common-control-id');
        if (modelId) {
          console.log(`[DynamicFiller] Found modelId from DOM attributes: ${modelId}`);
          return modelId;
        }

        const input = el.querySelector('input[fdcommoncontrolid], [fdcommoncontrolid]');
        if (input) {
          const inputModelId = input.getAttribute('fdcommoncontrolid');
          console.log(`[DynamicFiller] Found modelId from input attribute: ${inputModelId}`);
          return inputModelId;
        }

        console.log(`[DynamicFiller] Could not extract modelId from DOM for: ${fieldId}`);
        return null;
      }, { fieldId: field.id, pureId: pureFieldId });

      if (domModelId) {
        return domModelId;
      }

      // 方法3：对于明细表动态控件，使用纯字段名查找主表中同类型控件的 modelId
      // 根据调试结果：MKXFORM.$(detailModelId.fieldId) 返回的是表格容器，不是动态控件
      // 但 MKXFORM.$(pureFieldId) 可以找到主表的动态控件
      if (field.id.includes('.') && field.id.includes('_d_')) {
        console.log(`[DynamicFiller] 🔑 Detail table field detected, trying main table matching...`);
        
        const matchedFromMain: any = await page.evaluate(({ pureId }) => {
          const mkxform = (window as any).MKXFORM;
          if (!mkxform) return { _debug: 'MKXFORM not available' };
          
          const cmp = mkxform.$(pureId);
          
          if (!cmp) {
            return { _debug: `Component not found with pure ID: ${pureId}` };
          }
          
          const fibre = cmp._CURRENT_FIBRE;
          const props = fibre?.props || {};
          const renderMode = props.renderMode;
          
          if (!renderMode?.modelId) {
            return { 
              _debug: `No renderMode.modelId, propsKeys: ${Object.keys(props).length}`,
              _propsKeysSample: Object.keys(props).slice(0, 10)
            };
          }

          let actualType = renderMode.type || 'singlist';
          
          const selectors = [
            `[data-tid*="${pureId}"]`,
            `[data-id$=".${pureId}"]`,
          ];
          
          for (const selector of selectors) {
            const domEl = document.querySelector(selector);
            if (domEl) {
              const hasCheckbox = !!domEl.querySelector(
                'input[type="checkbox"], .el-checkbox, [class*="checkbox"]'
              );
              if (hasCheckbox && actualType !== 'multilist' && actualType !== 'multiSelect') {
                actualType = 'multilist';
              }
              break;
            }
          }
          
          return {
            modelId: renderMode.modelId,
            type: actualType,
            source: `main_table_match_${pureId}`
          };
        }, { pureId: pureFieldId });
        
        console.log(`[DynamicFiller] Method 3 result for "${pureFieldId}":`, JSON.stringify(matchedFromMain));
        
        if (matchedFromMain && matchedFromMain.modelId) {
          console.log(`[DynamicFiller] ✅✅✅ Extracted modelId from main table match:`, JSON.stringify(matchedFromMain));
          return matchedFromMain;
        }
      }

      console.warn(`[DynamicFiller] All methods failed to extract modelId for field: ${field.id}`);
      return undefined;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.warn(`[DynamicFiller] Failed to extract modelId from DOM:`, errorMessage);
      return undefined;
    }
  }

  async fill(value?: unknown): Promise<void> {
    const { field, rowIndex } = this.context;

    // 检查字段是否已有值（主表场景）
    // 明细表场景跳过检查，始终尝试填充
    if (rowIndex === undefined && await this.hasValue()) {
      console.log(`[DynamicFiller] Field "${field.label}" already has value, skipping`);
      return;
    }

    const { renderMode, options } = field as any;

    // 获取渲染模式
    let renderType = renderMode?.type || 'singlist';
    let modelId = renderMode?.modelId;

    // 如果 Schema 中没有 modelId，尝试从 DOM 动态获取
    if (!modelId) {
      const extractedInfo = await this.extractModelIdFromDOM();
      if (extractedInfo) {
        // extractModelIdFromDOM 可能返回字符串或对象 { modelId, type }
        if (typeof extractedInfo === 'string') {
          modelId = extractedInfo;
          // 字符串返回时，需要额外检测类型
          if (renderType === 'singlist') {
            console.log(`[DynamicFiller] Got string modelId, detecting type from DOM for "${field.label}"...`);
            renderType = await this.detectControlTypeFromDOM();
            console.log(`[DynamicFiller] Detected type: ${renderType}`);
          }
        } else if (typeof extractedInfo === 'object' && extractedInfo.modelId) {
          modelId = extractedInfo.modelId;
          // 如果提取到了 type 信息，更新 renderType
          if (extractedInfo.type && renderType === 'singlist') {
            renderType = extractedInfo.type;
          }
        }
        
        console.log(`[DynamicFiller] Extracted modelId from DOM: ${modelId}, type: ${renderType}`);
        // 更新 renderMode 信息以便后续使用
        if (!renderMode) {
          (field as any).renderMode = { modelId, type: renderType };
        }
      }
    }

    // 优先从接口获取真实数据
    let apiOptions: any[] = [];
    if (modelId) {
      apiOptions = await this.fetchDynamicOptions(modelId);
    }

    // 使用API数据或回退到静态options
    const availableOptions = apiOptions.length > 0 ? apiOptions : (options || []);

    // 根据渲染模式生成值
    let fillValue: any;
    
    // 辅助函数：从选项中提取 ID 和名称（兼容多种数据格式）
    const extractOptionData = (opt: any) => {
      // 格式1：标准格式 { fdId, fdName }
      if (opt.fdId && opt.fdName) {
        return { id: opt.fdId, name: opt.fdName };
      }
      
      // 格式2：关联选择器格式 { fd_id, ... } (select/multiSelect 类型)
      if (opt.fd_id || opt.fdId) {
        const id = opt.fd_id || opt.fdId;
        
        // 尝试找到显示名称：优先 dynamicProps.fdNameCn，其次找第一个有意义的字段值
        let name = '';
        if (opt.dynamicProps?.fdNameCn) {
          name = opt.dynamicProps.fdNameCn;
        } else if (opt.dynamicProps?.fdName) {
          name = opt.dynamicProps.fdName;
        } else {
          // 查找第一个非系统字段作为名称
          const systemFields = ['fd_id', 'fdId', 'fd_deleted', 'fd_xform_id', 'fdFormId', 
                               'fd_order', 'fd_main_id', 'fd_create_time', 'fd_update_time',
                               'fdCreateId', 'fdUpdateId', 'versionId', 'id'];
          
          for (const [key, value] of Object.entries(opt)) {
            if (!systemFields.includes(key) && typeof value === 'string' && value.trim()) {
              name = value;
              break;
            }
          }
          
          // 如果还是空，使用 ID 作为后备
          if (!name) {
            name = id.substring(0, 8);
          }
        }
        
        return { id, name };
      }
      
      // 格式3：简单格式 { value, label }
      return { id: opt.value || opt.id, name: opt.label || opt.name || '选项' };
    };

    switch (renderType) {
      case 'singlist':
      case 'select':
        // 单选列表/下拉框 - 使用对象格式（与 select 一致）
        if (availableOptions.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableOptions.length);
          const selected = availableOptions[randomIndex];
          const { id, name } = extractOptionData(selected);
          fillValue = { fdId: id, fdName: name };
        } else {
          fillValue = { fdId: '1', fdName: '测试选项' }; // 默认值
        }
        break;
      
      case 'radio':
      case 'card':
      case 'panel':
      case 'tree':
      case 'treeCard':
      case 'treeList':
        // 单选框/卡片/面板/树 - 使用数组格式（UI点击产生的格式）
        if (availableOptions.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableOptions.length);
          const selected = availableOptions[randomIndex];
          const { id, name } = extractOptionData(selected);
          fillValue = [{ fdId: id, fdName: name }];
        } else {
          fillValue = [{ fdId: '1', fdName: '测试选项' }]; // 默认值
        }
        break;
      
      case 'multilist':
      case 'multiSelect':
      case 'checkbox':
      case 'multiCard':
      case 'multiPanel':
      case 'multiTree':
      case 'multiTreeCard':
      case 'multiTreeList':
        // 多选模式 - 随机选择1-2个选项
        if (availableOptions.length > 0) {
          const count = Math.min(2, availableOptions.length);
          const shuffled = [...availableOptions].sort(() => Math.random() - 0.5);
          fillValue = shuffled.slice(0, count).map((opt: any) => {
            const { id, name } = extractOptionData(opt);
            return { fdId: id, fdName: name };
          });
        } else {
          fillValue = [{ fdId: '1', fdName: '选项1' }, { fdId: '2', fdName: '选项2' }]; // 默认值
        }
        break;
      
      case 'input':
      default:
        // 输入框模式
        fillValue = this.randomString('dynamic_');
        break;
    }

    // 使用 MKXFORM API 设置值
    // 重要：动态控件必须使用完整 fieldId 格式：
    //   - 主表: formId.fieldId (如 mk_model_xxx.fd_col_yyy)
    //   - 明细表: detailModelId.fieldId (如 mk_model_xxx_d_zzz.fd_col_yyy)
    const fullFieldId = this.getFieldIdentifier();
    console.log(`[DynamicFiller] Setting value for "${field.label}" (${fullFieldId}): ${JSON.stringify(fillValue)}`);
    console.log(`[DynamicFiller] renderType: ${renderType}, rowIndex: ${rowIndex}`);
    
    if (rowIndex !== undefined) {
      // 明细表场景：使用 updateControl
      console.log(`[DynamicFiller] Using updateControl for detail table (row: ${rowIndex})`);
      if (await this.setValueViaUpdateControl(rowIndex, fillValue, fullFieldId)) {
        console.log(`[DynamicFiller] Successfully set value via updateControl for "${field.label}"`);
      } else {
        console.warn(`[DynamicFiller] updateControl failed for "${field.label}"`);
      }
    } else {
      // 主表场景：使用 setValue
      if (await this.setValueDirectly(fullFieldId, fillValue)) {
        console.log(`[DynamicFiller] Successfully set value via MKXFORM for "${field.label}"`);
      } else {
        console.warn(`[DynamicFiller] MKXFORM setValue failed for "${field.label}"`);
      }
    }
  }

  /**
   * 通过 MKXFORM updateControl 设置明细表字段值
   * 
   * @param rowIndex 行索引
   * @param value 要设置的值
   * @returns true 如果成功设置值
   */
  private async setValueViaUpdateControl(rowIndex: number, value: unknown, fullFieldId?: string): Promise<boolean> {
    const { page } = this.context;
    // 使用传入的完整字段标识符（detailModelId.fieldId 格式）
    // 如果没有传入，则从 context.field.id 获取
    const fieldId: string = fullFieldId || this.context.field.id;

    console.log(`[DynamicFiller.setValueViaUpdateControl] fieldId="${fieldId}", rowIndex=${rowIndex}`);

    try {
      const result = await page.evaluate(
        ({ fid, rowIdx, val }: { fid: string; rowIdx: number; val: unknown }) => {
          // @ts-ignore
          const mkxform = window.MKXFORM;
          if (!mkxform) {
            return { success: false, reason: 'MKXFORM not available' };
          }

          try {
            if (typeof mkxform.updateControl !== 'function') {
              return { success: false, reason: 'MKXFORM.updateControl not available' };
            }
            
            console.log(`[DynamicFiller.updateControl] Calling updateControl("${fid}", ${rowIdx},`, val, ')');
            mkxform.updateControl(fid, rowIdx, val);
            return { success: true };
          } catch (error) {
            return { 
              success: false, 
              reason: `Exception: ${error instanceof Error ? error.message : String(error)}` 
            };
          }
        },
        { fid: fieldId, rowIdx: rowIndex, val: value }
      );

      if (result.success) {
        console.log(`[DynamicFiller] updateControl: Successfully set value for "${this.context.field.label}" (${fieldId}) at row ${rowIndex}`);
        return true;
      } else {
        console.log(`[DynamicFiller] updateControl: Failed for "${this.context.field.label}" - ${result.reason}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[DynamicFiller] updateControl: Exception for "${this.context.field.label}" - ${errorMessage}`);
      return false;
    }
  }

  /**
   * 直接使用纯字段 ID 调用 MKXFORM.setValue（不通过 BaseFiller）
   * 动态控件必须使用纯字段 ID（不带 formId 前缀）
   */
  private async setValueDirectly(pureFieldId: string, value: unknown): Promise<boolean> {
    const { field, page } = this.context;

    try {
      const result = await page.evaluate(
        ({ fid, val }: { fid: string; val: unknown }) => {
          // @ts-ignore
          const mkxform = window.MKXFORM;
          if (!mkxform) {
            return { success: false, reason: 'MKXFORM not available' };
          }

          try {
            if (typeof mkxform.setValue !== 'function') {
              return { success: false, reason: 'MKXFORM.setValue not available' };
            }
            
            console.log(`[DynamicFiller.setValueDirectly] Calling setValue("${fid}",`, val, ')');
            mkxform.setValue(fid, val);
            return { success: true };
          } catch (error) {
            return { 
              success: false, 
              reason: `Exception: ${error instanceof Error ? error.message : String(error)}` 
            };
          }
        },
        { fid: pureFieldId, val: value }
      );

      if (result.success) {
        console.log(`[DynamicFiller] setValueDirectly: Successfully set value for "${field.label}" (${pureFieldId})`);
        
        // 验证值是否真正设置成功
        await page.waitForTimeout(300);
        const verifyResult = await page.evaluate(({ fid }) => {
          // @ts-ignore
          const mkxform = window.MKXFORM;
          if (!mkxform) return { verified: false, reason: 'MKXFORM not available' };
          
          const cmp = mkxform.$(fid);
          if (!cmp) return { verified: false, reason: 'Component not found after setValue' };
          
          const fibre = cmp._CURRENT_FIBRE;
          const actualValue = fibre?.props?.value;
          return { verified: true, actualValue };
        }, { fid: pureFieldId });
        
        if (verifyResult.verified) {
          console.log(`[DynamicFiller] setValueDirectly: Verified value:`, JSON.stringify(verifyResult.actualValue));
        }
        
        return true;
      } else {
        console.log(`[DynamicFiller] setValueDirectly: Failed for "${field.label}" - ${result.reason}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[DynamicFiller] setValueDirectly: Exception for "${field.label}" - ${errorMessage}`);
      return false;
    }
  }
}