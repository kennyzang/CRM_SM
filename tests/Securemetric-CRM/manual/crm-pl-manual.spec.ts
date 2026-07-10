/**
 * P&L 用户手册截图用例（Edward 账号）
 *
 * 目标：完整走一遍 P&L 典型操作流程，每步截图，最终生成双语 Markdown 用户手册。
 *
 * 覆盖场景：
 *   1. 新建 P&L，选择商机
 *   2. Hardware Tab — 3rd Party Hardware：
 *      第1次添加 2 个产品（截图弹窗内选中状态）
 *      第2次添加 1 个产品（截图弹窗内已选产品标记）
 *   3. 编辑一个产品，设置加价率 20%（截图 Drawer 填写完成状态）
 *   4. 将产品续费 → 切换到 hardwareRenew Tab
 *   5. 续费 Tab 同一行 Copy 两次（Year3 / Year4）
 *   6. Service Tab — 添加1个产品
 *   7. 关掉全局折扣 → 编辑折扣率 20%（截图 Drawer 内）
 *   8. 重新开启全局折扣（对比展示）
 *   9. Reimbursement Tab — SM Team 新增一行（填真实数据）
 *  10. Others Tab — 新增一行（填真实数据）
 *  11. 保存
 *
 * 输出：
 *   截图  → tests/Securemetric-CRM/manual/screenshots/
 *   视频  → tests/Securemetric-CRM/manual/output/
 *   手册  → tests/Securemetric-CRM/manual/output/pl-user-manual.md
 *
 * 运行命令（无头模式 + 录屏）：
 *   CRM_USER=edward npx playwright test \
 *     --config=config/playwright.securemetric-crm.config.ts \
 *     tests/Securemetric-CRM/manual/crm-pl-manual.spec.ts
 */
import { test } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { FormTestBuilder } from '../../../src/core/FormTestBuilder'
import { PLFiller } from '../../../src/filler/PLFiller'

// 强制使用英文 locale，确保截图 UI 显示英文
test.use({ locale: 'en-US' })

// ─── 路径常量 ────────────────────────────────────────────────────
const WIDGET_DIR = path.join(__dirname, '../../../src/widget/km-ltc-manual-securemetric')
const OUTPUT_DIR = path.join(WIDGET_DIR, 'docs', 'manual', '4-P&L')
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots')
const MANUAL_PATH = path.join(OUTPUT_DIR, 'pl-user-manual.md')
const MANUAL_ZH_PATH = path.join(OUTPUT_DIR, 'pl-user-manual-zh.md')
const MANUAL_EN_PATH = path.join(OUTPUT_DIR, 'pl-user-manual-en.md')

const FORM_ID = 'mk_km_ltc_pl'
const FORM_NAME = 'CRM P&L_Securemetric'
const FORM_URL =
  'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1jolf9tffwfwtegbw1dkpp192vc2vnk3nqw0'


// ─── 手册生成工具（双语） ────────────────────────────────────────

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
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })

    const now = new Date().toLocaleString('zh-CN')

    // ── 双语版 ──────────────────────────────────────────────
    const biLines: string[] = [
      '# P&L 新建操作 — 用户手册 / P&L Creation — User Manual',
      '',
      `> 生成时间 / Generated: ${now}`,
      `> 操作账号 / Account: Edward`,
      `> 环境 / Environment: http://172.18.114.231:8088`,
      '',
    ]
    biLines.push('---', '')
    for (const step of this.steps) {
      biLines.push(`## Step ${step.stepNo}：${step.title.zh} / ${step.title.en}`, '')
      biLines.push(`**中文说明：** ${step.description.zh}`, '')
      biLines.push(`**English：** ${step.description.en}`, '')
      if (step.screenshotFile) {
        const relPath = path.relative(OUTPUT_DIR, path.join(SCREENSHOTS_DIR, step.screenshotFile))
        biLines.push(`![${step.title.en}](${relPath})`, '')
      }
      biLines.push('---', '')
    }
    fs.writeFileSync(MANUAL_PATH, biLines.join('\n'), 'utf-8')
    console.log(`[Manual] 双语手册：${MANUAL_PATH}`)

    // ── 中文版 ──────────────────────────────────────────────
    const zhLines: string[] = [
      '# P&L 新建操作 — 用户手册',
      '',
      `> 生成时间：${now}`,
      `> 操作账号：Edward`,
      `> 环境：http://172.18.114.231:8088`,
      '',
    ]
    zhLines.push('---', '')
    for (const step of this.steps) {
      zhLines.push(`## 第 ${step.stepNo} 步：${step.title.zh}`, '')
      zhLines.push(step.description.zh, '')
      if (step.screenshotFile) {
        const relPath = path.relative(OUTPUT_DIR, path.join(SCREENSHOTS_DIR, step.screenshotFile))
        zhLines.push(`![${step.title.zh}](${relPath})`, '')
      }
      zhLines.push('---', '')
    }
    fs.writeFileSync(MANUAL_ZH_PATH, zhLines.join('\n'), 'utf-8')
    console.log(`[Manual] 中文手册：${MANUAL_ZH_PATH}`)

    // ── 英文版 ──────────────────────────────────────────────
    const enLines: string[] = [
      '# P&L Creation — User Manual',
      '',
      `> Generated: ${now}`,
      `> Account: Edward`,
      `> Environment: http://172.18.114.231:8088`,
      '',
    ]
    enLines.push('---', '')
    for (const step of this.steps) {
      enLines.push(`## Step ${step.stepNo}: ${step.title.en}`, '')
      enLines.push(step.description.en, '')
      if (step.screenshotFile) {
        const relPath = path.relative(OUTPUT_DIR, path.join(SCREENSHOTS_DIR, step.screenshotFile))
        enLines.push(`![${step.title.en}](${relPath})`, '')
      }
      enLines.push('---', '')
    }
    fs.writeFileSync(MANUAL_EN_PATH, enLines.join('\n'), 'utf-8')
    console.log(`[Manual] 英文手册：${MANUAL_EN_PATH}`)
  }
}

// ─── 截图工具 ────────────────────────────────────────────────────

/** 网络错误页面关键词（出现时跳过截图） */
const NETWORK_ERROR_TEXTS = [
  'Click or tap the page to reload',
  'failed to load',
  'check if your network',
]

async function isNetworkErrorPage(
  page: Parameters<Parameters<typeof test>[2]>[0]['page']
): Promise<boolean> {
  try {
    const bodyText = await page.evaluate(() => document.body?.innerText ?? '')
    return NETWORK_ERROR_TEXTS.some(t => bodyText.includes(t))
  } catch {
    return false
  }
}

async function shot(
  page: Parameters<Parameters<typeof test>[2]>[0]['page'],
  filename: string
): Promise<void> {
  if (await isNetworkErrorPage(page)) {
    console.warn(`[Screenshot] SKIPPED (network error page): ${filename}`)
    return
  }
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
  const fullPath = path.join(SCREENSHOTS_DIR, filename)
  await page.screenshot({ path: fullPath, fullPage: false })
  console.log(`[Screenshot] ${filename}`)
}

// ─── 行悬停工具（触发操作按钮显示） ─────────────────────────────

async function hoverFirstProductRow(
  page: Parameters<Parameters<typeof test>[2]>[0]['page']
): Promise<void> {
  const row = page
    .locator('[data-testid="pl-product-row"], tr.lui-table-row')
    .first()
  const visible = await row.isVisible({ timeout: 3000 }).catch(() => false)
  if (visible) {
    await row.hover()
    await page.waitForTimeout(500)
  }
}

// ─── Test Suite ───────────────────────────────────────────────────

test.describe('P&L 用户手册截图', () => {
  let builder: FormTestBuilder
  let plFiller: PLFiller
  let manual: ManualWriter

  test.beforeEach(async ({ page }) => {
    builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: './src/schemas/Securemetric-CRM/base',
      schemaMaxAgeHours: 168,
    })
    plFiller = new PLFiller(page)
    manual = new ManualWriter()
    await builder.initialize()
  })

  test('P&L 新建完整流程 — 用于用户手册截图', async ({ page }) => {

    // ══════════════════════════════════════════════════════════
    // Step 1：打开新建页面
    // ══════════════════════════════════════════════════════════
    await builder.navigate()
    await page.waitForTimeout(1500)
    await shot(page, '01-new-pl-page.png')
    manual.record(
      { zh: '进入 P&L 新建页面', en: 'Open P&L New Page' },
      {
        zh: '点击"新建"进入 P&L 利润表新建页面。页面顶部为基本信息区域，底部为产品明细区域（Tabs）。',
        en: 'Click "New" to open the P&L creation page. The top section contains basic information; the bottom section shows product detail tabs.',
      },
      '01-new-pl-page.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 2：填写必填字段（商机）
    // ══════════════════════════════════════════════════════════
    const schema = builder.getSchema()
    const requiredFields = (schema?.fields ?? []).filter(
      f => f.required && f.id !== 'fd_products_table'
    )
    for (const field of requiredFields) {
      await builder.fillField(field.id)
      await page.waitForTimeout(500)
    }
    await shot(page, '02-opportunity-selected.png')
    manual.record(
      { zh: '选择关联商机', en: 'Select Linked Opportunity' },
      {
        zh: '在"关联商机"字段中搜索并选择对应的商机记录。商机选定后，页面下方 P&L 产品区域开始渲染。',
        en: 'Search and select an opportunity in the "Opportunity" field. Once selected, the P&L product section below starts rendering.',
      },
      '02-opportunity-selected.png'
    )

    // ══════════════════════════════════════════════════════════
    // 等待 P&L 渲染（Hardware 为默认页签，无需手动切换）
    // ══════════════════════════════════════════════════════════
    await plFiller.waitForReady(15000)
    await page.waitForTimeout(800)
    // 同步内部 currentTab 状态，使 PLFiller 方法能正确判断 markup/discount 可见性
    await plFiller.clickTab('hardware')

    // ══════════════════════════════════════════════════════════
    // Step 4a：3rd Party Hardware — 第1次添加 2 个产品（截弹窗）
    // ══════════════════════════════════════════════════════════
    let hwBatch1 = 0
    await plFiller.addProducts({
      count: 2,
      subtable: '3rd-party',
      onBeforeConfirm: async () => {
        await shot(page, '04a-selector-first-selection.png')
      },
    }).then(n => { hwBatch1 = n })

    await page.waitForTimeout(600)
    manual.record(
      { zh: '第1次添加产品 — 产品选择弹窗', en: 'Add Products (Batch 1) — Product Selector Dialog' },
      {
        zh: '点击 "3rd Party Hardware" 区域的 "+ Add Products"，弹出产品选择弹窗。勾选前2个产品，点击确认添加。',
        en: 'Click "+ Add Products" in the 3rd Party Hardware section. A product selector dialog appears. Select the first 2 products and confirm.',
      },
      '04a-selector-first-selection.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 4b：3rd Party Hardware — 第2次添加 1 个产品（已选标记）
    // ══════════════════════════════════════════════════════════
    let hwBatch2 = 0
    await plFiller.addProducts({
      count: 1,
      subtable: '3rd-party',
      onBeforeConfirm: async () => {
        await shot(page, '05-selector-already-selected.png')
      },
    }).then(n => { hwBatch2 = n })

    const hwAdded = hwBatch1 + hwBatch2
    await page.waitForTimeout(800)
    await shot(page, '06-hardware-products-added.png')
    manual.record(
      { zh: '第2次添加产品 — 弹窗中显示已选产品标记', en: 'Add Products (Batch 2) — Previously Selected Products Marked' },
      {
        zh: '再次打开产品选择弹窗，前2个已添加的产品显示为**已选**状态（灰色/禁用）。选择第3个产品并确认，Hardware 共添加 3 个产品。',
        en: 'Open the selector again. The first 2 already-added products appear as **disabled/selected**. Select the 3rd product and confirm. Hardware now has 3 products.',
      },
      '05-selector-already-selected.png'
    )

    if (hwAdded === 0) {
      console.warn('[Test] Hardware 无可用产品，跳过后续步骤')
      manual.save()
      return
    }

    // ══════════════════════════════════════════════════════════
    // Step 5：设置全局折扣 10%，并在 Drawer 中编辑加价率 20%
    // （展示：全局折扣开启时，Drawer 显示折扣但不可单独修改）
    // ══════════════════════════════════════════════════════════
    // 先设置全局折扣 10%（自动开启 Switch）
    await plFiller.setGlobalDiscount(10)
    await page.waitForTimeout(500)
    await shot(page, '07-global-discount-on.png')

    // 打开第一个产品的 Drawer，设置加价率 20%
    // 此时 Drawer 内 Discount 字段不可编辑（全局折扣已开启），Markup 字段可见
    await plFiller.editProductInDrawer(0, {
      markup: 20,
      onBeforeSave: async () => {
        // 截图：加价率已填入，Drawer 内可见全局折扣（不可编辑）
        await shot(page, '08-drawer-markup-filled.png')
      },
    })
    await page.waitForTimeout(500)
    await shot(page, '09-after-markup-saved.png')
    manual.record(
      { zh: '全局折扣 10% 开启 + 产品 Drawer 设置加价率 20%', en: 'Global Discount 10% ON + Set Markup 20% in Product Drawer' },
      {
        zh: '开启 **Global Discount**（全局折扣），并设置折扣率为 **10%**。全局折扣开启后，DISC 列统一显示全局折扣值，产品 Drawer 内的单行折扣字段**不可编辑**。\n\n点击产品行打开 Drawer，在 **Markup** 字段输入 `20`（代表 20%）。加价率计算公式：`单价 = 目录价 × (1 + 加价率)`。点击 Save 后，MARKUP 列显示 20.00%。',
        en: 'Enable **Global Discount** and set it to **10%**. Once enabled, the DISC column shows the global discount for all rows, and the per-row discount field inside the Product Drawer is **read-only** (not editable).\n\nClick a product row to open the Drawer. Enter `20` in the **Markup** field (20%). Formula: `Unit Price = List Price × (1 + Markup Rate)`. After saving, the MARKUP column shows 20.00%.',
      },
      '08-drawer-markup-filled.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 7：将所有产品续费 → 切换到 hardwareRenew Tab
    // ══════════════════════════════════════════════════════════
    await hoverFirstProductRow(page)
    const renewed = await plFiller.copyAllRowsToRenew()
    console.log(`[Test] Hardware 续费行数: ${renewed}`)

    if (renewed > 0) {
      await plFiller.clickTab('hardwareRenew')
      await page.waitForTimeout(800)
      await shot(page, '10-hardware-renew-tab.png')
      manual.record(
        { zh: '续费：将产品复制到 Hardware Renew 页签', en: 'Renew: Copy Products to Hardware Renew Tab' },
        {
          zh: '点击产品行操作区的 **Renew** 按钮，将产品复制到 Hardware Renew 页签（Year 2）。切换到 "Hardware Renew" 页签后，可以看到续费产品列表。',
          en: 'Click the **Renew** button in the product row actions. This copies the product to the Hardware Renew tab (Year 2). Switch to "Hardware Renew" to see the renewal product list.',
        },
        '10-hardware-renew-tab.png'
      )

      // Step 8：续费 Tab 同一行 Copy 两次（Year3 / Year4）
      await hoverFirstProductRow(page)
      await plFiller.copyRenewRowNextYear()
      await page.waitForTimeout(400)
      await plFiller.copyRenewRowNextYear()
      await page.waitForTimeout(600)
      await shot(page, '11-renew-copied-twice.png')
      manual.record(
        { zh: '续费 Tab：点击 Copy 两次生成多年续费', en: 'Renew Tab: Click Copy Twice to Generate Multi-Year Renewals' },
        {
          zh: '在 Hardware Renew 页签中，点击同一产品行的 **Copy** 按钮两次：第1次生成 Year 3，第2次生成 Year 4。Overview 页签将自动汇总各年度金额对比。',
          en: 'In the Hardware Renew tab, click **Copy** on the same row twice:\n- 1st click → generates Year 3 row\n- 2nd click → generates Year 4 row\n\nThe Overview tab automatically aggregates the multi-year totals.',
        },
        '11-renew-copied-twice.png'
      )
    } else {
      console.warn('[Test] Hardware 无续费行，跳过 hardwareRenew 步骤')
      manual.record(
        { zh: '续费（跳过）', en: 'Renew (Skipped)' },
        { zh: '未找到 Renew 按钮，续费步骤跳过。', en: 'Renew button not found, step skipped.' },
        null
      )
    }

    // ══════════════════════════════════════════════════════════
    // Step 9：Service Tab — 添加产品 + 展示单行折扣场景
    // ══════════════════════════════════════════════════════════
    await plFiller.clickTab('service')
    await page.waitForTimeout(800)

    const svcAdded = await plFiller.addProducts({ count: 1, subtable: '3rd-party' })
    await page.waitForTimeout(800)
    await shot(page, '12-service-products-added.png')
    manual.record(
      { zh: 'Service 页签：添加服务产品', en: 'Service Tab: Add a Service Product' },
      {
        zh: '切换到 "Service" 页签，点击 "+ Add Products" 添加1个服务产品。注意：Service 页签无"加价率（Markup）"字段；数量字段显示为 **Man Day**（人天数）。',
        en: 'Switch to the "Service" tab and click "+ Add Products" to add 1 service product. Note: The Service tab has no Markup field; the quantity field is displayed as **Man Day**.',
      },
      '12-service-products-added.png'
    )

    if (svcAdded > 0) {
      // 关掉全局折扣
      await plFiller.disableGlobalDiscount()
      await page.waitForTimeout(500)
      await shot(page, '13-global-discount-off.png')
      manual.record(
        { zh: '关闭全局折扣，启用单行折扣模式', en: 'Disable Global Discount, Enable Per-Row Discount' },
        {
          zh: '点击 Global Discount **Switch** 将全局折扣关闭。关闭后，产品 Drawer 内的单行折扣输入框重新可见，可为每个产品单独设置折扣率。',
          en: 'Click the Global Discount **Switch** to turn it off. Once disabled, the per-row Discount input in the Product Drawer becomes visible again, allowing individual discount rates per product.',
        },
        '13-global-discount-off.png'
      )

      // 编辑第一个产品：设置 ACTIVITY（马来风格人名）+ 单行折扣 20%
      await plFiller.editProductInDrawer(0, {
        note: 'Ahmad Razif bin Kamaruddin',
        discount: 20,
        onBeforeSave: async () => {
          await shot(page, '14-drawer-discount-filled.png')
        },
      })
      await page.waitForTimeout(500)
      manual.record(
        { zh: '单行折扣 Drawer：填写 Activity 并设置折扣率 20%', en: 'Per-Row Discount Drawer: Fill Activity & Set Discount to 20%' },
        {
          zh: '点击产品行打开 Drawer。在 **Activity** 字段填入负责人姓名（`Ahmad Razif bin Kamaruddin`）；在 **Discount** 字段输入 `20`（代表 20%）。单行折扣计算公式：`单价 = 目录价 × (1 - 折扣率)`。',
          en: 'Click the product row to open the Drawer. Enter the assignee name (`Ahmad Razif bin Kamaruddin`) in the **Activity** field. Enter `20` in the **Discount** field (20%). Formula: `Unit Price = List Price × (1 - Discount Rate)`.',
        },
        '14-drawer-discount-filled.png'
      )

      // 重新开启全局折扣（对比演示）
      await plFiller.enableGlobalDiscount()
      await page.waitForTimeout(500)
      await shot(page, '15-global-discount-back-on.png')
      manual.record(
        { zh: '对比演示：重新开启全局折扣', en: 'Demo: Re-enable Global Discount' },
        {
          zh: '再次点击 Switch 开启全局折扣，展示两种折扣模式的差异：全局折扣统一作用于页签所有产品，单行折扣针对单个产品灵活设置。',
          en: 'Click the Switch again to re-enable Global Discount. This demonstrates the two discount modes:\n- **Global Discount**: applies uniformly to all products in the tab\n- **Per-Row Discount**: set individually per product (available when Global Discount is OFF)',
        },
        '15-global-discount-back-on.png'
      )
    }

    // ══════════════════════════════════════════════════════════
    // Step 10：Reimbursement Tab — SM Team 新增一行
    // ══════════════════════════════════════════════════════════
    await plFiller.clickTab('reimbursement')
    await page.waitForTimeout(800)
    await shot(page, '16-reimb-tab.png')
    manual.record(
      { zh: '切换到 Reimbursement 页签', en: 'Switch to Reimbursement Tab' },
      {
        zh: '点击 "Reimbursement" 标签，进入报销页签。该页签包含 SM Team 和 3rd Party Team 两个子表，用于记录差旅、住宿等报销费用，无折扣/加价率字段。',
        en: 'Click the "Reimbursement" tab. It contains SM Team and 3rd Party Team sub-tables for logging reimbursable expenses (travel, accommodation, etc.). No discount or markup fields apply here.',
      },
      '16-reimb-tab.png'
    )

    await plFiller.addReimbRow({
      activity: 'Travel & Accommodation',
      note: 'Customer site visit - Kuala Lumpur',
      ratePerDay: 500,
      days: 2,
      costRate: 350,
      costDays: 2,
    })
    await page.waitForTimeout(800)
    await shot(page, '17-reimb-row-added.png')
    manual.record(
      { zh: 'Reimbursement：SM Team 新增一行', en: 'Reimbursement: Add a Row to SM Team' },
      {
        zh: '点击 SM Team 区域的 "+ Add Row" 按钮，新增一行报销记录：\n- **Activity**: Travel & Accommodation\n- **Rate/Day**: 500 / **Days**: 2\n- **Cost Rate/Day**: 350 / **Days (Cost)**: 2',
        en: 'Click "+ Add Row" in the SM Team section to add a reimbursement entry:\n- **Activity**: Travel & Accommodation\n- **Note**: Customer site visit\n- **Rate/Day**: 500, **Days**: 2\n- **Cost Rate/Day**: 350, **Days (Cost)**: 2',
      },
      '17-reimb-row-added.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 11：Others Tab — 新增一行
    // ══════════════════════════════════════════════════════════
    await plFiller.clickTab('others')
    await page.waitForTimeout(800)
    await shot(page, '18-others-tab.png')
    manual.record(
      { zh: '切换到 Others 页签', en: 'Switch to Others Tab' },
      {
        zh: '点击 "Others" 标签，进入其他费用页签。用于记录不属于产品/服务/报销的杂项费用。',
        en: 'Click the "Others" tab for miscellaneous costs that do not fall under products, services, or reimbursements.',
      },
      '18-others-tab.png'
    )

    await plFiller.addOtherRow({
      description: 'Freight & Customs Clearance',
      note: 'Import duty for hardware shipment',
      price: 1200,
      qty: 1,
      cost: 900,
    })
    await page.waitForTimeout(800)
    await shot(page, '19-others-row-added.png')
    manual.record(
      { zh: 'Others：新增一行其他费用', en: 'Others: Add a Miscellaneous Cost Row' },
      {
        zh: '点击 "+ Add Row" 按钮，新增一行：\n- **Description**: Freight & Customs Clearance\n- **Unit Price**: 1200 / **Qty**: 1 / **Cost/Unit**: 900',
        en: 'Click "+ Add Row" to add a misc cost entry:\n- **Description**: Freight & Customs Clearance\n- **Note**: Import duty for hardware shipment\n- **Unit Price**: 1200, **Qty**: 1, **Cost/Unit**: 900',
      },
      '19-others-row-added.png'
    )

    // ══════════════════════════════════════════════════════════
    // Step 12：保存
    // ══════════════════════════════════════════════════════════
    const submitSuccess = await builder.submit()
    await page.waitForTimeout(1500)
    await shot(page, '20-saved.png')
    manual.record(
      { zh: '点击保存', en: 'Save the P&L Record' },
      {
        zh: submitSuccess
          ? '点击页面右上角 **Save** 按钮，表单提交成功。系统跳转到 P&L 详情页。'
          : '点击页面右上角 **Save** 按钮提交表单。（请检查页面状态确认是否保存成功）',
        en: submitSuccess
          ? 'Click the **Save** button in the top-right corner. The form is submitted successfully and the system redirects to the P&L detail page.'
          : 'Click the **Save** button in the top-right corner. (Please verify the page status to confirm if saving was successful.)',
      },
      '20-saved.png'
    )

    // ══════════════════════════════════════════════════════════
    // 输出用户手册 Markdown
    // ══════════════════════════════════════════════════════════
    manual.save()
    console.log('[Test] 用户手册截图用例完成！')
    console.log(`[Test] 截图目录: ${SCREENSHOTS_DIR}`)
    console.log(`[Test] 双语手册: ${MANUAL_PATH}`)
    console.log(`[Test] 中文手册: ${MANUAL_ZH_PATH}`)
    console.log(`[Test] 英文手册: ${MANUAL_EN_PATH}`)
  })
})
