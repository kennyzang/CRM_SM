import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import { getEnvironment, resolveDefaultSessionFile } from './environments';

const env = getEnvironment('sp3test');
const ROOT_DIR = path.join(__dirname, '..');

export default defineConfig({
  testDir: '../tests',
  globalSetup: './global-setup-sp3test.ts',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: env.baseURL,
    storageState: resolveDefaultSessionFile(env, ROOT_DIR),
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    locale: 'zh-CN',
    viewport: { width: 1920, height: 1080 },
    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-default-browser-check',
      ],
    },
  },
  projects: [
    {
      name: 'sp3test-chromium',
      testMatch: env.testMatch,
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  timeout: 180000,
  expect: { timeout: 15000 },
  outputDir: '../test-results/sp3test',
});
