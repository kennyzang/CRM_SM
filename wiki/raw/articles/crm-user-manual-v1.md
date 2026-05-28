---
title: CRM User Manual V1
created: 2026-04-22
updated: 2026-04-22
type: summary
tags: [tool/wiki]
sources: []
related: [[lead]], [[customer]], [[contact]], [[opportunity]]
---

# CRM User Manual V1 — English Summary

> Source document: `CRM客户关系管理-用户手册V1_20250318.docx`
> Extracted: 2026-04-22
> Document type: User operation manual

---

## Table of Contents

- Chapter 1: Introduction (feature overview, business flow)
- Chapter 2: Lead Management (sales lead view, business operations, lead pool)
- Chapter 3: Opportunity & Customer Management
  - 3.1 Customer (view, operations, public pool, joint follower)
  - 3.2 Contact (view, operations, contact relationship graph)
  - 3.3 Opportunity (view, stage progression engine)
  - 3.4 Quotation
  - 3.5 Competitive Intelligence
- Chapter 4: Financial Management
- Chapter 5: System Administration

---

## Core Modules

### Lead Management
- Entry: `/web/#/lead/list`
- Business flow: Lead acquisition → Conflict check → Assignment → Follow-up → Conversion
- View types: My Leads / Team Leads / Lead Pool
- Key operations: Create, Edit, Transfer, Convert (to Opportunity / to Customer)

### Customer Management
- Entry: `/web/#/crm/customer/list`
- Customer types: End Customer / Partner
- Public Pool rule: 60-day inactivity auto-release to public pool
- Key operations: Create, Edit, Transfer, Claim, Joint Follow-up

### Contact Management
- Entry: `/web/#/crm/contact/list`
- Relationship: Contact must be linked to a Customer
- Key operations: Create, Edit, Link Customer, Relationship Graph

### Opportunity Management
- Entry: `/web/#/crm/opportunity/list`
- Core: P&L (Profit & Loss) driven quoting
- Stage progression engine: automatic/manual stage advancement per predefined rules

### Quotation
- P&L-driven, non-editable document
- Version locking: P&L V1 → Quote V1, price changes require new version
- Approval flow: AM submits → MD/CM approves

---

## Important Business Rules

1. **Customer uniqueness**: Enforced via Registration Code
2. **Lead assignment**: 72-hour unprocessed triggers "recycle countdown"
3. **P&L first**: Quoting requires approved P&L analysis
4. **Milestone-driven settlement**: PM confirms 100% completion before billing
5. **Multi-currency**: Local cost/quoting, reporting unified to MYR

---

## Form Control Types (from User Manual)

| Control Type | CRM Prefix | Description |
|-------------|-----------|-------------|
| Single-line text | lui-input | Basic input |
| Multi-line text | lui-textarea | Remarks, addresses |
| Dropdown select | lui-select | Status, type |
| Cascader | lui-cascader | Source, level (click to trigger panel) |
| Radio | lui-radio | Gender, type toggle |
| Date picker | lui-date-picker | Date fields |
| Table select modal | lui-select-table-modal | Deal Category, etc. |
| Relation modal | lui-relation-modal | Principal in Charge, etc. |
| Detail table | lui-table | Address List (dynamic rows) |

---

## Source File Path

`/Users/xiex/Documents/海外事业部/CRM/Securemetric CRM/CRM客户关系管理-用户手册V1_20250318.docx`
