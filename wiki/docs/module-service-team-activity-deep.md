---
title: CRM Module Deep Documentation — Service Team & Activity
created: 2026-06-05
updated: 2026-06-05
type: documentation
tags: [service-team, activity, lead-conversion, permission]
sources: [oss/Service Team& Activity.mp4, video-analysis-2026-06-05]
related: [[lead]], [[customer]], [[contact]], [[opportunity]]
---

# Module Deep Documentation: Service Team & Activity

> **Audience**: New team members who need to understand CRM permission and activity concepts
> **Source**: Video recording (8.5 min) + Audio transcription (4,423 chars) + 6 key frame analysis
> **Date**: 2026-06-05

---

## 1. Overview

This module covers two **core CRM concepts** that apply across multiple entities:

1. **Service Team** — Who can see and edit a record
2. **Activity Log** — Tracking sales interactions (calls, visits, meetings)

These concepts exist on:
- Lead
- Contact
- Customer
- Opportunity

---

## 2. Service Team

### 2.1 What is a Service Team?

> **Definition (from audio)**: "The service team just means the people who have the permission to see and edit the information in this detail page."

**Key principle**: Every record (Lead, Contact, Customer, Opportunity) has its own Service Team. Being in the team = having access.

### 2.2 Service Team Structure

Each Service Team member has:

| Attribute | Options | Default | Notes |
|-----------|---------|---------|-------|
| **Member** | Any organization user | — | Selected via user picker |
| **Permission** | Read-Only / Read-Write | Read-Write | Controls edit access |
| **Team Role** | Ordinary Members | Ordinary Members | Internal team structure |
| **Project Role** | Customer Manager | (Unchecked) | Functional role on the account |

### 2.3 How to Add Team Members

1. Go to any detail page (Lead, Contact, Customer, Opportunity)
2. Find the Service Team section on the right sidebar
3. Click "+ Add" or "+ Add more"
4. In the "Add Team Members" modal:
   - **Members** (*): Select user(s) from organization
   - **Permission** (*): Choose Read-Only or Read-Write
   - **Team Role**: Check "Ordinary Members" (default)
   - **Project Role**: Check "Customer Manager" if applicable
5. Click "Confirm"

### 2.4 Service Team Across Entities

| Entity | Service Team Location | Notes |
|--------|----------------------|-------|
| Lead | Right sidebar of Lead Details | Owner is automatically included |
| Contact | Right sidebar of Contact Details | Same concept as Lead |
| Customer | Right sidebar of Customer Details | Same concept |
| Opportunity | Right sidebar of Opportunity Details | Same concept |

**Important**: Service Teams are **entity-specific**. Being in a Customer's Service Team does NOT automatically give access to that Customer's Opportunities.

### 2.5 Permission Model Explained

```
User → In Service Team? → Yes → What Permission? → Read-Only (view only)
                                              → Read-Write (can edit)
         → No → No access (should not see or edit)
```

**Owner vs. Service Team**:
- The **Owner** is the primary person responsible for the record
- The Owner is typically in the Service Team, but this is NOT always enforced (see Bug #1 below)
- Other team members are added by the Owner or admins

---

## 3. Activity Log

### 3.1 What is Activity Log?

> **Definition (from audio)**: "If we have a call with our customer or we pay a visit to our customers, we can log it here."

Activity Log tracks all sales interactions with a record. It appears in different entities:

| Entity | Tab Name | Notes |
|--------|----------|-------|
| Lead | Activity Log | Right sidebar |
| Contact | Sales Record | Same concept, different name |
| Customer | Activity Log | Right sidebar |
| Opportunity | Activity Log | Right sidebar |

### 3.2 How to Log an Activity

1. Go to any detail page
2. Find the Activity Log section (right sidebar)
3. Click "New Log" or "Log Activity"
4. Fill in the activity form:

| Field | Type | Notes |
|-------|------|-------|
| Activity Type | Dropdown | e.g., "Calling Contact", "Visit", "Meeting" |
| Contact | Lookup | Select the contact person involved |
| Our Attendee | User Lookup | Auto-filled with current user |
| Related Business | Read-Only | Auto-filled with parent record name |
| Discussion Details | Text Area | Notes about the interaction; 0/1000 char counter |
| Attachment | File Upload | Optional supporting documents |

5. Click "Submit"

### 3.3 Activity Log Display

Each log entry shows:
- **Date**: e.g., "04 2026-06"
- **User**: Avatar + name (e.g., "Shimi")
- **Activity Type**: Blue badge (e.g., "Calling Contact")
- **Timestamp**: e.g., "2026-06-04 23:32"
- **Content**: The note entered (e.g., "GOod")
- **Metadata**: "Contact: Aisyah Patel", "Our Attendee: Shimi"

---

## 4. Lead Conversion — Service Team & Activity Carry-Over

### 4.1 The Conversion Process

When converting a Lead to an Opportunity, the system guides through a **2-step wizard**:

**Step 1: Customer**
- Verify existing customer or create new one
- Contacts from Lead are automatically associated with Customer

**Step 2: Opportunity**
- Most fields are auto-filled from Lead data
- Key decision: **Carry Over Information**

### 4.2 Carry Over Information

This section controls what data transfers from Lead to the new records:

#### Copy Team To

| Checkbox | What It Does | Default |
|----------|-------------|---------|
| ☑ Customer | Copy Lead's Service Team to new Customer's Service Team | Checked |
| ☑ Contact | Copy Lead's Service Team to new Contact's Service Team | Checked |
| ☑ Opportunity | Copy Lead's Service Team to new Opportunity's Service Team | Checked |

#### Copy Activities To

| Checkbox | What It Does | Default |
|----------|-------------|---------|
| ☑ Customer | Copy Lead's Activity Logs to Customer's Activity Log | Checked |
| ☑ Contact | Copy Lead's Activity Logs to Contact's Sales Record | Checked |
| ☑ Opportunity | Copy Lead's Activity Logs to Opportunity's Activity Log | Checked |

> **Tooltip**: "Need to check the box to 'add' the service team in the lead to customers, contacts, or opportunities"

### 4.3 How It Works

```
Lead (Service Team: Shimi, Yeo)
  ↓ Convert
Customer (Service Team: Shimi, Yeo) ← copied
Contact (Service Team: Shimi, Yeo) ← copied
Opportunity (Service Team: Shimi, Yeo) ← copied

Lead (Activity Log: "Calling Contact/Good")
  ↓ Convert
Customer (Activity Log: "Calling Contact/Good") ← copied
Contact (Sales Record: "Calling Contact/Good") ← copied
Opportunity (Activity Log: "Calling Contact/Good") ← copied
```

---

## 5. Known Issues & Bugs

| # | Issue | Description | Severity | Audio Reference |
|---|-------|-------------|----------|-----------------|
| 1 | **Activity Log not carried over during conversion** | After Lead → Opportunity conversion, Activity Log from Lead does NOT appear in Opportunity's Activity Log, even with "Copy Activities to" checked | **High** | "Previously we don't have activity log in the lead, so there are still no activity logs here... wait, we actually have the activity log here. So this one should be carried over there. This is a bug." |
| 2 | Opportunity Owner not in Service Team | Owner of an Opportunity may not appear in that Opportunity's Service Team | Medium | "Nixon is the owner of this opportunity but he doesn't show in the service team." |
| 3 | Tab naming inconsistency | Contact entity calls it "Sales Record" while others call it "Activity Log" | Low | "In contact, we also have the activity log. Yeah it's called a sales record here, but it's actually an activity." |

---

## 6. Testing Requirements

### 6.1 Service Team Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Add team member | Go to Lead Details → + Add → Select user → Set Read-Write → Confirm | User appears in Service Team, can edit record |
| Read-Only permission | Add user with Read-Only → Try to edit fields | Edit should be blocked |
| Remove team member | Click Delete on team member → Confirm | User loses access to record |
| Cross-entity access | User in Customer Service Team but NOT in Opportunity Service Team | User should NOT access Opportunity |

### 6.2 Activity Log Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Create activity log | Click New Log → Fill form → Submit | Log appears in Activity Log timeline |
| Activity log on Lead | Create log on Lead → Check Activity Log tab | Log visible with correct metadata |
| Activity log on Contact | Create log on Contact → Check Sales Record tab | Log visible (note: tab name differs) |

### 6.3 Lead Conversion Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Team carry-over (Customer) | Convert Lead → Check Customer Service Team | Team members copied |
| Team carry-over (Opportunity) | Convert Lead → Check Opportunity Service Team | Team members copied |
| **Activity carry-over** | Create Activity on Lead → Convert → Check Opportunity Activity Log | ⚠️ **Currently fails** — Activity NOT copied |
| Activity carry-over (Customer) | Create Activity on Lead → Convert → Check Customer Activity Log | Should be copied |

---

## 7. Quick Reference — Key Concepts

| Concept | Definition | Applies To |
|---------|-----------|------------|
| **Service Team** | People with permission to see/edit a record | Lead, Contact, Customer, Opportunity |
| **Read-Only** | Can view but not edit | Permission level |
| **Read-Write** | Can view and edit | Permission level |
| **Ordinary Member** | Standard team member role | Team Role |
| **Customer Manager** | Functional role on the account | Project Role |
| **Activity Log** | Sales interaction tracking | Lead, Customer, Opportunity |
| **Sales Record** | Same as Activity Log (Contact entity) | Contact |
| **Carry Over** | Data transfer during Lead conversion | Team + Activities |
