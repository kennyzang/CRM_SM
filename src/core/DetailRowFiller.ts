/**
 * DetailRowFiller — 明细表单行自动填充器
 *
 * 通过 DOM 自动发现行内各字段类型，并委托给对应的 Filler 类（与主表共享同一套 FillerFactory）。
 * 作用域通过 FillerContext.scope 注入到各 Filler，使其在 <td> 内而非整个 fieldset 内查找元素。
 *
 * 字段发现顺序（从最具体到最宽泛，避免误匹配）：
 *   textarea → radio → checkbox → relation → select → timepicker → timestamp → numbertext → fd_input
 *
 * relation 必须在 select 之前处理，否则 fillSelects 会误抢 .ele-xform-relation 内的 .lui-select。
 */
import { Page, Locator } from '@playwright/test';
import { FormField } from '@/schema/SchemaGenerator';
import { FillerFactory } from '@/filler/FillerFactory';
import { fetchCfgOptions } from '@/utils/cfgDataFetcher';

export class DetailRowFiller {
  constructor(
    private page: Page, 
    private row: Locator, 
    private rowIndex: number = 0,
    private fields: FormField[] = [],  // Schema 中的字段定义
    private detailModelId?: string   // 明细表模型ID
  ) {}

  // ─── Public API ────────────────────────────────────────────────────────────

  async fill(): Promise<void> {
    const processed = new Set<string>();

    await this.fillTextareas(processed);

    // ⭐ 动态控件字段：使用 DynamicFiller 通过 API 获取选项并填充
    await this.fillDynamicFields(processed);

    // ⭐ 明细表 cfg 字段优先通过 API 获取选项并用 MKXFORM.setValue 填充
    await this.fillCfgRadios(processed);
    await this.fillCfgCheckboxes(processed);
    await this.fillCfgSelects(processed);

    // 等待 cfg 字段触发的 React 重渲染
    await this.page.waitForTimeout(500);

    await this.fillRadios(processed);
    await this.fillCheckboxes(processed);

    // relation 必须在 select 之前：避免 fillSelects 误抢 .ele-xform-relation 内的 .lui-select
    await this.fillRelations(processed);
    await this.page.waitForTimeout(300);

    await this.fillSelects(processed);

    // 等待 select 触发的 DatePicker/TimePicker 重渲染
    await this.page.waitForTimeout(500);

    await this.fillDatetimes(processed);  // 同时处理日期和时间，用 placeholder 区分
    
    // ⭐ 新增：在填充普通文本之前，先填充地址本字段
    await this.fillAddresses(processed);
    
    await this.fillNumbers(processed);
    await this.fillTexts(processed);

    console.log(`[DetailRowFiller] Row filled (${processed.size} fields: ${[...processed].join(', ')})`);
  }

  // ─── Field type handlers ───────────────────────────────────────────────────

  private async fillTextareas(processed: Set<string>): Promise<void> {
    const tds = await this.row.locator('td:has(textarea[name])').all();
    for (const td of tds) {
      const name = await td.locator('textarea[name]').first().getAttribute('name').catch(() => null);
      if (!name) continue;
      const fid = extractFieldId(name);
      if (processed.has(fid)) continue;
      processed.add(fid);
      // 使用完整的字段标识符（name 属性包含 tableId.fieldId 格式）
      await FillerFactory.createWithScope(this.page, makeField(name, 'textarea'), td, this.rowIndex)
        .fill()
        .catch(e => console.warn(`[DetailRowFiller] textarea(${fid}):`, e));
    }
  }

  /**
   * 明细表 cfg 下拉框字段：通过 API 获取选项并用 MKXFORM.setValue 填充
   */
  private async fillCfgSelects(processed: Set<string>): Promise<void> {
    // 获取所有可能是下拉框的字段信息
    const selectInfo: Array<{ name: string; isMulti: boolean }> = await this.row.evaluate(tr => {
      const selects: Array<{ name: string; isMulti: boolean }> = [];
      
      // 方法1: 查找所有包含 data-id 的元素，检查其父元素是否有下拉框特征
      const dataIdElements = tr.querySelectorAll('[data-id]');
      
      dataIdElements.forEach(el => {
        const dataId = el.getAttribute('data-id') || '';
        if (!dataId) return;
        
        // 检查是否是下拉框（通过查找 .lui-select 或 .ele-xform-select 类）
        const hasSelectClass = el.classList.contains('lui-select') || 
                              el.classList.contains('ele-xform-select') ||
                              el.closest('.lui-select') !== null ||
                              el.closest('.ele-xform-select') !== null;
        
        // 排除 relation 字段
        if (el.closest('.ele-xform-relation')) return;
        
        // 检查是否是多选
        const isMulti = el.classList.contains('lui-select-multiple') || 
                       el.classList.contains('ele-xform-select-multiple') ||
                       el.closest('.lui-select-multiple') !== null ||
                       el.closest('.ele-xform-select-multiple') !== null;
        
        if (hasSelectClass && !selects.some(s => s.name === dataId)) {
          selects.push({ name: dataId, isMulti });
        }
      });
      
      // 方法2: 直接查找所有 input[name]，检查其父元素是否有下拉框特征
      const inputs = tr.querySelectorAll('input[name]') as NodeListOf<HTMLInputElement>;
      inputs.forEach(input => {
        const name = input.name || '';
        if (!name) return;

        // 排除已经处理过的
        if (selects.some(s => s.name === name)) return;

        // 排除 radio 和 checkbox
        if (input.type === 'radio' || input.type === 'checkbox') return;
        
        // 检查是否是下拉框（通过查找 .lui-select 类）
        const hasSelectClass = input.closest('.lui-select') !== null ||
                              input.closest('.ele-xform-select') !== null;
        
        // 排除 relation 字段
        if (input.closest('.ele-xform-relation')) return;
        
        const isMulti = input.closest('.lui-select-multiple') !== null ||
                       input.closest('.ele-xform-select-multiple') !== null;
        
        if (hasSelectClass) {
          selects.push({ name, isMulti });
        }
      });
      
      return selects;
    });

    console.log(`[DetailRowFiller] fillCfgSelects: found ${selectInfo.length} select fields: ${JSON.stringify(selectInfo)}`);
    
    for (const { name, isMulti } of selectInfo) {
      const fid = extractFieldId(name);
      if (processed.has(fid)) continue;

      // 获取 cfgId
      const cfgId = await this.getCfgIdFromMKXFORM(name);
      console.log(`[DetailRowFiller] fillCfgSelects: ${name} -> cfgId=${cfgId}`);
      if (!cfgId) continue;

      processed.add(fid);
      const fdType = isMulti ? 'select~multi' : 'select';
      console.log(`[DetailRowFiller] Filling cfg select: ${fid} (${name}), cfgId: ${cfgId}, type: ${fdType}`);

      await this.fillCfgFieldByCfgId(name, fdType, cfgId);
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * 明细表 cfg 单选字段：通过 API 获取选项并用 MKXFORM.setValue 填充
   */
  private async fillCfgRadios(processed: Set<string>): Promise<void> {
    // 先在浏览器上下文中获取 radio 名称列表
    const names: string[] = await this.row.evaluate(tr => {
      const radios = Array.from(tr.querySelectorAll<HTMLInputElement>('input[type="radio"][name]'));
      const validNames: string[] = [];
      
      radios.forEach(el => {
        const name = el.name;
        if (!name) return;
        
        // 排除 relation 组件内的 radio（由 fillRelations 处理）
        if (el.closest('.ele-xform-relation')) return;
        
        if (!validNames.includes(name)) {
          validNames.push(name);
        }
      });
      
      return validNames;
    });

    for (const name of names) {
      const fid = extractFieldId(name);
      // 如果没有 cfgId，跳过（让 fillRadios 处理非 cfg 的 radio）
      const actualCfgId = await this.getCfgIdFromMKXFORM(name);
      if (!actualCfgId) {
        console.log(`[DetailRowFiller] No cfgId for radio ${fid}, will be handled by fillRadios`);
        continue;
      }

      processed.add(fid);
      console.log(`[DetailRowFiller] Filling cfg radio: ${fid} (${name}), cfgId: ${actualCfgId}`);

      await this.fillCfgFieldByCfgId(name, 'radio', actualCfgId);
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * 明细表 cfg 多选字段：通过 API 获取选项并用 MKXFORM.setValue 填充
   */
  private async fillCfgCheckboxes(processed: Set<string>): Promise<void> {
    // 先在浏览器上下文中获取 checkbox 名称列表
    const names: string[] = await this.row.evaluate(tr =>
      [...new Set(
        Array.from(tr.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name]'))
          .map(el => el.name)
          .filter(Boolean)
      )]
    );

    for (const name of names) {
      const fid = extractFieldId(name);
      if (processed.has(fid)) continue;

      const actualCfgId = await this.getCfgIdFromMKXFORM(name);
      if (!actualCfgId) {
        console.log(`[DetailRowFiller] No cfgId for checkbox ${fid}, will be handled by fillCheckboxes`);
        continue;
      }

      processed.add(fid);
      console.log(`[DetailRowFiller] Filling cfg checkbox: ${fid} (${name}), cfgId: ${actualCfgId}`);

      await this.fillCfgFieldByCfgId(name, 'checkbox', actualCfgId);
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * 从 MKXFORM 获取字段的 cfgId
   * 优先尝试主表字段（用于明细表字段，因为它们有相同的 fieldId）
   */
  private async getCfgIdFromMKXFORM(fieldId: string): Promise<string | null> {
    try {
      const result = await this.page.evaluate((id) => {
        // @ts-ignore
        const mkxform = window.MKXFORM;
        if (!mkxform) {
          return null;
        }

        // 提取 fieldId（去掉表名前缀）
        const shortId = id.split('.').pop()?.split('~')[0] || id;

        // 尝试查找主表组件（相同的 fieldId）
        let cmp = mkxform.$(shortId);
        if (!cmp) {
          // 尝试带表名前缀的完整 id
          cmp = mkxform.$(id);
        }
        if (!cmp) {
          // 尝试 detailModelId.fieldId 格式
          const parts = id.split('.');
          if (parts.length >= 2) {
            const tableId = parts[0];
            const fieldIdOnly = parts[1].split('~')[0];
            cmp = mkxform.$(`${tableId}.${fieldIdOnly}`);
          }
        }
        if (!cmp) return null;

        const fibre = cmp._CURRENT_FIBRE;
        if (!fibre || !fibre.props) return null;

        const props = fibre.props as any;
        return props.cfgId || props.cfg?.fdId || props.cfg?.cfgId || props.enumId || null;
      }, fieldId);

      return result;
    } catch {
      return null;
    }
  }

  /**
   * 通过 cfgId 填充明细表 cfg 字段
   */
  private async fillCfgFieldByCfgId(fieldId: string, fdType: 'radio' | 'checkbox' | 'select' | 'select~multi', cfgId: string): Promise<void> {
    try {
      const options = await fetchCfgOptions(this.page, cfgId);
      if (options.length === 0) {
        console.log(`[DetailRowFiller] No options fetched for cfgId: ${cfgId}`);
        return;
      }

      const randomIndex = Math.floor(Math.random() * options.length);
      const selectedOption = options[randomIndex];

      let valueToSet: any;
      if (fdType === 'checkbox') {
        const count = Math.min(Math.floor(Math.random() * 3) + 1, options.length);
        const shuffled = [...options].sort(() => Math.random() - 0.5);
        valueToSet = shuffled.slice(0, count).map((opt: any) => ({
          fdId: opt.fdId,
          fdName: opt.fdName
        }));
      } else {
        valueToSet = [{
          fdId: selectedOption.fdId,
          fdName: selectedOption.fdName
        }];
      }

      console.log(`[DetailRowFiller] Setting ${fdType} value: ${JSON.stringify(valueToSet)}`);

      // 从 fieldId 中提取 detailTableId.fieldId（去掉 ~ 后面的内容）
      const cleanFieldId = fieldId.split('~')[0];

      const success = await this.page.evaluate(
        ({ fieldId, rowNum, value }: { fieldId: string; rowNum: number; value: any }) => {
          // @ts-ignore
          const mkxform = window.MKXFORM;
          if (!mkxform) {
            console.warn('[DetailRowFiller] MKXFORM not available');
            return false;
          }

          if (typeof mkxform.updateControl !== 'function') {
            console.warn('[DetailRowFiller] MKXFORM.updateControl not available');
            return false;
          }

          try {
            console.log(`[DetailRowFiller] Calling MKXFORM.updateControl(${fieldId}, ${rowNum}, ...)`);
            mkxform.updateControl(fieldId, rowNum, value);
            console.log('[DetailRowFiller] MKXFORM.updateControl completed');
            return true;
          } catch (error) {
            console.warn('[DetailRowFiller] MKXFORM.updateControl failed:', error);
            return false;
          }
        },
        { fieldId: cleanFieldId, rowNum: this.rowIndex, value: valueToSet }
      );

      if (success) {
        console.log(`[DetailRowFiller] Successfully set ${fdType} value for ${fieldId} (row ${this.rowIndex})`);
      } else {
        console.log(`[DetailRowFiller] Failed to set ${fdType} value for ${fieldId}`);
      }
    } catch (error) {
      console.warn(`[DetailRowFiller] Error filling cfg field ${fieldId}:`, error);
    }
  }

  /**
   * 检查字段是否为 cfg 类型（基础数据字段）
   */
  private async checkIfCfgField(fieldId: string): Promise<boolean> {
    try {
      const result = await this.page.evaluate((id) => {
        // @ts-ignore
        const mkxform = window.MKXFORM;
        if (!mkxform) return false;

        // 尝试多种方式查找组件
        let cmp = mkxform.$(id);
        if (!cmp) {
          // 尝试简化名称
          const shortId = id.split('.').pop() || id;
          cmp = mkxform.$(shortId);
        }
        if (!cmp) {
          // 尝试带行索引的名称
          const parts = id.split('.');
          if (parts.length >= 2) {
            const tableId = parts[0];
            const fieldIdOnly = parts[1].split('~')[0];
            cmp = mkxform.$(`${tableId}.${fieldIdOnly}`);
          }
        }
        if (!cmp) return false;

        const fibre = cmp._CURRENT_FIBRE;
        if (!fibre || !fibre.props) return false;

        const props = fibre.props;
        // cfg 字段在 props.cfg 中有配置信息
        return !!(props.cfg || props.cfgId || props.enumId || (props.options && props.options.length > 0));
      }, fieldId);

      return result;
    } catch {
      return false;
    }
  }

  /**
   * 填充明细表 cfg 字段：通过 API 获取选项，用 MKXFORM.setValue 设置值
   */
  private async fillCfgField(fieldId: string, fdType: 'radio' | 'checkbox'): Promise<void> {
    try {
      const cfgInfo = await this.page.evaluate((id) => {
        // @ts-ignore
        const cmp = window.MKXFORM?.$(id);
        if (!cmp) return ({ success: false } as any);

        const fibre = cmp._CURRENT_FIBRE;
        if (!fibre || !fibre.props) return ({ success: false } as any);

        const props = fibre.props as any;
        const cfg = props.cfg as any;
        const cfgId = props.cfgId;
        const cfgFdId = cfg ? cfg.fdId : undefined;
        const cfgCfgId = cfg ? cfg.cfgId : undefined;
        const enumId = props.enumId;
        const fdId = props.fdId;

        return {
          success: true,
          cfgId: cfgId || cfgFdId || cfgCfgId,
          enumId: enumId,
          fdId: fdId,
          cfg: props.cfg
        };
      }, fieldId) as any;

      if (!cfgInfo || !cfgInfo.success) {
        console.log(`[DetailRowFiller] Cannot get cfg info for ${fieldId}`);
        return;
      }

      const cfgId = (cfgInfo as any).cfgId || (cfgInfo as any).enumId || (cfgInfo as any).fdId;
      if (!cfgId) {
        console.log(`[DetailRowFiller] No cfgId found for ${fieldId}`);
        return;
      }

      console.log(`[DetailRowFiller] Found cfgId: ${cfgId} for ${fieldId}`);

      const options = await fetchCfgOptions(this.page, cfgId);
      if (options.length === 0) {
        console.log(`[DetailRowFiller] No options fetched for ${fieldId}`);
        return;
      }

      const randomIndex = Math.floor(Math.random() * options.length);
      const selectedOption = options[randomIndex];

      let valueToSet: any;
      if (fdType === 'checkbox') {
        const count = Math.min(Math.floor(Math.random() * 3) + 1, options.length);
        const shuffled = [...options].sort(() => Math.random() - 0.5);
        valueToSet = shuffled.slice(0, count).map((opt: any) => ({
          fdId: opt.fdId,
          fdName: opt.fdName
        }));
      } else {
        valueToSet = [{
          fdId: selectedOption.fdId,
          fdName: selectedOption.fdName
        }];
      }

      console.log(`[DetailRowFiller] Setting ${fdType} value: ${JSON.stringify(valueToSet)}`);

      const success = await this.setValueViaMKXFORM(fieldId, valueToSet);

      if (success) {
        console.log(`[DetailRowFiller] Successfully set ${fdType} value for ${fieldId}`);
      } else {
        console.log(`[DetailRowFiller] Failed to set ${fdType} value for ${fieldId}`);
      }
    } catch (error) {
      console.warn(`[DetailRowFiller] Error filling cfg field ${fieldId}:`, error);
    }
  }

  /**
   * 使用 MKXFORM.setValue() 直接设置字段值
   */
  private async setValueViaMKXFORM(fieldId: string, value: unknown): Promise<boolean> {
    try {
      const result = await this.page.evaluate(
        ({ fid, val }: { fid: string; val: unknown }) => {
          // @ts-ignore
          if (typeof window.MKXFORM?.setValue === 'function') {
            // @ts-ignore
            window.MKXFORM.setValue(fid, val);
            return { success: true };
          }
          return { success: false, reason: 'MKXFORM.setValue not available' };
        },
        { fid: fieldId, val: value }
      );

      return result.success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[DetailRowFiller] MKXFORM.setValue exception:`, errorMessage);
      return false;
    }
  }

  /**
   * 从 API 获取 cfg 字段的选项
   * @deprecated 使用 import { fetchCfgOptions } from '../utils/cfgDataFetcher' 替代
   */
  private async fetchCfgOptions(cfgId: string, pageUrl: string): Promise<any[]> {
    return fetchCfgOptions(this.page, cfgId);
  }

  /**
   * 解析 API 返回的 cfg 选项
   * @deprecated cfgDataFetcher 已处理解析逻辑
   */
  private parseCfgOptions(data: any): any[] {
    if (!data) return [];

    if (Array.isArray(data)) {
      return data.map(item => ({
        fdId: item.fdId || item.value,
        fdName: item.fdName || item.label || item.text,
        value: item.fdId || item.value,
        label: item.fdName || item.label || item.text
      }));
    }

    if (data.data && Array.isArray(data.data)) {
      return this.parseCfgOptions(data.data);
    }

    if (data.list && Array.isArray(data.list)) {
      return this.parseCfgOptions(data.list);
    }

    if (data.options && Array.isArray(data.options)) {
      return this.parseCfgOptions(data.options);
    }

    if (data.result && Array.isArray(data.result)) {
      return this.parseCfgOptions(data.result);
    }

    return [];
  }

  private async fillRadios(processed: Set<string>): Promise<void> {
    // evaluate() 比 locator().all() 更稳定：不受 React 重渲染影响
    const names: string[] = await this.row.evaluate(tr => {
      const radios = Array.from(tr.querySelectorAll<HTMLInputElement>('input[type="radio"][name]'));
      const validNames: string[] = [];
      
      radios.forEach(el => {
        const name = el.name;
        if (!name) return;
        
        // 排除 relation 组件内的 radio（由 fillRelations 处理）
        if (el.closest('.ele-xform-relation')) return;
        
        if (!validNames.includes(name)) {
          validNames.push(name);
        }
      });
      
      return validNames;
    });

    for (const name of names) {
      const fid = extractFieldId(name);
      if (processed.has(fid)) continue;
      processed.add(fid);
      // 将整个含有该 name 的 td 作为 scope，确保所有选项都在范围内
      const td = this.row.locator(`td:has(input[type="radio"][name="${name}"])`).first();
      // 使用完整的字段标识符
      await FillerFactory.createWithScope(this.page, makeField(name, 'radio'), td, this.rowIndex)
        .fill()
        .catch(e => console.warn(`[DetailRowFiller] radio(${fid}):`, e));
      await this.page.waitForTimeout(100);
    }
  }

  private async fillCheckboxes(processed: Set<string>): Promise<void> {
    const names: string[] = await this.row.evaluate(tr => {
      const checkboxes = Array.from(tr.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name]'));
      const validNames: string[] = [];
      
      checkboxes.forEach(el => {
        const name = el.name;
        if (!name) return;
        
        // 排除 relation 组件内的 checkbox（由 fillRelations 处理）
        if (el.closest('.ele-xform-relation')) return;
        
        if (!validNames.includes(name)) {
          validNames.push(name);
        }
      });
      
      return validNames;
    });

    for (const name of names) {
      const fid = extractFieldId(name);
      if (processed.has(fid)) continue;
      processed.add(fid);
      const td = this.row.locator(`td:has(input[type="checkbox"][name="${name}"])`).first();
      // 使用完整的字段标识符
      await FillerFactory.createWithScope(this.page, makeField(name, 'checkbox'), td, this.rowIndex)
        .fill()
        .catch(e => console.warn(`[DetailRowFiller] checkbox(${fid}):`, e));
      await this.page.waitForTimeout(100);
    }
  }

  /**
   * 业务关联组件（relation / relation~multi）
   *
   * 核心原则：直接使用 Schema 定义和 MKXFORM API，完全不依赖 DOM 结构
   * DynamicFiller 内部会：
   *   1. 通过 API 获取动态选项数据
   *   2. 使用 MKXFORM.updateControl 设置值（明细表）
   */
  private async fillDynamicFields(processed: Set<string>): Promise<void> {
    if (this.fields.length === 0) {
      console.warn(`[DetailRowFiller] No schema fields provided for dynamic filling`);
      return;
    }

    const dynamicFields = this.fields.filter(f => f.fdType === 'dynamic');
    
    if (dynamicFields.length === 0) {
      console.log(`[DetailRowFiller] No dynamic fields found in schema`);
      return;
    }

    console.log(`[DetailRowFiller] Found ${dynamicFields.length} dynamic fields in schema`);

    // 从字段 ID 中提取 detailModelId（如果未提供）
    const modelId = this.detailModelId || this.extractDetailModelId();

    for (const schemaField of dynamicFields) {
      const fieldId = schemaField.id.includes('.') 
        ? schemaField.id.split('.').pop() || schemaField.id 
        : schemaField.id;
      
      if (processed.has(fieldId)) continue;
      processed.add(fieldId);

      console.log(`[DetailRowFill] dynamic(${fieldId}) fullId=${schemaField.id}, modelId=${modelId}`);

      const field: FormField = {
        id: schemaField.id,
        fdType: 'dynamic',
        label: schemaField.label,
        required: schemaField.required || false,
        ...(schemaField as any).renderMode ? { renderMode: (schemaField as any).renderMode } : {},
        ...(schemaField as any).options ? { options: (schemaField as any).options } : {},
      };

      // 创建 DynamicFiller 并填充，传递 detailModelId 作为 formId 和 rowIndex
      await FillerFactory.create(this.page, modelId, field, this.rowIndex)
        .fill()
        .catch(e => console.warn(`[DetailRowFiller] dynamic(${fieldId}):`, e));

      await this.page.waitForTimeout(300).catch(() => {});
    }
  }

  /**
   * 从字段 ID 中提取 detailModelId
   * 格式: mk_model_xxx_d_yyy.fieldId -> mk_model_xxx_d_yyy
   */
  private extractDetailModelId(): string {
    if (this.fields.length > 0) {
      const firstField = this.fields[0];
      if (firstField.id.includes('.')) {
        return firstField.id.split('.')[0];
      }
    }
    return 'unknown_detail_table';
  }

  /**
   * 业务关联组件（relation / relation~multi）
   *
   * 核心原则：直接使用 Schema 定义和 MKXFORM API，完全不依赖 DOM 结构
   * RelationFiller 内部会：
   *   1. 通过 MKXFORM API 获取选项数据
   *   2. 使用 MKXFORM.updateControl 设置值（明细表）或 MKXFORM.setValue（主表）
   */
  private async fillRelations(processed: Set<string>): Promise<void> {
    // 核心原则：直接使用 Schema 定义，完全不依赖 DOM 探测
    if (this.fields.length === 0) {
      console.warn(`[DetailRowFiller] No schema fields provided for relation filling`);
      return;
    }

    const relationFields = this.fields.filter(f => 
      f.fdType === 'relation' || f.fdType === 'relation~multi'
    );
    console.log(`[DetailRowFiller] Found ${relationFields.length} relation fields in schema (relation + relation~multi)`);
    
    for (const schemaField of relationFields) {
      const fieldId = schemaField.id.split('.').pop() || schemaField.id;
      
      if (processed.has(fieldId)) continue;
      processed.add(fieldId);

      // 从 Schema 获取完整字段 ID 和 relationCfg
      const fullFieldId = schemaField.id;
      const relationCfg = (schemaField as any).relationCfg;
      
      console.log(`[DetailRowFiller] relation(${fieldId}) fullId=${fullFieldId}`);

      const field: FormField = {
        id:    fullFieldId,
        fdType: schemaField.fdType,  // 保留原始 fdType（relation 或 relation~multi）
        label: schemaField.label,
        required: schemaField.required || false,
        ...(relationCfg ? { relationCfg } : {}),
      };

      // 直接创建 RelationFiller，不传递 DOM scope（完全不依赖 DOM）
      // 传递 rowIndex 参数，用于 MKXFORM.updateControl 调用
      await FillerFactory.create(this.page, this.detailModelId || this.extractDetailModelId(), field, this.rowIndex)
        .fill()
        .catch(e => console.warn(`[DetailRowFiller] relation(${fieldId}):`, e));

      await this.page.waitForTimeout(200).catch(() => {});
    }
  }

  /**
   * 根据字段 ID 查找对应的 td 索引
   * 支持多种匹配模式：
   * 1. 精确匹配 select[name]
   * 2. 后缀匹配（完整ID的最后部分）
   * 3. 包含匹配（明细表字段可能使用完整ID）
   */
  private async findTdIndexByFieldId(fieldId: string): Promise<number> {
    // 先输出调试信息查看行内的 DOM 结构
    const debugInfo = await this.row.evaluate((tr) => {
      const tds = Array.from(tr.querySelectorAll('td'));
      const info: Array<{
        index: number;
        hasRelation: boolean;
        selectName?: string;
        dataId?: string;
        className?: string;
      }> = [];
      
      tds.forEach((td, i) => {
        const rel = td.querySelector('.ele-xform-relation, .ele-xform-relation-wrap-select');
        const select = td.querySelector('.lui-select[name]');
        const dataId = td.querySelector('[data-id]')?.getAttribute('data-id');
        
        info.push({
          index: i,
          hasRelation: !!rel,
          selectName: select?.getAttribute('name') || undefined,
          dataId: dataId || undefined,
          className: td.className,
        });
      });
      
      return info;
    });
    
    console.log(`[DetailRowFiller] Row ${this.rowIndex} DOM debug info:`, JSON.stringify(debugInfo, null, 2));
    
    // 然后进行实际查找
    return this.row.evaluate((tr, targetFieldId) => {
      const tds = Array.from(tr.querySelectorAll('td'));
      
      for (let i = 0; i < tds.length; i++) {
        const td = tds[i];
        
        // 检查是否包含 relation 组件
        const rel = td.querySelector('.ele-xform-relation, .ele-xform-relation-wrap-select');
        if (!rel) continue;
        
        // 策略1：检查 relation 组件内的 select[name]
        const select = rel.querySelector('.lui-select[name]');
        if (select) {
          const name = select.getAttribute('name');
          if (name) {
            // 精确匹配
            if (name === targetFieldId) return i;
            // 后缀匹配（完整ID格式：{modelId}.{fieldId}）
            if (name.endsWith(`.${targetFieldId}`)) return i;
            // 包含匹配（targetFieldId 是完整ID，name 是短ID）
            if (targetFieldId.endsWith(`.${name}`)) return i;
          }
        }
        
        // 策略2：检查 radio/checkbox 模式的 input[name]
        const radioOrCb = rel.querySelector('input[type="radio"][name], input[type="checkbox"][name]');
        if (radioOrCb) {
          const name = radioOrCb.getAttribute('name');
          if (name) {
            if (name === targetFieldId) return i;
            if (name.endsWith(`.${targetFieldId}`)) return i;
            if (targetFieldId.endsWith(`.${name}`)) return i;
          }
        }
        
        // 策略3：检查组件自身的 data-id
        const dataId = rel.getAttribute('data-id');
        if (dataId) {
          if (dataId === targetFieldId) return i;
          if (dataId.endsWith(`.${targetFieldId}`)) return i;
          if (targetFieldId.endsWith(`.${dataId}`)) return i;
        }
        
        // 策略4：检查 td 内任何元素的 data-id
        const anyDataId = td.querySelector('[data-id]')?.getAttribute('data-id');
        if (anyDataId) {
          if (anyDataId === targetFieldId) return i;
          if (anyDataId.endsWith(`.${targetFieldId}`)) return i;
          if (targetFieldId.endsWith(`.${anyDataId}`)) return i;
        }
      }
      
      return -1;
    }, fieldId);
  }

  /**
   * 获取行内所有包含 relation 组件的 td 索引（按顺序）
   */
  private async getRelationTdIndexes(): Promise<number[]> {
    return this.row.evaluate((tr) => {
      const tds = Array.from(tr.querySelectorAll('td'));
      const indexes: number[] = [];
      
      tds.forEach((td, i) => {
        // 查找所有可能的 relation 组件类名
        // 包括单选框(.radio)、列表(.list)、下拉选择(.select)等模式
        const hasRelationClass = td.querySelector(
          '.ele-xform-relation, ' +
          '.ele-xform-relation-wrap-select, ' +
          '.ele-xform-relation-wrap-radio, ' +
          '.ele-xform-relation-wrap-singlelist, ' +
          '.ele-xform-relation-wrap-mullist, ' +
          '.ele-xform-relation-wrap-list'
        );
        
        // 额外检查是否有 relation 相关的属性或标签
        const hasRelationAttr = td.querySelector('[data-tid*="relation"], [data-id*="relation"]');
        
        if (hasRelationClass || hasRelationAttr) {
          indexes.push(i);
        }
      });
      
      return indexes;
    });
  }

  private async fillSelects(processed: Set<string>): Promise<void> {
    // evaluate() 避免 React 重渲染后 locator().all() 返回空的问题
    // 同时排除 .ele-xform-relation 内的 .lui-select（已由 fillRelations 处理）
    const items: Array<{ name: string; tdIndex: number }> = await this.row.evaluate(tr =>
      Array.from(tr.querySelectorAll('.lui-select[name]'))
        .filter(el => !el.closest('.ele-xform-relation, .ele-xform-relation-wrap-select'))
        .map((el, idx) => ({
          name: el.getAttribute('name') || '',
          tdIndex: Array.from(tr.querySelectorAll('td')).indexOf(el.closest('td') as unknown as HTMLTableCellElement)
        }))
        .filter(item => item.name && item.tdIndex >= 0)
    );

    for (const { name, tdIndex } of items) {
      const fid = extractFieldId(name);
      if (processed.has(fid)) continue;
      processed.add(fid);
      const td = this.row.locator('td').nth(tdIndex);
      // 使用完整的字段标识符
      await FillerFactory.createWithScope(this.page, makeField(name, 'select'), td, this.rowIndex)
        .fill()
        .catch(e => console.warn(`[DetailRowFiller] select(${fid}):`, e));
      // 确保下拉已关闭
      await this.page.keyboard.press('Escape').catch(() => {});
    }
  }

  /**
   * 统一处理日期和时间选择器
   *
   * 用 evaluate() 在 DOM 内一次性扫描所有 readonly 输入并通过 placeholder/classList 区分类型，
   * 避免依赖不稳定的 CSS 类名（lui-time-picker-input vs lui-picker-input 可能混用）。
   */
  private async fillDatetimes(processed: Set<string>): Promise<void> {
    type DatetimeInfo = { name: string; fdType: string; tdIndex: number };

    const items: DatetimeInfo[] = await this.row.evaluate(tr => {
      const results: DatetimeInfo[] = [];
      const tds = Array.from(tr.querySelectorAll('td'));
      tds.forEach((td, tdIndex) => {
        // 查找 readonly 的 input（日期/时间选择器共同特征）
        const inputs = Array.from(td.querySelectorAll<HTMLInputElement>('input[readonly]'));
        inputs.forEach(input => {
          const name = input.getAttribute('name') || input.getAttribute('data-tid') || '';
          if (!name) return;
          const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
          const classList = input.className || '';
          const dataTid = input.getAttribute('data-tid') || '';
          // 时间选择器判断：placeholder 含 time/时间，或 class 含 time-picker，或 data-tid 含 timepicker
          const isTime = placeholder.includes('time') || placeholder.includes('时间') ||
                         classList.includes('time-picker') ||
                         dataTid.toLowerCase().includes('timepicker');
          results.push({ name, fdType: isTime ? 'timepicker' : 'timestamp', tdIndex });
        });
      });
      return results;
    });

    for (const { name, fdType, tdIndex } of items) {
      const fid = extractFieldId(name);
      if (processed.has(fid)) continue;
      processed.add(fid);
      const td = this.row.locator('td').nth(tdIndex);
      // 使用完整的字段标识符
      await FillerFactory.createWithScope(this.page, makeField(name, fdType), td, this.rowIndex)
        .fill()
        .catch(e => console.warn(`[DetailRowFiller] ${fdType}(${fid}):`, e));
    }
  }

  /**
   * 填充地址本字段（address / agency）
   *
   * 识别特征：
   *   1. input name 包含 "-address-input" 或 "-agency-input"
   *   2. placeholder 是 "请选择" 且不是日期/时间选择器
   *   3. td 内包含地址本组件的 CSS 类
   */
  private async fillAddresses(processed: Set<string>): Promise<void> {
    type AddressInfo = { name: string; fdType: string; tdIndex: number; className: string };

    // 使用 className 检测地址本字段（因为明细表 address input 的 name 可能为 null）
    const items: AddressInfo[] = await this.row.evaluate(tr => {
      const results: AddressInfo[] = [];
      const tds = Array.from(tr.querySelectorAll('td'));
      
      tds.forEach((td, tdIndex) => {
        // 查找所有 input 元素（包括 readonly）
        const inputs = Array.from(td.querySelectorAll<HTMLInputElement>('input[type="text"]'));
        
        inputs.forEach(input => {
          // 排除数值输入框
          if (input.className.includes('number-input')) return;
          
          const name = input.getAttribute('name') || '';
          const placeholder = (input.getAttribute('placeholder') || '').trim();
          const className = input.className || '';
          
          let fdType = '';
          
          // 特征1：根据 name 属性判断（最可靠）
          if (name.includes('-address-input')) {
            fdType = 'address';
          } else if (name.includes('-agency-input')) {
            fdType = 'agency';
          }
          // 特征2：根据 className 判断（明细表 address 字段的 name 可能为 null）
          else if (className.includes('sys-org-input-search-select-input') || 
                   className.includes('km-agency-input-search-select-input')) {
            // 根据具体类名区分 address 和 agency
            fdType = className.includes('km-agency') ? 'agency' : 'address';
          }
          // 特征3：根据 placeholder 判断（"请选择" 且不是日期）
          else if (placeholder === '请选择' && !name.toLowerCase().includes('date') && 
                   !name.toLowerCase().includes('time')) {
            // 额外检查：确保不是普通下拉框（通过父元素判断）
            const hasAddressClass = !!td.querySelector(
              '.sys-org-input-search-select, .km-agency-input-search-select, ' +
              '[class*="org-input"]'
            );
            if (hasAddressClass) {
              fdType = 'address';
            }
          }
          
          if (fdType) {
            results.push({ 
              name: name || `address-field-${tdIndex}`,  // 如果 name 为空，生成一个临时标识
              fdType, 
              tdIndex,
              className 
            });
          }
        });
      });
      
      return results;
    });

    console.log(`[DetailRowFiller] Found ${items.length} address/agency fields in row`);
    if (items.length > 0) {
      console.log(`[DetailRowFiller] Address fields details:`, JSON.stringify(items.map(item => ({
        name: item.name,
        fdType: item.fdType,
        tdIndex: item.tdIndex,
        className: item.className.substring(0, 50) + '...'
      })), null, 2));
    }

    for (const { name, fdType, tdIndex } of items) {
      // 对于没有 name 的字段，使用 tdIndex 作为唯一标识
      const fid = name.includes('address-field-') ? `${fdType}_${tdIndex}` : extractFieldId(name);
      
      if (processed.has(fid)) {
        console.log(`[DetailRowFiller] Skipping already processed field: ${fid}`);
        continue;
      }
      processed.add(fid);
      
      const td = this.row.locator('td').nth(tdIndex);
      console.log(`[DetailRowFiller] Filling address field: ${fid} (${fdType}) at td[${tdIndex}]`);
      
      // 使用完整的字段标识符创建 Filler
      await FillerFactory.createWithScope(this.page, makeField(name, fdType), td, this.rowIndex)
        .fill()
        .catch(e => console.warn(`[DetailRowFiller] ${fdType}(${fid}):`, e));
      
      // 地址本弹窗操作需要额外等待
      await this.page.waitForTimeout(1000);
    }
  }

  private async fillNumbers(processed: Set<string>): Promise<void> {
    const items: Array<{ name: string; tdIndex: number }> = await this.row.evaluate(tr => {
      const results: Array<{ name: string; tdIndex: number }> = [];
      Array.from(tr.querySelectorAll('td')).forEach((td, tdIndex) => {
        td.querySelectorAll<HTMLInputElement>('input.lui-input-number-input').forEach(input => {
          const name = input.getAttribute('name') || input.getAttribute('data-tid') || '';
          if (name) results.push({ name, tdIndex });
        });
      });
      return results;
    });

    for (const { name, tdIndex } of items) {
      const fid = extractFieldId(name);
      if (processed.has(fid)) continue;
      processed.add(fid);
      const td = this.row.locator('td').nth(tdIndex);
      // 使用完整的字段标识符
      await FillerFactory.createWithScope(this.page, makeField(name, 'numbertext'), td, this.rowIndex)
        .fill()
        .catch(e => console.warn(`[DetailRowFiller] numbertext(${fid}):`, e));
      await this.page.waitForTimeout(100);
    }
  }

  /**
   * 填充单行文本
   *
   * 用 evaluate() 扫描所有 type=text 且非 readonly、非 number 的输入，
   * 不依赖 [name] 属性是否存在（明细表可能只有 data-tid）。
   */
  private async fillTexts(processed: Set<string>): Promise<void> {
    const items: Array<{ name: string; tdIndex: number }> = await this.row.evaluate(tr => {
      const results: Array<{ name: string; tdIndex: number }> = [];
      Array.from(tr.querySelectorAll('td')).forEach((td, tdIndex) => {
        td.querySelectorAll<HTMLInputElement>('input[type="text"]:not([readonly])').forEach(input => {
          // 排除数值输入框（class 包含 number-input）
          if (input.className.includes('number-input')) return;
          const name = input.getAttribute('name') || input.getAttribute('data-tid') || '';
          if (name) results.push({ name, tdIndex });
        });
      });
      return results;
    });

    for (const { name, tdIndex } of items) {
      const fid = extractFieldId(name);
      if (processed.has(fid)) continue;
      processed.add(fid);
      const td = this.row.locator('td').nth(tdIndex);
      // 使用完整的字段标识符
      await FillerFactory.createWithScope(this.page, makeField(name, 'fd_input'), td, this.rowIndex)
        .fill()
        .catch(e => console.warn(`[DetailRowFiller] fd_input(${fid}):`, e));
      await this.page.waitForTimeout(100);
    }
  }
}

// ─── Module-level helpers ────────────────────────────────────────────────────

/**
 * 从 name / data-tid 提取简洁的 fieldId
 * 处理格式: {detailModelId}.{fieldId}~{rowKey} 或 {fieldId}-{idx}-comp-...
 */
function extractFieldId(nameOrTid: string): string {
  let fid = nameOrTid.split('.').pop() || nameOrTid;
  fid = fid.split('~')[0];
  if (fid.includes('-comp-')) fid = fid.split('-comp-')[0];
  return fid;
}

function makeField(id: string, fdType: string): FormField {
  return { id, fdType, label: id, required: false };
}

export default DetailRowFiller;