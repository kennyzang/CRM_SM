---
title: SO Entity (Sales Order)
created: 2026-04-22
updated: 2026-06-09
type: entity
tags: [so, quote, process, test/create]
sources: [raw/articles/business-blueprint-v1.md, oss/PO & SO Creation.mp4, oss/Sales Order_v2.mp4, oss/Contract & Payment Schedule.mp4]
related: [[quote]], [[pl]], [[customer]], [[po]]
---

# SO Entity (Sales Order)

## Overview

**Module**: SO (Sales Order)
**Parent**: Generated from approved Quotation
**Entry**: Sidebar -> SALES ORDER, or from Opportunity detail -> Sales Order(N) sub-tab

Sales Orders represent confirmed customer orders, linked to payment milestones and delivery. Created from Quotation with auto-populated commercial details.

## Field Registry (Video-Confirmed [V])

### Order Header Section

| Field Label | data-tid | Required | Type | Notes |
|-------------|----------|----------|------|-------|
| Sales Order ID | -- [V] | Auto | Auto Generate | System-assigned on submission |
| SO No. | -- [V] | Auto | Read-Only | Shows "-" until generated |
| Entity | -- [V] | Yes | Tag Selector | e.g., SCMY; triggers Entity Code + Department auto-fill |
| Entity Code | -- [V] | Auto | Read-Only | Auto-filled from Entity (e.g., "SC") |
| Sales Rep | -- [V] | Yes | User Lookup | e.g., Affendi |
| Department | -- [V] | Auto | Read-Only | Auto-filled from Entity (e.g., "SCMY") |
| Quotation | -- [V] | Yes | Lookup/Link | Source quotation (e.g., "ABC Q2 Purchase Quotation") |
| Opportunity | -- [V] | Auto | Read-Only Link | Parent opportunity (e.g., "ABC Q2 Purchase") |
| Customer PO No. | -- [V] | Yes (*) | Text Input | Mandatory customer PO number |
| P.O. Date | -- [V] | Yes | Date Picker | Customer PO date |
| Currency | -- [V] | Auto | Read-Only | Inherited from Quotation (e.g., MYR) |
| Order Date | -- [V] | Yes (*) | Date Picker | Mandatory; defaults to PO Date or today |
| Terms | -- [V] | No | Text Area | Payment/delivery terms |
| Delivery Date | -- [V] | No | Date Picker | Placeholder "Select Date" |
| Ship Via | -- [V] | No | Dropdown | Shipping method (see Ship Via options from quote) |
| Project Manager | -- [V] | No | User Lookup | Placeholder "Select" |
| Order Amount | -- [V] | Auto | Read-Only | Calculated from line items (e.g., 37,709.74) |
| Deal Category | -- [V] | Yes | Dropdown | e.g., PKI |

### Bill To Section

| Field Label | data-tid | Required | Type | Notes |
|-------------|----------|----------|------|-------|
| Customer Name | -- [V] | Auto | Read-Only | Inherited from Quotation (e.g., "ABC") |
| Address Details | -- [V] | Yes | Lookup/Select [V] | Opens address selection modal |

### Product Sum

| Field | Notes |
|-------|-------|
| Product Sum | -- [V] | Auto-calculated total from line items (e.g., 37,709.74) |

### Payment Schedule Table

| Column | data-tid | Required | Type | Notes |
|--------|----------|----------|------|-------|
| Checkbox | -- | -- | Row selection | Bulk actions |
| Sequence (Seq) | -- | -- | Auto | Row numbering |
| Name | -- [V] | Yes | Text Input | Milestone name (e.g., "Payment", "Installation") |
| Contract Terms | -- [V] | No | Text Input | Placeholder "Input" |
| Receivable % | -- [V] | Yes (*) | Number Input with Spinner | Percentage (e.g., 50.00%) |
| Receivable Amount | -- [V] | Auto | Calculated | Product Sum x Receivable % |
| Payment Type | -- [V] | Yes (*) | Dropdown | e.g., "Progress Payment" |
| Operation | -- | -- | Inline Actions | Insert | Copy | Delete [V] |

**Toolbar Actions**: + Add rows, Import, More, Revoke [V]
**Total Amount**: Footer row confirms total matches Product Sum [V]

### Excel Export Section

| Field | Notes |
|-------|-------|
| Original | Upload attachment button |
| VDP template | Upload attachment button |
| Export Excel | Button -- "Only view mode" when read-only [V] |

### Footer / Approval Section

| Field Label | data-tid | Required | Type | Notes |
|-------------|----------|----------|------|-------|
| Prepared by | -- [V] | Auto | Read-Only | Auto-filled (e.g., "Affendi") |
| Verified by | -- [V] | Yes | User Lookup | Dropdown with user icon, "Select" placeholder |

### VDP Section

| Field Label | data-tid | Required | Type | Notes |
|-------------|----------|----------|------|-------|
| Customer | -- [V] | No | Text Input | Placeholder "Input" |
| Address | -- [V] | No | Text Input | Placeholder "Input" |
| Attn Name | -- [V] | No | Text Input | Placeholder "Input" |
| Date VDP | -- [V] | No | Date Input | Placeholder "Input" |

## Business Rules

1. **Quote-to-Order flow**: SO is created from approved Quotation with auto-populated commercial details [V]
2. **Data inheritance**: Customer Name, Opportunity, Currency, Order Amount auto-filled from Quotation [V]
3. **Entity auto-fill**: Selecting Entity auto-populates Entity Code and Department [V]
4. **Customer PO mandatory**: Customer PO No. is required before submission [V]
5. **Milestone-driven invoicing**: Payment Schedule defines payment milestones, not date-driven [V]
6. **PM confirmation required**: Project Manager must confirm 100% milestone completion before invoice can be issued [V]
7. **Prevents premature billing**: No invoice until milestones confirmed [V]
8. **Split payment support**: System auto-calculates Receivable Amount from percentage (e.g., 50% x 37,709.74 = 18,854.87) [V]

## Milestone-Driven Settlement

```
PO Received -> Order Entered -> Proforma Invoice -> Delivery
                                                  |
                                    PM confirms 100% completion
                                                  |
                                         Milestone Invoice Issued
```

### Payment Type Options
- **Progress Payment** [V] -- Confirmed from video
- Other types likely available (dropdown, not fully explored)

## Workflow

```
Quotation (approved) -> Sales Order Create -> Save (draft) -> Submit (approval) -> Verified -> Active SO
```

### Approval Workflow (Right Sidebar)
- **Process Approvals** panel with "Track" dropdown
- **Input Processing Comments** text area
- **Common Comments** quick-insert
- **Upload attachment** for supporting documents (PO file)
- **Submit** button (both header and sidebar)
- **Expand approval options** link for custom approval chain [V]

## Data Lineage (Full Pipeline)

```
Lead -> Contact -> Customer -> Opportunity -> P&L -> Quotation -> PO -> Sales Order
```

Each stage inherits data from the previous:
- **PO** inherits from Quotation: Customer, Opportunity, Currency, Total Amount [V]
- **SO** inherits from Quotation: Customer, Opportunity, Currency, Order Amount, Deal Category [V]
- **SO** also links to PO via Customer PO No. field [V]

## Blueprint vs User Manual Differences

| Dimension | User Manual (Standard) | Blueprint (Custom) |
|-----------|----------------------|-------------------|
| Settlement | Date-driven | Milestone-driven |
| PO Capture | Manual entry | Linked to Quotation, auto-populated |

## Known Issues

1. **No dedicated page object yet**: SO module is not yet implemented in the test suite.
2. **Test coverage**: 0%.
3. **data-tids not yet discovered**: All field data-tids marked as "--" pending DOM exploration.

## Language Note

Chinese labels in the SO UI are **defects**.

## Test Cases from Excel (2026-06-05)

| TC ID | Title | Priority | Status |
|-------|-------|----------|--------|
| TC-022 | SO Payment Schedule - Revenue Split Logic | P1 | Not Tested |
| TC-023 | SO Details - Statistic Bar and 9-Tab Navigation | P2 | Not Tested |
| TC-024 | Permission - Non-Owner Editing Payment Schedule (Known Bug Regression) | P1 | Not Tested |

## Video-Confirmed Updates [V] -- from "Sales Order_v2.mp4" (2026-05-27)

### SO List View

| Column | Notes |
|--------|-------|
| Serial No. | Row numbering |
| Sales Order ID | e.g., SM/SO26/000003 |
| Milestone Type | Badge |
| Sales Rep | User name |
| Order Date | Date |
| Delivery Date | Date |
| Customer Name | Company name |
| Customer PO No. | Customer PO reference |
| Document Status | Badge |
| Quotation | Link to source quotation |

**Toolbar**: Search Document Title, All tab, Total SO Amount summary, Sort by Order Date/Sales Order ID/More, Refresh, Filter, + Create

**Sidebar Navigation**: SALES ORDER -> Sales Order | SO Product | Contract | Delivery

### SO Details Page -- Header

| Field | Notes |
|-------|-------|
| Order ID | e.g., SM/SO26/000003 |
| Customer | e.g., Elite Enterprise Solutions Sendirian Berhad |
| P.I.C. | e.g., CK |
| Department | e.g., SMMY |
| Order Date | e.g., 2026-05-27 |

### Sales Order Statistic Bar

| Metric | Notes |
|--------|-------|
| Receivable | Amount owed |
| Received | Amount collected |
| Uncollected | Outstanding balance |
| Invoiced | Amount invoiced |
| Uninvoiced | Amount not yet invoiced |
| Order Total | e.g., 25,277.40 |

### Details Page Tabs

| Tab | Count | Notes |
|-----|-------|-------|
| Detail Information | -- | General SO info |
| Products | (6) | Line items grid |
| Delivery | (0) | Delivery records |
| Contract | (0) | Contract documents |
| Collection Details | (0) | Logistics/pickup |
| Payment Schedule | (2) | Financial milestones |
| Progress Invoice | (0) | Billing records |
| Transaction Record | (0) | Bank/payment logs |
| Approval Workflow | -- | Sign-off chain |

### Payment Schedule -- Create Mode

**Milestone Type Dropdown**: By Products [V]

**Toolbar**: + Add rows, Import, More, Revoke [V]

**Columns**:
| Column | Type | Notes |
|--------|------|-------|
| Serial No. | Auto | Row numbering |
| Milestone Name | Text Input | e.g., "Installation" |
| Payment Type | Dropdown | e.g., "Down Payment" [V] |
| Job Content | Textarea | Placeholder "Input" |
| Contract Terms | Textarea | Placeholder "Input" |
| Product Info | Textarea | e.g., "Software 10% Hardware 20%" [V] |
| Operation | Links | Insert | Copy | Delete |

**Split Payment Logic**: Product Info shows revenue split between Software/Hardware percentages that sum to 100% [V]:
- Row 1 (Down Payment): Software 10% + Hardware 20%
- Row 2 (Final Payment): Software 90% + Hardware 80%

### SO Create Page -- Additional Fields Confirmed [V]

| Field | Widget | Notes |
|-------|--------|-------|
| Attn | Dropdown/Lookup | "Select" placeholder |
| Terms | Textarea | Payment/delivery terms |
| Ship Via | Dropdown | Shipping method |
| Project Manager | User Lookup | "Select" placeholder |
| Order Amount | Read-Only | Auto-calculated (e.g., 25,277.40) |
| Deal Category | Dropdown | e.g., "ADSS" [V] |

### Payment Schedule Details Page

| Field | Type | Notes |
|-------|------|-------|
| Status | Badge | "Uncompleted" (blue) [V] |
| Contract | Link | Customer PO number (e.g., 8596848) [V] |
| A/R Amount | Currency | e.g., 18,854.87 [V] |
| Received Amount | Currency | Blank when not received [V] |
| Customer Name | Link | e.g., "ABC" [V] |
| Payment Schedule ID | Text | e.g., PP202604270002 [V] |
| Sales Order ID | Link | e.g., SC/SO26/000005 [V] |
| Customer PO | Link | e.g., 8596848 [V] |
| Milestone No. | Text | "-" when empty [V] |
| Milestone Name | Text | "-" when empty [V] |
| Receivable amount | Currency | e.g., 18,854.87 [V] |
| Receivable % | Percentage | e.g., 50.00% [V] |
| Payment Type | Text | "Progress Payment" [V] |
| Contract Terms | Text | "-" when empty [V] |
| Currency | Text | MYR [V] |
| Invoiced Amount | Currency | e.g., 0.00 [V] |
| Uninvoiced Amount | Currency | Calculated: Receivable - Invoiced [V] |
| Amount Uncollected | Currency | Calculated [V] |
| Completion % | Number | Placeholder "-" |
| Start Date | Date | Placeholder "-" |
| Planned Collection Date | Date | Placeholder "-" |
| Remind before | Number | Days before due date |
| Payment Status | Badge | "Unpaid" (blue) [V] |
| Project Status | Text | Placeholder "-" |
| Project Manager | User Lookup | Placeholder "-" |
| Sales Rep | Text | e.g., CK |
| Department | Text | e.g., SMMY |
| Remarks | Text | Placeholder "-" |
| Attachment | File | Placeholder "-" |

**Tabs**: Detail Information | Payment Detail(0) | Billing Detail(0) | System Record [V]

**System Information** (collapsible):
- Creator, Create Time, Modifier, Last modified time, Status (Unlock)

**Action Buttons**: Edit (pencil icon), Change Completion %, Expand, Close [V]

**Financial Calculation Logic** [V]:
- `Receivable amount` = Order Total x Receivable % (e.g., 37,709.74 x 50% = 18,854.87)
- `Uninvoiced Amount` = Receivable amount - Invoiced Amount
- `Amount Uncollected` = Uninvoiced Amount (when no payment received)
- Status = "Uncompleted" when Received Amount is empty/zero

### Quotation Circulate Workflow [V]

From Quotation Details page:
- **Operation**: Radio button -> "Circulate"
- **Identity of the circulator**: Dropdown (e.g., "SMMY")
- **Circulation objects**: User picker ("Select" with person icon)
- **Review Comments**: Textarea (0/200 characters)
- **Upload attachment**: File upload button
- **Toggle switch**: "Reading opinions must be responded to" (On/Off)
- **Submit**: Triggers circulation workflow
