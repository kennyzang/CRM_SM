#!/usr/bin/env python3
"""Inject admin role data into generate-test-output.ts"""
TS_PATH = '/Users/xiex/Documents/GIT/OVERSEABU/Test/crm-test-securemetric/scripts/generate-test-output.ts'

with open(TS_PATH, 'r') as f:
    content = f.read()

# ── 1. Insert admin data + transformer after invoiceEn `];` and before `// ─── Excel` ──
marker = "    status:'Draft', notes:'' },\n];\n\n// ─── Excel 列定义 ──────────────────────────────────────────────────────"

injection = """    status:'Draft', notes:'' },
];

// ── 管理员角色辅助函数 ──
function toAdminZh(tc: TestCase): TestCase {
  return { ...tc, role: '销售管理员', id: tc.id.replace('TC-', 'TC-ADMIN-') };
}
function toAdminEn(tc: TestCase): TestCase {
  return { ...tc, role: 'Sales Admin', id: tc.id.replace('TC-', 'TC-ADMIN-') };
}

// ── 管理员特有用例（中文） ──
const adminExtraZh: TestCase[] = [
  // 联系人
  { id:'TC-ADMIN-CONTACT-017', module:'联系人', name:'批量删除联系人（列表页多选删除）', category:'删除', role:'销售管理员', priority:'P1',
    precondition:'1. 已登录 CRM 系统作为销售管理员\\n2. 列表页存在多条联系人记录',
    steps:'1. 进入联系人列表页\\n2. 勾选多条联系人\\n3. 点击「批量删除」按钮\\n4. 确认删除',
    expected:'1. 删除成功，选中的联系人全部消失', status:'草稿', notes:'管理员可批量删除' },
  // 线索 - 管理员特有操作
  { id:'TC-ADMIN-LEAD-017', module:'线索', name:'分配线索 — 管理员将未分配线索指派给销售', category:'分配', role:'销售管理员', priority:'P0',
    precondition:'1. 已登录 CRM 系统作为线索池管理员\\n2. 存在一条状态为未分配的线索',
    steps:'1. 进入线索 X 的详情页\\n2. 点击「分配」按钮\\n3. 搜索并选择目标销售人员\\n4. 确认分配',
    expected:'1. 分配成功\\n2. 线索状态变为待处理\\n3. 责任人更新为被指派的销售人员', status:'草稿', notes:'手册：管理员可将未分配线索指派给指定销售。' },
  { id:'TC-ADMIN-LEAD-018', module:'线索', name:'收回线索 — 管理员强制收回已分配线索', category:'收回', role:'销售管理员', priority:'P1',
    precondition:'1. 已登录 CRM 系统作为线索池管理员\\n2. 线索 X 状态为待处理/跟进中',
    steps:'1. 进入线索 X 的详情页\\n2. 点击「收回」按钮\\n3. 确认收回',
    expected:'1. 收回成功\\n2. 线索状态变为未分配', status:'草稿', notes:'手册：管理员可强制收回已分配线索。' },
  { id:'TC-ADMIN-LEAD-019', module:'线索', name:'转移线索 — 管理员将线索移至另一线索池', category:'转移', role:'销售管理员', priority:'P1',
    precondition:'1. 已登录 CRM 系统作为线索池管理员\\n2. 存在两个不同的线索池',
    steps:'1. 进入线索 X 的详情页\\n2. 点击「转移」按钮\\n3. 选择目标线索池\\n4. 确认转移',
    expected:'1. 转移成功\\n2. 线索归属的线索池变更为目标池', status:'草稿', notes:'手册：管理员可将线索移至其他线索池（需规则允许转移）。' },
  // 客户 - 管理员特有操作
  { id:'TC-ADMIN-CUSTOMER-014', module:'客户', name:'分配客户 — 管理员将公海客户指派给销售', category:'分配 / 公海', role:'销售管理员', priority:'P0',
    precondition:'1. 已登录 CRM 系统作为公海管理员\\n2. 存在一条未分配状态的客户',
    steps:'1. 进入客户 X 的详情页\\n2. 点击「分配」按钮\\n3. 搜索并选择目标销售人员\\n4. 确认分配',
    expected:'1. 分配成功\\n2. 客户状态变为已分配\\n3. 负责人更新为被指派的销售', status:'草稿', notes:'手册：公海管理员可将客户指派给指定销售。' },
  { id:'TC-ADMIN-CUSTOMER-015', module:'客户', name:'收回客户 — 管理员强制收回已分配客户', category:'收回 / 公海', role:'销售管理员', priority:'P1',
    precondition:'1. 已登录 CRM 系统作为公海管理员\\n2. 客户 X 状态为已分配',
    steps:'1. 进入客户 X 的详情页\\n2. 点击「收回」按钮\\n3. 确认',
    expected:'1. 收回成功\\n2. 客户状态变为未分配', status:'草稿', notes:'手册：公海管理员可强制收回已分配客户。' },
  { id:'TC-ADMIN-CUSTOMER-016', module:'客户', name:'转移客户 — 管理员将客户移至另一公海', category:'转移 / 公海', role:'销售管理员', priority:'P1',
    precondition:'1. 已登录 CRM 系统作为公海管理员\\n2. 存在两个不同的公海',
    steps:'1. 进入客户 X 的详情页\\n2. 点击「转移」按钮\\n3. 选择目标公海\\n4. 确认',
    expected:'1. 转移成功\\n2. 客户所属公海变更', status:'草稿', notes:'手册：管理员可将客户移至其他公海（需规则允许转移）。' },
  // 商机 - 管理员特有
  { id:'TC-ADMIN-OPPORTUNITY-014', module:'商机', name:'导入商机 — 批量导入 Excel', category:'导入', role:'销售管理员', priority:'P2',
    precondition:'1. 已登录 CRM 系统作为销售管理员\\n2. 已准备 Excel 导入模板',
    steps:'1. 进入商机列表页\\n2. 点击「导入」按钮\\n3. 上传 Excel 文件\\n4. 确认导入',
    expected:'1. 导入完成\\n2. 列表页出现新商机', status:'草稿', notes:'手册权限表：仅销售管理员有商机导入权限。' },
];

// ── 管理员特有用例（英文） ──
const adminExtraEn: TestCase[] = [
  { id:'TC-ADMIN-CONTACT-017', module:'Contact', name:'Batch Delete Contacts', category:'Delete', role:'Sales Admin', priority:'P1',
    precondition:'1. Logged into CRM as Sales Admin\\n2. Multiple contacts exist',
    steps:'1. Enter Contact list page\\n2. Check multiple contacts\\n3. Click batch delete button\\n4. Confirm',
    expected:'1. Deleted successfully, selected contacts disappear', status:'Draft', notes:'Admin can batch delete.' },
  { id:'TC-ADMIN-LEAD-017', module:'Lead', name:'Assign Lead — Admin Assigns to Sales', category:'Assign', role:'Sales Admin', priority:'P0',
    precondition:'1. Logged into CRM as Lead Pool Admin\\n2. An unallocated lead exists',
    steps:'1. Enter Lead X detail page\\n2. Click Assign button\\n3. Search and select target sales rep\\n4. Confirm',
    expected:'1. Assigned successfully\\n2. Lead status changes to Pending\\n3. Owner updated', status:'Draft', notes:'Admin can assign unallocated leads to sales reps.' },
  { id:'TC-ADMIN-LEAD-018', module:'Lead', name:'Reclaim Lead — Admin Force Reclaims', category:'Reclaim', role:'Sales Admin', priority:'P1',
    precondition:'1. Logged into CRM as Pool Admin\\n2. Lead X is Pending/Following Up',
    steps:'1. Enter Lead X detail page\\n2. Click Reclaim button\\n3. Confirm',
    expected:'1. Reclaimed successfully\\n2. Status changes to Unallocated', status:'Draft', notes:'Admin can force reclaim allocated leads.' },
  { id:'TC-ADMIN-LEAD-019', module:'Lead', name:'Transfer Lead — Move to Another Pool', category:'Transfer', role:'Sales Admin', priority:'P1',
    precondition:'1. Logged into CRM as Pool Admin\\n2. Two lead pools exist',
    steps:'1. Enter Lead X detail page\\n2. Click Transfer button\\n3. Select target pool\\n4. Confirm',
    expected:'1. Transferred successfully\\n2. Pool affiliation changed', status:'Draft', notes:'Admin can transfer leads between pools.' },
  { id:'TC-ADMIN-CUSTOMER-014', module:'Customer', name:'Assign Customer — Assign to Sales', category:'Assign / Pool', role:'Sales Admin', priority:'P0',
    precondition:'1. Logged into CRM as High Seas Admin\\n2. An unallocated customer exists',
    steps:'1. Enter Customer X detail page\\n2. Click Assign button\\n3. Select target sales rep\\n4. Confirm',
    expected:'1. Assigned successfully\\n2. Status changes to Allocated\\n3. Owner updated', status:'Draft', notes:'High Seas Admin can assign customers to sales.' },
  { id:'TC-ADMIN-CUSTOMER-015', module:'Customer', name:'Reclaim Customer — Force Reclaim', category:'Reclaim / Pool', role:'Sales Admin', priority:'P1',
    precondition:'1. Logged into CRM as High Seas Admin\\n2. Customer X is Allocated',
    steps:'1. Enter Customer X detail page\\n2. Click Reclaim button\\n3. Confirm',
    expected:'1. Reclaimed successfully\\n2. Status changes to Unallocated', status:'Draft', notes:'Admin can force reclaim allocated customers.' },
  { id:'TC-ADMIN-CUSTOMER-016', module:'Customer', name:'Transfer Customer — Move to Another Pool', category:'Transfer / Pool', role:'Sales Admin', priority:'P1',
    precondition:'1. Logged into CRM as High Seas Admin\\n2. Two high seas pools exist',
    steps:'1. Enter Customer X detail page\\n2. Click Transfer button\\n3. Select target pool\\n4. Confirm',
    expected:'1. Transferred successfully\\n2. Pool changed', status:'Draft', notes:'Admin can transfer customers between pools.' },
  { id:'TC-ADMIN-OPPORTUNITY-014', module:'Opportunity', name:'Import Opportunities — Batch Excel', category:'Import', role:'Sales Admin', priority:'P2',
    precondition:'1. Logged into CRM as Sales Admin\\n2. Excel template ready',
    steps:'1. Enter Opportunity list page\\n2. Click Import button\\n3. Upload Excel\\n4. Confirm',
    expected:'1. Import complete\\n2. New opportunities in list', status:'Draft', notes:'Permission table: Only Sales Admin has opportunity import permission.' },
];

// ── 构建完整管理员数组 = 转化后的销售数组 + 管理员特有用例 ──

const allZhData: [TestCase[], string][] = [
  [contactZh, '联系人'], [leadZh, '线索'], [customerZh, '客户'],
  [opportunityZh, '商机'], [plZh, 'P&L'], [quotationZh, '报价单'],
  [soZh, '销售订单'], [poZh, '采购订单'], [invoiceZh, '开票申请'],
];

// 中文管理员数组（修改 role + 追加 admin 特有用例）
const adminContactZh  = [...contactZh.map(toAdminZh), ...adminExtraZh.filter(t => t.module === '联系人')];
const adminLeadZh     = [...leadZh.map(toAdminZh), ...adminExtraZh.filter(t => t.module === '线索')];
const adminCustomerZh = [...customerZh.map(toAdminZh), ...adminExtraZh.filter(t => t.module === '客户')];
const adminOppoZh     = [...opportunityZh.map(toAdminZh), ...adminExtraZh.filter(t => t.module === '商机')];
const adminPlZh       = plZh.map(toAdminZh);
const adminQuotZh     = quotationZh.map(toAdminZh);
const adminSoZh       = soZh.map(toAdminZh);
const adminPoZh       = poZh.map(toAdminZh);
const adminInvoiceZh  = invoiceZh.map(toAdminZh);

const adminContactEn  = [...contactEn.map(toAdminEn), ...adminExtraEn.filter(t => t.module === 'Contact')];
const adminLeadEn     = [...leadEn.map(toAdminEn), ...adminExtraEn.filter(t => t.module === 'Lead')];
const adminCustEn     = [...customerEn.map(toAdminEn), ...adminExtraEn.filter(t => t.module === 'Customer')];
const adminOppoEn     = [...opportunityEn.map(toAdminEn), ...adminExtraEn.filter(t => t.module === 'Opportunity')];
const adminPlEn       = plEn.map(toAdminEn);
const adminQuotEn     = quotationEn.map(toAdminEn);
const adminSoEn       = soEn.map(toAdminEn);
const adminPoEn       = poEn.map(toAdminEn);
const adminInvoiceEn  = invoiceEn.map(toAdminEn);

// ─── Excel 列定义 ──────────────────────────────────────────────────────"""

content = content.replace(marker, injection)
print("✅ Admin data injected")

with open(TS_PATH, 'w') as f:
    f.write(content)
print("✅ File saved")
