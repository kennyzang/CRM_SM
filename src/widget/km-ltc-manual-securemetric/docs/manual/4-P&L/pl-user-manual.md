# P&L 新建操作 — 用户手册 / P&L Creation — User Manual

> 生成时间 / Generated: 2026/5/22 10:34:58
> 操作账号 / Account: Edward
> 环境 / Environment: http://172.18.114.231:8088

---

## Step 1：进入 P&L 新建页面 / Open P&L New Page

**中文说明：** 点击"新建"进入 P&L 利润表新建页面。页面顶部为基本信息区域，底部为产品明细区域（Tabs）。

**English：** Click "New" to open the P&L creation page. The top section contains basic information; the bottom section shows product detail tabs.

![Open P&L New Page](screenshots/01-new-pl-page.png)

---

## Step 2：选择关联商机 / Select Linked Opportunity

**中文说明：** 在"关联商机"字段中搜索并选择对应的商机记录。商机选定后，页面下方 P&L 产品区域开始渲染。

**English：** Search and select an opportunity in the "Opportunity" field. Once selected, the P&L product section below starts rendering.

![Select Linked Opportunity](screenshots/02-opportunity-selected.png)

---

## Step 3：第1次添加产品 — 产品选择弹窗 / Add Products (Batch 1) — Product Selector Dialog

**中文说明：** 点击 "3rd Party Hardware" 区域的 "+ Add Products"，弹出产品选择弹窗。勾选前2个产品，点击确认添加。

**English：** Click "+ Add Products" in the 3rd Party Hardware section. A product selector dialog appears. Select the first 2 products and confirm.

![Add Products (Batch 1) — Product Selector Dialog](screenshots/04a-selector-first-selection.png)

---

## Step 4：第2次添加产品 — 弹窗中显示已选产品标记 / Add Products (Batch 2) — Previously Selected Products Marked

**中文说明：** 再次打开产品选择弹窗，前2个已添加的产品显示为**已选**状态（灰色/禁用）。选择第3个产品并确认，Hardware 共添加 3 个产品。

**English：** Open the selector again. The first 2 already-added products appear as **disabled/selected**. Select the 3rd product and confirm. Hardware now has 3 products.

![Add Products (Batch 2) — Previously Selected Products Marked](screenshots/05-selector-already-selected.png)

---

## Step 5：全局折扣 10% 开启 + 产品 Drawer 设置加价率 20% / Global Discount 10% ON + Set Markup 20% in Product Drawer

**中文说明：** 开启 **Global Discount**（全局折扣），并设置折扣率为 **10%**。全局折扣开启后，DISC 列统一显示全局折扣值，产品 Drawer 内的单行折扣字段**不可编辑**。

点击产品行打开 Drawer，在 **Markup** 字段输入 `20`（代表 20%）。加价率计算公式：`单价 = 目录价 × (1 + 加价率)`。点击 Save 后，MARKUP 列显示 20.00%。

**English：** Enable **Global Discount** and set it to **10%**. Once enabled, the DISC column shows the global discount for all rows, and the per-row discount field inside the Product Drawer is **read-only** (not editable).

Click a product row to open the Drawer. Enter `20` in the **Markup** field (20%). Formula: `Unit Price = List Price × (1 + Markup Rate)`. After saving, the MARKUP column shows 20.00%.

![Global Discount 10% ON + Set Markup 20% in Product Drawer](screenshots/08-drawer-markup-filled.png)

---

## Step 6：续费：将产品复制到 Hardware Renew 页签 / Renew: Copy Products to Hardware Renew Tab

**中文说明：** 点击产品行操作区的 **Renew** 按钮，将产品复制到 Hardware Renew 页签（Year 2）。切换到 "Hardware Renew" 页签后，可以看到续费产品列表。

**English：** Click the **Renew** button in the product row actions. This copies the product to the Hardware Renew tab (Year 2). Switch to "Hardware Renew" to see the renewal product list.

![Renew: Copy Products to Hardware Renew Tab](screenshots/10-hardware-renew-tab.png)

---

## Step 7：续费 Tab：点击 Copy 两次生成多年续费 / Renew Tab: Click Copy Twice to Generate Multi-Year Renewals

**中文说明：** 在 Hardware Renew 页签中，点击同一产品行的 **Copy** 按钮两次：第1次生成 Year 3，第2次生成 Year 4。Overview 页签将自动汇总各年度金额对比。

**English：** In the Hardware Renew tab, click **Copy** on the same row twice:
- 1st click → generates Year 3 row
- 2nd click → generates Year 4 row

The Overview tab automatically aggregates the multi-year totals.

![Renew Tab: Click Copy Twice to Generate Multi-Year Renewals](screenshots/11-renew-copied-twice.png)

---

## Step 8：Service 页签：添加服务产品 / Service Tab: Add a Service Product

**中文说明：** 切换到 "Service" 页签，点击 "+ Add Products" 添加1个服务产品。注意：Service 页签无"加价率（Markup）"字段；数量字段显示为 **Man Day**（人天数）。

**English：** Switch to the "Service" tab and click "+ Add Products" to add 1 service product. Note: The Service tab has no Markup field; the quantity field is displayed as **Man Day**.

![Service Tab: Add a Service Product](screenshots/12-service-products-added.png)

---

## Step 9：关闭全局折扣，启用单行折扣模式 / Disable Global Discount, Enable Per-Row Discount

**中文说明：** 点击 Global Discount **Switch** 将全局折扣关闭。关闭后，产品 Drawer 内的单行折扣输入框重新可见，可为每个产品单独设置折扣率。

**English：** Click the Global Discount **Switch** to turn it off. Once disabled, the per-row Discount input in the Product Drawer becomes visible again, allowing individual discount rates per product.

![Disable Global Discount, Enable Per-Row Discount](screenshots/13-global-discount-off.png)

---

## Step 10：单行折扣 Drawer：填写 Activity 并设置折扣率 20% / Per-Row Discount Drawer: Fill Activity & Set Discount to 20%

**中文说明：** 点击产品行打开 Drawer。在 **Activity** 字段填入负责人姓名（`Ahmad Razif bin Kamaruddin`）；在 **Discount** 字段输入 `20`（代表 20%）。单行折扣计算公式：`单价 = 目录价 × (1 - 折扣率)`。

**English：** Click the product row to open the Drawer. Enter the assignee name (`Ahmad Razif bin Kamaruddin`) in the **Activity** field. Enter `20` in the **Discount** field (20%). Formula: `Unit Price = List Price × (1 - Discount Rate)`.

![Per-Row Discount Drawer: Fill Activity & Set Discount to 20%](screenshots/14-drawer-discount-filled.png)

---

## Step 11：对比演示：重新开启全局折扣 / Demo: Re-enable Global Discount

**中文说明：** 再次点击 Switch 开启全局折扣，展示两种折扣模式的差异：全局折扣统一作用于页签所有产品，单行折扣针对单个产品灵活设置。

**English：** Click the Switch again to re-enable Global Discount. This demonstrates the two discount modes:
- **Global Discount**: applies uniformly to all products in the tab
- **Per-Row Discount**: set individually per product (available when Global Discount is OFF)

![Demo: Re-enable Global Discount](screenshots/15-global-discount-back-on.png)

---

## Step 12：切换到 Reimbursement 页签 / Switch to Reimbursement Tab

**中文说明：** 点击 "Reimbursement" 标签，进入报销页签。该页签包含 SM Team 和 3rd Party Team 两个子表，用于记录差旅、住宿等报销费用，无折扣/加价率字段。

**English：** Click the "Reimbursement" tab. It contains SM Team and 3rd Party Team sub-tables for logging reimbursable expenses (travel, accommodation, etc.). No discount or markup fields apply here.

![Switch to Reimbursement Tab](screenshots/16-reimb-tab.png)

---

## Step 13：Reimbursement：SM Team 新增一行 / Reimbursement: Add a Row to SM Team

**中文说明：** 点击 SM Team 区域的 "+ Add Row" 按钮，新增一行报销记录：
- **Activity**: Travel & Accommodation
- **Rate/Day**: 500 / **Days**: 2
- **Cost Rate/Day**: 350 / **Days (Cost)**: 2

**English：** Click "+ Add Row" in the SM Team section to add a reimbursement entry:
- **Activity**: Travel & Accommodation
- **Note**: Customer site visit
- **Rate/Day**: 500, **Days**: 2
- **Cost Rate/Day**: 350, **Days (Cost)**: 2

![Reimbursement: Add a Row to SM Team](screenshots/17-reimb-row-added.png)

---

## Step 14：切换到 Others 页签 / Switch to Others Tab

**中文说明：** 点击 "Others" 标签，进入其他费用页签。用于记录不属于产品/服务/报销的杂项费用。

**English：** Click the "Others" tab for miscellaneous costs that do not fall under products, services, or reimbursements.

![Switch to Others Tab](screenshots/18-others-tab.png)

---

## Step 15：Others：新增一行其他费用 / Others: Add a Miscellaneous Cost Row

**中文说明：** 点击 "+ Add Row" 按钮，新增一行：
- **Description**: Freight & Customs Clearance
- **Unit Price**: 1200 / **Qty**: 1 / **Cost/Unit**: 900

**English：** Click "+ Add Row" to add a misc cost entry:
- **Description**: Freight & Customs Clearance
- **Note**: Import duty for hardware shipment
- **Unit Price**: 1200, **Qty**: 1, **Cost/Unit**: 900

![Others: Add a Miscellaneous Cost Row](screenshots/19-others-row-added.png)

---

## Step 16：点击保存 / Save the P&L Record

**中文说明：** 点击页面右上角 **Save** 按钮，表单提交成功。系统跳转到 P&L 详情页。

**English：** Click the **Save** button in the top-right corner. The form is submitted successfully and the system redirects to the P&L detail page.

![Save the P&L Record](screenshots/20-saved.png)

---
