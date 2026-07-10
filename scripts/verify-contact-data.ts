/**
 * 快速验证脚本：检查联系人列表是否包含新创建的记录
 *
 * 使用方法：
 *   npx ts-node scripts/verify-contact-data.ts
 */
import { chromium } from 'playwright';

const BASE_URL = 'http://172.18.114.231:8088';
const CONTACT_LIST_URL = `${BASE_URL}/web/#/current/sys-modeling/app/km-ltc/list`;

async function verifyContactData() {
  console.log('\n🔍 启动浏览器验证联系人数据...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  // 加载已保存的 session
  try {
    await context.storageState({
      path: './auth/auth-securemetric-crm.json',
    });
    console.log('✅ Session 加载成功\n');
  } catch (error) {
    console.error('❌ Session 加载失败:', error);
    await browser.close();
    return;
  }

  const page = await context.newPage();

  try {
    // 导航到联系人列表页
    console.log(`🌐 导航到联系人列表: ${CONTACT_LIST_URL}`);
    await page.goto(CONTACT_LIST_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // 截图列表页
    await page.screenshot({
      path: 'test-results/screenshots/contact-list-verification.png',
      fullPage: true,
    });
    console.log('📸 列表页截图已保存: contact-list-verification.png\n');

    // 检查列表是否为空
    const emptyState = await page.locator('text=暂无内容').count();
    if (emptyState > 0) {
      console.log('⚠️ 联系人列表为空！数据可能未保存成功');
    } else {
      // 尝试获取表格中的数据
      const tableRows = await page.locator('.ant-table-tbody tr').count();
      console.log(`📊 找到 ${tableRows} 条联系人记录`);

      if (tableRows > 0) {
        // 显示最近几条记录的姓名
        const names = await page.evaluate(() => {
          const rows = document.querySelectorAll('.ant-table-tbody tr');
          return Array.from(rows).slice(0, 5).map(row => {
            const nameCell = row.querySelector('td:nth-child(2)');
            return nameCell?.textContent?.trim() || '';
          });
        });

        console.log('\n📋 最近创建的联系人:');
        names.forEach((name, index) => {
          if (name) {
            console.log(`   ${index + 1}. ${name}`);
          }
        });
      }
    }

    console.log('\n✅ 验证完成！');
    console.log('💡 请手动打开截图文件查看详情: test-results/screenshots/contact-list-verification.png');

    // 保持浏览器打开10秒供用户查看
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ 验证过程出错:', error);
  } finally {
    await browser.close();
  }
}

verifyContactData().catch(console.error);
