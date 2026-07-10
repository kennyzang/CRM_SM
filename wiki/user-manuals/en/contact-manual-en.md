---
title: Contact User Manual (English)
created: 2026-06-04
updated: 2026-06-16
type: user-manual
tags: [contact, user-manual, en]
---

# Contact User Manual

> **Version**: V1.2 | **Date**: 2026-06-16 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [List View](#2-list-view)
3. [Create a Contact](#3-create-a-contact)
4. [Details View](#4-details-view)
5. [Business Rules & Workflow](#5-business-rules--workflow)

---

## 1. Module Overview

A **Contact** is an individual associated with a Customer record — the actual person a sales rep communicates with during the sales process. For a corporate customer, the contact is the person you communicate with at that company. For an individual customer, the contact can be someone connected to the customer who serves as a communication channel.

Every contact must be linked to an existing Customer record. Contacts can be created directly or converted from a Lead.

### 1.1 Entry Points

| Entry Point | Path |
|-------------|------|
| Main entry | Left sidebar → **Contact Person** \| [Direct Link](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1hvp2cluhw58w6l8fw3611h2s3vd75k91dw1/1i20pgcrdw6awilsw3ip2cvq36n244duq8w1?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1){: target="_blank" rel="noopener"} |

### 1.2 Core Functions

| Function | Description |
|----------|-------------|
| Contact Creation | Create individual contacts linked to a customer |
| Contact Search | Search by name, mobile, email, or associated customer |
| Bulk Import | Import contacts in bulk via Excel template |

---

## 2. List View

The Contact list displays all records the logged-in user has access to.

![Contact List View](../../assets/contact-001.png)

### 2.1 View Scenarios

| Scenario Tab | Scope |
|--------------|-------|
| My Owned | Contacts where the current user is the owner |
| My Team's | Contacts owned by the current user's direct reports (for managers) |
| My Involved | Contacts where the current user is a team member |
| All | All contacts visible to the current user |

### 2.2 List Features

| Feature | Description |
|---------|-------------|
| Search | Search by contact name, mobile, or email |
| Bulk Actions | Checkbox selection + bulk delete / export |

### 2.3 Grid Columns

| Column | Description |
|--------|-------------|
| Contact Name | Click to open details |
| Customer | Associated customer name |
| Mobile | Primary mobile number |
| Email | Primary email address |
| Department | Contact's department |
| Job Title | Contact's position |
| Owner | Assigned sales representative |

---

## 3. Create a Contact

### 3.1 Entry

Click **+ Create** on the Contact list toolbar, or navigate to a Customer detail page → **Contacts** sub-tab → click **New**.

![Contact Create Form](../../assets/contact-002.png)

### 3.2 Field Reference

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| Customer | No | Association/Lookup | Tag-style with 'x' to clear; must be selected when creating from the Contact module |
| Contact Name | Yes | Text | Full name |
| Mobile | No | Text | Format: 01x-xxxxxxx; at least one of Mobile or Email is required |
| Email | No | Text | At least one of Email or Mobile is required |
| Department | No | Text | Contact's department within the customer organisation |
| Job Title | No | Text | Contact's role/position |
| Gender | Yes | Radio | Male / Female |
| Type | Yes | Dropdown | e.g., Customer Contact |
| Address | No | Text | Business or office address |
| Birthday | No | Date Picker | Calendar format |
| Reports To | No | Association/Lookup | Select the superior contact to build the relationship hierarchy |
| Referred By | No | Text | Source who introduced this contact |
| Decision Maker | No | Radio | Yes / No |
| Role in Decision | No | Dropdown | Contact's role in the purchasing decision |
| Office Phone | No | Text | Landline number |
| Business Card | No | File Upload | jpg/gif/png only; single file; drag-and-drop supported |
| Notes | No | Textarea | Additional context |
| Owner | No | Read-only | Auto-populated with the current logged-in user |

### 3.3 Duplicate Check

The system performs a duplicate check when saving a contact. Mobile and Email must each be unique in the system, and at least one must be provided. If the entered mobile or email is already used by another contact, the system will flag it as a duplicate and block the creation.

### 3.4 Saving

Fill in all required fields and click **Save** or **Save & New**.

> **Important**: At least one of Email or Mobile must be filled — the form cannot be submitted with both empty.

---

## 4. Details View

The Contact detail page shows the main record at the top with related record sub-tabs below.

![Contact Details](../../assets/contact-detail-001.png)

### 4.1 Basic Information

| Section | Content |
|---------|---------|
| Contact Info | Name, Mobile, Email, Department, Job Title, Office Phone |
| Associated Customer | Customer name (click to navigate) |
| Other Details | Address, Birthday, Business Card, Notes |
| System Fields | Owner, Create Time, Last Modified |

### 4.2 Sub-tabs

| Tab | Content |
|-----|---------|
| Basic Info | Form view of all contact fields; click Edit to modify |
| Leads | All leads linked to this contact |
| Opportunities | All opportunities associated with this contact |

![Contact Details - Leads Tab](../../assets/contact-detail-lead-001.png)

![Contact Details - Opportunities Tab](../../assets/contact-detail-opp-001.png)

### 4.3 Editing

Click **Edit** in the top action bar to enter edit mode. The system runs a duplicate check on save.

---

## 5. Business Rules & Workflow

### 5.1 Duplicate Check Rules

The system validates for duplicates when saving a contact:
- **Mobile** and **Email** are the uniqueness identifiers — neither can already exist on another contact record.
- If a match is found, the system displays a "duplicate data" warning and requires linking to the existing record instead of creating a new one.
