---
title: Contract User Manual (English)
created: 2026-06-04
updated: 2026-06-13
type: user-manual
tags: [contract, user-manual, en]
---

# Contract User Manual

> **Version**: V1.1 | **Date**: 2026-06-13 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [List View](#2-list-view)
3. [Create a Contract](#3-create-a-contract)
4. [Business Rules & Workflow](#4-business-rules--workflow)
5. [FAQ & Notes](#5-faq--notes)

---

## 1. Module Overview

The **Contract** module manages signed agreements between Securemetric and its customers. A contract is linked to a Sales Order (SO) and represents the legal obligation that follows a confirmed sale. Contract records serve as the central repository for signed documents, renewal tracking, and expiry monitoring.

### 1.1 Entry Points

| Entry Point | Path |
|-------------|------|
| Standalone list | Left sidebar → **SALES ORDER** → **Contract** | [Direct Link](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1jihfrrm2w5fw21uvqw2akr3e91d9p5dm2w4/1jihcnhlqw5fw21obkw2j8d8j21o7ctta3w4?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1){: target="_blank" rel="noopener"} |
| From Sales Order | Sales Order Details → **Contract** tab → **+ New** |

### 1.2 Core Functions

- Record contract title, signed date, expiry date, and attachment
- Link to a Sales Order (and through it, to the Customer)
- Configure contract reminder notifications with customisable lead times
- Sync contract files to the Customer 360 view
- Track one-to-one contract-to-SO relationships

---

## 2. List View

The Contract list shows all contracts accessible to the current user.

| Column | Description |
|--------|-------------|
| Contract ID | Auto-generated unique identifier |
| Sales Order | Linked Sales Order reference |
| Customer | Associated customer (derived from SO) |

Filter by Contract Title, Customer, or date range.

![Contract list view — showing Contract Title, Contract ID, Sales Order, Customer, Signed Date and Expiry Date columns](../../assets/contract-001.png)

---

## 3. Create a Contract

### 3.1 Opening the Form

**Recommended path**: Open the linked Sales Order, navigate to the **Contract** tab, and click **+ New**. This pre-fills the Sales Order reference.

You may also create from the standalone Contract list, but you must manually select the Sales Order.

![Contract create form — Title, Sales Order (pre-filled), Signed Date, Expiry Date and Attachment fields](../../assets/contract-002.png)

### 3.2 Field Reference

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| Contract Title | Yes | Text input | Descriptive name for the contract |
| Contract ID | No (auto) | Read-only text | System-generated upon save |
| Sales Order | Yes | Tag-select (lookup) | Link to the associated Sales Order |
| Customer | No (auto) | Read-only text | Auto-populated from the selected SO |
| Signed Date | Yes | Date picker | Date the contract was officially signed |
| Expiry Date | Yes | Date picker | Date the contract expires |
| Remarks | No | Textarea | Internal notes or comments |
| Attachment | Yes* | File upload | Signed contract document (*mandatory per Blueprint; no asterisk shown in UI) |
| Notify Who | No | Multi-user tag-select | Users to notify before contract expiry |

> *The **Attachment** field is functionally required by the business process even though the UI does not show a red asterisk. Always upload the signed contract document before saving.

### 3.3 Contract Reminder Sub-table

The **Contract Reminder** sub-table configures advance notifications before the expiry date.

| Column | Type | Notes |
|--------|------|-------|
| Serial No | Auto-number | Row sequence, read-only |
| Notify XX Days | Number input | Number of days before expiry to send the notification |
| Unit | Read-only text | Always "day" |
| Operation | Action buttons | Insert / Copy / Delete row |

**Example**: Setting "Notify XX Days" to `30` means a reminder is sent 30 days before the Expiry Date to all users in the **Notify Who** list.

You can add multiple rows for tiered reminders (e.g., 90 days, 30 days, 7 days before expiry).

### 3.4 Saving

Click **Save** in the top action bar. The system auto-generates the **Contract ID** and saves the record. The contract document is synced to the Customer 360 Contract tab.

---

