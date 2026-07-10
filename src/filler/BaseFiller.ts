/**
 * BaseFiller — 所有 Filler 组件的基类
 */
import { Page, Locator } from '@playwright/test';
import { FormField } from '@/schema/SchemaGenerator';

export interface FillerContext {
  page: Page;
  formId: string;
  field: FormField;
  /**
   * 当设置时，直接用作字段的作用域（覆盖默认的 .ele-xform-fieldset-wrap 查找）。
   * 用于明细表场景，将作用域限定到具体的 <td> 单元格。
   */
  scope?: Locator;
  /**
   * 明细表的行索引（从0开始），用于调用 MKXFORM.updateControl。
   * 主表填充时为 undefined，此时使用 MKXFORM.setValue。
   */
  rowIndex?: number;
}

export abstract class BaseFiller {
  protected context: FillerContext;

  constructor(context: FillerContext) {
    this.context = context;
  }

  /**
   * 获取字段的 wrapper Locator，优先精确匹配，回退到模糊匹配。
   * - 主表模式：优先尝试 .ele-xform-fieldset-wrap[data-id="{formId}.{fieldId}"]
   *              若不可见则回退到 .ele-xform-fieldset-wrap[data-id*="{fieldId}"]
   * - 明细表模式（context.scope 已设置）：直接返回 scope
   */
  protected getWrapper(): Locator {
    if (this.context.scope) return this.context.scope;
    const { page, formId, field } = this.context;

    const dataId = `${formId}.${field.id}`;
    const exactMatch = page.locator(`.ele-xform-fieldset-wrap[data-id="${dataId}"]`).first();
    const looseMatch = page.locator(`.ele-xform-fieldset-wrap[data-id*="${field.id}"]`).first();

    return exactMatch;
  }

  /**
   * 获取 wrapper Locator，优先模糊匹配。
   * 用于某些场景（如 SP3Test）data-id 不包含 formId 前缀时。
   */
  protected getWrapperLoose(): Locator {
    if (this.context.scope) return this.context.scope;
    const { page, field } = this.context;
    return page.locator(`.ele-xform-fieldset-wrap[data-id*="${field.id}"]`).first();
  }

  /**
   * 安全地滚动到元素
   */
  protected async safeScroll(locator: Locator): Promise<boolean> {
    try {
      await locator.scrollIntoViewIfNeeded({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查元素是否可见
   */
  protected async isVisible(locator: Locator, timeout: number = 3000): Promise<boolean> {
    return await locator.isVisible({ timeout }).catch(() => false);
  }

  /**
   * 生成随机字符串
   */
  protected randomString(prefix: string = ''): string {
    return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * 生成随机数字
   */
  protected randomNumber(min: number = 1, max: number = 10000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 生成随机日期（毫秒时间戳）
   */
  protected randomDate(): number {
    const now = Date.now();
    const pastYear = 365 * 24 * 60 * 60 * 1000;
    return now - Math.floor(Math.random() * pastYear);
  }

  /**
   * 获取字段的完整标识符（用于 MKXFORM API 调用）
   * 主表格式: {formId}.{fieldId}
   * 明细表格式: {detailTableId}.{fieldId}（从 field.id 中提取）
   */
  protected getFieldIdentifier(): string {
    const { formId, field } = this.context;
    // 如果 field.id 已经包含表名前缀（如 detailModelId.fieldId），直接使用
    if (field.id.includes('.')) {
      return field.id;
    }
    // 否则添加 formId 前缀
    return `${formId}.${field.id}`;
  }

  /**
   * 统一的 MKXFORM 填充方法
   * - 主表（rowIndex 为 undefined）：使用 MKXFORM.setValue(fieldId, value)
   * - 明细表（rowIndex 已设置）：使用 MKXFORM.updateControl(fieldId, rowIndex, value)
   * 
   * @param value 要设置的值
   * @returns true 如果成功设置值，false 如果失败
   */
  protected async setValueViaMKXFORM(value: unknown): Promise<boolean> {
    const { field, page, rowIndex } = this.context;
    const fieldId = this.getFieldIdentifier();

    try {
      const result = await page.evaluate(
        ({ fid, val, rowIdx }: { fid: string; val: unknown; rowIdx?: number }) => {
          // @ts-ignore
          const mkxform = window.MKXFORM;
          if (!mkxform) {
            return { success: false, reason: 'MKXFORM not available' };
          }

          try {
            if (rowIdx !== undefined) {
              // 明细表：使用 updateControl
              if (typeof mkxform.updateControl !== 'function') {
                return { success: false, reason: 'MKXFORM.updateControl not available' };
              }
              mkxform.updateControl(fid, rowIdx, val);
            } else {
              // 主表：使用 setValue
              if (typeof mkxform.setValue !== 'function') {
                return { success: false, reason: 'MKXFORM.setValue not available' };
              }
              mkxform.setValue(fid, val);
            }
            return { success: true };
          } catch (error) {
            return { success: false, reason: `Exception: ${error instanceof Error ? error.message : String(error)}` };
          }
        },
        { fid: fieldId, val: value, rowIdx: rowIndex }
      );

      if (result.success) {
        console.log(`[BaseFiller] MKXFORM: Successfully set value for "${field.label}" (${fieldId})`);
        return true;
      } else {
        console.log(`[BaseFiller] MKXFORM: Failed for "${field.label}" - ${result.reason}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[BaseFiller] MKXFORM: Exception for "${field.label}" - ${errorMessage}`);
      return false;
    }
  }

  /**
   * 获取字段当前值（通过 MKXFORM API）
   * 
   * @returns 当前值，如果获取失败返回 undefined
   */
  protected async getFieldValue(): Promise<unknown> {
    const { field, page, rowIndex } = this.context;
    const fieldId = this.getFieldIdentifier();

    try {
      const result = await page.evaluate(
        ({ fid, rowIdx }: { fid: string; rowIdx?: number }) => {
          // @ts-ignore
          const mkxform = window.MKXFORM;
          if (!mkxform) {
            return { success: false, reason: 'MKXFORM not available' };
          }

          try {
            // 明细表场景：尝试获取特定行的值
            if (rowIdx !== undefined) {
              // 尝试 getControlValue 方法（支持行索引）
              if (typeof mkxform.getControlValue === 'function') {
                const value = mkxform.getControlValue(fid, rowIdx);
                return { success: true, value };
              }
              // 明细表字段可能没有独立的组件实例，返回 undefined（空值）
              return { success: true, value: undefined };
            }

            // 主表场景：尝试获取组件实例
            const cmp = mkxform.$(fid);
            if (!cmp) {
              return { success: false, reason: 'Component not found' };
            }

            // 尝试从组件获取值
            const fibre = cmp._CURRENT_FIBRE;
            if (fibre && fibre.props && fibre.props.value !== undefined) {
              return { success: true, value: fibre.props.value };
            }

            // 尝试 getControlValue 方法（如果存在）
            if (typeof mkxform.getControlValue === 'function') {
              const value = mkxform.getControlValue(fid);
              return { success: true, value };
            }

            return { success: false, reason: 'Cannot get value' };
          } catch (error) {
            return { success: false, reason: `Exception: ${error instanceof Error ? error.message : String(error)}` };
          }
        },
        { fid: fieldId, rowIdx: rowIndex }
      );

      if (result.success) {
        return result.value;
      } else {
        console.log(`[BaseFiller] Get value failed for "${field.label}" - ${result.reason}`);
        return undefined;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[BaseFiller] Get value exception for "${field.label}" - ${errorMessage}`);
      return undefined;
    }
  }

  /**
   * 检查字段是否已有值（非空）
   * 
   * @returns true 如果字段已有值，false 如果为空或获取失败
   */
  protected async hasValue(): Promise<boolean> {
    const value = await this.getFieldValue();
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }

  /**
   * 抽象方法：填充字段
   * @param value 可选的预设值，如果不提供则使用随机数据
   */
  abstract fill(value?: unknown): Promise<void>;
}

export default BaseFiller;
