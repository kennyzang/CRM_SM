---
title: Pitfall Log
created: 2026-04-22
updated: 2026-04-28
type: pitfall
tags: [pitfall]
sources: [skills/fill-crm-form.md, doc/plan/phase-1.md, oss/Quotation.mp4]
related: [[widget-special-controls]], [[lead]], [[contact]], [[customer]], [[quote]], [[po]], [[so]]
---

# Pitfall Log

> All discovered and resolved pitfalls. Reverse chronological order (newest first).

---

## Resolved

### 1. Radio Click Ineffective

- **Symptom**: Clicked radio but form value unchanged, submission fails with empty field
- **Root cause**: Clicked hidden `<input type="radio">` instead of visible `.lui-radio-wrapper`
- **Fix**: Click the visible `.lui-radio-wrapper` or `label` element
- **Prevention**: Always use the "Strategy 1: data-tid wrapper" approach from [[widget-special-controls]]

---

### 2. Promise.race Unhandled Rejection

- **Symptom**: After form submission, Node.js reports unhandled promise rejection
- **Root cause**: Failed branch in `Promise.race` has no `.catch()`, which throws unhandled exception in Node 15+
- **Fix**: Add `.catch(() => {})` to BOTH branches before racing:
  ```typescript
  const toastP = page.locator('.lui-message-notice-content').waitFor({ state: 'visible' }).then(() => 'toast');
  const redirectP = page.waitForURL(url => !url.href.includes('/add/')).then(() => 'redirect');
  toastP.catch(() => {});      // ← required
  redirectP.catch(() => {});    // ← required
  const outcome = await Promise.race([toastP, redirectP]);
  ```

---

### 3. Contact Form Submission → Blank Page (about:blank)

- **Symptom**: Contact saved successfully, but `page.url()` becomes `about:blank`
- **Root cause**: CRM Contact form calls `window.close()` after submission
- **Fix**: After save, detect `url === 'about:blank'` and open a new page from context:
  ```typescript
  if (this.page.url() === 'about:blank' && this.context) {
    this.page = await this.context.newPage();
  }
  ```
- **Note**: Contact tests MUST pass `context` from `testInfo.storageState` to the constructor

---

### 4. Textarea Field Not Found (CRM Typo)

- **Symptom**: `comp-fd_remark--teaxtarea` and `comp-fd_scope--teaxtarea` not found
- **Root cause**: CRM itself has a typo (`teaxtarea` instead of `textarea`), not a test issue
- **Fix**: Use the correct (typo) spelling `teaxtarea` in test code
- **Affected fields**:
  - Lead Details/Remarks: `comp-fd_remark--teaxtarea`
  - Customer Scope of Business: `comp-fd_scope--teaxtarea`

---

### 5. Address Field Not Found

- **Symptom**: `comp-fd_address--input` not found for Contact address field
- **Root cause**: Actual data-tid is `comp-fd_add--input`, not `address`
- **Fix**: Use candidate list with priority:
  ```typescript
  const candidates = [
    'comp-fd_add--input',       // priority
    'comp-fd_address--input',    // fallback
  ];
  ```

---

### 6. Form Save Success but List Search Fails

- **Symptom**: Contact created successfully, but list page search throws error
- **Root cause**: Contact list search uses `fd_company` field, which does not exist in Contact model
- **Fix**: Do not use list search box for Contact verification. Navigate to list URL with filter instead.

---

### 7. CRM Typo: "prodcut" in Estimated Amount

- **Symptom**: Principal Allocation Estimated Amount field not found
- **Root cause**: CRM data-tid uses `fd_prodcut_amt` (typo: "prodcut" not "product")
- **Fix**: Use the typo spelling: `fd_prodcut_amt-{N}-comp-mk_Principal_Allocation_list-fd_prodcut_amt-{N}-number`

---

### 8. CRM Typo: "raido" in Radio Buttons

- **Symptom**: Radio button data-tid not found with "radio" spelling
- **Root cause**: CRM uses `raido` not `radio` in data-tids (e.g., `comp-fd_customer_name--raido-2`)
- **Fix**: Use the typo spelling in selectors

---

### 9. about:blank Redirect After Form Submission

- **Symptom**: After submitting a form, page briefly redirects to `about:blank` before final URL
- **Root cause**: CRM SPA navigation behavior
- **Fix**: Wait for redirect away from `about:blank` before extracting lead ID:
  ```typescript
  if (!leadId && this.page.url() === 'about:blank') {
    await this.page.waitForURL(u => u.href !== 'about:blank', { timeout: 8000 }).catch(() => {});
    if (this.page.url() !== 'about:blank') {
      leadId = this._extractIdFromUrl();
    }
  }
  ```

---

### 10. Network Tips Overlay Intercepts Clicks

- **Symptom**: Clicks intercepted by a network overlay that appears randomly
- **Root cause**: CRM shows a "network tips" overlay on slow connections
- **Fix**: Call `handleNetworkTipsOverlay()` before critical clicks

---

### 11. Residual Cascader Panel Items

- **Symptom**: lui-select options matched stale cascader panel items from previous interaction
- **Root cause**: Previously-closed cascader panel DOM elements remain in page
- **Fix**: Scope option search to the newly-opened dropdown panel first, not globally

---

### 12. Form Frame Resolution (iframe)

- **Symptom**: Form elements not found in main page
- **Root cause**: CRM form may be rendered inside an iframe
- **Fix**: FormEngine.resolveFormFrame() probes main page first, then iterates all iframes

---

## Video-Documented Typos / UI Issues

### 13. "prodcut" Typo in Quotation Excel Editor

- **Symptom**: Column header in Excel Editor modal shows `fd_sm_prodcut_code` instead of `fd_sm_product_code`
- **Root cause**: Typo in the low-code platform field naming
- **Impact**: Test selectors targeting "product" by text may fail; need to use the actual typo string or data-tid
- **Date discovered**: 2026-04-28
- **Discovered by**: Video analysis (Quotation.mp4)
- **Status**: Documented; not yet verified in live DOM

### 14. Browser "Insecure Download Blocked" on HTTP

- **Symptom**: Excel/PDF export downloads blocked by browser when CRM runs on HTTP (not HTTPS)
- **Root cause**: Modern browser security policy blocks mixed-content/insecure downloads
- **Impact**: Export functionality may fail in test environments using HTTP
- **Workaround**: Configure browser to allow insecure downloads, or use HTTPS in test environment
- **Date discovered**: 2026-04-28
- **Discovered by**: Video analysis (Quotation.mp4)
- **Status**: Documented; environment-specific

### 15. Quotation Template Row Limit Warning

- **Symptom**: Red warning "N row(s) exceed the template limit, will be ignored" in Excel Editor
- **Root cause**: Excel template has a fixed row capacity; excess line items are truncated
- **Impact**: Data loss during export if quotation has more line items than template supports
- **Date discovered**: 2026-04-28
- **Discovered by**: Video analysis (Quotation.mp4)
- **Status**: Documented; business rule to be aware of

### 16. "Delievery" Typo on SO Details Tabs

- **Symptom**: SO details tab shows "Delievery(0)" instead of "Delivery"
- **Root cause**: Typo in the CRM source code for tab label
- **Impact**: Visual defect; functional impact unknown
- **Date discovered**: 2026-04-30
- **Discovered by**: Video analysis (Contract & Payment Schedule.mp4)
- **Status**: Documented; known defect

### 17. Contract Tab Empty State Mismatch

- **Symptom**: Tab label shows `Contract(1)` but clicking displays "No Data" empty state
- **Root cause**: Async sync delay or permission gap between SO and Contract data
- **Impact**: Confusing UX; data may exist but not render
- **Date discovered**: 2026-04-30
- **Discovered by**: Video analysis (Contract & Payment Schedule.mp4)
- **Status**: Documented; potential data consistency issue

### 18. Attachment Mandatory Inconsistency (Contract)

- **Symptom**: Blueprint spec says Contract Attachment is mandatory, but UI shows no required asterisk
- **Root cause**: Form validation config does not match Blueprint specification
- **Impact**: Users may skip attachment; form may or may not enforce later
- **Date discovered**: 2026-04-30
- **Discovered by**: Video analysis (Contract & Payment Schedule.mp4)
- **Status**: Documented; spec vs UI mismatch

### 19. Manual Image Path Broken (User Manual)

- **Symptom**: User manual markdown references `../assets/xxx.jpg` but no image files exist at those paths
- **Root cause**: Manual was written BEFORE images were extracted and saved. Frame-to-filename mapping was guessed from frame numbers rather than verified by visual inspection
- **Impact**: All image references in user manuals are broken — readers see nothing
- **Date discovered**: 2026-05-28
- **Discovered by**: User feedback ("用户手册图片路径有问题看不到")
- **Occurrences**: 2 (2026-05-27 P&L manual, 2026-05-28 Invoice Application manual)
- **Fix**: Implemented `manual-image-pipeline` skill with enforced workflow: save raw frames → verify each with vision_analyze → copy to assets → THEN write manual
- **Status**: Resolved; skill created, pipeline documented

---

## Rules & Conventions

### Naming: P&L vs PL

> **对外（客户/文档/测试用例/页面标题）统一叫 P&L**，不叫 PL。
> - 客户视角：P&L（Profit & Loss，损益表）
> - 代码/文件：`pl.md`、`pl.spec.ts`、`mk_km_ltc_pl.json`（技术缩写保持不变）
> - Wiki 正文：首次出现写 "P&L (Profit & Loss)"，后续统一用 P&L
> - 测试用例命名：`test_pl.spec.ts`、`crm-pl.spec.ts` 保持缩写，但注释和描述用 P&L
>
> **原因**：PL 容易与 Product License、Price List 混淆。CRM 系统本身在 UI 上也使用 "P&L" 标签。
>
> **Date**: 2026-06-04

---

## Unresolved

(To be filled as testing discovers new issues)

---

## Adding New Pitfalls

When discovering a new pitfall during testing, append to this file:

```markdown
### [Pitfall Name]

- **Symptom**:
- **Root cause**:
- **Fix**:
- **Date discovered**: YYYY-MM-DD
- **Discovered by**: [name]
```
