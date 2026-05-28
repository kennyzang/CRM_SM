---
title: Quotation 测试用例（中文版）
created: 2026-05-27
updated: 2026-05-27
type: test-cases
tags: [quote, test-cases, zh]
sources: [oss/Quotation_v2.mp4, wiki/entities/quote.md]
related: [[quote]], [[pl]], [[opportunity]]
---

# Quotation 模块测试用例

> **版本**: V1.0 | **日期**: 2026-05-27 | **模块**: Quotation (报价单) | **总用例数**: 28

---

## 测试用例汇总

| 类别 | 用例数 | 状态 |
|------|--------|------|
| 创建与基本信息 | 6 | ✅ |
| 客户信息 | 3 | ✅ |
| 财务与税金计算 | 4 | ✅ |
| 条款与签名 | 5 | ✅ |
| 审批流程 | 4 | ✅ |
| PDF 预览与导出 | 3 | ✅ |
| 详情与导航 | 3 | ✅ |

---

## 1. 创建与基本信息（6 个用例）

### QTN-TC-001：从 Opportunity 创建 Quotation

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | 1. 用户已登录 CRM 系统<br>2. 存在一个已批准的 P&L 记录<br>3. P&L 关联的 Opportunity 存在 |
| **测试步骤** | 1. 导航到 Opportunity 详情页<br>2. 点击 "Quotation" 标签<br>3. 点击 "Create" 按钮<br>4. 验证 "Select record" 模态框打开<br>5. 选择要关联的 P&L 版本<br>6. 点击 "Confirm" 按钮 |
| **预期结果** | - "Select record" 模态框成功打开<br>- 显示可用的 P&L 版本列表<br>- 选择后点击 "Confirm" 成功<br>- Quotation Create 滑出面板打开 |

---

### QTN-TC-002：验证 Quotation 基本信息自动带入

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 验证 Quotation Title 可编辑<br>2. 验证 P&L 字段显示正确的 P&L 编号<br>3. 验证 Currency 显示 "MYR"<br>4. 验证 Department 显示正确部门（如 "SMMY"）<br>5. 验证 Opportunity 显示父商机名称（只读）<br>6. 验证 Sales Rep 自动带入<br>7. 验证 Quote Date 自动设为当天 |
| **预期结果** | - 所有字段正确自动带入<br>- P&L 编号与选择的版本一致<br>- Opportunity 为只读，显示父商机名称<br>- Quote Date 为当天日期 |

---

### QTN-TC-003：编辑 Quotation Title

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 在 Quotation Title 输入框输入标题<br>2. 验证输入时出现自动补全建议<br>3. 输入与现有报价单相似的标题<br>4. 验证自动补全显示编号变体（如 "...Quotation2", "...Quotation3"） |
| **预期结果** | - Quotation Title 可编辑<br>- 自动补全功能正常工作<br>- 输入相似标题时，系统建议编号变体防止重名 |

---

### QTN-TC-004：设置 Ship Via

| 属性 | 值 |
|------|-----|
| **优先级** | P2 - 低 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 点击 Ship Via 下拉框<br>2. 验证包含多个运输方式选项<br>3. 选择 "Express Shipping"<br>4. 验证选择成功 |
| **预期结果** | - Ship Via 下拉框包含多个选项<br>- 选择成功保存<br>- 选项至少包括：Standard Shipping, Express Shipping, Overnight Shipping, Priority Shipping, Economy Shipping, Air Shipping, Ground Shipping |

---

### QTN-TC-005：设置 Term

| 属性 | 值 |
|------|-----|
| **优先级** | P2 - 低 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 在 Term 输入框输入 "Refer to T&C"<br>2. 验证输入成功保存 |
| **预期结果** | - Term 字段可编辑<br>- 输入成功保存 |

---

### QTN-TC-006：保存 Quotation 草稿

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | Quotation Create 面板已打开，基本信息已填写 |
| **测试步骤** | 1. 填写所有必填字段<br>2. 点击 "Save" 按钮<br>3. 验证保存成功<br>4. 验证出现 "Operation succeeded" 提示<br>5. 验证 Quotation 状态为 Draft |
| **预期结果** | - 保存成功<br>- 显示 "Operation succeeded" 提示<br>- Quotation 状态为 Draft |

---

## 2. 客户信息（3 个用例）

### QTN-TC-007：验证客户信息自动带入

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 验证 Customer 字段显示正确客户名称<br>2. 验证 Address 字段显示正确客户地址<br>3. 验证客户信息从 P&L/Opportunity 自动带入 |
| **预期结果** | - Customer 显示正确客户名称（如 "Elite Enterprise Solutions Sendirian Berhad"）<br>- Address 显示正确地址（如 "Lot 20, Jalan Sultan, 80000 Johor Bahru, Johor, Malaysia"） |

---

### QTN-TC-008：编辑客户联系信息

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 在 Attn 输入框输入联系人姓名（如 "Nur Binti Hassan"）<br>2. 在 Tel 输入框输入电话号码（如 "017-6457719"）<br>3. 在 E-Mail 输入框输入邮箱（如 "chen.lim@gmail.com"）<br>4. 验证所有输入成功保存 |
| **预期结果** | - Attn、Tel、E-Mail 字段可编辑<br>- 输入成功保存<br>- 格式验证（如邮箱格式）正常工作 |

---

### QTN-TC-009：客户地址修改

| 属性 | 值 |
|------|-----|
| **优先级** | P2 - 低 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 修改 Address 字段内容<br>2. 验证修改成功保存<br>3. 验证修改不影响原客户记录的地址 |
| **预期结果** | - Address 可编辑<br>- 修改成功保存<br>- 仅影响当前报价单，不影响原客户记录 |

---

## 3. 财务与税金计算（4 个用例）

### QTN-TC-010：验证财务汇总准确性

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | Quotation Create 面板已打开，包含行项目 |
| **测试步骤** | 1. 记录 Total Excl Tax 值<br>2. 记录 Service Tax 值<br>3. 记录 Grand Total (Incl Tax) 值<br>4. 验证 Grand Total = Total Excl Tax + Service Tax<br>5. 验证 Service Tax = Total Excl Tax × 8% |
| **预期结果** | - 所有财务指标计算准确<br>- Grand Total = Total Excl Tax + Service Tax<br>- Service Tax = Total Excl Tax × 0.08（8% SST） |

---

### QTN-TC-011：服务税计算验证

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 查看 Service Tax 值<br>2. 手动计算 Total Excl Tax × 0.08<br>3. 验证与系统显示的 Service Tax 一致<br>4. 示例：Total Excl Tax = 23,405.00，Service Tax = 1,872.40 |
| **预期结果** | - Service Tax 计算准确<br>- 23,405.00 × 0.08 = 1,872.40<br>- 马来西亚 8% SST 税率正确应用 |

---

### QTN-TC-012：行项目数据验证

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | Quotation Create 面板已打开，包含行项目 |
| **测试步骤** | 1. 查看 Line Items 区域<br>2. 验证包含 Service Period、Product Name、Product Code、Description、Unit Price、Disc 等列<br>3. 验证行项目数据从 P&L 正确带入<br>4. 验证价格和数量与 P&L 一致 |
| **预期结果** | - Line Items 区域正确显示所有列<br>- 行项目数据从 P&L 正确带入<br>- 价格和数量与 P&L 一致 |

---

### QTN-TC-013：全局服务设置

| 属性 | 值 |
|------|-----|
| **优先级** | P2 - 低 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 在 Line Items 区域查看 Global Service 下拉框<br>2. 选择服务选项<br>3. 验证选择成功应用 |
| **预期结果** | - Global Service 下拉框正常工作<br>- 选择成功应用到所有行项目 |

---

## 4. 条款与签名（5 个用例）

### QTN-TC-014：编辑 Terms & Conditions

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 滚动到 Foot 区域<br>2. 在 Terms & Conditions 富文本编辑器中查看预设内容<br>3. 验证包含 8 条预设条款<br>4. 修改某一条款内容<br>5. 使用工具栏格式功能（字体大小、段落格式等）<br>6. 验证修改成功保存 |
| **预期结果** | - Terms & Conditions 显示 8 条预设条款<br>- 富文本编辑器工具栏正常工作<br>- 修改成功保存<br>- 字符计数显示正确 |

---

### QTN-TC-015：验证占位符替换

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 在 Terms & Conditions 中查看占位符（如 `<Validity>`、`<xx>`、`<Payment Terms>`）<br>2. 生成 PDF 预览<br>3. 验证占位符被实际值替换 |
| **预期结果** | - 占位符在生成 PDF 时被实际值替换<br>- `<Validity>` 替换为实际有效期<br>- `<xx>` 替换为实际保修期<br>- `<Payment Terms>` 替换为实际付款条款 |

---

### QTN-TC-016：编辑 Acceptance Instruction

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 在 Acceptance Instruction 富文本编辑器中查看预设内容<br>2. 修改内容<br>3. 使用工具栏格式功能<br>4. 验证修改成功保存 |
| **预期结果** | - Acceptance Instruction 显示预设内容<br>- 富文本编辑器正常工作<br>- 修改成功保存 |

---

### QTN-TC-017：验证 Prepared by 自动生成

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 查看 Prepared by 字段<br>2. 验证显示 "Automatically generated by the system"<br>3. 验证字段不可编辑 |
| **预期结果** | - Prepared by 显示 "Automatically generated by the system"<br>- 字段为只读，不可编辑 |

---

### QTN-TC-018：数字签名功能

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 在右侧 "Process Approvals" 面板查看 Signature Preview<br>2. 验证显示签名图片（如 "CK"）<br>3. 点击 "Preview" 预览签名<br>4. 点击 "Delete" 删除签名<br>5. 验证签名删除成功 |
| **预期结果** | - Signature Preview 正确显示签名图片<br>- Preview 功能正常<br>- Delete 功能正常，签名成功删除 |

---

## 5. 审批流程（4 个用例）

### QTN-TC-019：提交 Quotation 审批

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | Quotation Create 面板已打开，所有必填字段已填写 |
| **测试步骤** | 1. 在 "Process Approvals" 面板输入审批备注<br>2. 点击 "Submit" 按钮<br>3. 验证出现确认提示<br>4. 确认提交<br>5. 验证 Quotation 状态变为 "Pending Approval" |
| **预期结果** | - 提交成功<br>- Quotation 状态变为 "Pending Approval"<br>- 审批流程启动 |

---

### QTN-TC-020：审批备注功能

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 在 "Input Processing Comments" 输入备注<br>2. 点击 "Common Comments" 插入常用备注<br>3. 验证备注成功插入<br>4. 点击 "Upload attachment" 上传附件<br>5. 验证附件上传成功 |
| **预期结果** | - 备注输入成功<br>- 常用备注成功插入<br>- 附件上传成功 |

---

### QTN-TC-021：展开审批选项

| 属性 | 值 |
|------|-----|
| **优先级** | P2 - 低 |
| **前置条件** | Quotation Create 面板已打开 |
| **测试步骤** | 1. 点击 "Expand approval options"<br>2. 验证展开更多审批选项<br>3. 查看可选的审批配置 |
| **预期结果** | - 审批选项成功展开<br>- 显示更多审批配置选项 |

---

### QTN-TC-022：审批跟踪

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | Quotation 已提交，状态为 "Pending Approval" |
| **测试步骤** | 1. 在 "Process Approvals" 面板点击 "Track" 下拉框<br>2. 选择审批跟踪视图<br>3. 验证显示审批进度和当前节点 |
| **预期结果** | - 审批跟踪功能正常<br>- 显示审批进度和当前节点<br>- 可以查看历史审批记录 |

---

## 6. PDF 预览与导出（3 个用例）

### QTN-TC-023：PDF 预览

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | Quotation Details 页面已打开 |
| **测试步骤** | 1. 在 Quotation Details 页面触发 PDF 预览<br>2. 验证 PDF Preview 模态框打开<br>3. 验证显示公司抬头（SECUREMETRIC TECHNOLOGY SDN. BHD.）<br>4. 验证显示财务汇总表（Total Excl Service Tax / Service Tax @ 8% / Total Amount）<br>5. 验证显示条款与条件（8 条）<br>6. 验证显示签名区块（Prepare by / Approved by） |
| **预期结果** | - PDF Preview 模态框成功打开<br>- 公司抬头正确显示<br>- 财务汇总表正确显示<br>- 条款与条件正确显示<br>- 签名区块正确显示 |

---

### QTN-TC-024：导出 PDF

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | PDF Preview 模态框已打开 |
| **测试步骤** | 1. 点击 "Export PDF" 按钮<br>2. 等待 PDF 生成<br>3. 验证浏览器右上角显示下载通知<br>4. 验证文件名格式正确（如 "ABC Q3 Purchase Quotation..."）<br>5. 验证文件状态显示 "Done" |
| **预期结果** | - PDF 生成成功<br>- 下载通知显示<br>- 文件名格式正确<br>- 文件大小约 708 KB<br>- 状态显示 "Done" |

---

### QTN-TC-025：PDF 内容验证

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | PDF 已导出并下载 |
| **测试步骤** | 1. 打开下载的 PDF 文件<br>2. 验证公司抬头和注册号正确<br>3. 验证财务数据与 Quotation 一致<br>4. 验证条款与条件完整<br>5. 验证签名区块正确显示<br>6. 验证占位符已被实际值替换 |
| **预期结果** | - PDF 内容完整准确<br>- 公司抬头和注册号正确<br>- 财务数据与 Quotation 一致<br>- 条款与条件完整<br>- 签名区块正确显示<br>- 占位符已替换为实际值 |

---

## 7. 详情与导航（3 个用例）

### QTN-TC-026：查看 Quotation 详情

| 属性 | 值 |
|------|-----|
| **优先级** | P0 - 高 |
| **前置条件** | 存在已保存的 Quotation 记录 |
| **测试步骤** | 1. 导航到 Quotation Details 页面<br>2. 验证页面标题为 "Quotation Details"<br>3. 验证显示 Details / Quotation Details(N) / Sales Order 标签<br>4. 验证所有字段为只读模式<br>5. 验证 Header Information 正确显示<br>6. 验证 Customer Info 正确显示 |
| **预期结果** | - 详情页面正确显示所有 Quotation 信息<br>- 所有字段为只读模式<br>- 标签导航正常 |

---

### QTN-TC-027：创建更多关联记录

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | Quotation Details 页面已打开 |
| **测试步骤** | 1. 点击 "+Create More" 按钮<br>2. 验证可以创建更多关联记录<br>3. 验证新记录与原 Quotation 关联 |
| **预期结果** | - "+Create More" 功能正常<br>- 可以创建关联记录<br>- 新记录与原 Quotation 正确关联 |

---

### QTN-TC-028：从 Quotation 创建 Sales Order

| 属性 | 值 |
|------|-----|
| **优先级** | P1 - 中 |
| **前置条件** | Quotation Details 页面已打开，Quotation 已审批通过 |
| **测试步骤** | 1. 点击 "Sales Order" 标签<br>2. 验证可以创建 Sales Order<br>3. 验证 Sales Order 自动带入 Quotation 数据 |
| **预期结果** | - 可以从 Quotation 创建 Sales Order<br>- Sales Order 自动带入 Quotation 数据<br>- 数据继承链路正确 |

---

## 附录：测试数据准备

| 数据类型 | 示例值 | 说明 |
|----------|--------|------|
| 客户名称 | Elite Enterprise Solutions Sendirian Berhad | 马来西亚私人有限公司 |
| 商机名称 | ABC Q3 Purchase | 示例商机 |
| P&L 编号 | 2026052700008 | 示例 P&L 编号 |
| 联系人 | Nur Binti Hassan | 示例联系人 |
| 电话 | 017-6457719 | 示例电话号码 |
| 邮箱 | chen.lim@gmail.com | 示例邮箱 |
| 地址 | Lot 20, Jalan Sultan, 80000 Johor Bahru, Johor, Malaysia | 示例地址 |
| 销售代表 | YCK | 示例销售代表 |
| 部门 | SMMY | Securemetric Malaysia |
| 运输方式 | Express Shipping | 示例运输方式 |
| 付款条款 | Refer to T&C | 示例付款条款 |

---

> **文档结束** | 版本 V1.0 | 2026-05-27 | 总用例数：28
