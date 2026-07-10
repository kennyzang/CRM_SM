/**
 * KM-LTC 线索新建测试 (EasyCraft test 环境)
 *
 * 测试目标: https://test.easycraft.ai/web/#/current/sys-modeling/app/km-ltc/add/1htdn56g4w5ew3qpn9w24s4lj72d31qpk2we
 * 表单模型ID: mk_ltc_lead
 * 环境: EasyCraft test
 *
 * 启动命令:
 *   npm run test:test -- --grep "线索新建"
 *   npm run test:test -- tests/test/km-ltc-lead.spec.ts
 *
 * 填充字段:
 *   - 线索名称/Lead Name（硬件类商机名称，有意义）
 *   - Customer（随机选择老客户，fd_existing_customer）
 *   - 销售线索详情/Details
 *   - Source、Lead Level、Deal Category（cfg 必填）
 *   - 明细表-产品（产品+预估金额，2行）
 */
import { test } from '@playwright/test';
import { FormTestBuilder } from '../../src/core/FormTestBuilder';

// ⚠️ 关键：使用表名作为 formId（与 MKXFORM 组件注册一致）
const FORM_ID = 'mk_ltc_lead';
const FORM_NAME = 'mk_ltc_lead';
const FORM_URL = 'https://test.easycraft.ai/web/#/current/sys-modeling/app/km-ltc/add/1htdn56g4w5ew3qpn9w24s4lj72d31qpk2we';
const DETAIL_TABLE_PRODUCT_ID = 'mk_Principal_Allocation_list';

// 硬件类商机名称列表（有意义、不重复）
const HARDWARE_LEAD_NAMES = [
  'Cisco Catalyst 9300 Network Upgrade Project',
  'HP ProLiant DL380 Server Deployment',
  'Fortinet FortiGate Enterprise Firewall Rollout',
  'Aruba Wi-Fi 6 Campus Network Expansion',
  'Dell PowerEdge R750 Data Center Refresh',
  'Palo Alto NGFW Branch Office Security',
  'Juniper EX4300 Core Switch Replacement',
  'Lenovo ThinkSystem Storage Upgrade',
];

test.describe('KM-LTC 线索新建', () => {
  test('新建线索（主表 + 2行产品明细）', async ({ page }) => {
    const builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: '../src/schemas',
      detailTables: [
        { detailModelId: DETAIL_TABLE_PRODUCT_ID, detailTableName: 'Principal Allocation' },
      ],
    });

    await builder.initialize();
    await builder.navigate();

    // ════════════════════════════════════
    // 填充主表必填字段
    // ════════════════════════════════════

    // 1. 线索名称/Lead Name (必填) - 硬件类商机名称
    const leadName = HARDWARE_LEAD_NAMES[Math.floor(Math.random() * HARDWARE_LEAD_NAMES.length)];
    await builder.fillField('fd_name', leadName);
    console.log('[Test] ✅ Lead Name (fd_name):', leadName);

    // 2. 销售线索详情/Details (必填) - textarea
    const remark = `Hardware infrastructure opportunity for enterprise client. Scope includes procurement, installation, and support services. Estimated timeline: Q${Math.ceil(Math.random() * 4)} ${new Date().getFullYear() + 1}. Budget pre-approved by IT steering committee.`;
    await builder.fillField('fd_remark', remark);
    console.log('[Test] ✅ Details (fd_remark):', remark.substring(0, 60) + '...');

    // 3. 客户类型 - 选择 "Existing Customer"（fd_customer_name radio，默认已选）
    await builder.fillField('fd_customer_name', 'Existing Customer');
    console.log('[Test] ✅ Customer type: Existing Customer');

    // 4. Customer (relation 类型) - 随机选择老客户
    await builder.fillField('fd_existing_customer', null);
    console.log('[Test] ✅ Customer (fd_existing_customer): 随机选择');

    // 5. Source (必填) - cfg 类型
    await builder.fillField('fd_source', null);
    console.log('[Test] ✅ Source (fd_source): 随机选取');

    // 6. Lead Level (必填) - cfg 类型
    await builder.fillField('fd_lead_level', null);
    console.log('[Test] ✅ Lead Level (fd_lead_level): 随机选取');

    // 7. Deal Category (必填) - cfg 类型
    await builder.fillField('fd_deal_category', null);
    console.log('[Test] ✅ Deal Category (fd_deal_category): 随机选取');

    // 8. Sales Pipeline (必填) - dynamic singlist
    await builder.fillField('fd_lead_stage', null);
    console.log('[Test] ✅ Sales Pipeline (fd_lead_stage): 随机选取');

    // 9. Lead Queue (必填) - dynamic singlist
    await builder.fillField('fd_leads_pool', null);
    console.log('[Test] ✅ Lead Queue (fd_leads_pool): 随机选取');

    // 等待主表填充稳定，让 form rule 有时间触发（显示产品明细表）
    await page.waitForTimeout(5000);

    // ════════════════════════════════════
    // 填充明细表-产品（2行：产品+预估金额）
    // ════════════════════════════════════

    const productRows = [
      {
        [`${DETAIL_TABLE_PRODUCT_ID}.fd_product_list`]: '__AUTO__',
        [`${DETAIL_TABLE_PRODUCT_ID}.fd_prodcut_amt`]: (Math.random() * 100000 + 10000).toFixed(2),
      },
      {
        [`${DETAIL_TABLE_PRODUCT_ID}.fd_product_list`]: '__AUTO__',
        [`${DETAIL_TABLE_PRODUCT_ID}.fd_prodcut_amt`]: (Math.random() * 100000 + 10000).toFixed(2),
      },
    ];

    console.log('\n📋 明细表-产品 数据:');
    productRows.forEach((row, i) => {
      console.log(`   行${i + 1}: 产品=AUTO, 预估金额=${row[`${DETAIL_TABLE_PRODUCT_ID}.fd_prodcut_amt`]}`);
    });

    await builder.fillDetailTableWithData(productRows, DETAIL_TABLE_PRODUCT_ID);

    await page.waitForTimeout(1000);

    // 截图验证填充结果
    await page.screenshot({
      path: 'test-results/screenshots/km-ltc-lead-filled.png',
      fullPage: true,
    });
    console.log('[Test] 📸 截图已保存');

    // 提交表单
    console.log('\n[Test] 🚀 提交表单...');
    await builder.submit();

    console.log('[Test] ✅ 测试完成');
  });
});
