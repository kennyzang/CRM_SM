/**
 * SP3Test — 业务关联组件（单个控件测试）
 *
 * 测试目标: https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/xoex/add/1jnrn67skwclqw3le8w2f14q7g26r919g3w0
 * 表单ID: mk_model_202605055x9c6
 * 环境: SP3Test（产品环境）
 * 特点: 单个业务关联控件，目标是通过接口获取数据并直接设置值
 *
 * 启动命令:
 *   npm run test:sp3test:relation-single
 *   npm run test:sp3test -- --grep "业务关联组件.*单个"
 *
 * 测试内容: 使用 MKXFORM.setValue 直接设置业务关联字段值，提交表单
 */
import { test, expect } from '@playwright/test';
import { FormTestBuilder } from '../../src/core/FormTestBuilder';

const FORM_ID = 'mk_model_202605055x9c6';
const FORM_NAME = '业务关联组件测试_单个控件';
const FORM_URL = 'https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/xoex/add/1jnrn67skwclqw3le8w2f14q7g26r919g3w0';

test.describe('SP3Test — 业务关联组件（单个控件测试）', () => {
  test('填充表单并提交', async ({ page }) => {
    const builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: './src/schemas/sp3test',
      forceRegenerate: true, // 强制重新生成 Schema，捕获新增的明细表
    });

    await builder.initialize();
    await builder.navigate();
    await builder.fillAllFields();

    console.log('\n✓ 主表字段填充完成');

    // 填充明细表（随机填充2行）
    await builder.fillDetailTable(2);
    console.log('\n✓ 明细表填充完成');

    const submitResult = await builder.submit();

    const url = page.url();
    const hasSuccessMessage = await page.locator('.ele-message-success, .lui-message-success').isVisible().catch(() => false);
    const isSuccess = submitResult || !url.includes('/add/') || hasSuccessMessage;

    expect(isSuccess).toBeTruthy();
    console.log('\n✓ 表单提交成功');
  });
});