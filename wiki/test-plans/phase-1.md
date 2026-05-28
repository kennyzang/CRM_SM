---
title: Test Plan - Phase 1: Base Entity CRUD
created: 2026-04-22
updated: 2026-04-22
type: test-plan
tags: [test/create, test/edit, test/list]
sources: [doc/plan/phase-1.md]
related: [[test-plan-phase-2]], [[lead]], [[contact]], [[customer]], [[product]], [[opportunity]]
---

# Test Plan — Phase 1: Base Entity CRUD

**Duration**: 1-2 weeks
**Goal**: Complete create, edit, and list tests for all base entities
**Overall Progress**: ~25% (create done, edit/list/process 0%)

---

## Module Progress Overview

| Module | Create | Edit | List | Overall |
|--------|--------|------|------|---------|
| Lead | 100% | 0% | 0% | ~33% |
| Contact | 100% | 0% | 0% | ~33% |
| Customer | 100% | 0% | 0% | ~33% |
| Product | 100% | 0% | 0% | ~33% |
| Opportunity | 100% | 0% | 0% | ~33% |

> Note: "Create" means TC-001/002/003 passed, but boundary cases are not yet covered.

---

## Lead — Remaining Tasks

| Task | Priority | Status | Est. Hours |
|------|----------|--------|------------|
| Edit test cases | P0 | Not started | 2h |
| List page Page Object | P1 | Not started | 2h |
| List search test | P1 | Not started | 1h |
| List filter test | P1 | Not started | 1h |
| List pagination test | P2 | Not started | 1h |

**New files**:
- `pages/LeadEditPage.ts`
- `pages/LeadListPage.ts`
- `tests/lead-edit.spec.ts`
- `tests/lead-list.spec.ts`

---

## Contact — Remaining Tasks

| Task | Priority | Status | Est. Hours |
|------|----------|--------|------------|
| Edit test cases | P0 | Not started | 2h |
| List page Page Object | P1 | Not started | 2h |
| List search test | P1 | Not started | 1h |

**New files**:
- `pages/ContactEditPage.ts`
- `pages/ContactListPage.ts`
- `tests/contact-edit.spec.ts`
- `tests/contact-list.spec.ts`

---

## Customer — Remaining Tasks

| Task | Priority | Status | Est. Hours |
|------|----------|--------|------------|
| Edit test cases | P0 | Not started | 2h |
| List page Page Object | P1 | Not started | 2h |
| List search test | P1 | Not started | 1h |

**New files**:
- `pages/CustomerEditPage.ts`
- `pages/CustomerListPage.ts`
- `tests/customer-edit.spec.ts`
- `tests/customer-list.spec.ts`

---

## Product — Remaining Tasks

| Task | Priority | Status | Est. Hours |
|------|----------|--------|------------|
| Edit test cases | P0 | Not started | 2h |
| List page Page Object | P1 | Not started | 2h |
| List search test | P1 | Not started | 1h |

**New files**:
- `pages/ProductEditPage.ts`
- `pages/ProductListPage.ts`
- `tests/product-edit.spec.ts`
- `tests/product-list.spec.ts`

---

## Opportunity — Remaining Tasks

| Task | Priority | Status | Est. Hours |
|------|----------|--------|------------|
| Edit test cases | P0 | Not started | 2h |
| List page Page Object | P1 | Not started | 2h |
| List search test | P1 | Not started | 1h |

**New files**:
- `pages/OpportunityEditPage.ts`
- `pages/OpportunityListPage.ts`
- `tests/opportunity-edit.spec.ts`
- `tests/opportunity-list.spec.ts`

---

## Acceptance Criteria

- [ ] All entity edit tests pass
- [ ] All entity list search tests pass
- [ ] Test coverage > 80% (by feature point)
- [ ] No P0 bugs

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Page structure changes break selectors | Use explore tests (`explore-*.spec.ts`) to verify selectors |
| Test data conflicts | Use unique identifier generators (`data/faker-generator.ts`) |
| Slow server response causes timeout | Increased timeouts (current default: 5 min) and retries |

## Next Step

[[test-plan-phase-2]] — Core workflow transitions (Lead → Opportunity → Quote / Ocean / Permission sharding)
