---
title: Collection Entity
created: 2026-06-04
updated: 2026-06-04
type: entity
tags: [collection, test/create, schema-driven, finance]
sources: [schema/mk_km_ltc_collection.json]
related: [[so]], [[invoice-application]], [[payment-schedule]]
schema: mk_km_ltc_collection.json
---

# Collection Entity (客户回款)

## Overview

**Module**: Collection (客户回款 / Customer Payment)
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
| 客户名称 | 客户名称 | `fd_account_id` | relation | ✅ Yes | Link to customer account |
| 回款日期 | 回款日期 | `fd_payment_time` | timestamp | ✅ Yes | Payment date |
| Collection Amount (Total) | Collection Amount (Total) | `fd_amount` | moneytext | ✅ Yes | Total collection amount |
| 结算货币 | 结算货币 | `fd_currency` | dynamic | ✅ Yes | CFG currency |
| 提醒日期 | 提醒日期 | `fd_notification_time` | timestamp | No | Reminder date |
| 负责人 | 负责人 | `fd_owner_people` | address | No | Owner |
| 归属部门 | 归属部门 | `fd_data_own_department` | address | No | Department |
| 财务确认人 | 财务确认人 | `fd_finance_employee_id` | address | No | Finance confirmer |
| 财务确认时间 | 财务确认时间 | `fd_finance_confirm_time` | timestamp | No | Finance confirm time |
| 回款用途 | 回款用途 | `fd_purpose` | select | No | Purpose selection |
| 锁定状态 | 锁定状态 | `fd_lock_status` | radio | No | Lock status |
| 回款提交时间 | 回款提交时间 | `fd_submit_time` | timestamp | No | Submit time |
| 币种 | 币种 | `fd_currency1` | fd_input | No | Currency (text fallback) |
| Sales Rep | Sales Rep | `fd_sales_rep` | fd_input | No | |
| 银行入账回单附件 | 银行入账回单附件 | `fd_receipt` | attachment | No | Bank receipt |
| 流程模板ID | 流程模板ID | `fd_process_template_id` | fd_input | No | System |

## Known Issues

1. **Mixed language labels**: Some fields show Chinese labels — these are defects.
2. **Finance workflow**: Requires finance user account to test full confirmation flow.
