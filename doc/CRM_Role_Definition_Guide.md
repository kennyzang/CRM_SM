# Securemetric CRM — Role Definition Guide

**Purpose:** This document provides clear definitions of all CRM user roles. Please review each role and map your team members accordingly. Share this with your team leads to confirm role assignments before system go-live.

---

## How to Use This Document

1. Read each role definition carefully
2. Identify which role(s) best match each team member's responsibilities
3. Fill in the **Role Assignment Worksheet** at the end of this document
4. Return the completed worksheet to your CRM administrator

> **Note:** A user can hold only one primary role. If a team member spans multiple functions, assign the role that covers their primary day-to-day CRM activities.

---

## Role Definitions

### 1. Sales Representative

**Who this is for:** Front-line sales staff who manage the full sales cycle day to day.

**What they can do:**
- Create and manage Leads (including converting Leads to Opportunities)
- Manage Opportunities through the pipeline
- Create and submit Quotations
- Generate Profit & Loss (P&L) statements
- Create and manage Customers and Contacts
- Create Sales Orders
- Log activities (calls, meetings, tasks)
- View and update their own records only

**What they cannot do:**
- Approve records
- View other representatives' records (unless added to a Service Team)
- Manage user accounts or system settings

---

### 2. Sales Manager

**Who this is for:** Team leads or managers who oversee a group of Sales Representatives and handle approvals.

**What they can do:**
- Everything a Sales Representative can do
- View all records owned by their team members
- Manage the Lead Queue (assign, reassign, and prioritize leads)
- Approve Quotations, Sales Orders, and other records requiring manager sign-off
- Add/remove members from Service Teams and set their permissions
- Transfer record ownership between sales representatives
- Access team-level reports and dashboards

**What they cannot do:**
- Manage system-wide settings or user accounts (that is the Sales Administrator's responsibility)

---

### 3. Sales Administrator

**Who this is for:** The internal CRM system owner or operations admin responsible for keeping the system configured and running correctly.

**What they can do:**
- Manage user accounts (create, deactivate, reset passwords)
- Assign and change user roles
- Configure Basic Data / Master Data (product catalog, service master data, lookup values)
- Set up and maintain approval workflows
- Import and export data
- Access all modules in read mode for auditing purposes
- Generate system-wide reports

**What they cannot do:**
- Close deals or process financial transactions (that is not their function)

> **Recommendation:** Assign this role to no more than 2 people to maintain data integrity.

---

### 4. Presales

**Who this is for:** Technical or solution specialists who support the sales team in designing proposals and validating pricing before submission.

**What they can do:**
- Review Leads and Opportunities they are invited to (read access)
- Collaborate on P&L statements — review and adjust pricing, technical specifications, and product/service configurations
- Co-author Quotations with the Sales Representative
- Add comments and recommendations within records
- View Contract details for reference

**What they cannot do:**
- Create or own Leads and Opportunities independently
- Submit or approve Quotations
- Access financial settlement or payment records

---

### 5. Marketing

**Who this is for:** Marketing team members responsible for lead generation, campaigns, and tracking lead sources.

**What they can do:**
- Create and import Leads (bulk import supported)
- View and update Lead source and campaign attribution fields
- View Leads and Opportunities in read mode for pipeline visibility
- Access lead conversion reports to measure campaign effectiveness
- Manage marketing-related Basic Data (lead sources, campaign types)

**What they cannot do:**
- Edit Opportunity details or financials
- Access Quotations, Contracts, or Payment records
- Approve records

---

### 6. Project Manager (PM)

**Who this is for:** Delivery or implementation project managers who take over after a deal is closed and manage the fulfillment timeline.

**What they can do:**
- View Contracts and Sales Orders (read access)
- Manage Payment Schedules — update milestone completion percentages
- Trigger Invoice Requests when milestones are reached
- Track Delivery status
- Coordinate with Finance on payment confirmation

**What they cannot do:**
- Edit Quotations or Sales Orders
- Approve financial records
- Access Lead or Opportunity pipeline

---

### 7. Finance User

**Who this is for:** Finance or accounting team members who handle billing, collections, and payment reconciliation.

**What they can do:**
- View Contracts, Sales Orders, and Payment Schedules (read access)
- Process Invoice Applications — review, approve, and issue invoices
- Confirm payment receipts and log collection records
- Perform payment reconciliation
- Generate financial reports (aging, collection status)

**What they cannot do:**
- Edit Quotations, Sales Orders, or Contracts
- Access Lead or Opportunity pipeline

---

### 8. Operations

**Who this is for:** Logistics or operations staff who manage physical delivery of goods or services after an order is confirmed.

**What they can do:**
- View Sales Orders and Contracts (read access)
- Manage Delivery records — create shipments, update courier/tracking information
- Update delivery status (in transit, delivered, returned)
- Coordinate with Project Manager on fulfillment milestones

**What they cannot do:**
- Edit financial records, Quotations, or Sales Orders
- Access Lead or Opportunity pipeline

---

## Role Permissions Summary

| Module | Sales Rep | Sales Manager | Sales Admin | Presales | Marketing | PM | Finance | Operations |
|---|---|---|---|---|---|---|---|---|
| Lead | RW (own) | RW (team) | R (all) | R (invited) | RW | — | — | — |
| Opportunity | RW (own) | RW (team) | R (all) | R (invited) | R | R | — | — |
| Quotation | RW | RW + Approve | R | RW (collab) | — | R | R | — |
| P&L | RW | RW | R | RW (collab) | — | — | — | — |
| Sales Order | RW | RW | R | — | — | R | R | R |
| Contract | R | RW | R | R | — | R | R | R |
| Payment Schedule | R | R | R | — | — | RW | R | — |
| Invoice Application | R | R | R | — | — | R | RW | — |
| Delivery | R | R | R | — | — | R | — | RW |
| Customer / Contact | RW (own) | RW (team) | R (all) | R | R | R | R | — |
| User Management | — | — | RW | — | — | — | — | — |
| Basic Data / Config | — | — | RW | — | — | — | — | — |

**Legend:** `RW` = Read & Write · `R` = Read only · `—` = No access · `(own)` = Own records only · `(team)` = All records within managed team · `(invited)` = Only records where user is a Service Team member · `(collab)` = Collaborative edit within the record

---

## Role Assignment Worksheet

Please complete the table below and return it to your CRM administrator.

| # | Full Name | Job Title | Assigned CRM Role | Notes / Special Requirements |
|---|-----------|-----------|-------------------|------------------------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |
| 9 | | | | |
| 10 | | | | |

> Add more rows as needed.

---

## Questions?

If you are unsure which role fits a particular team member, or if you believe a custom permission combination is needed, please contact your Securemetric project representative before submitting this worksheet.

---

*Document version: 1.0 · Prepared by Securemetric · 2026-06-22*
