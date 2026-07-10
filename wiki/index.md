---
title: Wiki Index
created: 2026-04-22
updated: 2026-06-09
type: summary
tags: [tool/wiki]
---

# Wiki Index

> Table of contents. Each Wiki page listed by type with a one-line summary.
> Language: **English** (CRM system official language). Any Chinese UI text is a defect.
> Last updated: 2026-06-09 | Total pages: ~53 | Sources: 2 manuals + 17 videos + 1 DOCX + 1 Excel test case file + schema-driven

---

## Entities (CRM Modules)

- [[lead]] — Lead module: data-tid field map, Deal Category modal, Customer Type radio, Principal Allocation table, 8-currency amount ranges, **Lead Import**, **Lead Conversion (3-step wizard)**, **Lead Queue config**, **Task Management** (NEW from videos)
- [[contact]] — Contact module: field registry, gender no-tid handling, window.close pitfall, relation to Customer
- [[customer]] — Customer module: Public Pool rules (60-day), Address detail table, joint follower, multi-country sharding
- [[product]] — Product module: **27 fields from schema**, Principal relation, Cost/List Price/Target Margin, Stock management, Product Status, 5 product types (NEW: schema-driven field registry)
- [[opportunity]] — Opportunity module: **34 fields + 2 detail tables from schema** (mk_km_ltc_business), P&L-driven quoting, stage pipeline, approval workflow, version locking, **video-confirmed 5-stage pipeline**, **ownership transfer**, **service team** (NEW from video)
- [[quote]] — Quote module: P&L-generated document, version-locked, **video-confirmed full field registry**, Excel template export, tax calculation, approval workflow, Excel Editor modal, **slide-over panel creation**, **rich text editors (T&C + Acceptance)**, **PDF Preview modal**, **digital signature preview**, **download behavior** (NEW from video)
- [[po]] — PO module (NEW): customer purchase order capture, auto-population from Quotation, mandatory PO file upload, Product Details table, approval sidebar (NEW from video)
- [[so]] — SO module: order entry, **video-confirmed full field registry**, milestone-driven Payment Schedule table, VDP section, footer/approval fields, data inheritance pipeline (NEW from video)
- [[pipeline-kanban]] — Pipeline Kanban Dashboard: 6-stage summary bar, filter bar, deals table with dot-track progress indicators, search & navigation (NEW from DOCX)
- [[duplicate-check]] — Duplicate Check: fuzzy search across contacts & customers, split tab results, yellow highlight matching (NEW from DOCX)
- [[pl]] — P&L module: pricing engine, cost/margin calculation, approval workflow, **P&L creation process**, **5 product categories**, **PS hierarchy**, **approval sidebar**, **7 category tabs with badges**, **financial KPI cards**, **Select Product modal**, **SM/3rd Party Team tables**, **multi-year view (Year 1-3 RENEW)**, **margin validation warnings**, **cloning capability**, **multi-user collaboration workflow (Collaborate → Recipient edit → Submit back)**, **EasyCraft user picker modal**, **Message Center To-do** (NEW from DOCX)
- [[contract]] — Contract module (NEW): linked to SO, expiry reminders with user notification, file sync to Customer 360, auto-generated Contract ID (NEW from video)
- [[payment-schedule]] — Payment Schedule module (NEW): A/R tracking, payment milestones (Down/Progress/Final), Billing Detail sub-tab, drawer modal details, financial summary cards, **embedded in SO Create with Product Info revenue split logic**, **Select Record modal for Invoice Application**, **Completion % management**, **Change Completion % action**, **System Information audit trail** (NEW from video)
- [[invoice-application]] — Invoice Application module (NEW): Post-sales revenue collection, Project/Milestone billing types, auto-generated IR IDs, SO dependency, line item auto-population, milestone-based Payment Schedule lookup, PDF Preview/Export, Process Approvals sidebar with digital signature (NEW from video)
- [[collection]] — Collection module (NEW): Customer payment tracking, finance confirmation workflow, bank receipt attachment, **16 fields from schema** (NEW from schema generation)
|- [[delivery]] — Delivery module (NEW): Shipment tracking linked to SO, courier info, weight/cost tracking, **19 fields from schema** (NEW from schema generation)
|- [[task]] — Task/Job Task module (NEW): Task creation from entity context, deadline/owner/executor/priority, Associated Type/Data linking, **Completion Progress slider**, **Rich Text Editor for feedback**, Task workflow (In progress → To be confirm → Completed), Sub-tasks, dual-channel reminders (To-Do + Email) (NEW from videos)

---

## Widgets (UI Control Specifications)

*(Deprecated — widget specs migrated to FillerFactory source code)*

## Raw Sources (read-only reference)

- [[raw/articles/crm-user-manual-v1]] — CRM User Manual V1: Lead/Customer/Contact/Opportunity/Quote operations, control type summary
- [[raw/articles/business-blueprint-v1]] — Business Blueprint V1: 5 design principles, P&L flow, org structure, Blueprint vs Manual differences
- [[raw/pl-video-archive]] — P&L video processing archive: 2 videos, 2 transcripts, 24 key frames (2026-05-29)

## Processed Video Sources

| # | Video | Date Processed | Knowledge Added |
|---|-------|---------------|-----------------|
| 1 | Contact & Lead Creation.mp4 | 2026-04-24 | Lead lifecycle, Contact fields, 7 widgets |
| 2 | Lead Management.mp4 | 2026-04-24 | Lead operations, service team, RBAC |
| 3 | Lead Import.mp4 | 2026-04-27 | Import modes, Excel template, validation |
| 4 | Lead cConversion & Lead Queue & Task.mp4 | 2026-04-27 | 3-step conversion, queue config, task management |
| 5 | Opportunity Management.mp4 | 2026-04-27 | 5-stage pipeline, ownership transfer, service team |
| 6 | P&L Creation.mp4 | 2026-04-27 | 3-step P&L, 5 product categories, PS hierarchy |
| 7 | **Quotation.mp4** | **2026-04-28** | **Quote field registry, Excel export, tax calc, approval** |
| 8 | **PO & SO Creation.mp4** | **2026-04-28** | **PO field registry, SO field registry, payment schedule** |
| 9 | **Contract & Payment Schedule.mp4** | **2026-04-30** | **Contract fields, Payment Schedule list/details, 5 new widgets, 3 defects** |
| 10 | **Quotation Template Discussion.mp4** | **2026-05-07** | **Excel template structure, online config table, 7 business entities, field visibility matrix, Quotation Create page confirmation** |
| 11 | **New P&L management.mp4** | **2026-05-27** | **P&L Create full field registry, 7 category tabs, financial KPI cards, Select Product modal, SM/3rd Party Team tables, P&L Details multi-year view, margin validation, cloning** |
| 12 | **Quotation_v2.mp4** | **2026-05-27** | **Quotation Create slide-over panel, full header/customer/foot field registry, rich text editors, PDF Preview modal, digital signature, approval sidebar, download behavior** |
| 13 | **PI.mp4** | **2026-05-28** | **Invoice Application full field registry, Project/Milestone billing, line items, milestone selection, PDF Preview/Export, Process Approvals, 6 new widgets** |
| 14 | **Sales Order_v2.mp4** | **2026-05-28** | **SO List View, SO Details 9-tab navigation, Payment Schedule embedded in SO, revenue split logic, statistic bar, Circulate workflow, Payment Schedule Details** |
| 15 | **Contract & Payment Schedule.mp4** | **2026-06-05** | **Contract Create full field registry, Payment Schedule Details financial tracking, Receivable calculation logic, Contract ID auto-generate, expiry reminder system** |
| 16 | **Service Team& Activity.mp4** | **2026-06-05** | **Add Team Members modal (Permission/Team Role/Project Role), Lead Conversion Carry Over Information (Copy Team/Activities to Customer/Contact/Opportunity), Interaction Log form, currency conversion (IDR→MYR)** |
| 17 | **Task Management.mp4** | **2026-06-05** | **Job Task Create/Details/Feedback full workflow, Completion Progress slider, Rich Text Editor for feedback, Task workflow states (In progress → To be confirm → Completed), Sub-tasks** |

---

## Deep Documentation (for new team members)

- [[module-contract-payment-deep]] — Contract & Payment Schedule: complete field reference, financial calculation logic, permission bugs, testing requirements (12 KB)
- [[module-service-team-activity-deep]] — Service Team & Activity: permission model, activity logging, lead conversion carry-over, known bugs (10 KB)
- [[module-task-management-deep]] — Task Management: task lifecycle, create/feedback workflow, reminder system, testing scenarios (11 KB)

---

## User Manuals (bilingual EN/ZH)

| Module | English | Chinese |
|--------|---------|---------|
| Lead | [[user-manuals/en/lead-manual-en]] | [[user-manuals/zh/lead-manual-zh]] |
| Contact | [[user-manuals/en/contact-manual-en]] | [[user-manuals/zh/contact-manual-zh]] |
| Customer | [[user-manuals/en/customer-manual-en]] | [[user-manuals/zh/customer-manual-zh]] |
| Opportunity | [[user-manuals/en/opportunity-manual-en]] | [[user-manuals/zh/opportunity-manual-zh]] |
| P&L | [[user-manuals/en/pl-manual-en]] | [[user-manuals/zh/pl-manual-zh]] |
| Quotation | [[user-manuals/en/quotation-manual-en]] | [[user-manuals/zh/quotation-manual-zh]] |
| PO | [[user-manuals/en/po-manual-en]] | [[user-manuals/zh/po-manual-zh]] |
| Sales Order | [[user-manuals/en/sales-order-manual-v2-en]] | [[user-manuals/zh/sales-order-manual-v2-zh]] |
| Contract | [[user-manuals/en/contract-manual-en]] | [[user-manuals/zh/contract-manual-zh]] |
| Payment Schedule | [[user-manuals/en/payment-schedule-manual-en]] | [[user-manuals/zh/payment-schedule-manual-zh]] |
| Invoice Application | [[user-manuals/en/invoice-application-manual-en]] | [[user-manuals/zh/invoice-application-manual-zh]] |
| Collection | [[user-manuals/en/collection-manual-en]] | [[user-manuals/zh/collection-manual-zh]] |
| Delivery | [[user-manuals/en/delivery-manual-en]] | [[user-manuals/zh/delivery-manual-zh]] |
| Duplicate Check | [[user-manuals/en/duplicate-check-manual-en]] | [[user-manuals/zh/duplicate-check-manual-zh]] |
| Pipeline Kanban | [[user-manuals/en/pipeline-kanban-manual-en]] | [[user-manuals/zh/pipeline-kanban-manual-zh]] |
| Service Team & Activity | [[user-manuals/en/service-team-activity-manual-en]] | [[user-manuals/zh/service-team-activity-manual-zh]] |
| Task Management | [[user-manuals/en/task-management-manual-en]] | [[user-manuals/zh/task-management-manual-zh]] |
| Signature Upload | [[user-manuals/en/signature-manual-en]] | [[user-manuals/zh/signature-manual-zh]] |

---

## Concepts / Comparisons / Queries / Summaries

(Growing as knowledge accumulates)
