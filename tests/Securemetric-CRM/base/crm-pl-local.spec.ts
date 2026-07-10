/**
 * P&L 组件本地功能验证
 *
 * 目标：验证组件各功能正常（能点、能开、能关、数据出现）
 * 不验证具体计算数值是否准确
 *
 * 前置条件：
 *   cd packages/securemetric-crm-pl && yarn dev（本地 3041 端口）
 *
 * 运行命令：
 *   npx playwright test \
 *     --config=config/playwright.securemetric-crm.config.ts \
 *     tests/Securemetric-CRM/base/crm-pl-local.spec.ts \
 *     --headed
 */
import { test, expect } from '@playwright/test'
import { PLFiller } from '../../../src/filler/PLFiller'

const LOCAL_URL = 'http://127.0.0.1:3041/'

test.describe('P&L 组件 — 本地功能验证', () => {
  let pl: PLFiller

  test.beforeEach(async ({ page }) => {
    pl = new PLFiller(page)
    await page.goto(LOCAL_URL)
    await pl.waitForReady(10000)
  })

  // ══════════════════════════════════════════
  // Tab 导航
  // ══════════════════════════════════════════

  test('Tab 切换正常', async ({ page }) => {
    for (const tab of ['software', 'hardware', 'service', 'reimbursement', 'others', 'overview'] as const) {
      await pl.clickTab(tab)
      await expect(page.locator(`[data-testid="pl-tab-${tab}"]`)).toBeVisible()
    }
  })

  // ══════════════════════════════════════════
  // 产品 Tab — 添加产品
  // ══════════════════════════════════════════

  test('Hardware — 打开产品选择弹窗并关闭', async ({ page }) => {
    await pl.clickTab('hardware')

    const addBtn = page.locator('[data-testid="pl-btn-add-products"]').first()
    await addBtn.click()

    // 弹窗打开
    const confirmBtn = page.locator('[data-testid="pl-selector-confirm"]')
    await expect(confirmBtn).toBeVisible()

    // 关闭
    await page.keyboard.press('Escape')
    await expect(confirmBtn).not.toBeVisible()
  })

  test('Hardware — 添加 1 个产品后表格出现行', async ({ page }) => {
    await pl.clickTab('hardware')
    const added = await pl.addProducts({ count: 1 })

    if (added === 0) {
      console.warn('[跳过] 无可用产品')
      return
    }

    // 表格中出现至少 1 行
    const row = page.locator('.pl-product-table .lui-table-row, .lui-table-body tr').first()
    await expect(row).toBeVisible()
  })

  test('Software — 添加产品后行出现', async ({ page }) => {
    await pl.clickTab('software')
    const added = await pl.addProducts({ count: 1 })
    if (added === 0) return
    const row = page.locator('.pl-product-table .lui-table-row, .lui-table-body tr').first()
    await expect(row).toBeVisible()
  })

  test('Services — 添加产品后行出现', async ({ page }) => {
    await pl.clickTab('service')
    const added = await pl.addProducts({ count: 1 })
    if (added === 0) return
    const row = page.locator('.pl-product-table .lui-table-row, .lui-table-body tr').first()
    await expect(row).toBeVisible()
  })

  // ══════════════════════════════════════════
  // 产品 Tab — ProductDrawer
  // ══════════════════════════════════════════

  test('Hardware — 点击 Edit 打开 Drawer，Save 关闭', async ({ page }) => {
    await pl.clickTab('hardware')
    const added = await pl.addProducts({ count: 1 })
    if (added === 0) return

    // 点击 Edit 按钮
    const editBtn = page.locator('.pl-cell-actions button', { hasText: 'Edit' }).first()
    await editBtn.click()

    // Drawer 打开
    const saveBtn = page.locator('[data-testid="pl-drawer-save"]')
    await expect(saveBtn).toBeVisible()

    // 点击 Save
    await saveBtn.click()
    await expect(saveBtn).not.toBeVisible()
  })

  test('Hardware — Drawer Cancel 不保存关闭', async ({ page }) => {
    await pl.clickTab('hardware')
    const added = await pl.addProducts({ count: 1 })
    if (added === 0) return

    const editBtn = page.locator('.pl-cell-actions button', { hasText: 'Edit' }).first()
    await editBtn.click()

    const cancelBtn = page.locator('[data-testid="pl-drawer-cancel"]')
    await expect(cancelBtn).toBeVisible()
    await cancelBtn.click()
    await expect(cancelBtn).not.toBeVisible()
  })

  test('Hardware — Drawer Delete 删除行', async ({ page }) => {
    await pl.clickTab('hardware')
    const added = await pl.addProducts({ count: 1 })
    if (added === 0) return

    const editBtn = page.locator('.pl-cell-actions button', { hasText: 'Edit' }).first()
    await editBtn.click()

    const deleteBtn = page.locator('[data-testid="pl-drawer-delete"]')
    await expect(deleteBtn).toBeVisible()
    await deleteBtn.click()

    // 行应消失
    const rows = page.locator('.pl-cell-actions button', { hasText: 'Edit' })
    await expect(rows).toHaveCount(0)
  })

  // ══════════════════════════════════════════
  // 续费流程
  // ══════════════════════════════════════════

  test('Hardware — Renew 按钮显示 HardwareRenew Tab', async ({ page }) => {
    await pl.clickTab('hardware')
    const added = await pl.addProducts({ count: 1 })
    if (added === 0) return

    // 点击 Renew
    const renewBtn = page.locator('.pl-cell-actions button', { hasText: 'Renew' }).first()
    await renewBtn.click()

    // Renew Tab 出现
    await expect(page.locator('[data-testid="pl-tab-hardwareRenew"]')).toBeVisible()
  })

  test('Hardware — Renew Tab 内 Copy 生成 Year+1 行', async ({ page }) => {
    await pl.clickTab('hardware')
    const added = await pl.addProducts({ count: 1 })
    if (added === 0) return

    await pl.copyAllRowsToRenew()
    await pl.clickTab('hardwareRenew')

    // 初始 1 行（Year=2）
    const beforeCount = await page.locator('.pl-cell-actions button', { hasText: 'Copy' }).count()
    expect(beforeCount).toBeGreaterThan(0)

    // 点击 Copy
    const copied = await pl.copyRenewRowNextYear()
    expect(copied).toBe(true)

    // 行数增加
    const afterCount = await page.locator('.pl-cell-actions button', { hasText: 'Copy' }).count()
    expect(afterCount).toBeGreaterThan(beforeCount)
  })

  // ══════════════════════════════════════════
  // Reimbursement Tab
  // ══════════════════════════════════════════

  test('Reimbursement — 添加行后表格出现行', async ({ page }) => {
    await pl.clickTab('reimbursement')
    await pl.addReimbRow()

    const row = page.locator('.lui-table-body tr').first()
    await expect(row).toBeVisible()
  })

  // ══════════════════════════════════════════
  // Others Tab
  // ══════════════════════════════════════════

  test('Others — 添加行后表格出现行', async ({ page }) => {
    await pl.clickTab('others')
    await pl.addOtherRow()

    const row = page.locator('.lui-table-body tr').first()
    await expect(row).toBeVisible()
  })

  // ══════════════════════════════════════════
  // Overview Tab
  // ══════════════════════════════════════════

  test('Overview — 无数据时显示空状态', async ({ page }) => {
    await pl.clickTab('overview')
    // 无数据时显示 Empty 组件
    const empty = page.locator('.lui-empty, [class*="empty"]').first()
    await expect(empty).toBeVisible()
  })

  test('Overview — 有数据后汇总表格出现', async ({ page }) => {
    // 先加一个产品
    await pl.clickTab('hardware')
    const added = await pl.addProducts({ count: 1 })
    if (added === 0) return

    await pl.clickTab('overview')

    // KPI 卡片出现
    const kpi = page.locator('.pl-overview-kpi').first()
    await expect(kpi).toBeVisible()

    // 汇总表格出现
    const table = page.locator('.pl-overview .lui-table').first()
    await expect(table).toBeVisible()
  })

  // ══════════════════════════════════════════
  // ProductSelector — 搜索功能
  // ══════════════════════════════════════════

  test('ProductSelector — 搜索过滤后结果变化', async ({ page }) => {
    await pl.clickTab('hardware')
    const addBtn = page.locator('[data-testid="pl-btn-add-products"]').first()
    await addBtn.click()

    await page.locator('[data-testid="pl-selector-confirm"]').waitFor({ state: 'visible' })

    // 记录初始产品数
    const before = await page.locator('[data-testid^="pl-product-item-"]').count()

    // 搜索一个关键词
    const searchInput = page.locator('[data-testid="pl-selector-search"]')
    await searchInput.fill('AEP')
    await page.waitForTimeout(600)

    const after = await page.locator('[data-testid^="pl-product-item-"]').count()

    // 搜索后数量应 <= 搜索前
    expect(after).toBeLessThanOrEqual(before)

    await page.keyboard.press('Escape')
  })
})
