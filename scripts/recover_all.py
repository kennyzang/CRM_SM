#!/usr/bin/env python3
"""Full data recovery - all 14 modules"""
import os

BASE = 'doc/SM测试用例-收集箱/AI输出/基础功能用例'
DIRS = ['zh','en']

def g(id, mod, name, cat, role, prio, pre, steps, exp, notes='', st='草稿'):
    return {'id':id,'mod':mod,'name':name,'cat':cat,'role':role,'prio':prio,'pre':pre,'steps':steps,'exp':exp,'notes':notes,'st':st}

def write(mod, cases, header):
    p = f'{BASE}/{mod}/{mod}.yaml'
    with open(p, 'w') as f:
        f.write('# ' + header + '\n---\ncases:\n')
        for c in cases:
            f.write(f'\n  - id: {c["id"]}\n    module: {c["mod"]}\n    name: {c["name"]}\n    category: {c["cat"]}\n    role: {c["role"]}\n    priority: {c["prio"]}\n')
            for k,v in [('pre',c['pre']),('steps',c['steps']),('exp',c['exp']),('notes',c['notes'])]:
                if v.strip():
                    f.write(f'    {k}: |\n')
                    for l in v.split('\n'):
                        f.write(f'      {l}\n')
            f.write(f'    status: {c["st"]}\n')

# ── CONTACT ──
C = lambda i,n,c,p,s,e,n2='': g(f'TC-CONTACT-{i:03d}','联系人',n,c,'销售人员','P0',p,s,e,n2)
write('zh', [
    C(1,'新建联系人 — 正常流程','新建','已登录CRM\\n有客户数据','1.进入列表页\\n2.点击新建\\n3.填姓名/性别/业务类型/手机或邮件\\n4.点击保存','1.保存成功\\n2.列表出现新记录'),
    C(2,'新建联系人 — 姓名未填','新建/校验','已登录CRM\\n在新建表单','1.选性别\\n2.选业务类型\\n3.填手机\\n4.姓名留空\\n5.保存','1.保存失败\\n2.姓名字段必填提示'),
    C(3,'新建联系人 — 性别未选','新建/校验','已登录CRM\\n在新建表单','1.填姓名\\n2.选业务类型\\n3.填手机\\n4.性别不选\\n5.保存','1.保存失败\\n2.性别字段必填提示'),
    C(4,'新建联系人 — 业务类型未选','新建/校验','已登录CRM\\n在新建表单','1.填姓名\\n2.选性别\\n3.填手机\\n4.业务类型不选\\n5.保存','1.保存失败\\n2.业务类型必填提示'),
    C(5,'新建联系人 — 手机和邮件都不填','新建/校验','已登录CRM\\n在新建表单','1.填姓名/性别/业务类型\\n2.手机留空\\n3.邮件留空\\n4.保存','1.保存失败\\n2.提示至少填一项'),
    C(6,'新建联系人 — 仅填手机(通过)','新建/校验','已登录CRM\\n在新建表单','1.填姓名/性别/业务类型\\n2.填手机\\n3.邮件留空\\n4.保存','1.保存成功'),
    C(7,'新建联系人 — 仅填邮件(通过)','新建/校验','已登录CRM\\n在新建表单','1.填姓名/性别/业务类型\\n2.手机留空\\n3.填邮件\\n4.保存','1.保存成功'),
    C(8,'新建联系人 — 不关联客户','新建/校验','已登录CRM\\n在新建表单','1.填姓名/性别/业务类型/手机\\n2.客户留空\\n3.保存','1.保存成功\\n2.未关联客户'),
    C(9,'编辑联系人 — 修改姓名和职务','编辑','已登录CRM\\n是A负责人','1.进入详情页\\n2.编辑\\n3.改姓名职务\\n4.保存','1.保存成功\\n2.姓名职务更新'),
    g('TC-CONTACT-010','联系人','删除联系人','删除','销售人员','P1','已登录CRM\\n是A负责人','1.进详情页\\n2.点删除\\n3.确认','1.删除成功\\n2.列表消失'),
    g('TC-CONTACT-011','联系人','变更负责人','权限/转移','销售人员','P1','已登录CRM\\n有B\\nA是X负责人','1.进详情页\\n2.点变更负责人\\n3.选B\\n4.确认','1.变更成功\\n2.负责人为B'),
    g('TC-CONTACT-012','联系人','添加团队成员','团队','销售人员','P1','已登录CRM\\n有C','1.进详情页\\n2.服务团队加C\\n3.保存','1.添加成功\\n2.C可见'),
    g('TC-CONTACT-013','联系人','详情页子标签页切换','详情/标签页','销售人员','P1','已登录CRM\\n有关联线索商机','1.进详情页\\n2.点Lead/Opportunity标签\\n3.切回','1.标签页正常切换'),
    g('TC-CONTACT-014','联系人','列表页视图切换 — My Contact/All','列表/视图','销售人员','P1','已登录CRM\\n有数据','1.进列表页\\n2.观察My Contact\\n3.切换到All','1.My Contact仅本人\\n2.All全部'),
    g('TC-CONTACT-015','联系人','列表搜索 — 按姓名搜索','列表/搜索','销售人员','P1','已登录CRM\\n存在张三丰','1.进列表页\\n2.输入张三丰\\n3.搜索','1.筛选出匹配'),
    g('TC-CONTACT-016','联系人','批量导入联系人 — Excel模板','导入','销售人员','P1','已登录CRM\\n有Excel模板','1.列表页点导入\\n2.上传Excel\\n3.选模式\\n4.确认','1.导入完成\\n2.显示汇总'),
], '联系人')

# ── CONTACT EN ──
CE = lambda i,n,c,p,s,e,n2='': g(f'TC-CONTACT-{i:03d}','Contact',n,c,'Sales Rep','P0',p,s,e,n2,'Draft')
EN_CONTACT = [
    CE(1,'Create Contact — Normal Flow','Create','Logged in\\nCustomer data exists','1.Open list\\n2.Click New\\n3.Fill Name/Gender/Type + Mobile/Email\\n4.Save','1.Saved\\n2.List shows record'),
    CE(2,'Create — Name Required','Create/Validation','Logged in\\nOn form','1.Select Gender\\n2.Select Type\\n3.Fill Mobile\\n4.Save with empty Name','1.Error\\n2.Name field required'),
    CE(3,'Create — Gender Required','Create/Validation','Logged in\\nOn form','1.Fill Name\\n2.Select Type\\n3.Fill Mobile\\n4.Save no Gender','1.Error\\n2.Gender required'),
    CE(4,'Create — Type Required','Create/Validation','Logged in\\nOn form','1.Fill Name\\n2.Select Gender\\n3.Fill Mobile\\n4.Save no Type','1.Error\\n2.Type required'),
    CE(5,'Create — Neither Mobile/Email','Create/Validation','Logged in\\nOn form','1.Fill Name/Gender/Type\\n2.Skip Mobile\\n3.Skip Email\\n4.Save','1.Error\\n2.At least one required'),
    CE(6,'Create — Mobile Only(Pass)','Create/Validation','Logged in\\nOn form','1.Fill Name/Gender/Type\\n2.Fill Mobile\\n3.Skip Email\\n4.Save','1.Success'),
    CE(7,'Create — Email Only(Pass)','Create/Validation','Logged in\\nOn form','1.Fill Name/Gender/Type\\n2.Skip Mobile\\n3.Fill Email\\n4.Save','1.Success'),
    CE(8,'Create — No Customer(Pass)','Create/Validation','Logged in\\nOn form','1.Fill Name/Gender/Type/Mobile\\n2.Skip Customer\\n3.Save','1.Success\\n2.No customer'),
    CE(9,'Edit — Change Name & Job Title','Edit','Logged in\\nIs owner of A','1.Open detail\\n2.Edit\\n3.Change Name/Title\\n4.Save','1.Saved\\n2.Name/Title updated'),
    g('TC-CONTACT-010','Contact','Delete Contact','Delete','Sales Rep','Draft','Logged in\\nIs owner','1.Open detail\\n2.Delete\\n3.Confirm','1.Deleted\\n2.Gone from list'),
    g('TC-CONTACT-011','Contact','Change Owner','Permission/Transfer','Sales Rep','Draft','Logged in\\nRep B exists\\nA owns X','1.Open detail\\n2.Change Owner\\n3.Select B\\n4.Confirm','1.Changed\\n2.Owner is B'),
    g('TC-CONTACT-012','Contact','Add Team Member','Team','Sales Rep','Draft','Logged in\\nRep C exists','1.Open detail\\n2.Service Team add C\\n3.Save','1.Added\\n2.C can see'),
    g('TC-CONTACT-013','Contact','Detail Sub-tab Switching','Detail/Tabs','Sales Rep','Draft','Logged in\\nHas related data','1.Open detail\\n2.Click Lead/Opportunity tabs\\n3.Switch back','1.Tabs work correctly'),
    g('TC-CONTACT-014','Contact','List View — My Contact/All','List/View','Sales Rep','Draft','Logged in\\nHas data','1.Open list\\n2.Check My Contact\\n3.Switch to All','1.My Contact only mine\\n2.All shows all'),
    g('TC-CONTACT-015','Contact','List Search — by Name','List/Search','Sales Rep','Draft','Logged in\\nZhang Sanfeng exists','1.Open list\\n2.Type Zhang Sanfeng\\n3.Search','1.Filtered'),
    g('TC-CONTACT-016','Contact','Batch Import — Excel','Import','Sales Rep','Draft','Logged in\\nExcel ready','1.List Import\\n2.Upload Excel\\n3.Select mode\\n4.Confirm','1.Import complete\\n2.Summary shown'),
]
write('en', EN_CONTACT, 'Contact')

print('✅ contact done')
import os
BASE = 'doc/SM测试用例-收集箱/AI输出/基础功能用例'

def w(f, cs, h):
    with open(f, 'w') as fp:
        fp.write(f'# {h}\n---\ncases:\n')
        for c in cs:
            fp.write(f'\n  - id: {c["i"]}\n    module: {c["m"]}\n    name: {c["n"]}\n    category: {c["c"]}\n    role: {c["r"]}\n    priority: {c["p"]}\n')
            for k in ['pre','steps','exp','notes']:
                if c.get(k,'').strip():
                    fp.write(f'    {k}: |\n')
                    for l in c[k].split('\\n'):
                        fp.write(f'      {l}\n')
            fp.write(f'    status: {c["s"]}\n')
def T(i,m,n,c,r,p,pre,steps,exp,notes='',s='草稿'):
    return {'i':f'TC-{i}','m':m,'n':n,'c':c,'r':r,'p':p,'pre':pre,'steps':steps,'exp':exp,'notes':notes,'s':s}

# SO, Contract, Delivery, PO, Invoice, Collection, Product, Kanban
# Each tuple: (prefix, zh_mod, en_mod, [(id, name_zh, name_en, cat, prio, pre, steps, exp)])

all_data = []

# Sales Order
so = [
    (1,'新建销售订单 — 正常流程','Create Sales Order — Normal Flow','Create','P0','有报价单','1.进列表\\n2.新建\\n3.填PO/下单日期\\n4.产品明细表添行\\n5.Payment Schedule填里程碑\\n6.保存','1.保存成功\\n2.编号自动'),
    (2,'新建销售订单 — PO未填','Create — PO Required','Create/Validation','P1','在表单','1.填下单日期\\n2.PO留空\\n3.保存','1.失败\\n2.PO必填'),
    (3,'新建销售订单 — 下单日期未填','Create — Order Date Required','Create/Validation','P1','在表单','1.填PO\\n2.日期留空\\n3.保存','1.失败\\n2.日期必填'),
    (4,'编辑销售订单 — 修改条款','Edit Sales Order','Edit','P1','是A负责人','1.进详情\\n2.编辑\\n3.改条款\\n4.保存','1.成功\\n2.条款更新'),
    (5,'列表搜索 — 按编号搜索','List Search — by SO No.','List/Search','P2','有多条','1.进列表\\n2.输编号\\n3.搜索','1.筛选'),
    (6,'新建销售订单 — 按百分比里程碑','Create SO — Percentage Milestones','Create','P1','有报价单','1.进表单\\n2.填必填\\n3.里程碑类型切换为按百分比\\n4.设比例验证总和100%\\n5.保存','1.成功\\n2.里程碑按比例分配'),
]
all_data.append(('TC-SO', '销售订单', 'Sales Order', so))

# Contract
ct = [
    (1,'新建合同 — 正常流程(关联销售订单)','Create Contract — Normal Flow','Create','P0','有销售订单','1.进列表\\n2.新建\\n3.填标题/销售订单/签署日期/到期日期/附件/通知对象\\n4.Reminder明细\\n5.保存','1.保存成功\\n2.编号自动'),
    (2,'新建合同 — 标题未填','Create — Title Required','Create/Validation','P0','在表单','1.填其他必填\\n2.标题留空\\n3.保存','1.失败\\n2.标题必填'),
    (3,'新建合同 — 销售订单未选','Create — SO Required','Create/Validation','P0','在表单','1.填其他必填\\n2.销售订单留空\\n3.保存','1.失败\\n2.销售订单必填'),
    (4,'新建合同 — 签署日期未填','Create — Signed Date Required','Create/Validation','P1','在表单','1.填其他必填\\n2.日期留空\\n3.保存','1.失败\\n2.日期必填'),
    (5,'新建合同 — 到期日期未填','Create — Expiry Date Required','Create/Validation','P1','在表单','1.填其他必填\\n2.到期日留空\\n3.保存','1.失败\\n2.到期日必填'),
    (6,'新建合同 — 附件未上传','Create — Attachment Required','Create/Validation','P1','在表单','1.填其他必填\\n2.附件不上传\\n3.保存','1.失败\\n2.附件必填'),
    (7,'列表搜索 — 按标题搜索','List Search — by Title','List/Search','P2','有多条','1.进列表\\n2.输标题\\n3.搜索','1.筛选'),
]
all_data.append(('TC-CONTRACT', '合同', 'Contract', ct))

# Delivery
dl = [
    (1,'新建发货单 — 正常流程(关联销售订单)','Create Delivery — Normal Flow','Create','P0','有销售订单','1.进列表\\n2.新建\\n3.填销售订单号(必填)\\n4.发货产品添产品/数量\\n5.保存','1.保存成功'),
    (2,'新建发货单 — 销售订单未选','Create — SO Required','Create/Validation','P0','在表单','1.销售订单留空\\n2.保存','1.失败\\n2.销售订单必填'),
    (3,'列表搜索 — 按销售订单搜索','List Search — by SO No.','List/Search','P2','有多条','1.进列表\\n2.输编号\\n3.搜索','1.筛选'),
]
all_data.append(('TC-DELIVERY', '交付', 'Delivery', dl))

# PO
po = [
    (1,'新建采购订单 — 正常流程','Create PO — Normal Flow','Create','P0','有报价单','1.进列表\\n2.新建\\n3.填PO编号/报价单/PO文件\\n4.保存','1.保存成功'),
    (2,'新建采购订单 — PO编号未填','Create — PO No. Required','Create/Validation','P1','在表单','1.选报价单/上传文件\\n2.PO编号留空\\n3.保存','1.失败\\n2.PO编号必填'),
    (3,'新建采购订单 — 报价单未选','Create — Quotation Required','Create/Validation','P1','在表单','1.填PO编号/上传文件\\n2.报价单留空\\n3.保存','1.失败\\n2.报价单必填'),
    (4,'新建采购订单 — PO文件未上传','Create — PO File Required','Create/Validation','P1','在表单','1.填PO编号/选报价单\\n2.文件不上传\\n3.保存','1.失败\\n2.PO文件必填'),
    (5,'列表搜索 — 按PO编号搜索','List Search — by PO No.','List/Search','P2','有多条','1.进列表\\n2.输编号\\n3.搜索','1.筛选'),
]
all_data.append(('TC-PO', '采购订单', 'PO', po))

# Invoice
inv = [
    (1,'新建开票申请 — 正常流程(选销售订单)','Create Invoice — Normal Flow','Create','P0','有销售订单','1.进列表\\n2.新建\\n3.选发票类型\\n4.填Sales Order/公司名称\\n5.保存','1.保存成功\\n2.编号自动\\n3.PI No./Ref No.自动'),
    (2,'新建开票申请 — 发票类型未选','Create — Type Required','Create/Validation','P1','在表单','1.填其他必填\\n2.发票类型不选\\n3.保存','1.失败\\n2.类型必填'),
    (3,'新建开票申请 — Sales Order未填','Create — SO Required','Create/Validation','P1','在表单','1.选发票类型/公司名称\\n2.SO留空\\n3.保存','1.失败\\n2.SO必填'),
    (4,'新建开票申请 — 公司名称未填','Create — Company Required','Create/Validation','P1','在表单','1.选发票类型/SO\\n2.公司名称留空\\n3.保存','1.失败\\n2.公司名称必填'),
    (5,'列表搜索 — 按编号搜索','List Search — by Inv. No.','List/Search','P2','有多条','1.进列表\\n2.输编号\\n3.搜索','1.筛选'),
]
all_data.append(('TC-INVOICE', '开票申请', 'Invoice', inv))

# Collection
col = [
    (1,'新建回款 — 正常流程(含付款计划明细)','Create Collection — Normal Flow','Create','P0','有客户/回款计划','1.进列表(Revenue/Customer Payment)\\n2.新建\\n3.填客户/回款日期/结算货币/金额\\n4.里程碑明细选回款计划编号+金额\\n5.保存','1.保存成功\\n2.编号自动\\n3.Allocated自动计算'),
    (2,'新建回款 — 客户名称未填','Create — Customer Required','Create/Validation','P0','在表单','1.填其他必填\\n2.客户留空\\n3.保存','1.失败\\n2.客户必填'),
    (3,'新建回款 — 回款日期未填','Create — Date Required','Create/Validation','P1','在表单','1.填其他必填\\n2.日期留空\\n3.保存','1.失败\\n2.日期必填'),
    (4,'新建回款 — 金额未填','Create — Amount Required','Create/Validation','P1','在表单','1.填其他必填\\n2.金额留空\\n3.保存','1.失败\\n2.金额必填'),
    (5,'新建回款 — 结算货币未选','Create — Currency Required','Create/Validation','P1','在表单','1.填其他必填\\n2.货币不选\\n3.保存','1.失败\\n2.货币必填'),
    (6,'列表搜索 — 按客户名称搜索','List Search — by Customer','List/Search','P2','有多条','1.进列表\\n2.输客户名\\n3.搜索','1.筛选'),
]
all_data.append(('TC-COLLECTION', '回款', 'Collection', col))

# Product
prod = [
    (1,'新建产品 — 正常流程','Create Product — Normal Flow','Create','P0','有供应商','1.进列表(产品管理)\\n2.新建\\n3.填产品名称/编码/类型/供应商/采购单价/结算货币\\n4.保存','1.保存成功\\n2.已上架'),
    (2,'新建产品 — 名称未填','Create — Name Required','Create/Validation','P0','在表单','1.填其他必填\\n2.名称留空\\n3.保存','1.失败\\n2.名称必填'),
    (3,'新建产品 — 编码未填','Create — Code Required','Create/Validation','P0','在表单','1.填其他必填\\n2.编码留空\\n3.保存','1.失败\\n2.编码必填'),
    (4,'新建产品 — 类型未选','Create — Type Required','Create/Validation','P1','在表单','1.填其他必填\\n2.类型不选\\n3.保存','1.失败\\n2.类型必填'),
    (5,'新建产品 — 供应商未选','Create — Principal Required','Create/Validation','P1','在表单','1.填其他必填\\n2.供应商不选\\n3.保存','1.失败\\n2.供应商必填'),
    (6,'列表搜索 — 按名称搜索','List Search — by Name','List/Search','P2','有多条','1.进列表\\n2.输名称\\n3.搜索','1.筛选'),
]
all_data.append(('TC-PRODUCT', '产品', 'Product', prod))

# Kanban
kan = [
    (1,'查看管道看板 — 验证阶段磁贴','View Kanban — Verify Stage Tiles','View','P0','已登录CRM\\n有数据','1.进看板(CRM/Pipeline)\\n2.观察7个阶段磁贴\\n3.记录数量和金额','1.7磁贴:Lead/Opportunity/Quotation/PO/SO/PI/Payment\\n2.各显示数量和金额'),
    (2,'点击阶段磁贴筛选','Filter by Stage Tile','Filter','P1','数据已加载','1.进看板\\n2.点某磁贴\\n3.观察列表变化\\n4.点Reset','1.点击后仅显示该阶段\\n2.Reset恢复全部'),
    (3,'时间筛选 — 年度/月度','Time Period Filter','Filter','P1','数据已加载','1.进看板\\n2.点This Year\\n3.点This Month\\n4.点Custom','1.各时间选项数据变化'),
    (4,'查看管道交易列表','View Deal List','View','P1','列表有数据','1.进看板\\n2.看Pipeline Deals列表\\n3.点项目名','1.列:Project/Amount/Rep/Stage/Date\\n2.点名称进详情'),
]
all_data.append(('TC-KANBAN', '管道看板', 'Pipeline Kanban', kan))

# Generate with proper roles
for prefix, zh_mod, en_mod, data in all_data:
    zh_cases = []
    en_cases = []
    for d in data:
        nid, nzh, nen, cat, prio, pre, steps, exp = d
        zh_cases.append({'i':f'{prefix}-{nid:03d}','m':zh_mod,'n':nzh,'c':cat,'r':'销售人员','p':prio,'pre':pre,'steps':steps,'exp':exp,'notes':'','s':'草稿'})
        en_cases.append({'i':f'{prefix}-{nid:03d}','m':en_mod,'n':nen,'c':cat,'r':'Sales Rep','p':prio,'pre':pre,'steps':steps,'exp':exp,'notes':'','s':'Draft'})
    w(f'{BASE}/zh/{zh_mod}.yaml', zh_cases, zh_mod)
    w(f'{BASE}/en/{en_mod}.yaml', en_cases, en_mod)
    print(f'  {zh_mod} ({len(data)})')
print('All 14 modules generated!')
