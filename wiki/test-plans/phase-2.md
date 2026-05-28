---
title: Test Plan - Phase 2: Core Workflow Transitions
created: 2026-04-22
updated: 2026-04-22
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

| Test Case | Description | Dependency |
|-----------|-------------|------------|
| TC-P004 | Create Opportunity + fill P&L | Customer, Product exist |
| TC-P005 | P&L gross margin calculation verification | TC-P004 |
| TC-P006 | P&L submit for approval | TC-P005 |
| TC-P007 | Quote generation (V1) | TC-P006 |
| TC-P008 | Quote price change → P&L new version (V2) | TC-P007 |

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

### Time-Related Tests
- Public Pool 60-day, Lead 72-hour rules require time simulation
- Approach: Use Playwright `clock.install()` or backend API time manipulation

### Approval Workflow
- Requires MD/CM test accounts
- Two scenarios: approved vs rejected

---

## Next Step

Phase 3: Financial close loop (Order, Milestone, Invoice, Payment)
