/**
 * TextareaFiller — 多行文本填充器
 * 对应 fdType: textarea
 * 
 * 核心策略：
 * - 主表使用 MKXFORM.setValue(fieldId, value)
 * - 明细表使用 MKXFORM.updateControl(fieldId, rowIndex, value)
 * - 继承 BaseFiller 的统一方法自动处理主表/明细表差异
 */
import { BaseFiller } from '@/filler/BaseFiller';

export class TextareaFiller extends BaseFiller {
  async fill(value?: unknown): Promise<void> {
    const { field } = this.context;

    // 检查字段是否已有值（根据需求 P008）
    if (await this.hasValue()) {
      console.log(`[TextareaFiller] Field "${field.label}" already has value, skipping`);
      return;
    }

    // 如果传入了值，优先使用传入的值
    const finalValue = value !== undefined ? String(value) : this.generateValue();

    // 使用 BaseFiller 的统一方法（自动区分主表/明细表）
    const mkxformSuccess = await this.setValueViaMKXFORM(finalValue);
    if (mkxformSuccess) {
      console.log(`[TextareaFiller] MKXFORM: Successfully set value for "${field.label}"`);
      return;
    }

    console.log(`[TextareaFiller] MKXFORM: Failed for "${field.label}", falling back to UI`);
    await this.fillViaUI(finalValue);
  }

  private generateValue(): string {
    return `测试文本\n时间: ${new Date().toISOString()}\n编号: ${Math.floor(Math.random() * 10000)}`;
  }

  /**
   * 通过 UI 方式填充文本
   */
  private async fillViaUI(value?: string): Promise<void> {
    const { field } = this.context;
    const wrapper = this.getWrapper();

    if (!(await this.isVisible(wrapper, 3000))) {
      console.warn(`[TextareaFiller] Wrapper not found for "${field.label}", skipping`);
      return;
    }

    const textarea = wrapper.locator('textarea').first();
    if (!(await this.isVisible(textarea, 2000))) {
      console.warn(`[TextareaFiller] Textarea not found for "${field.label}", skipping`);
      return;
    }

    const finalValue = value ?? this.generateValue();

    await this.safeScroll(textarea);
    await textarea.click({ force: true });
    await textarea.fill(finalValue);

    console.log(`[TextareaFiller] UI: Filled "${field.label}" with: ${finalValue.substring(0, 30)}...`);
  }
}

export default TextareaFiller;
