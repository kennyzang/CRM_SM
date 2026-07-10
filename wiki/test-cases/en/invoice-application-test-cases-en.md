---
title: Invoice Application Test Cases (English)
created: 2026-05-28
updated: 2026-05-28
type: test-cases
tags: [invoice-application, revenue, test-cases, en]
sources: [oss/PI.mp4]
related: [[invoice-application]]
---

# Invoice Application Test Cases

> **Module**: Invoice Application (IR) | **Version**: V1.0 | **Date**: 2026-05-28

---

## Test Case Summary

| ID | Test Name | Type | Priority | Status |
|----|-----------|------|----------|--------|
| IR-TC-001 | Navigate to Invoice Application List | Navigation | High | Not Run |
| IR-TC-002 | Create Project Type Invoice Application | Create | High | Not Run |
| IR-TC-003 | Create Milestone Type Invoice Application | Create | High | Not Run |
| IR-TC-004 | Verify Auto-Population from Sales Order | Data | Medium | Not Run |
| IR-TC-005 | Verify 8% Service Tax Calculation | Calculation | Medium | Not Run |
| IR-TC-006 | Select Payment Schedule via Modal | Interaction | High | Not Run |
| IR-TC-007 | Preview and Export PDF | Export | Medium | Not Run |
| IR-TC-008 | Submit for Approval with Digital Signature | Workflow | High | Not Run |
| IR-TC-009 | Verify Invoice Application Details View | Read | Medium | Not Run |
| IR-TC-010 | Search and Filter Invoice Applications | List | Low | Not Run |
| IR-TC-011 | Validate Required Fields | Validation | High | Not Run |
| IR-TC-012 | Save as Draft | Draft | Medium | Not Run |

---

## Detailed Test Cases

### IR-TC-001: Navigate to Invoice Application List

**Description**: Verify user can navigate to the Invoice Application list page.

**Preconditions**:
- User is logged in with appropriate permissions
- At least one Sales Order exists in the system

**Steps**:
1. Navigate to sidebar → REVENUE → Invoice Application
2. Verify the page title displays "Invoice Application"
3. Verify the data grid is visible
4. Verify the "+ Create" button is present

**Expected Results**:
- Page loads successfully
- Grid shows existing invoice applications (if any)
- Toolbar elements are visible: Search, Filter, Refresh, + Create
- Columns displayed: Serial No., Invoice Application ID, Customer PO No., Invoice Type, Milestone Type, P.I.C., Department, Modify Time

**Priority**: High

---

### IR-TC-002: Create Project Type Invoice Application

**Description**: Create a new invoice application with Project billing type.

**Preconditions**:
- A Sales Order exists with line items
- User has permission to create invoice applications

**Steps**:
1. Navigate to REVENUE → Invoice Application
2. Click "+ Create"
3. Select Invoice Type = "Project"
4. Select a Sales Order from the dropdown
5. Verify Customer PO No. is auto-populated
6. Verify Entity is auto-filled (e.g., SMMY)
7. Verify P.I.C. is auto-filled with current user
8. Verify Currency is inherited from SO (e.g., MYR)
9. Verify Date defaults to today
10. Verify Company Name is auto-filled from SO
11. Verify line items are populated from SO
12. Verify Product Sum is calculated correctly
13. Verify Service Tax @ 8% is calculated
14. Click "Submit"

**Expected Results**:
- Invoice Application Create page loads
- All mandatory fields are marked with (*)
- Customer PO No. inherits from SO
- Entity and P.I.C. auto-fill correctly
- Line items match SO products
- Tax calculations are correct
- Submission triggers approval workflow

**Priority**: High

---

### IR-TC-003: Create Milestone Type Invoice Application

**Description**: Create a new invoice application with Milestone billing type.

**Preconditions**:
- A Sales Order exists with payment schedules
- User has permission to create invoice applications

**Steps**:
1. Navigate to REVENUE → Invoice Application
2. Click "+ Create"
3. Select Invoice Type = "Milestone"
4. Select a Sales Order
5. Fill in required fields
6. In the Milestone section, click Payment Schedule ID field
7. Verify "Select record" modal opens
8. Filter by Sales Order ID
9. Select a Payment Schedule record
10. Click "Confirm"
11. Verify the milestone is populated
12. Verify Receivable % is displayed
13. Verify Invoice Amount section shows correct totals
14. Click "Submit"

**Expected Results**:
- Select record modal opens with correct filters
- Payment Schedule record can be selected
- Milestone data populates correctly
- Receivable % and amounts are calculated
- Submission succeeds

**Priority**: High

---

### IR-TC-004: Verify Auto-Population from Sales Order

**Description**: Verify that fields are correctly auto-populated when a Sales Order is selected.

**Preconditions**:
- A Sales Order exists with complete data

**Steps**:
1. Navigate to Invoice Application Create
2. Select a Sales Order
3. Verify the following fields are auto-populated:
   - Customer PO No.
   - Entity
   - Contact Person
   - Address
   - Currency
   - Opportunity
   - Company Name
   - Address (Customer section)
   - Attn
   - Email
   - Tel
   - Line items

**Expected Results**:
- All listed fields are populated from the SO
- Values match the source Sales Order exactly
- No manual input required for inherited fields

**Priority**: Medium

---

### IR-TC-005: Verify 8% Service Tax Calculation

**Description**: Verify that 8% SST is correctly calculated on invoice amounts.

**Preconditions**:
- An invoice application has line items

**Steps**:
1. Create or view an invoice application
2. Note the Total Excl Service Tax value (T)
3. Verify Service Tax = T × 0.08
4. Verify Grand Total = T + Service Tax

**Expected Results**:
- Service Tax is exactly 8% of Total Excl Tax
- Grand Total = Total Excl Tax + Service Tax
- Calculations are accurate to 2 decimal places

**Priority**: Medium

---

### IR-TC-006: Select Payment Schedule via Modal

**Description**: Verify the Select Record modal for Payment Schedule works correctly.

**Preconditions**:
- A Milestone type invoice application is being created
- Payment schedules exist for the selected SO

**Steps**:
1. In the Milestone section, click Payment Schedule ID field
2. Verify "Select record" modal opens
3. Verify filter fields are present:
   - Sales Order ID
   - Payment Type
   - Receivable amount
   - Receivable %
   - Payment Schedule ID
4. Enter filter criteria
5. Verify matching records are displayed
6. Select a record (radio button)
7. Click "Confirm"
8. Verify the selected Payment Schedule ID is populated

**Expected Results**:
- Modal opens correctly
- Filter fields function as expected
- Records are filtered correctly
- Selection populates the field
- Modal closes after Confirm

**Priority**: High

---

### IR-TC-007: Preview and Export PDF

**Description**: Verify PDF Preview and Export functionality.

**Preconditions**:
- An invoice application has been created and submitted

**Steps**:
1. Navigate to Invoice Application Details
2. Click "Export PDF" or "PDF Preview"
3. Verify PDF Preview modal opens
4. Verify document contains:
   - Company logo (SECURE METRIC TECHNOLOGY)
   - Document title: "Proforma Invoice"
   - Recipient information
   - Invoice metadata (Date, Term, Rep, Ref, PI No.)
   - Line items table
   - Financial totals
5. Click "Export PDF"
6. Verify PDF file downloads

**Expected Results**:
- PDF Preview modal displays correctly
- All document sections are present
- Financial data matches the invoice application
- PDF download completes successfully

**Priority**: Medium

---

### IR-TC-008: Submit for Approval with Digital Signature

**Description**: Verify the approval workflow submission with digital signature.

**Preconditions**:
- An invoice application form is filled and valid

**Steps**:
1. Fill in all required fields
2. Verify digital signature is visible in Process Approvals sidebar
3. Enter processing comments
4. Click "Submit" in the sidebar
5. Verify success notification

**Expected Results**:
- Digital signature is displayed (auto-captured from user profile)
- Comments field accepts input
- Submit button triggers approval workflow
- Success notification appears
- Record status changes to pending approval

**Priority**: High

---

### IR-TC-009: Verify Invoice Application Details View

**Description**: Verify the details page displays all information correctly.

**Preconditions**:
- An invoice application has been submitted

**Steps**:
1. Navigate to Invoice Application list
2. Click on an existing record
3. Verify Details page opens
4. Verify all sections are visible:
   - Basic Information
   - Header
   - Customer (TO)
   - Line Items (for Project) or Milestone (for Milestone type)
   - Invoice Amount
5. Verify all field values match the created data

**Expected Results**:
- Details page loads with all sections
- Field values are read-only and correct
- Line items match the original submission
- Financial totals are accurate

**Priority**: Medium

---

### IR-TC-010: Search and Filter Invoice Applications

**Description**: Verify search and filter functionality on the list page.

**Preconditions**:
- Multiple invoice applications exist

**Steps**:
1. Navigate to Invoice Application list
2. Enter a search term in "Search Document Title"
3. Verify filtered results
4. Click "Filter" button
5. Apply advanced filters (Invoice Type, Date range, etc.)
6. Verify filtered results
7. Clear filters
8. Verify all records are displayed

**Expected Results**:
- Search filters records by document title
- Advanced filters work correctly
- Clear filter restores full list
- Total Billing Amount updates with filtered results

**Priority**: Low

---

### IR-TC-011: Validate Required Fields

**Description**: Verify that required fields are enforced.

**Preconditions**:
- Invoice Application Create page is open

**Steps**:
1. Leave Invoice Type unselected → Click Submit
2. Verify error message
3. Leave Sales Order unselected → Click Submit
4. Verify error message
5. Leave P.I.C. empty → Click Submit
6. Verify error message
7. Leave Company Name empty → Click Submit
8. Verify error message

**Expected Results**:
- Each required field triggers a validation error
- Error messages are clear and specific
- Form cannot be submitted with missing required fields

**Priority**: High

---

### IR-TC-012: Save as Draft

**Description**: Verify the Save (draft) functionality.

**Preconditions**:
- Invoice Application Create page is open

**Steps**:
1. Fill in some fields (not all)
2. Click "Save" (not "Submit")
3. Verify draft is saved
4. Navigate back to the list
5. Verify the draft record appears
6. Open the draft record
7. Verify all entered data is preserved

**Expected Results**:
- Save button saves without triggering approval workflow
- Draft record appears in the list
- All entered data is preserved
- User can continue editing the draft later

**Priority**: Medium
