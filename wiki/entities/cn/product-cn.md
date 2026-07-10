---
title: 产品实体
created: 2026-04-22
updated: 2026-06-04
type: entity
tags: [product, test/create, schema-driven]
sources: [raw/articles/crm-user-manual-v1.md, raw/articles/business-blueprint-v1.md]
related: [[opportunity]], [[lead]]
schema: mk_km_ltc_new_product.json
---

# 产品实体

## 概述

**模块**: 产品
**创建URL**: `/web/#/current/sys-modeling/app/km-ltc/add/1j1ckq9k1wcw22b3iw2f103901k2097813w0`
**Schema**: `mk_km_ltc_new_product.json`（27个字段）

产品代表CRM目录中的可售项目（软件、硬件、服务）。

## 业务规则

1. **产品类型**: 软件 / 硬件 / 服务（通过 `fd_record_type` 选择）。
2. **负责人厂商**: 每个产品关联一个负责人厂商（供应商/厂家），通过关系弹窗选择。
3. **成本与标价**: 采购单价和销售价格，自动计算利润率。
4. **多币种**: 产品可按不同币种定价（通过 `fd_currency` 动态配置）。
5. **产品状态**: 在售 / 停售。
6. **库存管理**: 库存数量、库存水平（低/正常/高）及描述。

## 字段注册表

来源：`mk_km_ltc_new_product.json`（Schema自动生成于2026-06-04）

| 字段 | 标签 | data-tid | 类型 | 必填 | 备注 |
|------|------|----------|------|------|------|
| Product Code | 产品代码 | `fd_product_code` | fd_input | ✅ 是 | |
| Product Description | 产品描述 | `fd_product_name` | fd_input | ✅ 是 | |
| Product Specification | 产品规格 | `fd_product_spec` | textarea | 否 | |
| Principal in Charge | 负责人厂商 | `fd_principal_in_charge` | relation | ✅ 是 | 过滤条件: fd_status=1 |
| Product Type | 产品类型 | `fd_record_type` | select | ✅ 是 | 3个选项 |
| Target Margin | 目标利润率 | `fd_prodcut_target_margin` | numbertext | 否 | CRM拼写错误: `prodcut` |
| Cost | 成本 | `fd_purchase_unit_price` | moneytext | ✅ 是 | 采购单价 |
| Cost Currency | 成本币种 | `fd_currency` | dynamic | ✅ 是 | 配置: 币种下拉 |
| Entity in Charge | 负责实体 | `fd_Entity_in_Charge` | relation | 否 | 过滤条件: fd_enable=1 |
| Person In Charge | 负责人 | `fd_owner_people` | address | 否 | |
| List Price | 标价 | `fd_price` | moneytext | 否 | 销售价格 |
| Product Status | 产品状态 | `fd_product_status` | select | 否 | 2个选项: 在售, 停售 |
| Department | 部门 | `fd_data_own_department` | address | 否 | |
| Product Image | 产品图片 | `fd_picture_path` | image | 否 | |
| Remark | 备注 | `fd_remark` | textarea | 否 | |
| Image Caption | 图片说明 | `fd_description` | rich-text | 否 | |
| Launch Date | 上架日期 | `fd_on_shelves_time` | timestamp | 否 | |
| Withdraw Date | 下架日期 | `fd_off_shelves_time` | timestamp | 否 | |
| Modification Status | 变更状态 | `fd_col_bm3xn8` | radio | 否 | 2个选项 |
| Barcode | 条形码 | `fd_barcode` | barcode | 否 | |
| Monitored Product | 重点产品 | `fd_key_product` | switch | 否 | |
| Test | 测试 | `fd_col_sx2gzt` | textarea | 否 | |
| Stock Qty. | 库存数量 | `fd_stock_qty` | numbertext | 否 | |
| Stock Level | 库存水平 | `fd_stock_level` | radio | 否 | 3个选项 |
| Stock Level Description | 库存水平描述 | `fd_stock_level_desc` | textarea | 否 | |
| Section | 分区 | `fd_col_leynes` | cfg | 否 | |
| Process Template ID | 流程模板ID | `fd_process_template_id` | fd_input | 否 | 系统 |

## 目标利润率

目标利润率以百分比显示。CRM可能自动格式化数值（如 "30" → "30.00" 或 "30%"）。测试应处理格式变化。

**已知拼写错误**: `fd_prodcut_target_margin`（prodcut应为product）。

## 已知问题

1. **错误页面重载**: 产品创建页可能显示"加载失败"错误页，需点击重载。
2. **目标利润率格式化**: CRM可能对利润率值应用意外的数字格式化。
3. **负责人厂商弹窗**: 需要具有厂商记录的账号。
4. **中文UI标签**: 部分字段显示中文标签 — 这些是缺陷。
