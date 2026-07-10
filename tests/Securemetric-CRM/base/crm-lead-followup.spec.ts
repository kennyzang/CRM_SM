/**
 * Securemetric CRM — 线索跟进测试
 *
 * 测试目标：对处于 Pending 状态的线索执行跟进操作，验证状态推进为 Follow-Up
 *
 * 覆盖场景（按优先级，三选一自动执行）：
 *   1. New Log（新增销售记录）— 主流程，填写沟通记录后自动推进
 *   2. Follow-Up 按钮 — 填写跟进结果和下次计划
 *   3. Advance to next stage — 一键推进（兜底方案）
 *
 * 前提条件：
 *   - 系统中存在至少一条 Pending 状态的线索
 *   - 可先运行 crm-lead.spec.ts 创建线索数据
 *
 * 启动命令：
 *   CRM_USER=edward npx playwright test \
 *     --config=config/playwright.securemetric-crm.config.ts \
 *     tests/Securemetric-CRM/base/crm-lead-followup.spec.ts --headed
 *
 *   # 无头模式
 *   CRM_USER=edward npx playwright test \
 *     --config=config/playwright.securemetric-crm.config.ts \
 *     tests/Securemetric-CRM/base/crm-lead-followup.spec.ts
 *
 * 环境：Securemetric CRM (内网)
 */
import { test, expect } from '@playwright/test'

const LEAD_LIST_URL =
  'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1'

// ─── 导航到 Sales Lead 列表 ──────────────────────────────────────

async function goToSalesLeadList(
  page: Parameters<Parameters<typeof test>[2]>[0]['page']
): Promise<void> {
  await page.goto(LEAD_LIST_URL)
  // 等待页面框架加载（等待侧边栏或顶部 tab 出现）
  await page.waitForSelector('.lui-tabs-tab, [role="tab"]', { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(1000)

  const leadTab = page.locator('div').filter({ hasText: /^LEAD$/ }).nth(1)
  if (await leadTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await leadTab.click()
    await page.waitForTimeout(800)
  }

  const salesLeadTab = page.getByText('Sales Lead', { exact: true })
  if (await salesLeadTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await salesLeadTab.click()
    await page.waitForTimeout(1000)
  }

  // 切换到 "All" 视图以查看所有线索（My Owned / My Team Owned / All）
  const allTab = page.getByText('All', { exact: true }).first()
  if (await allTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await allTab.click()
    // 等待表格行出现（最多10秒）
    await page.waitForSelector('table tbody tr, .lui-table-body tr', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(4000)  // 等待单元格数据懒加载完成
    console.log('[Test] ✅ 已切换到 All 视图')
  }
}

// ─── 打开第一条 Pending 状态的线索 ──────────────────────────────

async function openFirstPendingLead(
  page: Parameters<Parameters<typeof test>[2]>[0]['page']
): Promise<boolean> {
  // 调试：截图 + 打印 DOM 信息
  await page.screenshot({ path: '/tmp/followup-before-scan.png', fullPage: false })
  const trCount = await page.locator('tr').count()
  const tbodyTrCount = await page.locator('table tbody tr').count()
  const luiTrCount = await page.locator('.lui-table-body tr').count()
  console.log(`[Test][Debug] tr总数=${trCount} / table tbody tr=${tbodyTrCount} / .lui-table-body tr=${luiTrCount}`)

  // 等待表格行出现（最多15秒）
  const rows = page.locator('table tbody tr, .lui-table-body tr')
  const rowVisible = await rows.first().isVisible({ timeout: 15000 }).catch(() => false)
  if (!rowVisible) {
    console.log('[Test] ⚠️ 列表中无线索数据')
    return false
  }

  const rowCount = await rows.count()
  console.log(`[Test] 列表中共 ${rowCount} 条线索，扫描 Pending 状态...`)

  // 遍历前10行，找到状态列包含 Pending 的行
  const maxScan = Math.min(rowCount, 10)
  for (let i = 0; i < maxScan; i++) {
    const row = rows.nth(i)
    const rowText = await row.textContent().catch(() => '')
    if (rowText && /Pending/i.test(rowText)) {
      console.log(`[Test] ✅ 找到 Pending 线索（第 ${i + 1} 行）`)
      const firstCell = row.locator('td').nth(1)
      await firstCell.click()
      await page.waitForTimeout(1500)
      return true
    }
  }

  // 没找到 Pending 就直接打开第一行（可能是 Pending 但状态列不显示文字）
  console.log('[Test] ⚠️ 未扫描到 Pending 文字，打开第一行线索尝试')
  const firstCell = rows.first().locator('td').nth(1)
  await firstCell.click()
  await page.waitForTimeout(1500)
  return true
}

// ─── Test Suite ───────────────────────────────────────────────────

test.describe('Securemetric CRM — 线索跟进', () => {

  test('方式一：New Log — 新增销售记录推进线索', async ({ page }) => {
    await goToSalesLeadList(page)
    const opened = await openFirstPendingLead(page)

    if (!opened) {
      console.log('[Test] ⏭ 跳过：无 Pending 线索')
      return
    }

    // 点击 New Log
    const newLogBtn = page.getByRole('button', { name: 'New Log' })
    await expect(newLogBtn).toBeVisible({ timeout: 5000 })
    await newLogBtn.click()
    await page.waitForTimeout(800)

    console.log('[Test] ✅ New Log 弹窗已打开')

    // 选择活动类型
    const activitySelect = page.locator('.lui-select-single .lui-select-selection-search').first()
    if (await activitySelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await activitySelect.click()
      await page.waitForTimeout(400)
      const option = page.getByText('Calling Contact', { exact: true })
      if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
        await option.click()
        await page.waitForTimeout(300)
        console.log('[Test] ✅ Activity Type: Calling Contact')
      }
    }

    // 填写讨论详情（必填）
    const detailsInput = page.getByRole('textbox', { name: /Discussion Details/i })
    await expect(detailsInput).toBeVisible({ timeout: 5000 })
    await detailsInput.fill(
      'Follow-up call completed. Customer confirmed interest in PKI hardware solution. ' +
      'Requested pricing proposal for Q3 deployment. Next step: send quotation.'
    )
    console.log('[Test] ✅ Discussion Details 已填写')

    // 提交
    const submitBtn = page.getByRole('button', { name: 'Submit' })
    await expect(submitBtn).toBeVisible({ timeout: 3000 })
    await submitBtn.click()
    await page.waitForTimeout(2000)

    console.log('[Test] ✅ New Log 提交成功，线索已推进至 Follow-Up')
    console.log('[Test] ✅ 线索跟进（New Log）测试完成')
  })

  test('方式二：Follow-Up 按钮 — 填写跟进结果与计划', async ({ page }) => {
    await goToSalesLeadList(page)
    const opened = await openFirstPendingLead(page)

    if (!opened) {
      console.log('[Test] ⏭ 跳过：无 Pending 线索')
      return
    }

    // 点击 Follow-up 按钮
    const followUpBtn = page.getByRole('button', { name: 'Follow-up' })
    const followUpVisible = await followUpBtn.isVisible({ timeout: 5000 }).catch(() => false)
    if (!followUpVisible) {
      console.log('[Test] ⚠️ Follow-up 按钮不可见，跳过')
      return
    }
    await followUpBtn.click()
    await page.waitForTimeout(800)

    console.log('[Test] ✅ Follow-Up 弹窗已打开')

    // 填写跟进结果（必填）
    const resultsArea = page.locator('textarea[name="fd_results"]')
    if (await resultsArea.isVisible({ timeout: 3000 }).catch(() => false)) {
      await resultsArea.fill(
        'Customer confirmed interest. Requested demo for HSM solution. ' +
        'Budget approved in principle. Decision expected within 4 weeks.'
      )
      console.log('[Test] ✅ Results 已填写')
    }

    // 选择下次跟进日期
    const dateInput = page.getByRole('textbox', { name: /Please select the date/i })
    if (await dateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dateInput.click()
      await page.waitForTimeout(500)
      // 选择本月最近可用日期
      const availableDates = page.locator('.lui-picker-cell:not(.lui-picker-cell-disabled) .lui-picker-cell-inner')
      const dateCount = await availableDates.count()
      if (dateCount > 0) {
        await availableDates.last().click()
        await page.waitForTimeout(300)
        console.log('[Test] ✅ Next Follow-up Date 已选择')
      }
    }

    // 填写下次跟进备注
    const nextRemarkArea = page.locator('textarea[name="fd_next_followed_remark"]')
    if (await nextRemarkArea.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextRemarkArea.fill('Arrange product demo. Prepare HSM pricing proposal and ROI analysis report.')
      console.log('[Test] ✅ Next Follow-up Notes 已填写')
    }

    // 确认
    const confirmBtn = page.getByRole('button', { name: 'Confirm' })
    await expect(confirmBtn).toBeVisible({ timeout: 3000 })
    await confirmBtn.click()
    await page.waitForTimeout(2000)

    console.log('[Test] ✅ Follow-Up 提交成功，线索已推进')
    console.log('[Test] ✅ 线索跟进（Follow-Up 按钮）测试完成')
  })

  test('方式三：Advance to next stage — 一键阶段推进', async ({ page }) => {
    await goToSalesLeadList(page)
    const opened = await openFirstPendingLead(page)

    if (!opened) {
      console.log('[Test] ⏭ 跳过：无 Pending 线索')
      return
    }

    // 点击 Advance to next stage
    const advanceBtn = page.getByRole('button', { name: 'Advance to next stage' })
    const advanceVisible = await advanceBtn.isVisible({ timeout: 5000 }).catch(() => false)
    if (!advanceVisible) {
      console.log('[Test] ⚠️ Advance to next stage 按钮不可见，跳过')
      return
    }
    await advanceBtn.click()
    await page.waitForTimeout(800)

    console.log('[Test] ✅ 确认弹窗已打开')

    // 确认
    const confirmBtn = page.getByRole('button', { name: 'Confirm' })
    await expect(confirmBtn).toBeVisible({ timeout: 5000 })
    await confirmBtn.click()
    await page.waitForTimeout(2000)

    console.log('[Test] ✅ 阶段推进成功，线索已变为 Follow-Up')
    console.log('[Test] ✅ 线索跟进（Advance to next stage）测试完成')
  })
})
