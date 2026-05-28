---
title: Lead Management Operations
created: 2026-04-24
updated: 2026-04-24
type: procedure
tags: [lead, test/list, test/process]
sources: [oss/Lead Management.mp4]
related: [[lead]], [[widget-special-controls]], [[fill-crm-form-procedure]]
---

# Lead Management Operations

> Source: Frame analysis of "Lead Management" video (74.3 MB, 1188s, 79 frames).
> Captures the full lead lifecycle beyond creation: list operations, detail view, status transitions, and team management.

## Screens Overview

| Screen | Description |
|--------|-------------|
| Sales Lead List | Main list with 5 ownership tabs + 5 status filter tabs |
| Lead Details | Detail view with stage stepper + 6 sub-tabs |
| Service Team Modal | Team member management with role/permission controls |
| Page Load Error | Network/server failure recovery screen |

## Sales Lead List Operations

### Ownership Filter Tabs

| Tab | Scope |
|-----|-------|
| My Owned | Leads owned by current user |
| My Team Owned | Leads owned by team members |
| My Involved | Leads where user is involved (service team) |
| All | All leads (permission-dependent) |

### Status Filter Tabs

| Tab | Status |
|-----|--------|
| All | All statuses |
| Unassigned(N) | Not yet assigned to a sales rep |
| Pending(N) | Assigned, awaiting action |
| Follow-up(N) | Actively being worked |
| Converted(N) | Successfully converted |
| Invalid(N) | Disqualified |

### List Table Columns

| Column | Type | Notes |
|--------|------|-------|
| Serial No. | Auto-number | |
| Lead Name | Text + link | Click opens detail view |
| Source | Badge | Color-coded |
| Owner | Text | Current owner |
| Internal Dept | Text | Department code |
| Lead Queue | Text | Entity queue (SCMY, SMMY) |
| Lead Level | Badge | A-Level, B-Level, C-Level |
| Status | Badge | Color-coded (Pending=purple, Follow-up=purple, Converted=green, Invalid=gray) |
| Details | Link | Opens detail view |
| Reclaim Countdown | Timer | Negative values (e.g., "-1Days") = overdue |
| Partner | Text | Can be "-" |
| Created Time | DateTime | Sortable |
| Last modified time | DateTime | |
| Claim/Assign Time | DateTime | Sortable |
| Last Followed-up Time | DateTime | Sortable |

### Toolbar Operations

| Button/Control | Action |
|----------------|--------|
| + Create | Open lead creation form |
| Search Phone | Text search on phone field |
| Filter | Open advanced filter modal |
| Sort dropdown | Sort by Create Time, Claim/Assign Time, Last Followed-up Time, or "More" |
| Refresh | Reload list |
| Export | Export list to file |
| Import | Bulk import leads |
| Trash icon | Bulk delete (active when rows selected) |
| Pagination | Page numbers, < >, Jump To, items per page (default 10) |

## Lead Detail View

### Stage Stepper

Visual progress indicator showing current lead stage:
- **Targeting** (0% probability) — initial identification
- **Prospecting** (5% probability) — active engagement
- **End** — process completed

"Advance to next stage" button to move forward. Can "End" at any point.

### Sub-Tabs

| Tab | Content | Searchable |
|-----|---------|------------|
| Details | Basic info form | No |
| Process Record(N) | Audit trail: Lead Owner, Method of Acquisition, Acquired Date, Current Status, Status Change Time, Current Stage, Stage Change Time | Yes |
| Opportunity(N) | Related opportunities list | No |
| Sub-Leads(N) | Child leads under parent | Yes |
| Conversion Record(N) | Conversion history | No |
| System Record | Field-level change log (before/after values with timestamps) | No |

### "More" Menu Actions

| Action | Description |
|--------|-------------|
| Invalid | Disqualify lead, status changes to Invalid |
| Aggregate | Merge duplicate or related leads |
| Reset the Stage | Revert stage progression back to earlier stage |
| Create Task | Create a follow-up task |
| Print | Print lead record |
| Locked | Lock record to prevent further edits |

## Service Team Management

Accessed from Lead Detail view. Modal with team member table.

### Columns

| Column | Values |
|--------|--------|
| Name | Team member name |
| Position | Job position |
| Team Role | Head / Member |
| Permission | Edit / Read Only |
| Action | Delete link |

### Operations
- "+ Add more" button to add new team member
- "Create" button to confirm adding a member
- Click permission dropdown to change Edit <-> Read Only
- "Delete" link to remove a member
- Permission changes trigger immediate UI update

## Workflow Transitions

### Lead Creation → Assignment
1. Lead created → Owner = Creator, status = Unassigned
2. Lead appears in Unassigned Lead Queue
3. Sales Manager assigns to specific Sales Rep
4. System sends notification to assignee
5. Status transitions: Unassigned → Pending

### Lead Processing
1. Owner works lead → status = Follow-up
2. Logs activity via "New Log" or "Follow-up" button
3. Advances stage via "Advance to next stage" button
4. Can "End" the process at any point

### Lead Conversion
1. Qualified lead → Click "Convert" button (top right of detail view)
2. Converts Lead → Opportunity/Account/Contact
3. Recorded in "Conversion Record" tab

### Lead Disqualification
1. Open "More" menu → Select "Invalid"
2. Status changes to Invalid
3. Counted in Invalid(N) tab

## Key Business Rules

| Rule | Description |
|------|-------------|
| RBAC: Sales Admin/AM | Can create/import leads but CANNOT self-assign |
| RBAC: Sales Manager | Authorized to assign leads from Unassigned Lead Queue |
| RBAC: Service Team Head | Has "Edit" permission on the lead record |
| RBAC: Service Team Member | Can have "Edit" or "Read Only" permission |
| Reclaim SLA | Leads overdue (negative countdown) may be auto-reclaimed to pool |
| Weighted Amount | = Estimated Amount x Win Rate (stage probability). At Targeting (0%), value is empty |
| Currency | Multi-currency support, defaults per entity (MYR for SCMY) |
| Notification: Unassigned Lead | Pushes to-do notification to Sales Manager |
| Notification: Assignment | Sends notification to assigned AM |

## Error States

| Error | Context | Description |
|-------|---------|-------------|
| Page Load Failure | Network/server error | "Click or tap the page to reload" with globe graphic |
| Empty List | No matching records | "There is currently no content, go to create new content" |
| Empty Tab | No sub-records | "No Data" with document/box icon |
| Overdue Reclaim | SLA exceeded | "-1Days" shown in Reclaim Countdown column |
| Loading Spinner | Data fetching | Row-level loading state |
| Modal Loading | Service Team modal | Circular spinner during data fetch |

## Sidebar Navigation (Complete Structure)

```
CRM
├── Duplicate Check
├── LEAD
│   ├── Sales Lead
│   ├── Lead Queue
│   └── Contact Person
├── CUSTOMER
│   ├── Customers
│   ├── Public Pool
│   ├── Co-Selling
│   ├── Competitor
│   └── Competitive Products
├── OPPORTUNITY
│   ├── Opportunity
│   ├── P&L
│   └── Quotation
├── Purchase Order
│   └── PO List
├── SALES ORDER
├── REVENUE
├── PRODUCT
│   ├── Product List
│   └── Principal
├── Competitive Analysis
├── Report
├── Mgt View
├── Basic Data Settings
│   ├── Company
│   ├── Account
│   ├── Tax Rate Settings
│   ├── Business Rules
│   └── Data Maintenance
└── CONSOLE
```
