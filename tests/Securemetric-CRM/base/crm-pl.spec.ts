/**
 * Securemetric CRM — 新建 P&L 测试（Edward 账号）
 *
 * 测试目标:
 *   http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1jolf9tffwfwtegbw1dkpp192vc2vnk3nqw0
 *
 * Tab 结构（含产品分类）:
 *   Software Tab
 *     └─ SM Products（软件自研，fd_sw_sm）
 *     └─ 3rd Party Software（软件第三方，fd_sw_3p）
 *   Hardware Tab
 *     └─ SM Products（硬件自研，fd_hw_sm）
 *     └─ 3rd Party Hardware（硬件第三方，fd_hw_3p）
 *   Service Tab（Qty → Man Day；无 Markup）
 *     └─ SM Services（服务本团队，fd_svc_sm）
 *     └─ 3rd Party Services（服务第三方，fd_svc_3p）
 *
 * 覆盖范围:
 *   - 三个产品 Tab，各随机添加 1~2 个产品
 *   - 每个 Tab 开启全局折扣（Global Discount），设置随机折扣百分比
 *   - 每行通过 ProductDrawer 设置加价率（Software/Hardware 有 Markup；Service 无）
 *   - 每行设置人天数/数量
 *   - 每个 Tab 添加完成后，将产品复制到对应续费 Tab（Year=2）
 *   - 随机决定是否再复制一次（Year=3）
 *   - 三个 Tab 中至少有一个必须有产品才允许提交
 *
 * 启动命令:
 *   CRM_USER=edward npx playwright test \
 *     --config=config/playwright.securemetric-crm.config.ts \
 *     tests/Securemetric-CRM/base/crm-pl.spec.ts \
 *     --headed
 *
 *   # 批量
 *   CRM_USER=edward npx playwright test \
 *     --config=config/playwright.securemetric-crm.config.ts \
 *     tests/Securemetric-CRM/base/crm-pl.spec.ts \
 *     --repeat-each 3
 */
import { test, expect } from '@playwright/test'
import { FormTestBuilder } from '../../../src/core/FormTestBuilder'
import { PLFiller } from '../../../src/filler/PLFiller'

const FORM_ID = 'mk_km_ltc_pl'
const FORM_NAME = 'CRM P&L_Securemetric'
const FORM_URL =
  'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1jolf9tffwfwtegbw1dkpp192vc2vnk3nqw0'

// ─── 随机数工具 ───────────────────────────────────────────────

function randomCount(): number {
  return Math.random() < 0.5 ? 1 : 2
}

function shouldAddYear3(): boolean {
  return Math.random() < 0.5
}

/** 随机折扣：5 / 10 / 15 / 20（百分比，UI 填入值） */
function randomDiscount(): number {
  return [5, 10, 15, 20][Math.floor(Math.random() * 4)]
}

/** 随机加价率：10 / 15 / 20 / 25 / 30（百分比，UI 填入值） */
function randomMarkup(): number {
  return [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)]
}

/** 随机人天数/数量：1 ~ 5 */
function randomQty(): number {
  return Math.floor(Math.random() * 5) + 1
}

// ─── 辅助：填充单个产品 Tab ──────────────────────────────────

/**
 * 在当前已激活的产品 Tab 内：
 * 1. 添加产品
 * 2. 开启全局折扣
 * 3. 逐行编辑 markup（Service 无）+ quantity
 * 4. 复制到 Renew Tab（Year=2），随机决定是否追加 Year=3
 *
 * @param page         Playwright Page
 * @param plFiller     PLFiller 实例
 * @param tabKey       当前 Tab key（用于判断是否有 Markup）
 * @param renewTabKey  对应的续费 Tab key
 * @param hasMarkup    该 Tab 是否支持加价率（Service 系列为 false）
 * @returns 实际添加的产品数量
 */
async function fillProductTab(
  page: Parameters<Parameters<typeof test>[2]>[0]['page'],
  plFiller: PLFiller,
  tabKey: 'software' | 'hardware' | 'service',
  renewTabKey: 'softwareRenew' | 'hardwareRenew' | 'serviceRenew',
  hasMarkup: boolean
): Promise<number> {
  const count = randomCount()
  console.log(`[Test] ═══ ${tabKey} Tab — 尝试添加 ${count} 个产品 ═══`)

  const added = await plFiller.addProducts({ count })
  console.log(`[Test] ${tabKey} Tab 实际添加: ${added} 个产品`)

  if (added === 0) {
    console.warn(`[Test] ${tabKey} Tab 无可用产品，跳过折扣/续费步骤`)
    return 0
  }

  // 2. 开启全局折扣
  const globalDiscount = randomDiscount()
  console.log(`[Test] ${tabKey} 全局折扣: ${globalDiscount}%`)
  await plFiller.setGlobalDiscount(globalDiscount)

  // 3. 逐行设置加价率（Service 无 Markup）+ 人天数/数量
  //    全局折扣开启后，Drawer 内 Discount 不可见，只填 markup（非 Service）+ quantity
  for (let i = 0; i < added; i++) {
    const qty = randomQty()
    const drawerOptions = hasMarkup
      ? { markup: randomMarkup(), quantity: qty }
      : { quantity: qty }
    const label = hasMarkup
      ? `markup=${drawerOptions.markup}% qty=${qty}`
      : `qty(man-day)=${qty}`
    console.log(`[Test] ${tabKey} 行${i} — ${label}`)
    await plFiller.editProductInDrawer(i, drawerOptions)
  }
  await page.waitForTimeout(500)

  // 4. 复制到续费 Tab（Year=2）
  console.log(`[Test] ${tabKey} → 复制到续费 Tab (Year=2)`)
  const renewed = await plFiller.copyAllRowsToRenew()
  console.log(`[Test] ${tabKey} 续费行数: ${renewed}`)

  // 5. 随机是否追加 Year=3
  await plFiller.clickTab(renewTabKey)
  if (shouldAddYear3()) {
    console.log(`[Test] ${renewTabKey} → 追加 Year=3`)
    await plFiller.copyRenewRowNextYear()
  } else {
    console.log(`[Test] ${renewTabKey} → 保持 Year=2，不追加`)
  }
  await page.waitForTimeout(500)

  return added
}

// ─── Test Suite ───────────────────────────────────────────────

test.describe('Securemetric CRM — 新建 P&L（Edward 账号）', () => {
  let builder: FormTestBuilder
  let plFiller: PLFiller

  test.beforeEach(async ({ page }) => {
    builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: './src/schemas/Securemetric-CRM/base',
      schemaMaxAgeHours: 168,
    })
    plFiller = new PLFiller(page)
    await builder.initialize()
  })

  test('新建 P&L — 全局折扣 + 单行加价率/人天数 + 续费后提交', async ({ page }) => {
    await builder.navigate()

    // ══════════════════════════════════════════
    // 1️⃣ 填写前置必填字段（关联商机 / 日期）
    // ══════════════════════════════════════════
    const schema = builder.getSchema()
    const requiredFields = (schema?.fields ?? []).filter(f => f.required)
    console.log(`[Test] 必填字段: ${requiredFields.map(f => f.id).join(', ')}`)

    for (const field of requiredFields) {
      if (field.id === 'fd_products_table') continue
      console.log(`[Test] 填写: ${field.id} (${field.fdType})`)
      await builder.fillField(field.id)
      await page.waitForTimeout(500)
    }

    // ══════════════════════════════════════════
    // 2️⃣ 等待 P&L 组件渲染
    // ══════════════════════════════════════════
    console.log('[Test] 等待 P&L 组件初始化...')
    await plFiller.waitForReady(15000)

    // ══════════════════════════════════════════
    // 3️⃣ Software Tab（有 Markup）
    //   子表：SM Products + 3rd Party Software
    // ══════════════════════════════════════════
    await plFiller.clickTab('software')
    const swAdded = await fillProductTab(page, plFiller, 'software', 'softwareRenew', true)

    // ══════════════════════════════════════════
    // 4️⃣ Hardware Tab（有 Markup）
    //   子表：SM Products + 3rd Party Hardware
    // ══════════════════════════════════════════
    await plFiller.clickTab('hardware')
    const hwAdded = await fillProductTab(page, plFiller, 'hardware', 'hardwareRenew', true)

    // ══════════════════════════════════════════
    // 5️⃣ Service Tab（无 Markup，Qty = Man Day）
    //   子表：SM Services（服务本团队）+ 3rd Party Services
    // ══════════════════════════════════════════
    await plFiller.clickTab('service')
    const svcAdded = await fillProductTab(page, plFiller, 'service', 'serviceRenew', false)

    // ══════════════════════════════════════════
    // 6️⃣ 汇总断言：至少一个 Tab 有产品
    // ══════════════════════════════════════════
    const totalAdded = swAdded + hwAdded + svcAdded
    console.log(
      `[Test] 汇总 — SW:${swAdded} HW:${hwAdded} SVC:${svcAdded}，共 ${totalAdded} 个产品`
    )
    expect(totalAdded, '至少一个产品 Tab 必须有数据才能提交').toBeGreaterThan(0)

    // ══════════════════════════════════════════
    // 7️⃣ 提交
    // ══════════════════════════════════════════
    console.log('[Test] ═══ 提交表单 ═══')
    const submitSuccess = await builder.submit()

    if (submitSuccess) {
      console.log('[Test] 🎉 新建 P&L 提交成功！')
    } else {
      console.warn('[Test] ⚠️ 表单提交可能未完全成功，请检查页面状态')
    }
  })
})
