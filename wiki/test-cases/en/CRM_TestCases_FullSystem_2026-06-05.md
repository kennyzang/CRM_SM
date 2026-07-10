# Securemetric CRM - Comprehensive Deep Test Cases

> **Generated**: 2026-06-05
> **Scope**: Full system functionality - deep business logic, NOT basic CRUD
> **Methodology**: Based on 17 video analyses (visual + STT audio), Business Blueprint V1, DOCX new features, and schema-driven field registries
> **Latest Knowledge**: Video order analysis - most recent features (Task Management, Service Team, Contract/Payment Schedule from 2026-06-05) take precedence over earlier definitions
>
> **Test Roles:**
> | Role | Description |
> |------|-------------|
> | Sales Rep | Primary user - creates leads, manages opportunities, generates P&L/Quotes |
> | Sales Manager | Queue admin, approval authority, permission manager |
> | Solution Architect | P&L collaborator - reviews and adjusts pricing/technical specs |
> | PM (Project Manager) | Payment Schedule owner - updates completion %, triggers invoicing |
> | Finance User | Collection confirmation, payment reconciliation |
> | Operations | Delivery management, courier tracking |
>
> **Priority Levels:**
> | Level | Description |
> |-------|-------------|
> | P0 | Critical - must pass before any release (End-to-End Pipeline) |
> | P1 | High - core business logic, known bug regression, permission enforcement |
> | P2 | Medium - secondary features, UI/UX verification, edge cases |
> | P3 | Low - exploratory, needs further clarification |

---

## TC-001 - Lead Conversion - Service Team and Activity Carry-Over Validation

| Field | Value |
|-------|-------|
| **Module** | Lead |
| **Category** | Data Inheritance |
| **Role** | Sales Rep |
| **Priority** | P1 |

### Precondition

Lead exists with 2 Service Team members (Owner + Member) and 3 Activity Logs recorded

### Test Steps

1. Navigate to Lead Details page
2. Verify Service Team has 2 members
3. Verify Activity Log has 3 entries
4. Click "Convert" to start 2-step conversion wizard
5. Step 1 (Customer): Verify/Create customer, proceed
6. Step 2 (Opportunity): Verify ALL 6 carry-over checkboxes are checked by default
   - Copy Team to: Customer, Contact, Opportunity
   - Copy Activities to: Customer, Contact, Opportunity
7. Uncheck "Copy Activities to -> Opportunity" checkbox
8. Complete conversion
9. Navigate to newly created Customer -> check Service Team
10. Navigate to newly created Contact -> check Sales Record tab
11. Navigate to newly created Opportunity -> check Service Team AND Activity Log

### Expected Results

1. Customer Service Team contains both original Lead team members
2. Contact Sales Record contains all 3 activity logs from Lead
3. Opportunity Service Team contains both original Lead team members
4. BUG REGRESSION: Opportunity Activity Log should NOT contain Lead activity logs (checkbox was unchecked) - verify this matches expected behavior
5. Lead status changes to "Converted" (green badge)
6. Conversion Record tab shows conversion history with timestamp

---

## TC-002 - Lead Conversion - Multi-Currency Amount Calculation (IDR to MYR)

| Field | Value |
|-------|-------|
| **Module** | Lead |
| **Category** | Data Inheritance |
| **Role** | Sales Rep |
| **Priority** | P1 |

### Precondition

Lead exists with Currency=IDR, Estimated Deal Amount=100,000,000, Win Rate=25%

### Test Steps

1. Navigate to Lead Details
2. Record Estimated Deal Amount (100,000,000 IDR) and Win Rate (25%)
3. Click "Convert" -> Step 2 (Opportunity)
4. Verify Currency defaults to IDR
5. Enter Exchange Rate: 0.000223 (IDR->MYR)
6. Verify MYR Value auto-calculates: 100,000,000 x 0.000223 = 22,300 MYR
7. Verify Weighted Amount = MYR Value x Win Rate = 22,300 x 25% = 5,575 MYR
8. Complete conversion
9. Navigate to created Opportunity -> verify financial fields

### Expected Results

1. MYR Value = 22,300.00 (exact calculation: 100,000,000 x 0.000223)
2. Weighted Amount = 5,575.00 (22,300 x 0.25)
3. Opportunity Currency = IDR
4. Entity reflects selected entity (SCMY or PTSM)
5. Sales Record field auto-populated from Lead activity history
6. Contacts tag input auto-carried from Lead Contact Person table

---

## TC-003 - Lead Queue - 7-Day SLA Reclaim Countdown

| Field | Value |
|-------|-------|
| **Module** | Lead |
| **Category** | SLA Enforcement |
| **Role** | Sales Manager |
| **Priority** | P2 |

### Precondition

Lead exists in Unassigned queue, assigned 5 days ago, no follow-up activity

### Test Steps

1. Login as Sales Manager
2. Navigate to Lead Queue configuration
3. Verify Claim and Assign Rule = "Hidden from Members, Assignable by Admins"
4. Navigate to Lead List -> filter by "Unassigned" status
5. Locate the lead assigned 5 days ago
6. Verify "Reclaim Countdown" column shows "2Days" (7 - 5 = 2 days remaining)
7. Wait/simulate until countdown reaches "-1Days" (overdue)
8. Verify lead is auto-returned to Public Pool
9. Verify notification sent to original assignee

### Expected Results

1. Reclaim Countdown accurately reflects remaining days
2. Negative values (e.g., "-1Days") indicate overdue leads
3. Overdue lead returns to Public Pool automatically
4. Original assignee receives "recycle countdown" notification
5. Lead does NOT auto-strip - only returns to Public Pool (Blueprint principle 2: Reminders Over Force)
6. Any AM in the region can now claim the lead from Public Pool

---

## TC-004 - Lead Import - Enum Validation and Duplicate Check

| Field | Value |
|-------|-------|
| **Module** | Lead |
| **Category** | Import Validation |
| **Role** | Sales Manager |
| **Priority** | P2 |

### Precondition

Excel template with 17 columns prepared (9 required, 8 optional)

### Test Steps

1. Navigate to Lead List -> Click Import button
2. Select Import Mode = "New and update import" (UPSERT)
3. Set Condition Field = "Lead Name"
4. Upload Excel template with test data:
   - Row 1: Valid data with Lead Level="A-Level", Source="Search Engine"
   - Row 2: Invalid Lead Level="D-Level" (not in enum)
   - Row 3: Duplicate Lead Name matching existing record
   - Row 4: Lock Status="1" (numeric -> should map to "Unlock")
5. Click Confirm Import
6. Review import results

### Expected Results

1. Row 1 imported successfully
2. Row 2 fails validation - Lead Level "D-Level" not in allowed values (A/B/C-Level)
3. Row 3 updates existing record (UPSERT mode)
4. Row 4 Lock Status correctly maps: 1=Unlock, 2=Locked
5. Import summary shows: N succeeded, M failed, K updated
6. All imported data visible in Lead Queue list view
7. Enum validation: Lead Level (3 values), Source (7 values), Lead Queue (2 values), Business Process (2 values)

---

## TC-005 - Lead Visibility - Entity Isolation and Service Team Access

| Field | Value |
|-------|-------|
| **Module** | Lead |
| **Category** | Permission |
| **Role** | Sales Rep |
| **Priority** | P1 |

### Precondition

Two leads exist: Lead-A (Entity=SCMY, User-A in Service Team), Lead-B (Entity=SMMY, User-B NOT in Service Team)

### Test Steps

1. Login as User-A (SCMY entity)
2. Navigate to Lead List -> filter "All"
3. Verify Lead-A is visible and editable
4. Verify Lead-B is NOT visible (entity isolation)
5. Login as User-B (SMMY entity)
6. Navigate to Lead List
7. Attempt to access Lead-A via direct URL
8. Login as Admin, add User-B to Lead-A Service Team with Read-Only
9. Login as User-B, attempt to edit Lead-A fields

### Expected Results

1. Entity isolation: User-A sees only SCMY leads, User-B sees only SMMY leads
2. Direct URL access to Lead-A from User-B returns access denied
3. After adding to Service Team with Read-Only: User-B can view but CANNOT edit Lead-A
4. Service Team permission overrides entity isolation for specific records
5. Owner auto-assignment: Creator is added to Service Team automatically

---

## TC-006 - Opportunity Stage Progression - 5-Stage Pipeline with Win Rate

| Field | Value |
|-------|-------|
| **Module** | Opportunity |
| **Category** | Pipeline Flow |
| **Role** | Sales Rep |
| **Priority** | P1 |

### Precondition

Opportunity exists at Qualifying stage (25% win rate)

### Test Steps

1. Navigate to Opportunity Details
2. Verify current stage = "Qualifying" with 25% win rate badge
3. Click "Advance to the next stage"
4. Verify stage changes to "Proposal/POC" (50%)
5. Verify Weighted Amount recalculates: Estimated Amount x 50%
6. Click "Advance to the next stage" again
7. Verify stage changes to "Price Negotiation" (75%)
8. Click "Advance to the next stage" -> Select "Deal Won"
9. Verify stage changes to "Deal Won" (100%)
10. Verify Status badge changes to "Won" (green)
11. Attempt to advance from "Deal Won" -> should be blocked

### Expected Results

1. Stage progression follows: Qualifying(25%) -> Proposal/POC(50%) -> Price Negotiation(75%) -> Deal Won(100%)
2. Each stage advance recalculates Weighted Amount = Estimated Amount x Win Rate
3. At Deal Won: Status = "Won", Pipeline stage = 100%
4. Deal Won is an End stage - cannot advance further
5. Deal Lost (0%) is also an End stage - terminates pipeline
6. All stage advances are manual (no auto-advance per Blueprint)

---

## TC-007 - Permission - Owner Without Service Team Access (Known Bug Regression)

| Field | Value |
|-------|-------|
| **Module** | Opportunity |
| **Category** | Permission Bug |
| **Role** | Sales Manager |
| **Priority** | P1 |

### Precondition

Opportunity exists where Owner is NOT listed in Service Team members

### Test Steps

1. Navigate to Opportunity Details where Owner is NOT any Service Team member
2. Verify Owner field shows a user (e.g., "Nixon")
3. Open Service Team sidebar -> verify Owner is NOT listed
4. As the Owner, attempt to create a Sales Order under this Opportunity
5. As a non-owner NOT in Service Team, attempt to edit Opportunity fields
6. As a non-owner NOT in Service Team, attempt to create a Sales Order

### Expected Results

1. BUG: Owner CAN create Sales Order even without being in Service Team
   - Expected: Owner should automatically have access OR be in Service Team
   - Actual: Owner bypasses Service Team check for child record creation
2. Non-owner NOT in Service Team CANNOT edit Opportunity fields (correct)
3. Non-owner NOT in Service Team CANNOT create Sales Order (correct)
4. Bug severity: HIGH - permission inconsistency
5. Root cause: Owner check may bypass Service Team validation in child record creation

---

## TC-008 - Service Team - Add Member with Permission and Role Configuration

| Field | Value |
|-------|-------|
| **Module** | Opportunity |
| **Category** | Service Team |
| **Role** | Sales Manager |
| **Priority** | P1 |

### Precondition

Opportunity exists with Owner only in Service Team

### Test Steps

1. Navigate to Opportunity Details -> Service Team sidebar
2. Click "+ Add" -> "Add Team Members" modal opens
3. Select member "Solution Architect"
4. Set Permission = "Read-Write"
5. Check Team Role = "Ordinary Members" (default)
6. Check Project Role = "Customer Manager"
7. Click Confirm
8. Verify member appears in Service Team with correct roles
9. Login as Solution Architect -> attempt to edit Opportunity fields
10. Change Permission to "Read-Only" for Solution Architect
11. Login as Solution Architect -> attempt to edit -> should be blocked

### Expected Results

1. New member appears in Service Team with all configured attributes
2. Permission controls edit access: Read-Write = can edit, Read-Only = view only
3. Team Role = "Ordinary Members" defines internal team structure
4. Project Role = "Customer Manager" defines functional role on account
5. Permission changes take effect immediately
6. Permission is entity-specific: being in Opportunity Service Team does NOT equal access to Customer/Lead

---

## TC-009 - Activity Log - Interaction Recording Across Entity Types

| Field | Value |
|-------|-------|
| **Module** | Opportunity |
| **Category** | Activity Log |
| **Role** | Sales Rep |
| **Priority** | P2 |

### Precondition

Opportunity exists with at least one Contact associated

### Test Steps

1. Navigate to Opportunity Details -> Activity Log (right sidebar)
2. Click "New Log" / "Log Activity"
3. Fill Interaction Log form:
   - Interaction Date: pre-filled with current datetime
   - Contact: select from dropdown (pre-filled from Opportunity contacts)
   - Our Attendee: pre-filled with Opportunity Owner
   - Related Business: auto-filled with Opportunity Name
   - Discussion Details: enter test text (verify 0/1000 char counter)
   - Attachment: upload a test file
4. Click Submit
5. Verify log appears in Activity Log timeline with correct metadata
6. Navigate to Contact Details -> check "Sales Record" tab
7. Verify same interaction appears (note: tab name differs from "Activity Log")

### Expected Results

1. Activity log entry appears with: Date, User avatar, Activity Type badge, Timestamp, Content
2. Metadata shows: "Contact: [Name]", "Our Attendee: [Owner]"
3. BUG: Activity log tab naming inconsistent - "Activity Log" vs "Sales Record"
4. Same activity should appear in both Opportunity Activity Log and Contact Sales Record
5. Character counter shows current/max (e.g., "0/1000")
6. Attachment is downloadable from activity log entry

---

## TC-010 - Opportunity Ownership Transfer - Team Continuity and Permission

| Field | Value |
|-------|-------|
| **Module** | Opportunity |
| **Category** | Ownership Transfer |
| **Role** | Sales Manager |
| **Priority** | P2 |

### Precondition

Opportunity exists with Owner "Affendi" and 2 Service Team members

### Test Steps

1. Navigate to Opportunity Details -> Click "Change Owner"
2. Select new Owner = "YCK"
3. Set Original Owner disposition = "Demote to team member"
4. Set Permission = "Read-Write" for original owner
5. Set Team continuity = "Keep Existing"
6. Confirm transfer
7. Verify new Owner = "YCK" in header
8. Verify original owner "Affendi" still in Service Team with Read-Write
9. Verify all existing Service Team members retained
10. Login as original owner -> verify can still edit (Read-Write)
11. Test "Remove from team" option -> verify original owner removed from Service Team

### Expected Results

1. New owner appears in Opportunity header and Service Team
2. Original owner disposition applied correctly:
   - "Remove" -> removed from Service Team entirely
   - "Demote" -> stays in Service Team with specified permission
3. Team continuity "Keep Existing" retains all current members
4. Team continuity "Clear All" would remove all existing members except new owner
5. Notification sent to new owner about ownership transfer

---

## TC-011 - P&L Financial Summary - Margin Calculation Accuracy (Markup vs Gross Margin)

| Field | Value |
|-------|-------|
| **Module** | P&L |
| **Category** | Financial Calculation |
| **Role** | Sales Rep |
| **Priority** | P1 |

### Precondition

P&L exists with: 2 Software products (List Price: 5000, 3000) and 1 Hardware (Cost: 2000)

### Test Steps

1. Navigate to P&L Create/Details page
2. Add 2 Software products:
   - Product A: List Price = 5,000, Markup = 20% -> Selling Price = 6,000
   - Product B: List Price = 3,000, Markup = 10% -> Selling Price = 3,300
3. Add 1 Hardware product:
   - Cost per unit = 2,000, Expected Profit = 500 -> Selling Price = 2,500, Margin = 20%
4. Verify Financial Summary Cards:
   - TOTAL REVENUE = 6,000 + 3,300 + 2,500 = 11,800
   - TOTAL COST = (software cost from catalog) + 2,000
   - TOTAL PROFIT = TOTAL REVENUE - TOTAL COST
   - MARGIN % = (TOTAL PROFIT / TOTAL REVENUE) x 100
5. Verify each line item Margin = (Profit / Selling Price) x 100 (Gross Margin formula)
6. Verify red warning icon when Margin < Target Margin

### Expected Results

1. CRITICAL: System uses Gross Margin formula (Profit/Selling Price)x100
2. Software: Selling Price = List Price x (1 + Markup%)
3. Hardware: Selling Price = Cost + Expected Profit
4. TOTAL REVENUE card: blue text, sum of all selling prices
5. TOTAL PROFIT card: green text (Revenue - Cost)
6. MARGIN card: green if >= target, red if < target
7. Red exclamation warning icon on line items where Margin < Target
8. All figures auto-calculate - no manual entry needed for calculated fields

---

## TC-012 - P&L Global Discount - Toggle ON and OFF Behavior

| Field | Value |
|-------|-------|
| **Module** | P&L |
| **Category** | Discount Control |
| **Role** | Sales Rep |
| **Priority** | P1 |

### Precondition

P&L exists with 3 product line items (2 Software, 1 Hardware)

### Test Steps

1. Navigate to P&L Details page
2. Locate Global Discount bar (yellow-highlighted)
3. Toggle ON, set discount = 5%
4. Verify ALL line items show 5% discount in DISC column
5. Verify PRICE column recalculates: PRICE = (List Price x (1+Markup%)) x (1-5%)
6. Verify Financial Summary Cards update with new discounted values
7. Toggle OFF
8. Verify individual line item discount fields appear
9. Set Product A discount = 10%, Product B discount = 0%, Hardware = 3%
10. Verify each line item uses its own discount rate
11. Verify Financial Summary reflects mixed discount rates

### Expected Results

1. Toggle ON: Global discount applies uniformly to ALL line items
2. Toggle OFF: Per-item discount fields appear for granular control
3. Discount calculation: Net Price = Base Price x (1 - Discount%)
4. Financial Summary always reflects current discount state
5. Switching toggle preserves individual discount values (they are stored even when hidden)
6. Global discount toggle is blue when ON (active state)

---

## TC-013 - P&L Multi-User Collaboration - Sales Rep to Solution Architect Workflow

| Field | Value |
|-------|-------|
| **Module** | P&L |
| **Category** | Collaboration |
| **Role** | Sales Rep |
| **Priority** | P1 |

### Precondition

P&L exists in draft state, Solution Architect user exists

### Test Steps

1. Login as Sales Rep (initiator)
2. Navigate to P&L Details -> Process Approvals sidebar
3. Set Operation = "Collaborate" (NOT "submit")
4. Select Recipient = "Solution Architect" via EasyCraft user picker
   - Verify modal tabs: Recent contact / Administrative Org / Group
   - Search and select user
5. Add collaboration comment: "Please review hardware pricing"
6. Click Submit -> form permission transfers to Recipient
7. Login as Solution Architect -> check Message Center -> To-do Items
8. Open P&L from To-do -> click Edit (pencil icon)
9. Modify hardware cost, add professional services line
10. Click "Submit back" -> returns to Sales Rep
11. Login as Sales Rep -> verify changes are visible
12. Sales Rep can now either: assign another collaborator OR click "submit" for approval

### Expected Results

1. Collaboration transfers edit permission from initiator to recipient
2. Recipient receives To-do item in Message Center
3. Recipient can edit ALL fields and add/remove line items
4. "Submit back" returns permission to initiator
5. Initiator can repeat cycle with different collaborators
6. Only after collaboration is complete can initiator click "submit" for approval workflow
7. Instructional text: "After submitting the collaboration, the form modification permission will be transferred to the recipient. After the recipient submits back, you can edit the form and submit the workflow to next step."
8. Collaboration is distinct from approval - no HOD/Finance routing during collaboration

---

## TC-014 - P&L Approval Workflow - Margin-Based Routing Conditions

| Field | Value |
|-------|-------|
| **Module** | P&L |
| **Category** | Approval Routing |
| **Role** | Sales Manager |
| **Priority** | P1 |

### Precondition

P&L exists with: 1 product with Margin < Target (15% < 20% target), 1 product with Margin >= Target (25% >= 20%)

### Test Steps

1. Navigate to P&L Details
2. Review line items:
   - Product A: Margin = 15%, Target = 20% -> BELOW target
   - Product B: Margin = 25%, Target = 20% -> ABOVE target
3. Click "submit" in Process Approvals sidebar
4. Track approval route
5. Verify route goes to Head of Department (HOD) due to Product A margin < target
6. Test scenario: ALL products margin >= target -> verify auto-approve
7. Test scenario: Add Key Product -> verify routes to HOD (if configured)
8. Test scenario: Grand total margin < target -> verify routes to Finance team

### Expected Results

1. Approval routing rules (per Blueprint + DOCX):
   - ANY line item margin < target -> route to HOD
   - ANY Key Product included -> route to HOD (not yet configured)
   - Grand total margin < target -> route to Finance team
   - All criteria met -> auto-approve (workflow ends)
2. In this test: routes to HOD because Product A margin (15%) < target (20%)
3. HOD can approve, reject, or request revision
4. Rejected P&L must be revised and resubmitted (new version)
5. Approved P&L -> Quote can be generated via "New Quotation" button

---

## TC-015 - P&L Product Selection - Modal Filters and Category Scope

| Field | Value |
|-------|-------|
| **Module** | P&L |
| **Category** | Product Selection |
| **Role** | Sales Rep |
| **Priority** | P2 |

### Precondition

P&L exists, Opportunity has 3 products (2 Hardware, 1 Software)

### Test Steps

1. Navigate to P&L Create -> click "+ Add Products" in SM Products section
2. Verify Select Product Modal opens with dual-panel layout
3. Left panel: Search filters (Product Code, Product Description)
4. Right panel: "Selected (0)" - empty initially
5. Search for a product by code
6. Select 2 products -> verify "Selected (2)" updates
7. Click "Add 2 Products"
8. Verify products appear in table with auto-populated: Code, Unit Price, Target Margin
9. Navigate to Hardware section -> click "+ Add Products"
10. Navigate to Services section -> verify separate SM Team / 3rd Party Team tables
11. BUG TEST: Search for Software product in Hardware section -> should NOT appear

### Expected Results

1. Select Product Modal: dual-panel with search filters and selection counter
2. Products auto-carry from Product Master: List Price, Cost, Target Margin
3. BUG #1: Software products not selectable in P&L Software section - only Principal=Securemetric products show
4. BUG #2: Opportunity products do not auto-fill in P&L product line
5. BUG #5: Third-party product filter not scoped to entity/opportunity - shows ALL products
6. Services section uses Service Master (not Product Catalog) for role-based pricing
7. Each section (SM Products, 3rd Party Software, 3rd Party Hardware) has separate "+ Add Products" button

---

## TC-016 - P&L Details - Multi-Year Breakdown (Year 1-3 RENEW)

| Field | Value |
|-------|-------|
| **Module** | P&L |
| **Category** | Multi-Year |
| **Role** | Sales Rep |
| **Priority** | P2 |

### Precondition

Approved P&L exists with Hardware products spanning multiple years

### Test Steps

1. Navigate to P&L Details page (not Create)
2. Locate multi-year breakdown table
3. Verify columns: CATEGORY | YEAR 1 | YEAR 2 (RENEW) | YEAR 3 (RENEW) | TOTAL
4. Verify rows: Software, Hardware, Services, Reimbursement
5. Verify each cell shows: Revenue, Cost, Margin % (color-coded)
6. Verify GRAND TOTAL row at bottom
7. Verify Entity field (e.g., SMMY) and Deal Category (e.g., ADSS) displayed
8. Check Permissions tab:
   - Readers: "No one can read except the author and related personnel"
   - Editors: "Administrator"
9. Click "Copy New" -> verify creates new version with all data copied
10. Click "New Quotation" -> verify navigates to Quotation Create from approved P&L

### Expected Results

1. Multi-year view shows Revenue/Cost/Margin for each category across years
2. YEAR 2 and YEAR 3 labeled as "(RENEW)" - indicates renewal contracts
3. Cell colors: green = positive margin, red = below target
4. "Copy New" creates duplicate P&L for modification (most convenient way to create new version)
5. "New Quotation" creates quotation directly from approved P&L
6. Only latest P&L version is active - historical versions deactivated
7. Permissions tab controls: read access, edit access, attachment download access

---

## TC-017 - Quotation Create - Auto-Population from P&L and Opportunity

| Field | Value |
|-------|-------|
| **Module** | Quotation |
| **Category** | Data Flow |
| **Role** | Sales Rep |
| **Priority** | P1 |

### Precondition

Approved P&L V1 exists, linked to Opportunity with Customer

### Test Steps

1. Navigate to Opportunity Details -> Quotation(N) tab -> Click "Create"
2. Verify Quotation Create opens as slide-over panel (Opportunity dimmed in background)
3. Verify Header auto-populated:
   - P&L: P&L ID auto-filled
   - Customer: auto-filled from P&L/Opportunity
   - Opportunity: parent opportunity name
   - Sales Rep: auto-filled with current user
   - Currency: auto-filled "MYR"
   - Quote Date: auto-set to current date
   - Address: auto-populated from Customer
   - Department: auto-filled (e.g., "SMMY")
4. Verify Financial Summary at top:
   - Total Excl Tax: inherited from P&L
   - Service Tax: 8% SST auto-calculated
   - Grand Total: auto-calculated
5. Verify Line Items auto-populated from P&L
6. Verify T&C template populated with 8 numbered items and placeholders

### Expected Results

1. Quotation is a "view" of approved P&L - data flows P&L -> Quotation
2. Auto-populated fields: Customer, Opportunity, Currency, Sales Rep, Date, Address, Department
3. Financial figures inherited from P&L and recalculated with 8% SST
4. Service Tax = Total Excl Tax x 8% (Malaysia SST)
5. T&C template contains 8 items with placeholders: <Validity>, <xx>, <Payment Terms>
6. Quotation Title autocomplete suggests existing names (numbered variants) to prevent duplicates
7. P&L lookup is required - cannot create Quotation without approved P&L

---

## TC-018 - Quotation PDF Preview - Document Format and Signature Rendering

| Field | Value |
|-------|-------|
| **Module** | Quotation |
| **Category** | PDF Export |
| **Role** | Sales Rep |
| **Priority** | P1 |

### Precondition

Quotation exists with Prepared Signature and Approved Signature uploaded

### Test Steps

1. Navigate to Quotation Details -> Click PDF Preview
2. Verify PDF Preview modal displays:
   - Company header: "SECUREMETRIC TECHNOLOGY SDN. BHD. (759814-V)"
   - Customer info: Company Name, Address, Attn, Tel, Email
   - Line Items table with: No, Item Code, Description, Qty, Unit Price, Totals
   - Financial summary: Total Excl Service Tax, Service Tax @ 8%, Total Amount
   - T&C section with 8 numbered items
3. Verify signature blocks:
   - Prepare by: shows uploaded signature image
   - Approved by: shows uploaded signature image
4. Click "Export PDF"
5. Verify browser download notification appears with file name and size
6. Downloaded PDF file name includes Opportunity name

### Expected Results

1. PDF matches the on-screen preview exactly
2. Company header includes registration number
3. Both Prepared by and Approved by signatures rendered in final PDF
4. T&C placeholders replaced with actual values at generation time
5. Financial summary in PDF matches Quotation financial summary
6. Export PDF triggers browser download (not in-app save)
7. KNOWN: HTTP environments may block downloads ("Insecure download blocked")

---

## TC-019 - Quotation Rich Text Editor - T&C and Acceptance Content

| Field | Value |
|-------|-------|
| **Module** | Quotation |
| **Category** | Rich Text |
| **Role** | Sales Rep |
| **Priority** | P2 |

### Precondition

Quotation Create form open as slide-over panel

### Test Steps

1. Scroll to Foot section of Quotation Create
2. Locate Terms and Conditions rich text editor
3. Verify toolbar: Undo, Redo, Copy/Paste, Font Size, Paragraph formatting, Fullscreen
4. Verify default template content with 8 numbered items
5. Edit T&C content using toolbar
6. Locate Acceptance Instruction rich text editor (same toolbar)
7. Verify default content about quotation acceptance with company stamp
8. Verify "Prepared by" is read-only: "Automatically generated by the system"
9. Verify "Approved by" is empty input field (populated after approval)

### Expected Results

1. Rich text editors support full formatting toolbar
2. T&C template contains dynamic placeholders replaced at generation time
3. Acceptance Instruction can be customized per quotation
4. "Prepared by" is system-generated and cannot be edited
5. "Approved by" remains empty until approval workflow completes
6. Both signature uploads are drag-drop zones (jpg/gif/png only)
7. Fullscreen mode available for large content editing

---

## TC-020 - Quotation Approval - Circulate Workflow Before Submit

| Field | Value |
|-------|-------|
| **Module** | Quotation |
| **Category** | Approval |
| **Role** | Sales Manager |
| **Priority** | P2 |

### Precondition

Quotation exists in draft state

### Test Steps

1. Navigate to Quotation Details -> Process Approvals sidebar
2. Set Operation = "Circulate" (NOT "submit")
3. Set Identity of circulator = "SMMY" (dropdown)
4. Select circulation objects = user(s) via person icon picker
5. Enter Review Comments (verify 0/200 character counter)
6. Upload attachment (optional)
7. Toggle ON: "Reading opinions must be responded to"
8. Click Submit -> triggers circulation workflow
9. Verify circulation objects receive notification
10. After circulation objects review, set Operation = "submit" for final approval

### Expected Results

1. Circulate workflow allows pre-approval review by designated users
2. Circulation objects receive notification to review
3. Toggle "Reading opinions must be responded to" enforces response requirement
4. Character counter for Review Comments: 0/200
5. Circulation is separate from formal approval - does not trigger HOD/Finance routing
6. After circulation completes, standard submit triggers approval workflow
7. Process Approvals sidebar supports: Track dropdown, Common Comments, Upload attachment, Electronic signature

---

## TC-021 - PO Creation - Mandatory File Upload and Opportunity Status Update

| Field | Value |
|-------|-------|
| **Module** | PO |
| **Category** | Order Creation |
| **Role** | Sales Rep |
| **Priority** | P1 |

### Precondition

Quotation approved, Opportunity exists

### Test Steps

1. Navigate to Opportunity Details -> PO(N) tab -> Click "Create PO"
2. Verify auto-populated fields:
   - Opportunity: parent opportunity (read-only)
   - Customer: from quotation (read-only)
   - Currency: from quotation (read-only)
   - Total Amount: roll-up sum from Product Details (read-only)
3. Fill mandatory fields:
   - PO Number: enter customer PO number (e.g., "8596848")
   - Date: auto-set to current date
   - Quotation: select source quotation
   - Deal Category: select (e.g., "PKI")
   - PO File: upload scanned PO document (PDF/Image) - MANDATORY
4. Verify Product Details table auto-populated from Quotation
5. Verify columns: Service Period, Product, Product Code, Type, Description, Quantity
6. Submit for approval
7. Navigate to Opportunity -> verify Status updated to "Won"
8. Verify PO status = "Active" after approval

### Expected Results

1. PO creation is a prerequisite for Sales Order creation
2. PO File upload is MANDATORY - cannot submit without scanned PO document
3. Parent Opportunity status automatically updates to "Won" upon PO creation
4. PO inherits: Customer, Opportunity, Currency, Total Amount, Deal Category from Quotation
5. Product Details table shows items from Quotation line items
6. PO is a child record of "won" Opportunity
7. PO approval workflow same pattern as other modules (sidebar Process Approvals)

---

## TC-022 - SO Payment Schedule - Revenue Split Logic (Software and Hardware % Distribution)

| Field | Value |
|-------|-------|
| **Module** | SO |
| **Category** | Payment Schedule |
| **Role** | Sales Rep |
| **Priority** | P1 |

### Precondition

PO approved, ready to create Sales Order

### Test Steps

1. Navigate to Sales Order Create (from approved Quotation)
2. Verify auto-populated fields from Quotation
3. Fill mandatory fields:
   - Customer PO No.: mandatory
   - P.O. Date: mandatory
   - Entity: triggers Entity Code + Department auto-fill
4. Scroll to Payment Schedule section
5. Set Milestone Type = "By Products"
6. Add 2 payment milestones:
   Row 1: Name="Down Payment", Payment Type="Down Payment", Product Info: "Software 10% Hardware 20%"
   Row 2: Name="Final Payment", Payment Type="Final Payment", Product Info: "Software 90% Hardware 80%"
7. Verify Software percentages sum to 100% (10% + 90% = 100%)
8. Verify Hardware percentages sum to 100% (20% + 80% = 100%)
9. Verify Receivable Amount auto-calculated: Product Sum x Receivable %
10. Submit SO

### Expected Results

1. Revenue split logic: each product category percentage sums to 100% across milestones
2. Example: Software = 10% (Down) + 90% (Final) = 100%
3. Hardware = 20% (Down) + 80% (Final) = 100%
4. Receivable Amount = Product Sum x Receivable % for each milestone
5. Payment Schedule auto-generates from milestone definitions
6. Split Payment supports: By Products or By Percentage milestone types
7. Entity selection auto-populates Entity Code and Department
8. Customer PO No. is MANDATORY before submission

---

## TC-023 - SO Details - Statistic Bar and 9-Tab Navigation

| Field | Value |
|-------|-------|
| **Module** | SO |
| **Category** | Financial Tracking |
| **Role** | Sales Rep |
| **Priority** | P2 |

### Precondition

Sales Order exists with 2 Payment Schedule milestones

### Test Steps

1. Navigate to SO Details page
2. Verify Sales Order Statistic Bar (6 metrics):
   - Receivable, Received, Uncollected, Invoiced, Uninvoiced, Order Total
3. Verify 9 detail tabs with record counts:
   - Detail Information, Products(6), Delivery(0), Contract(0)
   - Collection Details(0), Payment Schedule(2), Progress Invoice(0)
   - Transaction Record(0), Approval Workflow
4. Verify Receivable = sum of all Payment Schedule Receivable Amounts
5. Verify Uncollected = Receivable - Received
6. Verify Uninvoiced = Receivable - Invoiced

### Expected Results

1. Statistic Bar provides at-a-glance financial status
2. All 6 metrics are auto-calculated from underlying records
3. Tab record counts reflect actual child records
4. Financial calculations verified across all related records
5. When no payments/invoices: Receivable = Uncollected = Uninvoiced = Order Total
6. Tab navigation allows quick access to related records

---

## TC-024 - Permission - Non-Owner Editing Payment Schedule (Known Bug Regression)

| Field | Value |
|-------|-------|
| **Module** | SO |
| **Category** | Permission Bug |
| **Role** | Sales Manager |
| **Priority** | P1 |

### Precondition

SO exists, Payment Schedule created, User "Yuwin" is NOT person in charge

### Test Steps

1. Login as "Yuwin" (not the P.I.C. of this SO)
2. Navigate to SO Details -> Payment Schedule tab
3. Click on a Payment Schedule milestone
4. Attempt to edit Payment Schedule details
5. Click "Change Completion %" -> attempt to modify
6. Login as P.I.C. (person in charge) -> attempt same actions
7. Verify which user can and cannot edit

### Expected Results

1. BUG: Non-owner (Yuwin) CAN edit Payment Schedule despite not being P.I.C.
   - Expected: Only person in charge (or explicitly permitted users) can edit
   - Actual: Any user with access to SO can edit Payment Schedule
2. Bug severity: HIGH - financial data integrity at risk
3. P.I.C. can edit (expected behavior)
4. Payment Schedule contains critical financial data (Receivable amounts, Completion %)
5. This contradicts the Service Team permission model described in video 16

---

## TC-025 - Contract - Multiple Expiry Notification Rules

| Field | Value |
|-------|-------|
| **Module** | Contract |
| **Category** | Expiry Reminder |
| **Role** | Sales Rep |
| **Priority** | P2 |

### Precondition

SO exists, ready to create Contract

### Test Steps

1. Navigate to SO Details -> Contract tab -> Click "Create"
2. Fill Contract form:
   - Contract Title: "ABC NDA"
   - Sales Order: auto-filled from parent SO
   - Customer: auto-filled from SO
   - Signed Date: "04/29/2026"
   - Expiry Date: "04/28/2027" (1 year from signed date)
3. Configure 3 reminder rules:
   - Rule 1: Notify "Affendi", 30 days before expiry
   - Rule 2: Notify "CK", 10 days before expiry
   - Rule 3: Notify both "Affendi" and "CK", 5 days before expiry
4. Upload attachment (optional)
5. Save Contract
6. Verify Contract appears in Contract tab with Serial No. and Title
7. Set Expiry Date to next week + set 5-day reminder to test notification trigger

### Expected Results

1. Multiple reminder rules can be configured per contract
2. Each rule has: Notify Who (user lookup) + Days Before Expiry
3. Notifications trigger at configured intervals before expiry date
4. Contract ID is auto-generated on save
5. Contract file syncs to Customer 360
6. Contract is created from SO - Sales Order and Customer pre-filled
7. Testing tip: set expiry date to near future to verify notification trigger quickly

---

## TC-026 - Payment Schedule - Receivable Calculation and Completion % Tracking

| Field | Value |
|-------|-------|
| **Module** | Payment Schedule |
| **Category** | Financial Calculation |
| **Role** | PM |
| **Priority** | P1 |

### Precondition

SO exists with 2 Payment Schedule milestones (Down Payment 50%, Final Payment 50%)

### Test Steps

1. Navigate to SO Details -> Payment Schedule tab -> click a milestone
2. Verify Payment Schedule Details drawer opens
3. Verify financial fields:
   - Payment Schedule ID: PP+YYYYMMDD+seq (e.g., PP202604270002)
   - Receivable amount = Order Total x Receivable % (e.g., 37,709.74 x 50% = 18,854.87)
   - Invoiced Amount: 0.00 (no invoice yet)
   - Uninvoiced Amount = Receivable - Invoiced = 18,854.87
   - Amount Uncollected = Uninvoiced (when no payment received) = 18,854.87
4. Verify Status = "Uncompleted" (blue badge)
5. Verify Payment Status = "Unpaid" (blue badge)
6. Click "Change Completion %" -> set to 100%
7. Verify system alerts AM to generate Proforma Invoice at 100% completion
8. Verify tabs: Detail Information | Payment Detail(0) | Billing Detail(0) | System Record

### Expected Results

1. Financial calculation logic:
   - Receivable amount = Order Total x Receivable %
   - Uninvoiced Amount = Receivable amount - Invoiced Amount
   - Amount Uncollected = Receivable amount - Received Amount
2. At 100% Completion %, system prompts AM to generate Invoice Application
3. Status transitions: "Uncompleted" -> (received payment) -> "Completed"
4. BUG: "Contract" field label should be "Sales Order"
5. BUG: System Record tab is unnecessary and should be removed
6. PM updates Completion %; at 100%, system alerts AM to generate PI

---

## TC-027 - Invoice Application - Project vs Milestone Billing Comparison

| Field | Value |
|-------|-------|
| **Module** | Invoice Application |
| **Category** | Billing Types |
| **Role** | Sales Rep |
| **Priority** | P1 |

### Precondition

SO exists with 2 Payment Schedule milestones, PM confirmed 100% completion

### Test Steps

1. Navigate to Invoice Application Create
2. Select Invoice Type = "Project"
3. Select Sales Order -> verify auto-populated: Customer, Currency, P.I.C., Opportunity
4. Verify Line Items auto-populated from SO:
   - Service Period, Product, Product Code, Description, Quantity, Unit Price
   - Total Excl Service Tax, Service Tax @ 8%, Total Incl Service Tax
5. Verify Invoice Amount section: Total Excl Tax + Service Tax = Grand Total
6. Save -> Navigate to Details page -> Click PDF Preview
7. Verify PDF shows Proforma Invoice format
8. Delete this IR -> Create new IR with Invoice Type = "Milestone"
9. Verify Milestone section appears:
   - Milestone Name, Receivable %, Invoice under Approval, Uninvoiced Amount
   - Payment Schedule ID: opens "Select record" modal
10. In Select Record Modal: verify filter fields and grid columns
11. Select a Payment Schedule -> verify milestone data auto-populates

### Expected Results

1. Project Type: Full-value invoicing, line items auto-filled from SO
2. Milestone Type: Progress billing, requires selecting from Payment Schedule records
3. Select Record Modal filters by: Sales Order ID, Payment Type, Receivable amount, Receivable %, Payment Schedule ID
4. Grid columns: Serial No., Payment Schedule ID, Milestone Name, fd_milestone_product, Job Content
5. Both types auto-populate: Invoice Application ID, PI No., Ref No.
6. Both types apply 8% SST automatically
7. UI Typo: "Univoiced Amount" should be "Uninvoiced Amount"
8. Project Type = one-time full invoice; Milestone Type = partial billing against milestones

---

## TC-028 - Invoice Application - PDF Preview and Digital Signature

| Field | Value |
|-------|-------|
| **Module** | Invoice Application |
| **Category** | PDF Export |
| **Role** | Sales Rep |
| **Priority** | P2 |

### Precondition

Invoice Application exists, in approval workflow

### Test Steps

1. Navigate to Invoice Application Details
2. Click PDF Preview
3. Verify Proforma Invoice format:
   - Company logo: "SECURE METRIC TECHNOLOGY"
   - Recipient Block: Company, Address, Attn, Tel, Email
   - Invoice Metadata: Date, Term, Rep, Ref, PI No.
   - Line Items Table with totals
4. Click Export PDF -> verify download
5. Navigate to Process Approvals sidebar
6. Verify Digital Signature Pad (canvas-based signature)
7. Draw signature -> verify Preview | Delete options
8. Submit for approval -> verify BPM workflow triggered

### Expected Results

1. PDF Preview shows Proforma Invoice format (different from Quotation PDF)
2. Line Items include service period (Year1, etc.)
3. Digital Signature Pad uses canvas-based drawing (not file upload)
4. Signature Preview shows drawn signature before submission
5. Approval workflow same pattern as other modules
6. IR ID format: IRYYYYMMDDNNNN (e.g., IR202605270004)
7. Both PDF Preview and Export PDF are available in the modal

---

## TC-029 - Collection - Finance Confirmation and Bank Receipt

| Field | Value |
|-------|-------|
| **Module** | Collection |
| **Category** | Finance Workflow |
| **Role** | Finance User |
| **Priority** | P2 |

### Precondition

Invoice Application approved, customer payment received

### Test Steps

1. Navigate to Collection Create
2. Fill required fields:
   - Customer Name: select customer account
   - Payment Date: select payment date
   - Collection Amount (Total): enter amount
   - Settlement Currency: select currency (CFG dropdown)
3. Fill optional fields: Owner, Department, Finance Confirmer, Purpose, Bank Receipt
4. Submit for finance confirmation
5. Login as Finance Confirmer -> verify collection in pending list
6. Confirm collection -> verify fd_finance_confirm_time recorded
7. Verify Collection Amount matches Invoice Application Grand Total

### Expected Results

1. Collection requires finance user confirmation workflow
2. Bank receipt attachment is optional but recommended for audit trail
3. Currency selection uses CFG dropdown (system-configured currencies)
4. Finance confirmation records: fd_finance_employee_id + fd_finance_confirm_time
5. Collection Amount should match the Invoice Application amount being collected
6. Lock Status can be set after confirmation to prevent further edits
7. Chinese labels in UI are defects (per Wiki language policy)

---

## TC-030 - Delivery - SO-Linked Shipment with Courier Tracking

| Field | Value |
|-------|-------|
| **Module** | Delivery |
| **Category** | SO Linkage |
| **Role** | Operations |
| **Priority** | P2 |

### Precondition

SO exists, products ready for delivery

### Test Steps

1. Navigate to Delivery Create
2. Fill required field: Sales Order -> select SO
3. Verify auto-populated: Customer (from SO), Sales Person (from SO)
4. Fill delivery details: Date, PI No., Self Collect ID, Item Description, Ship Date
5. Fill courier info: Courier Services, Air Way Bill, Weight
6. Fill shipping costs: Fuel Surcharge (MYR), Shipping Cost (MYR)
7. Submit delivery record

### Expected Results

1. Delivery is linked to SO - Customer and Sales Person auto-populated
2. Product items restricted to SO products only
3. Courier tracking: Courier Services + Air Way Bill + Weight
4. Shipping costs tracked in MYR (Fuel Surcharge + Shipping Cost)
5. Delivery managed by operations team via dedicated view
6. PI should be created before Delivery (per audio workflow)
7. Filename typo in schema: "mk_ltc_delievery.json" (delievery)
8. Chinese labels in UI are defects

---

## TC-031 - Task - Complete Owner/Executor/CC Workflow with Feedback Loop

| Field | Value |
|-------|-------|
| **Module** | Task |
| **Category** | Full Lifecycle |
| **Role** | Sales Rep |
| **Priority** | P1 |

### Precondition

Opportunity exists with Owner "Affendi" and executor "Danny"

### Test Steps

1. Navigate to Opportunity Details -> Click "New Task"
2. Fill Task Create form:
   - Deadline: "06/06/2026 11:00 pm"
   - Owner: auto-filled with "Affendi" (current user)
   - Executor: select "Danny"
   - Priority: "High"
   - Associated Type: auto-filled "Opportunity"
   - Associated Data: auto-filled with Opportunity name
   - Description: "Prepare solution proposal for CIMB eKYC"
   - C.C. Recipient: select "CK"
3. Configure Reminder: Reminder Time = "1 day before", Method = To-Do + Email (both checked)
4. Save Task -> verify task appears in Opportunity Task list
5. Login as Danny (Executor) -> check To-Do list
6. Open task -> verify notification details
7. Click "Task Feedback" -> set Completion Progress slider to 60%
8. Enter feedback description using Rich Text Editor (WYSIWYG toolbar)
9. Check Owner (notify) -> Confirm
10. Login as Affendi (Owner) -> verify task status = "To be confirm"
11. Review feedback -> Click "Pass"
12. Verify task status = "Completed", Progress = 100%
13. Verify "Task completed" button is disabled

### Expected Results

1. Task created with auto-filled Associated Type and Associated Data
2. Executor receives To-Do item AND email notification
3. C.C. Recipient receives notification but cannot edit or confirm
4. Task Feedback: Completion Progress slider (0-100%) with rich text description
5. Status transitions: In progress -> To be confirm -> Completed
6. Owner "Pass" action marks task as completed (100% progress)
7. "Task completed" button is disabled after completion (prevents double-completion)
8. Execution History tab shows filtered entries by status
9. Task Feedback tab shows timeline of all feedback entries with progress %

---

## TC-032 - Task - Sub-Task Creation and Hierarchy

| Field | Value |
|-------|-------|
| **Module** | Task |
| **Category** | Sub-Task |
| **Role** | Sales Rep |
| **Priority** | P3 |

### Precondition

Task exists in "In progress" status

### Test Steps

1. Navigate to Task Details -> Basic Info tab
2. Locate "Sub-tasks" section -> Click "+ Add Sub-tasks"
3. Create 2 sub-tasks:
   - Sub-task 1: "Research competitor solutions", Deadline: 2 days, Priority: Medium
   - Sub-task 2: "Draft proposal outline", Deadline: 3 days, Priority: High
4. Verify sub-tasks appear under parent task
5. Verify parent task shows "Superior Task: -" (no parent)
6. Verify sub-tasks show "Superior Task: [Parent Task Name]"
7. Complete sub-task 1 -> verify parent task progress updates
8. Complete sub-task 2 -> verify parent task can be marked completed

### Expected Results

1. Sub-tasks follow same workflow as parent tasks (Owner/Executor/Feedback)
2. Superior Task field links child to parent
3. Parent task progress may be aggregate of sub-task progress (needs verification)
4. Sub-tasks can have their own Executors (different from parent)
5. Sub-tasks can have their own reminders and C.C. recipients
6. Parent task cannot be completed until all sub-tasks are completed (needs verification)

---

## TC-033 - Task - Multiple Reminder Rules with Dual-Channel Notification

| Field | Value |
|-------|-------|
| **Module** | Task |
| **Category** | Reminder |
| **Role** | Sales Rep |
| **Priority** | P2 |

### Precondition

Task exists with deadline in 3 days

### Test Steps

1. Navigate to Task Create or Edit
2. Locate Reminder sub-table
3. Add 3 reminder rules:
   Row 1: "3 hours before" -> Method: To-Do + Email
   Row 2: "1 hour before" -> Method: To-Do only
   Row 3: "At deadline" -> Method: Email only
4. Save task
5. Verify reminder table shows all 3 rules with correct timing and methods
6. Wait for reminder triggers (or simulate)
7. Verify To-Do notifications received at 3 hours and 1 hour before
8. Verify email notifications received at 3 hours before and at deadline

### Expected Results

1. Multiple reminder rules can be added per task
2. Reminder timing calculated relative to Deadline
3. Dual-channel: To-Do creates item in task list, Email sends notification
4. Methods can be mixed per rule (To-Do only, Email only, or both)
5. Reminder options: 1 day / 3 hours / 1 hour / 30 min / 15 min / At deadline
6. "At deadline" triggers exactly when deadline is reached
7. Row actions: Insert (add above) | Copy (duplicate rule)

---

## TC-034 - Pipeline Kanban - 6-Stage Summary Bar and Filter Interaction

| Field | Value |
|-------|-------|
| **Module** | Pipeline Kanban |
| **Category** | Dashboard |
| **Role** | Sales Manager |
| **Priority** | P2 |

### Precondition

System has deals across all 6 pipeline stages

### Test Steps

1. Navigate to CRM -> Pipeline
2. Verify 6-stage summary bar at top: LEAD, OPPORTUNITY, QUOTATION, PO, SALES ORDER, PAYMENT
3. Verify each tile shows: Deal count + Pipeline value (MYR)
4. Verify values match actual data:
   - LEAD count = total leads in all queues
   - QUOTATION count = approved quotations
   - SALES ORDER count = active SOs
   - PAYMENT count = completed deals
5. Click "QUOTATION" tile -> verify list filters to QUOTATION stage only
6. Verify "Reset" button restores full view
7. Test TIME filter: "This Month" vs "This Year" vs Custom
8. Test ENTITY filter: filter by SCMY vs SMMY
9. Test REP filter: filter by specific sales rep
10. Verify summary line updates: "Showing N deals, Pipeline MYR X,XXX,XXX.XX"
11. Click any project row -> verify navigates to detail page

### Expected Results

1. Pipeline Kanban shows 6 stages: LEAD -> OPPORTUNITY -> QUOTATION -> PO -> SALES ORDER -> PAYMENT
2. Stage tiles filter the project list below
3. All monetary amounts in branch default currency (MYR) - no currency conversion
4. TIME filter supports: This Year / This Month / Custom date range
5. ENTITY filter scopes to specific legal entity
6. REP filter scopes to specific sales rep
7. Dot-track progress indicator: filled dots = completed stages, ring = current stage
8. Project row click navigates to full detail page (cross-module navigation)
9. DOCX says 5 stages but actual UI shows 6 (QUOTATION is separate stage)

---

## TC-035 - Duplicate Check - Fuzzy Search and Yellow Highlight Matching

| Field | Value |
|-------|-------|
| **Module** | Duplicate Check |
| **Category** | Cross-Entity Search |
| **Role** | Sales Rep |
| **Priority** | P2 |

### Precondition

System has existing customers and contacts with similar names

### Test Steps

1. Navigate to CRM -> DUPLICATE CHECK
2. Search for partial name (e.g., "Elite" when "Elite Enterprise Solutions" exists)
3. Verify results summary bar: Total Records Found, Contacts(N), Customers(N)
4. Verify split tabs: Customers(N) and Contacts(N) with count badges
5. Verify matching text highlighted in yellow in result names
6. Verify result columns: No., Name, Owner, Entity, Legal ID
7. Switch between Customers and Contacts tabs
8. Search for email address -> verify cross-entity match
9. Search for Registration Code -> verify exact match
10. Verify pagination with Chinese labels (defects)

### Expected Results

1. Single search queries BOTH Contacts and Customers simultaneously
2. Fuzzy matching returns partial matches (not exact only)
3. Matching text highlighted in yellow in results
4. Results split by entity type with count badges
5. Returns only real database records (not drafts)
6. Search targets: Name, Mobile, Email, Registration Code
7. Chinese labels in pagination are defects
8. Duplicate Check should be used BEFORE creating new records to prevent duplicates

---

## TC-036 - End-to-End Pipeline - Lead to Payment Complete Data Flow

| Field | Value |
|-------|-------|
| **Module** | Cross-Module |
| **Category** | Full Pipeline |
| **Role** | Sales Rep |
| **Priority** | P0 |

### Precondition

Fresh test environment with no existing records

### Test Steps

1. CREATE Lead -> Assign to Sales Rep -> Fill Principal Allocation
2. CONVERT Lead -> Verify Customer + Opportunity created
3. Verify carry-over: Service Team, Activity Logs, Contacts
4. Navigate to Opportunity -> Advance stage to "Proposal/POC" (50%)
5. CREATE P&L from Opportunity -> Add products -> Verify Financial Summary
6. SUBMIT P&L -> Verify approval routing (margin-based)
7. APPROVE P&L -> CREATE Quotation -> Verify auto-population from P&L
8. Export Quotation PDF -> Verify signatures and financial data
9. CREATE PO -> Upload PO file -> Verify Opportunity status = "Won"
10. CREATE SO -> Define Payment Schedule (Down 50% + Final 50%)
11. CREATE Contract -> Configure expiry reminders
12. PM updates Payment Schedule Completion % to 100%
13. CREATE Invoice Application (Milestone type) -> Select Payment Schedule
14. APPROVE Invoice Application -> Record Collection
15. CREATE Delivery -> Link to SO -> Enter courier info

### Expected Results

1. Complete data lineage verified: Lead -> Customer -> Contact -> Opportunity -> P&L -> Quotation -> PO -> SO -> Contract -> Payment Schedule -> Invoice Application -> Collection -> Delivery
2. At each stage, verify auto-populated fields match parent record
3. Financial amounts consistent across modules (no rounding errors)
4. Status transitions correct at each stage
5. Service Team and permissions enforced throughout pipeline
6. Pipeline Kanban shows deal progressing through 6 stages
7. Total pipeline time from Lead creation to Payment receipt

---

## TC-037 - Currency Consistency - MYR/IDR Dual-Track Across Pipeline

| Field | Value |
|-------|-------|
| **Module** | Cross-Module |
| **Category** | Currency Consistency |
| **Role** | Sales Rep |
| **Priority** | P2 |

### Precondition

Lead created with Currency=IDR, Exchange Rate=0.000223

### Test Steps

1. Create Lead with Currency=IDR, Estimated Amount=50,000,000
2. Convert to Opportunity -> verify Currency=IDR
3. Create P&L -> verify Currency=IDR inherited
4. Add products with MYR prices -> verify conversion to IDR
5. Create Quotation -> verify Currency=IDR, prices in IDR
6. Create SO -> verify Currency=IDR, Order Amount in IDR
7. Create Invoice Application -> verify Currency=IDR
8. Create Collection -> verify Settlement Currency=IDR
9. Navigate to Pipeline Kanban -> verify amount displayed in MYR (reporting currency)

### Expected Results

1. Currency inherited at each stage from parent record
2. MYR is the unified reporting currency (Blueprint Design Principle 5)
3. Pipeline Kanban displays all amounts in branch default currency (MYR)
4. Exchange rate conversion accurate at each step
5. Collection can record payment in different currency (settlement currency)
6. Currency switching in P&L recalculates ALL figures

---

## TC-038 - Data Sharding - Cross-Entity Visibility and Public Pool

| Field | Value |
|-------|-------|
| **Module** | Cross-Module |
| **Category** | Entity Isolation |
| **Role** | Sales Manager |
| **Priority** | P1 |

### Precondition

Customer exists in SCMY entity, another in SMMY entity

### Test Steps

1. Login as User-A (SCMY entity)
2. Navigate to Customer List -> verify only SCMY customers visible
3. Attempt to access SMMY customer via direct URL -> access denied
4. Navigate to Public Pool -> verify unassigned SCMY customers visible
5. Verify SMMY Public Pool customers NOT visible to SCMY user
6. Login as User-B (SMMY entity)
7. Verify mirror behavior: SMMY customers visible, SCMY customers not visible
8. Cross-entity: User-A and User-B cannot see each other records
9. Admin user: verify can see ALL entities records

### Expected Results

1. Entity isolation: each entity data is mutually invisible (Blueprint Design Principle 3)
2. Public Pool visible to all AMs in the SAME region only
3. Direct URL access to cross-entity records returns access denied
4. Admin/super-admin can see all entities
5. Export restrictions protect sensitive contact data per entity
6. Multi-country sharding: MY/VN/PH/ID data partitioned

---

## TC-039 - P&L Version Locking - Quote Generation and Version Correspondence

| Field | Value |
|-------|-------|
| **Module** | Cross-Module |
| **Category** | P&L Version Control |
| **Role** | Sales Rep |
| **Priority** | P1 |

### Precondition

P&L V1 approved, Quotation V1 generated

### Test Steps

1. Navigate to P&L Details -> verify Version = "V1"
2. Navigate to Quotation Details -> verify linked to P&L V1
3. Click "Copy New" on P&L -> creates P&L V2
4. Modify pricing in P&L V2 -> Submit -> Approve
5. Navigate to Quotation -> verify still linked to P&L V1
6. Click "New Quotation" from P&L V2 -> creates Quotation V2
7. Verify Quotation V2 reflects P&L V2 pricing
8. Verify Quotation V1 still shows P&L V1 pricing (version-locked)
9. Attempt to edit Quotation V1 directly -> should be blocked
10. Verify only "active" P&L version (V2) is included in Pipeline Kanban reports

### Expected Results

1. P&L V1 -> Quotation V1, P&L V2 -> Quotation V2 (version correspondence)
2. Quotations cannot be edited directly - must modify underlying P&L
3. "Copy New" creates new P&L version with all data copied
4. Historical P&L versions are deactivated (not included in pipeline reports)
5. Only "active" P&L version data aggregated in Pipeline Kanban
6. Version locking prevents data inflation in pipeline reports (Blueprint Design Principle 1 and 5)
7. Full audit trail: every version change tracked in Process Record

---

## Test Case Summary

| Metric | Count |
|--------|-------|
| **Total Test Cases** | 39 |
| **P0 (Critical)** | 1 |
| **P1 (High)** | 20 |
| **P2 (Medium)** | 17 |
| **P3 (Low)** | 1 |

### Coverage by Module

| Module | Test Cases | Percentage |
|--------|-----------|------------|
| P&L | 6 | 15.4% |
| Lead | 5 | 12.8% |
| Opportunity | 5 | 12.8% |
| Quotation | 4 | 10.3% |
| Cross-Module | 4 | 10.3% |
| SO | 3 | 7.7% |
| Task | 3 | 7.7% |
| Invoice Application | 2 | 5.1% |
| PO | 1 | 2.6% |
| Contract | 1 | 2.6% |
| Payment Schedule | 1 | 2.6% |
| Collection | 1 | 2.6% |
| Delivery | 1 | 2.6% |
| Pipeline Kanban | 1 | 2.6% |
| Duplicate Check | 1 | 2.6% |

### Coverage by Role

| Role | Test Cases |
|------|-----------|
| Sales Rep | 26 |
| Sales Manager | 10 |
| PM | 1 |
| Finance User | 1 |
| Operations | 1 |
