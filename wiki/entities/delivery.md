---
title: Delivery Entity
created: 2026-06-04
updated: 2026-06-04
type: entity
tags: [delivery, test/create, schema-driven, logistics]
sources: [schema/mk_ltc_delievery.json]
related: [[so]], [[contract]], [[payment-schedule]]
schema: mk_ltc_delievery.json
---

# Delivery Entity (发货)

## Overview

**Module**: Delivery (发货 / Shipment)
**Schema**: `mk_ltc_delievery.json` (19 fields)

Deliveries track shipment records linked to Sales Orders (SO). Supports courier tracking, weight, and shipping cost management.

## Business Rules

1. **SO Linkage**: Each delivery must be linked to a Sales Order (`fd_SO_No`).
2. **Customer Auto-population**: Customer name auto-populated from linked SO (`fd_Customer_Name`).
3. **Courier Tracking**: Supports courier services, air way bill, and tracking numbers.
4. **Shipping Costs**: Fuel surcharges and shipping fees in MYR.

## Field Registry

Source: `mk_ltc_delievery.json` (Schema auto-generated)

| Field | Label | data-tid | Type | Required | Notes |
|-------|-------|----------|------|----------|-------|
| 销售订单号 | 销售订单号 | `fd_SO_No` | relation | ✅ Yes | Link to Sales Order |
| 日期 | 日期 | `fd_Date` | timestamp | No | Record date |
| 形式发票编号 | 形式发票编号 | `fd_PI_No` | fd_input | No | PI number |
| 自提ID | 自提ID | `fd_Self_collect_ID` | fd_input | No | Self-collection ID |
| 客户名称 | 客户名称 | `fd_Customer_Name` | relation | No | Auto-populated from SO |
| 销售员 | 销售员 | `fd_Sales_Person` | address | No | Sales person |
| 项目描述 | 项目描述 | `fd_Item_Description` | textarea | No | Item description |
| 发票编号 | 发票编号 | `fd_Invoice_Number` | fd_input | No | Invoice number |
| 完成人 | 完成人 | `fd_Done_By` | address | No | Completed by |
| 发货日期 | 发货日期 | `fd_Ship_Date` | timestamp | No | Ship date |
| 快递服务 | 快递服务 | `fd_Courier_Services` | fd_input | No | Courier name |
| 燃油附加费（马币） | 燃油附加费（马币） | `fd_Fuel_Surcharges` | moneytext | No | Fuel surcharge (MYR) |
| 空运提单 | 空运提单 | `fd_Air_Way_Bill` | fd_input | No | AWB number |
| 重量 | 重量 | `fd_Weight` | numbertext | No | Weight |
| 快递发票编号 | 快递发票编号 | `fd_Courier_Invoice_Number` | fd_input | No | Courier invoice |
| 运费（马币） | 运费（马币） | `fd_Shipment` | moneytext | No | Shipping cost (MYR) |
| 备注 | 备注 | `fd_Remarks` | textarea | No | Remarks |
| 实体代码 | 实体代码 | `fd_entity_code` | fd_input | No | Entity code |
| 流程模板ID | 流程模板ID | `fd_process_template_id` | fd_input | No | System |

## Known Issues

1. **Mixed language labels**: Most fields show Chinese labels — these are defects.
2. **Filename typo**: Schema file is `mk_ltc_delievery.json` (delievery instead of delivery).
