---
title: Special UI Controls — Playwright Templates
created: 2026-04-22
updated: 2026-05-28
type: widget
tags: [widget/special, widget/lui, tool/playwright]
sources: [skills/fill-crm-form.md, oss/Contact & Lead Creation.mp4, oss/Lead Management.mp4, oss/Contract & Payment Schedule.mp4, oss/PI.mp4, oss/Sales Order_v2.mp4]
related: [[lead]], [[contact]], [[customer]], [[product]], [[pitfall-log]]
---

# Widget Special Controls

> This page documents Playwright operation patterns for all special UI controls in the CRM. All code templates are verified standard practices.

---

## Control Type Quick Reference

| Control | CSS Class Prefix | Section |
|---------|-----------------|---------|
| Cascader | `.lui-cascader` | [#1-lui-cascader] |
| Select | `.lui-select` | [#2-lui-select] |
| Table Select Modal | `.lui-select-table-modal` | [#3-table-select-modal] |
| Relation Modal | `.lui-relation-modal` | [#4-relation-modal] |
| Detail Table (dynamic rows) | `.lui-table` | [#5-detail-table] |
| Radio | `.lui-radio` | [#6-lui-radio] |
| Textarea | `.lui-textarea` | [#7-lui-textarea] |
| Date Picker | `.lui-date-picker` | [#8-date-picker] |
| Autocomplete | `.lui-autocomplete` | [#9-autocomplete] |
| Tag/Multi-Select | `.lui-tag-input` | [#10-tag-multi-select] |
| Validation Banner | `.validation-banner` | [#11-validation-banner] |
| Progress Stepper | `.lui-step` | [#12-progress-stepper] |
| Toast Notification | `.lui-toast` | [#13-toast-notification] |
| Service Team Modal | `.lui-modal` | [#14-service-team-modal] |
| File Upload | `.lui-upload` | [#15-file-upload] |
| Radio Card Group | `.lui-radio-card` | [#16-radio-card-group] |
| Toggle Switch | `.lui-switch, .ele-switch` | [#17-toggle-switch] |
| Slider | `.lui-slider` | [#18-slider] |
| Rich Text Editor | `.lui-richtext, .wysiwyg` | [#19-rich-text-editor] |
| Wizard/Stepper Modal | `.lui-wizard, .lui-steps` | [#20-wizard-stepper-modal] |
| User Chip/Tag Selector | `.lui-user-tag` | [#21-user-chip-selector] |

---

## 1. lui-cascader

**Typical fields**: Lead Source, Lead Level; Customer Account Type, Account Source

### Characteristics
Click on a fieldset to trigger a multi-level cascader panel. Selection is hierarchical.

### Playwright Operation Template

```typescript
// Locate the fieldset (has data-tid)
const fieldset = this.page.locator('[data-tid="ef-fs-fd_source-desktop"]').first();
await fieldset.scrollIntoViewIfNeeded();
await fieldset.locator('.lui-cascader-selector-wrap, .lui-cascader-selector').first().click();

// Select target option from panel (hierarchical)
const option = this.page.locator('.lui-cascade-item-content-label', { hasText: 'Search Engine' }).first();
await option.waitFor({ state: 'visible', timeout: 8000 });
await option.click();

// Close panel (click outside or wait for auto-close)
await this.page.locator('.lui-cascade-item-content-label').first()
  .waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
```

### Searchable Cascader

**Characteristics**: Shows "No relevant content was searched" when opened, requires text input to display options.

**Example fields**: Lead Source, Lead Level

```typescript
// Detect searchable cascader
const bodyText = await this.page.textContent('body') || '';
const isSearchable = bodyText.includes('No relevant content was searched') || bodyText.includes('搜索');

if (isSearchable) {
  // Type text into search input
  const searchInput = this.page.locator('.lui-cascader-search-input input, .lui-cascader-panel input[type="text"]').first();
  await searchInput.fill('Search Engine');
  await this.page.waitForTimeout(1000);
  
  // Wait for results and select
  const option = this.page.locator('.lui-cascade-item-content-label:visible', { hasText: 'Search Engine' }).first();
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click();
}
```

### Pitfalls
- Must `scrollIntoViewIfNeeded()` first, otherwise the control is not clickable
- Always wait for option `visible` before clicking
- Panel close detection: wait for the first label to disappear
- Searchable cascader requires text input before options appear

---

## 2. lui-select

**Typical fields**: Lead Stage (Sales Pipeline), Product Type

### Playwright Operation Template

```typescript
// Locate select (usually inside a fieldset)
const select = this.page.locator('[data-tid="ef-fs-fd_lead_stage-desktop"] .lui-select').first();
await select.click();

// Wait for dropdown items, pick randomly
const items = this.page.locator('.lui-select-dropdown .lui-select-item');
await items.first().waitFor({ state: 'visible', timeout: 5000 });
const count = await items.count();
await items.nth(Math.floor(Math.random() * count)).click();

// Close any residual overlay
await this.page.keyboard.press('Escape');
```

### Multi-strategy approach (from LeadCreatePage.selectSalesPipeline)

```typescript
// Strategy 1: scope to newly-opened dropdown panel
const panelSelectors = ['.lui-select-dropdown', '[role="listbox"]', '.lui-popup', '.lui-virtual-list'];
for (const panelSel of panelSelectors) {
  const panel = this.page.locator(panelSel).first();
  if (!await panel.isVisible({ timeout: 2000 }).catch(() => false)) continue;

  const itemSelectors = ['[role="option"]', '.lui-select-item', '.lui-select-option', '.lui-option', 'li'];
  for (const itemSel of itemSelectors) {
    const options = panel.locator(itemSel);
    if (!await options.first().isVisible().catch(() => false)) continue;
    const count = await options.count();
    if (count === 0) continue;
    const pick = options.nth(Math.floor(Math.random() * count));
    const text = ((await pick.textContent()) || '').trim();
    await pick.click();
    return text;
  }
}

// Strategy 2: ARIA role=option globally (cascader items don't use this role)
const ariaOptions = this.page.locator('[role="option"]');
// ... pick and click
```

---

## 3. Table Select Modal

**Typical fields**: Deal Category

### Characteristics
Click trigger button → table modal pops up → select row → click Confirm

### Playwright Operation Template

```typescript
// Click trigger
await trigger.click();

// Wait for modal
const modal = this.page.locator('.lui-select-table-modal, .ele-xform-basecfg-table-select-modal').first();
await modal.waitFor({ state: 'visible', timeout: 10000 });

// Wait for rows to load (async)
const rows = modal.locator('.lui-table-row.lui-table-row-level-0');
await rows.first().waitFor({ state: 'visible', timeout: 15000 });
const count = await rows.count();
await rows.nth(Math.floor(Math.random() * count)).click();

// Click Confirm (try multiple text variants)
const confirmBtn = modal.locator(
  'button:has-text("Confirm"), button:has-text("确定"), .lui-btn-primary'
).first();
if (await confirmBtn.isVisible()) await confirmBtn.click();
await modal.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
```

### Pitfalls
- Row loading has async delay — must `waitFor({ state: 'visible' })` before clicking
- Confirm button text may be "Confirm" or "确定" — try both

---

## 4. Relation Modal

**Typical fields**: Product Principal in Charge, Principal Allocation Product Description

### Playwright Operation Template

```typescript
async selectFromRelationModal(fieldName: string): Promise<void> {
  // 1. Click trigger (by label or placeholder)
  const trigger = this.page.locator(
    `button:has-text("${fieldName}"), input[placeholder*="${fieldName}"]`
  ).first();
  await trigger.click();

  // 2. Wait for modal
  const modal = this.page.locator('.lui-relation-modal, .lui-modal').first();
  await modal.waitFor({ state: 'visible', timeout: 10000 });

  // 3. Select first row
  const rows = modal.locator('.lui-table-row, .ant-table-row').first();
  await rows.waitFor({ state: 'visible', timeout: 10000 });
  await rows.click();

  // 4. Click confirm
  const confirm = modal.locator('button:has-text("Confirm"), button:has-text("确定")').first();
  if (await confirm.isVisible()) await confirm.click();
}
```

### Principal Allocation specific (from LeadCreatePage)

```typescript
// Product Description cell (row N):
const cellTid = `fd_product_list-${N}-comp-mk_Principal_Allocation_list-fd_product_list-${N}-comp`;
const trigger = this.page.locator(`[data-tid="${cellTid}"] .lui-select-selector`).first();

// Confirm button data-tid:
const okTid = `fd_product_list-${N}-comp-mk_Principal_Allocation_list-fd_product_list-${N}-modal-ok-btn`;
```

### Pitfalls
- Table row radio buttons use `opacity: 0` until hovered — use `click({ force: true })`
- Product records are account-scoped — only certain accounts (e.g., Yuwin) have products
- Modal data is lazy-loaded — wait up to 30s for first row

---

## 5. Detail Table (dynamic rows)

**Typical fields**: Customer Address List, Principal Allocation

### Playwright Operation Template

```typescript
// Locate table container
const table = this.page.locator('[data-id="mk_Address_list"]').first();
await table.scrollIntoViewIfNeeded();

// Click "Add rows" button
const addBtn = table.locator('[data-tid="mk_Address_list-addRows"]').first();
await addBtn.click();

// Wait for new row
const newRow = table.locator('.lui-table-row').last();
await newRow.waitFor({ state: 'visible', timeout: 5000 });
```

### Principal Allocation table

```typescript
// Section wrapper
const section = this.page.locator('[data-tid="ef-fs-mk_Principal_Allocation_list-desktop"]').first();

// Row 0 is always pre-populated — no need to click "Add rows"
// Product Description: relation modal (see section 4)
// Estimated Amount: number input with CRM typo "prodcut"
const inputTid = `fd_prodcut_amt-0-comp-mk_Principal_Allocation_list-fd_prodcut_amt-0-number`;
const input = this.page.locator(`[data-tid="${inputTid}"]`).first();
await input.fill(amount.toString());
```

---

## 6. lui-radio

### Playwright Operation Template

```typescript
// Strategy 1: data-tid (recommended)
const el = this.page.locator('[data-tid="comp-fd_gender--raido-1"]').first();
await el.click();

// Strategy 2: CSS :has + radio value (precise)
await this.page.locator('label:has(input[type="radio"][value="1"])').first().click();

// Strategy 3: fieldset container (from LeadCreatePage)
const fieldset = this.page.locator('[data-tid="ef-fs-fd_customer_name-desktop"]').first();
const radio = fieldset.locator('[data-tid="comp-fd_customer_name--raido-2"]').first();
await radio.click();

// Fallback: force click
await el.click({ force: true });
```

### Pitfalls
- Do NOT click the hidden `<input type="radio">` — click the visible `.lui-radio-wrapper` or `label`
- `data-tid` sometimes points to wrapper (clickable), sometimes to input (invisible)
- CRM typo: "raido" not "radio" in data-tids

---

## 7. lui-textarea

### Playwright Operation Template

```typescript
const textarea = this.page.locator('[data-tid="comp-fd_remark--teaxtarea"]').first();
await textarea.scrollIntoViewIfNeeded();
await textarea.click({ force: true });
await textarea.fill(value);
```

### Pitfalls
- CRM typo: `comp-fd_remark--teaxtarea` (not "textarea") — see [[pitfall-log]]
- May require `force: true` for click
- `scrollIntoViewIfNeeded()` is essential

---

## 8. Date Picker

**Typical fields**: Opportunity Estimated Close Date, Contact Birthday

### Playwright Operation Template

```typescript
// Direct text fill (most reliable for date fields)
const dateInput = this.page.locator('[data-tid="comp-fd_expected_closing_date--date"]').first();
await dateInput.click();
await dateInput.fill('2026-12-31');
await dateInput.press('Enter');
```

### Pitfalls
- Direct fill + Enter is more reliable than clicking the calendar popup
- Format: YYYY-MM-DD

---

## 9. Autocomplete [V]

**Typical fields**: Lead Name, Contact Mobile

### Characteristics
Floating suggestion list appears below the input as user types. Shows existing records. Each suggestion has an 'x' to clear.

### Playwright Operation Template

```typescript
// Type partial text
const input = this.page.locator('[data-tid="comp-fd_name--input"]').first();
await input.fill('ABC');

// Wait for autocomplete dropdown
const suggestion = this.page.locator('.lui-autocomplete-item, .autocomplete-item', { hasText: 'ABC Q2 Purchase' }).first();
await suggestion.waitFor({ state: 'visible', timeout: 5000 });
await suggestion.click();
```

### Pitfalls
- Autocomplete may overlap with other elements — ensure no overlay blocks it
- Options appear asynchronously — always wait for visible before clicking

---

## 10. Tag/Multi-Select Input [V]

**Typical fields**: Entity (Lead form), Customer (Contact form)

### Characteristics
Input displays selected values as removable tags/chips with 'x' button. Can select multiple values.

### Playwright Operation Template

```typescript
// Click input to open selection
const input = this.page.locator('.lui-tag-input, .lui-select-multiple').first();
await input.click();

// Select option from dropdown
const option = this.page.locator('.lui-select-item', { hasText: 'SCMY' }).first();
await option.click();

// Verify tag appears
const tag = input.locator('.lui-tag', { hasText: 'SCMY' }).first();
await tag.waitFor({ state: 'visible' });
```

### Pitfalls
- Each tag has its own 'x' for removal
- Clicking the 'x' removes only that tag, not the whole selection

---

## 11. Validation Banner [V]

**Location**: Top of form, global error display

### Characteristics
Red banner appears above form when validation fails. Shows "Form validation anomaly, total of N items" with a "Next" button that jumps to first error.

### Playwright Detection

```typescript
// Check for validation banner
const banner = this.page.locator('.validation-banner, [class*="error-banner"]', { hasText: 'Form validation anomaly' }).first();
if (await banner.isVisible()) {
  const match = await banner.textContent();
  const count = match.match(/total of (\d+) items/)?.[1];
  // count = number of validation errors
}
```

### Pitfalls
- Field-level errors also appear inline under each field (red text)
- Banner count may not match visible inline errors if some are off-screen

---

## 12. Progress Stepper [V]

**Typical fields**: Lead stage pipeline (Targeting -> Prospecting -> End)

### Characteristics
Horizontal step visualization with stage names, probability percentages, and connecting lines. Current stage is highlighted.

### Playwright Operation Template

```typescript
// Get current stage
const currentStage = this.page.locator('.step-item.active, .lui-step-item-active').first();
const stageText = await currentStage.textContent();

// "Advance to next stage" button
const advanceBtn = this.page.locator('button:has-text("Advance"), button:has-text("下一步")').first();
await advanceBtn.click();
```

---

## 13. Toast Notification [V]

**Typical trigger**: Successful form save, permission change

### Characteristics
Green notification with checkmark icon, auto-dismisses after a few seconds. Text: "Operation succeeded".

### Playwright Wait

```typescript
// Wait for success toast after save
const toast = this.page.locator('.lui-toast-success, .toast-success', { hasText: 'Operation succeeded' }).first();
await toast.waitFor({ state: 'visible', timeout: 10000 });
// Auto-dismisses — no need to close
```

---

## 14. Service Team Modal [V]

**Location**: Lead Detail view

### Characteristics
Modal overlay with team member table. Columns: Name, Position, Team Role (Head/Member), Permission (Edit/Read Only), Action (Delete). "+ Add more" button.

### Playwright Operation Template

```typescript
// Open service team modal
const addBtn = this.page.locator('button:has-text("Add more")').first();
await addBtn.click();

// Wait for modal
const modal = this.page.locator('.lui-modal, [class*="service-team"]').first();
await modal.waitFor({ state: 'visible', timeout: 10000 });

// Change permission (Edit -> Read Only or vice versa)
const permissionDropdown = modal.locator('.lui-select-selector').first();
await permissionDropdown.click();
const option = modal.locator('.lui-select-item', { hasText: 'Read Only' }).first();
await option.click();
```

---

## 15. File Upload (Business Card) [V]

**Typical fields**: Contact Business Card, Lead Business Card

### Characteristics
Drag-and-drop zone with + icon. Supports jpg/gif/png formats, single file only.

### Playwright Operation Template

```typescript
// Locate file upload area
const uploadArea = this.page.locator('.lui-upload, .file-upload-area, [class*="upload"]').first();
await uploadArea.setInputFiles('/path/to/business_card.jpg');

// Verify upload
const fileName = uploadArea.locator('.uploaded-file-name').first();
await fileName.waitFor({ state: 'visible', timeout: 5000 });
```

### Pitfalls
- Single file only — uploading a second file replaces the first
- Format validation happens client-side — unsupported formats show inline error

---

## 16. Radio Card Group [V]

**Typical fields**: Import Mode (Lead Import), Import Mode selection

### Characteristics
Card-style radio buttons with visual cards instead of dots. Each card has a label and description. Selected card is highlighted (blue border/fill).

### Playwright Operation Template

```typescript
// Click the card (not a traditional radio input)
const card = this.page.locator('.lui-radio-card, [class*="radio-card"]', { hasText: 'New and update import' }).first();
await card.click();

// Verify selection (card should have active/selected class)
const isSelected = await card.locator('.active, .selected, .checked').isVisible().catch(() => false);
```

### Pitfalls
- Not a traditional `.lui-radio` — it's a card-based layout
- Selection state is shown via card styling, not radio dot
- Used in Lead Import modal (4 options: Add/Update/Upsert/Quick)

---

## 17. Toggle Switch [V]

**Typical fields**: New Lead Notification (Lead Queue), Discount toggle (P&L)

### Characteristics
ON/OFF toggle switch with blue active state. Sliding animation.

### Playwright Operation Template

```typescript
// Click toggle to switch state
const toggle = this.page.locator('.lui-switch, .ele-switch, [class*="switch"]').first();
await toggle.click();

// Check if ON (has active class)
const isOn = await toggle.locator('.active, .checked, .on').isVisible().catch(() => false);
```

### Pitfalls
- No text value to verify state — rely on CSS class or color
- Used for boolean flags (notification on/off, discount on/off)

---

## 18. Slider [V]

**Typical fields**: Task Completion Progress (0-100%)

### Characteristics
Horizontal slider with percentage tooltip. Draggable handle.

### Playwright Operation Template

```typescript
// Set slider value (via JS or drag)
// Method 1: Set via hidden input if available
const sliderInput = this.page.locator('.lui-slider input[type="range"], [class*="slider"] input').first();
await sliderInput.evaluate((el, value) => { (el as HTMLInputElement).value = value; }, 100);
await sliderInput.dispatchEvent('input');
await sliderInput.dispatchEvent('change');

// Method 2: Dispatch event with value directly
await page.evaluate(() => {
  const slider = document.querySelector('.lui-slider input');
  if (slider) {
    (slider as HTMLInputElement).value = '100';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    slider.dispatchEvent(new Event('change', { bubbles: true }));
  }
});
```

### Pitfalls
- Drag-and-drop is flaky in Playwright — prefer JS evaluation
- Tooltip shows current percentage value
- Range: 0-100

---

## 19. Rich Text Editor / WYSIWYG [V]

**Typical fields**: Task Feedback — Completion Description

### Characteristics
Full WYSIWYG editor with toolbar: Undo/Redo, Insert Image/File, Font, Paragraph, List, Fullscreen. Content area below toolbar.

### Playwright Operation Template

```typescript
// Type into editor content area (often an iframe or contenteditable div)
const editor = this.page.locator('.lui-richtext [contenteditable], .wysiwyg-editor, iframe.cke_wysiwyg_frame').first();

// Method 1: contenteditable div
await editor.click();
await editor.fill('Task completed successfully');

// Method 2: if present in iframe
const frame = this.page.frameLocator('iframe.cke_wysiwyg_frame');
await frame.locator('body').fill('Task completed');
```

### Pitfalls
- May be inside an iframe — use `frameLocator()`
- contenteditable divs may need `.click()` before `.fill()`
- Toolbar buttons can interfere — ensure focus is in content area

---

## 20. Wizard/Stepper Modal [V]

**Typical flows**: Lead Conversion (3-step: Customer → Contact → Opportunity)

### Characteristics
Modal with progress stepper at top showing completed/active/pending steps. Navigation: Previous/Next/Confirm/Cancel.

### Playwright Operation Template

```typescript
// Navigate wizard steps
const nextBtn = this.page.locator('.lui-modal button:has-text("Next")').first();
await nextBtn.click();

// Wait for step content to load
const step2 = this.page.locator('.lui-wizard-step.active, [class*="step-2"]');
await step2.waitFor({ state: 'visible', timeout: 5000 });

// Previous step
const prevBtn = this.page.locator('.lui-modal button:has-text("Previous")').first();
await prevBtn.click();

// Confirm (final step)
const confirmBtn = this.page.locator('.lui-modal button:has-text("Confirm")').first();
await confirmBtn.click();
```

### Pitfalls
- Each step has its own form validation
- "Confirm" button may be disabled until all required fields filled
- Step content loads asynchronously — wait for visible

---

## 21. User Chip/Tag Selector [V]

**Typical fields**: Owner, Executor, Admin, Member (Lead Queue, Task, Service Team)

### Characteristics
User selection displayed as removable chips/tags with avatar and name. 'x' button on each chip for removal.

### Playwright Operation Template

```typescript
// Click input to open user picker
const input = this.page.locator('.lui-user-tag input, .user-selector input').first();
await input.click();

// Select user from dropdown
const userOption = this.page.locator('.lui-select-item, .user-option', { hasText: 'Yuwin' }).first();
await userOption.click();

// Verify chip appears
const chip = this.page.locator('.lui-user-tag .chip, .user-chip', { hasText: 'Yuwin' }).first();
await chip.waitFor({ state: 'visible' });

// Remove user (click 'x' on chip)
const removeBtn = chip.locator('.chip-remove, .x-btn').first();
await removeBtn.click();
```

### Pitfalls
- Multi-select: can add multiple users as chips
- Each chip has independent 'x' for removal
- Admin/Member roles may have separate selectors

---

## 22. Reminder Sub-table (Embedded Grid) [V]

**Typical fields**: Contract Reminder (Notify Who + Days before Expiry)

### Characteristics
Embedded table within a form, not a full-page detail table. Has per-row actions (Insert/Copy/Delete) and table-level actions (+ Add rows, Import, More, Revoke). Each row contains a number input + hardcoded unit ("day").

### Playwright Operation Template

```typescript
// Locate the reminder sub-table
const table = this.page.locator('[class*="reminder-table"], .lui-table').first();
await table.scrollIntoViewIfNeeded();

// Add a new row
const addBtn = table.locator('button:has-text("Add rows"), [data-tid*="addRows"]').first();
await addBtn.click();

// Fill days value in row N
const daysInput = table.locator('.lui-table-row').nth(N).locator('input[type="number"]').first();
await daysInput.fill('30');

// Per-row actions
const deleteBtn = table.locator('.lui-table-row').nth(N).locator('a:has-text("Delete"), button:has-text("Delete")').first();
await deleteBtn.click();
```

### Pitfalls
- Not the same as full detail tables — smaller scope, fewer columns
- "Insert" adds row above, "Copy" duplicates current row
- Revoke may cancel all unsaved changes

---

## 23. Drawer/Slide-out Modal [V]

**Typical usage**: Payment Schedule Details, SO Details

### Characteristics
Opens as a right-side overlay drawer (not centered modal), dimming the parent page. Contains tabs with record counts in parentheses. Has close button (X) in top-right corner.

### Playwright Operation Template

```typescript
// Click row to open drawer
const row = this.page.locator('.lui-table-row').nth(0);
await row.click();

// Wait for drawer to slide in
const drawer = this.page.locator('.lui-drawer, [class*="drawer"], [class*="slide-panel"]').first();
await drawer.waitFor({ state: 'visible', timeout: 10000 });

// Switch tabs within drawer
const tab = drawer.locator('.lui-tabs-tab, [class*="tab"]', { hasText: 'Payment Detail' }).first();
await tab.click();

// Close drawer
const closeBtn = drawer.locator('.lui-drawer-close, .drawer-close, button:has-text("Close")').first();
await closeBtn.click();
// Or press Escape
await this.page.keyboard.press('Escape');
```

### Pitfalls
- Drawer slides in from right — wait for `visible` state before interacting
- Parent page is dimmed but still in DOM — scope selectors to drawer
- Tab record counts (e.g., "Payment Detail(0)") may not update immediately after actions

---

## 24. Financial Summary Cards [V]

**Typical location**: Payment Schedule Details header, SO Details overview

### Characteristics
Horizontal card layout showing key financial metrics side-by-side. Each card has a label and value. Common metrics: Receivable, Received, Uncollected, Invoiced, Uninvoiced, Order Total.

### Playwright Extraction Template

```typescript
// Extract all summary card values
const cards = this.page.locator('.summary-card, [class*="summary-card"], [class*="stat-card"]');
const count = await cards.count();
const metrics: Record<string, string> = {};
for (let i = 0; i < count; i++) {
  const label = await cards.nth(i).locator('.card-label, [class*="label"]').first().textContent();
  const value = await cards.nth(i).locator('.card-value, [class*="value"]').first().textContent();
  metrics[label.trim()] = value.trim();
}
```

### Pitfalls
- Values may be blank when no data exists (e.g., "Received Amount" is blank when none received)
- When untouched: Receivable = Uncollected = Uninvoiced = Order Total

---

## 25. Tab Record Counts [V]

**Typical usage**: SO Details tabs (Contract(1), Payment Schedule(2), Products(6))

### Characteristics
Tabs show record counts in parentheses. Count updates after CRUD operations but may have async delay.

### Playwright Verification Template

```typescript
// Wait for tab count to update
const tab = this.page.locator('.lui-tabs-tab, [class*="tab"]', { hasText: /Contract\(\d+\)/ }).first();
await tab.waitFor({ state: 'visible', timeout: 10000 });
const tabText = await tab.textContent();
const count = tabText.match(/\((\d+)\)/)?.[1]; // Extract number
```

### Pitfalls
- Count may show N but clicking tab displays "No Data" (async sync or permission issue)
- Empty state shows custom "No Data" graphic with sparkle/box icon

---

## 26. Select Product Modal (Dual-Panel) [V]

**Typical usage**: P&L Create → "+ Add Products" (Software/Hardware/Services)

### Characteristics
Modal with two-panel layout:
- **Left panel**: Search filters at top (Product Code input, Product Description input), product list/grid below with search results
- **Right panel**: "Selected (N)" header, shows items chosen for addition
- **Footer**: Cancel button, "Add N Products" button (disabled when N=0)
- Empty state: Open box illustration with "No products found" / "No products selected"

### Playwright Operation Template

```typescript
// Open the modal by clicking "+ Add Products"
const addBtn = this.page.locator('button:has-text("Add Products")').first();
await addBtn.click();

// Wait for modal
const modal = this.page.locator('.lui-modal, [class*="product-select"]').first();
await modal.waitFor({ state: 'visible', timeout: 10000 });

// Search for product
const codeInput = modal.locator('input[placeholder*="Product Code"], input[placeholder*="Code"]').first();
await codeInput.fill('BIOR');

// Wait for search results
await modal.waitForTimeout(2000);

// Select a product (click checkbox or row)
const row = modal.locator('.lui-table-row, .product-row').first();
await row.click();

// Verify "Selected" count updates
const selectedPanel = modal.locator('[class*="selected"]', { hasText: 'Selected (1)' }).first();
await selectedPanel.waitFor({ state: 'visible', timeout: 5000 });

// Confirm addition
const addProductsBtn = modal.locator('button:has-text("Add")').first();
await addProductsBtn.click();
```

### Pitfalls
- Product list may be lazy-loaded — wait for results after search
- "Add N Products" button is disabled when no items selected
- Modal title varies by category: "Select Software", "Select Hardware", etc.

---

## 27. Digital Signature Preview [V]

**Typical location**: Process Approvals sidebar (P&L, Quotation, SO)

### Characteristics
- Displays a rendered signature image (e.g., handwritten "CK")
- Below the image: "Preview | Delete" action links
- Part of the approval workflow sidebar
- Signature is shown before submission as preview

### Playwright Operation Template

```typescript
// Locate signature preview in approval sidebar
const sidebar = this.page.locator('[class*="approval"], [class*="process-approval"]').first();
const signatureImg = sidebar.locator('img[class*="signature"], [class*="signature-preview"] img').first();
await signatureImg.waitFor({ state: 'visible', timeout: 5000 });

// Click "Preview" link
const previewLink = sidebar.locator('a:has-text("Preview"), button:has-text("Preview")').first();
await previewLink.click();

// Click "Delete" link to remove signature
const deleteLink = sidebar.locator('a:has-text("Delete"), button:has-text("Delete")').first();
await deleteLink.click();
```

### Pitfalls
- Signature may not be set for all users — handle gracefully
- Preview may open in a separate modal or overlay

---

## 28. PDF Preview Modal [V]

**Typical usage**: Quotation Details → Export/Preview generated PDF

### Characteristics
- Modal overlay showing rendered PDF document
- Contains: company header, financial summary table, terms & conditions, signature blocks
- Buttons: Cancel, "Export PDF" (blue primary)
- Document shows: Total Excl Service Tax, Service Tax @ 8%, Total Amount

### Playwright Operation Template

```typescript
// Trigger PDF preview (may be a button click)
const previewBtn = this.page.locator('button:has-text("Preview"), button:has-text("PDF Preview")').first();
await previewBtn.click();

// Wait for modal
const modal = this.page.locator('.lui-modal, [class*="pdf-preview"]').first();
await modal.waitFor({ state: 'visible', timeout: 15000 });

// Verify content
const totalExcl = modal.locator('[class*="summary"]', { hasText: 'Total Excl' }).first();
await totalExcl.waitFor({ state: 'visible', timeout: 5000 });

// Export PDF
const exportBtn = modal.locator('button:has-text("Export PDF")').first();
await exportBtn.click();

// Wait for download
const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });
const download = await downloadPromise;
await download.saveAs(`/tmp/${download.suggestedFilename()}`);
```

### Pitfalls
- PDF generation may take several seconds — use extended timeout
- Download may be blocked on HTTP environments (see [[pitfall-log]] #14)
- Modal content is rendered HTML, not actual PDF — export triggers real PDF generation

---

## 29. Margin Validation Warning Icon [V]

**Typical location**: P&L Create/Details → Product table → Margin column

### Characteristics
- Red exclamation mark icon (!) displayed next to margin percentage when below Target
- Margin text colored orange/red when below target
- Green text when margin is healthy (above target)
- Target column shows the required margin percentage for comparison

### Playwright Detection Template

```typescript
// Detect margin warning on a specific row
const marginCell = table.locator('.lui-table-row').nth(N).locator('[class*="margin"]').first();
const marginText = await marginCell.textContent();
const hasWarning = await marginCell.locator('.anticon-exclamation-circle, [class*="warning-icon"]').isVisible().catch(() => false);

// Check margin color (green = OK, red/orange = below target)
const color = await marginCell.evaluate(el => window.getComputedStyle(el).color);
const isHealthy = color.includes('rgb(82, 196, 26)') || color.includes('green');
```

### Pitfalls
- Warning icon is visual-only — no tooltip or text explanation
- Margin is calculated as (Profit / Cost) × 100 which is technically Markup, not Gross Margin
- Target of 0.00% means no validation trigger

---

## 30. Badged Category Tabs [V]

**Typical location**: P&L Create → tab navigation (Overview, Software, Hardware, etc.)

### Characteristics
- Horizontal tab bar with category names
- Each tab has a blue circular badge showing item count (e.g., Software(1), Hardware(2))
- Active tab has white background, inactive tabs have light grey background
- Used for switching between product categories within a form

### Playwright Operation Template

```typescript
// Click a category tab
const tab = this.page.locator('.lui-tabs-tab, [class*="tab"]', { hasText: 'Software' }).first();
await tab.click();

// Wait for tab content to load
await page.waitForTimeout(1000);

// Verify badge count
const tabText = await tab.textContent();
const count = tabText.match(/\((\d+)\)/)?.[1]; // Extract number from "Software(1)"

// Check if tab is active
const isActive = await tab.locator('.active, .selected').isVisible().catch(() => false);
```

### Pitfalls
- Badge count may not update immediately after adding/removing items
- "Overview" tab typically shows aggregated data from all categories
- Tabs may be hidden if no items in that category

---

## #31: PDF Preview Modal

**Proven in**: PI.mp4, Quotation_v2.mp4
**Typical location**: Invoice Application Details → PDF Preview button, Quotation Details → PDF Preview

### Characteristics
- Modal overlay with document preview
- Header: "PDF Preview" with close (X) button
- Contains formatted document with company logo, recipient info, line items table, financial totals
- Footer: Cancel button, Export PDF button (blue)

### Playwright Operation Template

```typescript
// Open PDF Preview
await page.locator('button', { hasText: 'PDF Preview' }).click();
await page.waitForSelector('.modal, [class*="preview-modal"]', { state: 'visible' });

// Verify document content
const title = await page.locator('.modal h1, .modal h2', { hasText: 'Proforma Invoice' }).textContent();

// Export PDF
await page.locator('button', { hasText: 'Export PDF' }).click();

// Close modal
await page.locator('.modal .close, .modal [class*="close"]').click();
```

### Pitfalls
- PDF export may trigger browser download dialog
- Modal content may take time to render for large documents

---

## #32: Revenue Split Display (Product Info)

**Proven in**: Sales Order_v2.mp4
**Typical location**: Sales Order Create → Payment Schedule → Product Info column

### Characteristics
- Textarea field showing percentage split between product categories
- Format: "Software X% Hardware Y%" where X + Y = 100% per category across all milestones
- Used for milestone-based billing with different product mix per payment stage
- Example: Down Payment = "Software 10% Hardware 20%", Final Payment = "Software 90% Hardware 80%"

### Playwright Operation Template

```typescript
// Read Product Info value
const productInfo = await page.locator('textarea[placeholder="Please enter"]').first().inputValue();
// Parse: "Software 10% Hardware 20%"
const softwarePct = productInfo.match(/Software\s+(\d+)%/)?.[1];
const hardwarePct = productInfo.match(/Hardware\s+(\d+)%/)?.[1];

// Verify split adds up correctly across milestones
```

### Pitfalls
- Percentage validation may be server-side only
- No client-side validation visible for split percentages

---

## #33: Sales Order Statistic Bar

**Proven in**: Sales Order_v2.mp4
**Typical location**: Sales Order Details page, below header

### Characteristics
- Horizontal bar with 5 financial metrics + Order Total
- Metrics: Receivable, Received, Uncollected, Invoiced, Uninvoiced
- Order Total displayed prominently on the right
- Color-coded values (red for negative, green for positive)

### Playwright Operation Template

```typescript
// Read statistic values
const stats = await page.locator('[class*="statistic"], [class*="stat-card"]').all();
for (const stat of stats) {
  const label = await stat.locator('[class*="label"]').textContent();
  const value = await stat.locator('[class*="value"]').textContent();
  console.log(`${label}: ${value}`);
}
```

### Pitfalls
- Values may be 0 for newly created orders before financial processing

---

## #34: Detail Page Tab Bar (SO Details)

**Proven in**: Sales Order_v2.mp4
**Typical location**: Sales Order Details page

### Characteristics
- Horizontal tab bar with record count badges
- Tabs: Detail Information | Products(6) | Delivery(0) | Contract(0) | Collection Details(0) | Payment Schedule(2) | Progress Invoice(0) | Transaction Record(0) | Approval Workflow
- Numbers in parentheses indicate record count per tab
- Used to navigate between related data sections of a single record

### Playwright Operation Template

```typescript
// Click a specific tab
const tab = page.locator('.tabs-item, [class*="tab"]', { hasText: 'Payment Schedule' });
await tab.click();
await page.waitForTimeout(500);

// Read record count from badge
const tabText = await tab.textContent();
const count = tabText.match(/\((\d+)\)/)?.[1];

// Verify tab content loaded
await page.locator('[class*="tab-content"]:visible table').waitFor({ state: 'visible' });
```

### Pitfalls
- Tab with (0) count may still be clickable but show empty state
- Tab content may load asynchronously — wait for table/data to appear

---

## #35: Digital Signature Pad (Invoice Application)

**Proven in**: PI.mp4
**Typical location**: Invoice Application Create → Process Approvals sidebar

### Characteristics
- Same pattern as Quotation approval sidebar
- Canvas-based signature capture
- Shows user's initials (e.g., "CK")
- Preview and Delete links below signature
- Part of Process Approvals sidebar workflow

### Playwright Operation Template

```typescript
// Signature is auto-captured from user profile — no manual input needed
// Verify signature is present
const sigCanvas = page.locator('canvas, [class*="signature"]');
await expect(sigCanvas).toBeVisible();

// Delete signature (if needed)
await page.locator('a', { hasText: 'Delete' }).click();

// Preview signature
await page.locator('a', { hasText: 'Preview' }).click();
```

### Pitfalls
- Signature is auto-generated from user profile — cannot be manually drawn in tests
- "Preview" may open a modal or expand the signature view

---

## #36: Circulate Workflow Panel

**Proven in**: Sales Order_v2.mp4
**Typical location**: Quotation Details → Process Approval sidebar

### Characteristics
- Radio button group for operation type (Circulate selected)
- Dropdown: "Identity of the circulator" (e.g., "SMMY")
- User picker: "Circulation objects" (person icon, "Select" placeholder)
- Review Comments textarea (0/200 char limit)
- Toggle switch: "Reading opinions must be responded to"
- Submit button

### Playwright Operation Template

```typescript
// Select Circulate operation
await page.locator('input[type="radio"][value="Circulate"]').check();

// Select circulator identity
await page.locator('select, [class*="circulator-dropdown"]').selectOption('SMMY');

// Select circulation objects (user picker — opens modal)
await page.locator('[class*="circulation-objects"]').click();
await page.locator('[class*="user-picker-modal"] .confirm').click();

// Add review comments
await page.locator('textarea[placeholder*="circulation comments"]').fill('Please review');

// Toggle "must respond"
const toggle = page.locator('[class*="toggle-switch"]');
const isOn = await toggle.getAttribute('data-state') === 'true';
if (!isOn) await toggle.click();

// Submit circulation
await page.locator('button', { hasText: 'Submit' }).click();
```

### Pitfalls
- User picker modal may have different selector pattern than standard modals
- Toggle switch may use different attribute for state (data-state vs class name)
- Circulation workflow may have different approval chain than standard submission
