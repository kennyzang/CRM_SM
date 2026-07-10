#!/usr/bin/env python3
"""Generate admin-specific yaml files with full button coverage from manual"""
import os

BASE = 'doc/SM测试用例-收集箱/AI输出/基础功能用例'
os.makedirs(f'{BASE}/admin_zh', exist_ok=True)
os.makedirs(f'{BASE}/admin_en', exist_ok=True)

def write(path, cases):
    with open(path, 'w') as f:
        f.write('---\ncases:\n')
        for d in cases:
            f.write(f'\n  - id: {d[0]}\n    module: {d[1]}\n    name: {d[2]}\n    category: {d[3]}\n    role: {d[4]}\n    priority: {d[5]}\n')
            for ki, k in enumerate(['precondition','steps','expected','notes']):
                v = d[6+ki]
                if v:
                    f.write(f'    {k}: |\n')
                    for l in v.split('\n'):
                        f.write(f'      {l}\n')
            f.write(f'    status: {d[10]}\n')

# ════════ 联系人 Admin 特有 ════════
contact_zh = [
('TC-ADMIN-CONTACT-017', '联系人', '批量删除联系人(列表多选)', '删除', '销售管理员', 'P1',
 '已登录作为销售管理员
有联系人数据',
 '1.进列表
2.勾选多条\\n3.点批量删除\\n4.确认',
 '1.成功
2.选中的全消失',
 '', '草稿'),
]
contact_en = [
('TC-ADMIN-CONTACT-017', 'Contact', 'Batch Delete Contacts', 'Delete', 'Sales Admin', 'P1',
 'Logged in as Sales Admin
Has contacts',
 '1.List
2.Check multiple\\n3.Batch delete\\n4.Confirm',
 '1.Success
2.Selected deleted',
 '', 'Draft'),
]

# ════════ 线索 Admin 特有 (从手册 5.1) ════════
lead_zh = [
('TC-ADMIN-LEAD-017', '线索', '分配线索—管理员指派给销售', '分配', '销售管理员', 'P0',
 '已登录作为线索池管理员
存在状态为未分配的线索',
 '1.进线索X详情
2.点「分配」\\n3.选目标销售\\n4.确认',
 '1.成功
2.状态变待处理\\n3.负责人更新',
 '手册5.1线索池管理员操作:分配', '草稿'),
('TC-ADMIN-LEAD-018', '线索', '收回线索—强制收回已分配', '收回', '销售管理员', 'P1',
 '已登录作为线索池管理员
X状态为待处理/跟进中/无效',
 '1.进X详情
2.点「收回」\\n3.确认',
 '1.成功
2.状态变未分配',
 '手册5.1:收回', '草稿'),
('TC-ADMIN-LEAD-019', '线索', '转移线索—移至另一线索池', '转移', '销售管理员', 'P1',
 '已登录作为线索池管理员
有2个不同线索池',
 '1.进X详情
2.点「转移」\\n3.选目标线索池\\n4.确认',
 '1.成功
2.归属池变更为目标池',
 '手册5.1:转移', '草稿'),
('TC-ADMIN-LEAD-020', '线索', '变更负责人—管理员转移负责人', '变更负责人', '销售管理员', 'P0',
 '已登录作为线索池管理员
X状态为待处理/跟进中/无效\\n未锁定',
 '1.进X详情
2.点「变更负责人」\\n3.选新负责人\\n4.选原负责人去向(移出/保留为成员)\\n5.确认',
 '1.成功
2.负责人变更新人\\n3.原负责人按选项处理',
 '手册5.7:变更负责人+原负责人去向', '草稿'),
('TC-ADMIN-LEAD-021', '线索', '归集线索—管理员操作', '归集', '销售管理员', 'P1',
 '已登录作为线索池成员或管理员
有线索A和B\\n状态为待处理/跟进中\\n锁定正常',
 '1.进A详情
2.点「归集」\\n3.选B作目标主线索\\n4.确认',
 '1.成功
2.B的「相关线索」中显示A',
 '手册5.1+5.8:归集', '草稿'),
]

lead_en = [
('TC-ADMIN-LEAD-017', 'Lead', 'Assign Lead — to Sales Rep', 'Assign', 'Sales Admin', 'P0',
 'Logged in as Pool Admin
Unallocated lead exists',
 '1.Open X detail
2.Click Assign\\n3.Select rep\\n4.Confirm',
 '1.Done
2.Status=Pending\\n3.Owner updated',
 'Manual 5.1 Pool Admin: Assign', 'Draft'),
('TC-ADMIN-LEAD-018', 'Lead', 'Reclaim Lead — Force Reclaim', 'Reclaim', 'Sales Admin', 'P1',
 'Pool Admin
X is Pending/Following Up/Invalid',
 '1.Open X detail
2.Click Reclaim\\n3.Confirm',
 '1.Done
2.Status=Unallocated',
 'Manual 5.1: Reclaim', 'Draft'),
('TC-ADMIN-LEAD-019', 'Lead', 'Transfer Lead — to Another Pool', 'Transfer', 'Sales Admin', 'P1',
 'Pool Admin
2 pools exist',
 '1.Open X detail
2.Click Transfer\\n3.Select target pool\\n4.Confirm',
 '1.Done
2.Pool changed',
 'Manual 5.1: Transfer', 'Draft'),
('TC-ADMIN-LEAD-020', 'Lead', 'Change Owner — Admin Transfer', 'Change Owner', 'Sales Admin', 'P0',
 'Pool Admin
X Pending/Following Up/Invalid\\nNot locked',
 '1.Open X detail
2.Click Change Owner\\n3.Select new owner\\n4.Choose old owner destination (Remove/Keep as member)\\n5.Confirm',
 '1.Done
2.Owner changed\\n3.Old owner handled per choice',
 'Manual 5.7: Change Owner + Old Owner Destination', 'Draft'),
('TC-ADMIN-LEAD-021', 'Lead', 'Collect Lead — Admin Operation', 'Collect', 'Sales Admin', 'P1',
 'Pool member or Admin
A and B exist\\nA is Pending/Following Up\\nNot locked',
 '1.Open A detail
2.Click Collect\\n3.Select B as target\\n4.Confirm',
 '1.Done
2.B Related Leads shows A',
 'Manual 5.1+5.8: Collect', 'Draft'),
]

# ════════ 客户 Admin 特有 (从手册 5.1) ════════
customer_zh = [
('TC-ADMIN-CUSTOMER-014', '客户', '分配客户—管理员指派给销售', '分配/公海', '销售管理员', 'P0',
 '已登录作为公海管理员
存在未分配客户',
 '1.进X详情
2.点「分配」\\n3.选销售\\n4.确认',
 '1.成功
2.状态变已分配\\n3.负责人更新',
 '手册5.1公海操作:分配', '草稿'),
('TC-ADMIN-CUSTOMER-015', '客户', '收回客户—强制收回已分配', '收回/公海', '销售管理员', 'P1',
 '已登录作为公海管理员
X已分配',
 '1.进X详情
2.点「收回」\\n3.确认',
 '1.成功
2.变未分配',
 '手册5.1:收回', '草稿'),
('TC-ADMIN-CUSTOMER-016', '客户', '转移客户—移至另一公海', '转移/公海', '销售管理员', 'P1',
 '已登录作为公海管理员
有2个公海',
 '1.进X详情
2.点「转移」\\n3.选目标公海\\n4.确认',
 '1.成功
2.公海变更',
 '手册5.1:转移', '草稿'),
('TC-ADMIN-CUSTOMER-017', '客户', '变更负责人—管理员', '变更负责人', '销售管理员', 'P0',
 '已登录作为公海管理员
X有公海有负责人\\n规则允许',
 '1.进X详情
2.点「变更负责人」\\n3.选新负责人\\n4.确认',
 '1.成功
2.负责人更新',
 '手册5.1:变更负责人', '草稿'),
('TC-ADMIN-CUSTOMER-018', '客户', '合并客户(管理员公海场景)', '合并', '销售管理员', 'P1',
 '已登录作为公海管理员
有X和Y',
 '1.进X详情
2.点「合并」\\n3.选Y\\n4.确认',
 '1.成功
2.X成为Y下级',
 '手册5.5:合并(公海管理员场景)', '草稿'),
]
customer_en = [
('TC-ADMIN-CUSTOMER-014', 'Customer', 'Assign Customer — to Sales', 'Assign/Pool', 'Sales Admin', 'P0',
 'High Seas Admin
Unallocated customer',
 '1.X detail
2.Assign\\n3.Select rep\\n4.Confirm',
 '1.Done
2.Allocated\\n3.Owner updated',
 'Manual 5.1 Pool: Assign', 'Draft'),
('TC-ADMIN-CUSTOMER-015', 'Customer', 'Reclaim Customer — Force', 'Reclaim/Pool', 'Sales Admin', 'P1',
 'High Seas Admin
X is Allocated',
 '1.X detail
2.Reclaim\\n3.Confirm',
 '1.Done
2.Unallocated',
 'Manual 5.1: Reclaim', 'Draft'),
('TC-ADMIN-CUSTOMER-016', 'Customer', 'Transfer Customer — to Other Pool', 'Transfer/Pool', 'Sales Admin', 'P1',
 'High Seas Admin
2 pools',
 '1.X detail
2.Transfer\\n3.Select pool\\n4.Confirm',
 '1.Done
2.Pool changed',
 'Manual 5.1: Transfer', 'Draft'),
('TC-ADMIN-CUSTOMER-017', 'Customer', 'Change Owner — Admin', 'Change Owner', 'Sales Admin', 'P0',
 'High Seas Admin
X has pool+owner\\nRule allows',
 '1.X detail
2.Change Owner\\n3.Select new\\n4.Confirm',
 '1.Done
2.Owner updated',
 'Manual 5.1: Change Owner', 'Draft'),
('TC-ADMIN-CUSTOMER-018', 'Customer', 'Merge (Admin Pool scenario)', 'Merge', 'Sales Admin', 'P1',
 'High Seas Admin
X and Y exist',
 '1.X detail
2.Merge\\n3.Select Y\\n4.Confirm',
 '1.Done
2.X becomes Y sub',
 'Manual 5.5: Merge (Pool Admin scenario)', 'Draft'),
]

# ════════ 商机 Admin 特有 (从手册 7.1 权限表) ════════
opportunity_zh = [
('TC-ADMIN-OPPORTUNITY-014', '商机', '删除商机—管理员权限', '删除', '销售管理员', 'P1',
 '已登录作为销售管理员
A存在\\n无关联',
 '1.进A详情
2.点「删除」\\n3.确认',
 '1.成功
2.列表消失',
 '手册7.1:销售管理员有商机-删除权限', '草稿'),
('TC-ADMIN-OPPORTUNITY-015', '商机', '导入商机—批量Excel', '导入', '销售管理员', 'P2',
 '已登录作为销售管理员
有Excel模板',
 '1.进列表
2.点「导入」\\n3.上传Excel\\n4.选模式\\n5.确认',
 '1.完成
2.出现新商机',
 '手册7.1:仅销售管理员可导入', '草稿'),
('TC-ADMIN-OPPORTUNITY-016', '商机', '导出商机—列表导出', '导出', '销售管理员', 'P2',
 '已登录作为销售管理员
有商机数据',
 '1.进列表
2.点「导出」\\n3.选格式\\n4.确认',
 '1.下载Excel
2.含商机数据',
 '手册7.1:销售/销售管理员均可导出', '草稿'),
('TC-ADMIN-OPPORTUNITY-017', '商机', '变更商机负责人—管理员权限', '变更负责人', '销售管理员', 'P0',
 '已登录作为销售管理员
X状态为进行中或暂停',
 '1.进X详情
2.点「变更负责人」\\n3.选新负责人\\n4.确认',
 '1.成功
2.负责人更新',
 '手册5.2+7.1:销售管理员可更换负责人', '草稿'),
('TC-ADMIN-OPPORTUNITY-018', '商机', '查看全部商机—管理员权限', '查看全部', '销售管理员', 'P1',
 '已登录作为销售管理员',
 '1.进商机列表
2.查看视图\\n3.可见所有商机',
 '1.可见全部商机(包括他人的)',
 '手册7.1:仅销售管理员有商机-查看全部权限', '草稿'),
]
opportunity_en = [
('TC-ADMIN-OPPORTUNITY-014', 'Opportunity', 'Delete Opportunity', 'Delete', 'Sales Admin', 'P1',
 'Sales Admin
Oppty A exists\\nNo relations',
 '1.A detail
2.Delete\\n3.Confirm',
 '1.Done
2.Gone from list',
 'Manual 7.1: Sales Admin has Delete permission', 'Draft'),
('TC-ADMIN-OPPORTUNITY-015', 'Opportunity', 'Import Opportunities — Batch Excel', 'Import', 'Sales Admin', 'P2',
 'Sales Admin
Excel ready',
 '1.List
2.Import\\n3.Upload Excel\\n4.Select mode\\n5.Confirm',
 '1.Done
2.New opportunities',
 'Manual 7.1: Only Sales Admin can import', 'Draft'),
('TC-ADMIN-OPPORTUNITY-016', 'Opportunity', 'Export Opportunities', 'Export', 'Sales Admin', 'P2',
 'Sales Admin
Has oppties',
 '1.List
2.Export\\n3.Select format\\n4.Confirm',
 '1.Download Excel
2.Contains data',
 'Manual 7.1: Sales/Admin can export', 'Draft'),
('TC-ADMIN-OPPORTUNITY-017', 'Opportunity', 'Change Opportunity Owner', 'Change Owner', 'Sales Admin', 'P0',
 'Sales Admin
X is In Progress or Suspended',
 '1.X detail
2.Change Owner\\n3.Select new\\n4.Confirm',
 '1.Done
2.Owner updated',
 'Manual 5.2+7.1: Sales Admin can change owner', 'Draft'),
('TC-ADMIN-OPPORTUNITY-018', 'Opportunity', 'View All Opportunities', 'View All', 'Sales Admin', 'P1',
 'Sales Admin logged in',
 '1.Oppty list
2.View\\n3.See all',
 '1.All visible (including others)',
 'Manual 7.1: Only Sales Admin has View All', 'Draft'),
]

# Write
write(f'{BASE}/admin_zh/联系人.yaml', contact_zh)
write(f'{BASE}/admin_zh/线索.yaml', lead_zh)
write(f'{BASE}/admin_zh/客户.yaml', customer_zh)
write(f'{BASE}/admin_zh/商机.yaml', opportunity_zh)

write(f'{BASE}/admin_en/Contact.yaml', contact_en)
write(f'{BASE}/admin_en/Lead.yaml', lead_en)
write(f'{BASE}/admin_en/Customer.yaml', customer_en)
write(f'{BASE}/admin_en/Opportunity.yaml', opportunity_en)

print('Admin yaml files generated:')
print(f'  联系人: {len(contact_zh)} cases')
print(f'  线索: {len(lead_zh)} cases')
print(f'  客户: {len(customer_zh)} cases')
print(f'  商机: {len(opportunity_zh)} cases')
