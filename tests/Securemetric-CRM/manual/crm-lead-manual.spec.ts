/**
 * 线索 用户手册截图用例（Edward 账号）
 *
 * 目标：完整走一遍线索（Sales Lead）新建流程，每步截图，最终生成双语 Markdown 用户手册。
 *
 * 覆盖场景：
 *   1. 进入线索列表页
 *   2. 打开新建线索表单
 *   3. 选择客户类型（New Customer）
 *   4. 填写新客户名称与注册码
 *   5. 填写线索名称与销售详情
 *   5.5. 选择分类字段（Source / Lead Level / Deal Category / Contacts）
 *   6. 填写联系信息（电话/邮件/地址/网址）
 *   7. 填写 Principal Allocation 明细表（产品行）
 *   8. 提交保存
 *
 * 输出：
 *   截图  → doc/用户手册/2-线索/screenshots/
 *   手册  → doc/用户手册/2-线索/lead-user-manual.md（双语）
 *           doc/用户手册/2-线索/lead-user-manual-zh.md（中文）
 *           doc/用户手册/2-线索/lead-user-manual-en.md（英文）
 *
 * 运行命令：
 *   CRM_USER=edward npx playwright test \
 *     --config=config/playwright.securemetric-crm.config.ts \
 *     tests/Securemetric-CRM/manual/crm-lead-manual.spec.ts
 *
 *   # 有头模式：
 *   CRM_USER=edward npx playwright test \
 *     --config=config/playwright.securemetric-crm.config.ts \
 *     tests/Securemetric-CRM/manual/crm-lead-manual.spec.ts --headed
 */
import { test } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { FormTestBuilder } from '../../../src/core/FormTestBuilder'
import {
  generateBusinessLeadName,
  generateMalaysiaCustomerData,
  generateMalaysiaPhone,
  generateMalaysiaEmail,
  generateMalaysiaAddress,
  generateMalaysiaCompanyName,
  clearGeneratedCache,
} from '../../../src/mock/MalaysiaMockData'

// 强制使用英文 locale
test.use({ locale: 'en-US' })

// ─── 路径常量 ────────────────────────────────────────────────────
const MANUAL_DIR = path.join(process.cwd(), 'src', 'widget', 'km-ltc-manual-securemetric', 'docs', 'manual', '2-lead')
const SCREENSHOTS_DIR = path.join(MANUAL_DIR, 'screenshots')
const MANUAL_PATH = path.join(MANUAL_DIR, 'lead-user-manual.md')
const MANUAL_ZH_PATH = path.join(MANUAL_DIR, 'lead-user-manual-zh.md')
const MANUAL_EN_PATH = path.join(MANUAL_DIR, 'lead-user-manual-en.md')

const FORM_ID = 'mk_ltc_lead'
const FORM_URL =
  'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1htdn56g4w5ew3qpn9w24s4lj72d31qpk2we'
const LIST_URL =
  'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1'
const DETAIL_TABLE_ID = 'mk_Principal_Allocation_list'

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
      '# 线索新建操作 — 用户手册 / Sales Lead — User Manual',
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
        const rel = path.relative(MANUAL_DIR, path.join(SCREENSHOTS_DIR, step.screenshotFile))
        biLines.push(`![${step.title.en}](${rel})`, '')
      }
      biLines.push('---', '')
    }
    fs.writeFileSync(MANUAL_PATH, biLines.join('\n'), 'utf-8')
    console.log(`[Manual] 双语手册：${MANUAL_PATH}`)

    // ── 中文版 ──────────────────────────────────────────────────
    const zhLines: string[] = [
      '# 线索新建操作 — 用户手册',
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
        const rel = path.relative(MANUAL_DIR, path.join(SCREENSHOTS_DIR, step.screenshotFile))
        zhLines.push(`![${step.title.zh}](${rel})`, '')
      }
      zhLines.push('---', '')
    }
    fs.writeFileSync(MANUAL_ZH_PATH, zhLines.join('\n'), 'utf-8')
    console.log(`[Manual] 中文手册：${MANUAL_ZH_PATH}`)

    // ── 英文版 ──────────────────────────────────────────────────
    const enLines: string[] = [
      '# Sales Lead — User Manual',
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
        const rel = path.relative(MANUAL_DIR, path.join(SCREENSHOTS_DIR, step.screenshotFile))
        enLines.push(`![${step.title.en}](${rel})`, '')
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
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, filename), fullPage: false })
  console.log(`[Screenshot] ${filename}`)
}

// ─── Test Suite ───────────────────────────────────────────────────

test.describe('线索 用户手册截图', () => {
  test('线索新建完整流程 — 用于用户手册截图', async ({ page }) => {
    clearGeneratedCache()

    const builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_ID,
      url: FORM_URL,
      schemaPath: './src/schemas/Securemetric-CRM/base',
      detailTables: [
        { detailModelId: DETAIL_TABLE_ID, detailTableName: 'Principal Allocation' },
      ],
    })
    const manual = new ManualWriter()

    await builder.initialize()

    // 生成数据
    const leadName = generateBusinessLeadName()
    const newCustomer = generateMalaysiaCustomerData()
    const phone = generateMalaysiaPhone()
    const email = generateMalaysiaEmail()
    const address = generateMalaysiaAddress()
    const website = `https://www.${generateMalaysiaCompanyName().toLowerCase().replace(/[\s,.()/]+/g, '-').replace(/-+/g, '-')}.com.my`
    const remark = `Initial contact via website inquiry. Potential deal size: MYR ${(Math.random() * 400000 + 100000).toFixed(0)}. Customer is evaluating PKI and cybersecurity solutions.`

    console.log(`\n📋 线索名称: ${leadName}`)
    console.log(`   新客户: ${newCustomer.companyName}`)
    console.log(`   注册码: ${newCustomer.legalId}`)

    // ══════════════════════════════════════════════════════════
    // Step 1：进入线索列表
    // ══════════════════════════════════════════════════════════
    await gotoWithRetry(page, LIST_URL)
    await waitForListLoaded(page)
    await shot(page, '01-lead-list.png')
    manual.record(
      { zh: '进入线索列表页', en: 'Open Sales Lead List' },
      {
        zh: '在左侧导航中点击 **LEAD** 模块，选择 **Sales Lead** 子分类，进入线索列表页。列表展示所有已创建的线索记录，可通过搜索/筛选快速定位。',
        en: 'Click the **LEAD** module in the left navigation, then select **Sales Lead** to open the lead list. All existing lead records are displayed here.',
      },
      '01-lead-list.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 2：打开新建表单
    // ══════════════════════════════════════════════════════════
    await builder.navigate()
    await page.waitForTimeout(1500)
    await shot(page, '02-new-lead-form.png')
    manual.record(
      { zh: '打开新建线索表单', en: 'Open New Lead Form' },
      {
        zh: '点击列表页右上角的 **Create** 按钮，进入新建线索表单。表单分为两个区域：\n- **上方**：基本信息（客户、名称、联系方式等）\n- **下方**：Principal Allocation 明细表（产品/金额）',
        en: 'Click the **Create** button in the top-right corner. The form has two sections:\n- **Top**: Basic information (customer, name, contact details, etc.)\n- **Bottom**: Principal Allocation detail table (products and amounts)',
      },
      '02-new-lead-form.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 3：选择客户类型（New Customer）
    // ══════════════════════════════════════════════════════════
    await builder.fillField('fd_customer_name', '2')  // '2' = New Customer
    await page.waitForTimeout(800)
    await shot(page, '03-customer-type-new.png')
    manual.record(
      { zh: '选择客户类型：New Customer', en: 'Select Customer Type: New Customer' },
      {
        zh: '**Customer** 字段有两个选项：\n- **New Customer（新客户）**：第一次接触的潜在客户，需填写公司名称和注册码\n- **Existing Customer（已有客户）**：系统中已存在的客户记录，通过关联控件搜索选择\n\n选择 **New Customer** 后，下方会出现 **Customer Name** 和 **Registration No.** 输入框。',
        en: 'The **Customer** field offers two options:\n- **New Customer**: A new prospect — fill in company name and registration number\n- **Existing Customer**: A customer already in the system — select via the relation picker\n\nAfter selecting **New Customer**, the **Customer Name** and **Registration No.** fields appear below.',
      },
      '03-customer-type-new.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 4：填写新客户名称与注册码
    // ══════════════════════════════════════════════════════════
    await builder.fillField('fd_new_customer', newCustomer.companyName)
    await page.waitForTimeout(400)
    await builder.fillField('fd_registration_code', newCustomer.legalId)
    await page.waitForTimeout(500)
    await shot(page, '04-new-customer-filled.png')
    manual.record(
      { zh: '填写新客户名称与注册码', en: 'Fill in Customer Name & Registration No.' },
      {
        zh: '填写新客户的基本信息：\n- **Customer Name（公司名称）**: `' + newCustomer.companyName + '`\n- **Registration No.（注册码）**: `' + newCustomer.legalId + '`（马来西亚 SSM 格式）\n\n注册码格式示例：`202001234567`（新格式）或 `1234567-X`（旧格式）。',
        en: 'Fill in the new customer\'s basic information:\n- **Customer Name**: `' + newCustomer.companyName + '`\n- **Registration No.**: `' + newCustomer.legalId + '` (Malaysia SSM format)\n\nRegistration number formats: `202001234567` (new format) or `1234567-X` (old format).',
      },
      '04-new-customer-filled.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 5：填写线索名称与销售详情
    // ══════════════════════════════════════════════════════════
    await builder.fillField('fd_name', leadName)
    await page.waitForTimeout(400)
    await builder.fillField('fd_remark', remark)
    await page.waitForTimeout(500)
    await shot(page, '05-lead-name-details.png')
    manual.record(
      { zh: '填写线索名称与销售详情', en: 'Fill in Lead Name & Details' },
      {
        zh: '填写线索的核心信息：\n- **Lead Name（线索名称）**: 建议使用业务场景描述格式，如 `' + leadName.split('_').slice(0, 3).join(' ') + '...`，包含解决方案类型、行业和地区\n- **Details（销售详情）**: 记录与客户沟通的背景、潜在交易规模和需求描述\n\n**Lead Name 命名规范**：`{解决方案}_{行业}_{地区}_{日期}`',
        en: 'Fill in the core lead information:\n- **Lead Name**: Use a descriptive format like `' + leadName.split('_').slice(0, 3).join(' ') + '...` — include solution type, industry, and region\n- **Details**: Record communication context, estimated deal size, and requirements\n\n**Naming convention**: `{Solution}_{Industry}_{Region}_{Date}`',
      },
      '05-lead-name-details.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 5.5：填写分类、负责人与联系人（必填下拉/关联字段）
    // ══════════════════════════════════════════════════════════
    await builder.fillField('fd_entity')          // Entity（公司实体，影响产品列表过滤）
    await page.waitForTimeout(400)
    await builder.fillField('fd_source')
    await page.waitForTimeout(400)
    await builder.fillField('fd_lead_level')
    await page.waitForTimeout(400)
    await builder.fillField('fd_deal_category')
    await page.waitForTimeout(400)
    await builder.fillField('fd_leads_pool')      // Lead Queue（必填，动态单选列表）
    await page.waitForTimeout(400)
    await builder.fillField('fd_lead_stage')      // Sales Pipeline（必填，动态单选列表）
    await page.waitForTimeout(400)
    // fd_owner_people 为 address 类型（地址本弹窗），AddressFiller 暂无法自动操作此控件，跳过
    // fd_contacts 依赖 fd_owner_people，API 过滤器需要 owner 值；owner 为空时跳过
    await builder.fillField('fd_contacts').catch(() => {})
    await page.waitForTimeout(600)
    await shot(page, '05b-classification-fields.png')
    manual.record(
      { zh: '选择分类、负责人与联系人', en: 'Select Classification, Owner & Contacts' },
      {
        zh: '填写以下必填分类字段：\n- **Entity（实体）**: 选择负责此线索的公司主体\n- **Source（来源）**: 选择线索来源渠道\n- **Lead Level（线索级别）**: 选择线索优先级/等级\n- **Deal Category（交易类别）**: 选择本次交易的产品分类\n- **Lead Queue（线索池）**: 选择线索所属的分配队列\n- **Sales Pipeline（销售阶段）**: 选择线索当前所处的业务流程阶段\n- **Owner（负责人）**: 指定负责跟进该线索的销售人员\n- **Contacts（联系人）**: 关联已有联系人记录（可关联多个）',
        en: 'Fill in the required classification fields:\n- **Entity**: Select the company entity responsible for this lead\n- **Source**: Select the lead source channel\n- **Lead Level**: Select the lead priority level\n- **Deal Category**: Select the product category for this deal\n- **Lead Queue**: Select the allocation queue for this lead\n- **Sales Pipeline**: Select the current stage in the sales process\n- **Owner**: Assign the sales representative responsible for follow-up\n- **Contacts**: Link to existing contact records (multiple allowed)',
      },
      '05b-classification-fields.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 6：填写联系信息
    // ══════════════════════════════════════════════════════════
    await builder.fillField('fd_tel', phone)
    await page.waitForTimeout(300)
    await builder.fillField('fd_email', email)
    await page.waitForTimeout(300)
    await builder.fillField('fd_address', address)
    await page.waitForTimeout(300)
    await builder.fillField('fd_url', website)
    await page.waitForTimeout(500)
    await shot(page, '06-contact-info-filled.png')
    manual.record(
      { zh: '填写联系信息', en: 'Fill in Contact Information' },
      {
        zh: '填写与该线索关联的联系方式：\n- **Phone（电话）**: `' + phone + '`\n- **Email（邮件）**: `' + email + '`\n- **Address（地址）**: `' + address + '`\n- **Website（官网）**: `' + website + '`\n\n以上字段均为可选，但建议尽量填写以便后续跟进。',
        en: 'Fill in the lead\'s contact details:\n- **Phone**: `' + phone + '`\n- **Email**: `' + email + '`\n- **Address**: `' + address + '`\n- **Website**: `' + website + '`\n\nAll fields are optional but recommended for future follow-up.',
      },
      '06-contact-info-filled.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 7：填写 Principal Allocation 明细表
    // ══════════════════════════════════════════════════════════
    const amount1 = (Math.random() * 80000 + 20000).toFixed(2)
    const amount2 = (Math.random() * 60000 + 10000).toFixed(2)

    const productRows = [
      {
        [`${DETAIL_TABLE_ID}.fd_product_list`]: '__AUTO__',
        [`${DETAIL_TABLE_ID}.fd_prodcut_amt`]: amount1,
      },
      {
        [`${DETAIL_TABLE_ID}.fd_product_list`]: '__AUTO__',
        [`${DETAIL_TABLE_ID}.fd_prodcut_amt`]: amount2,
      },
    ]

    await builder.fillDetailTableWithData(productRows, DETAIL_TABLE_ID)
    await page.waitForTimeout(1000)
    await shot(page, '07-principal-allocation.png')
    manual.record(
      { zh: '填写 Principal Allocation 明细表', en: 'Fill in Principal Allocation Detail Table' },
      {
        zh: '页面下方的 **Principal Allocation** 明细表用于记录本次线索涉及的产品及预估金额：\n1. 点击 **+ Add Row** 新增一行\n2. 在 **Product（产品）** 列选择具体产品\n3. 在 **Est. Amount（预估金额）** 列填写金额（MYR）\n\n可新增多行，每行对应一个产品/厂商的报价。明细表金额会自动汇总到线索总额。',
        en: 'The **Principal Allocation** table at the bottom records the products and estimated amounts for this lead:\n1. Click **+ Add Row** to add a new row\n2. Select a product in the **Product** column\n3. Enter the estimated amount (MYR) in the **Est. Amount** column\n\nMultiple rows can be added — one per product or vendor. The total is automatically aggregated.',
      },
      '07-principal-allocation.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 8：提交保存
    // ══════════════════════════════════════════════════════════
    console.log('\n[Test] 🚀 提交表单...')
    let submitSuccess = await builder.submit()

    // ── 提交失败时：检测是否为"客户已存在"，若是则原地修改字段重试 ──
    if (!submitSuccess) {
      const isDuplicateCustomer = await page.evaluate(() => {
        const selectors = [
          '.ele-message-error',
          '.lui-message-error',
          '.el-message--error',
          '.el-form-item__error',
          '.ele-xform-fieldset-error',
        ]
        const keywords = ['已存在', 'already exists', 'duplicate', 'exists']
        for (const sel of selectors) {
          for (const el of Array.from(document.querySelectorAll(sel))) {
            if (keywords.some(kw => el.textContent?.includes(kw))) return true
          }
        }
        return false
      })

      if (isDuplicateCustomer) {
        console.log('[Test] ⚠️ 提交报"客户已存在"，原地修改客户名称和注册码后重试...')
        const retryCustomer = generateMalaysiaCustomerData()
        const tsSuffix = Date.now().toString().slice(-4)
        const retryName = `${retryCustomer.companyName}-${tsSuffix}`
        console.log(`[Test]   → 重试客户名称: ${retryName}`)
        console.log(`[Test]   → 重试注册码:   ${retryCustomer.legalId}`)
        await builder.fillField('fd_new_customer', retryName)
        await builder.fillField('fd_registration_code', retryCustomer.legalId)
        await page.waitForTimeout(300)
        submitSuccess = await builder.submit()
      }
    }
    await page.waitForTimeout(1000)
    // 保存成功后导航回列表，展示新建记录已出现在列表中
    await gotoWithRetry(page, LIST_URL)
    await waitForListLoaded(page)
    await shot(page, '08-saved.png')
    manual.record(
      { zh: '点击保存', en: 'Save the Lead Record' },
      {
        zh: submitSuccess
          ? '所有必填字段填写完成后，点击页面右上角 **Save** 按钮。提交成功后系统返回线索列表，新建记录已出现在列表首行。可进一步对该线索进行跟进或转换为商机。'
          : '所有必填字段填写完成后，点击页面右上角 **Save** 按钮提交表单。（请检查页面状态确认是否保存成功）',
        en: submitSuccess
          ? 'After completing all required fields, click the **Save** button in the top-right corner. After a successful save, the system returns to the lead list where the new record is now visible at the top. The lead can then be followed up or converted to an opportunity.'
          : 'After completing all required fields, click the **Save** button in the top-right corner. (Please verify the page status to confirm if saving was successful.)',
      },
      '08-saved.png'
    )

    // ══════════════════════════════════════════════════════════
    // 输出手册
    // ══════════════════════════════════════════════════════════
    manual.save()

    console.log('[Test] ✅ 线索用户手册截图用例完成！')
    console.log(`[Test] 截图目录: ${SCREENSHOTS_DIR}`)
    console.log(`[Test] 双语手册: ${MANUAL_PATH}`)
    console.log(`[Test] 中文手册: ${MANUAL_ZH_PATH}`)
    console.log(`[Test] 英文手册: ${MANUAL_EN_PATH}`)
  })
})
