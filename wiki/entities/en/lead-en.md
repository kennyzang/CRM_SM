---
title: Lead Entity
created: 2026-04-22
updated: 2026-06-09
type: entity
tags: [lead, test/create, test/list, test/process]
sources: [raw/articles/crm-user-manual-v1.md, raw/articles/business-blueprint-v1.md, oss/Contact & Lead Creation.mp4, oss/Lead Management.mp4, oss/Lead Import.mp4, oss/Lead cConversion & Lead Queue & Task.mp4, oss/Service Team& Activity.mp4]
related: [[contact]], [[customer]], [[opportunity]]
language: en
---

# Lead Entity

## Overview

**Module**: Lead
**Entry URL**: `/web/#/current/sys-modeling/app/km-ltc/listView/1hvp24jjtw58w6kusw37gk49g2qoigpgajw1/1i1eojhciw60w46aow1nmuvgc1d4lb512vw1`
**Create URL**: `/web/#/current/sys-modeling/app/km-ltc/add/1htdn56g4w5ew3qpn9w24s4lj72d31qpk2we`
**Form ID**: `km-ltc` (Lead-to-Cash)

Leads represent potential sales opportunities that have not yet been qualified. They follow a lifecycle: Acquisition -> Assignment -> Follow-up -> Conversion (to Opportunity or Customer).

## Business Rules

1. **72-hour timeout**: Leads unprocessed for 72 hours trigger a "recycle countdown" notification - the lead is NOT automatically stripped, but the sales rep is reminded.
2. **Conflict check**: Customer name uniqueness is checked against existing records. Exclusive enterprise name conflicts are flagged.
3. **Lead Queue**: Pre-filled with "SMMY" (Securemetric Malaysia). Defaults to user's entity queue.
4. **Customer Type**: Must select "New Customer" or "Existing Customer" via radio BEFORE filling customer details.
5. **Principal Allocation**: Required detail table - at least one product + estimated amount must be filled. Products are account-scoped (Yuwin's account has products; others may return empty).
6. **Currency localization**: Currency field defaults per entity (e.g., MYR for SCMY). Multi-currency support (MYR, IDR, USD, SGD, EUR, GBP, THB, PHP).
7. **Win rate calculation**: Weighted amount = Estimated Amount x Win Rate (stage probability). At Targeting stage (0%), Weighted amount is empty.
8. **Autocomplete**: Lead Name and Mobile fields trigger autocomplete with existing record suggestions.
9. **Drag-sortable tables**: Principal Allocation and Contact Person rows can be reordered by drag-and-drop.
10. **Row operations**: Each table row supports Insert (add above), Copy (duplicate), Delete actions.
11. **Owner auto-assignment**: When created, Owner = Creator. Lead goes into Unassigned Lead Queue first.
12. **Assignment workflow**: Sales Manager assigns from Unassigned queue, triggers notification to assignee.
13. **Reclaim countdown**: "Reclaim Countdown" column tracks time until auto-reclaim. Negative values (e.g., "-1Days") indicate overdue leads.

## Lead Lifecycle & Statuses

| Status | Description |
|--------|-------------|
| Unassigned | New lead in queue, waiting for manager assignment |
| Pending | Assigned but not yet actively worked |
| Follow-up | Actively being worked by owner |
| Converted | Successfully converted to Opportunity/Customer |
| Invalid | Disqualified via More > Invalid |

## Lead Stage Pipeline

| Stage | Probability | Description |
|-------|-------------|-------------|
| Targeting | 0% | Initial identification |
| Prospecting | 5% | Active engagement |
| End | - | Process completed |

## Lead Management Operations (from "Lead Management" video)

### List View Operations
- **Ownership filter tabs**: My Owned, My Team Owned, My Involved, All
- **Status filter tabs**: All, Unassigned(N), Pending(N), Follow-up(N), Converted(N), Invalid(N)
- **Search**: "Search Phone" input field
- **Sorting**: Create Time, Claim/Assign Time, Last Followed-up Time
- **Bulk selection**: Checkboxes + header checkbox + bulk delete
- **Row count**: "Total N Item" at footer, pagination with Jump To

### Detail View Sub-Tabs
- **Details**: Form view with basic info
- **Process Record(N)**: Audit trail (Lead Owner, Method of Acquisition, Acquired Date, Current Status, Status Change Time, Current Stage, Stage Change Time)
- **Opportunity(N)**: Related opportunities list
- **Sub-Leads(N)**: Child leads under parent lead
- **Conversion Record(N)**: Conversion history
- **System Record**: Field-level change log (before/after values with timestamps)

### "More" Menu Actions
- **Invalid**: Disqualify lead, status -> Invalid
- **Aggregate**: Merge duplicate/related leads
- **Reset the Stage**: Revert stage progression
- **Create Task**: Create follow-up task
- **Print**: Print lead record
- **Locked**: Prevent further edits

### Service Team Management
- Modal with columns: Name, Position, Team Role (Head/Member), Permission (Edit/Read Only), Action (Delete)
- "+ Add more" button to add members
- Permission changes trigger immediate UI update

## Field Registry

All fields confirmed via Playwright MCP DOM inspection (2026-04-22). Video-confirmed fields marked with [V] (from "Contact & Lead Creation" and "Lead Management" videos, 2026-04-24).

### Header Fields (auto-populated, read-only) [V]

| Field | Label | Type | Notes |
|-------|-------|------|-------|
| Owner | Owner | Read-only | Auto-populated from user session (e.g., "Affendi") |
| Internal Dept | Internal Dept | Read-only | Auto-populated from user profile (e.g., "SCMY") |

### Basic Information

| Field | Label | data-tid | Type | Required | Notes |
|-------|-------|----------|------|----------|-------|
| leadName | Lead Name | `comp-fd_name--input` | text | Yes | Autocomplete suggests existing records |
| leadPool | Lead Queue | `ef-fs-fd_leads_pool-desktop` | lui-select | Yes | Defaults to user's entity queue (SMMY/SCMY) |
| customerType | Customer Type | `ef-fs-fd_customer_name-desktop` | radio | Yes | radio-1 = Existing, radio-2 = New |
| customerName | Customer | `comp-fd_new_customer--input` | lookup | Conditional | Required when customerType = Existing Customer |
| legalId | Legal ID | - | text | No | [V] |
| partner | Partner | - | dropdown | No | [V] Placeholder: "Select" |
| source | Source | `ef-fs-fd_source-desktop` | cascader | Yes | Options: Search Engine, Customer Referral, Conference, Advertisement, Telephone, Website, Other |
| leadLevel | Lead Level | `ef-fs-fd_lead_level-desktop` | cascader | Yes | Options: A-Level, B-Level, C-Level |
| salesPipeline | Sales Pipeline | `ef-fs-fd_lead_stage-desktop` | lui-select | Yes | Default: "Lead Stage" |
| details | Details | `comp-fd_remark--teaxtarea` | textarea | Yes | CRM typo: "teaxtarea" |
| email | Email | `comp-fd_email--input` | text | No | |
| phone | Phone | - | text | No | [V] |
| address | Address | `comp-fd_address--input` | text | No | |
| url | URL | - | text | No | [V] Placeholder: "Please enter" |
| businessCard | Business Card | - | file-upload | No | [V] jpg/gif/png only, single file |
| note | Note | - | textarea | No | [V] Placeholder: "Please input" |
| marketingEvent | Marketing Event | - | text | No | [V] Marketing Event Association |

### Deal Details (header-level fields) [V]

| Field | Label | data-tid | Type | Required | Notes |
|-------|-------|----------|------|----------|-------|
| dealCategory | Deal Category | `ef-fs-fd_deal_category-desktop` | table-select-modal | Yes | Options: PKI, OTP, ADSS, CTG, HSM, TKN, RDR, CARD, DG, MS |
| entity | Entity | - | tag/multi-select | No | [V] Example: "SCMY", removable tags |
| currency | Currency | - | dropdown | No | [V] Default from entity (MYR for SCMY) |
| estimatedDealAmount | Estimated Deal Amount | - | number | No | [V] Default: 0 |

### Footer [V]

| Field | Label | Type | Notes |
|-------|-------|------|-------|
| winRate | Win Rate | Percentage/Read-only | Default: 0.00%, auto-calculated from stage |

## Principal Allocation Detail Table

**Section wrapper**: `data-tid="ef-fs-mk_Principal_Allocation_list-desktop"`

Row 0 is always pre-populated. Column data-tids (row N):

| Column | data-tid | Type | Notes |
|--------|----------|------|-------|
| Principal Name | - | lookup/text | [V] Shows "-" when empty |
| Product Description | `fd_product_list-{N}-comp-mk_Principal_Allocation_list-fd_product_list-{N}-comp` | relation-modal | Opens "Select record" modal. Products are account-scoped. |
| Estimated Amount | `fd_prodcut_amt-{N}-comp-mk_Principal_Allocation_list-fd_prodcut_amt-{N}-number` | number | CRM typo: "prodcut" (not "product"). Value sized by currency. |
| MYR Value | - | calculated/read-only | [V] Auto-calculated (shows 0.00 by default) |
| Weighted amount | - | calculated/read-only | [V] = Estimated Amount x Win Rate |
| Operation | - | action links | Insert | Copy | Delete |

**Table Toolbar**: + Add rows, Import, More (dropdown), Revoke
**Sorting**: "Drag line can be sorted" -- drag-and-drop reorderable rows

## Contact Person Detail Table [V]

**Location**: Below Principal Allocation in Lead Create form

| Column | Widget Type | Notes |
|--------|------------|-------|
| Contact Person | Lookup (opens "Select record" modal) | Triggers modal with loading spinner |
| Name | Auto-populated Text | Filled from Contact Person selection |
| Mobile | Auto-populated Text | Filled from Contact Person selection |
| Operation | Action links | Insert | Copy | Delete |

**Table Toolbar**: + Add rows, Import, More (dropdown), Revoke
**Button**: "New Contact" (blue button above the table)
**Lookup Modal Pattern**: "Select record" title with Confirm/Cancel, loading spinner, searchable list

## Currency & Estimated Amount Ranges

**Currency**: Read from `data-id="mk_ltc_lead.fd_currency" .lui-select-selection-item`. Default: MYR.

**Estimated Amount Ranges** (typical SME deal sizes):

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

## Known Issues

1. **CRM typo "teaxtarea"**: The Details field uses `comp-fd_remark--teaxtarea` (not "textarea").
2. **Principal Allocation empty modal**: Only Yuwin's account has product records. Other accounts get an empty modal.
3. **`about:blank` redirect**: After form submission, the page sometimes redirects to `about:blank` before the final URL. Handle with a wait-for-redirect pattern.

## Test Cases from Excel (2026-06-05)

| TC ID | Title | Priority | Status |
|-------|-------|----------|--------|
| TC-001 | Lead Conversion - Service Team and Activity Carry-Over Validation | P1 | Not Tested |
| TC-002 | Lead Conversion - Multi-Currency Amount Calculation (IDR to MYR) | P1 | Not Tested |
| TC-003 | Lead Queue - 7-Day SLA Reclaim Countdown | P2 | Not Tested |
| TC-004 | Lead Import - Enum Validation and Duplicate Check | P2 | Not Tested |
| TC-005 | Lead Visibility - Entity Isolation and Service Team Access | P1 | Not Tested |

## Language Note

The CRM currently displays Chinese labels (e.g., "Lead Name" in Chinese characters). All Chinese text in the UI is considered a **defect** -- the system's official language is English.

## Lead Import [V] - from "Lead Import.mp4"

### Import Entry
- **Location**: Sales Lead List toolbar - Import button (document icon with inward arrow), between Delete and Export
- **Template**: "Lead Queue import template" - Excel file with 17 columns, 9 required (marked with *)

### Import Modal Fields
| Field | Widget | Required | Notes |
|-------|--------|----------|-------|
| Import Mode | Radio Card Group (4 options) | Yes | See modes below |
| Condition Field | Selectable Dropdown | Yes (*) | Set to "Lead Name" in demo |
| Duplicate Check Field | Dropdown | No | Optional |
| Confirm Import | Primary Button | - | Disabled until Condition Field populated |

### Import Modes
| Mode | Behavior |
|------|----------|
| Add Import | INSERT only - new records |
| Update Import | UPDATE only - existing records |
| New and update import | UPSERT - both new and existing |
| Quick import | Single-table only |

### Excel Template Columns (17 total)
**Required (*)**: Lead Name, Details, Mobile, Lead Level, Source, Lead Queue, Business Process, Status, Lock Status, Sales Pipeline
**Optional**: Customer Company, Customer Dept, Position, Email Address, Address, Marketing Event, Association

### Import Business Rules
- Enum validation: Lead Level (A/B/C-Level), Source (7 values), Lead Queue (2 values), Business Process (2 values)
- Lock Status numeric mapping: 1=Unlock, 2=Locked
- Duplicate Check module exists in sidebar; known bug: "Interface 500" on duplicate check
- After import: data visible in Lead Queue list view

## Lead Conversion Workflow [V] - from "Lead cConversion & Lead Queue & Task.mp4"

### 2-Step Conversion Modal: "Sales Lead-Conversion"
Progress stepper: **1. Customer ✓** -> **2. Opportunity ●**

> **Note**: Contacts from the Lead are automatically carried over to the Opportunity - no manual contact conversion step needed.

#### Step 1: Customer
- Verification/creation of the customer account
- Contacts from the Lead are automatically associated with the Customer

#### Step 2: Opportunity
| Field | Widget | Notes |
|-------|--------|-------|
| * Sales Stage | Dropdown | -> "Opportunity" |
| Deal Category | Dropdown | -> "PKI" / "ADSS" |
| Status | Badge | -> "In Progress" |
| Currency | Dropdown | -> "MYR" / "IDR" [V] |
| Estimated Deal Amount | Numeric | - |
| Win Rate | Percent | -> 25.00% |
| Exchange Rate | Numeric with stepper | e.g., 0.000223 for IDR->MYR [V] |
| Entity | Text | -> "SCMY" / "PTSM" [V] |
| Sales Rep | Text input | - |
| Contacts | Tag input | Required (*), auto-carried from Lead [V] |
| Sales Record | Text area | Auto-populated from activity log [V] |

### Carry Over Information [V] - NEW from "Service Team& Activity.mp4"

**Copy Team to** (checkboxes - all checked by default):
- [x] Customer - copy service team to new Customer record
- [x] Contact - copy service team to new Contact record
- [x] Opportunity - copy service team to new Opportunity record

**Copy Activities to** (checkboxes - all checked by default):
- [x] Customer - copy activity history to Customer
- [x] Contact - copy activity history to Contact
- [x] Opportunity - copy activity history to Opportunity

> **Tooltip**: "Need to check the box to 'add' the service team in the lead to customers, contacts, or opportunities"

### Opportunity Products Table (in conversion modal)
- Toolbar: "+ Add rows", "Import", "More", "Revoke"
- Columns: Serial No., Principal Name, Product, Estimated Amount, MYR Value, **Weighted amount**, Operation
- **Weighted amount = Estimated Amount × Win Rate** (auto-calculated)

### Post-Conversion State
- Status badge changes to green **"Converted"**
- Opportunity(1) tab shows linked opportunity
- Conversion Record(1) tab shows conversion history

## Lead Queue Configuration [V]

### Page: "Lead Queue Edit"
| Field | Widget | Notes |
|-------|--------|-------|
| Name | Text | e.g., "SCMY" |
| No. | Read-only | Auto-generated: PLP20260417008 |
| Description | Textarea | Placeholder: "Please input" |
| Admin | Multi-select user picker | Removable chips |
| Member | Multi-select user picker | Removable chips |

### Claim & Assign Rules (Radio)
- "Visible & Claimable by Members, Assignable by Admins"
- **"Hidden from Members, Assignable by Admins"** (selected in demo)

### Ownership Rules (Checkboxes)
- [x] "If the lead creator is a member of the lead queue"
- [x] "If the lead creator is an admin of the lead queue"
- [ ] "Under any circumstances"
- [ ] "If the lead Creator is:" (custom input, disabled)

### New Lead Notification
- Toggle switch: ON (blue)

### SLA
- 7-day reclaim countdown (Reclaim Countdown column shows "7Days")
- Unprocessed leads auto-return to Public Pool

## Task Management [V]

### Job Task Create Modal
| Field | Widget | Notes |
|-------|--------|-------|
| Deadline | Date/Time Picker | e.g., "04/30/2026 05:57 pm" |
| Owner | User selector (chip) | - |
| Executor | User selector (chip) | - |
| Priority | Dropdown | High / Medium / Low |
| Associated Type | Dropdown | -> "Lead" (auto-linked) |
| Associated Data | Lookup (read-only) | Auto-populated |
| C.C. Recipient | User selector | - |
| Description | Text area | - |
| Attachment | File upload | - |

### Reminder Configuration
- Timing dropdown: "At deadline", "15 min before", "30 min", "1 hour", "3 hours", "1 day"
- Reminder table: Serial No., Method, Insert | Copy | Delete

### Task Details Page
- Metadata: Status ("In progress"), Priority, Release Time, Initiator
- Tabs: Basic Info | Execution History | Task Feedback
- Progress bar (0% -> intermediate -> 100%)
- Sub-tasks: "+ Add Sub-tasks"

### Task Feedback Modal
- Completion Progress: **Slider widget** (0-100%)
- Feedback to notifier: Checkboxes (Owner, C.C. to)
- **Rich text editor** (WYSIWYG) for completion description
- Attachment upload

### Task Workflow States
- In progress -> Completed / To be confirm -> Completed
