#!/usr/bin/env python3
import os
BASE = 'doc/SM测试用例-收集箱/AI输出/基础功能用例'

def write(prefix, mod_zh, mod_en, zh, en):
    for lang, mod, data in [('zh',mod_zh,zh), ('en',mod_en,en)]:
        p = f'{BASE}/{lang}/{mod}.yaml'
        with open(p, 'w') as f:
            f.write('---\ncases:\n')
            for i,d in enumerate(data):
                nid = i+1
                f.write(f'\n  - id: {prefix}-{nid:03d}\n    module: {d[0]}\n    name: {d[1]}\n    category: {d[2]}\n    role: {d[3]}\n    priority: {d[4]}\n')
                for ki,k in enumerate(['precondition','steps','expected','notes']):
                    v = d[5+ki]
                    if v:
                        f.write(f'    {k}: |\n')
                        for l in v.split('\n'):
                            f.write(f'      {l}\n')
                st = d[9] if len(d)>9 else ('草稿' if '销售' in d[3] or '管理' in d[3] else 'Draft')
                f.write(f'    status: {st}\n')

Zh = lambda m: lambda n,c,p,pre,steps,exp,notes='',st='草稿': (m,n,c,'销售人员',p,pre,steps,exp,notes,st)
En = lambda m: lambda n,c,p,pre,steps,exp,notes='',st='Draft': (m,n,c,'Sales Rep',p,pre,steps,exp,notes,st)

def R(*args): return args

def gen_lead():
    write('TC-LEAD','线索','Lead',[
        R(Zh('线索'),'新建线索—正常流程','Create','P0','已登录;有产品','1.列表
2.新建\\n3.填名称/池/类型/来源/级别/详情/流程/类别\\n4.产品表添行\\n5.保存','1.成功
2.待处理'),
    ],[])

# Quick test function
print('Starting generation...')

# CUSTOMER
write('TC-CUSTOMER','客户','Customer',
    [Zh('客户')('新建客户—正常流程','Create','P0','已登录;注册码未占','1.列表
2.新建\\n3.名称/注册码/类型/来源\\n4.地址表\\n5.保存','1.成功
2.编号自动\\n3.已分配'),
     Zh('客户')('名称未填','Create/Validation','P0','在表单','1.填其他
2.名称留空\\n3.保存','1.失败
2.名称必填'),
     Zh('客户')('注册码未填','Create/Validation','P0','在表单','1.填其他
2.注册码留空\\n3.保存','1.失败
2.注册码必填'),
     Zh('客户')('类型未选','Create/Validation','P0','在表单','1.填其他
2.类型不选\\n3.保存','1.失败
2.类型必填'),
     Zh('客户')('来源未选','Create/Validation','P1','在表单','1.填其他
2.来源不选\\n3.保存','1.失败
2.来源必填'),
     Zh('客户')('注册码重复','Create/Validation','P1','已有REG-001','1.填名称
2.填REG-001\\n3.其他\\n4.保存','1.失败
2.提示重复'),
     Zh('客户')('编辑—改名称电话','Edit','P0','是A负责人','1.详情
2.编辑\\n3.改名称/电话\\n4.保存','1.成功
2.更新'),
     Zh('客户')('详情页子标签','Detail/Tabs','P1','有关联数据','1.详情
2.点各标签','1.各标签正确'),
     Zh('客户')('列表视图切换','List/View','P1','团队有数据','1.列表
2.点各视图','1.4视图正确'),
     Zh('客户')('列表搜索—按名称','List/Search','P2','有Securemetric','1.列表
2.输名称\\n3.搜索','1.筛选'),
     Zh('客户')('退回公海','Pool','P0','是A负责人;A已分配','1.详情
2.退回\\n3.选原因\\n4.确认','1.成功
2.未分配\\n3.负责人清空'),
     Zh('客户')('合并A到B','Merge','P1','有A和B','1.A详情
2.合并\\n3.选B\\n4.确认','1.成功
2.A是B下级'),
     Zh('客户')('客户流失','Lifecycle','P1','是A负责人;未流失','1.详情
2.客户流失\\n3.确认','1.生命周期变Lost')],
    [En('Customer')('Create—Normal Flow','Create','P0','Logged in;RegCode free','1.List
2.New\\n3.Name/RegCode/Type/Source\\n4.Address table\\n5.Save','1.Saved
2.ID auto\\n3.Allocated'),
     En('Customer')('Create—Name Required','Create/Validation','P0','On form','1.Fill other
2.Name empty\\n3.Save','1.Fail
2.Name required'),
     En('Customer')('Create—RegCode Required','Create/Validation','P0','On form','1.Fill other
2.RegCode empty\\n3.Save','1.Fail
2.RegCode required'),
     En('Customer')('Create—Type Required','Create/Validation','P0','On form','1.Fill other
2.Type empty\\n3.Save','1.Fail
2.Type required'),
     En('Customer')('Create—Source Required','Create/Validation','P1','On form','1.Fill other
2.Source empty\\n3.Save','1.Fail
2.Source required'),
     En('Customer')('Create—Duplicate RegCode','Create/Validation','P1','REG-001 exists','1.Fill name
2.REG-001\\n3.Other\\n4.Save','1.Fail
2.Duplicate error'),
     En('Customer')('Edit—Change Name/Phone','Edit','P0','Is owner of A','1.Detail
2.Edit\\n3.Change Name/Phone\\n4.Save','1.Saved
2.Updated'),
     En('Customer')('Detail Sub-tabs','Detail/Tabs','P1','Has related data','1.Detail
2.Click tabs','1.Tabs correct'),
     En('Customer')('List View Switching','List/View','P1','Team has data','1.List
2.Click views','1.4 views correct'),
     En('Customer')('List Search—by Name','List/Search','P2','Securemetric exists','1.List
2.Type name\\n3.Search','1.Filtered'),
     En('Customer')('Return to Pool','Pool','P0','Is owner of A;A allocated','1.Detail
2.Return\\n3.Select reason\\n4.Confirm','1.Success
2.Unallocated\\n3.Owner cleared'),
     En('Customer')('Merge A into B','Merge','P1','A and B exist','1.A detail
2.Merge\\n3.Select B\\n4.Confirm','1.Success
2.A becomes B sub'),
     En('Customer')('Customer Lost','Lifecycle','P1','Is owner of A;Not Lost','1.Detail
2.Customer Lost\\n3.Confirm','1.Lifecycle=Lost')])
print('Customer OK')

# OPPORTUNITY
write('TC-OPPORTUNITY','商机','Opportunity',
    [Zh('商机')('新建商机—正常流程','Create','P0','有客户和产品','1.列表
2.新建\\n3.名称/客户/Contacts/结单日期/流程/类别/Currency\\n4.PA表\\n5.提交','1.成功
2.编号\\n3.未开始'),
     Zh('商机')('名称未填','Create/Validation','P0','在表单','1.填其他
2.名称留空\\n3.提交','1.失败
2.名称必填'),
     Zh('商机')('客户未填','Create/Validation','P0','在表单','1.填其他
2.客户留空\\n3.提交','1.失败
2.客户必填'),
     Zh('商机')('结单日期未填','Create/Validation','P1','在表单','1.填其他
2.日期留空\\n3.提交','1.失败
2.日期必填'),
     Zh('商机')('Contacts未填','Create/Validation','P1','在表单','1.填其他
2.Contacts留空\\n3.提交','1.失败
2.Contacts必填'),
     Zh('商机')('交易类别未选','Create/Validation','P1','在表单','1.填其他
2.类别不选\\n3.提交','1.失败
2.类别必填'),
     Zh('商机')('流程未选','Create/Validation','P1','在表单','1.填其他
2.流程不选\\n3.提交','1.失败
2.流程必填'),
     Zh('商机')('Currency未选','Create/Validation','P1','在表单','1.填其他
2.Currency不选\\n3.提交','1.失败
2.Currency必填'),
     Zh('商机')('编辑—改名称赢率','Edit','P0','是A负责人','1.详情
2.编辑\\n3.改名称/赢率\\n4.提交','1.成功'),
     Zh('商机')('详情子标签','Detail/Tabs','P1','有关联数据','1.详情
2.点各标签','1.各标签正确'),
     Zh('商机')('列表视图切换','List/View','P1','团队有数据','1.列表
2.点Owned/Team/Involved/All','1.4视图正确'),
     Zh('商机')('列表搜索—按名称','List/Search','P2','有多条','1.列表
2.输名称\\n3.搜索','1.筛选'),
     Zh('商机')('暂停/恢复','Detail/Action','P1','是X负责人;X进行中','1.详情
2.Suspend\\n3.确认\\n4.观察','1.暂停
2.Open出现\\n3.阶段不变')],
    [En('Opportunity')('Create—Normal Flow','Create','P0','Customer+products exist','1.List
2.New\\n3.Name/Customer/Contacts/CloseDate/Pipeline/DealCat/Currency\\n4.PA table\\n5.Submit','1.Submitted
2.ID auto\\n3.Not Started'),
     En('Opportunity')('Create—Name Required','Create/Validation','P0','On form','1.Fill other
2.Name empty\\n3.Submit','1.Fail
2.Name required'),
     En('Opportunity')('Create—Customer Required','Create/Validation','P0','On form','1.Fill other
2.Customer empty\\n3.Submit','1.Fail
2.Customer required'),
     En('Opportunity')('Create—CloseDate Required','Create/Validation','P1','On form','1.Fill other
2.Date empty\\n3.Submit','1.Fail
2.Date required'),
     En('Opportunity')('Create—Contacts Required','Create/Validation','P1','On form','1.Fill other
2.Contacts empty\\n3.Submit','1.Fail
2.Contacts required'),
     En('Opportunity')('Create—DealCat Required','Create/Validation','P1','On form','1.Fill other
2.DealCat empty\\n3.Submit','1.Fail
2.DealCat required'),
     En('Opportunity')('Create—Pipeline Required','Create/Validation','P1','On form','1.Fill other
2.Pipeline empty\\n3.Submit','1.Fail
2.Pipeline required'),
     En('Opportunity')('Create—Currency Required','Create/Validation','P1','On form','1.Fill other
2.Currency empty\\n3.Submit','1.Fail
2.Currency required'),
     En('Opportunity')('Edit—Change Name/WinRate','Edit','P0','Is owner of A','1.Detail
2.Edit\\n3.Change Name/WinRate\\n4.Submit','1.Saved'),
     En('Opportunity')('Detail Sub-tabs','Detail/Tabs','P1','Has related data','1.Detail
2.Click tabs','1.Tabs correct'),
     En('Opportunity')('List View Switching','List/View','P1','Team has data','1.List
2.Click Owned/Team/Involved/All','1.4 views correct'),
     En('Opportunity')('List Search—by Name','List/Search','P2','Multiple records','1.List
2.Type name\\n3.Search','1.Filtered'),
     En('Opportunity')('Suspend/Resume','Detail/Action','P1','Is X owner;X In Progress','1.Detail
2.Suspend\\n3.Confirm\\n4.Observe','1.Suspended
2.Open appears\\n3.Stage unchanged')])
print('Opportunity OK')

# P&L
write('TC-PL','P&L','P&L',
    [Zh('P&L')('新建P&L—正常流程','Create','P0','有进行中商机','1.列表
2.新建\\n3.选商机/生效时间\\n4.Submit','1.成功
2.Version自动'),
     Zh('P&L')('商机未选','Create/Validation','P1','在表单','1.填时间
2.商机留空\\n3.Submit','1.失败
2.商机必填'),
     Zh('P&L')('时间未填','Create/Validation','P1','在表单','1.选商机
2.时间留空\\n3.Submit','1.失败
2.时间必填'),
     Zh('P&L')('编辑—改Margin','Edit','P1','是创建人','1.详情
2.编辑\\n3.改Margin\\n4.Submit','1.成功'),
     Zh('P&L')('列表搜索','List/Search','P2','有多条','1.列表
2.输关键词\\n3.搜索','1.筛选')],
    [En('P&L')('Create—Normal Flow','Create','P0','In-Progress Oppty exists','1.List
2.New\\n3.Select Oppty/Effective Date\\n4.Submit','1.Submitted
2.Version auto'),
     En('P&L')('Create—Oppty Required','Create/Validation','P1','On form','1.Fill date
2.Oppty empty\\n3.Submit','1.Fail
2.Oppty required'),
     En('P&L')('Create—Date Required','Create/Validation','P1','On form','1.Select Oppty
2.Date empty\\n3.Submit','1.Fail
2.Date required'),
     En('P&L')('Edit—Change Margin','Edit','P1','Is creator','1.Detail
2.Edit\\n3.Change Margin\\n4.Submit','1.Saved'),
     En('P&L')('List Search','List/Search','P2','Multiple records','1.List
2.Type keyword\\n3.Search','1.Filtered')])
print('PL OK')

# QUOTATION
write('TC-QUOTATION','报价单','Quotation',
    [Zh('报价单')('新建报价单—正常流程','Create','P0','有已审批P&L','1.列表
2.新建\\n3.Header/P&L/Date\\n4.确认自动填充\\n5.Submit','1.成功
2.编号自动'),
     Zh('报价单')('P&L未填','Create/Validation','P1','在表单','1.Header/Date
2.P&L留空\\n3.Submit','1.失败
2.P&L必填'),
     Zh('报价单')('Header未填','Create/Validation','P1','在表单','1.选P&L/Date
2.Header留空\\n3.Submit','1.失败
2.Header必填'),
     Zh('报价单')('Date未填','Create/Validation','P1','在表单','1.Header/选P&L
2.Date留空\\n3.Submit','1.失败
2.Date必填'),
     Zh('报价单')('P&L自动填充验证','Create/Linkage','P1','有已审批P&L','1.Header/Date
2.选P&L\\n3.观察','1.Currency/Oppty/产品自动'),
     Zh('报价单')('列表搜索—按标题','List/Search','P2','有多条','1.列表
2.输标题\\n3.搜索','1.筛选')],
    [En('Quotation')('Create—Normal Flow','Create','P0','Approved P&L exists','1.List
2.New\\n3.Header/P&L/Date\\n4.Check auto-fill\\n5.Submit','1.Submitted
2.ID auto'),
     En('Quotation')('Create—P&L Required','Create/Validation','P1','On form','1.Header/Date
2.P&L empty\\n3.Submit','1.Fail
2.P&L required'),
     En('Quotation')('Create—Header Required','Create/Validation','P1','On form','1.Select P&L/Date
2.Header empty\\n3.Submit','1.Fail
2.Header required'),
     En('Quotation')('Create—Date Required','Create/Validation','P1','On form','1.Header/Select P&L
2.Date empty\\n3.Submit','1.Fail
2.Date required'),
     En('Quotation')('P&L Auto-fill','Create/Linkage','P1','Approved P&L exists','1.Header/Date
2.Select P&L\\n3.Observe','1.Currency/Oppty/Products auto'),
     En('Quotation')('List Search—by Header','List/Search','P2','Multiple records','1.List
2.Type header\\n3.Search','1.Filtered')])
print('Quotation OK')

# SALES ORDER
write('TC-SO','销售订单','Sales Order',
    [Zh('销售订单')('新建销售订单—正常流程','Create','P0','有报价单','1.列表
2.新建\\n3.PO/下单日期\\n4.产品表\\n5.Payment Schedule\\n6.保存','1.成功
2.编号'),
     Zh('销售订单')('PO未填','Create/Validation','P1','在表单','1.日期
2.PO留空\\n3.保存','1.失败
2.PO必填'),
     Zh('销售订单')('日期未填','Create/Validation','P1','在表单','1.PO
2.日期留空\\n3.保存','1.失败
2.日期必填'),
     Zh('销售订单')('编辑—改条款','Edit','P1','是A负责人','1.详情
2.编辑\\n3.改条款\\n4.保存','1.成功
2.条款更新'),
     Zh('销售订单')('列表搜索—按编号','List/Search','P2','有多条','1.列表
2.输编号\\n3.搜索','1.筛选'),
     Zh('销售订单')('按百分比里程碑','Create','P1','有报价单','1.表单
2.填必填\\n3.里程碑切按百分比\\n4.设比例验证100%\\n5.保存','1.成功
2.里程碑按比例')],
    [En('Sales Order')('Create—Normal Flow','Create','P0','Quotation exists','1.List
2.New\\n3.PO/OrderDate\\n4.Products table\\n5.Payment Schedule\\n6.Save','1.Saved
2.ID auto'),
     En('Sales Order')('Create—PO Required','Create/Validation','P1','On form','1.Fill date
2.PO empty\\n3.Save','1.Fail
2.PO required'),
     En('Sales Order')('Create—Date Required','Create/Validation','P1','On form','1.Fill PO
2.Date empty\\n3.Save','1.Fail
2.Date required'),
     En('Sales Order')('Edit—Change Terms','Edit','P1','Is owner of A','1.Detail
2.Edit\\n3.Change Terms\\n4.Save','1.Saved
2.Terms updated'),
     En('Sales Order')('List Search—by No.','List/Search','P2','Multiple records','1.List
2.Type number\\n3.Search','1.Filtered'),
     En('Sales Order')('Percentage Milestones','Create','P1','Quotation exists','1.Form
2.Fill required\\n3.Switch to ByPercentage\\n4.Set ratios 100%\\n5.Save','1.Saved
2.Milestones distributed')])
print('SO OK')

# CONTRACT
write('TC-CONTRACT','合同','Contract',
    [Zh('合同')('新建合同—正常流程','Create','P0','有销售订单','1.列表
2.新建\\n3.标题/销售订单/签署/到期/附件/通知\\n4.Reminder明细\\n5.保存','1.成功
2.编号'),
     Zh('合同')('标题未填','Create/Validation','P0','在表单','1.填其他
2.标题留空\\n3.保存','1.失败
2.标题必填'),
     Zh('合同')('销售订单未选','Create/Validation','P0','在表单','1.填其他
2.SO留空\\n3.保存','1.失败
2.SO必填'),
     Zh('合同')('签署日期未填','Create/Validation','P1','在表单','1.填其他
2.日期留空\\n3.保存','1.失败
2.日期必填'),
     Zh('合同')('到期日期未填','Create/Validation','P1','在表单','1.填其他
2.到期留空\\n3.保存','1.失败
2.到期必填'),
     Zh('合同')('附件未上传','Create/Validation','P1','在表单','1.填其他
2.附件不上传\\n3.保存','1.失败
2.附件必填'),
     Zh('合同')('列表搜索—按标题','List/Search','P2','有多条','1.列表
2.输标题\\n3.搜索','1.筛选')],
    [En('Contract')('Create—Normal Flow','Create','P0','SO exists','1.List
2.New\\n3.Title/SO/SignedDate/Expiry/Attach/Notify\\n4.Reminder table\\n5.Save','1.Saved
2.ID auto'),
     En('Contract')('Create—Title Required','Create/Validation','P0','On form','1.Fill other
2.Title empty\\n3.Save','1.Fail
2.Title required'),
     En('Contract')('Create—SO Required','Create/Validation','P0','On form','1.Fill other
2.SO empty\\n3.Save','1.Fail
2.SO required'),
     En('Contract')('Create—SignedDate Required','Create/Validation','P1','On form','1.Fill other
2.Date empty\\n3.Save','1.Fail
2.Date required'),
     En('Contract')('Create—Expiry Required','Create/Validation','P1','On form','1.Fill other
2.Expiry empty\\n3.Save','1.Fail
2.Expiry required'),
     En('Contract')('Create—Attach Required','Create/Validation','P1','On form','1.Fill other
2.No attachment\\n3.Save','1.Fail
2.Attach required'),
     En('Contract')('List Search—by Title','List/Search','P2','Multiple records','1.List
2.Type title\\n3.Search','1.Filtered')])
print('Contract OK')

# DELIVERY
write('TC-DELIVERY','交付','Delivery',
    [Zh('交付')('新建发货单—正常流程','Create','P0','有销售订单','1.列表
2.新建\\n3.销售订单号\\n4.发货产品/数量\\n5.保存','1.成功'),
     Zh('交付')('销售订单未选','Create/Validation','P0','在表单','1.SO留空
2.保存','1.失败
2.SO必填'),
     Zh('交付')('列表搜索','List/Search','P2','有多条','1.列表
2.输编号\\n3.搜索','1.筛选')],
    [En('Delivery')('Create—Normal Flow','Create','P0','SO exists','1.List
2.New\\n3.SO No.\\n4.Products/Qty\\n5.Save','1.Saved'),
     En('Delivery')('Create—SO Required','Create/Validation','P0','On form','1.SO empty
2.Save','1.Fail
2.SO required'),
     En('Delivery')('List Search','List/Search','P2','Multiple records','1.List
2.Type number\\n3.Search','1.Filtered')])
print('Delivery OK')

# PO
write('TC-PO','采购订单','PO',
    [Zh('采购订单')('新建采购订单—正常流程','Create','P0','有报价单','1.列表
2.新建\\n3.PO编号/报价单/PO文件\\n4.保存','1.成功'),
     Zh('采购订单')('PO编号未填','Create/Validation','P1','在表单','1.选报价单/上传
2.PO号留空\\n3.保存','1.失败
2.PO号必填'),
     Zh('采购订单')('报价单未选','Create/Validation','P1','在表单','1.PO号/上传
2.报价单留空\\n3.保存','1.失败
2.报价单必填'),
     Zh('采购订单')('PO文件未上传','Create/Validation','P1','在表单','1.PO号/选报价单
2.文件不上传\\n3.保存','1.失败
2.文件必填'),
     Zh('采购订单')('列表搜索—按编号','List/Search','P2','有多条','1.列表
2.输编号\\n3.搜索','1.筛选')],
    [En('PO')('Create—Normal Flow','Create','P0','Quotation exists','1.List
2.New\\n3.PO No./Quotation/PO File\\n4.Save','1.Saved'),
     En('PO')('Create—PO No. Required','Create/Validation','P1','On form','1.Select Qtn/Upload
2.PO No. empty\\n3.Save','1.Fail
2.PO No. required'),
     En('PO')('Create—Qtn Required','Create/Validation','P1','On form','1.PO No./Upload
2.Qtn empty\\n3.Save','1.Fail
2.Qtn required'),
     En('PO')('Create—File Required','Create/Validation','P1','On form','1.PO No./Select Qtn
2.No file\\n3.Save','1.Fail
2.File required'),
     En('PO')('List Search—by PO No.','List/Search','P2','Multiple records','1.List
2.Type number\\n3.Search','1.Filtered')])
print('PO OK')

# INVOICE
write('TC-INVOICE','开票申请','Invoice',
    [Zh('开票申请')('新建开票—正常流程','Create','P0','有销售订单','1.列表
2.新建\\n3.发票类型\\n4.SO/公司名称\\n5.保存','1.成功
2.编号\\n3.PI/Ref自动'),
     Zh('开票申请')('发票类型未选','Create/Validation','P1','在表单','1.填其他
2.类型不选\\n3.保存','1.失败
2.类型必填'),
     Zh('开票申请')('SO未填','Create/Validation','P1','在表单','1.类型/公司
2.SO留空\\n3.保存','1.失败
2.SO必填'),
     Zh('开票申请')('公司未填','Create/Validation','P1','在表单','1.类型/SO
2.公司留空\\n3.保存','1.失败
2.公司必填'),
     Zh('开票申请')('列表搜索','List/Search','P2','有多条','1.列表
2.输编号\\n3.搜索','1.筛选')],
    [En('Invoice')('Create—Normal Flow','Create','P0','SO exists','1.List
2.New\\n3.InvoiceType\\n4.SO/Company\\n5.Save','1.Saved
2.ID auto\\n3.PI/Ref auto'),
     En('Invoice')('Create—Type Required','Create/Validation','P1','On form','1.Fill other
2.Type empty\\n3.Save','1.Fail
2.Type required'),
     En('Invoice')('Create—SO Required','Create/Validation','P1','On form','1.Type/Company
2.SO empty\\n3.Save','1.Fail
2.SO required'),
     En('Invoice')('Create—Company Required','Create/Validation','P1','On form','1.Type/SO
2.Company empty\\n3.Save','1.Fail
2.Company required'),
     En('Invoice')('List Search','List/Search','P2','Multiple records','1.List
2.Type number\\n3.Search','1.Filtered')])
print('Invoice OK')

# COLLECTION
write('TC-COLLECTION','回款','Collection',
    [Zh('回款')('新建回款—正常流程','Create','P0','有客户/回款计划','1.列表(Revenue)
2.新建\\n3.客户/日期/货币/金额\\n4.里程碑明细\\n5.保存','1.成功
2.编号\\n3.Allocated自动'),
     Zh('回款')('客户未填','Create/Validation','P0','在表单','1.填其他
2.客户留空\\n3.保存','1.失败
2.客户必填'),
     Zh('回款')('日期未填','Create/Validation','P1','在表单','1.填其他
2.日期留空\\n3.保存','1.失败
2.日期必填'),
     Zh('回款')('金额未填','Create/Validation','P1','在表单','1.填其他
2.金额留空\\n3.保存','1.失败
2.金额必填'),
     Zh('回款')('货币未选','Create/Validation','P1','在表单','1.填其他
2.货币不选\\n3.保存','1.失败
2.货币必填'),
     Zh('回款')('列表搜索','List/Search','P2','有多条','1.列表
2.输客户名\\n3.搜索','1.筛选')],
    [En('Collection')('Create—Normal Flow','Create','P0','Customer/PaymentPlan exist','1.List(Revenue)
2.New\\n3.Customer/Date/Currency/Amount\\n4.Milestones\\n5.Save','1.Saved
2.ID auto\\n3.Allocated auto'),
     En('Collection')('Create—Customer Required','Create/Validation','P0','On form','1.Fill other
2.Customer empty\\n3.Save','1.Fail
2.Customer required'),
     En('Collection')('Create—Date Required','Create/Validation','P1','On form','1.Fill other
2.Date empty\\n3.Save','1.Fail
2.Date required'),
     En('Collection')('Create—Amount Required','Create/Validation','P1','On form','1.Fill other
2.Amount empty\\n3.Save','1.Fail
2.Amount required'),
     En('Collection')('Create—Currency Required','Create/Validation','P1','On form','1.Fill other
2.Currency empty\\n3.Save','1.Fail
2.Currency required'),
     En('Collection')('List Search','List/Search','P2','Multiple records','1.List
2.Type customer\\n3.Search','1.Filtered')])
print('Collection OK')

# PRODUCT
write('TC-PRODUCT','产品','Product',
    [Zh('产品')('新建产品—正常流程','Create','P0','有供应商','1.列表(产品管理)
2.新建\\n3.名称/编码/类型/供应商/单价/货币\\n4.保存','1.成功
2.已上架'),
     Zh('产品')('名称未填','Create/Validation','P0','在表单','1.填其他
2.名称留空\\n3.保存','1.失败
2.名称必填'),
     Zh('产品')('编码未填','Create/Validation','P0','在表单','1.填其他
2.编码留空\\n3.保存','1.失败
2.编码必填'),
     Zh('产品')('类型未选','Create/Validation','P1','在表单','1.填其他
2.类型不选\\n3.保存','1.失败
2.类型必填'),
     Zh('产品')('供应商未选','Create/Validation','P1','在表单','1.填其他
2.供应商不选\\n3.保存','1.失败
2.供应商必填'),
     Zh('产品')('列表搜索','List/Search','P2','有多条','1.列表
2.输名称\\n3.搜索','1.筛选')],
    [En('Product')('Create—Normal Flow','Create','P0','Principal exists','1.List(Products)
2.New\\n3.Name/Code/Type/Principal/Cost/Currency\\n4.Save','1.Saved
2.Published'),
     En('Product')('Create—Name Required','Create/Validation','P0','On form','1.Fill other
2.Name empty\\n3.Save','1.Fail
2.Name required'),
     En('Product')('Create—Code Required','Create/Validation','P0','On form','1.Fill other
2.Code empty\\n3.Save','1.Fail
2.Code required'),
     En('Product')('Create—Type Required','Create/Validation','P1','On form','1.Fill other
2.Type empty\\n3.Save','1.Fail
2.Type required'),
     En('Product')('Create—Principal Required','Create/Validation','P1','On form','1.Fill other
2.Principal empty\\n3.Save','1.Fail
2.Principal required'),
     En('Product')('List Search','List/Search','P2','Multiple records','1.List
2.Type name\\n3.Search','1.Filtered')])
print('Product OK')

# KANBAN
write('TC-KANBAN','管道看板','Pipeline Kanban',
    [Zh('管道看板')('查看看板—验证阶段磁贴','View','P0','已登录;有数据','1.进看板
2.观察7磁贴\\n3.记录数量和金额','1.7磁贴:Lead/Oppty/Qtn/PO/SO/PI/Pmt
2.各显示数量金额'),
     Zh('管道看板')('点击磁贴筛选','Filter','P1','数据已加载','1.进看板
2.点磁贴\\n3.看列表\\n4.Reset','1.点击后仅该阶段
2.Reset恢复'),
     Zh('管道看板')('时间筛选','Filter','P1','数据已加载','1.进看板
2.This Year\\n3.This Month\\n4.Custom','1.各时间数据变化'),
     Zh('管道看板')('查看交易列表','View','P1','列表有数据','1.进看板
2.看列表\\n3.点项目名','1.列:Project/Amount/Rep/Stage/Date
2.点名称进详情')],
    [En('Pipeline Kanban')('View—Stage Tiles','View','P0','Logged in;Data exists','1.Open kanban
2.Observe 7 tiles\\n3.Record counts','1.7 tiles:Lead/Oppty/Qtn/PO/SO/PI/Pmt
2.Show counts+amounts'),
     En('Pipeline Kanban')('Filter by Stage Tile','Filter','P1','Data loaded','1.Open kanban
2.Click tile\\n3.View list\\n4.Reset','1.Filters to stage
2.Reset restores'),
     En('Pipeline Kanban')('Time Period Filter','Filter','P1','Data loaded','1.Open kanban
2.This Year\\n3.This Month\\n4.Custom','1.Data changes per period'),
     En('Pipeline Kanban')('View Deal List','View','P1','List has data','1.Open kanban
2.View list\\n3.Click deal name','1.Columns:Project/Amount/Rep/Stage/Date
2.Detail page')])
print('Kanban OK')

# Lead (same data as inline)
write('TC-LEAD','线索','Lead',
    [Zh('线索')('新建线索—正常流程','Create','P0','已登录;有产品','1.列表
2.新建\\n3.名称/池/类型/来源/级别/详情/流程/类别\\n4.产品表\\n5.保存','1.成功
2.待处理'),
     Zh('线索')('名称未填','Create/Validation','P0','在表单','1.填其他
2.名称留空\\n3.保存','1.失败
2.名称必填'),
     Zh('线索')('线索池未选','Create/Validation','P0','在表单','1.填其他
2.池不选\\n3.保存','1.失败
2.池必填'),
     Zh('线索')('来源未选','Create/Validation','P1','在表单','1.填其他
2.来源不选\\n3.保存','1.失败
2.来源必填'),
     Zh('线索')('级别未选','Create/Validation','P1','在表单','1.填其他
2.级别不选\\n3.保存','1.失败
2.级别必填'),
     Zh('线索')('详情未填','Create/Validation','P0','在表单','1.填其他
2.详情留空\\n3.保存','1.失败
2.详情必填'),
     Zh('线索')('交易类别未选','Create/Validation','P1','在表单','1.填其他
2.类别不选\\n3.保存','1.失败
2.类别必填'),
     Zh('线索')('产品表未填','Create/Validation','P0','必填已填','1.必填都填
2.产品表不添\\n3.保存','1.失败
2.需至少一行'),
     Zh('线索')('编辑—改名称级别','Edit','P0','是A负责人;未锁定','1.详情
2.编辑\\n3.改名称/级别\\n4.保存','1.成功'),
     Zh('线索')('详情子标签','Detail/Tabs','P1','有关联数据','1.详情
2.点流转/联系人/商机/相关/转化','1.各标签正确'),
     Zh('线索')('添加团队成员','Team','P1','有B','1.详情
2.服务团队加B\\n3.保存\\n4.B登录','1.成功
2.B在My Involved'),
     Zh('线索')('列表视图切换','List/View','P1','团队有数据','1.列表
2.点我拥有/团队/参与/全部','1.4视图正确'),
     Zh('线索')('列表搜索—按电话','List/Search','P2','电话012-3456789','1.列表
2.输电话\\n3.搜索','1.筛选'),
     Zh('线索')('线索转化—前提条件','Conversion','P1','状态待处理;是负责人','1.详情
2.跟进中\\n3.看转化按钮','1.待处理不可见
2.跟进中出现'),
     Zh('线索')('锁定/解锁','Permission','P1','是X负责人','1.详情
2.锁定\\n3.试编辑\\n4.解锁','1.锁定不可编辑
2.解锁后可'),
     Zh('线索')('归集A到B','Relation','P1','有A和B;是池成员','1.A详情
2.归集\\n3.选B\\n4.确认','1.成功
2.B相关线索显A')],
    [En('Lead')('Create Lead—Normal Flow','Create','P0','Logged in;Products exist','1.List
2.New\\n3.Name/Pool/Type/Source/Level/Details/Pipeline/DealCat\\n4.Products\\n5.Save','1.Saved
2.Pending'),
     En('Lead')('Create—Name Required','Create/Validation','P0','On form','1.Fill other
2.Name empty\\n3.Save','1.Fail
2.Name required'),
     En('Lead')('Create—Pool Required','Create/Validation','P0','On form','1.Fill other
2.Pool empty\\n3.Save','1.Fail
2.Pool required'),
     En('Lead')('Create—Source Required','Create/Validation','P1','On form','1.Fill other
2.Source empty\\n3.Save','1.Fail
2.Source required'),
     En('Lead')('Create—Level Required','Create/Validation','P1','On form','1.Fill other
2.Level empty\\n3.Save','1.Fail
2.Level required'),
     En('Lead')('Create—Details Required','Create/Validation','P0','On form','1.Fill other
2.Details empty\\n3.Save','1.Fail
2.Details required'),
     En('Lead')('Create—DealCat Required','Create/Validation','P1','On form','1.Fill other
2.DealCat empty\\n3.Save','1.Fail
2.DealCat required'),
     En('Lead')('Create—Product Table Empty','Create/Validation','P0','Required filled','1.Fill all
2.Skip product table\\n3.Save','1.Fail
2.Need 1+ row'),
     En('Lead')('Edit—Change Name/Level','Edit','P0','Owner of A;Not locked','1.Detail
2.Edit\\n3.Change Name/Level\\n4.Save','1.Saved'),
     En('Lead')('Detail Sub-tab Switching','Detail/Tabs','P1','Has related data','1.Detail
2.Click Flow/Contacts/Oppty/Related/Conversion','1.Tabs correct'),
     En('Lead')('Add Team Member','Team','P1','Rep B exists','1.Detail
2.Service Team add B\\n3.Save\\n4.B login','1.Added
2.B sees in My Involved'),
     En('Lead')('List View Switching','List/View','P1','Team has data','1.List
2.Click My/Team/Involved/All','1.4 views correct'),
     En('Lead')('List Search—by Phone','List/Search','P2','Phone 012-3456789','1.List
2.Type number\\n3.Search','1.Filtered'),
     En('Lead')('Lead Conversion Prereqs','Conversion','P1','Status=Pending;Is owner','1.Detail
2.Follow Up\\n3.Check Convert','1.Hidden when Pending
2.Appears after Follow Up'),
     En('Lead')('Lock/Unlock','Permission','P1','Is owner of X','1.Detail
2.Lock\\n3.Try edit\\n4.Unlock','1.Locked=cannot
2.Unlocked=can'),
     En('Lead')('Collect A into B','Relation','P1','A+B exist;Is pool member','1.A detail
2.Collect\\n3.Select B\\n4.Confirm','1.Done
2.B Related shows A')])
print('Lead OK')

print('\n=== ALL 14 MODULES GENERATED ===')
