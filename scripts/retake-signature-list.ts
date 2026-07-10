/**
 * Retake signature-001-list.png — must show the Create button.
 *
 * Run:
 *   npx ts-node scripts/retake-signature-list.ts
 */

import { chromium } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const BASE_URL   = 'http://172.18.114.231:8088';
const LIST_URL   = `${BASE_URL}/web/#/current/sys-modeling/app/km-signature/listView/1golm0452wd5pw1hpw15lk4815i46d21dkw0/1h2aj825lw2cvwfjuw1s2ro5g2gqb7p033w0`;
const LOGIN_URL  = `${BASE_URL}/web/#/login?redirectUrl=%2Fweb%2F%23%2Fcurrent%2Fsys-modeling%2Fapp%2Fkm-signature%2FlistView%2F1golm0452wd5pw1hpw15lk4815i46d21dkw0%2F1h2aj825lw2cvwfjuw1s2ro5g2gqb7p033w0`;
const OUT_DIR    = path.resolve(__dirname, '../wiki/assets');
const OUT_FILE   = path.join(OUT_DIR, 'signature-001-list.png');

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const ctx     = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page    = await ctx.newPage();

  // ── Login ──────────────────────────────────────────────────────
  console.log('Navigating to login page...');
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await page.getByRole('textbox', { name: 'Username' }).fill('ck');
  await page.getByRole('textbox', { name: 'Password' }).fill('1');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');

  // ── Wait for list page to fully render ─────────────────────────
  // Wait for the left nav "My Signature" to appear
  await page.waitForURL(/km-signature/, { timeout: 30_000 });

  // The Create button may live inside an iframe — try both
  let createVisible = false;
  try {
    // Top-level
    await page.waitForSelector('button:has-text("Create")', { timeout: 8_000 });
    createVisible = true;
    console.log('Create button found at top level');
  } catch {
    // Try inside iframe
    try {
      const frame = page.frames().find(f => f.url() !== page.url());
      if (frame) {
        await frame.waitForSelector('button:has-text("Create")', { timeout: 8_000 });
        createVisible = true;
        console.log('Create button found inside iframe');
      }
    } catch {
      console.warn('Create button not found — taking screenshot anyway');
    }
  }

  // Extra wait for visual stability
  await page.waitForTimeout(1500);

  await page.screenshot({ path: OUT_FILE, fullPage: false });
  console.log(`✅ Saved: ${OUT_FILE}  (createVisible=${createVisible})`);

  await browser.close();
})();
