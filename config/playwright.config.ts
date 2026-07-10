import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * Playwright 配置
 * @see https://playwright.dev/docs/test-configuration
 */

const ROOT_DIR = path.join(__dirname, '..');
const SESSION_FILE = path.join(ROOT_DIR, 'auth', 'auth.json');

export default defineConfig({
  testDir: '../tests',
  
  /* Global Setup - 统一登录 */
  globalSetup: './global-setup.ts',
  
  /* 完全串行执行 */
  fullyParallel: false,
  workers: 1,
  
  /* 失败重试 */
  retries: 1,
  
  /* 报告器 */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  
  /* 共享配置 */
  use: {
    /* 基础 URL */
    baseURL: process.env.EASYCRAFT_URL || 'https://test.easycraft.ai',
    
    /* 使用保存的会话状态 */
    storageState: SESSION_FILE,
    
    /* 截图（仅在失败时保留） */
    screenshot: 'only-on-failure',
    
    /* 视频 */
    video: 'retain-on-failure',
    
    /* 跟踪 */
    trace: 'retain-on-failure',
    
    /* 超时 */
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    /* 语言 */
    locale: 'zh-CN',
    
    /* 视口 */
    viewport: { width: 1920, height: 1080 },
    
    /* 启动选项 */
    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-default-browser-check',
      ],
    },
  },
  
  /* 项目配置 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  /* 测试超时 */
  timeout: 120000,
  
  /* 期望超时 */
  expect: {
    timeout: 10000,
  },
  
  /* 输出目录 */
  outputDir: '../test-results',
});
