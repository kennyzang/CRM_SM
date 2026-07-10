/**
 * RelationFiller — 业务关联组件填充器
 *
 * 支持多种渲染模式（renderMode）：
 * - singlelist / mullist : 列表框，点击触发器打开弹窗，勾选后确认回填
 * - select               : 单选下拉，fillRelationSelectMode（含 API 等待）
 * - multiSelect          : 多选下拉，fillRelationSelectMode（含 API 等待）
 * - radio                : 单选框，  委托 RadioFiller
 * - checkbox             : 多选框，  委托 CheckboxFiller
 *
 * fdType: relation, relation~multi
 *
 * renderMode 读取优先级：
 *   1. schema field.renderMode（手动维护，最可靠）
 *   2. MKXFORM API（页面全局对象，运行时）
 *   3. DOM 结构检测（兜底）
 */
import { Locator } from '@playwright/test';
import { BaseFiller } from '@/filler/BaseFiller';
import { RadioFiller } from '@/filler/RadioFiller';
import { CheckboxFiller } from '@/filler/CheckboxFiller';
import { SelectFiller } from '@/filler/SelectFiller';
import { DetailTableLinkageTrigger } from '@/utils/DetailTableLinkageTrigger';
import type { IOutParamItem } from '@/schema/SchemaGenerator';

// 扩展 Window 类型以支持 __relationDataCache
declare global {
  interface Window {
    __relationDataCache?: Record<string, any[]>;
    __relationDynamicCache?: Map<string, any>;
    MKXFORM?: {
      getValue: (fieldId: string) => any;
      [key: string]: any;
    };
  }
}

export class RelationFiller extends BaseFiller {
  private static dynamicParamsCache: Map<string, Record<string, any>> = new Map();

  static async setupDynamicParamsInterceptor(page: any): Promise<void> {
    await page.evaluate(() => {
      if (window.__relationDynamicCache) return;

      window.__relationDynamicCache = new Map();

      const originalFetch = window.fetch;
      window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url || '';

        if (url.includes('associate/list') && init?.body) {
          try {
            const body = JSON.parse(init.body as string);
            if (body.controlId && body.dynamic && Object.keys(body.dynamic).length > 0) {
              console.log(`[RelationFiller.interceptor] 📥 Captured dynamic params for "${body.controlId}":`, JSON.stringify(body.dynamic).substring(0, 200));
              (window as any).__relationDynamicCache.set(body.controlId, body.dynamic);
            }
          } catch (e) {
            // ignore parse errors
          }
        }

        return originalFetch.call(this, input, init);
      };
    });
    console.log('[RelationFiller] ✅ Dynamic params interceptor installed');
  }

  static clearDynamicParamsCache(): void {
    RelationFiller.dynamicParamsCache.clear();
  }
  /**
   * 检查业务关联字段是否已有有效数据
   * 
   * 业务关联字段的值格式：[{fdId: "xxx", fdName: "xxx", ...}, ...]
   * 需要验证数组中的每个元素是否包含有效的 fdId 和 fdName
   * 
   * @returns true 如果字段已有有效数据，false 如果为空或只有空对象
   */
  protected async hasValue(): Promise<boolean> {
    const value = await this.getFieldValue();
    
    // 添加调试日志（处理 undefined/null 情况）
    const valueStr = value === undefined || value === null ? String(value) : JSON.stringify(value).substring(0, 500);
    console.log(`[RelationFiller.hasValue] Field "${this.context.field.label}" raw value:`, valueStr);
    
    // 标准空值检查
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    
    // 对于数组类型（业务关联字段的值），需要检查是否有有效数据
    if (Array.isArray(value)) {
      if (value.length === 0) return false;
      
      // 检查数组中是否有任何一个元素包含有效的 fdId 和 fdName
      const hasValidItem = value.some(item => 
        item && 
        typeof item === 'object' && 
        item.fdId && 
        typeof item.fdId === 'string' && 
        item.fdId.trim() !== '' &&
        item.fdName && 
        typeof item.fdName === 'string' && 
        item.fdName.trim() !== ''
      );
      
      if (!hasValidItem) {
        console.log(`[RelationFiller] Field "${this.context.field.label}" has empty array items, treating as empty`);
        return false;
      }
      
      return true;
    }
    
    // 如果不是数组，可能是对象结构（明细表可能返回整个行数据）
    // 这种情况下，我们无法确定当前字段是否有值，应该尝试填充
    if (typeof value === 'object') {
      console.log(`[RelationFiller] Field "${this.context.field.label}" has object value (not array), treating as empty for safety`);
      return false;
    }
    
    return true;
  }

  async fill(value?: unknown): Promise<void> {
    const { field, rowIndex } = this.context;

    // 检查字段是否已有值（根据需求 P008）
    // 使用 MKXFORM API 检查，不依赖 DOM
    // 注意：对于明细表（rowIndex 存在），MKXFORM.getControlValue 无法正确区分不同 relation 字段的值
    // 因此明细表场景跳过 hasValue 检查，始终尝试填充
    if (rowIndex === undefined && await this.hasValue()) {
      console.log(`[RelationFiller] Field "${field.label}" already has value, skipping`);
      return;
    }

    // 核心原则：直接通过 MKXFORM API 设置值，不依赖 DOM 结构
    // 业务关联字段的值格式：[{fdId: "xxx", fdName: "xxx", entityId: "xxx"}, ...]
    const mkxformValue = await this.generateRelationValue();
    console.log(`[RelationFiller] Setting value for "${field.label}":`, JSON.stringify(mkxformValue));
    
    if (mkxformValue && await this.setValueViaMKXFORM(mkxformValue)) {
      console.log(`[RelationFiller] Successfully set value via MKXFORM for "${field.label}"`);

      // 🔑 关键：根据场景触发不同的后续处理
      if (rowIndex !== undefined) {
        // 明细表场景：使用 DetailTableLinkageTrigger 触发联动
        // 原因：MKXFORM.setValue() 只更新 value prop，不会触发组件内部的完整联动链路
        // 需要手动模拟 onChange → processOutData → getValueDetail → setOutParams 流程
        console.log(`[RelationFiller] 📦 Detail table scenario, triggering linkage for row ${rowIndex}`);
        await this.triggerDetailTableLinkage();
      } else {
        // 主表场景：触发 onChange 事件
        await this.triggerFieldChange();
      }

      // 验证值是否正确设置
      await this.verifyAndLogValue();

      return;
    }

    // MKXFORM API 方式失败（API 无数据或 setValue 失败），尝试 DOM 列表弹窗模式兜底
    // 适用场景：字段有 datasourceFilter 依赖（如 fd_contacts 依赖 fd_owner_people），
    //   RelationFiller 无法读取依赖字段值，但浏览器表单引擎已内部解析依赖，
    //   点击触发器可以让弹窗正常加载并显示可选数据。
    // 仅对主表字段（rowIndex 为 undefined）启用此兜底，明细表字段不适合 DOM 模式。
    if (rowIndex === undefined) {
      console.warn(`[RelationFiller] MKXFORM approach failed for "${field.label}", trying DOM list mode fallback`);
      const wrapper = this.getWrapper();
      await this.fillListMode(wrapper);
    } else {
      console.warn(`[RelationFiller] MKXFORM setValue failed for "${field.label}", no DOM fallback`);
    }
  }

  /**
   * 生成业务关联字段的值
   * 返回格式：[{fdId: "xxx", fdName: "xxx"}, ...]
   * 注意：如果 API 获取失败，返回 null，不使用假数据
   */
  private async generateRelationValue(): Promise<unknown> {
    const { field, page } = this.context;
    const isMulti = field.fdType === 'relation~multi';
    
    // 尝试通过 API 获取真实数据
    const apiData = await this.fetchRelationOptions();
    if (apiData && apiData.length > 0) {
      if (isMulti) {
        // 多选：随机选择1-3条
        const count = Math.min(Math.floor(Math.random() * 3) + 1, apiData.length);
        const shuffled = apiData.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
      } else {
        // 单选：随机选择1条
        return [apiData[Math.floor(Math.random() * apiData.length)]];
      }
    }

    // API 获取失败，返回 null（不使用假数据）
    console.warn(`[RelationFiller] No data available for "${field.label}", skipping fill (no mock data)`);
    return null;
  }

  /**
   * 通过 API 获取业务关联选项数据
   * 优先从页面已加载的网络请求中获取数据（监听 associate/list 请求）
   * 如果失败，再尝试直接调用 API
   */
  private async fetchRelationOptions(): Promise<Array<{fdId: string; fdName: string}> | null> {
    const { field, page } = this.context;
    
    // 获取 refFieldName（用于字段转换）
    const relationCfg = (field as any)?.relationCfg;
    const refFieldName = relationCfg?.refFieldName || '$fd_name$';
    const displayFieldName = refFieldName.replace(/\$/g, '') || 'fd_name';
    console.log(`[RelationFiller] refFieldName: ${refFieldName}, displayFieldName: ${displayFieldName}`);
    
    // 尝试从浏览器的网络请求缓存中获取 associate/list 的响应
    // 页面加载时已经调用过这个接口，我们可以获取它的响应数据
    const cachedData = await page.evaluate(({ controlId, displayFieldName }) => {
      // 尝试从 window 上获取可能存储的数据
      if (window.__relationDataCache && window.__relationDataCache[controlId]) {
        const rawData = window.__relationDataCache[controlId];
        // 转换数据格式：{fd_id, fd_name, ...} -> {fdId, fdName, entityId, ...}
        // 添加 entityId 字段，有些组件需要这个字段才能正确显示
        return rawData.map((item: any) => ({
          fdId: item.fd_id || item.fdId || item.id || '',
          fdName: item[displayFieldName] || item.fd_name || item.fdName || item.name || '',
          entityId: item.fd_id || item.fdId || item.id || '',
          id: item.fd_id || item.fdId || item.id || '',
          name: item[displayFieldName] || item.fd_name || item.fdName || item.name || '',
        })).filter((item: any) => item.fdId && item.fdName);
      }
      
      // 尝试从 MKXFORM 组件获取数据
      const mkxform = window.MKXFORM;
      if (!mkxform) return null;
      
      const cmp = mkxform.$(controlId) as any;
      if (!cmp) return null;
      
      // 查看组件的内部状态
      const state = cmp._CURRENT_FIBRE?.state;
      if (state && state.data && state.data.content && Array.isArray(state.data.content)) {
        return state.data.content.map((item: any) => ({
          fdId: item.fd_id || item.fdId || item.id || '',
          fdName: item[displayFieldName] || item.fd_name || item.fdName || item.name || '',
        })).filter((item: any) => item.fdId && item.fdName);
      }
      
      // 尝试其他数据来源
      const dataSources = [
        cmp.options,
        cmp.data,
        cmp._CURRENT_FIBRE?.props?.options,
        cmp.state?.data,
        cmp.state?.options,
      ];
      
      for (const source of dataSources) {
        if (source && Array.isArray(source) && source.length > 0) {
          // 检查是否是真实数据（有真实的 fd_id 格式）
          const firstItem = source[0];
          if (firstItem && (firstItem.fd_id || firstItem.fdId)) {
            const result = source.map((item: any) => ({
              fdId: item.fd_id || item.fdId || item.id || '',
              fdName: item[displayFieldName] || item.fd_name || item.fdName || item.name || '',
            })).filter((item: any) => item.fdId && item.fdName);
            
            if (result.length > 0) {
              return result;
            }
          }
        }
      }
      
      return null;
    }, { controlId: field.id, displayFieldName });
    
    if (cachedData && cachedData.length > 0) {
      // 检查数据是否是真实数据（真实数据的 fdId 是长字符串格式，假数据是简单数字）
      const firstItem = cachedData[0];
      const isRealData = firstItem && firstItem.fdId && firstItem.fdId.length > 10;
      
      if (isRealData) {
        console.log(`[RelationFiller] Got ${cachedData.length} options from cached data for "${field.label}"`);
        console.log(`[RelationFiller] Data sample:`, JSON.stringify(cachedData.slice(0, 2)));
        return cachedData;
      } else {
        console.warn(`[RelationFiller] Cached data is fake (simple numeric IDs), calling API directly`);
      }
    }
    
    console.warn(`[RelationFiller] No cached data found for "${field.label}", calling API directly`);
    
    // 直接调用 API 获取数据（多选列表框不会自动加载）
    return await this.fetchRelationOptionsFromAPI(displayFieldName);
  }
  
  /**
   * 检测当前环境的上下文路径
   * SP3 环境使用 /mkpaas，其他环境可能为空
   */
  private detectContextPath(pageUrl: string): string {
    // 检测是否为 mkpaas 环境
    if (pageUrl.includes('/mkpaas/')) {
      return '/mkpaas';
    }
    // 其他环境上下文为空
    return '';
  }

  /**
   * 直接调用 associate/list API 获取业务关联数据
   * 使用浏览器的 fetch API 来保持认证状态
   */
  private async fetchRelationOptionsFromAPI(displayFieldName: string): Promise<Array<{fdId: string; fdName: string; entityId: string; id: string; name: string}> | null> {
    const { field, page } = this.context;
    
    try {
      // 获取 xformId 和其他必要参数
      const pageUrl = page.url();
      // 从 URL 中提取 xformId（格式：/add/{xformId}）
      // 注意：需要排除 query string（? 后面的部分）
      const match = pageUrl.match(/\/add\/([^/?]+)/);
      const xformId = match ? match[1] : '';
      
      if (!xformId) {
        console.warn(`[RelationFiller] Cannot extract xformId from URL: ${pageUrl}`);
        return null;
      }
      
      // 检测上下文路径
      const contextPath = this.detectContextPath(pageUrl);
      console.log(`[RelationFiller] Detected context path: "${contextPath}" from URL: ${pageUrl}`);
      
      const relationCfg = (field as any)?.relationCfg;
      const showColumns = relationCfg?.refFieldName 
        ? [relationCfg.refFieldName.replace(/\$/g, '')]
        : ['fd_name'];
      
      // 获取 docId（从 URL 参数或页面状态）
      const docId = this.extractDocIdFromUrl(pageUrl) || '';
      
      // 获取 dynamic 参数（可能包含依赖字段的值）
      const dynamic = await this.getDynamicParameters();
      
      const requestBody = {
        xformId,
        docId,
        controlId: field.id,
        dynamic,
        showColumns,
        queryRequest: {
          pageSize: 15
        }
      };
      
      console.log(`[RelationFiller] Calling associate/list API via browser fetch for "${field.label}"`);
      console.log(`[RelationFiller] Request body:`, JSON.stringify(requestBody));
      
      // 使用浏览器的 fetch API 来保持认证状态（动态构建 API 路径）
      const result = await page.evaluate(async ({ contextPath, requestBody, displayFieldName }) => {
        try {
          const apiPath = `${contextPath}/data/sys-modeling/xform/associate/list`;
          console.log(`[RelationFiller] API path: ${apiPath}`);
          const response = await fetch(apiPath, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            credentials: 'include'  // 保持会话
          });
          
          if (!response.ok) {
            const text = await response.text();
            console.log(`API request failed: ${response.status} - ${text}`);
            return { success: false, error: `HTTP ${response.status}` };
          }
          
          const json = await response.json();
          console.log(`API response:`, JSON.stringify(json).substring(0, 500));
          
          if (!json.success || !json.data || !json.data.content || !Array.isArray(json.data.content)) {
            console.log('API response does not contain valid data');
            return { success: false, error: 'Invalid data' };
          }
          
          // 转换数据格式
          const data = json.data.content.map((item: any) => ({
            fdId: item.fd_id || item.fdId || item.id || '',
            fdName: item[displayFieldName] || item.fd_name || item.fdName || item.name || '',
            entityId: item.fd_id || item.fdId || item.id || '',
            id: item.fd_id || item.fdId || item.id || '',
            name: item[displayFieldName] || item.fd_name || item.fdName || item.name || '',
          })).filter((item: any) => item.fdId && item.fdName);
          
          return { success: true, data };
        } catch (error: any) {
          console.log(`API error: ${error.message}`);
          return { success: false, error: error.message };
        }
      }, { 
        contextPath,
        requestBody,
        displayFieldName 
      });
      
      if (!result.success) {
        console.warn(`[RelationFiller] Browser fetch API failed: ${result.error}`);
        return null;
      }
      
      const data = result.data as Array<{fdId: string; fdName: string; entityId: string; id: string; name: string}>;
      
      console.log(`[RelationFiller] Got ${data.length} options from browser fetch API for "${field.label}"`);
      console.log(`[RelationFiller] Data sample:`, JSON.stringify(data.slice(0, 2)));
      
      return data.length > 0 ? data : null;
      
    } catch (error) {
      console.error(`[RelationFiller] Error calling API for "${field.label}":`, (error as Error)?.message || error);
      return null;
    }
  }

  /**
   * 从 URL 中提取 docId
   * URL 格式可能包含 docId 参数，如 ?docId=xxx
   */
  private extractDocIdFromUrl(pageUrl: string): string | null {
    try {
      const url = new URL(pageUrl);
      // 尝试从 search params 获取 docId
      const docId = url.searchParams.get('docId');
      if (docId) {
        console.log(`[RelationFiller] Extracted docId from URL params: ${docId}`);
        return docId;
      }
      
      // 尝试从 URL 路径中提取（可能在特定位置）
      const pathParts = url.pathname.split('/');
      // 检查是否有符合 docId 格式的部分（长字符串）
      for (const part of pathParts) {
        if (part.length > 20 && /^[a-z0-9]+$/i.test(part)) {
          console.log(`[RelationFiller] Extracted docId from URL path: ${part}`);
          return part;
        }
      }
      
      return null;
    } catch (error) {
      console.warn(`[RelationFiller] Failed to extract docId from URL:`, error);
      return null;
    }
  }

  /**
   * 获取 dynamic 参数（可能包含依赖字段的值）
   * 某些业务关联字段需要依赖其他字段的值来过滤选项
   */
  private async getDynamicParameters(): Promise<Record<string, any>> {
    const { field, page, formId } = this.context;

    try {
      const cachedDynamic = await page.evaluate((controlId) => {
        const cache = window.__relationDynamicCache;
        if (cache && cache.has(controlId)) {
          return cache.get(controlId);
        }
        return null;
      }, field.id);

      if (cachedDynamic && Object.keys(cachedDynamic).length > 0) {
        console.log(`[RelationFiller] 🎯 Using intercepted dynamic params for "${field.label}":`, JSON.stringify(cachedDynamic).substring(0, 200));
        return cachedDynamic;
      }

      // 优先使用 Schema 中的 datasourceFilter 来构建 dynamic 参数
      const datasourceFilter = (field as any)?.datasourceFilter;
      if (datasourceFilter && Array.isArray(datasourceFilter)) {
        console.log(`[RelationFiller] 📋 Found datasource filter in Schema for "${field.label}", resolving dependencies...`);

        const resolvedDynamic: Record<string, any> = {};
        let allDependenciesResolved = true;
        let anyDependencyResolved = false;

        for (const condition of datasourceFilter) {
          if (condition.value?.format === 'parameter' && condition.value?.val) {
            const depFieldName = condition.value.val;
            console.log(`[RelationFiller] 🔍 Resolving dependency: ${depFieldName}`);

            const depValue = await page.evaluate(({ formId, depFieldName }) => {
              const mkxform = window.MKXFORM;
              if (!mkxform) return null;

              const normalize = (raw: any): any => {
                if (!raw) return null;
                let v: any;
                if (Array.isArray(raw)) {
                  v = raw.length > 0 ? raw[0] : null;
                } else {
                  v = raw;
                }
                if (!v) return null;
                if (typeof v === 'object') {
                  // 已经是 {fdId, fdName} 格式
                  if (v.fdId || v.fdName) return v;
                  // 尝试其他常见字段名
                  const id = v.fdId || v.id || v.orgId || v.userId || '';
                  const name = v.fdName || v.name || v.orgName || v.userName || '';
                  if (id || name) return { fdId: String(id), fdName: String(name) };
                  return { fdId: String(v), fdName: String(v) };
                }
                return { fdId: String(v), fdName: String(v) };
              };

              try {
                const fullFieldId = `${formId}.${depFieldName}`;
                let value: any = null;

                // 策略1: mkxform.$(fullFieldId).getValue()
                const cmp = mkxform.$(fullFieldId);
                if (cmp) {
                  try { value = cmp.getValue?.() || null; } catch (_e) {}

                  // 策略2: React fiber props.value
                  if (!value) {
                    try { value = cmp._CURRENT_FIBRE?.props?.value || null; } catch (_e) {}
                  }

                  // 策略3: component state
                  if (!value) {
                    try {
                      const st = cmp._CURRENT_FIBRE?.state;
                      value = st?.value || st?.selected || null;
                    } catch (_e) {}
                  }
                }

                // 策略4: mkxform.getControlValue
                if (!value && typeof mkxform.getControlValue === 'function') {
                  try { value = mkxform.getControlValue(fullFieldId) || null; } catch (_e) {}
                }

                // 策略5: 短 fieldId（不带 formId 前缀）
                if (!value) {
                  const cmp2 = mkxform.$(depFieldName);
                  if (cmp2) {
                    try { value = cmp2.getValue?.() || null; } catch (_e) {}
                    if (!value) {
                      try { value = cmp2._CURRENT_FIBRE?.props?.value || null; } catch (_e) {}
                    }
                  }
                }

                // 策略6: mkxform.getValue (如果存在)
                if (!value && typeof mkxform.getValue === 'function') {
                  try { value = mkxform.getValue(fullFieldId) || null; } catch (_e) {}
                }

                console.log(`[RelationFiller] Raw value for ${depFieldName}:`, JSON.stringify(value)?.substring(0, 200));
                return normalize(value);
              } catch (e) {
                console.warn(`[RelationFiller] Failed to get ${depFieldName}:`, e);
                return null;
              }
            }, { formId, depFieldName });

            if (depValue) {
              resolvedDynamic[depFieldName] = depValue;
              anyDependencyResolved = true;
              console.log(`[RelationFiller] ✅ Resolved ${depFieldName}:`, JSON.stringify(depValue)?.substring(0, 100));
            } else {
              allDependenciesResolved = false;
              console.log(`[RelationFiller] ⚠️ Could not resolve ${depFieldName}, but continuing...`);
            }
          }
        }

        if (Object.keys(resolvedDynamic).length > 0) {
          console.log(`[RelationFiller] ✅ Built dynamic params from datasourceFilter:`, JSON.stringify(resolvedDynamic)?.substring(0, 200));
          return resolvedDynamic;
        }
      }

      // 兜底：明细表字段尝试从主表 fd_entity 获取值
      const isDetailTableField = field.id.includes('.');
      if (isDetailTableField) {
        console.log(`[RelationFiller] 🔍 Detail table field detected: ${field.id}, trying to resolve entity dependency...`);

        const entityValue = await page.evaluate(({ formId }) => {
          const mkxform = window.MKXFORM;
          if (!mkxform) {
            console.log('[RelationFiller] MKXFORM not available');
            return null;
          }

          const tryGetValue = (id: string): any => {
            const cmp = mkxform.$(id);
            if (!cmp) return null;
            let v: any = null;
            try { v = cmp.getValue?.() || null; } catch (_e) {}
            if (!v) try { v = cmp._CURRENT_FIBRE?.props?.value || null; } catch (_e) {}
            if (!v) try { const st = cmp._CURRENT_FIBRE?.state; v = st?.value || st?.selected || null; } catch (_e) {}
            return v;
          };

          try {
            const entityId = `${formId}.fd_entity`;
            console.log(`[RelationFiller] Trying to get fd_entity via multiple strategies`);

            let value: any = tryGetValue(entityId) || tryGetValue('fd_entity');

            // Fallback: getControlValue
            if (!value && typeof mkxform.getControlValue === 'function') {
              try { value = mkxform.getControlValue(entityId) || null; } catch (_e) {}
            }
            // Fallback: mkxform.getValue
            if (!value && typeof mkxform.getValue === 'function') {
              try { value = mkxform.getValue(entityId) || null; } catch (_e) {}
            }

            console.log(`[RelationFiller] Raw fd_entity value:`, JSON.stringify(value)?.substring(0, 300));

            if (value && (Array.isArray(value) ? value.length > 0 : true)) {
              let result;
              if (Array.isArray(value)) {
                result = { fd_entity: value[0] };
              } else if (typeof value === 'object' && (value.fdId || value.fdName || value.id || value.name)) {
                result = { fd_entity: value };
              } else {
                result = { fd_entity: { fdId: String(value), fdName: String(value) } };
              }
              console.log(`[RelationFiller] ✅ Resolved fd_entity:`, JSON.stringify(result)?.substring(0, 200));
              return result;
            }
            return null;
          } catch (e) {
            console.warn(`[RelationFiller] Failed to get fd_entity:`, e);
            return null;
          }
        }, { formId });

        if (entityValue && Object.keys(entityValue).length > 0) {
          console.log(`[RelationFiller] ✅ Using resolved dynamic from main table fd_entity for "${field.label}":`, JSON.stringify(entityValue).substring(0, 200));
          return entityValue;
        }
      }

      const relationCfg = (field as any)?.relationCfg;
      const schemaDynamic = relationCfg?.dynamic;

      if (schemaDynamic && typeof schemaDynamic === 'object' && Object.keys(schemaDynamic).length > 0) {
        console.log(`[RelationFiller] 📋 Found static dynamic config in Schema:`, JSON.stringify(schemaDynamic).substring(0, 200));

        const resolvedDynamic: Record<string, any> = {};

        for (const [depFieldId, depConfig] of Object.entries(schemaDynamic)) {
          if (typeof depConfig === 'object' && depConfig !== null) {
            const depValue = await this.resolveDependencyFieldValue(depFieldId, depConfig);
            if (depValue) {
              resolvedDynamic[depFieldId] = depValue;
            } else {
              console.log(`[RelationFiller] ⚠️ Could not resolve dependency "${depFieldId}", using raw config`);
              resolvedDynamic[depFieldId] = depConfig;
            }
          } else {
            resolvedDynamic[depFieldId] = depConfig;
          }
        }

        console.log(`[RelationFiller] ✅ Resolved dynamic parameters:`, JSON.stringify(resolvedDynamic).substring(0, 200));
        return resolvedDynamic;
      }

      console.log(`[RelationFiller] No static dynamic config in Schema, trying runtime MKXFORM...`);

      const dynamic = await page.evaluate((fieldId) => {
        const mkxform = window.MKXFORM;
        if (!mkxform) return {};

        const cmp = mkxform.$(fieldId);
        if (!cmp) return {};

        const state = cmp._CURRENT_FIBRE?.state;
        if (state && state.dynamic) {
          return state.dynamic;
        }

        if (cmp.props && cmp.props.dynamic) {
          return cmp.props.dynamic;
        }

        if (cmp.relationCfg && cmp.relationCfg.dynamic) {
          return cmp.relationCfg.dynamic;
        }

        return {};
      }, field.id);

      console.log(`[RelationFiller] Got dynamic parameters from runtime:`, JSON.stringify(dynamic));
      return dynamic;
    } catch (error) {
      console.warn(`[RelationFiller] Failed to get dynamic parameters for "${field.label}":`, error);
      return {};
    }
  }

  private async resolveDependencyFieldValue(depFieldId: string, depConfig: any): Promise<any> {
    const { page, formId } = this.context;

    try {
      const value = await page.evaluate(({ fieldId, formId }) => {
        const mkxform = window.MKXFORM;
        if (!mkxform) return null;

        try {
          const fullFieldId = `${formId}.${fieldId}`;
          const currentValue = mkxform.$$('FORM').getValue(fullFieldId);

          if (currentValue && (Array.isArray(currentValue) ? currentValue.length > 0 : true)) {
            console.log(`[RelationFiller] Resolved dependency "${fieldId}" from MKXFORM:`, JSON.stringify(currentValue).substring(0, 100));
            return currentValue;
          }

          const cmp = mkxform.$(fullFieldId);
          if (cmp) {
            const state = cmp._CURRENT_FIBRE?.state;
            if (state && state.value) {
              return state.value;
            }
            if (state && state.selected) {
              return state.selected;
            }
          }

          return null;
        } catch (e) {
          console.warn(`[RelationFiller] Failed to get value for "${fieldId}":`, e);
          return null;
        }
      }, { fieldId: depFieldId, formId });

      return value || depConfig;
    } catch (error) {
      console.warn(`[RelationFiller] Failed to resolve dependency "${depFieldId}":`, error);
      return depConfig;
    }
  }

  /**
   * 触发 UI 刷新事件
   * 设置值后需要触发事件让 UI 更新显示
   */
  private async triggerUIRefresh(): Promise<void> {
    const { field, page } = this.context;
    try {
      await page.evaluate((fieldId) => {
        const mkxform = window.MKXFORM;
        if (!mkxform) return;
        
        const cmp = mkxform.$(fieldId);
        if (!cmp) return;
        
        // 尝试触发组件的 change 事件
        if (typeof cmp.trigger === 'function') {
          cmp.trigger('change');
        }
        
        // 尝试刷新组件
        if (typeof cmp.refresh === 'function') {
          cmp.refresh();
        }
        
        // 尝试更新视图
        if (cmp._CURRENT_FIBRE && typeof cmp._CURRENT_FIBRE.forceUpdate === 'function') {
          cmp._CURRENT_FIBRE.forceUpdate();
        }
      }, field.id);
      
      // 等待 UI 更新
      await page.waitForTimeout(500);
    } catch (e) {
      // 忽略刷新失败
    }
  }

  /**
   * 验证并记录设置的值
   */
  private async verifyAndLogValue(): Promise<void> {
    const { field, page } = this.context;
    const fieldId = this.getFieldIdentifier();
    
    try {
      const currentValue = await page.evaluate((fid) => {
        const mkxform = window.MKXFORM;
        if (!mkxform) return null;
        
        try {
          return mkxform.getValue(fid);
        } catch (e) {
          return null;
        }
      }, fieldId);
      
      console.log(`[RelationFiller] Current value in MKXFORM for "${field.label}":`, JSON.stringify(currentValue));
    } catch (e) {
      console.warn(`[RelationFiller] Failed to verify value for "${field.label}"`);
    }
  }

  /**
   * 触发字段的 onChange 事件（用于激活联动字段）
   * 通过 MKXFORM API 设置值后，需要手动触发事件才能触发字段联动
   */
  private async triggerFieldChange(): Promise<void> {
    const { field, page } = this.context;
    const fieldId = this.getFieldIdentifier();
    
    try {
      console.log(`[RelationFiller] 🔔 Triggering onChange event for "${field.label}" (${fieldId})`);
      
      const success = await page.evaluate((fid) => {
        const mkxform = window.MKXFORM;
        if (!mkxform) {
          console.log('[RelationFiller] MKXFORM not available for triggerChange');
          return false;
        }
        
        const cmp = mkxform.$(fid);
        if (!cmp) {
          console.log(`[RelationFiller] Component not found for triggerChange: ${fid}`);
          return false;
        }
        
        // 尝试多种方式触发 onChange
        try {
          // 方式1：调用组件的 triggerChange 方法（如果存在）
          if (typeof cmp.triggerChange === 'function') {
            cmp.triggerChange();
            console.log('[RelationFiller] ✅ Triggered change via triggerChange()');
            return true;
          }
          
          // 方式2：调用组件的 onChange 方法（如果存在）
          if (typeof cmp.onChange === 'function') {
            const value = mkxform.getValue(fid);
            cmp.onChange(value);
            console.log('[RelationFiller] ✅ Triggered change via onChange()');
            return true;
          }
          
          // 方式3：触发组件的内部事件
          if (cmp.control && typeof cmp.control.triggerEvent === 'function') {
            cmp.control.triggerEvent('change');
            console.log('[RelationFiller] ✅ Triggered change via control.triggerEvent()');
            return true;
          }
          
          // 方式4：手动派发 DOM 事件
          const domNode = cmp.getDOMNode?.();
          if (domNode) {
            const event = new Event('change', { bubbles: true, cancelable: true });
            domNode.dispatchEvent(event);
            console.log('[RelationFiller] ✅ Triggered change via DOM event');
            return true;
          }
          
          console.log('[RelationFiller] ⚠️ No suitable trigger method found');
          return false;
        } catch (e) {
          console.error('[RelationFiller] Error triggering change:', e);
          return false;
        }
      }, fieldId);
      
      if (success) {
        // 等待联动字段加载（给系统时间获取关联数据）
        console.log(`[RelationFiller] ⏳ Waiting for linkage fields to populate...`);
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.warn(`[RelationFiller] Failed to trigger onChange for "${field.label}":`, e);
    }
  }

  /**
   * 触发明细表关联控件的联动（方案2：调用表单引擎内部联动 API）
   *
   * 基于源码分析：
   * - el-form/widget/xform-relation/index.tsx
   * - onChange → processOutData → getValueDetail (API) → setOutParams (设置其他字段)
   *
   * 问题：MKXFORM.setValue() 只更新 value prop，不会触发完整联动链路
   * 解决：使用 DetailTableLinkageTrigger 手动模拟联动流程
   *
   * 🔑 新增：传递 outParams 和 showColumns 给联动触发器
   * - outParams: 从 Schema 中提取的 sourceField → targetField 映射
   * - showColumns: 从 outParams.sourceField 提取的字段名列表，用于 API 查询
   */
  private async triggerDetailTableLinkage(): Promise<void> {
    const { field, page, rowIndex } = this.context;

    if (rowIndex === undefined) {
      console.warn('[RelationFiller] triggerDetailTableLinkage called but rowIndex is undefined');
      return;
    }

    console.log(`[RelationFiller] 🚀 Triggering detail table linkage for "${field.label}" [row ${rowIndex}]`);

    try {
      // 解析明细表 ID 和字段名
      const parts = field.id.split('.');
      const relationFieldId = parts[parts.length - 1];
      const detailTableId = parts.length > 1 ? parts.slice(0, -1).join('.') : this.extractDetailTableIdFromContext();

      if (!detailTableId) {
        console.error(`[RelationFiller] Cannot determine detail table ID from field.id: ${field.id}`);
        return;
      }

      // 🔑 提取 outParams 和 showColumns
      // 注意：outParams 中 targetField = 产品模型字段（API 返回），sourceField = 明细表字段（写入目标）
      // showColumns 应使用 targetField.fdName（API 需要返回的字段列表）
      const outParams = (field as any).outParams as IOutParamItem[] | undefined;

      // 🔍 调试：打印 outParams 结构
      if (outParams && outParams.length > 0) {
        console.log(`[RelationFiller] 🔍 outParams[0] 完整结构:`, JSON.stringify(outParams[0], null, 2).substring(0, 500));
        console.log(`[RelationFiller] 🔍 outParams[0].targetField.fdName:`, outParams[0]?.targetField?.fdName);
        const mapped = outParams.map(p => p.targetField.fdName);
        console.log(`[RelationFiller] 🔍 map() 结果:`, mapped);
        console.log(`[RelationFiller] 🔍 map() 过滤后:`, mapped.filter(Boolean));
      }

      const showColumns = outParams
        ? outParams.map(p => p.targetField.fdName).filter(Boolean)
        : undefined;

      // 🔍 调试：打印 showColumns
      console.log(`[RelationFiller] 📋 outParams count: ${outParams?.length || 0}`);
      console.log(`[RelationFiller] 📋 showColumns:`, showColumns);

      if (outParams && outParams.length > 0) {
        console.log(`[RelationFiller] 📋 outParams (${outParams.length} mappings):`,
          outParams.map(p => `${p.targetField.fdName}(API)→${p.sourceField.fdName}(明细表)`).join(', '));
      }
      if (showColumns && showColumns.length > 0) {
        console.log(`[RelationFiller] 📋 showColumns (processed):`, showColumns);
      }

      console.log(`[RelationFiller] Detail table: ${detailTableId}, Relation field: ${relationFieldId}`);

      // 使用 DetailTableLinkageTrigger 触发联动
      const linkageTrigger = new DetailTableLinkageTrigger(page);
      const success = await linkageTrigger.triggerLinkage(
        detailTableId, relationFieldId, rowIndex, outParams, showColumns,
      );

      if (success) {
        console.log(`[RelationFiller] ✅ Detail table linkage triggered successfully`);

        // 验证联动结果
        await page.waitForTimeout(1000);
        const verification = await linkageTrigger.verifyLinkageFields(detailTableId, rowIndex);
        console.log(`[RelationFiller] 📊 Linkage verification:`, verification);
      } else {
        console.warn(`[RelationFiller] ⚠️ Detail table linkage trigger failed`);
      }
    } catch (error) {
      console.error(`[RelationFiller] Error in triggerDetailTableLinkage:`, error);
    }
  }

  /**
   * 从上下文中提取明细表 ID
   *
   * 如果 field.id 不包含明细表 ID，尝试从其他来源获取
   */
  private extractDetailTableIdFromContext(): string | null {
    const { field } = this.context;

    // 尝试从 schema 的 parent 信息中获取
    if ((field as any).parentId) {
      return (field as any).parentId;
    }

    // 尝试从字段的 data-id 属性推断
    // 通常格式为 "detailTableId.fieldName"
    const dataId = (field as any).dataId || '';
    if (dataId && dataId.includes('.')) {
      return dataId.split('.')[0];
    }

    return null;
  }

  // ─── renderMode 解析 ──────────────────────────────────────────────────────────

  /**
   * 按优先级解析 renderMode：
   *   1. schema 中手动维护的 field.renderMode（最可靠，无网络开销）
   *   2. MKXFORM 全局 API（运行时）
   *   3. DOM 结构检测（兜底）
   */
  private async resolveRenderMode(wrapper: Locator): Promise<string> {
    const { field, page } = this.context;

    // 1. schema 预设 - 如果 field.renderMode 明确是 select/multiSelect，优先使用
    if (field.renderMode) {
      console.log(`[RelationFiller] Using schema renderMode: ${field.renderMode}`);
      return field.renderMode;
    }

    // 2. MKXFORM API - 使用完整的字段标识符（formId.fieldId）
    try {
      const fieldIdentifier = this.getFieldIdentifier(); // 获取完整标识符，如 mk_model_202605055x9c6.fd_col_1
      console.log(`[RelationFiller] Getting renderMode via MKXFORM for: ${fieldIdentifier}`);
      
      const mode = await page.evaluate((fieldIdentifier) => {
        const mkxform = window.MKXFORM;
        if (!mkxform) {
          console.log('[RelationFiller] MKXFORM not available');
          return null;
        }
        
        const cmp = mkxform.$(fieldIdentifier);
        if (!cmp) {
          console.log(`[RelationFiller] Component not found for ${fieldIdentifier}`);
          return null;
        }
        
        // 按优先级获取 renderMode
        const props = (cmp as any)._CURRENT_FIBRE?.props || (cmp as any).props;
        if (props && props.renderMode) {
          console.log(`[RelationFiller] Found renderMode from props: ${props.renderMode}`);
          return props.renderMode;
        }
        
        console.log('[RelationFiller] renderMode not found in props');
        return null;
      }, fieldIdentifier) as string | null;
      
      if (mode) {
        console.log(`[RelationFiller] MKXFORM renderMode: ${mode}`);
        return mode;
      }
    } catch (e) {
      console.warn(`[RelationFiller] MKXFORM API error: ${(e as Error)?.message ?? e}`);
    }

    // 3. DOM 检测
    const mode = await this.detectRenderModeFromDom(wrapper);
    console.log(`[RelationFiller] DOM detected renderMode: ${mode}`);
    return mode;
  }

  private async detectRenderModeFromDom(wrapper: Locator): Promise<string> {
    // radio/checkbox：wrapper 内直接有对应 input
    if (await wrapper.locator('input[type="radio"]').count() > 0) return 'radio';
    if (await wrapper.locator('input[type="checkbox"]').count() > 0) return 'checkbox';

    // 尝试 data-xform-mode 属性
    const modeAttr = await wrapper
      .locator('.ele-xform-relation-wrap-select, [data-xform-mode]')
      .first()
      .getAttribute('data-xform-mode')
      .catch(() => null);
    if (modeAttr) return modeAttr;

    // 优先检查 lui-select-multiple（多选下拉特有类）
    // 注意：业务关联下拉模式的 lui-select 元素不一定有 name 属性
    if (await wrapper.locator('.lui-select.lui-select-multiple').count() > 0) {
      return 'multiSelect';
    }

    // 检查单选下拉（lui-select 但不是 lui-select-multiple）
    if (await wrapper.locator('.lui-select').count() > 0) {
      return 'select';
    }

    // 有 ele-xform-relation-wrap-select 但没有 lui-select → 列表弹窗模式
    if (await wrapper.locator('.ele-xform-relation-wrap-select').count() > 0) {
      return 'singlelist';
    }

    // 默认兜底
    return 'singlelist';
  }

  // ─── 列表框弹窗模式（RelationFiller 唯一专属逻辑） ───────────────────────────

  /**
   * singlelist / mullist：点击触发器 → 等待弹窗 → 等待数据加载 → 选行 → 点确认 → 等待关闭
   *
   * 关键：在点击触发器之前注册网络响应监听，避免接口响应早于监听注册的竞态。
   * 等待顺序：注册监听 → 点击 → 弹窗出现 → API 响应完成 → spinner 消失 → 首行可见 → 选择
   */
  private async fillListMode(wrapper: Locator): Promise<void> {
    const { field, page } = this.context;
    console.log(`[RelationFiller] Filling "${field.label}" in list mode`);

    // 1. 找触发器
    const triggerSelectors = [
      '.ele-xform-relation-wrap-select .lui-select-selector',
      '.ele-xform-relation-wrap-select .lui-select',
      '.ele-xform-relation .lui-select-selector',
      '.ele-xform-relation .lui-select',
      '.lui-select-selector',
    ];

    let trigger: Locator | null = null;
    for (const sel of triggerSelectors) {
      const el = wrapper.locator(sel).first();
      if (await this.isVisible(el, 2000)) { trigger = el; break; }
    }

    if (!trigger) {
      console.warn(`[RelationFiller] List trigger not found for "${field.label}"`);
      return;
    }

    // 2. 在点击前注册接口监听（避免响应先于监听的竞态）
    //    业务关联数据接口：/data/sys-modeling/xform/associate/list
    const startTime = Date.now();
    const dataResponsePromise = page.waitForResponse(
      resp => resp.url().includes('/association/') && resp.status() === 200,
      { timeout: 15000 }, // 缩短超时时间
    ).catch(() => null); // 接口路径不匹配时不阻断流程

    await this.safeScroll(trigger);
    await trigger.click({ force: true });

    // 3. 等待弹窗出现
    const modal = page.locator('.lui-modal-wrap')
      .filter({ has: page.locator('.lui-modal-content') })
      .first();

    const appeared = await modal.waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true).catch(() => false);

    if (!appeared) {
      console.warn(`[RelationFiller] Modal not appeared for "${field.label}", falling back to SelectFiller`);
      await new SelectFiller(this.context).fill();
      return;
    }

    console.log(`[RelationFiller] Modal opened for "${field.label}"`);

    // 4. 等待接口响应（数据已到达浏览器）
    const dataResp = await dataResponsePromise;
    if (dataResp) {
      const responseTime = Date.now() - startTime;
      console.log(`[RelationFiller] Data API responded (${dataResp.status()}) for "${field.label}" in ${responseTime}ms`);
    } else {
      console.warn(`[RelationFiller] Data API response not captured for "${field.label}", continuing`);
    }

    // 5. 等待 loading spinner 消失（数据渲染中）
    await modal.locator('.lui-spin, .lui-table-loading, [class*="spin-spinning"]')
      .first()
      .waitFor({ state: 'hidden', timeout: 8000 })
      .catch(() => {}); // spinner 不一定存在

    // 6. 等待首行可见（Playwright 原生等待，比轮询 count() 更可靠）
    const rowCandidates = [
      'tbody tr',
      '.lui-table-body tr',
      '.lui-table-row',
      '.ele-table-row',
      'tr[data-row-key]',
    ];

    let rows: Locator | null = null;
    for (const sel of rowCandidates) {
      const firstRow = modal.locator(sel).first();
      const visible = await firstRow.waitFor({ state: 'visible', timeout: 6000 })
        .then(() => true).catch(() => false);
      if (visible) {
        rows = modal.locator(sel);
        break;
      }
    }

    if (!rows) {
      console.warn(`[RelationFiller] No data rows appeared in modal for "${field.label}", closing`);
      await this.closeModal(modal);
      return;
    }

    const rowCount = await rows.count();
    console.log(`[RelationFiller] ${rowCount} rows ready for "${field.label}"`);

    // 7. 判断单/多选：弹窗内有 checkbox → 多选，radio 或无 → 单选
    const isMultiSelect = await modal.locator('input[type="checkbox"]').count()
      .then(c => c > 0).catch(() => false);

    // 8. 选择行（快速选择，减少等待）
    if (isMultiSelect) {
      const numToSelect = Math.min(Math.floor(Math.random() * 2) + 1, rowCount);
      const indices = Array.from({ length: rowCount }, (_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, numToSelect);

      for (const idx of indices) {
        const row = rows.nth(idx);
        const cb = row.locator('input[type="checkbox"]').first();
        await (await this.isVisible(cb, 500) ? cb : row).click({ force: true });
        console.log(`[RelationFiller] Checked row ${idx} for "${field.label}"`);
        // 移除不必要的延迟
      }
    } else {
      const idx = Math.floor(Math.random() * rowCount);
      const row = rows.nth(idx);
      const rb = row.locator('input[type="radio"], input[type="checkbox"]').first();
      await (await this.isVisible(rb, 500) ? rb : row).click({ force: true });
      console.log(`[RelationFiller] Selected row ${idx} for "${field.label}"`);
    }

    // 9. 点确认
    // 移除不必要的延迟
    
    // 增加更多确认按钮选择器，适配不同样式
    const confirmSelectors = [
      '.lui-modal-footer .lui-btn-primary',
      '.lui-modal-btns .lui-btn-primary',
      '.lui-modal-footer button.lui-btn-primary',
      '.lui-modal-footer button.btn-primary',
      'button.confirm',
      'button.ok',
      'button.submit',
    ];

    let confirmBtn: Locator | null = null;
    for (const sel of confirmSelectors) {
      const el = modal.locator(sel).first();
      if (await this.isVisible(el, 500)) {
        confirmBtn = el;
        break;
      }
    }

    // 如果没有找到带类名的按钮，尝试按文本查找
    if (!confirmBtn) {
      const textBtn = modal.locator('button').filter({ hasText: /确定|确认|OK|Confirm|插入/i }).first();
      if (await this.isVisible(textBtn, 500)) {
        confirmBtn = textBtn;
      }
    }

    if (confirmBtn) {
      await confirmBtn.click({ force: true });
      console.log(`[RelationFiller] Clicked confirm button for "${field.label}"`);
    } else {
      console.warn(`[RelationFiller] Confirm button not found for "${field.label}", pressing Enter`);
      await page.keyboard.press('Enter');
    }

    // 10. 等待弹窗关闭
    await modal.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {
      console.warn(`[RelationFiller] Modal did not close for "${field.label}"`);
    });

    // 移除不必要的延迟
    // await page.waitForTimeout(300);
  }

  // ─── 下拉模式（relation select / multiSelect）────────────────────────────────

  /**
   * relation 下拉模式：与 SelectFiller 逻辑相同，但在点击前注册网络监听，
   * 确保接口响应完成后再读取选项，解决接口延迟导致选项为空的问题。
   */
  private async fillRelationSelectMode(isMultiSelect: boolean): Promise<void> {
    const { field, page } = this.context;
    const wrapper = this.getWrapper();
    console.log(`[RelationFiller] Filling "${field.label}" in ${isMultiSelect ? 'multiSelect' : 'select'} mode`);

    // 1. 找触发器
    const triggerSelectors = [
      '.ele-xform-relation-wrap-select .lui-select-selector',
      '.ele-xform-relation-wrap-select .lui-select',
      '.ele-xform-relation .lui-select-selector',
      '.lui-select-selector',
    ];

    let trigger: Locator | null = null;
    for (const sel of triggerSelectors) {
      const el = wrapper.locator(sel).first();
      if (await this.isVisible(el, 2000)) { trigger = el; break; }
    }

    if (!trigger) {
      console.warn(`[RelationFiller] Select trigger not found for "${field.label}", skipping`);
      return;
    }

    // 2. 在点击前注册接口监听（竞态安全）
    const dataResponsePromise = page.waitForResponse(
      resp => resp.url().includes('/association/') && resp.status() === 200,
      { timeout: 20000 },
    ).catch(() => null);

    await this.safeScroll(trigger);
    await trigger.click({ force: true });

    // 3. 等待接口响应
    const dataResp = await dataResponsePromise;
    if (dataResp) {
      console.log(`[RelationFiller] Dropdown data API responded for "${field.label}"`);
    }

    // 4. 找可见的下拉面板
    const panelSelectors = [
      '.lui-select-dropdown',
      '.ele-select-dropdown',
      '.lui-popup',
      '[role="listbox"]',
    ];

    let panel: Locator | null = null;
    for (const sel of panelSelectors) {
      const els = page.locator(sel);
      const count = await els.count();
      for (let i = 0; i < count; i++) {
        if (await els.nth(i).isVisible().catch(() => false)) {
          panel = els.nth(i);
          break;
        }
      }
      if (panel) break;
    }

    if (!panel) {
      console.warn(`[RelationFiller] Dropdown panel not found for "${field.label}"`);
      await page.keyboard.press('Escape');
      return;
    }

    // 5. 检查是否有"暂无数据"提示
    const emptySelectors = [
      '.lui-select-empty',
      '.empty-text',
      '.no-data',
      '.lui-empty',
      '.ele-empty',
      '.empty-state',
      '.lui-table-empty',
      '.ant-empty',
      'div:has(.lui-empty-icon)',
      'div:has(.ant-empty-img)',
    ];
    
    let emptyText: string | null = null;
    for (const selector of emptySelectors) {
      const text = await panel.locator(selector).first().textContent().catch(() => null);
      if (text) {
        emptyText = text;
        console.log(`[RelationFiller] Found empty text via selector "${selector}": "${text}"`);
        break;
      }
    }
    
    if (emptyText?.includes('暂无') || emptyText?.includes('没有') || emptyText?.includes('无数据')) {
      console.warn(`[RelationFiller] No data available for "${field.label}", skipping (not required: ${!field.required})`);
      await page.keyboard.press('Escape');
      return;
    }

    // 6. 等待首个选项可见（替代 waitForTimeout）
    const optionSelectors = [
      '.lui-select-item:not(.lui-select-item-option-all-check)',
      '.ele-select-item',
      '[role="option"]',
    ];

    let optionElements: Locator | null = null;
    for (const sel of optionSelectors) {
      const el = panel.locator(sel);
      const visible = await el.first().waitFor({ state: 'visible', timeout: 8000 })
        .then(() => true).catch(() => false);
      if (visible) { optionElements = el; break; }
    }

    if (!optionElements) {
      console.warn(`[RelationFiller] No options appeared for "${field.label}"`);
      await page.keyboard.press('Escape');
      return;
    }

    const count = await optionElements.count();
    
    // 检查是否有实际可选择的选项
    if (count === 0) {
      console.warn(`[RelationFiller] Zero options available for "${field.label}", skipping`);
      await page.keyboard.press('Escape');
      return;
    }

    // 7. 选择
    if (isMultiSelect) {
      const numToSelect = Math.min(Math.floor(Math.random() * 3) + 1, count);
      const indices = Array.from({ length: count }, (_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, numToSelect);

      for (const idx of indices) {
        const opt = optionElements.nth(idx);
        const text = await opt.textContent().catch(() => `Option ${idx}`);
        if (await this.isVisible(opt, 1000)) {
          await opt.click({ force: true });
          console.log(`[RelationFiller] Selected "${text?.trim()}" for "${field.label}"`);
        }
        await page.waitForTimeout(150);
      }
    } else {
      const idx = Math.floor(Math.random() * count);
      const opt = optionElements.nth(idx);
      const text = await opt.textContent().catch(() => `Option ${idx}`);
      if (await this.isVisible(opt, 1000)) {
        await opt.click({ force: true });
        console.log(`[RelationFiller] Selected "${text?.trim()}" for "${field.label}"`);
      }
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }

  // ─── 工具方法 ─────────────────────────────────────────────────────────────────

  private async closeModal(modal: Locator): Promise<void> {
    const { page } = this.context;
    try {
      const cancelBtn = modal.locator(
        '.lui-modal-close, button:has-text("取消"), button:has-text("Cancel")'
      ).first();
      if (await this.isVisible(cancelBtn, 1000)) {
        await cancelBtn.click({ force: true });
      } else {
        await page.keyboard.press('Escape');
      }
      await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    } catch (e: any) {
      if (e?.message?.includes('closed')) return; // page already torn down (e.g. test timeout)
      throw e;
    }
  }
}

export default RelationFiller;
