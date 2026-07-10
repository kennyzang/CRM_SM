/**
 * TimepickerFiller — 时间选择填充器
 * 对应 fdType: timepicker
 */
import { BaseFiller } from '@/filler/BaseFiller';

export class TimepickerFiller extends BaseFiller {
  async fill(value?: unknown): Promise<void> {
    const { field } = this.context;

    // 检查字段是否已有值（根据需求 P008）
    if (await this.hasValue()) {
      console.log(`[TimepickerFiller] Field "${field.label}" already has value, skipping`);
      return;
    }

    // 优先尝试 MKXFORM API
    const mkxformSuccess = await this.setValueViaMKXFORM(value as number | undefined);
    if (mkxformSuccess) {
      console.log(`[TimepickerFiller] MKXFORM: Successfully set value for "${field.label}"`);
      return;
    }

    // 回退到 UI 点击方式
    console.log(`[TimepickerFiller] MKXFORM: Failed for "${field.label}", falling back to UI`);
    await this.fillViaUI(value as number | undefined);
  }

  /**
   * 通过 MKXFORM API 直接设置时间的值
   * 时间格式：从当天0点开始的毫秒数（如 68045000 = 19:01:05）
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

          let finalValue: number;
          if (value !== undefined) {
            // 使用传入的毫秒值（如 68045000）
            finalValue = value;
          } else {
            // 默认使用当前时间（从当天0点开始的毫秒数）
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            finalValue = (hours * 3600 + minutes * 60 + seconds) * 1000;
          }

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
        console.log(`[TimepickerFiller] MKXFORM: Set "${result.value}" for "${field.label}"`);
        return true;
      } else {
        console.log(`[TimepickerFiller] MKXFORM: Failed - ${result.reason}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[TimepickerFiller] MKXFORM: Exception - ${errorMessage}`);
      return false;
    }
  }

  /**
   * 通过 UI 点击方式填充时间
   */
  private async fillViaUI(value?: number): Promise<void> {
    const { field, page } = this.context;
    const wrapper = this.getWrapper();

    if (!(await this.isVisible(wrapper, 3000))) {
      console.warn(`[TimepickerFiller] Wrapper not found for "${field.label}", skipping`);
      return;
    }

    let hours: number, minutes: number, seconds: number;
    if (value !== undefined) {
      // 从毫秒值转换回时分秒
      const totalSeconds = Math.floor(value / 1000);
      hours = Math.floor(totalSeconds / 3600);
      minutes = Math.floor((totalSeconds % 3600) / 60);
      seconds = totalSeconds % 60;
    } else {
      // 默认使用当前时间
      const now = new Date();
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds();
    }
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    const input = wrapper.locator('input').first();

    if (!(await this.isVisible(input, 2000))) {
      console.warn(`[TimepickerFiller] Input not found for "${field.label}", skipping`);
      return;
    }

    const readonlyAttr = await input.getAttribute('readonly');
    const isReadonly = readonlyAttr !== null;

    await this.safeScroll(input);

    if (isReadonly) {
      await input.click({ force: true });
      await page.waitForTimeout(500);

      const nowBtn = page.locator('.lui-picker-now-btn, .ele-picker-now-btn, [class*="now"], button:has-text("Now"), button:has-text("现在")').first();
      if (await this.isVisible(nowBtn, 2000)) {
        await nowBtn.click({ force: true });
        console.log(`[TimepickerFiller] Selected now for "${field.label}"`);
      } else {
        const timeOption = page.locator('.lui-time-picker-panel-select-option, .ele-time-picker-panel-select-option, [class*="time-option"]').first();
        if (await this.isVisible(timeOption, 2000)) {
          await timeOption.click({ force: true });
          console.log(`[TimepickerFiller] Selected time for "${field.label}"`);
        } else {
          console.warn(`[TimepickerFiller] Could not select time for "${field.label}"`);
        }
      }
    } else {
      await input.click({ force: true });
      await input.fill(timeStr);
      await input.press('Enter');
      console.log(`[TimepickerFiller] Filled "${field.label}" with: ${timeStr}`);
    }

    await page.waitForTimeout(300);
  }
}

export default TimepickerFiller;
