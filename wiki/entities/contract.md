---
title: Contract Module
created: 2026-04-30
updated: 2026-04-30
type: entity
tags: [contract, tool/playwright]
sources: [oss/Contract & Payment Schedule.mp4]
related: [[so]], [[customer]]
---

# Contract Module

## Overview

Contract module manages legal agreements linked to Sales Orders. Lives under **SALES ORDER** sidebar section. Contracts are created from SO details view, with SO auto-linked. Contract files sync to Customer 360 page.

**Entry path:** Sidebar → SALES ORDER → Contract, or from Sales Order Details → Contract tab → Create.

## Field Registry

| Field Label | Widget Type | Required | data-tid | Notes |
|---|---|---|---|---|
| Contract Title | Text Input | * Yes | `—` [V] | Free text |
| Contract ID | Read-only | No | `—` [V] | Auto-generated on save, placeholder "Auto Generate" |
| Sales Order | Tag Select | * Yes | `—` [V] | Links to parent SO (e.g. `SC/SO26/000005`), removable tag |
| Customer | Text/Select | No | `—` [V] | Auto-populated from SO |
| Signed Date | Date Picker | * Yes | `—` [V] | Default: current date |
| Expiry Date | Date Picker | * Yes | `—` [V] | Calendar with `<< < > >>` navigation + "Today" shortcut |
| Remarks | Text Area | No | `—` [V] | Multi-line |
| Attachment | File Upload | * Yes (spec) | `—` [V] | Blueprint says mandatory; UI shows no asterisk — inconsistency |
| Notify Who | User Tag Selector | * Yes | `—` [V] | Multi-user with removable chips |
| Notify XX Days | Number Input | * Yes | `—` [V] | In sub-table, configurable per row (e.g. 5 days) |

## Contract Reminder Sub-table

| Column | Widget Type | Notes |
|---|---|---|
| Serial No. | Auto-number | Sequential (1, 2, ...) |
| Notify XX Days | Number Input | Days before expiry to notify |
| Unit | Text | Hardcoded "day" |
| Operation | Action Links | Insert / Copy / Delete per row |
| Table Actions | Buttons | + Add rows / Import / More / Revoke |

## Form Actions

- **Save** — Primary blue button (top right)
- **Return** — Back navigation (top left)
- **Upload the attachment** — File upload trigger
- **+ Add rows** — Reminder table row insertion

## Business Rules

- Contract creation flows from SO Details → Contract Create form → Save (auto-generates Contract ID)
- Files uploaded to SO's "Contract" tab auto-sync to Customer 360 page's Contract tab
- Attachment is mandatory per Blueprint spec but UI shows no required asterisk
- Contract references SO (one-way link from Contract → SO)

## Cross-Module Relationships

| Relationship | Notes |
|---|---|
| Contract ← Sales Order | Contract Create form has required "Sales Order" field |
| Contract → Customer | Contract form shows Customer field, auto-populated from SO |
| Contract → Customer 360 | Contract files sync to Customer 360 page |
| SO → Contract(N) | SO details has Contract tab with record count |

## Pitfalls

1. **Attachment mandatory inconsistency** — Blueprint spec says mandatory, but UI does not show required asterisk on Attachment field
2. **Contract tab empty state mismatch** — Tab label may show `Contract(1)` but clicking displays "No Data" (async sync or permission issue)
3. **Chinese UI text** — Sidebar company name "深圳市蓝凌软件股份有限公司" is a defect per policy

## Known Defects

- Typo: "Delievery" on SO details tabs (affects Contract tab sibling)
- Chinese text in sidebar company name
