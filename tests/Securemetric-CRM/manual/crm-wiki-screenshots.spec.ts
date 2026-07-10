/**
 * Wiki 截图用例 — Contact / Lead / Customer / Contract / Opportunity
 * 账号：yuwin（CRM_USER=yuwin）
 *
 * 目标：替换 wiki/assets/ 中的旧 .jpg 截图为 Playwright 生成的 .png
 *
 * 运行全部：
 *   CRM_USER=yuwin npx playwright test \
 *     --config=config/playwright.securemetric-crm.config.ts \
 *     tests/Securemetric-CRM/manual/crm-wiki-screenshots.spec.ts --headed
 *
 * 单模块重跑（--grep 匹配 describe 名）：
 *   ... --grep "Contact" --headed
 *   ... --grep "Lead" --headed
 *   ... --grep "Customer" --headed
 *   ... --grep "Contract" --headed
 *   ... --grep "Opportunity" --headed
 *
 * 输出目录：wiki/assets/
 * 输出文件命名：完全匹配原有 .jpg 文件名（扩展名改为 .png）
 */
import { test, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const WIKI_ASSETS = path.join(process.cwd(), 'wiki', 'assets')
fs.mkdirSync(WIKI_ASSETS, { recursive: true })

// ─── URL 常量 ─────────────────────────────────────────────────────────────────

const B = 'http://172.18.114.231:8088'
const NAV = '1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1'

const URLS = {
  contact: {
    list:   `${B}/web/#/current/sys-modeling/app/km-ltc/listView/1hvp2cluhw58w6l8fw3611h2s3vd75k91dw1/1i20pgcrdw6awilsw3ip2cvq36n244duq8w1?type=list&navId=${NAV}`,
    create: `${B}/web/#/current/sys-modeling/app/km-ltc/add/1huk4vljow4bw7civw3cdgsju212d8jr1sw1`,
    duplicateCheck: `${B}/web/#/current/sys-modeling/app/km-ltc/listView/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1/undefined?navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1`,
  },
  lead: {
    list:   `${B}/web/#/current/sys-modeling/app/km-ltc/listView/1hvp24jjtw58w6kusw37gk49g2qoigpgajw1/1i1eojhciw60w46aow1nmuvgc1d4lb512vw1?type=list&navId=${NAV}`,
    create: `${B}/web/#/current/sys-modeling/app/km-ltc/add/1htdn56g4w5ew3qpn9w24s4lj72d31qpk2we`,
  },
  customer: {
    list:   `${B}/web/#/current/sys-modeling/app/km-ltc/listView/1hvp2b0bjw4vw6he8wg8l6lj3eo66ob102w1/1i1oh7vniw66w11k1w225fbfk1c7gcpr6aw1?type=list&navId=${NAV}`,
    create: `${B}/web/#/current/sys-modeling/app/km-ltc/add/1hvjheq3nw4vw4j48w3doaci42dfrsq13tw1`,
  },
  contract: {
    list:   `${B}/web/#/current/sys-modeling/app/km-ltc/listView/1jihfrrm2w5fw21uvqw2akr3e91d9p5dm2w4/1jihcnhlqw5fw21obkw2j8d8j21o7ctta3w4?type=list&navId=${NAV}`,
    create: `${B}/web/#/current/sys-modeling/app/km-ltc/add/1jihb07vbw5fw21kofw7b5qu2gcc7mo12ow4`,
  },
  opportunity: {
    list:   `${B}/web/#/current/sys-modeling/app/km-ltc/listView/1hvp2d7e8w4vw6hlbw3tpla2s2mv5r6728w1/1i1okcl85w64w1s61w3ak7jcrlsa1c81ifw1?type=list&navId=${NAV}`,
    create: `${B}/web/#/current/sys-modeling/app/km-ltc/add/1i02ls02kw5jw69bw36pppvh884viq1fciw1?lbpmTemplateId=1i0aaofkow4uw5ecpw295jcfe1h88ca3t5w1`,
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function waitReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForFunction(
    () => {
      const spinners = document.querySelectorAll(
        '.lui-spin-spinning, .ele-list-loading, [class*="spin-dot-spin"]'
      )
      return spinners.length === 0
    },
    { timeout: 10000 }
  ).catch(() => {})
  await page.waitForTimeout(800)
}

async function gotoAndWait(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await waitReady(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
}

async function shot(page: Page, filename: string): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)
  await page.screenshot({ path: path.join(WIKI_ASSETS, filename), fullPage: false })
  console.log(`[Screenshot] ✓ ${filename}`)
}

/** 点击列表第一行进入详情，返回是否成功 */
async function openFirstRecord(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('tbody tr', { timeout: 8000 })
    await page.locator('tbody tr').first().click()
    await waitReady(page)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(300)
    return true
  } catch {
    console.log('[Skip] 列表无数据行，跳过详情截图')
    return false
  }
}

/** 点击状态 Tab 并等待刷新，返回是否成功 */
async function clickStatusTab(page: Page, textPattern: RegExp): Promise<boolean> {
  const tab = page.locator('[role="tab"], .lui-tabs-tab, .ele-tab-item')
    .filter({ hasText: textPattern })
    .first()
  const visible = await tab.isVisible({ timeout: 3000 }).catch(() => false)
  if (!visible) return false
  await tab.click()
  await waitReady(page)
  return true
}

/** 等待列表页 Create 按钮可见并滚动到顶部（确保工具栏完整显示） */
async function waitForCreateButton(page: Page): Promise<void> {
  const createBtn = page.locator('button, .lui-btn, .ele-btn')
    .filter({ hasText: /\+ Create|Create|新建/i })
    .first()
  await createBtn.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {
    console.log('[Warn] Create 按钮未在 8s 内出现')
  })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact（联系人）— 2 张
// 对应：contact-001.jpg (Duplicate Check), contact-002.jpg (Create)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Contact（联系人）', () => {
  test('contact-duplicate-check + contact-create', async ({ page }) => {
    // 1. Duplicate Check 查重页面 (对应 contact-001.jpg)
    await gotoAndWait(page, URLS.contact.duplicateCheck)
    await shot(page, 'contact-001.png')

    // 2. 新建表单 (对应 contact-002.jpg)
    await gotoAndWait(page, URLS.contact.create)
    await shot(page, 'contact-002.png')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Lead（线索）— 6 张（跳过 007/008 非CRM页面）
// 对应：
//   lead-001.jpg  = Create 空白表单
//   lead-002.jpg  = Create + Select record 弹窗
//   lead-003.jpg  = 列表页
//   lead-004.jpg  = 详情页
//   lead-005.jpg  = Conversion Step2 (Contact)
//   lead-006.jpg  = Conversion Step3 (Opportunity + Products)
//   lead-007.jpg  = ⚠️ 跳过（DingTalk任务列表）
//   lead-008.jpg  = ⚠️ 跳过（Excel导入模板）
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Lead（线索）', () => {
  test('lead-create + lead-list + lead-detail + lead-convert', async ({ page }) => {
    // 1. 新建表单空白页 (对应 lead-001.jpg)
    await gotoAndWait(page, URLS.lead.create)
    await shot(page, 'lead-001.png')

    // 2. 新建表单 + Contacts Select 弹窗 (对应 lead-002.jpg)
    // 点击 Contacts 字段的关联选择器，弹出 Select record 弹窗
    const contactsField = page.locator('[data-id="fd_contacts"] .ele-rel-picker, [data-tid*="contacts"] .lui-select')
      .first()
    const hasContactsField = await contactsField.isVisible({ timeout: 3000 }).catch(() => false)
    if (hasContactsField) {
      await contactsField.click()
      await waitReady(page)
      await page.waitForTimeout(500) // 等待弹窗加载
      await shot(page, 'lead-002.png')
      // 关闭弹窗
      await page.keyboard.press('Escape')
      await waitReady(page)
    } else {
      console.log('[Skip] 未找到 Contacts 字段，lead-002.png 跳过（可手动截图替换）')
    }

    // 3. 列表页 (对应 lead-003.jpg) - 确保 Create 按钮可见
    await gotoAndWait(page, URLS.lead.list)
    await waitForCreateButton(page)
    await shot(page, 'lead-003.png')

    // 4. 详情页 — 从列表点进第一条 (对应 lead-004.jpg)
    const hasRecord = await openFirstRecord(page)
    if (hasRecord) {
      await shot(page, 'lead-004.png')
    }

    // 5. 转化弹窗 — 需要"跟进中"状态的线索才有"转化"按钮 (对应 lead-005.jpg / lead-006.jpg)
    await gotoAndWait(page, URLS.lead.list)
    const foundFollowingTab = await clickStatusTab(page, /跟进中|Following/i)
    if (foundFollowingTab) {
      const hasFollowRecord = await openFirstRecord(page)
      if (hasFollowRecord) {
        const convertBtn = page.locator('button, .lui-btn, .ele-btn')
          .filter({ hasText: /转化|Convert/i })
          .first()
        const canConvert = await convertBtn.isVisible({ timeout: 3000 }).catch(() => false)
        if (canConvert) {
          await convertBtn.click()
          await waitReady(page)

          // 5a. Conversion Step 2 - Contact 选择页 (对应 lead-005.jpg)
          await shot(page, 'lead-005.png')

          // 尝试点击 Next 进入 Step 3
          const nextBtn = page.locator('button, .lui-btn, .ele-btn')
            .filter({ hasText: /Next|下一步/i })
            .first()
          const hasNextBtn = await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)
          if (hasNextBtn) {
            await nextBtn.click()
            await waitReady(page)
            await page.waitForTimeout(500)

            // 5b. Conversion Step 3 - Opportunity + Products (对应 lead-006.jpg)
            await shot(page, 'lead-006.png')
          } else {
            console.log('[Skip] 未找到 Next 按钮，lead-006.png 跳过')
          }

          // 关闭转化弹窗
          await page.keyboard.press('Escape')
          await waitReady(page)
        } else {
          console.log('[Skip] 详情页未找到转化按钮，lead-005/006.png 跳过')
        }
      }
    } else {
      console.log('[Skip] 未找到"跟进中" Tab，lead-005/006.png 跳过')
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Customer（客户）— 3 张（原无 jpg，新增 png 供 Wiki 使用）
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Customer（客户）', () => {
  test('customer-list + customer-create + customer-detail', async ({ page }) => {
    // 1. 列表页 (对应 customer-list-001) - 确保 Create 按钮可见
    await gotoAndWait(page, URLS.customer.list)
    await waitForCreateButton(page)
    await shot(page, 'customer-list-001.png')

    // 2. 新建表单
    await gotoAndWait(page, URLS.customer.create)
    await shot(page, 'customer-create-001.png')

    // 3. 详情页
    await gotoAndWait(page, URLS.customer.list)
    await openFirstRecord(page)
    await shot(page, 'customer-detail-001.png')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Contract（合同）— 4 张
// 对应：contract-001.jpg (列表), contract-002.jpg (新建), contract-003.jpg (详情), contract-004.jpg (提醒)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Contract（合同）', () => {
  test('contract-list + contract-create + contract-detail + contract-reminder', async ({ page }) => {
    // 1. 列表页 (对应 contract-001.jpg) - 确保 Create 按钮可见
    await gotoAndWait(page, URLS.contract.list)
    await waitForCreateButton(page)
    await shot(page, 'contract-001.png')

    // 2. 新建表单 (对应 contract-002.jpg)
    await gotoAndWait(page, URLS.contract.create)
    await shot(page, 'contract-002.png')

    // 3 + 4. 从列表进入已有合同详情
    await gotoAndWait(page, URLS.contract.list)
    const hasRecord = await openFirstRecord(page)
    if (!hasRecord) {
      console.log('[Skip] 无合同记录，contract-003/004.png 跳过')
      return
    }

    // 3. 详情页顶部 (对应 contract-003.jpg)
    await shot(page, 'contract-003.png')

    // 4. 合同提醒子表 (对应 contract-004.jpg)
    const reminderTable = page.locator(
      '.ele-dt-remindlist, [data-tid*="remind"], .km-ltc-contract-remind'
    ).first()
    const hasReminderTable = await reminderTable.isVisible({ timeout: 3000 }).catch(() => false)
    if (hasReminderTable) {
      await reminderTable.scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
      await shot(page, 'contract-004.png')
    } else {
      // fallback: 滚动到页面约 50% 处
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5))
      await page.waitForTimeout(500)
      await page.screenshot({
        path: path.join(WIKI_ASSETS, 'contract-004.png'),
        fullPage: false,
      })
      console.log('[Screenshot] ✓ contract-004.png (fallback scroll)')
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Opportunity（商机）— 1 张（原 jpg 只有详情页）
// 对应：opportunity-001.jpg (详情页)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Opportunity（商机）', () => {
  test('opportunity-detail', async ({ page }) => {
    // 进入已有商机详情 (对应 opportunity-001.jpg)
    await gotoAndWait(page, URLS.opportunity.list)
    const hasRecord = await openFirstRecord(page)
    if (!hasRecord) {
      console.log('[Skip] 无商机记录，opportunity-001.png 跳过')
      return
    }

    // 详情页（顶部信息 + 子标签页行可见）
    await shot(page, 'opportunity-001.png')
  })
})
