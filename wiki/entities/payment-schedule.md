---
title: Payment Schedule Module
created: 2026-04-30
updated: 2026-04-30
type: entity
tags: [so, revenue, tool/playwright]
sources: [oss/Contract & Payment Schedule.mp4, oss/Sales Order_v2.mp4]
related: [[so]], [[contract]], [[customer]]
---

# Payment Schedule Module

## Overview

Payment Schedule (PS) tracks receivables and payment milestones derived from Sales Orders. Lives under **REVENUE** sidebar section. Each SO can have multiple payment schedules (e.g. Down Payment, Progress Payment, Final Payment). Payment Schedule ID format: `PP` + `YYYYMMDD` + sequence (e.g. `PP202604270002`).

**Entry path:** Sidebar → REVENUE → Payment Schedule, or from Sales Order Details → Payment Schedule tab.

## Payment Schedule List View

### Toolbar & Filters

- **Search:** "Search Document Title" text input
- **Tab Filters:** All | Total A/R Amount(N) | Repaid Amount(N) | Total Outstanding A/R Amount(N)
- **Sort by:** Payment Schedule ID | Planned Collection Date | More
- **Actions:** Refresh | Export | Delete (trash)

### List Table Columns

| Column | Widget | Notes |
|---|---|---|
| Checkbox | Checkbox | Multi-select for bulk actions |
| Serial No. | Text | Sequential |
| Sales Order ID | Link | e.g. `SC/SO26/000005` — clickable |
| Sales Rep | Text | e.g. "Nickson" |
| Payment Status | Badge/Tag | Blue pill: "Unpaid" |
| Completion % | Numeric | e.g. 100.00%, 10.00% |
| Payment Type | Text | Progress Payment / Down Payment / Final Payment |
| Receivable % | Numeric | e.g. 50.00%, 30.00% |
| Receivable amount | Currency | e.g. 18,854.87 |
| Amount Received | Currency | e.g. 0.00, 1,000.00 |
| Amount Uncollected | Currency | Calculated field |

## Payment Schedule Details (Drawer Modal)

### Summary Row

| Field | Notes |
|---|---|
| Status | Blue pill: "Uncompleted" |
| Contract | Reference number (maps to Customer PO) |
| A/R Amount | Total receivable |
| Received Amount | Blank when none received |
| Customer Name | e.g. "ABC" |

### Detail Information Tab Fields

| Field Label | Widget | Notes |
|---|---|---|
| Customer Name | Read-only | Auto-populated |
| Sales Order ID | Link | Drills back to parent SO |
| Payment Schedule ID | Read-only | Auto-generated (PP+YYYYMMDD+seq) |
| Customer PO | Link | e.g. 8596848 |
| Payment Type | Text | Progress Payment / Down Payment / Final Payment |
| Receivable amount | Currency | Calculated |
| Receivable % | Numeric | Portion of total |
| Currency | Text | Default: MYR |
| Invoiced Amount | Currency | Tracks invoicing |
| Uninvoiced Amount | Currency | Receivable - Invoiced |
| Amount Uncollected | Currency | Receivable - Received |
| Milestone No. | Text | Currently unused (shows "-") |
| Milestone Name | Text | Currently unused (shows "-") |
| Contract Terms | Text | Currently unused (shows "-") |

### Sub-Tabs

1. **Detail Information** — Main form fields (active by default)
2. **Payment Detail(N)** — Payment records logged against schedule
3. **Billing Detail(N)** — Invoices/billing records
4. **System Record** — Audit trail

### Billing Detail Tab Columns

| Column | Notes |
|---|---|
| No | Row index |
| Billing Detail No | Billing line identifier |
| Billing Request No | Reference to billing request |
| This Billing Amount | Monetary value |
| Tax Rate | Percentage |
| Tax Amount | Calculated |
| Billing Detail Date | Date field |

## Business Rules

- Payment schedules are auto-generated from SO (e.g. 50/50 Down Payment + Progress Payment)
- Completion % drives payment type visibility — "Final Payment" shows completion %, others do not
- When no payments/invoices exist: Receivable = Uncollected = Uninvoiced = Order Total
- PM updates Completion % (0-100%) in Payment Schedule; at 100%, system alerts AM to generate PI
- Blueprint flow: Post-SO → AM creates Proforma Invoice → auto-populates from SO → validates Invoice Amount = Total SO Value → generates PI PDF

## Cross-Module Relationships

| Relationship | Notes |
|---|---|
| PS ← Sales Order | PS list shows SO ID; PS Details links back to SO |
| PS ← Contract/PO | Summary row shows "Contract" field (maps to Customer PO) |
| PS → Billing Detail | PS has "Billing Detail(N)" sub-tab |
| PS → Collection Details | Customer Details shows "Received Payment" / "Pending Collection" |
| SO → Payment Schedule(N) | SO details has Payment Schedule tab with record count |

## Pitfalls

1. **Milestone fields unused** — Milestone No., Milestone Name, Contract Terms show hyphens in current data
2. **Completion % inconsistency** — Only "Final Payment" type shows completion percentage; Down Payment and Progress Payment show none

## Video-Confirmed Updates [V] — from "Sales Order_v2.mp4" (2026-05-27)

### Payment Schedule within SO Create

When creating a Sales Order, Payment Schedule is embedded as a collapsible section:

**Milestone Type**: Dropdown with options "By Products" [V]

**Columns**:
| Column | Type | Notes |
|--------|------|-------|
| Serial No. | Auto | Row numbering |
| Milestone Name | Text Input | e.g., "Installation" |
| Payment Type | Dropdown | "Down Payment", "Progress Payment", "Final Payment" [V] |
| Job Content | Textarea | Placeholder "Input" |
| Contract Terms | Textarea | Placeholder "Input" |
| Product Info | Textarea | Revenue split by product type |
| Operation | Links | Insert \| Copy \| Delete |

**Product Info Split Logic** [V]:
- Shows revenue distribution across product categories per milestone
- Example: "Software 10% Hardware 20%" for Down Payment
- Remaining: "Software 90% Hardware 80%" for Final Payment
- Percentages for each category sum to 100% across milestones

### Payment Schedule Details Page — Additional Fields [V]

| Field | Notes |
|-------|-------|
| Completion % | Editable via "Change Completion %" button |
| Start Date | Date field |
| Planned Collection Date | Date field |
| Remind before | Days before due date |
| Project Status | Text |
| Project Manager | User Lookup |
| Creator | Auto-filled |
| Create Time | Auto-filled |
| Modifier | Auto-filled |
| Last modified time | Auto-filled |
| Status | Badge: "Unlock" |

**Action Buttons**: Edit (pencil), Change Completion %, Expand, Close

### Select Record Modal (from Invoice Application) [V]

When selecting a Payment Schedule for Invoice Application (Milestone type):

**Filter Fields**:
- Sales Order ID (Dropdown)
- Payment Type (Text Input)
- Receivable amount (Number Input)
- Receivable % (Number Input)
- Payment Schedule ID (Text Input)

**Grid Columns**:
- Serial No. (radio selection)
- Payment Schedule ID (e.g., PP202605270004)
- Milestone Name (e.g., "Installation")
- fd_milestone_product (e.g., "Software 10% Hardware 20%")
- Job Content

### Sidebar Navigation [V]

REVENUE section order:
1. Payment Schedule
2. Invoice Application
3. Milestone Invoice
4. Customer Payment
5. Collection Details
