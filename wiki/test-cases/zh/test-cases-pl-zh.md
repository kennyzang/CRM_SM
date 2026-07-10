---
title: P&L 测试用例（中文版）
created: 2026-05-27
updated: 2026-05-27
type: test-cases
tags: [pl, test-cases, zh]
sources: [oss/New P&L management.mp4, wiki/entities/cn/pl-cn.md]
related: [[pl]], [[opportunity]]
---

# P&L 模块测试用例

> **版本**: V1.0 | **日期**: 2026-05-27 | **模块**: P&L (Profit & Loss) | **总用例数**: 32

---

## 测试用例汇总

| 类别 | 用例数 | 状态 |
|------|--------|------|
| 创建与基本信息 | 6 | ✅ |
| 产品管理 | 8 | ✅ |
| 折扣与财务计算 | 5 | ✅ |
| 多年度管理 | 4 | ✅ |
| 审批流程 | 4 | ✅ |
| 详情与克隆 | 3 | ✅ |
| 权限控制 | 2 | ✅ |

---

## 1. 创建与基本信息（6 个用例）

### P&L-TC-001：从 Opportunity 创建 P&L

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | 1. 用户已登录 CRM 系统<br>2. 存在一个已创建的 Opportunity（如 "ABC Q3 Purchase"）<br>3. Opportunity 状态为 Qualifying 或更高 |
| **测试步骤** | 1. 导航到 Opportunity 详情页<br>2. 点击 "P&L" 标签<br>3. 点击 "Create" 按钮<br>4. 验证页面跳转到 P&L Create 页面<br>5. 验证 Customer 字段自动带入 Opportunity 关联的客户名称<br>6. 验证 Opportunity 字段已自动链接到当前商机 |
| **预期结果** | - P&L Create 页面成功打开<br>- Customer 字段显示正确的客户名称（如 "Elite Enterprise Solutions Sendirian Berhad"）<br>- Opportunity 字段显示 "ABC Q3 Purchase"<br>- Currency 默认显示 "MYR"<br>- Date 默认显示当天日期 |
| **测试数据** | Opportunity Code: BSOP202605260001 |

---

### P&L-TC-002：填写 P&L 基本信息

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | P&L Create 页面已打开 |
| **测试步骤** | 1. 验证 Version 字段显示 "Auto Generate"<br>2. 验证 Currency 字段可选择不同货币<br>3. 点击 Date 字段，选择其他日期<br>4. 验证 Opportunity 字段不可编辑（只读）<br>5. 验证 Customer 字段不可编辑（只读） |
| **预期结果** | - Version 为只读，显示 "Auto Generate"<br>- Currency 下拉框包含多种货币选项（至少包含 MYR）<br>- Date 可以选择其他日期<br>- Opportunity 和 Customer 为只读，无法修改 |

---

### P&L-TC-003：保存 P&L 草稿

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | P&L Create 页面已打开，基本信息已填写 |
| **测试步骤** | 1. 不添加任何产品<br>2. 点击右上角 "Save" 按钮<br>3. 等待保存完成<br>4. 验证出现成功提示 "Operation succeeded"<br>5. 验证页面跳转到 P&L Details 页面 |
| **预期结果** | - 保存成功，显示 "Operation succeeded" 提示<br>- 页面跳转到 P&L Details 页面<br>- P&L 状态为 Draft |

---

### P&L-TC-004：返回操作

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Create 页面已打开 |
| **测试步骤** | 1. 点击左上角 "Return" 按钮<br>2. 验证页面返回到 Opportunity 详情页 |
| **预期结果** | - 页面成功返回到 Opportunity 详情页<br>3. 未保存的草稿不会丢失（如果之前已保存） |

---

### P&L-TC-005：验证必填字段

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Create 页面已打开 |
| **测试步骤** | 1. 清空或修改 Opportunity 字段（如果可编辑）<br>2. 尝试保存 P&L<br>3. 验证系统显示必填字段验证错误 |
| **预期结果** | - 必填字段（Opportunity、Currency、Date）有红色星号 (*) 标记<br>- 如果缺少必填字段，保存时显示验证错误提示<br>- 验证错误提示包含 "Form validation anomaly, total of N items" |

---

### P&L-TC-006：多货币支持

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Create 页面已打开 |
| **测试步骤** | 1. 点击 Currency 下拉框<br>2. 选择非 MYR 货币（如 USD、SGD）<br>3. 添加一个产品<br>4. 验证产品价格以选择的货币显示 |
| **预期结果** | - Currency 下拉框包含多种货币选项<br>- 产品价格以选择的货币显示<br>- 财务汇总卡片显示正确的货币符号 |

---

## 2. 产品管理（8 个用例）

### P&L-TC-007：添加软件产品

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | P&L Create 页面已打开 |
| **测试步骤** | 1. 点击 "Software" 标签<br>2. 点击 "+ Add Products" 按钮<br>3. 验证 "Select Software" 模态框打开<br>4. 在 Product Code 输入框输入搜索关键词<br>5. 在 Product Description 输入框输入搜索关键词<br>6. 从搜索结果中选择一个产品<br>7. 验证右侧 "Selected (N)" 面板更新<br>8. 点击 "Add N Products" 按钮<br>9. 验证产品添加到表格中 |
| **预期结果** | - "Select Software" 模态框成功打开<br>- 模态框包含 Product Code 和 Product Description 搜索过滤<br>- 左面板显示搜索结果<br>- 右面板 "Selected (N)" 显示已选数量<br>- "Add N Products" 按钮在未选择时禁用，选择后启用<br>- 产品成功添加到表格中，显示 CODE、PRODUCT、UNIT PRICE 等信息 |

---

### P&L-TC-008：添加硬件产品

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | P&L Create 页面已打开 |
| **测试步骤** | 1. 点击 "Hardware" 标签<br>2. 点击 "+ Add Products" 按钮<br>3. 在模态框中搜索并选择硬件产品<br>4. 点击 "Add N Products" 按钮<br>5. 验证产品添加到表格中<br>6. 验证 Hardware 标签徽章数字增加 |
| **预期结果** | - 硬件产品成功添加到表格中<br>- Hardware 标签徽章数字从 0 变为 1（或相应数量）<br>- 产品行显示所有列：CODE、PRODUCT、UNIT PRICE、MARKUP、DISC、PRICE、QTY、TOTAL PRICE、COST、PROFIT、MARGIN、TARGET |

---

### P&L-TC-009：编辑产品

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | P&L Create 页面已打开，至少添加了一个产品 |
| **测试步骤** | 1. 在产品行点击 "Edit" 链接<br>2. 验证右侧弹出编辑面板<br>3. 修改 Markup 值为 5.00%<br>4. 修改 Quantity 值为 2<br>5. 点击 "Save" 按钮<br>6. 验证表格中对应产品行的数据更新 |
| **预期结果** | - 编辑面板成功打开，显示产品类型、代码、价格设置等信息<br>- Markup 修改后，Price 列自动更新<br>- Quantity 修改后，Total Price 列自动更新（单价 × 数量）<br>- 保存后，表格数据实时更新 |

---

### P&L-TC-010：删除产品

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Create 页面已打开，至少添加了一个产品 |
| **测试步骤** | 1. 在产品行点击 "Delete" 链接<br>2. 验证产品行从表格中移除<br>3. 验证对应标签的徽章数字减少 |
| **预期结果** | - 产品行成功从表格中移除<br>- 标签徽章数字相应减少<br>- 财务汇总卡片自动重新计算 |

---

### P&L-TC-011：添加专业服务

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Create 页面已打开 |
| **测试步骤** | 1. 点击 "Services" 标签<br>2. 点击 "+ Add Products" 按钮<br>3. 在 "Add Service" 模态框中选择活动类型（如 "Senior Manager"）<br>4. 设置 Man Day 为 3<br>5. 验证 Price Breakdown 自动计算<br>6. 点击 "Save" 按钮<br>7. 验证服务添加到表格中 |
| **预期结果** | - 服务产品成功添加到表格中<br>- 总价 = 单价 × Man Days<br>- 总成本 = 成本 × Man Days<br>- 利润 = 总价 - 总成本 |

---

### P&L-TC-012：添加报销费用

| 属性 | 值 |
|------|-----|
| **优先级** | P2 - 低 |
| **前置条件** | P&L Create 页面已打开 |
| **测试步骤** | 1. 点击 "Reimbursement" 标签<br>2. 点击 "+ Add Products" 按钮<br>3. 在 "Add Reimbursement" 模态框中选择 Activity（如 "Flight"）<br>4. 设置 Rate per Day / Trip 为 400<br>5. 设置 Day / Trip (Selling) 为 1<br>6. 验证 Total Selling Price 自动计算为 400<br>7. 点击 "Save" 按钮 |
| **预期结果** | - 报销费用成功添加到表格中<br>- Total Selling Price = Rate per Day × Day / Trip (Selling)<br>- 如果 Cost Rate 为 0，则 Total Cost 为 0，Expected Profit 等于 Total Selling Price |

---

### P&L-TC-013：创建续期产品

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Create 页面已打开，至少添加了一个硬件产品 |
| **测试步骤** | 1. 在硬件产品行点击 "Renew" 链接<br>2. 验证在 "Hardware Renew" 标签下创建了新行<br>3. 验证新行继承了原产品的 CODE 和 PRODUCT<br>4. 修改新行的数量和价格 |
| **预期结果** | - "Renew" 操作在 Hardware Renew 标签下创建新行<br>- 新行继承原产品的基本信息<br>- 新行可以独立设置数量、价格和成本<br>- Hardware Renew 标签徽章数字增加 |

---

### P&L-TC-014：产品搜索与选择

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Create 页面已打开 |
| **测试步骤** | 1. 点击 "+ Add Products" 打开产品选择模态框<br>2. 在 Product Code 输入框输入 "BIOR"<br>3. 等待搜索结果加载<br>4. 验证左面板显示匹配的产品<br>5. 选择一个产品<br>6. 验证右面板显示 "Selected (1)"<br>7. 再次搜索不同关键词<br>8. 选择另一个产品<br>9. 验证右面板显示 "Selected (2)"<br>10. 点击 "Add 2 Products" 按钮 |
| **预期结果** | - 搜索功能正常工作，返回匹配的产品列表<br>- 可以多选产品<br>- 右面板实时更新已选数量<br>- "Add N Products" 按钮根据已选数量启用<br>- 所有选中的产品添加到表格中 |

---

## 3. 折扣与财务计算（5 个用例）

### P&L-TC-015：启用全局折扣

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | P&L Create 页面已打开，至少添加了一个产品 |
| **测试步骤** | 1. 在全局折扣栏输入 5.00%<br>2. 确保开关为启用状态（蓝色）<br>3. 验证所有产品行的 DISC 列显示 5.00%<br>4. 验证所有产品行的 PRICE 列自动更新<br>5. 验证财务汇总卡片重新计算 |
| **预期结果** | - 全局折扣成功应用到所有产品行<br>- 每个产品的 PRICE = UNIT PRICE × (1 + MARKUP) × (1 - DISC)<br>- Total Revenue、Total Profit、Margin 自动重新计算 |

---

### P&L-TC-016：禁用全局折扣

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Create 页面已打开，全局折扣已启用 |
| **测试步骤** | 1. 点击全局折扣开关，切换到禁用状态<br>2. 验证所有产品行的 DISC 列恢复为 0.00% 或单行设置<br>3. 验证财务汇总卡片重新计算 |
| **预期结果** | - 全局折扣禁用后，产品行不再继承全局折扣<br>- 如果之前有单行折扣设置，保留单行设置<br>- 财务数据重新计算 |

---

### P&L-TC-017：利润率验证

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Create 页面已打开，至少添加了一个产品 |
| **测试步骤** | 1. 查看产品行的 MARGIN 和 TARGET 列<br>2. 如果 MARGIN < TARGET，验证显示红色感叹号图标<br>3. 如果 MARGIN ≥ TARGET，验证显示绿色文字<br>4. 调整产品价格或成本，使 MARGIN 变化<br>5. 验证图标和颜色实时更新 |
| **预期结果** | - MARGIN < TARGET 时，显示红色感叹号警告图标<br>- MARGIN ≥ TARGET 时，显示绿色文字<br>- 利润率计算公式：(PROFIT / TOTAL PRICE) × 100% |

---

### P&L-TC-018：财务汇总准确性

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | P&L Create 页面已打开，已添加多个产品 |
| **测试步骤** | 1. 记录每个产品行的 TOTAL PRICE 和 COST<br>2. 计算所有产品行的 TOTAL PRICE 总和<br>3. 计算所有产品行的 COST 总和<br>4. 验证 Total Revenue = 所有 TOTAL PRICE 之和<br>5. 验证 Total Cost = 所有 COST 之和<br>6. 验证 Total Profit = Total Revenue - Total Cost<br>7. 验证 Margin = (Total Profit / Total Revenue) × 100% |
| **预期结果** | - 所有财务指标计算准确<br>- Total Revenue、Total Cost、Total Profit、Margin 与手动计算结果一致 |

---

### P&L-TC-019：利润率计算方式验证

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Create 页面已打开，已添加产品 |
| **测试步骤** | 1. 选择一个产品行，记录其 PROFIT 和 TOTAL PRICE 值<br>2. 手动计算 (PROFIT / TOTAL PRICE) × 100%<br>3. 验证与 MARGIN 列显示的值一致<br>4. 确认系统现在使用售价作为分母，即标准毛利率计算方式 |
| **预期结果** | - 系统使用 (PROFIT / TOTAL PRICE) × 100% 计算 Margin（毛利率）<br>- 与之前加价率 (PROFIT / COST) × 100% 不同 |

---

## 4. 多年度管理（4 个用例）

### P&L-TC-020：查看多年度视图

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Details 页面已打开，包含多年度的 P&L 记录 |
| **测试步骤** | 1. 在 P&L Details 页面查看多年度视图<br>2. 验证表格包含 YEAR 1、YEAR 2 (RENEW)、YEAR 3 (RENEW)、TOTAL 列<br>3. 验证每行包含 CATEGORY（Software、Hardware、Services、Reimbursement）<br>4. 验证每个单元格显示收入、成本、利润率 |
| **预期结果** | - 多年度视图正确显示<br>- 列包含 YEAR 1、YEAR 2 (RENEW)、YEAR 3 (RENEW)、TOTAL<br>- 行包含所有产品类别<br>- GRAND TOTAL 行显示年度合计 |

---

### P&L-TC-021：续期产品显示

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Details 页面已打开，包含续期产品 |
| **测试步骤** | 1. 在多年度视图中查看 YEAR 2 (RENEW) 列<br>2. 验证 Hardware 行显示续期数据<br>3. 验证 Services 行显示续期数据（如果有）<br>4. 验证 Reimbursement 行在续期年度显示为空或 — |
| **预期结果** | - 硬件续期数据正确显示在 YEAR 2 (RENEW) 和 YEAR 3 (RENEW) 列<br>- 报销费用通常只在 Year 1 显示<br>- 续期数据与 Create 页面中输入的一致 |

---

### P&L-TC-022：年度总计计算

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Details 页面已打开，包含多年度数据 |
| **测试步骤** | 1. 记录 YEAR 1、YEAR 2 (RENEW)、YEAR 3 (RENEW) 的收入和成本<br>2. 验证 TOTAL 列 = YEAR 1 + YEAR 2 + YEAR 3<br>3. 验证 GRAND TOTAL 行 = 所有类别之和 |
| **预期结果** | - TOTAL 列正确计算三年总和<br>- GRAND TOTAL 行正确计算所有类别总和<br>- 利润率基于总计数据重新计算 |

---

### P&L-TC-023：多年度颜色编码

| 属性 | 值 |
|------|-----|
| **优先级** | P2 - 低 |
| **前置条件** | P&L Details 页面已打开，包含多年度数据 |
| **测试步骤** | 1. 查看多年度视图中的利润率显示<br>2. 验证健康利润率显示为绿色<br>3. 验证低于目标的利润率显示为红色或橙色 |
| **预期结果** | - 利润率颜色编码正确<br>- 绿色表示健康（达到或超过目标）<br>- 红色/橙色表示低于目标 |

---

## 5. 审批流程（4 个用例）

### P&L-TC-024：提交 P&L 审批

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | P&L Create 页面已打开，已添加至少一个产品 |
| **测试步骤** | 1. 确保所有必填字段已填写<br>2. 在右侧 "Process Approvals" 面板输入审批备注<br>3. 点击 "Submit" 按钮<br>4. 验证出现确认提示<br>5. 确认提交<br>6. 验证 P&L 状态变为 "Pending Approval" |
| **预期结果** | - 提交成功，P&L 状态变为 "Pending Approval"<br>- 审批流程根据 Margin vs Target 逻辑路由<br>- 如果 Margin < Target 或包含 Key Products，路由至 Sales Team Supervisor |

---

### P&L-TC-025：审批触发条件验证

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Create 页面已打开 |
| **测试步骤** | **场景 A：利润率低于目标**<br>1. 设置产品使 Margin < Target<br>2. 提交 P&L<br>3. 验证审批路由至 Sales Team Supervisor<br><br>**场景 B：利润率高于目标**<br>1. 设置产品使 Margin ≥ Target<br>2. 提交 P&L<br>3. 验证自动审批通过<br><br>**场景 C：包含关键产品**<br>1. 添加 Key Product<br>2. 即使 Margin ≥ Target，提交 P&L<br>3. 验证审批路由至 Sales Team Supervisor |
| **预期结果** | - 场景 A：需要 Sales Team Supervisor 审批<br>- 场景 B：自动审批通过<br>- 场景 C：即使利润率达标，仍需 Sales Team Supervisor 审批 |

---

### P&L-TC-026：撤回 P&L

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L 已提交，状态为 "Pending Approval" |
| **测试步骤** | 1. 打开 P&L 详情页面<br>2. 点击 "Revoke" 按钮<br>3. 验证 P&L 状态变为 "Revoked"<br>4. 验证可以重新编辑和提交 |
| **预期结果** | - 撤回成功，状态变为 "Revoked"<br>- 可以重新编辑 P&L 并再次提交 |

---

### P&L-TC-027：审批备注与签名

| 属性 | 值 |
|------|-----|
| **优先级** | P2 - 低 |
| **前置条件** | P&L Create 页面已打开 |
| **测试步骤** | 1. 在 "Process Approvals" 面板的 "Input Processing Comments" 输入备注<br>2. 点击 "Common Comments" 插入常用备注<br>3. 点击 "Upload attachment" 上传附件<br>4. 验证 Signature Preview 显示签名图片<br>5. 点击 "Preview" 预览签名<br>6. 点击 "Delete" 删除签名 |
| **预期结果** | - 备注成功输入<br>- 常用备注成功插入<br>- 附件上传成功<br>- 签名预览正确显示<br>- 签名预览和删除功能正常 |

---

## 6. 详情与克隆（3 个用例）

### P&L-TC-028：查看 P&L 详情

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | 存在已保存的 P&L 记录 |
| **测试步骤** | 1. 导航到 P&L Details 页面<br>2. 验证页面标题为 "P&L Details"<br>3. 验证显示所有产品信息（只读模式）<br>4. 验证财务汇总卡片显示正确<br>5. 验证多年度视图（如果适用）<br>6. 验证 Entity 和 Deal Category 字段显示正确 |
| **预期结果** | - 详情页面正确显示所有 P&L 信息<br>- 所有字段为只读模式<br>- 财务数据与创建时一致 |

---

### P&L-TC-029：克隆 P&L

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Details 页面已打开 |
| **测试步骤** | 1. 点击 "Copy New" 按钮<br>2. 验证页面跳转到新的 P&L Create 页面<br>3. 验证新 P&L 复制了原 P&L 的所有产品<br>4. 验证 Version 显示 "Auto Generate"（新编号）<br>5. 修改部分内容后保存 |
| **预期结果** | - 克隆成功，新 P&L 包含原 P&L 的所有产品<br>- Version 自动生成新编号<br>- 可以修改后保存为新记录 |

---

### P&L-TC-030：从 P&L 创建 Quotation

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Details 页面已打开，P&L 已审批通过 |
| **测试步骤** | 1. 点击 "New Quotation" 按钮<br>2. 验证 Quotation Create 面板打开<br>3. 验证 Quotation 自动带入 P&L 的产品和财务数据<br>4. 验证 Quotation Title 可编辑 |
| **预期结果** | - Quotation Create 面板成功打开<br>- 产品和财务数据从 P&L 自动带入<br>- Quotation 可以进一步编辑并提交 |

---

## 7. 权限控制（2 个用例）

### P&L-TC-031：查看权限

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | P&L Details 页面已打开 |
| **测试步骤** | 1. 在详情页面底部点击 "Permissions" 标签<br>2. 验证 Readers 显示 "No one can read except the author and related personnel"<br>3. 验证 Editors 显示 "Administrator"<br>4. 验证 Attachment Download 显示限制 |
| **预期结果** | - 权限设置正确显示<br>- 默认权限符合安全要求 |

---

### P&L-TC-032：编辑权限验证

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | 用户已登录（非 Administrator 角色） |
| **测试步骤** | 1. 尝试编辑他人创建的 P&L<br>2. 验证系统拒绝编辑操作<br>3. 验证显示权限不足提示 |
| **预期结果** | - 非 Administrator 用户无法编辑他人创建的 P&L<br>- 系统显示权限不足提示 |

---

## 附录：测试数据准备

| 数据类型 | 示例值 | 说明 |
|----------|--------|------|
| 客户名称 | Elite Enterprise Solutions Sendirian Berhad | 马来西亚私人有限公司 |
| 商机名称 | ABC Q3 Purchase | 示例商机 |
| 软件产品 | BIOR502-B4 FINGERPRINT READER | 示例产品 |
| 硬件产品 | ATALLA BACKUP OPERATOR SMARTCARD PACK V4 | 示例产品 |
| 服务产品 | Senior Manager | 专业服务角色 |
| 报销类型 | Flight | 报销活动类型 |
| 货币 | MYR | 马来西亚林吉特 |
| 实体代码 | SMMY | Securemetric Malaysia |
| 交易类别 | ADSS | 示例交易类别 |

---

> **文档结束** | 版本 V1.0 | 2026-05-27 | 总用例数：32
