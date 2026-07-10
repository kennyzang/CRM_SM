/**
 * 极简明细表测试
 *
 * 测试目标: https://test.easycraft.ai/web/#/current/sys-modeling/app/km-test/add/1jn20acsdw8uw1s358w36k7o2lu55oase5w4
 * 表单ID: mk_model_20260425gq4b1
 * 明细表ID: mk_model_20260425gq4b1_d_893m5
 * 环境: EasyCraft test
 *
 * 启动命令:
 *   npm run test:test -- --grep "极简"
 *   npm run test:test -- --grep "detail-minimal"
 *
 * 测试内容: 只测试主表+明细表提交保存，不关注具体字段填充
 * 临时测试用例，路径: tests/test/detail-minimal.spec.ts
 */
import { test, expect } from '@playwright/test';
import { FormTestBuilder } from '../../src/core/FormTestBuilder';

const FORM_ID = 'mk_model_20260425gq4b1';
const FORM_NAME = 'KM Test Form';
const FORM_URL = 'https://test.easycraft.ai/web/#/current/sys-modeling/app/km-test/add/1jn20acsdw8uw1s358w36k7o2lu55oase5w4';
const DETAIL_TABLE_ID = 'mk_model_20260425gq4b1_d_893m5';

test.describe('极简明细表测试', () => {
  test('主表+明细表提交保存', async ({ page }) => {
    const builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: '../src/schemas',
      detailTables: [
        { detailModelId: DETAIL_TABLE_ID, detailTableName: 'Detail Table1' }
      ]
    });

    await builder.initialize();

    // 打印 schema 信息
    const schema = builder.getSchema();
    console.log('=== Schema Info ===');
    console.log('Main fields:', schema?.fields.map(f => ({ id: f.id, fdType: f.fdType, label: f.label })));
    console.log('Detail tables:', schema?.detailTables?.map(dt => ({
      detailModelId: dt.detailModelId,
      fields: dt.fields.map(f => ({ id: f.id, fdType: f.fdType, label: f.label }))
    })));

    await builder.navigate();

    console.log('[Test] 开始填充...');
    await builder.fillAll(1);  // 主表填充所有 + 明细表添加1行

    console.log('[Test] 提交表单...');
    await builder.submit();

    console.log('[Test] 完成！');
  });
});