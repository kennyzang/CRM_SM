---
title: Collection (Customer Payment) User Manual (English)
created: 2026-06-04
updated: 2026-06-04
type: user-manual
tags: [collection, user-manual, en]
---

# Collection (Customer Payment) User Manual

> **Version**: V1.0 | **Date**: 2026-06-04 | **System**: Securemetric CRM (EasyCraft)

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

The **Collection** module (also referred to as **Customer Payment**) records cash receipts from customers against outstanding receivables. Each collection entry documents a specific payment received, the amount, the date, the responsible parties, and the bank receipt evidence.

Collection records feed into the Payment Schedule module, updating the **Amount Received** and reducing the **Amount Uncollected** for the corresponding milestone.

### 1.1 Entry Points

| Entry Point | Path |
|-------------|------|
| Standalone list | Left sidebar → **REVENUE** → **Customer Payment (Collection)** |

### 1.2 Core Functions

- Record individual payments received from customers
- Link payment to a specific customer
- Upload bank receipt as evidence
- Route for Finance confirmation
- Lock the record after confirmation to prevent further edits
- Feed collected amounts back into Payment Schedule tracking

---

## 2. List View

The Collection list shows all payment records accessible to the current user.

| Column | Description |
|--------|-------------|
| Customer Name | Customer who made the payment |
| Payment Date | Date the payment was received |
| Collection Amount | Amount received in this collection |
| Settlement Currency | Currency of the payment |
| Payment Purpose | What this payment is for |
| Finance Confirmer | Finance team member who confirmed the receipt |
| Finance Confirm Time | Timestamp of Finance confirmation |
| Lock Status | Whether the record is locked (read-only) |

Use the search bar to filter by Customer Name or Payment Date range.

---

## 3. Create a Collection Record

### 3.1 Opening the Form

Navigate to Left sidebar → **REVENUE** → **Customer Payment (Collection)** and click **+ New**.

### 3.2 Field Reference

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| Customer Name | Yes | Relation (lookup) | Select the customer who made the payment |
| Payment Date | Yes | Date/time picker | Date and time the payment was received |
| Collection Amount | Yes | Money (currency input) | Amount received in this transaction |
| Settlement Currency | Yes | Dynamic config dropdown | Currency of the payment (e.g., MYR, USD) |
| Reminder Date | No | Date/time picker | Follow-up date if payment is partial or pending confirmation |
| Owner | No | Address picker (user) | Sales rep responsible for this collection; defaults to current user |
| Department | No | Address picker (org unit) | Department responsible for this collection |
| Finance Confirmer | No | Address picker (user) | Finance team member who will confirm the receipt |
| Finance Confirm Time | No | Date/time picker | Time of Finance confirmation (may be auto-set by workflow) |
| Payment Purpose | No | Dropdown (select) | Reason or category of the payment (e.g., invoice settlement, advance) |
| Lock Status | No | Radio button | Lock / Unlock — typically set after Finance confirmation |
| Bank Receipt Attachment | No | File upload | Scanned bank transfer slip or receipt |

### 3.3 Saving

Click **Save** in the top action bar. The record is created and appears in the list. The linked Payment Schedule milestone will reflect the new Amount Received.

---

## 4. Details View

### 4.1 Main Information

Displays all fields from the Create form. Finance Confirm Time and Lock Status update as the collection progresses through the confirmation workflow.

### 4.2 Sub-tabs

| Tab | Content |
|-----|---------|
| Detail Information | All collection fields |
| System Record | Creation and modification audit trail |

### 4.3 Editing

Fields can be edited before Finance confirmation. Once **Lock Status** is set to **Locked**, the record becomes read-only and cannot be modified.

---

## 5. Business Rules & Workflow

### 5.1 Standard Collection Workflow

```
Customer sends payment → Account Manager creates Collection record
→ Fill Customer Name + Payment Date + Collection Amount + Settlement Currency
→ Upload Bank Receipt Attachment
→ Assign Finance Confirmer
→ Save
→ Finance reviews and confirms receipt
→ Finance Confirm Time recorded
→ Lock record
```

### 5.2 Customer Linkage

Every collection must be linked to a **Customer**. The Customer Name field uses a relation lookup — search and select the customer from the existing customer database. Do not type a free-text name; it must be a valid CRM customer record.

### 5.3 Finance Confirmation Required

After the Account Manager saves the collection record, the assigned **Finance Confirmer** reviews the bank receipt attachment and the amount. Once verified:
- The **Finance Confirm Time** is recorded.
- The collection is considered officially confirmed.
- The PM/AM may proceed to close the milestone.

### 5.4 Bank Receipt Attachment

The bank receipt (transfer slip or bank confirmation) is the primary evidence document. While the field is not marked as hard-required in the UI, it is **mandatory per business policy** for any amount above a threshold. Always upload the receipt before submitting for Finance confirmation.

### 5.5 Lock After Confirmation

Once Finance confirms the collection:
- Set **Lock Status** to **Locked**.
- The record becomes read-only.
- Locked records cannot be edited or deleted except by administrators.

Locking prevents accidental modification of confirmed financial records and maintains the integrity of the audit trail.

### 5.6 Settlement Currency

Use the **Settlement Currency** field to record the currency in which the customer actually transferred the funds. This may differ from the invoice currency if cross-currency payments are involved. The Finance team will handle foreign exchange conversion as needed.

### 5.7 Payment Purpose

The **Payment Purpose** field categorises the reason for the payment. Common values include:
- Invoice settlement
- Advance payment
- Deposit

Correct categorisation ensures accurate revenue reporting and reconciliation.

---

## 6. FAQ & Notes

**Q: The customer made a payment but I can't find their name in the Customer Name field. What do I do?**
The customer must exist as a record in the CRM. If the customer has not been created yet, create the Customer record first, then come back to create the Collection record.

**Q: Can I record a partial payment?**
Yes. Enter the actual amount received in the **Collection Amount** field. If the remaining balance is to be collected later, create a new Collection record when the next payment arrives.

**Q: Who should be set as the Finance Confirmer?**
This should be the Finance team member responsible for reconciling incoming payments. Contact your Finance department to identify the correct person.

**Q: The record is locked but I need to make a correction. What do I do?**
Contact your Finance department or system administrator to unlock the record. Unlocking a confirmed financial record requires proper authorisation.

**Q: Do I need to record the collection in both the Collection module and the Payment Schedule?**
No. Creating a Collection record automatically updates the linked Payment Schedule's Amount Received. You do not need to update the Payment Schedule manually.

**Q: What currency should I use if the customer paid in a currency different from the invoice?**
Record the **actual currency received** in the Settlement Currency field and enter the **actual amount received** in Collection Amount. The Finance team will handle the exchange rate calculation and book the MYR equivalent separately.

**Q: Can I create multiple Collection records for the same invoice?**
Yes. If a customer pays in instalments or makes partial payments, each payment should be a separate Collection record. All records linked to the same customer will aggregate in the Payment Schedule.
