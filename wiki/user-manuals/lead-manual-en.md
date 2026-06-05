---
title: Lead User Manual (English)
created: 2026-06-04
updated: 2026-06-04
type: user-manual
tags: [lead, user-manual, en]
---

# Lead User Manual

> **Version**: V1.0 | **Date**: 2026-06-04 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Lead List View](#2-lead-list-view)
3. [Create a Lead](#3-create-a-lead)
4. [Lead Details View](#4-lead-details-view)
5. [Lead Management Operations](#5-lead-management-operations)
6. [Lead Conversion Workflow](#6-lead-conversion-workflow)
7. [Lead Import](#7-lead-import)
8. [FAQ & Notes](#8-faq--notes)

---

## 1. Module Overview

Leads represent potential sales opportunities that have not yet been qualified. They follow a lifecycle: Acquisition → Assignment → Follow-up → Conversion (to Opportunity or Customer).

### 1.1 Entry Points

- **Sidebar**: Navigate to **LEAD → Sales Lead**
- **From Conversion**: Lead queue → select a lead → Convert

### 1.2 Core Functions

| Function | Description |
|----------|-------------|
| Lead Creation | Create new sales leads with customer and deal information |
| Lead Queue | Manage unassigned and assigned leads with SLA tracking |
| Lead Assignment | Sales Manager assigns leads from Unassigned queue |
| Lead Conversion | Convert qualified leads to Opportunities via 2-step wizard |
| Lead Import | Bulk import leads from Excel templates |
| Task Management | Create follow-up tasks with deadlines and reminders |

### 1.3 Lead Statuses

| Status | Description |
|--------|-------------|
| Unassigned | New lead in queue, waiting for manager assignment |
| Pending | Assigned but not yet actively worked |
| Follow-up | Actively being worked by owner |
| Converted | Successfully converted to Opportunity/Customer |
| Invalid | Disqualified via More → Invalid |

### 1.4 Lead Stage Pipeline

| Stage | Probability | Description |
|-------|-------------|-------------|
| Targeting | 0% | Initial identification |
| Prospecting | 5% | Active engagement |
| End | — | Process completed |

---

## 2. Lead List View

![Lead List View](../assets/lead-003.jpg)

### 2.1 Ownership Filter Tabs

- **My Owned**: Leads owned by me
- **My Team Owned**: Leads owned by my team
- **My Involved**: Leads where I am a team member
- **All**: All leads visible to me

### 2.2 Status Filter Tabs

- **All** | **Unassigned(N)** | **Pending(N)** | **Follow-up(N)** | **Converted(N)** | **Invalid(N)**

### 2.3 List Features

| Feature | Description |
|---------|-------------|
| Search | "Search Phone" input field for quick lookup |
| Sorting | Create Time, Claim/Assign Time, Last Followed-up Time |
| Bulk Selection | Checkboxes + header checkbox + bulk delete |
| Pagination | "Total N Items" footer with "Jump To" |

### 2.4 Row Information

Each lead row displays:
- Lead Name, Customer, Owner, Status, Sales Pipeline
- Estimated Deal Amount, Currency
- Reclaim Countdown (e.g., "7Days" or "-1Days" for overdue)
- Create Time, Last Followed-up Time

---

## 3. Create a Lead

### 3.1 Entry

Click **+ Create** button on the Lead List toolbar to open the Lead Create form.

![Lead Create Form - Basic Info](../assets/lead-001.jpg)

### 3.2 Header Fields (Auto-populated)

| Field | Description |
|-------|-------------|
| Owner | Auto-populated from current user session |
| Internal Dept | Auto-populated from user profile (e.g., "SCMY") |
| Internal Dept | Auto-populated from user profile (e.g., "SCMY") |

### 3.3 Basic Information

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| Lead Name | Yes | Text | Autocomplete suggests existing records |
| Lead Queue | Yes | Dropdown | Defaults to user's entity queue (SMMY/SCMY) |
| Customer Type | Yes | Radio | New Customer / Existing Customer — must select FIRST |
| Customer | Conditional | Lookup | Required when Customer Type = Existing Customer |
| Legal ID | No | Text | Company registration number |
| Partner | No | Dropdown | Partner organization |
| Source | Yes | Cascader | Search Engine, Customer Referral, Conference, Advertisement, Telephone, Website, Other |
| Lead Level | Yes | Cascader | A-Level, B-Level, C-Level |
| Sales Pipeline | Yes | Dropdown | Default: "Lead Stage" |
| Details | Yes | Textarea | Sales notes and description |
| Email | No | Text | Contact email address |
| Phone | No | Text | Contact phone number |
| Address | No | Text | Business address |
| URL | No | Text | Company website |
| Business Card | No | File Upload | jpg/gif/png only, single file |
| Note | No | Textarea | Additional notes |
| Marketing Event | No | Text | Marketing Event Association |

### 3.4 Deal Details

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| Deal Category | Yes | Table Select Modal | PKI, OTP, ADSS, CTG, HSM, TKN, RDR, CARD, DG, MS |
| Entity | No | Tag/Multi-select | e.g., "SCMY", removable tags |
| Currency | No | Dropdown | Default from entity (MYR for SCMY). 8 currencies supported |
| Estimated Deal Amount | No | Number | Default: 0 |

### 3.5 Principal Allocation Table

> ⚠️ **Important**: At least one product + estimated amount must be filled. Products are account-scoped.

| Column | Type | Notes |
|--------|------|-------|
| Principal Name | Lookup | Shows "-" when empty |
| Product Description | Relation Modal | Opens "Select record" modal. Products are account-scoped |
| Estimated Amount | Number | Value sized by currency |
| MYR Value | Read-only | Auto-calculated |
| Weighted Amount | Read-only | = Estimated Amount × Win Rate |
| Operation | Actions | Insert \| Copy \| Delete |

**Table Toolbar**: + Add rows, Import, More (dropdown), Revoke

### 3.6 Contact Person Table

| Column | Type | Notes |
|--------|------|-------|
| Contact Person | Lookup | Opens "Select record" modal |
| Name | Auto-populated | Filled from Contact Person selection |
| Mobile | Auto-populated | Filled from Contact Person selection |
| Operation | Actions | Insert \| Copy \| Delete |

**Button**: "New Contact" (blue button above the table)

### 3.7 Footer

| Field | Description |
|-------|-------------|
| Win Rate | Default: 0.00%, auto-calculated from stage probability |

> 💡 **Tip**: At Targeting stage (0%), Weighted Amount is empty.

### 3.8 Currency & Estimated Amount Ranges

| Currency | Min | Max |
|----------|-----|-----|
| MYR | 5,000 | 50,000 |
| IDR | 15,000,000 | 150,000,000 |
| USD | 1,000 | 10,000 |
| SGD | 1,000 | 10,000 |
| EUR | 1,000 | 10,000 |
| GBP | 1,000 | 10,000 |
| THB | 30,000 | 300,000 |
| PHP | 50,000 | 500,000 |

---

## 4. Lead Details View

![Lead Details Page](../assets/lead-004.jpg)

### 4.1 Sub-Tabs

| Tab | Description |
|-----|-------------|
| Details | Form view with basic information |
| Process Record(N) | Audit trail (Lead Owner, Acquisition method, Current Status/Stage, timestamps) |
| Opportunity(N) | Related opportunities list |
| Sub-Leads(N) | Child leads under parent lead |
| Conversion Record(N) | Conversion history |
| System Record | Field-level change log (before/after values with timestamps) |

---

## 5. Lead Management Operations

### 5.1 "More" Menu Actions

| Action | Description |
|--------|-------------|
| Invalid | Disqualify lead, status → Invalid |
| Aggregate | Merge duplicate/related leads |
| Reset the Stage | Revert stage progression |
| Create Task | Create follow-up task |
| Print | Print lead record |
| Locked | Prevent further edits |

### 5.2 Service Team Management

- Modal with columns: Name, Position, Team Role (Head/Member), Permission (Edit/Read Only), Action (Delete)
- "+ Add more" button to add members
- Permission changes trigger immediate UI update

### 5.3 Lead Queue Configuration

| Field | Widget | Notes |
|-------|--------|-------|
| Name | Text | e.g., "SCMY" |
| No. | Read-only | Auto-generated: PLP20260417008 |
| Description | Textarea | Placeholder: "Please input" |
| Admin | Multi-select user picker | Removable chips |
| Member | Multi-select user picker | Removable chips |

**Claim & Assign Rules**:
- "Visible & Claimable by Members, Assignable by Admins"
- "Hidden from Members, Assignable by Admins"

**SLA**: 7-day reclaim countdown. Unprocessed leads auto-return to Public Pool.

---

## 6. Lead Conversion Workflow

### 6.1 Entry

From Lead List or Detail view, click **Convert** to open the "Sales Lead-Conversion" modal.

### 6.2 Step 1: Customer

- Verification/creation of the customer account
- Contacts from the Lead are automatically associated with the Customer

### 6.3 Step 2: Opportunity

| Field | Widget | Notes |
|-------|--------|-------|
| Sales Stage | Dropdown | → "Opportunity" |
| Deal Category | Dropdown | → "PKI" |
| Status | Badge | → "In Progress" |
| Currency | Dropdown | → "MYR" |
| Estimated Deal Amount | Numeric | — |
| Win Rate | Percent | → 25.00% |
| Exchange Rate | Numeric with stepper | — |
| Entity | Text | → "SCMY" |
| Sales Rep | Text input | — |
| Sales Record | Text area | — |

### 6.4 Opportunity Products Table

| Column | Notes |
|--------|-------|
| Serial No. | Row numbering |
| Principal Name | Product provider |
| Product | Product name |
| Estimated Amount | Deal value |
| MYR Value | Auto-calculated |
| Weighted Amount | = Estimated Amount × Win Rate |

### 6.5 Post-Conversion State

- Status badge changes to green **"Converted"**
- Opportunity(1) tab shows linked opportunity
- Conversion Record(1) tab shows conversion history

---

## 7. Lead Import

### 7.1 Entry

Click **Import** button (document icon with inward arrow) on the Lead List toolbar.

### 7.2 Import Modal

| Field | Required | Notes |
|-------|----------|-------|
| Import Mode | Yes | 4 modes: Add / Update / New and Update / Quick |
| Condition Field | Yes (*) | Set to "Lead Name" |
| Duplicate Check Field | No | Optional |

### 7.3 Import Modes

| Mode | Behavior |
|------|----------|
| Add Import | INSERT only — new records |
| Update Import | UPDATE only — existing records |
| New and Update Import | UPSERT — both new and existing |
| Quick Import | Single-table only |

### 7.4 Excel Template

**17 columns total, 9 required (*)**:

**Required**: Lead Name, Details, Mobile, Lead Level, Source, Lead Queue, Business Process, Status, Lock Status, Sales Pipeline

**Optional**: Customer Company, Customer Dept, Position, Email Address, Address, Marketing Event, Association

> ⚠️ **Enum validation**: Lead Level (A/B/C-Level), Source (7 values), Lock Status numeric mapping: 1=Unlock, 2=Locked

---

## 8. FAQ & Notes

### 8.1 Task Management

**Job Task Create Modal**:

| Field | Widget |
|-------|--------|
| Deadline | Date/Time Picker |
| Owner | User selector (chip) |
| Executor | User selector (chip) |
| Priority | Dropdown: High / Medium / Low |
| Associated Type | Dropdown → "Lead" (auto-linked) |
| C.C. Recipient | User selector |
| Description | Text area |
| Attachment | File upload |

**Task Feedback**: Completion Progress (Slider 0-100%), Rich text editor for description.

### 8.2 Business Rules

1. **72-hour timeout**: Leads unprocessed for 72 hours trigger a "recycle countdown" notification
2. **Conflict check**: Customer name uniqueness is checked against existing records
3. **Customer Type must be selected FIRST** before filling customer details
4. **Principal Allocation requires at least one product + estimated amount**
5. **Owner auto-assignment**: When created, Owner = Creator

### 8.3 Known Issues

- CRM typo: Details field uses `teaxtarea` (not "textarea")
- Principal Allocation empty modal: Only certain accounts have product records
- After form submission, page sometimes redirects to `about:blank` before final URL
