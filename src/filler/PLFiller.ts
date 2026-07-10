/**
 * PLFiller — P&L 利润表组件填充器
 *
 * 对应组件类型: custom_pl_profit（securemetric-crm-pl）
 * 字段 ID: mk_km_ltc_pl.fd_products_table
 *
 * ────────────────────────────────────────────
 * Tab 结构（constants.ts TAB_CONFIGS）
 * ────────────────────────────────────────────
 * overview         — 年度对比矩阵（只读汇总，无产品操作）
 * software         — 软件产品：SM Products + 3rd Party Software
 * softwareRenew    — 软件续费（Year≥2），从 software 复制
 * hardware         — 硬件产品：SM Products + 3rd Party Hardware
 * hardwareRenew    — 硬件续费，从 hardware 复制
 * service          — 服务产品：SM Services + 3rd Party Services（Qty→Man Day；无 Markup）
 * serviceRenew     — 服务续费，从 service 复制
 * reimbursement    — 报销：SM Team + 3rd Party Team（无折扣/加价率，内联编辑）
 * others           — 其他费用（单子表，无折扣/加价率，内联编辑）
 *
 * ────────────────────────────────────────────
 * 折扣 / 加价率说明
 * ────────────────────────────────────────────
 * 全局折扣（Global Discount）
 *   - Tab 级，适用 Tab 内所有产品行
 *   - 开启后，ProductDrawer 内的单行 Discount 输入框隐藏
 *   - DOM：.pl-global-discount 容器内
 *       Switch: .pl-global-discount button[role="switch"]
 *       InputNumber: .pl-global-discount__input input
 *   - 内部存储：小数（0.10 = 10%）；UI 显示 × 100，测试填入 10 即代表 10%
 *   - 适用 Tab：software / softwareRenew / hardware / hardwareRenew / service / serviceRenew
 *
 * 单行折扣（Per-row Discount）
 *   - ProductDrawer 内 Discount 输入框（data-testid="pl-drawer-discount"）
 *   - 仅在全局折扣未开启时可见
 *   - 内部存储：小数；UI 显示 × 100，测试填入 10 即代表 10%
 *
 * 加价率（Markup）
 *   - ProductDrawer 内 Markup 输入框（data-testid="pl-drawer-markup"）
 *   - ⚠️ Service Tab 无此字段（服务类不设加价率）
 *   - 内部存储：小数；UI 显示 × 100，测试填入 20 即代表 20%
 *
 * ────────────────────────────────────────────
 * data-testid 清单（组件已声明）
 * ────────────────────────────────────────────
 * pl-tab-{tabKey}          — Tab 切换按钮
 * pl-btn-add-products      — + Add Products 按钮（ProductTable 工具栏）
 * pl-btn-add-rate-row      — + Add Row（RateTable）
 * pl-btn-add-reimb-row     — + Add Row（ReimbTable）
 * pl-btn-add-other-row     — + Add Row（OthersTable）
 * pl-selector-search       — ProductSelector 搜索框
 * pl-product-item-{fdId}   — ProductSelector 产品行
 * pl-selector-confirm      — ProductSelector 确认按钮
 * pl-drawer-markup         — ProductDrawer Markup InputNumber（Service Tab 无此字段）
 * pl-drawer-discount       — ProductDrawer Discount InputNumber（全局折扣开启时隐藏）
 * pl-drawer-quantity       — ProductDrawer Qty / Man Day InputNumber
 * pl-drawer-note           — ProductDrawer 备注/Activity
 * pl-drawer-save           — ProductDrawer 保存
 * pl-drawer-cancel         — ProductDrawer 取消
 * pl-drawer-delete         — ProductDrawer 删除
 *
 * ────────────────────────────────────────────
 * CSS class 选择器（无 testid）
 * ────────────────────────────────────────────
 * .pl-product-table .ant-table-row  — 产品行（Ant Design Table）
 */
import { Page } from '@playwright/test'

export type PLTabKey =
  | 'overview'
  | 'hardware'
  | 'hardwareRenew'
  | 'software'
  | 'softwareRenew'
  | 'service'
  | 'serviceRenew'
  | 'reimbursement'
  | 'others'

/** 有 Global Discount 的 Tab */
const TABS_WITH_GLOBAL_DISCOUNT: PLTabKey[] = [
  'software', 'softwareRenew',
  'hardware', 'hardwareRenew',
  'service', 'serviceRenew',
]

/** 有 Markup 的 Tab（Service 系列无 Markup） */
const TABS_WITH_MARKUP: PLTabKey[] = [
  'software', 'softwareRenew',
  'hardware', 'hardwareRenew',
]

export interface AddProductsOptions {
  /** 要添加的产品数量，默认 1 */
  count?: number
  /** 搜索关键词（可选），不填则直接选第一条 */
  search?: string
  /**
   * 点击哪个 + Add Products 按钮（按可见顺序，0-based）
   *   0 = SM Products（自研，默认）
   *   1 = 3rd Party（第三方）
   * 注：此环境只有 3rd Party Hardware 有数据，建议用 subtable: '3rd-party'
   */
  buttonIndex?: number
  /**
   * 语义化子表选择（优先于 buttonIndex）
   *   'sm'       = SM Products（自研）
   *   '3rd-party' = 3rd Party Products（第三方）
   */
  subtable?: 'sm' | '3rd-party'
  /**
   * 产品选中后、点击确认前的回调（可用于截图）
   * @param selectedCount 本次已选中的产品数量
   */
  onBeforeConfirm?: (selectedCount: number) => Promise<void>
}

/** ProductDrawer 可编辑字段 */
export interface DrawerEditOptions {
  /**
   * 加价率（markup），UI 显示百分比值，如 20 代表 20%（内部存 0.20）
   * ⚠️ Service / ServiceRenew Tab 无此字段，填写会被跳过
   */
  markup?: number
  /**
   * 单行折扣（discount），UI 显示百分比值，如 10 代表 10%（内部存 0.10）
   * 全局折扣开启时，此字段在 Drawer 内不可见，填写会被跳过
   */
  discount?: number
  /** 数量（Product Tab）/ 人天数（Service Tab） */
  quantity?: number
  /** 备注 */
  note?: string
  /**
   * 字段填写完成后、点击保存前的回调（可用于截图）
   */
  onBeforeSave?: () => Promise<void>
}

export interface AddRateRowOptions {
  rate?: number
  manDay?: number
  discount?: number
}

export class PLFiller {
  private page: Page
  /** 当前激活的 Tab（跟踪状态供 markup 校验用） */
  private currentTab: PLTabKey | null = null

  constructor(page: Page) {
    this.page = page
  }

  // ─── 内部工具 ────────────────────────────────────────────────

  private async waitForPLComponent(timeout = 10000): Promise<void> {
    await this.page.waitForSelector('[data-testid^="pl-tab-"]', { timeout })
    console.log('[PLFiller] P&L 组件已渲染')
  }

  private async isVisible(selector: string, timeout = 3000): Promise<boolean> {
    return this.page.locator(selector).first().isVisible({ timeout }).catch(() => false)
  }

  private async waitForNetworkOverlayGone(timeout = 15000): Promise<void> {
    const overlay = this.page.locator('#__network-tips')
    const visible = await overlay.isVisible().catch(() => false)
    if (visible) {
      console.log('[PLFiller] 检测到网络遮罩，等待消失...')
      try {
        await overlay.waitFor({ state: 'hidden', timeout })
        console.log('[PLFiller] 网络遮罩已消失')
      } catch {
        console.warn('[PLFiller] 网络遮罩超时未消失，强制移除继续...')
        await overlay.evaluate((el: HTMLElement) => el.remove()).catch(() => {})
        await this.page.waitForTimeout(500)
      }
    }
  }

  /**
   * 填写数字输入框（InputNumber）
   * 注意：折扣/加价率 UI 显示百分比值，直接填入 10 即表示 10%
   */
  private async fillNumberInput(selector: string, value: number): Promise<void> {
    const input = this.page.locator(selector).first()
    await input.waitFor({ state: 'visible', timeout: 5000 })
    await input.click({ clickCount: 3 })
    await input.fill(String(value))
    await this.page.keyboard.press('Tab')
    await this.page.waitForTimeout(300)
  }

  // ─── 公开 API ────────────────────────────────────────────────

  async waitForReady(timeout = 10000): Promise<void> {
    await this.waitForPLComponent(timeout)
  }

  async clickTab(tabKey: PLTabKey): Promise<void> {
    await this.waitForNetworkOverlayGone()
    // 关闭任何残留的 Drawer（ProductDrawer / ReimbDrawer / OthersDrawer）
    const drawerSaveSelectors = [
      'pl-drawer-save',
      'pl-reimb-drawer-save',
      'pl-other-drawer-save',
    ]
    const cancelSelectors = [
      'pl-drawer-cancel',
      'pl-reimb-drawer-cancel',
      'pl-other-drawer-cancel',
    ]
    for (let i = 0; i < drawerSaveSelectors.length; i++) {
      const visible = await this.page
        .locator(`[data-testid="${drawerSaveSelectors[i]}"]`)
        .isVisible({ timeout: 500 })
        .catch(() => false)
      if (visible) {
        const cancelBtn = this.page.locator(`[data-testid="${cancelSelectors[i]}"]`)
        const cancelVisible = await cancelBtn.isVisible({ timeout: 500 }).catch(() => false)
        if (cancelVisible) {
          await cancelBtn.click()
        } else {
          await this.page.keyboard.press('Escape')
        }
        await this.page.waitForTimeout(400)
      }
    }
    const tab = this.page.locator(`[data-testid="pl-tab-${tabKey}"]`)
    await tab.waitFor({ state: 'visible', timeout: 8000 })
    await tab.click({ force: true })
    await this.page.waitForTimeout(800)
    this.currentTab = tabKey
    console.log(`[PLFiller] 切换到 Tab: ${tabKey}`)
  }

  // ─── 全局折扣（Tab 级）───────────────────────────────────────

  /**
   * 开启全局折扣 Switch（若已开启则跳过）
   * 必须在 setGlobalDiscount 之前调用，或由 setGlobalDiscount 内部自动调用
   */
  async enableGlobalDiscount(): Promise<boolean> {
    if (!this.currentTab || !TABS_WITH_GLOBAL_DISCOUNT.includes(this.currentTab)) {
      console.warn(`[PLFiller] 当前 Tab (${this.currentTab}) 不支持全局折扣，跳过`)
      return false
    }
    // data-testid="pl-global-discount-switch"（已在组件侧添加）
    const switchBtn = this.page.locator('[data-testid="pl-global-discount-switch"]').first()
    const isSwitchVisible = await switchBtn.isVisible({ timeout: 5000 }).catch(() => false)
    if (!isSwitchVisible) {
      console.warn('[PLFiller] 未找到 pl-global-discount-switch，跳过')
      return false
    }
    // LUI Switch：checked 状态通过 aria-checked 或 class 判断
    const isChecked = await switchBtn.getAttribute('aria-checked').catch(() => null)
    if (isChecked === 'true') {
      console.log('[PLFiller] Global Discount Switch 已处于开启状态')
      return true
    }
    await switchBtn.click()
    await this.page.waitForTimeout(400)
    console.log('[PLFiller] Global Discount Switch 已开启')
    return true
  }

  /**
   * 关闭全局折扣 Switch（若已关闭则跳过）
   * 关闭后，ProductDrawer 内的单行 Discount 输入框恢复可见
   */
  async disableGlobalDiscount(): Promise<boolean> {
    if (!this.currentTab || !TABS_WITH_GLOBAL_DISCOUNT.includes(this.currentTab)) {
      console.warn(`[PLFiller] 当前 Tab (${this.currentTab}) 不支持全局折扣，跳过`)
      return false
    }
    const switchBtn = this.page.locator('[data-testid="pl-global-discount-switch"]').first()
    const isSwitchVisible = await switchBtn.isVisible({ timeout: 5000 }).catch(() => false)
    if (!isSwitchVisible) {
      console.warn('[PLFiller] 未找到 pl-global-discount-switch，跳过')
      return false
    }
    const isChecked = await switchBtn.getAttribute('aria-checked').catch(() => null)
    if (isChecked !== 'true') {
      console.log('[PLFiller] Global Discount Switch 已处于关闭状态')
      return true
    }
    await switchBtn.click()
    await this.page.waitForTimeout(400)
    console.log('[PLFiller] Global Discount Switch 已关闭')
    return true
  }

  /**
   * 设置当前 Tab 的全局折扣（自动开启 Switch）
   * @param discount 百分比值，如 10 = 10% 折扣（内部存 0.10）
   */
  async setGlobalDiscount(discount: number): Promise<boolean> {
    const enabled = await this.enableGlobalDiscount()
    if (!enabled) return false

    // data-testid="pl-global-discount-input"（已在组件侧添加）
    const inputSelector = '[data-testid="pl-global-discount-input"] input'
    const inputVisible = await this.isVisible(inputSelector)
    if (!inputVisible) {
      console.warn('[PLFiller] pl-global-discount-input 不可见，跳过')
      return false
    }
    await this.fillNumberInput(inputSelector, discount)
    console.log(`[PLFiller] 全局折扣已设置: ${discount}%`)
    return true
  }

  // ─── ProductSelector 添加产品 ────────────────────────────────

  async addProducts(options: AddProductsOptions = {}): Promise<number> {
    const { count = 1, search, subtable, buttonIndex } = options

    // 语义映射：'sm' → 0，'3rd-party' → 1
    const targetIndex = subtable === '3rd-party' ? 1 : subtable === 'sm' ? 0 : (buttonIndex ?? 0)

    await this.waitForNetworkOverlayGone()
    const allAddBtns = this.page.locator('[data-testid="pl-btn-add-products"]')
    await allAddBtns.first().waitFor({ state: 'attached', timeout: 12000 })

    // 收集当前激活 Tab 内真正可见的按钮
    // 用 isVisible() 而非 boundingBox()，避免隐藏 Tab 的按钮被误选
    // （LUI Tab 面板用 visibility:hidden 隐藏，boundingBox 仍有值）
    let clicked = false
    const btnCount = await allAddBtns.count()
    const visibleBtns: number[] = []
    for (let i = 0; i < btnCount; i++) {
      const visible = await allAddBtns.nth(i).isVisible().catch(() => false)
      if (visible) {
        visibleBtns.push(i)
      }
    }

    const chosenIdx = visibleBtns[targetIndex] ?? visibleBtns[0]
    if (chosenIdx !== undefined) {
      const label = targetIndex === 1 ? '3rd Party' : 'SM'
      console.log(`[PLFiller] 点击 + Add Products [${label}]（按钮位置 ${chosenIdx}）`)
      await allAddBtns.nth(chosenIdx).click({ force: true })
      clicked = true
    }
    if (!clicked) {
      console.warn('[PLFiller] 未找到有实际尺寸的 Add Products 按钮，跳过')
      return 0
    }

    const confirmBtn = this.page.locator('[data-testid="pl-selector-confirm"]')
    await confirmBtn.waitFor({ state: 'visible', timeout: 8000 })
    console.log('[PLFiller] ProductSelector 已打开')

    if (search) {
      const searchInput = this.page.locator('[data-testid="pl-selector-search"]')
      await searchInput.fill(search)
      await this.page.waitForTimeout(800)
      console.log(`[PLFiller] 搜索产品: ${search}`)
    }

    const productItemSelector = '[data-testid^="pl-product-item-"]'
    const enabledItemSelector = `${productItemSelector}:not(.pl-product-selector__item--disabled)`

    // 等待列表出现（空列表也会有容器）
    try {
      await this.page.waitForSelector(productItemSelector, { timeout: 8000 })
    } catch { /* 空列表 */ }

    // 额外等待列表稳定（防止列表二次加载/刷新导致 DOM detach）
    await this.page.waitForTimeout(600)

    const productItems = this.page.locator(enabledItemSelector)
    const available = await productItems.count()
    if (available === 0) {
      console.warn('[PLFiller] 无可用产品，关闭弹窗')
      await this.page.keyboard.press('Escape')
      return 0
    }
    console.log(`[PLFiller] 产品列表加载完成，共 ${available} 个可用产品`)

    const toSelect = Math.min(count, available)
    for (let i = 0; i < toSelect; i++) {
      // 每次重新查询避免 stale reference
      const item = this.page.locator(enabledItemSelector).nth(i)
      await item.waitFor({ state: 'visible', timeout: 5000 })
      // scrollIntoViewIfNeeded + hover 确保指针事件正确触发选中状态
      await item.scrollIntoViewIfNeeded()
      await item.hover()
      await this.page.waitForTimeout(150)
      await item.click()
      await this.page.waitForTimeout(400)
      console.log(`[PLFiller] 选中产品 ${i + 1}/${toSelect}`)
    }

    // 确保 confirm 按钮已启用（选中至少1个产品后才会 enabled）
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 })
    const isEnabled = await confirmBtn.isEnabled().catch(() => false)
    if (!isEnabled) {
      console.warn('[PLFiller] confirm 按钮仍未启用，等待500ms后再试...')
      await this.page.waitForTimeout(500)
    }

    if (options.onBeforeConfirm) {
      await options.onBeforeConfirm(toSelect)
    }

    await confirmBtn.click()
    await this.page.waitForTimeout(1000)
    console.log(`[PLFiller] 已确认添加 ${toSelect} 个产品`)
    return toSelect
  }

  // ─── ProductDrawer（单行折扣 / 加价率 / 数量）────────────────

  /**
   * 打开指定行的 ProductDrawer 并编辑字段
   *
   * @param rowIndex 0-based 行索引
   * @param options  markup / discount / quantity / note
   *
   * 注意：
   * - Service / ServiceRenew Tab 无 Markup 字段，markup 值会被跳过
   * - 全局折扣开启时，Discount 输入框不可见，discount 值会被跳过
   * - 产品行使用 Ant Design Table：.pl-product-table .ant-table-row
   */
  /** 获取当前激活 Tab 内可见的产品行 */
  private async getProductRows() {
    // 只选可见行（isVisible=true），避免隐藏 Tab 的行被误选
    // 优先用已部署的 data-testid="pl-product-row"，fallback 到 LUI table 类名
    const candidates = this.page.locator(
      '[data-testid="pl-product-row"], tr.lui-table-row[data-row-key]'
    )
    const count = await candidates.count()
    const visibleIdxs: number[] = []
    for (let i = 0; i < count; i++) {
      const v = await candidates.nth(i).isVisible().catch(() => false)
      if (v) visibleIdxs.push(i)
    }
    if (visibleIdxs.length > 0) {
      // 返回一个只含可见行的 locator（通过 nth 动态索引访问）
      // 为了保持接口一致，用 filter by visibility
      return candidates.filter({ visible: true })
    }
    return candidates
  }

  async editProductInDrawer(rowIndex: number, options: DrawerEditOptions = {}): Promise<boolean> {
    const rows = await this.getProductRows()
    const rowCount = await rows.count()
    if (rowCount === 0) {
      console.warn('[PLFiller] 表格无产品行，跳过 Drawer 编辑')
      return false
    }
    const idx = Math.min(rowIndex, rowCount - 1)
    await rows.nth(idx).scrollIntoViewIfNeeded()
    await rows.nth(idx).click({ force: true })

    const saveBtn = this.page.locator('[data-testid="pl-drawer-save"]')
    await saveBtn.waitFor({ state: 'visible', timeout: 8000 })
    console.log(`[PLFiller] ProductDrawer 已打开（行 ${idx}）`)

    // Markup：Service/ServiceRenew Tab 无此字段
    if (options.markup !== undefined) {
      const isServiceTab =
        this.currentTab === 'service' || this.currentTab === 'serviceRenew'
      if (isServiceTab) {
        console.log('[PLFiller]   Service Tab 无 Markup 字段，跳过')
      } else {
        // LUI InputNumber 可能将 data-testid 放在 wrapper div 上，也可能直接在 input 上
        // 先检查 wrapper 是否可见，再定位内部 input 交互
        const markupWrapper = this.page.locator('[data-testid="pl-drawer-markup"]').first()
        const wrapperVisible = await markupWrapper.isVisible({ timeout: 3000 }).catch(() => false)
        if (wrapperVisible) {
          // 尝试 wrapper 内的 input；若 wrapper 本身就是 input 则直接用
          const markupInput = markupWrapper.locator('input').first()
          const inputVisible = await markupInput.isVisible({ timeout: 2000 }).catch(() => false)
          const target = inputVisible ? markupInput : markupWrapper
          await target.click({ clickCount: 3 })
          await target.fill(String(options.markup))
          await this.page.keyboard.press('Tab')
          await this.page.waitForTimeout(300)
          console.log(`[PLFiller]   加价率 markup = ${options.markup}%`)
        } else {
          console.warn('[PLFiller]   pl-drawer-markup wrapper 不可见，跳过')
        }
      }
    }

    // Discount：全局折扣开启时不可见
    if (options.discount !== undefined) {
      const discountInput = this.page.locator('[data-testid="pl-drawer-discount"] input')
      const visible = await discountInput.isVisible({ timeout: 2000 }).catch(() => false)
      if (visible) {
        await discountInput.click({ clickCount: 3 })
        await discountInput.fill(String(options.discount))
        await this.page.keyboard.press('Tab')
        await this.page.waitForTimeout(300)
        console.log(`[PLFiller]   单行折扣 discount = ${options.discount}%`)
      } else {
        console.log('[PLFiller]   pl-drawer-discount 不可见（可能全局折扣已开启），跳过')
      }
    }

    // Quantity / Man Day
    if (options.quantity !== undefined) {
      const qtyInput = this.page.locator('[data-testid="pl-drawer-quantity"] input')
      const visible = await qtyInput.isVisible({ timeout: 2000 }).catch(() => false)
      if (visible) {
        await qtyInput.click({ clickCount: 3 })
        await qtyInput.fill(String(options.quantity))
        await this.page.keyboard.press('Tab')
        await this.page.waitForTimeout(300)
        const label = this.currentTab?.startsWith('service') ? 'Man Day' : 'Qty'
        console.log(`[PLFiller]   ${label} = ${options.quantity}`)
      }
    }

    // Note
    if (options.note !== undefined) {
      const noteInput = this.page.locator('[data-testid="pl-drawer-note"]')
      await noteInput.fill(options.note)
      console.log(`[PLFiller]   备注 = "${options.note}"`)
    }

    if (options.onBeforeSave) {
      await options.onBeforeSave()
    }

    await saveBtn.click()
    await this.page.waitForTimeout(800)
    console.log(`[PLFiller] ProductDrawer 保存完成（行 ${idx}）`)
    return true
  }

  /**
   * @deprecated 请使用 editProductInDrawer(0, options) 代替
   */
  async editFirstProductInDrawer(options: DrawerEditOptions = {}): Promise<boolean> {
    return this.editProductInDrawer(0, options)
  }

  /**
   * 对当前 Tab 所有产品行批量应用相同的 markup / discount / quantity
   * @returns 成功编辑的行数
   */
  async editAllProductsInDrawer(options: DrawerEditOptions): Promise<number> {
    const rows = await this.getProductRows()
    const rowCount = await rows.count()
    if (rowCount === 0) {
      console.warn('[PLFiller] 表格无产品行，跳过批量编辑')
      return 0
    }
    console.log(`[PLFiller] 开始批量编辑 ${rowCount} 行...`)
    let successCount = 0
    for (let i = 0; i < rowCount; i++) {
      const ok = await this.editProductInDrawer(i, options)
      if (ok) successCount++
    }
    console.log(`[PLFiller] 批量编辑完成，成功 ${successCount}/${rowCount} 行`)
    return successCount
  }

  // ─── Reimbursement Drawer 操作 ───────────────────────────────

  /**
   * Reimbursement Tab — 添加行并通过 Drawer 填写字段
   *
   * Drawer testid:
   *   pl-reimb-drawer-activity   — Activity (Input)
   *   pl-reimb-drawer-note       — Note (Textarea)
   *   pl-reimb-drawer-rate       — Rate per Day / Trip (InputNumber)
   *   pl-reimb-drawer-days       — Day / Trip Selling (InputNumber)
   *   pl-reimb-drawer-cost-rate  — Cost Rate per Day / Trip (InputNumber)
   *   pl-reimb-drawer-cost-days  — Day / Trip Cost (InputNumber)
   *   pl-reimb-drawer-save       — Save button
   */
  async addReimbRow(
    options: {
      /** 活动描述 */
      activity?: string
      /** 售价/天 */
      ratePerDay?: number
      /** 售价天数 */
      days?: number
      /** 成本/天 */
      costRate?: number
      /** 成本天数 */
      costDays?: number
      /** 备注 */
      note?: string
    } = {}
  ): Promise<void> {
    // 找第一个可见的 + Add Row 按钮（SM Team 在前）
    const addBtn = this.page.locator('[data-testid="pl-btn-add-reimb-row"]').first()
    await addBtn.waitFor({ state: 'visible', timeout: 12000 })
    await addBtn.scrollIntoViewIfNeeded()
    await addBtn.click()
    console.log('[PLFiller] 点击 Reimbursement + Add Row，等待 Drawer 打开...')

    // 等待 Drawer 打开
    const saveBtn = this.page.locator('[data-testid="pl-reimb-drawer-save"]')
    await saveBtn.waitFor({ state: 'visible', timeout: 8000 })
    console.log('[PLFiller] ReimbDrawer 已打开，填写字段...')

    const fillInput = async (testid: string, value: string) => {
      const el = this.page.locator(`[data-testid="${testid}"]`).first()
      const visible = await el.isVisible({ timeout: 3000 }).catch(() => false)
      if (!visible) { console.warn(`[PLFiller]   ${testid} 不可见，跳过`); return }
      const input = el.locator('input, textarea').first()
      const count = await input.count()
      const target = count > 0 ? input : el
      await target.click({ clickCount: 3 })
      await target.fill(value)
      await this.page.waitForTimeout(200)
      console.log(`[PLFiller]   ${testid} = "${value}"`)
    }

    const fillNumber = async (testid: string, value: number) => {
      const el = this.page.locator(`[data-testid="${testid}"]`).first()
      const visible = await el.isVisible({ timeout: 3000 }).catch(() => false)
      if (!visible) { console.warn(`[PLFiller]   ${testid} 不可见，跳过`); return }
      const input = el.locator('input').first()
      const count = await input.count()
      const target = count > 0 ? input : el
      await target.click({ clickCount: 3 })
      await target.fill(String(value))
      await this.page.keyboard.press('Tab')
      await this.page.waitForTimeout(200)
      console.log(`[PLFiller]   ${testid} = ${value}`)
    }

    if (options.activity) await fillInput('pl-reimb-drawer-activity', options.activity)
    if (options.note) await fillInput('pl-reimb-drawer-note', options.note)
    if (options.ratePerDay !== undefined) await fillNumber('pl-reimb-drawer-rate', options.ratePerDay)
    if (options.days !== undefined) await fillNumber('pl-reimb-drawer-days', options.days)
    if (options.costRate !== undefined) await fillNumber('pl-reimb-drawer-cost-rate', options.costRate)
    if (options.costDays !== undefined) await fillNumber('pl-reimb-drawer-cost-days', options.costDays)

    await saveBtn.click()
    await this.page.waitForTimeout(600)
    console.log('[PLFiller] Reimbursement 行保存完成')
  }

  /**
   * Others Tab — 添加行并通过 Drawer 填写字段
   *
   * Drawer testid:
   *   pl-other-drawer-description — Description (Input)
   *   pl-other-drawer-note        — Note (Textarea)
   *   pl-other-drawer-price       — Unit Price (InputNumber)
   *   pl-other-drawer-qty         — Qty (InputNumber)
   *   pl-other-drawer-cost        — Cost/Unit (InputNumber)
   *   pl-other-drawer-save        — Save button
   */
  async addOtherRow(
    options: {
      description?: string
      note?: string
      price?: number
      qty?: number
      cost?: number
    } = {}
  ): Promise<void> {
    const addBtn = this.page.locator('[data-testid="pl-btn-add-other-row"]').first()
    await addBtn.waitFor({ state: 'visible', timeout: 15000 })
    await addBtn.scrollIntoViewIfNeeded()
    await addBtn.click()
    console.log('[PLFiller] 点击 Others + Add Row，等待 Drawer 打开...')

    // 等待 Drawer 打开
    const saveBtn = this.page.locator('[data-testid="pl-other-drawer-save"]')
    await saveBtn.waitFor({ state: 'visible', timeout: 8000 })
    console.log('[PLFiller] OthersDrawer 已打开，填写字段...')

    const fillInput = async (testid: string, value: string) => {
      const el = this.page.locator(`[data-testid="${testid}"]`).first()
      const visible = await el.isVisible({ timeout: 3000 }).catch(() => false)
      if (!visible) { console.warn(`[PLFiller]   ${testid} 不可见，跳过`); return }
      const input = el.locator('input, textarea').first()
      const count = await input.count()
      const target = count > 0 ? input : el
      await target.click({ clickCount: 3 })
      await target.fill(value)
      await this.page.waitForTimeout(200)
      console.log(`[PLFiller]   ${testid} = "${value}"`)
    }

    const fillNumber = async (testid: string, value: number) => {
      const el = this.page.locator(`[data-testid="${testid}"]`).first()
      const visible = await el.isVisible({ timeout: 3000 }).catch(() => false)
      if (!visible) { console.warn(`[PLFiller]   ${testid} 不可见，跳过`); return }
      const input = el.locator('input').first()
      const count = await input.count()
      const target = count > 0 ? input : el
      await target.click({ clickCount: 3 })
      await target.fill(String(value))
      await this.page.keyboard.press('Tab')
      await this.page.waitForTimeout(200)
      console.log(`[PLFiller]   ${testid} = ${value}`)
    }

    if (options.description) await fillInput('pl-other-drawer-description', options.description)
    if (options.note) await fillInput('pl-other-drawer-note', options.note)
    if (options.price !== undefined) await fillNumber('pl-other-drawer-price', options.price)
    if (options.qty !== undefined) await fillNumber('pl-other-drawer-qty', options.qty)
    if (options.cost !== undefined) await fillNumber('pl-other-drawer-cost', options.cost)

    await saveBtn.click()
    await this.page.waitForTimeout(600)
    console.log('[PLFiller] Others 行保存完成')
  }

  // ─── 续费操作 ────────────────────────────────────────────────

  /**
   * 在当前产品 Tab 中，点击所有可用行的 Renew 按钮
   * Renew 按钮：.pl-cell-actions button（文本 "Renew"，非 disabled）
   * @returns 实际点击的行数
   */
  async copyAllRowsToRenew(): Promise<number> {
    // 优先用 data-testid，fallback 用 class + text（两个按钮均在 .pl-cell-actions 内）
    let renewBtns = this.page.locator('[data-testid="pl-btn-renew"]:not([disabled])')
    let count = await renewBtns.count()

    if (count === 0) {
      // fallback：按文字匹配，排除 disabled
      renewBtns = this.page.locator('.pl-cell-actions button:not([disabled])').filter({ hasText: 'Renew' })
      count = await renewBtns.count()
    }

    if (count === 0) {
      console.warn('[PLFiller] 当前 Tab 无可续费行（未找到 Renew 按钮）')
      return 0
    }
    // 从后往前点，避免 DOM 重排导致索引偏移
    for (let i = count - 1; i >= 0; i--) {
      await renewBtns.nth(i).click()
      await this.page.waitForTimeout(400)
    }
    console.log(`[PLFiller] 已将 ${count} 行复制到续费 Tab`)
    return count
  }

  /**
   * 在续费 Tab 内，点击第一行的 Copy 按钮，生成 Year+1 的续费行
   * Year 初始为 2，每点一次 Copy 追加 Year+1 行
   */
  async copyRenewRowNextYear(): Promise<boolean> {
    // 优先用 data-testid，fallback 用 class + text
    let copyBtn = this.page.locator('[data-testid="pl-btn-copy-year"]').first()
    let visible = await copyBtn.isVisible({ timeout: 3000 }).catch(() => false)

    if (!visible) {
      // fallback：.pl-cell-actions 内文字含 Copy 的按钮
      copyBtn = this.page
        .locator('.pl-cell-actions button')
        .filter({ hasText: 'Copy' })
        .first()
      visible = await copyBtn.isVisible({ timeout: 3000 }).catch(() => false)
    }

    if (!visible) {
      console.warn('[PLFiller] 续费 Tab 中未找到 Copy 按钮，跳过')
      return false
    }
    await copyBtn.click()
    await this.page.waitForTimeout(500)
    console.log('[PLFiller] 已复制续费行 (Year+1)')
    return true
  }

  // ─── 快捷方法 ────────────────────────────────────────────────

  /**
   * 一键填充：切换到指定 Tab 并添加产品
   * 适合冒烟测试快速调用
   */
  async quickFill(tabKey: PLTabKey = 'hardware', count = 1): Promise<number> {
    await this.waitForReady()
    await this.clickTab(tabKey)
    return this.addProducts({ count })
  }
}

export default PLFiller
