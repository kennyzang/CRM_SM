---
title: Opportunity Entity
created: 2026-04-22
updated: 2026-06-09
type: entity
tags: [opportunity, test/create, test/list, test/process]
sources: [raw/articles/crm-user-manual-v1.md, raw/articles/business-blueprint-v1.md, oss/Opportunity Management.mp4, doc/Securemetric CRM_new features.docx, oss/Service Team& Activity.mp4]
related: [[customer]], [[quote]], [[pl]], [[lead]], [[pipeline-kanban]]
language: en
---

# Opportunity Entity

## Overview

**Module**: Opportunity
**Create URL**: `/web/#/current/sys-modeling/app/km-ltc/add/1i02ls02kw5jw69bw36pppvh884viq1fciw1?lbpmTemplateId=1i0aaofkow4uw5ecpw295jcfe1h88ca3t5w1`

Opportunities are qualified deals driven by P&L (Profit & Loss) analysis. The P&L is the pricing engine; quotes are read-only views generated from approved P&Ls.

## Business Rules

1. **P&L-driven pricing**: The P&L is the engine; the quote is just a "view". Quotes cannot be edited directly -- changes must be made to the underlying P&L.
2. **Version locking**: P&L V1 -> Quote V1. Price changes require creating a new version.
3. **Approval workflow**: AM submits -> MD/CM approves. Rejected P&Ls must be revised and resubmitted.
4. **Stage pipeline**: Opportunities progress through predefined stages via a stage progression engine (progression engine).
5. **Only "active" P&L versions** are included in pipeline reports, preventing data inflation.
6. **Report sorting**: Entity -> Rep -> Date.

## Field Registry

Source: Playwright MCP DOM inspection (2026-04-22).

| Field | Label | data-tid | Type | Required | Notes |
|-------|-------|----------|------|----------|-------|
| opportunityName | Opportunity Name | `comp-fd_name--input` | text | Yes | |
| estimatedCloseDate | Estimated Close Date | `comp-fd_expected_closing_date--date` | text | No | Date picker - fill as "YYYY-MM-DD" then Enter |
| dealCategory | Deal Category | `mk_ltc_opportunity.fd_deal_category` | cascade | No | Same options as Lead |
| salesPipeline | Sales Pipeline | `ef-fs-fd_opportunity_stage-desktop` | lui-select | No | Stage options loaded dynamically |
| principalInCharge | Principal in Charge | undefined | relation-modal | No | Opens "Select record" modal |
| productDescription | Product Description | `ef-fs-mk_opportunity_product_list-desktop` | detail-table | No | Inline editable table |

## P&L Approval Workflow

```
AM submits P&L -> MD/CM reviews -> Approved -> Quote generated
                              ->
                         Rejected -> AM revises -> Resubmit
```

## Known Issues

1. **Approval flow not tested**: Test coverage for P&L approval workflow is 0%.
2. **P&L version locking**: Tests must handle the "cannot edit quote directly" constraint.
3. **UI Bug**: "Project Character" field in "Add Group Member" modal - no input widget rendered.
4. **Typo**: "Oppourtunities" misspelled in stage template "Apply to" field.
5. **Inconsistent stage order**: Detail view shows Qualifying->Price Negotiation->Proposal/POC, but template config shows Qualifying->Proposal/POC->Price Negotiation.

## Opportunity Management - Video Findings [V]

### List View
- Entry: **CRM -> OPPORTUNITY -> Opportunity**
- View tabs: `Owned` | `Team's` | `Involved` | `All`
- Status filter pills: `All` | `Open` | `Won` | `Lost` | `Suspended` | `Invalid`
- Advanced search: Opportunity Name, Customer, Owner, Department, Sales Pipeline, Estimated Close Date (range), Create Time (range)
- Grid columns: Serial No., Opportunity Name, Customer, Owner, Estimated Close Date, Status, Sales Pipeline, Estimated Deal Amount
- Bulk actions: Checkbox selection, Delete

### Detail View
- Top action bar: `Suspend` | `Change Owner` | `Reset Stage` | `More`
- Summary header: Opportunity Name, Deal value (red), Opportunity Code (auto-generated: **BSOP+YYYYMMDD+sequence**), Owner, Customer, Close Date, Service Team
- Basic Information fields: Opportunity Name, Customer, Opportunity ID, Estimated Close Date, Status, Source Lead, Sales Pipeline, Owner, Department

### Stage Pipeline [V] - Internal Opportunity Stages

| Order | Stage | Win Rate | Type | Auto-Advance |
|-------|-------|----------|------|--------------|
| 1 | Qualifying | 25% | Start | Manual |
| 2 | Proposal/POC | 50% | In Progress | Manual |
| 3 | Price Negotiation | 75% | In Progress | Manual |
| 4 | Deal Won | 100% | End | - |
| 5 | Deal Lost | 0% | End | - |

- Horizontal stepper visualization with numbered circles
- "Advance to the next stage" button (blue CTA)
- All stages Manual advancement

### CRM Pipeline Stages (Dashboard View) [D]

> The CRM Pipeline dashboard uses a **separate 6-stage model** that spans the entire sales cycle across multiple entities, not just the Opportunity's internal stages. See [[pipeline-kanban]] for details.

| Stage | Entity | Description |
|-------|--------|-------------|
| **LEAD** | Lead | Initial lead captured |
| **OPPORTUNITY** | Opportunity | Lead qualified, opportunity created |
| **QUOTATION** | Quote | Quotation generated from approved P&L |
| **PO** | Purchase Order | Customer PO received |
| **SALES ORDER** | Sales Order | Internal SO created |
| **PAYMENT** | Payment | Payment received / deal closed |

### Opportunity Details Page [V]

![Opportunity Details - Quotation Tab](../assets/opportunity-details-001.png)

- **Header**: Opportunity name, deal value, Opportunity Code (BSOP+YYYYMMDD+seq), Owner, Customer Name, Close Date
- **Stage tracker**: Horizontal stepper with "Advance to the next stage" button
- **Sub-tabs**: Details | Product(n) | P&L(n) | Quotation(n) | PO(n) | Sales Order(n) | Contact(n) | More
- **Quotation sub-tab**: Shows existing quotations table + "Create" button
- **Right sidebar**: Service Team (members with avatars) + Activity Log (timeline of contacts/calls)

### Sub-tabs on Detail Page
1. Details | 2. Product(n) | 3. P&L(n) | 4. Quotation(n) | 5. PO(n) | 6. Sales Order(n) | 7. Decision-Maker Map(n) | 8. Competitive Analysis(n) | 9. Cor More

### Product Line Items
- Columns: No., Service Period, Principal Name, Product Name, Estimated Amount
- Header deal amount = roll-up sum of all line items

### Ownership Transfer Logic
- New owner selection via user picker
- Original owner options: Remove from team / Demote to team member
- Permission: Read-Only / Read-Write
- Team continuity: Clear All / Keep Existing

### Service Team Management

**Add Team Members Modal** [V] - from "Service Team& Activity.mp4"
- **Members** (*): User selector with "Select" placeholder + person icon button
- **Permission** (*): Radio buttons - "Read-Only" (default) / "Read-Write"
- **Team Role**: Checkbox - "Ordinary Members" (checked by default)
- **Project Role**: Checkbox - "Customer Manager" (unchecked by default)
- **Action Buttons**: Confirm (blue) | Cancel

> **Business Logic**: Permission controls edit access; Team Role defines internal team structure; Project Role defines functional role on the account.

- Bug: "Project Character" field in old version has no input widget

### Task Creation (slide-out drawer)
- Fields: Task Title (*), Deadline (*), Owner, Executor (*), Priority (*), Associated Type, Associated Data (auto-linked), C.C. Recipient, Description, Attachment
- Reminder sub-table with: Reminder Time, Method

### Interaction Log (Activity Logging) [V] - from "Service Team& Activity.mp4"

From Opportunity Details page, logging a new interaction/meeting:

| Field | Widget | Notes |
|-------|--------|-------|
| Interaction Date | Date/Time Picker | Pre-filled with current datetime [V] |
| Contact | Dropdown/Tag | Pre-filled from Opportunity contacts [V] |
| Our Attendee | User Lookup | Pre-filled with Opportunity Owner [V] |
| Related Business | Read-Only Lookup | Auto-filled with Opportunity Name [V] |
| Discussion Details | Text Area | Placeholder "Enter", 0/1000 char counter [V] |
| Attachment | File Upload | "Upload the attachment" [V] |
| **Submit** | Primary Button | Blue, at bottom of form [V] |

### Approval Workflow
- Approval Records table: Start Node -> Drafting Node -> Approval -> End Node
- Timestamps for each node
- Handler assignment (e.g., "System" for automated)

## Test Cases from Excel (2026-06-05)

| TC ID | Title | Priority | Status |
|-------|-------|----------|--------|
| TC-006 | Opportunity Stage Progression - 5-Stage Pipeline with Win Rate | P1 | Not Tested |
| TC-007 | Permission - Owner Without Service Team Access (Known Bug Regression) | P1 | Not Tested |
| TC-008 | Service Team - Add Member with Permission and Role Configuration | P1 | Not Tested |
| TC-009 | Activity Log - Interaction Recording Across Entity Types | P2 | Not Tested |
| TC-010 | Opportunity Ownership Transfer - Team Continuity and Permission | P2 | Not Tested |

## Language Note

Chinese labels in the Opportunity UI (e.g., "Opportunity Name" in Chinese characters) are **defects**.
