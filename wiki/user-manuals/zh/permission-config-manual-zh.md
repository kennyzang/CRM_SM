# CRM 权限配置指南

> 适用对象：企业 CRM 系统管理员  
> 帮助您为公司不同岗位的员工快速完成权限配置

---

## 一、配置入口

### 角色权限管理

进入路径：**Permission Mgt（权限管理）→ Role Permission（角色权限）**

直链：`http://[系统域名]/web/#/manage/sys-right/sysRightGroup/list`

此页面列出了系统中所有已创建的角色。每个角色定义了一组权限，员工被分配到角色后，即获得该角色对应的所有权限。

---

## 二、权限配置基础概念

在 CRM 中，给员工配置权限分两步走：

```
第一步：创建或编辑角色
  → 定义这个角色能做哪些操作（勾选权限项）

第二步：将角色分配给用户/组织
  → 角色编辑页 → Role users → 添加对应的人员或组织
```

> **重要**：角色的权限范围决定"员工能点哪些按钮"，但**能看到哪些数据记录**还需另行配置（见第四章）。

---

## 三、如何创建和编辑角色

### 3.1 新建角色

1. 进入 Permission Mgt → Role Permission
2. 点击右上角 **Create（新建）**
3. 填写：
   - **Role Name**：角色名称（如"销售专员"）
   - **Role users**：将此角色分配给哪些用户或组织（可多选）
   - **Role Permission**：在权限树中勾选该角色需要的权限项
4. 点击 **Save** 保存

### 3.2 编辑已有角色

1. 找到目标角色，点击行末 **Edit**
2. 在权限树中增减勾选项
3. 点击 **Save** 保存

> **提示**：权限树中可通过顶部搜索框快速定位权限项，输入关键词（如 "Lead"、"Customer"）筛选。

---

## 四、系统现有角色说明

系统中已预置 8 个业务角色（+ 1 个系统管理员角色），可直接在此基础上调整：

| 角色名称 | 已分配组织 | 定位 |
|---------|-----------|------|
| **Account Manager** | SMMY、SCMY、MSMY 等 9 个组织 | 客户经理，权限最完整的业务角色 |
| **Presales** | 未分配 | 售前人员，主要关注商机和竞品 |
| **Marketing** | 未分配 | 市场专员，负责线索导入和管理 |
| **Finance Team** | 未分配 | 财务，主要查看财务相关数据 |
| **Operation Team** | 未分配 | 运营，查看订单和合同 |
| **Project Management** | 未分配 | 项目经理，可操作 SO/合同/收款 |
| **Customer Support** | 未分配 | 客服，查看客户和合同状态 |
| **Sales Administrator** | 未分配 | 待配置，目前无任何权限 |
| **seradmin** | seradmin、Affendi、Soo、Wo | 系统管理员，全量权限 |

---

## 五、各角色 CRM 权限详情

### 5.1 Account Manager（客户经理）— 最完整的业务角色

**已分配组织**：SMMY、SCMY、MSMY、PTSM、PTSK、SMPH、SMVN、Signing Cloud、Securemetric

**线索模块权限：**

| 权限项 | 说明 |
|--------|------|
| Sales Lead_View List | 查看线索列表 |
| Sales Lead-Create | 新建线索 |
| Sales Lead-Claim | 从线索池领取线索 |
| Sales Lead-Assign | 分配线索给他人 |
| Sales Lead-Return | 退回线索到线索池 |
| Sales Lead-Transfer | 转移线索到其他队列 |
| Sales Lead-Convertion | 转换线索 |
| Sales Lead-Change Owner | 变更线索负责人 |
| Sales Lead-Follow up | 跟进线索（⚠️ 仅负责人可见按钮） |
| Sales Lead-Merge | 归集线索（⚠️ 仅负责人可见按钮） |
| Sales Lead_Invalid | 标记无效（⚠️ 仅负责人/池管理员） |
| Sales Lead_Pushing Stage | 推进阶段（⚠️ 仅负责人可见按钮） |
| Sales Lead_Stage Pusher | 线索推进器配置 |
| Sales Lead-Print | 打印线索 |

**客户与商机权限：**

| 权限项 | 说明 |
|--------|------|
| Customer_Create | 新建客户 |
| Customer_View | 查看客户列表 |
| Customer_Claim | 从公海领取客户 |
| Customer_Return | 退回客户到公海 |
| Customer_Change Owner | 变更客户负责人 |
| Customer_Print | 打印客户信息 |
| Account Info_Create | 新建账户信息 |
| Contact_Create | 新建联系人 |
| Contact_View（通过 Contact_Create 隐含） | 查看联系人 |
| Contact_Change Owner | 变更联系人负责人 |
| Contact_Print | 打印联系人 |
| Opportunity_Create | 新建商机 |
| Opportunity_View（通过创建隐含） | 查看商机 |
| Opportunity_Stage Advance | 推进/回退商机阶段 |
| Opportunity_Change Owner | 变更商机负责人 |
| Quote_Create | 新建报价单 |
| P&L_Create | 新建 P&L 损益表 |
| Sales Record_Create | 新建销售记录（活动日志） |
| Joint Follow-up_Create | 新建联合跟进 |

**订单与财务权限：**

| 权限项 | 说明 |
|--------|------|
| Create Contract | 新建合同 |
| Create SO | 新建销售订单 |
| Create Repayment Schedule | 新建还款计划 |
| Create Repayment | 新建收款记录 |
| Create Repayment Detail | 新建收款明细 |
| Create Billing REQ | 新建开票申请 |
| PO_Create | 新建采购订单 |
| Delivery Order_Create | 新建发货单 |

**基础数据权限：**

| 权限项 | 说明 |
|--------|------|
| Company - Check | 查看公司 |
| Company Account - Check | 查看公司账户 |
| Product - New | 新建产品 |
| Tax Rate - Check | 查看税率 |
| Related Team - Add Member | 向服务团队添加成员 |
| Related Team - Delete Member | 从服务团队删除成员 |
| Stage Booster Example - New/Check | 新建/查看阶段推进示例 |

**竞品权限：**

| 权限项 | 说明 |
|--------|------|
| Competitor_Create | 新建竞争对手 |
| Competitive Product_Create | 新建竞品 |
| Competitive Analysis_Create | 新建竞品分析 |

---

### 5.2 Marketing（市场专员）

**定位**：负责线索来源管理和市场活动，不涉及客户销售流程。

| 权限项 | 说明 |
|--------|------|
| Sales Lead_View List | 查看线索列表 |
| Sales Lead-Create | 新建线索 |
| Sales Lead-Import | **批量导入线索**（核心权限） |
| Lead Queue_View | 查看线索池 |
| Customer_View | 查看客户（只读） |
| Contact_View | 查看联系人（只读） |
| Opportunity_View | 查看商机（只读） |
| Task_Create / Task_View | 创建和查看任务 |

> **注意**：Marketing 角色目前未分配组织，需在 Edit 页面的 **Role users** 中添加市场部门。

---

### 5.3 Presales（售前）

**定位**：关注商机推进、竞品分析、P&L 测算。

| 权限项 | 说明 |
|--------|------|
| Sales Lead_View List | 查看线索（只读） |
| Customer_View | 查看客户（只读） |
| Opportunity_View | 查看商机（只读） |
| Opportunity Closure Req_View | 查看结案申请 |
| Public Pool_View | 查看公海 |
| Sales Record_View | 查看销售记录 |
| P&L_Create | 新建 P&L 损益表 |
| Competitor_Create | 新建竞争对手 |
| Competitive Product_Create | 新建竞品 |
| Competitive Analysis_Create | 新建竞品分析 |
| Task_Create / Task_View | 创建和查看任务 |

---

### 5.4 Finance Team（财务）

**定位**：查看业务数据，维护财务基础配置。

**只读类（查看）：**

| 权限项 | 说明 |
|--------|------|
| Sales Lead_View List | 查看线索列表 |
| Lead Queue_View | 查看线索池 |
| Customer_View | 查看客户 |
| Opportunity_View | 查看商机 |
| Contact_View | 查看联系人 |
| Quote_View | 查看报价单 |
| Sales Record_View | 查看销售记录 |
| Public Pool_View | 查看公海 |
| Customer Name Change_View | 查看改名申请 |
| Customer Churn_View | 查看流失申请 |
| Joint Follow-up_View | 查看联合跟进 |
| Opportunity Closure Req_View | 查看结案申请 |

**维护类（可操作）：**

| 权限项 | 说明 |
|--------|------|
| Company - New | 新建公司 |
| Company Account - New / Data Maintenance | 新建和维护公司账户 |
| Tax Rate - New / Data Maintenance | 新建和维护税率 |

> **说明**：Finance Team 没有开票、收款等 SO & PAYMENT 模块的操作权限，若需要，可在 Edit 页面追加 `Create Billing REQ`、`Create Repayment` 等权限。

---

### 5.5 Operation Team（运营）

**定位**：查看订单执行情况，负责发货。

| 权限项 | 说明 |
|--------|------|
| Customer_View | 查看客户 |
| SO Enquiry | 查看销售订单 |
| Contract Enquiry | 查看合同 |
| Billing Request Enquiry | 查看开票申请 |
| Billing Detail Enquiry | 查看开票明细 |
| Repayment Schedule Enquiry | 查看还款计划 |
| Product Enquiry | 查看产品 |
| Company - Check | 查看公司 |
| Company Account - Check | 查看公司账户 |
| **Delivery Order_Create** | **新建发货单**（核心操作权限） |

---

### 5.6 Project Management（项目经理）

**定位**：管理合同执行、收款和订单。

| 权限项 | 说明 |
|--------|------|
| Customer_View | 查看客户 |
| Opportunity_View | 查看商机 |
| Quote_View | 查看报价单 |
| Sales Record_View | 查看销售记录 |
| SO Enquiry / SO_Data Maintenance | 查看和维护销售订单 |
| Contract Enquiry / Contract_Data Maintenance | 查看和维护合同 |
| Repayment Enquiry / Repayment Schedule Enquiry | 查看收款记录和还款计划 |
| Repayment Sch_Data Maintenance | 维护还款计划 |
| Repayment Detail Enquiry | 查看收款明细 |
| Billing Request Enquiry / Billing Detail Enquiry | 查看开票 |
| PO_Create / PO_Maintain All Data | 新建和维护采购订单 |
| Payment Plan_Default Access | 付款计划默认权限 |
| Task_Create / Task_View | 创建和查看任务 |

---

### 5.7 Customer Support（客服）

**定位**：处理客户问题，查看合同和订单状态。

| 权限项 | 说明 |
|--------|------|
| Customer_View | 查看客户 |
| Sales Record_View | 查看销售记录 |
| SO Enquiry | 查看销售订单 |
| Contract Enquiry | 查看合同 |
| Repayment Enquiry | 查看收款 |
| Repayment Schedule Enquiry | 查看还款计划 |
| Billing Request Enquiry / Billing Detail Enquiry | 查看开票 |
| Product Enquiry | 查看产品 |
| Task_Create / Task_View | 创建和查看任务 |

---

### 5.8 Sales Administrator（销售管理员）

**当前状态：未配置任何权限**

此角色为空，需要根据企业实际需求配置。建议参考 Account Manager 的权限，并追加以下管理类权限：

| 建议追加的权限 | 说明 |
|-------------|------|
| Sales Lead-Export | 导出线索数据 |
| Customer_Export | 导出客户数据 |
| Sales Lead-Reclaim | 收回已分配线索 |
| Customer_Reclaim | 收回已分配客户 |
| Customer_Assign | 分配客户 |
| Sales Lead_View List（所有数据范围） | 查看全部线索 |
| Customer Business Rule Mgmt | 配置客户业务规则 |
| Lead Rules | 配置线索业务规则 |
| Lead Queue_Maintain All Data | 维护线索池配置 |

---

## 六、常见配置场景

### 场景一：新员工入职，作为销售人员

1. 进入 Permission Mgt → Role Permission
2. 找到 **Account Manager** 角色，点击 **Edit**
3. 在 **Role users** 中，点击 ➕ 添加该员工（或其所在组织）
4. 点击 **Save**

员工立即获得 Account Manager 角色的所有权限。

---

### 场景二：需要一个只能查看数据的只读角色

1. 点击 **Create** 新建角色
2. 角色名称填写"数据分析师"或"只读访客"
3. 在权限树中，仅勾选 `*_View`、`*_Enquiry`、`*_Check` 类权限
4. 保存后分配给对应人员

---

### 场景三：财务需要处理开票和收款

当前 Finance Team 角色**没有**开票和收款的操作权限。操作步骤：

1. 找到 **Finance Team** 角色，点击 **Edit**
2. 在权限树搜索框输入 `Billing`，勾选：
   - `Create Billing REQ`（新建开票申请）
   - `Billing REQ_Data Maintenance`（维护开票申请）
3. 搜索 `Repayment`，勾选：
   - `Create Repayment`（新建收款记录）
   - `Repayment_Data Maintenance`（维护收款记录）
4. 点击 **Save**

---

### 场景四：销售人员反映"按钮点不了"

按以下顺序排查：

**第一步：确认角色有该操作的权限**
进入该员工的角色（Edit 页面），搜索对应操作名，确认已勾选。

**第二步：确认员工能看到这条记录**
如果员工在列表里看不到该记录，详情页自然也进不去。

**第三步：确认是否受"负责人限制"**
以下按钮即使有角色权限，也只对记录的负责人显示：

| 按钮 | 限制 |
|------|------|
| 线索 — Follow up（跟进） | 仅负责人 |
| 线索 — Push Stage（推进阶段） | 仅负责人 |
| 线索 — Invalid（无效） | 仅负责人或线索池管理员 |
| 线索 — Merge/Aggregate（归集） | 仅负责人 |
| 客户 — Transfer（转移） | 仅负责人或公海管理员 |
| 市场活动 — Status Change | 仅负责人 |

如业务需要让非负责人也能操作，请联系平台技术支持，在操作配置中取消负责人限制。

---

## 七、数据可见范围配置（进阶）

角色权限决定"能点哪些按钮"，但"能看到哪些记录"由**数据范围**控制。

配置入口：管理后台 sys-modeling → 对应模块（如 LEAD MGT）→ **Permissions** 标签

### 常见数据范围配置方式

| 效果 | 配置方式 |
|------|---------|
| 员工只看自己负责的记录 | Readers → Other readers → Form fields 填 `Owner`（负责人） |
| 主管看到下属所有记录 | Readers → Formula Definition 填"递归查找多级部门领导"公式 |
| 管理员看到全部 | Readers → Default reader → 通过角色权限设置为"查看全部" |
| 线索池成员看到待领取线索 | Readers → Formula Definition → 公式判断状态=待领取时返回池成员 |

### 线索模块特殊说明

线索数据可见性由以下规则自动叠加判断，**管理员无需额外配置**即可生效：

| 哪些人自动可见 | 触发条件 |
|-------------|---------|
| 线索池管理员 | 该线索归属于该管理员管理的线索池 |
| 线索池全体成员 | 线索处于"待领取"状态（无负责人）且线索池开启"成员可见" |
| 负责人的所有上级领导 | 有负责人时自动向上追溯（最多 9 级） |
| 关联客户的负责人 | 需在客户业务规则中开启"关联跟进可见" |

---

## 附录：权限项速查索引

### A. 线索（Lead）相关权限

| 权限名称 | 作用 |
|---------|------|
| Sales Lead_View List | 查看线索列表 |
| Sales Lead-Create | 新建线索 |
| Sales Lead-Import | 批量导入 |
| Sales Lead-Export | 导出数据 |
| Sales Lead-Print | 打印 |
| Sales Lead-Claim | 领取线索 |
| Sales Lead-Assign | 分配线索 |
| Sales Lead-Return | 退回线索池 |
| Sales Lead-Reclaim | 收回线索 |
| Sales Lead-Transfer | 转移到其他队列 |
| Sales Lead-Change Owner | 变更负责人 |
| Sales Lead-Convertion | 转换线索 |
| Sales Lead-Follow up | 跟进（负责人限制） |
| Sales Lead-Merge | 归集（负责人限制） |
| Sales Lead_Invalid | 无效（负责人/池管理员） |
| Sales Lead_Pushing Stage | 推进阶段（负责人限制） |
| Sales Lead-Maintain All Data | 编辑/删除所有线索 |
| Lead Queue_View | 查看线索池 |
| Lead Queue_Create | 新建线索池 |
| Lead Queue_Maintain All Data | 维护线索池 |
| Lead Rules | 线索业务规则配置 |

### B. 客户（Customer）相关权限

| 权限名称 | 作用 |
|---------|------|
| Customer_View | 查看客户列表 |
| Customer_Create | 新建客户 |
| Customer_Import / Export / Print | 导入/导出/打印 |
| Customer_Claim | 从公海领取 |
| Customer_Assign | 分配 |
| Customer_Return | 退回公海 |
| Customer_Reclaim | 收回 |
| Customer_Transfer | 转移（负责人/公海管理员） |
| Customer_Change Owner | 变更负责人 |
| Customer_Merge | 合并客户 |
| Customer_Maintain All Data | 编辑/删除所有客户 |
| Customer Business Rule Mgmt | 业务规则配置 |
| Public Pool_View / Create / Maintain | 公海查看/新建/维护 |

### C. 商机/联系人/报价单权限

| 权限名称 | 作用 |
|---------|------|
| Opportunity_View / Create / Maintain All Data | 商机查看/新建/维护 |
| Opportunity_Change Owner | 变更商机负责人 |
| Opportunity_Stage Advance | 推进商机阶段 |
| Contact_View / Create / Maintain All Data | 联系人查看/新建/维护 |
| Contact_Change Owner | 变更联系人负责人 |
| Quote_View / Create / Maintain All Data | 报价单查看/新建/维护 |
| Sales Record_View / Create / Maintain All Data | 销售记录查看/新建/维护 |
| P&L_Create | 新建损益表 |

### D. 订单与收款权限

| 权限名称 | 作用 |
|---------|------|
| Contract Enquiry / Create / Maintain | 合同查看/新建/维护 |
| SO Enquiry / Create SO / SO_Data Maintenance | 销售订单查看/新建/维护 |
| Billing Request Enquiry / Create / Maintain | 开票申请查看/新建/维护 |
| Repayment Enquiry / Create / Maintain | 收款查看/新建/维护 |
| Repayment Schedule Enquiry / Create / Maintain | 还款计划查看/新建/维护 |
| PO_Create / Maintain | 采购订单新建/维护 |
| Delivery Order_Create | 新建发货单 |
| Invoice Return Enquiry / Maintain | 退票申请查看/维护 |

### E. 基础数据权限

| 权限名称 | 作用 |
|---------|------|
| Product - Check / New / Maintenance / On&Off Sale | 产品查看/新建/维护/上下架 |
| Company - Check / New / Maintenance | 公司查看/新建/维护 |
| Company Account - Check / New / Maintenance | 公司账户查看/新建/维护 |
| Tax Rate - Check / New / Maintenance | 税率查看/新建/维护 |
| Related Team - Check / New / Maintenance | 服务团队查看/新建/维护 |
| Related Team - Add Member / Delete Member | 服务团队成员管理 |
| Business Stage - Check / New / Maintenance | 业务阶段查看/新建/维护 |
| Stage Management - Check / New / Maintenance | 阶段管理查看/新建/维护 |
