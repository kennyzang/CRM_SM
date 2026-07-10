/**
 * AddressFiller — 地址本字段填充器
 * 
 * 处理地址本组件的人员选择，需要：
 * 1. 点击地址本选择区域触发弹窗（DOM触发，不使用MKXFORM API）
 * 2. 在弹窗中选择人员
 * 3. 点击确定按钮关闭弹窗
 * 
 * 基于产品源代码分析（/Users/xiex/Documents/GIT/MK/sys-org/src/desktop/components/address）：
 * - 地址本弹窗容器类名：ele-address（baseCls = getPrefixCls('address')）
 * - 弹窗结构：ele-address-header、ele-address-main、ele-address-footer
 * - 确定按钮：ele-address-footer-right 中的 lui-btn-primary
 * - 最近联系人区域：ele-address-recent
 */
import { BaseFiller, FillerContext } from '@/filler/BaseFiller';

export class AddressFiller extends BaseFiller {
  constructor(context: FillerContext) {
    super(context);
  }

  /**
   * 填充地址本字段
   */
  async fill(): Promise<void> {
    const { page, field, scope } = this.context;
    console.log(`[AddressFiller] 开始填充地址本字段: ${field.label} (${field.id})`);

    try {
      // 确定操作的作用域（明细表字段使用 scope，主表字段使用页面）
      const targetScope = scope || page;

      // 通过 DOM 触发地址本弹窗（不使用 MKXFORM API）
      const modalOpened = await this.triggerAddressBookModal(targetScope);
      
      if (!modalOpened) {
        console.warn(`[AddressFiller] 无法打开地址本弹窗，字段: ${field.label}`);
        return;
      }

      // 在弹窗中选择人员
      await this.selectPersonInModal();

      console.log(`[AddressFiller] 地址本字段 "${field.label}" 填充成功`);
    } catch (error: unknown) {
      console.error(`[AddressFiller] 填充地址本字段 "${field.label}" 失败:`, error);
      throw error;
    }
  }

  /**
   * 触发地址本弹窗（纯 DOM 操作，不使用 MKXFORM API）
   * @returns 是否成功打开弹窗
   */
  private async triggerAddressBookModal(targetScope: any): Promise<boolean> {
    const { page, field } = this.context;

    // ========== 方案0-DetailTable：明细表专用方案（最高优先级）==========
    // 当 scope 是 td 元素时（明细表场景），直接在 td 内查找地址本组件
    // 不依赖 field.id/field.label，因为这些可能是临时生成的
    console.log(`[AddressFiller] 方案0-DT: 检查是否为明细表场景`);
    
    try {
      // 检查 targetScope 是否是 td 元素
      const isTdElement = await targetScope.evaluate((el: any) => 
        el.tagName?.toLowerCase() === 'td'
      ).catch(() => false);
      
      if (isTdElement) {
        console.log(`[AddressFiller] 方案0-DT: 检测到明细表 td 元素，直接在 td 内查找地址本组件`);
        
        // 基于源码分析的精确选择器（按优先级排序）：
        // 1. 触发按钮（最可靠）：.sys-org-input-search-select-select 或 .km-agency-input-search-select-select
        // 2. 输入容器：.sys-org-input-search-select 或 .km-agency-input-search-select
        // 3. xform 包装：.ele-xform-address 或 .ele-xform-agency
        
        const triggerSelectors = [
          // 方案1：点击触发按钮（plus-circle 图标）- 最可靠！
          '.sys-org-input-search-select-select',           // 地址本触发按钮
          '.km-agency-input-search-select-select',         // 机构触发按钮
          
          // 方案2：点击输入容器（会冒泡到触发按钮）
          '.sys-org-input-search-select',                  // 地址本容器
          '.km-agency-input-search-select',                // 机构容器
          
          // 方案3：点击 xform 包装组件
          '.ele-xform-address',                            // xform 地址本
          '.ele-xform-agency',                             // xform 机构
        ];
        
        for (const selector of triggerSelectors) {
          const component = targetScope.locator(selector).first();
          if (await component.count() > 0 && await component.isVisible().catch(() => false)) {
            console.log(`[AddressFiller] 方案0-DTa: 点击 ${selector}`);
            await component.scrollIntoViewIfNeeded();
            await component.click({ force: true });
            await page.waitForTimeout(1500);
            if (await this.waitForModal()) {
              console.log(`[AddressFiller] ✅ 方案0-DT 成功：通过 ${selector} 打开弹窗`);
              return true;
            }
          }
        }
        
        // 备选方案：查找任何包含 "select" 类名的可点击元素
        const fallbackSelectors = [
          '[class*="org-input"] [class*="select"]:not(input)',   // 非 input 的 select 元素
          '[class*="agency"] [class*="select"]:not(input)',     // 机构的 select 元素
          '.lui-icon.plus-circle',                              // plus-circle 图标
          'div[class*="-select"]',                              // 任何 select div
        ];
        
        for (const selector of fallbackSelectors) {
          const element = targetScope.locator(selector).first();
          if (await element.count() > 0 && await element.isVisible().catch(() => false)) {
            console.log(`[AddressFiller] 方案0-DTb: 尝试备选选择器 ${selector}`);
            await element.scrollIntoViewIfNeeded();
            await element.click({ force: true });
            await page.waitForTimeout(1500);
            if (await this.waitForModal()) {
              console.log(`[AddressFiller] ✅ 方案0-DT 成功：通过备选选择器打开弹窗`);
              return true;
            }
          }
        }
        
        console.warn(`[AddressFiller] ⚠️ 方案0-DT 所有选择器都未成功打开弹窗`);
      }
    } catch (e) {
      console.warn(`[AddressFiller] 方案0-DT 执行失败:`, e instanceof Error ? e.message : e);
    }

    // ========== 方案0：使用 Codegen 录制的精确选择器（主表场景）==========
    console.log(`[AddressFiller] 方案0: 尝试 Codegen 录制的精确选择器`);
    const fieldContainer = targetScope.locator(`[data-id*="${field.id}"]`).first();
    if (await fieldContainer.count() > 0) {
      // Codegen 中找到的精确选择器
      const iconTrigger = fieldContainer.locator('.lui-dropdown-trigger.lui-dropdown-middle-trigger.sys-org-input-search-select-value > .sys-org-input-search-select-select > .lui-icon > .lui-action > .icon');
      if (await iconTrigger.count() > 0) {
        console.log(`[AddressFiller] 方案0a: 点击 Codegen 录制的图标按钮`);
        await iconTrigger.first().scrollIntoViewIfNeeded();
        await iconTrigger.first().click({ force: true });
        await page.waitForTimeout(1500);
        if (await this.waitForModal()) return true;
      }
      
      // 简化版选择器
      const simpleIconTrigger = fieldContainer.locator('.lui-dropdown-trigger .lui-action .icon');
      if (await simpleIconTrigger.count() > 0) {
        console.log(`[AddressFiller] 方案0b: 点击简化版图标按钮`);
        await simpleIconTrigger.first().scrollIntoViewIfNeeded();
        await simpleIconTrigger.first().click({ force: true });
        await page.waitForTimeout(1500);
        if (await this.waitForModal()) return true;
      }
    }

    // ========== 方案1：通过 data-id 包含字段ID定位（优先推荐）==========
    const containsFieldId = targetScope.locator(`[data-id*="${field.id}"]`);
    const containsCount = await containsFieldId.count();
    if (containsCount > 0) {
      console.log(`[AddressFiller] 方案1: 找到 ${containsCount} 个包含字段ID "${field.id}" 的容器`);
      
      // 获取第一个容器的实际 data-id 值用于调试
      const actualDataId = await containsFieldId.first().getAttribute('data-id');
      console.log(`[AddressFiller] 实际 data-id: "${actualDataId}"`);
      
      const fieldContainerEl = containsFieldId.first();
      
      // 在字段容器内查找 sys-org 组件并点击
      const sysOrgInContainer = fieldContainerEl.locator('.sys-org-input-search-select');
      if (await sysOrgInContainer.count() > 0) {
        console.log(`[AddressFiller] 方案1a: 点击字段容器内的 sys-org-input-search-select`);
        await sysOrgInContainer.first().scrollIntoViewIfNeeded();
        await sysOrgInContainer.first().click({ force: true });
        await page.waitForTimeout(1500);
        if (await this.waitForModal()) return true;
      }
      
      // 尝试点击字段容器内的 lui-dropdown-trigger
      const dropdownTrigger = fieldContainerEl.locator('.lui-dropdown-trigger');
      if (await dropdownTrigger.count() > 0) {
        console.log(`[AddressFiller] 方案1b: 点击字段容器内的 lui-dropdown-trigger`);
        await dropdownTrigger.first().scrollIntoViewIfNeeded();
        await dropdownTrigger.first().click({ force: true });
        await page.waitForTimeout(1500);
        if (await this.waitForModal()) return true;
      }
      
      // 尝试点击整个字段容器
      console.log(`[AddressFiller] 方案1c: 点击整个字段容器`);
      await fieldContainerEl.scrollIntoViewIfNeeded();
      await fieldContainerEl.click({ force: true });
      await page.waitForTimeout(1500);
      if (await this.waitForModal()) return true;
    }

    // ========== 方案2：查找 ele-xform-address 组件 ==========
    const xformAddresses = targetScope.locator('.ele-xform-address');
    const addrCount = await xformAddresses.count();
    if (addrCount > 0) {
      console.log(`[AddressFiller] 方案2: 找到 ${addrCount} 个 ele-xform-address 组件`);
      
      for (let i = 0; i < addrCount; i++) {
        const xformAddress = xformAddresses.nth(i);
        
        // 检查这个地址本组件是否在包含当前字段ID的容器内
        const parentFieldset = xformAddress.locator('xpath=ancestor::div[@data-id]').first();
        const parentDataId = await parentFieldset.getAttribute('data-id');
        
        if (!parentDataId || parentDataId.includes(field.id)) {
          console.log(`[AddressFiller] 方案2a: 点击 ele-xform-address (索引 ${i})`);
          await xformAddress.scrollIntoViewIfNeeded();
          await xformAddress.click({ force: true });
          await page.waitForTimeout(1500);
          if (await this.waitForModal()) return true;
        }
      }
    }

    // ========== 方案3：查找 sys-org-input-search-select 组件 ==========
    const sysOrgInputs = targetScope.locator('.sys-org-input-search-select');
    const sysOrgCount = await sysOrgInputs.count();
    if (sysOrgCount > 0) {
      console.log(`[AddressFiller] 方案3: 找到 ${sysOrgCount} 个 sys-org-input-search-select`);
      
      for (let i = 0; i < sysOrgCount; i++) {
        const sysOrgInput = sysOrgInputs.nth(i);
        
        // 检查这个 sys-org 组件是否在包含当前字段ID的容器内
        const parentFieldset = sysOrgInput.locator('xpath=ancestor::div[@data-id]').first();
        const parentDataId = await parentFieldset.getAttribute('data-id');
        
        if (!parentDataId || parentDataId.includes(field.id)) {
          console.log(`[AddressFiller] 方案3a: 点击 sys-org-input-search-select (索引 ${i})`);
          await sysOrgInput.scrollIntoViewIfNeeded();
          await sysOrgInput.click({ force: true });
          await page.waitForTimeout(1500);
          if (await this.waitForModal()) return true;
        }
      }
    }

    // ========== 方案4：通过字段标签定位 ==========
    const labelElement = targetScope.locator(`.ele-xform-fieldset-label-title:has-text("${field.label}")`);
    if (await labelElement.count() > 0) {
      console.log(`[AddressFiller] 方案4: 通过标签 "${field.label}" 定位`);
      const fieldset = labelElement.locator('xpath=ancestor::div[contains(@class, "ele-xform-fieldset-wrap")]').first();
      if (await fieldset.count() > 0) {
        // 在 fieldset 内查找地址本组件
        const sysOrgInFieldset = fieldset.locator('.sys-org-input-search-select');
        if (await sysOrgInFieldset.count() > 0) {
          console.log(`[AddressFiller] 方案4a: 点击标签对应的 sys-org-input-search-select`);
          await sysOrgInFieldset.first().scrollIntoViewIfNeeded();
          await sysOrgInFieldset.first().click({ force: true });
          await page.waitForTimeout(1500);
          if (await this.waitForModal()) return true;
        }
        
        // 尝试点击 lui-dropdown-trigger
        const dropdownInFieldset = fieldset.locator('.lui-dropdown-trigger');
        if (await dropdownInFieldset.count() > 0) {
          console.log(`[AddressFiller] 方案4b: 点击标签对应的 lui-dropdown-trigger`);
          await dropdownInFieldset.first().scrollIntoViewIfNeeded();
          await dropdownInFieldset.first().click({ force: true });
          await page.waitForTimeout(1500);
          if (await this.waitForModal()) return true;
        }
      }
    }

    // ========== 方案5：查找所有可能的地址本触发按钮 ==========
    const addrTriggers = [
      '.lui-btn-icon',
      '.lui-icon-search',
      '.lui-icon-user',
      '.icon-search',
      '.icon-user',
      '.icon-plus-circle',
    ];

    for (const selector of addrTriggers) {
      const triggers = targetScope.locator(selector);
      if (await triggers.count() > 0) {
        console.log(`[AddressFiller] 方案5: 尝试点击 ${selector}`);
        await triggers.first().scrollIntoViewIfNeeded();
        await triggers.first().click({ force: true });
        await page.waitForTimeout(1500);
        if (await this.waitForModal()) return true;
      }
    }

    console.warn(`[AddressFiller] 未能找到地址本触发元素，字段: ${field.label}`);
    return false;
  }

  /**
   * 在容器内尝试多种点击策略
   */
  private async tryClickInContainer(container: any, page: any): Promise<void> {
    // 按优先级尝试的选择器
    const clickableSelectors = [
      '.ele-xform-address',           // 地址本组件容器
      '.sys-org-input-search-select', // 地址本搜索选择器
      '.lui-select-selector',         // 下拉选择器
      '.lui-dropdown-trigger',        // 下拉触发器
      '.lui-btn',                     // lui按钮
      'button',                       // 按钮
      'div[role="button"]',           // 按钮角色
      '.ele-inputselect-select',      // 选择器
      'input',                        // 输入框
      '.icon-search',                 // 搜索图标
      '.icon-plus-circle',            // 加号图标
      '.lui-btn-icon',                // 图标按钮
    ];

    for (const selector of clickableSelectors) {
      const element = container.locator(selector);
      if (await element.count() > 0) {
        console.log(`[AddressFiller] 尝试点击容器内的 ${selector}`);
        await element.first().scrollIntoViewIfNeeded();
        await element.first().click({ force: true });
        await page.waitForTimeout(1500);
        if (await this.waitForModal()) {
          return;
        }
      }
    }

    // 最后尝试点击整个容器区域
    console.log('[AddressFiller] 尝试点击整个容器区域');
    await container.scrollIntoViewIfNeeded();
    await container.click({ force: true });
    await page.waitForTimeout(1500);
  }

  /**
   * 等待弹窗出现
   * @returns 是否成功出现
   */
  private async waitForModal(): Promise<boolean> {
    const { page } = this.context;
    
    // 主弹窗类名：ele-address（来自 sys-org 组件的 baseCls = getPrefixCls('address')）
    const addressModal = page.locator('.ele-address');
    const modalCount = await addressModal.count();
    
    if (modalCount > 0) {
      try {
        await addressModal.first().waitFor({ state: 'visible', timeout: 15000 });
        console.log('[AddressFiller] 地址本弹窗已打开 (.ele-address)');
        return true;
      } catch {
        console.warn('[AddressFiller] 等待弹窗超时');
      }
    }

    // 备用弹窗类名
    const altModal = page.locator('.sys-org-selectmodal, .sys-org-address-view');
    const altCount = await altModal.count();
    
    if (altCount > 0) {
      try {
        await altModal.first().waitFor({ state: 'visible', timeout: 15000 });
        console.log('[AddressFiller] 备用弹窗已打开');
        return true;
      } catch {
        console.warn('[AddressFiller] 等待备用弹窗超时');
      }
    }

    // 检查是否有任何模态框出现
    const anyModal = page.locator('.modal, .lui-modal, [role="dialog"]');
    const anyCount = await anyModal.count();
    if (anyCount > 0) {
      console.log(`[AddressFiller] 发现 ${anyCount} 个模态框`);
      return true;
    }
    
    return false;
  }

  /**
   * 在地址本弹窗中选择人员
   */
  private async selectPersonInModal(): Promise<void> {
    const { page } = this.context;

    // 查找弹窗（优先使用 ele-address，这是产品源代码中定义的类名）
    const addressModal = page.locator('.ele-address, .sys-org-selectmodal, .sys-org-address-view, .modal, [role="dialog"]');
    const modalCount = await addressModal.count();

    if (modalCount === 0) {
      console.warn('[AddressFiller] 地址本弹窗未出现');
      return;
    }

    const modal = addressModal.first();

    // 等待弹窗加载完成
    await modal.waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 等待内部 Loading 消失
    const loading = modal.locator('.lui-spin, .loading, .ant-spin');
    if (await loading.count() > 0) {
      await loading.first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1000);
    }

    // 尝试选择人员的多种方案

    // ========== 方案0：使用 getByRole (Codegen 方式，最高优先级) ==========
    console.log('[AddressFiller] 方案0: 使用 getByRole 查找单选框');
    try {
      // 查找任意 role=radio 的元素
      const radios = modal.getByRole('radio');
      const radioCount = await radios.count();
      console.log(`[AddressFiller] 找到 ${radioCount} 个 radio 元素`);
      
      if (radioCount > 0) {
        await radios.first().check();
        await page.waitForTimeout(500);
        console.log('[AddressFiller] 已通过 getByRole 选择人员');
        await this.clickConfirmButton(modal);
        return;
      }
    } catch (e) {
      console.log('[AddressFiller] getByRole 方式失败，继续尝试其他方式');
    }

    // 方案1：选择"最近联系"列表中的第一个人员
    const recentContainer = modal.locator('.ele-address-recent');
    if (await recentContainer.count() > 0) {
      await page.waitForTimeout(1000);
      
      // 查找最近联系人列表中的项
      const recentItems = recentContainer.locator('.lui-radio-wrapper, .lui-checkbox-wrapper');
      const recentCount = await recentItems.count();
      console.log(`[AddressFiller] 最近联系人数量: ${recentCount}`);

      if (recentCount > 0) {
        await recentItems.first().click({ force: true });
        await page.waitForTimeout(500);
        console.log('[AddressFiller] 已选择最近联系人');
        
        await this.clickConfirmButton(modal);
        return;
      }
    }

    // 方案2：查找任意可选择的项（单选或多选框）
    const allSelectable = modal.locator('.lui-radio-wrapper, .lui-checkbox-wrapper');
    const selectableCount = await allSelectable.count();
    
    if (selectableCount > 0) {
      await allSelectable.first().click({ force: true });
      await page.waitForTimeout(500);
      console.log('[AddressFiller] 已选择人员（通用选择器）');
      
      await this.clickConfirmButton(modal);
      return;
    }

    // 方案3：查找组织树并选择第一个人员
    const treeNodes = modal.locator('.lui-tree-node, .lui-tree-title');
    if (await treeNodes.count() > 0) {
      console.log(`[AddressFiller] 找到 ${await treeNodes.count()} 个组织节点`);
      await treeNodes.first().click({ force: true });
      await page.waitForTimeout(1000);
      
      // 再次查找可选择项
      const personItems = modal.locator('.lui-radio-wrapper, .lui-checkbox-wrapper');
      if (await personItems.count() > 0) {
        await personItems.first().click({ force: true });
        await page.waitForTimeout(500);
        console.log('[AddressFiller] 已从组织架构中选择人员');
        
        await this.clickConfirmButton(modal);
        return;
      }
    }

    // 方案4：尝试搜索功能
    await this.trySearchAndSelect(modal);
  }

  /**
   * 尝试通过搜索选择人员
   */
  private async trySearchAndSelect(modal: any): Promise<void> {
    const { page } = this.context;
    
    // 查找搜索框（使用产品源代码中的类名）
    const searchInput = modal.locator('.ele-address-toolbar-search input, input[placeholder*="搜索"], .lui-input-search input');
    if (await searchInput.count() > 0) {
      console.log('[AddressFiller] 尝试通过搜索选择人员');
      
      // 输入搜索关键词
      await searchInput.first().fill('管理员');
      await page.waitForTimeout(1500);
      
      // 查找搜索结果中的人员
      const searchResults = modal.locator('.lui-radio-wrapper, .lui-checkbox-wrapper');
      const resultCount = await searchResults.count();
      
      if (resultCount > 0) {
        await searchResults.first().click({ force: true });
        await page.waitForTimeout(500);
        console.log('[AddressFiller] 通过搜索选择了人员');
        
        await this.clickConfirmButton(modal);
        return;
      }
    }

    console.warn('[AddressFiller] 无法找到可选择的人员');
  }

  /**
   * 点击弹窗的确定按钮
   * 根据产品源代码，确定按钮在 ele-address-footer-right 内
   */
  private async clickConfirmButton(modal: any): Promise<void> {
    const { page } = this.context;

    // 方案1：查找 ele-address-footer-right 区域的 primary 按钮（根据产品源代码）
    const footerRight = modal.locator('.ele-address-footer-right');
    if (await footerRight.count() > 0) {
      const primaryBtn = footerRight.locator('button.lui-btn-primary, button[type="primary"]');
      if (await primaryBtn.count() > 0) {
        await primaryBtn.first().click({ force: true });
        console.log('[AddressFiller] 已点击确定按钮（ele-address-footer-right primary）');
        await this.waitForModalClose(modal);
        return;
      }
    }

    // 方案2：查找 ele-address-footer 区域的按钮
    const footer = modal.locator('.ele-address-footer');
    if (await footer.count() > 0) {
      const primaryBtn = footer.locator('button.lui-btn-primary, button[type="primary"]');
      if (await primaryBtn.count() > 0) {
        await primaryBtn.first().click({ force: true });
        console.log('[AddressFiller] 已点击确定按钮（ele-address-footer primary）');
        await this.waitForModalClose(modal);
        return;
      }
      
      // 查找包含"确定"文本的按钮
      const confirmBtn = footer.locator('button:has-text("确定")');
      if (await confirmBtn.count() > 0) {
        await confirmBtn.first().click({ force: true });
        console.log('[AddressFiller] 已点击确定按钮（文本匹配）');
        await this.waitForModalClose(modal);
        return;
      }
    }

    // 方案3：查找任意 primary 按钮
    const anyPrimaryBtn = modal.locator('button.lui-btn-primary, button[type="primary"]');
    if (await anyPrimaryBtn.count() > 0) {
      await anyPrimaryBtn.first().click({ force: true });
      console.log('[AddressFiller] 已点击确定按钮（任意 primary）');
      await this.waitForModalClose(modal);
      return;
    }

    // 方案4：查找包含"确定"文本的按钮
    const confirmBtn = modal.locator('button:has-text("确定")');
    if (await confirmBtn.count() > 0) {
      await confirmBtn.first().click({ force: true });
      console.log('[AddressFiller] 已点击确定按钮（全局文本匹配）');
      await this.waitForModalClose(modal);
      return;
    }

    console.warn('[AddressFiller] 未找到确定按钮');
  }

  /**
   * 等待弹窗关闭
   */
  private async waitForModalClose(modal: any): Promise<void> {
    const { page } = this.context;
    
    try {
      await modal.waitFor({ state: 'hidden', timeout: 10000 });
      await page.waitForTimeout(500);
      console.log('[AddressFiller] 弹窗已关闭');
    } catch (error) {
      console.warn('[AddressFiller] 等待弹窗关闭超时，可能已关闭');
    }
  }
}

export default AddressFiller;