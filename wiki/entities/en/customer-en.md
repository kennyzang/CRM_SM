---
title: Customer Entity
created: 2026-04-22
updated: 2026-04-22
type: entity
tags: [customer, test/create]
sources: [raw/articles/crm-user-manual-v1.md, raw/articles/business-blueprint-v1.md, doc/Securemetric CRM_new features.docx]
related: [[contact]], [[lead]], [[opportunity]], [[duplicate-check]]
language: en
---

# Customer Entity

## Overview

**Module**: Customer
**Entry URL**: `/web/#/current/sys-modeling/app/km-ltc/listView/1hvp2b0bjw4vw6he8wg8l6lj3eo66ob102w1/1i1oh7vniw66w11k1w225fbfk1c7gcpr6aw1`
**Create URL**: `/web/#/current/sys-modeling/app/km-ltc/add/1hvjheq3nw4vw4j48w3doaci42dfrsq13tw1`

Customers are the central entity in the CRM. They can be End Customers or Partners.

## Business Rules

1. **Registration Code uniqueness**: The Registration Code is the primary key for uniqueness enforcement.
2. **Public Pool**: Customers inactive for 60 days are automatically released to the Public Pool (open pool). All AMs in the region can claim them.
3. **Joint Follower**: Multiple sales reps can follow up on the same customer.
4. **Customer Type**: End Customer vs Partner.
5. **Multi-country sharding**: Customer data is partitioned by country (MY/VN/PH/ID).
6. **Entity isolation**: Each legal entity's data is mutually invisible.

## Field Registry

Source: Playwright MCP DOM inspection (2026-04-22).

| Field | Label | data-tid | Type | Required | Notes |
|-------|-------|----------|------|----------|-------|
| customerName | Customer Name | `comp-fd_name--input` | text | Yes | |
| legalRegCode | Legal Reg. Code | `comp-fd_uniform_social_credit--input` | text | Yes | Uniqueness enforced |
| customerType | Customer Type | `ef-fs-fd_account_type-desktop` | cascade | No | |
| customerSource | Customer Source | `ef-fs-fd_account_source-desktop` | cascade | No | |
| phone | Phone | `comp-fd_tel--input` | text | No | |
| email | Email | `comp-fd_email--input` | text | No | |
| scopeOfBusiness | Scope of Business | `comp-fd_scope--teaxtarea` | textarea | No | CRM typo: "teaxtarea" |
| addressDetailTable | Address (detail table) | `data-id="mk_Address_list"` | detail-table | No | Multi-row address entries |

## Address Detail Table

Unlike Lead and Contact which use single-line address inputs, Customer uses a detail table (`data-id="mk_Address_list"`) supporting multiple addresses with:
- Country
- State/Province
- City
- Postal Code
- Street Address
- Address Type

## Public Pool Rules

| Rule | Condition | Action |
|------|-----------|--------|
| Auto-release | 60 days without follow-up | Release to Public Pool |
| Claim | Any AM in region | Claim ownership |
| No hard cap | High-performing reps | Can hold unlimited leads/customers |

## Duplicate Check [D]

The CRM provides a dedicated **Duplicate Check** module (sidebar -> DUPLICATE CHECK) to find existing customers or contacts before creating new records.

![Duplicate Check Results](../assets/duplicate-check-001.png)

- **Search fields**: Name, Mobile, Email, Registration Code
- **Search behavior**: Fuzzy match - highlights matching text in yellow
- **Results**: Split into Contacts tab and Customers tab with record counts
- **Result columns**: No., Name, Owner, Entity, Legal ID
- **Pagination**: Standard pagination with page navigation and items per page

> ⚠️ **Chinese UI labels** in pagination are defects.

## Known Issues

1. **Address table vs single input**: Customer uses a detail table for addresses, while Lead/Contact use single-line inputs. Do not confuse the locators.
2. **Scope of Business typo**: Uses `comp-fd_scope--teaxtarea` (CRM typo).

## Language Note

Chinese labels in the Customer UI (e.g., "Customer Name" in Chinese characters) are **defects**.
