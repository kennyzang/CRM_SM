---
title: Pipeline Kanban User Manual (English)
created: 2026-06-04
updated: 2026-06-04
type: user-manual
tags: [pipeline, kanban, user-manual, en]
---

# Pipeline Kanban User Manual

> **Version**: V1.0 | **Date**: 2026-06-04 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Pipeline Summary Bar](#2-pipeline-summary-bar)
3. [Filter Bar](#3-filter-bar)
4. [Pipeline Deals Table](#4-pipeline-deals-table)
5. [Navigation & Actions](#5-navigation--actions)
6. [Business Rules](#6-business-rules)
7. [FAQ & Notes](#7-faq--notes)

---

## 1. Module Overview

The **Pipeline Kanban** is a single-page dashboard that gives every team member an at-a-glance view of where their deals stand across the full sales cycle. It displays all active projects in a table with a stage summary bar at the top.

### 1.1 Entry Point

- **Sidebar**: Navigate to **CRM → Pipeline**

### 1.2 Core Functions

| Function | Description |
|----------|-------------|
| Stage Overview | View deal count and total value at each of the 6 pipeline stages |
| Stage Filtering | Click a stage tile to filter the list to that stage only |
| Time/Entity/Rep Filtering | Scope the pipeline by time period, entity, or sales representative |
| Deal Navigation | Click any deal row to navigate to its full detail page |
| Search | Search by project name, rep name, or record ID |

### 1.3 Pipeline Stages

The CRM uses a **6-stage pipeline** that spans the entire sales cycle:

| Stage | Description |
|-------|-------------|
| **LEAD** | Initial lead captured |
| **OPPORTUNITY** | Lead qualified, opportunity created |
| **QUOTATION** | Quotation generated from approved P&L |
| **PO** | Purchase Order received from customer |
| **SALES ORDER** | Sales Order created internally |
| **PAYMENT** | Payment received / deal closed |

---

## 2. Pipeline Summary Bar

![Pipeline Kanban Dashboard](../assets/pipeline-kanban-001.png)

At the top of the page, six stage tiles are displayed horizontally. Each tile shows:

- **Stage name** (e.g., LEAD, OPPORTUNITY)
- **Deal count** — number of active projects at that stage
- **Pipeline value** — total deal value in the branch's default currency (e.g., MYR)

### Example

| Stage | Count | Value (MYR) |
|-------|-------|-------------|
| LEAD | 3 | 102,915.13 |
| OPPORTUNITY | 0 | 0 |
| QUOTATION | 1 | 430,650 |
| PO | 1 | 430,650 |
| SALES ORDER | 2 | 861,300 |
| PAYMENT | 12 | 695,211 |

**Interaction**: Click any stage tile to filter the project list below to show only deals at that stage. A **Reset** button appears to restore the full view.

---

## 3. Filter Bar

Below the summary bar, a filter bar allows you to narrow the pipeline view:

| Filter | Type | Options |
|--------|------|---------|
| **TIME** | Toggle buttons | This Year / This Month (default) / Custom |
| **ENTITY** | Dropdown | All / specific legal entity (e.g., SMMY, SCMY) |
| **REP** | Dropdown | All / specific sales representative |
| **Reset** | Button | Clears all active filters |

The filter settings apply to both the summary bar values and the deals table below.

---

## 4. Pipeline Deals Table

### 4.1 Summary Line

A summary line shows the total count and pipeline value:

> Showing **19** deals • Pipeline **MYR 2,520,726.13**

### 4.2 Table Columns

| Column | Description |
|--------|-------------|
| **Project** | Project or customer name — click to navigate to the detail page |
| **Amount** | Deal value in the branch's default currency |
| **Rep** | Assigned sales representative (e.g., YCK) |
| **Pipeline Stage** | Visual dot-track progress indicator + stage name tag |

### 4.3 Pipeline Stage Dot-Track

Each deal's pipeline stage is shown as a visual dot-track:

- **Filled dots** (●) — completed stages
- **Highlighted ring** (◉) — current stage
- **Empty dots** (○) — future stages
- **Stage tag** — current stage name displayed at the end (e.g., "Sales Order", "Payment")

This gives you an instant visual of how far each deal has progressed through the 6 stages.

---

## 5. Navigation & Actions

### 5.1 Search

A search bar at the top-right of the page allows real-time filtering:

- **Search by**: Project name, rep name, or record ID
- **Behavior**: Results update as you type

### 5.2 Navigate to Detail Page

Click on any project row in the table to navigate directly to that deal's full detail page within the CRM. This opens the Opportunity Details, Lead Details, or appropriate record page based on the deal type.

### 5.3 Reset Filters

After clicking a stage tile or applying filters, click **Reset** to return to the full, unfiltered pipeline view.

---

## 6. Business Rules

1. **Currency consistency**: All monetary amounts display in the branch's default currency. No currency conversion or mixed currencies are shown.
2. **Stage filtering**: Clicking a stage tile filters the list to that stage only.
3. **Real-time search**: Search results update instantly as you type.
4. **Time-based filtering**: Supports This Year, This Month, or a Custom date range.
5. **Entity/Rep scoping**: Can limit the pipeline to a specific legal entity or sales rep.

---

## 7. FAQ & Notes

**Q: Why is it called "Kanban" but looks like a table?**
Despite the name, the Pipeline view uses a table layout rather than a card-based Kanban board. The "Kanban" name refers to the visual stage tracking concept.

**Q: Can I drag deals between stages on this page?**
No. Stage changes are made on the individual deal's detail page using the "Advance to the next stage" button or through workflow actions.

**Q: Why do some deals show MYR while others show different currencies?**
All amounts are converted to your branch's default currency for consistency. You will not see mixed currencies on the Pipeline dashboard.

**Q: What happens when I click a project row?**
You will be navigated to that deal's full detail page — this could be an Opportunity, Lead, or other record depending on the deal type.

**Q: How do I see only my own deals?**
Use the **REP** filter dropdown and select your name, or use the search bar to search by your name.
