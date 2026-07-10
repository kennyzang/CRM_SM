import { test } from '@playwright/test'

const LEAD_LIST_URL = 'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1'

test('诊断：点击 All 后截图', async ({ page }) => {
  await page.goto(LEAD_LIST_URL)
  await page.waitForSelector('.lui-tabs-tab, [role="tab"]', { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(1000)

  const leadTab = page.locator('div').filter({ hasText: /^LEAD$/ }).nth(1)
  if (await leadTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await leadTab.click(); await page.waitForTimeout(800)
  }
  const salesLeadTab = page.getByText('Sales Lead', { exact: true })
  if (await salesLeadTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await salesLeadTab.click(); await page.waitForTimeout(1000)
  }

  await page.screenshot({ path: '/tmp/01-before-all.png', fullPage: false })

  const allTab = page.getByText('All', { exact: true }).first()
  const allVisible = await allTab.isVisible({ timeout: 5000 }).catch(() => false)
  console.log('[Diag] All tab 可见:', allVisible)
  if (allVisible) {
    await allTab.click()
    await page.waitForTimeout(3000)  // 等更久
    await page.screenshot({ path: '/tmp/02-after-all.png', fullPage: false })
  }

  const rows = await page.locator('table tbody tr, .lui-table-body tr').count()
  console.log('[Diag] 行数:', rows)

  // 列出所有可能的行容器
  const anyRows1 = await page.locator('tr').count()
  const anyRows2 = await page.locator('[class*="row"]').count()
  console.log('[Diag] 所有 tr 数:', anyRows1, '| row class 数:', anyRows2)
})
