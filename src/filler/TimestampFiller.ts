/**
 * TimestampFiller — 日期选择填充器
 * 对应 fdType: timestamp
 * 
 * 核心策略：
 * - 主表使用 MKXFORM.setValue(fieldId, value)
 * - 明细表使用 MKXFORM.updateControl(fieldId, rowIndex, value)
 * - 继承 BaseFiller 的统一方法自动处理主表/明细表差异
 */
import { BaseFiller } from '@/filler/BaseFiller';

export class TimestampFiller extends BaseFiller {
  async fill(value?: unknown): Promise<void> {
    const { field } = this.context;

    // 检查字段是否已有值（根据需求 P008）
    if (await this.hasValue()) {
      console.log(`[TimestampFiller] Field "${field.label}" already has value, skipping`);
      return;
    }

    // 如果传入了值，优先使用传入的值
    const finalValue = value !== undefined ? Number(value) : this.generateValue();

    // 使用 BaseFiller 的统一方法（自动区分主表/明细表）
    const mkxformSuccess = await this.setValueViaMKXFORM(finalValue);
    if (mkxformSuccess) {
      console.log(`[TimestampFiller] MKXFORM: Successfully set value for "${field.label}"`);
      return;
    }

    console.log(`[TimestampFiller] MKXFORM: Failed for "${field.label}", falling back to UI`);
    await this.fillViaUI(finalValue);
  }

  private generateValue(): number {
    // 默认使用当前时间（根据需求：时间类字段默认填充当前时间）
    return Date.now();
  }

  /**
   * 通过 UI 点击方式填充日期
   */
  private async fillViaUI(value?: number): Promise<void> {
    const { field, page } = this.context;
    const wrapper = this.getWrapper();

    if (!(await this.isVisible(wrapper, 3000))) {
      console.warn(`[TimestampFiller] Wrapper not found for "${field.label}", skipping`);
      return;
    }

    const date = value !== undefined ? new Date(value) : new Date(this.generateValue());
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const input = wrapper.locator('input').first();

    if (!(await this.isVisible(input, 2000))) {
      console.warn(`[TimestampFiller] Input not found for "${field.label}", skipping`);
      return;
    }

    const readonlyAttr = await input.getAttribute('readonly');
    const isReadonly = readonlyAttr !== null;

    await this.safeScroll(input);

    if (isReadonly) {
      await input.click({ force: true });
      await page.waitForTimeout(500);

      const todayBtn = page.locator('.lui-picker-today-btn, .ele-picker-today-btn, [class*="today"]').first();
      if (await this.isVisible(todayBtn, 2000)) {
        await todayBtn.click({ force: true });
        console.log(`[TimestampFiller] Selected today for "${field.label}"`);
      } else {
        const dateCell = page.locator('.lui-picker-cell, .ele-picker-cell, [class*="picker-cell"]').first();
        if (await this.isVisible(dateCell, 2000)) {
          await dateCell.click({ force: true });
          console.log(`[TimestampFiller] Selected date for "${field.label}"`);
        } else {
          console.warn(`[TimestampFiller] Could not select date for "${field.label}"`);
        }
      }
    } else {
      await input.click({ force: true });
      await input.fill(dateStr);
      await input.press('Enter');
      console.log(`[TimestampFiller] UI: Filled "${field.label}" with: ${dateStr}`);
    }

    await page.waitForTimeout(300);
  }
}

export default TimestampFiller;
