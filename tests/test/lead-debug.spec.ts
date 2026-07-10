import { test } from '@playwright/test';

test('find form rule for Principal Allocation', async ({ page }) => {
  // Intercept the form config response
  let formConfig: any = null;
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('manufact/release/form/config') && url.endsWith('.json')) {
      try {
        const text = await response.text();
        const json = JSON.parse(text);
        // Look for form rules related to Principal Allocation
        const str = JSON.stringify(json);
        if (str.includes('Principal') || str.includes('Allocation') || str.includes('mk_Principal')) {
          formConfig = json;
        }
      } catch(e) {}
    }
  });
  
  await page.goto('https://test.easycraft.ai/web/#/current/sys-modeling/app/km-ltc/add/1htdn56g4w5ew3qpn9w24s4lj72d31qpk2we');
  await page.waitForTimeout(5000);
  
  if (formConfig) {
    // Search for form rules involving Principal Allocation
    const findRules = (obj: any, depth = 0): void => {
      if (depth > 10 || !obj) return;
      if (typeof obj === 'string' && (obj.includes('Principal') || obj.includes('Allocation') || obj.includes('mk_Principal'))) {
        console.log('Found reference:', obj.substring(0, 200));
      }
      if (typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
          if (key.toLowerCase().includes('rule') || key.toLowerCase().includes('condition') || key.toLowerCase().includes('show') || key.toLowerCase().includes('hide')) {
            const val = JSON.stringify(obj[key]);
            if (val.includes('Principal') || val.includes('Allocation')) {
              console.log(`Form rule at key "${key}":`, val.substring(0, 500));
            }
          }
          findRules(obj[key], depth + 1);
        }
      }
    };
    findRules(formConfig);
  } else {
    console.log('Form config not captured');
  }
  
  // Also try to find via MKXFORM API what controls the table visibility
  await page.waitForFunction(() => !!(window as any).MKXFORM, { timeout: 30000 });
  
  const mkxformInfo = await page.evaluate(() => {
    const m = (window as any).MKXFORM;
    if (!m) return 'no mkxform';
    
    // Check form rules state
    try {
      const ruleState = m.getFormRuleState ? m.getFormRuleState() : 'no getFormRuleState';
      const modelData = m.getData ? JSON.stringify(m.getData()) : 'no getData';
      return { ruleState: JSON.stringify(ruleState), modelData: modelData.substring(0, 500) };
    } catch(e: any) {
      return { error: e.message };
    }
  });
  console.log('MKXFORM info:', JSON.stringify(mkxformInfo));
  
  // Try to trigger the visibility by checking what fields control the rule
  await page.evaluate(() => {
    const m = (window as any).MKXFORM;
    if (!m) return;
    // Log all MKXFORM properties/methods
    const keys = Object.getOwnPropertyNames(Object.getPrototypeOf(m) || m).filter(k => typeof (m as any)[k] === 'function');
    console.log('MKXFORM methods:', JSON.stringify(keys.slice(0, 30)));
  });
});
