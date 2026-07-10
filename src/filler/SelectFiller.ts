/**
 * SelectFiller — 下拉选择填充器
 * 对应 fdType: select, select~multi
 * 
 * 核心策略：
 * - 主表使用 MKXFORM.setValue(fieldId, value)
 * - 明细表使用 MKXFORM.updateControl(fieldId, rowIndex, value)
 * - 继承 BaseFiller 的统一方法自动处理主表/明细表差异
 */
import { Locator } from '@playwright/test';
import { BaseFiller } from '@/filler/BaseFiller';

export class SelectFiller extends BaseFiller {
  async fill(value?: unknown): Promise<void> {
    const { field, page } = this.context;

    // 检查字段是否已有值（根据需求 P008）
    if (await this.hasValue()) {
      console.log(`[SelectFiller] Field "${field.label}" already has value, skipping`);
      return;
    }

    // 获取选项列表
    const options = await this.getOptions();
    if (options.length === 0) {
      console.warn(`[SelectFiller] No options available for "${field.label}", skipping`);
      return;
    }

    // 判断是否为多选
    const isMulti = field.fdType === 'select~multi';

    // 确定要选择的值
    let selectedValues: string[];
    if (value !== undefined) {
      const inputValues = Array.isArray(value) ? value.map(v => String(v)) : [String(value)];
      selectedValues = options.filter(o => inputValues.includes(o.value)).map(o => o.value);
      if (selectedValues.length === 0) {
        // 如果没找到匹配的值，随机选择
        if (isMulti) {
          const numToSelect = Math.min(Math.floor(Math.random() * 3) + 1, options.length);
          const shuffled = [...options].sort(() => Math.random() - 0.5);
          selectedValues = shuffled.slice(0, numToSelect).map(o => o.value);
        } else {
          selectedValues = [options[Math.floor(Math.random() * options.length)].value];
        }
      }
    } else {
      // 随机选择
      if (isMulti) {
        const numToSelect = Math.min(Math.floor(Math.random() * 3) + 1, options.length);
        const shuffled = [...options].sort(() => Math.random() - 0.5);
        selectedValues = shuffled.slice(0, numToSelect).map(o => o.value);
      } else {
        selectedValues = [options[Math.floor(Math.random() * options.length)].value];
      }
    }

    // 根据类型确定要设置的值
    const valueToSet = isMulti ? selectedValues : selectedValues[0];

    // 使用 BaseFiller 的统一方法（自动区分主表/明细表）
    const mkxformSuccess = await this.setValueViaMKXFORM(valueToSet);
    if (mkxformSuccess) {
      const selectedLabels = options.filter(o => selectedValues.includes(o.value)).map(o => o.label);
      console.log(`[SelectFiller] Successfully set value for "${field.label}": ${isMulti ? `[${selectedLabels.join(', ')}]` : selectedLabels[0]}`);
      return;
    }

    // 回退到 UI 点击方式
    console.log(`[SelectFiller] MKXFORM failed for "${field.label}", falling back to UI`);
    await this.fillViaUI(valueToSet);
  }

  /**
   * 获取选项列表（优先从 Schema，其次从 MKXFORM）
   */
  private async getOptions(): Promise<Array<{ value: string; label: string }>> {
    const { field, page } = this.context;

    // 优先从 Schema 获取
    if (field.options && field.options.length > 0) {
      return field.options.map(o => ({ value: o.value, label: o.label }));
    }

    // 从 MKXFORM 获取
    try {
      const fieldId = this.getFieldIdentifier();
      const options = await page.evaluate((fid: string) => {
        // @ts-ignore
        const cmp = window.MKXFORM?.$(fid);
        if (!cmp) return [];
        const fibre = cmp._CURRENT_FIBRE;
        if (!fibre || !fibre.props) return [];
        const opts = fibre.props.options || [];
        return opts.map((o: any) => ({
          value: o.value || o.fdId || String(o),
          label: o.label || o.fdName || String(o)
        }));
      }, fieldId);
      return options;
    } catch {
      return [];
    }
  }

  /**
   * 通过 UI 点击方式填充下拉框
   */
  private async fillViaUI(value?: string | string[]): Promise<void> {
    const { field, page } = this.context;
    const wrapper = this.getWrapper();

    // 检查 wrapper 是否存在
    if (!(await this.isVisible(wrapper, 3000))) {
      console.warn(`[SelectFiller] Wrapper not found for "${field.label}", skipping`);
      return;
    }

    // 判断是否为多选
    const isMultiSelect = field.fdType === 'select~multi' ||
                          await wrapper.locator('.lui-select-multiple, .ele-select-multiple').count() > 0;

    // 点击下拉框展开
    const triggerSelectors = [
      '.lui-select-selector',
      '.lui-select',
      '.ele-select',
      'input[role="combobox"]',
      '.lui-cascader',
    ];

    let trigger: Locator | null = null;
    for (const selector of triggerSelectors) {
      const el = wrapper.locator(selector).first();
      if (await this.isVisible(el, 2000)) {
        trigger = el;
        break;
      }
    }

    if (!trigger) {
      console.warn(`[SelectFiller] Trigger not found for "${field.label}", skipping`);
      return;
    }

    await this.safeScroll(trigger);
    await trigger.click({ force: true });

    // 等待下拉面板渲染
    await page.waitForTimeout(600);

    // 获取下拉面板
    const panelSelectors = [
      '.lui-select-dropdown',
      '.ele-select-dropdown',
      '.lui-popup',
      '.lui-cascader-menus',
      '[role="listbox"]',
    ];

    const panel = await this.findVisiblePanel(panelSelectors);

    if (!panel) {
      console.warn(`[SelectFiller] Dropdown panel not found for "${field.label}", closing and skipping`);
      await page.keyboard.press('Escape');
      return;
    }

    // 获取所有选项
    let optionElements: Locator | null = null;

    if (isMultiSelect) {
      // 多选：跳过全选项，只取普通选项
      const el = panel.locator('.lui-select-item:not(.lui-select-item-option-all-check), .ele-select-item:not(.lui-select-item-option-all-check)');
      if (await el.count() > 0) {
        optionElements = el;
      }
    }

    if (!optionElements) {
      // 单选或 fallback：使用通用选项选择器
      const optionSelectors = [
        '.lui-select-item',
        '.ele-select-item',
        '[role="option"]',
        '.lui-cascader-menu-item',
      ];
      for (const selector of optionSelectors) {
        const el = panel.locator(selector);
        if (await el.count() > 0) {
          optionElements = el;
          break;
        }
      }
    }

    if (!optionElements) {
      console.warn(`[SelectFiller] No options found for "${field.label}", closing and skipping`);
      await page.keyboard.press('Escape');
      return;
    }

    const count = await optionElements.count();
    if (count === 0) {
      console.warn(`[SelectFiller] Empty options for "${field.label}", closing and skipping`);
      await page.keyboard.press('Escape');
      return;
    }

    // 确定要选择的索引
    let indicesToSelect: number[];
    if (value !== undefined) {
      if (isMultiSelect && Array.isArray(value)) {
        // 多选且传入数组：查找匹配的选项索引
        indicesToSelect = [];
        for (let i = 0; i < count; i++) {
          const option = optionElements.nth(i);
          const text = await option.textContent().catch(() => '');
          const optValue = await option.getAttribute('data-value').catch(() => null);
          if (value.includes(text?.trim() || '') || value.includes(optValue || '')) {
            indicesToSelect.push(i);
          }
        }
        if (indicesToSelect.length === 0) {
          indicesToSelect = [Math.floor(Math.random() * count)];
        }
      } else {
        // 单选或单值：查找匹配的选项索引
        const val = Array.isArray(value) ? value[0] : value;
        indicesToSelect = [];
        for (let i = 0; i < count; i++) {
          const option = optionElements.nth(i);
          const text = await option.textContent().catch(() => '');
          const optValue = await option.getAttribute('data-value').catch(() => null);
          if (text?.trim() === val || optValue === val) {
            indicesToSelect = [i];
            break;
          }
        }
        if (indicesToSelect.length === 0) {
          indicesToSelect = [Math.floor(Math.random() * count)];
        }
      }
    } else {
      // 随机选择
      if (isMultiSelect) {
        const numToSelect = Math.min(Math.floor(Math.random() * 3) + 1, count);
        indicesToSelect = Array.from({ length: count }, (_, i) => i)
          .sort(() => Math.random() - 0.5)
          .slice(0, numToSelect);
      } else {
        indicesToSelect = [Math.floor(Math.random() * count)];
      }
    }

    for (const index of indicesToSelect) {
      const option = optionElements.nth(index);
      const text = await option.textContent().catch(() => `Option ${index}`);
      if (await this.isVisible(option, 1000)) {
        await option.click({ force: true });
        console.log(`[SelectFiller] Selected "${text?.trim()}" for "${field.label}"`);
      }
      await page.waitForTimeout(200);
    }

    // 关闭下拉面板
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  /**
   * 在多个同名面板中找到当前可见的那个
   */
  private async findVisiblePanel(selectors: string[]): Promise<Locator | null> {
    const { page } = this.context;
    for (const selector of selectors) {
      const els = page.locator(selector);
      const count = await els.count();
      for (let i = 0; i < count; i++) {
        const el = els.nth(i);
        if (await el.isVisible().catch(() => false)) {
          return el;
        }
      }
    }
    return null;
  }
}

export default SelectFiller;
