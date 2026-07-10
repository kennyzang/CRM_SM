/**
 * GlobalSetup.ts — 共享的多账号登录逻辑
 *
 * 被各环境的 global-setup-xxx.ts 薄包装调用。
 * 不在此处硬编码任何环境信息，全部由 EnvironmentConfig 驱动。
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { EnvironmentConfig, AccountConfig, resolveSessionFile } from '../../config/environments';

const ROOT_DIR = path.join(__dirname, '../../');
const NETWORK_TIPS_SELECTOR = '#__network-tips, .network-tips, .error-overlay';

// ─────────────────────────────────────────
// Session 有效性检查
// ─────────────────────────────────────────

function isSessionFileValid(sessionFile: string, maxAgeMinutes: number): boolean {
  if (!fs.existsSync(sessionFile)) {
    return false;
  }
  const ageMinutes = (Date.now() - fs.statSync(sessionFile).mtimeMs) / 60000;
  if (ageMinutes > maxAgeMinutes) {
    console.log(`[GlobalSetup] Session expired (${ageMinutes.toFixed(1)} min > ${maxAgeMinutes} min): ${path.basename(sessionFile)}`);
    fs.unlinkSync(sessionFile);
    return false;
  }
  try {
    const session = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
    return !!(session.cookies && session.cookies.length > 0);
  } catch {
    fs.unlinkSync(sessionFile);
    return false;
  }
}

async function validateLiveSession(sessionFile: string, validateURL: string): Promise<boolean> {
  const TIMEOUT_MS = 30000; // 整体超时：30 秒
  const label = path.basename(sessionFile);
  let browser: any = null;
  let timedOut = false;

  // 创建超时定时器
  const timeoutId = setTimeout(() => {
    timedOut = true;
    if (browser) {
      console.log(`[GlobalSetup] Live check timed out, closing browser: ${label}`);
      browser.close().catch(() => {});
    }
  }, TIMEOUT_MS);

  try {
    browser = await chromium.launch({ headless: true, channel: 'chrome', args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] });
    
    // 如果已经超时，直接返回 false
    if (timedOut) {
      console.log(`[GlobalSetup] Live check already timed out (${label}), skipping`);
      clearTimeout(timeoutId);
      return false;
    }
    
    const context = await browser.newContext({ storageState: sessionFile });
    const page = await context.newPage();
    
    // 如果已经超时，直接返回 false
    if (timedOut) {
      console.log(`[GlobalSetup] Live check already timed out (${label}), skipping`);
      clearTimeout(timeoutId);
      return false;
    }
    
    await page.goto(validateURL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    
    // 如果已经超时，直接返回 false
    if (timedOut) {
      console.log(`[GlobalSetup] Live check already timed out (${label}), skipping`);
      clearTimeout(timeoutId);
      return false;
    }
    
    await page.waitForTimeout(2000);

    const currentURL = page.url();
    const isLoginURL = currentURL.includes('/login') || currentURL.includes('/mklogin');
    const isLoginForm = await page
      .locator('input#loginName, input#username, input[name="username"], input[name="loginName"]')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    const valid = !isLoginURL && !isLoginForm;
    console.log(`[GlobalSetup] Live check: ${label} → ${valid ? 'VALID' : 'INVALID'}`);
    clearTimeout(timeoutId);
    return valid;
  } catch (err) {
    console.log(`[GlobalSetup] Live check error (${label}): ${err}`);
    clearTimeout(timeoutId);
    return false;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

// ─────────────────────────────────────────
// 登录
// ─────────────────────────────────────────

async function dismissNetworkTips(page: any): Promise<void> {
  try {
    const overlay = page.locator(NETWORK_TIPS_SELECTOR);
    if (await overlay.isVisible({ timeout: 2000 }).catch(() => false)) {
      await overlay.evaluate((el: HTMLElement) => el.remove()).catch(() => {});
      await page.waitForTimeout(800);
    }
  } catch { /* ignore */ }
}

async function switchToEnglish(page: any): Promise<void> {
  try {
    await page.waitForSelector('.ele-login-square-topbar-text', { timeout: 4000 });
    const btn = page.locator(
      "xpath=//span[contains(@class,'ele-login-square-topbar-text') and normalize-space(text())='English']"
    );
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(800);
    }
  } catch { /* ignore */ }
}

async function loginAccount(
  env: EnvironmentConfig,
  account: AccountConfig,
  sessionFile: string,
  maxRetries: number = 3
): Promise<void> {
  const headless = process.env.HEADLESS !== 'false';
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[GlobalSetup] → Login attempt ${attempt}/${maxRetries} for "${account.username}" @ ${env.name}`);
    
    const browser = await chromium.launch({
      headless,
      channel: 'chrome',
      args: ['--disable-blink-features=AutomationControlled', '--no-first-run', '--no-default-browser-check', '--no-sandbox'],
    });

    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    
    try {
      console.log(`[GlobalSetup] Navigating to login page: ${env.loginURL}`);
      await page.goto(env.loginURL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      console.log(`[GlobalSetup] Page loaded, current URL: ${page.url()}`);
      await page.waitForTimeout(2000);
      await dismissNetworkTips(page);

      if (env.hasLanguageSwitcher) {
        await switchToEnglish(page);
        if (page.url().includes('/mklogin')) {
          console.log(`[GlobalSetup] Redirected to mklogin, navigating back to login page`);
          await page.goto(env.loginURL, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await page.waitForTimeout(2000);
          await dismissNetworkTips(page);
          await switchToEnglish(page);
        }
      }

      console.log(`[GlobalSetup] Filling login form for "${account.username}"`);
      const usernameInput = page.locator(
        '#username, input[name="username"], input[type="text"], input#loginName, input[name="loginName"]'
      ).first();
      const passwordInput = page.locator(
        '#password, input[name="password"], input[type="password"], input#loginPwd, input[name="loginPwd"]'
      ).first();
      const submitButton = page.locator(
        'button[type="submit"], .ele-button-primary, button:has-text("登录"), button:has-text("Login"), .btn_login'
      ).first();

      await usernameInput.waitFor({ state: 'visible', timeout: 30000 });
      await usernameInput.evaluate((el: HTMLElement) => el.removeAttribute('readonly'));
      await usernameInput.fill(account.username);
      await passwordInput.fill(account.password);
      await dismissNetworkTips(page);
      await submitButton.click({ force: true });

      console.log(`[GlobalSetup] Login submitted, waiting for redirect...`);
      await page.waitForURL(
        url => !url.href.includes('/login') && !url.href.includes('/mklogin'),
        { timeout: 60000 }
      );

      console.log(`[GlobalSetup] ✓ Login OK: "${account.username}" → ${page.url()}`);
      await page.context().storageState({ path: sessionFile });
      console.log(`[GlobalSetup] ✓ Session saved: ${sessionFile}`);
      return; // 成功，退出函数
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.log(`[GlobalSetup] ✗ Login attempt ${attempt} failed: ${lastError.message}`);
      
      if (attempt < maxRetries) {
        console.log(`[GlobalSetup] Retrying in 3 seconds...`);
        await page.waitForTimeout(3000);
      }
    } finally {
      await browser.close();
    }
  }
  
  // 所有重试都失败
  throw new Error(`Login failed for "${account.username}" after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}

// ─────────────────────────────────────────
// 入口函数（被 global-setup-xxx.ts 调用）
// ─────────────────────────────────────────

/**
 * @param env            环境配置
 * @param accountFilter  可选：只处理这些用户名（默认处理 env.accounts 全部）
 */
export async function runGlobalSetup(env: EnvironmentConfig, accountFilter?: string[]): Promise<void> {
  const accounts = accountFilter
    ? env.accounts.filter(a => accountFilter.includes(a.username))
    : env.accounts;
  console.log(`\n[GlobalSetup] ══ ${env.name} (${accounts.length} account(s)) ══`);

  for (const account of accounts) {
    const sessionFile = resolveSessionFile(account, ROOT_DIR);
    const label = `${account.username}@${env.id}`;

    // 1. 文件 + 年龄检查（快速）
    if (!isSessionFileValid(sessionFile, env.sessionMaxAgeMinutes)) {
      console.log(`[GlobalSetup] No valid session file for ${label} — will login`);
      await loginAccount(env, account, sessionFile);
      continue;
    }

    // 2. 实时验证（避免 token 在有效期内却已失效的情况）
    // 5 分钟内刚登录的 session 视为可信，跳过实时验证（节省 5-30s）
    const ageMin = (Date.now() - fs.statSync(sessionFile).mtimeMs) / 60000;
    if (ageMin < 5) {
      console.log(`[GlobalSetup] ✓ Session very fresh for ${label} (${ageMin.toFixed(1)} min) — skipping live check`);
      continue;
    }
    const live = await validateLiveSession(sessionFile, env.validateURL);
    if (!live) {
      console.log(`[GlobalSetup] Live check failed for ${label} — re-login`);
      if (fs.existsSync(sessionFile)) fs.unlinkSync(sessionFile);
      await loginAccount(env, account, sessionFile);
    } else {
      const ageMin = (Date.now() - fs.statSync(sessionFile).mtimeMs) / 60000;
      console.log(`[GlobalSetup] ✓ Session valid for ${label} (${ageMin.toFixed(1)} min old) — skipping login`);
    }
  }

  console.log(`[GlobalSetup] ══ Setup complete for ${env.name} ══\n`);
}
