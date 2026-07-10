---
title: Contact Entity
created: 2026-04-22
updated: 2026-04-24
type: entity
tags: [contact, test/create]
sources: [raw/articles/crm-user-manual-v1.md, raw/articles/business-blueprint-v1.md, oss/Contact & Lead Creation.mp4, doc/Securemetric CRM_new features.docx]
related: [[customer]], [[lead]], [[duplicate-check]]
language: en
---

# Contact Entity

## Overview

**Module**: Contact
**Entry URL**: `/web/#/current/sys-modeling/app/km-ltc/listView/1hvp2cluhw58w6l8fw3611h2s3vd75k91dw1/1i20pgcrdw6awilsw3ip2cvq36n244duq8w1`
**Create URL**: `/web/#/current/sys-modeling/app/km-ltc/add/1huk4vljow4bw7civw3cdgsju212d8jr1sw1`

Contacts are individuals associated with a Customer. A contact must be linked to an existing customer record.

## Business Rules

1. **Customer linkage**: Every contact must be associated with a Customer record.
2. **Relationship graph**: The CRM supports a contact relationship diagram showing connections between contacts.
3. **Gender field**: Radio buttons with CRM typo "raido" in data-tids.
4. **Email OR Phone requirement**: Blueprint spec states at least one of Email or Phone is required for submission.
5. **Relationship scoring**: Relationship dropdown has implicit scoring values (Coach=5, Champion=4, Supporter=3, Neutral=2, Blocker=1).
6. **Owner auto-assignment**: Owner field auto-populated with current logged-in user.
7. **Duplicate validation**: System auto-validates against database for uniqueness on save.

## Field Registry

Source: Playwright MCP DOM inspection (2026-04-22).
Video-confirmed fields marked with [V] (from "Contact & Lead Creation" video, 2026-04-24).

### Section: Basic Information

| Field | Label | data-tid | Type | Required | Notes |
|-------|-------|----------|------|----------|-------|
| customer | Customer | - | association/lookup | No | [V] Tag-style with 'x' to clear. Links to existing Customer record |
| contactName | Contact Name | `comp-fd_name--input` | text | Yes | Red asterisk |
| mobile | Mobile | `comp-fd_mobile--input` | text | No | Malaysian format: 01x-xxxxxxx. Autocomplete with previous entries |
| department | Department | `comp-fd_department--input` | text | No | Placeholder: "Please enter" |
| reportsTo | Reports To | - | association/lookup | No | [V] Links to another contact |
| relationship | Relationship | - | dropdown | No | [V] Values: Coach\|5, Champion\|4, Supporter\|3, Neutral\|2, Blocker\|1 |
| referredBy | Referred By | - | text | No | [V] Placeholder: "Please enter" |
| address | Address | `comp-fd_address--input` | text | No | |
| businessCard | Business Card | - | file-upload | No | [V] jpg/gif/png only, single file, drag-and-drop |
| owner | Owner | - | read-only | No | [V] Auto-populated (e.g., "seradmin") |
| contactType | Type | - | dropdown | Yes | [V] Red asterisk. Values include "Customer Contact" |
| gender | Gender | undefined | radio | Yes | Options: Male, Female |
| email | Email | `comp-fd_email--input` | text | No | |
| jobTitle | Job Title | `comp-fd_position--input` | text | No | Field name is "position" in CRM |
| decisionMaker | Decision Maker | - | radio | No | [V] Options: Yes, No |
| roleInDecision | Role in Decision | - | dropdown | No | [V] Placeholder: "Please select" |
| birthday | Birthday | - | date-picker | No | [V] Calendar icon, placeholder: "Please select the date" |
| officePhone | Office Phone | - | text | No | [V] Placeholder: "Please enter" |
| notes | Notes | `comp-fd_remark--teaxtarea` | textarea | No | CRM typo: "teaxtarea" |
| ownersDepartment | Owner's Department | - | read-only | No | [V] Shows "-" when not set |

## Duplicate Check [D]

Contacts are included in the **Duplicate Check** module (sidebar -> DUPLICATE CHECK). Search by name, mobile, email to find existing contacts before creating new records. Results split into Contacts tab and Customers tab. See [[duplicate-check]] for details.

## Known Issues

1. **Address tid difference**: Contact uses `comp-fd_address--input` while Lead also uses `comp-fd_address--input`. Customer uses a detail table instead.
2. **Gender has no tid**: The gender radio field has no `data-tid` attribute -- it is resolved by matching the fieldset label text.
3. **window.close() pitfall**: When creating a contact via a popup window, `window.close()` may interfere with Playwright.

## Language Note

Chinese labels in the Contact UI (e.g., "Contact Name" in Chinese characters) are **defects**. The system official language is English.
