#!/usr/bin/env python3
import os
BASE = 'doc/SM测试用例-收集箱/AI输出/基础功能用例'

def write_yaml(path, cases):
    with open(path, 'w') as f:
        f.write('---\ncases:\n')
        for c in cases:
            f.write(f'\n  - id: {c["i"]}\n    module: {c["m"]}\n    name: {c["n"]}\n    category: {c["c"]}\n    role: {c["r"]}\n    priority: {c["p"]}\n')
            for k in ['pre','steps','exp','notes']:
                if c.get(k,'').strip():
                    f.write(f'    {k}: |\n')
                    for l in c[k].split('\n'):
                        f.write(f'      {l}\n')
            f.write(f'    status: {c["s"]}\n')

# Define a case
def C(i, m, n, c, r, p, pre, steps, exp, notes='', s=None):
    return {'i':i,'m':m,'n':n,'c':c,'r':r,'p':p,'pre':pre,'steps':steps,'exp':exp,'notes':notes,'s':s or ('草稿' if '销售' in r else 'Draft')}

# Module definitions: (prefix, mod_zh, mod_en, [(num, name_zh, name_en, cat, prio, pre_zh, steps_zh, exp_zh)])
# For en, use pre_en, steps_en, exp_en if different (same if omitted)

MODS = []

# contact
MODS.append(('TC-CONTACT','联系人','Contact',[
(1,'新建联系人—正常流程','Create Contact—Normal Flow','Create','P0','已登录\\n有客户','1.进列表\\n2.新建\\n3.填姓名/性别/业务类型+手机/邮件\\n4.保存','1.成功\\n2.列表显示','Logged in\\nCustomer exists','1.Open list\\n2.New\\n3.Fill Name/Gender/Type+Mobile/Email\\n4.Save','1.Saved\\n2.List shows'),
(2,'新建联系人—姓名未填','Create—Name Required','Create/Validation','P0','在表单','1.选性别\\n2.选类型\\n3.填手机\\n4.姓名留空\\n5.保存','1.失败\\n2.姓名必填','On form','1.Select Gender\\n2.Select Type\\n3.Fill Mobile\\n4.Save no Name','1.Fail\\n2.Name required'),
(3,'新建联系人—性别未选','Create—Gender Required','Create/Validation','P0','在表单','1.填姓名\\n2.选类型\\n3.填手机\\n4.性别不选\\n5.保存','1.失败\\n2.性别必填','On form','1.Fill Name\\n2.Select Type\\n3.Fill Mobile\\n4.Save no Gender','1.Fail\\n2.Gender required'),
(4,'新建联系人—业务类型未选','Create—Type Required','Create/Validation','P0','在表单','1.填姓名\\n2.选性别\\n3.填手机\\n4.类型不选\\n5.保存','1.失败\\n2.类型必填','On form','1.Fill Name\\n2.Select Gender\\n3.Fill Mobile\\n4.Save no Type','1.Fail\\n2.Type required'),
(5,'新建联系人—手机邮件都不填','Create—Neither Mobile/Email','Create/Validation','P0','在表单','1.填姓名/性别/类型\\n2.手机留空\\n3.邮件留空\\n4.保存','1.失败\\n2.至少填一项','On form','1.Fill Name/Gender/Type\\n2.Skip Mobile\\n3.Skip Email\\n4.Save','1.Fail\\n2.At least one'),
(6,'新建联系人—仅填手机','Create—Mobile Only','Create/Validation','P1','在表单','1.填姓名/性别/类型\\n2.填手机\\n3.邮件留空\\n4.保存','1.成功','On form','1.Fill Name/Gender/Type\\n2.Fill Mobile\\n3.Skip Email\\n4.Save','1.Success'),
(7,'新建联系人—仅填邮件','Create—Email Only','Create/Validation','P1','在表单','1.填姓名/性别/类型\\n2.手机留空\\n3.填邮件\\n4.保存','1.成功','On form','1.Fill Name/Gender/Type\\n2.Skip Mobile\\n3.Fill Email\\n4.Save','1.Success'),
(8,'新建联系人—不关联客户','Create—No Customer','Create/Validation','P2','在表单','1.填姓名/性别/类型/手机\\n2.客户留空\\n3.保存','1.成功\\n2.未关联','On form','1.Fill Name/Gender/Type/Mobile\\n2.Skip Customer\\n3.Save','1.Success\\n2.No customer'),
(9,'编辑联系人—改姓名职务','Edit—Change Name/Title','Edit','P0','已登录\\n是A负责人','1.进详情\\n2.编辑\\n3.改姓名/职务\\n4.保存','1.成功\\n2.更新','Logged in\\nIs owner of A','1.Open detail\\n2.Edit\\n3.Change Name/Title\\n4.Save','1.Saved\\n2.Updated'),
(10,'删除联系人','Delete Contact','Delete','P1','已登录\\n是负责人','1.进详情\\n2.删除\\n3.确认','1.删除成功\\n2.列表消失','Logged in\\nIs owner','1.Open detail\\n2.Delete\\n3.Confirm','1.Deleted\\n2.Gone'),
(11,'变更负责人','Change Owner','Permission/Transfer','P1','有B\\nA是X负责人','1.进详情\\n2.变更负责人\\n3.选B\\n4.确认','1.变更成功\\n2.负责人B','Rep B exists\\nA owns X','1.Open detail\\n2.Change Owner\\n3.Select B\\n4.Confirm','1.Changed\\n2.Owner=B'),
(12,'添加团队成员','Add Team Member','Team','P1','有C','1.进详情\\n2.服务团队加C\\n3.保存','1.成功\\n2.C可见','Rep C exists','1.Open detail\\n2.Service Team add C\\n3.Save','1.Added\\n2.C sees'),
(13,'详情页子标签切换','Detail Sub-tab Switching','Detail/Tabs','P1','有关联数据','1.进详情\\n2.点Lead/Oppty标签\\n3.切回','1.标签正常','Has related data','1.Open detail\\n2.Click Lead/Oppty\\n3.Switch back','1.Tabs work'),
(14,'列表视图—My Contact/All','List View—My Contact/All','List/View','P1','有数据','1.进列表\\n2.看My Contact\\n3.切All','1.My Contact仅本人\\n2.All全部','Has data','1.Open list\\n2.Check My Contact\\n3.Switch All','1.My Contact=mine\\n2.All=all'),
(15,'列表搜索—按姓名','List Search—by Name','List/Search','P1','有张三丰','1.进列表\\n2.输姓名\\n3.搜索','1.筛选出','Zhang Sanfeng exists','1.Open list\\n2.Type name\\n3.Search','1.Filtered'),
(16,'批量导入—Excel','Batch Import—Excel','Import','P1','有Excel模板','1.进列表\\n2.导入\\n3.上传Excel\\n4.选模式\\n5.确认','1.导入完成\\n2.显示汇总','Excel ready','1.Open list\\n2.Import\\n3.Upload Excel\\n4.Select mode\\n5.Confirm','1.Done\\n2.Summary'),
]))

# lead
MODS.append(('TC-LEAD','线索','Lead',[
(1,'新建线索—正常流程','Create Lead—Normal Flow','Create','P0','已登录\\n有产品','1.进列表\\n2.新建\\n3.填名称/池/客户类型/来源/级别/详情/业务流程/交易类别\\n4.产品表添行\\n5.保存','1.成功\\n2.状态待处理','Logged in\\nProducts exist','1.Open list\\n2.New\\n3.Fill Name/Pool/CustomerType/Source/Level/Details/Pipeline/DealCategory\\n4.Product table add row\\n5.Save','1.Saved\\n2.Status=Pending'),
(2,'新建线索—名称未填','Create—Name Required','Create/Validation','P0','在表单','1.填其他必填\\n2.名称留空\\n3.保存','1.失败\\n2.名称必填'),
(3,'新建线索—线索池未选','Create—Pool Required','Create/Validation','P0','在表单','1.填其他必填\\n2.池不选\\n3.保存','1.失败\\n2.池必填'),
(4,'新建线索—来源未选','Create—Source Required','Create/Validation','P1','在表单','1.填其他必填\\n2.来源不选\\n3.保存','1.失败\\n2.来源必填'),
(5,'新建线索—级别未选','Create—Level Required','Create/Validation','P1','在表单','1.填其他\\n2.级别不选\\n3.保存','1.失败\\n2.级别必填'),
(6,'新建线索—详情未填','Create—Details Required','Create/Validation','P0','在表单','1.填其他\\n2.详情留空\\n3.保存','1.失败\\n2.详情必填'),
(7,'新建线索—交易类别未选','Create—DealCategory Required','Create/Validation','P1','在表单','1.填其他\\n2.类别不选\\n3.保存','1.失败\\n2.类别必填'),
(8,'新建线索—产品表未填','Create—ProductTable Empty','Create/Validation','P0','在表单\\n必填已填','1.必填都填\\n2.产品表不添\\n3.保存','1.失败\\n2.需至少一行'),
(9,'编辑线索—改名称级别','Edit Lead','Edit','P0','是A负责人\\n未锁定','1.进详情\\n2.编辑\\n3.改名称/级别\\n4.保存','1.成功'),
(10,'详情页子标签切换','Detail Sub-tab Switching','Detail/Tabs','P1','有关联数据','1.进详情\\n2.点流转记录/联系人/商机/相关线索/转化记录','1.各标签正确'),
(11,'添加团队成员','Add Team Member','Team','P1','有B','1.进详情\\n2.服务团队加B\\n3.设权限\\n4.保存','1.成功\\n2.B在My Involved'),
(12,'列表视图切换','List View Switching','List/View','P1','团队有数据','1.进列表\\n2.点我拥有/团队/参与/全部','1.4视图正确'),
(13,'列表搜索—按电话','List Search—by Phone','List/Search','P2','电话012-3456789','1.进列表\\n2.输电话\\n3.搜索','1.筛选'),
(14,'线索转化—前提条件','Lead Conversion Prereqs','Conversion','P1','状态待处理\\n是负责人','1.进详情\\n2.跟进中\\n3.看转化按钮','1.待处理不可见\\n2.跟进中出现'),
(15,'锁定/解锁线索','Lock/Unlock Lead','Permission','P1','是X负责人','1.进详情\\n2.锁定\\n3.试编辑\\n4.解锁','1.锁定不可编辑\\n2.解锁后可编辑'),
(16,'归集线索—A到B','Collect Lead A into B','Relation','P1','有A和B\\n是池成员','1.进A详情\\n2.归集\\n3.选B\\n4.确认','1.成功\\n2.B相关线索显A'),
]))

# customer  
MODS.append(('TC-CUSTOMER','客户','Customer',[
(1,'新建客户—正常流程','Create Customer—Normal Flow','Create','P0','已登录\\n注册码未占','1.进列表\\n2.新建\\n3.填名称/注册码/类型/来源\\n4.地址表添行\\n5.保存','1.成功\\n2.编号自动\\n3.已分配'),
(2,'新建客户—名称未填','Create—Name Required','Create/Validation','P0','在表单','1.填其他\\n2.名称留空\\n3.保存','1.失败\\n2.名称必填'),
(3,'新建客户—注册码未填','Create—RegCode Required','Create/Validation','P0','在表单','1.填其他\\n2.注册码留空\\n3.保存','1.失败\\n2.注册码必填'),
(4,'新建客户—类型未选','Create—Type Required','Create/Validation','P0','在表单','1.填其他\\n2.类型不选\\n3.保存','1.失败\\n2.类型必填'),
(5,'新建客户—来源未选','Create—Source Required','Create/Validation','P1','在表单','1.填其他\\n2.来源不选\\n3.保存','1.失败\\n2.来源必填'),
(6,'新建客户—注册码重复','Create—Duplicate RegCode','Create/Validation','P1','已有REG-001','1.填名称\\n2.填REG-001\\n3.其他\\n4.保存','1.失败\\n2.提示重复'),
(7,'编辑客户—改名称电话','Edit Customer','Edit','P0','是A负责人','1.进详情\\n2.编辑\\n3.改名称/电话\\n4.保存','1.成功\\n2.更新'),
(8,'详情页子标签切换','Detail Sub-tab Switching','Detail/Tabs','P1','有关联数据','1.进详情\\n2.点各标签','1.各标签正确'),
(9,'列表视图切换','List View Switching','List/View','P1','团队有数据','1.进列表\\n2.点各视图','1.4视图正确'),
(10,'列表搜索—按名称','List Search—by Name','List/Search','P2','有Securemetric','1.进列表\\n2.输名称\\n3.搜索','1.筛选'),
(11,'退回公海','Return to Pool','Pool','P0','是A负责人\\nA已分配','1.进详情\\n2.退回\\n3.选原因\\n4.确认','1.成功\\n2.未分配\\n3.负责人清空'),
(12,'合并客户A到B','Merge A into B','Merge','P1','有A和B','1.进A详情\\n2.合并\\n3.选B\\n4.确认','1.成功\\n2.A为B下级'),
(13,'客户流失','Customer Lost','Lifecycle','P1','是A负责人\\n未流失','1.进详情\\n2.客户流失\\n3.确认','1.生命周期变Lost'),
]))

# opportunity
MODS.append(('TC-OPPORTUNITY','商机','Opportunity',[
(1,'新建商机—正常流程','Create Oppty—Normal Flow','Create','P0','有客户和产品','1.进列表\\n2.新建\\n3.填名称/客户/Contacts/结单日期/业务流程/交易类别/Currency\\n4.PA表添产品\\n5.提交','1.成功\\n2.编号自动\\n3.未开始'),
(2,'新建商机—名称未填','Create—Name Required','Create/Validation','P0','在表单','1.填其他\\n2.名称留空\\n3.提交','1.失败\\n2.名称必填'),
(3,'新建商机—客户未填','Create—Customer Required','Create/Validation','P0','在表单','1.填其他\\n2.客户留空\\n3.提交','1.失败\\n2.客户必填'),
(4,'新建商机—结单日期未填','Create—CloseDate Required','Create/Validation','P1','在表单','1.填其他\\n2.日期留空\\n3.提交','1.失败\\n2.日期必填'),
(5,'新建商机—Contacts未填','Create—Contacts Required','Create/Validation','P1','在表单','1.填其他\\n2.Contacts留空\\n3.提交','1.失败\\n2.Contacts必填'),
(6,'新建商机—交易类别未选','Create—DealCat Required','Create/Validation','P1','在表单','1.填其他\\n2.类别不选\\n3.提交','1.失败\\n2.类别必填'),
(7,'新建商机—业务流程未选','Create—Pipeline Required','Create/Validation','P1','在表单','1.填其他\\n2.流程不选\\n3.提交','1.失败\\n2.流程必填'),
(8,'新建商机—Currency未选','Create—Currency Required','Create/Validation','P1','在表单','1.填其他\\n2.Currency不选\\n3.提交','1.失败\\n2.Currency必填'),
(9,'编辑商机—改名称赢率','Edit Oppty','Edit','P0','是A负责人','1.进详情\\n2.编辑\\n3.改名称/赢率\\n4.提交','1.成功'),
(10,'详情页子标签切换','Detail Sub-tab Switching','Detail/Tabs','P1','有关联数据','1.进详情\\n2.点各标签','1.各标签正确'),
(11,'列表视图切换','List View Switching','List/View','P1','团队有数据','1.进列表\\n2.点Owned/Team/Involved/All','1.4视图正确'),
(12,'列表搜索—按名称','List Search—by Name','List/Search','P2','有多条','1.进列表\\n2.输名称\\n3.搜索','1.筛选'),
(13,'暂停/恢复商机','Suspend/Resume Oppty','Detail/Action','P1','是X负责人\\nX进行中','1.进详情\\n2.Suspend\\n3.确认\\n4.观察','1.暂停成功\\n2.Open出现\\n3.阶段不变'),
]))

# Add remaining modules
MODS.append(('TC-PL','P&L','P&L',[
(1,'新建P&L—正常流程','Create P&L—Normal Flow','Create','P0','有进行中商机','1.进列表\\n2.新建\\n3.选商机/生效时间\\n4.Submit','1.成功\\n2.Version自动'),
(2,'新建P&L—商机未选','Create—Oppty Required','Create/Validation','P1','在表单','1.填时间\\n2.商机留空\\n3.Submit','1.失败\\n2.商机必填'),
(3,'新建P&L—时间未填','Create—Date Required','Create/Validation','P1','在表单','1.选商机\\n2.时间留空\\n3.Submit','1.失败\\n2.时间必填'),
(4,'编辑P&L—改Margin','Edit P&L','Edit','P1','是创建人','1.进详情\\n2.编辑\\n3.改Margin\\n4.Submit','1.成功'),
(5,'列表搜索','List Search','List/Search','P2','有多条','1.进列表\\n2.输关键词\\n3.搜索','1.筛选'),
])))
MODS.append(('TC-QUOTATION','报价单','Quotation',[
(1,'新建报价单—正常流程','Create Quotation—Normal','Create','P0','有已审批P&L','1.进列表\\n2.新建\\n3.填Header/P&L/Date\\n4.确认自动填充\\n5.Submit','1.成功\\n2.编号自动'),
(2,'新建报价单—P&L未填','Create—P&L Required','Create/Validation','P1','在表单','1.填Header/Date\\n2.P&L留空\\n3.Submit','1.失败\\n2.P&L必填'),
(3,'新建报价单—Header未填','Create—Header Required','Create/Validation','P1','在表单','1.选P&L/Date\\n2.Header留空\\n3.Submit','1.失败\\n2.Header必填'),
(4,'新建报价单—Date未填','Create—Date Required','Create/Validation','P1','在表单','1.填Header/选P&L\\n2.Date留空\\n3.Submit','1.失败\\n2.Date必填'),
(5,'P&L自动填充验证','P&L Auto-fill','Create/Linkage','P1','有已审批P&L','1.填Header/Date\\n2.选P&L\\n3.观察','1.Currency/Oppty/产品自动'),
(6,'列表搜索—按标题','List Search—by Header','List/Search','P2','有多条','1.进列表\\n2.输标题\\n3.搜索','1.筛选'),
])))
MODS.append(('TC-SO','销售订单','Sales Order',[
(1,'新建销售订单—正常流程','Create SO—Normal Flow','Create','P0','有报价单','1.进列表\\n2.新建\\n3.填PO/下单日期\\n4.产品表添行\\n5.Payment Schedule填里程碑\\n6.保存','1.成功\\n2.编号自动'),
(2,'新建—PO未填','Create—PO Required','Create/Validation','P1','在表单','1.填日期\\n2.PO留空\\n3.保存','1.失败\\n2.PO必填'),
(3,'新建—下单日期未填','Create—Date Required','Create/Validation','P1','在表单','1.填PO\\n2.日期留空\\n3.保存','1.失败\\n2.日期必填'),
(4,'编辑—改条款','Edit SO','Edit','P1','是A负责人','1.进详情\\n2.编辑\\n3.改条款\\n4.保存','1.成功\\n2.条款更新'),
(5,'列表搜索—按编号','List Search—by No.','List/Search','P2','有多条','1.进列表\\n2.输编号\\n3.搜索','1.筛选'),
(6,'新建—按百分比里程碑','Create—Pct Milestones','Create','P1','有报价单','1.进表单\\n2.填必填\\n3.里程碑类型切按百分比\\n4.设比例验证100%\\n5.保存','1.成功\\n2.里程碑按比例'),
])))
MODS.append(('TC-CONTRACT','合同','Contract',[
(1,'新建合同—正常流程','Create Contract—Normal','Create','P0','有销售订单','1.进列表\\n2.新建\\n3.填标题/销售订单/签署日期/到期日期/附件/通知对象\\n4.Reminder明细\\n5.保存','1.成功\\n2.编号自动'),
(2,'新建—标题未填','Create—Title Required','Create/Validation','P0','在表单','1.填其他\\n2.标题留空\\n3.保存','1.失败\\n2.标题必填'),
(3,'新建—销售订单未选','Create—SO Required','Create/Validation','P0','在表单','1.填其他\\n2.SO留空\\n3.保存','1.失败\\n2.SO必填'),
(4,'新建—签署日期未填','Create—SignedDate Required','Create/Validation','P1','在表单','1.填其他\\n2.日期留空\\n3.保存','1.失败\\n2.日期必填'),
(5,'新建—到期日期未填','Create—Expiry Required','Create/Validation','P1','在表单','1.填其他\\n2.到期留空\\n3.保存','1.失败\\n2.到期必填'),
(6,'新建—附件未上传','Create—Attachment Required','Create/Validation','P1','在表单','1.填其他\\n2.不上传附件\\n3.保存','1.失败\\n2.附件必填'),
(7,'列表搜索—按标题','List Search—by Title','List/Search','P2','有多条','1.进列表\\n2.输标题\\n3.搜索','1.筛选'),
])))
MODS.append(('TC-DELIVERY','交付','Delivery',[
(1,'新建发货单—正常流程','Create Delivery—Normal','Create','P0','有销售订单','1.进列表\\n2.新建\\n3.填销售订单号\\n4.发货产品添产品/数量\\n5.保存','1.成功'),
(2,'新建—销售订单未选','Create—SO Required','Create/Validation','P0','在表单','1.销售订单留空\\n2.保存','1.失败\\n2.SO必填'),
(3,'列表搜索','List Search','List/Search','P2','有多条','1.进列表\\n2.输编号\\n3.搜索','1.筛选'),
])))
MODS.append(('TC-PO','采购订单','PO',[
(1,'新建采购订单—正常流程','Create PO—Normal','Create','P0','有报价单','1.进列表\\n2.新建\\n3.填PO编号/报价单/PO文件\\n4.保存','1.成功'),
(2,'新建—PO编号未填','Create—PO No. Required','Create/Validation','P1','在表单','1.选报价单/上传文件\\n2.PO号留空\\n3.保存','1.失败\\n2.PO号必填'),
(3,'新建—报价单未选','Create—Quotation Required','Create/Validation','P1','在表单','1.填PO号/上传文件\\n2.报价单留空\\n3.保存','1.失败\\n2.报价单必填'),
(4,'新建—PO文件未上传','Create—PO File Required','Create/Validation','P1','在表单','1.填PO号/选报价单\\n2.文件不上传\\n3.保存','1.失败\\n2.文件必填'),
(5,'列表搜索—按PO编号','List Search—by PO No.','List/Search','P2','有多条','1.进列表\\n2.输编号\\n3.搜索','1.筛选'),
])))
MODS.append(('TC-INVOICE','开票申请','Invoice',[
(1,'新建开票申请—正常流程','Create Invoice—Normal','Create','P0','有销售订单','1.进列表\\n2.新建\\n3.选发票类型\\n4.填SO/公司名称\\n5.保存','1.成功\\n2.编号\\n3.PI/Ref自动'),
(2,'新建—发票类型未选','Create—Type Required','Create/Validation','P1','在表单','1.填其他\\n2.类型不选\\n3.保存','1.失败\\n2.类型必填'),
(3,'新建—SO未填','Create—SO Required','Create/Validation','P1','在表单','1.选类型/填公司\\n2.SO留空\\n3.保存','1.失败\\n2.SO必填'),
(4,'新建—公司名称未填','Create—Company Required','Create/Validation','P1','在表单','1.选类型/SO\\n2.公司留空\\n3.保存','1.失败\\n2.公司必填'),
(5,'列表搜索','List Search','List/Search','P2','有多条','1.进列表\\n2.输编号\\n3.搜索','1.筛选'),
])))
MODS.append(('TC-COLLECTION','回款','Collection',[
(1,'新建回款—正常流程','Create Collection—Normal','Create','P0','有客户/回款计划','1.进列表(Revenue)\\n2.新建\\n3.填客户/日期/货币/金额\\n4.里程碑明细选计划/金额\\n5.保存','1.成功\\n2.编号\\n3.Allocated自动'),
(2,'新建—客户未填','Create—Customer Required','Create/Validation','P0','在表单','1.填其他\\n2.客户留空\\n3.保存','1.失败\\n2.客户必填'),
(3,'新建—日期未填','Create—Date Required','Create/Validation','P1','在表单','1.填其他\\n2.日期留空\\n3.保存','1.失败\\n2.日期必填'),
(4,'新建—金额未填','Create—Amount Required','Create/Validation','P1','在表单','1.填其他\\n2.金额留空\\n3.保存','1.失败\\n2.金额必填'),
(5,'新建—货币未选','Create—Currency Required','Create/Validation','P1','在表单','1.填其他\\n2.货币不选\\n3.保存','1.失败\\n2.货币必填'),
(6,'列表搜索','List Search','List/Search','P2','有多条','1.进列表\\n2.输客户名\\n3.搜索','1.筛选'),
])))
MODS.append(('TC-PRODUCT','产品','Product',[
(1,'新建产品—正常流程','Create Product—Normal','Create','P0','有供应商','1.进列表\\n2.新建\\n3.填名称/编码/类型/供应商/单价/货币\\n4.保存','1.成功\\n2.已上架'),
(2,'新建—名称未填','Create—Name Required','Create/Validation','P0','在表单','1.填其他\\n2.名称留空\\n3.保存','1.失败\\n2.名称必填'),
(3,'新建—编码未填','Create—Code Required','Create/Validation','P0','在表单','1.填其他\\n2.编码留空\\n3.保存','1.失败\\n2.编码必填'),
(4,'新建—类型未选','Create—Type Required','Create/Validation','P1','在表单','1.填其他\\n2.类型不选\\n3.保存','1.失败\\n2.类型必填'),
(5,'新建—供应商未选','Create—Principal Required','Create/Validation','P1','在表单','1.填其他\\n2.供应商不选\\n3.保存','1.失败\\n2.供应商必填'),
(6,'列表搜索','List Search','List/Search','P2','有多条','1.进列表\\n2.输名称\\n3.搜索','1.筛选'),
])))
MODS.append(('TC-KANBAN','管道看板','Pipeline Kanban',[
(1,'查看看板—验证阶段磁贴','View Kanban—Stage Tiles','View','P0','已登录\\n有数据','1.进看板\\n2.观察7磁贴\\n3.记录数量和金额','1.7磁贴:Lead/Oppty/Qtn/PO/SO/PI/Pmt\\n2.各显示数量和金额'),
(2,'点击磁贴筛选','Filter by Stage Tile','Filter','P1','数据已加载','1.进看板\\n2.点磁贴\\n3.看列表\\n4.Reset','1.点击后仅该阶段\\n2.Reset恢复'),
(3,'时间筛选','Time Period Filter','Filter','P1','数据已加载','1.进看板\\n2.This Year\\n3.This Month\\n4.Custom','1.各时间数据变化'),
(4,'查看交易列表','View Deal List','View','P1','列表有数据','1.进看板\\n2.看列表\\n3.点项目名','1.列:Project/Amount/Rep/Stage/Date\\n2.点名称进详情'),
])))

# Generate all
for prefix, mod_zh, mod_en, data in MODS:
    zh_cases = []
    en_cases = []
    for d in data:
        num, nzh, nen, cat, prio = d[0], d[1], d[2], d[3], d[4]
        pre_zh = d[5]; steps_zh = d[6]; exp_zh = d[7]
        pre_en = d[8] if len(d) > 8 else pre_zh
        steps_en = d[9] if len(d) > 9 else steps_zh
        exp_en = d[10] if len(d) > 10 else exp_zh
        zh_cases.append(C(f'{prefix}-{num:03d}', mod_zh, nzh, cat, '销售人员', prio, pre_zh, steps_zh, exp_zh))
        en_cases.append(C(f'{prefix}-{num:03d}', mod_en, nen, cat, 'Sales Rep', prio, pre_en, steps_en, exp_en, s='Draft'))
    
    write_yaml(f'{BASE}/zh/{mod_zh}.yaml', zh_cases)
    write_yaml(f'{BASE}/en/{mod_en}.yaml', en_cases)
    print(f'  {mod_zh} ({len(zh_cases)}) / {mod_en} ({len(en_cases)})')

print('All 14 modules done!')
