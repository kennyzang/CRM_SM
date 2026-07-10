/**
 * 联系人 用户手册截图用例（Edward 账号）
 *
 * 目标：完整走一遍联系人新建流程，每步截图，最终生成双语 Markdown 用户手册。
 *
 * 覆盖场景：
 *   1. 进入联系人模块列表页（体现左侧导航入口）
 *   2. 打开新建联系人页面，填写全部字段
 *   3. 提交保存
 *
 * 唯一性保障：
 *   Mobile / Email 使用时间戳确保每次运行不重复。
 *   若遇到重复冲突，可前往查重页面：
 *   http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1/undefined?navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1
 *
 * 输出：
 *   截图  → src/widget/km-ltc-manual-securemetric/docs/manual/1-contact/screenshots/
 *   手册  → src/widget/km-ltc-manual-securemetric/docs/manual/1-contact/contact-user-manual.md（双语）
 *           src/widget/km-ltc-manual-securemetric/docs/manual/1-contact/contact-user-manual-zh.md（中文）
 *           src/widget/km-ltc-manual-securemetric/docs/manual/1-contact/contact-user-manual-en.md（英文）
 *
 * 运行命令：
 *   CRM_USER=edward npx playwright test \
 *     --config=config/playwright.securemetric-crm.config.ts \
 *     tests/Securemetric-CRM/manual/crm-contact-manual.spec.ts --headed
 */
import { test } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { FormTestBuilder } from '../../../src/core/FormTestBuilder'
import { generateMalaysiaContactData, generateMalaysiaPhone, generateMalaysiaEmail } from '../../../src/mock/MalaysiaMockData'
import { CONTACT_ADD_URL, CONTACT_LIST_URL, CONTACT_DEDUP_URL } from '../urls'

// 强制使用英文 locale，确保截图 UI 显示英文
test.use({ locale: 'en-US' })

// ─── 路径常量 ────────────────────────────────────────────────────
const MANUAL_DIR = path.join(process.cwd(), 'src', 'widget', 'km-ltc-manual-securemetric', 'docs', 'manual', '1-contact')
const SCREENSHOTS_DIR = path.join(MANUAL_DIR, 'screenshots')
const MANUAL_PATH = path.join(MANUAL_DIR, 'contact-user-manual.md')
const MANUAL_ZH_PATH = path.join(MANUAL_DIR, 'contact-user-manual-zh.md')
const MANUAL_EN_PATH = path.join(MANUAL_DIR, 'contact-user-manual-en.md')

const FORM_ID = 'mk_km_ltc_contacts'
const FORM_NAME = 'mk_km_ltc_contacts'
const FORM_URL          = CONTACT_ADD_URL
const LIST_URL          = CONTACT_LIST_URL
const DUPLICATE_CHECK_URL = CONTACT_DEDUP_URL

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
}

// ─── 手册生成工具 ────────────────────────────────────────────────

class ManualWriter {
  private steps: ManualStep[] = []
  private stepCounter = 0

  record(
    title: BilingualText,
    description: BilingualText,
    screenshotFile: string | null = null
  ) {
    this.stepCounter++
    this.steps.push({ stepNo: this.stepCounter, title, description, screenshotFile })
    console.log(`[Manual] Step ${this.stepCounter}: ${title.zh} / ${title.en}`)
  }

  save() {
    fs.mkdirSync(MANUAL_DIR, { recursive: true })

    const now = new Date().toLocaleString('zh-CN')

    // ── 双语版 ──────────────────────────────────────────────────
    const biLines: string[] = [
      '# 联系人新建操作 — 用户手册 / Contact Person — User Manual',
      '',
      `> 生成时间 / Generated: ${now}`,
      `> 操作账号 / Account: Edward`,
      `> 环境 / Environment: http://172.18.114.231:8088`,
      '',
      '---',
      '',
    ]
    for (const step of this.steps) {
      biLines.push(`## Step ${step.stepNo}：${step.title.zh} / ${step.title.en}`, '')
      biLines.push(`**中文说明：** ${step.description.zh}`, '')
      biLines.push(`**English：** ${step.description.en}`, '')
      if (step.screenshotFile) {
        const relPath = path.relative(MANUAL_DIR, path.join(SCREENSHOTS_DIR, step.screenshotFile))
        biLines.push(`![${step.title.en}](${relPath})`, '')
      }
      biLines.push('---', '')
    }
    fs.writeFileSync(MANUAL_PATH, biLines.join('\n'), 'utf-8')
    console.log(`[Manual] 双语手册：${MANUAL_PATH}`)

    // ── 中文版 ──────────────────────────────────────────────────
    const zhLines: string[] = [
      '# 联系人新建操作 — 用户手册',
      '',
      `> 生成时间：${now}`,
      `> 操作账号：Edward`,
      `> 环境：http://172.18.114.231:8088`,
      '',
      '---',
      '',
    ]
    for (const step of this.steps) {
      zhLines.push(`## 第 ${step.stepNo} 步：${step.title.zh}`, '')
      zhLines.push(step.description.zh, '')
      if (step.screenshotFile) {
        const relPath = path.relative(MANUAL_DIR, path.join(SCREENSHOTS_DIR, step.screenshotFile))
        zhLines.push(`![${step.title.zh}](${relPath})`, '')
      }
      zhLines.push('---', '')
    }
    fs.writeFileSync(MANUAL_ZH_PATH, zhLines.join('\n'), 'utf-8')
    console.log(`[Manual] 中文手册：${MANUAL_ZH_PATH}`)

    // ── 英文版 ──────────────────────────────────────────────────
    const enLines: string[] = [
      '# Contact Person — User Manual',
      '',
      `> Generated: ${now}`,
      `> Account: Edward`,
      `> Environment: http://172.18.114.231:8088`,
      '',
      '---',
      '',
    ]
    for (const step of this.steps) {
      enLines.push(`## Step ${step.stepNo}: ${step.title.en}`, '')
      enLines.push(step.description.en, '')
      if (step.screenshotFile) {
        const relPath = path.relative(MANUAL_DIR, path.join(SCREENSHOTS_DIR, step.screenshotFile))
        enLines.push(`![${step.title.en}](${relPath})`, '')
      }
      enLines.push('---', '')
    }
    fs.writeFileSync(MANUAL_EN_PATH, enLines.join('\n'), 'utf-8')
    console.log(`[Manual] 英文手册：${MANUAL_EN_PATH}`)
  }
}

// ─── 页面跳转（自动重试网络错误）────────────────────────────────

type Page = Parameters<Parameters<typeof test>[2]>[0]['page']

async function gotoWithRetry(page: Page, url: string, retries = 3): Promise<void> {
  for (let i = 1; i <= retries; i++) {
    if (i === 1) {
      await page.goto(url)
    } else {
      // SPA hash 路由：reload 比重新 goto 更能恢复
      await page.reload({ waitUntil: 'domcontentloaded' })
    }
    await page.waitForTimeout(2500)
    const isNetworkError = await page
      .locator('text=Click or tap the page to reload')
      .isVisible({ timeout: 1500 })
      .catch(() => false)
    if (!isNetworkError) {
      console.log(`[Nav] 导航成功 (尝试 ${i}/${retries})`)
      return
    }
    console.log(`[Nav] 网络错误，第 ${i}/${retries} 次重试 ${url}`)
    await page.waitForTimeout(5000)
  }
  console.log('[Nav] 重试耗尽，继续执行')
}

// ─── 等待列表加载完成 ─────────────────────────────────────────────

async function waitForListLoaded(page: Page): Promise<void> {
  // 等待表格行真正渲染（实际 DOM 为标准 tbody tr）
  await page.waitForSelector('tbody tr', { timeout: 15000 }).catch(() => {
    console.log('[Nav] waitForListLoaded: 未找到 tbody tr，继续截图')
  })
  // 再等 loading spinner 消失
  await page.waitForFunction(
    () => {
      const containers = document.querySelectorAll<HTMLElement>(
        '.lui-spin-container, .lui-spin-nested-loading, .ele-list-loading, .ele-loading'
      )
      for (const el of containers) {
        const style = window.getComputedStyle(el)
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
          const spin = el.querySelector<HTMLElement>('[class*="spin"]')
          if (spin) {
            const spinStyle = window.getComputedStyle(spin)
            if (spinStyle.animationName !== 'none') return false
          }
        }
      }
      return true
    },
    { timeout: 10000 }
  ).catch(() => {
    console.log('[Nav] waitForListLoaded timeout，继续截图')
  })
  await page.waitForTimeout(500)
}

// ─── 截图工具 ────────────────────────────────────────────────────

async function shot(page: Page, filename: string): Promise<void> {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
  const fullPath = path.join(SCREENSHOTS_DIR, filename)
  await page.screenshot({ path: fullPath, fullPage: false })
  console.log(`[Screenshot] ${filename}`)
}

// ─── Test Suite ───────────────────────────────────────────────────

test.describe('联系人 用户手册截图', () => {
  test('联系人新建完整流程 — 用于用户手册截图', async ({ page }) => {
    const builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: './src/schemas/Securemetric-CRM/base/securemetric-crm',
    })
    const manual = new ManualWriter()

    await builder.initialize()

    // 生成联系人数据（无时间戳，重复时由本地重试机制处理）
    const contactData = generateMalaysiaContactData()

    console.log('\n📋 生成的联系人数据:')
    console.log(`   姓名: ${contactData.name}`)
    console.log(`   性别: ${contactData.gender.label}`)
    console.log(`   部门: ${contactData.department}`)
    console.log(`   职务: ${contactData.jobTitle}`)
    console.log(`   手机: ${contactData.mobile}`)
    console.log(`   邮件: ${contactData.email}`)
    console.log(`   地址: ${contactData.address}\n`)

    // ══════════════════════════════════════════════════════════
    // Step 1：进入联系人列表（体现左侧导航入口 + 列表）
    // ══════════════════════════════════════════════════════════
    await gotoWithRetry(page, LIST_URL)
    await page.waitForTimeout(2000)
    await waitForListLoaded(page)
    await shot(page, '01-contact-list.png')
    manual.record(
      { zh: '进入联系人模块', en: 'Open Contact Person Module' },
      {
        zh: `在左侧导航中点击 **Contact Person**，进入联系人列表（[直达链接](${LIST_URL})）。列表显示所有已建联系人记录；点击右上角 **Create** 按钮开始新建。`,
        en: `Click **Contact Person** in the left navigation to open the contact list ([direct link](${LIST_URL})). All existing records are listed here. Click the **Create** button in the top-right corner to start creating a new contact.`,
      },
      '01-contact-list.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 2：填写联系人信息
    // ══════════════════════════════════════════════════════════
    await builder.navigate()
    await page.waitForTimeout(1500)

    // Customer（关联）— RelationFiller 自动通过 API 获取候选项并随机选一条
    await builder.fillField('fd_account_id')
    await page.waitForTimeout(500)

    // Type（必填）
    await builder.fillField('fd_record_type', '1')
    await page.waitForTimeout(300)

    // Name（必填）
    await builder.fillField('fd_name', contactData.name)
    await page.waitForTimeout(300)

    // Gender（必填）
    await builder.fillField('fd_gender', contactData.gender.value)
    await page.waitForTimeout(300)

    // Department / Job Title
    await builder.fillField('fd_department', contactData.department)
    await page.waitForTimeout(200)
    await builder.fillField('fd_job_title', contactData.jobTitle)
    await page.waitForTimeout(200)

    // Contact info — Mobile & Email with timestamp uniqueness
    await builder.fillField('fd_mobile', contactData.mobile)
    await page.waitForTimeout(200)
    await builder.fillField('fd_email', contactData.email)
    await page.waitForTimeout(200)
    await builder.fillField('fd_tel', contactData.phone)
    await page.waitForTimeout(200)
    await builder.fillField('fd_add', contactData.address)
    await page.waitForTimeout(300)

    // Optional fields
    if (contactData.remark) {
      await builder.fillField('fd_remark', contactData.remark)
      await page.waitForTimeout(200)
    }
    if (contactData.influenceLevel) {
      await builder.fillField('fd_influence_level', contactData.influenceLevel)
      await page.waitForTimeout(200)
    }
    if (contactData.relationship) {
      await builder.fillField('fd_position', contactData.relationship)
      await page.waitForTimeout(200)
    }

    // 等待表单所有 loading 消失后再截图
    await waitForListLoaded(page)
    await shot(page, '02-form-filled.png')
    manual.record(
      { zh: '填写联系人信息', en: 'Fill in Contact Details' },
      {
        zh: `点击 **Create** 进入新建表单后，依次填写各字段（标红星号 * 为必填）：\n\n` +
            `- **Customer**：关联已有客户记录，从弹窗列表中选择\n` +
            `- **Type**（必填）：选择联系人业务类型，如 Customer Contact\n` +
            `- **Name**（必填）：联系人全名\n` +
            `- **Gender**（必填）：选择性别\n` +
            `- **Department / Job Title**：所在部门与职务\n` +
            `- **Mobile / Email**：手机号与邮箱（系统会校验唯一性；若提示重复，请前往[查重页面](${DUPLICATE_CHECK_URL})确认）\n` +
            `- **Office Phone / Address**：办公电话与地址\n` +
            `- **Notes / Role in Decision / Relationship**：可选，建议按实际填写`,
        en: `After clicking **Create**, fill in the form fields (* = required):\n\n` +
            `- **Customer**: Link to an existing customer record by selecting from the pop-up list\n` +
            `- **Type** *(required)*: Select the contact's business type, e.g. Customer Contact\n` +
            `- **Name** *(required)*: Full name of the contact\n` +
            `- **Gender** *(required)*: Select gender\n` +
            `- **Department / Job Title**: The contact's department and role\n` +
            `- **Mobile / Email**: Phone and email (must be unique; if a duplicate error appears, use the [Duplicate Check](${DUPLICATE_CHECK_URL}) page to look up existing contacts)\n` +
            `- **Office Phone / Address**: Office phone number and address\n` +
            `- **Notes / Role in Decision / Relationship**: Optional fields — fill in as needed`,
      },
      '02-form-filled.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 3：提交保存，保存后返回列表截图
    // ══════════════════════════════════════════════════════════
    console.log('\n[Test] 🚀 提交表单...')
    let submitSuccess = await builder.submit()
    await page.waitForTimeout(800)

    // ── 本地重试：Mobile / Email 与已有记录重复 ─────────────────
    if (!submitSuccess) {
      const isDuplicate = await page.evaluate(() => {
        const keywords = ['already exists', 'duplicate', 'exists', '已存在', '重复']
        const selectors = [
          '.ele-message-error', '.lui-message-error',
          '.el-form-item__error', '.ele-xform-fieldset-error',
          '.ele-message', '.lui-message',
        ]
        for (const sel of selectors) {
          for (const el of Array.from(document.querySelectorAll(sel))) {
            if (keywords.some(kw => el.textContent?.includes(kw))) return true
          }
        }
        return false
      })

      if (isDuplicate) {
        console.log('[Test] ⚠️ 检测到重复错误，本地重新生成 Mobile / Email 并重试（不重启测试）')
        const newMobile = generateMalaysiaPhone()
        const newEmail  = generateMalaysiaEmail()
        console.log(`[Test]   → 新 Mobile: ${newMobile}`)
        console.log(`[Test]   → 新 Email:  ${newEmail}`)
        await builder.fillField('fd_mobile', newMobile)
        await page.waitForTimeout(200)
        await builder.fillField('fd_email', newEmail)
        await page.waitForTimeout(200)
        submitSuccess = await builder.submit()
        await page.waitForTimeout(800)
      }
    }

    // 保存成功后导航回列表，展示新建记录已出现在列表中
    await gotoWithRetry(page, LIST_URL)
    await waitForListLoaded(page)
    await shot(page, '03-saved.png')
    manual.record(
      { zh: '保存联系人', en: 'Save the Contact Record' },
      {
        zh: `确认所有必填字段已填写后，点击右上角 **Save** 按钮。提交成功后系统返回联系人列表（[直达链接](${LIST_URL})），新建记录已出现在列表中。若出现 Mobile / Email 重复错误，系统将自动换值重试；如需手动排查，可前往[查重页面](${DUPLICATE_CHECK_URL})。`,
        en: `Once all required fields are filled, click the **Save** button in the top-right corner. After a successful save, the system returns to the contact list ([direct link](${LIST_URL})) where the new record is now visible. If a duplicate error occurs for Mobile or Email, the test will automatically retry with new values; for manual lookup, visit the [Duplicate Check page](${DUPLICATE_CHECK_URL}).`,
      },
      '03-saved.png'
    )

    // ══════════════════════════════════════════════════════════
    // 输出用户手册 Markdown
    // ══════════════════════════════════════════════════════════
    manual.save()

    console.log('[Test] ✅ 联系人用户手册截图用例完成！')
    console.log(`[Test] 截图目录: ${SCREENSHOTS_DIR}`)
    console.log(`[Test] 双语手册: ${MANUAL_PATH}`)
    console.log(`[Test] 中文手册: ${MANUAL_ZH_PATH}`)
    console.log(`[Test] 英文手册: ${MANUAL_EN_PATH}`)
  })
})
