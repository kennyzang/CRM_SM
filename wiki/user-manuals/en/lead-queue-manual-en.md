---
title: Lead Queue Management User Manual (English)
created: 2026-06-17
updated: 2026-06-17
type: user-manual
tags: [lead-queue, admin, user-manual, en]
---

# Lead Queue Management User Manual

> **Version**: V1.0 | **Date**: 2026-06-17 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Queue List](#2-queue-list)
3. [Basic Configuration](#3-basic-configuration)
4. [Business Rules](#4-business-rules)
5. [FAQ](#5-faq)

---

## 1. Overview

Lead Queues control how leads are assigned, who owns them, and when they are automatically reclaimed. Each legal entity has one lead queue, maintained by the administrator.

### 1.1 Entry Point

| Entry | Path |
|-------|------|
| Main | Left nav **LEAD → Leads**, switch to the **Lead Queue Mgt** tab | [Direct Link](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i1ool4u8w66w19kew3oqgu0c33v66po3dw1/1hth1o76iw5ow19cndw6fc5u8bgkqva28twe?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1){: target="_blank" rel="noopener"} |

---

## 2. Queue List

![Lead Queue List](../../assets/lead-queue-001-list.png)

The system creates one lead queue per legal entity (7 total), matching the Company entities in Basic Data Settings. Click the edit icon on the right to configure a queue.

---

## 3. Basic Configuration

![Lead Queue Basic Settings](../../assets/lead-queue-002-basic.png)

Set the **Admin** and **Depart** (department) for each queue. The system automatically populates the **Member** list from the selected department — Members are the people who can receive and handle leads in this queue.

> **When department members change**: The Member list does not update automatically. Go to **Basic Data Settings → Company**, open the relevant entity's detail page, and click **Member Change** to sync. The lead queue Member list will reflect the update immediately after.

### 3.1 Claim & Assign Rules

This is the most important setting, controlling whether sales reps can claim leads themselves:

| Option | Behaviour |
|--------|-----------|
| **Hidden from Members, Assignable by Admins** | Members cannot see unassigned leads; only admins can assign them |
| **Visible & Claimable by Members, Assignable by Admins** | Members can self-claim leads; admins can also assign directly |

> The current default is "Hidden from Members" — all leads are distributed by admins.

---

## 4. Business Rules

![Lead Queue Rules Settings](../../assets/lead-queue-003-rules.png)

### 4.1 Ownership Rules

Controls whether the lead creator automatically keeps ownership. By default, a new lead has no owner (unassigned). The creator retains ownership when either condition is checked:

- **If the lead creator is a member of the lead queue** — creator belongs to this queue's member list
- **If the lead creator is an admin of the lead queue** — creator is the queue's admin

### 4.2 Timeout Reminders

| Rule | Current Value | Description |
|------|---------------|-------------|
| Processing Timeout Reminder | 72 Hours | Triggers a reminder if an assigned lead is not processed within this window |
| Follow-up Timeout Reminder | 7 Days | Triggers a reminder if no follow-up action is recorded within this period |

**New Lead Notification**: When enabled, the queue admin receives a to-read notification whenever a new lead enters the queue, so they can assign it promptly.

### 4.3 Reclaim Rules

A lead is automatically reclaimed (owner cleared, returned to unassigned) when either condition is met:

- The assigned lead was not processed within the stipulated time frame
- The next follow-up was not conducted within the required time limit

### 4.4 Transfer & Return Rules

- Members may transfer a claimed lead to other lead queues
- Non-members may transfer leads into this queue

---

## 5. FAQ

**Q: A lead was created but the owner is empty, even though the creator should have kept it. What's wrong?**  
A: Check the Ownership Rules in the relevant entity's lead queue — confirm "If the lead creator is a member" is checked, and that the creator's account is included in the queue's Member list via Member Depart.

**Q: An admin set up the lead queue but sales reps say they can't see any leads to claim. Is that normal?**  
A: Yes, if Claim & Assign Rules is set to "Hidden from Members", reps cannot see unassigned leads — the admin must push leads to them. Change the rule to "Visible & Claimable by Members" if self-claim should be allowed.
