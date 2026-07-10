---
title: Delivery Entity
created: 2026-06-04
updated: 2026-06-09
type: entity
tags: [delivery, test/create, schema-driven, logistics]
sources: [schema/mk_ltc_delievery.json]
related: [[so]], [[contract]], [[payment-schedule]]
schema: mk_ltc_delievery.json
---

# Delivery Entity (Shipment)

## Overview

**Module**: Delivery (Shipment)
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
| Sales Order No. | Sales Order No. | `fd_SO_No` | relation | Yes | Link to Sales Order |
| Date | Date | `fd_Date` | timestamp | No | Record date |
| PI Number | PI Number | `fd_PI_No` | fd_input | No | PI number |
| Self-collect ID | Self-collect ID | `fd_Self_collect_ID` | fd_input | No | Self-collection ID |
| Customer Name | Customer Name | `fd_Customer_Name` | relation | No | Auto-populated from SO |
| Sales Person | Sales Person | `fd_Sales_Person` | address | No | Sales person |
| Item Description | Item Description | `fd_Item_Description` | textarea | No | Item description |
| Invoice Number | Invoice Number | `fd_Invoice_Number` | fd_input | No | Invoice number |
| Completed By | Completed By | `fd_Done_By` | address | No | Completed by |
| Ship Date | Ship Date | `fd_Ship_Date` | timestamp | No | Ship date |
| Courier Service | Courier Service | `fd_Courier_Services` | fd_input | No | Courier name |
| Fuel Surcharge (MYR) | Fuel Surcharge (MYR) | `fd_Fuel_Surcharges` | moneytext | No | Fuel surcharge (MYR) |
| Air Way Bill | Air Way Bill | `fd_Air_Way_Bill` | fd_input | No | AWB number |
| Weight | Weight | `fd_Weight` | numbertext | No | Weight |
| Courier Invoice No. | Courier Invoice No. | `fd_Courier_Invoice_Number` | fd_input | No | Courier invoice |
| Shipping Cost (MYR) | Shipping Cost (MYR) | `fd_Shipment` | moneytext | No | Shipping cost (MYR) |
| Remarks | Remarks | `fd_Remarks` | textarea | No | Remarks |
| Entity Code | Entity Code | `fd_entity_code` | fd_input | No | Entity code |
| Process Template ID | Process Template ID | `fd_process_template_id` | fd_input | No | System |

## Test Cases from Excel (2026-06-05)

| TC ID | Title | Priority | Status |
|-------|-------|----------|--------|
| TC-030 | Delivery - SO-Linked Shipment with Courier Tracking | P2 | Not Tested |

## Known Issues

1. **Mixed language labels**: Most fields show Chinese labels -- these are defects.
2. **Filename typo**: Schema file is `mk_ltc_delievery.json` (delievery instead of delivery).
