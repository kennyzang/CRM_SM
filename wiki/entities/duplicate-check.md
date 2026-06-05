---
title: Duplicate Check Entity
created: 2026-06-04
updated: 2026-06-04
type: entity
tags: [duplicate-check, customer, contact, test/list]
sources: [doc/Securemetric CRM_new features.docx, raw-frames/new-features-docx/image2.png]
related: [[customer]], [[contact]], [[widget-special-controls]]
---

# Duplicate Check Entity

## Overview

**Module**: Duplicate Check (重名检查)
**Entry**: Sidebar → CRM → DUPLICATE CHECK
**URL path**: TBD (needs schema generation)

A dedicated module for finding existing customers or contacts before creating new records. Searches across both entities simultaneously and displays results in split tabs.

## Search Interface

![Duplicate Check Results](../assets/duplicate-check-001.png)

### Search Bar
- **Single input field** — searches across all searchable fields
- **Search targets**: Name, Mobile, Email, Registration Code (Legal ID)
- **Match behavior**: Fuzzy match — matching text highlighted in yellow in results
- **Action**: Search button (magnifying glass) + clear button (x)

### Results Summary Bar
- **Total Records Found** — count of all matches
- **Contacts** — count of contact matches
- **Customers** — count of customer matches

### Results Tabs
- **Customers (N)** — customer records tab (default)
- **Contacts (N)** — contact records tab

### Results Table

| Column | Description |
|--------|-------------|
| **No.** | Row number |
| **Name** | Customer/Contact name (matching text highlighted in yellow) |
| **Owner** | Record owner (e.g., Soo, CK, Alan) |
| **Entity** | Legal entity code (e.g., PTSK, SMMY, SMPH) |
| **Legal ID** | Registration code / unique identifier |

### Pagination
- Page navigation: `< 1 >`
- Total items count: "Total of N items"
- Page jump: "前往 X" (Go to page X) — ⚠️ Chinese label is a defect
- Items per page: "每页 10 条" (10 items per page) — ⚠️ Chinese label is a defect

## Business Rules

1. **Cross-entity search**: Single search queries both Contacts and Customers
2. **Fuzzy matching**: Partial matches returned, not exact only
3. **Highlighting**: Matching text highlighted in yellow in result names
4. **Tab separation**: Results split by entity type with count badges
5. **Real entities only**: Returns only real database records, not drafts

## Known Issues

1. **No dedicated page object yet**: Duplicate Check module is not yet implemented in the test suite.
2. **Test coverage**: 0%.
3. **Chinese UI labels** in pagination ("前往", "每页 条") are defects — system language should be English.
