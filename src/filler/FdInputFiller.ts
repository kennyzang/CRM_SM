/**
 * FdInputFiller — 单行文本填充器
 * 对应 fdType: fd_input
 * 
 * 核心策略：
 * - 主表使用 MKXFORM.setValue(fieldId, value)
 * - 明细表使用 MKXFORM.updateControl(fieldId, rowIndex, value)
 * - 继承 BaseFiller 的统一方法自动处理主表/明细表差异
 */
import { BaseFiller } from '@/filler/BaseFiller';

export class FdInputFiller extends BaseFiller {
  async fill(value?: unknown): Promise<void> {
    const { field } = this.context;

    // 检查字段是否已有值（根据需求 P008）
    if (await this.hasValue()) {
      console.log(`[FdInputFiller] Field "${field.label}" already has value, skipping`);
      return;
    }

    // 如果传入了值，优先使用传入的值
    const finalValue = value !== undefined ? String(value) : this.randomString('Text_');

    // 使用 BaseFiller 的统一方法（自动区分主表/明细表）
    const mkxformSuccess = await this.setValueViaMKXFORM(finalValue);
    if (mkxformSuccess) {
      console.log(`[FdInputFiller] Successfully set value for "${field.label}": ${finalValue}`);
      return;
    }

    // 回退到 UI 填充方式
    console.log(`[FdInputFiller] MKXFORM failed for "${field.label}", falling back to UI`);
    await this.fillViaUI(finalValue);
  }

  /**
   * 通过 UI 方式填充文本（作为 MKXFORM API 的备选方案）
   */
  private async fillViaUI(value: string): Promise<void> {
    const { field, page } = this.context;
    const wrapper = this.getWrapper();

    if (!(await this.isVisible(wrapper, 3000))) {
      console.warn(`[FdInputFiller] Wrapper not found for "${field.label}", skipping`);
      return;
    }

    // 优先查找 textarea（多行文本），其次查找 input
    let input = wrapper.locator('textarea').first();
    if (await input.count() === 0 || !(await input.isVisible().catch(() => false))) {
      input = wrapper.locator('input[type="text"]').first();
    }

    if (!(await this.isVisible(input, 2000))) {
      console.warn(`[FdInputFiller] Input not found for "${field.label}", skipping`);
      return;
    }

    await this.safeScroll(input);
    await input.click({ force: true });
    
    // 清空并填充值
    await input.fill('');
    await input.type(value, { delay: 10 });
    
    // 触发必要的事件，确保表单框架检测到值变化
    await input.dispatchEvent('input');
    await input.dispatchEvent('change');
    await page.keyboard.press('Tab');  // 触发 blur 事件
    
    // 等待 React/Vue 更新状态
    await page.waitForTimeout(500);

    console.log(`[FdInputFiller] Filled "${field.label}" with: ${value}`);
  }
}

export default FdInputFiller;
