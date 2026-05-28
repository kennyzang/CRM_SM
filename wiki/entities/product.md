---
title: Product Entity
created: 2026-04-22
updated: 2026-04-22
type: entity
tags: [product, test/create]
sources: [raw/articles/crm-user-manual-v1.md, raw/articles/business-blueprint-v1.md]
related: [[opportunity]], [[lead]], [[widget-special-controls]]
---

# Product Entity

## Overview

**Module**: Product (产品)
**Create URL**: `/web/#/current/sys-modeling/app/km-ltc/add/1j1ckq9k1wcw22b3iw2f103901k2097813w0`

Products represent sellable items (software, maintenance, services) in the CRM catalog.

## Business Rules

1. **Product Types**: Software / Maintenance / Service.
2. **Principal in Charge**: Each product has an associated Principal (vendor/supplier) selected via relation modal.
3. **Target Margin**: The target profit margin is calculated from cost and list price.
4. **Multi-currency**: Products can be priced in different currencies.

## Field Registry

Source: `pages/ProductCreatePage.ts`.

| Field | Label | data-tid / Locator | Type | Required | Notes |
|-------|-------|--------------------|------|----------|-------|
| productDescription | Product Description | text-based | text | Yes | |
| productCode | Product Code | text-based | text | Yes | |
| productType | Product Type | cascade | cascade | Yes | Options: Software, Maintenance, Service |
| principalInCharge | Principal in Charge | relation-modal | relation-modal | Yes | Opens "Select record" modal |
| currency | Currency | lui-select | lui-select | No | Default: MYR |
| cost | Cost | number input | number | Yes | Purchase unit price (`fd_purchase_unit_price`) |
| listPrice | List Price | number input | number | Yes | Selling price (`fd_price`) |
| targetMargin | Target Margin | text | text | No | Auto-calculated. CRM typo: `fd_prodcut_target_margin` |
| remark | Remark | textarea | textarea | No | |

## Target Margin

Target Margin is displayed as a percentage. The CRM may auto-format numeric values (e.g., "30" → "30.00" or "30%"). Tests should handle format variations.

## Page Objects

| File | Class |
|------|-------|
| `pages/ProductCreatePage.ts` | `ProductCreatePage` |

## Known Issues

1. **Error page reload**: The Product create page may show a "failed to load" error page requiring a click to reload.
2. **Target Margin formatting**: The CRM may apply unexpected number formatting to margin values.
3. **Principal in Charge modal**: Requires an account with principal records.

## Language Note

Chinese labels in the Product UI are **defects**.
