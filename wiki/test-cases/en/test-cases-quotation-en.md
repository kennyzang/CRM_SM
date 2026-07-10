---
title: Quotation Test Cases (English)
created: 2026-05-27
updated: 2026-05-27
type: test-cases
tags: [quote, test-cases, en]
sources: [oss/Quotation_v2.mp4, wiki/entities/en/quote-en.md]
related: [[quote]], [[pl]], [[opportunity]]
---

# Quotation Module Test Cases

> **Version**: V1.0 | **Date**: 2026-05-27 | **Module**: Quotation | **Total Cases**: 28

---

## Test Case Summary

| Category | Count | Status |
|----------|-------|--------|
| Creation & Basic Info | 6 | ✅ |
| Customer Information | 3 | ✅ |
| Financial & Tax Calculation | 4 | ✅ |
| Terms & Signature | 5 | ✅ |
| Approval Workflow | 4 | ✅ |
| PDF Preview & Export | 3 | ✅ |
| Details & Navigation | 3 | ✅ |

---

## 1. Creation & Basic Information (6 Cases)

### QTN-TC-001: Create Quotation from Opportunity

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | 1. User is logged into CRM system<br>2. An approved P&L record exists<br>3. P&L's linked Opportunity exists |
| **Test Steps** | 1. Navigate to Opportunity Details page<br>2. Click the "Quotation" tab<br>3. Click the "Create" button<br>4. Verify "Select record" modal opens<br>5. Select the P&L version to link<br>6. Click "Confirm" button |
| **Expected Results** | - "Select record" modal opens successfully<br>- Available P&L versions are listed<br>- Selection and "Confirm" succeed<br>- Quotation Create slide-over panel opens |

---

### QTN-TC-002: Verify Quotation Basic Info Auto-Population

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. Verify Quotation Title is editable<br>2. Verify P&L field shows correct P&L number<br>3. Verify Currency shows "MYR"<br>4. Verify Department shows correct department (e.g., "SMMY")<br>5. Verify Opportunity shows parent opportunity name (read-only)<br>6. Verify Sales Rep is auto-filled<br>7. Verify Quote Date is auto-set to today |
| **Expected Results** | - All fields auto-populate correctly<br>- P&L number matches selected version<br>- Opportunity is read-only, shows parent opportunity name<br>- Quote Date is today's date |

---

### QTN-TC-003: Edit Quotation Title

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. Enter title in Quotation Title input<br>2. Verify autocomplete suggestions appear while typing<br>3. Enter a title similar to existing quotation<br>4. Verify autocomplete shows numbered variants (e.g., "...Quotation2", "...Quotation3") |
| **Expected Results** | - Quotation Title is editable<br>- Autocomplete works correctly<br>- When entering similar title, system suggests numbered variants to prevent duplicates |

---

### QTN-TC-004: Set Ship Via

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 - Low |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. Click Ship Via dropdown<br>2. Verify multiple shipping options are available<br>3. Select "Express Shipping"<br>4. Verify selection is saved successfully |
| **Expected Results** | - Ship Via dropdown contains multiple options<br>- Selection saves successfully<br>- Options include at least: Standard Shipping, Express Shipping, Overnight Shipping, Priority Shipping, Economy Shipping, Air Shipping, Ground Shipping |

---

### QTN-TC-005: Set Term

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 - Low |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. Enter "Refer to T&C" in Term input<br>2. Verify input saves successfully |
| **Expected Results** | - Term field is editable<br>- Input saves successfully |

---

### QTN-TC-006: Save Quotation Draft

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | Quotation Create panel is open, basic info is filled |
| **Test Steps** | 1. Fill all required fields<br>2. Click "Save" button<br>3. Verify save succeeds<br>4. Verify "Operation succeeded" toast appears<br>5. Verify Quotation status is Draft |
| **Expected Results** | - Save succeeds<br>- "Operation succeeded" toast appears<br>- Quotation status is Draft |

---

## 2. Customer Information (3 Cases)

### QTN-TC-007: Verify Customer Info Auto-Population

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. Verify Customer field shows correct customer name<br>2. Verify Address field shows correct customer address<br>3. Verify customer info auto-populates from P&L/Opportunity |
| **Expected Results** | - Customer shows correct customer name (e.g., "Elite Enterprise Solutions Sendirian Berhad")<br>- Address shows correct address (e.g., "Lot 20, Jalan Sultan, 80000 Johor Bahru, Johor, Malaysia") |

---

### QTN-TC-008: Edit Customer Contact Info

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. Enter contact name in Attn input (e.g., "Nur Binti Hassan")<br>2. Enter phone number in Tel input (e.g., "017-6457719")<br>3. Enter email in E-Mail input (e.g., "chen.lim@gmail.com")<br>4. Verify all inputs save successfully |
| **Expected Results** | - Attn, Tel, E-Mail fields are editable<br>- Inputs save successfully<br>- Format validation (e.g., email format) works correctly |

---

### QTN-TC-009: Customer Address Modification

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 - Low |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. Modify Address field content<br>2. Verify modification saves successfully<br>3. Verify modification does not affect original customer record's address |
| **Expected Results** | - Address is editable<br>- Modification saves successfully<br>- Only affects current quotation, not original customer record |

---

## 3. Financial & Tax Calculation (4 Cases)

### QTN-TC-010: Verify Financial Summary Accuracy

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | Quotation Create panel is open, contains line items |
| **Test Steps** | 1. Record Total Excl Tax value<br>2. Record Service Tax value<br>3. Record Grand Total (Incl Tax) value<br>4. Verify Grand Total = Total Excl Tax + Service Tax<br>5. Verify Service Tax = Total Excl Tax × 8% |
| **Expected Results** | - All financial metrics calculate accurately<br>- Grand Total = Total Excl Tax + Service Tax<br>- Service Tax = Total Excl Tax × 0.08 (8% SST) |

---

### QTN-TC-011: Service Tax Calculation Verification

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. View Service Tax value<br>2. Manually calculate Total Excl Tax × 0.08<br>3. Verify it matches system's Service Tax<br>4. Example: Total Excl Tax = 23,405.00, Service Tax = 1,872.40 |
| **Expected Results** | - Service Tax calculates accurately<br>- 23,405.00 × 0.08 = 1,872.40<br>- Malaysia 8% SST rate correctly applied |

---

### QTN-TC-012: Line Items Data Verification

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | Quotation Create panel is open, contains line items |
| **Test Steps** | 1. View Line Items section<br>2. Verify includes columns: Service Period, Product Name, Product Code, Description, Unit Price, Disc, etc.<br>3. Verify line item data auto-populates correctly from P&L<br>4. Verify prices and quantities match P&L |
| **Expected Results** | - Line Items section correctly shows all columns<br>- Line item data auto-populates correctly from P&L<br>- Prices and quantities match P&L |

---

### QTN-TC-013: Global Service Setting

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 - Low |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. View Global Service dropdown in Line Items section<br>2. Select a service option<br>3. Verify selection applies successfully |
| **Expected Results** | - Global Service dropdown works correctly<br>- Selection applies to all line items |

---

## 4. Terms & Signature (5 Cases)

### QTN-TC-014: Edit Terms & Conditions

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. Scroll to Foot section<br>2. View pre-set content in Terms & Conditions rich text editor<br>3. Verify contains 8 pre-set items<br>4. Modify one item's content<br>5. Use toolbar formatting (font size, paragraph format, etc.)<br>6. Verify modification saves successfully |
| **Expected Results** | - Terms & Conditions shows 8 pre-set items<br>- Rich text editor toolbar works correctly<br>- Modification saves successfully<br>- Character count displays correctly |

---

### QTN-TC-015: Verify Placeholder Replacement

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. View placeholders in Terms & Conditions (e.g., `<Validity>`, `<xx>`, `<Payment Terms>`)<br>2. Generate PDF preview<br>3. Verify placeholders are replaced with actual values |
| **Expected Results** | - Placeholders are replaced with actual values when generating PDF<br>- `<Validity>` replaced with actual validity period<br>- `<xx>` replaced with actual warranty period<br>- `<Payment Terms>` replaced with actual payment terms |

---

### QTN-TC-016: Edit Acceptance Instruction

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. View pre-set content in Acceptance Instruction rich text editor<br>2. Modify content<br>3. Use toolbar formatting<br>4. Verify modification saves successfully |
| **Expected Results** | - Acceptance Instruction shows pre-set content<br>- Rich text editor works correctly<br>- Modification saves successfully |

---

### QTN-TC-017: Verify Prepared by Auto-Generation

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. View Prepared by field<br>2. Verify shows "Automatically generated by the system"<br>3. Verify field is non-editable |
| **Expected Results** | - Prepared by shows "Automatically generated by the system"<br>- Field is read-only, cannot be edited |

---

### QTN-TC-018: Digital Signature Function

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. View Signature Preview in "Process Approvals" panel<br>2. Verify shows signature image (e.g., "CK")<br>3. Click "Preview" to preview signature<br>4. Click "Delete" to remove signature<br>5. Verify signature is deleted successfully |
| **Expected Results** | - Signature Preview correctly shows signature image<br>- Preview function works<br>- Delete function works, signature deleted successfully |

---

## 5. Approval Workflow (4 Cases)

### QTN-TC-019: Submit Quotation for Approval

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | Quotation Create panel is open, all required fields are filled |
| **Test Steps** | 1. Enter approval comments in "Process Approvals" panel<br>2. Click "Submit" button<br>3. Verify confirmation prompt appears<br>4. Confirm submission<br>5. Verify Quotation status changes to "Pending Approval" |
| **Expected Results** | - Submission succeeds<br>- Quotation status changes to "Pending Approval"<br>- Approval workflow starts |

---

### QTN-TC-020: Approval Comments Function

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. Enter comments in "Input Processing Comments"<br>2. Click "Common Comments" to insert common comments<br>3. Verify comments inserted successfully<br>4. Click "Upload attachment" to upload file<br>5. Verify attachment uploads successfully |
| **Expected Results** | - Comments entered successfully<br>- Common comments inserted successfully<br>- Attachment uploaded successfully |

---

### QTN-TC-021: Expand Approval Options

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 - Low |
| **Preconditions** | Quotation Create panel is open |
| **Test Steps** | 1. Click "Expand approval options"<br>2. Verify more approval options expand<br>3. View available approval configurations |
| **Expected Results** | - Approval options expand successfully<br>- More approval configuration options are displayed |

---

### QTN-TC-022: Approval Tracking

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | Quotation is submitted, status is "Pending Approval" |
| **Test Steps** | 1. Click "Track" dropdown in "Process Approvals" panel<br>2. Select approval tracking view<br>3. Verify approval progress and current node are displayed |
| **Expected Results** | - Approval tracking works correctly<br>- Approval progress and current node are displayed<br>- Can view historical approval records |

---

## 6. PDF Preview & Export (3 Cases)

### QTN-TC-023: PDF Preview

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | Quotation Details page is open |
| **Test Steps** | 1. Trigger PDF preview from Quotation Details page<br>2. Verify PDF Preview modal opens<br>3. Verify company header is shown (SECUREMETRIC TECHNOLOGY SDN. BHD.)<br>4. Verify financial summary table is shown (Total Excl Service Tax / Service Tax @ 8% / Total Amount)<br>5. Verify Terms & Conditions are shown (8 items)<br>6. Verify signature blocks are shown (Prepare by / Approved by) |
| **Expected Results** | - PDF Preview modal opens successfully<br>- Company header displays correctly<br>- Financial summary table displays correctly<br>- Terms & Conditions display correctly<br>- Signature blocks display correctly |

---

### QTN-TC-024: Export PDF

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | PDF Preview modal is open |
| **Test Steps** | 1. Click "Export PDF" button<br>2. Wait for PDF generation<br>3. Verify browser download notification appears in top right<br>4. Verify file name format is correct (e.g., "ABC Q3 Purchase Quotation...")<br>5. Verify file status shows "Done" |
| **Expected Results** | - PDF generates successfully<br>- Download notification appears<br>- File name format is correct<br>- File size approximately 708 KB<br>- Status shows "Done" |

---

### QTN-TC-025: PDF Content Verification

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | PDF is exported and downloaded |
| **Test Steps** | 1. Open downloaded PDF file<br>2. Verify company header and registration number are correct<br>3. Verify financial data matches Quotation<br>4. Verify Terms & Conditions are complete<br>5. Verify signature blocks display correctly<br>6. Verify placeholders are replaced with actual values |
| **Expected Results** | - PDF content is complete and accurate<br>- Company header and registration number are correct<br>- Financial data matches Quotation<br>- Terms & Conditions are complete<br>- Signature blocks display correctly<br>- Placeholders are replaced with actual values |

---

## 7. Details & Navigation (3 Cases)

### QTN-TC-026: View Quotation Details

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 - High |
| **Preconditions** | Saved Quotation record exists |
| **Test Steps** | 1. Navigate to Quotation Details page<br>2. Verify page title is "Quotation Details"<br>3. Verify shows Details / Quotation Details(N) / Sales Order tabs<br>4. Verify all fields are in read-only mode<br>5. Verify Header Information displays correctly<br>6. Verify Customer Info displays correctly |
| **Expected Results** | - Details page correctly displays all Quotation information<br>- All fields are in read-only mode<br>- Tab navigation works correctly |

---

### QTN-TC-027: Create More Related Records

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | Quotation Details page is open |
| **Test Steps** | 1. Click "+Create More" button<br>2. Verify can create more related records<br>3. Verify new records are linked to original Quotation |
| **Expected Results** | - "+Create More" function works correctly<br>- Can create related records<br>- New records correctly link to original Quotation |

---

### QTN-TC-028: Create Sales Order from Quotation

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 - Medium |
| **Preconditions** | Quotation Details page is open, Quotation is approved |
| **Test Steps** | 1. Click "Sales Order" tab<br>2. Verify can create Sales Order<br>3. Verify Sales Order auto-populates data from Quotation |
| **Expected Results** | - Can create Sales Order from Quotation<br>- Sales Order auto-populates data from Quotation<br>- Data inheritance chain is correct |

---

## Appendix: Test Data Preparation

| Data Type | Example Value | Description |
|-----------|---------------|-------------|
| Customer Name | Elite Enterprise Solutions Sendirian Berhad | Malaysian private limited company |
| Opportunity Name | ABC Q3 Purchase | Example opportunity |
| P&L Number | 2026052700008 | Example P&L number |
| Contact Person | Nur Binti Hassan | Example contact |
| Phone | 017-6457719 | Example phone number |
| Email | chen.lim@gmail.com | Example email |
| Address | Lot 20, Jalan Sultan, 80000 Johor Bahru, Johor, Malaysia | Example address |
| Sales Rep | YCK | Example sales representative |
| Department | SMMY | Securemetric Malaysia |
| Shipping Method | Express Shipping | Example shipping method |
| Payment Terms | Refer to T&C | Example payment terms |

---

> **End of Document** | Version V1.0 | 2026-05-27 | Total Cases: 28
