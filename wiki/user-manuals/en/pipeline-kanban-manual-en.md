---
title: Pipeline Kanban User Manual (English)
created: 2026-06-04
updated: 2026-06-16
type: user-manual
tags: [pipeline, kanban, user-manual, en]
---

# Pipeline Kanban User Manual

> **Version**: V1.1 | **Date**: 2026-06-16 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Pipeline Stages](#2-pipeline-stages)
3. [Data Reference](#3-data-reference)
4. [Filters & Search](#4-filters--search)

---

## 1. Module Overview

The **Pipeline Kanban** is a single-page dashboard that consolidates the full stage progression of all projects assigned to the currently logged-in user, enabling sales personnel to monitor their personal pipeline at a glance.

**Access path**: Sidebar → **CRM → Pipeline** | [Direct Link](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1jq3s2qiqwfw1g2rkw1ui9f442bumbu7bvw0/1jkms17v5w82wklf5wid4osl2g19maf1j5w4?type=portal&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1){: target="_blank" rel="noopener"}

![Pipeline Kanban Dashboard](../../assets/pipeline-kanban-001.png)

Seven stage tiles are displayed horizontally at the top of the page, each showing the deal count and total value for the corresponding stage. Click any tile to filter the list below to that stage; click again or click **Reset** to restore the full view.

---

## 2. Pipeline Stages

The kanban covers **7 standard stages** across the complete sales cycle:

| Stage | Description |
|-------|-------------|
| **LEAD** | Initial lead recorded in the system |
| **OPPORTUNITY** | Lead has passed qualification; opportunity formally created |
| **QUOTATION** | Quotation generated from an approved P&L |
| **PO** | Formal Purchase Order received from the customer |
| **SALES ORDER** | Internal Sales Order created |
| **PI** | Displays the project invoice amount if invoices exist; otherwise displays the milestone total. Click to navigate to the associated Sales Order. |
| **PAYMENT** | Total payments received for the current project. Click to navigate to the associated Sales Order. |

---

## 3. Data Reference

### 3.1 Data Scope

The kanban displays only project records where the **currently logged-in user is the assigned representative**. Data belonging to other personnel is not included.

### 3.2 One Record per Project

The system retains only the single most advanced stage record for each project, preventing the same project from appearing multiple times across different stages:

- Once a lead is converted to an opportunity, the lead record will no longer be displayed
- Once an opportunity enters the quotation process, the opportunity record will no longer be displayed
- This logic applies throughout all stages — the kanban always reflects the current, latest status of each project

### 3.3 Currency & Exchange Rates

All monetary amounts are converted to the **home currency of the logged-in user**. The exchange rate reference date varies by stage:

| Stage | Exchange Rate Reference Date |
|-------|------------------------------|
| Lead | Lead creation date |
| Opportunity | Opportunity creation date |
| Quotation and beyond | Exchange rate passed through from the P&L |

---

## 4. Filters & Search

| Feature | Description |
|---------|-------------|
| **Time filter** | Defaults to **This Month**; can be switched to This Year or a custom date range |
| **Stage tiles** | Click to filter the list by stage; click **Reset** to show all |
| **Search** | Supports real-time search by project name or record ID |
