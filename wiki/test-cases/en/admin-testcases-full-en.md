---
title: Securemetric CRM Administrator Test Cases (English)
created: 2026-07-06
updated: 2026-07-06
type: test-cases
tags: [full-testcases, admin, en]
---

# Securemetric CRM Administrator Test Cases

> **System**: Securemetric CRM (EasyCraft) | **Version**: V1.0 | **Generated**: 2026-07-06
> **Scope**: Basic Data Settings / Lead Queue Management / Public Pool Management / Permission Configuration (the "Admin Settings" group in the user manuals)

> **Coverage note**: As of this document's generation, `wiki/test-cases/` does not yet contain dedicated functional test-case files for the 4 administrator modules — Basic Data Settings, Lead Queue Management, Public Pool Management, and Permission Configuration (corresponding user manuals already exist under `wiki/user-manuals/`). This document currently includes the cross-module permission/queue/public-pool scenarios filtered from the FullSystem deep test cases (where Category = Permission / Permission Bug / Data Sharding, or the title mentions Queue / Public Pool / SLA). **It is recommended to author dedicated functional test cases for these 4 modules** (following the format used in the P&L / Quotation / Invoice Application test-case files).

---

## Table of Contents

Admin-Related Test Scenarios (filtered from FullSystem by permission/queue/public-pool theme, 5 cases)

---

## Admin-Related Test Scenarios (from FullSystem, 5 cases)

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

