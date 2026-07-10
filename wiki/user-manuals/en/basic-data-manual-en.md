---
title: Basic Data Settings User Manual (English)
created: 2026-06-17
updated: 2026-06-17
type: user-manual
tags: [basic-data, admin, user-manual, en]
---

# Basic Data Settings User Manual

> **Version**: V1.0 | **Date**: 2026-06-17 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Company Entity](#2-company-entity)
3. [Tax Rate](#3-tax-rate)
4. [FAQ](#4-faq)

---

## 1. Overview

Basic Data Settings provides the foundational configuration for all CRM business modules, covering Company Entities (legal entities) and Tax Rates. Administrators complete this setup before go-live; regular users do not need to maintain these records.

### 1.1 Entry Points

| Tab | Direct Link |
|-----|-------------|
| Company Entity | [Direct Link](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i40lteddw6uw3qmmw3k6o0jq22ifob512w1/1i354i0tiw6owil5w34oan7a2uf49bi11sw1?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1){: target="_blank" rel="noopener"} |
| Tax Rate | [Direct Link](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1jiuh02mew5fw2hr1uw9vfbi71bd1arg9jw4/1i4394522w73wujewge1aje35mtu8t1eobw1?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1){: target="_blank" rel="noopener"} |

---

## 2. Company Entity

Company Entities represent SM's legal entities. They determine the quotation number prefix, default currency, and the member scope used across all business records.

![Company Entity List](../../assets/basic-data-001-entity-list.png)

### 2.1 Entities and Members

![Company Entity Detail](../../assets/basic-data-002-entity-detail.png)

Each entity is configured with a **Department/Organisation** (you can select an organisation, a department, or specific individuals). The system automatically populates the **Member** list with everyone in the selected department. Members are the effective user pool for leads, opportunities, quotations, and other modules.

> **Note**: When creating a lead or other business record, the system defaults to the current user's entity; if the user belongs to multiple entities, the first one is selected by default. The currency is tied to the entity and is auto-filled based on the selected entity.

### 2.2 Member Sync

![Member Sync Button](../../assets/basic-data-003-member-sync.png)

When staff join or change departments, the Member list **does not update automatically**. Go to the entity's detail page and click the **Sync Members** button to manually trigger the update.

---

## 3. Tax Rate

![Tax Rate Settings](../../assets/basic-data-004-tax-rate.png)

Tax rates are used in the quotation and invoicing stages. Administrators pre-configure the available rates (name + percentage); users select from these options when creating a quotation.

![Tax Rate Selection Dialog](../../assets/basic-data-005-tax-rate-usage.png)

When creating a quotation, clicking the **Global Tax** field opens a selection dialog listing all rates configured here.

---

## 4. FAQ

**Q: A new employee cannot be selected as the owner in leads or opportunities. How do I fix this?**  
A: Go to the Company Entity detail page for the employee's legal entity and click **Sync Members** to add the new staff to the Member list.

**Q: The default currency on a new quotation is incorrect. How do I change it?**  
A: Check the Currency field on the relevant Company Entity detail page and update it. New quotations created after the save will use the updated currency.
