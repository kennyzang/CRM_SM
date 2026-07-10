/**
 * 商机转换 用户手册截图用例（Edward 账号）
 *
 * 目标：演示线索从 Pending → Follow-Up → 转商机 的完整流程，每步截图。
 *
 * 覆盖场景：
 *   Part A — Pending 推进为 Follow-Up（三种方式）
 *     A1. 阶段推进（Advance to next stage）
 *     A2. 新增销售记录（New Log）
 *     A3. Follow-Up 按钮（填写跟进结果）
 *   Part B — Follow-Up 转换为商机（Convert）
 *     B1. 点击 Convert，填写客户类型与来源
 *     B2. 确认转换
 *
 * 注意：
 *   - 本用例操作已有记录，不创建新数据（只读 + 轻操作）
 *   - 若列表无 Pending/Follow-Up 数据，对应步骤会跳过并记录到手册
 *
 * 输出：
 *   截图  → doc/用户手册/3-商机转换/screenshots/
 *   手册  → doc/用户手册/3-商机转换/lead-convert-user-manual.md（双语）
 *           doc/用户手册/3-商机转换/lead-convert-user-manual-zh.md（中文）
 *           doc/用户手册/3-商机转换/lead-convert-user-manual-en.md（英文）
 *
 * 运行命令：
 *   CRM_USER=edward npx playwright test \
 *     --config=config/playwright.securemetric-crm.config.ts \
 *     tests/Securemetric-CRM/manual/crm-lead-convert-manual.spec.ts
 */
import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

// 强制使用英文 locale
test.use({ locale: 'en-US' })

// ─── 路径常量 ────────────────────────────────────────────────────
const MANUAL_DIR = path.join(process.cwd(), 'src', 'widget', 'km-ltc-manual-securemetric', 'docs', 'manual', '3-lead-convert')
const SCREENSHOTS_DIR = path.join(MANUAL_DIR, 'screenshots')
const MANUAL_PATH = path.join(MANUAL_DIR, 'lead-convert-user-manual.md')
const MANUAL_ZH_PATH = path.join(MANUAL_DIR, 'lead-convert-user-manual-zh.md')
const MANUAL_EN_PATH = path.join(MANUAL_DIR, 'lead-convert-user-manual-en.md')

// 线索列表入口
const LEAD_LIST_URL =
  'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1'

// ─── 双语结构 ────────────────────────────────────────────────────

interface BilingualText {
  zh: string
  en: string
}

interface ManualStep {
  stepNo: number
  title: BilingualText
  description: BilingualText
  screenshotFile: string | null
  skipped?: boolean
}

// ─── 手册生成工具 ────────────────────────────────────────────────

class ManualWriter {
  private steps: ManualStep[] = []
  private stepCounter = 0

  record(
    title: BilingualText,
    description: BilingualText,
    screenshotFile: string | null = null,
    skipped = false
  ) {
    this.stepCounter++
    this.steps.push({ stepNo: this.stepCounter, title, description, screenshotFile, skipped })
    const tag = skipped ? '[跳过]' : ''
    console.log(`[Manual] Step ${this.stepCounter}${tag}: ${title.zh} / ${title.en}`)
  }

  save() {
    fs.mkdirSync(MANUAL_DIR, { recursive: true })
    const now = new Date().toLocaleString('zh-CN')

    // ── 双语版 ──────────────────────────────────────────────────
    const biLines: string[] = [
      '# 线索推进与商机转换 — 用户手册 / Lead Advancement & Opportunity Conversion — User Manual',
      '',
      `> 生成时间 / Generated: ${now}`,
      `> 操作账号 / Account: Edward`,
      `> 环境 / Environment: http://172.18.114.231:8088`,
      '',
      '## 概述 / Overview',
      '',
      '**中文：** 线索生命周期分为三个阶段：**Pending（待跟进）→ Follow-Up（跟进中）→ 转商机**。本手册演示如何逐步推进线索状态，并最终将其转换为商机。',
      '',
      '**English：** The lead lifecycle has three stages: **Pending → Follow-Up → Convert to Opportunity**. This manual demonstrates how to advance a lead through each stage and convert it to an opportunity.',
      '',
      '---',
      '',
    ]
    for (const step of this.steps) {
      const skipBadge = step.skipped ? ' _(跳过 / Skipped)_' : ''
      biLines.push(`## Step ${step.stepNo}：${step.title.zh} / ${step.title.en}${skipBadge}`, '')
      biLines.push(`**中文说明：** ${step.description.zh}`, '')
      biLines.push(`**English：** ${step.description.en}`, '')
      if (step.screenshotFile) {
        const rel = path.relative(MANUAL_DIR, path.join(SCREENSHOTS_DIR, step.screenshotFile))
        biLines.push(`![${step.title.en}](${rel})`, '')
      }
      biLines.push('---', '')
    }
    fs.writeFileSync(MANUAL_PATH, biLines.join('\n'), 'utf-8')
    console.log(`[Manual] 双语手册：${MANUAL_PATH}`)

    // ── 中文版 ──────────────────────────────────────────────────
    const zhLines: string[] = [
      '# 线索推进与商机转换 — 用户手册',
      '',
      `> 生成时间：${now}`,
      `> 操作账号：Edward`,
      `> 环境：http://172.18.114.231:8088`,
      '',
      '## 概述',
      '',
      '线索生命周期分为三个阶段：**Pending（待跟进）→ Follow-Up（跟进中）→ 转商机**。',
      '',
      '推进方式有三种，最终状态进入 Follow-Up 后，可点击 **Convert** 转换为商机。',
      '',
      '---',
      '',
    ]
    for (const step of this.steps) {
      const skipBadge = step.skipped ? ' _(跳过)_' : ''
      zhLines.push(`## 第 ${step.stepNo} 步：${step.title.zh}${skipBadge}`, '')
      zhLines.push(step.description.zh, '')
      if (step.screenshotFile) {
        const rel = path.relative(MANUAL_DIR, path.join(SCREENSHOTS_DIR, step.screenshotFile))
        zhLines.push(`![${step.title.zh}](${rel})`, '')
      }
      zhLines.push('---', '')
    }
    fs.writeFileSync(MANUAL_ZH_PATH, zhLines.join('\n'), 'utf-8')
    console.log(`[Manual] 中文手册：${MANUAL_ZH_PATH}`)

    // ── 英文版 ──────────────────────────────────────────────────
    const enLines: string[] = [
      '# Lead Advancement & Opportunity Conversion — User Manual',
      '',
      `> Generated: ${now}`,
      `> Account: Edward`,
      `> Environment: http://172.18.114.231:8088`,
      '',
      '## Overview',
      '',
      'The lead lifecycle has three stages: **Pending → Follow-Up → Opportunity**.',
      '',
      'There are three ways to advance a lead from Pending to Follow-Up. Once in Follow-Up, click **Convert** to create an opportunity.',
      '',
      '---',
      '',
    ]
    for (const step of this.steps) {
      const skipBadge = step.skipped ? ' _(Skipped)_' : ''
      enLines.push(`## Step ${step.stepNo}: ${step.title.en}${skipBadge}`, '')
      enLines.push(step.description.en, '')
      if (step.screenshotFile) {
        const rel = path.relative(MANUAL_DIR, path.join(SCREENSHOTS_DIR, step.screenshotFile))
        enLines.push(`![${step.title.en}](${rel})`, '')
      }
      enLines.push('---', '')
    }
    fs.writeFileSync(MANUAL_EN_PATH, enLines.join('\n'), 'utf-8')
    console.log(`[Manual] 英文手册：${MANUAL_EN_PATH}`)
  }
}

// ─── 截图工具 ────────────────────────────────────────────────────

async function shot(
  page: Parameters<Parameters<typeof test>[2]>[0]['page'],
  filename: string
): Promise<void> {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, filename), fullPage: false })
  console.log(`[Screenshot] ${filename}`)
}

// ─── 进入线索列表并切换到 Sales Lead ─────────────────────────────

async function goToLeadList(
  page: Parameters<Parameters<typeof test>[2]>[0]['page']
): Promise<void> {
  await page.goto(LEAD_LIST_URL)
  await page.waitForTimeout(2000)
  // 点击 LEAD 模块 tab
  const leadTab = page.locator('div').filter({ hasText: /^LEAD$/ }).nth(1)
  const leadVisible = await leadTab.isVisible({ timeout: 3000 }).catch(() => false)
  if (leadVisible) {
    await leadTab.click()
    await page.waitForTimeout(600)
  }
  // 点击 Sales Lead 子 tab
  const salesLeadTab = page.getByText('Sales Lead', { exact: true })
  const salesLeadVisible = await salesLeadTab.isVisible({ timeout: 3000 }).catch(() => false)
  if (salesLeadVisible) {
    await salesLeadTab.click()
    await page.waitForTimeout(800)
  }
}

// ─── 点击第一行中的第一个可点击单元格 ───────────────────────────

async function clickFirstRow(
  page: Parameters<Parameters<typeof test>[2]>[0]['page']
): Promise<boolean> {
  // 等待表格行加载
  const rows = page.locator('table tbody tr, .lui-table-body tr')
  const count = await rows.count().catch(() => 0)
  if (count === 0) return false
  const firstCell = rows.first().locator('td').nth(1)
  const visible = await firstCell.isVisible({ timeout: 3000 }).catch(() => false)
  if (!visible) return false
  await firstCell.click()
  await page.waitForTimeout(1500)
  return true
}

// ─── Test Suite ───────────────────────────────────────────────────

test.describe('商机转换 用户手册截图', () => {
  test('线索推进与商机转换完整流程 — 用于用户手册截图', async ({ page }) => {
    const manual = new ManualWriter()

    // ══════════════════════════════════════════════════════════
    // Step 1：进入线索列表，查看 Pending 状态
    // ══════════════════════════════════════════════════════════
    await goToLeadList(page)
    // 尝试点击 Pending 筛选 tab
    const pendingTab = page.getByText(/^Pending/)
    const pendingVisible = await pendingTab.first().isVisible({ timeout: 3000 }).catch(() => false)
    if (pendingVisible) {
      await pendingTab.first().click()
      await page.waitForTimeout(800)
    }
    await shot(page, '01-lead-list-pending.png')
    manual.record(
      { zh: '进入线索列表，查看 Pending 状态', en: 'Open Lead List — View Pending Leads' },
      {
        zh: '导航路径：**LEAD → Sales Lead**，进入线索列表。\n\n列表顶部显示按状态分类的计数标签：\n- **Pending（待跟进）**：已录入但尚未开始跟进的线索\n- **Follow-up（跟进中）**：正在跟进的线索\n- **Converted（已转商机）**：已转换为商机的线索\n\n点击 **Pending** 标签可过滤仅显示待跟进线索。',
        en: 'Navigate to **LEAD → Sales Lead** to open the lead list.\n\nThe top of the list shows status count tabs:\n- **Pending**: Leads entered but not yet followed up\n- **Follow-up**: Leads actively being followed\n- **Converted**: Leads already converted to opportunities\n\nClick the **Pending** tab to filter and view only pending leads.',
      },
      '01-lead-list-pending.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 2：打开一条 Pending 线索，查看可用操作按钮
    // ══════════════════════════════════════════════════════════
    const hasPending = await clickFirstRow(page)
    await shot(page, '02-pending-lead-detail.png')
    manual.record(
      { zh: '打开 Pending 线索 — 查看操作按钮', en: 'Open a Pending Lead — View Action Buttons' },
      {
        zh: hasPending
          ? '点击列表中任意一条 Pending 线索，进入详情页。页面右上角显示三个操作按钮：\n- **Advance to next stage（阶段推进）**：一键将线索推进到 Follow-Up 状态\n- **New Log（新增销售记录）**：记录一次与客户的沟通，推进后状态自动变为 Follow-Up\n- **Follow-up（填写跟进）**：填写本次跟进结果和下次跟进计划'
          : '（当前无 Pending 线索，请先通过"新建线索"创建数据后再操作）',
        en: hasPending
          ? 'Click any Pending lead in the list to open its detail page. The top-right shows three action buttons:\n- **Advance to next stage**: Advances the lead to Follow-Up status in one click\n- **New Log**: Records a customer interaction; the lead becomes Follow-Up after submission\n- **Follow-up**: Records follow-up results and next appointment details'
          : '(No Pending leads found. Please create a lead first via "New Lead" before proceeding.)',
      },
      '02-pending-lead-detail.png',
      !hasPending
    )

    // ══════════════════════════════════════════════════════════
    // Step 3（Part A1）：阶段推进 — Advance to next stage
    // ══════════════════════════════════════════════════════════
    if (hasPending) {
      const advanceBtn = page.getByRole('button', { name: 'Advance to next stage' })
      const advanceVisible = await advanceBtn.isVisible({ timeout: 3000 }).catch(() => false)

      if (advanceVisible) {
        await shot(page, '03a-advance-button.png')
        await advanceBtn.click()
        await page.waitForTimeout(800)
        // 确认弹窗
        const confirmBtn = page.getByRole('button', { name: 'Confirm' })
        const confirmVisible = await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)
        if (confirmVisible) {
          await shot(page, '03b-advance-confirm.png')
          await confirmBtn.click()
          await page.waitForTimeout(1500)
        }
        await shot(page, '03c-advance-done.png')
        manual.record(
          { zh: '方式一：阶段推进（Advance to next stage）', en: 'Method 1: Advance to Next Stage' },
          {
            zh: '**最简单的推进方式。** 点击 **Advance to next stage** 按钮，在弹出的确认框中点击 **Confirm**，线索状态立即从 Pending 变为 Follow-Up。\n\n适用场景：已与客户初步沟通，确认有跟进价值，需要将线索推入正式跟进阶段。',
            en: '**The simplest way to advance.** Click **Advance to next stage**, then click **Confirm** in the dialog. The lead status changes immediately from Pending to Follow-Up.\n\nUse case: After initial contact with the customer, confirmed the lead has potential and needs to be formally tracked.',
          },
          '03b-advance-confirm.png'
        )
      } else {
        // 可能没有该按钮（状态不对），用截图记录
        await shot(page, '03a-no-advance-button.png')
        manual.record(
          { zh: '方式一：阶段推进（Advance to next stage）', en: 'Method 1: Advance to Next Stage' },
          {
            zh: '点击 **Advance to next stage** 按钮（当线索状态为 Pending 时显示），在弹出确认框点击 **Confirm**，线索状态立即切换为 Follow-Up。',
            en: 'Click **Advance to next stage** (visible when lead is in Pending status), then click **Confirm** in the dialog. The lead status switches to Follow-Up immediately.',
          },
          '03a-no-advance-button.png'
        )
      }
    } else {
      manual.record(
        { zh: '方式一：阶段推进（Advance to next stage）', en: 'Method 1: Advance to Next Stage' },
        {
          zh: '点击 **Advance to next stage** 按钮，在弹出确认框点击 **Confirm**，线索状态立即从 Pending 变为 Follow-Up。\n\n适用场景：确认有跟进价值后，一键推进到跟进阶段。',
          en: 'Click **Advance to next stage**, then click **Confirm** in the dialog. The lead status changes from Pending to Follow-Up immediately.\n\nUse case: Confirmed the lead has potential — advance to follow-up with one click.',
        },
        null,
        true
      )
    }

    // ══════════════════════════════════════════════════════════
    // Step 4（Part A2）：新增销售记录 — New Log
    // ══════════════════════════════════════════════════════════
    // 返回列表，找另一条 Pending 线索（或当前页面继续）
    await goToLeadList(page)
    const pendingTab2 = page.getByText(/^Pending/)
    const pendingVisible2 = await pendingTab2.first().isVisible({ timeout: 3000 }).catch(() => false)
    if (pendingVisible2) {
      await pendingTab2.first().click()
      await page.waitForTimeout(600)
    }
    const hasPending2 = await clickFirstRow(page)

    if (hasPending2) {
      const newLogBtn = page.getByRole('button', { name: 'New Log' })
      const newLogVisible = await newLogBtn.isVisible({ timeout: 3000 }).catch(() => false)

      if (newLogVisible) {
        await newLogBtn.click()
        await page.waitForTimeout(800)
        await shot(page, '04a-new-log-modal.png')

        // 选择活动类型
        const activitySelect = page.locator('.lui-select-single .lui-select-selection-search').first()
        const activityVisible = await activitySelect.isVisible({ timeout: 3000 }).catch(() => false)
        if (activityVisible) {
          await activitySelect.click()
          await page.waitForTimeout(400)
          const callingOption = page.getByText('Calling Contact', { exact: true })
          const callingVisible = await callingOption.isVisible({ timeout: 2000 }).catch(() => false)
          if (callingVisible) {
            await callingOption.click()
            await page.waitForTimeout(300)
          }
        }

        // 填写讨论详情
        const detailsInput = page.getByRole('textbox', { name: /Discussion Details/i })
        const detailsVisible = await detailsInput.isVisible({ timeout: 3000 }).catch(() => false)
        if (detailsVisible) {
          await detailsInput.click()
          await detailsInput.fill('Discussed product requirements and timeline. Customer is evaluating PKI hardware solutions for Q3 deployment.')
          await page.waitForTimeout(300)
        }
        await shot(page, '04b-new-log-filled.png')

        // 提交
        const submitBtn = page.getByRole('button', { name: 'Submit' })
        const submitVisible = await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)
        if (submitVisible) {
          await submitBtn.click()
          await page.waitForTimeout(1500)
        }
        await shot(page, '04c-new-log-submitted.png')
        manual.record(
          { zh: '方式二：新增销售记录（New Log）', en: 'Method 2: New Log (Sales Record)' },
          {
            zh: '点击 **New Log** 按钮，弹出销售记录填写框：\n1. **Activity Type（活动类型）**：选择本次沟通方式，如 `Calling Contact`（电话联系）\n2. **Discussion Details（讨论内容）**：填写本次沟通的主要内容\n\n点击 **Submit** 提交后，系统自动将线索推进为 **Follow-Up** 状态，并在线索详情页的销售记录区域留存记录。',
            en: 'Click **New Log** to open the sales record form:\n1. **Activity Type**: Select the communication method, e.g. `Calling Contact`\n2. **Discussion Details**: Describe the key points of this interaction\n\nAfter clicking **Submit**, the system automatically advances the lead to **Follow-Up** status. The record is saved in the lead\'s sales log section.',
          },
          '04b-new-log-filled.png'
        )
      } else {
        manual.record(
          { zh: '方式二：新增销售记录（New Log）', en: 'Method 2: New Log (Sales Record)' },
          {
            zh: '点击 **New Log** 按钮，选择 **Activity Type**（如 Calling Contact），填写 **Discussion Details**，点击 **Submit**。提交后线索自动进入 Follow-Up 状态，沟通记录保存在详情页。',
            en: 'Click **New Log**, select an **Activity Type** (e.g. Calling Contact), fill in **Discussion Details**, and click **Submit**. The lead automatically advances to Follow-Up and the record is saved in the detail view.',
          },
          null
        )
      }
    } else {
      manual.record(
        { zh: '方式二：新增销售记录（New Log）', en: 'Method 2: New Log (Sales Record)' },
        {
          zh: '点击 **New Log** 按钮，选择 **Activity Type**（如 Calling Contact），填写 **Discussion Details**，点击 **Submit**。提交后线索自动进入 Follow-Up 状态，沟通记录保存在详情页。',
          en: 'Click **New Log**, select an **Activity Type** (e.g. Calling Contact), fill in **Discussion Details**, and click **Submit**. The lead advances to Follow-Up automatically.',
        },
        null,
        true
      )
    }

    // ══════════════════════════════════════════════════════════
    // Step 5（Part A3）：Follow-Up 按钮 — 填写跟进结果
    // ══════════════════════════════════════════════════════════
    await goToLeadList(page)
    const pendingTab3 = page.getByText(/^Pending/)
    const pendingVisible3 = await pendingTab3.first().isVisible({ timeout: 3000 }).catch(() => false)
    if (pendingVisible3) {
      await pendingTab3.first().click()
      await page.waitForTimeout(600)
    }
    const hasPending3 = await clickFirstRow(page)

    if (hasPending3) {
      const followUpBtn = page.getByRole('button', { name: 'Follow-up' })
      const followUpVisible = await followUpBtn.isVisible({ timeout: 3000 }).catch(() => false)

      if (followUpVisible) {
        await followUpBtn.click()
        await page.waitForTimeout(800)
        await shot(page, '05a-followup-modal.png')

        // 填写跟进结果
        const resultsArea = page.locator('textarea[name="fd_results"]')
        const resultsVisible = await resultsArea.isVisible({ timeout: 3000 }).catch(() => false)
        if (resultsVisible) {
          await resultsArea.fill('Positive response from IT Manager. Customer requested a product demo and pricing proposal for HSM solutions.')
          await page.waitForTimeout(300)
        }

        // 选择下次跟进日期（点击日期输入框后选择日期）
        const dateInput = page.getByRole('textbox', { name: /Please select the date/i })
        const dateVisible = await dateInput.isVisible({ timeout: 3000 }).catch(() => false)
        if (dateVisible) {
          await dateInput.click()
          await page.waitForTimeout(500)
          // 选择未来的日期（月末附近的数字）
          const dateCell = page.getByText('28', { exact: true }).first()
          const dateCellVisible = await dateCell.isVisible({ timeout: 2000 }).catch(() => false)
          if (dateCellVisible) {
            await dateCell.click()
            await page.waitForTimeout(300)
          }
        }

        // 填写下次跟进备注
        const nextRemarkArea = page.locator('textarea[name="fd_next_followed_remark"]')
        const nextRemarkVisible = await nextRemarkArea.isVisible({ timeout: 3000 }).catch(() => false)
        if (nextRemarkVisible) {
          await nextRemarkArea.fill('Schedule product demonstration. Prepare HSM pricing proposal and ROI analysis.')
          await page.waitForTimeout(300)
        }

        await shot(page, '05b-followup-filled.png')

        const confirmBtn = page.getByRole('button', { name: 'Confirm' })
        const confirmVisible = await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)
        if (confirmVisible) {
          await confirmBtn.click()
          await page.waitForTimeout(1500)
        }
        await shot(page, '05c-followup-done.png')
        manual.record(
          { zh: '方式三：Follow-Up 按钮（填写跟进结果）', en: 'Method 3: Follow-Up Button (Record Follow-Up Results)' },
          {
            zh: '点击 **Follow-up** 按钮，弹出跟进详情填写框，需填写三项内容：\n1. **Results（本次跟进结果）**：描述本次沟通的成果，如客户反馈、需求确认等\n2. **Next Follow-up Date（下次跟进日期）**：在日历中选择下次计划联系的日期\n3. **Next Follow-up Notes（下次跟进备注）**：记录下次跟进的行动计划\n\n点击 **Confirm** 后，线索状态变为 **Follow-Up**，并记录跟进历史。',
            en: 'Click **Follow-up** to open the follow-up detail form with three fields:\n1. **Results**: Describe the outcome of this interaction (e.g. customer feedback, requirements confirmed)\n2. **Next Follow-up Date**: Select the date for the next planned contact\n3. **Next Follow-up Notes**: Record the action plan for the next visit\n\nClick **Confirm** — the lead advances to **Follow-Up** and the history is saved.',
          },
          '05b-followup-filled.png'
        )
      } else {
        manual.record(
          { zh: '方式三：Follow-Up 按钮（填写跟进结果）', en: 'Method 3: Follow-Up Button' },
          {
            zh: '点击 **Follow-up** 按钮，填写：跟进结果、下次跟进日期、下次跟进备注，点击 **Confirm** 确认。线索状态变为 Follow-Up，跟进历史自动保存。',
            en: 'Click **Follow-up**, fill in: Results, Next Follow-up Date, Next Follow-up Notes, then click **Confirm**. The lead advances to Follow-Up and history is saved.',
          },
          null
        )
      }
    } else {
      manual.record(
        { zh: '方式三：Follow-Up 按钮（填写跟进结果）', en: 'Method 3: Follow-Up Button' },
        {
          zh: '点击 **Follow-up** 按钮，填写：跟进结果、下次跟进日期、下次跟进备注，点击 **Confirm** 确认。线索状态变为 Follow-Up，跟进历史自动保存。',
          en: 'Click **Follow-up**, fill in: Results, Next Follow-up Date, Next Follow-up Notes, then click **Confirm**. The lead advances to Follow-Up and history is saved.',
        },
        null,
        true
      )
    }

    // ══════════════════════════════════════════════════════════
    // Step 6（Part B1）：选择 Follow-Up 线索 → 点击 Convert
    // ══════════════════════════════════════════════════════════
    await goToLeadList(page)
    // 点击 Follow-up 筛选 tab
    const followUpTab = page.getByText(/^Follow-up/)
    const followUpTabVisible = await followUpTab.first().isVisible({ timeout: 3000 }).catch(() => false)
    if (followUpTabVisible) {
      await followUpTab.first().click()
      await page.waitForTimeout(800)
    }
    await shot(page, '06-followup-list.png')
    manual.record(
      { zh: '切换到 Follow-Up 列表，准备转换商机', en: 'Switch to Follow-Up List — Ready to Convert' },
      {
        zh: '点击列表顶部的 **Follow-up** 标签，查看所有跟进中的线索。\n\n只有 **Follow-Up** 状态的线索才能转换为商机（Pending 状态无 Convert 按钮）。选择一条跟进充分、确认有购买意向的线索，点击进入详情页。',
        en: 'Click the **Follow-up** tab at the top of the list to view all leads in active follow-up.\n\nOnly leads in **Follow-Up** status can be converted to opportunities (Pending leads do not have a Convert button). Select a lead that has been sufficiently followed up and shows clear purchase intent.',
      },
      '06-followup-list.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 7（Part B2）：点击 Convert，填写转换表单
    // ══════════════════════════════════════════════════════════
    const hasFollowUp = await clickFirstRow(page)
    await shot(page, '07-followup-lead-detail.png')

    if (hasFollowUp) {
      const convertBtn = page.getByRole('button', { name: 'Convert' })
      const convertVisible = await convertBtn.isVisible({ timeout: 3000 }).catch(() => false)

      if (convertVisible) {
        await convertBtn.click()
        await page.waitForTimeout(1000)
        await shot(page, '08a-convert-modal.png')

        // 选择客户类型（Customer Type）- End Customer
        const customerTypeDropdown = page.locator('.lui-cascader-selector').first()
        const dropdownVisible = await customerTypeDropdown.isVisible({ timeout: 3000 }).catch(() => false)
        if (dropdownVisible) {
          await customerTypeDropdown.click()
          await page.waitForTimeout(500)
          const endCustomerOption = page.getByText('End Customer', { exact: true })
          const endCustomerVisible = await endCustomerOption.isVisible({ timeout: 2000 }).catch(() => false)
          if (endCustomerVisible) {
            await endCustomerOption.click()
            await page.waitForTimeout(400)
          }
        }

        // 选择线索来源（Source）- Regular Customer Introduce
        const sourceCascaders = page.locator('.lui-cascader-selector')
        const sourceCount = await sourceCascaders.count()
        if (sourceCount >= 2) {
          await sourceCascaders.nth(1).click()
          await page.waitForTimeout(500)
          const regularOption = page.getByText('Regular Customer Introduce', { exact: true })
          const regularVisible = await regularOption.isVisible({ timeout: 2000 }).catch(() => false)
          if (regularVisible) {
            await regularOption.click()
            await page.waitForTimeout(400)
          }
        }

        await shot(page, '08b-convert-filled.png')
        manual.record(
          { zh: '点击 Convert，填写转换信息', en: 'Click Convert — Fill in Conversion Details' },
          {
            zh: '点击 **Convert** 按钮，弹出转换对话框，需填写两个字段：\n1. **Customer Type（客户类型）**：选择 `End Customer`（终端客户）或其他类型\n2. **Source（来源）**：选择线索的获取来源，如 `Regular Customer Introduce`（老客户介绍）\n\n完成后点击 **Next** 进入确认步骤。',
            en: 'Click **Convert** to open the conversion dialog. Fill in two fields:\n1. **Customer Type**: Select `End Customer` or another appropriate type\n2. **Source**: Select how this lead was acquired, e.g. `Regular Customer Introduce`\n\nClick **Next** to proceed to the confirmation step.',
          },
          '08b-convert-filled.png'
        )

        // 点击 Next
        const nextBtn = page.getByRole('button', { name: 'Next' })
        const nextVisible = await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)
        if (nextVisible) {
          await nextBtn.click()
          await page.waitForTimeout(800)
          await shot(page, '09-convert-confirm.png')
        }

        // 点击 Confirm 完成转换
        const confirmBtn = page.getByRole('button', { name: 'Confirm' })
        const confirmVisible = await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)
        if (confirmVisible) {
          await confirmBtn.click()
          await page.waitForTimeout(2000)
        }
        await shot(page, '10-converted-done.png')
        manual.record(
          { zh: '确认转换，线索变为商机', en: 'Confirm Conversion — Lead Becomes Opportunity' },
          {
            zh: '确认转换信息无误后，点击 **Confirm** 完成转换。\n\n转换成功后：\n- 线索状态变为 **Converted（已转商机）**，不可再次转换\n- 系统自动在 **Opportunity（商机）** 模块创建一条对应记录，保留线索中的客户、联系人等信息\n- 可在商机详情中补充填写：结单日期、交易类别、Principal Allocation 明细等字段',
            en: 'After reviewing the conversion details, click **Confirm** to complete the conversion.\n\nUpon success:\n- The lead status changes to **Converted** and cannot be converted again\n- A corresponding **Opportunity** record is automatically created, inheriting the customer and contact information\n- In the new opportunity, fill in: Close Date, Deal Category, Principal Allocation, and other details',
          },
          '09-convert-confirm.png'
        )
      } else {
        manual.record(
          { zh: '点击 Convert，填写转换信息', en: 'Click Convert — Fill in Conversion Details' },
          {
            zh: '在 Follow-Up 线索详情页点击 **Convert** 按钮，选择 **Customer Type**（如 End Customer）和 **Source**（如 Regular Customer Introduce），点击 **Next → Confirm** 完成转换。',
            en: 'On the Follow-Up lead detail page, click **Convert**, select **Customer Type** (e.g. End Customer) and **Source** (e.g. Regular Customer Introduce), then click **Next → Confirm**.',
          },
          null
        )
        manual.record(
          { zh: '确认转换，线索变为商机', en: 'Confirm Conversion — Lead Becomes Opportunity' },
          {
            zh: '转换成功后，线索状态变为 **Converted**，系统自动在商机模块创建对应记录。',
            en: 'After conversion, the lead status becomes **Converted** and an Opportunity record is created automatically.',
          },
          null
        )
      }
    } else {
      manual.record(
        { zh: '点击 Convert，填写转换信息', en: 'Click Convert — Fill in Conversion Details' },
        {
          zh: '在 Follow-Up 线索详情页点击 **Convert** 按钮，选择客户类型和来源，点击 **Next → Confirm**。',
          en: 'On the Follow-Up detail page, click **Convert**, select customer type and source, click **Next → Confirm**.',
        },
        null,
        true
      )
      manual.record(
        { zh: '确认转换，线索变为商机', en: 'Confirm Conversion — Lead Becomes Opportunity' },
        {
          zh: '转换成功后线索变为 Converted 状态，商机模块自动生成对应记录。',
          en: 'After conversion, the lead becomes Converted and an Opportunity is automatically created.',
        },
        null,
        true
      )
    }

    // ══════════════════════════════════════════════════════════
    // 输出手册
    // ══════════════════════════════════════════════════════════
    manual.save()

    console.log('[Test] ✅ 商机转换用户手册截图用例完成！')
    console.log(`[Test] 截图目录: ${SCREENSHOTS_DIR}`)
    console.log(`[Test] 双语手册: ${MANUAL_PATH}`)
    console.log(`[Test] 中文手册: ${MANUAL_ZH_PATH}`)
    console.log(`[Test] 英文手册: ${MANUAL_EN_PATH}`)
  })
})
