---
title: 公海池规则用户手册（中文版）
created: 2026-06-17
updated: 2026-06-17
type: user-manual
tags: [public-pool, admin, user-manual, zh]
---

# 公海池规则（Public Pool Management）用户手册

> **版本**: V1.0 | **日期**: 2026-06-17 | **系统**: Securemetric CRM (EasyCraft)

---

## 目录

1. [模块概述](#1-模块概述)
2. [公海池列表](#2-公海池列表)
3. [基本配置](#3-基本配置)
4. [池规则](#4-池规则)
5. [常见问题](#5-常见问题)

---

## 1. 模块概述

公海池（Public Pool）管理暂无专属负责人的客户，防止客户资源长期被占用。每个法律实体对应一个公海池，规则决定销售能否自行领取客户以及客户何时因不活跃被自动回收。

### 1.1 入口路径

| 入口 | 路径 |
|------|------|
| 主入口 | 左侧导航 **CUSTOMER**，切换至 **Public Pool** 页签 | [直达链接](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1i1oomam1w64w225gw1ocmdd72g2hl7q34w1/1i03ava4ow5jw123aw1q8gev71o4d7oo2pw1?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1){: target="_blank" rel="noopener"} |

---

## 2. 公海池列表

![公海池列表](../../assets/public-pool-001-list.png)

每个法律实体对应一个公海池，共 7 条。列表显示各池的管理员、所属部门和当前领取规则。点击右侧编辑图标进入配置页。

---

## 3. 基本配置

![公海池基本配置](../../assets/public-pool-002-basic.png)

配置 **Administrator(s)**（管理员）和 **Member Depart**（所属部门），系统自动将部门下所有人员带入 **Pool Members** 列表。

> **部门成员变更时**：公海池的 Pool Members 列表不会自动更新。需前往 **基础数据设置 → 公司主体**，点击对应主体详情页的 **Member Change** 按钮手动同步，同步完成后公海池成员随之更新。

### 3.1 领取规则（Claiming Rule）

与线索池类似，决定销售是否可以自行领取公海池中的客户：

| 选项 | 说明 |
|------|------|
| **Members cannot claim; Admin can assign** | 成员无法自行领取，只有管理员可分配 |
| **Members can claim; Admin can assign** | 成员可自行领取，管理员也可主动分配 |

---

## 4. 池规则

![公海池规则配置](../../assets/public-pool-003-rules.png)

### 4.1 不活跃回收（Inactivity Reclaim）

| 规则 | 当前值 | 说明 |
|------|--------|------|
| Inactivity Reminder Threshold | 30 天 | 客户长时间无跟进，触发提醒通知负责人 |
| Inactivity Reclaim Period | 60 天 | 超过此天数无活动，客户自动回收至公海池 |

> **注意**：客户一旦回收，当前负责人失去归属权。建议销售定期更新跟进记录避免客户被意外回收。

### 4.2 转移规则（Transfer Rules）

- 已领取的客户可转移到其他公海池
- 允许外部客户被转入本池

当前两项均已启用，方便跨池协作。

### 4.3 数据重置规则（Data Reset Rules）

- 客户负责人变更时，可选择是否清空关联团队成员
- 客户转入本池时，可选择是否自动清空原负责人

这两项默认未勾选，转移时保留原有团队数据。

---

## 5. 常见问题

**Q：客户突然变成无负责人状态，怎么回事？**  
A：客户可能触发了公海池的不活跃回收规则（默认 60 天无活动自动回收）。可在公海池列表中找到该客户重新分配，并提醒对应销售定期记录跟进活动。

**Q：如何让销售可以自行从公海池领取客户？**  
A：进入对应实体的公海池编辑页，将 Claiming Rule 改为 "Members can claim; Admin can assign" 并保存。
