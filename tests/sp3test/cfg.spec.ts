/**
 * SP3Test — 基础数据控件测试
 *
 * 测试目标: https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/xoex/add/1jneivbl5wchqw2ctrwcoes8f2mpi7c32ow0
 * 表单ID: mk_model_202604300v10z
 * 环境: SP3Test (产品环境)
 *
 * 启动命令:
 *   npm run test:sp3test:cfg
 *   npm run test:sp3test -- --grep "基础数据"
 *
 * 测试内容:
 *   1. 验证 Schema 生成并识别 cfg 字段
 *   2. 自动获取动态选项并填充
 *   3. 填充并提交表单
 */
import { test, expect } from '@playwright/test';
import { FormTestBuilder } from '../../src/core/FormTestBuilder';

const FORM_ID = 'mk_model_202604300v10z';
const FORM_NAME = 'SP3Test-基础数据控件';
const FORM_URL = 'https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/xoex/add/1jneivbl5wchqw2ctrwcoes8f2mpi7c32ow0';
const SCHEMA_PATH = './src/schemas/sp3test';

test.describe('SP3Test — 基础数据(cfg)控件测试', () => {

  test('填充主表所有字段并提交（随机数据）', async ({ page }) => {
    const builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: './src/schemas/sp3test',
      forceRegenerate: true,
      schemaMaxAgeHours: 0
    });

    console.log('[Test] 初始化 FormTestBuilder...');
    await builder.initialize();

    console.log('[Test] 导航到表单页面...');
    await builder.navigate();

    // 等待页面完全加载
    await page.waitForTimeout(2000);

    console.log('[Test] 开始填充主表所有字段...');
    await builder.fillAllFields();

    console.log('[Test] 主表填充完成，准备填充明细表...');

    // 填充明细表
    const detailBuilders = (builder as any).detailBuilders;
    if (detailBuilders && detailBuilders.length > 0) {
      const detailBuilder = detailBuilders[0] as any;
      await detailBuilder.scrollIntoView();
      await detailBuilder.addRow();
      await page.waitForTimeout(2000);

      const rows = await detailBuilder.getRows();
      console.log(`[Test] 明细表行数: ${rows.length}`);
      if (rows.length > 0) {
        console.log('[Test] 开始填充明细表行...');
        await detailBuilder.fillRow(0);
        console.log('[Test] 明细表行填充完成');
      }
    } else {
      console.log('[Test] 没有明细表需要填充');
    }

    console.log('[Test] 明细表填充完成，准备提交...');

    // 提交表单
    console.log('[Test] 调用 submit() 提交表单...');
    await builder.submit();

    console.log('[Test] 表单已提交，等待结果...');
    await page.waitForTimeout(10000);
  });
});
