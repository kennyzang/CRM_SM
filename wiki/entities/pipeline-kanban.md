---
title: Pipeline Kanban Entity
created: 2026-06-04
updated: 2026-06-04
type: entity
tags: [pipeline, kanban, opportunity, dashboard, test/list]
sources: [doc/Securemetric CRM_new features.docx, raw-frames/new-features-docx/image1.png]
related: [[opportunity]], [[lead]], [[so]], [[po]], [[quote]], [[widget-special-controls]]
---

# Pipeline Kanban Entity

## Overview

**Module**: CRM Pipeline (Pipeline Kanban Dashboard)
**Entry**: Sidebar → CRM → Pipeline
**URL path**: TBD (needs schema generation)

A single-page dashboard that gives every team member an at-a-glance view of where their own projects stand across the full sales cycle. Displays all active deals in a table view with a stage summary bar at the top.

> **Note**: Despite being called "Kanban" in the feature name, the actual UI is a **List/Table view** with a stage summary bar at the top — not a card-based Kanban board with drag-and-drop columns.

## Pipeline Stage Definition

The CRM uses a **6-stage pipeline** (confirmed from screenshot):

| Stage | Position | Color | Description |
|-------|----------|-------|-------------|
| **LEAD** | 1 | Blue | Initial lead captured |
| **OPPORTUNITY** | 2 | Blue | Lead qualified, opportunity created |
| **QUOTATION** | 3 | Blue | Quotation generated from approved P&L |
| **PO** | 4 | Blue | Purchase Order received from customer |
| **SALES ORDER** | 5 | Blue | Sales Order created internally |
| **PAYMENT** | 6 | Green | Payment received / deal closed |

> ⚠️ **Note**: The DOCX description mentions 5 stages (Lead → Opportunity → PO → SO → Payment), but the actual UI shows **6 stages** with QUOTATION as a separate stage between OPPORTUNITY and PO.

## Page Layout

### 1. Pipeline Summary Bar (Top Section)

![Pipeline Summary Bar](../assets/pipeline-kanban-001.png)

Six stage tiles displayed horizontally, each showing:
- **Stage name** (e.g., LEAD, OPPORTUNITY)
- **Deal count** (number of active projects at this stage)
- **Pipeline value** in branch default currency (e.g., MYR)

**Example data** (from screenshot):

| Stage | Count | Value (MYR) |
|-------|-------|-------------|
| LEAD | 3 | 102,915.13 |
| OPPORTUNITY | 0 | 0 |
| QUOTATION | 1 | 430,650 |
| PO | 1 | 430,650 |
| SALES ORDER | 2 | 861,300 |
| PAYMENT | 12 | 695,211 |

**Interaction**: Clicking any tile filters the project list below to show only projects at that stage. A "Reset" button restores the full view.

### 2. Filter Bar

| Filter | Type | Options |
|--------|------|---------|
| **TIME** | Toggle buttons | This Year / This Month (default) / Custom |
| **ENTITY** | Dropdown | All / specific entities |
| **REP** | Dropdown | All / specific sales reps |
| **Reset** | Button | Clears all filters |

### 3. Summary Line

Text format: `Showing **N** deals • Pipeline **MYR X,XXX,XXX.XX**`

### 4. Pipeline Deals Table

| Column | Description |
|--------|-------------|
| **Project** | Project/customer name (clickable → navigates to detail page) |
| **Amount** | Deal value in branch default currency |
| **Rep** | Assigned sales representative (e.g., YCK) |
| **Pipeline Stage** | Visual dot-track progress indicator + stage name tag |

**Dot-track progress indicator**: A horizontal row of dots representing the 6 stages. Filled dots = completed stages, highlighted ring = current stage, empty dots = future stages. The stage name is shown as a tag at the end.

## Business Rules

1. **Currency consistency**: All monetary amounts display in the branch's default currency — no currency conversion or mixed currencies are shown.
2. **Stage filtering**: Clicking a stage tile filters the list; Reset restores full view.
3. **Navigation**: Clicking any project row navigates directly to that project's full detail page.
4. **Search**: Search bar at top-right allows real-time filtering by project name, rep name, or record ID.
5. **Time-based filtering**: Supports This Year / This Month / Custom date range.
6. **Entity/Rep filtering**: Can scope pipeline to specific entity or sales rep.

## UI Elements (Video-Confirmed [V])

### Top Navigation
- Logo: SECURE METRIC TECHNOLOGY
- CRM dropdown
- To-do (with notification badge)
- To-read (with notification badge)
- Guide, Mock
- User profile (e.g., CK)

### Left Sidebar
- **Pipeline** (active item, highlighted blue)
- DUPLICATE CHECK
- LEAD, CONTACT, CUSTOMER, OPPORTUNITY, SALES ORDER, REVENUE, PRODUCT, DAILY WORKS, REPORT, CONSOLE, Mgt View

### Main Content
- Title: "CRM Pipeline"
- Search input: "Search project or rep..."
- 6 stage tiles with count + value
- Filter bar (TIME / ENTITY / REP / Reset)
- Summary line
- Pipeline Deals table with badge (e.g., "19 records")

## Data Flow

```
Lead → Opportunity → Quotation → PO → Sales Order → Payment
  ↓         ↓            ↓         ↓         ↓          ↓
Stage 1   Stage 2      Stage 3   Stage 4   Stage 5    Stage 6
```

Each stage aggregates from its respective entity module and displays count + total value.

## Known Issues

1. **No dedicated page object yet**: Pipeline module is not yet implemented in the test suite.
2. **Test coverage**: 0%.
3. **Chinese UI labels**: Pagination footer shows "前往 1" and "每页 10 条" — these are defects (system language should be English).
