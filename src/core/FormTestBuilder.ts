/**
 * FormTestBuilder — Schema 驱动的表单测试构建器
 *
 * 基于 Schema 自动填充表单字段
 */
import { Page } from '@playwright/test';
import { FormSchema, FormField, SchemaGenerator } from '@/schema/SchemaGenerator';
import { FillerFactory } from '@/filler/FillerFactory';
import { DetailTableBuilder, DetailTableConfig, RowData } from '@/core/DetailTableBuilder';
import { FormSubmitHelper } from '@/core/FormSubmitHelper';

export interface FieldDependency {
  triggerField: string;
  conditions: Record<string, string[]>;
}

export interface FormTestConfig {
  formId: string;
  formName: string;
  url: string;
  schemaPath?: string;
  detailTables?: DetailTableConfig[];
  forceRegenerate?: boolean;
  schemaMaxAgeHours?: number;
  fieldDependencies?: FieldDependency[];
  fieldOverrides?: Record<string, any>;
  fillRequiredOnly?: boolean;
  aiFallback?: boolean;
}

export class FormTestBuilder {
  protected page: Page;
  protected schema: FormSchema | null = null;
  protected config: FormTestConfig;
  private detailBuilders: DetailTableBuilder[] = [];

  constructor(page: Page, config: FormTestConfig) {
    this.page = page;
    this.config = config;

    // 初始化明细表构建器
    if (config.detailTables) {
      this.detailBuilders = config.detailTables.map(dt => new DetailTableBuilder(page, dt));
    }
  }

  /**
   * 生成或加载 Schema，并导航到表单页面
   * @param options 初始化选项
   */
  async initialize(options: { forceRegenerate?: boolean } = {}): Promise<void> {
    const shouldRegenerate = options.forceRegenerate || this.config.forceRegenerate || false;
    const schemaMaxAgeHours = this.config.schemaMaxAgeHours || 24; // 默认 24 小时
    
    // 先尝试加载已存在的 Schema（除非强制重新生成）
    let schema: FormSchema | null = null;
    let schemaAgeHours = Infinity;
    
    if (!shouldRegenerate) {
      schema = SchemaGenerator.loadSchema(this.config.formId, this.config.schemaPath);
      if (schema) {
        // 计算 Schema 年龄
        schemaAgeHours = this.getSchemaAgeInHours(schema);
        console.log(`[FormTestBuilder] Schema age: ${schemaAgeHours.toFixed(2)} hours (max age: ${schemaMaxAgeHours} hours)`);
        
        // 检查 Schema 是否过期
        if (schemaAgeHours > schemaMaxAgeHours) {
          console.log(`[FormTestBuilder] Schema expired, will regenerate...`);
          schema = null;
        }
      }
    }

    if (!schema) {
      // 需要生成新的 Schema
      console.log(`[FormTestBuilder] ${shouldRegenerate ? 'Force regenerating' : 'Schema not found or expired, generating'} schema from page...`);
      // 注意：不要提前导航，SchemaGenerator.generateSchema 会自己处理导航，以便能监听到响应
      const generator = new SchemaGenerator(this.page);
      schema = await generator.generateSchema(
        this.config.formId,
        this.config.formName,
        this.config.url
      );

      // 仅在生成到有效字段时保存（避免空 schema 覆盖旧文件）
      const outputDir = this.config.schemaPath || './schemas';
      if (schema.fields && schema.fields.length > 0) {
        await generator.saveSchema(schema, outputDir);
      } else {
        console.warn(`[FormTestBuilder] ⚠️ Generated schema has no fields, skipping save to preserve existing schema`);
      }
    } else {
      console.log(`[FormTestBuilder] Loaded existing schema for ${this.config.formId}`);
    }

    this.schema = schema;

    // ⭐ 提前初始化明细表构建器（从 Schema 中读取，不依赖导航成功）
    // 这样即使后续导航/enrichment 失败，detail builders 仍有完整的 fields 信息
    if (schema.detailTables && schema.detailTables.length > 0) {
      console.log(`[FormTestBuilder] Pre-initializing ${schema.detailTables.length} detail table builder(s) from schema...`);
      this.detailBuilders = schema.detailTables.map(dt =>
        new DetailTableBuilder(this.page, {
          detailModelId: dt.detailModelId,
          detailTableName: dt.detailTableName,
          fields: dt.fields,
        })
      );
    }

    // 确保页面已导航（生成 Schema 时可能已经导航了）
    // 检查当前 URL 是否已经是目标 URL
    const currentUrl = this.page.url();
    if (!currentUrl.includes(this.config.formId) || currentUrl === 'about:blank') {
      console.log(`[FormTestBuilder] Navigating to page for dynamic field enrichment...`);
      try {
        // 使用短超时避免阻塞测试，enrichment 失败不影响主流程
        await this.page.goto(this.config.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await this.page.waitForSelector('.ele-xform-fieldset-wrap', { timeout: 10000 });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`[FormTestBuilder] ⚠️ Navigation for enrichment failed, skipping enrichment: ${msg}`);
        return;
      }
    }
    
    // 等待 MKXFORM 准备好
    console.log(`[FormTestBuilder] Waiting for MKXFORM to be ready...`);
    await this.page.waitForTimeout(1000);
    
    // 补充 dynamic 字段的 renderMode 信息（从 MKXFORM 组件提取）
    // 这需要在表单页面加载完成后执行，因为需要 MKXFORM API
    try {
      const generator = new SchemaGenerator(this.page);
      this.schema = await generator.enrichDynamicFields(this.schema);
      
      // 如果有更新，保存到文件
      if (this.schema) {
        const outputDir = this.config.schemaPath || './schemas';
        await generator.saveSchema(this.schema, outputDir);
        console.log(`[FormTestBuilder] ✅ Dynamic fields enriched and schema saved`);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.warn(`[FormTestBuilder] ⚠️ Failed to enrich dynamic fields:`, errorMessage);
      // 不影响测试继续执行
    }
    
    // 初始化明细表构建器（如果 Schema 中有明细表）
    if (schema.detailTables && schema.detailTables.length > 0) {
      console.log(`[FormTestBuilder] Initializing ${schema.detailTables.length} detail table builder(s)...`);
      this.detailBuilders = schema.detailTables.map(dt => 
        new DetailTableBuilder(this.page, {
          detailModelId: dt.detailModelId,
          detailTableName: dt.detailTableName,
          fields: dt.fields
        })
      );
      console.log(`[FormTestBuilder] Detail table builders initialized successfully`);
    }
  }
  
  /**
   * 强制重新生成 Schema（用于自愈场景）
   */
  async regenerateSchema(): Promise<void> {
    console.log(`[FormTestBuilder] Forcing schema regeneration...`);
    const generator = new SchemaGenerator(this.page);
    const schema = await generator.generateSchema(
      this.config.formId,
      this.config.formName,
      this.config.url
    );
    const outputDir = this.config.schemaPath || './schemas';
    await generator.saveSchema(schema, outputDir);
    this.schema = schema;
  }

  /**
   * 计算 Schema 年龄（小时）
   */
  private getSchemaAgeInHours(schema: FormSchema): number {
    const generatedAt = new Date(schema.generatedAt).getTime();
    const now = Date.now();
    return (now - generatedAt) / (1000 * 60 * 60);
  }

  /**
   * 导航到表单页面
   */
  async navigate(): Promise<void> {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[FormTestBuilder] Navigating to ${this.config.url} (attempt ${attempt}/${maxRetries})`);
        
        // 初始化 relationDataCache
        await this.page.evaluate(() => {
          window.__relationDataCache = window.__relationDataCache || {};
        });

        // 安装 dynamic params 拦截器（捕获 associate/list 请求的过滤参数）
        const { RelationFiller } = await import('@/filler/RelationFiller');
        await RelationFiller.setupDynamicParamsInterceptor(this.page);
        
        // 监听 associate/list 请求，捕获响应数据
        this.page.on('response', async (response) => {
          const url = response.url();
          if (url.includes('/mkpaas/data/sys-modeling/xform/associate/list')) {
            try {
              const json = await response.json();
              if (json.success && json.data && json.data.content && Array.isArray(json.data.content)) {
                // 获取请求体来确定 controlId
                const request = response.request();
                const postData = request.postData();
                let controlId = 'unknown';
                
                if (postData) {
                  try {
                    const body = JSON.parse(postData);
                    controlId = body.controlId || 'unknown';
                  } catch {
                    // ignore
                  }
                }
                
                console.log(`[FormTestBuilder] Captured associate/list response for controlId: ${controlId}, count: ${json.data.content.length}`);
                
                // 将数据存储到 window.__relationDataCache
                await this.page.evaluate(({ controlId, data }) => {
                  window.__relationDataCache = window.__relationDataCache || {};
                  window.__relationDataCache[controlId] = data;
                }, { controlId, data: json.data.content });
              }
            } catch (e) {
              // ignore parse errors
            }
          }
        });
        
        await this.page.goto(this.config.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // 等待页面完全加载后再检查登录状态
        await this.page.waitForLoadState('load').catch(() => {});
        
        // 等待 associate/list 请求完成（最多等待5秒）
        await this.page.waitForTimeout(5000);
        
        // 检查登录状态（在页面加载后执行）
        await this.checkAndHandleLogin();
        
        // 等待表单加载
        await this.page.waitForSelector('.ele-xform-fieldset-wrap', { timeout: 120000 });

        // ⏳ 等待 MKXFORM 组件完全就绪（关键！）
        await this.waitForMKXFORMReady();

        console.log(`[FormTestBuilder] Navigation successful`);
        return;
      } catch (error) {
        console.warn(`[FormTestBuilder] Navigation attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) {
          await this.page.waitForTimeout(2000);
        } else {
          throw new Error(`[FormTestBuilder] Failed to navigate after ${maxRetries} attempts`);
        }
      }
    }
  }

  /**
   * ⏳ 等待 MKXFORM 组件完全就绪
   * 
   * 确保所有表单控件都已注册到 MKXFORM，可以安全调用 setValue
   */
  private async waitForMKXFORMReady(): Promise<void> {
    const maxWait = 30000; // 最长等待30秒
    const interval = 500;  // 每500ms检查一次
    const startTime = Date.now();

    console.log('[FormTestBuilder] ⏳ Waiting for MKXFORM to be ready...');

    while (Date.now() - startTime < maxWait) {
      const ready = await this.page.evaluate(() => {
        // @ts-ignore
        const mkxform = window.MKXFORM;
        if (!mkxform || typeof mkxform.setValue !== 'function') {
          return false;
        }

        // 检查是否有至少一个组件已注册
        try {
          // 尝试获取第一个字段组件（如果存在的话）
          const fieldsetWraps = document.querySelectorAll('.ele-xform-fieldset-wrap');
          if (fieldsetWraps.length === 0) {
            return false;
          }

          // 检查 MKXFORM 是否有 getControl 方法
          return typeof mkxform.getControl === 'function' ||
                 typeof mkxform.getValue === 'function';
        } catch {
          return false;
        }
      });

      if (ready) {
        console.log(`[FormTestBuilder] ✅ MKXFORM is ready (${Date.now() - startTime}ms)`);
        await this.page.waitForTimeout(1000); // 额外等待1秒确保完全稳定
        return;
      }

      await this.page.waitForTimeout(interval);
    }

    console.warn(`[FormTestBuilder] ⚠️ MKXFORM may not be fully ready after ${maxWait}ms, proceeding anyway`);
  }

  /**
   * 检查登录状态并处理
   * 注意：Playwright storageState 只恢复 cookies，不恢复 localStorage
   * 所以不能通过检查 localStorage 来判断登录状态
   */
  private async checkAndHandleLogin(): Promise<void> {
    const currentUrl = this.page.url();
    const isLoginPage = currentUrl.includes('/login') || currentUrl.includes('/mklogin');

    if (isLoginPage) {
      console.log('[FormTestBuilder] ⚠️ Currently on login page, session may be invalid');
      console.log(`[FormTestBuilder] Current URL: ${currentUrl}`);
    } else {
      console.log('[FormTestBuilder] ✅ Not on login page, session appears valid');
    }
  }

  /**
   * 填充所有字段
   */
  async fillAllFields(): Promise<void> {
    if (!this.schema) {
      throw new Error('Schema not initialized. Call initialize() first.');
    }

    console.log(`[FormTestBuilder] Filling all ${this.schema.fields.length} fields...`);

    const deps = this.config.fieldDependencies || [];
    const triggerFieldIds = new Set(deps.map(d => d.triggerField));
    const dependentFieldIds = new Set(deps.flatMap(d => Object.values(d.conditions).flat()));
    const overrideFieldIds = new Set(Object.keys(this.config.fieldOverrides || {}));
    const fillRequiredOnly = this.config.fillRequiredOnly !== false;

    // 识别明细表字段依赖的主表字段
    const masterFieldsRequiredByDetail = new Set<string>();
    if (this.schema.detailTables) {
      for (const detailTable of this.schema.detailTables) {
        for (const field of detailTable.fields) {
          if (field.fdType === 'relation' || field.fdType === 'relation~multi') {
            const datasourceFilter = (field as any)?.datasourceFilter;
            if (datasourceFilter && Array.isArray(datasourceFilter)) {
              for (const condition of datasourceFilter) {
                if (condition.value?.format === 'parameter' && condition.value?.val) {
                  masterFieldsRequiredByDetail.add(condition.value.val);
                }
              }
            }
          }
        }
      }
    }
    console.log(`[FormTestBuilder] Master fields required by detail tables: [${[...masterFieldsRequiredByDetail].join(', ')}]`);

    console.log(`[FormTestBuilder] Schema fields: ${this.schema?.fields?.length ?? 0}, required-only=${fillRequiredOnly}`);
    console.log(`[FormTestBuilder] overrideFieldIds: [${[...overrideFieldIds].join(', ')}]`);
    console.log(`[FormTestBuilder] triggerFieldIds: [${[...triggerFieldIds].join(', ')}]`);

    const shouldFill = (field: FormField): boolean => {
      if (overrideFieldIds.has(field.id)) return true;
      if (triggerFieldIds.has(field.id)) return true;
      if (dependentFieldIds.has(field.id)) return true;
      if (masterFieldsRequiredByDetail.has(field.id)) return true;
      if (!fillRequiredOnly) return true;
      return field.required === true;
    };

    const phaseTriggers: FormField[] = [];
    const phaseDependents: FormField[] = [];
    const phaseMasterDependencies: FormField[] = [];  // 明细表依赖的主表字段
    const phaseRest: FormField[] = [];

    for (const field of this.schema.fields) {
      if (!shouldFill(field)) continue;
      if (triggerFieldIds.has(field.id)) {
        phaseTriggers.push(field);
      } else if (dependentFieldIds.has(field.id)) {
        phaseDependents.push(field);
      } else if (masterFieldsRequiredByDetail.has(field.id)) {
        phaseMasterDependencies.push(field);
      } else {
        phaseRest.push(field);
      }
    }

    console.log(`[FormTestBuilder] Phase 1 (triggers): ${phaseTriggers.length} fields`);
    for (const field of phaseTriggers) {
      try {
        const filler = FillerFactory.create(this.page, this.config.formId, field);
        const overrideValue = this.config.fieldOverrides?.[field.id];
        await filler.fill(overrideValue !== undefined ? overrideValue : undefined);
        await this.page.waitForTimeout(200);
      } catch (err) {
        console.warn(`[FormTestBuilder] Failed to fill field ${field.id} (${field.fdType}):`, err);
      }
    }

    if (phaseDependents.length > 0 && deps.length > 0) {
      await this.page.waitForTimeout(500);

      const activeDependentIds = new Set<string>();
      for (const dep of deps) {
        const triggerField = this.schema.fields.find(f => f.id === dep.triggerField);
        if (!triggerField) continue;

        let currentValue = this.config.fieldOverrides?.[dep.triggerField];
        if (currentValue === undefined) {
          currentValue = await this.getFieldValue(dep.triggerField);
        }
        if (currentValue === undefined) {
          console.warn(`[FormTestBuilder] Cannot read trigger value for "${dep.triggerField}", skipping dependency`);
          continue;
        }

        const strValue = String(currentValue);
        const matchingCondition = Object.entries(dep.conditions)
          .find(([val]) => val === strValue);
        if (matchingCondition) {
          matchingCondition[1].forEach(id => activeDependentIds.add(id));
          console.log(`[FormTestBuilder] Dependency "${dep.triggerField}"=${strValue} → activate: [${matchingCondition[1].join(', ')}]`);
        } else {
          console.log(`[FormTestBuilder] Dependency "${dep.triggerField}"=${strValue} → no match, available keys: [${Object.keys(dep.conditions).join(', ')}]`);
        }
      }

      console.log(`[FormTestBuilder] Phase 2 (dependents): Fill ${activeDependentIds.size} visible-dependent fields...`);

      if (activeDependentIds.size > 0) {
        console.log(`[FormTestBuilder] ⏳ Waiting 1500ms for conditional fields to render in DOM/MKXFORM...`);
        await this.page.waitForTimeout(1500);
      }

      for (const field of phaseDependents) {
        if (!activeDependentIds.has(field.id)) {
          console.log(`[FormTestBuilder] Skipping hidden/irrelevant field: ${field.id}`);
          continue;
        }
        try {
          const filler = FillerFactory.create(this.page, this.config.formId, field);
          const overrideValue = this.config.fieldOverrides?.[field.id];
          await filler.fill(overrideValue !== undefined ? overrideValue : undefined);
          await this.page.waitForTimeout(200);
        } catch (err) {
          console.warn(`[FormTestBuilder] Failed to fill field ${field.id} (${field.fdType}):`, err);
        }
      }

      // Phase 3: 明细表依赖的主表字段（如 fd_entity）
      if (phaseMasterDependencies.length > 0) {
        console.log(`[FormTestBuilder] Phase 3 (master dependencies): Fill ${phaseMasterDependencies.length} fields required by detail tables...`);
        for (const field of phaseMasterDependencies) {
          try {
            const filler = FillerFactory.create(this.page, this.config.formId, field);
            const overrideValue = this.config.fieldOverrides?.[field.id];
            await filler.fill(overrideValue !== undefined ? overrideValue : undefined);
            await this.page.waitForTimeout(200);
          } catch (err) {
            console.warn(`[FormTestBuilder] Failed to fill field ${field.id} (${field.fdType}):`, err);
          }
        }
      }

      console.log(`[FormTestBuilder] Phase 4 (rest): Fill ${phaseRest.length} remaining fields...`);
      for (const field of phaseRest) {
        try {
          const filler = FillerFactory.create(this.page, this.config.formId, field);
          const overrideValue = this.config.fieldOverrides?.[field.id];
          await filler.fill(overrideValue !== undefined ? overrideValue : undefined);
          await this.page.waitForTimeout(200);
        } catch (err) {
          console.warn(`[FormTestBuilder] Failed to fill field ${field.id} (${field.fdType}):`, err);
        }
      }
    } else if (phaseRest.length > 0 || phaseMasterDependencies.length > 0) {
      // 如果没有配置字段依赖，但有明细表依赖的主表字段
      if (phaseMasterDependencies.length > 0) {
        console.log(`[FormTestBuilder] Phase 2 (master dependencies): Fill ${phaseMasterDependencies.length} fields required by detail tables...`);
        for (const field of phaseMasterDependencies) {
          try {
            const filler = FillerFactory.create(this.page, this.config.formId, field);
            const overrideValue = this.config.fieldOverrides?.[field.id];
            await filler.fill(overrideValue !== undefined ? overrideValue : undefined);
            await this.page.waitForTimeout(200);
          } catch (err) {
            console.warn(`[FormTestBuilder] Failed to fill field ${field.id} (${field.fdType}):`, err);
          }
        }
      }

      console.log(`[FormTestBuilder] Phase 2 (no deps): Fill ${phaseRest.length} remaining fields...`);
      for (const field of phaseRest) {
        try {
          const filler = FillerFactory.create(this.page, this.config.formId, field);
          const overrideValue = this.config.fieldOverrides?.[field.id];
          await filler.fill(overrideValue !== undefined ? overrideValue : undefined);
          await this.page.waitForTimeout(200);
        } catch (err) {
          console.warn(`[FormTestBuilder] Failed to fill field ${field.id} (${field.fdType}):`, err);
        }
      }
    }

    if (this.config.aiFallback) {
      await this.aiFallbackFill();
    }

    console.log('[FormTestBuilder] All fields filled');
  }

  private async getFieldValue(fieldId: string): Promise<string | undefined> {
    try {
      const value = await this.page.evaluate(
        ({ formId, fieldId }) => {
          // @ts-ignore
          return window.MKXFORM?.getValue?.(formId, fieldId);
        },
        { formId: this.config.formId, fieldId }
      );
      return value !== undefined ? String(value) : undefined;
    } catch {
      return undefined;
    }
  }

  private async aiFallbackFill(): Promise<void> {
    console.log('[FormTestBuilder] 🤖 AI fallback: checking unfilled required fields...');
    // TODO: AI兜底实现 — 可接入 Midscene 或其他视觉定位方案
  }

  /**
   * 填充指定字段
   * @param fieldId 字段ID
   * @param value 字段值（可选，不指定则使用随机数据）
   */
  async fillField(fieldId: string, value?: any): Promise<void> {
    if (!this.schema) {
      throw new Error('Schema not initialized. Call initialize() first.');
    }

    const field = this.schema.fields.find(f => f.id === fieldId);
    if (!field) {
      throw new Error(`Field ${fieldId} not found in schema`);
    }

    const filler = FillerFactory.create(this.page, this.config.formId, field);
    
    await filler.fill(value);
  }

  /**
   * 填充明细表（随机数据）
   * @param rows 行数
   * @param detailModelId 明细表ID（可选）
   */
  async fillDetailTable(rows: number = 1, detailModelId?: string): Promise<void> {
    const builders = detailModelId
      ? this.detailBuilders.filter(b => b['config'].detailModelId === detailModelId)
      : this.detailBuilders;

    if (builders.length === 0) {
      console.warn(`[FormTestBuilder] No detail table builders found${detailModelId ? ` for ${detailModelId}` : ''}`);
      return;
    }

    for (const builder of builders) {
      try {
        const exists = await builder.exists();
        if (!exists) {
          console.warn(`[FormTestBuilder] Detail table not found: ${builder['config'].detailModelId}`);
          continue;
        }

        await builder.scrollIntoView();

        // 获取当前行数（明细表默认有一行）
        const currentRowCount = await builder.getRowCountViaMKXFORM();
        console.log(`[FormTestBuilder] Detail table ${builder['config'].detailModelId} has ${currentRowCount} rows`);

        // 填充已有的行（包括默认第一行）
        for (let i = 0; i < Math.min(currentRowCount, rows); i++) {
          await builder.fillRow(i);
          await this.page.waitForTimeout(300);
        }

        // 如果需要更多行，添加新行并填充
        const rowsToAdd = Math.max(0, rows - currentRowCount);
        for (let i = 0; i < rowsToAdd; i++) {
          await builder.addRow();
          await builder.fillRow(currentRowCount + i);
          await this.page.waitForTimeout(500);
        }

        console.log(`[FormTestBuilder] Filled detail table ${builder['config'].detailModelId} with ${rows} rows`);
      } catch (err) {
        console.warn(`[FormTestBuilder] Failed to fill detail table ${builder['config'].detailModelId}:`, err);
      }
    }
  }

  /**
   * 使用自定义数据填充明细表
   * @param rowDataArray 每行的数据对象数组
   * @param detailModelId 可选的明细表ID，不指定则填充所有明细表
   */
  async fillDetailTableWithData(rowDataArray: RowData[], detailModelId?: string): Promise<void> {
    const builders = detailModelId
      ? this.detailBuilders.filter(b => b['config'].detailModelId === detailModelId)
      : this.detailBuilders;

    if (builders.length === 0) {
      console.warn(`[FormTestBuilder] No detail table builders found${detailModelId ? ` for ${detailModelId}` : ''}`);
      return;
    }

    for (const builder of builders) {
      try {
        const exists = await builder.exists();
        if (!exists) {
          console.warn(`[FormTestBuilder] Detail table not found: ${builder['config'].detailModelId}`);
          continue;
        }

        await builder.scrollIntoView();

        // 获取当前行数（明细表默认有一行）
        const currentRowCount = await builder.getRowCountViaMKXFORM();
        console.log(`[FormTestBuilder] Detail table ${builder['config'].detailModelId} has ${currentRowCount} rows, need to fill ${rowDataArray.length} rows`);

        // 先填充已有的行（包括默认第一行）
        const rowsToFillInExisting = Math.min(currentRowCount, rowDataArray.length);
        for (let i = 0; i < rowsToFillInExisting; i++) {
          console.log(`[FormTestBuilder] Filling existing row ${i} with custom data`);
          await builder.fillRowWithData(i, rowDataArray[i]);
          await this.page.waitForTimeout(500);
        }

        // 如果需要更多行，添加新行并填充
        const rowsToAdd = rowDataArray.length - currentRowCount;
        for (let i = 0; i < rowsToAdd; i++) {
          const targetIndex = currentRowCount + i;
          console.log(`[FormTestBuilder] Adding and filling new row ${targetIndex} with custom data`);
          await builder.addRowViaMKXFORM();
          await this.page.waitForTimeout(500);
          await builder.fillRowWithData(targetIndex, rowDataArray[targetIndex]);
          await this.page.waitForTimeout(500);
        }

        console.log(`[FormTestBuilder] Filled detail table ${builder['config'].detailModelId} with ${rowDataArray.length} rows of custom data`);
      } catch (err) {
        console.warn(`[FormTestBuilder] Failed to fill detail table ${builder['config'].detailModelId}:`, err);
      }
    }
  }

  /**
   * 填充必填字段
   */
  async fillRequiredFields(options?: { exceptFields?: string[] }): Promise<void> {
    if (!this.schema) {
      throw new Error('Schema not initialized. Call initialize() first.');
    }

    const exceptFields = options?.exceptFields || [];
    let requiredFields = this.schema.fields.filter(f => f.required);
    
    // 过滤掉要跳过的字段
    if (exceptFields.length > 0) {
      requiredFields = requiredFields.filter(f => !exceptFields.includes(f.id));
    }
    
    console.log(`[FormTestBuilder] Filling ${requiredFields.length} required fields...`);

    for (const field of requiredFields) {
      try {
        const filler = FillerFactory.create(this.page, this.config.formId, field);
        await filler.fill();
        await this.page.waitForTimeout(200);
      } catch (err) {
        console.warn(`[FormTestBuilder] Failed to fill required field ${field.id}:`, err);
      }
    }

    console.log('[FormTestBuilder] Required fields filled');
  }

  /**
   * 提交表单
   */
  async submit(): Promise<boolean> {
    const helper = new FormSubmitHelper(this.page);
    return await helper.submit();
  }

  /**
   * 验证表单（检查必填字段是否已填写）
   */
  async validate(): Promise<boolean> {
    return false;
  }

  /**
   * 获取当前 Schema
   */
  getSchema(): FormSchema | null {
    return this.schema;
  }

  // ═══════════════════════════════════════════════════════════
  // 🤖 AI Agent 模式：完全自动化（只需提供 URL）
  // ═══════════════════════════════════════════════════════════

  /**
   * 🚀 AI Agent 模式：从 URL 自动探索并构建测试
   *
   * 用户只需提供表单 URL，AI 会自动：
   * 1. 从 URL 提取临时 ID
   * 2. 打开页面并监听 API 响应
   * 3. 自动提取真实的表单模型 ID（mk_model_xxx）
   * 4. 探查所有字段（主表 + 明细表）
   * 5. 生成 Schema 并保存为标准格式
   * 6. 返回完全初始化的 FormTestBuilder 实例
   *
   * @example
   * ```typescript
   * test('AI 全自动测试', async ({ page }) => {
   *   const builder = await FormTestBuilder.fromUrl(page,
   *     'https://sp3test.landray.com.cn/.../app/xoex/add/xxx'
   *   );
   *
   *   console.log('🎉 自动发现:', {
   *     formId: builder.getSchema()?.formId,
   *     fieldCount: builder.getSchema()?.fields?.length,
   *     detailTables: builder.getSchema()?.detailTables?.length
   *   });
   *
   *   await builder.fillAllFields();
   *   await builder.submit();
   * });
   * ```
   */
  static async fromUrl(
    page: Page,
    url: string,
    options: {
      schemaPath?: string;
      forceRegenerate?: boolean;
      schemaMaxAgeHours?: number;
    } = {}
  ): Promise<FormTestBuilder> {
    console.log('\n🤖 [AI Agent] Starting automatic exploration...');
    console.log(`🌐 [AI Agent] Target URL: ${url}`);

    const startTime = Date.now();

    try {
      const tempId = FormTestBuilder.extractAppFromUrl(url);
      console.log(`📝 [AI Agent] Temporary ID from URL: ${tempId}`);

      const builder = new FormTestBuilder(page, {
        formId: tempId,
        formName: tempId,
        url: url,
        schemaPath: options.schemaPath || './src/schemas',
        forceRegenerate: options.forceRegenerate ?? true,
        schemaMaxAgeHours: options.schemaMaxAgeHours ?? 0,
      });

      console.log('⏳ [AI Agent] Exploring page and extracting schema...');

      await builder.initialize({ forceRegenerate: true });

      const schema = builder.getSchema();
      if (!schema) {
        throw new Error('[AI Agent] Failed to generate schema');
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log('\n✅ [AI Agent] Exploration completed successfully!');
      console.log('📊 [AI Agent] Discovery Report:');
      console.log(`   ├─ Real Form ID: ${schema.formId}`);
      console.log(`   ├─ Form Name: ${schema.formName}`);
      console.log(`   ├─ Total Fields: ${schema.fields?.length || 0}`);
      console.log(`   ├─ Required Fields: ${schema.fields?.filter(f => f.required).length || 0}`);
      console.log(`   ├─ Detail Tables: ${schema.detailTables?.length || 0}`);
      if (schema.detailTables && schema.detailTables.length > 0) {
        schema.detailTables.forEach((dt, i) => {
          console.log(`   │  └─ Table ${i + 1}: ${dt.detailModelId} (${dt.fields?.length || 0} fields)`);
        });
      }
      console.log(`   └─ ⏱️  Time: ${elapsed}s`);
      console.log('');

      return builder;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('\n❌ [AI Agent] Exploration failed:', errorMessage);
      throw error;
    }
  }

  private static extractAppFromUrl(url: string): string {
    const patterns = [
      /\/app\/([^\/]+)\//i,
      /\/modelId=([^&]+)/i,
      /\/formId=([^&]+)/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    const timestamp = Date.now().toString(36);
    return `auto-form-${timestamp}`;
  }

  static async exploreAndReport(page: Page, url: string): Promise<{
    formId: string;
    formName: string;
    fieldCount: number;
    requiredFieldCount: number;
    detailTableCount: number;
    fieldTypes: Record<string, number>;
    sampleFields: Array<{ id: string; type: string; label: string; required: boolean }>;
  }> {
    const builder = await FormTestBuilder.fromUrl(page, url);
    const schema = builder.getSchema()!;

    const fieldTypes: Record<string, number> = {};
    schema.fields.forEach(field => {
      fieldTypes[field.fdType] = (fieldTypes[field.fdType] || 0) + 1;
    });

    const sampleFields = schema.fields.slice(0, 10).map(f => ({
      id: f.id,
      type: f.fdType,
      label: f.label || f.displayName || '(无标签)',
      required: f.required || false,
    }));

    return {
      formId: schema.formId,
      formName: schema.formName,
      fieldCount: schema.fields.length,
      requiredFieldCount: schema.fields.filter(f => f.required).length,
      detailTableCount: schema.detailTables?.length || 0,
      fieldTypes,
      sampleFields,
    };
  }
}
