---
title: P&L and Quotation User Manual (English)
created: 2026-05-27
updated: 2026-05-27
type: user-manual
tags: [pl, quote, user-manual, en]
sources: [oss/New P&L management.mp4, oss/Quotation_v2.mp4]
related: [[pl]], [[quote]], [[widget-special-controls]]
---

# P&L and Quotation User Manual

> **Version**: V1.0 | **Date**: 2026-05-27 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [P&L Module Overview](#1-pnl-module-overview)
2. [P&L Creation Process](#2-pnl-creation-process)
3. [P&L Product Category Management](#3-pnl-product-category-management)
4. [P&L Details and Multi-Year View](#4-pnl-details-and-multi-year-view)
5. [P&L Approval Workflow](#5-pnl-approval-workflow)
6. [Quotation Creation Process](#6-quotation-creation-process)
7. [Quotation Terms and Signature](#7-quotation-terms-and-signature)
8. [Quotation PDF Preview and Export](#8-quotation-pdf-preview-and-export)
9. [FAQ and Notes](#9-faq-and-notes)

---

## 1. P&L Module Overview

The P&L (Profit & Loss) module is the central pricing engine of the CRM system. It is used to calculate product costs, profit margins, and generates formal quotations (Quotation) upon approval.

### 1.1 Entry Points

- **Method 1**: Sidebar → Navigate to Opportunity Details → Click "P&L" tab → Click "Create"
- **Method 2**: Sidebar → Navigate directly to P&L module → Click "Create"

### 1.2 Core Functions

| Function | Description |
|----------|-------------|
| Cost Calculation | Enter costs and prices by product category |
| Profit Calculation | Auto-calculate total revenue, total cost, total profit, and margin |
| Multi-Year Management | Support Year 1 / Year 2 (RENEW) / Year 3 (RENEW) renewal view |
| Discount Management | Support both global discount and per-line discount |
| Approval Workflow | Auto-trigger approval workflow upon submission |
| Cloning | Copy existing P&L for quick creation |

---

## 2. P&L Creation Process

### 2.1 Basic Information

On the P&L Create page, first fill in the basic information:

![P&L Create - Basic Information](../assets/pl-035.jpg)

| Field | Description | Required |
|-------|-------------|----------|
| Version | Version number (auto-generated) | Auto |
| Customer | Customer name (auto-filled from Opportunity) | Auto |
| Opportunity | Linked opportunity | Yes (*) |
| Currency | Currency (default MYR) | Yes (*) |
| Date | Date (default today) | Yes (*) |

**Action Buttons**:
- **Save** (blue button, top right): Save as draft
- **Return** (top left): Return to list

### 2.2 Category Tab Navigation

P&L uses 7 category tabs to manage different product types:

![P&L Category Tabs](../assets/pl-065.jpg)

| Tab | Description | Badge Meaning |
|-----|-------------|---------------|
| Overview | Summary view of all categories | — |
| Software | Software products | Number of software items added |
| Hardware | Hardware products | Number of hardware items added |
| Hardware Renew | Hardware renewal products | Number of renewal items added |
| Services | Professional services | Number of service items added |
| Reimbursement | Reimbursement expenses | Number of reimbursement items added |
| Others | Other categories | Number of other items added |

Each tab displays a blue circular badge showing the item count for that category.

### 2.3 Global Discount Setting

At the top of the page is a yellow-highlighted global discount bar:

![Global Discount Setting](../assets/pl-055.jpg)

- **Discount Input**: Enter percentage value (e.g., 5.00%)
- **Toggle Switch**: Blue = enabled, grey = disabled
- **When Enabled**: All product lines automatically inherit the global discount
- **When Disabled**: Each product line requires individual discount setting

### 2.4 Financial Summary Cards

The top of the page displays four key financial metrics:

| Card Name | Description | Color |
|-----------|-------------|-------|
| Total Revenue | Total revenue (sum of all product prices) | Blue text |
| Total Cost | Total cost (sum of all product costs) | Default |
| Total Profit | Total profit (Revenue - Cost) | Green text |
| Margin | Margin percentage (Profit / Cost × 100%) | Green (healthy) / Red (below target) |

> ⚠️ **Note**: The system's "Margin" calculation is actually **Markup**, computed as `(Profit / Cost) × 100%`, not standard Gross Margin `(Profit / Revenue) × 100%`.

---

## 3. P&L Product Category Management

### 3.1 Adding Products

Under each product category, click the "+ Add Products" button to open the product selection modal:

![Add Product Modal](../assets/pl-045.jpg)

**Modal Structure**:
- **Left Panel**: Search filters (Product Code, Product Description inputs) + Product list
- **Right Panel**: "Selected (N)" — list of chosen products
- **Bottom Buttons**: Cancel, Add N Products (disabled when N=0)

### 3.2 Product Table Columns

| Column | Description | Editable |
|--------|-------------|----------|
| # | Row index with checkbox | — |
| CODE | Product code | Auto-filled |
| PRODUCT | Product name | Auto-filled |
| UNIT PRICE | Unit selling price | Editable |
| MARKUP | Markup percentage | Editable |
| DISC | Discount percentage | Editable (or inherits global) |
| PRICE | Net price after discount | Auto-calculated |
| QTY | Quantity | Editable |
| TOTAL PRICE | Total (PRICE × QTY) | Auto-calculated |
| COST | Cost | Editable |
| PROFIT | Profit (Total - Cost) | Auto-calculated |
| MARGIN | Margin percentage | Auto-calculated |
| TARGET | Target margin | System-defined |
| Actions | Action links | — |

### 3.3 Row Actions

Each product row provides three action links:

| Action | Description |
|--------|-------------|
| Edit | Opens right-side edit panel to modify product parameters |
| Renew | Creates a renewal product line (for Hardware Renew tab) |
| Delete | Removes the product line |

### 3.4 Editing Products

Click "Edit" to open the right-side edit panel:

![Edit Product Panel](../assets/pl-045.jpg)

Editable parameters:
- **Markup**: Markup percentage
- **Discount**: Discount (global or per-line)
- **Quantity**: Item quantity
- **Price Breakdown**: Price details (original, after markup, total)
- **Cost**: Cost details

Click "Save" to confirm changes, or "Cancel" to discard.

### 3.5 Professional Services (Services)

Professional services are managed through SM Team / 3rd Party Team tables:

![Edit Professional Service](../assets/pl-075.jpg)

| Column | Description |
|--------|-------------|
| ACTIVITY | Activity description (e.g., "Flight", "Senior Manager") |
| NOTE | Additional notes |
| RATE/DAY | Selling rate per day |
| DAYS | Billable days |
| TOTAL PRICE | Total (RATE/DAY × DAYS) |
| COST RATE/DAY | Internal cost rate per day |
| DAYS (COST) | Cost days (can differ from revenue days) |
| TOTAL COST | Total cost |
| PROFIT | Profit |
| MARGIN | Margin percentage |

### 3.6 Reimbursement

Click "+ Add Products" to open the "Add Reimbursement" modal:

![Add Reimbursement](../assets/pl-088.jpg)

| Field | Description |
|-------|-------------|
| Activity | Activity type (dropdown, e.g., "Flight") |
| Note | Notes |
| Rate per Day / Trip | Selling rate per day/trip |
| Day / Trip (Selling) | Number of selling billing units |
| Cost Rate per Day / Trip | Cost rate per day/trip |
| Day / Trip (Cost) | Number of cost billing units |
| Total Selling Price | Auto-calculated |
| Total Cost | Auto-calculated |
| Expected Profit | Auto-calculated |
| Margin | Auto-calculated |

### 3.7 Product Overview

On the Overview tab, you can see a summary of all products:

![P&L Product Overview](../assets/pl-025.jpg)

Each category displays a sub-total footer:
- Total Price (category total)
- Total Cost (category total cost)
- Expected Profit (category profit)
- Margin (category margin)

---

## 4. P&L Details and Multi-Year View

### 4.1 Details Page

The P&L Details page (titled "P&L Details") shows saved P&L records:

![P&L Details Page](../assets/pl-081.jpg)

**Action Buttons**:
- **Edit** (pencil icon): Enter edit mode
- **Delete** (trash icon): Delete record
- **Copy New**: Clone to create a new P&L
- **New Quotation**: Create a quotation based on this P&L

### 4.2 Multi-Year View

The details page includes a financial summary table organized by year:

| Category | YEAR 1 | YEAR 2 (RENEW) | YEAR 3 (RENEW) | TOTAL |
|----------|--------|----------------|----------------|-------|
| Software | Rev/Cost/Margin | Renewal data | Renewal data | 3-year total |
| Hardware | Rev/Cost/Margin | Renewal data | Renewal data | 3-year total |
| Services | Rev/Cost/Margin | Renewal data | Renewal data | 3-year total |
| Reimbursement | Rev/Cost/Margin | — | — | Total |
| **GRAND TOTAL** | **Year total** | **Year total** | **Year total** | **Grand total** |

Each cell shows revenue, cost, and margin percentage for that category in that year (color-coded: green = healthy).

### 4.3 Metadata Fields

Below the table:
- **Entity**: Company entity code (e.g., SMMY)
- **Deal Category**: Deal category (e.g., ADSS)

### 4.4 Permission Settings

At the bottom of the details page, there is a "Permissions" tab:

| Permission Type | Default Value |
|-----------------|---------------|
| Readers | "No one can read except the author and related personnel" |
| Editors | "Administrator" |
| Attachment Download | Restricted to author and related personnel |

---

## 5. P&L Approval Workflow

### 5.1 Right-Side Approval Panel

The right side of the P&L Create page displays the "Process Approvals" panel:

| Element | Description |
|---------|-------------|
| Track Dropdown | Select approval tracking view |
| Input Processing Comments | Approval comments text area |
| Common Comments | Quick-insert common comments |
| Upload attachment | Upload approval attachments |
| Signature Preview | Digital signature preview (shows signature image) |
| Submit | Large blue submit button |
| Expand approval options | Expand more approval options |

### 5.2 Approval Workflow Logic

P&L approval follows this logic:

```
Submit P&L → System compares Margin vs Target
    ├─ Margin < Target → Route to Sales Team Supervisor for approval
    ├─ Margin ≥ Target → Check for Key Products
    │   ├─ Key Products included → Route to Sales Team Supervisor
    │   └─ No Key Products → Auto-approve
    └─ Result: Approved / Rejected
```

### 5.3 Status Flow

| Action | Status |
|--------|--------|
| Save | Draft |
| Submit | Pending Approval |
| Revoke | Revoked |
| Approved | Approved |
| Rejected | Rejected (requires revision and resubmission) |

---

## 6. Quotation Creation Process

### 6.1 Creating from Opportunity

Quotations are created from approved P&Ls and appear as a slide-over panel on top of the Opportunity Details page:

![Create Quotation from Opportunity](../assets/quote-015.jpg)

**Creation Steps**:
1. Navigate to Opportunity Details
2. Click the "Quotation" tab
3. Click the "Create" button
4. System opens "Select record" modal to choose the P&L version to link
5. Click "Confirm" to proceed

![Select P&L Record](../assets/quote-021.jpg)

### 6.2 Quotation Basic Information

The Quotation Create panel is divided into multiple sections:

![Quotation Create Panel](../assets/quote-028.jpg)

**Header Information Section**:

| Field | Description | Required |
|-------|-------------|----------|
| Quotation Title | Quotation title (with autocomplete to prevent duplicates) | Yes (*) |
| P&L | Linked P&L number | Yes (*) |
| Attn | Contact person (dropdown) | — |
| Currency | Currency (auto-filled MYR) | — |
| Department | Department (tag selector, e.g., SMMY) | — |
| Ship Via | Shipping method (dropdown) | — |
| Term | Payment terms (e.g., "Refer to T&C") | — |

**Right Column Fields**:

| Field | Description |
|-------|-------------|
| P&L ID | Same as P&L field |
| Address | Auto-filled from customer |
| Opportunity | Parent opportunity name (read-only) |
| Sales Rep | Sales representative (auto-filled) |
| Quote Date | Quote date (auto-set to today) |

### 6.3 Customer Information (Customer Info - TO)

| Field | Description |
|-------|-------------|
| Customer | Customer name (auto-filled from P&L/Opportunity) |
| Address | Customer address (auto-filled) |
| Attn | Contact person (manual input) |
| Tel | Phone number (manual input) |
| E-Mail | Email address (manual input) |

### 6.4 Line Items and Financial Summary

Quotation auto-calculates financial data from P&L:

| Metric | Description |
|--------|-------------|
| Total Excl Tax | Total amount excluding tax |
| Service Tax | Service tax (Malaysia 8% SST) |
| Grand Total (Incl Tax) | Total including tax (Total Excl Tax + Service Tax) |

---

## 7. Quotation Terms and Signature

### 7.1 Foot Section

The bottom of the quotation contains legal terms and signature areas:

![Quotation Terms and Signature](../assets/quote-034.jpg)

#### Terms & Conditions

Uses a rich text editor with 8 pre-set items:

1. Delivery lead time (< 6 days)
2. Validity period
3. Cancellation policy (no refund of deposit)
4. Exclusion of customs duties
5. Price change rights
6. Warranty terms (<xx>)
7. Payment terms (<Payment Terms>)
8. Confidentiality clause (mentioning "Securemetric Technology Sdn Bhd")

> 💡 **Tip**: The terms contain dynamic placeholders (e.g., `<Validity>`, `<xx>`, `<Payment Terms>`) that are replaced with actual values when generating the PDF.

**Rich Text Editor Toolbar**:
- Undo / Redo
- Copy / Paste
- Font size
- Paragraph formatting
- Fullscreen expand

#### Prepared by / Approved by

| Field | Description |
|-------|-------------|
| Prepared by | "Automatically generated by the system" |
| Approved by | Auto-filled after approval |

#### Acceptance Instruction

Rich text editor with pre-set content:
> "To accept this quotation, you can sign below with a company stamps by an authorized company representative."

### 7.2 Digital Signature

In the right-side "Process Approvals" panel:
- **Signature Preview**: Displays handwritten signature image (e.g., "CK")
- **Preview**: Preview the signature
- **Delete**: Remove the signature

---

## 8. Quotation PDF Preview and Export

### 8.1 PDF Preview

From the Quotation Details page, you can preview the generated PDF:

**PDF Content Includes**:
- Company header: SECUREMETRIC TECHNOLOGY SDN. BHD. (Company Registration No.)
- Financial summary table (Total Excl Service Tax / Service Tax @ 8% / Total Amount)
- Terms & Conditions (8 items)
- Signature blocks:
  - Prepare by (Preparer signature)
  - Approved by (Approver signature)

### 8.2 Exporting PDF

In the PDF Preview modal:
- **Cancel**: Close preview
- **Export PDF** (blue primary button): Download the PDF file

After export, the browser shows a download notification in the top right:
- File name format: `ABC Q3 Purchase Quotation...`
- File size: Approximately 708 KB
- Status: Done

### 8.3 Quotation Details Page

The Quotation Details page (titled "Quotation Details") includes:

| Element | Description |
|---------|-------------|
| Tabs | Details / Quotation Details(N) / Sales Order |
| Header Information | All creation fields (read-only mode) |
| Customer Info | Customer information (read-only mode) |
| +Create More | Create more related records |

---

## 9. FAQ and Notes

### 9.1 Margin Calculation

- The system uses `(Profit / Cost) × 100%` to calculate "Margin"
- This is technically **Markup**, not Gross Margin `(Profit / Revenue) × 100%`
- When Margin < Target, a red exclamation mark warning icon is displayed

### 9.2 Multi-Year Contracts

- Hardware products can span multiple years (Year 1 / Year 2 RENEW / Year 3 RENEW)
- Renewal products are managed on the "Hardware Renew" tab
- Use the "Renew" action to create a renewal line from an existing product

### 9.3 Global Discount

- When global discount is enabled, all product lines automatically inherit the discount
- When disabled, each product line requires individual discount setting
- Discount is auto-calculated in the Price column: `Net Price = Unit Price × (1 + Markup) × (1 - Discount)`

### 9.4 Approval Trigger Conditions

After P&L submission, the following conditions require manual approval:
1. **Margin below target**: Margin < Target → Requires Sales Team Supervisor approval
2. **Key products included**: Line items contain Key Products → Requires Sales Team Supervisor approval
3. Otherwise, auto-approved

### 9.5 Cloning P&L

- Use the "Copy New" button or URL parameter `operationCode=instanceClone`
- Creates a copy of an existing P&L for quick modification

### 9.6 Permission Control

- By default, only the author and related personnel can view the P&L
- Edit permissions are limited to Administrator
- Attachment download is restricted to author and related personnel

### 9.7 Rich Text Editor

- Terms & Conditions and Acceptance Instruction use rich text editors
- Supports undo/redo, font formatting, paragraph formatting, fullscreen, etc.
- Contains dynamic placeholders that are replaced with actual values during PDF generation

### 9.8 Download Notes

- PDF downloads may be blocked by browsers on HTTP environments ("Insecure download blocked")
- Recommend using HTTPS environment or allowing browser downloads
- Excel templates have row limits; excess rows are ignored with a warning

---

> **End of Document** | Version V1.0 | 2026-05-27
