---
title: Collection Entity
created: 2026-06-04
updated: 2026-06-09
type: entity
tags: [collection, test/create, schema-driven, finance]
sources: [schema/mk_km_ltc_collection.json]
related: [[so]], [[invoice-application]], [[payment-schedule]]
schema: mk_km_ltc_collection.json
---

# Collection Entity (Customer Payment)

## Overview

**Module**: Collection (Customer Payment)
**Schema**: `mk_km_ltc_collection.json` (16 fields)

Collections track customer payments and revenue collection. Linked to accounts (customers) and supports finance confirmation workflow.

## Business Rules

1. **Account Linkage**: Each collection must be linked to a customer account (`fd_account_id`).
2. **Finance Confirmation**: Collections require finance user confirmation (`fd_finance_employee_id` + `fd_finance_confirm_time`).
3. **Currency Support**: Settlement currency via dynamic cfg (`fd_currency`).
4. **Bank Receipt Attachment**: Supports bank receipt attachment upload (`fd_receipt`).
5. **Lock Status**: Collections can be locked after confirmation.

## Field Registry

Source: `mk_km_ltc_collection.json` (Schema auto-generated)

| Field | Label | data-tid | Type | Required | Notes |
|-------|-------|----------|------|----------|-------|
| Account Name | Customer Name | `fd_account_id` | relation | Yes | Link to customer account |
| Payment Date | Payment Date | `fd_payment_time` | timestamp | Yes | Payment date |
| Collection Amount (Total) | Collection Amount (Total) | `fd_amount` | moneytext | Yes | Total collection amount |
| Settlement Currency | Settlement Currency | `fd_currency` | dynamic | Yes | CFG currency |
| Reminder Date | Reminder Date | `fd_notification_time` | timestamp | No | Reminder date |
| Owner | Owner | `fd_owner_people` | address | No | Owner |
| Department | Department | `fd_data_own_department` | address | No | Department |
| Finance Confirmer | Finance Confirmer | `fd_finance_employee_id` | address | No | Finance confirmer |
| Finance Confirm Time | Finance Confirm Time | `fd_finance_confirm_time` | timestamp | No | Finance confirm time |
| Purpose | Purpose | `fd_purpose` | select | No | Purpose selection |
| Lock Status | Lock Status | `fd_lock_status` | radio | No | Lock status |
| Submit Time | Submit Time | `fd_submit_time` | timestamp | No | Submit time |
| Currency | Currency | `fd_currency1` | fd_input | No | Currency (text fallback) |
| Sales Rep | Sales Rep | `fd_sales_rep` | fd_input | No | |
| Bank Receipt Attachment | Bank Receipt Attachment | `fd_receipt` | attachment | No | Bank receipt |
| Process Template ID | Process Template ID | `fd_process_template_id` | fd_input | No | System |

## Test Cases from Excel (2026-06-05)

| TC ID | Title | Priority | Status |
|-------|-------|----------|--------|
| TC-029 | Collection - Finance Confirmation and Bank Receipt | P2 | Not Tested |

## Known Issues

1. **Mixed language labels**: Some fields show Chinese labels -- these are defects.
2. **Finance workflow**: Requires finance user account to test full confirmation flow.
