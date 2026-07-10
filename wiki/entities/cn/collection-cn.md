---
title: 回款实体
created: 2026-06-04
updated: 2026-06-09
type: entity
tags: [collection, test/create, schema-driven, finance]
sources: [schema/mk_km_ltc_collection.json]
related: [[so]], [[invoice-application]], [[payment-schedule]]
schema: mk_km_ltc_collection.json
---

# 回款实体（客户回款）

## 概述

**模块**: 回款（客户回款）
**Schema**: `mk_km_ltc_collection.json`（16个字段）

回款跟踪客户付款和收入收款。关联到账户（客户）并支持财务确认工作流。

## 业务规则

1. **账户关联**: 每笔回款必须关联到客户账户（`fd_account_id`）。
2. **财务确认**: 回款需要财务用户确认（`fd_finance_employee_id` + `fd_finance_confirm_time`）。
3. **币种支持**: 通过动态配置支持结算币种（`fd_currency`）。
4. **银行回单附件**: 支持银行入账回单附件上传（`fd_receipt`）。
5. **锁定状态**: 确认后回款可被锁定。

## 字段注册表

来源：`mk_km_ltc_collection.json`（Schema自动生成）

| 字段 | 标签 | data-tid | 类型 | 必填 | 备注 |
|------|------|----------|------|------|------|
| 客户名称 | 客户名称 | `fd_account_id` | relation | ✅ 是 | 链接到客户账户 |
| 回款日期 | 回款日期 | `fd_payment_time` | timestamp | ✅ 是 | 付款日期 |
| Collection Amount (Total) | 回款总额 | `fd_amount` | moneytext | ✅ 是 | 回款总金额 |
| 结算货币 | 结算货币 | `fd_currency` | dynamic | ✅ 是 | 配置币种 |
| 提醒日期 | 提醒日期 | `fd_notification_time` | timestamp | 否 | 提醒日期 |
| 负责人 | 负责人 | `fd_owner_people` | address | 否 | 负责人 |
| 归属部门 | 归属部门 | `fd_data_own_department` | address | 否 | 部门 |
| 财务确认人 | 财务确认人 | `fd_finance_employee_id` | address | 否 | 财务确认人 |
| 财务确认时间 | 财务确认时间 | `fd_finance_confirm_time` | timestamp | 否 | 财务确认时间 |
| 回款用途 | 回款用途 | `fd_purpose` | select | 否 | 用途选择 |
| 锁定状态 | 锁定状态 | `fd_lock_status` | radio | 否 | 锁定状态 |
| 回款提交时间 | 回款提交时间 | `fd_submit_time` | timestamp | 否 | 提交时间 |
| 币种 | 币种 | `fd_currency1` | fd_input | 否 | 币种（文本备选） |
| Sales Rep | 销售代表 | `fd_sales_rep` | fd_input | 否 | |
| 银行入账回单附件 | 银行入账回单附件 | `fd_receipt` | attachment | 否 | 银行回单 |
| 流程模板ID | 流程模板ID | `fd_process_template_id` | fd_input | 否 | 系统 |

## Excel测试用例（2026-06-05）

| 用例ID | 标题 | 优先级 | 状态 |
|--------|------|--------|------|
| TC-029 | 回款 - 财务确认和银行回单 | P2 | 未测试 |

## 已知问题

1. **混合语言标签**: 部分字段显示中文标签 — 这些是缺陷。
2. **财务工作流**: 需要财务用户账号来测试完整确认流程。
