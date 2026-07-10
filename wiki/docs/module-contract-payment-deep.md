---
title: CRM Module Deep Documentation — Contract & Payment Schedule
created: 2026-06-05
updated: 2026-06-05
type: documentation
tags: [contract, payment-schedule, so, permission, business-rules]
sources: [oss/Contract & Payment Schedule.mp4, video-analysis-2026-06-05]
related: [[so]], [[entities/so]], [[entities/contract]]
---

# Module Deep Documentation: Contract & Payment Schedule

> **Audience**: New team members who need to understand the CRM system quickly
> **Source**: Video recording (23 min) + Audio transcription (8,843 chars) + 8 key frame analysis
> **Date**: 2026-06-05

---

## 1. Overview

The Contract & Payment Schedule module is part of the post-Sales Order workflow. After a Sales Order is created and approved, users can:
1. **Create Contracts** — legal documentation (NDAs, SLAs) with expiry notifications
2. **Manage Payment Schedules** — track receivables, invoicing, and payment collection
3. **Monitor Permissions** — ensure only authorized users can edit financial data

### Position in Sales Pipeline

```
Lead → Contact → Customer → Opportunity → P&L → Quotation → PO → Sales Order
                                                                    ↓
                                            ┌──────────┬──────────┴──────────┐
                                            ▼          ▼                     ▼
                                        Contract   Payment Schedule      Delivery
```

---

## 2. Contract Module

### 2.1 What is a Contract?

A Contract is a legal document linked to a Sales Order. It covers:
- **NDAs** (Non-Disclosure Agreements)
- **SLAs** (Service Level Agreements)
- **After-sales service agreements**

Contracts are created **after** the PO and SO are confirmed, meaning both parties have agreed to cooperate.

### 2.2 Contract Create Form — Complete Field Reference

| Field | Type | Required | Notes | Example |
|-------|------|----------|-------|---------|
| Contract Title | Text Input | Yes | User-defined title | "ABC NDA" |
| Contract ID | Auto | — | System-assigned on save | Auto Generate |
| Sales Order | Lookup | Yes | **Pre-filled** from parent SO; has clear (×) and link icon | "SC/SO26/000005" |
| Customer | Lookup | Yes | **Auto-filled** from Sales Order | "ABC" |
| Signed Date | Date Picker | Yes | Contract signing date | "04/29/2026" |
| Expiry Date | Date Picker | Yes | Contract expiration; calendar widget with month navigation | "04/28/2027" |
| Remarks | Text Area | No | Placeholder "Input" | — |
| Attachment | File Upload | No | "Upload the attachment" button + file list with delete | "1 meeting minute-site.pdf" |

### 2.3 Expiry Notification Rules

Contracts support **multiple notification rules** to alert users before expiry:

| Field | Type | Notes |
|-------|------|-------|
| Notify Who | User Lookup | Select user(s) to notify |
| Days Before Expiry | Number + Dropdown | e.g., "5" + "day" |

**How to set up:**
1. In the Reminder section, enter the number of days (e.g., 5)
2. Select the time unit (day)
3. Click "+ Add rows" to add additional rules (e.g., 10 days before, 30 days before)
4. Save the contract

**Testing tip**: Set expiry date to next week to test notification trigger sooner.

### 2.4 Contract Creation Workflow

```
Sales Order (active) → Click "Contract" tab → Click "Create"
  → Fill Contract Title (e.g., "ABC NDA")
  → Verify Sales Order & Customer are pre-filled
  → Set Signed Date & Expiry Date
  → Upload attachment (optional)
  → Configure notification rules (optional, multiple allowed)
  → Click "Save"
  → Contract appears in Contract tab with Serial No. and Contract Title
```

### 2.5 Contract List in SO Details

- **Tab**: Contract(0), Contract(1), etc. — number indicates count
- **Columns**: Serial No., Contract Title
- **Link**: Clicking a contract opens its detail view

---

## 3. Payment Schedule Module

### 3.1 What is a Payment Schedule?

Payment Schedules define **payment milestones** for a Sales Order. They are:
- Generated from the milestone information defined during SO creation
- Used to track receivables, invoicing, and payment collection
- **NOT date-driven** — they are milestone-driven (per business blueprint)

### 3.2 Payment Schedule Details Page — Complete Field Reference

#### Header Summary

| Field | Type | Notes |
|-------|------|-------|
| Status | Badge | "Uncompleted" (blue) when no payment received |
| Contract | Link | ⚠️ **BUG**: Currently shows "Contract" label but should show **"Sales Order"** |
| A/R Amount | Currency | Accounts Receivable total (e.g., 18,854.87) |
| Received Amount | Currency | Blank/zero when no payment received |
| Customer Name | Link | e.g., "ABC" |

#### Core Fields

| Field | Type | Notes |
|-------|------|-------|
| Payment Schedule ID | Text | e.g., PP202604270002 |
| Sales Order ID | Link | e.g., SC/SO26/000005 |
| Customer PO | Link | e.g., 8596848 |
| Milestone No. | Text | "-" when empty |
| Milestone Name | Text | "-" when empty |
| Receivable amount | Currency | e.g., 18,854.87 |
| Receivable % | Percentage | e.g., 50.00% |
| Payment Type | Text | "Progress Payment" |
| Contract Terms | Text | "-" when empty |
| Currency | Text | MYR |
| Invoiced Amount | Currency | e.g., 0.00 |
| Uninvoiced Amount | Currency | Calculated: Receivable - Invoiced |
| Amount Uncollected | Currency | Calculated |
| Completion % | Number | Placeholder "-" |
| Start Date | Date | Placeholder "-" |
| Planned Collection Date | Date | Placeholder "-" |
| Remind before | Number | Days before due date |
| Payment Status | Badge | "Unpaid" (blue) |
| Project Status | Text | Placeholder "-" |
| Project Manager | User Lookup | Placeholder "-" |
| Sales Rep | Text | e.g., CK |
| Department | Text | e.g., SMMY |
| Remarks | Text | Placeholder "-" |
| Attachment | File | Placeholder "-" |

#### Tabs

| Tab | Purpose |
|-----|---------|
| Detail Information | Core payment schedule fields (above) |
| Payment Detail(0) | Individual payment records (empty until payments made) |
| Billing Detail(0) | Billing/invoicing records |
| System Record | ⚠️ **Should be removed** — unnecessary for end users |

### 3.3 Financial Calculation Logic

```
Receivable amount = Order Total × Receivable %
Example: 37,709.74 × 50% = 18,854.87

Uninvoiced Amount = Receivable amount - Invoiced Amount
Example: 18,854.87 - 0.00 = 18,854.87

Amount Uncollected = Uninvoiced Amount (when no payment received)

Status = "Uncompleted" when Received Amount is empty/zero
```

### 3.4 Payment Schedule Actions

| Action | Location | Notes |
|--------|----------|-------|
| Edit | Pencil icon (top right) | Modify payment schedule details |
| Change Completion % | Button | Update milestone completion percentage |
| Expand | Button | Full-screen view |
| Close | X button | Return to SO Details |

---

## 4. Permission Model — Critical Findings

### 4.1 Service Team Concept

> **Definition**: The Service Team determines who has permission to **see and edit** information on a detail page.

**Where it appears:**
- Lead Details → Service Team
- Contact Details → Service Team
- Customer Details → Service Team
- Opportunity Details → Service Team

**Permission levels:**
- **Read-Only** — Can view but not edit
- **Read-Write** — Can view and edit (usually granted)

**Roles:**
- **Ordinary Member** (default) — Standard team member
- **Customer Manager** — Functional role on the account

### 4.2 Discovered Permission Bug

**Scenario**:
- User "Nixon" is the **Owner** of Opportunity "ABC Q2 Purchase"
- Nixon is in the **Customer's Service Team** (ABC company)
- Nixon is **NOT** in the **Opportunity's Service Team**
- Yet Nixon can still **create Sales Orders** under this Opportunity

**Expected behavior**: If someone is not in the Opportunity's Service Team, they should NOT be able to create Sales Orders under it.

**Testing requirement**: "When doing testing, we really need to test all permissions — what type of user can do what type of things. If someone is not in the service team, he shouldn't be able to edit information or create sales orders."

### 4.3 Permission Test Scenarios

| Scenario | Expected Behavior | Status |
|----------|-------------------|--------|
| Owner of Customer but NOT in Opportunity Service Team | Should NOT manage Opportunity or create SO | ⚠️ Bug found |
| In Service Team but NOT Owner | Should have edit access per permission level | Need to verify |
| NOT in Service Team and NOT Owner | Should have NO access | Need to verify |
| Non-owner editing Payment Schedule | Should NOT be able to edit | ⚠️ Bug found (Yuwin added as admin could still edit) |

### 4.4 Payment Schedule Permission Bug

**Finding**: User "Yuwin" (super admin) could add/edit payment schedule even though he's not the person in charge.

**Expected**: Only the person in charge (or users with explicit permission) should be able to edit payment schedules.

**Audio quote**: *"If he's not the person in charge of this payment schedule, then he shouldn't be able to edit it."*

---

## 5. Known Issues & Bugs

| # | Module | Issue | Severity | Audio Reference |
|---|--------|-------|----------|-----------------|
| 1 | Payment Schedule | "Contract" field label should be **"Sales Order"** — the number shown is the SO number, not contract number | Medium | "It shouldn't be contract here. It should be SO. This should be modified." |
| 2 | Payment Schedule | Unknown number displayed — unclear what number it is | Medium | "I really don't know what this number is. I'll give it a question mark." |
| 3 | Payment Schedule | System Record tab is unnecessary | Low | "System records, no need, no need." |
| 4 | SO Details | Opportunity Owner not in Service Team but can create SO | **High** | "Nixon is the owner but he doesn't show in the service team. That's a bit weird." |
| 5 | Permission | Non-owner (Yuwin) can edit payment schedule | **High** | "He can still add it... he shouldn't be able to." |
| 6 | SO Details | "Delievery" tab has typo | Low | Typo in tab name |

---

## 6. Testing Requirements (from Audio)

### 6.1 Permission Testing Priority

> **Quote**: *"When we're doing the testing, we really need to test all the permissions and what type of user can do what type of things."*

**Test coverage needed:**
1. Service Team membership vs. access rights (every module, every screen)
2. Owner vs. non-owner capabilities
3. Read-Only vs. Read-Write permission enforcement
4. Cross-entity permission inheritance (Customer → Opportunity → SO)

### 6.2 Contract Testing Scenarios

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Create contract from SO | Navigate to SO → Contract tab → Create → Fill form → Save | Contract created, appears in Contract tab |
| Multiple notification rules | Add 2+ rules (5 days, 10 days before expiry) | All rules saved and trigger correctly |
| Expiry notification test | Set expiry to next week, set 5-day reminder | Notification received ~5 days before expiry |
| Contract attachment upload | Upload PDF/DOC file | File attached and downloadable |

### 6.3 Payment Schedule Testing Scenarios

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| View payment schedule details | Click Payment Schedule tab → Click milestone | Details page opens with all fields |
| Verify financial calculations | Check Receivable = Order Total × % | Calculations match |
| Edit permission (authorized) | Person in charge edits schedule | Edit succeeds |
| Edit permission (unauthorized) | Non-person-in-charge attempts edit | **Should be blocked** |
| System Record tab visibility | Check if tab is shown | **Should be hidden** per requirement |

---

## 7. Related Modules

- **Sales Order** — Parent entity; Contract and Payment Schedule are created from SO
- **Delivery** — Managed by operations team via dedicated view; product selection restricted to SO items
- **PI (Proforma Invoice)** — Should be created before Delivery (per audio workflow)

---

## 8. Quick Reference — Field Naming Corrections

| Current Label | Should Be | Module |
|---------------|-----------|--------|
| "Contract" (in Payment Schedule) | "Sales Order" | Payment Schedule |
| "System Record" tab | Remove entirely | Payment Schedule |
| "Delievery" tab | "Delivery" | SO Details |
