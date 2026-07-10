/**
 * FillerFactory — Filler 组件工厂
 *
 * 根据 fdType 创建对应的 Filler 实例
 * fdType 与 Filler 的对应关系以 EasyCraft CRM 的实际 fdType 字段值为准
 */
import { Page, Locator } from '@playwright/test';
import { FormField } from '@/schema/SchemaGenerator';
import { BaseFiller, FillerContext } from '@/filler/BaseFiller';
import { FdInputFiller } from '@/filler/FdInputFiller';
import { TextareaFiller } from '@/filler/TextareaFiller';
import { RadioFiller } from '@/filler/RadioFiller';
import { CheckboxFiller } from '@/filler/CheckboxFiller';
import { SelectFiller } from '@/filler/SelectFiller';
import { TimestampFiller } from '@/filler/TimestampFiller';
import { TimepickerFiller } from '@/filler/TimepickerFiller';
import { NumbertextFiller } from '@/filler/NumbertextFiller';
import { MoneytextFiller } from '@/filler/MoneytextFiller';
import { RelationFiller } from '@/filler/RelationFiller';
import { CfgFiller } from '@/filler/CfgFiller';
import { DynamicFiller } from '@/filler/DynamicFiller';
import { AddressFiller } from '@/filler/AddressFiller';
import { AgencyFiller } from '@/filler/AgencyFiller';

export class FillerFactory {
  private static fillerMap = new Map<string, new (context: FillerContext) => BaseFiller>([
    ['fd_input',       FdInputFiller],
    ['textarea',       TextareaFiller],
    ['radio',          RadioFiller],
    ['checkbox',       CheckboxFiller],
    ['select',         SelectFiller],
    ['select~multi',   SelectFiller],
    ['timestamp',      TimestampFiller],
    ['timepicker',     TimepickerFiller],
    ['numbertext',     NumbertextFiller],
    ['moneytext',      MoneytextFiller],
    ['relation',       RelationFiller],
    ['relation~multi', RelationFiller],
    ['cfg',            CfgFiller],
    ['cfg~multi',      CfgFiller],
    // 动态控件
    ['dynamic',        DynamicFiller],
    // SP3Test 环境特有的字段类型
    ['text',           FdInputFiller],      // 文本字段
    ['calculate',      FdInputFiller],      // 计算字段（只读，使用默认填充）
    ['address',        AddressFiller],      // 地址本字段（需要弹窗选择人员/部门等）
    ['agency',         AgencyFiller],       // 单位/机构字段（km-agency 组件，选择组织单位）
    ['image',          FdInputFiller],      // 图片字段（作为 fallback）
    ['switch',         CheckboxFiller],     // 开关字段（当作复选框处理）
    ['boolean',        CheckboxFiller],     // 布尔字段（当作复选框处理）
  ]);

  /**
   * 注册 Filler 类型
   */
  static register(fdType: string, fillerClass: new (context: { page: Page; formId: string; field: FormField }) => BaseFiller): void {
    this.fillerMap.set(fdType, fillerClass);
  }

  /**
   * 创建 Filler 实例
   * 
   * @param page Playwright Page
   * @param formId 表单/明细表模型ID
   * @param field 字段描述（id/fdType/label）
   * @param rowIndex 明细表的行索引（用于调用 MKXFORM.updateControl）
   */
  static create(page: Page, formId: string, field: FormField, rowIndex?: number): BaseFiller {
    const FillerClass = this.fillerMap.get(field.fdType);

    if (!FillerClass) {
      console.warn(`[FillerFactory] No Filler found for fdType: ${field.fdType}, using FdInputFiller as fallback`);
      return new FdInputFiller({ page, formId, field, rowIndex });
    }

    return new FillerClass({ page, formId, field, rowIndex });
  }

  /**
   * 创建作用域绑定的 Filler 实例（用于明细表单元格）
   *
   * @param page Playwright Page
   * @param field 字段描述（id/fdType/label）
   * @param scope 限定搜索范围的 Locator（通常是 <td> 单元格）
   * @param rowIndex 明细表的行索引（用于调用 MKXFORM.updateControl）
   */
  static createWithScope(page: Page, field: FormField, scope: Locator, rowIndex?: number): BaseFiller {
    const FillerClass = this.fillerMap.get(field.fdType);
    if (!FillerClass) {
      console.warn(`[FillerFactory] No Filler found for fdType: ${field.fdType}, using FdInputFiller as fallback`);
      return new FdInputFiller({ page, formId: '', field, scope, rowIndex });
    }
    return new FillerClass({ page, formId: '', field, scope, rowIndex });
  }

  /**
   * 获取支持的 fdType 列表
   */
  static getSupportedTypes(): string[] {
    return Array.from(this.fillerMap.keys());
  }
}

export default FillerFactory;
