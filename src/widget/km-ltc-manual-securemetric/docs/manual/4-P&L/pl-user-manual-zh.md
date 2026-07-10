# P&L 新建操作 — 用户手册

> 生成时间：2026/5/22 10:34:58
> 操作账号：Edward
> 环境：http://172.18.114.231:8088

---

## 第 1 步：进入 P&L 新建页面

点击"新建"进入 P&L 利润表新建页面。页面顶部为基本信息区域，底部为产品明细区域（Tabs）。

![进入 P&L 新建页面](screenshots/01-new-pl-page.png)

---

## 第 2 步：选择关联商机

在"关联商机"字段中搜索并选择对应的商机记录。商机选定后，页面下方 P&L 产品区域开始渲染。

![选择关联商机](screenshots/02-opportunity-selected.png)

---

## 第 3 步：第1次添加产品 — 产品选择弹窗

点击 "3rd Party Hardware" 区域的 "+ Add Products"，弹出产品选择弹窗。勾选前2个产品，点击确认添加。

![第1次添加产品 — 产品选择弹窗](screenshots/04a-selector-first-selection.png)

---

## 第 4 步：第2次添加产品 — 弹窗中显示已选产品标记

再次打开产品选择弹窗，前2个已添加的产品显示为**已选**状态（灰色/禁用）。选择第3个产品并确认，Hardware 共添加 3 个产品。

![第2次添加产品 — 弹窗中显示已选产品标记](screenshots/05-selector-already-selected.png)

---

## 第 5 步：全局折扣 10% 开启 + 产品 Drawer 设置加价率 20%

开启 **Global Discount**（全局折扣），并设置折扣率为 **10%**。全局折扣开启后，DISC 列统一显示全局折扣值，产品 Drawer 内的单行折扣字段**不可编辑**。

点击产品行打开 Drawer，在 **Markup** 字段输入 `20`（代表 20%）。加价率计算公式：`单价 = 目录价 × (1 + 加价率)`。点击 Save 后，MARKUP 列显示 20.00%。

![全局折扣 10% 开启 + 产品 Drawer 设置加价率 20%](screenshots/08-drawer-markup-filled.png)

---

## 第 6 步：续费：将产品复制到 Hardware Renew 页签

点击产品行操作区的 **Renew** 按钮，将产品复制到 Hardware Renew 页签（Year 2）。切换到 "Hardware Renew" 页签后，可以看到续费产品列表。

![续费：将产品复制到 Hardware Renew 页签](screenshots/10-hardware-renew-tab.png)

---

## 第 7 步：续费 Tab：点击 Copy 两次生成多年续费

在 Hardware Renew 页签中，点击同一产品行的 **Copy** 按钮两次：第1次生成 Year 3，第2次生成 Year 4。Overview 页签将自动汇总各年度金额对比。

![续费 Tab：点击 Copy 两次生成多年续费](screenshots/11-renew-copied-twice.png)

---

## 第 8 步：Service 页签：添加服务产品

切换到 "Service" 页签，点击 "+ Add Products" 添加1个服务产品。注意：Service 页签无"加价率（Markup）"字段；数量字段显示为 **Man Day**（人天数）。

![Service 页签：添加服务产品](screenshots/12-service-products-added.png)

---

## 第 9 步：关闭全局折扣，启用单行折扣模式

点击 Global Discount **Switch** 将全局折扣关闭。关闭后，产品 Drawer 内的单行折扣输入框重新可见，可为每个产品单独设置折扣率。

![关闭全局折扣，启用单行折扣模式](screenshots/13-global-discount-off.png)

---

## 第 10 步：单行折扣 Drawer：填写 Activity 并设置折扣率 20%

点击产品行打开 Drawer。在 **Activity** 字段填入负责人姓名（`Ahmad Razif bin Kamaruddin`）；在 **Discount** 字段输入 `20`（代表 20%）。单行折扣计算公式：`单价 = 目录价 × (1 - 折扣率)`。

![单行折扣 Drawer：填写 Activity 并设置折扣率 20%](screenshots/14-drawer-discount-filled.png)

---

## 第 11 步：对比演示：重新开启全局折扣

再次点击 Switch 开启全局折扣，展示两种折扣模式的差异：全局折扣统一作用于页签所有产品，单行折扣针对单个产品灵活设置。

![对比演示：重新开启全局折扣](screenshots/15-global-discount-back-on.png)

---

## 第 12 步：切换到 Reimbursement 页签

点击 "Reimbursement" 标签，进入报销页签。该页签包含 SM Team 和 3rd Party Team 两个子表，用于记录差旅、住宿等报销费用，无折扣/加价率字段。

![切换到 Reimbursement 页签](screenshots/16-reimb-tab.png)

---

## 第 13 步：Reimbursement：SM Team 新增一行

点击 SM Team 区域的 "+ Add Row" 按钮，新增一行报销记录：
- **Activity**: Travel & Accommodation
- **Rate/Day**: 500 / **Days**: 2
- **Cost Rate/Day**: 350 / **Days (Cost)**: 2

![Reimbursement：SM Team 新增一行](screenshots/17-reimb-row-added.png)

---

## 第 14 步：切换到 Others 页签

点击 "Others" 标签，进入其他费用页签。用于记录不属于产品/服务/报销的杂项费用。

![切换到 Others 页签](screenshots/18-others-tab.png)

---

## 第 15 步：Others：新增一行其他费用

点击 "+ Add Row" 按钮，新增一行：
- **Description**: Freight & Customs Clearance
- **Unit Price**: 1200 / **Qty**: 1 / **Cost/Unit**: 900

![Others：新增一行其他费用](screenshots/19-others-row-added.png)

---

## 第 16 步：点击保存

点击页面右上角 **Save** 按钮，表单提交成功。系统跳转到 P&L 详情页。

![点击保存](screenshots/20-saved.png)

---
