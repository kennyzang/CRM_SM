---
title: Opportunity User Manual (English)
created: 2026-06-04
updated: 2026-06-17
type: user-manual
tags: [opportunity, user-manual, en]
---

# Opportunity User Manual

> **Version**: V1.3 | **Date**: 2026-06-17 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [List View](#2-list-view)
3. [Create an Opportunity](#3-create-an-opportunity)
4. [Details View](#4-details-view)
5. [Business Operations](#5-business-operations)
6. [P&L & Quotation Workflow](#6-pl--quotation-workflow)
7. [Business Rules & Workflow](#7-business-rules--workflow)
8. [FAQ & Notes](#8-faq--notes)

---

## 1. Module Overview

The **Opportunity** module manages confirmed deals in Securemetric CRM — commercial engagements with the potential to generate revenue. Opportunity management covers core elements such as sales team, product offerings, estimated value, expected close date, and win rate, while helping the business establish a standardised sales process with a measurable, trackable pipeline.

Opportunities can be converted from Leads or created directly. All downstream documents — P&L analyses, Quotations, Sales Orders, Purchase Orders — are anchored to the Opportunity record.

### 1.1 Entry Points

| Entry Point | Path |
|-------------|------|
| Main entry | Left sidebar → **OPPORTUNITY → Opportunity** | [Direct Link](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1hvp2d7e8w4vw6hlbw3tpla2s2mv5r6728w1/1i1okcl85w64w1s61w3ak7jcrlsa1c81ifw1?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1){: target="_blank" rel="noopener"} |
| From Lead conversion | Lead detail page → **Convert** → Step 2: select Opportunity |

### 1.2 Core Functions

| Function | Description |
|----------|-------------|
| Stage Pipeline | Track deal progress through multiple stages with Stage Pusher support |
| P&L Management | Securemetric custom pricing engine with approval workflow |
| Quotation Generation | Read-only quotations auto-generated from approved P&Ls |
| Ownership Transfer | Transfer deal ownership with team continuity options |
| Service Team | Manage team members and their read/write permissions |

### 1.3 Opportunity Status Description

Opportunity records carry two independent status dimensions:

**Progress Status**

| Status | Description | Final State |
|--------|-------------|-------------|
| Not Started | Opportunity has been created but has not yet entered the advancement flow | No |
| In Progress | Opportunity is actively advancing through stages | No |
| Suspended | Opportunity is temporarily paused; may resume when conditions change | No |
| Won | Deal successfully closed; final outcome is a win | Yes |
| Lost | Deal failed; won by a competitor | Yes |
| Invalid | Opportunity terminated for a specific reason; no longer commercially viable | Yes |

> Won, Lost, and Invalid are the three closing statuses. Once reached, an opportunity cannot revert to In Progress or Suspended.

**Stage Definition (Sales Pipeline)**

| Order | Stage | Win Rate | Stage Type |
|-------|-------|----------|------------|
| 1 | Qualifying | 25% | Start |
| 2 | Proposal/POC | 50% | In Progress |
| 3 | Price Negotiation | 75% | In Progress |
| 4 | Deal Won | 100% | End |
| 5 | Deal Lost | 0% | End |

### 1.4 Opportunity Lifecycle

```
Lead conversion / manual creation
             ↓
  [In Progress] Qualifying stage
             ↓
  Stage advancement (Proposal/POC → Price Negotiation)
             ↓                     ↘ Suspend (conditions not met)
  [In Progress] Price Negotiation        ↓
             ↓                    Can resume to In Progress
             ↓
  ┌──────────┬──────────┬──────────┐
  ↓          ↓          ↓
[Won]      [Lost]    [Invalid]
  ↓
Quotation → Sales Order → Contract
```

---

## 2. List View

The Opportunity list displays all records the logged-in user has access to.

![Opportunity List View](../../assets/opportunity-list-001.png)

### 2.1 View Scenarios

| Scenario Tab | Scope |
|--------------|-------|
| Owned | Opportunities where the current user is the owner |
| Team's | Opportunities owned by the current user's team (manager view) |
| Involved | Opportunities where the current user is a Service Team member |
| All | All opportunities visible to the current user |

### 2.2 Status Filter Pills

- **All** | **Open** | **Won** | **Lost** | **Suspended** | **Invalid**

### 2.3 Advanced Search

| Search Field | Type |
|-------------|------|
| Opportunity Name | Text |
| Customer | Lookup |
| Owner | User selector |
| Department | Dropdown |
| Sales Pipeline (Stage) | Dropdown |
| Estimated Close Date | Date range |
| Create Time | Date range |

### 2.4 Grid Columns

| Column | Description |
|--------|-------------|
| Opportunity Name | Deal name; click to open details |
| Customer | Associated customer |
| Owner | Deal owner |
| Estimated Close Date | Expected close date |
| Sales Pipeline | Current stage |
| Estimated Deal Amount | Deal value |

---

## 3. Create an Opportunity

### 3.1 Entry

Click **+ Create** on the Opportunity list toolbar; or click **Convert** on a Lead detail page and select Opportunity in Step 2 of the conversion flow.

### 3.2 Basic Fields

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| Opportunity Name | Yes | Text | Deal name; recommended format: Customer-Product-Year |
| Estimated Close Date | No | Date Picker | Format: YYYY-MM-DD |
| Deal Category | No | Cascader | PKI, OTP, ADSS, and other product line options |
| Sales Pipeline | No | Dropdown | Stage options loaded dynamically; defaults to first stage |
| Principal in Charge | No | Relation Modal | Links to Customer/Partner; opens "Select record" modal |
| Product Description | No | Detail Table | Inline editable table; add one product/service per row |

### 3.3 Saving

Click **Save** in the top action bar. The system assigns an Opportunity Code (format: **BSOP+YYYYMMDD+sequence**) and returns to the list.

---

## 4. Details View

The Opportunity detail page shows the main record at the top and multiple sub-tabs below.

![Opportunity Details](../../assets/opportunity-detail-001.png)

### 4.1 Top Action Bar

| Action | Description | When Visible |
|--------|-------------|-------------|
| Suspend | Pause the opportunity | Status is **In Progress**, and current user is the owner |
| Open | Resume a suspended opportunity | Status is **Suspended**, and current user is the owner |
| Change Owner | Transfer ownership to another user | Status is **In Progress** or **Suspended**; actual visibility is controlled by role permissions |
| Reset Stage | Reset the sales stage back to the default starting stage | Current user is the owner, and status is **In Progress** or **Won** |
| Edit | Enter edit mode | Always visible; only the owner, administrator, or Service Team members with Read-Write permission can make changes |
| New Task | Create a task linked to this opportunity | Opportunity is in a saved state |
| Create P&L | Create a new P&L analysis for this opportunity | Opportunity is in a saved state |

### 4.2 Summary Header

- Opportunity Name, Estimated Deal Amount (highlighted in red)
- Opportunity Code: auto-generated in format **BSOP+YYYYMMDD+sequence**
- Owner, Customer, Close Date, Service Team

### 4.3 Sub-tabs

| Tab | Content |
|-----|---------|
| Details | Basic information in form view; editable |
| Product (N) | Product and service line items |
| P&L (N) | Profit & Loss analyses — Securemetric pricing engine |
| Quotation (N) | Read-only quotations auto-generated from approved P&Ls |
| PO (N) | Purchase orders |
| Sales Order (N) | Sales orders |
| Decision-Maker Map (N) | Contact decision network chart for Party A stakeholders |

### 4.4 Product Line Items

| Column | Description |
|--------|-------------|
| No. | Row number |
| Service Period | Service or licence duration |
| Principal Name | Product provider / principal entity |
| Product Name | Specific product name |
| Estimated Amount | Line item value |

> **Note**: The Estimated Deal Amount in the header is the roll-up sum of all product line items and cannot be manually overridden.

---

## 5. Business Operations

### 5.1 Suspend & Resume

Temporarily pause an active opportunity when the customer has deferred a decision, a budget is frozen, or a project is delayed.

> **Prerequisite**: Current user is the opportunity owner; opportunity status is **In Progress**.

**Path**: Opportunity detail page → top-right → **Suspend**

- After suspending, the opportunity status changes to **Suspended**. The stage is preserved, and the record is excluded from active pipeline reports.
- To resume, click the **Open** button. The status returns to **In Progress** and the opportunity continues from the same stage.
- Activity logs and sales records can still be added while an opportunity is suspended.

### 5.2 Change Owner

Formally transfer ownership of an opportunity to another user — used for sales rep departures, account re-assignments, or team restructuring.

> **Prerequisite**: Opportunity status is **In Progress** or **Suspended**.

**Path**: Opportunity detail page → top-right → **Change Owner**

| Option | Description |
|--------|-------------|
| New Owner | Select the new owner via the user picker modal |
| Original Owner Disposition | **Remove from team** (completely removed) or **Move into the team as an ordinary member** (stays with specified permission) |
| Permission | Read-Only / Read-Write — controls edit access for the original owner if kept in the team |
| Team Continuity | **Keep Existing** (all current members retained) or **Clear All** (all existing members removed except the new owner) |

### 5.3 Stage Advancement & Stage Pusher

**Stage Advancement**

The top of the Opportunity detail page shows a horizontal stepper that visualises the current stage with numbered circles.

- Click **Change Stage** (blue CTA button) to manually advance to the next stage.
- All stage transitions require manual confirmation — there is no automatic stage advancement.
- If a **Stage Pusher** is configured for the current stage, the system validates that all required tasks are completed before allowing advancement.

**Stage Pusher**

The Stage Pusher is an admin-configured guidance tool that divides the sales cycle into defined stages, each with a checklist of required tasks. It helps sales teams standardise follow-up processes and increase win rates by ensuring critical activities are not skipped.

- The current stage's task checklist is displayed in the corresponding area of the Opportunity detail page.
- Complete each item in the checklist before advancing to the next stage.
- Stage Pusher configuration is maintained in the system console under **Console → Stage Pusher**.

> **Reset Stage**: To restart the stage progression from the beginning, a user with the appropriate permission can click **Reset Stage** to reset the sales stage back to the default starting stage (first pipeline node) and provide a reset reason. This action is available when the opportunity status is **In Progress** or **Won**.

### 5.4 Activity Log (Interaction Recording)

Record customer interactions — meetings, calls, demos, and other touchpoints — to build a complete chronological follow-up timeline for the opportunity.

**Path**: Opportunity detail page → right sidebar → **New Log** or **Log Activity**

| Field | Widget | Notes |
|-------|--------|-------|
| Interaction Date | Date/Time Picker | Pre-filled with current datetime |
| Contact | Dropdown/Tag | Pre-filled from opportunity-linked contacts |
| Our Attendee | User Lookup | Pre-filled with opportunity owner |
| Related Business | Read-Only Lookup | Auto-filled with opportunity name |
| Discussion Details | Text Area | Up to 1,000 characters |
| Attachment | File Upload | Upload meeting notes or supporting files |

After submission, the log entry appears in the Activity Log timeline with date, user avatar, activity type badge, and timestamp. Attachments are downloadable directly from the log entry.

---

## 6. P&L & Quotation Workflow

> This section describes functionality specific to Securemetric CRM and is not part of the standard EasyCraft deployment.

### 6.1 Pricing Architecture

```
Opportunity → P&L Creation → P&L Approval → Quotation Generation (read-only)
```

The P&L (Profit & Loss) is Securemetric's pricing engine. Quotations are read-only views automatically generated from an **approved P&L** and cannot be edited directly.

### 6.2 Key Rules

1. **P&L-driven pricing**: All price changes must go through modifying the P&L and resubmitting for approval. Quotations cannot be edited directly.
2. **Version locking**: P&L V1 generates Quote V1. Price adjustments require a new P&L version (V2, V3…); previous versions are retained for audit purposes.
3. **Active version**: Only P&L versions in **Active** status are included in pipeline report value totals.
4. **Approval workflow**: Account Manager (AM) submits → Managing Director (MD) / Commercial Manager (CM) approves.

### 6.3 Approval Workflow

```
AM submits P&L
       ↓
MD/CM reviews
  ↙         ↘
Approved    Rejected
  ↓              ↓
Quotation    AM revises P&L → Resubmit
generated
```

The Approval Records table includes: Start Node → Drafting Node → Approval Node → End Node, each showing the actor and timestamp.

---

## 7. Business Rules & Workflow

### 7.1 Role Permissions

| Permission | Description | General Employee | Sales Admin | Administrator |
|------------|-------------|:---------------:|:-----------:|:-------------:|
| Opportunity - Create | Create new opportunity records | ✓ | ✓ | ✓ |
| Opportunity - Edit | Edit opportunity basic information | ✓ | ✓ | ✓ |
| Opportunity - Delete | Delete opportunity records | — | ✓ | ✓ |
| Opportunity - Import | Batch import opportunity data | — | ✓ | ✓ |
| Opportunity - Export | Export opportunity list | ✓ | ✓ | ✓ |
| Opportunity - Suspend | Suspend / resume an opportunity (owner only) | ✓ | ✓ | ✓ |
| Opportunity - Change Owner | Transfer opportunity ownership | — | ✓ | ✓ |
| Opportunity - Reset Stage | Reset opportunity stage to the first stage (owner only) | ✓ | ✓ | ✓ |
| Opportunity - View All | View opportunities not owned by current user | — | ✓ | ✓ |

> Actual permission assignments are governed by system configuration. Contact your system administrator to request changes.

### 7.2 Service Team Management

The Service Team controls which users have access to an opportunity and the level of access they hold.

**Add a team member**: Opportunity detail page → Service Team sidebar → **+ Add**

| Field | Required | Widget | Notes |
|-------|----------|--------|-------|
| Members | Yes | User selector | Select the user to add |
| Permission | Yes | Radio buttons | **Read-Only** (view only) / **Read-Write** (can edit) |
| Team Role | Yes | Checkbox | **Ordinary Members** (checked by default) |
| Project Role | No | Checkbox | **Customer Manager** (unchecked by default) |

> **Permission notes**:
> - Service Team permission is entity-specific — membership on an Opportunity's Service Team does NOT grant access to the linked Customer or Lead records.
> - Permission changes take effect immediately without requiring a re-login.

---

## 8. FAQ & Notes

**Q: How do I view all P&L versions for an opportunity?**
Navigate to the Opportunity detail page → **P&L** sub-tab. All versions are listed chronologically, showing version number, status (Draft / Under Review / Approved / Rejected), and amount.
