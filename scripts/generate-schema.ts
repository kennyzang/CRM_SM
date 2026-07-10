/**
 * generate-schema.ts — 通用表单 Schema 生成器
 *
 * 用法:
 *   # SP3Test 环境
 *   npx ts-node scripts/generate-schema.ts --env sp3test --url "https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/xoex/add/xxx"
 *
 *   # EasyCraft test 环境
 *   npx ts-node scripts/generate-schema.ts --env test --url "https://test.easycraft.ai/web/#/current/sys-modeling/app/km-test/add/yyy"
 *
 *   # 使用简写（自动检测环境）
 *   npx ts-node scripts/generate-schema.ts "https://sp3test.landray.com.cn/..."
 *
 * 输出:
 *   - 控制台打印完整字段列表
 *   - Schema 文件保存到 schemas/<env>/<formId>.json
 */

import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { SchemaGenerator } from '../src/schema/SchemaGenerator';
import { getEnvironment, getDefaultAccount, resolveSessionFile } from '../config/environments';

// ─── 参数解析 ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let envName = 'sp3test';
let targetUrl = '';

// 解析参数
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--env' && args[i + 1]) {
    envName = args[++i];
  } else if (args[i].startsWith('http')) {
    targetUrl = args[i];
  }
}

if (!targetUrl) {
  console.error(`
❌ 错误: 请提供表单 URL

用法:
  npx ts-node scripts/generate-schema.ts [选项] <URL>

选项:
  --env <环境名>    指定环境 (sp3test/test, 默认: sp3test)

示例:
  npx ts-node scripts/generate-schema.ts --env sp3test "https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/xoex/add/xxx"
  npx ts-node scripts/generate-schema.ts --env test "https://test.easycraft.ai/web/#/current/sys-modeling/app/km-test/add/yyy"
`);
  process.exit(1);
}

// 从 URL 自动检测环境（如果未指定）
if (envName === 'sp3test' && targetUrl.includes('easycraft.ai')) {
  envName = 'test';
} else if (envName === 'sp3test' && (targetUrl.includes('172.18.114.231') || targetUrl.includes('securemetric'))) {
  envName = 'securemetric-crm';
}

// ─── 主程序 ──────────────────────────────────────────────────────────────

async function main() {
  const ROOT_DIR = path.join(__dirname, '..');
  
  // 获取环境配置
  let env;
  try {
    env = getEnvironment(envName);
  } catch (e) {
    console.error(`❌ 错误: 环境 "${envName}" 不存在`);
    console.error(`   可用环境: sp3test, test, securemetric-crm`);
    process.exit(1);
  }

  const account = getDefaultAccount(env);
  const sessionFile = resolveSessionFile(account, ROOT_DIR);

  // 提取 formId
  const modelId = targetUrl.split('/').pop()?.split('?')[0] || 'unknown';
  
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  📋 Schema 生成器`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  环境: ${env.name} (${envName})`);
  console.log(`  账号: ${account.username}`);
  console.log(`  URL: ${targetUrl}`);
  console.log(`  Model ID: ${modelId}`);
  console.log(`${'═'.repeat(60)}\n`);

  // 启动浏览器
  const browser = await chromium.launch({ headless: true });
  
  let context;
  if (fs.existsSync(sessionFile)) {
    context = await browser.newContext({ storageState: sessionFile });
    console.log(`✅ Session 已加载: ${sessionFile}`);
  } else {
    console.error(`❌ Session 文件不存在: ${sessionFile}`);
    console.error('   请先运行登录测试: npm run test:${envName}:seed');
    await browser.close();
    process.exit(1);
  }

  const page = await context.newPage();
  
  try {
    // 导航到表单
    console.log('\n🌐 正在打开表单...');
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 等待 MKXFORM 加载
    console.log('⏳ 等待 MKXFORM 加载...');
    let mkxformLoaded = false;
    for (let i = 0; i < 30; i++) {
      const exists = await page.evaluate(() => !!(window as any).MKXFORM);
      if (exists) {
        mkxformLoaded = true;
        console.log(`✅ MKXFORM 在 ${(i + 1)}s 后加载完成`);
        break;
      }
      await page.waitForTimeout(1000);
    }

    if (!mkxformLoaded) {
      throw new Error('MKXFORM 未加载（超时 30 秒）');
    }

    // 等待表单完全加载
    console.log('⏳ 等待表单渲染...');
    await page.waitForTimeout(3000);

    // 使用 SchemaGenerator 生成 Schema
    console.log('\n🔍 正在生成 Schema...');
    const generator = new SchemaGenerator(page);
    
    const schema = await generator.generateSchema(
      modelId,
      `${envName}-schema`,
      targetUrl
    );

    // 打印 Schema 信息
    printSchema(schema);

    // 保存 Schema 文件
    const outputPath = path.join(ROOT_DIR, env.schemaPath || './schemas', envName || '');
    await generator.saveSchema(schema, outputPath);
    
    console.log(`\n✅ Schema 已保存到: ${outputPath}/${modelId}.json`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ 生成失败: ${errorMessage}`);
    
    // 截图记录错误状态
    const errorScreenshotPath = path.join(ROOT_DIR, 'tests', 'temp', 'schema-generate-error.png');
    await page.screenshot({ path: errorScreenshotPath, fullPage: true });
    console.error(`📸 错误截图已保存: ${errorScreenshotPath}`);
    
    process.exit(1);
  } finally {
    await browser.close();
    console.log('\n🏁 完成！');
  }
}

// ─── 格式化输出函数 ─────────────────────────────────────────────────────

function printSchema(schema: any): void {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`  📊 主表字段 (${schema.fields?.length || 0} 个)`);
  console.log(`${'─'.repeat(70)}\n`);

  if (schema.fields && schema.fields.length > 0) {
    schema.fields.forEach((field: any, index: number) => {
      const requiredMark = field.required ? ' ★' : '';
      const typeInfo = field.fdType === 'dynamic' 
        ? ` [${field.renderMode?.type || '?'}]` 
        : '';
      
      console.log(
        `  [${String(index + 1).padStart(2)}] ${field.label.padEnd(20)} ${field.id.padEnd(32)}`
      );
      console.log(`       类型: ${field.fdType}${typeInfo}${requiredMark}`);
      
      // 动态控件额外信息
      if (field.fdType === 'dynamic') {
        if (field.options && field.options.length > 0) {
          console.log(`       选项数: ${field.options.length}`);
          if (field.options.length <= 5) {
            field.options.slice(0, 3).forEach((opt: any, i: number) => {
              console.log(`         [${i + 1}] ${opt.fdName || opt.name || JSON.stringify(opt)?.substring(0, 50)}`);
            });
          }
        }
      }
      
      console.log('');
    });
  } else {
    console.log('  ⚠️  未发现主表字段\n');
  }

  // 明细表信息
  if (schema.detailTables && schema.detailTables.length > 0) {
    console.log(`${'─'.repeat(70)}`);
    console.log(`  📋 明细表 (${schema.detailTables.length} 个)`);
    console.log(`${'─'.repeat(70)}\n`);

    schema.detailTables.forEach((dt: any, dtIndex: number) => {
      console.log(`  明细表 #${dtIndex + 1}: ${dt.detailTableName}`);
      console.log(`  Model ID: ${dt.detailModelId}`);
      console.log(`  字段数: ${dt.fields?.length || 0}\n`);
      
      if (dt.fields && dt.fields.length > 0) {
        dt.fields.forEach((field: any, fIndex: number) => {
          const requiredMark = field.required ? ' ★' : '';
          console.log(
            `    [${String(fIndex + 1).padStart(2)}] ${field.label.padEnd(20)} ${field.id.padEnd(32)}`
          );
          console.log(`         类型: ${field.fdType}${requiredMark}\n`);
        });
      }
    });
  } else {
    console.log(`\nℹ️  未发现明细表\n`);
  }

  console.log(`${'═'.repeat(70)}\n`);
}

// ─── 执行 ─────────────────────────────────────────────────────────────────

main().catch((error) => {
  console.error('💥 致命错误:', error);
  process.exit(1);
});
