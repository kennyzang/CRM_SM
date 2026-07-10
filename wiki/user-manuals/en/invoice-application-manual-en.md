---
title: Invoice Application User Manual (English)
created: 2026-05-28
updated: 2026-05-28
type: user-manual
tags: [invoice-application, revenue, user-manual, en]
sources: [oss/PI.mp4]
related: [[invoice-application]], [[so]], [[payment-schedule]]
---

# Invoice Application User Manual

> **Version**: V1.0 | **Date**: 2026-05-28 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Invoice Application List](#2-invoice-application-list)
3. [Creating an Invoice Application](#3-creating-an-invoice-application)
4. [Invoice Details and PDF Export](#4-invoice-details-and-pdf-export)

---

## 1. Module Overview

The Invoice Application module handles post-sales revenue collection. It generates Proforma Invoices based on Sales Orders, supporting two billing models: **Project** (full-value invoicing) and **Milestone** (progress billing against payment schedules).

### 1.1 Entry Point

- **Sidebar**: Navigate to **REVENUE → Invoice Application** | [Direct Link](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i1ci8gq6w60w39c2w3galklu1di45gf3jw1/1i19lfhe4w60w1bo8w364nd0c3ogekan2kw1?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1){: target="_blank" rel="noopener"}

### 1.2 Core Functions

| Function | Description |
|----------|-------------|
| Project Billing | Invoice the full Sales Order value at once |
| Milestone Billing | Invoice against specific payment milestones |
| PDF Preview | Preview and export Proforma Invoice as PDF |

---

## 2. Invoice Application List

![Invoice Application List](../../assets/ir-001.png)

---

## 3. Creating an Invoice Application

Click the **+ Create** button to open the Invoice Application Create page, following these steps:

1. **Select the invoice type** — Project or Milestone (switching type clears all filled data)
2. **Select the Sales Order** — Choose the sales order to invoice against
3. **Confirm contact person and address** — Auto-populated from the Sales Order or customer record
4. **Terms** — Content automatically adjusts based on the entity and currency

![Invoice Terms](../../assets/invoice-terms-001.png)

### 3.1 Milestone Invoice

![Milestone Invoice Create](../../assets/invoice-milestone-create-002.png)

After selecting a milestone to invoice:

- **By Percentage type**: The invoice amount is calculated directly from the milestone percentage
- **By Products type**: All milestones except the last allow entering the current billing percentage; the last milestone is locked automatically to ensure the total never exceeds the order amount

A milestone invoice covers only one milestone per application. After invoicing, the related amounts in the payment schedule are automatically updated. For product milestones, the receivable percentage and amount in the project are also updated after invoicing.

---

## 4. Invoice Details and PDF Export

### 4.1 Project Invoice PDF

![Project Invoice PDF](../../assets/invoice-project-pdf-001.png)

### 4.2 Milestone Invoice PDF

![Milestone Invoice PDF](../../assets/invoice-milestone-pdf-001.png)

> **Note**: The product description in a milestone invoice includes the billing percentage; if 100%, it is not shown.

Click the **Export PDF** button to download the Proforma Invoice as a PDF file.
