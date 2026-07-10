/**
 * 🤖 AI Agent 全自动探索模式演示
 *
 * 测试目标: 任意 EasyCraft/SP3Test 表单 URL
 * 环境: SP3Test / EasyCraft test（自动检测）
 *
 * 启动命令:
 *   npm run test:sp3test -- tests/sp3test/ai-agent-demo.spec.ts --headed
 *   npm run test:test -- tests/test/ai-agent-demo.spec.ts --headed
 *
 * 💡 核心特性：
 *   - 用户只需提供表单 URL，无需手动配置 formId/formName
 *   - AI 自动从 API 提取真实的表单模型 ID（mk_model_xxx）
 *   - 自动探查所有字段（主表 + 明细表）
 *   - Schema 自动保存为标准格式（mk_model_xxx.json）
 *
 * 📊 探索报告包含：
 *   - 真实的表单模型 ID
 *   - 字段总数和必填字段数
 *   - 字段类型分布
 *   - 明细表信息
 */
import { test, expect } from '@playwright/test';
import { FormTestBuilder } from '../../src/core/FormTestBuilder';

// 🔗 在这里粘贴你要测试的表单 URL
const TEST_URLS = [
  'https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/xoex/add/1j8mp363lw7o2w1cj6w310l96c2fasdj63w0',
];

test.describe('🤖 AI Agent — 完全自动化探索', () => {

  for (let i = 0; i < TEST_URLS.length; i++) {
    const url = TEST_URLS[i];

    test(`自动探索表单 #${i + 1}: ${url.split('/app/')[1]?.split('/')[0] || 'unknown'}`, async ({ page }) => {
      console.log('\n' + '='.repeat(80));
      console.log(`🚀 开始 AI 自动化测试 #${i + 1}`);
      console.log('='.repeat(80) + '\n');

      // ════════════════════════════════════
      // 🎯 步骤 1: AI 自动探索（只需提供 URL！）
      // ════════════════════════════════════
      const builder = await FormTestBuilder.fromUrl(page, url, {
        schemaPath: './src/schemas/sp3test',
        forceRegenerate: true,
        schemaMaxAgeHours: 0,
      });

      // 获取探索结果
      const schema = builder.getSchema();
      expect(schema).not.toBeNull();

      const safeSchema = schema!;

      console.log('\n📋 表单结构概览:');
      console.log(`   模型ID: ${safeSchema.formId}`);
      console.log(`   表单名称: ${safeSchema.formName}`);
      console.log(`   主表字段数: ${safeSchema.fields.length}`);

      if (safeSchema.detailTables && safeSchema.detailTables.length > 0) {
        console.log(`   明细表数量: ${safeSchema.detailTables.length}`);
        safeSchema.detailTables.forEach((dt, idx) => {
          console.log(`     [${idx + 1}] ${dt.detailModelId} (${dt.fields?.length || 0} 个字段)`);
        });
      }

      // ════════════════════════════════════
      // 🎯 步骤 2: 导航到表单
      // ════════════════════════════════════
      await builder.navigate();
      console.log('✅ 已导航到表单页面');

      // ════════════════════════════════════
      // 🎯 步骤 3: 自动填充所有字段
      // ════════════════════════════════════
      console.log('\n⏳ 开始自动填充字段...');
      await builder.fillAllFields();
      console.log('✅ 所有字段填充完成');

      // 如果有明细表，也填充
      if (safeSchema.detailTables && safeSchema.detailTables.length > 0) {
        console.log('\n⏳ 填充明细表...');
        for (const dt of safeSchema.detailTables) {
          try {
            await builder.fillDetailTable(1, dt.detailModelId);
            console.log(`  ✅ 明细表 ${dt.detailModelId} 已填充 1 行`);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.warn(`  ⚠️ 明细表 ${dt.detailModelId} 填充跳过:`, errorMessage);
          }
        }
      }

      // ════════════════════════════════════
      // 🎯 步骤 4: 提交表单
      // ════════════════════════════════════
      console.log('\n⏳ 准备提交表单...');
      const submitSuccess = await builder.submit();

      if (submitSuccess) {
        console.log('✅ 表单提交成功！');
      } else {
        console.warn('⚠️ 表单提交可能失败（请检查截图）');
      }

      console.log('\n' + '='.repeat(80));
      console.log('🎉 AI 自动化测试完成！');
      console.log('='.repeat(80) + '\n');
    });
  }
});

/**
 * 📊 仅探索模式（不填充和提交）
 *
 * 用于快速了解表单结构，生成报告
 */
test('🔍 AI 快速探索报告', async ({ page }) => {
  const url = TEST_URLS[0];

  console.log('\n📊 生成表单结构报告...\n');

  const report = await FormTestBuilder.exploreAndReport(page, url);

  console.log('╔══════════════════════════════════════════════╗');
  console.log('║       🤖 AI Explorer Report                  ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║ Form ID:        ${report.formId.padEnd(30)} ║`);
  console.log(`║ Form Name:      ${report.formName.padEnd(30)} ║`);
  console.log(`║ Total Fields:   ${String(report.fieldCount).padEnd(30)} ║`);
  console.log(`║ Required:       ${String(report.requiredFieldCount).padEnd(30)} ║`);
  console.log(`║ Detail Tables:  ${String(report.detailTableCount).padEnd(30)} ║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║ Field Type Distribution:                      ║');
  Object.entries(report.fieldTypes).forEach(([type, count]) => {
    console.log(`║   • ${type.padEnd(20)} ${String(count).padEnd(5)}           ║`);
  });
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║ Sample Fields (Top 10):                       ║');
  report.sampleFields.slice(0, 10).forEach((field, i) => {
    const required = field.required ? '✓' : ' ';
    console.log(`║ ${String(i + 1).padStart(2)}. ${field.id.padEnd(25)} ${field.type.padEnd(15)} [${required}]  ║`);
  });
  console.log('╚══════════════════════════════════════════════╝\n');

  expect(report.formId).toBeTruthy();
  expect(report.fieldCount).toBeGreaterThan(0);
});
