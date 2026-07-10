---
title: P&L 用户手册（中文版）
created: 2026-05-27
updated: 2026-06-15
type: user-manual
tags: [pl, user-manual, zh]
sources: [oss/New P&L management.mp4]
related: [[pl]], [[quote]]
---

# P&L 用户手册

> **版本**: V1.1 | **日期**: 2026-06-15 | **适用系统**: Securemetric CRM (EasyCraft)

---

## 目录

1. [P&L 模块概述](#1-pnl-模块概述)
2. [P&L 创建流程](#2-pnl-创建流程)
3. [P&L 产品分类管理](#3-pnl-产品分类管理)
4. [P&L 详情与多年度视图](#4-pnl-详情与多年度视图)
5. [P&L 审批流程](#5-pnl-审批流程)
6. [常见问题与注意事项](#6-常见问题与注意事项)

---

## 1. P&L 模块概述

P&L（Profit & Loss，损益表）是 CRM 系统的核心定价引擎。它用于计算产品成本、利润率，并在审批通过后生成正式报价单（Quotation）。

### 1.1 入口路径

- **方式一**：侧边栏 → 进入具体 Opportunity 详情页 → 点击 "P&L" 标签 → 点击 "Create"
- **方式二**：侧边栏 → 直接导航到 P&L 模块 → 点击 "Create" | [直达链接](http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/listView/1jgm4elqbw5fw6fchw25vqita1j32h2sclw4/1jqqtlk45wfw1r8u6w107lsh8tire8u3jbw0?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1){: target="_blank" rel="noopener"}

![P&L 列表视图](../../assets/pl-list-001.png)

### 1.2 核心功能

| 功能 | 说明 |
|------|------|
| 成本核算 | 按产品类别录入成本和售价 |
| 利润计算 | 自动计算总收入、总成本、总利润和利润率 |
| 多年度管理 | 支持 Year 1 / Year 2 (RENEW) / Year 3 (RENEW) 续期视图 |
| 折扣管理 | 支持全局折扣和单行折扣两种模式 |
| 审批流程 | 提交后自动触发审批工作流 |
| 克隆功能 | 可复制已有 P&L 进行快速创建 |

---

## 2. P&L 创建流程

### 2.1 基本信息填写

进入 P&L Create 页面后，首先填写基本信息：

![P&L 创建页面 - 基本信息](../../assets/pl-035.png)

| 字段 | 说明 | 是否必填 |
|------|------|----------|
| Version | 版本号（自动生成） | 系统自动 |
| Customer | 客户名称（从 Opportunity 自动带入） | 自动带入 |
| Opportunity | 关联的商机 | 是 (*) |
| Currency | 货币（默认 MYR） | 是 (*) |
| Date | 日期（默认当天） | 是 (*) |

**操作按钮**：
- **Save**（右上角蓝色按钮）：保存草稿
- **Return**（左上角）：返回列表

### 2.2 分类标签导航

P&L 使用 7 个分类标签来管理不同类型的产品：

![P&L 分类标签](../../assets/pl-065.jpg)

| 标签 | 说明 | 徽章数字含义 |
|------|------|-------------|
| Overview | 总览页面，汇总所有类别数据 | — |
| Software | 软件产品 | 已添加的软件数量 |
| Hardware | 硬件产品 | 已添加的硬件数量 |
| Hardware Renew | 硬件续期产品 | 已添加的续期硬件数量 |
| Services | 专业服务 | 已添加的服务项目数量 |
| Reimbursement | 报销费用 | 已添加的报销项数量 |
| Others | 其他类别 | 其他项目数量 |

每个标签右上角的蓝色圆形徽章显示该类别下的产品数量。

![P&L 硬件续费开启](../../assets/pl-renewal-001.png)

### 2.3 全局折扣设置

在页面顶部有一个黄色高亮的全局折扣栏：

![全局折扣设置](../../assets/pl-055.jpg)

- **折扣输入框**：输入百分比数值（如 5.00%）
- **开关按钮**：蓝色表示已启用，灰色表示未启用
- **启用后**：所有产品行自动继承全局折扣
- **未启用**：需要在每个产品行单独设置折扣

### 2.4 财务汇总卡片

页面顶部显示四个关键财务指标：

| 卡片名称 | 说明 | 颜色 |
|----------|------|------|
| Total Revenue | 总收入 | 蓝色文字 |
| Total Cost | 总成本 | 默认颜色 |
| Total Profit | 总利润（收入 - 成本） | 绿色文字 |
| Margin | 利润率（利润 / 售价 × 100%） | 绿色（健康）/ 红色（低于目标） |

> ⚠️ **注意**：系统使用毛利率计算：`Margin = (利润 / 售价) × 100%`，即标准毛利率 `(利润 / 收入) × 100%`。

---

## 3. P&L 产品分类管理

### 3.1 添加产品

在每个产品类别下，点击 "+ Add Products" 按钮打开产品选择模态框：

![添加产品模态框](../../assets/pl-045.jpg)

**模态框结构**：
- **左面板**：搜索过滤区（Product Code、Product Description 输入框）+ 产品列表
- **右面板**："Selected (N)" 已选产品列表
- **底部按钮**：Cancel（取消）、Add N Products（添加 N 个产品，未选择时禁用）

### 3.2 产品表格列说明

| 列名 | 说明 | 是否可编辑 |
|------|------|-----------|
| CODE | 产品代码 | 自动带入 |
| PRODUCT | 产品名称 | 自动带入 |
| UNIT PRICE | 单价 | 可编辑 |
| MARKUP | 加价百分比 | 可编辑 |
| DISC | 折扣百分比 | 可编辑（或继承全局折扣） |
| PRICE | 折后净价 | 自动计算 |
| QTY | 数量 | 可编辑 |
| TOTAL PRICE | 总价（PRICE × QTY） | 自动计算 |
| COST | 成本 | 可编辑 |
| PROFIT | 利润（总价 - 成本） | 自动计算 |
| MARGIN | 利润率 | 自动计算 |
| TARGET | 目标利润率 | 系统设定 |
| Actions | 操作链接 | — |

### 3.3 行操作

每行产品提供三个操作链接：

| 操作 | 说明 |
|------|------|
| Edit | 打开右侧编辑面板，修改产品参数 |
| Renew | 创建续期产品行（用于 Hardware Renew 标签） |
| Delete | 删除该产品行 |

### 3.4 编辑产品

直接点击产品行，或点击行末的 "Edit" 链接，均可打开右侧编辑抽屉：

![编辑产品面板](../../assets/pl-045.jpg)

可修改的参数：
- **Markup**：加价百分比
- **Discount**：折扣（全局或单行）
- **Quantity**：数量
- **Price Breakdown**：价格明细（原价、加价后价格、总价）
- **Cost**：成本明细

修改后点击 "Save" 保存，或 "Cancel" 取消。

### 3.5 专业服务（Services）

专业服务使用 SM Team / 3rd Party Team 两个表格管理：

![编辑专业服务](../../assets/pl-075.jpg)

| 列名 | 说明 |
|------|------|
| ACTIVITY | 活动描述（如 "Flight"、"Senior Manager"） |
| NOTE | 备注 |
| RATE/DAY | 每日售价 |
| DAYS | 计费天数 |
| TOTAL PRICE | 总价（RATE/DAY × DAYS） |
| COST RATE/DAY | 每日成本 |
| DAYS (COST) | 成本天数（可与收入天数不同） |
| TOTAL COST | 总成本 |
| PROFIT | 利润 |
| MARGIN | 利润率 |

### 3.6 报销费用（Reimbursement）

点击 "+ Add Products" 后弹出 "Add Reimbursement" 模态框：

![添加报销费用](../../assets/pl-088.png)

| 字段 | 说明 |
|------|------|
| Activity | 活动类型（下拉选择，如 "Flight"） |
| Note | 备注 |
| Rate per Day / Trip | 每日/每次售价 |
| Day / Trip (Selling) | 售价计费单位数 |
| Cost Rate per Day / Trip | 每日/每次成本 |
| Day / Trip (Cost) | 成本计费单位数 |
| Total Selling Price | 自动计算 |
| Total Cost | 自动计算 |
| Expected Profit | 自动计算 |
| Margin | 自动计算 |

### 3.7 产品总览

在 Overview 标签页可以看到所有产品的汇总：

![P&L 产品总览](../../assets/pl-025.jpg)

每个类别下方显示该类别的小计：
- Total Price（该类别总价）
- Total Cost（该类别总成本）
- Expected Profit（该类别预期利润）
- Margin（该类别利润率）

---

## 4. P&L 详情与多年度视图

### 4.1 详情页面

P&L 详情页面标题为 "P&L Details"，显示已保存的 P&L 记录：

![P&L 详情页面](../../assets/pl-details-001.png)

**操作按钮**：
- **Edit**（铅笔图标）：进入编辑模式
- **Delete**（垃圾桶图标）：删除记录
- **Copy New**：克隆创建新 P&L
- **New Quotation**：基于此 P&L 创建报价单

### 4.2 多年度视图

详情页面包含按年度分类的财务汇总表：

| 类别 | YEAR 1 | YEAR 2 (RENEW) | YEAR 3 (RENEW) | TOTAL |
|------|--------|----------------|----------------|-------|
| Software | 收入/成本/利润率 | 续期数据 | 续期数据 | 三年合计 |
| Hardware | 收入/成本/利润率 | 续期数据 | 续期数据 | 三年合计 |
| Services | 收入/成本/利润率 | 续期数据 | 续期数据 | 三年合计 |
| Reimbursement | 收入/成本/利润率 | — | — | 合计 |
| **GRAND TOTAL** | **年度合计** | **年度合计** | **年度合计** | **总计** |

每个单元格显示该类别在该年度的收入、成本和利润率（颜色编码：绿色=健康）。

### 4.3 元数据字段

详情页面底部显示：
- **Entity**：公司实体代码（如 SMMY）
- **Deal Category**：交易类别（如 ADSS）

### 4.4 权限设置

详情页面底部有 "Permissions" 标签：

| 权限类型 | 默认值 |
|----------|--------|
| Readers | "No one can read except the author and related personnel" |
| Editors | "Administrator" |
| Attachment Download | 仅限作者和相关人员 |

---

## 5. P&L 审批流程

### 5.1 右侧审批面板

P&L 创建页面右侧显示 "Process Approvals" 面板：

![P&L 流程审批侧边栏](../../assets/pl-approval-001.png)

| 元素 | 说明 |
|------|------|
| Track 下拉框 | 选择审批跟踪视图 |
| Input Processing Comments | 审批备注输入框 |
| Common Comments | 快捷插入常用备注 |
| Upload attachment | 上传审批附件 |
| Signature Preview | 数字签名预览（显示签名图片） |
| Submit | 大型蓝色提交按钮 |
| Expand approval options | 展开更多审批选项 |

### 5.2 审批工作流

P&L 审批遵循以下逻辑：

```
提交 P&L → 系统比较 Margin vs Target
    ├─ 任何行项目 margin < 目标 → 路由至部门负责人（HOD）审批
    ├─ 包含任何 Key Product → 路由至 HOD
    ├─ 整单总 margin < 目标 → 路由至财务团队
    └─ 所有条件满足 → 自动审批通过
```

### 5.3 多人协作（审批前）

提交审批之前，P&L 支持**多用户协作**：

![P&L 创建 - 协作选项](../../assets/pl-collaborate-001.png)

1. **发起人创建 P&L** → 填写表单数据
2. **在流程审批侧边栏选择"协作"**（而非"提交"）
   - 操作单选按钮：`提交` | `协作`（选中）
   - 说明：*"提交协作后，表单修改权限将转移给接收方。接收方提交回后，您可以编辑表单并将工作流提交到下一步。"*
3. **选择接收方** → 打开 EasyCraft 用户选择器弹窗
   ![用户选择器弹窗](../../assets/pl-collaborate-002.png)
   - 标签页：最近联系 / 行政组织 / 群组
   - 支持模糊关键词搜索
   - 选择用户 → 确认
4. **表单权限转移给接收方**
   - 接收方在消息中心收到待办事项
   ![消息中心待办](../../assets/pl-collaborate-003.png)
5. **接收方打开 P&L → 点击编辑**（右上角铅笔图标）
   ![P&L 详情 - 编辑按钮](../../assets/pl-details-001.png)
   - 可修改任何字段，添加/移除行项目
6. **接收方提交回** → 权限返回给发起人
7. **发起人可以**：
   - 指派给另一个协作者（重复循环）
   - 点击 **"提交"** 进入审批工作流
   ![P&L 详情 - 提交操作](../../assets/pl-details-002.png)

> 💡 **关键点**：协作与审批是分开的——协作期间不触发 HOD/财务路由。只有发起人可以提交正式审批。

### 5.4 状态流转

| 操作 | 状态 |
|------|------|
| Save | 草稿（Draft） |
| Submit | 待审批（Pending Approval） |
| Revoke | 已撤回（Revoked） |
| Approved | 已批准 |
| Rejected | 已驳回（需修改后重新提交） |

---

## 6. 常见问题与注意事项

### 6.1 多年度合同（续期产品）

- 硬件产品可以跨越多个年度（Year 1 / Year 2 RENEW / Year 3 RENEW）
- 续期产品在 "Hardware Renew" 标签页管理
- 使用 "Renew" 操作从现有产品创建续期行

### 6.2 全局折扣

- 启用全局折扣后，所有产品行自动继承折扣
- 未启用时，需要在每个产品行单独设置折扣
- 折扣在 Price 列中自动计算：`净价 = 单价 × (1 + Markup) × (1 - Discount)`

### 6.3 权限控制

- 默认情况下，只有作者和相关人员可以查看 P&L
- 编辑权限仅限 Administrator
- 附件下载仅限作者和相关人员

---

> **文档结束** | 版本 V1.1 | 2026-06-15
