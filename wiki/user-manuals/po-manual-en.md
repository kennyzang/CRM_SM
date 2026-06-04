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

POs are always linked to a **Won** Opportunity and inherit financial information automatically from the associated Quotation.

### 1.1 Entry Points

| Entry Point | Path |
|-------------|------|
| Standalone list | Left sidebar → **Purchase Order** |
| From Opportunity | Opportunity Details → **PO** tab → **+ New** |

### 1.2 Core Functions

- Record the customer's official Purchase Order document and number
- Link PO to the winning Quotation to auto-populate financial data
- Upload PO file as an attachment for compliance
- Trigger Opportunity status update to **Won** upon PO creation
- Drive downstream creation of Sales Orders and Contracts

---

## 2. List View

The PO list shows all purchase orders accessible to the current user.

| Column | Description |
|--------|-------------|
| PO Number | Customer-issued PO reference number |
| Date | PO issuance date |
| Customer | Customer who issued the PO |
| Opportunity | Linked opportunity |
| Total Amount | Total PO value |
| Currency | PO currency |
| Deal Category | Category of the deal |
| Created By | CRM user who created the record |

Use the search bar to filter by PO Number or Customer. Use filter chips to narrow by Deal Category or Date range.

---

## 3. Create a PO

### 3.1 Opening the Form

**Recommended path**: Navigate to the linked Opportunity (status must be **Won** or ready to be marked Won), open the **PO** tab, and click **+ New**.

You may also create from the standalone PO list, but you will still need to select the Quotation manually.

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

## 4. Details View

The PO detail page displays the main record and an approval workflow panel.

### 4.1 Main Information

All fields from the Create form are shown, with auto-populated fields (Opportunity, Customer, Currency, Total Amount) displayed as read-only.

### 4.2 Product Details Tab

View all line items linked to this PO.

### 4.3 Approval Workflow Panel

The right sidebar contains the approval workflow controls:

| Element | Description |
|---------|-------------|
| Track dropdown | Select the approval track (route) |
| Comments | Add a comment for the approver |
| Submit button | Submit the PO for approval |
| Approval history | Timeline of approval actions and comments |

### 4.4 Sub-tabs

| Tab | Content |
|-----|---------|
| Detail Information | Full PO fields |
| Product Details | Line items |
| System Record | Creation and modification audit trail |

---

## 5. Business Rules & Workflow

### 5.1 Standard PO Workflow

```
Opportunity (Won) → Create PO → Fill PO Number + Upload PO File → Save → Submit for Approval → Active PO
```

1. The Opportunity must be in **Won** status (or the act of creating the PO moves it to Won).
2. Fill in the mandatory fields: PO Number, Date, Quotation, Deal Category, PO File.
3. The system auto-populates Customer, Opportunity, Currency, and Total Amount from the selected Quotation.
4. Save the PO record.
5. Submit for approval using the right-panel workflow.
6. Once approved, the PO becomes **Active** and unlocks SO/Contract creation.

### 5.2 PO Required Before SO/Contract

A Sales Order or Contract **cannot be created** until at least one Active PO exists for the linked Opportunity. This enforces a formal purchase commitment before revenue recognition steps begin.

### 5.3 PO Number Mandatory

The **PO Number** is the customer's reference number on their official PO document. It is mandatory and should match the document exactly. This number is used in invoices and for customer payment reconciliation.

### 5.4 PO File Upload Mandatory

The scanned or digital PO file must be attached before saving. This serves as the official record and is referenced during audits, disputes, and contract management.

### 5.5 Currency and Amount Are Read-Only

Once the Quotation is selected, Currency and Total Amount are locked to match the Quotation. If these values are incorrect, update the source Quotation first, then re-link.

---

## 6. FAQ & Notes

**Q: Why can't I create a PO from the PO list page?**
You can, but you must manually select the Quotation. Creating from the Opportunity's PO tab is recommended because the context is pre-set and reduces data entry errors.

**Q: The Opportunity field is empty or wrong after I selected the Quotation. What happened?**
Ensure the selected Quotation is properly linked to an Opportunity. If the Quotation was created without an Opportunity link, update the Quotation first.

**Q: Can I attach multiple files to one PO?**
Yes, the PO File upload field typically supports multiple attachments. Upload all relevant documents (e.g., original PO, amendment) together.

**Q: The customer sent a revised PO with a new amount. How do I update?**
If the Quotation has been revised, update the Quotation first. Then return to the PO and re-select the Quotation to refresh the auto-populated values. Upload the revised PO document.

**Q: Can I delete a PO?**
PO deletion is restricted once it is linked to a Sales Order or Contract. Contact your manager if a PO was created in error before any downstream records exist.

**Q: What does "Deal Category" mean?**
Deal Category classifies the type of business deal (e.g., New Business, Renewal, Upsell). It is used for sales pipeline and revenue reporting.

**Q: Can one Opportunity have multiple POs?**
Yes. A single Opportunity may have multiple POs if the customer issues separate purchase orders for different phases or products. Each PO is tracked independently.
