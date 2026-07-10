/**
 * Securemetric CRM — 新建商机测试（Edward 账号）
 *
 * 测试目标:
 *   http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1i02ls02kw5jw69bw36pppvh884viq1fciw1?lbpmTemplateId=1i0aaofkow4uw5ecpw295jcfe1h88ca3t5w1
 *
 * 表单ID: mk_km_ltc_business (AI Agent 自动提取的真实模型 ID)
 * 明细表ID:
 *   - mk_km_ltc_business_d_6a978 (Principal Allocation / 商机明细)
 *   - mk_km_ltc_business_contact (Contact Person)
 *
 * 环境: Securemetric CRM (内网模式)
 *
 * 启动命令:
 *   # 基础命令（创建 1 个商机）
 *   CRM_USER=edward npx playwright test --config=config/playwright.securemetric-crm.config.ts tests/Securemetric-CRM/base/crm-opportunity.spec.ts --headed
 *
 *   # 批量创建（使用 --repeat-each 参数）
 *   CRM_USER=edward npx playwright test --config=config/playwright.securemetric-crm.config.ts tests/Securemetric-CRM/base/crm-opportunity.spec.ts --repeat-each 2
 *   CRM_USER=edward npx playwright test --config=config/playwright.securemetric-crm.config.ts tests/Securemetric-CRM/base/crm-opportunity.spec.ts --repeat-each 5
 *
 *   # 无头模式 + 批量（CI/CD 推荐）
 *   CRM_USER=edward HEADLESS=true npx playwright test --config=config/playwright.securemetric-crm.config.ts tests/Securemetric-CRM/base/crm-opportunity.spec.ts --repeat-each 10
 *
 * 📋 主表字段（Basic Information）— 只填截图红框标记的字段：
 *   1. ✅ 商机名称 (fd_name) - 单行文本 [必填]
 *   2. ✅ 客户名称 (fd_account_id) - 业务关联 [必填] → RelationFiller 随机选择
 *   3. ✅ 结单日期 (fd_close_date) - 日期选择 [必填]
 *   4. ✅ 交易类别 (fd_DealCategory) - 动态控件 Deal Category [必填]
 *   5. ✅ Contacts (fd_contacts) - 业务关联 [必填] → RelationFiller 随机选择
 *
 *   ❌ 不需要填的字段：
 *   - 商机状态 (fd_sales_status) - 保持默认
 *   - Currency (fd_currency) - 保持默认 MYR
 *   - 实体 (fd_entity) - 保持默认
 *   - 归属部门 (fd_data_own_department) - 已有默认值 SMMY
 *   - 赢率 (fd_probability) - 保持默认 25%
 *   - 负责人 (fd_owner_people) - 已有默认值 Edward
 *
 * 📋 明细表 #1：Principal Allocation — 只填截图标记的字段：
 *   1. ✅ 产品 (fd_product_list) - 动态控件 singlist [必填]
 *   2. ✅ 预估金额 (fd_prodcut_amt) - 金额 [必填]
 *
 *   ❌ 不需要填的字段：
 *   - Service Period (fd_service_period)
 *   - 供应商 (fd_product_principal)
 *   - 数量 (fd_product_quantity)
 */
import { test } from '@playwright/test';
import { FormTestBuilder } from '../../../src/core/FormTestBuilder';
import {
  generateHardwareBusinessOpportunity,
} from '../../../src/mock/MalaysiaMockData';

const FORM_ID = 'mk_km_ltc_business';
const FORM_NAME = 'CRM商机_Securemetric';
const FORM_URL =
  'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1i02ls02kw5jw69bw36pppvh884viq1fciw1?lbpmTemplateId=1i0aaofkow4uw5ecpw295jcfe1h88ca3t5w1';

const DETAIL_TABLE_OPPORTUNITY = 'mk_km_ltc_business_d_6a978'; // Principal Allocation / 商机明细

test.describe('Securemetric CRM — 新建商机（Edward 账号）', () => {
  let builder: FormTestBuilder;

  test.beforeEach(async ({ page }) => {
    builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: './src/schemas/Securemetric-CRM/base',
      forceRegenerate: true,
      schemaMaxAgeHours: 0,
      detailTables: [
        { detailModelId: DETAIL_TABLE_OPPORTUNITY, detailTableName: 'Principal Allocation' },
      ],
    });

    await builder.initialize();
  });

  test('使用硬件类数据新建商机（只填截图标记字段 + relation 随机填充）', async ({ page }) => {
    await builder.navigate();

    const schema = builder.getSchema();
    console.log('[Test] Schema loaded:', schema?.formId);
    console.log('[Test] Main fields count:', schema?.fields?.length);

    // ════════════════════════════════════
    // 1️⃣ 填充主表字段（只填截图红框标记的 5 个字段）
    // ════════════════════════════════════

    // ① 商机名称 (fd_name) - 必填，硬件类随机名称
    const opportunityName = generateHardwareBusinessOpportunity();
    console.log('[Test] ① Opportunity Name:', opportunityName);
    await builder.fillField('fd_name', opportunityName);

    // ② 客户名称 (fd_account_id) - 必填，业务关联 → RelationFiller 自动随机选择
    console.log('[Test] ② 客户名称 (fd_account_id)...');
    await builder.fillField('fd_account_id');

    // ③ 结单日期 (fd_close_date) - 必填，自动填充未来日期
    console.log('[Test] ③ 结单日期...');
    await builder.fillField('fd_close_date');

    // ④ 交易类别 (fd_DealCategory) - 必填，动态控件 Deal Category
    console.log('[Test] ④ 交易类别 (fd_DealCategory)...');
    await builder.fillField('fd_DealCategory');

    // ⑤ Contacts (fd_contacts) - 必填，业务关联 → RelationFiller 自动随机选择
    console.log('[Test] ⑤ Contacts (fd_contacts)...');
    await builder.fillField('fd_contacts');

    // 等待主表填充稳定
    await page.waitForTimeout(2000);

    // ════════════════════════════════════
    // 2️⃣ 填充明细表 #1：Principal Allocation（只填产品 + 预估金额）
    // ════════════════════════════════════
    console.log('\n[Test] ═══ 填充 Principal Allocation 明细表（仅产品+预估金额） ═══');

    const productRows = [
      {
        [`${DETAIL_TABLE_OPPORTUNITY}.fd_product_list`]: '__AUTO__',  // ← 参考 crm-lead.spec.ts 使用 __AUTO__
        [`${DETAIL_TABLE_OPPORTUNITY}.fd_prodcut_amt`]: (Math.random() * 100000 + 10000).toFixed(2),
      },
      {
        [`${DETAIL_TABLE_OPPORTUNITY}.fd_product_list`]: '__AUTO__',
        [`${DETAIL_TABLE_OPPORTUNITY}.fd_prodcut_amt`]: (Math.random() * 100000 + 10000).toFixed(2),
      },
    ];

    console.log('[Test] 生成', productRows.length, '行 Principal Allocation 数据');
    productRows.forEach((row, i) => {
      console.log(`\n[Test] 📝 第 ${i + 1} 行:`);
      console.log(`   - 产品: AUTO（自动随机选择）`);
      console.log(`   - 预估金额: ${row[`${DETAIL_TABLE_OPPORTUNITY}.fd_prodcut_amt`]}`);
    });

    try {
      await builder.fillDetailTableWithData(productRows, DETAIL_TABLE_OPPORTUNITY);
      console.log('[Test] ✅ Principal Allocation 明细表填充完成');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error('[Test] ❌ Principal Allocation 填充失败:', errorMessage);
      throw e;
    }

    await page.waitForTimeout(2000);

    // ════════════════════════════════════
    // 3️⃣ 提交表单
    // ════════════════════════════════════
    console.log('\n[Test] ═══ 提交表单 ═══');
    const submitSuccess = await builder.submit();

    if (submitSuccess) {
      console.log('[Test] 🎉 新建商机提交成功！');
    } else {
      console.warn('[Test] ⚠️ 表单提交可能未完全成功（请检查页面状态）');
    }

    console.log('\n[Test] ═══ 测试完成 ═══');
  });
});
