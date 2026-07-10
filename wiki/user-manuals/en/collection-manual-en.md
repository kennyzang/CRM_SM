---
title: Customer Payment (Collection) User Manual (English)
created: 2026-06-04
updated: 2026-06-15
type: user-manual
tags: [collection, user-manual, en]
---

# Customer Payment (Collection) User Manual

> **Version**: V1.1 | **Date**: 2026-06-15 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [List View](#2-list-view)
3. [Create a Collection Record](#3-create-a-collection-record)
4. [Details View](#4-details-view)
5. [Business Rules & Workflow](#5-business-rules--workflow)
6. [FAQ & Notes](#6-faq--notes)

---

## 1. Module Overview

The **Customer Payment (Collection)** module records the actual payments a customer makes against a sales order. Each record represents one payment received. On saving, the system automatically allocates the amount to the linked milestone payment schedule and updates the sales order's received and uncollected totals.

### 1.1 Entry Points

- **Sidebar**: **REVENUE → Customer Payment** | [Direct link](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i1ci5tf6w60w3982w3dlrp512h19a951tw1/1i1766s86w61w1qqwb76mdu5h0meq1vcelw1?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1){: target="_blank" rel="noopener"}
- **Collection Details**: **REVENUE → Collection Details** | [Direct link](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i1ci6bt4w60w3994w1b1gdb83ickip03gw1/1i178leaqw60wjlpw1q6re69bnnbf43qviw1?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1){: target="_blank" rel="noopener"}

### 1.2 Core Functions

- Record each payment received from a customer
- Allocate the payment amount to the corresponding payment schedule milestones
- Upload the bank receipt as evidence
- Automatically update milestone received amounts and sales order totals on save
- Automatically mark a percentage-based milestone as **Paid** once fully collected

---

## 2. List View

The collection list shows all payment records the current user is allowed to view.

![Collection list](../../assets/collection-list-001.png)

| Column | Description |
|--------|-------------|
| Payment No. | Collection number (e.g., PR202606110003) |
| Payment Date | Date the payment was received |
| Customer | Paying customer |
| Allocated Amount | Amount already allocated to milestones |
| Available Amount | Remaining amount not yet allocated |

Use the search bar to filter by customer name or payment date range.

---

## 3. Create a Collection Record

### 3.1 Opening the Form

Go to the left sidebar → **REVENUE** → **Customer Payment**, then click **+ New**.

![Create collection form](../../assets/collection-create-001.png)

### 3.2 Field Reference

**Customer Payment Information section**

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| Customer | Yes | Relation (lookup) | Select the paying customer (marker ①) |
| Payment Date | Yes | Date picker | Date the payment was received |
| Currency | Yes | Dropdown | Settlement currency (e.g., MYR, marker ②). The currency determines which milestones are selectable; the system currently offers only one currency |
| Collection Amount (Total) | Yes | Money input | Total amount actually received in this transaction (marker ③) |
| Allocated Amount | Auto | Read-only | Sum of amounts allocated to milestones |
| Available Amount | Auto | Read-only | Unallocated balance (Collection Amount − Allocated Amount) |
| Reminder Date | No | Date picker | Follow-up reminder date |
| Owner | No | User picker | Record owner; defaults to the current user |
| Sales Rep | No | Text | Sales representative |
| Department | No | Org unit picker | Responsible department |
| Bank Deposit Slip | No | File upload | Bank transfer receipt attachment |

**Milestone Payments section**

The actual allocation is entered in the **Milestone Payments** sub-table below:

| Column | Required | Description |
|--------|----------|-------------|
| Payment Schedule No. | Yes | Select the linked payment schedule (marker ④) |
| Milestone | Auto | Milestone name, carried over from the payment schedule |
| Sales Order ID | Auto | Linked sales order |
| Currency | Auto | Currency, carried over from the payment schedule |
| Uninvoiced Amount | Auto | Amount not yet invoiced |
| Amount Uncollected | Auto | Amount still uncollected |
| Amount Applied | Yes | Amount allocated to this milestone in this transaction (marker ⑤) |
| Attachment | No | Evidence attachment for this row |
| Remarks | No | Notes |

> **Currency matching rule**: the main-form currency must match the milestone's currency. A milestone with a different currency cannot be selected.

### 3.3 Saving

Click **Save** in the top action bar. The record is created, and the Amount Applied values flow through to the corresponding payment schedules.

---

## 4. Details View

### 4.1 Header

![Customer collection info](../../assets/customer-collection-info-001.png)

| Field | Description |
|-------|-------------|
| PAYMENT ID | System-generated collection number (e.g., PR202606110003) |
| CUSTOMER | Paying customer |
| PAYMENT AMOUNT | Total amount of this collection |
| USED AMOUNT | Amount allocated to milestones |
| RECEIPT DATE | Collection date |

### 4.2 Sub-tabs

| Tab | Content |
|-----|---------|
| Detail Information | All collection fields (read-only) |
| Payment Details(N) | One row per allocated payment schedule milestone |

**Payment Details** column reference:

| Column | Description |
|--------|-------------|
| Customer Name | Customer name |
| Payment Receipt No | Collection number |
| Sales Order No | Linked sales order |
| Payment Schedule No | Payment schedule number |
| Used Amount | Amount allocated to this payment schedule |
| Payment Method | Payment method |

---

## 5. Business Rules & Workflow

### 5.1 Standard Collection Workflow

```
Customer payment received
  → Account Manager creates a collection record
  → Select customer (①), confirm settlement currency (②), enter collection amount (③)
  → In the Milestone Payments sub-table, select a payment schedule (④) and enter Amount Applied (⑤)
  → Upload the bank receipt attachment
  → Save
  → System updates milestone received amounts & sales order totals automatically
```

**Validation rules**:
- Validation is relatively lenient: the record passes as long as **Available Amount ≥ 0** after saving.
- If a milestone has not yet been invoiced, there is no receivable, so no receivable check is applied.
- For a **percentage-based milestone**, the system does apply a receivable check.

### 5.2 Customer Linkage

Every collection record must be linked to a customer. If the customer has not been created yet, create the customer record first.

### 5.3 Bank Receipt Attachment

The bank receipt (transfer slip or bank confirmation) is the primary evidence document. Although the field is not marked as required in the UI, business policy requires uploading the receipt for large payments.

### 5.4 Automatic Updates After Collection

Once a collection is saved, the system automatically updates the linked records below:

**Payment Schedule update**:

![Payment schedule update](../../assets/collection-milestone-update-001.png)

The **Payment Detail** sub-tab on the payment schedule records this collection, showing the Existing Transaction Amount and Available Quota.

**Sales Order update**:

![Sales order update](../../assets/collection-so-update-001.png)

The **RECEIVED** and **UNCOLLECTED** amounts on the sales order header card are updated in sync.

### 5.5 Percentage-Based Milestone Status Change

![Milestone status changes to Paid](../../assets/collection-milestone-paid-001.png)

For a **By Percentage** milestone, its **Payment Status** automatically changes to **Paid** (green tag) once fully collected, and the milestone no longer appears in the selectable list when creating the next collection.

A **By Products** milestone remains selectable while its status is **Unpaid**.

### 5.6 Settlement Currency

The settlement currency (Currency) determines which milestones are selectable: the main-form currency must match the milestone currency, otherwise the milestone cannot be added to the Milestone Payments sub-table. The system currently offers only one currency.

---

## 6. FAQ & Notes

**Q: Can I record a partial payment?**
Yes. Enter the actual amount received in Collection Amount (Total), and fill in the matching allocation in Milestone Payments. Create a new collection record when the remaining balance arrives.

**Q: A milestone isn't available for selection — why?**
Usually for one of two reasons: ① the main-form currency does not match the milestone currency; ② a percentage-based milestone has been fully collected (status is Paid). Check that the currencies match, or confirm whether the milestone has already been collected.

**Q: Do I need to update both the Collection module and the Payment Schedule?**
No. After you save a collection record, the linked payment schedule amounts update automatically — no manual change to the payment schedule is needed.

**Q: Can I create multiple collection records for the same sales order?**
Yes. For instalments or multiple partial payments, create a separate collection record for each payment. The system aggregates them in the payment schedule and the sales order.
