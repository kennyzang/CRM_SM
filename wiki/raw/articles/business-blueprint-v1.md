---
title: Securemetric CRM Business Blueprint V1
created: 2026-04-22
updated: 2026-04-22
type: summary
tags: [tool/wiki]
sources: []
related: [[lead]], [[customer]], [[opportunity]], [[quote]], [[pl]], [[so]]
---

# Business Blueprint V1 — English Summary

> Source document: `Business Blueprint.docx`
> Project: Securemetric CRM System
> Client: SECUREMETRIC BERHAD
> Vendor: EASYCRAFT SDN. BHD.
> Version: 1.0 | Date: 2026-01-21

---

## Five Design Principles

### 1. "Locked Pair" Pricing Architecture
- P&L is the engine, quotation is just a "view"
- Quotations cannot be modified directly — must modify underlying P&L
- Version locking: P&L V1 → Quote V1, price changes require new version
- Full audit trail

### 2. Reminders Over Force
- 72-hour lead timeout → triggers "recycle countdown" notification, does NOT auto-strip
- 60-day customer inactivity → Public Pool, does NOT auto-strip
- No hard cap: high-performing reps can hold unlimited leads/customers

### 3. Strict Data Sharding
- Entity isolation: Each Entity's data is mutually invisible
- Public Pool visibility: Unassigned customers visible to all AMs in region
- Export restrictions: Protects sensitive contact data

### 4. Milestone-Driven Settlement
- PM must update payment milestone completion to 100%
- Only then can "milestone proforma invoice" be triggered
- Prevents premature billing

### 5. Layered Reporting Logic
- Only "active" P&L version data is aggregated
- Prevents pipeline data inflation
- Export sorting: Entity → Rep → Date

---

## Organization Structure

### Hierarchy
- Group Level (Securemetric HQ)
- Country Branch (MY/VN/PH/ID)
- Entity Level (7 legal entities)

### Sales Rep Codes

| Name | Code | Status |
|------|------|--------|
| Edward | EDL | Active |
| CK | YCK | Active |
| Danny | YWY | Left |
| Affendi | MAR | Active |
| Yuwin | TYW | Active |
| Nickson | YWC | Left |

---

## Master Data

### Customer & Partner
- Unified Social Credit Code (Registration Code) uniqueness validation
- Customer types: End Customer / Partner

### Principal
- Linked to opportunities and products
- Selected via relation modal

### Product & Service
- Product types: Software / Maintenance / Service
- Cost field: fd_purchase_unit_price
- Selling price field: fd_price
- Target margin: fd_prodcut_target_margin (CRM typo)

### Currency
- Multi-currency support (local quoting)
- Unified reporting in MYR

---

## Business Flow: Lead Management

### 4.1 Contact Acquisition
### 4.2 Lead Acquisition & Conflict Check
### 4.3 Lead Assignment
- Manual / Auto assignment rules
- 72-hour timeout mechanism
### 4.4 Lead Follow-up
### 4.5 Lead Conversion
- Convert to Opportunity (requires customer link)
- Convert to Customer (standalone)

---

## Business Flow: Opportunity Management

### 5.1 Customer Management
- Public Pool rules
- Joint follower

### 5.2 Opportunity Pipeline
- Stage progression engine
- P&L calculation

### 5.3 P&L Calculation
- Cost entry
- Gross margin calculation
- Approval workflow

### 5.4 P&L Approval Workflow
- AM submits → MD/CM approves
- Rejection requires revision

### 5.5 Quotation Generation
- Generated from approved P&L
- Version correspondence

---

## Business Flow: Order to Settlement

### 6.1 Customer PO Capture
### 6.2 Order & Contract Entry
### 6.3 Proforma Invoice & Delivery
- Milestone proforma invoice
- PM completion rate verification
### 6.4 Customer Payment
- Payment records
- Accounts receivable management

---

## Special Business Rules

### 8.1 Lead Rules
- Exclusive enterprise name conflict check
- Multiple same-name handling

### 8.2 Customer Rules
- Registration Code uniqueness
- Public Pool claim rules

### 8.3 P&L and Quote Version Control
- No in-place edits
- Full version history

---

## Blueprint vs User Manual Differences

| Dimension | User Manual (Standard) | Blueprint (Custom) |
|-----------|----------------------|-------------------|
| Lead assignment | Basic assignment | 72h timeout recycle mechanism |
| Public Pool | Basic ocean | 60-day + multi-country sharding |
| Quotation | Free editing | P&L-driven, version-locked |
| Settlement | Date-driven | Milestone-driven |
| Multi-currency | Single currency | Local + MYR dual-track |

---

## Source File Path

`/Users/xiex/Documents/海外事业部/CRM/Securemetric CRM/Business Blueprint.docx`
