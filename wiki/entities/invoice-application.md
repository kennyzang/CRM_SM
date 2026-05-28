---
title: Invoice Application Entity
created: 2026-05-28
updated: 2026-05-28
type: entity
tags: [invoice-application, revenue, process, test/create]
sources: [oss/PI.mp4]
related: [[so]], [[payment-schedule]], [[widget-special-controls]]
---

# Invoice Application Entity (IR)

## Overview

**Module**: Invoice Application (IR) — post-sales revenue collection workflow
**Entry**: Sidebar → REVENUE → Invoice Application
**Create Page**: "Invoice Application Create"
**URL path**: `sys-modeling/app/km-ltc/add/...`
**ID Format**: `IRYYYYMMDDNNNN` (e.g., IR202605270004)

Invoice Applications are used to request invoice generation based on Sales Orders, with two billing models: **Project** (full-value invoicing) and **Milestone** (progress billing against payment schedules).

## Sidebar Context [V]

The **REVENUE** section in the sidebar contains:
- Payment Schedule
- **Invoice Application** (current module)
- Milestone Invoice
- Customer Payment
- Collection Details

## Field Registry (Video-Confirmed [V])

### List Page

| Column | Type | Notes |
|--------|------|-------|
| Serial No. | Auto | Row numbering |
| Invoice Application ID | Text | e.g., IR202605270004 |
| Customer PO No. | Text | e.g., 8596848 |
| Invoice Type | Badge | Project / Milestone |
| Milestone Type | Text | By Products / By Percentage / - |
| P.I.C. | Text | Person In Charge |
| Department | Text | e.g., SMMY |
| Modify Time | Text | Empty for new records |

**Toolbar**: Search Document Title, All tab, Total Billing Amount summary, Sort by Create Time/Last modified time, Refresh, Filter, + Create

### Create Page — Basic Information Section

| Field Label | data-tid | Required | Widget | Notes |
|-------------|----------|----------|--------|-------|
| Invoice Type | — [V] | Yes (*) | Radio Group | Project / Milestone |
| Invoice Application ID | — [V] | Auto | Read-Only | "Auto Generate" |
| Sales Order | — [V] | Yes (*) | Dropdown/Lookup | Source SO (e.g., SM/SO26/000002) |
| Customer PO No. | — [V] | No | Text Input | Defaults to "-" or inherited from SO |
| Entity | — [V] | Yes | Tag Selector | e.g., SMMY (removable chip) |
| Contact Person | — [V] | No | Dropdown/Lookup | Linked to SO customer |
| Address | — [V] | No | Dropdown/Lookup | Auto-filled from Contact Person |
| P.I.C. | — [V] | Yes (*) | User Lookup/Tag | Auto-filled with current user |
| SP | — [V] | No | Text Input | e.g., "YCK" |
| Currency | — [V] | Auto | Read-Only | Inherited from SO (e.g., MYR) |
| Opportunity | — [V] | No | Dropdown/Lookup | Parent opportunity |
| Attachment | — [V] | No | File Upload | "Upload the attachment" button |
| Remarks | — [V] | No | Textarea | Placeholder "Input" |

### Create Page — Header Section

| Field Label | data-tid | Required | Widget | Notes |
|-------------|----------|----------|--------|-------|
| PI No. | — [V] | Auto | Read-Only | "Auto Generate" |
| Ref No. | — [V] | Auto | Read-Only | "Auto Generate" |
| Date | — [V] | Yes | Date Picker | Defaults to today |

### Create Page — Customer (TO) Section

| Field Label | data-tid | Required | Widget | Notes |
|-------------|----------|----------|--------|-------|
| Company Name | — [V] | Yes (*) | Dropdown/Lookup | e.g., "Elite Enterprise Solutions Sendirian Berhad" |
| Address | — [V] | No | Text Input | Pre-filled from customer record |
| Attn | — [V] | No | Text Input | Contact person name |
| Email | — [V] | No | Text Input | Customer email |
| Tel | — [V] | No | Text Input | Customer phone |

### Create Page — Line Items Section (Project Type)

| Column | Type | Notes |
|--------|------|-------|
| Seq | Auto | Row numbering |
| Service Period | Text | e.g., "Year1" |
| Product | Text | Product name from SO |
| Product Code | Text | e.g., "BIOR502-B4" |
| Description | Text | Product description |
| Quantity | Number | Auto-filled from SO |
| Unit Price | Number | Auto-filled from SO |
| Total Excl Service Tax | Calculated | Qty × Unit Price |
| Service Tax @ 8% | Calculated | Auto-calculated |
| Total Incl Service Tax | Calculated | Auto-calculated |

**Toolbar**: Export, Column settings, Revoke

### Create Page — Milestone Section (Milestone Type)

| Column | Type | Notes |
|--------|------|-------|
| Seq | Auto | Row numbering |
| Milestone Name | Text | e.g., "Installation" |
| Receivable % | Number | Percentage of total |
| Invoice under Approval | Number | Amount currently in approval |
| Uninvoiced Amount | Number | Amount not yet invoiced [V] (UI typo: "Univoiced") |
| Payment Schedule ID | Dropdown/Lookup | Opens "Select record" modal |
| Operation | Links | Insert \| Copy \| Delete |

### Create Page — Invoice Amount Section

| Field | Type | Notes |
|-------|------|-------|
| Total Excl Tax | Calculated | Sum of line items |
| Service Tax | Calculated | 8% SST |
| Grand Total | Calculated | Total Incl Tax |

### Details Page

| Field | Notes |
|-------|-------|
| Invoice Type | e.g., "Milestone" |
| Sales Order | e.g., "SM/SO26/000002" |
| Customer PO No. | e.g., "8596848-xx" |
| Contact Person | e.g., "Nur Binti Hassan" |
| P.I.C. | e.g., "CK" |
| Currency | e.g., "MYR" |
| PI No. | e.g., "SM260003-1" |
| Date | e.g., "05/27/2026" |

### PDF Preview Modal

| Element | Notes |
|---------|-------|
| Document Title | "Proforma Invoice" |
| Company Logo | SECURE METRIC TECHNOLOGY |
| Recipient Block | Company, Address, Attn, Tel, Email |
| Invoice Metadata | Date, Term, Rep, Ref, PI No. |
| Line Items Table | No, Item Code, Item Description, Qty, Unit Price (MYR), Total Excl Service Tax, Service Tax @ 8%, Total Incl Service Tax |
| Totals | Total (Exclusive of Service Tax), Service Tax @ 8%, Total (Inclusive of Service Tax) |
| Terms & Conditions | Rich text section |
| Buttons | Cancel, Export PDF |

### Process Approvals Sidebar

| Element | Notes |
|---------|-------|
| Track | Dropdown for workflow actions |
| Comments | "Input Processing Comments" textarea |
| Common Comments | Quick-insert link |
| Upload attachment | File upload |
| Electronic signature | Digital signature pad |
| Signature Actions | Preview \| Delete |
| Submit | Large blue button |
| Expand approval options | Link |

## Business Rules

1. **Two Invoice Types**: Project (full-value) vs Milestone (progress billing) [V]
2. **Auto-Generated IDs**: Invoice Application ID, PI No., Ref No. are system-generated [V]
3. **SO Dependency**: Sales Order must be selected; inherits Customer, Currency, line items [V]
4. **Service Tax**: 8% SST applied automatically [V]
5. **Milestone Billing**: When Invoice Type = "Milestone", user selects from Payment Schedule records [V]
6. **Milestone Types**: "By Products" or "By Percentage" [V]
7. **Select Record Modal**: For milestone invoices, opens a lookup modal filtered by Sales Order ID [V]
8. **PDF Export**: Proforma Invoice can be previewed and exported as PDF [V]
9. **Approval Workflow**: Submit triggers BPM approval chain with digital signature [V]
10. **Product Line Items**: Auto-populated from Sales Order; includes service period (Year1, etc.) [V]

## Workflow

```
Sales Order → Invoice Application Create → Select Invoice Type → Fill Details
       ↓
  Project Type: Line items auto-filled from SO → Submit
       ↓
  Milestone Type: Select Payment Schedule → Define milestone → Submit
       ↓
  Approval Workflow → Invoice Generation → Customer Payment
```

## Select Record Modal (Milestone Type) [V]

When selecting a Payment Schedule ID in Milestone mode:

**Filter Fields**:
- Sales Order ID (Dropdown)
- Payment Type (Text Input)
- Receivable amount (Number Input)
- Receivable % (Number Input)
- Payment Schedule ID (Text Input)

**Grid Columns**:
- Serial No. (radio button for selection)
- Payment Schedule ID (e.g., PP202605270004)
- Milestone Name (e.g., "Installation")
- fd_milestone_product (e.g., "Software 10% Hardware 20%")
- Job Content

**Actions**: Confirm, Cancel

## Known Issues

1. **No dedicated page object yet**: Invoice Application module is not yet implemented in the test suite.
2. **Test coverage**: 0%.
3. **data-tids not yet discovered**: All field data-tids marked as "—" pending DOM exploration.
4. **UI Typo**: "Univoiced Amount" should be "Uninvoiced Amount" [V].

## Language Note

Chinese labels in the Invoice Application UI are **defects**.
