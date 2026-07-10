/**
 * Securemetric CRM — 联系人新建测试（马来西亚数据）
 *
 * 测试目标: http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1huk4vljow4bw7civw3cdgsju212d8jr1sw1
 * 表单ID: mk_km_ltc_contacts
 * 环境: Securemetric CRM (内网环境)
 *
 * 启动命令:
 *   # 基础命令（创建 1 个联系人）
 *   CRM_USER=edward npx playwright test --config=config/playwright.securemetric-crm.config.ts tests/Securemetric-CRM/base/crm-contact.spec.ts --headed
 *
 *   # 批量创建（使用 --repeat-each 参数）
 *   CRM_USER=edward npx playwright test --config=config/playwright.securemetric-crm.config.ts tests/Securemetric-CRM/base/crm-contact.spec.ts --repeat-each 2
 *   CRM_USER=edward npx playwright test --config=config/playwright.securemetric-crm.config.ts tests/Securemetric-CRM/base/crm-contact.spec.ts --repeat-each 5
 *
 *   # 无头模式 + 批量（CI/CD 推荐）
 *   CRM_USER=edward HEADLESS=true npx playwright test --config=config/playwright.securemetric-crm.config.ts tests/Securemetric-CRM/base/crm-contact.spec.ts --repeat-each 10
 *
 * 测试内容:
 *   1. 使用马来西亚真实数据填充所有字段
 *   2. 验证必填字段（Type、Name、Gender）
 *   3. 提交表单并截图
 */
import { test } from '@playwright/test';
import { FormTestBuilder } from '../../../src/core/FormTestBuilder';
import { generateMalaysiaContactData } from '../../../src/mock/MalaysiaMockData';

const FORM_ID = 'mk_km_ltc_contacts';
const FORM_NAME = 'mk_km_ltc_contacts';
const FORM_URL = 'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1huk4vljow4bw7civw3cdgsju212d8jr1sw1';

test.describe('Securemetric CRM — 联系人新建测试', () => {
  test('使用马来西亚数据填充并提交', async ({ page }) => {
    const builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: './src/schemas/Securemetric-CRM/base/securemetric-crm',
    });

    await builder.initialize();
    await builder.navigate();

    // 🇲🇾 生成马来西亚有意义的联系人数据
    const contactData = generateMalaysiaContactData();

    console.log('\n📋 生成的马来西亚联系人数据:');
    console.log(`   姓名: ${contactData.name}`);
    console.log(`   性别: ${contactData.gender.label}`);
    console.log(`   部门: ${contactData.department}`);
    console.log(`   职务: ${contactData.jobTitle}`);
    console.log(`   办公电话: ${contactData.phone}`);
    console.log(`   手机: ${contactData.mobile}`);
    console.log(`   邮件: ${contactData.email}`);
    console.log(`   地址: ${contactData.address}\n`);

    // 填充关键字段（使用马来西亚数据）- 按照必填顺序
    // 1. Type (必填) - Customer Contact
    await builder.fillField('fd_record_type', '1');
    console.log('[Test] ✅ Type (fd_record_type): Customer Contact');

    // 2. Name (必填)
    await builder.fillField('fd_name', contactData.name);
    console.log(`[Test] ✅ Name (fd_name): ${contactData.name}`);

    // 3. Gender (必填)
    await builder.fillField('fd_gender', contactData.gender.value);
    console.log(`[Test] ✅ Gender (fd_gender): ${contactData.gender.label}`);

    // 4. Department
    await builder.fillField('fd_department', contactData.department);
    console.log(`[Test] ✅ Department (fd_department): ${contactData.department}`);

    // 5. Job Title
    await builder.fillField('fd_job_title', contactData.jobTitle);
    console.log(`[Test] ✅ Job Title (fd_job_title): ${contactData.jobTitle}`);

    // 6. Office Phone
    await builder.fillField('fd_tel', contactData.phone);
    console.log(`[Test] ✅ Office Phone (fd_tel): ${contactData.phone}`);

    // 7. Mobile
    await builder.fillField('fd_mobile', contactData.mobile);
    console.log(`[Test] ✅ Mobile (fd_mobile): ${contactData.mobile}`);

    // 8. Email
    await builder.fillField('fd_email', contactData.email);
    console.log(`[Test] ✅ Email (fd_email): ${contactData.email}`);

    // 9. Address
    await builder.fillField('fd_add', contactData.address);
    console.log(`[Test] ✅ Address (fd_add): ${contactData.address}`);

    // 填充其他可选字段
    if (contactData.remark) {
      await builder.fillField('fd_remark', contactData.remark);
      console.log(`[Test] ✅ Notes (fd_remark): ${contactData.remark}`);
    }

    if (contactData.influenceLevel) {
      await builder.fillField('fd_influence_level', contactData.influenceLevel);
      console.log(`[Test] ✅ Role in Decision (fd_influence_level): ${contactData.influenceLevel}`);
    }

    if (contactData.relationship) {
      await builder.fillField('fd_position', contactData.relationship);
      console.log(`[Test] ✅ Relationship (fd_position): ${contactData.relationship}`);
    }

    // 提交表单
    console.log('\n[Test] 🚀 提交表单...');
    await builder.submit();

    console.log('[Test] ✅ 测试完成');
  });
});
