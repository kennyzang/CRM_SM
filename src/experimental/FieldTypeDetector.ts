/**
 * FieldTypeDetector — 字段类型检测
 *
 * 根据 DOM 元素和属性判断字段类型
 */
import { Page, Locator } from '@playwright/test';
import { FieldOption } from '@/schema/SchemaGenerator';

export interface FieldTypeResult {
  fdType: string;
  renderMode?: string;
  isMultiSelect?: boolean;
}

export class FieldTypeDetector {
  private page: Page;

  private static readonly SYSTEM_FIELDS = new Set([
    'fd_id', 'fd_create_time', 'fd_last_modified_time',
    'fd_creator', 'fd_creator_dept', 'fd_owner', 'fd_owner_dept',
    'fd_alter', 'fd_alter_time', 'fd_deleted', 'fd_published_time',
    'fd_doc_status', 'fd_doc_subject', 'fd_template', 'fd_xform_id',
    'fd_version', 'fd_entity_id', 'fd_entity_name', 'fd_module',
    'fd_main_id', 'fd_order', 'fd_att_nocopy', 'fd_att_no_print',
    'fd_att_no_download', 'fd_draft_no_edit_copys', 'fd_draft_no_edit_download',
    'fd_draft_no_edit_prints'
  ]);

  private static readonly LAYOUT_FIELDS = new Set([
    'dividing', 'desc', 'multi-header', 'hidden', 'boolean'
  ]);

  private static readonly TYPE_MAPPING: Record<string, string> = {
    'text': 'fd_input',
    'varchar': 'fd_input',
    'number': 'numbertext',
    'agency': 'cfg',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async detect(wrapper: Locator, fieldId: string): Promise<FieldTypeResult> {
    const placeholder = await wrapper.locator('input').first().getAttribute('placeholder').catch(() => '');

    if (placeholder?.includes('日期') || placeholder?.includes('date') || fieldId.includes('date')) {
      return { fdType: 'timestamp' };
    }
    if (placeholder?.includes('时间') || placeholder?.includes('time') || fieldId.includes('time')) {
      return { fdType: 'timepicker' };
    }

    if (await this.isAddress(wrapper)) {
      return { fdType: 'address' };
    }

    if (await this.isCfg(wrapper)) {
      return { fdType: 'cfg', isMultiSelect: await this.isMultiSelect(wrapper) };
    }

    if (await this.isRelation(wrapper)) {
      return { fdType: 'relation', isMultiSelect: await this.isMultiSelect(wrapper) };
    }

    return this.detectBasicType(wrapper);
  }

  private async isAddress(wrapper: Locator): Promise<boolean> {
    return await wrapper.locator('.ele-xform-address, .sys-org-input-search-select, [data-xform-type="address"]').count() > 0;
  }

  private async isCfg(wrapper: Locator): Promise<boolean> {
    return await wrapper.locator('.ele-xform-basecfg, .ele-xform-basecfg-wrap, [data-xform-type="basecfg"]').count() > 0;
  }

  private async isRelation(wrapper: Locator): Promise<boolean> {
    return await wrapper.locator('.ele-xform-relation, .ele-xform-relation-wrap-select, [data-xform-type="relation"]').count() > 0;
  }

  private async isMultiSelect(wrapper: Locator): Promise<boolean> {
    return await wrapper.locator('.lui-select-multiple, .ele-select-multiple, [multiple]').count() > 0;
  }

  private async detectBasicType(wrapper: Locator): Promise<FieldTypeResult> {
    const checks = [
      { type: 'textarea', selector: 'textarea' },
      { type: 'radio', selector: 'input[type="radio"]' },
      { type: 'checkbox', selector: 'input[type="checkbox"]' },
      { type: 'select~multi', selector: '.lui-select-multiple, .ele-select-multiple, [multiple]' },
      { type: 'select', selector: '.lui-select, .ele-select' },
      { type: 'timestamp', selector: '.lui-date-picker, .ele-date-picker, input[type="date"]' },
      { type: 'timepicker', selector: '.lui-time-picker, .ele-time-picker, input[type="time"]' },
      { type: 'moneytext', selector: '.lui-input-number-money, .ele-input-money' },
      { type: 'numbertext', selector: 'input[type="number"], .lui-input-number' },
      { type: 'cascader', selector: '.lui-cascader, .ele-cascader' },
      { type: 'fd_input', selector: 'input[type="text"]' },
    ];

    for (const { type, selector } of checks) {
      const count = await wrapper.locator(selector).count();
      if (count > 0) {
        if (type === 'radio' || type === 'checkbox') {
          if (count > 1) return { fdType: type };
        } else {
          return { fdType: type };
        }
      }
    }

    return { fdType: 'fd_input' };
  }

  mapType(rawType: string): string {
    return FieldTypeDetector.TYPE_MAPPING[rawType] || rawType;
  }

  isSystemField(fieldId: string): boolean {
    return FieldTypeDetector.SYSTEM_FIELDS.has(fieldId);
  }

  isLayoutField(fieldType: string): boolean {
    return FieldTypeDetector.LAYOUT_FIELDS.has(fieldType);
  }

  async extractOptions(wrapper: Locator, fdType: string): Promise<FieldOption[] | undefined> {
    if (!['radio', 'checkbox', 'select', 'select~multi'].includes(fdType)) {
      return undefined;
    }

    const options: FieldOption[] = [];
    const processedValues = new Set<string>();

    try {
      if (fdType === 'radio' || fdType === 'checkbox') {
        const inputType = fdType === 'radio' ? 'radio' : 'checkbox';
        const inputs = await wrapper.locator(`input[type="${inputType}"]`).all();

        for (const input of inputs) {
          const value = await input.getAttribute('value').catch(() => null);
          if (!value || processedValues.has(value)) continue;
          processedValues.add(value);

          let label = value;
          try {
            const parentLabel = input.locator('xpath=ancestor::label[1]');
            if (await parentLabel.count() > 0) {
              const textSpan = parentLabel.locator('> span:last-child');
              const text = await textSpan.textContent().catch(() => null);
              if (text?.trim()) label = text.trim();
            }
          } catch {}

          if (label === value) {
            const inputId = await input.getAttribute('id').catch(() => null);
            if (inputId) {
              const labelEl = wrapper.locator(`label[for="${inputId}"]`).first();
              const text = await labelEl.textContent().catch(() => null);
              if (text?.trim()) label = text.trim();
            }
          }

          options.push({ label, value });
        }
      }
    } catch {}

    return options.length > 0 ? options : undefined;
  }
}
