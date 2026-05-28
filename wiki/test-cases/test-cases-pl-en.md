---
title: P&L Test Cases (English)
created: 2026-05-27
updated: 2026-05-27
type: test-cases
tags: [pl, test-cases, en]
sources: [oss/New P&L management.mp4, wiki/entities/pl.md]
related: [[pl]], [[opportunity]]
---

# P&L Module Test Cases

> **Version**: V1.0 | **Date**: 2026-05-27 | **Module**: P&L (Profit & Loss) | **Total Cases**: 32

---

## Test Case Summary

| Category | Count | Status |
|----------|-------|--------|
| Creation & Basic Info | 6 | ✅ |
| Product Management | 8 | ✅ |
| Discount & Financial Calculation | 5 | ✅ |
| Multi-Year Management | 4 | ✅ |
| Approval Workflow | 4 | ✅ |
| Details & Cloning | 3 | ✅ |
| Permission Control | 2 | ✅ |

---

## 1. Creation & Basic Information (6 Cases)

### P&L-TC-001: Create P&L from Opportunity

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | 1. User is logged into CRM system<br>2. An Opportunity exists (e.g., "ABC Q3 Purchase")<br>3. Opportunity status is Qualifying or higher |
| **Test Steps** | 1. Navigate to Opportunity Details page<br>2. Click the "P&L" tab<br>3. Click the "Create" button<br>4. Verify page navigates to P&L Create page<br>5. Verify Customer field is auto-filled with the Opportunity's customer name<br>6. Verify Opportunity field is auto-linked to the current opportunity |
| **Expected Results** | - P&L Create page opens successfully<br>- Customer field shows correct customer name (e.g., "Elite Enterprise Solutions Sendirian Berhad")<br>- Opportunity field shows "ABC Q3 Purchase"<br>- Currency defaults to "MYR"<br>- Date defaults to today's date |
| **Test Data** | Opportunity Code: BSOP202605260001 |

---

### P&L-TC-002: Fill P&L Basic Information

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | P&L Create page is open |
| **Test Steps** | 1. Verify Version field shows "Auto Generate"<br>2. Verify Currency dropdown allows selecting different currencies<br>3. Click Date field, select a different date<br>4. Verify Opportunity field is read-only (non-editable)<br>5. Verify Customer field is read-only (non-editable) |
| **Expected Results** | - Version is read-only, showing "Auto Generate"<br>- Currency dropdown includes multiple currency options (at least MYR)<br>- Date can be changed to other dates<br>- Opportunity and Customer are read-only, cannot be modified |

---

### P&L-TC-003: Save P&L Draft

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | P&L Create page is open, basic info is filled |
| **Test Steps** | 1. Do not add any products<br>2. Click "Save" button (top right)<br>3. Wait for save to complete<br>4. Verify success toast "Operation succeeded" appears<br>5. Verify page navigates to P&L Details page |
| **Expected Results** | - Save succeeds, shows "Operation succeeded" toast<br>- Page navigates to P&L Details page<br>- P&L status is Draft |

---

### P&L-TC-004: Return Action

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Create page is open |
| **Test Steps** | 1. Click "Return" button (top left)<br>2. Verify page returns to Opportunity Details page |
| **Expected Results** | - Page successfully returns to Opportunity Details page<br>- Unsaved draft is not lost (if previously saved) |

---

### P&L-TC-005: Verify Required Fields

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Create page is open |
| **Test Steps** | 1. Clear or modify Opportunity field (if editable)<br>2. Attempt to save P&L<br>3. Verify system displays required field validation errors |
| **Expected Results** | - Required fields (Opportunity, Currency, Date) have red asterisk (*) markers<br>- If required fields are missing, validation error is shown on save<br>- Validation error includes "Form validation anomaly, total of N items" |

---

### P&L-TC-006: Multi-Currency Support

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Create page is open |
| **Test Steps** | 1. Click Currency dropdown<br>2. Select a non-MYR currency (e.g., USD, SGD)<br>3. Add a product<br>4. Verify product price is displayed in selected currency |
| **Expected Results** | - Currency dropdown includes multiple currency options<br>- Product price is displayed in selected currency<br>- Financial summary cards show correct currency symbol |

---

## 2. Product Management (8 Cases)

### P&L-TC-007: Add Software Product

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | P&L Create page is open |
| **Test Steps** | 1. Click "Software" tab<br>2. Click "+ Add Products" button<br>3. Verify "Select Software" modal opens<br>4. Enter search keyword in Product Code input<br>5. Enter search keyword in Product Description input<br>6. Select a product from search results<br>7. Verify right panel "Selected (N)" updates<br>8. Click "Add N Products" button<br>9. Verify product is added to the table |
| **Expected Results** | - "Select Software" modal opens successfully<br>- Modal includes Product Code and Product Description search filters<br>- Left panel shows search results<br>- Right panel "Selected (N)" shows selected count<br>- "Add N Products" button is disabled when nothing selected, enabled after selection<br>- Product is successfully added to table, showing CODE, PRODUCT, UNIT PRICE, etc. |

---

### P&L-TC-008: Add Hardware Product

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | P&L Create page is open |
| **Test Steps** | 1. Click "Hardware" tab<br>2. Click "+ Add Products" button<br>3. Search and select hardware product in modal<br>4. Click "Add N Products" button<br>5. Verify product is added to table<br>6. Verify Hardware tab badge number increases |
| **Expected Results** | - Hardware product is successfully added to table<br>- Hardware tab badge number increases from 0 to 1 (or corresponding count)<br>- Product row shows all columns: CODE, PRODUCT, UNIT PRICE, MARKUP, DISC, PRICE, QTY, TOTAL PRICE, COST, PROFIT, MARGIN, TARGET |

---

### P&L-TC-009: Edit Product

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | P&L Create page is open, at least one product is added |
| **Test Steps** | 1. Click "Edit" link on product row<br>2. Verify right-side edit panel opens<br>3. Modify Markup value to 5.00%<br>4. Modify Quantity value to 2<br>5. Click "Save" button<br>6. Verify corresponding product row data updates in table |
| **Expected Results** | - Edit panel opens successfully, showing product type, code, price settings, etc.<br>- After Markup modification, Price column auto-updates<br>- After Quantity modification, Total Price column auto-updates (Unit Price × Quantity)<br>- Table data updates in real-time after save |

---

### P&L-TC-010: Delete Product

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Create page is open, at least one product is added |
| **Test Steps** | 1. Click "Delete" link on product row<br>2. Verify product row is removed from table<br>3. Verify corresponding tab badge number decreases |
| **Expected Results** | - Product row is successfully removed from table<br>- Tab badge number decreases accordingly<br>- Financial summary cards auto-recalculate |

---

### P&L-TC-011: Add Professional Service

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Create page is open |
| **Test Steps** | 1. Click "Services" tab<br>2. Click "+ Add Products" button<br>3. In "Add Service" modal, select activity type (e.g., "Senior Manager")<br>4. Set Man Day to 3<br>5. Verify Price Breakdown auto-calculates<br>6. Click "Save" button<br>7. Verify service is added to table |
| **Expected Results** | - Service product is successfully added to table<br>- Total Price = Unit Price × Man Days<br>- Total Cost = Cost × Man Days<br>- Profit = Total Price - Total Cost |

---

### P&L-TC-012: Add Reimbursement

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 - Low |
| **Preconditions** | P&L Create page is open |
| **Test Steps** | 1. Click "Reimbursement" tab<br>2. Click "+ Add Products" button<br>3. In "Add Reimbursement" modal, select Activity (e.g., "Flight")<br>4. Set Rate per Day / Trip to 400<br>5. Set Day / Trip (Selling) to 1<br>6. Verify Total Selling Price auto-calculates to 400<br>7. Click "Save" button |
| **Expected Results** | - Reimbursement is successfully added to table<br>- Total Selling Price = Rate per Day × Day / Trip (Selling)<br>- If Cost Rate is 0, Total Cost is 0, Expected Profit equals Total Selling Price |

---

### P&L-TC-013: Create Renewal Product

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Create page is open, at least one hardware product is added |
| **Test Steps** | 1. Click "Renew" link on hardware product row<br>2. Verify new row is created under "Hardware Renew" tab<br>3. Verify new row inherits original product's CODE and PRODUCT<br>4. Modify new row's quantity and price |
| **Expected Results** | - "Renew" action creates new row under Hardware Renew tab<br>- New row inherits original product's basic information<br>- New row can independently set quantity, price, and cost<br>- Hardware Renew tab badge number increases |

---

### P&L-TC-014: Product Search and Selection

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Create page is open |
| **Test Steps** | 1. Click "+ Add Products" to open product selection modal<br>2. Enter "BIOR" in Product Code input<br>3. Wait for search results to load<br>4. Verify left panel shows matching products<br>5. Select one product<br>6. Verify right panel shows "Selected (1)"<br>7. Search for different keyword<br>8. Select another product<br>9. Verify right panel shows "Selected (2)"<br>10. Click "Add 2 Products" button |
| **Expected Results** | - Search function works correctly, returns matching product list<br>- Can select multiple products<br>- Right panel updates selected count in real-time<br>- "Add N Products" button enables based on selected count<br>- All selected products are added to table |

---

## 3. Discount & Financial Calculation (5 Cases)

### P&L-TC-015: Enable Global Discount

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | P&L Create page is open, at least one product is added |
| **Test Steps** | 1. Enter 5.00% in global discount bar<br>2. Ensure toggle is enabled (blue)<br>3. Verify all product rows show 5.00% in DISC column<br>4. Verify all product rows' PRICE columns auto-update<br>5. Verify financial summary cards recalculate |
| **Expected Results** | - Global discount is successfully applied to all product rows<br>- Each product's PRICE = UNIT PRICE × (1 + MARKUP) × (1 - DISC)<br>- Total Revenue, Total Profit, Margin auto-recalculate |

---

### P&L-TC-016: Disable Global Discount

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Create page is open, global discount is enabled |
| **Test Steps** | 1. Click global discount toggle to switch to disabled state<br>2. Verify all product rows' DISC columns revert to 0.00% or per-line settings<br>3. Verify financial summary cards recalculate |
| **Expected Results** | - After disabling global discount, product rows no longer inherit it<br>- If per-line discount was set previously, it is retained<br>- Financial data recalculates |

---

### P&L-TC-017: Margin Validation

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Create page is open, at least one product is added |
| **Test Steps** | 1. View MARGIN and TARGET columns in product row<br>2. If MARGIN < TARGET, verify red exclamation mark icon is shown<br>3. If MARGIN ≥ TARGET, verify green text is shown<br>4. Adjust product price or cost to change MARGIN<br>5. Verify icon and color update in real-time |
| **Expected Results** | - When MARGIN < TARGET, red exclamation mark warning icon is shown<br>- When MARGIN ≥ TARGET, green text is shown<br>- Margin calculation formula: (PROFIT / COST) × 100% |

---

### P&L-TC-018: Financial Summary Accuracy

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | P&L Create page is open, multiple products are added |
| **Test Steps** | 1. Record each product row's TOTAL PRICE and COST<br>2. Calculate sum of all TOTAL PRICE values<br>3. Calculate sum of all COST values<br>4. Verify Total Revenue = sum of all TOTAL PRICE<br>5. Verify Total Cost = sum of all COST<br>6. Verify Total Profit = Total Revenue - Total Cost<br>7. Verify Margin = (Total Profit / Total Cost) × 100% |
| **Expected Results** | - All financial metrics are calculated accurately<br>- Total Revenue, Total Cost, Total Profit, Margin match manual calculations |

---

### P&L-TC-019: Margin Calculation Method Verification

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Create page is open, products are added |
| **Test Steps** | 1. Select a product row, record its PROFIT and COST values<br>2. Manually calculate (PROFIT / COST) × 100%<br>3. Verify it matches the MARGIN column value<br>4. Manually calculate (PROFIT / TOTAL PRICE) × 100% (standard gross margin)<br>5. Verify it differs from the MARGIN column value |
| **Expected Results** | - System uses (PROFIT / COST) × 100% to calculate Margin (Markup)<br>- Differs from standard gross margin (PROFIT / TOTAL PRICE) × 100%<br>- This is documented as known behavior |

---

## 4. Multi-Year Management (4 Cases)

### P&L-TC-020: View Multi-Year View

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Details page is open, P&L record contains multi-year data |
| **Test Steps** | 1. View multi-year view on P&L Details page<br>2. Verify table contains YEAR 1, YEAR 2 (RENEW), YEAR 3 (RENEW), TOTAL columns<br>3. Verify each row contains CATEGORY (Software, Hardware, Services, Reimbursement)<br>4. Verify each cell shows revenue, cost, margin percentage |
| **Expected Results** | - Multi-year view displays correctly<br>- Columns include YEAR 1, YEAR 2 (RENEW), YEAR 3 (RENEW), TOTAL<br>- Rows include all product categories<br>- GRAND TOTAL row shows annual totals |

---

### P&L-TC-021: Renewal Product Display

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Details page is open, contains renewal products |
| **Test Steps** | 1. View YEAR 2 (RENEW) column in multi-year view<br>2. Verify Hardware row shows renewal data<br>3. Verify Services row shows renewal data (if any)<br>4. Verify Reimbursement row shows empty or — in renewal years |
| **Expected Results** | - Hardware renewal data correctly displays in YEAR 2 (RENEW) and YEAR 3 (RENEW) columns<br>- Reimbursement typically only shows in Year 1<br>- Renewal data matches what was entered on Create page |

---

### P&L-TC-022: Annual Total Calculation

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Details page is open, contains multi-year data |
| **Test Steps** | 1. Record revenue and cost for YEAR 1, YEAR 2 (RENEW), YEAR 3 (RENEW)<br>2. Verify TOTAL column = YEAR 1 + YEAR 2 + YEAR 3<br>3. Verify GRAND TOTAL row = sum of all categories |
| **Expected Results** | - TOTAL column correctly calculates three-year sum<br>- GRAND TOTAL row correctly calculates sum of all categories<br>- Margin recalculates based on totals |

---

### P&L-TC-023: Multi-Year Color Coding

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 - Low |
| **Preconditions** | P&L Details page is open, contains multi-year data |
| **Test Steps** | 1. View margin percentage display in multi-year view<br>2. Verify healthy margins display in green<br>3. Verify below-target margins display in red or orange |
| **Expected Results** | - Margin color coding is correct<br>- Green indicates healthy (at or above target)<br>- Red/orange indicates below target |

---

## 5. Approval Workflow (4 Cases)

### P&L-TC-024: Submit P&L for Approval

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | P&L Create page is open, at least one product is added |
| **Test Steps** | 1. Ensure all required fields are filled<br>2. Enter approval comments in "Process Approvals" panel<br>3. Click "Submit" button<br>4. Verify confirmation prompt appears<br>5. Confirm submission<br>6. Verify P&L status changes to "Pending Approval" |
| **Expected Results** | - Submission succeeds, P&L status changes to "Pending Approval"<br>- Approval workflow routes based on Margin vs Target logic<br>- If Margin < Target or Key Products included, routes to Sales Team Supervisor |

---

### P&L-TC-025: Approval Trigger Conditions

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Create page is open |
| **Test Steps** | **Scenario A: Margin below target**<br>1. Set products so Margin < Target<br>2. Submit P&L<br>3. Verify approval routes to Sales Team Supervisor<br><br>**Scenario B: Margin above target**<br>1. Set products so Margin ≥ Target<br>2. Submit P&L<br>3. Verify auto-approval<br><br>**Scenario C: Key products included**<br>1. Add Key Product<br>2. Even if Margin ≥ Target, submit P&L<br>3. Verify approval routes to Sales Team Supervisor |
| **Expected Results** | - Scenario A: Requires Sales Team Supervisor approval<br>- Scenario B: Auto-approved<br>- Scenario C: Even if margin meets target, still requires Sales Team Supervisor approval |

---

### P&L-TC-026: Revoke P&L

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L is submitted, status is "Pending Approval" |
| **Test Steps** | 1. Open P&L Details page<br>2. Click "Revoke" button<br>3. Verify P&L status changes to "Revoked"<br>4. Verify can re-edit and resubmit |
| **Expected Results** | - Revocation succeeds, status changes to "Revoked"<br>- Can re-edit P&L and submit again |

---

### P&L-TC-027: Approval Comments and Signature

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 - Low |
| **Preconditions** | P&L Create page is open |
| **Test Steps** | 1. Enter comments in "Input Processing Comments" in "Process Approvals" panel<br>2. Click "Common Comments" to insert common comments<br>3. Click "Upload attachment" to upload file<br>4. Verify Signature Preview shows signature image<br>5. Click "Preview" to preview signature<br>6. Click "Delete" to remove signature |
| **Expected Results** | - Comments entered successfully<br>- Common comments inserted successfully<br>- Attachment uploaded successfully<br>- Signature preview displays correctly<br>- Signature preview and delete functions work correctly |

---

## 6. Details & Cloning (3 Cases)

### P&L-TC-028: View P&L Details

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | Saved P&L record exists |
| **Test Steps** | 1. Navigate to P&L Details page<br>2. Verify page title is "P&L Details"<br>3. Verify all product information displays (read-only mode)<br>4. Verify financial summary cards display correctly<br>5. Verify multi-year view (if applicable)<br>6. Verify Entity and Deal Category fields display correctly |
| **Expected Results** | - Details page correctly displays all P&L information<br>- All fields are in read-only mode<br>- Financial data matches creation time |

---

### P&L-TC-029: Clone P&L

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Details page is open |
| **Test Steps** | 1. Click "Copy New" button<br>2. Verify page navigates to new P&L Create page<br>3. Verify new P&L copies all products from original<br>4. Verify Version shows "Auto Generate" (new number)<br>5. Modify some content and save |
| **Expected Results** | - Clone succeeds, new P&L contains all products from original<br>- Version auto-generates new number<br>- Can modify and save as new record |

---

### P&L-TC-030: Create Quotation from P&L

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Details page is open, P&L is approved |
| **Test Steps** | 1. Click "New Quotation" button<br>2. Verify Quotation Create panel opens<br>3. Verify Quotation auto-populates products and financial data from P&L<br>4. Verify Quotation Title is editable |
| **Expected Results** | - Quotation Create panel opens successfully<br>- Products and financial data auto-populate from P&L<br>- Quotation can be further edited and submitted |

---

## 7. Permission Control (2 Cases)

### P&L-TC-031: View Permissions

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | P&L Details page is open |
| **Test Steps** | 1. Click "Permissions" tab at bottom of details page<br>2. Verify Readers shows "No one can read except the author and related personnel"<br>3. Verify Editors shows "Administrator"<br>4. Verify Attachment Download shows restrictions |
| **Expected Results** | - Permission settings display correctly<br>- Default permissions meet security requirements |

---

### P&L-TC-032: Edit Permission Verification

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | User is logged in (non-Administrator role) |
| **Test Steps** | 1. Attempt to edit P&L created by another user<br>2. Verify system denies edit operation<br>3. Verify insufficient permission message is shown |
| **Expected Results** | - Non-Administrator users cannot edit P&L created by others<br>- System shows insufficient permission message |

---

## Appendix: Test Data Preparation

| Data Type | Example Value | Description |
|-----------|---------------|-------------|
| Customer Name | Elite Enterprise Solutions Sendirian Berhad | Malaysian private limited company |
| Opportunity Name | ABC Q3 Purchase | Example opportunity |
| Software Product | BIOR502-B4 FINGERPRINT READER | Example product |
| Hardware Product | ATALLA BACKUP OPERATOR SMARTCARD PACK V4 | Example product |
| Service Product | Senior Manager | Professional service role |
| Reimbursement Type | Flight | Reimbursement activity type |
| Currency | MYR | Malaysian Ringgit |
| Entity Code | SMMY | Securemetric Malaysia |
| Deal Category | ADSS | Example deal category |

---

> **End of Document** | Version V1.0 | 2026-05-27 | Total Cases: 32
