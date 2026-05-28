---
title: PO Entity (Purchase Order)
created: 2026-04-28
updated: 2026-04-28
type: entity
tags: [po, quote, process, test/create]
sources: [oss/PO & SO Creation.mp4]
related: [[quote]], [[so]], [[opportunity]]
---

# PO Entity (Purchase Order)

## Overview

**Module**: PO (Purchase Order / 客户采购订单)
**Parent**: Created from Opportunity or Quotation
**Entry**: Sidebar → Purchase Order, or from Opportunity detail → PO(N) sub-tab, or "Create PO" button on Opportunity

Customer Purchase Orders represent the official commercial commitment received from a client. Created before Sales Order or Contract generation.

## Business Rules (from Blueprint)

1. **Pre-requisite for SO**: PO must be captured before Sales Order or Contract can be generated
2. **Linked to winning Opportunity**: PO records are child records of a "won" Opportunity
3. **Auto-population**: System auto-fills Customer Name, Total Amount, Currency from source Quotation
4. **Manual entry required**: Customer PO Number and PO File upload are mandatory
5. **Opportunity status update**: Upon PO creation, parent Opportunity status updates to "Won" [V]
6. **Active status**: New PO records created with "Active" status [V]

## Field Registry (Video-Confirmed [V])

### Basic Information Section

| Field Label | data-tid | Required | Type | Notes |
|-------------|----------|----------|------|-------|
| PO Number | — [V] | Yes (*) | Text Input | Customer's unique PO number |
| Date | — [V] | Yes | Date Picker | PO date; auto-set to current date |
| Quotation | — [V] | Yes (*) | Lookup/Link [V] | Source quotation (e.g., "ABC Q2 Purchase Quotation") |
| Deal Category | — [V] | Yes | Dropdown [V] | e.g., PKI |
| Opportunity | — [V] | Auto | Read-Only [V] | Parent opportunity (e.g., "ABC Q2 Purchase") |
| Customer | — [V] | Auto | Read-Only [V] | Inherited from Quotation (e.g., "ABC") |
| Currency | — [V] | Auto | Read-Only [V] | Inherited from Quotation (e.g., MYR) |
| Total Amount | — [V] | Auto | Read-Only [V] | Roll-up sum from Product Details (e.g., 37,709.74) |
| PO File | — [V] | Yes (*) | File Upload [V] | Mandatory — upload scanned PO document (PDF/Image) |

### Product Details Table

| Column | data-tid | Notes |
|--------|----------|-------|
| Checkbox | — | Row selection for bulk actions |
| Sequence (Seq) | — [V] | Row numbering |
| Service Period | — [V] | e.g., "Year1" |
| Product | — [V] | Product name (e.g., "CRM", "SCMY-Test...") |
| Product Code | — [V] | Code (e.g., "crm", "SW-2323") |
| Type | — [V] | Product type (e.g., "Software") |
| Description | — [V] | Product description |
| Quantity | — [V] | Order quantity |

**Toolbar Actions**: Export, Column settings, Revoke [V]

## Workflow

```
Opportunity (Won) → Create PO → Fill PO Number + Upload File → Save (draft) → Submit (approval) → Active PO
```

### Approval Workflow (Right Sidebar)
- **Process Approvals** panel with "Track" dropdown
- **Input Processing Comments** text area
- **Common Comments** quick-insert
- **Upload attachment** for supporting documents
- **Submit** button (both header and sidebar)
- **Expand approval options** link for custom approval chain [V]

## Data Inheritance from Quotation

When a PO is created from a Quotation, the following fields auto-populate:

| Field | Source |
|-------|--------|
| Customer | Quotation → Customer |
| Opportunity | Quotation → Opportunity |
| Currency | Quotation → Currency |
| Total Amount | Quotation → Line Items sum |
| Deal Category | Quotation → Deal Category |

## PO in Opportunity Context

Opportunity detail view shows associated POs in a sub-table:
- **Serial No.** column
- **PO Number** column (e.g., 8596848) [V]

Opportunity sub-tab navigation: Details, Product(N), P&L(N), Quotation(N), **PO(N)**, Sales Order(N), Decision-Maker Map(N), Competitive Analysis [V]

## PO-to-SO Relationship

- SO's "Customer PO No." field links back to the PO record [V]
- SO inherits data from both Quotation and PO [V]
- PO is a prerequisite for SO creation [V]

## Known Bugs / Typos

None documented yet from video analysis.

## Known Issues

1. **No dedicated page object yet**: PO module is not yet implemented in the test suite.
2. **Test coverage**: 0%.
3. **data-tids not yet discovered**: All field data-tids marked as "—" pending DOM exploration.

## Language Note

Chinese labels in the PO UI are **defects**.
