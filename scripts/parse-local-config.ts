/**
 * 📝 Config 本地解析工具 - 从捕获的 JSON 生成完整 Schema
 *
 * 用途：
 * - 读取 capture-config.ts 捕获的 JSON 文件
 * - 解析 dataModel、auth、lang 数据
 * - 应用权限过滤（editable, required）
 * - 提取完整的多语言信息（i18n）
 * - 生成标准 Schema 文件
 *
 * 用法:
 *   npx ts-node scripts/parse-local-config.ts --input="./captured/xxx.json"
 *   npx ts-node scripts/parse-local-config.ts --input="./captured/xxx.json" --output="./schemas/xxx.json"
 *
 * 标记: ✅ 正式工具（非临时测试）
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── 类型定义 ──────────────────────────────────────────

interface I18nContent {
  Cn?: string;
  default?: string;
  Us?: string;
  Hk?: string;
  [key: string]: string | undefined;
}

interface FieldI18n {
  label?: I18nContent;
  placeholder?: I18nContent;
}

interface FormField {
  id: string;
  fdType: string;
  label: string;
  required: boolean;
  sourceComponent?: string;
  options?: any[];
  renderMode?: any;
  cfgId?: string;
  cfgConfig?: any;
  relationCfg?: any;
  fdLabelLangKey?: string;
  i18n?: FieldI18n;
}

interface DetailTableSchema {
  detailModelId: string;
  detailTableName: string;
  fields: FormField[];
}

interface FormSchema {
  formId: string;
  formName: string;
  url: string;
  fields: FormField[];
  detailTables?: DetailTableSchema[];
  generatedAt: string;
}

// ─── 配置 ──────────────────────────────────────────────

const TYPE_MAPPING: Record<string, string> = {
  'text': 'fd_input',
  'varchar': 'fd_input',
  'number': 'numbertext',
  'decimal': 'moneytext',
  'textarea': 'textarea',
  'select': 'select',
  'radio': 'radio',
  'checkbox': 'checkbox',
  'date': 'timestamp',
  'datetime': 'timestamp',
  'relation': 'relation',
  'cfg': 'cfg',
  'address': 'address',
};

const SYSTEM_FIELDS = [
  'fd_id', 'fd_create_time', 'fd_last_modified_time',
  'fd_creator', 'fd_creator_dept', 'fd_owner', 'fd_owner_dept',
  'fd_alter', 'fd_alter_time', 'fd_deleted', 'fd_published_time',
  'fd_doc_status', 'fd_doc_subject', 'fd_template', 'fd_xform_id',
  'fd_version', 'fd_entity_id', 'fd_entity_name', 'fd_module',
  'fd_main_id', 'fd_order', 'fd_att_nocopy', 'fd_att_no_print',
  'fd_att_no_download', 'fd_draft_no_edit_copys', 'fd_draft_no_edit_download', 'fd_draft_no_edit_prints'
];

const SKIP_FIELD_TYPES = [
  'dividing', 'desc', 'multi-header', 'hidden', 'boolean',
  'collapseAppearance', 'mechnumber', 'calculate'
];

interface ParseOptions {
  input: string;
  output?: string;
  verbose?: boolean;
}

// ─── 核心逻辑 ─────────────────────────────────────────

function parseLocalConfig(options: ParseOptions): FormSchema {
  const { input, verbose = false } = options;

  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`  📝 Config 本地解析工具`);
  console.log(`  📅 时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`═══════════════════════════════════════════════════════\n`);

  // 读取文件
  console.log(`📂 读取配置文件...`);
  
  let capturedData: any;
  try {
    const fileContent = fs.readFileSync(input, 'utf-8');
    capturedData = JSON.parse(fileContent);
    console.log(`✅ 成功读取 (${(fileContent.length / 1024).toFixed(1)} KB)\n`);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    throw new Error(`无法读取文件 ${input}: ${errorMessage}`);
  }

  // 提取 configData
  const configData = capturedData.configData || capturedData;
  const metadata = capturedData.metadata || {};

  if (verbose && metadata.dataSize) {
    console.log(`📊 元数据:`);
    console.log(`   原始大小: ${(metadata.dataSize / 1024).toFixed(1)} KB`);
    console.log(`   DataModels: ${metadata.dataModelsCount} 个`);
    console.log(`   Auth 条目: ${metadata.authEntriesCount} 个`);
    console.log(`   I18n 条目: ${metadata.i18nEntriesCount} 个\n`);
  }

  // 1. 解析多语言数据
  console.log(`🌐 步骤1: 解析多语言数据`);
  const langMap = new Map<string, { prop: string; name: string; type: string; content: I18nContent }>();

  const rawLang = configData.lang;
  if (rawLang) {
    try {
      const parsedLang = typeof rawLang === 'string' ? JSON.parse(rawLang) : rawLang;
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
      }
      console.log(`   ✅ 成功解析 ${langMap.size} 条 i18n 条目\n`);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.warn(`   ⚠️ 解析多语言失败: ${errorMessage}\n`);
    }
  } else {
    console.log(`   ℹ️ 未找到多语言数据\n`);
  }

  // 2. 提取 DataModels
  console.log(`📊 步骤2: 提取 DataModels`);
  let dataModels: any[] = [];

  if (configData.dataModels) {
    dataModels = configData.dataModels;
  } else if (configData.dataModel) {
    dataModels = Array.isArray(configData.dataModel) ? configData.dataModel : [configData.dataModel];
  }

  if (dataModels.length === 0) {
    throw new Error('未找到 dataModel 或 dataModels 数据');
  }

  console.log(`   ✅ 找到 ${dataModels.length} 个模型\n`);

  // 3. 构建权限映射表
  console.log(`🔐 步骤3: 解析权限数据 (Auth)`);
  const auth = configData.auth || [];
  const requiredMap = new Map<string, Map<string, boolean>>();
  const editableMap = new Map<string, Map<string, boolean>>();

  if (auth.length > 0 && auth[0].add) {
    for (const [tableName, tableAuth] of Object.entries(auth[0].add) as any) {
      if (!tableAuth?.fields) continue;

      const fieldReqMap = new Map<string, boolean>();
      const fieldEditMap = new Map<string, boolean>();

      for (const [fieldName, fieldAuth] of Object.entries(tableAuth.fields) as any) {
        if (fieldAuth && typeof fieldAuth === 'object') {
          fieldReqMap.set(fieldName, fieldAuth.required || false);
          fieldEditMap.set(fieldName, fieldAuth.editable !== false);
        }
      }

      requiredMap.set(tableName, fieldReqMap);
      editableMap.set(tableName, fieldEditMap);

      const reqCount = Array.from(fieldReqMap.values()).filter(v => v).length;
      const editCount = Array.from(fieldEditMap.values()).filter(v => v).length;
      const readonlyCount = Array.from(fieldEditMap.values()).filter(v => !v).length;

      if (verbose || tableName === dataModels[0]?.fdTableName) {
        console.log(`   📦 表 ${tableName}:`);
        console.log(`      字段总数: ${fieldReqMap.size}`);
        console.log(`      必填字段: ${reqCount} 个`);
        console.log(`      可编辑: ${editCount} 个`);
        console.log(`      只读(将被过滤): ${readonlyCount} 个`);
      }
    }
    console.log('');
  } else {
    console.log(`   ℹ️ 未找到权限数据，所有字段将标记为可编辑且非必填\n`);
  }

  // 4. 提取字段并应用过滤
  console.log(`🔍 步骤4: 提取字段并应用过滤`);
  const mainFields: FormField[] = [];
  const detailTables: DetailTableSchema[] = [];
  let totalFilteredReadonly = 0;
  let totalFilteredSystem = 0;
  let totalFilteredType = 0;

  for (let i = 0; i < dataModels.length; i++) {
    const model = dataModels[i];
    const modelId = model.fdTableName;
    const modelName = model.fdName || modelId;
    const isMainTable = model.fdType === 'main';

    if (!model.fdFields || !Array.isArray(model.fdFields)) continue;

    console.log(`\n   处理模型 [${i}]: ${modelId} (${modelName}) - ${model.fdFields.length} 字段`);

    const fields: FormField[] = [];
    const fieldRequiredMap = requiredMap.get(modelId) || new Map();
    const fieldEditableMap = editableMap.get(modelId) || new Map();

    for (const field of model.fdFields) {
      const fieldName = field.fdName;
      const fieldType = field.fdType || 'unknown';
      const fieldLabel = field.fdLabel || fieldName;

      // 跳过系统字段
      if (SYSTEM_FIELDS.includes(fieldName)) {
        if (verbose) console.log(`      🔒 系统字段: ${fieldName}`);
        totalFilteredSystem++;
        continue;
      }

      // 跳过不需要的字段类型
      if (SKIP_FIELD_TYPES.includes(fieldType)) {
        if (verbose) console.log(`      ⏭️ 不支持的类型: ${fieldName} (${fieldType})`);
        totalFilteredType++;
        continue;
      }

      // 过滤不可编辑字段
      const isEditable = fieldEditableMap.get(fieldName);
      if (isEditable === false) {
        if (verbose) console.log(`      🔒 只读字段: ${fieldName} (${fieldLabel})`);
        totalFilteredReadonly++;
        continue;
      }

      // 获取必填状态
      const isRequired = fieldRequiredMap.get(fieldName) || false;

      // 类型转换
      let mappedType = TYPE_MAPPING[fieldType] || fieldType;

      // 提取 sourceComponent
      let sourceComponent = '';
      try {
        if (field.fdAttribute) {
          const attr = typeof field.fdAttribute === 'string' ? JSON.parse(field.fdAttribute) : field.fdAttribute;
          if (attr?.config?.key) {
            sourceComponent = attr.config.key.split('~')[0];
          }
        }
      } catch (e) { /* ignore */ }

      // 提取多语言信息
      let fieldI18n: FieldI18n | undefined;
      const langKey = field.fdLabelLangKey;

      if (langKey && langMap.size > 0) {
        const matchedEntry = langMap.get(langKey);
        
        if (matchedEntry && matchedEntry.content) {
          fieldI18n = {};
          
          if (matchedEntry.prop === 'label') {
            fieldI18n.label = matchedEntry.content;
          } else if (matchedEntry.prop === 'placeholder') {
            fieldI18n.placeholder = matchedEntry.content;
          }
        }

        // 提取 placeholder 多语言
        if (field.fdAttribute) {
          try {
            const attr = typeof field.fdAttribute === 'string' ? JSON.parse(field.fdAttribute) : field.fdAttribute;
            if (attr?.config?.controlProps?.placeholder?.startsWith('!{')) {
              const phLangKey = attr.config.controlProps.placeholder;
              const phEntry = langMap.get(phLangKey);
              
              if (phEntry && phEntry.prop === 'placeholder' && phEntry.content) {
                if (!fieldI18n) fieldI18n = {};
                fieldI18n.placeholder = phEntry.content;
              }
            }
          } catch (e) { /* ignore */ }
        }
      }

      // 构建 FormField 对象
      const formField: FormField = {
        id: fieldName,
        fdType: mappedType,
        label: fieldLabel,
        required: isRequired,
        sourceComponent,
        fdLabelLangKey: langKey,
        i18n: fieldI18n,
      };

      fields.push(formField);

      // 输出日志
      if (isRequired) {
        console.log(`      ✅ 必填: ${fieldName.padEnd(30)} ${fieldLabel.padEnd(20)} [${mappedType}]`);
      } else if (verbose) {
        console.log(`      ✓ 普通: ${fieldName.padEnd(30)} [${mappedType}]`);
      }
    }

    if (isMainTable) {
      mainFields.push(...fields);
    } else {
      const tableNameClean = modelName.replace(/^(mk_)/, '').replace(/(_list)$/, '');
      detailTables.push({
        detailModelId: modelId,
        detailTableName: tableNameClean,
        fields: fields,
      });
    }
  }

  console.log(`\n   📊 过滤统计:`);
  console.log(`      系统字段已过滤: ${totalFilteredSystem} 个`);
  console.log(`      只读字段已过滤: ${totalFilteredReadonly} 个`);
  console.log(`      不支持类型已过滤: ${totalFilteredType} 个`);

  // 5. 构建 Schema
  const schema: FormSchema = {
    formId: capturedData.formId || dataModels[0]?.fdId || '',
    formName: capturedData.formName || dataModels[0]?.fdTableName || '',
    url: capturedData.url || '',
    fields: mainFields,
    generatedAt: new Date().toISOString(),
    detailTables: detailTables.length > 0 ? detailTables : undefined,
  };

  // 统计输出
  const requiredFields = mainFields.filter(f => f.required);
  const withI18n = mainFields.filter(f => f.i18n);

  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`  📊 Schema 生成结果统计`);
  console.log(`═══════════════════════════════════════════════════════\n`);

  console.log(`📝 主表 (${schema.formName}):`);
  console.log(`   总字段数: ${mainFields.length}`);
  console.log(`   必填字段: ${requiredFields.length} 个`);
  console.log(`   含多语言: ${withI18n.length} 个`);

  if (requiredFields.length > 0) {
    console.log(`\n   ✅ 必填字段列表:`);
    for (const f of requiredFields) {
      const i18nMark = f.i18n ? '🌐' : '  ';
      console.log(`     ${i18nMark} ${f.id.padEnd(25)} ${f.label.padEnd(15)} [${f.fdType}]`);
    }
  }

  if (detailTables.length > 0) {
    console.log(`\n📋 明细表: ${detailTables.length} 个`);
    for (const dt of detailTables) {
      const reqDt = dt.fields.filter(f => f.required);
      console.log(`\n   📦 ${dt.detailTableName} (${dt.detailModelId}):`);
      console.log(`      字段数: ${dt.fields.length}, 必填: ${reqDt.length}`);
      
      for (const f of dt.fields) {
        const reqMark = f.required ? '✓' : ' ';
        console.log(`       ${reqMark} ${f.id.padEnd(45)} [${f.fdType}]`);
      }
    }
  }

  return schema;
}

// ─── CLI 参数解析 ────────────────────────────────────────

function parseArgs(): ParseOptions {
  const args = process.argv.slice(2);

  const options: ParseOptions = {
    input: '',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--input=') || arg.startsWith('-i=')) {
      options.input = arg.substring(arg.indexOf('=') + 1);
    } else if (arg.startsWith('--output=') || arg.startsWith('-o=')) {
      options.output = arg.substring(arg.indexOf('=') + 1);
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
📝 Config 本地解析工具 - 用法:

  npx ts-node scripts/parse-local-config.ts --input="<文件路径>" [选项]

选项:
  --input=<path>       输入文件路径（必填，capture-config 的输出）
  --output=<path>      输出 Schema 文件路径（可选，默认自动生成）
  --verbose            显示详细信息
  --help               显示帮助信息

示例:
  npx ts-node scripts/parse-local-config.ts \\
    --input="./captured/2026-05-11T10-00-00-000Z_mk_ltc_lead.json"

  npx ts-node scripts/parse-local-config.ts \\
    --input="./captured/xxx.json" \\
    --output="./schemas/mk_ltc_lead.json" \\
    --verbose
`);
      process.exit(0);
    }
  }

  if (!options.input) {
    console.error(`❌ 错误: 必须提供 --input 参数`);
    console.error(`使用 --help 查看帮助信息`);
    process.exit(1);
  }

  return options;
}

// ─── 主程序 ────────────────────────────────────────────

async function main() {
  try {
    const options = parseArgs();

    // 解析配置
    const schema = parseLocalConfig(options);

    // 确定输出路径
    let outputPath = options.output;
    if (!outputPath) {
      // 自动生成输出路径：./schemas/{env}/{formName}.json
      const schemasDir = path.join(__dirname, '../src/schemas/Securemetric-CRM/base/securemetric-crm');
      if (!fs.existsSync(schemasDir)) {
        fs.mkdirSync(schemasDir, { recursive: true });
      }
      outputPath = path.join(schemasDir, `${schema.formName}.json`);
    }

    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 保存 Schema
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2), 'utf-8');

    console.log(`\n💾 Schema 已保存到:\n   ${outputPath}\n`);

    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`  ✅ 解析完成！`);
    console.log(`═══════════════════════════════════════════════════════`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ 解析失败:`, errorMessage);
    process.exit(1);
  }
}

main();
