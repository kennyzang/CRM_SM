/**
 * CfgFiller — 基础数据字段填充器
 * 对应 fdType: cfg, cfg~multi
 * 支持 renderMode: singlelist, mullist, radio, checkbox, select, mulselect
 *
 * 核心策略：
 * 1. 基础数据选项从接口动态获取：POST /sys-xform/sysXFormCfgData/findByEnum
 * 2. 复用 cfgDataFetcher 工具函数
 * 3. 使用 MKXFORM.setValue() 直接设置值（可触发 onChange）
 * 4. 正确的数据格式：{ fdId, fdName } 或 [{ fdId, fdName }]
 * 5. 主表使用 MKXFORM.setValue(fieldId, value)
 * 6. 明细表使用 MKXFORM.updateControl(fieldId, rowIndex, value)
 */
import { Locator } from '@playwright/test';
import { BaseFiller } from '@/filler/BaseFiller';
import { fetchCfgOptions } from '@/utils/cfgDataFetcher';

export class CfgFiller extends BaseFiller {
  protected getWrapper(): Locator {
    if (this.context.scope) return this.context.scope;
    const { page, formId, field } = this.context;
    const dataId = `${formId}.${field.id}`;
    return page.locator(`.ele-xform-fieldset-wrap[data-id="${dataId}"]`).first();
  }

  async fill(value?: unknown): Promise<void> {
    const { field, page } = this.context;

    // 检查字段是否已有值（根据需求 P008）
    if (await this.hasValue()) {
      console.log(`[CfgFiller] Field "${field.label}" already has value, skipping`);
      return;
    }

    console.log(`[CfgFiller] Filling "${field.label}" (id=${field.id})`);

    const cfgId = (field as any).cfgId || field.id;
    console.log(`[CfgFiller] Using cfgId: ${cfgId} for field ${field.id}`);

    const options = await fetchCfgOptions(page, cfgId);
    if (options.length === 0) {
      console.warn(`[CfgFiller] No options from API for "${field.label}", trying DOM-based fill`);
      await this.fillViaUI();
      return;
    }

    console.log(`[CfgFiller] Using ${options.length} options for ${field.id}`);

    const randomIndex = Math.floor(Math.random() * options.length);
    const selectedOption = options[randomIndex];

    const valueToSet = [{ fdId: selectedOption.fdId, fdName: selectedOption.fdName }];

    console.log(`[CfgFiller] Setting value:`, JSON.stringify(valueToSet));

    // 使用 BaseFiller 的统一方法（自动区分主表/明细表）
    const success = await this.setValueViaMKXFORM(valueToSet);
    if (success) {
      console.log(`[CfgFiller] Successfully set value for "${field.label}"`);
    } else {
      console.warn(`[CfgFiller] MKXFORM failed for "${field.label}", trying DOM-based fill`);
      await this.fillViaUI();
    }
  }

  /**
   * 通过 DOM 点击方式填充 cfg 下拉字段
   * 当 API 无法获取选项时的回退方案
   */
  private async fillViaUI(): Promise<void> {
    const { field, page } = this.context;
    const wrapper = this.getWrapper();

    if (!(await this.isVisible(wrapper, 5000))) {
      // 尝试宽松匹配
      const wrapperLoose = this.getWrapperLoose();
      if (!(await this.isVisible(wrapperLoose, 3000))) {
        console.warn(`[CfgFiller] Wrapper not visible for "${field.label}", skipping DOM fill`);
        return;
      }
    }

    // 点击触发器展开下拉
    const triggerSelectors = [
      '.lui-select-selector',
      '.lui-select',
      '.ele-select',
      'input[role="combobox"]',
      '[class*="cfg"] input',
      '[class*="cfg"] .lui-select',
    ];

    let clicked = false;
    for (const selector of triggerSelectors) {
      const trigger = wrapper.locator(selector).first();
      if (await this.isVisible(trigger, 1000)) {
        await this.safeScroll(trigger);
        await trigger.click({ force: true });
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      // 直接点击 wrapper
      await this.safeScroll(wrapper);
      await wrapper.click({ force: true });
    }

    await page.waitForTimeout(800);

    // 找下拉面板
    const panelSelectors = [
      '.lui-select-dropdown',
      '.ele-select-dropdown',
      '.lui-popup',
      '[role="listbox"]',
    ];

    let panel = null;
    for (const selector of panelSelectors) {
      const els = page.locator(selector);
      const count = await els.count();
      for (let i = 0; i < count; i++) {
        const el = els.nth(i);
        if (await el.isVisible().catch(() => false)) {
          panel = el;
          break;
        }
      }
      if (panel) break;
    }

    if (!panel) {
      console.warn(`[CfgFiller] Dropdown panel not found for "${field.label}", skipping`);
      await page.keyboard.press('Escape');
      return;
    }

    // 找选项
    const optionSelectors = [
      '.lui-select-item',
      '.ele-select-item',
      '[role="option"]',
      'li[class*="item"]',
    ];

    let optionElements = null;
    for (const selector of optionSelectors) {
      const el = panel.locator(selector);
      if (await el.count() > 0) {
        optionElements = el;
        break;
      }
    }

    if (!optionElements) {
      console.warn(`[CfgFiller] No options in dropdown for "${field.label}"`);
      await page.keyboard.press('Escape');
      return;
    }

    const count = await optionElements.count();
    if (count === 0) {
      console.warn(`[CfgFiller] Empty options for "${field.label}"`);
      await page.keyboard.press('Escape');
      return;
    }

    const randomIndex = Math.floor(Math.random() * count);
    const option = optionElements.nth(randomIndex);
    const text = await option.textContent().catch(() => `Option ${randomIndex}`);
    await option.click({ force: true });
    console.log(`[CfgFiller] DOM: Selected "${text?.trim()}" for "${field.label}"`);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
}
