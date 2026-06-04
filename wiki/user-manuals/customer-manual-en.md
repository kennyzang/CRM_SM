---
title: Customer User Manual (English)
created: 2026-06-04
updated: 2026-06-04
type: user-manual
tags: [customer, user-manual, en]
---

# Customer User Manual

> **Version**: V1.0 | **Date**: 2026-06-04 | **System**: Securemetric CRM (EasyCraft)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [List View](#2-list-view)
3. [Create a Customer](#3-create-a-customer)
4. [Details View](#4-details-view)
5. [Business Rules & Workflow](#5-business-rules--workflow)
6. [FAQ & Notes](#6-faq--notes)

---

## 1. Module Overview

The **Customer** module is the central entity of Securemetric CRM. It stores all information about companies or organisations that Securemetric does business with, either as **End Customers** (direct buyers) or **Partners** (resellers, distributors, system integrators).

Every downstream transaction — Opportunities, Quotations, Sales Orders, Contracts, and Collections — is linked to a Customer record.

### 1.1 Entry Points

| Entry Point | Path |
|-------------|------|
| Main entry | Left sidebar → **Customer** |
| Create form | Left sidebar → Customer → **+ New** (or navigate to `/web/#/current/sys-modeling/app/km-ltc/add/1hvjheq3nw4vw4j48w3doaci42dfrsq13tw1`) |

### 1.2 Core Functions

- Maintain a master record of all business accounts (End Customer and Partner)
- Track customer ownership and joint followers (multiple sales reps)
- Store address information for multi-country operations (MY / VN / PH / ID)
- Serve as the root anchor for all sales pipeline activity

---

## 2. List View

The Customer list displays all accounts the logged-in user has access to. Key columns include:

| Column | Description |
|--------|-------------|
| Customer Name | Primary identifier, click to open details |
| Customer Type | End Customer or Partner |
| Customer Source | How the customer was acquired |
| Legal Reg. Code | Unique registration number |
| Phone | Primary contact phone |
| Owner | Assigned sales representative |
| Last Modified | Date of most recent update |

### Filtering & Search

- Use the search bar at the top to filter by Customer Name or Legal Reg. Code.
- Use filter chips to narrow by Customer Type, Customer Source, or Owner.
- The **My Customers** toggle limits the list to records owned by or followed by the current user.

---

## 3. Create a Customer

### 3.1 Opening the Form

Navigate to the Customer list and click **+ New**, or use the direct URL above.

### 3.2 Field Reference

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| Customer Name | Yes | Text input | Full legal or trading name |
| Legal Reg. Code | Yes | Text input | Must be unique across all customers |
| Customer Type | No | Cascade dropdown | End Customer / Partner; drives sub-type options |
| Customer Source | No | Cascade dropdown | How the customer was referred or found |
| Phone | No | Text input | Primary phone number |
| Email | No | Text input | Primary email address |
| Scope of Business | No | Textarea | Brief description of what the customer does |
| Owner | No | Address picker | Defaults to the logged-in user |
| Joint Follower(s) | No | Multi-user picker | Additional sales reps who can view and edit |

### 3.3 Address Detail Table

The **Address** section is a multi-row detail table — not a single input. Each row represents one business address.

| Sub-field | Required | Type | Notes |
|-----------|----------|------|-------|
| Country | No | Dropdown | MY / VN / PH / ID and others |
| State / Province | No | Text input | State or province name |
| City | No | Text input | City name |
| Postal Code | No | Text input | ZIP or postal code |
| Street | No | Text input | Street line |
| Address Type | No | Dropdown | e.g., Billing, Shipping, Registered |

To add a row: click **+ Insert** in the Address sub-table toolbar.
To delete a row: click **Delete** (trash icon) on the target row.

### 3.4 Saving

Click **Save** in the top action bar. The system assigns a unique Customer ID and redirects to the Detail view.

---

## 4. Details View

The Customer detail page contains the main record at the top and multiple sub-tabs below.

### 4.1 Header Information

Displays Customer Name, Customer Type, Owner, and key contact fields at a glance.

### 4.2 Sub-tabs

| Tab | Content |
|-----|---------|
| Basic Info | All fields from the Create form |
| Contacts | Related contact persons |
| Opportunities | All opportunities linked to this customer |
| Quotations | Quotations raised for this customer |
| Sales Orders | Confirmed sales orders |
| Contracts | Signed contracts |
| Collections | Payment collections received |
| Addresses | Address detail table rows |
| System Record | Creation and modification audit trail |

### 4.3 Editing

Click **Edit** in the top action bar to enter edit mode. Make changes and click **Save**.

---

## 5. Business Rules & Workflow

### 5.1 Legal Reg. Code Uniqueness

The Legal Reg. Code field enforces **system-wide uniqueness**. If you attempt to save a customer with a code already in use, the system will display a validation error. Verify the code before creating a new record — the customer may already exist.

### 5.2 Inactivity Release to Public Pool

Customers with **no activity for 60 consecutive days** are automatically released to the **Public Pool**. This means:
- The Owner assignment is cleared.
- Any sales rep can claim the customer by assigning themselves as Owner.
- Joint Followers are also cleared.

Monitor your customer list regularly to prevent unintended releases.

### 5.3 Joint Follower

The **Joint Follower** feature allows multiple sales representatives to be associated with a single customer. All joint followers can:
- View the customer record and all linked transactions.
- Edit customer information (subject to role permissions).
- Receive notifications related to this customer.

### 5.4 Customer Type: End Customer vs Partner

| Type | Description |
|------|-------------|
| End Customer | The organisation that directly uses or purchases Securemetric products/services |
| Partner | A reseller, distributor, or system integrator who sells on behalf of Securemetric |

Customer Type drives cascade sub-type options. Select the correct type at creation — changing it later may affect pipeline reporting.

### 5.5 Multi-Country Sharding

Securemetric CRM supports operations across **Malaysia (MY)**, **Vietnam (VN)**, **Philippines (PH)**, and **Indonesia (ID)**. Customer records are sharded by country, meaning:
- Reporting can be filtered by country.
- Address fields are country-aware.
- Some dropdown options are country-specific.

---

## 6. FAQ & Notes

**Q: I cannot save because "Legal Reg. Code already exists". What do I do?**
Search the customer list for the existing code. If the record belongs to another owner, contact your manager or use the Public Pool claiming process. Do not create a duplicate.

**Q: My customer disappeared from my list. Where did it go?**
The customer may have been released to the Public Pool due to 60 days of inactivity. Go to the Public Pool view and search by customer name to reclaim it.

**Q: Can I have more than one owner for a customer?**
There is only one **Owner**, but you can add multiple **Joint Followers**. Joint Followers have the same visibility and edit rights as the owner.

**Q: How do I add a second address for a customer with offices in multiple cities?**
In the Address detail table, click **+ Insert** to add a new row for each additional address. Each row can have its own Address Type (e.g., Billing, Shipping).

**Q: What is the difference between Customer Source and Customer Type?**
- **Customer Source** describes *how* the customer was acquired (e.g., referral, exhibition, cold call).
- **Customer Type** describes *what kind* of customer they are (End Customer or Partner).

**Q: Can I delete a customer record?**
Customer deletion is restricted. If a customer has linked transactions (Opportunities, SO, Contracts), deletion is blocked. Contact your system administrator for archival procedures.
