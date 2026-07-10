/**
 * SchemaGenerator — DOM 探查生成 Schema
 *
 * 自动从页面提取表单字段结构，生成 JSON Schema 文件
 */
import { Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface FieldOption {
  label: string;
  value: string;
}

/** 传出参数映射：业务关联字段选择后，自动填充到目标字段 */
export interface IOutParamItem {
  sourceField: {
    fdType: string;
    fdName: string;
    tableName: string;
    tableType: string;
  };
  targetField: {
    fdType: string;
    fdName: string;
    tableName: string;
    tableType: string;
  };
}

export interface I18nContent {
  Cn?: string;
  default?: string;
  Us?: string;
  Hk?: string;
  [key: string]: string | undefined;
}

export interface FieldI18n {
  label?: I18nContent;
  placeholder?: I18nContent;
  displayLabel?: I18nContent;
}

export interface FormField {
  id: string;           // 字段ID，如 "fd_name"
  fdType: string;       // 字段类型，如 "fd_input", "select", "radio" 等
  label: string;        // 字段原始标签（来自 API 配置）
  displayName?: string; // 字段显示名/别名（来自 DOM，用户在表单设计器中设置的名称）
  required: boolean;    // 是否必填
  options?: FieldOption[]; // 选项（单选、多选、下拉等）
  placeholder?: string; // 占位文本
  defaultValue?: any;   // 默认值
  renderMode?: any;     // 渲染模式：string (如 "singlelist") 或 object (dynamic字段: { modelId, modelName, type })
  cfgId?: string;       // cfg 字段的 enumId，用于动态获取选项
  cfgConfig?: any;      // cfg 字段的完整配置信息，包含 fdId、modelId 等
  relationCfg?: any;    // relation 字段的完整配置信息，包含数据请求相关配置
  datasourceFilter?: any; // relation 字段的动态过滤条件（来自 datasource.queryCondition）
  outParams?: IOutParamItem[]; // 业务关联字段的传出参数映射（source→target）
  sourceComponent?: string; // 源码组件，如 "@elem/xform-cfg"
  methods?: string[];   // 组件支持的方法，如 ["onChange"]
  dynamicProps?: any;   // 动态属性，包含多语言信息如 {fdNameUs, fdNameCn}
  fdLabelLangKey?: string; // 多语言 key，用于在 lang 接口中匹配对应的标签
  i18n?: FieldI18n;     // 完整的多语言对象（从 config.lang 解析）
}

export interface FormSchema {
  formId: string;       // 表单ID，如 "mk_model_20260425gq4b1"
  formName: string;     // 表单名称
  url: string;          // 表单URL
  fields: FormField[];  // 字段列表
  generatedAt: string;  // 生成时间
  detailTables?: DetailTableSchema[]; // 明细表列表
}

export interface DetailTableSchema {
  detailModelId: string;    // 明细表模型ID，如 "mk_model_20260425gq4b1_d_893m5"
  detailTableName: string;  // 明细表名称
  fields: FormField[];      // 明细表字段列表
}

export class SchemaGenerator {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 从页面探查表单结构并生成 Schema
   * 优先级：
   * 1. 从 API 获取配置（最准确，包含完整的必填字段信息）
   * 2. 使用 MKXFORM API（快速、可靠）
   * 3. DOM 探查（兜底方案）
   */
  async generateSchema(formId: string, formName: string, url: string, extractDetailTables: boolean = true): Promise<FormSchema> {
    console.log(`[SchemaGenerator] Generating schema for form: ${formId}`);

    // 优先使用 API 获取配置（包含完整的必填字段信息）
    let fields: FormField[];
    let detailTables: DetailTableSchema[] | undefined;
    let extractedFormNameFromApi: string | undefined;
    try {
      const result = await this.extractFieldsViaAPI(url);
      fields = result.fields;
      detailTables = result.detailTables;
      extractedFormNameFromApi = result.extractedFormName;
      console.log(`[SchemaGenerator] Successfully extracted ${fields.length} fields via API`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[SchemaGenerator] API extraction failed, falling back to MKXFORM API: ${errorMessage}`);
      
      // 回退到 MKXFORM API（确保页面已加载
      try {
        // 如果还没加载，先导航到页面
        const formLoaded = await this.page.waitForSelector('.ele-xform-fieldset-wrap', { timeout: 3000 }).then(() => true).catch(() => false);
        if (!formLoaded) {
          console.log(`[SchemaGenerator] Page not loaded yet, navigating...`);
          await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        }
        // 始终等待 MKXFORM 初始化完成
        await this.page.waitForFunction(() => !!(window as any).MKXFORM, { timeout: 30000 }).catch(() => {
          console.warn('[SchemaGenerator] MKXFORM not found after navigation, proceeding anyway');
        });
        if (!formLoaded) {
          await this.page.waitForTimeout(2000);
        }

        fields = await this.extractFieldsViaMKXFORM();
        console.log(`[SchemaGenerator] Successfully extracted ${fields.length} fields via MKXFORM API`);
        
        // 使用从 MKXFORM 提取的明细表
        if (extractDetailTables) {
          detailTables = await this.extractDetailTables();
        }
      } catch (mkxformError) {
        const mkxformErrorMessage = mkxformError instanceof Error ? mkxformError.message : String(mkxformError);
        console.warn(`[SchemaGenerator] MKXFORM API failed, falling back to DOM inspection: ${mkxformErrorMessage}`);
        
        // 确保页面已加载
        try {
          await this.page.waitForSelector('.ele-xform-fieldset-wrap', { timeout: 30000 });
        } catch (e) {
          await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await this.page.waitForTimeout(3000);
        }

        fields = await this.extractFields(formId);
        
        // 从 DOM 探查提取明细表
        if (extractDetailTables) {
          detailTables = await this.extractDetailTables();
        }
      }
    }

    // 优先使用从 API 提取的表名（更有意义），否则使用传入的 formName
    const finalFormName = extractedFormNameFromApi && extractedFormNameFromApi !== formId
      ? extractedFormNameFromApi
      : formName;

    // 🔑 AI Agent 模式优化：使用 API 提取的真实模型 ID（如 mk_km_ltc_business）作为 formId
    // 而不是 URL 中的临时 ID（如 1i02ls02kw5jw69bw36pppvh884viq1fciw1）
    // 这样保证 Schema 文件名统一为 mk_xxx.json 格式，符合项目规范
    const finalFormId = extractedFormNameFromApi && extractedFormNameFromApi !== formId && extractedFormNameFromApi.startsWith('mk_')
      ? extractedFormNameFromApi
      : formId;

    if (finalFormId !== formId) {
      console.log(`[SchemaGenerator] 🤖 AI Agent: Updated formId from '${formId}' to '${finalFormId}' (real model ID)`);
    }

    // displayName 已在 parseConfigToSchema / extractFieldsViaMKXFORM / extractFields 中直接从源数据 fdLabel 提取
    // 不再依赖 DOM 提取（DOM 方式不可靠，尤其是明细表）

    const schema: FormSchema = {
      formId: finalFormId,
      formName: finalFormName,
      url,
      fields,
      generatedAt: new Date().toISOString(),
      detailTables,
    };

    console.log(`[SchemaGenerator] Extracted ${fields.length} main fields${detailTables ? ` and ${detailTables.length} detail tables` : ''}`);
    return schema;
  }

  /**
   * 通过 API 获取配置（最准确的方案）
   * 步骤：
   * 1. 先设置响应监听器
   * 2. 导航到页面（或刷新）以触发请求
   * 3. 截获配置 JSON
   */
  private async extractFieldsViaAPI(url?: string): Promise<{ fields: FormField[], detailTables: DetailTableSchema[], extractedFormName?: string }> {
    console.log(`[SchemaGenerator] Extracting fields via API...`);

    return new Promise(async (resolve, reject) => {
      let initResponse: any = null;
      let configResponse: any = null;
      let requestHandled = false;
      const timeoutId = setTimeout(() => {
        if (!requestHandled) {
          reject(new Error('Timeout waiting for form config API'));
        }
      }, 90000);

      // 监听所有响应 - 先设置监听器
      const responseHandler = async (response: any) => {
        const respUrl = response.url();

        // 🔍 调试：打印所有包含 config/form 的 URL
        if (respUrl.includes('config') || respUrl.includes('form') || respUrl.includes('.json')) {
          console.log(`[SchemaGenerator.debug] 🌐 Response URL: ${respUrl.substring(0, 120)}`);
        }

        // 监听 init 接口
        if (respUrl.includes('/sysModelingMain/init') && !initResponse) {
          try {
            initResponse = await response.json();
            console.log(`[SchemaGenerator] Captured init API response, versionId:`, initResponse?.data?.versionId);
          } catch (e) {
            console.warn(`[SchemaGenerator] Failed to parse init response:`, e);
          }
        }

        // 监听表单配置 JSON 文件 - 需要有 dataModels 才处理
        if (respUrl.includes('/form/config/') && respUrl.endsWith('.json') && !configResponse) {
          try {
            // 使用 text() + 手动解析，避免 response.json() 可能的问题
            const responseText = await response.text();
            let jsonData: any;
            try {
              jsonData = JSON.parse(responseText);
            } catch (parseError) {
              console.warn(`[SchemaGenerator] Failed to parse JSON from ${respUrl}:`, parseError);
              return;
            }

            console.log(`[SchemaGenerator] Captured form config JSON from URL:`, respUrl);
            console.log(`[SchemaGenerator] Config JSON type:`, typeof jsonData);
            console.log(`[SchemaGenerator] Config JSON is null:`, jsonData === null);
            console.log(`[SchemaGenerator] Response text length:`, responseText.length);

            // 检查是否为 Proxy 对象（Playwright 可能会包装响应）
            const rawKeys = [];
            try {
              // 尝试多种方式获取键
              if (typeof jsonData === 'object' && jsonData !== null) {
                // 方法1: Object.keys
                const objKeys = Object.keys(jsonData);
                console.log(`[SchemaGenerator] Object.keys() count:`, objKeys.length);

                // 方法2: for...in
                for (const key in jsonData) {
                  if (jsonData.hasOwnProperty(key)) {
                    rawKeys.push(key);
                  }
                }
                console.log(`[SchemaGenerator] for...in keys:`, rawKeys.slice(0, 10));

                // 方法3: 直接检查已知键
                console.log(`[SchemaGenerator] has dataModels:`, 'dataModels' in jsonData);
                console.log(`[SchemaGenerator] has auth:`, 'auth' in jsonData);
                console.log(`[SchemaGenerator] jsonData.dataModels:`, !!jsonData.dataModels);
                console.log(`[SchemaGenerator] jsonData.auth:`, !!jsonData.auth);
              }
            } catch (e) {
              console.warn(`[SchemaGenerator] Error checking keys:`, e);
            }

            // 如果 Object.keys 失败但数据存在，手动构建普通对象
            let configData = jsonData;
            if (rawKeys.length === 0 && ('dataModels' in jsonData || 'auth' in jsonData)) {
              console.log(`[SchemaGenerator] ⚠️ 检测到 Proxy 对象，转换为普通对象`);
              configData = JSON.parse(JSON.stringify(jsonData));
              console.log(`[SchemaGenerator] 转换后 Object.keys:`, Object.keys(configData));
            }

            console.log(`[SchemaGenerator] Config JSON keys:`, Object.keys(configData || {}));

            // 调试：打印完整的前3个键和值类型
            const keys = Object.keys(configData || {});
            console.log(`[SchemaGenerator] 前5个键详情:`);
            for (let i = 0; i < Math.min(5, keys.length); i++) {
              const key = keys[i];
              const value = configData[key];
              console.log(`  [${i}] "${key}": ${typeof value}`, Array.isArray(value) ? `(array, length=${value.length})` : '');
            }

            // 只有包含 dataModels 或 dataModel 的配置才使用
            if (configData && (configData.dataModels || configData.dataModel || configData.models)) {
              console.log(`[SchemaGenerator] Found dataModels/dataModel in config - using this response`);
              configResponse = configData;
            } else {
              console.log(`[SchemaGenerator] Config JSON does not have dataModels - ignoring`);
              return; // 不处理，继续等待下一个响应
            }

            // 调试：打印 auth 信息
            if (configResponse?.auth) {
              console.log(`[SchemaGenerator] Auth info captured - type:`, typeof configResponse.auth);
              console.log(`[SchemaGenerator] Auth info captured - isArray:`, Array.isArray(configResponse.auth));
              console.log(`[SchemaGenerator] Auth info captured - length:`, Array.isArray(configResponse.auth) ? configResponse.auth.length : 'N/A');
              if (Array.isArray(configResponse.auth) && configResponse.auth.length > 0) {
                console.log(`[SchemaGenerator] Auth[0] keys:`, Object.keys(configResponse.auth[0]));
                console.log(`[SchemaGenerator] Auth[0] sample:`, JSON.stringify(configResponse.auth[0], null, 2).substring(0, 500));
              } else {
                console.log(`[SchemaGenerator] Auth is empty or not an array. Full auth value:`, JSON.stringify(configResponse.auth).substring(0, 200));
                // 尝试查找 auth 在其他位置
                for (const key of Object.keys(configResponse)) {
                  if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('permission')) {
                    console.log(`[SchemaGenerator] Found potential auth-related key "${key}":`, typeof configResponse[key]);
                  }
                }
              }
            } else {
              console.log(`[SchemaGenerator] ⚠️ No auth field in config response!`);
            }

            // 提取字段信息
            const result = await this.parseConfigToSchema(configResponse);
            requestHandled = true;
            clearTimeout(timeoutId);
            resolve(result);
          } catch (e) {
            console.warn(`[SchemaGenerator] Failed to parse config JSON:`, e);
            requestHandled = true;
            clearTimeout(timeoutId);
            reject(e);
          }
        }
      };

      this.page.on('response', responseHandler);

      // 导航到页面或刷新 - 后导航，这样监听器才能截获请求
      try {
        if (url) {
          console.log(`[SchemaGenerator] Navigating to URL to trigger requests:`, url);
          await this.navigateWithRetry(url, 3, 2000);
        } else {
          console.log(`[SchemaGenerator] Reloading page to trigger requests...`);
          await this.reloadWithRetry(3, 2000);
        }
        await this.page.waitForSelector('.ele-xform-fieldset-wrap', { timeout: 60000 });
      } catch (e) {
        console.warn(`[SchemaGenerator] Failed to navigate/reload page:`, e);
      }

      // 如果 60 秒后还没获取到配置，尝试直接从 MKXFORM 提取
      setTimeout(async () => {
        if (!requestHandled) {
          console.warn(`[SchemaGenerator] Config API not captured, trying direct MKXFORM extraction...`);
          try {
            const data = await this.page.evaluate(() => {
              // @ts-ignore
              const mkxform = window.MKXFORM;
              if (!mkxform) {
                throw new Error('MKXFORM not available');
              }

              const result: any = {
                dataModels: mkxform.dataModels,
                auth: null
              };

              // 尝试从各种位置获取 auth
              try {
                // @ts-ignore
                if (mkxform.auth) {
                  result.auth = mkxform.auth;
                }
                // @ts-ignore
                else if (window.__REDUX_STORE__?.getState?.()) {
                  // @ts-ignore
                  const state = window.__REDUX_STORE__.getState();
                  result.auth = state.auth || state.formAuth || null;
                }
              } catch (e) {
                // 忽略
              }

              return result;
            });

            if (data.dataModels) {
              const result = await this.parseConfigToSchema({
                dataModels: data.dataModels,
                auth: data.auth
              });
              requestHandled = true;
              clearTimeout(timeoutId);
              resolve(result);
            } else {
              requestHandled = true;
              clearTimeout(timeoutId);
              reject(new Error('No dataModels available'));
            }
          } catch (e) {
            requestHandled = true;
            clearTimeout(timeoutId);
            reject(e);
          }
        }
      }, 30000);
    });
  }

  /**
   * 解析配置 JSON 为 Schema 结构
   */
  private async parseConfigToSchema(config: any): Promise<{ fields: FormField[], detailTables: DetailTableSchema[], extractedFormName?: string }> {
    console.log(`[SchemaGenerator] Parsing config to schema...`);
    console.log(`[SchemaGenerator] Config keys:`, Object.keys(config));

    const mainFields: FormField[] = [];
    const detailTables: DetailTableSchema[] = [];
    let extractedFormName: string | undefined;

    // 提取多语言数据（用于匹配 fdLabelLangKey）
    const rawLangData = config.lang || config.langs || {};
    console.log(`[SchemaGenerator] Found lang data:`, typeof rawLangData === 'string' ? 'Yes (string)' : (Object.keys(rawLangData).length > 0 ? 'Yes' : 'No'));

    // 解析多语言数据：lang 可能是字符串（JSON）或对象
    const langMap = new Map<string, { prop: string; name: string; type: string; content: I18nContent }>();
    if (rawLangData) {
      try {
        const parsedLang = typeof rawLangData === 'string' ? JSON.parse(rawLangData) : rawLangData;
        if (typeof parsedLang === 'object' && parsedLang !== null) {
          for (const [key, value] of Object.entries(parsedLang)) {
            const entry = value as any;
            if (entry && entry.content && typeof entry.content === 'object') {
              langMap.set(key, {
                prop: entry.prop || '',
                name: entry.name || '',
                type: entry.type || '',
                content: entry.content as I18nContent,
              });
            }
          }
          console.log(`[SchemaGenerator] ✅ Parsed ${langMap.size} i18n entries from lang data`);
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.warn(`[SchemaGenerator] ⚠️ Failed to parse lang data:`, errorMessage);
      }
    }

    // 先尝试看看 dataModels 在哪里
    let dataModels: any[] = [];
    if (config.dataModels) {
      dataModels = config.dataModels;
    } else if (config.dataModel) {
      dataModels = Array.isArray(config.dataModel) ? config.dataModel : [config.dataModel];
    } else if (config.models) {
      dataModels = config.models;
    } else {
      // 尝试其他可能的键
      for (const key of Object.keys(config)) {
        if (Array.isArray(config[key]) && config[key].length > 0 && config[key][0].fdTableName) {
          console.log(`[SchemaGenerator] Found dataModels at key: ${key}`);
          dataModels = config[key];
          break;
        }
      }
    }
    
    console.log(`[SchemaGenerator] Found ${dataModels.length} dataModel(s)`);
    if (dataModels.length > 0) {
      console.log(`[SchemaGenerator] First dataModel keys:`, Object.keys(dataModels[0]));
      console.log(`[SchemaGenerator] First dataModel fdTableName:`, dataModels[0]?.fdTableName);
      console.log(`[SchemaGenerator] First dataModel fdFields count:`, dataModels[0]?.fdFields?.length || 0);
    }

    const auth = config.auth || [];
    console.log(`[SchemaGenerator] Auth info:`, auth);
    console.log(`[SchemaGenerator] Auth length:`, auth.length);
    if (auth.length > 0) {
      console.log(`[SchemaGenerator] Auth[0] keys:`, Object.keys(auth[0]));
      console.log(`[SchemaGenerator] Auth[0].add exists:`, !!auth[0].add);
      if (auth[0].add) {
        console.log(`[SchemaGenerator] Auth[0].add keys:`, Object.keys(auth[0].add));
      }
    }

    // 构建必填字段映射表 + 可编辑字段映射表
    // formconf API 的 auth 结构：
    // {
    //   auth: [{
    //     add: {
    //       "{tableName}": { fields: { fieldName: { required: true, editable: true } } },  // 每个表（含主表）的权限
    //       "detailTableId": { fields: { ... } }
    //     }
    //   }]
    // }
    const requiredMap = new Map<string, Map<string, boolean>>();
    const editableMap = new Map<string, Map<string, boolean>>();
    if (auth && auth.length > 0) {
      const sysAuth = auth[0];
      console.log(`[SchemaGenerator] sysAuth keys:`, Object.keys(sysAuth));
      if (sysAuth.add) {
        console.log(`[SchemaGenerator] sysAuth.add keys:`, Object.keys(sysAuth.add));

        // 遍历 add 中的所有键（每个键代表一个表的主表/明细表权限）
        for (const [tableName, tableAuth] of Object.entries(sysAuth.add) as any) {
          if (!tableAuth || typeof tableAuth !== 'object') continue;
          if (!tableAuth.fields || typeof tableAuth.fields !== 'object') continue;

          const fieldRequiredMap = new Map<string, boolean>();
          const fieldEditableMap = new Map<string, boolean>();
          for (const [fieldName, fieldAuth] of Object.entries(tableAuth.fields) as any) {
            if (fieldAuth && typeof fieldAuth === 'object') {
              // 提取 required 属性
              if ('required' in fieldAuth) {
                fieldRequiredMap.set(fieldName, fieldAuth.required || false);
                if (fieldAuth.required) {
                  console.log(`[SchemaGenerator] ✅ 表 ${tableName} 必填字段: ${fieldName}`);
                }
              }
              // 提取 editable 属性（新增）
              if ('editable' in fieldAuth) {
                fieldEditableMap.set(fieldName, fieldAuth.editable || false);
                if (!fieldAuth.editable) {
                  console.log(`[SchemaGenerator] 🔒 表 ${tableName} 不可编辑字段: ${fieldName}`);
                }
              } else {
                // 如果没有 editable 属性，默认为可编辑（向后兼容）
                fieldEditableMap.set(fieldName, true);
              }
            }
          }

          if (fieldRequiredMap.size > 0) {
            requiredMap.set(tableName, fieldRequiredMap);
            const requiredCount = Array.from(fieldRequiredMap.values()).filter(v => v).length;
            console.log(`[SchemaGenerator] 表 ${tableName}: 共 ${fieldRequiredMap.size} 个字段, ${requiredCount} 个必填`);
          }

          if (fieldEditableMap.size > 0) {
            editableMap.set(tableName, fieldEditableMap);
            const editableCount = Array.from(fieldEditableMap.values()).filter(v => v).length;
            const readonlyCount = Array.from(fieldEditableMap.values()).filter(v => !v).length;
            console.log(`[SchemaGenerator] 表 ${tableName}: ${editableCount} 个可编辑, ${readonlyCount} 个只读`);
          }
        }

        console.log(`\n[SchemaGenerator] 必填字段映射表汇总:`);
        for (const [tableId, fieldMap] of requiredMap.entries()) {
          const requiredFields = Array.from(fieldMap.entries()).filter(([, v]) => v);
          console.log(`  - ${tableId}: ${requiredFields.length} 个必填字段`);
          if (requiredFields.length > 0) {
            console.log(`    字段列表:`, requiredFields.map(([k]) => k));
          }
        }

        console.log(`\n[SchemaGenerator] 可编辑字段映射表汇总:`);
        for (const [tableId, fieldMap] of editableMap.entries()) {
          const editableFields = Array.from(fieldMap.entries()).filter(([, v]) => v);
          const readonlyFields = Array.from(fieldMap.entries()).filter(([, v]) => !v);
          console.log(`  - ${tableId}: ${editableFields.length} 个可编辑, ${readonlyFields.length} 个只读`);
          if (readonlyFields.length > 0) {
            console.log(`    只读字段列表:`, readonlyFields.map(([k]) => k));
          }
        }
      }
    }

    // 从 dataModels 提取字段
    for (let i = 0; i < dataModels.length; i++) {
      const model = dataModels[i];
      const modelId = model.fdTableName;
      const modelName = model.fdName;

      // 提取主表名称作为 formName
      // 优先使用 fdTableName（数据库表名，如 mk_km_ltc_business），这是标准命名方式
      if (i === 0) {
        extractedFormName = modelId;
        console.log(`[SchemaGenerator] Extracted form name from API: ${modelId} (tableName)`);
      }

      console.log(`[SchemaGenerator] Processing model ${i}: ${modelId} (${modelName})`);

      // 查找字段数组 - 可能是 fdFields 或 fields
      let fieldsArray: any[] = [];
      if (model.fdFields && model.fdFields.length > 0) {
        fieldsArray = model.fdFields;
      } else if (model.fields && model.fields.length > 0) {
        fieldsArray = model.fields;
      }
      
      console.log(`[SchemaGenerator] Model ${i} has ${fieldsArray.length} field(s)`);

      if (fieldsArray.length > 0) {
        const fields: FormField[] = [];
        const fieldRequiredMap = requiredMap.get(modelId) || new Map();
        const fieldEditableMap = editableMap.get(modelId) || new Map();
        console.log(`[SchemaGenerator] Field required map for ${modelId}:`, Array.from(fieldRequiredMap.entries()));
        console.log(`[SchemaGenerator] Field editable map for ${modelId}:`, Array.from(fieldEditableMap.entries()));

        for (const field of fieldsArray) {
          const rawFieldId = field.fdName || field.name;
          const fieldLabel = field.fdLabel || field.label;
          let fieldType = field.fdType || field.type;

          // 对于明细表（i !== 0），构建完整的字段 ID（格式：{modelId}.{fieldId}）
          // 主表字段保持原样，明细表字段需要添加模型前缀
          const fieldId = i === 0 ? rawFieldId : `${modelId}.${rawFieldId}`;

          console.log(`[SchemaGenerator] Processing field: id=${fieldId}, label=${fieldLabel}, type=${fieldType}`);

          // 跳过系统字段
          if ([
            'fd_id', 'fd_create_time', 'fd_last_modified_time',
            'fd_creator', 'fd_creator_dept', 'fd_owner', 'fd_owner_dept',
            'fd_alter', 'fd_alter_time', 'fd_deleted', 'fd_published_time',
            'fd_doc_status', 'fd_doc_subject', 'fd_template', 'fd_xform_id',
            'fd_version', 'fd_entity_id', 'fd_entity_name', 'fd_module',
            'fd_main_id', 'fd_order', 'fd_att_nocopy', 'fd_att_no_print',
            'fd_att_no_download', 'fd_draft_no_edit_copys', 'fd_draft_no_edit_download', 'fd_draft_no_edit_prints'
          ].includes(fieldId)) {
            console.log(`[SchemaGenerator] Skipping system field: ${fieldId}`);
            continue;
          }

          // 跳过布局字段和不需要生成的字段类型
          if ([
            'dividing', 'desc', 'multi-header', 'hidden', 'boolean',
            'collapseAppearance', 'mechnumber', 'calculate'
          ].includes(fieldType)) {
            console.log(`[SchemaGenerator] Skipping non-fillable field: ${fieldId} (${fieldType})`);
            continue;
          }

          // 🔑 临时注释：禁用不可编辑字段过滤（验证联动功能）
          // if (fieldEditableMap.size > 0) {
          //   const isEditable = fieldEditableMap.get(rawFieldId);
          //   console.log(`[SchemaGenerator] 🔐 权限检查: ${fieldId} (${fieldLabel}) - editable=${isEditable}, editableMap.size=${fieldEditableMap.size}`);
          //   if (isEditable === false) {
          //     console.log(`[SchemaGenerator] 🔒 Skipping non-editable field (权限控制): ${fieldId} (${fieldLabel})`);
          //     continue;
          //   }
          // } else {
          //   console.log(`[SchemaGenerator] ⚠️ 无权限信息: ${fieldId} (${fieldLabel}) - editableMap 为空，默认允许`);
          // }
          // 临时：强制所有字段都加入 Schema（用于验证联动功能）
          console.log(`[SchemaGenerator] ⚠️ 临时模式：跳过权限检查，强制添加字段: ${fieldId} (${fieldLabel})`);

          // 类型转换：把 EasyCraft 的类型转换为我们 Filler 能理解的类型
          const typeMapping: Record<string, string> = {
            'text': 'fd_input',
            'varchar': 'fd_input',
            'number': 'numbertext',
            'agency': 'cfg',  // agency 类型用 CfgFiller
            'cfg_multi': 'cfg~multi',  // 基础数据多选
            'relation_multi': 'relation~multi',  // 业务关联多选
          };

          if (typeMapping[fieldType]) {
            fieldType = typeMapping[fieldType];
          }

          // 根据 renderMode 进一步细化字段类型
          // 对于 dynamic 字段，renderMode 是对象 { modelId, modelName, type }
          // 对于其他字段，renderMode 是字符串 (singlelist/mullist/radio/checkbox/select/mulselect)
          let renderMode: any = undefined;
          if (field.renderMode) {
            // dynamic 字段：保留完整对象
            if (fieldType === 'dynamic' && typeof field.renderMode === 'object') {
              renderMode = field.renderMode;
              console.log(`[SchemaGenerator] Found dynamic renderMode for field ${fieldId}:`, JSON.stringify(renderMode));
            } else {
              // 其他字段：使用字符串类型
              renderMode = typeof field.renderMode === 'string' ? field.renderMode : field.renderMode.type;
              console.log(`[SchemaGenerator] Found renderMode "${renderMode}" for field ${fieldId}`);

              // 根据 renderMode 调整字段类型
              // cfg 和 relation 类型根据 renderMode 决定是单选还是多选
              if (fieldType === 'cfg' || fieldType === 'relation') {
                if (renderMode === 'mullist' || renderMode === 'checkbox' || renderMode === 'mulselect') {
                  fieldType = `${fieldType}~multi`;
                  console.log(`[SchemaGenerator] Updated ${fieldId} type to ${fieldType} based on renderMode`);
                }
              }
            }
          }

          // 对于 dynamic 字段，如果 API 没有返回 renderMode，先尝试从 fdAttribute/fdFontExtendData 提取
          // 🔑 关键：config JSON 中的 fdAttribute 包含完整的 renderMode 信息（含 modelId）
          if (fieldType === 'dynamic' && !renderMode) {
            // 方法1：从 fdAttribute 提取（最可靠，来自 config JSON）
            if (field.fdAttribute) {
              try {
                const attr = typeof field.fdAttribute === 'string' ? JSON.parse(field.fdAttribute) : field.fdAttribute;
                if (attr?.config?.controlProps?.renderMode) {
                  renderMode = attr.config.controlProps.renderMode;
                  console.log(`[SchemaGenerator] ✅ Extracted dynamic renderMode from fdAttribute for field ${fieldId}:`, JSON.stringify(renderMode));
                } else if (attr?.renderMode) {
                  renderMode = attr.renderMode;
                  console.log(`[SchemaGenerator] ✅ Extracted dynamic renderMode from fdAttribute.renderMode for field ${fieldId}:`, JSON.stringify(renderMode));
                }
              } catch (e) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                console.warn(`[SchemaGenerator] Failed to parse fdAttribute for ${fieldId}:`, errorMessage);
              }
            }

            // 方法2：从 fdFontExtendData 提取（备用）
            if (!renderMode && field.fdFontExtendData) {
              try {
                const extData = typeof field.fdFontExtendData === 'string' ? JSON.parse(field.fdFontExtendData) : field.fdFontExtendData;
                if (extData?.modelId) {
                  renderMode = {
                    modelId: extData.modelId,
                    modelName: extData.modelName || '',
                    type: extData.type || 'radio'
                  };
                  console.log(`[SchemaGenerator] ✅ Extracted dynamic renderMode from fdFontExtendData for field ${fieldId}:`, JSON.stringify(renderMode));
                }
              } catch (e) {
                const errorMessage = e instanceof Error ? e.message : String(e);
                console.warn(`[SchemaGenerator] Failed to parse fdFontExtendData for ${fieldId}:`, errorMessage);
              }
            }

            // 方法3：从 MKXFORM 组件实例提取（兜底方案）
            if (!renderMode) {
            try {
              const dynamicRenderMode = await this.page.evaluate((fid: string) => {
                const mkxform = (window as any).MKXFORM;
                if (!mkxform) return { error: 'MKXFORM not available' };
                
                console.log(`[SchemaGenerator.debug] Looking for field: "${fid}"`);
                
                // 方法1: 直接使用 fid
                let cmp = mkxform.$(fid);
                console.log(`[SchemaGenerator.debug] Method1 mkxform.$("${fid}"):`, cmp ? 'FOUND' : 'NOT FOUND');
                
                // 方法2: 尝试带 formId 前缀
                if (!cmp && !fid.includes('.')) {
                  const fullFid = `1jo56chk4wcoow2kk3w5ddrk824imb5j3kw0.${fid}`;
                  cmp = mkxform.$(fullFid);
                  console.log(`[SchemaGenerator.debug] Method2 mkxform.$("${fullFid}"):`, cmp ? 'FOUND' : 'NOT FOUND');
                }
                
                // 方法3: 遍历所有组件查找
                if (!cmp) {
                  console.log(`[SchemaGenerator.debug] Method3: Trying to find component by iterating...`);
                  const allComponents = Object.keys(mkxform || {}).filter(key => key.startsWith('$'));
                  console.log(`[SchemaGenerator.debug] Found ${allComponents.length} registered components`);
                  
                  const matchingKeys = allComponents.filter((key: string) => 
                    key.endsWith(fid) || key.endsWith(`.${fid}`)
                  );
                  console.log(`[SchemaGenerator.debug] Matching keys for "${fid}":`, matchingKeys);
                  
                  if (matchingKeys.length > 0) {
                    cmp = mkxform.$(matchingKeys[0]);
                    console.log(`[SchemaGenerator.debug] Found using key: "${matchingKeys[0]}"`);
                  }
                }
                
                if (!cmp) {
                  return { error: `Component not found for "${fid}", tried multiple methods` };
                }
                
                console.log(`[SchemaGenerator.debug] Component found! Type:`, typeof cmp, cmp);
                
                const fibre = cmp._CURRENT_FIBRE;
                const props = fibre?.props;
                
                console.log(`[SchemaGenerator.debug] Props keys:`, props ? Object.keys(props) : 'NO PROPS');
                console.log(`[SchemaGenerator.debug] Props.renderMode:`, props?.renderMode);
                console.log(`[SchemaGenerator.debug] Props.type:`, props?.type);
                console.log(`[SchemaGenerator.debug] Props.fdCommonControlId:`, props?.fdCommonControlId);
                
                // 提取 fdCommonControlId（这是调用 API 的关键参数）
                const fdCommonControlId = props?.fdCommonControlId || 
                                         props?.commonControlId ||
                                         props?.renderMode?.modelId;
                
                // 提取渲染模式类型
                const type = props?.renderMode?.type || 
                            props?.renderMode || 
                            props?.type || 
                            'singlist';
                
                if (fdCommonControlId) {
                  return {
                    modelId: fdCommonControlId,
                    type: type
                  };
                }
                
                return { error: 'No fdCommonControlId found in props' };
              }, fieldId);
              
              if (dynamicRenderMode && !dynamicRenderMode.error) {
                renderMode = dynamicRenderMode;
                console.log(`[SchemaGenerator] ✅ Extracted dynamic renderMode from MKXFORM for field ${fieldId}:`, JSON.stringify(renderMode));
              } else {
                console.warn(`[SchemaGenerator] ❌ Could not extract renderMode for dynamic field ${fieldId}:`, dynamicRenderMode?.error || 'Unknown error');
              }
            } catch (e) {
              const errorMessage = e instanceof Error ? e.message : String(e);
              console.warn(`[SchemaGenerator] ❌ Failed to extract dynamic renderMode for ${fieldId}:`, errorMessage);
            }
            } // 结束方法3：MKXFORM 提取
          }

          // 从 auth 获取必填状态（最准确）
          // 注意：auth 中的字段名是原始字段名（无前缀），所以用 rawFieldId 查询
          const required = fieldRequiredMap.get(rawFieldId) || false;

          // 提取选项信息（用于单选、多选、下拉等字段）
          let options: FieldOption[] | undefined;
          
          // 方法1：从 fdFontExtendData.options 提取（这是主要位置）
          if (field.fdFontExtendData) {
            const extData = typeof field.fdFontExtendData === 'string' ? JSON.parse(field.fdFontExtendData) : field.fdFontExtendData;
            if (extData && extData.options && extData.options.length > 0) {
              options = extData.options.map((opt: any) => ({
                label: opt.fdLabel || opt.label || opt.value || opt.fdValue,
                value: opt.fdValue || opt.value || opt.fdLabel || opt.label
              }));
              console.log(`[SchemaGenerator] Extracted ${options?.length ?? 0} options for field ${fieldId} from fdFontExtendData`);
            }
          }
          
          // 方法2：从 fdAttribute.options 提取
          if (!options && field.fdAttribute) {
            const attr = typeof field.fdAttribute === 'string' ? JSON.parse(field.fdAttribute) : field.fdAttribute;
            if (attr && attr.options && attr.options.length > 0) {
              options = attr.options.map((opt: any) => ({
                label: opt.fdLabel || opt.label || opt.value,
                value: opt.fdValue || opt.value || opt.label
              }));
              console.log(`[SchemaGenerator] Extracted ${options?.length ?? 0} options for field ${fieldId} from fdAttribute`);
            }
          }

          // 方法3：从顶层 fdOptions 提取
          if (!options && field.fdOptions && field.fdOptions.length > 0) {
            options = field.fdOptions.map((opt: any) => ({
              label: opt.fdLabel || opt.label || opt.fdValue,
              value: opt.fdValue || opt.value || opt.fdLabel
            }));
            console.log(`[SchemaGenerator] Extracted ${options?.length ?? 0} options for field ${fieldId} from fdOptions`);
          }

          // 方法4：从顶层 options 提取
          if (!options && field.options && field.options.length > 0) {
            options = field.options.map((opt: any) => ({
              label: opt.label || opt.value,
              value: opt.value || opt.label
            }));
            console.log(`[SchemaGenerator] Extracted ${options?.length ?? 0} options for field ${fieldId} from options`);
          }

          // 提取 cfgId 和 cfgConfig（基础数据字段的配置信息）
          // cfg 字段的配置存储在 fdAttribute 或 fdFontExtendData 中
          let cfgId: string | undefined;
          let cfgConfig: any | undefined;
          if (fieldType === 'cfg' || fieldType === 'cfg~multi') {
            if (field.fdAttribute) {
              const attr = typeof field.fdAttribute === 'string' ? JSON.parse(field.fdAttribute) : field.fdAttribute;
              cfgId = attr?.cfgId || attr?.fdId || attr?.modelId;
              cfgConfig = attr;
            }
            if (!cfgId && field.fdFontExtendData) {
              const extData = typeof field.fdFontExtendData === 'string' ? JSON.parse(field.fdFontExtendData) : field.fdFontExtendData;
              cfgId = extData?.cfgId || extData?.fdId || extData?.modelId;
              cfgConfig = extData;
            }
            if (cfgId) {
              console.log(`[SchemaGenerator] Extracted cfgId: ${cfgId} for field ${fieldId}`);
            }
            if (cfgConfig) {
              console.log(`[SchemaGenerator] Extracted cfgConfig for field ${fieldId}`);
            }
          }

          // 提取 relationCfg（业务关联字段的配置信息）
          // relation 字段的配置存储在 fdAttribute 或 fdFontExtendData 中
          // 只保留关键字段：appCode, modelId, refFieldName, tableName, tableType, fdFormType, xformName
          let relationCfg: any | undefined;
          let outParams: IOutParamItem[] | undefined;
          if (fieldType === 'relation' || fieldType === 'relation~multi') {
            let rawCfg: any = undefined;
            
            if (field.fdAttribute) {
              const attr = typeof field.fdAttribute === 'string' ? JSON.parse(field.fdAttribute) : field.fdAttribute;
              if (attr.relationCfg) {
                rawCfg = attr.relationCfg;
              } else if (attr.config && attr.config.relationCfg) {
                rawCfg = attr.config.relationCfg;
              } else if (attr.config && attr.config.controlProps && attr.config.controlProps.relationCfg) {
                rawCfg = attr.config.controlProps.relationCfg;
              }
            }
            
            if (!rawCfg && field.fdFontExtendData) {
              const extData = typeof field.fdFontExtendData === 'string' ? JSON.parse(field.fdFontExtendData) : field.fdFontExtendData;
              if (extData.relationCfg) {
                rawCfg = extData.relationCfg;
              } else if (extData.config && extData.config.relationCfg) {
                rawCfg = extData.config.relationCfg;
              } else if (extData.config && extData.config.controlProps && extData.config.controlProps.relationCfg) {
                rawCfg = extData.config.controlProps.relationCfg;
              }
            }
            
            // 只保留关键字段，避免存储过多内容
            if (rawCfg) {
              relationCfg = this.extractRelationCfg(rawCfg);
              console.log(`[SchemaGenerator] Extracted relationCfg for field ${fieldId}:`, Object.keys(relationCfg));
            }

            // 🔑 新：提取 outParams（业务关联字段的传出参数映射）
            if (field.fdAttribute) {
              try {
                const attr = typeof field.fdAttribute === 'string' ? JSON.parse(field.fdAttribute) : field.fdAttribute;
                const rawOutParams = attr?.config?.controlProps?.outParams?.params;
                if (rawOutParams && Array.isArray(rawOutParams) && rawOutParams.length > 0) {
                  outParams = rawOutParams.map((p: any) => ({
                    sourceField: {
                      fdType: p.sourceField?.fdType || '',
                      fdName: p.sourceField?.fdName || '',
                      tableName: p.sourceField?.tableName || '',
                      tableType: p.sourceField?.tableType || '',
                    },
                    targetField: {
                      fdType: p.targetField?.fdType || '',
                      fdName: p.targetField?.fdName || '',
                      tableName: p.targetField?.tableName || '',
                      tableType: p.targetField?.tableType || '',
                    },
                  }));
                  console.log(`[SchemaGenerator] ✅ Extracted outParams for field ${fieldId} from fdAttribute: ${outParams.length} mappings`);
                  outParams.forEach(m => console.log(`    ${m.sourceField.fdName} → ${m.targetField.fdName}`));
                }
              } catch (e) { /* ignore parse errors */ }
            }

            if (!outParams && field.fdFontExtendData) {
              try {
                const extData = typeof field.fdFontExtendData === 'string' ? JSON.parse(field.fdFontExtendData) : field.fdFontExtendData;
                const rawOutParams = extData?.outParams?.params;
                if (rawOutParams && Array.isArray(rawOutParams) && rawOutParams.length > 0) {
                  outParams = rawOutParams.map((p: any) => ({
                    sourceField: {
                      fdType: p.sourceField?.fdType || '',
                      fdName: p.sourceField?.fdName || '',
                      tableName: p.sourceField?.tableName || '',
                      tableType: p.sourceField?.tableType || '',
                    },
                    targetField: {
                      fdType: p.targetField?.fdType || '',
                      fdName: p.targetField?.fdName || '',
                      tableName: p.targetField?.tableName || '',
                      tableType: p.targetField?.tableType || '',
                    },
                  }));
                  console.log(`[SchemaGenerator] ✅ Extracted outParams for field ${fieldId} from fdFontExtendData: ${outParams.length} mappings`);
                  outParams.forEach(m => console.log(`    ${m.sourceField.fdName} → ${m.targetField.fdName}`));
                }
              } catch (e) { /* ignore parse errors */ }
            }
          }

          // 从 fdAttribute 中提取源码组件信息（优先从源码 JSON 获取）
          let sourceComponent: string = '-';
          let methods: string[] = [];
          let datasourceFilter: any = null;
          if (field.fdAttribute) {
            try {
              const attr = typeof field.fdAttribute === 'string' ? JSON.parse(field.fdAttribute) : field.fdAttribute;
              if (attr && attr.config && attr.config.key) {
                sourceComponent = attr.config.key;

                // 提取 datasource.queryCondition 过滤条件（业务关联动态过滤）
                const controlProps = attr.config.controlProps;

                // DEBUG: 打印 controlProps 的完整结构
                if (fieldType === 'relation' || fieldType === 'relation~multi') {
                  console.log(`[SchemaGenerator.debug] 🔍 Field ${fieldId} controlProps keys:`, controlProps ? Object.keys(controlProps) : 'null/undefined');
                  if (controlProps?.datasource) {
                    console.log(`[SchemaGenerator.debug] 🔍 Field ${fieldId} datasource keys:`, Object.keys(controlProps.datasource));
                    if (controlProps.datasource.queryCondition) {
                      console.log(`[SchemaGenerator.debug] 🔍 Field ${fieldId} queryCondition:`, JSON.stringify(controlProps.datasource.queryCondition)?.substring(0, 500));
                    }
                  }
                }

                if (controlProps?.datasource?.queryCondition?.query?.condition) {
                  datasourceFilter = controlProps.datasource.queryCondition.query.condition;
                  console.log(`[SchemaGenerator] ✅ Extracted datasource filter for field ${fieldId}:`, JSON.stringify(datasourceFilter)?.substring(0, 300));
                } else if (fieldType === 'relation' || fieldType === 'relation~multi') {
                  console.log(`[SchemaGenerator] ⚠️ No datasource filter found for relation field ${fieldId}`);
                  // 尝试备用路径
                  if (controlProps?.datasource?.queryCondition) {
                    console.log(`[SchemaGenerator.debug] ⚠️ queryCondition exists but path mismatch:`, JSON.stringify(controlProps.datasource.queryCondition)?.substring(0, 300));
                  }
                }
                
                // 尝试从多个可能的位置提取 methods
                // 位置1: attr.config.methods
                if (attr.config.methods && Array.isArray(attr.config.methods)) {
                  methods = attr.config.methods;
                  console.log(`[SchemaGenerator] Extracted methods from config.methods: ${methods} for field ${fieldId}`);
                }
                // 位置2: attr.methods
                else if (attr.methods && Array.isArray(attr.methods)) {
                  methods = attr.methods;
                  console.log(`[SchemaGenerator] Extracted methods from attr.methods: ${methods} for field ${fieldId}`);
                }
                // 位置3: attr.config.events
                else if (attr.config.events && Array.isArray(attr.config.events)) {
                  methods = attr.config.events;
                  console.log(`[SchemaGenerator] Extracted methods from config.events: ${methods} for field ${fieldId}`);
                }
                // 位置4: attr.actions
                else if (attr.actions && Array.isArray(attr.actions)) {
                  methods = attr.actions;
                  console.log(`[SchemaGenerator] Extracted methods from attr.actions: ${methods} for field ${fieldId}`);
                }
                // 位置5: attr.config.actions
                else if (attr.config.actions && Array.isArray(attr.config.actions)) {
                  methods = attr.config.actions;
                  console.log(`[SchemaGenerator] Extracted methods from config.actions: ${methods} for field ${fieldId}`);
                }
              }
            } catch (error) {
              console.log(`[SchemaGenerator] Failed to parse fdAttribute for field ${fieldId}:`, error);
            }
          }

          // 如果从 fdAttribute 中没有提取到，则使用映射表
          if (sourceComponent === '-') {
            const sourceInfo = this.getSourceComponentInfo(fieldType, field);
            sourceComponent = sourceInfo.component;
            methods = sourceInfo.methods;
          }

          // 去掉 sourceComponent 中的 ~hash 部分
          const cleanSourceComponent = sourceComponent.split('~')[0];
          console.log(`[SchemaGenerator] Extracted sourceComponent: ${cleanSourceComponent} for field ${fieldId}`);

          // 提取 fdLabelLangKey（用于在 lang 数据中匹配多语言标签）
          const fdLabelLangKey = field.fdLabelLangKey || undefined;
          if (fdLabelLangKey) {
            console.log(`[SchemaGenerator] Extracted fdLabelLangKey for field ${fieldId}: ${fdLabelLangKey}`);
          }

          // 提取完整的多语言对象 i18n
          let fieldI18n: FieldI18n | undefined;
          
          // 如果有 fdLabelLangKey，尝试从 langMap 中匹配多语言标签
          if (fdLabelLangKey && langMap.size > 0) {
            const matchedLangEntry = langMap.get(fdLabelLangKey);
            
            if (matchedLangEntry && matchedLangEntry.content) {
              console.log(`[SchemaGenerator] ✅ Found i18n match for ${fieldId}: ${fdLabelLangKey}`);
              
              // 构建 i18n 对象
              fieldI18n = {};
              if (matchedLangEntry.prop === 'label') {
                fieldI18n.label = matchedLangEntry.content;
              } else if (matchedLangEntry.prop === 'placeholder') {
                fieldI18n.placeholder = matchedLangEntry.content;
              }
              console.log(`[SchemaGenerator] Added i18n to field ${fieldId}: prop=${matchedLangEntry.prop}, keys=${Object.keys(matchedLangEntry.content).join(',')}`);
            } else {
              console.log(`[SchemaGenerator] ⚠️ No i18n match for ${fieldId}: ${fdLabelLangKey}`);
            }
          }

          // 尝试从 fdAttribute 提取 placeholder 的 LangKey
          let placeholderI18n: I18nContent | undefined;
          let displayNameFromDisplayLabel: string | undefined;
          if (field.fdAttribute) {
            try {
              const attr = typeof field.fdAttribute === 'string' ? JSON.parse(field.fdAttribute) : field.fdAttribute;
              if (attr?.config?.controlProps?.placeholder?.startsWith('!{')) {
                const phLangKey = attr.config.controlProps.placeholder;
                const phLangEntry = langMap.get(phLangKey);
                
                if (phLangEntry && phLangEntry.prop === 'placeholder' && phLangEntry.content) {
                  placeholderI18n = phLangEntry.content;
                  console.log(`[SchemaGenerator] ✅ Found placeholder i18n for ${fieldId}: ${phLangKey}`);
                  
                  if (!fieldI18n) {
                    fieldI18n = {};
                  }
                  fieldI18n.placeholder = placeholderI18n;
                }
              }

              const dlLangKey = attr?.config?.controlProps?.displayLabel || attr?.config?.labelProps?.displayLabel || '';
              if (dlLangKey && dlLangKey.startsWith('!{') && langMap.size > 0) {
                const dlLangEntry = langMap.get(dlLangKey);
                if (dlLangEntry && dlLangEntry.prop === 'displayLabel' && dlLangEntry.content) {
                  displayNameFromDisplayLabel = dlLangEntry.content.default || dlLangEntry.content.Cn || undefined;
                  if (!fieldI18n) { fieldI18n = {}; }
                  fieldI18n.displayLabel = dlLangEntry.content;
                  console.log(`[SchemaGenerator] ✅ Found displayLabel i18n for ${fieldId}: ${dlLangKey} → "${displayNameFromDisplayLabel}"`, JSON.stringify(dlLangEntry.content));
                }
              }
            } catch (e) {
            }
          }

          // displayName 回退链：displayLabel(别名) > i18n.label.default(默认语言) > fdLabel(原始标签)
          const resolvedDisplayName = displayNameFromDisplayLabel
            || fieldI18n?.label?.default
            || fieldI18n?.label?.Cn
            || fieldLabel;

          fields.push({
            id: fieldId,
            fdType: fieldType,
            label: fieldLabel,
            displayName: resolvedDisplayName,
            required: required,
            options: options,
            cfgId: cfgId,
            cfgConfig: cfgConfig,
            relationCfg: relationCfg,
            datasourceFilter: datasourceFilter,
            sourceComponent: cleanSourceComponent,
            methods: methods,
            renderMode: renderMode,
            outParams: outParams,
            fdLabelLangKey: fdLabelLangKey,
            i18n: fieldI18n,
          });

          console.log(`[SchemaGenerator] Added field ${fieldId} (${fieldLabel}): type=${fieldType}, required=${required}, options=${options?.length || 0}`);
        }

        // 第一个 model 是主表
        if (i === 0) {
          mainFields.push(...fields);
        } else {
          detailTables.push({
            detailModelId: modelId,
            detailTableName: modelName || 'Detail Table',
            fields
          });
        }
      }
    }

    console.log(`[SchemaGenerator] Parsed ${mainFields.length} main fields and ${detailTables.length} detail tables from config`);
    console.log(`[SchemaGenerator] Returning mainFields:`, JSON.stringify(mainFields.map(f => f.id)));

    return {
      fields: mainFields,
      detailTables: detailTables.length > 0 ? detailTables : [],
      extractedFormName
    };
  }
  
  /**
   * 验证并修正字段类型（检查 DOM 中实际的字段类型）
   */
  private async validateAndFixFieldTypes(fields: FormField[], formId: string): Promise<FormField[]> {
    console.log(`[SchemaGenerator] Validating field types for ${fields.length} fields...`);
    const fixedFields: FormField[] = [];
    let fixCount = 0;
    
    for (const field of fields) {
      // 使用展开运算符复制所有属性，包括 cfgId 和 cfgConfig
      let fixedField: FormField = { 
        ...field 
      };
      try {
        const actualType = await this.detectActualFieldType(field.id, formId);
        if (actualType && actualType !== field.fdType) {
          console.warn(
            `[SchemaGenerator] Type mismatch detected: ${field.id} (${field.label}) - ` +
            `Schema fdType: ${field.fdType}, Actual fdType: ${actualType} - ` +
            `Auto-fixing to: ${actualType}`
          );
          fixedField.fdType = actualType;
          fixCount++;
        }
      } catch (e) {
        // 检测失败，保持原类型
      }
      fixedFields.push(fixedField);
    }
    
    console.log(`[SchemaGenerator] Fixed ${fixCount} field types`);
    return fixedFields;
  }

  /**
   * 从 DOM 检测字段的实际类型
   */
  private async detectActualFieldType(fieldId: string, formId: string): Promise<string | null> {
    try {
      const fieldType = await this.page.evaluate((fid: string) => {
        // 尝试通过 data-id 定位
        const wrapper = document.querySelector(`[data-id^="${fid}"]`) as HTMLElement;
        if (!wrapper) return null;
        
        // 获取控件类型
        const input = wrapper.querySelector('input, select, textarea');
        if (!input) return null;
        
        const tagName = input.tagName.toLowerCase();
        const type = input.getAttribute('type') || '';
        
        if (tagName === 'input') {
          if (type === 'radio') return 'radio';
          if (type === 'checkbox') return 'checkbox';
          if (type === 'date') return 'timestamp';
          if (type === 'time') return 'timepicker';
          if (type === 'number') return 'numbertext';
          return 'fd_input';
        }
        if (tagName === 'select') return 'select';
        if (tagName === 'textarea') return 'textarea';
        
        return null;
      }, fieldId);
      
      return fieldType;
    } catch (e) {
      return null;
    }
  }

  /**
   * 根据字段类型获取源码组件信息
   * 映射表基于 el-form 源码中的组件定义
   */
  private getSourceComponentInfo(fieldType: string, field?: any): { component: string, methods: string[] } {
    const sourceComponentMap: Record<string, { component: string, methods: string[] }> = {
      'fd_input': { component: '@elem/xform-input', methods: ['onChange', 'onFocus', 'onBlur'] },
      'text': { component: '@elem/xform-input', methods: ['onChange', 'onFocus', 'onBlur'] },
      'textarea': { component: '@elem/xform-input', methods: ['onChange', 'onFocus', 'onBlur'] },
      'numbertext': { component: '@elem/xform-number', methods: ['onChange', 'onFocus', 'onBlur'] },
      'moneytext': { component: '@elem/xform-money', methods: ['onChange', 'onFocus', 'onBlur'] },
      'radio': { component: '@elem/xform-radio', methods: ['onChange'] },
      'checkbox': { component: '@elem/xform-checkbox', methods: ['onChange'] },
      'select': { component: '@elem/xform-select', methods: ['onChange'] },
      'select~multi': { component: '@elem/xform-select', methods: ['onChange'] },
      'timestamp': { component: '@elem/xform-datetime', methods: ['onChange'] },
      'timepicker': { component: '@elem/xform-datetime', methods: ['onChange'] },
      'address': { component: '@elem/xform-address', methods: ['onChange', 'onSelect', 'onDelect'] },
      'cfg': { component: '@elem/xform-cfg', methods: ['onChange'] },
      'cfg~multi': { component: '@elem/xform-cfg', methods: ['onChange'] },
      'relation': { component: '@elem/xform-relation', methods: ['onChange'] },
      'relation~multi': { component: '@elem/xform-relation', methods: ['onChange'] },
      'calculate': { component: '@elem/xform-calculate', methods: ['onChange'] },
      'switch': { component: '@elem/xform-checkbox', methods: ['onChange'] },
      'image': { component: '-', methods: [] },
      'attachment': { component: '-', methods: [] },
      'dividing': { component: '-', methods: [] },
      'upcasing': { component: '-', methods: [] },
      'dynamic': { component: '-', methods: [] },
    };

    // 如果字段有 renderMode 或特殊配置，可以进一步细化映射
    if (field && field.renderMode) {
      if (fieldType === 'relation' || fieldType === 'relation~multi') {
        // 业务关联组件根据 renderMode 不同可能使用不同的源码组件
        // 但实际上都映射到 @elem/xform-relation
        return sourceComponentMap[fieldType] || { component: '@elem/xform-relation', methods: ['onChange'] };
      }
    }

    return sourceComponentMap[fieldType] || { component: '-', methods: [] };
  }

  /**
   * 提取 relationCfg 的关键字段，避免存储过多内容
   * 只保留数据请求所需的关键字段：appCode, modelId, refFieldName, tableName, tableType, fdFormType, xformName
   */
  private extractRelationCfg(rawCfg: any): any {
    const keysToKeep = [
      'appCode',
      'modelId',
      'refFieldName',
      'tableName',
      'tableType',
      'fdFormType',
      'xformName',
    ];

    const result: any = {};
    for (const key of keysToKeep) {
      if (rawCfg[key] !== undefined && rawCfg[key] !== null) {
        result[key] = rawCfg[key];
      }
    }

    if (rawCfg.dynamic && typeof rawCfg.dynamic === 'object') {
      result.dynamic = rawCfg.dynamic;
      console.log(`[SchemaGenerator] ✅ Extracted dynamic filter config:`, JSON.stringify(result.dynamic).substring(0, 200));
    }

    const dynamicKeys = ['fd_entity', 'fd_customer', 'fd_account_id', 'fd_principal'];
    for (const key of dynamicKeys) {
      if (rawCfg[key] !== undefined && rawCfg[key] !== null) {
        result[key] = rawCfg[key];
        console.log(`[SchemaGenerator] ✅ Extracted dependency field "${key}":`, JSON.stringify(result[key]).substring(0, 100));
      }
    }

    return result;
  }

  /**
   * 从 DOM 中提取字段的显示名/别名
   * 用户在表单设计器中可以设置"显示名"，这个名称会显示在界面上
   * 但 API 返回的 label 是原始字段名，需要从 DOM 中获取实际显示的文本
   */
  private async extractDisplayNamesFromDOM(fields: FormField[], detailTables?: DetailTableSchema[]): Promise<void> {
    console.log(`[SchemaGenerator] Extracting display names from DOM for ${fields.length} main fields...`);

    try {
      const displayNames = await this.page.evaluate(() => {
        const nameMap: Record<string, string> = {};

        // 查找所有字段集容器
        const fieldsets = document.querySelectorAll('.ele-xform-fieldset-wrap');
        
        fieldsets.forEach((fieldset) => {
          // 查找标签容器
          const labelWrap = fieldset.querySelector('.ele-xform-fieldset-label-wrap');
          if (!labelWrap) return;

          // 获取标签文本（这就是用户看到的显示名/别名）
          const labelText = labelWrap.textContent?.trim();
          if (!labelText) return;

          // 查找控件容器以获取 data-id 或 data-tid
          const controlWrap = fieldset.querySelector('.ele-xform-fieldset-control-wrap');
          if (!controlWrap) return;

          // 尝试从 data-id 提取字段ID（格式：表名.字段名）
          const dataId = (fieldset as HTMLElement).dataset.id || 
                         (controlWrap as HTMLElement).dataset.id;
          
          // 尝试从 data-tid 提取控件ID（格式：comp-{字段代码}--{控件类型}）
          const dataTid = controlWrap.querySelector('[data-tid]')?.getAttribute('data-tid') || 
                         (controlWrap as HTMLElement).dataset.tid;

          if (dataId) {
            // data-id 格式：mk_ltc_lead.fd_name → 提取 fd_name
            const parts = dataId.split('.');
            const fieldId = parts[parts.length - 1]; // 取最后一部分作为字段ID
            nameMap[fieldId] = labelText;
            console.log(`[SchemaGenerator.debug] Found display name from data-id: ${fieldId} → "${labelText}"`);
          } else if (dataTid) {
            // data-tid 格式：comp-fd_name--input → 提取 fd_name
            const match = dataTid.match(/comp-(.+?)-/);
            if (match && match[1]) {
              const fieldId = match[1];
              nameMap[fieldId] = labelText;
              console.log(`[SchemaGenerator.debug] Found display name from data-tid: ${fieldId} → "${labelText}"`);
            }
          }
        });

        return nameMap;
      });

      // 更新主表字段的 displayName
      let updatedCount = 0;
      for (const field of fields) {
        const displayName = displayNames[field.id];
        if (displayName && displayName !== field.label) {
          field.displayName = displayName;
          updatedCount++;
          console.log(`[SchemaGenerator] ✅ Updated display name: ${field.id} ("${field.label}" → "${displayName}")`);
        }
      }

      // 更新明细表字段的 displayName
      if (detailTables) {
        for (const detailTable of detailTables) {
          for (const field of detailTable.fields) {
            // 明细表字段ID格式：modelId.fieldId，需要提取 fieldId
            const fieldIdParts = field.id.split('.');
            const plainFieldId = fieldIdParts[fieldIdParts.length - 1];
            
            const displayName = displayNames[plainFieldId] || displayNames[field.id];
            if (displayName && displayName !== field.label) {
              field.displayName = displayName;
              updatedCount++;
              console.log(`[SchemaGenerator] ✅ Updated detail field display name: ${field.id} ("${field.label}" → "${displayName}")`);
            }
          }
        }
      }

      console.log(`[SchemaGenerator] ✅ Extracted ${Object.keys(displayNames).length} display names, updated ${updatedCount} fields`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SchemaGenerator] ❌ Failed to extract display names from DOM: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 通过 MKXFORM API 快速提取字段信息
   * 优势：速度快、数据完整、不依赖 DOM 结构
   */
  private async extractFieldsViaMKXFORM(): Promise<FormField[]> {
    console.log(`[SchemaGenerator] Extracting fields via MKXFORM API...`);

    const data = await this.page.evaluate(() => {
      // @ts-ignore
      const mkxform = window.MKXFORM;
      if (!mkxform) {
        throw new Error('MKXFORM is not available on this page');
      }

      const result: any = {
        mainFields: [] as any[],
        detailTables: [] as any[],
      };

      // 从 dataModels 获取字段定义
      const dataModels = mkxform.dataModels as any[];
      if (dataModels && dataModels.length > 0) {
        // 第一个 model 是主表，其他的可能是明细表
        for (let i = 0; i < dataModels.length; i++) {
          const model = dataModels[i];
          const modelId = model.fdTableName;
          const modelName = model.fdName;
          
          if (model.fdFields && model.fdFields.length > 0) {
            const fields: any[] = [];
            
            for (const field of model.fdFields) {
              const fieldId = field.fdName;
              const fieldLabel = field.fdLabel;
              let fieldType = field.fdType;

              // 跳过系统字段
              if ([
                'fd_id', 'fd_create_time', 'fd_last_modified_time', 
                'fd_creator', 'fd_creator_dept', 'fd_owner', 'fd_owner_dept',
                'fd_alter', 'fd_alter_time', 'fd_deleted', 'fd_published_time',
                'fd_doc_status', 'fd_doc_subject', 'fd_template', 'fd_xform_id',
                'fd_version', 'fd_entity_id', 'fd_entity_name', 'fd_module',
                'fd_main_id', 'fd_order', 'fd_att_nocopy', 'fd_att_no_print',
                'fd_att_no_download', 'fd_draft_no_edit_copys', 'fd_draft_no_edit_download', 'fd_draft_no_edit_prints'
              ].includes(fieldId)) {
                continue;
              }
              
              // 跳过布局字段
              if (['dividing', 'desc', 'multi-header', 'hidden', 'boolean'].includes(fieldType)) {
                continue;
              }

              // 获取组件实例获取更多信息
              // @ts-ignore
              const cmp = mkxform.$(fieldId);
              const fibre = cmp?._CURRENT_FIBRE;
              const props = fibre?.props as any;

              // 类型转换：把 EasyCraft 的类型转换为我们 Filler 能理解的类型
              const typeMapping: Record<string, string> = {
                'text': 'fd_input',
                'varchar': 'fd_input',
                'number': 'numbertext',
                'agency': 'cfg',  // agency 类型用 CfgFiller
              };

              if (typeMapping[fieldType]) {
                fieldType = typeMapping[fieldType];
              }

              // 检测地址本组件
              if (props?.componentName === 'xform-address' || props?.componentName === '@elem/xform-address') {
                fieldType = 'address';
              }

              // 提取 cfgId 和 cfgConfig（基础数据字段的配置信息）
              let cfgId: string | undefined;
              let cfgConfig: any | undefined;
              if (fieldType === 'cfg') {
                cfgId = props?.cfgId || props?.cfg?.fdId || props?.cfg?.cfgId || props?.enumId;
                cfgConfig = props?.cfg;
              }

              // 提取 relationCfg（业务关联字段的配置信息）
              let relationCfg: any | undefined;
              if (fieldType === 'relation') {
                const rawCfg = props?.relationCfg || props?.relation || undefined;
                if (rawCfg) {
                  // 在浏览器端直接过滤，只保留关键字段
                  const keysToKeep = ['appCode', 'modelId', 'refFieldName', 'tableName', 'tableType', 'fdFormType', 'xformName'];
                  relationCfg = {} as any;
                  for (const key of keysToKeep) {
                    if (rawCfg[key] !== undefined && rawCfg[key] !== null) {
                      relationCfg[key] = rawCfg[key];
                    }
                  }
                }
              }

              // 从 props.type 获取 sourceComponent（格式如 @elem/xform-relation~hash，去掉 ~hash 部分）
              const rawSourceComponent = props?.type || '-';
              const sourceComponent = rawSourceComponent.split('~')[0];

              fields.push({
                id: fieldId,
                fdType: fieldType,
                label: fieldLabel,
                displayName: fieldLabel,
                required: props?.required || false,
                renderMode: props?.renderMode,
                placeholder: props?.placeholder,
                cfgId: cfgId,
                cfgConfig: cfgConfig,
                relationCfg: relationCfg,
                sourceComponent: sourceComponent,
              });
            }
            
            // 第一个 model 是主表
            if (i === 0) {
              result.mainFields = fields;
            } else {
              result.detailTables.push({
                detailModelId: modelId,
                detailTableName: modelName || 'Detail Table',
                fields
              });
            }
          }
        }
      }

      return result;
    });

    // 保存明细表信息到 this.tempDetailTables（后面会用到）
    if (data.detailTables && data.detailTables.length > 0) {
      (this as any).tempDetailTables = data.detailTables;
    }

    return data.mainFields;
  }
  
  /**
   * 从 DOM 验证并修复必填字段状态
   * dataModels 中的 required 字段不准确，需要从 DOM 中获取真实的必填标记
   */
  private async validateRequiredFieldsFromDOM(fields: FormField[]): Promise<FormField[]> {
    console.log(`[SchemaGenerator] Validating required fields from DOM...`);
    
    const validatedFields: FormField[] = [];
    let fixCount = 0;
    
    for (const field of fields) {
      // 从 DOM 获取真实的必填状态
      const isRequiredInDOM = await this.isFieldRequiredInDOM(field.id);
      
      if (isRequiredInDOM !== field.required) {
        console.log(`[SchemaGenerator] Fixed required status: ${field.id} (${field.label}) - ` +
          `was ${field.required}, now ${isRequiredInDOM}`);
        fixCount++;
      }
      
      validatedFields.push({
        ...field,
        required: isRequiredInDOM
      });
    }
    
    console.log(`[SchemaGenerator] Fixed ${fixCount} required field statuses`);
    return validatedFields;
  }
  
  /**
   * 从 DOM 判断字段是否必填
   */
  private async isFieldRequiredInDOM(fieldId: string): Promise<boolean> {
    try {
      const isRequired = await this.page.evaluate((fid: string) => {
        // 通过 data-id 定位字段容器
        const wrapper = document.querySelector(`[data-id^="${fid}"]`);
        if (!wrapper) return false;
        
        // 查找必填标记（*号）
        const label = wrapper.querySelector('.ele-xform-fieldset-label-wrap');
        if (!label) return false;
        
        // 查找 label 中的必填标记
        const text = label.textContent || '';
        const hasRequiredMark = text.includes('*') || !!label.querySelector('.ant-form-item-required');
        
        return hasRequiredMark;
      }, fieldId);
      
      return isRequired;
    } catch (e) {
      return false;
    }
  }

  /**
   * 从 DOM 提取字段信息（兜底方案）
   */
  private async extractFields(formId: string): Promise<FormField[]> {
    console.log(`[SchemaGenerator] Extracting fields via DOM inspection...`);
    
    const fields: FormField[] = [];
    
    try {
      // 等待表单加载
      await this.page.waitForSelector('.ele-xform-fieldset-wrap', { timeout: 30000 });
      
      // 获取所有字段容器
      const fieldWrappers = await this.page.locator('.ele-xform-fieldset-wrap').all();
      console.log(`[SchemaGenerator] Found ${fieldWrappers.length} field containers`);
      
      for (const wrapper of fieldWrappers) {
        try {
          // 获取字段 ID
          const dataId = await wrapper.getAttribute('data-id');
          if (!dataId) continue;
          
          // 解析字段 ID（格式：table.field）
          const parts = dataId.split('.');
          if (parts.length !== 2) continue;
          const fieldId = parts[1];
          
          // 跳过系统字段
          if (fieldId.startsWith('fd_') && [
            'fd_id', 'fd_create_time', 'fd_last_modified_time',
            'fd_creator', 'fd_creator_dept', 'fd_owner', 'fd_owner_dept',
            'fd_alter', 'fd_alter_time', 'fd_deleted', 'fd_published_time',
            'fd_doc_status', 'fd_doc_subject', 'fd_template', 'fd_xform_id',
            'fd_version', 'fd_entity_id', 'fd_entity_name', 'fd_module'
          ].includes(fieldId)) {
            continue;
          }
          
          // 获取标签
          const labelEl = wrapper.locator('.ele-xform-fieldset-label-wrap');
          const label = await labelEl.textContent().catch(() => '') || '';
          const cleanLabel = label.replace('*', '').trim();
          
          // 检测字段类型
          const fieldType = await this.detectFieldType(wrapper, fieldId);
          
          // 检测必填状态
          const required = label.includes('*');
          
          // 对于 relation 类型字段，尝试从 MKXFORM 获取 renderMode
          let renderMode: string | undefined;
          if (fieldType === 'relation') {
            try {
              renderMode = await this.page.evaluate((id) => {
                // @ts-ignore
                const mkxform = window.MKXFORM;
                if (!mkxform) return undefined;
                const cmp = mkxform.$(id);
                if (!cmp) return undefined;
                return (cmp as any)._CURRENT_FIBRE?.props?.renderMode ?? (cmp as any).props?.renderMode ?? undefined;
              }, `${formId}.${fieldId}`);
              console.log(`[SchemaGenerator] Extracted renderMode ${renderMode} for field ${fieldId}`);
            } catch (e) {
              // 忽略获取失败
            }
          }
          
          fields.push({
            id: fieldId,
            fdType: fieldType,
            label: cleanLabel,
            displayName: cleanLabel,
            required,
            renderMode
          });
          
          console.log(`[SchemaGenerator] Extracted field: ${fieldId} (${cleanLabel}) - ${fieldType} ${required ? '[必填]' : ''}`);
        } catch (e) {
          console.warn(`[SchemaGenerator] Failed to extract field:`, e);
        }
      }
    } catch (e) {
      console.error(`[SchemaGenerator] DOM extraction failed:`, e);
    }
    
    return fields;
  }
  
  /**
   * 检测字段类型
   */
  private async detectFieldType(wrapper: Locator, fieldId: string): Promise<string> {
    try {
      // 检查 input
      const input = wrapper.locator('input').first();
      if (await input.count() > 0) {
        const type = await input.getAttribute('type');
        const placeholder = await input.getAttribute('placeholder') || '';
        
        if (type === 'radio') return 'radio';
        if (type === 'checkbox') return 'checkbox';
        if (type === 'date' || placeholder.includes('日期')) return 'timestamp';
        if (type === 'time' || placeholder.includes('时间')) return 'timepicker';
        if (type === 'number') return 'numbertext';
        
        // 尝试检测 textarea
        const isTextarea = await wrapper.locator('textarea').count() > 0;
        if (isTextarea) return 'textarea';
        
        return 'fd_input';
      }
      
      // 检查 select
      const select = wrapper.locator('select').first();
      if (await select.count() > 0) {
        // 检测是否多选
        const multiple = await select.getAttribute('multiple');
        return multiple !== null ? 'select~multi' : 'select';
      }
      
      // 检查 textarea
      const textarea = wrapper.locator('textarea').first();
      if (await textarea.count() > 0) {
        return 'textarea';
      }
      
      return 'fd_input';
    } catch (e) {
      return 'fd_input';
    }
  }

  /**
   * 从 DOM 提取明细表信息
   */
  private async extractDetailTables(): Promise<DetailTableSchema[]> {
    console.log(`[SchemaGenerator] Extracting detail tables from DOM...`);
    
    const detailTables: DetailTableSchema[] = [];
    
    try {
      // 查找明细表容器
      const detailTableEls = await this.page.locator('.ele-detail-table-wrap').all();
      console.log(`[SchemaGenerator] Found ${detailTableEls.length} detail table containers`);
      
      for (let i = 0; i < detailTableEls.length; i++) {
        const tableEl = detailTableEls[i];
        
        // 获取明细表名称
        const nameEl = tableEl.locator('.ele-detail-table-name');
        const tableName = await nameEl.textContent().catch(() => `明细表 ${i + 1}`);
        
        // 获取明细表模型 ID
        const dataId = await tableEl.getAttribute('data-id');
        const detailModelId = dataId ? dataId.split('.')[0] : `detail_${i}`;
        
        // 获取字段容器
        const fieldWrappers = await tableEl.locator('.ele-detail-table-fieldset-wrap').all();
        
        const fields: FormField[] = [];
        for (const wrapper of fieldWrappers) {
          try {
            const fieldDataId = await wrapper.getAttribute('data-id');
            if (!fieldDataId) continue;
            
            const parts = fieldDataId.split('.');
            if (parts.length !== 2) continue;
            const fieldId = parts[1];
            
            // 跳过主表关联字段
            if (fieldId === 'fd_main_id') continue;
            
            const labelEl = wrapper.locator('.ele-detail-table-fieldset-label-wrap');
            const label = await labelEl.textContent().catch(() => '') || '';
            const cleanLabel = label.replace('*', '').trim();
            
            const fieldType = await this.detectFieldType(wrapper, fieldId);
            const required = label.includes('*');
            
            // 构建完整的明细表字段 ID（格式：{detailModelId}.{fieldId}）
            // 这是调用 MKXFORM API 和 associate/list API 必需的格式
            const fullFieldId = `${detailModelId}.${fieldId}`;
            
            // 对于 relation 类型，尝试获取 renderMode
            let renderMode: string | undefined;
            let relationCfg: any;
            if (fieldType === 'relation') {
              try {
                renderMode = await this.page.evaluate((id) => {
                  const mkxform = (window as any).MKXFORM;
                  if (!mkxform) return undefined;
                  const cmp = mkxform.$(id);
                  if (!cmp) return undefined;
                  return cmp._CURRENT_FIBRE?.props?.renderMode ?? cmp.props?.renderMode ?? undefined;
                }, fullFieldId);
                
                // 尝试获取 relationCfg
                relationCfg = await this.page.evaluate((id) => {
                  const mkxform = (window as any).MKXFORM;
                  if (!mkxform) return undefined;
                  const cmp = mkxform.$(id);
                  if (!cmp) return undefined;
                  const cfg = cmp._CURRENT_FIBRE?.props?.relationCfg ?? cmp.props?.relationCfg;
                  if (cfg) {
                    // 只保留关键字段
                    return {
                      appCode: cfg.appCode,
                      modelId: cfg.modelId,
                      refFieldName: cfg.refFieldName,
                      tableName: cfg.tableName,
                      tableType: cfg.tableType,
                      fdFormType: cfg.fdFormType,
                      xformName: cfg.xformName,
                    };
                  }
                  return undefined;
                }, fullFieldId);
              } catch (e) {
                // 忽略获取失败
              }
            }
            
            console.log(`[SchemaGenerator] Detail field: ${fullFieldId}, type=${fieldType}, renderMode=${renderMode}`);
            
            fields.push({
              id: fullFieldId,
              fdType: fieldType,
              label: cleanLabel,
              required,
              renderMode,
              ...(relationCfg ? { relationCfg } : {}),
            });
          } catch (e) {
            // 忽略单字段错误
          }
        }
        
        if (fields.length > 0) {
          detailTables.push({
            detailModelId,
            detailTableName: (tableName || `明细表 ${i + 1}`).trim(),
            fields
          });
          console.log(`[SchemaGenerator] Extracted detail table: ${detailModelId} (${tableName}) with ${fields.length} fields`);
        }
      }
    } catch (e) {
      console.error(`[SchemaGenerator] Detail table extraction failed:`, e);
    }
    
    // 如果 DOM 方式没找到，尝试使用暂存的 MKXFORM 数据
    if (detailTables.length === 0 && (this as any).tempDetailTables) {
      console.log(`[SchemaGenerator] Using MKXFORM detail table data...`);
      return (this as any).tempDetailTables;
    }
    
    return detailTables;
  }
  
  /**
   * 保存 Schema 到文件
   */
  async saveSchema(schema: FormSchema, outputDir: string = './schemas'): Promise<string> {
    const dir = path.resolve(outputDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 🔑 始终优先使用 formId（来自 API 提取的真实模型 ID），避免中文或自定义名称
    // 这样保证文件名统一为 mk_model_xxx.json 格式
    const filename = `${schema.formId}.json`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, JSON.stringify(schema, null, 2), 'utf-8');
    console.log(`[SchemaGenerator] ✅ Schema saved to ${filepath} (using formId: ${schema.formId})`);

    return filepath;
  }

  /**
   * 静态方法：加载已保存的 Schema
   * 支持环境子目录：自动从 test/ 或 sp3test/ 子目录查找
   */
  static loadSchema(formId: string, schemaDir: string = './schemas'): FormSchema | null {
    // 尝试直接路径
    const filepath = path.join(path.resolve(schemaDir), `${formId}.json`);
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, 'utf-8');
      return JSON.parse(content) as FormSchema;
    }

    // 尝试环境子目录 test/
    const testPath = path.join(path.resolve(schemaDir), 'test', `${formId}.json`);
    if (fs.existsSync(testPath)) {
      const content = fs.readFileSync(testPath, 'utf-8');
      return JSON.parse(content) as FormSchema;
    }

    // 尝试环境子目录 sp3test/
    const sp3testPath = path.join(path.resolve(schemaDir), 'sp3test', `${formId}.json`);
    if (fs.existsSync(sp3testPath)) {
      const content = fs.readFileSync(sp3testPath, 'utf-8');
      return JSON.parse(content) as FormSchema;
    }

    return null;
  }

  /**
   * 补充 dynamic 字段的 renderMode 信息（从 MKXFORM 组件实例提取）
   * 
   * 在表单完全加载后调用，从 MKXFORM 组件中提取完整的 renderMode 信息：
   * - modelId: 动态控件的模型ID（用于 API 调用）
   * modelName: 模型名称
   * type: 控件类型 (radio/multilist/singlist 等)
   * 
   * @param schema 原始 Schema 对象
   * @returns 更新后的 Schema 对象（包含完整的 renderMode 信息）
   */
  async enrichDynamicFields(schema: FormSchema): Promise<FormSchema> {
    console.log(`[SchemaGenerator.enrichDynamicFields] Starting to enrich dynamic fields...`);
    
    let updated = false;

    // 处理主表字段
    const mainDynamicFields = schema.fields.filter(f => f.fdType === 'dynamic' && !f.renderMode);
    if (mainDynamicFields.length > 0) {
      console.log(`[SchemaGenerator.enrichDynamicFields] Found ${mainDynamicFields.length} main table dynamic fields without renderMode`);
      
      for (const field of mainDynamicFields) {
        const renderMode = await this.extractRenderModeFromMKXFORM(field.id, schema.formId);
        if (renderMode) {
          field.renderMode = renderMode;
          updated = true;
          console.log(`[SchemaGenerator.enrichDynamicFields] ✅ Enriched main field "${field.label}" (${field.id}):`, JSON.stringify(renderMode));
        }
      }
    }

    // 处理明细表字段
    if (schema.detailTables) {
      for (const detailTable of schema.detailTables) {
        const detailDynamicFields = detailTable.fields.filter(f => f.fdType === 'dynamic' && !f.renderMode);
        
        if (detailDynamicFields.length > 0) {
          console.log(`[SchemaGenerator.enrichDynamicFields] Found ${detailDynamicFields.length} dynamic fields in detail table "${detailTable.detailModelId}" without renderMode`);
          
          // 🔑 关键优化：先收集所有已成功提取的主表 renderMode，用于明细表字段匹配
          const mainRenderModes: Array<{ fieldId: string; type: string; modelId: string; modelName: string }> = [];
          schema.fields.filter(f => f.fdType === 'dynamic' && f.renderMode).forEach(f => {
            if (f.renderMode) {
              mainRenderModes.push({
                fieldId: f.id,
                type: f.renderMode.type || 'singlist',
                modelId: f.renderMode.modelId,
                modelName: f.renderMode.modelName || ''
              });
            }
          });
          
          console.log(`[SchemaGenerator.enrichDynamicFields] Available main table renderModes for matching: ${mainRenderModes.length}`);
          mainRenderModes.forEach(m => console.log(`    - ${m.fieldId}: type=${m.type}, modelId=${m.modelId}`));
          
          for (const field of detailDynamicFields) {
            let renderMode: any = null;
            
            // 方法1：尝试直接从 MKXFORM 提取
            const fieldId = field.id.includes('.') ? field.id.split('.').pop() || field.id : field.id;
            renderMode = await this.extractRenderModeFromMKXFORM(fieldId, detailTable.detailModelId);
            
            // 方法2：如果直接提取失败，通过类型匹配复用主表的 modelId
            if (!renderMode && mainRenderModes.length > 0) {
              console.log(`[SchemaGenerator.enrichDirect extraction failed, trying type-based matching for "${field.label}" (${field.id})`);
              
              // 从 DOM 检测明细表控件的实际类型
              const detectedType = await this.detectDetailFieldControlType(fieldId);
              console.log(`[SchemaGenerator.enrichDynamicFields] Detected control type for detail field "${fieldId}": ${detectedType}`);
              
              // 类型匹配逻辑
              const matchedMain = mainRenderModes.find(main => {
                // 单选类型匹配
                if (detectedType === 'radio' && (main.type === 'radio' || main.type === 'singlist')) return true;
                // 多选类型匹配
                if ((detectedType === 'multilist' || detectedType === 'checkbox' || detectedType === 'multiSelect') && 
                    (main.type === 'checkbox' || main.type === 'multilist' || main.type === 'multiSelect')) return true;
                // 默认 singlist 匹配
                if (detectedType === 'singlist' && main.type === 'singlist') return true;
                return false;
              });
              
              if (matchedMain) {
                renderMode = {
                  modelId: matchedMain.modelId,
                  modelName: `${matchedMain.modelName} (from main: ${matchedMain.fieldId})`,
                  type: detectedType || matchedMain.type,
                  _source: 'main_table_type_match'
                };
                console.log(`[SchemaGenerator.enrichDynamicFields] ✅ Matched with main field "${matchedMain.fieldId}" (type: ${matchedMain.type})`);
              } else {
                console.log(`[SchemaGenerator.enrichDynamicFields] ❌ No matching main field found for type: ${detectedType}`);
              }
            }
            
            if (renderMode) {
              field.renderMode = renderMode;
              updated = true;
              console.log(`[SchemaGenerator.enrichDynamicFields] ✅ Enriched detail field "${field.label}" (${field.id}):`, JSON.stringify(renderMode));
            }
          }
        }
      }
    }

    if (updated) {
      console.log(`[SchemaGenerator.enrichDynamicFields] ✅ Schema enriched with dynamic field renderMode information`);
    } else {
      console.log(`[SchemaGenerator.enrichDynamicFields] No new renderMode information extracted`);
    }

    return schema;
  }

  /**
   * 从 MKXFORM 组件实例提取 renderMode 信息
   * 
   * @param fieldId 字段 ID（纯字段 ID，不带前缀）
   * @param formId 表单/明细表模型 ID（用于构建完整标识符）
   * @returns renderMode 对象或 undefined
   */
  private async detectDetailFieldControlType(fieldId: string): Promise<string> {
    try {
      const detectedType = await this.page.evaluate(({ fid }) => {
        const selectors = [
          `[data-tid*="${fid}"]`,
          `[data-id$=".${fid}"]`,
          `[data-tid="comp-${fid}--dynamic"]`
        ];
        
        for (const selector of selectors) {
          const domEl = document.querySelector(selector);
          if (domEl) {
            const hasCheckbox = !!domEl.querySelector(
              'input[type="checkbox"], .el-checkbox, [class*="checkbox"]'
            );
            const hasRadio = !!domEl.querySelector(
              'input[type="radio"], .el-radio, [class*="radio"]'
            );
            const hasMultiSelect = !!domEl.querySelector('[class*="multi"], [class*="multiple"]');
            
            if (hasCheckbox || hasMultiSelect) return 'multilist';
            if (hasRadio) return 'radio';
            return 'singlist';
          }
        }
        
        return 'singlist';
      }, { fid: fieldId });
      
      return detectedType || 'singlist';
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.warn(`[SchemaGenerator.detectDetailFieldControlType] Error:`, errorMessage);
      return 'singlist';
    }
  }

  private async extractRenderModeFromMKXFORM(fieldId: string, formId: string): Promise<any> {
    try {
      const result = await this.page.evaluate(({ fid, fId }) => {
        const mkxform = (window as any).MKXFORM;
        if (!mkxform) {
          return { error: 'MKXFORM not available' };
        }

        console.log(`[SchemaGenerator.extractRenderMode] Looking for field: "${fid}", formId: "${fId}"`);

        // 构建可能的完整标识符列表
        const possibleIds = [
          fid,                                              // 纯字段 ID
          `${fId}.${fid}`,                                  // formId.fieldId
        ];

        // 尝试每种标识符格式
        let cmp: any = null;
        let usedId: string = '';

        for (const tryId of possibleIds) {
          cmp = mkxform.$(tryId);
          if (cmp) {
            usedId = tryId;
            console.log(`[SchemaGenerator.extractRenderMode] ✅ Found component using: "${tryId}"`);
            break;
          } else {
            console.log(`[SchemaGenerator.extractRenderMode] ❌ Not found using: "${tryId}"`);
          }
        }

        if (!cmp) {
          // 额外尝试：遍历所有组件查找匹配项
          console.log(`[SchemaGenerator.extractRenderMode] Trying to find by iterating all components...`);
          const allComponents = Object.keys(mkxform || {}).filter((key: string) => key.startsWith('$'));
          
          const matchingKeys = allComponents.filter((key: string) => {
            const shortKey = key.replace(/^\$/, '');
            return shortKey.endsWith(fid) || shortKey.endsWith(`.${fid}`);
          });
          
          console.log(`[SchemaGenerator.extractRenderMode] Matching keys:`, matchingKeys);
          
          if (matchingKeys.length > 0) {
            cmp = mkxform.$(matchingKeys[0]);
            usedId = matchingKeys[0].replace(/^\$/, '');
          }
        }

        if (!cmp) {
          return { error: `Component not found for "${fid}", tried: ${possibleIds.join(', ')}` };
        }

        // 提取组件 props
        const fibre = cmp._CURRENT_FIBRE;
        const props = fibre?.props || cmp.props;

        if (!props) {
          return { error: 'No props found on component' };
        }

        console.log(`[SchemaGenerator.extractRenderMode] Component found! Props keys:`, Object.keys(props).slice(0, 20));
        console.log(`[SchemaGenerator.extractRenderMode] Props.renderMode:`, JSON.stringify(props?.renderMode));

        // 提取完整的 renderMode 对象
        if (props.renderMode && typeof props.renderMode === 'object') {
          const renderMode = {
            modelId: props.renderMode.modelId,
            modelName: props.renderMode.modelName,
            type: props.renderMode.type,
          };

          console.log(`[SchemaGenerator.extractRenderMode] ✅ Extracted complete renderMode:`, JSON.stringify(renderMode));
          return renderMode;
        }

        // 备用：从 fdCommonControlId 提取
        const fdCommonControlId = props.fdCommonControlId || props.commonControlId;
        if (fdCommonControlId) {
          const fallbackRenderMode = {
            modelId: fdCommonControlId,
            type: props.renderMode || props.type || 'singlist',
          };

          console.log(`[SchemaGenerator.extractRenderMode] ⚠️ Using fallback from fdCommonControlId:`, JSON.stringify(fallbackRenderMode));
          return fallbackRenderMode;
        }

        return { error: 'No renderMode or fdCommonControlId found in props' };
      }, { fid: fieldId, fId: formId });

      console.log(`[SchemaGenerator.extractRenderMode] Raw result:`, JSON.stringify(result)?.substring(0, 200));
      
      if (result && typeof result === 'object' && 'error' in result) {
        console.warn(`[SchemaGenerator.extractRenderMode] ❌ Failed to extract renderMode for "${fieldId}":`, result.error);
        return undefined;
      }
      
      if (result && result.modelId) {
        return result;
      }

      console.warn(`[SchemaGenerator.extractRenderMode] ❌ Invalid result for "${fieldId}":`, typeof result);
      return undefined;

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.warn(`[SchemaGenerator.extractRenderMode] ❌ Exception for "${fieldId}":`, errorMessage);
      return undefined;
    }
  }

  /**
   * 带重试机制的导航方法
   * @param url 目标URL
   * @param maxRetries 最大重试次数
   * @param retryDelayMs 重试间隔（毫秒）
   */
  private async navigateWithRetry(url: string, maxRetries: number = 3, retryDelayMs: number = 2000): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[SchemaGenerator] Navigating (attempt ${attempt}/${maxRetries}): ${url}`);
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log(`[SchemaGenerator] ✅ Navigation successful on attempt ${attempt}`);
        return;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[SchemaGenerator] Navigation failed (attempt ${attempt}/${maxRetries}): ${errorMessage}`);
        
        if (attempt < maxRetries) {
          console.log(`[SchemaGenerator] Waiting ${retryDelayMs}ms before retrying...`);
          await this.page.waitForTimeout(retryDelayMs);
        } else {
          throw new Error(`Navigation failed after ${maxRetries} attempts: ${errorMessage}`);
        }
      }
    }
  }

  /**
   * 带重试机制的页面刷新方法
   * @param maxRetries 最大重试次数
   * @param retryDelayMs 重试间隔（毫秒）
   */
  private async reloadWithRetry(maxRetries: number = 3, retryDelayMs: number = 2000): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[SchemaGenerator] Reloading page (attempt ${attempt}/${maxRetries})`);
        await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log(`[SchemaGenerator] ✅ Reload successful on attempt ${attempt}`);
        return;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[SchemaGenerator] Reload failed (attempt ${attempt}/${maxRetries}): ${errorMessage}`);
        
        if (attempt < maxRetries) {
          console.log(`[SchemaGenerator] Waiting ${retryDelayMs}ms before retrying...`);
          await this.page.waitForTimeout(retryDelayMs);
        } else {
          throw new Error(`Reload failed after ${maxRetries} attempts: ${errorMessage}`);
        }
      }
    }
  }
}
