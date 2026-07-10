---
title: 发货实体
created: 2026-06-04
updated: 2026-06-09
type: entity
tags: [delivery, test/create, schema-driven, logistics]
sources: [schema/mk_ltc_delievery.json]
related: [[so]], [[contract]], [[payment-schedule]]
schema: mk_ltc_delievery.json
---

# 发货实体（发货）

## 概述

**模块**: 发货
**Schema**: `mk_ltc_delievery.json`（19个字段）

发货跟踪与销售订单（SO）关联的发货记录。支持快递跟踪、重量和运费管理。

## 业务规则

1. **SO关联**: 每笔发货必须关联到销售订单（`fd_SO_No`）。
2. **客户自动填充**: 客户名称从关联的SO自动填充（`fd_Customer_Name`）。
3. **快递跟踪**: 支持快递服务、空运提单和跟踪号。
4. **运费**: MYR燃油附加费和运费。

## 字段注册表

来源：`mk_ltc_delievery.json`（Schema自动生成）

| 字段 | 标签 | data-tid | 类型 | 必填 | 备注 |
|------|------|----------|------|------|------|
| 销售订单号 | 销售订单号 | `fd_SO_No` | relation | ✅ 是 | 链接到销售订单 |
| 日期 | 日期 | `fd_Date` | timestamp | 否 | 记录日期 |
| 形式发票编号 | 形式发票编号 | `fd_PI_No` | fd_input | 否 | PI编号 |
| 自提ID | 自提ID | `fd_Self_collect_ID` | fd_input | 否 | 自提ID |
| 客户名称 | 客户名称 | `fd_Customer_Name` | relation | 否 | 从SO自动填充 |
| 销售员 | 销售员 | `fd_Sales_Person` | address | 否 | 销售人员 |
| 项目描述 | 项目描述 | `fd_Item_Description` | textarea | 否 | 项目描述 |
| 发票编号 | 发票编号 | `fd_Invoice_Number` | fd_input | 否 | 发票编号 |
| 完成人 | 完成人 | `fd_Done_By` | address | 否 | 完成人 |
| 发货日期 | 发货日期 | `fd_Ship_Date` | timestamp | 否 | 发货日期 |
| 快递服务 | 快递服务 | `fd_Courier_Services` | fd_input | 否 | 快递公司名称 |
| 燃油附加费（马币） | 燃油附加费（马币） | `fd_Fuel_Surcharges` | moneytext | 否 | 燃油附加费（MYR） |
| 空运提单 | 空运提单 | `fd_Air_Way_Bill` | fd_input | 否 | AWB编号 |
| 重量 | 重量 | `fd_Weight` | numbertext | 否 | 重量 |
| 快递发票编号 | 快递发票编号 | `fd_Courier_Invoice_Number` | fd_input | 否 | 快递发票 |
| 运费（马币） | 运费（马币） | `fd_Shipment` | moneytext | 否 | 运费（MYR） |
| 备注 | 备注 | `fd_Remarks` | textarea | 否 | 备注 |
| 实体代码 | 实体代码 | `fd_entity_code` | fd_input | 否 | 实体代码 |
| 流程模板ID | 流程模板ID | `fd_process_template_id` | fd_input | 否 | 系统 |

## Excel测试用例（2026-06-05）

| 用例ID | 标题 | 优先级 | 状态 |
|--------|------|--------|------|
| TC-030 | 发货 - SO关联发货及快递跟踪 | P2 | 未测试 |

## 已知问题

1. **混合语言标签**: 大部分字段显示中文标签 — 这些是缺陷。
2. **文件名拼写错误**: Schema文件为 `mk_ltc_delievery.json`（delievery应为delivery）。
