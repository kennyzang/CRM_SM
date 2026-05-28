---
title: PL Entity (Profit & Loss / Price List)
created: 2026-04-22
updated: 2026-05-27
type: entity
tags: [pl, opportunity, quote, test/create, test/process]
sources: [raw/articles/business-blueprint-v1.md, oss/P&L Creation.mp4, oss/New P&L management.mp4]
related: [[opportunity]], [[quote]], [[so]], [[widget-special-controls]]
---

# PL Entity (Profit & Loss / Price List)

## Overview

**Module**: P&L (Profit & Loss) — the central pricing engine of the CRM
**Parent**: Opportunity (accessible via Opportunity detail → P&L(n) tab, or sidebar → P&L → Create)
**Create Page**: "Profit Statement Create"
**URL path**: sys-modeling/app/km-ltc

P&L calculates costs, margins, and generates quotes upon approval. It is the pricing engine; quotes are read-only views generated from approved P&Ls.

## Business Rules

1. **"Locked Pair" architecture**: P&L is the engine, quote is the view.
2. **Cost entry**: Purchase unit price entered per product line.
3. **Margin calculation**: Margin % = Expected Profit / Total Selling Price × 100
4. **Selling Price = Cost + Expected Profit** (auto-calculated)
5. **Approval workflow**: User submits → approval chain. Rejected P&Ls require revision.
6. **Version control**: Auto-generated versions. Process log tracks all changes.
7. **Multi-currency**: Supports MYR with exchange rate conversion.
8. **Products sync to Opportunity**: P&L products sync to the "Product" tab on the opportunity page (read-only there).
9. **Professional Services** use Service Master (not Product Catalog) for role-based pricing.
10. **Recurring items** flagged per line, carry to dedicated recurring tab.

## P&L Creation Process [V] — from "P&L Creation.mp4"

### Step 1: Header Form
| Field | Widget | Required | Notes |
|-------|--------|----------|-------|
| Version | Read-only | — | "Auto Generate" |
| Customer | Lookup | — | Auto-filled from Opportunity |
| Opportunity | Dropdown | Yes (*) | Links to existing opportunity |
| Currency | Dropdown | Yes (*) | e.g., MYR |
| Date | Date Picker | Yes (*) | — |
| Deal Category | Read-only | — | Auto-filled from Opportunity |

**Buttons**: Submit (blue, triggers workflow), Save (white, saves draft)

### Step 2: Product Line Items (by category tabs)
Category tabs: **Software** | **Hardware** | **Prof Service** | **Reimbursement** | **Others**

#### Software Section
- Tag: "Recurring"
- Toolbar: "+ Add rows", "Import", "More", "Revoke"
- Columns: Seq, Product (dropdown), Note, Selling Price (RM):
  - List price per unit
  - Markup percentage (default 0.00%)
  - Markup per unit
- Row actions: Insert | Copy | Delete (note: typo "Delet" in UI)

#### Hardware Section
- Tag: "Recurring"
- Toolbar: "+ Add rows", "Column settings", "Batch Delete", "Revoke"
- Columns: Seq, Cost Price:
  - Cost per unit (Converted)
  - Unit (quantity)
  - Total cost
  - Expected profit
  - Margin (%)

#### Professional Services — Two-Level Parent-Child Hierarchy
- **Level 1 (Parent): Activity Description** — Text input (e.g., "Project Implementation")
  - Aggregates costs/prices from child rows
  - Recurring? Checkbox — if checked, carries to "PS-Recurring" tab
- **Level 2 (Child): Resource Role** — Lookup from "Service Master" (e.g., "Senior Engineer", "Project Manager")
  - Auto-populates Daily Rate and Cost
  - Man Days: Number input (decimal)
  - Formula: **Man Days × Rate per Day = Total**

### Step 3: Financial Summary (Global, auto-calculated)
| Metric | Calculation |
|--------|-------------|
| Total Selling Price Sum | Sum of all line item selling prices |
| Total Cost Sum | Sum of all line item costs |
| Expected Profit | Total Selling Price - Total Cost |
| Margin (%) | Expected Profit / Total Selling Price × 100 |

### Discount Control
- Discount field: "0.00%" with toggle switch (enabled/blue)

## Approval Workflow [V]

### Right Sidebar — Process Approvals
- Comments: "Input Processing Comments" text area
- Common Comments link
- Upload attachment
- Submit button (large blue)
- Expand approval options link

### Bottom Tabs
- Process Handling | Permissions
- Sub-tabs: Approval records | Process estimation | Process status | Process Diagram | Process log | Basic Info

### Approval Records Table
- Columns: Time, Node type, Node Name, Operator, Operation, Comments
- Workflow nodes: Start Node → Drafting Node → Approval → End Node

### Status Workflow
- **Save** = draft state
- **Submit** = triggers approval workflow (Pending Approval)
- **Revoke** = cancel/withdraw

## Product List Context [V]
- Product List page accessible via sidebar → PRODUCT → Product List
- Filter tabs: All, On sale(n), Off(n), HardWare(n), Service(n), Software(n)
- Search filters: Search Title, Product Code, Product Status, Product Type, Principal in Charge, Cost Currency, Entity in Charge, Stock Level
- Grid columns: Checkbox, ID, Product Name, Product Code, Description/Spec, Category, Currency, Cost/Base Price, Selling Price
- Bulk actions: Batch Delete, Off Sale, On Sale

## Video-Confirmed Updates [V] — from "New P&L management.mp4" (2026-05-27)

### Tab Navigation (7 tabs with item count badges)
**Overview** | **Software** (badge) | **Hardware** (badge) | **Hardware Renew** (badge) | **Services** (badge) | **Reimbursement** (badge) | **Others**

### Create Page — Header Fields [V]
| Field | Widget | Required | Notes |
|-------|--------|----------|-------|
| Version | Read-only | — | "Auto Generate" |
| Customer | Lookup | — | Auto-filled from Opportunity |
| Opportunity | Lookup | Yes (*) | Links to existing opportunity |
| Currency | Dropdown | — | e.g., MYR |
| Date | Date Picker | Yes (*) | — |

### Global Discount Bar [V]
- Yellow-highlighted bar below header
- Numeric input for discount percentage (e.g., 5.00%)
- Toggle switch (ON = blue, applies discount globally)

### Financial Summary Cards [V]
Four KPI cards displayed at the top of the page:
| Card | Color | Notes |
|------|-------|-------|
| TOTAL REVENUE | Blue text | Sum of all line item prices |
| TOTAL COST | Default | Sum of all line item costs |
| TOTAL PROFIT | Green text | Revenue - Cost |
| MARGIN | Green text (or red if below target) | Calculated as (Profit / Cost) × 100 — **this is technically Markup, not Gross Margin** |

### Product Table Columns [V]
| Column | Description |
|--------|-------------|
| # | Row index with checkbox |
| CODE | Product code (auto-populated) |
| PRODUCT | Product name (from Product Master) |
| UNIT PRICE | Base selling price per unit |
| MARKUP | Markup percentage |
| DISC | Discount percentage (inherits from Global Discount) |
| PRICE | Net price after markup and discount |
| QTY | Quantity |
| TOTAL PRICE | PRICE × QTY |
| COST | Total cost for this line |
| PROFIT | TOTAL PRICE - COST (green if positive) |
| MARGIN | (PROFIT / COST) × 100 — **red warning icon if below Target** |
| TARGET | Target margin percentage for this product |

### Section Structure [V]
- **SM Products** — Internal products (Securemetric in-house)
- **3rd Party Software** — External software products
- **3rd Party Hardware** — External hardware products
- Each section has: "+ Add Products" button, data table, section footer summary

### Select Product Modal [V]
- Title: "Select Software" (or "Select Hardware" etc.)
- Search filters: Product Code (input), Product Description (input)
- Left panel: Product list with search results
- Right panel: "Selected (N)" — items chosen for addition
- Footer: Cancel, "Add N Products" (disabled when N=0)

### Professional Services — SM Team / 3rd Party Team Tables [V]
Two separate tables for internal and external service teams:

**SM Team Table Columns:**
| Column | Description |
|--------|-------------|
| # | Row index with checkbox |
| ACTIVITY | Description of work (e.g., "Flight") |
| NOTE | Additional notes |
| RATE/DAY | Selling rate per day |
| DAYS | Billable days |
| TOTAL PRICE | RATE/DAY × DAYS |
| COST RATE/DAY | Internal cost rate per day |
| DAYS (COST) | Billable cost days (separate from revenue days) |
| TOTAL COST | COST RATE/DAY × DAYS (COST) |
| PROFIT | TOTAL PRICE - TOTAL COST |
| MARGIN | Profit percentage |

**3rd Party Team Table:** Same structure, for external vendors/contractors.

### P&L Details Page [V]
- Title: "P&L Details"
- Action buttons: Edit (pencil), Delete (trash), Copy New, New Quotation
- Summary cards: TOTAL REVENUE, TOTAL COST, TOTAL PROFIT, OVERALL MARGIN
- **Multi-year breakdown table:**
  - Columns: CATEGORY | YEAR 1 | YEAR 2 (RENEW) | YEAR 3 (RENEW) | TOTAL
  - Rows: Software, Hardware, Services, Reimbursement
  - Each cell shows Revenue, Cost, Margin % (color-coded)
  - GRAND TOTAL row at bottom
- Fields below table: Entity (e.g., SMMY), Deal Category (e.g., ADSS)
- **Permissions tab:**
  - Readers: "No one can read except the author and related personnel"
  - Editors: "Administrator"
  - Attachment Download: Restricted to author and related personnel

### P&L Approval Workflow [V]
From Business Blueprint V2, page 28:
- **Trigger**: Submit the P&L form for Approval
- **Roles**: Sales Team Supervisor, System Logic
- **Conditions**:
  1. If Margin < Target → route to Sales Team Supervisor
  2. If Margin ≥ Target → check for Key Products
  3. If Key Products included → route to Sales Team Supervisor
  4. Otherwise → Auto-approve
- **Output**: P&L Status (Approved/Rejected)
- Flowchart: Start → P&L Form Submission → Margin Decision → Key Products Decision → Sales Team Supervisor → Approved? → End

### Row Actions [V]
- **Edit**: Inline edit mode
- **Renew**: Create a renewal line item (for Hardware Renew tab)
- **Delete**: Remove line item

### Cloning [V]
- URL parameter `operationCode=instanceClone` indicates P&L cloning capability
- Creates a copy of an existing P&L for modification

### Business Logic Notes [V]
1. **Margin calculation**: System uses `(Profit / Cost) × 100` which is technically **Markup**, not Gross Margin `(Profit / Revenue)`
2. **Multi-year contracts**: Hardware can span Year 1, Year 2 (RENEW), Year 3 (RENEW)
3. **Year column** in Overview table indicates multi-year projection capability
4. **Services** often have 0% margin (Revenue = Cost, pass-through billing)
5. **Reimbursement** category for expense recovery
6. **Global Discount** applies to all line items automatically when enabled
7. **Margin validation**: Red exclamation mark icon shown when line item Margin < Target

## Known Issues

1. **No dedicated page object yet**: PL module is not yet implemented in the test suite.
2. **Test coverage**: 0%.
3. **UI Typo**: "Delet" instead of "Delete" in P&L product row actions.
4. **Session expiry**: "app usage time has expired" error page observed during recording.
