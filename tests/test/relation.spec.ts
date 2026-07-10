/**
 * KM Test — 业务关联组件表单测试
 *
 * 测试目标: https://test.easycraft.ai/web/#/current/sys-modeling/app/km-test/add/1jne09fv4w8uw2g895w136u0rj1jkb2n03w4
 * 表单ID: mk_model_20260430x1w46
 * 表名: 业务关联
 * 环境: test.easycraft.ai
 *
 * 启动命令:
 *   npm run test:test:relation
 *   npm run test:test -- --grep "业务关联"
 *
 * 如果表单结构变更，请删除 schemas/mk_model_20260430x1w46.json 后重新运行，
 * initialize() 会自动重新生成 Schema。
 */
import { test, expect } from '@playwright/test';
import { FormTestBuilder } from '../../src/core/FormTestBuilder';
import { DetailTableBuilder } from '../../src/core/DetailTableBuilder';

const FORM_ID   = 'mk_model_20260430x1w46';
const FORM_NAME = '业务关联';
const FORM_URL  = 'https://test.easycraft.ai/web/#/current/sys-modeling/app/km-test/add/1jne09fv4w8uw2g895w136u0rj1jkb2n03w4';
const SCHEMA_PATH = '../src/schemas/test';

// ─── 明细表配置 ──────────────────────────────────────────────────────────────
// 若表单含明细表，在首次运行 TC-1 生成 Schema 后，从
// schemas/mk_model_20260430x1w46.json 的 detailTables[0].detailModelId 获取，
// 格式：mk_model_20260430x1w46_d_xxxxxx
// 无明细表时留空即可（TC-4/TC-5 会自动跳过）
const DETAIL_MODEL_ID = 'mk_model_20260430x1w46_d_9l2g0';

// ─── Test Suite ──────────────────────────────────────────────────────────────

test.describe('KM Test — 业务关联组件表单', () => {
  let builder: FormTestBuilder;

  test.beforeEach(async ({ page }) => {
    builder = new FormTestBuilder(page, {
      formId:     FORM_ID,
      formName:   FORM_NAME,
      url:        FORM_URL,
      schemaPath: SCHEMA_PATH,
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
    await builder.submit();

    const url = page.url();
    const isSuccess =
      !url.includes('/add/') ||
      (await page.locator('.ele-message-success, .lui-message-success').isVisible().catch(() => false));

    expect(isSuccess).toBeTruthy();
  });

  // ── TC-4: 明细表填充（含业务关联组件）────────────────────────────────────

  test('TC-4: 填充明细表（含业务关联组件）', async ({ page }) => {
    test.setTimeout(300_000); // 主表+明细表业务关联弹窗等待耗时较长
    if (!DETAIL_MODEL_ID) {
      console.warn('[TC-4] DETAIL_MODEL_ID 未配置，跳过明细表测试');
      console.warn('       请删除 Schema 文件后重新运行 TC-1，从生成的 Schema 获取 detailModelId');
      test.skip();
      return;
    }

    await builder.navigate();
    await builder.fillAllFields();

    const dtBuilder = new DetailTableBuilder(page, {
      detailModelId: DETAIL_MODEL_ID,
    });

    const exists = await dtBuilder.exists();
    expect(exists).toBeTruthy();

    await dtBuilder.scrollIntoView();

    // 表单新增页默认有一个空行（index 0），直接填充它即可达到"一行随机填充"的效果；
    // 若无预置行则添加一行再填充。
    const existingRows = await dtBuilder.getRowCount();
    if (existingRows > 0) {
      await dtBuilder.fillRow(0);
    } else {
      await dtBuilder.addAndFillRow();
    }

    console.log('\n✓ 明细表填充完成（含业务关联组件）');
  });

  // ── TC-5: 整体表单提交（主表 + 明细表）────────────────────────────────────

  test('TC-5: 填充主表 + 明细表并提交', async ({ page }) => {
    test.setTimeout(300_000); // 主表+明细表业务关联弹窗等待耗时较长
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

      const existingRows = await dtBuilder.getRowCount();
      if (existingRows > 0) {
        await dtBuilder.fillRow(0);
      } else {
        await dtBuilder.addAndFillRow();
      }
    }

    await builder.submit();

    const url = page.url();
    const isSuccess =
      !url.includes('/add/') ||
      (await page.locator('.ele-message-success, .lui-message-success').isVisible().catch(() => false));

    expect(isSuccess).toBeTruthy();
  });
});
