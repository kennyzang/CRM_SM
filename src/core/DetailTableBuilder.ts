/**
 * DetailTableBuilder — 明细表构建器
 *
 * 处理明细表的增行、字段填充
 * 明细表模型ID格式: {mainFormId}_d_{detailId}
 */
import { Page, Locator } from '@playwright/test';
import { DetailRowFiller } from '@/core/DetailRowFiller';
import { FillerFactory } from '@/filler/FillerFactory';
import { FormField } from '@/schema/SchemaGenerator';

export interface DetailField {
  name: string;
  label: string;
  fdType: string;
  required?: boolean;
  options?: string[];
}

export interface DetailTableConfig {
  detailModelId: string;
  detailTableName?: string;
  fields?: FormField[];  // 可选：字段定义（从 Schema 中获取）
}

/**
 * 行数据对象，key 可以是字段名或字段ID，value 是对应的值
 * 支持多种字段类型：
 * - text/textarea: string
 * - number/money: number
 * - radio/select: string (选项值) 或 number (选项索引)
 * - checkbox: string[] (选项值数组) 或 number[] (选项索引数组)
 * - date: string (YYYY-MM-DD)
 * - time: string (HH:MM)
 */
export type RowData = Record<string, string | number | string[] | number[]>;

export class DetailTableBuilder {
  private page: Page;
  private config: DetailTableConfig;
  private detailWrapper: Locator;

  constructor(page: Page, config: DetailTableConfig) {
    this.page = page;
    this.config = config;
    this.detailWrapper = page.locator(`[data-id="${config.detailModelId}"]`);
  }

  /**
   * 检查明细表是否存在
   */
  async exists(): Promise<boolean> {
    return (await this.detailWrapper.count()) > 0;
  }

  /**
   * 获取明细表 ID
   */
  getDetailModelId(): string {
    return this.config.detailModelId;
  }

  /**
   * 滚动到明细表位置（兼容被 form rule 隐藏的表格）
   */
  async scrollIntoView(): Promise<void> {
    try {
      await this.detailWrapper.scrollIntoViewIfNeeded({ timeout: 5000 });
    } catch {
      // 元素可能被 form rule 隐藏（runtime-hidden），使用 JS 强制滚动
      await this.detailWrapper.evaluate((el) => {
        el.scrollIntoView({ behavior: 'instant', block: 'nearest' });
      }).catch(() => {});
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * 获取新增按钮
   */
  private getAddRowButton(): Locator {
    // data-tid 精确匹配，或按文字匹配
    const byTid = this.page.locator(`[data-tid="${this.config.detailModelId}-addRows"]`);
    const byText = this.detailWrapper.locator('button').filter({ hasText: /Add rows|Add|新增/ }).first();
    return byTid.or(byText).first();
  }

  /**
   * 添加新行
   */
  async addRow(): Promise<void> {
    const addBtn = this.getAddRowButton();
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click({ force: true });
    await this.page.waitForTimeout(1500);
    console.log(`[DetailTableBuilder] Added new row to ${this.config.detailModelId}`);
  }

  /**
   * 获取所有真实数据行（排除幽灵/占位行）
   * 使用 [data-row-key] 属性区分真实行与幽灵行
   */
  async getRows(): Promise<Locator[]> {
    return this.detailWrapper.locator('tr[data-row-key]').all();
  }

  /**
   * 获取最后一行
   */
  async getLastRow(): Promise<Locator> {
    const rows = await this.getRows();
    if (rows.length === 0) throw new Error('No rows found in detail table');
    return rows[rows.length - 1];
  }

  /**
   * 获取行数（仅统计真实数据行）
   */
  async getRowCount(): Promise<number> {
    return (await this.getRows()).length;
  }

  /**
   * 获取指定真实数据行（按索引）
   */
  private getRow(index: number): Locator {
    return this.detailWrapper.locator('tr[data-row-key]').nth(index);
  }

  /**
   * 从 name / data-tid 提取简洁的 fieldId
   * 处理格式: {detailModelId}.{fieldId}~{rowKey} 或 {fieldId}-{idx}-comp-...
   * 也处理 Schema 中的字段ID（如 fd_col_8wtgpo-0）去除末尾的 -数字 后缀
   */
  private extractFieldId(nameOrTid: string): string {
    let fid = nameOrTid.split('.').pop() || nameOrTid;
    fid = fid.split('~')[0];
    if (fid.includes('-comp-')) fid = fid.split('-comp-')[0];
    // 去除末尾的 -数字 后缀（如 fd_col_8wtgpo-0 -> fd_col_8wtgpo）
    fid = fid.replace(/-\d+$/, '');
    return fid;
  }

  /**
   * 横向滚动表格，使指定列可见
   * 明细表的列可能因宽度超出视口而需要横向滚动
   */
  async scrollToColumn(fieldName: string): Promise<void> {
    const fid = this.extractFieldId(fieldName);
    
    // 尝试通过多种选择器找到列对应的单元格
    const selectors = [
      `td:has([name*="${fid}"])`,
      `td:has([data-tid*="${fid}"])`,
      `td:has(input[placeholder*="date"][name*="${fid}"])`,
      `td:has(input[placeholder*="time"][name*="${fid}"])`,
    ];
    
    for (const selector of selectors) {
      const cell = this.detailWrapper.locator(selector).first();
      if (await cell.count() > 0) {
        await cell.evaluate((el) => {
          el.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' });
        });
        await this.page.waitForTimeout(500);
        return;
      }
    }
    
    console.warn(`[DetailTableBuilder] Could not find column for ${fieldName} to scroll`);
  }

  // ─── fillRow: 委托给 DetailRowFiller ─────────────────────────────────────

  /**
   * 自动填充整行（随机数据）
   *
   * 通过 DetailRowFiller 自动发现行内各字段类型，并委托给对应的 Filler 类。
   * 与主表共享同一套 FillerFactory，区别仅在于 scope 被设置为单元格 <td> 而非 fieldset。
   */
  async fillRow(rowIndex: number): Promise<void> {
    console.log(`[DetailTableBuilder] Filling row ${rowIndex}...`);
    const row = this.getRow(rowIndex);
    // 将 Schema 中的字段信息和 detailModelId 传递给 DetailRowFiller
    await new DetailRowFiller(this.page, row, rowIndex, this.config.fields || [], this.config.detailModelId).fill();
    console.log(`[DetailTableBuilder] Row ${rowIndex} filled`);
  }

  /**
   * 自动填充单个字段（随机数据）
   * 根据字段类型自动选择合适的 Filler 进行填充
   */
  private async autoFillField(row: Locator, rowIndex: number, fieldId: string): Promise<void> {
    // 0. ⭐ Schema 优先：对 relation/cfg/address 等复杂类型，直接用 schema 的 fdType 创建 Filler
    //    避免 DOM 探测误判（如 relation 内部的 .lui-select 被 select 步骤劫持）
    const schemaField = this.config.fields?.find(f => {
      const parts = f.id.split('.');
      return parts[parts.length - 1] === fieldId;
    });
    if (schemaField) {
      const complexType = schemaField.fdType;
      if (complexType === 'relation' || complexType === 'relation~multi' ||
          complexType.startsWith('cfg') || complexType === 'address' ||
          complexType === 'dynamic') {  // ← 添加 dynamic 类型支持
        console.log(`[DetailTableBuilder] Auto-filling ${complexType} field ${fieldId} via schema (DOM-free)`);
        await FillerFactory.createWithScope(this.page, schemaField, row, rowIndex).fill()
          .catch(e => console.warn(`[DetailTableBuilder] ${complexType}(${fieldId}):`, e));
        return;
      }
    }

    // 1. 尝试查找 textarea
    const textarea = row.locator(`td:has(textarea[name*="${fieldId}"])`).first();
    if (await textarea.count() > 0) {
      await FillerFactory.createWithScope(
        this.page, 
        { id: fieldId, fdType: 'textarea', label: fieldId, required: false }, 
        textarea, 
        rowIndex
      ).fill();
      console.log(`[DetailTableBuilder] Auto-filled textarea ${fieldId}`);
      return;
    }

    // 2. 尝试查找 radio
    const radioTd = row.locator(`td:has(input[type="radio"][name*="${fieldId}"])`).first();
    if (await radioTd.count() > 0) {
      await FillerFactory.createWithScope(
        this.page, 
        { id: fieldId, fdType: 'radio', label: fieldId, required: false }, 
        radioTd, 
        rowIndex
      ).fill();
      console.log(`[DetailTableBuilder] Auto-filled radio ${fieldId}`);
      return;
    }

    // 3. 尝试查找 checkbox
    const checkboxTd = row.locator(`td:has(input[type="checkbox"][name*="${fieldId}"])`).first();
    if (await checkboxTd.count() > 0) {
      await FillerFactory.createWithScope(
        this.page,
        { id: fieldId, fdType: 'checkbox', label: fieldId, required: false },
        checkboxTd,
        rowIndex
      ).fill();
      console.log(`[DetailTableBuilder] Auto-filled checkbox ${fieldId}`);
      return;
    }

    // 3.5 尝试查找 relation（必须在 select 之前！relation 内部也有 .lui-select）
    const relationTd = row.locator(`td:has(.ele-xform-relation[name*="${fieldId}"], .ele-xform-relation[data-id*="${fieldId}"])`).first();
    if (await relationTd.count() === 0) {
      const relTd2 = row.locator(`td:has(.ele-xform-relation)`).filter({ has: row.locator(`[data-id*="${fieldId}"]`) }).first();
      if (await relTd2.count() > 0) {
        const schemaRelField = this.config.fields?.find(f => f.id.endsWith(fieldId) && (f.fdType === 'relation' || f.fdType === 'relation~multi'));
        if (schemaRelField) {
          await FillerFactory.createWithScope(this.page, schemaRelField, relTd2, rowIndex).fill();
          console.log(`[DetailTableBuilder] Auto-filled relation ${fieldId}`);
          return;
        }
      }
    } else {
      const schemaRelField = this.config.fields?.find(f => f.id.endsWith(fieldId) && (f.fdType === 'relation' || f.fdType === 'relation~multi'));
      if (schemaRelField) {
        await FillerFactory.createWithScope(this.page, schemaRelField, relationTd, rowIndex).fill();
        console.log(`[DetailTableBuilder] Auto-filled relation ${fieldId}`);
        return;
      }
    }

    // 4. 尝试查找 select
    const selectTd = row.locator(`td:has(.lui-select[name*="${fieldId}"], .lui-select[data-tid*="${fieldId}"])`).first();
    if (await selectTd.count() > 0) {
      await FillerFactory.createWithScope(
        this.page, 
        { id: fieldId, fdType: 'select', label: fieldId, required: false }, 
        selectTd, 
        rowIndex
      ).fill();
      console.log(`[DetailTableBuilder] Auto-filled select ${fieldId}`);
      return;
    }

    // 5. 尝试查找 timestamp/datetime
    const dateTd = row.locator(`td:has(input[readonly][name*="${fieldId}"])`).first();
    if (await dateTd.count() > 0) {
      const isDate = await dateTd.locator('input').first().getAttribute('placeholder')
        .then(p => p?.toLowerCase().includes('date') || p?.toLowerCase().includes('选择日期'))
        .catch(() => false);
      if (isDate) {
        await FillerFactory.createWithScope(
          this.page, 
          { id: fieldId, fdType: 'timestamp', label: fieldId, required: false }, 
          dateTd, 
          rowIndex
        ).fill();
        console.log(`[DetailTableBuilder] Auto-filled timestamp ${fieldId}`);
        return;
      }
    }

    // 6. 尝试查找 timepicker
    const timeTd = row.locator(`td:has(input[readonly][name*="${fieldId}"])`).first();
    if (await timeTd.count() > 0) {
      const isTime = await timeTd.locator('input').first().getAttribute('placeholder')
        .then(p => p?.toLowerCase().includes('time') || p?.toLowerCase().includes('选择时间'))
        .catch(() => false);
      if (isTime) {
        await FillerFactory.createWithScope(
          this.page, 
          { id: fieldId, fdType: 'timepicker', label: fieldId, required: false }, 
          timeTd, 
          rowIndex
        ).fill();
        console.log(`[DetailTableBuilder] Auto-filled timepicker ${fieldId}`);
        return;
      }
    }

    // 7. 尝试查找 number/money
    const numberTd = row.locator(`td:has(input.lui-input-number-input[name*="${fieldId}"])`).first();
    if (await numberTd.count() > 0) {
      await FillerFactory.createWithScope(
        this.page, 
        { id: fieldId, fdType: 'numbertext', label: fieldId, required: false }, 
        numberTd, 
        rowIndex
      ).fill();
      console.log(`[DetailTableBuilder] Auto-filled numbertext ${fieldId}`);
      return;
    }

    // 8. 默认使用 fd_input
    const inputTd = row.locator(`td:has(input[name*="${fieldId}"])`).first();
    if (await inputTd.count() > 0) {
      await FillerFactory.createWithScope(
        this.page, 
        { id: fieldId, fdType: 'fd_input', label: fieldId, required: false }, 
        inputTd, 
        rowIndex
      ).fill();
      console.log(`[DetailTableBuilder] Auto-filled input ${fieldId}`);
      return;
    }

    // 9. Schema 回退：步骤 1-8 未匹配时，使用 schema 中已查找到的字段类型
    if (schemaField) {
      const filler = FillerFactory.createWithScope(this.page, schemaField, row, rowIndex);
      await filler.fill();
      console.log(`[DetailTableBuilder] Auto-filled ${schemaField.fdType} field ${fieldId} via schema fallback`);
      return;
    }

    console.warn(`[DetailTableBuilder] Could not auto-fill field ${fieldId}: no matching element found`);
  }

  /**
   * 通过 MKXFORM API 获取明细表行数
   * @returns 行数
   */
  async getRowCountViaMKXFORM(): Promise<number> {
    const result = await this.page.evaluate(
      ({ detailModelId }) => {
        // @ts-ignore
        return window.MKXFORM?.getRowCount?.(detailModelId) || 0;
      },
      { detailModelId: this.config.detailModelId }
    );
    return result;
  }

  /**
   * 通过 MKXFORM API 添加新行
   * @param rowValue 可选的行数据
   */
  async addRowViaMKXFORM(rowValue?: Record<string, any>): Promise<void> {
    await this.page.evaluate(
      ({ detailModelId, rowValue }) => {
        // @ts-ignore
        if (rowValue) {
          window.MKXFORM?.addRow?.(detailModelId, rowValue);
        } else {
          window.MKXFORM?.addRow?.(detailModelId);
        }
      },
      { detailModelId: this.config.detailModelId, rowValue }
    );
    await this.page.waitForTimeout(500);
    console.log(`[DetailTableBuilder] Added new row via MKXFORM API`);
  }

  /**
   * 通过 MKXFORM API 更新指定控件值（支持 label-to-value 自动转换）
   * @param fieldId 字段ID（格式：{tableId}.{fieldId}）
   * @param rowNum 行索引（从0开始）
   * @param value 要设置的值（支持 label 或 value 格式）
   * @returns true 如果成功，false 如果失败
   */
  private async updateControlViaMKXFORM(fieldId: string, rowNum: number, value: any): Promise<boolean> {
    try {
      let convertedValue = await this.convertLabelToValue(fieldId, value);

      // 纯数字字符串转为 Number（moneytext/numbertext 组件需要数值类型）
      if (typeof convertedValue === 'string' && convertedValue !== '' && !isNaN(Number(convertedValue))) {
        convertedValue = Number(convertedValue);
      }
      
      await this.page.evaluate(
        ({ fieldId, rowNum, value }) => {
          // @ts-ignore
          window.MKXFORM?.updateControl?.(fieldId, rowNum, value);
        },
        { fieldId, rowNum, value: convertedValue }
      );
      await this.page.waitForTimeout(100);
      console.log(`[DetailTableBuilder] MKXFORM: Updated ${fieldId}[${rowNum}] = ${JSON.stringify(convertedValue)}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[DetailTableBuilder] MKXFORM updateControl failed for ${fieldId}[${rowNum}]: ${errorMessage}`);
      return false;
    }
  }

  /**
   * 🚀 通过 API 获取 dynamic 类型字段的真实数据（避免弹窗）
   * 类似 RelationFiller 的实现方式
   * @param fieldSchema 字段 Schema（包含 renderMode 信息）
   * @param rowIndex 行索引
   * @returns API 数据对象或 null
   */
  private async fetchDynamicFieldValue(fieldSchema: any, rowIndex: number): Promise<any> {
    const pureFieldId = fieldSchema.id.split('.').pop() || fieldSchema.id;
    const renderMode = fieldSchema.renderMode;

    console.log(`[DetailTableBuilder] Fetching dynamic field options for "${pureFieldId}" (model: ${renderMode?.modelName})`);

    try {
      // 从当前页面 URL 提取 xformId
      const url = this.page.url();
      const urlMatch = url.match(/add\/([^?]+)/);
      const xformId = urlMatch ? urlMatch[1] : '';

      // 构建请求体（与 RelationFiller 一致）
      const requestBody = {
        xformId,
        docId: '',
        controlId: pureFieldId,
        dynamic: {},
        showColumns: ['fd_name'],
        queryRequest: { pageSize: 50 }
      };

      console.log(`[DetailTableBuilder] Calling associate/list API for dynamic field "${pureFieldId}"...`);

      // 使用浏览器的 fetch API 保持认证状态
      const result = await this.page.evaluate(async ({ requestBody, fieldId }) => {
        try {
          const response = await fetch('/data/sys-modeling/xform/associate/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            credentials: 'include'
          });

          if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` };
          }

          const json = await response.json();

          if (!json.success || !json.data?.content || !Array.isArray(json.data.content)) {
            return { success: false, error: 'Invalid data structure' };
          }

          // 转换为标准格式
          const data = json.data.content.map((item: any) => ({
            fdId: item.fd_id || item.fdId || item.id || '',
            fdName: item.fd_name || item.fdName || item.name || '',
            entityId: item.fd_id || item.fdId || item.id || '',
            id: item.fd_id || item.fdId || item.id || '',
            name: item.fd_name || item.fdName || item.name || ''
          })).filter((item: any) => item.fdId && item.fdName);

          return { success: true, data };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      }, { requestBody, fieldId: pureFieldId });

      if (!result.success || !result.data || result.data.length === 0) {
        console.warn(`[DetailTableBuilder] API returned no data for "${pureFieldId}": ${result.error}`);
        return null;
      }

      console.log(`[DetailTableBuilder] ✅ Got ${result.data.length} options for dynamic field "${pureFieldId}"`);

      // 根据 renderMode.type 决定返回格式
      if (renderMode?.type === 'multilist') {
        // 多选：随机选择1-3条
        const count = Math.min(Math.floor(Math.random() * 3) + 1, result.data.length);
        const shuffled = result.data.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
      } else {
        // 单选：随机选择1条
        return [result.data[Math.floor(Math.random() * result.data.length)]];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[DetailTableBuilder] ❌ Failed to fetch dynamic field options: ${errorMessage}`);
      return null;
    }
  }

  /**
   * 通过 MKXFORM 设置 dynamic 字段的值（使用正确的对象格式）
   * @param fieldId 完整字段ID
   * @param rowNum 行索引
   * @param value API 返回的数据数组
   * @returns 是否成功
   */
  private async updateDynamicFieldViaMKXFORM(fieldId: string, rowNum: number, value: any[]): Promise<boolean> {
    try {
      await this.page.evaluate(
        ({ fieldId, rowNum, value }) => {
          // @ts-ignore
          window.MKXFORM?.updateControl?.(fieldId, rowNum, value);
        },
        { fieldId, rowNum, value }
      );

      await this.page.waitForTimeout(100);
      console.log(`[DetailTableBuilder] ✅ Dynamic field ${fieldId}[${rowNum}] set via API data`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[DetailTableBuilder] Failed to set dynamic field via MKXFORM: ${errorMessage}`);
      return false;
    }
  }

  /**
   * 将 label 转换为 value（支持单选和多选）
   * @param fieldId 字段ID（格式：{tableId}.{fieldId}）
   * @param value 原始值（可能是 label 或 value）
   * @returns 转换后的值（value 格式）
   */
  private async convertLabelToValue(fieldId: string, value: any): Promise<any> {
    // 如果不是字符串或字符串数组，直接返回原值
    if (typeof value !== 'string' && !Array.isArray(value)) {
      return value;
    }

    // 提取纯字段名（去除表名前缀）
    const pureFieldId = fieldId.split('.').pop() || fieldId;
    
    // 方法1：优先从 Schema 获取选项（最可靠）
    if (this.config.fields) {
      const fieldSchema = this.config.fields.find(f => f.id === pureFieldId);
      if (fieldSchema && fieldSchema.options && fieldSchema.options.length > 0) {
        console.log(`[LabelToValue] Using options from Schema for ${pureFieldId}`);
        return this.mapLabelsToValues(fieldSchema.options, value);
      }
    }
    
    // 方法2：尝试从页面 DOM 获取选项列表
    const optionsFromDOM = await this.extractOptionsFromDOM(pureFieldId);
    if (optionsFromDOM.length > 0) {
      return this.mapLabelsToValues(optionsFromDOM, value);
    }

    // 方法4：如果还是没找到，尝试从 MKXFORM 直接获取选项
    try {
      const opts = await this.page.evaluate(
        (fieldPid: string) => {
          // @ts-ignore
          const form = window.MKXFORM;
          if (!form) return [];

          // @ts-ignore
          const dataModels: Record<string, any> = form.dataModels || {};
          for (const modelId of Object.keys(dataModels)) {
            const model = dataModels[modelId];
            const fields = model.fdFields || model.fields || [];
            for (const field of fields) {
              if (field.fdName === fieldPid || field.id === fieldPid) {
                const fdOptions = field.fdOptions || [];
                return fdOptions.map((opt: any) => ({
                  label: opt.fdLabel || opt.label || opt.fdValue,
                  value: opt.fdValue || opt.value || opt.fdLabel
                }));
              }
            }
          }
          return [];
        },
        pureFieldId
      );

      if (opts && opts.length > 0) {
        return this.mapLabelsToValues(opts, value);
      }
    } catch (error) {
      console.warn(`[DetailTableBuilder] Failed to get options from MKXFORM for ${fieldId}:`, error);
    }

    // 找不到选项时直接返回原值
    console.log(`[LabelToValue] No options found for ${fieldId}, using original value`);
    return value;
  }

  /**
   * 从 DOM 中提取字段的选项列表
   * @param fieldId 字段ID
   * @returns 选项数组 [{label, value}]
   */
  private async extractOptionsFromDOM(fieldId: string): Promise<{ label: string; value: string }[]> {
    const options: { label: string; value: string }[] = [];
    
    try {
      // 方法1：查找主表的 radio 选项
      const radioInputs = await this.page.locator(`input[type="radio"][name*="${fieldId}"]`).all();
      for (const input of radioInputs) {
        const inputValue = await input.getAttribute('value');
        const inputId = await input.getAttribute('id');
        if (inputValue) {
          let labelText = inputValue;
          if (inputId) {
            const label = await this.page.locator(`label[for="${inputId}"]`).first();
            const text = await label.textContent().catch(() => null);
            if (text) labelText = text.trim();
          }
          // 去重
          if (!options.some(opt => opt.value === inputValue)) {
            options.push({ label: labelText, value: inputValue });
          }
        }
      }
      
      // 方法2：查找主表的 checkbox 选项
      if (options.length === 0) {
        const checkboxInputs = await this.page.locator(`input[type="checkbox"][name*="${fieldId}"]`).all();
        for (const input of checkboxInputs) {
          const inputValue = await input.getAttribute('value');
          const inputId = await input.getAttribute('id');
          if (inputValue) {
            let labelText = inputValue;
            if (inputId) {
              const label = await this.page.locator(`label[for="${inputId}"]`).first();
              const text = await label.textContent().catch(() => null);
              if (text) labelText = text.trim();
            }
            if (!options.some(opt => opt.value === inputValue)) {
              options.push({ label: labelText, value: inputValue });
            }
          }
        }
      }
      
      // 方法3：查找 select 选项
      if (options.length === 0) {
        const select = await this.page.locator(`select[name*="${fieldId}"]`).first();
        const exists = await select.count();
        if (exists > 0) {
          const optionsEls = await select.locator('option').all();
          for (const opt of optionsEls) {
            const optValue = await opt.getAttribute('value');
            const optText = await opt.textContent();
            if (optValue && optText) {
              if (!options.some(o => o.value === optValue)) {
                options.push({ label: optText.trim(), value: optValue });
              }
            }
          }
        }
      }
      
      // 方法4：查找明细表中的 radio 选项
      if (options.length === 0) {
        const detailRadioInputs = await this.page.locator(`input[type="radio"]`).all();
        for (const input of detailRadioInputs) {
          const name = await input.getAttribute('name');
          if (name && name.includes(fieldId)) {
            const inputValue = await input.getAttribute('value');
            if (inputValue) {
              const inputId = await input.getAttribute('id');
              let labelText = inputValue;
              if (inputId) {
                const label = await this.page.locator(`label[for="${inputId}"]`).first();
                const text = await label.textContent().catch(() => null);
                if (text) labelText = text.trim();
              }
              if (!options.some(opt => opt.value === inputValue)) {
                options.push({ label: labelText, value: inputValue });
              }
            }
          }
        }
      }
      
      // 方法5：查找明细表中的 checkbox 选项
      if (options.length === 0) {
        const detailCheckboxInputs = await this.page.locator(`input[type="checkbox"]`).all();
        for (const input of detailCheckboxInputs) {
          const name = await input.getAttribute('name');
          if (name && name.includes(fieldId)) {
            const inputValue = await input.getAttribute('value');
            if (inputValue) {
              const inputId = await input.getAttribute('id');
              let labelText = inputValue;
              if (inputId) {
                const label = await this.page.locator(`label[for="${inputId}"]`).first();
                const text = await label.textContent().catch(() => null);
                if (text) labelText = text.trim();
              }
              if (!options.some(opt => opt.value === inputValue)) {
                options.push({ label: labelText, value: inputValue });
              }
            }
          }
        }
      }
      
      // 方法6：尝试从 lui-select 组件提取选项（下拉多选等）
      if (options.length === 0) {
        // 尝试多种 lui-select 选择器
        const selectors = [
          `.lui-select[data-tid*="${fieldId}"]`,
          `.lui-select[name*="${fieldId}"]`,
          `.ele-xform-fieldset-control-wrap:has(.lui-select) [data-tid*="${fieldId}"]`,
          `div[data-tid*="${fieldId}"] .lui-select`,
          `.lui-select[tabindex]`
        ];
        
        for (const selector of selectors) {
          const luiSelects = await this.page.locator(selector).all();
          if (luiSelects.length > 0) {
            for (const select of luiSelects) {
              try {
                await select.click().catch(() => {});
                await this.page.waitForTimeout(300);
                
                // 尝试多种下拉菜单选择器
                const menuSelectors = [
                  '.lui-select-dropdown-menu li',
                  '.lui-select-options li',
                  '.lui-select-item',
                  '.lui-dropdown-menu li'
                ];
                
                for (const menuSelector of menuSelectors) {
                  const menuOptions = await this.page.locator(menuSelector).all();
                  if (menuOptions.length > 0) {
                    for (const opt of menuOptions) {
                      const optValue = await opt.getAttribute('data-value') || await opt.getAttribute('value');
                      const optText = await opt.textContent();
                      if (optValue && optText) {
                        if (!options.some(o => o.value === optValue)) {
                          options.push({ label: optText.trim(), value: optValue });
                        }
                      }
                    }
                    break; // 找到选项就退出
                  }
                }
                
                await this.page.keyboard.press('Escape').catch(() => {});
              } catch (e) {
                // 忽略错误
              }
            }
            if (options.length > 0) break; // 找到选项就退出
          }
        }
      }

      console.log(`[LabelToValue] Extracted ${options.length} options for ${fieldId} from DOM`);
    } catch (error) {
      console.warn(`[DetailTableBuilder] Failed to extract options from DOM for ${fieldId}:`, error);
    }
    
    return options;
  }

  /**
   * 将 labels 映射到 values
   */
  private mapLabelsToValues(options: { label: string; value: string }[], value: string | string[]): any {
    if (options.length === 0) return value;
    
    if (typeof value === 'string') {
      const option = options.find(opt => opt.label === value || opt.value === value);
      if (option) {
        console.log(`[LabelToValue] Converted label "${value}" to value "${option.value}"`);
        return option.value;
      }
      return value;
    }
    
    if (Array.isArray(value)) {
      return value.map(v => {
        const option = options.find(opt => opt.label === v || opt.value === v);
        if (option) {
          console.log(`[LabelToValue] Converted label "${v}" to value "${option.value}"`);
          return option.value;
        }
        return v;
      });
    }
    
    return value;
  }

  /**
   * 通过 MKXFORM API 设置明细表字段值（旧方法，保留用于兼容）
   * @param fieldId 完整字段标识符（格式：{tableId}.{fieldId}）
   * @param value 要设置的值
   * @returns true 如果成功，false 如果失败
   */
  private async setValueViaMKXFORM(fieldId: string, value: string | number | string[] | number[]): Promise<boolean> {
    try {
      const result = await this.page.evaluate(
        ({ fieldId, value }) => {
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

          // 调用 onChange 设置值
          props.onChange(value);

          return {
            success: true,
            value
          };
        },
        { fieldId, value }
      );

      if (result.success) {
        console.log(`[DetailTableBuilder] MKXFORM: Set "${result.value}" for "${fieldId}"`);
        return true;
      } else {
        console.log(`[DetailTableBuilder] MKXFORM: Failed for "${fieldId}" - ${result.reason}`);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[DetailTableBuilder] MKXFORM: Exception for "${fieldId}" - ${errorMessage}`);
      return false;
    }
  }

  /**
   * 使用自定义数据填充整行
   * @param rowIndex 行索引
   * @param data 行数据对象，key 为字段名或字段ID，value 为填充值
   */
  async fillRowWithData(rowIndex: number, data: RowData): Promise<void> {
    console.log(`[DetailTableBuilder] Filling row ${rowIndex} with custom data...`);
    
    for (const [key, value] of Object.entries(data)) {
      try {
        // 提取字段ID（去除末尾的 -数字 后缀）
        const fid = this.extractFieldId(key);
        
        // 如果值为 '__AUTO__'，则使用自动填充（随机填充该字段）
        if (value === '__AUTO__') {
          console.log(`[DetailTableBuilder] Auto-filling field ${key} with random data...`);
          const row = this.getRow(rowIndex);
          await this.autoFillField(row, rowIndex, fid);
          continue;
        }
        
        // 构建完整的字段标识符（格式：{detailModelId}.{fieldId}）
        const fullFieldId = `${this.config.detailModelId}.${fid}`;

        // 🔑 检查是否为 dynamic 类型字段（如产品列表），需要通过 API 获取真实数据
        const fieldSchema = this.config.fields?.find(f => f.id === fid || f.id === fullFieldId);
        if (fieldSchema?.fdType === 'dynamic' && fieldSchema?.renderMode) {
          console.log(`[DetailTableBuilder] Detected dynamic field "${fid}" (type: ${fieldSchema.renderMode?.type}), fetching from API...`);
          try {
            const apiValue = await this.fetchDynamicFieldValue(fieldSchema, rowIndex);
            if (apiValue) {
              const success = await this.updateDynamicFieldViaMKXFORM(fullFieldId, rowIndex, apiValue);
              if (success) {
                console.log(`[DetailTableBuilder] ✅ Dynamic field "${fid}" filled via API:`, JSON.stringify(apiValue).substring(0, 100));
                continue;
              }
            }
          } catch (dynamicError) {
            const dynamicErrorMessage = dynamicError instanceof Error ? dynamicError.message : String(dynamicError);
            console.warn(`[DetailTableBuilder] ⚠️ API fill failed for dynamic field "${fid}", falling back to original value: ${dynamicErrorMessage}`);
          }
        }

        // 优先尝试使用 MKXFORM updateControl API（推荐方式）
        const mkxformSuccess = await this.updateControlViaMKXFORM(fullFieldId, rowIndex, value);
        if (mkxformSuccess) {
          console.log(`[DetailTableBuilder] MKXFORM: Set ${key} = ${JSON.stringify(value)}`);
          continue;
        }

        // 回退到 UI 操作
        const row = this.getRow(rowIndex);

        // 1. 尝试查找 textarea（使用模糊匹配 name*="${fid}"）
        let field = row.locator(`textarea[name*="${fid}"], textarea[data-tid*="${fid}"]`).first();
        if (await field.count() > 0) {
          await this.setTextareaValue(field, String(value));
          console.log(`[DetailTableBuilder] Set textarea ${key} = ${value}`);
          continue;
        }

        // 2. 尝试查找 radio（DOM name 包含模型前缀，用 name*= 或 data-tid*= 模糊匹配）
        const radioInputs = await row.locator(
          `input[type="radio"][name*="${fid}"], input[type="radio"][data-tid*="${fid}"]`
        ).all();
        if (radioInputs.length > 0) {
          // 获取实际完整 name（fillRadioField 需要精确匹配）
          const fullName = await radioInputs[0].getAttribute('name') || key;
          const optionIndex = typeof value === 'number' ? value : 0;
          await this.fillRadioField(rowIndex, fullName, optionIndex);
          console.log(`[DetailTableBuilder] Set radio ${key} = option ${optionIndex}`);
          continue;
        }

        // 3. 尝试查找 checkbox（同上，模糊匹配）
        const checkboxInputs = await row.locator(
          `input[type="checkbox"][name*="${fid}"], input[type="checkbox"][data-tid*="${fid}"]`
        ).all();
        if (checkboxInputs.length > 0) {
          const fullName = await checkboxInputs[0].getAttribute('name') || key;
          const optionIndices = Array.isArray(value)
            ? value.map(v => typeof v === 'number' ? v : 0)
            : [0];
          await this.fillCheckboxField(rowIndex, fullName, optionIndices);
          console.log(`[DetailTableBuilder] Set checkbox ${key} = options ${optionIndices.join(',')}`);
          continue;
        }

        // 4. 尝试查找 select（使用模糊匹配）
        const selectTd = row.locator(`td:has(.lui-select[name*="${fid}"], .lui-select[data-tid*="${fid}"])`).first();
        if (await selectTd.count() > 0) {
          await FillerFactory.createWithScope(this.page, { id: fid, fdType: 'select', label: fid, required: false }, selectTd).fill();
          await this.page.keyboard.press('Escape').catch(() => {});
          console.log(`[DetailTableBuilder] Set select ${key}`);
          continue;
        }

        // 5. 尝试查找 date/time input（使用模糊匹配 name*="${fid}"）
        let dateInput = row.locator(`input[name*="${fid}"], input[data-tid*="${fid}"]`).filter({ has: row.page().locator('[readonly]') }).first();
        if (await dateInput.count() === 0) {
          dateInput = row.locator(`input[readonly][name*="${fid}"], input.lui-picker-input[data-tid*="${fid}"]`).first();
        }
        if (await dateInput.count() > 0) {
          const isDate = await dateInput.getAttribute('placeholder').then(p => p?.toLowerCase().includes('date') || p?.toLowerCase().includes('选择日期')).catch(() => false);
          const isTime = await dateInput.getAttribute('placeholder').then(p => p?.toLowerCase().includes('time') || p?.toLowerCase().includes('选择时间')).catch(() => false);
          
          if (isDate && typeof value === 'string') {
            await this.setDateValue(dateInput, value);
            console.log(`[DetailTableBuilder] Set date ${key} = ${value}`);
          } else if (isTime && typeof value === 'string') {
            await this.setTimeValue(dateInput, value);
            console.log(`[DetailTableBuilder] Set time ${key} = ${value}`);
          }
          continue;
        }

        // 6. 尝试查找 number input（使用模糊匹配）
        let numberInput = row.locator(`input.lui-input-number-input[name*="${fid}"]`).first();
        if (await numberInput.count() > 0) {
          await this.setNumberValue(numberInput, typeof value === 'number' ? value : Number(value));
          console.log(`[DetailTableBuilder] Set number ${key} = ${value}`);
          continue;
        }

        // 7. 尝试查找普通 text input（使用模糊匹配 data-tid*="${fid}"）
        // 注意：明细表字段的 data-tid 格式为 "{fieldId}-{row}-comp-{detailModelId}-{fieldId}-input"
        // 使用 fid（提取的字段ID）匹配，而不是 key（可能包含 -0 等后缀）
        const textInputCandidates = await row.locator(`input[data-tid*="${fid}"]`).all();
        
        for (const input of textInputCandidates) {
          const type = await input.getAttribute('type');
          const readonly = await input.getAttribute('readonly');
          const placeholder = await input.getAttribute('placeholder') || '';
          const dataTid = await input.getAttribute('data-tid') || '';
          
          // 跳过 radio、checkbox
          if (type === 'radio' || type === 'checkbox') continue;
          
          // 检查是否是时间输入框（通过 placeholder 或 data-tid）
          if (readonly !== null || placeholder.toLowerCase().includes('time') || dataTid.includes('timepicker')) {
            if (placeholder.toLowerCase().includes('time') || dataTid.includes('timepicker')) {
              await this.setTimeValue(input, String(value));
              console.log(`[DetailTableBuilder] Set time ${key} = ${value}`);
            }
            continue;
          }
          
          // 检查是否是日期输入框
          if (placeholder.toLowerCase().includes('date') || dataTid.includes('datetime') || dataTid.includes('datepicker')) {
            // 日期已在前面处理，这里跳过
            continue;
          }
          
          // 检查是否是数字输入框
          if (dataTid.includes('number') || (await input.getAttribute('class'))?.includes('number')) {
            await this.setNumberValue(input, typeof value === 'number' ? value : Number(value));
            console.log(`[DetailTableBuilder] Set number ${key} = ${value}`);
            continue;
          }
          
          // 普通文本输入框
          await this.setTextValue(input, String(value));
          console.log(`[DetailTableBuilder] Set text ${key} = ${value}`);
          break;
        }
        
        if (textInputCandidates.length > 0) continue;

        // 8. 尝试查找下拉框（select）- 通过列索引查找
        // 注意：rc_select_6 和 rc_select_7 在 Schema 中，但 DOM 中没有对应的 name/data-tid
        // 需要通过列位置来识别
        const isSelectKey = key.includes('select') || key.includes('dropdown') || key.includes('rc_select');
        const isSelectFid = fid.includes('select');
        if (isSelectKey || isSelectFid) {
          const allSelects = await row.locator('.lui-select, .ele-select').all();
          
          let selectIndex = -1;
          // 根据 key 中的数字判断是第几个下拉框
          const match = key.match(/(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            // rc_select_6 -> 索引 0 (第一个下拉框)
            // rc_select_7 -> 索引 1 (第二个下拉框)
            selectIndex = num - 6;
          }
          
          if (selectIndex >= 0 && selectIndex < allSelects.length) {
            const selectContainer = allSelects[selectIndex];
            await selectContainer.scrollIntoViewIfNeeded();
            await selectContainer.click({ force: true });
            await this.page.waitForTimeout(800);
            
            // 等待下拉列表出现（可能在 body 下）
            const dropdown = this.page.locator('.lui-select-dropdown, .ele-select-dropdown, .ant-select-dropdown').filter({ visible: true }).first();
            await dropdown.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
            
            // 选择选项
            const optionIndices = (Array.isArray(value) ? value : [value as number]).map((v: string | number) => typeof v === 'number' ? v as number : 0);
            
            for (const optionIndex of optionIndices) {
              // 在下拉列表中查找选项
              const option = dropdown.locator('.lui-select-item, .ele-select-item, .ant-select-item').nth(optionIndex as number);
              if (await option.isVisible({ timeout: 1000 }).catch(() => false)) {
                await option.click({ force: true });
                console.log(`[DetailTableBuilder] Set select ${key} = option ${optionIndex}`);
                await this.page.waitForTimeout(200);
              } else {
                // 尝试在整个页面中查找
                const pageOption = this.page.locator('.lui-select-item, .ele-select-item, .ant-select-item').nth(optionIndex as number);
                if (await pageOption.isVisible({ timeout: 1000 }).catch(() => false)) {
                  await pageOption.click({ force: true });
                  console.log(`[DetailTableBuilder] Set select ${key} = option ${optionIndex}`);
                  await this.page.waitForTimeout(200);
                }
              }
            }
            await this.page.keyboard.press('Escape').catch(() => {});
            continue;
          } else {
            console.warn(`[DetailTableBuilder] Select index ${selectIndex} out of range (total: ${allSelects.length})`);
          }
        }

        console.warn(`[DetailTableBuilder] Field not found: ${key}`);
      } catch (e) {
        console.warn(`[DetailTableBuilder] Error setting ${key}:`, e);
      }
      
      await this.page.waitForTimeout(100);
    }
    
    // 🔑 关键：填充完成后刷新行数据以触发联动字段
    await this.refreshRowData(rowIndex);
    
    console.log(`[DetailTableBuilder] Row ${rowIndex} filled with custom data`);
  }

  /**
   * 刷新明细表行数据（用于触发联动字段）
   * 通过 MKXFORM API 强制刷新行数据，激活字段联动
   */
  private async refreshRowData(rowIndex: number): Promise<void> {
    const { detailModelId } = this.config;
    
    try {
      console.log(`[DetailTableBuilder] 🔄 Refreshing row ${rowIndex} data to trigger linkage...`);
      
      const success = await this.page.evaluate(({ detailModelId, rowIndex }) => {
        const mkxform = window.MKXFORM;
        if (!mkxform) {
          console.log('[DetailTableBuilder] MKXFORM not available');
          return false;
        }
        
        // 获取明细表组件
        const detailTable = mkxform.$(detailModelId);
        if (!detailTable) {
          console.log(`[DetailTableBuilder] Detail table not found: ${detailModelId}`);
          return false;
        }
        
        // 尝试多种方式刷新行数据
        try {
          // 方式1：调用 refresh 方法
          if (typeof detailTable.refresh === 'function') {
            detailTable.refresh();
            console.log('[DetailTableBuilder] ✅ Refreshed via refresh()');
            return true;
          }
          
          // 方式2：调用 reload 方法
          if (typeof detailTable.reload === 'function') {
            detailTable.reload();
            console.log('[DetailTableBuilder] ✅ Refreshed via reload()');
            return true;
          }
          
          // 方式3：触发列表变化事件
          if (detailTable.control && typeof detailTable.control.triggerEvent === 'function') {
            detailTable.control.triggerEvent('change');
            console.log('[DetailTableBuilder] ✅ Refreshed via triggerEvent()');
            return true;
          }
          
          // 方式4：手动触发数据更新
          if (detailTable.setData && detailTable.getData) {
            const currentData = detailTable.getData();
            if (currentData && currentData.values && currentData.values[rowIndex]) {
              detailTable.setData(currentData);
              console.log('[DetailTableBuilder] ✅ Refreshed via setData()');
              return true;
            }
          }
          
          console.log('[DetailTableBuilder] ⚠️ No suitable refresh method found');
          return false;
        } catch (e) {
          console.error('[DetailTableBuilder] Error refreshing row:', e);
          return false;
        }
      }, { detailModelId, rowIndex });
      
      if (success) {
        // 等待联动字段加载
        console.log(`[DetailTableBuilder] ⏳ Waiting for linkage fields to populate...`);
        await this.page.waitForTimeout(3000);
        
        // 验证联动字段是否已填充
        await this.verifyRowLinkageFields(rowIndex);
      }
    } catch (e) {
      console.warn(`[DetailTableBuilder] Failed to refresh row ${rowIndex}:`, e);
    }
  }

  /**
   * 验证明细表行的联动字段是否已填充
   */
  private async verifyRowLinkageFields(rowIndex: number): Promise<void> {
    const { detailModelId } = this.config;
    
    try {
      const rowData = await this.page.evaluate(({ detailModelId, rowIndex }) => {
        const mkxform = window.MKXFORM;
        if (!mkxform) return null;
        
        const detailTable = mkxform.$(detailModelId);
        if (!detailTable) return null;
        
        const data = mkxform.getValue(detailModelId);
        return data?.values?.[rowIndex] || null;
      }, { detailModelId, rowIndex });
      
      if (rowData) {
        console.log(`[DetailTableBuilder] 📋 Row ${rowIndex} data after refresh:`, JSON.stringify(rowData));
        
        // 检查联动字段是否已填充
        const linkageFields = ['fd_product_principal', 'fd_sm_cost', 'fd_sm_s_price', 'fd_product_type'];
        const filledFields = linkageFields.filter(field => rowData[field] !== null && rowData[field] !== undefined && rowData[field] !== '');
        
        if (filledFields.length > 0) {
          console.log(`[DetailTableBuilder] ✅ Linkage fields filled: ${filledFields.join(', ')}`);
        } else {
          console.log(`[DetailTableBuilder] ⚠️ No linkage fields filled after refresh`);
        }
      }
    } catch (e) {
      console.warn(`[DetailTableBuilder] Failed to verify linkage fields for row ${rowIndex}:`, e);
    }
  }

  // ─── Value setters for fillRowWithData ─────────────────────────────────────

  private async setTextValue(input: Locator, value: string): Promise<void> {
    await input.scrollIntoViewIfNeeded();
    await input.click({ force: true });
    await input.fill(value);
    await input.evaluate((el: HTMLInputElement, val) => {
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
  }

  private async setTextareaValue(textarea: Locator, value: string): Promise<void> {
    await textarea.scrollIntoViewIfNeeded();
    await textarea.click({ force: true });
    await textarea.fill(value);
    await textarea.evaluate((el: HTMLTextAreaElement, val) => {
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
  }

  private async setNumberValue(input: Locator, value: number): Promise<void> {
    await input.scrollIntoViewIfNeeded();
    await input.click({ force: true });
    await input.fill(String(value));
    await input.evaluate((el: HTMLInputElement, val) => {
      el.value = String(val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
  }

  private async setDateValue(input: Locator, value: string): Promise<void> {
    await input.scrollIntoViewIfNeeded();
    await input.click({ force: true });
    await this.page.waitForTimeout(800);
    
    // 尝试通过 picker 选择日期
    const picker = this.page.locator('.lui-picker-dropdown, .ele-picker-dropdown').filter({ visible: true }).first();
    const todayBtn = picker.locator('.lui-picker-today-btn, button:has-text("Today")').first();
    
    if (await todayBtn.count() > 0 && await todayBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await todayBtn.click({ force: true });
    } else {
      // 直接设置值
      await input.evaluate((el: HTMLInputElement, val) => {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, value);
    }
    
    await this.page.waitForTimeout(300);
    await this.page.keyboard.press('Escape').catch(() => {});
  }

  private async setTimeValue(input: Locator, value: string): Promise<void> {
    await input.scrollIntoViewIfNeeded();
    await input.click({ force: true });
    await this.page.waitForTimeout(800);
    
    // 直接设置值
    await input.evaluate((el: HTMLInputElement, val) => {
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
    
    await this.page.waitForTimeout(300);
    await this.page.keyboard.press('Escape').catch(() => {});
  }

  /**
   * 添加并填充一行
   */
  async addAndFillRow(): Promise<void> {
    // 获取添加前的所有行key，用于识别新行
    const prevRows = await this.getRows();
    const prevRowKeys = new Set<string>();
    for (const row of prevRows) {
      const key = await row.getAttribute('data-row-key');
      if (key) prevRowKeys.add(key);
    }
    console.log(`[DetailTableBuilder] addAndFillRow: prevRowCount=${prevRows.length}, keys=${[...prevRowKeys].join(',')}`);
    
    await this.addRow();

    // 等待新行出现（最多5秒）
    let newRowIndex = -1;
    const deadline = Date.now() + 5000;
    while (newRowIndex === -1 && Date.now() < deadline) {
      await this.page.waitForTimeout(300);
      const currentRows = await this.getRows();
      for (let i = 0; i < currentRows.length; i++) {
        const key = await currentRows[i].getAttribute('data-row-key');
        if (key && !prevRowKeys.has(key)) {
          newRowIndex = i;
          console.log(`[DetailTableBuilder] Found new row at index ${i}, key=${key}`);
          break;
        }
      }
    }
    
    if (newRowIndex === -1) {
      console.warn(`[DetailTableBuilder] Could not find new row, falling back to last row`);
      newRowIndex = (await this.getRows()).length - 1;
    }
    
    console.log(`[DetailTableBuilder] addAndFillRow: filling row ${newRowIndex}`);
    await this.fillRow(newRowIndex);
  }

  /**
   * 添加并使用自定义数据填充一行
   * 先判断明细表的行数，为0需要新增一行，再填充数据；每次调用都会添加新行
   */
  async addAndFillRowWithData(data: RowData): Promise<void> {
    // 获取当前行数（使用 MKXFORM API）
    const currentRowCount = await this.getRowCountViaMKXFORM();
    console.log(`[DetailTableBuilder] addAndFillRowWithData: currentRowCount=${currentRowCount}`);
    
    // 每次都添加新行（确保每行都是新的）
    console.log(`[DetailTableBuilder] addAndFillRowWithData: Adding new row`);
    await this.addRowViaMKXFORM();
    await this.page.waitForTimeout(500);
    
    // 获取添加后的行数
    const newRowCount = await this.getRowCountViaMKXFORM();
    const targetRowIndex = newRowCount - 1; // 新行的索引
    
    console.log(`[DetailTableBuilder] addAndFillRowWithData: filling row ${targetRowIndex} with custom data`);
    await this.fillRowWithData(targetRowIndex, data);
  }

  /**
   * 填充 radio 字段
   * @param rowIndex 行索引
   * @param fieldName 字段完整名称（包含模型前缀）
   * @param optionIndex 选项索引
   */
  async fillRadioField(rowIndex: number, fieldName: string, optionIndex: number): Promise<void> {
    const row = this.getRow(rowIndex);
    const options = row.locator(`input[type="radio"][name="${fieldName}"]`).all();
    const optionList = await options;
    
    if (optionIndex >= 0 && optionIndex < optionList.length) {
      await optionList[optionIndex].click({ force: true });
    } else {
      console.warn(`[DetailTableBuilder] Radio option index ${optionIndex} out of range for ${fieldName}`);
    }
  }

  /**
   * 填充 checkbox 字段
   * @param rowIndex 行索引
   * @param fieldName 字段完整名称（包含模型前缀）
   * @param optionIndices 选项索引数组
   */
  async fillCheckboxField(rowIndex: number, fieldName: string, optionIndices: number[]): Promise<void> {
    const row = this.getRow(rowIndex);
    const options = row.locator(`input[type="checkbox"][name="${fieldName}"]`).all();
    const optionList = await options;
    
    for (const optionIndex of optionIndices) {
      if (optionIndex >= 0 && optionIndex < optionList.length) {
        await optionList[optionIndex].click({ force: true });
      } else {
        console.warn(`[DetailTableBuilder] Checkbox option index ${optionIndex} out of range for ${fieldName}`);
      }
    }
  }
}