---
title: Product Entity
created: 2026-04-22
updated: 2026-06-04
type: entity
tags: [product, test/create, schema-driven]
sources: [raw/articles/crm-user-manual-v1.md, raw/articles/business-blueprint-v1.md]
related: [[opportunity]], [[lead]], [[widget-special-controls]]
schema: mk_km_ltc_new_product.json
---

# Product Entity

## Overview

**Module**: Product (产品)
**Create URL**: `/web/#/current/sys-modeling/app/km-ltc/add/1j1ckq9k1wcw22b3iw2f103901k2097813w0`
**Schema**: `mk_km_ltc_new_product.json` (27 fields)

Products represent sellable items (software, hardware, services) in the CRM catalog.

## Business Rules

1. **Product Types**: Software / Hardware / Service (via `fd_record_type` select).
2. **Principal in Charge**: Each product has an associated Principal (vendor/supplier) selected via relation modal.
3. **Cost & List Price**: Purchase unit price and selling price with auto-calculated margin.
4. **Multi-currency**: Products can be priced in different currencies (via `fd_currency` dynamic cfg).
5. **Product Status**: On sale / Off sale.
6. **Stock Management**: Stock Qty, Stock Level (Low/Normal/High) with description.

## Field Registry

Source: `mk_km_ltc_new_product.json` (Schema auto-generated 2026-06-04)

| Field | Label | data-tid | Type | Required | Notes |
|-------|-------|----------|------|----------|-------|
| Product Code | Product Code | `fd_product_code` | fd_input | ✅ Yes | |
| Product Description | Product Description | `fd_product_name` | fd_input | ✅ Yes | |
| Product Specification | Product Specification | `fd_product_spec` | textarea | No | |
| Principal in Charge | Principal in Charge | `fd_principal_in_charge` | relation | ✅ Yes | Filters: fd_status=1 |
| Product Type | Product Type | `fd_record_type` | select | ✅ Yes | 3 options |
| Target Margin | Target Margin | `fd_prodcut_target_margin` | numbertext | No | CRM typo: `prodcut` |
| Cost | Cost | `fd_purchase_unit_price` | moneytext | ✅ Yes | Purchase unit price |
| Cost Currency | Cost Currency | `fd_currency` | dynamic | ✅ Yes | CFG: 币种下拉 |
| Entity in Charge | Entity in Charge | `fd_Entity_in_Charge` | relation | No | Filters: fd_enable=1 |
| Person In Charge | Person In Charge | `fd_owner_people` | address | No | |
| List Price | List Price | `fd_price` | moneytext | No | Selling price |
| Product Status | Product Status | `fd_product_status` | select | No | 2 options: On sale, Off sale |
| Department | Department | `fd_data_own_department` | address | No | |
| Product Image | Product Image | `fd_picture_path` | image | No | |
| Remark | Remark | `fd_remark` | textarea | No | |
| Image Caption | Image Caption | `fd_description` | rich-text | No | |
| Launch Date | Launch Date | `fd_on_shelves_time` | timestamp | No | |
| Withdraw Date | Withdraw Date | `fd_off_shelves_time` | timestamp | No | |
| Modification Status | Modification Status | `fd_col_bm3xn8` | radio | No | 2 options |
| Barcode | Barcode | `fd_barcode` | barcode | No | |
| Monitored Product | Monitored Product | `fd_key_product` | switch | No | |
| Test | Test | `fd_col_sx2gzt` | textarea | No | |
| Stock Qty. | Stock Qty. | `fd_stock_qty` | numbertext | No | |
| Stock Level | Stock Level | `fd_stock_level` | radio | No | 3 options |
| Stock Level Description | Stock Level Description | `fd_stock_level_desc` | textarea | No | |
| Section | Section | `fd_col_leynes` | cfg | No | |
| Process Template ID | Process Template ID | `fd_process_template_id` | fd_input | No | System |

## Target Margin

Target Margin is displayed as a percentage. The CRM may auto-format numeric values (e.g., "30" → "30.00" or "30%"). Tests should handle format variations.

**Known typo**: `fd_prodcut_target_margin` (prodcut instead of product).

## Known Issues

1. **Error page reload**: The Product create page may show a "failed to load" error page requiring a click to reload.
2. **Target Margin formatting**: The CRM may apply unexpected number formatting to margin values.
3. **Principal in Charge modal**: Requires an account with principal records.
4. **Chinese UI labels**: Some fields show Chinese labels — these are defects.
