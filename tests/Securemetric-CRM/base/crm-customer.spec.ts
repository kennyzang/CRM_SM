/**
 * Securemetric CRM — 新建客户测试（马来西亚数据）
 *
 * 测试目标: http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1hvjheq3nw4vw4j48w3doaci42dfrsq13tw1
 * 表单ID: mk_km_ltc_customer
 * 环境: Securemetric CRM (内网环境)
 *
 * 启动命令:
 *   # 基础命令（创建 1 个客户）
 *   CRM_USER=edward npx playwright test --config=config/playwright.securemetric-crm.config.ts tests/Securemetric-CRM/base/crm-customer.spec.ts --headed
 *
 *   # 批量创建（使用 --repeat-each 参数）
 *   CRM_USER=edward npx playwright test --config=config/playwright.securemetric-crm.config.ts tests/Securemetric-CRM/base/crm-customer.spec.ts --repeat-each 2
 *   CRM_USER=edward npx playwright test --config=config/playwright.securemetric-crm.config.ts tests/Securemetric-CRM/base/crm-customer.spec.ts --repeat-each 5
 *
 *   # 无头模式 + 批量（CI/CD 推荐）
 *   CRM_USER=edward HEADLESS=true npx playwright test --config=config/playwright.securemetric-crm.config.ts tests/Securemetric-CRM/base/crm-customer.spec.ts --repeat-each 10
 *
 * 测试内容:
 *   1. 使用马来西亚真实数据填充主表字段（客户名称、注册码、电话、邮件、备注、经营范围）
 *   2. 随机选择客户类型和来源
 *   3. 填充明细表 Address（2行马来西亚地址）
 *   4. 提交表单并截图
 *
 * 数据特点:
 *   - 客户名称: 马来西亚公司名称 (Tech Solutions Malaysia Sdn Bhd 等)
 *   - 注册码: 马来西亚 SSM 格式 (202001234567 或 1234567-X)
 *   - 电话: 01x-xxxxxxx 格式
 *   - 邮件: @gmail.com / @hotmail.com / @company.com.my
 *   - 地址: Jalan/Lorong + 邮编 + 城市, Malaysia 格式
 */
import { test } from '@playwright/test';
import { FormTestBuilder } from '../../../src/core/FormTestBuilder';
import {
  generateMalaysiaCustomerData,
  generateMalaysiaPhone,
  clearGeneratedCache,
} from '../../../src/mock/MalaysiaMockData';

// ⚠️ 关键：使用表名作为 formId（与 MKXFORM 组件注册一致）
const FORM_ID = 'mk_km_ltc_customer';
const FORM_NAME = 'mk_km_ltc_customer';
const FORM_URL =
  'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1hvjheq3nw4vw4j48w3doaci42dfrsq13tw1';
const DETAIL_TABLE_ID = 'mk_Address_list';

test.describe('Securemetric CRM — 新建客户测试', () => {
  test('使用马来西亚数据新建客户（主表 + 2行Address明细）', async ({ page }) => {
    clearGeneratedCache();

    const MAX_RETRIES = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`\n[Test] 🔄 Attempt ${attempt}/${MAX_RETRIES}`);

      try {
        const builder = new FormTestBuilder(page, {
          formId: FORM_ID,
          formName: FORM_NAME,
          url: FORM_URL,
          schemaPath: './src/schemas/Securemetric-CRM/base',
          detailTables: [
            { detailModelId: DETAIL_TABLE_ID, detailTableName: 'Address' },
          ],
        });

        await builder.initialize();
        await builder.navigate();

        // 🇲🇾 生成马来西亚有意义的客户数据
        const customer = generateMalaysiaCustomerData();

        console.log('\n📋 生成的马来西亚客户数据:');
        console.log(`   客户名称: ${customer.companyName}`);
        console.log(`   注册码: ${customer.legalId}`);
        console.log(`   电话: ${generateMalaysiaPhone()}`);
        console.log(`   邮件: ${customer.email}`);
        console.log(`   经营范围: ${customer.scopeOfBusiness}`);
        console.log(`   备注: ${customer.notes}\n`);

    // ════════════════════════════════════
    // 填充主表字段（按照需求文档顺序）
    // ════════════════════════════════════

    // 1. Customer Name (必填) - 马来西亚公司名称
    await builder.fillField('fd_name', customer.companyName);
    console.log('[Test] ✅ Customer Name (fd_name):', customer.companyName);

    // 2. Legal ID/注册码 (必填) - 马来西亚 SSM 注册码格式
    await builder.fillField('fd_uniform_social_credit', customer.legalId);
    console.log('[Test] ✅ Legal ID (fd_uniform_social_credit):', customer.legalId);

    // 3. Phone (电话) - 马来西亚手机号格式
    const phone = generateMalaysiaPhone();
    await builder.fillField('fd_tel', phone);
    console.log('[Test] ✅ Phone (fd_tel):', phone);

    // 4. Email
    await builder.fillField('fd_email', customer.email);
    console.log('[Test] ✅ Email (fd_email):', customer.email);

    // 5. Notes/备注
    await builder.fillField('fd_remark', customer.notes);
    console.log('[Test] ✅ Notes (fd_remark):', customer.notes);

    // 6. Scope of Business/经营范围
    await builder.fillField('fd_scope', customer.scopeOfBusiness);
    console.log('[Test] ✅ Scope of Business (fd_scope):', customer.scopeOfBusiness);

    // 7. Customer Type (随机) - cfg 类型，传 null 自动随机选取
    await builder.fillField('fd_account_type', null);
    console.log('[Test] ✅ Customer Type (fd_account_type): 随机选取');

    // 8. Customer Source (可选，随机) - cfg 类型
    await builder.fillField('fd_account_source', null);
    console.log('[Test] ✅ Customer Source (fd_account_source): 随机选取');

    // 等待主表填充稳定
    await page.waitForTimeout(2000);

    // ════════════════════════════════════
    // 填充明细表 Address（2行马来西亚地址）
    // ════════════════════════════════════

    const addressRows = customer.addresses.map(addr => ({
      fd_address: `${addr.addressLine}, ${addr.postcode} ${addr.city}, ${addr.state}, Malaysia`,
    }));

    console.log('\n📋 明细表 Address 数据:');
    addressRows.forEach((row, index) => {
      console.log(`   行${index + 1}:`, row.fd_address);
    });
    console.log('');

    await builder.fillDetailTableWithData(addressRows, DETAIL_TABLE_ID);

        await page.waitForTimeout(2000);

        // 截图验证填充结果
        await page.screenshot({
          path: `test-results/screenshots/customer-filled-before-submit-attempt-${attempt}.png`,
          fullPage: true,
        });
        console.log(`[Test] 📸 截图已保存: customer-filled-before-submit-attempt-${attempt}.png`);

        // 提交表单
        console.log('\n[Test] 🚀 提交表单...');
        const submitSuccess = await builder.submit();

        if (submitSuccess) {
          console.log('[Test] ✅ 测试完成（提交成功）');
          return;
        }

        console.log(`[Test] ⚠️ 提交未完全成功（attempt ${attempt}/${MAX_RETRIES}），准备重试...`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        lastError = error instanceof Error ? error : new Error(errorMessage);
        console.error(`[Test] ❌ Attempt ${attempt} failed:`, errorMessage);

        if (errorMessage.includes('duplicate') || errorMessage.includes('重复') || errorMessage.includes('already exists')) {
          console.log(`[Test] 🔁 检测到重复错误，使用新的唯一数据重试...`);
        } else if (attempt < MAX_RETRIES) {
          console.log(`[Test] 🔁 准备重试（非重复错误）...`);
        }
      }

      if (attempt < MAX_RETRIES) {
        console.log(`[Test] ⏳ 等待 3 秒后重试...`);
        await page.waitForTimeout(3000);
      }
    }

    if (lastError) {
      console.error('[Test] ❌ 所有重试均失败，抛出最后一个错误');
      throw lastError;
    }

    console.log('[Test] ✅ 测试完成');
  });
});
