/**
 * TestAutomationSkill — 测试用例自动化Skill
 * 
 * 提供完整的表单测试自动化能力：
 * 1. 检测登录状态并自动刷新
 * 2. 分析表单结构，生成/更新Schema
 * 3. 根据标签名称智能生成测试数据
 * 4. 创建并运行测试用例
 * 5. 支持自愈机制
 * 
 * 使用方式：
 * const skill = new TestAutomationSkill(page);
 * await skill.generateAndRunTest({
 *   url: 'https://test.easycraft.ai/...',
 *   formId: 'mk_model_xxx',
 *   requiredFields: ['fd_name'],
 *   detailRows: 2
 * });
 */
import { Page, BrowserContext } from '@playwright/test';
import { SchemaGenerator } from '@/schema/SchemaGenerator';
import { FormTestBuilder } from '@/core/FormTestBuilder';
import { DataGenerator } from '@/utils/DataGenerator';
import * as fs from 'fs';
import * as path from 'path';

export interface TestConfig {
  url: string;
  formId: string;
  formName?: string;
  requiredFields?: string[];
  randomFields?: string[];
  specifiedValues?: Record<string, unknown>;
  detailRows?: number;
  detailTables?: string[];
  autoSubmit?: boolean;
  screenshotOnFailure?: boolean;
  maxRetry?: number;
}

export interface TestResult {
  success: boolean;
  error?: string;
  screenshotPath?: string;
  filledFields: string[];
  submitted: boolean;
  retryCount: number;
}

export class TestAutomationSkill {
  private page: Page;
  private context: BrowserContext;
  private baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.context = page.context();
    // baseUrl 通过 EASYCRAFT_URL 环境变量覆盖，默认 test.easycraft.ai
    this.baseUrl = process.env.EASYCRAFT_URL || 'https://test.easycraft.ai';
  }

  /**
   * 生成并运行测试用例
   */
  async generateAndRunTest(config: TestConfig): Promise<TestResult> {
    let retryCount = 0;
    const maxRetry = config.maxRetry || 3;
    
    while (retryCount < maxRetry) {
      try {
        // 1. 检测登录状态
        await this.checkAndRefreshLogin();

        // 2. 生成/更新 Schema
        const schema = await this.ensureSchema(config);

        // 3. 导航到表单页面
        await this.page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await this.page.waitForTimeout(3000);

        // 4. 创建测试构建器并填充表单
        const builder = new FormTestBuilder(this.page, {
          formId: config.formId,
          formName: config.formName || 'Auto-generated Test',
          url: config.url,
          schemaPath: '../schemas',
        });

        await builder.initialize({ forceRegenerate: false });

        // 5. 根据配置填充字段
        const filledFields: string[] = [];
        
        // 填充指定值字段
        if (config.specifiedValues) {
          for (const [fieldId, value] of Object.entries(config.specifiedValues)) {
            await builder.fillField(fieldId, value);
            filledFields.push(fieldId);
          }
        }

        // 填充必填字段（随机值）
        if (config.requiredFields) {
          for (const fieldId of config.requiredFields) {
            if (!filledFields.includes(fieldId)) {
              const field = schema.mainFields.find((f: any) => f.id === fieldId);
              if (field) {
                const value = DataGenerator.generateByLabel(field.label, field.fdType);
                await builder.fillField(fieldId, value);
                filledFields.push(fieldId);
              }
            }
          }
        }

        // 填充随机字段
        if (config.randomFields) {
          for (const fieldId of config.randomFields) {
            if (!filledFields.includes(fieldId)) {
              const field = schema.mainFields.find((f: any) => f.id === fieldId);
              if (field) {
                const value = DataGenerator.generateByLabel(field.label, field.fdType);
                await builder.fillField(fieldId, value);
                filledFields.push(fieldId);
              }
            }
          }
        }

        // 6. 填充明细表
        if (config.detailRows && config.detailRows > 0) {
          const detailTableCount = config.detailTables?.length ?? 1;
          for (let i = 0; i < detailTableCount; i++) {
            const detailTableId = config.detailTables?.[i];
            await builder.fillDetailTable(config.detailRows, detailTableId);
          }
        }

        // 7. 提交表单
        if (config.autoSubmit !== false) {
          await builder.submit();
          await this.page.waitForTimeout(3000);
        }

        return {
          success: true,
          filledFields,
          submitted: config.autoSubmit !== false,
          retryCount,
        };

      } catch (error: unknown) {
        retryCount++;
        console.error(`[TestAutomationSkill] 测试失败 (第 ${retryCount}/${maxRetry} 次):`, error);

        if (config.screenshotOnFailure) {
          const screenshotPath = await this.takeScreenshot(config.formId, retryCount);
          console.log(`[TestAutomationSkill] 截图已保存: ${screenshotPath}`);

          if (retryCount >= maxRetry) {
            return {
              success: false,
              error: error instanceof Error ? error.message : String(error),
              screenshotPath,
              filledFields: [],
              submitted: false,
              retryCount,
            };
          }

          // 自愈机制：重新生成 Schema 后重试
          console.log(`[TestAutomationSkill] 自愈重试中...`);
          await this.ensureSchema({ ...config, forceRegenerate: true });
        }
      }
    }

    return {
      success: false,
      error: '达到最大重试次数',
      filledFields: [],
      submitted: false,
      retryCount,
    };
  }

  /**
   * 检测并刷新登录状态
   */
  private async checkAndRefreshLogin(): Promise<void> {
    console.log('[TestAutomationSkill] 检测登录状态...');

    try {
      await this.page.goto(`${this.baseUrl}/web`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await this.page.waitForTimeout(2000);

      const isLoginPage = await this.page.locator(
        'input[placeholder="用户名"], input[name="username"], input#username, .login-form'
      ).first().isVisible({ timeout: 5000 }).catch(() => false);

      if (!isLoginPage) {
        console.log('[TestAutomationSkill] 登录状态有效');
        return;
      }

      console.log('[TestAutomationSkill] 登录状态失效，需要重新登录');
      await this.performLogin();

    } catch (error) {
      console.error('[TestAutomationSkill] 登录状态检测失败:', error);
      throw error;
    }
  }

  /**
   * 执行登录操作
   */
  private async performLogin(): Promise<void> {
    const username = process.env.EASYCRAFT_USERNAME || 'xiex';
    const password = process.env.EASYCRAFT_PASSWORD || '1';

    console.log(`[TestAutomationSkill] 执行登录: ${username}`);

    const loginUrl = `${this.baseUrl}/web/#/login`;
    await this.page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForTimeout(3000);

    // 查找登录表单元素
    const usernameInput = this.page.locator('#username, input[name="username"], input[type="text"]').first();
    const passwordInput = this.page.locator('#password, input[name="password"], input[type="password"]').first();
    const submitButton = this.page.locator('button[type="submit"], .ele-button-primary, button:has-text("登录"), button:has-text("Login")').first();

    await usernameInput.waitFor({ state: 'visible', timeout: 30000 });
    
    await usernameInput.evaluate((el: HTMLElement) => el.removeAttribute('readonly'));
    await usernameInput.fill(username);
    await passwordInput.fill(password);
    await submitButton.click({ force: true });

    // 等待登录完成
    await this.page.waitForURL(url => !url.href.includes('/login'), { timeout: 60000 });
    console.log('[TestAutomationSkill] 登录成功');

    // 保存会话
    const sessionFile = path.join(__dirname, '../../auth/auth.json');
    await this.context.storageState({ path: sessionFile });
  }

  /**
   * 确保 Schema 存在（不存在则生成）
   */
  private async ensureSchema(config: TestConfig & { forceRegenerate?: boolean }): Promise<any> {
    const schemaPath = '../schemas';
    const schemaFile = path.join(schemaPath, `${config.formId}.json`);

    // 如果强制重新生成或Schema不存在，生成新的Schema
    if (config.forceRegenerate || !fs.existsSync(schemaFile)) {
      console.log(`[TestAutomationSkill] 生成 Schema: ${config.formId}`);
      
      const generator = new SchemaGenerator(this.page);
      const schema = await generator.generateSchema(
        config.formId,
        config.formName || 'Auto-generated',
        config.url
      );
      
      await generator.saveSchema(schema, schemaPath);
      return schema;
    }

    // 加载已有Schema
    console.log(`[TestAutomationSkill] 使用已有 Schema: ${config.formId}`);
    const content = fs.readFileSync(schemaFile, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * 截图保存
   */
  private async takeScreenshot(formId: string, retryCount: number): Promise<string> {
    const dir = path.join(__dirname, '../../tests/temp');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(dir, `${formId}_${timestamp}_retry${retryCount}.png`);
    
    await this.page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  }

  /**
   * 生成测试用例代码
   */
  async generateTestCode(config: TestConfig): Promise<string> {
    const schema = await this.ensureSchema(config);
    
    const code = `/**
 * 自动生成的测试用例
 * 
 * 表单URL: ${config.url}
 * 表单ID: ${config.formId}
 * 生成时间: ${new Date().toISOString()}
 */
import { test, expect } from '@playwright/test';
import { FormTestBuilder } from '@/core/FormTestBuilder';

test('自动测试 - ${config.formName || config.formId}', async ({ page }) => {
  const builder = new FormTestBuilder(page, {
    formId: '${config.formId}',
    formName: '${config.formName || 'Auto-generated Test'}',
    url: '${config.url}',
  });

  await builder.initialize();
  await builder.navigate();

  // 填充指定字段
  ${config.specifiedValues ? Object.entries(config.specifiedValues).map(
    ([key, value]) => `await builder.fillField('${key}', ${JSON.stringify(value)});`
  ).join('\n  ') : ''}

  // 填充必填字段
  ${config.requiredFields?.map(fieldId => {
    const field = schema.mainFields.find((f: any) => f.id === fieldId);
    return `await builder.fillField('${fieldId}');`;
  }).join('\n  ') || ''}

  // 填充明细表（${config.detailRows || 1}行）
  await builder.fillDetailTable(${config.detailRows || 1});

  // 提交表单
  await builder.submit();

  // 验证提交成功
  await expect(page).toHaveURL(/success|detail|view/);
});
`;

    return code;
  }

  /**
   * 保存测试用例文件
   */
  async saveTestFile(config: TestConfig, outputDir?: string): Promise<string> {
    const code = await this.generateTestCode(config);
    const dir = outputDir || path.join(__dirname, '../../tests/auto-generated');
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${config.formId}.spec.ts`);
    fs.writeFileSync(filePath, code, 'utf-8');
    
    console.log(`[TestAutomationSkill] 测试文件已保存: ${filePath}`);
    return filePath;
  }
}

export default TestAutomationSkill;
