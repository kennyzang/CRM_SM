---
title: Test Plan - Phase 2: Core Workflow Transitions
created: 2026-04-22
updated: 2026-05-29
type: test-plan
tags: [test/process]
sources: [doc/plan/phase-2.md]
related: [[test-plan-phase-1]], [[lead]], [[opportunity]], [[quote]], [[pl]]
---

# Test Plan — Phase 2: Core Workflow Transitions

**Duration**: 2-3 weeks
**Goal**: Cover cross-module business workflows including lead conversion, opportunity P&L, and quote generation
**Status**: Planned (starts after Phase 1 completion)

---

## Core Workflow Coverage

### 1. Lead Conversion Flow

| Test Case | Description | Dependency |
|-----------|-------------|------------|
| TC-P001 | Lead → Opportunity (link to existing customer) | Customer exists |
| TC-P002 | Lead → Customer (standalone creation) | Lead exists |
| TC-P003 | Lead → Contact | Customer exists |

### 2. P&L and Quote Flow (Blueprint Core)

| Test Case | Description | Dependency | Priority | Source |
|-----------|-------------|------------|----------|--------|
| TC-P004 | Create Opportunity + fill P&L | Customer, Product exist | P0 | Blueprint |
| TC-P005 | P&L gross margin calculation verification | TC-P004 | P0 | Blueprint |
| TC-P006 | P&L submit for approval | TC-P005 | P0 | Blueprint |
| TC-P007 | Quote generation (V1) | TC-P006 | P0 | Blueprint |
| TC-P008 | Quote price change → P&L new version (V2) | TC-P007 | P1 | Blueprint |

### 2b. P&L Bug Regression Tests (audio-confirmed 2026-05-29)

| Test Case | Description | Bug # | Priority |
|-----------|-------------|-------|----------|
| TC-P015 | P&L create — verify ALL Opportunity products auto-fill (Software + Hardware + Service) | #2, #3 | P0 |
| TC-P016 | P&L product selection — verify Software products selectable by any Principal | #1 | P0 |
| TC-P017 | P&L product carryover — verify no product type is missing when creating from Opportunity | #3 | P0 |
| TC-P018 | P&L Reimbursement — verify only Cost field exists (no Selling Price) | #4 | P1 |
| TC-P019 | P&L 3rd-party product filter — verify scoped to Entity + Opportunity | #5 | P0 |
| TC-P020 | P&L Services — verify Markup field exists and is editable | #6 | P0 |
| TC-P021 | P&L Reimbursement total cost — verify calculation correct when Qty=1 | #7 | P1 |

### 2c. P&L Business Logic Tests (audio-confirmed 2026-05-29)

| Test Case | Description | Source | Priority |
|-----------|-------------|--------|----------|
| TC-P022 | P&L Global Discount Toggle ON — verify applies to ALL line items | Audio | P1 |
| TC-P023 | P&L Global Discount Toggle OFF — verify per-line discount fields appear | Audio | P1 |
| TC-P024 | P&L version control — verify only latest version is Active | Audio | P0 |
| TC-P025 | P&L approval routing — Margin < Target → route to Sales Team Supervisor | Audio/Blueprint | P0 |
| TC-P026 | P&L approval routing — all margins ≥ Target → auto-approve | Audio/Blueprint | P0 |
| TC-P027 | P&L currency switch — verify all figures recalculate (USD ↔ MYR) | Audio | P1 |
| TC-P028 | P&L "Copy New" — verify all data copies from current version | Audio | P1 |
| TC-P029 | P&L "New Quotation" — verify creates quotation from approved P&L | Audio | P0 |

### 3. Public Pool (Open Pool) and Assignment Flow

| Test Case | Description | Dependency |
|-----------|-------------|------------|
| TC-P009 | Customer 60-day inactivity → Public Pool | Requires time simulation or API |
| TC-P010 | Claim customer from Public Pool | TC-P009 |
| TC-P011 | Lead 72-hour unprocessed → recycle countdown | Requires time simulation or API |

### 4. Permission and Data Sharding

| Test Case | Description | Dependency |
|-----------|-------------|------------|
| TC-P012 | Entity A AM cannot access Entity B data | Multi-Entity config |
| TC-P013 | Public Pool data visible to all regional AMs | TC-P009 |

---

## Technical Challenges

### P&L Form Fields
- P&L form field data-tids unknown — need `explore-opportunity.spec.ts` to discover
- Cost, markup, discount fields are linked to (linked) calculate gross margin
- **Audio-confirmed (2026-05-29)**: 7 bugs identified that require regression tests before any P&L test can pass
- **Multi-currency**: Currency switching recalculates all figures — tests must verify calculation accuracy
- **Approval workflow not configured yet**: Tests should mock/verify expected behavior even if workflow not live

### Time-Related Tests
- Public Pool 60-day, Lead 72-hour rules require time simulation
- Approach: Use Playwright `clock.install()` or backend API time manipulation

### Approval Workflow
- Requires MD/CM test accounts
- Two scenarios: approved vs rejected

---

## Next Step

Phase 3: Financial close loop (Order, Milestone, Invoice, Payment)
