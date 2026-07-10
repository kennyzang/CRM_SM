/**
 * CheckboxFiller — 多选框填充器
 * 对应 fdType: checkbox
 * 
 * 核心策略：
 * - 主表使用 MKXFORM.setValue(fieldId, value)
 * - 明细表使用 MKXFORM.updateControl(fieldId, rowIndex, value)
 * - 继承 BaseFiller 的统一方法自动处理主表/明细表差异
 */
import { BaseFiller } from '@/filler/BaseFiller';

export class CheckboxFiller extends BaseFiller {
  async fill(value?: unknown): Promise<void> {
    const { field } = this.context;

    // 检查字段是否已有值（根据需求 P008）
    if (await this.hasValue()) {
      console.log(`[CheckboxFiller] Field "${field.label}" already has value, skipping`);
      return;
    }

    // 获取选项列表
    const options = await this.getOptions();
    if (options.length === 0) {
      console.warn(`[CheckboxFiller] No options available for "${field.label}", skipping`);
      return;
    }

    // 确定要选择的值
    let selectedValues: string[];
    if (value !== undefined) {
      const inputValues = Array.isArray(value) ? value.map(v => String(v)) : [String(value)];
      selectedValues = options.filter(o => inputValues.includes(o.value)).map(o => o.value);
      if (selectedValues.length === 0) {
        // 如果没找到匹配的值，随机选择
        const numToSelect = Math.min(Math.floor(Math.random() * 3) + 1, options.length);
        const shuffled = [...options].sort(() => Math.random() - 0.5);
        selectedValues = shuffled.slice(0, numToSelect).map(o => o.value);
      }
    } else {
      // 随机选择 1 到 3 个选项
      const numToSelect = Math.min(Math.floor(Math.random() * 3) + 1, options.length);
      const shuffled = [...options].sort(() => Math.random() - 0.5);
      selectedValues = shuffled.slice(0, numToSelect).map(o => o.value);
    }

    // 使用 BaseFiller 的统一方法（自动区分主表/明细表）
    const mkxformSuccess = await this.setValueViaMKXFORM(selectedValues);
    if (mkxformSuccess) {
      const selectedLabels = options.filter(o => selectedValues.includes(o.value)).map(o => o.label);
      console.log(`[CheckboxFiller] Successfully set value for "${field.label}": [${selectedLabels.join(', ')}]`);
      return;
    }

    // 回退到 UI 点击方式
    console.log(`[CheckboxFiller] MKXFORM failed for "${field.label}", falling back to UI`);
    await this.fillViaUI(selectedValues);
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
   * 通过 UI 点击方式填充多选框（作为 MKXFORM API 的备选方案）
   */
  private async fillViaUI(value?: string[]): Promise<void> {
    const { field } = this.context;
    const wrapper = this.getWrapper();

    // 检查 wrapper 是否存在
    if (!(await this.isVisible(wrapper, 3000))) {
      console.warn(`[CheckboxFiller] Wrapper not found for "${field.label}", skipping`);
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
      const checkboxInputs = await wrapper.locator('input[type="checkbox"]').all();
      for (const input of checkboxInputs) {
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
      const wrappers = await wrapper.locator('.lui-checkbox-wrapper, .ele-checkbox-wrapper').all();
      if (wrappers.length > 0) {
        const numToSelect = value?.length ?? Math.floor(Math.random() * wrappers.length) + 1;
        const indices = Array.from({ length: wrappers.length }, (_, i) => i)
          .sort(() => Math.random() - 0.5)
          .slice(0, numToSelect);
        for (const i of indices) {
          await this.safeScroll(wrappers[i]);
          await wrappers[i].click({ force: true });
          console.log(`[CheckboxFiller] Selected option ${i} for "${field.label}" (direct wrapper click)`);
        }
        return;
      }
      console.warn(`[CheckboxFiller] No checkbox options found for "${field.label}", skipping`);
      return;
    }

    // 确定要选择的选项
    let selectedLabels: string[];
    if (value !== undefined && value.length > 0) {
      // 尝试通过值查找 label
      selectedLabels = value.map(v => {
        const label = options.find(label => optionsMap.get(label) === v);
        return label || v;
      });
    } else {
      // 随机选择 1 到全部 个选项
      const numToSelect = Math.floor(Math.random() * options.length) + 1;
      const shuffled = [...options].sort(() => Math.random() - 0.5);
      selectedLabels = shuffled.slice(0, numToSelect);
    }

    for (const optionLabel of selectedLabels) {
      const checkboxWrapper = wrapper.locator('.lui-checkbox-wrapper, .ele-checkbox-wrapper').filter({
        hasText: optionLabel
      }).first();

      if (await this.isVisible(checkboxWrapper, 3000)) {
        await this.safeScroll(checkboxWrapper);
        await checkboxWrapper.click({ force: true });
        console.log(`[CheckboxFiller] Selected "${optionLabel}" for "${field.label}"`);
      } else {
        console.warn(`[CheckboxFiller] Could not select "${optionLabel}" for "${field.label}"`);
      }
    }
  }
}

export default CheckboxFiller;
