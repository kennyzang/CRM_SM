/**
 * 表单提交帮助类
 * 处理保存按钮点击、成功/失败检测、错误信息捕获
 *
 * 重要：必须通过真实点击触发 EKP 表单引擎的提交流程，
 * 这样才能确保 beforeSubmit 被调用（从而同步 fd_product_covert 和 fd_products_table_json）
 */
import { Page, Locator } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export class FormSubmitHelper {
  private page: Page;
  private consoleLogs: string[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 监听控制台日志
   */
  private setupConsoleListener(): void {
    this.consoleLogs = [];

    this.page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();

      if (type === 'error') {
        console.error(`[Browser Console Error] ${text}`);
      } else if (type === 'warning') {
        console.warn(`[Browser Console Warning] ${text}`);
      }

      this.consoleLogs.push(`[${type.toUpperCase()}] ${text}`);
    });

    this.page.on('pageerror', error => {
      const errorText = `[PAGE ERROR] ${error.message}`;
      console.error(errorText);
      this.consoleLogs.push(errorText);
    });
  }

  /**
   * 截图保存
   */
  private async takeScreenshot(prefix: string = 'submit'): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${prefix}-${timestamp}.png`;
    const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots');

    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const filepath = path.join(screenshotsDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`[FormSubmitHelper] Screenshot saved: ${filepath}`);
    return filepath;
  }

  /**
   * 打印捕获的控制台日志
   */
  private printConsoleLogs(): void {
    console.log('\n========== Browser Console Logs ==========');
    if (this.consoleLogs.length === 0) {
      console.log('No console logs captured.');
    } else {
      this.consoleLogs.forEach(log => console.log(log));
    }
    console.log('==========================================\n');
  }

  /**
   * 找到保存按钮
   * 兼容：保存、Save、Submit
   *
   * 重要：必须通过真实点击触发 EKP 表单引擎的提交流程，
   * 这样才能确保 beforeSubmit 被调用（从而同步 fd_product_covert 和 fd_products_table_json）
   */
  async findSaveButton(): Promise<Locator> {
    console.log('[FormSubmitHelper] Finding save button...');

    const selectors = [
      // 优先级 1: EKP 标准提交按钮（data-t-id）
      '[data-t-id="modeling-common-operation-custom-save"]',
      // 优先级 2: EKP 布局头部的主按钮
      '.ele-cru-layout-header .ele-button--primary',
      '.ele-cru-layout-header .ele-button-primary',
      '.ele-cru-layout-header button.ele-button--primary',
      // 优先级 3: 按钮文本（中文）
      'button:has-text("保存")',
      'button:has-text("提交")',
      'button:has-text("暂存")',
      // 优先级 4: 按钮文本（英文）
      'button:has-text("Save")',
      'button:has-text("Submit")',
      'button:has-text("Draft")',
      // 优先级 5: 主按钮样式（更具体）
      'button.ele-button--primary',
      'button.ele-button-primary',
      // 优先级 6: form 内的 submit 按钮
      'button[type="submit"]',
      'input[type="submit"]',
    ];

    for (const selector of selectors) {
      const locator = this.page.locator(selector).first();
      const count = await locator.count();
      if (count > 0) {
        // 额外检查：元素是否可见（不选隐藏的按钮）
        const isVisible = await locator.isVisible().catch(() => false);
        if (isVisible) {
          console.log(`[FormSubmitHelper] Found save button with selector: ${selector}`);
          return locator;
        }
      }
    }

    // 如果没找到可见的按钮，抛出错误
    await this.takeScreenshot('save-button-not-found');
    throw new Error('Save button not found on page (or not visible)');
  }

  /**
   * 点击保存按钮
   *
   * 重要：不能使用 { force: true }，否则不会触发 React 的 onClick 合成事件，
   * 导致 EKP 表单引擎的 beforeSubmit 不会被调用。
   */
  async clickSaveButton(): Promise<void> {
    const saveBtn = await this.findSaveButton();

    // 等待按钮可见且启用（确保 React onClick 能正常触发）
    try {
      await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
      await saveBtn.waitFor({ state: 'enabled', timeout: 5000 });
    } catch (e) {
      console.warn('[FormSubmitHelper] Button not ready, but trying to click...');
    }

    // 不使用 force: true，确保 React 的 onClick 合成事件能正常触发
    // 这样 EKP 表单引擎才能正确调用 beforeSubmit
    await saveBtn.click();
    console.log('[FormSubmitHelper] Save button clicked (without force)');

    // 等待 EKP 表单引擎处理（beforeSubmit 等）
    await this.page.waitForTimeout(1000);
  }

  /**
   * 检查提交是否成功
   * 成功条件：
   * 1. 出现成功提示弹窗
   * 2. 页面跳转
   * 3. URL 发生变化（从 /add/xxx 变为 /list 或 /edit/xxx）
   */
  async waitForSuccess(): Promise<boolean> {
    console.log('[FormSubmitHelper] Waiting for success...');

    const initialUrl = this.page.url();
    console.log(`[FormSubmitHelper] Initial URL: ${initialUrl}`);

    const TIMEOUT_MS = 60000;

    // Race between success signals, failure signals, and timeout
    type Result =
      | { type: 'success'; reason: string }
      | { type: 'failure'; reason: string }
      | { type: 'timeout' };

    const racePromises: Promise<Result>[] = [];

    // 1. Success toast
    racePromises.push(
      this.page.locator('.ele-message-success, .lui-message-success, .ele-message-item--success')
        .first()
        .waitFor({ state: 'visible', timeout: TIMEOUT_MS })
        .then((): Result => ({ type: 'success', reason: 'success toast' }))
        .catch((): Result => ({ type: 'timeout' }))
    );

    // 2. Success dialog text
    racePromises.push(
      this.page.locator(
        ':text-matches("Submitted successfully!", "i"), :text-matches("提交成功", "i"), :text-matches("保存成功", "i")'
      ).first()
        .waitFor({ state: 'visible', timeout: TIMEOUT_MS })
        .then((): Result => ({ type: 'success', reason: 'success dialog' }))
        .catch((): Result => ({ type: 'timeout' }))
    );

    // 3. URL navigation away from /add/
    racePromises.push(
      this.page.waitForURL(url => !url.href.includes('/add/'), { timeout: TIMEOUT_MS })
        .then((): Result => ({ type: 'success', reason: 'URL navigated away from add page' }))
        .catch((): Result => ({ type: 'timeout' }))
    );

    // 4. Validation error banner (fast fail)
    racePromises.push(
      this.page.locator(
        ':text-matches("validation anomaly", "i"), :text-matches("Cannot Be Empty", "i"), :text-matches("必填", "i"), :text-matches("请填写", "i")'
      ).first()
        .waitFor({ state: 'visible', timeout: TIMEOUT_MS })
        .then((): Result => ({ type: 'failure', reason: 'validation error banner' }))
        .catch((): Result => ({ type: 'timeout' }))
    );

    // 5. Overall timeout sentinel
    racePromises.push(
      this.page.waitForTimeout(TIMEOUT_MS).then((): Result => ({ type: 'timeout' }))
    );

    const result = await Promise.race(racePromises);

    if (result.type === 'success') {
      const reason = result.reason;
      console.log(`[FormSubmitHelper] Success detected: ${reason}`);

      if (reason === 'success dialog') {
        // 尝试点击 "Understood" 按钮关闭弹窗（不使用 force，确保事件正常触发）
        const understoodBtn = this.page.locator(
          'button:has-text("Understood"), button:has-text("知道了"), button:has-text("确认"), button:has-text("OK")'
        ).first();
        if (await understoodBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await understoodBtn.click().catch(() => {});
          console.log('[FormSubmitHelper] Clicked "Understood" button on success dialog');
        }
      }

      // Log final URL
      const finalUrl = this.page.url();
      if (finalUrl !== initialUrl) {
        console.log(`[FormSubmitHelper] Final URL: ${finalUrl}`);
      }

      return true;
    }

    if (result.type === 'failure') {
      const reason = result.reason;
      console.warn(`[FormSubmitHelper] Failure detected: ${reason}`);
      return false;
    }

    // Timeout — run diagnostic
    console.warn(`[FormSubmitHelper] Timed out after ${TIMEOUT_MS / 1000}s waiting for success`);
    await this.checkValidationErrors();
    return false;
  }

  /**
   * 检查页面上的验证错误提示
   */
  private async checkValidationErrors(): Promise<void> {
    console.log('[FormSubmitHelper] Checking for validation errors...');

    const errorIndicators = [
      '.ele-form-item__error',
      '.lui-form-item-error',
      'text="*"',
      '.ele-xform-fieldset-label-require',
    ];

    for (const selector of errorIndicators) {
      try {
        const count = await this.page.locator(selector).count();
        if (count > 0) {
          console.log(`[FormSubmitHelper] Found ${count} elements matching error indicator: ${selector}`);
        }
      } catch (e) {
        continue;
      }
    }

    // 检查是否有必填字段未填充的提示
    const requiredLabels = await this.page.locator('.ele-xform-fieldset-label-require').allTextContents();
    if (requiredLabels.length > 0) {
      console.log(`[FormSubmitHelper] Found ${requiredLabels.length} required field indicators`);
    }
  }

  /**
   * 检查是否有错误提示
   */
  async checkForErrors(): Promise<boolean> {
    const errorSelectors = [
      // 表单校验异常 banner（"Form validation anomaly, total of N items"）
      '.ele-message-error',
      '.ele-message-danger',
      // LUI 校验 toast
      '.lui-message-error',
      // 通用校验错误文字
      'text="请填写"',
      'text="必填"',
      // 英文 CRM 校验 banner（contains "validation anomaly"）
      ':text-matches("validation anomaly", "i")',
      ':text-matches("Cannot Be Empty", "i")',
      ':text-matches("required", "i")',
    ];

    for (const selector of errorSelectors) {
      try {
        const visible = await this.page.locator(selector).first().isVisible({ timeout: 2000 });
        if (visible) {
          // 尝试读取错误文本方便调试
          try {
            const text = await this.page.locator(selector).first().textContent({ timeout: 1000 });
            console.error(`[FormSubmitHelper] Validation error detected [${selector}]: ${text?.trim()}`);
          } catch {
            console.error(`[FormSubmitHelper] Found error with selector: ${selector}`);
          }
          return true;
        }
      } catch {
        continue;
      }
    }

    return false;
  }

  /**
   * 关闭可能存在的弹窗（地址本弹窗、选择器弹窗等）
   */
  private async dismissPopups(): Promise<void> {
    const popupSelectors = [
      '.lui-modal',
      '.lui-overlay',
      '[class*="modal"]:not(#还好)',
    ];

    for (const selector of popupSelectors) {
      try {
        const popup = this.page.locator(selector).first();
        if (await popup.isVisible({ timeout: 500 })) {
          // 尝试按 Escape 关闭
          await this.page.keyboard.press('Escape');
          await this.page.waitForTimeout(300);
        }
      } catch {
        continue;
      }
    }

    // 检查是否有地址本弹窗
    try {
      const addressBookModal = this.page.locator('.lui-modal, [class*="address"], [class*="Address"]').filter({ hasText: /通讯录|联系人|Address/i });
      if (await addressBookModal.isVisible({ timeout: 500 })) {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(300);
        console.log('[FormSubmitHelper] Dismissed address book popup');
      }
    } catch {
      // 没有地址本弹窗
    }
  }

  /**
   * 执行完整的提交流程
   */
  async submit(): Promise<boolean> {
    // 0. 设置控制台监听 + 关闭可能存在的弹窗
    this.setupConsoleListener();
    await this.dismissPopups();

    // 0.5 等待 MKXFORM 准备好（确保 beforeSubmit 能被正确调用）
    console.log('[FormSubmitHelper] Waiting for MKXFORM to be ready...');
    await this.page.waitForFunction(() => {
      return window.MKXFORM && typeof window.MKXFORM.setValue === 'function';
    }, { timeout: 10000 }).catch(() => {
      console.warn('[FormSubmitHelper] MKXFORM not ready, but proceeding anyway...');
    });

    // 1. 点击保存按钮
    await this.clickSaveButton();

    // 2. 等待成功
    const isSuccess = await this.waitForSuccess();

    if (!isSuccess) {
      // 3. 检查是否有错误
      const hasError = await this.checkForErrors();

      // 4. 无论成功与否，都截图并打印控制台日志
      console.log('\n[FormSubmitHelper] Submit not fully successful, capturing diagnostic info...');
      await this.takeScreenshot('submit-failure');
      this.printConsoleLogs();

      if (hasError) {
        throw new Error('Form submission failed: validation error (required fields missing or invalid data)');
      } else {
        // 即使没有明显的错误提示，超时仍然视为失败
        console.warn('[FormSubmitHelper] Success not detected, but no obvious error either');
      }
    } else {
      // 成功也截图一张保存
      await this.takeScreenshot('submit-success');
    }

    return isSuccess;
  }
}
