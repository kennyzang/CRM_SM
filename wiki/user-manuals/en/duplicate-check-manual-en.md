---
title: Duplicate Check User Manual (English)
created: 2026-06-04
updated: 2026-06-13
type: user-manual
tags: [duplicate-check, user-manual, en]
---

# Duplicate Check User Manual

> **Version**: V1.1 | **Date**: 2026-06-13 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Search Interface](#2-search-interface)
3. [Search Results](#3-search-results)
4. [Results Navigation](#4-results-navigation)
5. [Common Operations](#5-common-operations)
6. [Change Owner](#6-change-owner)
7. [Work Handover](#7-work-handover)
8. [Business Rules](#8-business-rules)
9. [FAQ & Notes](#9-faq--notes)

---

## 1. Module Overview

The **Duplicate Check** module allows you to search for existing customers or contacts before creating new records, preventing duplicate entries and keeping CRM data clean. The module also serves as the entry point for common record management operations such as import, export, Change Owner, and Work Handover.

### 1.1 Entry Point

- **Sidebar**: Left sidebar → **CRM → DUPLICATE CHECK** | [Direct Link](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1/undefined?navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1){: target="_blank" rel="noopener"}

### 1.2 Core Functions

| Function | Description |
|----------|-------------|
| Cross-entity search | Single search queries both Contacts and Customers simultaneously |
| Fuzzy matching | Partial text matching with highlighted results |
| Split tab results | Results organised by entity type with count badges |
| Quick navigation | Click a result to view or edit the full record |
| Data import | Bulk-import customer or contact records via an Excel template |
| Data export | Export record lists to an Excel file |
| Change Owner | Transfer ownership of one or multiple records to another user |
| Work Handover | Bulk-transfer all records owned by a departing user to their successors |

---

## 2. Search Interface

![Duplicate Check search interface — search bar and categorised result display](../../assets/duplicate-check-001.png)

### 2.1 Search Bar

The search bar is the primary input for finding potential duplicates:

- **Single input field** — type your search term here
- **Search targets**: Name, Mobile, Email, Registration Code (Legal ID)
- **Clear button** (x) — clears the current search text
- **Search button** (magnifying glass) — initiates the search

### 2.2 How to Search

1. Type a keyword into the search bar (e.g., "Enterprise", a phone number, or an email address)
2. Click the **Search** button or press **Enter**
3. Results will appear below, showing matches from both Contacts and Customers

---

## 3. Search Results

### 3.1 Results Summary Bar

After searching, a summary bar displays the total matches:

- **X Records Found** — total number of matches across all entities
- **Y Contacts** — number of contact matches
- **Z Customers** — number of customer matches

### 3.2 Results Tabs

Results are split into two tabs:

- **Customers (Z)** — matching customer records (default tab)
- **Contacts (Y)** — matching contact records

### 3.3 Results Table

| Column | Description |
|--------|-------------|
| **No.** | Row number |
| **Name** | Customer or contact name — matching text is **highlighted in yellow** |
| **Owner** | Record owner (e.g., Soo, CK, Alan) |
| **Entity** | Legal entity code (e.g., SMMY, SCMY, SMPH, PTSK) |
| **Legal ID** | Registration code or unique identifier |

### 3.4 Fuzzy Match Highlighting

When you search for a keyword (e.g., "enter"), the system performs a fuzzy match and **highlights the matching text in yellow** within the result names:

- "Unified Data **Enter**prises (M) Sdn Bhd"
- "Elite **Enter**prise Solutions Sendirian Berhad"
- "Elite Technology **Enter**prises (M) Sdn Bhd"

