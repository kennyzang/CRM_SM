---
title: Contact Entity (联系人)
created: 2026-04-22
updated: 2026-04-24
type: entity
tags: [contact, test/create]
sources: [raw/articles/crm-user-manual-v1.md, raw/articles/business-blueprint-v1.md, oss/Contact & Lead Creation.mp4, doc/Securemetric CRM_new features.docx]
related: [[customer]], [[lead]], [[duplicate-check]]
language: zh-CN
---

# 联系人实体 (Contact Entity)

## 概述

**模块**: 联系人 (Contact)
**入口URL**: `/web/#/current/sys-modeling/app/km-ltc/listView/1hvp2cluhw58w6l8fw3611h2s3vd75k91dw1/1i20pgcrdw6awilsw3ip2cvq36n244duq8w1`
**创建URL**: `/web/#/current/sys-modeling/app/km-ltc/add/1huk4vljow4bw7civw3cdgsju212d8jr1sw1`

联系人是与客户关联的个人。联系人必须链接到现有客户记录。

## 业务规则

1. **客户关联**: 每个联系人必须关联到客户记录。
2. **关系图**: CRM支持显示联系人之间联系的关系图。
3. **性别字段**: 单选按钮在data-tids中有CRM拼写错误"raido"。
4. **邮箱或电话要求**: 蓝图规范说明提交时邮箱或电话至少填一个。
5. **关系评分**: 关系下拉有隐含评分值（教练=5、冠军=4、支持者=3、中立=2、阻碍者=1）。
6. **负责人自动分配**: 负责人字段自动填充当前登录用户。
7. **重复验证**: 保存时系统自动对数据库进行唯一性验证。

## 字段注册表

来源：Playwright MCP DOM 检查（2026-04-22）。
视频确认字段标记为[V]（来自"联系人&线索创建"视频，2026-04-24）。

### 部分：基本信息

| 字段 | 标签 | data-tid | 类型 | 必填 | 备注 |
|-------|-------|----------|------|----------|-------|
| customer | 客户 | — | 关联/查找 | 否 | [V] 标签样式带'x'清除。链接到现有客户记录 |
| contactName | 联系人姓名 | `comp-fd_name--input` | 文本 | 是 | 红色星号 |
| mobile | 手机 | `comp-fd_mobile--input` | 文本 | 否 | 马来西亚格式：01x-xxxxxxx。自动完成历史条目 |
| department | 部门 | `comp-fd_department--input` | 文本 | 否 | 占位符："请输入" |
| reportsTo | 汇报给 | — | 关联/查找 | 否 | [V] 链接到另一个联系人 |
| relationship | 关系 | — | 下拉 | 否 | [V] 值：教练\|5、冠军\|4、支持者\|3、中立\|2、阻碍者\|1 |
| referredBy | 推荐人 | — | 文本 | 否 | [V] 占位符："请输入" |
| address | 地址 | `comp-fd_address--input` | 文本 | 否 | |
| businessCard | 名片 | — | 文件上传 | 否 | [V] 仅jpg/gif/png，单个文件，支持拖放 |
| owner | 负责人 | — | 只读 | 否 | [V] 自动填充（如"seradmin"） |
| contactType | 类型 | — | 下拉 | 是 | [V] 红色星号。值包括"客户联系人" |
| gender | 性别 | undefined | 单选 | 是 | 选项：男、女 |
| email | 邮箱 | `comp-fd_email--input` | 文本 | 否 | |
| jobTitle | 职位 | `comp-fd_position--input` | 文本 | 否 | CRM中字段名为"position" |
| decisionMaker | 决策者 | — | 单选 | 否 | [V] 选项：是、否 |
| roleInDecision | 决策角色 | — | 下拉 | 否 | [V] 占位符："请选择" |
| birthday | 生日 | — | 日期选择器 | 否 | [V] 日历图标，占位符："请选择日期" |
| officePhone | 办公电话 | — | 文本 | 否 | [V] 占位符："请输入" |
| notes | 备注 | `comp-fd_remark--teaxtarea` | 文本域 | 否 | CRM拼写错误："teaxtarea" |
| ownersDepartment | 负责人部门 | — | 只读 | 否 | [V] 未设置时显示"-" |

## 重复检查 [D]

联系人包含在**重复检查**模块中（侧边栏 → 重复检查）。通过姓名、手机、邮箱搜索现有联系人后再创建新记录。结果分为联系人标签页和客户标签页。详见[[duplicate-check]]。

## 已知问题

1. **地址tid差异**: 联系人使用`comp-fd_address--input`，线索也使用`comp-fd_address--input`。客户使用明细表代替。
2. **性别无tid**: 性别单选字段没有`data-tid`属性 — 通过匹配字段集标签文本解析。
3. **window.close()陷阱**: 通过弹窗窗口创建联系人时，`window.close()`可能干扰Playwright。

## 语言说明

联系人UI中的中文标签（如"联系人姓名"对应"Contact Name"）是**缺陷**。系统官方语言是英语。
