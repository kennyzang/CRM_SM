import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import { getEnvironment, getAccount, resolveSessionFile } from './environments';

const env = getEnvironment('securemetric-crm');
const ROOT_DIR = path.join(__dirname, '..');

// 通过环境变量 CRM_USER 切换账号，默认 soo (CK)
// 使用方式:
//   npx playwright test --config=config/playwright.securemetric-crm.config.ts --headed
//   CRM_USER=edward npx playwright test --config=config/playwright.securemetric-crm.config.ts --headed
const crmUser = process.env.CRM_USER || 'soo';
const account = getAccount(env, crmUser);
const sessionFile = resolveSessionFile(account, ROOT_DIR);

console.log(`[Config] 使用账号: ${crmUser}, Session: ${sessionFile}`);

export default defineConfig({
  testDir: '../tests',
  globalSetup: './global-setup-securemetric-crm.ts',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: env.baseURL,
    storageState: sessionFile,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 60000,
    locale: 'zh-CN',
    viewport: { width: 1920, height: 1080 },
    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-web-security',
        '--no-sandbox',
      ],
    },
  },
  projects: [
    {
      name: `securemetric-crm-${crmUser}`,
      testMatch: env.testMatch,
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  timeout: 180000,
  expect: { timeout: 15000 },
  outputDir: `../test-results/securemetric-crm-${crmUser}`,
});
