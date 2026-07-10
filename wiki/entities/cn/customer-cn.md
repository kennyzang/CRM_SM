---
title: Customer Entity (客户)
created: 2026-04-22
updated: 2026-04-22
type: entity
tags: [customer, test/create]
sources: [raw/articles/crm-user-manual-v1.md, raw/articles/business-blueprint-v1.md, doc/Securemetric CRM_new features.docx]
related: [[contact]], [[lead]], [[opportunity]], [[duplicate-check]]
language: zh-CN
---

# 客户实体 (Customer Entity)

## 概述

**模块**: 客户 (Customer)
**入口URL**: `/web/#/current/sys-modeling/app/km-ltc/listView/1hvp2b0bjw4vw6he8wg8l6lj3eo66ob102w1/1i1oh7vniw66w11k1w225fbfk1c7gcpr6aw1`
**创建URL**: `/web/#/current/sys-modeling/app/km-ltc/add/1hvjheq3nw4vw4j48w3doaci42dfrsq13tw1`

客户是CRM中的核心实体。它们可以是最终客户或合作伙伴。

## 业务规则

1. **注册代码唯一性**: 注册代码（统一社会信用代码）是唯一性强制执行的主键。
2. **公海池**: 客户60天无活动后自动释放到公海池（开放池）。该地区所有AM都可以认领。
3. **联合跟进人**: 多个销售人员可以跟进同一客户。
4. **客户类型**: 最终客户 vs 合作伙伴。
5. **多国家分片**: 客户数据按国家分区（MY/VN/PH/ID）。
6. **实体隔离**: 每个法律实体的数据相互不可见。

## 字段注册表

来源：Playwright MCP DOM 检查（2026-04-22）。

| 字段 | 标签 | data-tid | 类型 | 必填 | 备注 |
|-------|-------|----------|------|----------|-------|
| customerName | 客户名称 | `comp-fd_name--input` | 文本 | 是 | |
| legalRegCode | 法定注册代码 | `comp-fd_uniform_social_credit--input` | 文本 | 是 | 强制唯一性 |
| customerType | 客户类型 | `ef-fs-fd_account_type-desktop` | 级联 | 否 | |
| customerSource | 客户来源 | `ef-fs-fd_account_source-desktop` | 级联 | 否 | |
| phone | 电话 | `comp-fd_tel--input` | 文本 | 否 | |
| email | 邮箱 | `comp-fd_email--input` | 文本 | 否 | |
| scopeOfBusiness | 业务范围 | `comp-fd_scope--teaxtarea` | 文本域 | 否 | CRM拼写错误："teaxtarea" |
| addressDetailTable | 地址（明细表） | `data-id="mk_Address_list"` | 明细表 | 否 | 多行地址条目 |

## 地址明细表

与线索和联系人使用单行地址输入不同，客户使用明细表（`data-id="mk_Address_list"`）支持多个地址：
- 国家
- 省/州
- 城市
- 邮政编码
- 街道地址
- 地址类型

## 公海规则

| 规则 | 条件 | 操作 |
|------|-----------|--------|
| 自动释放 | 60天无跟进 | 释放到公海池 |
| 认领 | 该地区任何AM | 认领所有权 |
| 无硬性上限 | 高绩效代表 | 可无限持有线索/客户 |

## 重复检查 [D]

CRM提供专门的**重复检查**模块（侧边栏 → 重复检查），在创建新记录前查找现有客户或联系人。

![重复检查结果](../assets/duplicate-check-001.png)

- **搜索字段**: 姓名、手机、邮箱、注册代码
- **搜索行为**: 模糊匹配 — 结果中匹配文本以黄色高亮显示
- **结果**: 分为联系人标签页和客户标签页带记录计数
- **结果列**: 序号、姓名、负责人、实体、法定ID
- **分页**: 标准分页带"前往 X"（跳转到X页）和"每页 10 条"（每页10条）

> ⚠️ 分页中的**中文UI标签**（"前往"、"每页 条"）是缺陷。

## 已知问题

1. **地址表 vs 单行输入**: 客户对地址使用明细表，而线索/联系人使用单行输入。不要混淆定位器。
2. **业务范围拼写错误**: 使用`comp-fd_scope--teaxtarea`（CRM拼写错误）。

## 语言说明

客户UI中的中文标签（如"客户名称"对应"Customer Name"）是**缺陷**。
