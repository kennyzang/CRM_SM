/**
 * MoneytextFiller — 金额填充器
 * 对应 fdType: moneytext
 */
import { BaseFiller } from '@/filler/BaseFiller';

export class MoneytextFiller extends BaseFiller {
  async fill(value?: unknown): Promise<void> {
    const { field } = this.context;

    // 检查字段是否已有值（根据需求 P008）
    if (await this.hasValue()) {
      console.log(`[MoneytextFiller] Field "${field.label}" already has value, skipping`);
      return;
    }

    // 如果传入了值，优先使用传入的值
    const inputValue = value !== undefined ? Number(value) : undefined;

    // 优先尝试 MKXFORM API
    const mkxformSuccess = await this.setValueViaMKXFORM(inputValue);
    if (mkxformSuccess) {
      console.log(`[MoneytextFiller] MKXFORM: Successfully set value for "${field.label}"`);
      return;
    }

    // 回退到 UI 填充方式
    console.log(`[MoneytextFiller] MKXFORM: Failed for "${field.label}", falling back to UI`);
    await this.fillViaUI(inputValue);
  }

  /**
   * 通过 MKXFORM API 直接设置金额值
   *
   * @returns true 如果成功设置值，false 如果失败
   */
  protected async setValueViaMKXFORM(value?: number): Promise<boolean> {
    const { field } = this.context;

    try {
      const result = await this.context.page.evaluate(
        ({ fieldId, value }: { fieldId: string; value?: number }) => {
          // @ts-ignore
          const cmp = window.MKXFORM?.$(fieldId);
          if (!cmp) {
            return { success: false, reason: 'Component not found in MKXFORM' };
          }

          const fibre = cmp._CURRENT_FIBRE;
          if (!fibre) {
            return { success: false, reason: 'No _CURRENT_FIBRE' };
          }

          const props = fibre.props;
          if (!props) {
            return { success: false, reason: 'No props in fibre' };
          }

          if (typeof props.onChange !== 'function') {
            return { success: false, reason: 'No onChange function' };
          }

          // 如果没有传入值，生成随机金额
          const finalValue = value ?? Math.floor(Math.random() * 999900) + 100;

          // 调用 onChange 设置值
          props.onChange(finalValue);

          return {
            success: true,
            value: finalValue
          };
        },
        { fieldId: field.id, value }
      );

      if (result.success) {
        console.log(`[MoneytextFiller] MKXFORM: Set "${result.value}" for "${field.label}"`);
        return true;
      } else {
        console.log(`[MoneytextFiller] MKXFORM: Failed - ${result.reason}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[MoneytextFiller] MKXFORM: Exception - ${errorMessage}`);
      return false;
    }
  }

  /**
   * 通过 UI 方式填充金额
   */
  private async fillViaUI(value?: number): Promise<void> {
    const { field } = this.context;
    const wrapper = this.getWrapper();

    if (!(await this.isVisible(wrapper, 3000))) {
      console.warn(`[MoneytextFiller] Wrapper not found for "${field.label}", skipping`);
      return;
    }

    const finalValue = value ?? this.randomNumber(100, 1000000);

    const selectors = [
      'input[type="number"]',
      '.lui-input-number input',
      '.ele-input-number input',
      '.lui-input-money input',
      'input.lui-input',
      'input',
    ];

    let input: any = null;
    for (const selector of selectors) {
      const el = wrapper.locator(selector).first();
      if (await this.isVisible(el, 2000)) {
        input = el;
        break;
      }
    }

    if (!input) {
      console.warn(`[MoneytextFiller] Input not found for "${field.label}", skipping`);
      return;
    }

    await this.safeScroll(input);
    await input.click({ force: true });
    await input.fill(String(finalValue));

    console.log(`[MoneytextFiller] Filled "${field.label}" with: ${finalValue}`);
  }
}

export default MoneytextFiller;
