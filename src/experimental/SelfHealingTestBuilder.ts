import { Page } from '@playwright/test';
import { FormTestBuilder, FormTestConfig } from './FormTestBuilder';
import { MCPInvestigator, MCPInvestigationResult } from '@/utils/MCPInvestigator';
import { ExperienceDatabase, experienceDB } from '@/experience/ExperienceDatabase';

export interface SelfHealingConfig extends FormTestConfig {
  maxRetries?: number;
  enableSelfHealing?: boolean;
  screenshotOnFailure?: boolean;
  enableMCPInvestigation?: boolean;
  enableExperienceDB?: boolean;
}

export class SelfHealingTestBuilder extends FormTestBuilder {
  private selfHealingConfig: {
    maxRetries: number;
    enableSelfHealing: boolean;
    screenshotOnFailure: boolean;
    enableMCPInvestigation?: boolean;
    enableExperienceDB?: boolean;
    formId: string;
    formName: string;
    url: string;
    schemaPath?: string;
    detailTables?: any[];
    forceRegenerate?: boolean;
    schemaMaxAgeHours?: number;
  };
  
  private mcpInvestigator?: MCPInvestigator;
  private lastMCPInvestigation?: MCPInvestigationResult;
  private expDB: ExperienceDatabase;

  constructor(page: Page, config: SelfHealingConfig) {
    super(page, config);
    this.selfHealingConfig = {
      maxRetries: 3,
      enableSelfHealing: true,
      screenshotOnFailure: true,
      enableMCPInvestigation: false,
      enableExperienceDB: true,
      ...config,
    };
    
    this.expDB = this.selfHealingConfig.enableExperienceDB !== false ? experienceDB : new ExperienceDatabase();
    
    if (this.selfHealingConfig.enableMCPInvestigation) {
      this.mcpInvestigator = new MCPInvestigator(true);
    }
  }

  async fillAllFieldsWithRetry(): Promise<void> {
    const maxRetries = this.selfHealingConfig.maxRetries;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`\n[SelfHealing] ===== Attempt ${attempt}/${maxRetries} =====`);
        await this.fillAllFields();
        console.log(`[SelfHealing] ✓ Fill successful on attempt ${attempt}`);
        return;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[SelfHealing] ✗ Attempt ${attempt} failed: ${errorMessage}`);
        lastError = error;

        if (attempt < maxRetries && this.selfHealingConfig.enableSelfHealing) {
          if (this.selfHealingConfig.screenshotOnFailure) {
            await this.takeFailureScreenshot(attempt);
          }

          const canContinue = await this.diagnoseAndHeal(error, attempt);
          if (!canContinue) {
            console.error(`[SelfHealing] Cannot heal, stopping retries`);
            break;
          }
          console.log(`[SelfHealing] Healing complete, retrying...`);
        }
      }
    }

    throw lastError;
  }

  private async diagnoseAndHeal(error: unknown, attempt: number): Promise<boolean> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`[SelfHealing] Diagnosing failure on attempt ${attempt}...`);

    if (this.isTypeError(errorMessage)) {
      return await this.healTypeError();
    } else if (this.isElementNotFoundError(errorMessage)) {
      return await this.healElementNotFoundError();
    } else if (this.isLoginError(errorMessage)) {
      return await this.healLoginError();
    } else if (this.isTimeoutError(errorMessage)) {
      return await this.healTimeoutError();
    } else {
      console.warn(`[SelfHealing] Unknown error type: ${errorMessage}`);
      return false;
    }
  }

  private isTypeError(message: string): boolean {
    return message.includes('No Filler found') ||
           message.includes('fdType') ||
           message.includes('cannot fill') ||
           message.includes('Field not found in schema');
  }

  private async healTypeError(): Promise<boolean> {
    console.log(`[SelfHealing] Detected TYPE ERROR`);
    
    if (this.mcpInvestigator && this.schema) {
      console.log(`[SelfHealing] Initiating MCP investigation...`);
      
      const fieldsToInvestigate = this.schema.fields.slice(0, 5);
      
      for (const field of fieldsToInvestigate) {
        try {
          const result = await this.mcpInvestigator.investigateField(field.id, this.page);
          this.lastMCPInvestigation = result;
          
          await this.mcpInvestigator.saveInvestigation(result);
          
          if (result.suggestedType && result.suggestedType !== field.fdType && result.confidence && result.confidence > 0.7) {
            console.log(`[SelfHealing] MCP suggested updating field ${field.id} from ${field.fdType} to ${result.suggestedType}`);
          }
        } catch (error: unknown) {
          console.warn(`[SelfHealing] MCP investigation failed for ${field.id}: ${error}`);
        }
      }
    }
    
    console.log(`[SelfHealing] Regenerating schema...`);
    try {
      await this.regenerateSchema();
      console.log(`[SelfHealing] ✓ Schema regenerated`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SelfHealing] ✗ Failed to regenerate schema: ${errorMessage}`);
      return false;
    }
  }

  private isElementNotFoundError(message: string): boolean {
    return message.includes('not found') ||
           message.includes('timeout') ||
           message.includes('waiting for') ||
           message.includes('locator');
  }

  private async healElementNotFoundError(): Promise<boolean> {
    console.log(`[SelfHealing] Detected ELEMENT NOT FOUND, waiting and scrolling...`);
    try {
      await this.page.waitForTimeout(5000);
      await this.page.evaluate(() => window.scrollTo(0, 0));
      await this.page.waitForTimeout(1000);
      console.log(`[SelfHealing] ✓ Waited and scrolled`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SelfHealing] ✗ Wait failed: ${errorMessage}`);
      return false;
    }
  }

  private isLoginError(message: string): boolean {
    return message.includes('login') ||
           message.includes('auth') ||
           message.includes('unauthorized') ||
           message.includes('401') ||
           message.includes('token');
  }

  private async healLoginError(): Promise<boolean> {
    console.log(`[SelfHealing] Detected LOGIN ERROR, attempting to recover...`);
    try {
      await this.page.goto(this['config'].url, { waitUntil: 'domcontentloaded' });
      await this.page.waitForTimeout(3000);
      console.log(`[SelfHealing] ✓ Navigated to target page`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SelfHealing] ✗ Login recovery failed: ${errorMessage}`);
      return false;
    }
  }

  private isTimeoutError(message: string): boolean {
    return message.includes('timeout') ||
           message.includes('Timeout') ||
           message.includes('timed out');
  }

  private async healTimeoutError(): Promise<boolean> {
    console.log(`[SelfHealing] Detected TIMEOUT ERROR, waiting longer...`);
    try {
      await this.page.waitForTimeout(8000);
      console.log(`[SelfHealing] ✓ Waited 8 seconds`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SelfHealing] ✗ Timeout recovery failed: ${errorMessage}`);
      return false;
    }
  }

  private async takeFailureScreenshot(attempt: number): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const path = `test-results/self-healing-failure-attempt-${attempt}-${timestamp}.png`;
      await this.page.screenshot({ path, fullPage: true });
      console.log(`[SelfHealing] Screenshot saved: ${path}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[SelfHealing] Failed to take screenshot: ${errorMessage}`);
    }
  }

  async fillRequiredFieldsWithRetry(options?: { exceptFields?: string[] }): Promise<void> {
    const maxRetries = this.selfHealingConfig.maxRetries;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`\n[SelfHealing] ===== fillRequiredFields Attempt ${attempt}/${maxRetries} =====`);
        await this.fillRequiredFields(options);
        console.log(`[SelfHealing] ✓ fillRequiredFields successful on attempt ${attempt}`);
        return;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[SelfHealing] ✗ Attempt ${attempt} failed: ${errorMessage}`);
        lastError = error;

        if (attempt < maxRetries && this.selfHealingConfig.enableSelfHealing) {
          if (this.selfHealingConfig.screenshotOnFailure) {
            await this.takeFailureScreenshot(attempt);
          }

          const canContinue = await this.diagnoseAndHeal(error, attempt);
          if (!canContinue) {
            break;
          }
        }
      }
    }

    throw lastError;
  }

  recordExperience(
    fieldId: string,
    fieldType: string,
    fillerUsed: string,
    success: boolean,
    options?: {
      error?: string;
      solution?: string;
      recoveryMethod?: string;
      duration?: number;
    }
  ): void {
    if (!this.selfHealingConfig.enableExperienceDB) return;

    try {
      this.expDB.addRecord({
        formId: this.selfHealingConfig.formId,
        fieldId,
        fieldType,
        fillerUsed,
        success,
        error: options?.error,
        solution: options?.solution,
        recoveryMethod: options?.recoveryMethod,
        duration: options?.duration || 0,
        environment: this.selfHealingConfig.url.includes('sp3test') ? 'sp3test' : 'test',
      });
    } catch (error: unknown) {
      console.warn(`[SelfHealing] Failed to record experience: ${error}`);
    }
  }

  getExperienceStats() {
    return this.expDB.getStats();
  }
}