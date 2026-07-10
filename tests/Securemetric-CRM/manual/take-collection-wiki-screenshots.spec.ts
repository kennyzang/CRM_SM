/**
 * 回款模块 Wiki 截图脚本
 *
 * 用途：为 wiki/assets/ 生成高质量截图，替换暂存池中的临时截图。
 *
 * 运行命令（在项目根目录）：
 *   CRM_USER=soo npx playwright test \
 *     --config=config/playwright.securemetric-crm.config.ts \
 *     "doc/对话暂存池/用户手册调整暂存/take-collection-wiki-screenshots.spec.ts" \
 *     --headed
 *
 * 注意：testDir 限制可能导致路径问题，改用下面方式也可以：
 *   CRM_USER=soo npx playwright test \
 *     --config=config/playwright.securemetric-crm.config.ts \
 *     --grep "collection-wiki" --headed
 *   （需先将本文件复制到 tests/Securemetric-CRM/manual/ 再运行）
 *
 * 输出文件：
 *   wiki/assets/collection-list-001.png        ← Section 2 列表视图
 *   wiki/assets/collection-create-001.png      ← Section 3.1 新建表单
 *   wiki/assets/collection-detail-tab-001.png  ← Section 4.2 Payment Details 子选项卡
 *   wiki/assets/collection-milestone-paid-001.png ← Section 5.5 百分比里程碑状态
 *
 * 账号：CRM_USER=soo（即 ck/1）
 */

import { test, expect } from '@playwright/test'
import * as path from 'path'

// ─── 路径常量 ────────────────────────────────────────────────────────────────
const WIKI_ASSETS = path.join(process.cwd(), 'wiki', 'assets')

// ─── URL 常量 ────────────────────────────────────────────────────────────────
const LIST_URL =
  'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i1ci6bt4w60w3994w1b1gdb83ickip03gw1/1i178leaqw60wjlpw1q6re69bnnbf43qviw1?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1'

const CREATE_URL =
  'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1i176k8omw60whh8w7rcq5a2h7njoq99bew1'

// ─── 截图工具 ────────────────────────────────────────────────────────────────

/** 等待页面主内容加载（loading 旋转消失） */
async function waitForPageReady(page: import('@playwright/test').Page) {
  // 等待 loading spinner 消失
  await page.waitForSelector('.ek-loading-spinner', { state: 'hidden', timeout: 30000 }).catch(() => {})
  // 等待表格或主内容区域出现
  await page.waitForTimeout(1500)
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

test.describe('collection-wiki', () => {
  test.use({ locale: 'en-US', viewport: { width: 1366, height: 678 } })

  // ── 截图 1：Collection Details 列表 ──────────────────────────────────────
  test('01 Collection Details 列表', async ({ page }) => {
    await page.goto(LIST_URL)
    await waitForPageReady(page)

    // 等待列表表格行 + Create 按钮全部出现
    await page.waitForSelector('table tbody tr:not(.lui-table-measure-row)', { timeout: 20000 }).catch(() => {})
    await page.waitForSelector('button:has-text("Create"), .lui-btn:has-text("Create")', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(500)

    await page.screenshot({
      path: path.join(WIKI_ASSETS, 'collection-list-001.png'),
      fullPage: false,
    })
    console.log('[OK] collection-list-001.png')
  })

  // ── 截图 2：新建回款表单 ──────────────────────────────────────────────────
  test('02 新建回款表单', async ({ page }) => {
    // 增大视口高度以显示 Milestone Payments 子表
    await page.setViewportSize({ width: 1366, height: 1200 })

    await page.goto(CREATE_URL)
    await waitForPageReady(page)

    // 等待表单 section 标题出现
    await page.waitForSelector('text=Customer Payment Information', { timeout: 20000 }).catch(() => {})

    // 滚动内部容器到 Milestone Payments 区域可见
    const milestoneSection = page.locator('text=Milestone Payments').first()
    await milestoneSection.scrollIntoViewIfNeeded().catch(() => {})
    await page.waitForTimeout(800)

    // 注入数字标记覆盖层（追加到目标元素内部，避免滚动容器遮挡）
    await page.evaluate(() => {
      const MARKER_CSS = [
        'position:absolute',
        'width:22px', 'height:22px',
        'border-radius:50%',
        'background:#e53935',
        'color:#fff',
        'font-size:13px',
        'font-weight:700',
        'font-family:Arial,sans-serif',
        'display:flex', 'align-items:center', 'justify-content:center',
        'z-index:99999',
        'pointer-events:none',
        'line-height:1',
      ].join(';')

      function injectInto(el: Element | null, num: number, right = '6px', top = '6px') {
        if (!el) return
        ;(el as HTMLElement).style.position = 'relative'
        const m = document.createElement('div')
        m.textContent = String(num)
        m.style.cssText = `${MARKER_CSS};right:${right};top:${top};`
        el.appendChild(m)
      }

      function findTh(text: string): Element | null {
        return Array.from(document.querySelectorAll('th')).find(th => th.textContent?.includes(text)) ?? null
      }

      const luiSelects = document.querySelectorAll('.lui-select')
      // ① Customer — 第一个 lui-select，右侧
      injectInto(luiSelects[0] ?? null, 1, '10px', '8px')
      // ② Currency — 第二个 lui-select，右侧
      injectInto(luiSelects[1] ?? null, 2, '10px', '8px')
      // ③ Collection Amount — lui-input-number 容器
      injectInto(document.querySelector('.lui-input-number'), 3, '32px', '8px')
      // ④ Payment Schedule No. th，内部右下
      injectInto(findTh('Payment Schedule'), 4, '6px', '4px')
      // ⑤ Amount Applied th，内部右下
      injectInto(findTh('Amount Applied'), 5, '6px', '4px')
    })

    await page.waitForTimeout(300)

    await page.screenshot({
      path: path.join(WIKI_ASSETS, 'collection-create-001.png'),
      fullPage: false,
    })
    console.log('[OK] collection-create-001.png')
  })

  // ── 截图 3：Payment Details 子选项卡（需要一条已有记录）─────────────────
  //
  // 说明：此截图需要一条已存在的 Customer Payment 记录。
  //       运行前请确认系统中有 PR202606110003（或任意有 Payment Details 的记录）。
  //       如无记录可跳过此 test（添加 test.skip()）。
  //
  test('03 Payment Details 子选项卡', async ({ page }) => {
    // 先进入 Customer Payment 主列表，点击第一条记录
    const customerPaymentListUrl =
      'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i1ci5tf6w60w3982w3dlrp512h19a951tw1/1i1766s86w61w1qqwb76mdu5h0meq1vcelw1?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1'

    await page.goto(customerPaymentListUrl)
    await waitForPageReady(page)
    await page.waitForSelector('table tbody tr', { timeout: 20000 })
    await page.waitForTimeout(500)

    // 点击第一行进入详情（跳过 lui-table-measure-row 量测行）
    const firstRow = page.locator('table tbody tr:not(.lui-table-measure-row)').first()
    await firstRow.click()
    await waitForPageReady(page)

    // 点击 "Payment Detail" 子选项卡（实际标签含数量，如 "Payment Detail(1)"）
    const tab = page.locator('.lui-tab-bar .lui-tab-item, [role="tab"]').filter({ hasText: 'Payment Detail' }).first()
    await tab.click()
    await page.waitForTimeout(800)

    await page.screenshot({
      path: path.join(WIKI_ASSETS, 'collection-detail-tab-001.png'),
      fullPage: false,
    })
    console.log('[OK] collection-detail-tab-001.png')
  })

  // ── 截图 4：Payment Schedule > Payment Detail 子标签（Section 5.4）───────
  test('04 Payment Schedule Payment Detail 子标签', async ({ page }) => {
    const scheduleListUrl =
      'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i1ci5tf6w60w3982w3dlrp512h19a951tw1/1i1766s86w61w1qqwb76mdu5h0meq1vcelw1?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1'

    await page.goto(scheduleListUrl)
    await waitForPageReady(page)
    await page.waitForSelector('table tbody tr:not(.lui-table-measure-row)', { timeout: 20000 })
    await page.waitForTimeout(500)

    const firstRow = page.locator('table tbody tr:not(.lui-table-measure-row)').first()
    await firstRow.click()
    await waitForPageReady(page)

    const tab = page.locator('.lui-tab-bar .lui-tab-item, [role="tab"]').filter({ hasText: 'Payment Detail' }).first()
    await tab.click()
    await page.waitForTimeout(800)

    await page.screenshot({
      path: path.join(WIKI_ASSETS, 'collection-milestone-update-001.png'),
      fullPage: false,
    })
    console.log('[OK] collection-milestone-update-001.png')
  })

  // ── 截图 5：里程碑 Paid 状态列表页（Section 5.5）────────────────────────
  test('05 里程碑 Paid 状态列表', async ({ page }) => {
    // 需要 1500px 宽才能显示 Payment Status 列
    await page.setViewportSize({ width: 1500, height: 678 })

    const paidListUrl =
      'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i1ci5tf6w60w3982w3dlrp512h19a951tw1/1i1766s86w61w1qqwb76mdu5h0meq1vcelw1?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1'

    await page.goto(paidListUrl)
    await waitForPageReady(page)
    await page.waitForSelector('table tbody tr:not(.lui-table-measure-row)', { timeout: 20000 })
    await page.waitForSelector('button:has-text("Create"), .lui-btn:has-text("Create")', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(500)

    await page.screenshot({
      path: path.join(WIKI_ASSETS, 'collection-milestone-paid-001.png'),
      fullPage: false,
    })
    console.log('[OK] collection-milestone-paid-001.png')
  })

  // ── 临时探查：打印 create 页面 DOM 结构 ──────────────────────────────────
  test.skip('99 probe create form DOM', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 1200 })
    await page.goto(CREATE_URL)
    await page.waitForSelector('text=Customer Payment Information', { timeout: 20000 }).catch(() => {})
    const milestoneSection = page.locator('text=Milestone Payments').first()
    await milestoneSection.scrollIntoViewIfNeeded().catch(() => {})
    await page.waitForTimeout(1500)

    const info = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input')).slice(0, 12).map(el => ({
        cls: el.className.substring(0, 80), ph: el.placeholder, type: el.type,
      }))
      const ths = Array.from(document.querySelectorAll('th')).map(th => {
        const r = th.getBoundingClientRect()
        return { text: th.textContent?.trim(), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width) }
      })
      const luiSelects = Array.from(document.querySelectorAll('.lui-select')).slice(0, 4).map(el => {
        const r = el.getBoundingClientRect()
        return { cls: el.className.substring(0, 60), x: Math.round(r.left), y: Math.round(r.top) }
      })
      return { inputs, ths, luiSelects }
    })
    console.log(JSON.stringify(info, null, 2))
  })
})
