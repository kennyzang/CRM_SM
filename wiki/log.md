# Wiki Log

> Chronological record of all Wiki operations. Append-only.
> Format: `## [YYYY-MM-DD] action | subject`
> Action types: ingest, update, query, lint, create, archive, delete
> Rotate when exceeding 500 entries: rename to `log-YYYY.md`, start fresh.

---

## [2026-04-22] create | Wiki initialized

- **Domain**: Securemetric CRM Automated Testing Knowledge Base
- **Wiki path**: `/Users/xiex/Documents/GIT/OVERSEABU/Test/CRM-Securemetric/wiki`
- **Background**: CRM implementation project needs AI-driven automated testing framework with Hermes Agent LLM Wiki for knowledge consolidation
- Created by: WorkBuddy AI (with user)

---

## [2026-04-22] ingest | User Manual (raw document)

- Extracted `CRM客户关系管理-用户手册V1_20250318.docx` → `raw/articles/crm-user-manual-v1.md`
- Content: Lead/Customer/Contact/Opportunity/Quote user operation manual
- Characters: 21,453 | Lines: 960
- Includes: TOC structure, control type summary table, important business rules

---

## [2026-04-22] ingest | Business Blueprint (raw document)

- Extracted `Business Blueprint.docx` → `raw/articles/business-blueprint-v1.md`
- Content: 5 design principles, P&L flow, org structure, business rules
- Lines: 164 (summary)
- Key: Locked Pair pricing, 72h lead timeout, 60-day ocean, milestone settlement

---

## [2026-04-22] translate | Full wiki English rewrite (major restructure)

- **Language policy**: English is the primary language. CRM system official language is English. Any Chinese UI text is a defect.
- **Action**: Translated ALL wiki pages from Chinese to English, restructured, and enriched with code analysis
- **New entity pages created**:
  - `entities/quote.md` — Quote/Quotation module (P&L-generated, read-only, version-locked)
  - `entities/pl.md` — PL (Price List) module (pricing engine, approval workflow)
  - `entities/so.md` — SO (Sales Order) module (milestone-driven invoicing)
- **Pages rewritten in English**:
  - `SCHEMA.md` — Added language policy, updated tag taxonomy with new modules (quote, pl, so, pool)
  - `index.md` — Restructured with 18 pages across 8 sections
  - `entities/lead.md` — Complete field registry from `lead.fields.ts`, Principal Allocation detail table, currency ranges
  - `entities/contact.md` — Field registry, gender no-tid handling, window.close pitfall
  - `entities/customer.md` — Public ocean rules, address detail table, multi-country sharding
  - `entities/product.md` — Target margin, principal relation, error page reload handling
  - `entities/opportunity.md` — P&L approval workflow, stage pipeline, version locking
  - `widgets/special-controls.md` — 8 widget types with Playwright templates, multi-strategy selectors
  - `pitfalls/pitfall-log.md` — 12 resolved pitfalls (expanded from 6), CRM typos documented
  - `procedures/fill-crm-form-procedure.md` — FormEngine architecture, field types, data generators
  - `test-plans/phase-1.md` — Added Opportunity module, updated progress
  - `test-plans/phase-2.md` — Core workflow transitions, technical challenges
- **Source enrichment**: Incorporated data from 15+ source code files:
  - All page objects (LeadCreatePage, LeadFormPage, ContactCreatePage, CustomerCreatePage, ProductCreatePage, OpportunityCreatePage)
  - Field registries (lead.fields.ts, contact.fields.ts, opportunity.fields.ts)
  - Core types (field.types.ts), configs (labels.ts, env.config.ts), generators (faker-generator.ts)
  - FormEngine architecture, BasePage helper methods
- **Key additions from code analysis**:
  - Principal Allocation detail table column data-tids
  - Currency-specific estimated amount ranges (8 currencies)
  - CRM typo documentation: "teaxtarea", "raido", "prodcut"
  - FormEngine iframe resolution pattern
  - Promise.race .catch() requirement for all branches
  - Network tips overlay handling pattern
  - about:blank redirect handling
  - Residual cascader panel isolation strategy
  - Label mapping table from config/labels.ts (60+ EN↔ZH pairs)

---

## [2026-04-24] ingest | OSS Videos: "Contact & Lead Creation" + "Lead Management"

- **Source 1**: `Contact & Lead Creation.mp4` (80.0 MB, 1412s, 23.5 min) — 94 frames extracted at 15s intervals
- **Source 2**: `Lead Management.mp4` (74.3 MB, 1188s, 19.8 min) — 79 frames extracted at 15s intervals
- **Method**: Frame extraction via ffmpeg → vision AI analysis → Wiki update

### New knowledge added:

**entities/lead.md** — Major expansion:
  - Lead lifecycle statuses (Unassigned → Pending → Follow-up → Converted → Invalid)
  - Lead stage pipeline (Targeting 0% → Prospecting 5% → End)
  - 13 business rules (was 5), including currency localization, win rate calculation, autocomplete, drag-sortable tables, assignment workflow, reclaim countdown
  - New fields: Owner, Internal Dept (header), Legal ID, Partner, Phone, URL, Business Card, Note, Marketing Event, Entity (tag), Currency, Estimated Deal Amount, Win Rate (footer)
  - Principal Allocation: Added Principal Name, MYR Value, Weighted amount columns
  - New section: Contact Person detail table with lookup modal pattern
  - Lead management operations: list view filters, detail view sub-tabs, "More" menu actions, service team management

**entities/contact.md** — Major expansion:
  - 7 business rules (was 3): added email/phone requirement, relationship scoring, owner auto-assignment, duplicate validation
  - 20 fields (was 8): Added Customer, Reports To, Relationship (scoring dropdown), Referred By, Business Card, Owner, Type, Decision Maker, Role in Decision, Birthday, Office Phone, Owner's Department
  - Gender marked as Required (was No)

**widgets/special-controls.md** — 7 new widget patterns:
  - Autocomplete (Lead Name, Mobile)
  - Tag/Multi-Select Input (Entity, Customer)
  - Validation Banner ("Form validation anomaly, total of N items")
  - Progress Stepper (stage pipeline)
  - Toast Notification ("Operation succeeded")
  - Service Team Modal (team member management)
  - File Upload (Business Card)

**procedures/lead-management.md** — New page:
  - Complete lead lifecycle operations documentation
  - Sales Lead List: ownership tabs, status tabs, columns, toolbar operations
  - Lead Detail View: stage stepper, 6 sub-tabs, "More" menu actions
  - Service Team Management: roles, permissions, operations
  - Workflow transitions: creation→assignment, processing, conversion, disqualification
  - RBAC rules, notification triggers, error states
  - Complete sidebar navigation structure

**index.md** — Updated Procedures section with new lead-management page

---

## [2026-04-27] ingest | OSS Videos: Lead Import, Lead Conversion/Queue/Task, Opportunity Management, P&L Creation

- **Source 1**: `Lead Import.mp4` (38.0 MB, 605s, 10.1 min) — 40 frames extracted, 14 analyzed
- **Source 2**: `Lead cConversion & Lead Queue & Task.mp4` (69.6 MB, 1627s, 27.1 min) — 108 frames extracted, 20 analyzed
- **Source 3**: `Opportunity Management.mp4` (30.5 MB, 789s, 13.2 min) — 53 frames extracted, 18 analyzed
- **Source 4**: `P&L Creation.mp4` (81.1 MB, 1612s, 26.9 min) — 107 frames extracted, 6 key frames analyzed
- **Method**: Frame extraction via ffmpeg → parallel delegate_task vision analysis → Wiki update

### New knowledge added:

**entities/lead.md** — Major expansion (4 new sections):
  - **Lead Import**: Import modal fields (Import Mode radio cards, Condition Field, Duplicate Check), 4 import modes (Add/Update/Upsert/Quick), Excel template (17 columns, 9 required), enum validation rules, Lock Status mapping
  - **Lead Conversion**: 3-step wizard (Customer → Contact → Opportunity), conversion modal fields, Opportunity Products table with auto-calculated Weighted Amount, post-conversion state changes
  - **Lead Queue Configuration**: Queue Edit page fields, Claim & Assign Rules (radio), Ownership Rules (checkboxes), New Lead Notification toggle, 7-day SLA reclaim countdown
  - **Task Management**: Task Create modal fields, reminder configuration, Task Details page, Task Feedback modal with slider progress (0-100%), WYSIWYG editor, task workflow states

**entities/opportunity.md** — Video-confirmed expansion:
  - 5-stage pipeline confirmed: Qualifying (25%) → Proposal/POC (50%) → Price Negotiation (75%) → Deal Won (100%) / Deal Lost (0%)
  - Opportunity Code format: BSOP + YYYYMMDD + sequence
  - Ownership Transfer Logic: new owner selection, original owner disposition (remove/demote), permission levels, team continuity
  - Service Team Management: Add Group Member modal, Project Character bug noted
  - Task Creation: slide-out drawer fields, reminder sub-table
  - Approval Workflow: Start → Drafting → Approval → End nodes
  - Sub-tabs: Details, Product, P&L, Quotation, PO, Sales Order, Decision-Maker Map, Competitive Analysis
  - 3 new bugs/issues: Project Character field missing, "Oppourtunities" typo, inconsistent stage order

**entities/pl.md** — Complete rewrite with video knowledge:
  - P&L Creation Process: 3-step (Header → Product Lines → Summary)
  - Header fields: Version (auto), Customer, Opportunity (*), Currency (*), Date (*), Deal Category
  - 5 Product Categories: Software, Hardware, Prof Service, Reimbursement, Others
  - Software section: Selling Price with List Price, Markup %, Markup per unit
  - Hardware section: Cost Price with Cost per unit, Unit, Total cost, Expected Profit, Margin %
  - Professional Services: Two-level parent-child hierarchy (Activity Description → Resource Role), Service Master integration, Man Days × Rate formula
  - Financial Summary: Total Selling Price, Total Cost, Expected Profit, Margin % (auto-calculated)
  - Approval Workflow: sidebar Process Approvals, Process Handling tabs, Approval Records table
  - Status Workflow: Save (draft) → Submit (approval) → Revoke (cancel)
  - Product List context: filter tabs, search fields, grid columns

**widgets/special-controls.md** — 6 new widget patterns:
  - Radio Card Group (Import modes selection)
  - Toggle Switch (notification, discount)
  - Slider (task completion progress 0-100%)
  - Rich Text Editor / WYSIWYG (task feedback)
  - Wizard/Stepper Modal (3-step lead conversion)
  - User Chip/Tag Selector (owner, executor, admin, member)

**index.md** — Updated entity descriptions, widget count (8 → 21), source count

### New bugs documented:
- "Delet" typo in P&L product row actions (missing 'e')
- "Oppourtunities" typo in stage template
- "Project Character" field missing in Add Group Member modal
- Inconsistent stage order between detail view and template config

---

## [2026-04-28] ingest | OSS Videos: Quotation, PO & SO Creation

- **Source 1**: `Quotation.mp4` (46.2 MB, 694s, 11.6 min) — 46 frames extracted, 6 key frames analyzed
- **Source 2**: `PO & SO Creation.mp4` (47.6 MB, 1083s, 18.1 min) — 72 frames extracted, 6 key frames analyzed
- **Method**: Frame extraction via ffmpeg → sequential vision_analyze → Wiki update

### New knowledge added:

**entities/quote.md** — Complete rewrite with video knowledge:
  - Full field registry (Header, Customer Info, Line Items, Foot sections) [V]
  - Line Items table: Total Excl/Incl Service Tax, Service Tax, Total Tax columns
  - Global Tax: 8% SST (Malaysia) support
  - Foot section: Terms & Conditions, Prepared/Approved signatures (drag-drop upload), Acceptance Instruction
  - Template/Attachment section: Excel (.xlsm) + PDF export, "Only view mode" states
  - Excel Editor modal: fd_quote_ship_name, fd_quote_attn_name/tel/mail, Detail Data grid
  - Auto-population from Opportunity: Customer, Currency, Department
  - Ship Via dropdown: 7 shipping options
  - 3 new bugs documented: "prodcut" typo, HTTP download blocked, template row limit

**entities/po.md** — New page:
  - PO Create field registry: PO Number, Date, Quotation (lookup), Deal Category, PO File upload
  - Auto-populated fields: Opportunity, Customer, Currency, Total Amount
  - Product Details table: Service Period, Product, Product Code, Type, Description, Quantity
  - Approval workflow sidebar (same pattern as other modules)
  - Data inheritance from Quotation
  - PO in Opportunity context: PO Number sub-table

**entities/so.md** — Complete rewrite with video knowledge:
  - Full field registry (Order Header, Bill To, Payment Schedule, Excel Export, Footer/Approval, VDP)
  - Order Header: 18 fields including Sales Order ID (auto), Entity, Sales Rep, Quotation link
  - Customer PO No. and P.O. Date as mandatory fields
  - Payment Schedule table: Name, Contract Terms, Receivable %/Amount, Payment Type
  - Inline row operations: Insert | Copy | Delete
  - Progress Payment type confirmed
  - Footer/Approval: Prepared by, Verified by (user lookup)
  - VDP section: Customer, Address, Attn Name, Date VDP
  - Full data lineage: Lead → Contact → Customer → Opportunity → P&L → Quotation → PO → SO

**pitfalls/pitfall-log.md** — 3 new pitfalls:
  - #13: "prodcut" typo in Quotation Excel Editor column header
  - #14: Browser "Insecure download blocked" on HTTP environments
  - #15: Quotation template row limit warning (data truncation risk)

**index.md** — Updated:
  - Added PO entity page reference
  - Updated Quote and SO descriptions with video-confirmed details
  - Added "Processed Video Sources" table (8 videos tracked)
  - Updated pitfall count (12 → 15)
  - Updated total pages (20 → 21) and sources (6 → 8 videos)


---

## [2026-05-07] ingest | Video: Quotation Template Discussion.mp4 (107.7MB, 26min)

**entities/quote.md** — Major update (113 new lines added):
- Excel template structure: 4 sheets (Quotation, Sales Order, PI-MYR, PI-USD)
- Company header details: Securemetric Technology Sdn Bhd, document control numbers
- Online configuration table ("SM模板") on DingTalk Docs / Lanling platform
- 7 business entity codes identified: SMMY, SCMY, MSMY, PTSM, PTSK, SMPH, SMVN
- Full field visibility matrix: 17 fields × 7 entities (Auto-filled vs Hidden configuration)
- Configuration rules: Yellow=Auto-filled, Blue=Hidden, Blank=unconfigured
- Quotation Create page system-confirmed fields: PSL, Version, Global Tax, Total Excl/Tax/Sum
- Export Excel section confirmed: Original Template + VDP template (both .xlsm)
- "Only view mode" state for Export buttons in read-only mode
- Approval sidebar fully documented: Track dropdown, Common Comments, Expand approval options
- Signature upload fields confirmed: Prepared Signature + Approved Signature (drag-drop image upload)
- Footer fields: Owner, Entity, Unit Company

**index.md** — Updated:
- Added video #10 to Processed Video Sources table
- Updated total pages (23 → 24) and sources (9 → 10 videos)
- Updated last updated date (2026-04-30 → 2026-05-07)


**entities/contract.md** — NEW page (26 lines):
  - 10 fields [V]: Contract Title, Contract ID (auto-generated), Sales Order (required link), Customer, Signed Date, Expiry Date, Remarks, Attachment, Notify Who, Notify XX Days
  - Contract Reminder sub-table with per-row actions (Insert/Copy/Delete)
  - Business rules: SO→Contract flow, file sync to Customer 360, attachment mandatory inconsistency

**entities/payment-schedule.md** — NEW page (46 lines):
  - List view: 11 columns, tab filters (A/R Amount, Repaid, Outstanding), search/export/delete
  - Details drawer: 4 sub-tabs (Detail Information, Payment Detail, Billing Detail, System Record)
  - 14 detail fields [V]: Payment Schedule ID (PP+YYYYMMDD+seq), Customer PO, Payment Type, financial metrics
  - Billing Detail sub-table columns
  - Business rules: auto-generation from SO, 50/50 payment splits, Completion % tracking

**widgets/special-controls.md** — 4 new widget patterns (#22-#25):
  - #22: Reminder Sub-table (embedded grid with per-row actions)
  - #23: Drawer/Slide-out Modal (right-side overlay)
  - #24: Financial Summary Cards (horizontal metric layout)
  - #25: Tab Record Counts (parentheses notation)

**pitfalls/pitfall-log.md** — 3 new pitfalls:
  - #16: "Delievery" typo on SO details tabs
  - #17: Contract tab empty state mismatch (count shows N, displays "No Data")
  - #18: Attachment mandatory inconsistency (spec says required, UI shows no asterisk)

**index.md** — Updated:
  - Added contract and payment-schedule entity page references
  - Updated Processed Video Sources table (9 videos tracked)
  - Updated total pages (21 → 23) and sources (8 → 9 videos)

## [2026-05-27] ingest | OSS Videos: New P&L management + Quotation_v2

- **Source 1**: `New P&L management.mp4` (84.0 MB, 1332s, 22.2 min) — 89 frames extracted at 15s intervals, 8 key frames analyzed via vision_analyze
- **Source 2**: `Quotation_v2.mp4` (37.0 MB, 532s, 8.9 min) — 35 frames extracted at 15s intervals, 4 key frames analyzed via vision_analyze
- **Method**: Frame extraction via ffmpeg → main thread vision_analyze on strategically spaced key frames → Wiki update

### New knowledge added:

**entities/pl.md** — Major expansion (123 new lines):
  - **7 category tabs with badges**: Overview, Software, Hardware, Hardware Renew, Services, Reimbursement, Others
  - **Create page full field registry**: Version, Customer, Opportunity, Currency, Date (with required indicators)
  - **Global Discount bar**: Yellow-highlighted bar with numeric input and toggle switch
  - **Financial Summary Cards**: 4 KPI cards (Total Revenue, Total Cost, Total Profit, Margin) with color coding
  - **Product table columns**: 14 columns confirmed (Code, Product, Unit Price, Markup, Disc, Price, Qty, Total Price, Cost, Profit, Margin, Target)
  - **Section structure**: SM Products, 3rd Party Software, 3rd Party Hardware — each with "+ Add Products" button and footer summary
  - **Select Product Modal**: Dual-panel layout with search filters (Product Code, Product Description), left panel results, right panel "Selected (N)"
  - **Professional Services — SM Team / 3rd Party Team tables**: 11 columns (Activity, Note, Rate/Day, Days, Total Price, Cost Rate/Day, Days (Cost), Total Cost, Profit, Margin)
  - **P&L Details page**: Multi-year breakdown table (Year 1, Year 2 RENEW, Year 3 RENEW, TOTAL), Entity/Deal Category fields, Permissions tab
  - **P&L Approval Workflow**: Full flowchart confirmed (Margin Decision → Key Products Decision → Sales Team Supervisor)
  - **Row actions**: Edit, Renew, Delete
  - **Cloning**: URL parameter operationCode=instanceClone
  - **Business logic notes**: Margin = (Profit/Cost)×100 (Markup, not Gross Margin), multi-year contracts, Services 0% margin pass-through

**entities/quote.md** — Major expansion (131 new lines):
  - **Quotation Create as slide-over panel**: Launched on top of Opportunity Details (dimmed background)
  - **Header Information fields**: Quotation Title (with autocomplete), P&L, Attn, Currency, Department, Ship Via, Term
  - **Right column fields**: P&L ID, Address, Opportunity, Sales Rep, Quote Date
  - **Customer Info (TO) section**: Customer, Address, Attn, Tel, E-Mail
  - **Financial Summary**: Total Excl Tax, Service Tax (8% SST), Grand Total Incl Tax
  - **Foot section with Rich Text Editors**: Terms & Conditions (8 items with placeholders), Prepared by, Approved by, Acceptance Instruction
  - **Process Approvals sidebar**: Track dropdown, comments, signature preview, Submit button
  - **Quotation Details page**: Tabs (Details, Quotation Details, Sales Order), +Create More action
  - **PDF Preview modal**: Financial summary table, company header, T&C, signature blocks (Prepare by/Approved by), Export PDF button
  - **Download behavior**: Browser notification with file name and size
  - **Full sidebar navigation**: 12 menu items (LEAD → Mgt View)

**widgets/special-controls.md** — 5 new widget patterns (#26-#30):
  - #26: Select Product Modal (Dual-Panel) — P&L product selection
  - #27: Digital Signature Preview — approval sidebar signature
  - #28: PDF Preview Modal — quotation document preview
  - #29: Margin Validation Warning Icon — red exclamation when below target
  - #30: Badged Category Tabs — P&L category navigation

**index.md** — Updated:
  - Added videos #11 and #12 to Processed Video Sources table
  - Updated widget count (25 → 30)
  - Updated total sources (10 → 12 videos)
  - Updated last updated date (2026-05-07 → 2026-05-27)
  - Fixed duplicate entries (opportunity, contract were accidentally overwritten)

---

## [2026-05-09] update | Terminology fix + Lead conversion flow update
  - entities/customer.md: All "Public Ocean" replaced with "Public Pool"
  - entities/lead.md: SLA section already used "Public Pool", confirmed consistency
  - index.md: Directory references updated
  - test-plans/phase-2.md: Test plan terminology updated
  - raw/articles/business-blueprint-v1.md: Business blueprint terminology updated
  - raw/articles/crm-user-manual-v1.md: User manual terminology updated

**Lead-to-Opportunity conversion flow fix**:
  - entities/lead.md: Removed "Step 2: Contact" section entirely
  - Conversion flow changed from 3-Step to 2-Step: Customer → Opportunity
  - Added note: Contacts from Lead are auto-carried into Opportunity, no manual conversion needed
  - Progress stepper updated to: **1. Customer ✓** → **2. Opportunity ●**

---

## [2026-05-28] ingest | PI.mp4 + Sales Order_v2.mp4 — Invoice Application module + SO v2 updates

**Videos processed:**
- **PI.mp4** (39MB, 13min, 52 frames) → Invoice Application module knowledge
- **Sales Order_v2.mp4** (55MB, 17min, 70 frames) → SO List/Details/Payment Schedule updates

**New knowledge added:**

**entities/invoice-application.md** — NEW page created:
  - Module overview: REVENUE section → Invoice Application
  - ID format: IRYYYYMMDDNNNN (e.g., IR202605270004)
  - List page: columns, toolbar, Total Billing Amount
  - Create page field registry (4 sections):
    - Basic Information: Invoice Type (Project/Milestone radio), Sales Order, Entity, P.I.C., Currency, Opportunity, etc.
    - Header: PI No., Ref No., Date (all auto-generate)
    - Customer (TO): Company Name, Address, Attn, Email, Tel
    - Line Items: Service Period, Product, Product Code, Description, Qty, Unit Price, Totals
    - Milestone section: Milestone Name, Receivable %, Invoice under Approval, Uninvoiced Amount, Payment Schedule ID
    - Invoice Amount: Total Excl Tax, Service Tax (8%), Grand Total
  - Details page: read-only view of all fields
  - PDF Preview Modal: Proforma Invoice format, Export PDF
  - Process Approvals sidebar: Track, Comments, Digital Signature
  - Select Record Modal: Payment Schedule lookup with filter fields
  - 8 business rules confirmed
  - Workflow: SO → Invoice Application → Project/Milestone → Approval → Invoice Generation
  - UI typo noted: "Univoiced Amount" → should be "Uninvoiced"

**entities/so.md** — Major update (123 new lines):
  - SO List View: 10 columns, Total SO Amount, toolbar
  - Sidebar: SALES ORDER → Sales Order | SO Product | Contract | Delivery
  - SO Details page: Header fields, Sales Order Statistic bar (6 metrics)
  - Details Page Tabs: 9 tabs with record counts (Products, Delivery, Contract, Collection, Payment Schedule, Progress Invoice, Transaction, Approval)
  - Payment Schedule (embedded in SO Create): Milestone Type, columns (Milestone Name, Payment Type, Job Content, Contract Terms, Product Info)
  - Split Payment Logic: Software/Hardware percentage distribution across milestones
  - SO Create additional fields: Attn, Terms, Ship Via, Project Manager, Order Amount, Deal Category
  - Payment Schedule Details page: 16 fields, System Information audit trail, action buttons
  - Quotation Circulate Workflow: Operation radio, circulator identity, circulation objects, review comments, toggle switch

**entities/payment-schedule.md** — Update:
  - Payment Schedule within SO Create: embedded section with Product Info revenue split
  - Payment Schedule Details additional fields: Completion %, Start Date, Planned Collection, Remind before, Project Status/Manager
  - Select Record Modal (from Invoice Application): filter fields and grid columns
  - Sidebar navigation order confirmed: Payment Schedule → Invoice Application → Milestone Invoice → Customer Payment → Collection Details

**widgets/special-controls.md** — 6 new widget patterns (#31-#36):
  - #31: PDF Preview Modal — Invoice/Quotation document preview
  - #32: Revenue Split Display (Product Info) — Software/Hardware percentage split
  - #33: Sales Order Statistic Bar — 6 financial metrics display
  - #34: Detail Page Tab Bar (SO Details) — 9 tabs with record counts
  - #35: Digital Signature Pad (Invoice Application) — Canvas-based signature
  - #36: Circulate Workflow Panel — Pre-approval circulation workflow

**index.md** — Updated:
  - Added invoice-application.md to Entities section
  - Updated payment-schedule summary with new findings
  - Updated widget count: 30 → 36
  - Added videos #13 and #14 to Processed Video Sources table
  - Updated last updated date: 2026-05-27 → 2026-05-28
  - Updated total pages: 24 → 25
  - Updated total sources: 12 → 14 videos

---

## [2026-05-29] decision | Video processing limitation & Requirement meeting.mp4 skip

- **Known limitation**: Current video-to-wiki pipeline only extracts visual frames via ffmpeg + vision_analyze. **No audio/voice recognition capability** — cannot transcribe speech from meeting recordings, requirement discussions, or voiceover tutorials.
- **Decision**: Skip `Requirement meeting.mp4` (358.7 MB) on OSS. This file is a requirement meeting recording where core content is in speech, not visual UI. Current pipeline cannot extract useful knowledge from it.
- **Future action**: User will provide an audio recognition solution (STT/whisper integration) before processing meeting-type videos.
- **Rule**: Meeting recordings / voiceover tutorials → skip until STT pipeline is added. UI operation screencasts → process as normal.

---

## [2026-05-29] update | DashScope Paraformer STT integration — fully tested

- **Provider**: DashScope Paraformer v2 (`paraformer-v2`)
- **API Key**: `sk-6cec03959a3b4e89818af7852d42c1bd` (from `~/.hermes/.env`)
- **Cost**: Free tier, no separate service activation needed
- **Test result**: ✅ Successfully transcribed Chinese audio: `"Hello word, 这里是阿里巴巴语音实验室。"`
- **Complete workflow verified**:
  1. `ffmpeg` extract audio from video → 16kHz mono WAV
  2. `Files.upload()` upload audio to DashScope → get managed file URL
  3. `Transcription.call(model='paraformer-v2', file_urls=[url])` → async task
  4. Poll task_id until `SUCCEEDED`
  5. Fetch `transcription_url` from results → download JSON
  6. Extract `transcripts[0].text` → final transcript
- **Alibaba NLS fallback**: Token API returns `40020503 No permission!` — AccessKey lacks NLS service. Paraformer is the working solution.
- **Updated skill**: `video-to-wiki-ingestion` updated with STT workflow and pitfalls
- **Next step**: Process `Requirement meeting.mp4` with full video+audio pipeline when ready

---

## [2026-05-29] ingest | P&L module re-analysis with STT — 2 videos re-processed with audio

- **Videos processed**: P&L Creation.mp4 (26.9 min, 12106 chars transcript) + New P&L management.mp4 (22.2 min, 10383 chars transcript)
- **New knowledge from audio (7 bugs confirmed)**:
  - Software products not selectable in P&L (Principal filter issue)
  - Opportunity products don't auto-fill in P&L product line
  - Product carryover misses software items (only 2 of 3 carried)
  - Reimbursement incorrectly shows selling price field (should be cost-only)
  - Third-party product filter not scoped to entity/opportunity
  - Services section lacks markup field (0% margin always)
  - Reimbursement total cost = 0 when quantity not specified
- **New knowledge from audio (8 clarifications)**:
  - Multi-user collaboration workflow (Sales rep ↔ Solution Architect)
  - Margin formula clarified: Expected Profit / Total Selling Price × 100
  - Global discount toggle behavior (ON = all items, OFF = per-item)
  - Reimbursement logic (pass-through costs with optional markup)
  - Approval workflow conditions (margin < target → supervisor)
  - Version control rules (only latest version active)
  - Sidebar edit mode (new UI vs inline table editing)
  - Currency switching recalculates all figures
  - Product Master data flow (list price, cost, target margin auto-carry)
- **Wiki updated**: `entities/pl.md` — added "Audio-Confirmed Updates [A]" section with 7 bugs + 8 clarifications, expanded Known Issues from 4 to 12 items
- **Provenance**: [A] = audio-confirmed (with transcript), [V] = video-confirmed (visual only)

---

## [2026-05-29] update | Test plans + Archive for P&L

- **phase-1.md**: Added PL module row (0% coverage)
- **phase-2.md**: Added 15 new test cases:
  - 7 bug regression tests (TC-P015 ~ TC-P021)
  - 8 business logic tests (TC-P022 ~ TC-P029)
  - Updated technical challenges section with audio-confirmed findings
  - Updated date to 2026-05-29
- **Archive created**: `wiki/raw/pl-video-archive.md` + transcripts + key frames
  - Transcripts: 2 files (22 KB total) → `wiki/raw/transcripts/`
  - Key frames: 24 images (4.4 MB total) → `wiki/raw/raw-frames/`
  - Videos + audio remain in `/tmp/` (temporary)
- **index.md**: Added link to pl-video-archive

## [2026-06-04] ingest | OSS Video STT Batch Processing — 14 videos

- **Source**: 14 videos from OSS `easycraft-securemetric` bucket (ap-southeast-3)
- **Pipeline**: Download → ffmpeg extract audio → upload to OSS → signed URL → DashScope Paraformer-v2 STT
- **Total**: 14 transcripts, ~93,000 characters, saved to `wiki/raw/transcripts-oss/`
- **Videos processed**: contact_lead_creation, contract_payment_schedule, lead_conversion_queue_task, lead_import, lead_management, new_pl_management, opportunity_management, pi, pl_creation, po_so_creation, quotation, quotation_template_discussion, quotation_v2, sales_order_v2
- **Audio files**: Uploaded to OSS `stt-audio/` prefix
- **Key knowledge confirmed**: Multi-user P&L collaboration (Sales rep ↔ Solution Architect), global discount ON/OFF behavior, approval routing conditions (margin < target → supervisor), margin vs markup distinction, 7 P&L category tabs with badges, SO 9-tab navigation, embedded Payment Schedule with revenue split, Circulate workflow, Invoice Application Project/Milestone billing

## [2026-06-04] update | Screenshots added to user manuals

- **14 videos processed**: Extracted ~900+ frames, verified 11 key screenshots via vision_analyze
- **New screenshots added to wiki/assets/**: contact-001/002, lead-001~008, opportunity-001 (11 new)
- **Total assets**: 40 screenshots (lead: 8, contact: 2, opportunity: 1, pl: 9, quote: 5, so-v2: 7, ir: 7)
- **HTML manuals updated**: lead-manual-zh.html (8 screenshots), contact-manual-zh.html (2), opportunity-manual-zh.html (1)
- **Image pipeline**: ffmpeg fps=1/15 → raw-frames → vision_analyze → assets/ → markdown references → generate.py
- **English manuals**: Screenshots not yet added (pending)

## [2026-06-04] update | More screenshots added + HTML regenerated

- **New screenshots**: quotation-001 (Quotation Create form), quotation-002 (Quotation foot section with T&C and signature)
- **Updated manuals**: quotation-manual-zh.html (2 screenshots), lead-manual-en.html (3 screenshots)
- **Total assets**: 42 screenshots in wiki/docs/output/assets/
- **Total screenshots per manual**:
  - lead-manual-zh: 8, lead-manual-en: 3
  - contact-manual-zh: 2, contact-manual-en: 0
  - opportunity-manual-zh: 1, opportunity-manual-en: 0
  - pl-quotation (zh/en): 13 each
  - quotation-manual-zh: 2, quotation-manual-en: 0
  - sales-order-v2 (zh/en): 7 each
  - invoice-application (zh/en): 7 each
- **HTTP server**: Running on http://localhost:8080

