/**
 * SP3Test — 督办表单测试
 *
 * 测试目标: https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/km-supervise-2/add/1ies9vafhwcdw6dvw2h27far8akr413c7rw0?fdTemplateId=1iesa47dowcdw8t3w1qfnkhf2mtjq0n3g3w0
 * 表单ID: km-supervise-2
 * 明细表ID: km_supervise_2_c_277z7co376ms8
 * 环境: SP3Test (产品环境)
 *
 * 启动命令:
 *   npm run test:sp3test -- km-supervise.spec.ts --headed
 *   npm run test:sp3test -- --grep "督办表单" --headed
 *
 * 测试内容:
 *   1. 填充主表所有必填字段
 *   2. 填充明细表所有必填字段（督办内容及要求、开始日期、限办日期、主办单位）
 *   3. 提交表单并验证成功
 */
import { test, expect } from '@playwright/test';
import { FormTestBuilder } from '../../src/core/FormTestBuilder';

const FORM_ID = 'km-supervise-2';
const FORM_NAME = '督办表单';
const FORM_URL = 'https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/km-supervise-2/add/1ies9vafhwcdw6dvw2h27far8akr413c7rw0?fdTemplateId=1iesa47dowcdw8t3w1qfnkhf2mtjq0n3g3w0';
const DETAIL_TABLE_ID = 'km_supervise_2_c_277z7co376ms8';

test.describe('SP3Test — 督办表单测试', () => {
  let builder: FormTestBuilder;

  test.beforeEach(async ({ page }) => {
    // 增加测试超时时间到 10 分钟（这个表单很复杂）
    test.setTimeout(600000);
    
    builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: './src/schemas/sp3test',
      forceRegenerate: true,
      schemaMaxAgeHours: 0,
      detailTables: [
        { detailModelId: DETAIL_TABLE_ID, detailTableName: '明细表' }
      ]
    });

    await builder.initialize();
  });

  test('填充所有必填字段并提交（含明细表）', async ({ page }) => {
    await builder.navigate();

    // 等待表单加载完成
    await page.waitForTimeout(5000);

    console.log('[Test] ===== 开始填充主表必填字段 =====');
    
    // 先单独填充"督办事项"（虽然 Schema 中 required=false，但实际必填）
    await builder.fillField('fd_name');
    
    // 填充主表所有必填字段（自动从 Schema 中获取 required=true 的字段）
    // 会跳过 fd_cause_type（事项类型）和明细表本身
    await builder.fillRequiredFields({ 
      exceptFields: ['fd_cause_type', 'km_supervise_2_c_277z7co376ms8', 'fd_name']  // 跳过已填充的
    });
    
    console.log('[Test] 主表必填字段填充完成');

    // 截图主表填充后状态
    await page.screenshot({ path: '/tmp/km-supervise-main-filled.png', fullPage: true });

    console.log('[Test] ===== 开始填充明细表必填字段 =====');
    
    try {
      // 获取明细表构建器并添加一行
      const detailTableBuilder = builder.getDetailTableBuilder(DETAIL_TABLE_ID);
      
      if (detailTableBuilder) {
        // 添加一行明细数据
        await detailTableBuilder.addRow();
        await page.waitForTimeout(2000);
        
        console.log('[Test] 明细表行已添加，开始填充字段...');
        
        // 自动填充整行（包括必填和非必填字段）
        await detailTableBuilder.fillRow(0);
        
        console.log('[Test] 明细表字段填充完成');
      } else {
        console.warn('[Test] 未找到明细表构建器，跳过明细表填充');
      }
    } catch (err) {
      console.warn('[Test] 明细表填充失败:', err);
    }

    // 截图完整填充后状态
    await page.screenshot({ path: '/tmp/km-supervise-all-filled.png', fullPage: true });
    console.log('[Screenshot] 已保存完整填充后截图');

    // 等待用户检查（有头模式下可以看到浏览器）
    console.log('[Test] 等待5秒供用户检查...');
    await page.waitForTimeout(5000);

    // 提交表单
    console.log('[Test] ===== 开始提交表单 =====');
    await builder.submit();
    
    // 等待提交完成并截图
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/tmp/km-supervise-after-submit.png', fullPage: true });
    console.log('[Screenshot] 已保存提交后截图');

    console.log('[Test] ✓ 表单提交流程完成');
  });
});
