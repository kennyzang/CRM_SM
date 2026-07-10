/**
 * KM Test Form — 完整表单测试（主表+明细表）
 *
 * 测试目标: https://test.easycraft.ai/web/#/current/sys-modeling/app/km-test/add/1jn20acsdw8uw1s358w36k7o2lu55oase5w4
 * 表单ID: mk_model_20260425gq4b1
 * 明细表ID: mk_model_20260425gq4b1_d_893m5
 * 环境: EasyCraft test
 *
 * 启动命令:
 *   npm run test:test:base
 *   npm run test:test -- --grep "主表+明细表"
 *
 * 测试内容: 填充主表和明细表并提交保存
 */
import { test } from '@playwright/test';
import { FormTestBuilder } from '../../src/core/FormTestBuilder';

const FORM_ID = 'mk_model_20260425gq4b1';
const FORM_NAME = 'KM Test Form';
const FORM_URL = 'https://test.easycraft.ai/web/#/current/sys-modeling/app/km-test/add/1jn20acsdw8uw1s358w36k7o2lu55oase5w4';
const DETAIL_TABLE_ID = 'mk_model_20260425gq4b1_d_893m5';

test.describe('KM Test Form — 主表+明细表提交保存', () => {
  let builder: FormTestBuilder;

  test.beforeEach(async ({ page }) => {
    builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: '../src/schemas',
      detailTables: [
        { detailModelId: DETAIL_TABLE_ID, detailTableName: 'Detail Table1' }
      ]
    });

    await builder.initialize();
  });

  test('填充主表和明细表并提交', async ({ page }) => {
    await builder.navigate();
    await builder.fillAllFields();
    await builder.submit();
  });
});
