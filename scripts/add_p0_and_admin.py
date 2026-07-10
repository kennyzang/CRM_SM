#!/usr/bin/env python3
"""Add P0 test cases and admin role data to generate-test-output.ts"""
import re

TS_PATH = '/Users/xiex/Documents/GIT/OVERSEABU/Test/crm-test-securemetric/scripts/generate-test-output.ts'

with open(TS_PATH, 'r') as f:
    content = f.read()

# ── 1. Add P0 cases to contactZh ──
content = content.replace(
    "    status:'草稿', notes:'搜索框 placeholder 经 Playwright 实测为「搜姓名/部门/职务」' },\n];\n\n//",
    """    status:'草稿', notes:'搜索框 placeholder 经 Playwright 实测为「搜姓名/部门/职务」' },
  { id:'TC-CONTACT-016', module:'联系人', name:'批量导入联系人 — Excel 模板导入', category:'导入', role:'销售人员', priority:'P1',
    precondition:'1. 已登录 CRM 系统\\n2. 已准备符合格式的 Excel 导入模板',
    steps:'1. 进入联系人列表页\\n2. 点击「导入」按钮\\n3. 上传 Excel 文件\\n4. 选择导入模式（新增/更新/新增和更新）\\n5. 确认导入',
    expected:'1. 导入完成，系统显示导入结果汇总\\n2. 列表页出现导入的联系人记录',
    status:'草稿', notes:'手册支持批量导入，含 4 种导入模式。导入模板含 7 列：联系人名称、手机、邮件、部门、职位、客户、地址。' },
];

//""")

# ── 2. Add P0 cases to contactEn ──
content = content.replace(
    """    status:'Draft', notes:'Search box placeholder verified by Playwright as "搜姓名/部门/职务"' },
];

//""",
    """    status:'Draft', notes:'Search box placeholder verified by Playwright as "搜姓名/部门/职务"' },
  { id:'TC-CONTACT-016', module:'Contact', name:'Batch Import Contacts — Excel Template', category:'Import', role:'Sales Rep', priority:'P1',
    precondition:'1. Logged into CRM\\n2. An Excel template is ready',
    steps:'1. Enter Contact list page\\n2. Click "Import" button\\n3. Upload Excel file\\n4. Select import mode (Add/Update/Add & Update)\\n5. Confirm import',
    expected:'1. Import complete, system shows summary\\n2. Imported contacts appear in list',
    status:'Draft', notes:'Manual supports batch import with 4 modes. Template has 7 columns.' },
];

//""")

# ── 3. Add P0 to leadZh ──
content = content.replace(
    """    status:'草稿', notes:'手册明确转化前提：状态=跟进中，销售管道阶段推进至 Prospecting，赢率已填写。本条用例仅验证前提条件，完整转化流程在专项测试中覆盖。' },
];

//""",
    """    status:'草稿', notes:'手册明确转化前提：状态=跟进中，销售管道阶段推进至 Prospecting，赢率已填写。本条用例仅验证前提条件，完整转化流程在专项测试中覆盖。' },
  { id:'TC-LEAD-015', module:'线索', name:'锁定/解锁线索', category:'权限', role:'销售人员', priority:'P1',
    precondition:'1. 已登录 CRM 系统\\n2. 当前用户是线索 X 的负责人\\n3. 线索 X 状态为跟进中',
    steps:'1. 进入线索 X 的详情页\\n2. 点击「锁定」按钮\\n3. 确认锁定\\n4. 尝试编辑线索\\n5. 点击「解锁」按钮\\n6. 确认解锁',
    expected:'1. 锁定后编辑按钮灰显/不可点击\\n2. 解锁后可正常编辑',
    status:'草稿', notes:'手册明确锁定后防止被修改。负责人或线索池成员可操作。' },
  { id:'TC-LEAD-016', module:'线索', name:'归集线索 — 将线索 A 归集到线索 B', category:'关联', role:'销售人员', priority:'P1',
    precondition:'1. 已登录 CRM 系统\\n2. 存在两条线索 A 和 B，状态均为跟进中\\n3. 当前用户为线索池成员',
    steps:'1. 进入线索 A 的详情页\\n2. 点击「归集」按钮\\n3. 搜索并选择线索 B 作为目标主线索\\n4. 确认归集',
    expected:'1. 归集成功\\n2. 线索 B 的详情页「相关线索」标签页中显示线索 A\\n3. 线索 A 不再在列表页独立显示',
    status:'草稿', notes:'手册：将多条相关线索归集到一条主线索下，形成父子关系。线索池成员可操作。' },
];

//""")

# ── 4. Add P0 to leadEn ──
content = content.replace(
    """    status:'Draft', notes:'Manual states conversion prerequisites: Status=Following Up, Sales Pipeline stage progressed to Prospecting, Win Rate filled. This test case only validates prerequisites, full conversion flow covered in dedicated tests.' },
];

//""",
    """    status:'Draft', notes:'Manual states conversion prerequisites: Status=Following Up, Sales Pipeline stage progressed to Prospecting, Win Rate filled. This test case only validates prerequisites, full conversion flow covered in dedicated tests.' },
  { id:'TC-LEAD-015', module:'Lead', name:'Lock/Unlock Lead', category:'Permission', role:'Sales Rep', priority:'P1',
    precondition:'1. Logged into CRM\\n2. Current user is owner of Lead X\\n3. Lead X status is Following Up',
    steps:'1. Enter Lead X detail page\\n2. Click Lock button\\n3. Confirm lock\\n4. Attempt to edit\\n5. Click Unlock button\\n6. Confirm unlock',
    expected:'1. After lock, Edit button is disabled\\n2. After unlock, editing works normally',
    status:'Draft', notes:'Manual: Locking prevents modification. Owner or pool member can operate.' },
  { id:'TC-LEAD-016', module:'Lead', name:'Collect Lead — Merge A into B', category:'Relation', role:'Sales Rep', priority:'P1',
    precondition:'1. Logged into CRM\\n2. Leads A and B exist, both Following Up\\n3. Current user is pool member',
    steps:'1. Enter Lead A detail page\\n2. Click Collect button\\n3. Search and select Lead B as target\\n4. Confirm',
    expected:'1. Collection successful\\n2. Lead B\\'s Related Leads tab shows Lead A\\n3. Lead A no longer independently visible',
    status:'Draft', notes:'Manual: Multiple related leads collected under one master lead as parent-child. Pool members can operate.' },
];

//""")

# ── 5. Add P0 to customerZh ──
content = content.replace(
    """    status:'草稿', notes:'手册写明搜索栏可按「客户名称或法人注册码」筛选' },
];

//""",
    """    status:'草稿', notes:'手册写明搜索栏可按「客户名称或法人注册码」筛选' },
  { id:'TC-CUSTOMER-011', module:'客户', name:'退回公海 — 将已分配客户退回', category:'公海', role:'销售人员', priority:'P0',
    precondition:'1. 已登录 CRM 系统\\n2. 当前用户为客户 A 的负责人\\n3. 客户 A 状态为已分配',
    steps:'1. 进入客户 A 的详情页\\n2. 点击「退回」按钮\\n3. 选择退回原因\\n4. 确认退回',
    expected:'1. 退回成功\\n2. 客户 A 的分配状态变为未分配\\n3. 客户 A 不再在「我负责的」视图下\\n4. 负责人和协同跟进人被清空',
    status:'草稿', notes:'手册：退回需选择原因。若不属于任何公海需先选择目标公海。退回后负责人和协同跟进人清空。' },
  { id:'TC-CUSTOMER-012', module:'客户', name:'合并客户 — 将客户 A 合并为客户 B 的子客户', category:'合并', role:'销售人员', priority:'P1',
    precondition:'1. 已登录 CRM 系统\\n2. 存在客户 A 和客户 B',
    steps:'1. 进入客户 A 的详情页\\n2. 点击「合并」按钮\\n3. 搜索并选择目标客户 B\\n4. 确认合并',
    expected:'1. 合并成功\\n2. 客户 B 的「下级客户」标签页中显示客户 A\\n3. 合并不可撤销',
    status:'草稿', notes:'手册：合并后当前客户成为目标客户的下级客户，不可撤销。' },
  { id:'TC-CUSTOMER-013', module:'客户', name:'客户流失 — 标记客户为流失状态', category:'生命周期', role:'销售人员', priority:'P1',
    precondition:'1. 已登录 CRM 系统\\n2. 当前用户为客户 A 的负责人\\n3. 客户生命周期尚未处于流失阶段',
    steps:'1. 进入客户 A 的详情页\\n2. 点击「客户流失」按钮\\n3. 确认',
    expected:'1. 生命周期变为流失客户（Lost）\\n2. 客户流失按钮不再显示',
    status:'草稿', notes:'手册：7 个生命周期阶段：潜在→签约→正式→活跃→忠诚→沉默→流失。' },
];

//""")

# ── 6. Add P0 to customerEn ──
content = content.replace(
    """    status:'Draft', notes:'Manual states search box can filter by "customer name or registration code"' },
];

//""",
    """    status:'Draft', notes:'Manual states search box can filter by "customer name or registration code"' },
  { id:'TC-CUSTOMER-011', module:'Customer', name:'Return to Pool — Return Allocated Customer', category:'Pool', role:'Sales Rep', priority:'P0',
    precondition:'1. Logged into CRM\\n2. Current user is owner of Customer A\\n3. Customer A is Allocated',
    steps:'1. Enter Customer A detail page\\n2. Click Return button\\n3. Select return reason\\n4. Confirm',
    expected:'1. Return successful\\n2. Allocation status changes to Unallocated\\n3. Not in My Owned view\\n4. Owner and co-followers cleared',
    status:'Draft', notes:'Manual: Return requires reason. Select target pool if none. Owner and co-followers cleared.' },
  { id:'TC-CUSTOMER-012', module:'Customer', name:'Merge Customer — Merge A into B as Sub-customer', category:'Merge', role:'Sales Rep', priority:'P1',
    precondition:'1. Logged into CRM\\n2. Customers A and B exist',
    steps:'1. Enter Customer A detail page\\n2. Click Merge button\\n3. Search and select target B\\n4. Confirm',
    expected:'1. Merge successful\\n2. B\\'s Sub-customers tab shows A\\n3. Merge is irreversible',
    status:'Draft', notes:'Manual: Merged customer becomes sub-customer of target. Irreversible.' },
  { id:'TC-CUSTOMER-013', module:'Customer', name:'Customer Lost — Mark as Lost', category:'Lifecycle', role:'Sales Rep', priority:'P1',
    precondition:'1. Logged into CRM\\n2. Current user is owner of Customer A\\n3. Lifecycle not at Lost stage',
    steps:'1. Enter Customer A detail page\\n2. Click Customer Lost button\\n3. Confirm',
    expected:'1. Lifecycle changes to Lost\\n2. Button no longer shows',
    status:'Draft', notes:'Manual: 7 lifecycle stages: Potential→Contracted→Official→Active→Loyal→Dormant→Lost.' },
];

//""")

# ── 7. Add P0 to soZh ──
content = content.replace(
    "    status:'草稿', notes:'' },\n];\n\n// ─── Sales Order",
    """    status:'草稿', notes:'销售订单列表页支持按 SO 编号搜索' },
  { id:'TC-SO-006', module:'销售订单', name:'新建销售订单 — 按百分比里程碑', category:'新建', role:'销售人员', priority:'P1',
    precondition:'1. 已登录 CRM 系统\\n2. 有可用的报价单数据',
    steps:'1. 进入销售订单新建表单\\n2. 填写必填字段\\n3. 在 Payment Schedule 中将里程碑类型切换为「按百分比」\\n4. 添加多行里程碑，设置名称和比例\\n5. 验证百分比总和为 100%\\n6. 点击「保存」',
    expected:'1. 保存成功\\n2. 里程碑按比例分配应收金额',
    status:'草稿', notes:'手册：按百分比里程碑验证总和=100%。与按产品类型不同。' },
];

// ─── Sales Order""")

# ── 8. Add P0 to soEn ──
content = content.replace(
    "    status:'Draft', notes:'' },\n];\n\n// ─── PO",
    """    status:'Draft', notes:'Sales Order list supports search by SO number.' },
  { id:'TC-SO-006', module:'Sales Order', name:'Create SO — Percentage-based Milestones', category:'Create', role:'Sales Rep', priority:'P1',
    precondition:'1. Logged into CRM\\n2. A quotation exists',
    steps:'1. Enter SO create form\\n2. Fill required fields\\n3. Switch Milestone Type to By Percentage\\n4. Add milestones with names and percentages\\n5. Verify total = 100%\\n6. Click Save',
    expected:'1. Save successful\\n2. Milestones distributed per percentage',
    status:'Draft', notes:'Manual: Percentage milestone validates sum=100%. Different from By Product.' },
];

// ─── PO""")

print("✅ P0 cases added")
with open(TS_PATH, 'w') as f:
    f.write(content)
print("✅ File saved")
