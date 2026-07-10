import { Page } from '@playwright/test';
import { SelfHealingTestBuilder } from '@/core/SelfHealingTestBuilder';
import { ENVIRONMENTS } from '../../config/environments';

export interface QuickTestOptions {
  url: string;
  environment?: string;
  formName?: string;
  formId?: string;
  randomFill?: boolean;
  specifiedValues?: Record<string, any>;
  requiredFields?: string[];
  exceptFields?: string[];
  detailTableRows?: number;
  maxRetries?: number;
  enableSelfHealing?: boolean;
  screenshotOnFailure?: boolean;
  enableMCPInvestigation?: boolean;
  headless?: boolean;
  timeout?: number;
}

function extractFormInfo(url: string): { formId: string; environment: string } {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/');
  const lastPart = pathParts[pathParts.length - 1] || '';
  const queryParams = urlObj.searchParams;
  
  let formId = queryParams.get('fdTemplateId') || lastPart;
  formId = formId.split('?')[0];
  
  const environment =
    Object.values(ENVIRONMENTS).find(env => url.startsWith(env.baseURL))?.id ?? 'test';
  
  return { formId, environment };
}

export function createQuickTest(page: Page, options: QuickTestOptions): SelfHealingTestBuilder {
  const { url, environment: envOption, formName, formId: idOption, ...rest } = options;
  
  const { formId: extractedId, environment: extractedEnv } = extractFormInfo(url);
  
  const formId = idOption || extractedId;
  const environment = envOption || extractedEnv;
  const name = formName || formId || `AutoTest-${Date.now()}`;
  
  const schemaPath = environment === 'sp3test' ? '../schemas/sp3test' : '../schemas/test';
  
  console.log(`[QuickTest] Creating test with:`);
  console.log(`  URL: ${url}`);
  console.log(`  FormID: ${formId}`);
  console.log(`  Environment: ${environment}`);
  console.log(`  Schema Path: ${schemaPath}`);
  
  return new SelfHealingTestBuilder(page, {
    formId,
    formName: name,
    url,
    schemaPath,
    maxRetries: rest.maxRetries ?? 3,
    enableSelfHealing: rest.enableSelfHealing ?? true,
    screenshotOnFailure: rest.screenshotOnFailure ?? true,
    enableMCPInvestigation: rest.enableMCPInvestigation ?? false,
  });
}

export async function runQuickTest(page: Page, options: QuickTestOptions): Promise<void> {
  const builder = createQuickTest(page, options);
  
  await builder.initialize();
  await builder.navigate();
  await builder.fillAllFields();
  await builder.submit();
}