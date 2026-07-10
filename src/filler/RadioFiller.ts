/**
 * RadioFiller — 单选框填充器
 * 对应 fdType: radio
 * 
 * 核心策略：
 * - 主表使用 MKXFORM.setValue(fieldId, value)
 * - 明细表使用 MKXFORM.updateControl(fieldId, rowIndex, value)
 * - 继承 BaseFiller 的统一方法自动处理主表/明细表差异
 */
import { BaseFiller } from '@/filler/BaseFiller';

export class RadioFiller extends BaseFiller {
  async fill(value?: unknown): Promise<void> {
    const { field } = this.context;

    // 如果显式提供了 value，总是设置它（覆盖已有值）
    // 如果没有提供 value，则检查字段是否已有值，避免覆盖用户手动填写的值
    if (value === undefined && await this.hasValue()) {
      console.log(`[RadioFiller] Field "${field.label}" already has value, skipping`);
      return;
    }

    // 获取选项列表
    const options = await this.getOptions();
    if (options.length === 0) {
      console.warn(`[RadioFiller] No options available for "${field.label}", skipping`);
      return;
    }

    // 确定要选择的值
    let selectedValue: string;
    if (value !== undefined) {
      const strValue = String(value);
      const found = options.find(o => o.value === strValue);
      selectedValue = found ? found.value : options[Math.floor(Math.random() * options.length)].value;
    } else {
      // 随机选择一个选项
      selectedValue = options[Math.floor(Math.random() * options.length)].value;
    }

    // 使用 BaseFiller 的统一方法（自动区分主表/明细表）
    const mkxformSuccess = await this.setValueViaMKXFORM(selectedValue);
    if (mkxformSuccess) {
      const selectedLabel = options.find(o => o.value === selectedValue)?.label || selectedValue;
      console.log(`[RadioFiller] Successfully set value for "${field.label}": ${selectedLabel}`);
      return;
    }

    // 回退到 UI 点击方式
    console.log(`[RadioFiller] MKXFORM failed for "${field.label}", falling back to UI`);
    await this.fillViaUI(selectedValue);
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
   * 通过 UI 点击方式填充单选框（作为 MKXFORM API 的备选方案）
   */
  private async fillViaUI(value?: string): Promise<void> {
    const { field } = this.context;
    const wrapper = this.getWrapper();

    // 检查 wrapper 是否存在
    if (!(await this.isVisible(wrapper, 3000))) {
      console.warn(`[RadioFiller] Wrapper not found for "${field.label}", skipping`);
      return;
    }

    // 获取所有可选选项
    let options: string[] = [];
    let optionsMap: Map<string, string> = new Map(); // label -> value

    if (field.options && field.options.length > 0) {
      options = field.options.map(o => o.label);
      field.options.forEach(o => optionsMap.set(o.label, o.value));
    } else {
      // 从 DOM 获取选项
      const radioInputs = await wrapper.locator('input[type="radio"]').all();
      for (const input of radioInputs) {
        const inputId = await input.getAttribute('id');
        if (!inputId) continue; // LUI 没有 id，跳过避免查询 label[for="null"]
        const labelEl = wrapper.locator(`label[for="${inputId}"]`).first();
        const labelText = await labelEl.textContent({ timeout: 300 }).catch(() => null);
        if (labelText) {
          options.push(labelText);
        }
      }
    }

    if (options.length === 0) {
      // LUI 组件没有 label[for] 属性，直接点击 wrapper
      const wrappers = await wrapper.locator('.lui-radio-wrapper, .ele-radio-wrapper').all();
      if (wrappers.length > 0) {
        const idx = Math.floor(Math.random() * wrappers.length);
        await this.safeScroll(wrappers[idx]);
        await wrappers[idx].click({ force: true });
        console.log(`[RadioFiller] Selected option ${idx} for "${field.label}" (direct wrapper click)`);
        return;
      }
      console.warn(`[RadioFiller] No radio options found for "${field.label}", skipping`);
      return;
    }

    // 确定要选择的选项
    let optionLabel: string;
    if (value !== undefined) {
      // 尝试通过值查找 label
      optionLabel = options.find(label => optionsMap.get(label) === value) || value;
    } else {
      // 随机选择一个选项
      optionLabel = options[Math.floor(Math.random() * options.length)];
    }

    // 通过 label 文本点击
    const radioWrapper = wrapper.locator('.lui-radio-wrapper, .ele-radio-wrapper').filter({
      hasText: optionLabel
    }).first();

    if (await this.isVisible(radioWrapper, 3000)) {
      await this.safeScroll(radioWrapper);
      await radioWrapper.click({ force: true });
      console.log(`[RadioFiller] Selected "${optionLabel}" for "${field.label}"`);
    } else {
      // 备选：直接点击 radio input
      const radioInput = wrapper.locator(`input[type="radio"][value="${optionLabel}"]`).first();
      if (await this.isVisible(radioInput, 2000)) {
        await this.safeScroll(radioInput);
        await radioInput.click({ force: true });
        console.log(`[RadioFiller] Selected by value "${optionLabel}" for "${field.label}"`);
      } else {
        console.warn(`[RadioFiller] Could not select option "${optionLabel}" for "${field.label}"`);
      }
    }
  }
}

export default RadioFiller;
