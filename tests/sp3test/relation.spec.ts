/**
 * SP3Test — 业务关联组件测试表单
 *
 * 测试目标: https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/xoex/add/1jnbk06f8wcgjw5rs6w32aga6n3ce5r1n1w0
 * 表单ID: mk_model_20260429x2lu0
 * 环境: SP3Test（产品环境）
 * 特点: 主表含所有渲染模式的业务关联组件 + 明细表含业务关联组件
 *
 * 启动命令:
 *   npm run test:sp3test:relation
 *   npm run test:sp3test -- --grep "业务关联"
 *
 * 如果表单结构变更（新增明细表等），请删除 schemas/sp3test/mk_model_20260429x2lu0.json
 * 后重新运行，initialize() 会自动重新生成 Schema。
 */
import { test, expect } from '@playwright/test';
import { FormTestBuilder } from '../../src/core/FormTestBuilder';
import { DetailTableBuilder } from '../../src/core/DetailTableBuilder';

const FORM_ID = 'mk_model_20260429x2lu0';
const FORM_NAME = '业务关联组件测试';
const FORM_URL = 'https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/xoex/add/1jnbk06f8wcgjw5rs6w32aga6n3ce5r1n1w0';
const DETAIL_MODEL_ID = 'mk_model_20260429x2lu0_d_ho57y';

// ─── Test Suite ──────────────────────────────────────────────────────────────

test.describe('SP3Test — 业务关联组件测试', () => {
  let builder: FormTestBuilder;

  test.beforeEach(async ({ page }) => {
    builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: './src/schemas/sp3test',
      forceRegenerate: true,
      schemaMaxAgeHours: 0,
      detailTables: [
        { detailModelId: DETAIL_MODEL_ID, detailTableName: '明细表' }
      ]
    });
    await builder.initialize();
  });

  // ── TC-1: Schema 验证 ──────────────────────────────────────────────────────

  test('TC-1: 生成 Schema 并识别所有业务关联组件', async () => {
    const schema = builder.getSchema();
    expect(schema).not.toBeNull();
    expect(schema?.formId).toBe(FORM_ID);
    expect(schema?.fields.length).toBeGreaterThan(0);

    const relationFields = schema!.fields.filter(f =>
      f.fdType === 'relation' || f.fdType === 'relation~multi'
    );

    console.log(`\n=== Schema: ${schema?.formName} ===`);
    console.log(`主表字段 ${schema?.fields.length} 个，业务关联 ${relationFields.length} 个`);
    schema?.fields.forEach(f => {
      const rm = (f as any).renderMode ? ` [${(f as any).renderMode}]` : '';
      console.log(`  ${f.id} (${f.fdType})${rm}: ${f.label} ${f.required ? '*' : ''}`);
    });

    if (schema?.detailTables?.length) {
      console.log(`\n明细表 ${schema.detailTables.length} 个:`);
      schema.detailTables.forEach(dt => {
        const dtRelations = dt.fields.filter(f =>
          f.fdType === 'relation' || f.fdType === 'relation~multi'
        );
        console.log(`  ${dt.detailModelId} (${dt.detailTableName}): ${dt.fields.length} 字段, 业务关联 ${dtRelations.length} 个`);
        dt.fields.forEach(f => console.log(`    - ${f.id} (${f.fdType}): ${f.label}`));
      });
    }

    expect(relationFields.length).toBeGreaterThan(0);
  });

  // ── TC-2: 主表填充（含所有渲染模式的业务关联）──────────────────────────────

  test('TC-2: 填充主表所有字段（含业务关联组件）', async ({ page }) => {
    await builder.navigate();
    await builder.fillAllFields();
    console.log('\n✓ 主表所有字段填充完成（含业务关联组件）');
  });

  // ── TC-3: 主表提交 ────────────────────────────────────────────────────────

  test('TC-3: 填充主表并提交', async ({ page }) => {
    await builder.navigate();
    await builder.fillAllFields();
    
    // 使用 submit 方法的返回值来判断成功
    const submitResult = await builder.submit();
    
    // 综合判断：submit 返回成功 或 URL 变化 或 有成功消息
    const url = page.url();
    const hasSuccessMessage = await page.locator('.ele-message-success, .lui-message-success').isVisible().catch(() => false);
    const isSuccess = 
      submitResult || 
      !url.includes('/add/') || 
      hasSuccessMessage;

    expect(isSuccess).toBeTruthy();
  });

  // ── TC-4: 明细表填充（含业务关联组件）────────────────────────────────────
  // 前置条件：DETAIL_MODEL_ID 已填入，且明细表内包含业务关联字段
  //
  // 业务关联字段在明细表中的填充流程（由 DetailRowFiller.fillRelations 处理）：
  //   1. 扫描行内含 .ele-xform-relation 的 <td>
  //   2. 通过 MKXFORM API 或 DOM 检测 renderMode
  //   3. singlelist/mullist → 弹窗选择（等 /associate/list 接口响应）
  //   4. select/multiSelect → 下拉选择（等 /associate/list 接口响应）
  //   5. radio/checkbox     → 直接点击

  test('TC-4: 填充明细表（含业务关联组件）', async ({ page }) => {
    if (!DETAIL_MODEL_ID) {
      console.warn('[TC-4] DETAIL_MODEL_ID 未配置，跳过明细表测试');
      console.warn('       请删除 Schema 文件后重新运行 TC-1，从生成的 Schema 获取 detailModelId');
      test.skip();
      return;
    }

    await builder.navigate();

    // 填充主表
    await builder.fillAllFields();

    // 填充明细表（使用 DetailTableBuilder 直接操作）
    const dtBuilder = new DetailTableBuilder(page, {
      detailModelId: DETAIL_MODEL_ID,
    });

    const exists = await dtBuilder.exists();
    expect(exists).toBeTruthy();

    await dtBuilder.scrollIntoView();

    // 添加并自动填充 1 行（DetailRowFiller 自动发现 relation 字段）
    await dtBuilder.addAndFillRow();

    console.log('\n✓ 明细表填充完成（含业务关联组件）');
  });

  // ── TC-5: 整体表单提交（主表 + 明细表）────────────────────────────────────

  test('TC-5: 填充主表 + 明细表并提交', async ({ page }) => {
    if (!DETAIL_MODEL_ID) {
      console.warn('[TC-5] DETAIL_MODEL_ID 未配置，跳过');
      test.skip();
      return;
    }

    await builder.navigate();
    await builder.fillAllFields();

    const dtBuilder = new DetailTableBuilder(page, {
      detailModelId: DETAIL_MODEL_ID,
    });

    if (await dtBuilder.exists()) {
      await dtBuilder.scrollIntoView();
      await dtBuilder.addAndFillRow();
    }

    // 使用 submit 方法的返回值来判断成功
    const submitResult = await builder.submit();
    
    // 综合判断：submit 返回成功 或 URL 变化 或 有成功消息
    const url = page.url();
    const hasSuccessMessage = await page.locator('.ele-message-success, .lui-message-success').isVisible().catch(() => false);
    const isSuccess = 
      submitResult || 
      !url.includes('/add/') || 
      hasSuccessMessage;

    expect(isSuccess).toBeTruthy();
  });
});
