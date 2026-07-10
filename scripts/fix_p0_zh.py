#!/usr/bin/env python3
"""Fix remaining Chinese P0 inserts"""
with open('/Users/xiex/Documents/GIT/OVERSEABU/Test/crm-test-securemetric/scripts/generate-test-output.ts', 'r') as f:
    content = f.read()

# Customer zh - find the marker
cust_marker = "status:'草稿', notes:'手册写明搜索栏可按「客户名称或法人注册码」筛选' },\n];"
cust_insert = """  { id:'TC-CUSTOMER-011', module:'客户', name:'退回公海 — 将已分配客户退回', category:'公海', role:'销售人员', priority:'P0',
    precondition:'1. 已登录 CRM 系统\\n2. 当前用户为客户 A 的负责人\\n3. 客户 A 状态为已分配',
    steps:'1. 进入客户 A 的详情页\\n2. 点击「退回」按钮\\n3. 选择退回原因\\n4. 确认退回',
    expected:'1. 退回成功\\n2. 分配状态变为未分配\\n3. 负责人和协同跟进人清空',
    status:'草稿', notes:'手册：退回需选择原因。退回后负责人和协同跟进人清空。' },
  { id:'TC-CUSTOMER-012', module:'客户', name:'合并客户 — 将客户 A 合并为客户 B 的子客户', category:'合并', role:'销售人员', priority:'P1',
    precondition:'1. 已登录 CRM 系统\\n2. 存在客户 A 和 B',
    steps:'1. 进入客户 A 的详情页\\n2. 点击「合并」按钮\\n3. 搜索并选择客户 B\\n4. 确认',
    expected:'1. 合并成功\\n2. 客户 B 的「下级客户」标签页显示客户 A\\n3. 不可撤销',
    status:'草稿', notes:'手册：合并后成为目标客户的下级客户，不可撤销。' },
  { id:'TC-CUSTOMER-013', module:'客户', name:'客户流失 — 标记为流失状态', category:'生命周期', role:'销售人员', priority:'P1',
    precondition:'1. 已登录 CRM 系统\\n2. 当前用户为客户 A 的负责人\\n3. 未处于流失阶段',
    steps:'1. 进入客户 A 的详情页\\n2. 点击「客户流失」按钮\\n3. 确认',
    expected:'1. 生命周期变为流失客户（Lost）\\n2. 按钮不再显示',
    status:'草稿', notes:'手册：7 个生命周期阶段：潜在→签约→正式→活跃→忠诚→沉默→流失。' },
"""

if cust_marker in content:
    content = content.replace(cust_marker, "status:'草稿', notes:'手册写明搜索栏可按「客户名称或法人注册码」筛选' },\n" + cust_insert + "];")
    print('customerZh: inserted')
else:
    print('customerZh: NOT FOUND')

# SO zh
so_marker = "status:'草稿', notes:'' },\n];\n// ─── Sales Order"
so_insert = """  { id:'TC-SO-006', module:'销售订单', name:'新建销售订单 — 按百分比里程碑', category:'新建', role:'销售人员', priority:'P1',
    precondition:'1. 已登录 CRM 系统\\n2. 有可用的报价单',
    steps:'1. 进入销售订单新建表单\\n2. 填写必填字段\\n3. 在 Payment Schedule 中切换里程碑类型为按百分比\\n4. 添加多行里程碑并设置比例\\n5. 验证总和为 100%\\n6. 点击「保存」',
    expected:'1. 保存成功\\n2. 里程碑按比例分配应收金额',
    status:'草稿', notes:'手册：按百分比里程碑验证总和=100%。' },
"""

if so_marker in content:
    content = content.replace(so_marker, "status:'草稿', notes:'' },\n" + so_insert + "];\n// ─── Sales Order")
    print('soZh: inserted')
else:
    print('soZh: NOT FOUND')

with open('/Users/xiex/Documents/GIT/OVERSEABU/Test/crm-test-securemetric/scripts/generate-test-output.ts', 'w') as f:
    f.write(content)
print('Done')
