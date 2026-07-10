/**
 * Seed Test — Playwright Test Agents 环境初始化
 *
 * 环境: EasyCraft test
 *
 * 启动命令:
 *   npm run test:test -- --grep "seed"
 *
 * 为 Planner/Generator/Healer 提供登录后的页面上下文。
 * Healer 会运行此测试来获取一个已登录的浏览器环境。
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.EASYCRAFT_URL || 'https://test.easycraft.ai';
const FORM_URL = 'https://test.easycraft.ai/web/#/current/sys-modeling/app/km-test/add/1jn20acsdw8uw1s358w36k7o2lu55oase5w4';

test('seed', async ({ page }) => {
  // 导航到表单页面（Session 已通过 global-setup 复用，无需重新登录）
  await page.goto(FORM_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // 等待表单加载
  await page.waitForTimeout(3000);
  await page.locator('.ele-xform-fieldset-wrap').first().waitFor({
    state: 'visible',
    timeout: 30000,
  });

  // 验证已成功进入表单页面
  const currentUrl = page.url();
  expect(currentUrl).toContain('/add/');
});
