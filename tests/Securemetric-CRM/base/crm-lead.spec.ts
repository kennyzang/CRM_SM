/**
 * Securemetric CRM — 新建线索测试
 *
 * 测试目标: http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1htdn56g4w5ew3qpn9w24s4lj72d31qpk2we
 * 表单ID: mk_ltc_lead
 * 明细表ID: mk_Principal_Allocation_list
 * 环境: Securemetric CRM (内网模式)
 *
 * 启动命令:
 *   npx playwright test --config=config/playwright.securemetric-crm.config.ts tests/Securemetric-CRM/base/crm-lead.spec.ts --headed
 *
 * 测试内容:
 *   1. 全自动填充主表（支持新客户/老客户随机选择）
 *   2. 智能客户选择：老客户无数据时自动切换到老客户重试
 *   3. 填充明细表-产品（product + principal，其余字段由系统联动填充）
 *   4. 联系人选择规则：
 *      - 新客户：主表 fd_contacts 选无客户归属的联系人；跳过 Contact Person 明细表
 *      - 老客户：主表 fd_contacts 选当前客户联系人或无客户归属的；Contact Person 明细表同规则
 *   5. 提交并截图
 *
 * 失败处理策略:
 *   - 提交失败且为新客户场景 → 先切换到老客户模式重试
 *   - 老客户也无联系人 → 先执行 crm-contact.spec.ts 新建联系人，再重跑本用例
 */
import { test } from '@playwright/test';
import { FormTestBuilder } from '../../../src/core/FormTestBuilder';
import {
  generateBusinessLeadName,
  generateMalaysiaCustomerData,
  generateMalaysiaCompanyName,
  generateMalaysiaPhone,
  generateMalaysiaEmail,
  generateMalaysiaAddress,
  clearGeneratedCache,
} from '../../../src/mock/MalaysiaMockData';

const FORM_ID = 'mk_ltc_lead';
const FORM_URL =
  'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1htdn56g4w5ew3qpn9w24s4lj72d31qpk2we';
const DETAIL_TABLE_PRODUCT_ID = 'mk_Principal_Allocation_list';

/**
 * 构建并执行一次线索填充+提交流程
 * @param page Playwright page
 * @param useNewCustomer true=新客户, false=老客户
 */
async function runLeadCreation(page: any, useNewCustomer: boolean): Promise<boolean> {
  clearGeneratedCache();

  const leadName = generateBusinessLeadName();
  const remark = `Lead generated for hardware solutions opportunity. Potential deal size: MYR ${(Math.random() * 500000 + 100000).toFixed(2)}.`;
  const customerTypeValue = useNewCustomer ? '2' : '1';

  console.log(`\n[Lead] 线索名称: ${leadName}`);
  console.log(`[Lead] 客户类型: ${useNewCustomer ? '新客户' : '老客户'} (${customerTypeValue})`);

  const builder = new FormTestBuilder(page, {
    formId: FORM_ID,
    formName: FORM_ID,
    url: FORM_URL,
    schemaPath: './src/schemas/Securemetric-CRM/base',
    forceRegenerate: false,
    schemaMaxAgeHours: 24,
    fillRequiredOnly: true,

    fieldOverrides: {
      fd_customer_name: customerTypeValue,
      fd_name: leadName,
      fd_remark: remark,
      fd_entity: '__AUTO__',
      fd_contacts: '__AUTO__',
      fd_tel: generateMalaysiaPhone(),
      fd_email: generateMalaysiaEmail(),
      fd_address: generateMalaysiaAddress(),
      fd_url: `https://www.${generateMalaysiaCompanyName().toLowerCase().replace(/\s+/g, '')}.com.my`,
    },

    fieldDependencies: [
      {
        triggerField: 'fd_customer_name',
        conditions: {
          '2': ['fd_new_customer'],
        },
      },
    ],

    detailTables: [
      { detailModelId: DETAIL_TABLE_PRODUCT_ID, detailTableName: 'Principal Allocation' },
    ],
  });

  await builder.initialize();
  await builder.navigate();

  // 根据客户类型填充客户信息
  if (useNewCustomer) {
    console.log('[Lead] 填充新客户信息...');
    const newCustomer = generateMalaysiaCustomerData();
    await builder.fillField('fd_new_customer', newCustomer.companyName);
    await builder.fillField('fd_registration_code', newCustomer.legalId);
    console.log(`[Lead]   → 客户名称: ${newCustomer.companyName}`);
    console.log(`[Lead]   → 注册码: ${newCustomer.legalId}`);
  } else {
    console.log('[Lead] 老客户模式：RelationFiller 自动选择老客户');
  }

  await builder.fillAllFields();
  await page.waitForTimeout(300);

  // 明细表-产品：只填 fd_product_list 和 fd_product_principal
  // 其余字段（fd_prodcut_amt、fd_sm_s_price、fd_sm_cost 等）已从表单删除，由系统联动填充
  const productRows = [
    {
      [`${DETAIL_TABLE_PRODUCT_ID}.fd_product_list`]: '__AUTO__',
      [`${DETAIL_TABLE_PRODUCT_ID}.fd_product_principal`]: '__AUTO__',
    },
  ];
  await builder.fillDetailTableWithData(productRows, DETAIL_TABLE_PRODUCT_ID);

  // Contact Person 明细表
  // - 新客户：过滤器依赖 fd_existing_customer，无老客户时无数据 → 跳过
  // - 老客户：选当前客户的联系人 或 无客户归属的联系人
  if (!useNewCustomer) {
    try {
      await builder.fillDetailTableWithData(
        [{ 'mk_Contact_Person_list.fd_contact_person': '__AUTO__' }],
        'mk_Contact_Person_list'
      );
      console.log('[Lead] ✅ Contact Person 明细表填充完成');
    } catch (e) {
      console.warn('[Lead] ⚠️ Contact Person 填充失败（老客户无联系人）');
      console.warn('[Lead] 💡 如需数据：先运行 crm-contact.spec.ts 新建联系人，再重跑本用例');
    }
  } else {
    console.log('[Lead] ℹ️ 新客户场景：跳过 Contact Person 明细表');
  }

  console.log('\n[Lead] 提交表单...');
  const submitSuccess = await builder.submit();

  // 提交失败且为新客户时：检测"客户已存在"后修改客户名重试
  if (!submitSuccess && useNewCustomer) {
    const isDuplicateCustomer = await page.evaluate(() => {
      const selectors = ['.ele-message-error', '.lui-message-error', '.el-message--error'];
      const keywords = ['已存在', 'already exists', 'duplicate'];
      for (const sel of selectors) {
        for (const el of Array.from(document.querySelectorAll(sel))) {
          if (keywords.some(kw => (el as Element).textContent?.includes(kw))) return true;
        }
      }
      return false;
    });

    if (isDuplicateCustomer) {
      console.log('[Lead] ⚠️ 客户已存在，修改客户名称后重试...');
      const retryCustomer = generateMalaysiaCustomerData();
      const tsSuffix = Date.now().toString().slice(-4);
      await builder.fillField('fd_new_customer', `${retryCustomer.companyName}-${tsSuffix}`);
      await builder.fillField('fd_registration_code', retryCustomer.legalId);
      await page.waitForTimeout(300);
      return builder.submit();
    }
  }

  return submitSuccess;
}

test.describe('Securemetric CRM — 新建线索测试', () => {
  test('新建线索（智能客户选择 + 明细表联动）', async ({ page }) => {
    // 策略：30% 新客户 / 70% 老客户
    const useNewCustomer = Math.random() < 0.3;

    console.log(`\n[Test] 🚀 开始新建线索，首选: ${useNewCustomer ? '新客户' : '老客户'}`);

    let success = await runLeadCreation(page, useNewCustomer);

    // 新客户失败时：切换老客户重试
    if (!success && useNewCustomer) {
      console.log('\n[Test] ⚠️ 新客户提交失败，切换老客户模式重试...');
      await page.goto(
        'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1htdn56g4w5ew3qpn9w24s4lj72d31qpk2we'
      );
      success = await runLeadCreation(page, false);
    }

    if (!success) {
      throw new Error(
        '线索创建失败。如老客户也无联系人，请先运行 crm-contact.spec.ts 新建联系人后再重跑本用例。'
      );
    }

    console.log('[Test] ✅ 测试完成');
  });
});
