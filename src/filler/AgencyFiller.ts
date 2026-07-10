/**
 * AgencyFiller — 单位/机构字段填充器
 *
 * 处理 km-agency 的 AgencyAddress 组件，需要：
 * 1. 点击单位选择区域触发弹窗
 * 2. 在弹窗中选择单位
 * 3. 点击确定按钮关闭弹窗
 *
 * 与 AddressFiller 的区别：
 * - 地址本 (address): sys-org 组件，选择人员/部门/岗位等，DOM 类名: sys-org-input-search-select-*
 * - 单位 (agency): km-agency 组件，选择组织/单位，DOM 类名: km-agency-input-search-select-*
 */
import { BaseFiller, FillerContext } from '@/filler/BaseFiller';

export class AgencyFiller extends BaseFiller {
  constructor(context: FillerContext) {
    super(context);
  }

  /**
   * 填充单位字段
   */
  async fill(): Promise<void> {
    const { page, field, scope } = this.context;
    console.log(`[AgencyFiller] 开始填充单位字段: ${field.label} (${field.id})`);

    try {
      const targetScope = scope || page;

      const modalOpened = await this.triggerAgencyModal(targetScope);
      
      if (!modalOpened) {
        console.warn(`[AgencyFiller] 无法打开单位选择弹窗，字段: ${field.label}`);
        return;
      }

      await this.selectUnitInModal();

      console.log(`[AgencyFiller] 单位字段 "${field.label}" 填充成功`);
    } catch (error: unknown) {
      console.error(`[AgencyFiller] 填充单位字段 "${field.label}" 失败:`, error);
      throw error;
    }
  }

  /**
   * 触发单位选择弹窗
   */
  private async triggerAgencyModal(targetScope: any): Promise<boolean> {
    const { page, field } = this.context;

    // ========== 明细表专用方案 ==========
    console.log(`[AgencyFiller] 方案0-DT: 检查是否为明细表场景`);
    
    try {
      const isTdElement = await targetScope.evaluate((el: any) => 
        el.tagName?.toLowerCase() === 'td'
      ).catch(() => false);
      
      if (isTdElement) {
        console.log(`[AgencyFiller] 方案0-DT: 检测到明细表 td 元素`);
        
        // 基于 km-agency 源码的精确选择器
        const agencySelectors = [
          '.km-agency-input-search-select-select',         // 触发按钮（最可靠）
          '.km-agency-input-search-select',                // 输入容器
          '.ele-xform-agency',                             // xform 包装组件
        ];
        
        for (const selector of agencySelectors) {
          const component = targetScope.locator(selector).first();
          if (await component.count() > 0 && await component.isVisible().catch(() => false)) {
            console.log(`[AgencyFiller] 方案0-DTa: 点击 ${selector}`);
            await component.scrollIntoViewIfNeeded();
            await component.click({ force: true });
            await page.waitForTimeout(1500);
            if (await this.waitForModal()) {
              console.log(`[AgencyFiller] ✅ 成功打开单位选择弹窗 (${selector})`);
              return true;
            }
          }
        }
        
        console.warn(`[AgencyFiller] ⚠️ 明细表中未找到 km-agency 组件`);
      }
    } catch (e) {
      console.warn(`[AgencyFiller] 方案0-DT 执行失败:`, e instanceof Error ? e.message : e);
    }

    // ========== 主表方案 ==========
    console.log(`[AgencyFiller] 方案1: 尝试通过 data-id 定位`);
    
    const fieldContainer = targetScope.locator(`[data-id*="${field.id}"]`).first();
    if (await fieldContainer.count() > 0) {
      const agencyComponent = fieldContainer.locator('.km-agency-input-search-select').first();
      if (await agencyComponent.count() > 0) {
        console.log(`[AgencyFiller] 方案1a: 点击字段容器内的 km-agency 组件`);
        await agencyComponent.scrollIntoViewIfNeeded();
        await agencyComponent.click({ force: true });
        await page.waitForTimeout(1500);
        if (await this.waitForModal()) return true;
      }
      
      const triggerBtn = fieldContainer.locator('.km-agency-input-search-select-select').first();
      if (await triggerBtn.count() > 0) {
        console.log(`[AgencyFiller] 方案1b: 点击触发按钮`);
        await triggerBtn.scrollIntoViewIfNeeded();
        await triggerBtn.click({ force: true });
        await page.waitForTimeout(1500);
        if (await this.waitForModal()) return true;
      }
      
      console.log(`[AgencyFiller] 方案1c: 点击整个字段容器`);
      await fieldContainer.scrollIntoViewIfNeeded();
      await fieldContainer.click({ force: true });
      await page.waitForTimeout(1500);
      if (await this.waitForModal()) return true;
    }

    // ========== 全局查找 ==========
    console.log(`[AgencyFiller] 方案2: 全局查找 km-agency 组件`);
    
    const globalAgencies = page.locator('.km-agency-input-search-select');
    const agencyCount = await globalAgencies.count();
    
    if (agencyCount > 0) {
      for (let i = 0; i < Math.min(agencyCount, 3); i++) {
        const agency = globalAgencies.nth(i);
        if (await agency.isVisible().catch(() => false)) {
          console.log(`[AgencyFiller] 方案2a: 点击第 ${i + 1} 个可见的 km-agency 组件`);
          await agency.scrollIntoViewIfNeeded();
          await agency.click({ force: true });
          await page.waitForTimeout(1500);
          if (await this.waitForModal()) return true;
        }
      }
    }

    console.warn(`[AgencyFiller] 未能找到单位触发元素，字段: ${field.label}`);
    return false;
  }

  /**
   * 等待弹窗出现
   */
  private async waitForModal(): Promise<boolean> {
    const { page } = this.context;
    
    // 单位选择弹窗类名（与地址本类似，使用 ele-address）
    const modal = page.locator('.ele-address');
    const modalCount = await modal.count();
    
    if (modalCount > 0) {
      try {
        await modal.first().waitFor({ state: 'visible', timeout: 15000 });
        console.log('[AgencyFiller] 单位选择弹窗已打开 (.ele-address)');
        return true;
      } catch {
        console.warn('[AgencyFiller] 等待弹窗超时');
      }
    }

    // 备用弹窗
    const altModal = page.locator('.lui-modal-wrap').filter({ has: page.locator('.lui-modal-content') });
    const altCount = await altModal.count();
    
    if (altCount > 0) {
      try {
        await altModal.first().waitFor({ state: 'visible', timeout: 10000 });
        console.log('[AgencyFiller] 备用弹窗已打开');
        return true;
      } catch {
        console.warn('[AgencyFiller] 等待备用弹窗超时');
      }
    }

    return false;
  }

  /**
   * 在弹窗中选择单位
   */
  private async selectUnitInModal(): Promise<void> {
    const { page } = this.context;

    console.log(`[AgencyFiller] 开始在弹窗中选择单位`);

    try {
      const modal = page.locator('.ele-address, .lui-modal-wrap').filter({ has: page.locator('.lui-modal-content') }).first();
      
      if (!(await modal.isVisible().catch(() => false))) {
        console.warn(`[AgencyFiller] 弹窗不可见`);
        return;
      }

      // 等待数据加载
      await page.waitForTimeout(1000);

      // 策略1：尝试点击 radio 或 checkbox
      const radioOrCheckbox = modal.locator('input[type="radio"], input[type="checkbox"]').first();
      if (await radioOrCheckbox.count() > 0 && await radioOrCheckbox.isVisible().catch(() => false)) {
        const count = await modal.locator('input[type="radio"]').count();
        console.log(`[AgencyFiller] 找到 ${count} 个 radio 元素`);
        
        if (count > 0) {
          const randomIndex = Math.floor(Math.random() * count);
          await modal.locator('input[type="radio"]').nth(randomIndex).click({ force: true });
          console.log(`[AgencyFiller] 已选择第 ${randomIndex + 1} 个单位`);
        }
      }
      
      // 策略2：如果找不到 radio，尝试点击最近联系人
      else {
        const recentContacts = modal.locator('.ele-address-recent .ele-address-item, [class*="recent"] [class*="item"]').first();
        if (await recentContacts.count() > 0 && await recentContacts.isVisible().catch(() => false)) {
          console.log(`[AgencyFiller] 选择最近联系人`);
          await recentContacts.click({ force: true });
        } else {
          console.warn(`[AgencyFiller] 未找到可选择的单位`);
        }
      }

      // 点击确定按钮
      await page.waitForTimeout(500);
      
      const confirmBtn = modal.locator(
        '.ele-address-footer-right .lui-btn-primary, ' +
        '.lui-modal-footer .lui-btn-primary'
      ).first();
      
      if (await confirmBtn.count() > 0 && await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click({ force: true });
        console.log(`[AgencyFiller] 已点击确定按钮`);
      } else {
        console.warn(`[AgencyFiller] 未找到确定按钮，按 Enter`);
        await page.keyboard.press('Enter');
      }

      // 等待弹窗关闭
      await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      
    } catch (e) {
      console.error(`[AgencyFiller] 选择单位失败:`, e instanceof Error ? e.message : e);
      throw e;
    }
  }
}

export default AgencyFiller;