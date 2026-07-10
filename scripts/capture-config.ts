/**
 * 📡 Config 捕获工具 - 从网络拦截并保存完整的表单配置 JSON
 *
 * 用途：
 * - 导航到目标 URL，拦截所有 /form/config/*.json 响应
 * - 保存完整的配置文件到本地（包含 dataModel, auth, lang）
 * - 为后续离线分析提供数据源
 *
 * 输出路径: ./src/schemas/{env}/{source-{formName}.json}
 *
 * 用法:
 *   npx ts-node scripts/capture-config.ts --url="http://..."
 *   npx ts-node scripts/capture-config.ts --url="http://..." --headed
 *
 * 标记: ✅ 正式工具（非临时测试）
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// ─── 环境配置 ──────────────────────────────────────────

interface EnvironmentConfig {
  id: string;
  name: string;
  urlPattern: RegExp;  // URL 匹配模式
  schemaPath: string;   // Schema 存储路径
}

const ENVIRONMENTS: EnvironmentConfig[] = [
  {
    id: 'securemetric-crm',
    name: 'Securemetric CRM',
    urlPattern: /172\.18\.114\.231:8088/,
    schemaPath: './src/schemas/Securemetric-CRM/base/securemetric-crm',
  },
  {
    id: 'test',
    name: 'EasyCraft Test',
    urlPattern: /test\.easycraft\.ai/,
    schemaPath: './src/schemas/test',
  },
  {
    id: 'sp3test',
    name: 'SP3Test',
    urlPattern: /sp3test\.landray\.com\.cn/,
    schemaPath: './src/schemas/sp3test',
  },
];

const DEFAULT_OUTPUT_DIR = path.join(__dirname, '../captured');  // 兜底目录

// ─── 配置 ──────────────────────────────────────────────

interface CaptureOptions {
  url: string;
  outputDir?: string;
  timeout?: number;
  headed?: boolean;
  sessionFile?: string;  // 认证 Session 文件路径
}

interface CapturedConfig {
  timestamp: string;
  url: string;
  formId?: string;
  formName?: string;
  versionId?: string;  // 从 init 接口获取的版本 ID
  configData: any;
  metadata: {
    dataSize: number;
    dataModelsCount: number;
    authEntriesCount: number;
    i18nEntriesCount: number;
    capturedAt: string;
    totalConfigResponses: number;  // 捕获到的 Config JSON 总数
  };
}

// ─── 辅助函数 ──────────────────────────────────────────

/**
 * 根据 URL 检测环境配置
 */
function detectEnvironment(url: string): EnvironmentConfig | null {
  for (const env of ENVIRONMENTS) {
    if (env.urlPattern.test(url)) {
      return env;
    }
  }
  return null;
}

// ─── 核心逻辑 ─────────────────────────────────────────

async function captureConfig(options: CaptureOptions): Promise<CapturedConfig> {
  const {
    url,
    outputDir = DEFAULT_OUTPUT_DIR,
    timeout = 60000,
  headed = false,
  sessionFile = '',  // 默认为空（不使用 session）
} = options;

  // 检测环境
  const detectedEnv = detectEnvironment(url);
  const finalOutputDir = outputDir !== DEFAULT_OUTPUT_DIR
    ? outputDir
    : (detectedEnv ? path.resolve(__dirname, '..', detectedEnv.schemaPath) : DEFAULT_OUTPUT_DIR);

  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`  📡 Config 捕获工具`);
  console.log(`  📅 时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`═══════════════════════════════════════════════════════\n`);

  console.log(`🎯 目标 URL: ${url}`);
  
  if (detectedEnv) {
    console.log(`🌍 环境: ${detectedEnv.name} (${detectedEnv.id})`);
  } else {
    console.log(`⚠️ 未识别的环境，将使用默认输出目录`);
  }
  
  console.log(`📁 输出目录: ${finalOutputDir}`);

  // 如果没有指定 session 文件，尝试自动检测
  if (!options.sessionFile) {
    // 如果是 Securemetric CRM 的 URL，使用默认的 session
    if (url.includes('172.18.114.231:8088')) {
      const defaultSession = path.join(__dirname, '../auth/auth-securemetric-crm.json');
      if (fs.existsSync(defaultSession)) {
        options.sessionFile = defaultSession;
        console.log(`🔐 自动检测到 Securemetric CRM，将使用认证 Session`);
      }
    }
  }

  console.log(`\n`);

  // 确保输出目录存在
  if (!fs.existsSync(finalOutputDir)) {
    fs.mkdirSync(finalOutputDir, { recursive: true });
    console.log(`✅ 已创建输出目录: ${finalOutputDir}\n`);
  }

  // 启动浏览器
  let browser: Browser | null = null;
  try {
    console.log(`🌐 启动浏览器...`);
    browser = await chromium.launch({ headless: !headed });

    // 创建浏览器上下文（可选加载认证 Session）
    const contextOptions: any = {};
    
    if (sessionFile) {
      // 使用指定的 Session 文件
      if (fs.existsSync(sessionFile)) {
        console.log(`🔐 加载认证 Session: ${sessionFile}`);
        contextOptions.storageState = sessionFile;
      } else {
        console.warn(`⚠️ Session 文件不存在: ${sessionFile}`);
        console.warn(`   将以未登录状态运行，可能无法访问需要认证的页面`);
      }
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    let capturedResponse: any = null;
    let requestHandled = false;
    let initVersionId: string | null = null;
    const allConfigResponses: Array<{ url: string; data: any; hasDataModels: boolean; hasAuth: boolean; hasLang: boolean }> = [];

    // 监听所有响应
    page.on('response', async (response) => {
      const respUrl = response.url();

      // 🔍 调试：打印所有包含 config 或 form 的 JSON 请求
      if ((respUrl.includes('config') || respUrl.includes('form')) && respUrl.endsWith('.json') && !respUrl.includes('/locale/') && !respUrl.includes('/i18n/')) {
        console.log(`[Capture.debug] 🌐 发现相关 JSON: ${respUrl.substring(0, 150)}`);
      }

      // 1️⃣ 监听 init 接口 - 提取 versionId
      if (respUrl.includes('/sysModelingMain/init') && !initVersionId) {
        try {
          const initData = await response.json();
          initVersionId = initData?.data?.versionId || initData?.versionId || null;

          if (initVersionId) {
            console.log(`\n[Capture] 🎯 捕获到 Init 接口:`);
            console.log(`   URL: ${respUrl.substring(0, 100)}...`);
            console.log(`   ✅ Version ID: ${initVersionId}`);
          }
        } catch (e) {
          console.warn(`[Capture] ⚠️ 解析 Init 接口失败`);
        }
      }

      // 2️⃣ 监听所有表单配置 JSON 文件（更宽松的匹配）
      // 匹配模式: /form/config/*.json 或 /manufact/release/form/config/*.json
      const isConfigJson = (
        (respUrl.includes('/form/config/') || respUrl.includes('/release/form/config/')) &&
        respUrl.endsWith('.json')
      );

      if (isConfigJson) {
        try {
          console.log(`\n[Capture] 🌐 发现 Config JSON:`);
          console.log(`   URL: ${respUrl}`);

          const responseText = await response.text();
          const jsonData = JSON.parse(responseText);

          // 检查内容特征
          const hasDataModels = !!(jsonData.dataModels || jsonData.dataModel || jsonData.models);
          const hasAuth = !!(jsonData.auth && Array.isArray(jsonData.auth) && jsonData.auth.length > 0);
          const hasLang = !!jsonData.lang;

          // 提取文件名中的 ID（用于与 versionId 匹配）
          const urlParts = respUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const configIdFromUrl = fileName.replace('.json', '');

          console.log(`   📋 Config ID (从URL): ${configIdFromUrl}`);
          console.log(`   📊 内容特征:`);
          console.log(`      - dataModels: ${hasDataModels ? '✅ 有' : '❌ 无'}`);
          console.log(`      - auth:       ${hasAuth ? '✅ 有' : '❌ 无'} (${Array.isArray(jsonData.auth) ? jsonData.auth.length : 0} 条目)`);
          console.log(`      - lang:       ${hasLang ? '✅ 有' : '❌ 无'}`);
          console.log(`   📦 数据大小: ${(responseText.length / 1024).toFixed(1)} KB`);

          // 记录所有配置响应
          allConfigResponses.push({
            url: respUrl,
            data: jsonData,
            hasDataModels,
            hasAuth,
            hasLang,
          });

          // 判断是否为"正确的"表单配置
          const isMatchedByVersionId = initVersionId && (
            respUrl.includes(initVersionId) ||
            configIdFromUrl === initVersionId ||
            configIdFromUrl.startsWith(initVersionId)
          );

          const isFullConfig = hasDataModels && hasAuth && hasLang;

          if (isMatchedByVersionId) {
            console.log(`   🎯 ✅ 与 Version ID 匹配！使用此配置`);
            capturedResponse = jsonData;
            requestHandled = true;
          } else if (isFullConfig && !capturedResponse) {
            console.log(`   ✅ 完整的表单配置（含 dataModels + auth + lang）`);
            console.log(`      ℹ️ 如果有多个完整配置，优先使用匹配 versionId 的`);

            // 如果还没有找到匹配的，先用这个完整的
            if (!requestHandled) {
              capturedResponse = jsonData;
              // 不立即标记 handled，等待看是否有更好的匹配
            }
          } else if (hasDataModels && !capturedResponse) {
            console.log(`   ⚠️ 只有 dataModels，缺少 auth 或 lang`);
            
            // 兜底：如果只有 dataModels 也先保存
            if (!requestHandled) {
              capturedResponse = jsonData;
            }
          } else {
            console.log(`   ❌ 此配置不完整，跳过`);
            console.log(`      包含的键:`, Object.keys(jsonData).slice(0, 8));
          }
        } catch (e) {
          console.error(`[Capture] ❌ 解析失败:`, e);
        }
      }
    });

    // 导航到页面
    console.log(`\n🚀 导航到目标页面...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });

    // 等待所有配置加载完成
    console.log(`⏳ 等待配置加载（最多 ${timeout/1000}s）...\n`);

    const startTime = Date.now();
    let lastLogTime = 0;

    while ((Date.now() - startTime) < timeout) {
      await page.waitForTimeout(500);
      const elapsed = Date.now() - startTime;

      // 每 5 秒输出一次状态
      if (elapsed - lastLogTime > 5000) {
        lastLogTime = elapsed;
        console.log(`[Capture] ⏱️  已等待 ${(elapsed/1000).toFixed(1)}s, 捕获到 ${allConfigResponses.length} 个 Config JSON`);
        if (initVersionId) {
          console.log(`[Capture] 🎯 Version ID: ${initVersionId}`);
        }
        if (capturedResponse) {
          console.log(`[Capture] ✅ 已找到候选配置，继续等待看是否有更好的...`);
        }
      }

      // 如果已经通过 versionId 匹配到了，可以提前结束
      if (requestHandled && initVersionId) {
        // 再等一下确保没有其他配置
        await page.waitForTimeout(2000);
        break;
      }
    }

    // 最终选择最佳配置
    if (!capturedResponse && allConfigResponses.length > 0) {
      // 如果还没有选择，从所有捕获的配置中选择最好的
      console.log(`\n[Capture] 📋 从 ${allConfigResponses.length} 个候选中选择最佳配置:\n`);

      // 排序优先级：有 auth + lang > 有 auth > 有 dataModels
      const sorted = allConfigResponses.sort((a, b) => {
        const scoreA = (a.hasAuth ? 2 : 0) + (a.hasLang ? 1 : 0) + (a.hasDataModels ? 4 : 0);
        const scoreB = (b.hasAuth ? 2 : 0) + (b.hasLang ? 1 : 0) + (b.hasDataModels ? 4 : 0);
        return scoreB - scoreA;
      });

      for (let i = 0; i < sorted.length; i++) {
        const candidate = sorted[i];
        console.log(`   [${i + 1}] ${candidate.url.split('/').pop()}`);
        console.log(`       dataModels: ${candidate.hasDataModels ? '✅' : '❌'} | auth: ${candidate.hasAuth ? '✅' : '❌'} | lang: ${candidate.hasLang ? '✅' : '❌'}`);
      }

      capturedResponse = sorted[0].data;
      requestHandled = true;
      console.log(`\n[Capture] ✅ 选择最佳配置: #1 (得分最高)\n`);
    }

    if (!requestHandled || !capturedResponse) {
      // 输出调试信息
      console.error(`\n[Capture] ❌ 未捕获到有效的表单配置`);
      console.error(`[Capture] 调试信息:`);
      console.error(`   - Version ID: ${initVersionId || '未获取到'}`);
      console.error(`   - 捕获到的 Config 数量: ${allConfigResponses.length}`);

      if (allConfigResponses.length === 0) {
        console.error(`   - 未发现任何 /form/config/*.json 请求`);
        console.error(`   - 可能原因: URL 错误、网络问题、或页面结构变化`);
      } else {
        for (const resp of allConfigResponses) {
          console.error(`   - 发现: ${resp.url} (dataModels: ${resp.hasDataModels}, auth: ${resp.hasAuth})`);
        }
      }

      throw new Error(`在 ${timeout/1000}s 内未捕获到包含 dataModels 的表单配置`);
    }

    // 构建输出对象
    const rawLang = capturedResponse.lang;
    let i18nCount = 0;
    if (rawLang) {
      try {
        const parsedLang = typeof rawLang === 'string' ? JSON.parse(rawLang) : rawLang;
        i18nCount = Object.keys(parsedLang).length;
      } catch (e) {
        // 忽略
      }
    }

    const result: CapturedConfig = {
      timestamp: new Date().toISOString(),
      url: url,
      formId: capturedResponse.dataModels?.[0]?.fdId,
      formName: capturedResponse.dataModels?.[0]?.fdTableName,
      versionId: initVersionId || undefined,
      configData: capturedResponse,
      metadata: {
        dataSize: JSON.stringify(capturedResponse).length,
        dataModelsCount: (capturedResponse.dataModels || []).length,
        authEntriesCount: (capturedResponse.auth || []).length,
        i18nEntriesCount: i18nCount,
        capturedAt: new Date().toISOString(),
        totalConfigResponses: allConfigResponses.length,
      },
    };

    // 保存到文件（使用 source- 前缀，与环境相关的 schemas 目录一致）
    const safeFormName = (result.formName || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `source-${safeFormName}.json`;
    const outputPath = path.join(finalOutputDir, filename);

    // 检查文件是否已存在
    if (fs.existsSync(outputPath)) {
      console.log(`⚠️ 文件已存在: ${filename}`);
      console.log(`   将覆盖现有文件\n`);
    }

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

    console.log(`\n═══════════════════════════════════════════════════════`);
    console.log(`  ✅ 捕获成功！`);
    console.log(`═══════════════════════════════════════════════════════\n`);

    console.log(`📁 保存路径: ${outputPath}`);
    console.log(`📊 数据统计:`);
    if (result.versionId) {
      console.log(`   🎯 Version ID: ${result.versionId}`);
    }
    console.log(`   🌐 捕获到的 Config JSON: ${result.metadata.totalConfigResponses} 个`);
    console.log(`   文件大小: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
    console.log(`   DataModels: ${result.metadata.dataModelsCount} 个`);
    console.log(`   Auth 条目: ${result.metadata.authEntriesCount} 个`);
    console.log(`   I18n 条目: ${result.metadata.i18nEntriesCount} 个\n`);

    return result;

  } finally {
    if (browser) {
      await browser.close();
      console.log(`🔒 浏览器已关闭`);
    }
  }
}

// ─── CLI 参数解析 ────────────────────────────────────────

function parseArgs(): CaptureOptions {
  const args = process.argv.slice(2);

  const options: CaptureOptions = {
    url: '',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--url=')) {
      options.url = arg.substring(6);
    } else if (arg.startsWith('--output-dir=') || arg.startsWith('--output=')) {
      options.outputDir = arg.substring(arg.indexOf('=') + 1);
    } else if (arg.startsWith('--timeout=')) {
      options.timeout = parseInt(arg.substring(10), 10);
    } else if (arg.startsWith('--session-file=')) {
      options.sessionFile = arg.substring(arg.indexOf('=') + 1);
    } else if (arg === '--headed') {
      options.headed = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
📡 Config 捕获工具 - 用法:

  npx ts-node scripts/capture-config.ts --url="<URL>" [选项]

选项:
  --url=<URL>           目标表单 URL（必填）
  --output-dir=<dir>    自定义输出目录（可选，默认自动检测环境）
  --timeout=<ms>        超时时间毫秒（默认: 60000）
  --headed              显示浏览器窗口（默认: 无头模式）
  --session-file=<path> 认证 Session 文件路径（可选，默认自动检测）
  --help                显示帮助信息

输出规则:
  - 文件名格式: source-{formName}.json
  - 输出目录: 根据URL自动识别环境
    * Securemetric CRM (172.18.114.231) → src/schemas/Securemetric-CRM/base/securemetric-crm/
    * EasyCraft Test → src/schemas/test/
    * SP3Test → src/schemas/sp3test/
    * 其他 → ./captured/

示例:
  # 基本用法（自动检测环境和 session）
  npx ts-node scripts/capture-config.ts \\
    --url="http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/xxx"

  # 使用认证 Session + 显示浏览器
  npx ts-node scripts/capture-config.ts \\
    --url="http://172.18.114.231:8088/..." \\
    --session-file="./auth/auth-securemetric-crm.json" \\
    --headed

  # 自定义输出目录
  npx ts-node scripts/capture-config.ts \\
    --url="..." \\
    --output-dir="./my-captures"
`);
      process.exit(0);
    }
  }

  if (!options.url) {
    console.error(`❌ 错误: 必须提供 --url 参数`);
    console.error(`使用 --help 查看帮助信息`);
    process.exit(1);
  }

  return options;
}

// ─── 主程序 ────────────────────────────────────────────

async function main() {
  try {
    const options = parseArgs();
    await captureConfig(options);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ 捕获失败:`, errorMessage);
    process.exit(1);
  }
}

main();
