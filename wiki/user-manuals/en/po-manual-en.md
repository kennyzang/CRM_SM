---
title: PO (Purchase Order) User Manual (English)
created: 2026-06-04
updated: 2026-06-04
type: user-manual
tags: [po, user-manual, en]
---

# PO (Purchase Order) User Manual

> **Version**: V1.0 | **Date**: 2026-06-04 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [List View](#2-list-view)
3. [Create a PO](#3-create-a-po)
4. [Details View](#4-details-view)
5. [Business Rules & Workflow](#5-business-rules--workflow)
6. [FAQ & Notes](#6-faq--notes)

---

## 1. Module Overview

The **PO (Purchase Order)** module records customer purchase orders received by Securemetric. A PO represents the customer's formal commitment to buy and is a prerequisite before a Sales Order (SO) or Contract can be created.

POs are linked to an Opportunity; creating a PO automatically moves the Opportunity to **Won** status. Financial information is inherited from the associated Quotation. Products and pricing from the PO update the Opportunity's product details; once a PO is closed, the Opportunity is locked and no new P&Ls or Quotations can be created.

### 1.1 Entry Points

| Entry Point | Path |
|-------------|------|
| Standalone list | Left sidebar → **Purchase Order** | [Direct Link](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1jg71jasbw58w88mgwpbu9v1399r1p212rw4/1jg7171muw58w87o0w154fbel1s291dufdw4?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1){: target="_blank" rel="noopener"} |
| From Opportunity | Opportunity Details → **PO** tab → **+ New** |

### 1.2 Core Functions

- Record the customer's official Purchase Order document and number
- Link PO to the winning Quotation to auto-populate financial data
- Upload PO file as an attachment for compliance
- Trigger Opportunity status update to **Won** upon PO creation
- Drive downstream creation of Sales Orders and Contracts

---

## 2. List View

| Column | Description |
|--------|-------------|
| PO Number | Customer-issued PO reference number |
| Date | PO issuance date |
| Customer | Customer who issued the PO |
| Opportunity | Linked opportunity |
| Total Amount | Total PO value |

Use the search bar to filter by PO Number or Customer. Use filter chips to narrow by Deal Category or Date range.

![PO List View](../../assets/po-list-001.png)

---

## 3. Create a PO

### 3.1 Opening the Form

**Recommended path**: Navigate to the linked Opportunity (status must be **Won** or ready to be marked Won), open the **PO** tab, and click **+ New**.

You may also create from the standalone PO list, but you will still need to select the Quotation manually.

![PO Create Form](../../assets/po-create-001.png)

### 3.2 Field Reference

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| PO Number | Yes | Text input | Customer-issued PO reference; must be unique |
| Date | Yes | Date picker | Date the PO was issued by the customer |
| Quotation | Yes | Lookup (tag-select) | Select the winning quotation; triggers auto-population |
| Deal Category | Yes | Dropdown | Category of the business deal |
| Opportunity | No (auto) | Read-only text | Auto-populated from Quotation |
| Customer | No (auto) | Read-only text | Auto-populated from Quotation |
| Currency | No (auto) | Read-only text | Auto-populated from Quotation |
| Total Amount | No (auto) | Read-only number | Auto-populated from Quotation total |
| PO File | Yes | File upload | Scanned or digital copy of the customer PO document |

### 3.3 Product Details Sub-table

The **Product Details** sub-table lists the line items within the PO. These are typically inherited from the Quotation but can be reviewed here.

| Column | Type | Notes |
|--------|------|-------|
| Seq | Auto-number | Row sequence number |
| Service Period | Date range | Start and end date of the service/delivery period |
| Product | Lookup | Product name from product catalog |
| Product Code | Text | Product SKU or code |
| Type | Dropdown | Product or service type classification |
| Description | Text | Line item description |
| Quantity | Number | Quantity ordered |

### 3.4 Saving

Click **Save** in the top action bar. The system saves the PO and may update the linked Opportunity status to **Won** if it was not already set.

---

## 4. Business Rules & Workflow

### 4.1 Standard PO Workflow

```
Create PO → Fill PO Number + Upload PO File → Save → PO Active
```

1. Creating a PO automatically moves the linked Opportunity to **Won** status.
2. Fill in the mandatory fields: PO Number, Date, Quotation, Deal Category, PO File.
3. The system auto-populates Customer, Opportunity, Currency, and Total Amount from the selected Quotation.
4. Save the PO record.

### 4.2 PO Required Before SO/Contract

A Sales Order or Contract **cannot be created** until at least one Active PO exists for the linked Opportunity. This enforces a formal purchase commitment before revenue recognition steps begin.

### 4.3 PO Number Mandatory

The **PO Number** is the customer's reference number on their official PO document. It is mandatory and should match the document exactly.

### 4.4 PO File Upload Mandatory

The scanned or digital PO file must be attached before saving. This serves as the official record and is referenced during audits, disputes, and contract management.

---

## 5. FAQ & Notes

**Q: The customer sent a revised PO with a new amount. How do I update?**
Update the Quotation to reflect the new amount, then return to the PO and re-select the Quotation to refresh the auto-populated values. Upload the revised PO document.

**Q: Can I delete a PO?**
PO deletion is restricted once it is linked to a Sales Order or Contract. Contact your manager if a PO was created in error before any downstream records exist.

**Q: What does "Deal Category" mean?**
Deal Category classifies the type of business deal (e.g., New Business, Renewal, Upsell). It is used for sales pipeline and revenue reporting.

**Q: Can one Opportunity have multiple POs?**
Yes. A single Opportunity may have multiple POs if the customer issues separate purchase orders for different phases or products. Each PO is tracked independently.
