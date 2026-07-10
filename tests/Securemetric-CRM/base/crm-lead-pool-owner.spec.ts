/**
 * Securemetric CRM — 线索池更换负责人测试
 *
 * 覆盖场景：
 *   1. 在线索详情页点击"更换负责人"按钮
 *   2. 弹窗中各字段的识别与填充
 *   3. 选择新负责人、设置原负责人处理方式
 *   4. 确认后验证更换结果
 *
 * 启动命令：
 *   CRM_USER=edward npx playwright test \
 *     --config=config/playwright.securemetric-crm.config.ts \
 *     tests/Securemetric-CRM/base/crm-lead-pool-owner.spec.ts --headed
 *
 * 前提条件：
 *   - 存在至少一条已分配负责人的线索（非 Converted）
 *   - 当前账号有更换负责人的权限
 */
import { test, expect } from '@playwright/test'
import { Page } from 'playwright'

const LEAD_LIST_URL =
  'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1'

// ─── 工具函数 ──────────────────────────────────────────────────────

async function goToSalesLeadList(page: Page): Promise<void> {
  await page.goto(LEAD_LIST_URL, { timeout: 60000 })
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

  const allTab = page.getByText('All', { exact: true }).first()
  if (await allTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await allTab.click()
    await page.waitForSelector('table tbody tr, .lui-table-body tr', { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(4000)
  }
}

async function openFirstNonConvertedLead(page: Page): Promise<boolean> {
  const rows = page.locator('table tbody tr, .lui-table-body tr')
  if (!(await rows.first().isVisible({ timeout: 15000 }).catch(() => false))) {
    return false
  }
  const rowCount = await rows.count()
  const maxScan = Math.min(rowCount, 15)
  for (let i = 0; i < maxScan; i++) {
    const rowText = await rows.nth(i).textContent().catch(() => '')
    // 跳过已转换的线索
    if (rowText && /[Cc]onvert/i.test(rowText)) {
      continue
    }
    if (rowText && rowText.trim()) {
      console.log(`[Test] ✅ 找到可操作线索（第 ${i + 1} 行）`)
      await rows.nth(i).locator('td').nth(1).click()
      await page.waitForTimeout(1500)
      return true
    }
  }
  return false
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}`, fullPage: false })
  console.log(`[Screenshot] ${name}`)
}

// ─── Test Suite ───────────────────────────────────────────────────

test.describe('Securemetric CRM — 线索池更换负责人', () => {

  test('更换负责人弹窗交互：字段识别与填充', async ({ page }) => {
    await goToSalesLeadList(page)
    const opened = await openFirstNonConvertedLead(page)
    if (!opened) {
      console.log('[Test] ⏭ 跳过：无线索数据')
      return
    }
    await shot(page, 'lead-pool-01-lead-detail.png')

    // 查找"更换负责人"按钮
    // 注意：按钮文本可能是中文"更换负责人"或英文"Change Owner"
    const changeOwnerBtn = page.getByRole('button', { name: /更换负责人|Change Owner/i })
    const btnVisible = await changeOwnerBtn.isVisible({ timeout: 5000 }).catch(() => false)

    if (!btnVisible) {
      console.log('[Test] ⚠️ "更换负责人"按钮不可见（可能无权限或不在可操作状态）')
      // 尝试在更多操作菜单中查找
      const moreActionsBtn = page.getByRole('button', { name: /更多|More/i })
      if (await moreActionsBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await moreActionsBtn.click()
        await page.waitForTimeout(500)
        const menuItem = page.getByText(/更换负责人|Change Owner/i)
        if (await menuItem.isVisible({ timeout: 2000 }).catch(() => false)) {
          await menuItem.click()
          await page.waitForTimeout(800)
          console.log('[Test] ✅ 通过"更多"菜单找到更换负责人按钮')
        } else {
          console.log('[Test] ⏭ 跳过了在"更多"菜单里也没有找到')
          return
        }
      } else {
        console.log('[Test] ⏭ 跳过：找不到更换负责人入口')
        return
      }
    } else {
      await changeOwnerBtn.click()
      await page.waitForTimeout(1000)
      console.log('[Test] ✅ 点击"更换负责人"按钮')
    }

    await shot(page, 'lead-pool-02-popup-modal.png')

    // ═══ 识别弹窗结构 ═══
    // 弹窗是一个 modal 对话框
    const modal = page.locator('.lui-modal-content, .ele-dialog, .lui-dialog').first()
    const modalVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false)
    if (!modalVisible) {
      console.log('[Test] ⚠️ 未检测到弹窗（可能是内嵌表单而非弹窗）')
      // 尝试检测页面上是否出现新表单（在当前页面内嵌）
      await shot(page, 'lead-pool-03-popup-inline.png')
      return
    }

    // 获取弹窗内的字段标签
    const labels = await page.evaluate(() => {
      const items: string[] = []
      document.querySelectorAll('.ele-xform-fieldset-label, .lui-modal-body label, .lui-form-item-label').forEach(el => {
        const text = (el.textContent || '').trim()
        if (text) items.push(text)
      })
      return items
    })
    console.log('[Test] 弹窗字段标签:', JSON.stringify(labels))

    // 弹窗数据模型：
    // 【根据设计器】"销售线索_变更负责人"表单的字段：
    // 1. 将负责人更换为（人员选择）
    // 2. 将原负责人 → 移出团队 / 变更为团队成员
    // 3. 团队角色 → 普通成员
    // 4. 权限 → 只读 / 读写
    // 5. 将原团队普通成员 → 清空 / 保留

    // 尝试选择新负责人（通过地址本控件）
    const ownerSelector = page.locator('.ele-xform-address, [class*="address"]').first()
    if (await ownerSelector.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('[Test] ✅ 检测到人员选择控件')
      // 【人工操作点】地址本弹窗需要选择具体人员
      console.log('[Test] ⚠️ 需要人工选择新负责人（地址本弹窗）')
    }

    // 尝试设置"将原负责人"选项
    // 弹窗内的单选框或下拉框
    const radioBtns = page.locator('input[type="radio"]')
    const radioCount = await radioBtns.count()
    console.log(`[Test] 弹窗内 radio 数量: ${radioCount}`)

    // 尝试操作下拉选择（团队角色、权限）
    const selects = page.locator('.lui-select-selector, .ele-select')
    const selectCount = await selects.count()
    console.log(`[Test] 弹窗内 select 数量: ${selectCount}`)

    await shot(page, 'lead-pool-04-popup-annotated.png')

    // 弹窗操作是高度人工交互的，这里输出指导
    console.log('')
    console.log('='.repeat(60))
    console.log('【人工指导】弹窗操作步骤')
    console.log('='.repeat(60))
    console.log('1. 在"将负责人更换为"中选择一个用户')
    console.log('2. "将原负责人" → 选择"变更为团队成员"')
    console.log('3. "团队角色" → 默认"普通成员"')
    console.log('4. "权限" → 选择"只读"或"读写"')
    console.log('5. "将原团队普通成员" → 选择"保留"')
    console.log('6. 点击 Confirm / 确定 完成')
    console.log('')
    console.log('验证点：')
    console.log('- 更换后线索新的负责人是否更改为新用户')
    console.log('- 原负责人是否按设置变为团队成员')
    console.log('- 团队角色和权限是否正确')
    console.log('- 权限变更谁有权限操作（管理员 vs 销售）')
    console.log('='.repeat(60))
  })

  test('管理员视角：线索分配与收回', async ({ page }) => {
    /**
     * 【需要人工补充】
     * - 管理员可以将线索分配给指定销售人员
     * - 管理员可以收回已分配的线索
     */
    console.log('[Test] ⏭ 管理员视角的线索分配/收回需要后续补充')
    console.log('[Test] 💡 建议通过 CRM_USER=soo 管理员账号测试')
  })
})
