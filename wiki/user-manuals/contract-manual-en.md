---
title: Contract User Manual (English)
created: 2026-06-04
updated: 2026-06-04
type: user-manual
tags: [contract, user-manual, en]
---

# Contract User Manual

> **Version**: V1.0 | **Date**: 2026-06-04 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [List View](#2-list-view)
3. [Create a Contract](#3-create-a-contract)
4. [Details View](#4-details-view)
5. [Business Rules & Workflow](#5-business-rules--workflow)
6. [FAQ & Notes](#6-faq--notes)

---

## 1. Module Overview

The **Contract** module manages signed agreements between Securemetric and its customers. A contract is linked to a Sales Order (SO) and represents the legal obligation that follows a confirmed sale. Contract records serve as the central repository for signed documents, renewal tracking, and expiry monitoring.

### 1.1 Entry Points

| Entry Point | Path |
|-------------|------|
| Standalone list | Left sidebar → **SALES ORDER** → **Contract** |
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
| Contract Title | Name of the contract |
| Contract ID | Auto-generated unique identifier |
| Sales Order | Linked Sales Order reference |
| Customer | Associated customer (derived from SO) |
| Signed Date | Date the contract was signed |
| Expiry Date | Date the contract expires |
| Created By | CRM user who created the record |

Filter by Contract Title, Customer, or date range. Use status filters to identify contracts nearing expiry.

---

## 3. Create a Contract

### 3.1 Opening the Form

**Recommended path**: Open the linked Sales Order, navigate to the **Contract** tab, and click **+ New**. This pre-fills the Sales Order reference.

You may also create from the standalone Contract list, but you must manually select the Sales Order.

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

## 4. Details View

### 4.1 Main Information

Displays all fields from the Create form. Contract ID is shown (auto-generated). Customer is read-only, derived from the linked SO.

### 4.2 Sub-tabs

| Tab | Content |
|-----|---------|
| Detail Information | All contract fields including reminder sub-table |
| Attachments | Uploaded contract files |
| System Record | Creation and modification audit trail |

### 4.3 Editing

Click **Edit** in the top action bar to modify the contract. You can update Expiry Date, Remarks, add new reminder rows, or upload additional attachments.

---

## 5. Business Rules & Workflow

### 5.1 Standard Contract Workflow

```
Sales Order (confirmed) → Open SO → Contract tab → Create Contract
→ Fill Title + Signed Date + Expiry Date + Upload Attachment
→ Configure Reminder sub-table → Save → Contract ID auto-generated
```

### 5.2 One Contract per Sales Order

Each Sales Order can have **one linked Contract**. If a second contract is needed (e.g., amendment), discuss with your manager the appropriate process — a new SO may be required.

### 5.3 Auto-generated Contract ID

The Contract ID is assigned by the system upon save. You cannot manually set or modify it. This ID is used as the unique reference in all downstream processes and customer communications.

### 5.4 Attachment Is Functionally Mandatory

Although the UI does not show a red asterisk on the Attachment field, the signed contract document **must** be uploaded per business policy. Missing attachments will be flagged during audits. Upload the scanned or digital original before saving.

### 5.5 File Sync to Customer 360

All attachments uploaded to a Contract record are **automatically synced** to the linked Customer's 360 view under the **Contract** sub-tab. This ensures the customer's full document history is visible from the Customer record without manual duplication.

### 5.6 Expiry Reminders

Expiry reminders are delivered via CRM notification to all users listed in the **Notify Who** field, at the number of days before expiry specified in the reminder sub-table rows. Ensure the **Notify Who** field is populated for all contracts that require renewal follow-up.

---

## 6. FAQ & Notes

**Q: I created a Contract but the Customer field is empty. Why?**
The Customer field is derived from the linked Sales Order. Ensure the selected SO has a Customer attached. If the SO was created without a Customer, update the SO first.

**Q: Can I change the Sales Order linked to a Contract after saving?**
Changing the SO link after save is restricted because it affects the auto-populated Customer and financial chain. If the wrong SO was selected, delete the Contract (if no downstream dependencies exist) and re-create it with the correct SO.

**Q: How do I set up a 90-day and a 30-day reminder?**
In the Contract Reminder sub-table, click **+ Insert** twice to create two rows. Set the first row's "Notify XX Days" to `90` and the second to `30`. Both reminders will fire at the appropriate times.

**Q: The contract has been renewed. Should I extend the Expiry Date on the existing record or create a new Contract?**
Standard practice is to create a **new Contract** linked to the renewal SO. Do not overwrite the original contract's Expiry Date, as it is part of the audit trail.

**Q: Where can I find all contracts for a specific customer?**
Open the Customer record and navigate to the **Contracts** sub-tab. All linked contracts are listed there.

**Q: Why does the Contract ID appear only after saving?**
Contract ID is auto-generated by the system at save time. It cannot be pre-assigned. If you need the ID for external communications, save first and then copy the generated value.

**Q: Can I upload multiple files to one Contract?**
Yes, the Attachment field supports multiple uploads. Upload all relevant documents (original, appendices, amendments) together.
