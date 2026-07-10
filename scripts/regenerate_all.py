#!/usr/bin/env python3
"""
重新生成所有 14 模块的 YAML（zh/en/admin_zh/admin_en），每个表单的必填项校验合并为一条。
数据直接嵌入脚本，避免解析/写回带来的问题。
"""
import os

BASE = 'doc/SM测试用例-收集箱/AI输出/基础功能用例'
DIRS = ['zh', 'en', 'admin_zh', 'admin_en']

def C(id, mod, name, cat, role, prio, pre, steps, exp, notes='', st=''):
    """Create a case dict"""
    return {'id': id, 'module': mod, 'name': name, 'category': cat,
            'role': role, 'priority': prio, 'precondition': pre,
            'steps': steps, 'expected': exp, 'notes': notes,
            'status': st or ('草稿' if '销售' in role or '管理' in role else 'Draft')}

def write_yaml(filepath, prefix, cases):
    with open(filepath, 'w') as f:
        f.write('---\n')
        f.write('cases:\n')
        for i, c in enumerate(cases):
            nid = i + 1
            cid = f'{prefix}-{nid:03d}'
            f.write(f'\n  - id: {cid}\n')
            f.write(f'    module: {c["module"]}\n')
            f.write(f'    name: {c["name"]}\n')
            f.write(f'    category: {c["category"]}\n')
            f.write(f'    role: {c["role"]}\n')
            f.write(f'    priority: {c["priority"]}\n')
            for k in ['precondition', 'steps', 'expected', 'notes']:
                v = c.get(k, '')
                if v:
                    f.write(f'    {k}: |\n')
                    for l in v.split('\n'):
                        f.write(f'      {l}\n')
            f.write(f'    status: {c["status"]}\n')

def generate_zh_en():
    """Generate zh/ and en/ YAML files"""
    zhmod = '联系人'
    enmod = 'Contact'
    prefix = 'TC-CONTACT'
    zh_cases = [
        C('', zhmod, '新建联系人—正常流程', '新建', '销售人员', 'P0',
          '已登录CRM\n有客户数据',
          '1.进入列表页\n2.点击新建\n3.填写姓名/性别/业务类型\n4.填写手机或邮件\n5.点击保存',
          '1.保存成功\n2.列表出现新记录',
          '必填3个:姓名、性别、业务类型'),
        C('', zhmod, '新建联系人—必填项校验', '新建/校验', '销售人员', 'P0',
          '已登录CRM\n在新建表单',
          '1.姓名留空/性别不选/业务类型不选/手机和邮件都留空\n2.分别验证各必填字段的提示信息\n3.填写必填后再次保存',
          '1.姓名必填提示\n2.性别必填提示\n3.业务类型必填提示\n4.手机或邮件至少填一项提示\n5.全部填完后保存成功'),
        C('', zhmod, '新建联系人—仅填手机(通过)', '新建/校验', '销售人员', 'P1',
          '已登录CRM\n在新建表单',
          '1.填写姓名/性别/业务类型\n2.填写手机号\n3.邮件留空\n4.点击保存',
          '1.保存成功'),
        C('', zhmod, '新建联系人—仅填邮件(通过)', '新建/校验', '销售人员', 'P1',
          '已登录CRM\n在新建表单',
          '1.填写姓名/性别/业务类型\n2.手机号留空\n3.填写邮件\n4.点击保存',
          '1.保存成功'),
        C('', zhmod, '新建联系人—不关联客户', '新建/校验', '销售人员', 'P2',
          '已登录CRM\n在新建表单',
          '1.填写姓名/性别/业务类型/手机号\n2.客户字段留空\n3.点击保存',
          '1.保存成功\n2.未关联客户'),
        C('', zhmod, '编辑联系人—修改姓名和职务', '编辑', '销售人员', 'P0',
          '已登录CRM\n是联系人A的负责人',
          '1.进入详情页\n2.点击编辑\n3.修改姓名和职务\n4.点击保存',
          '1.保存成功\n2.姓名和职务更新'),
        C('', zhmod, '删除联系人', '删除', '销售人员', 'P1',
          '已登录CRM\n是联系人A的负责人',
          '1.进入详情页\n2.点击删除\n3.确认',
          '1.删除成功\n2.列表消失'),
        C('', zhmod, '变更负责人', '权限/转移', '销售人员', 'P1',
          '已登录CRM\n有销售人员B\nA是联系人X的负责人',
          '1.进入详情页\n2.点击变更负责人\n3.选择B\n4.确认',
          '1.变更成功\n2.负责人显示为B'),
        C('', zhmod, '添加团队成员(服务团队面板)', '团队', '销售人员', 'P1',
          '已登录CRM\n有销售人员C',
          '1.进入详情页\n2.服务团队添加C\n3.保存',
          '1.添加成功\n2.C可看到'),
        C('', zhmod, '详情页子标签页切换', '详情/标签页', '销售人员', 'P1',
          '已登录CRM\n有关联线索和商机',
          '1.进入详情页\n2.点击Lead/Opportunity标签\n3.切回Detailed Info',
          '1.标签页正常切换'),
        C('', zhmod, '列表页视图切换—My Contact/All', '列表/视图', '销售人员', 'P1',
          '已登录CRM\n有联系人数据',
          '1.进入列表页\n2.观察My Contact\n3.切换到All',
          '1.My Contact仅显示本人\n2.All显示全部'),
        C('', zhmod, '列表搜索—按姓名搜索', '列表/搜索', '销售人员', 'P1',
          '已登录CRM\n有联系人张三丰',
          '1.进入列表页\n2.输入张三丰\n3.触发搜索',
          '1.筛选出匹配的联系人'),
        C('', zhmod, '批量导入联系人—Excel模板', '导入', '销售人员', 'P1',
          '已登录CRM\n有Excel模板',
          '1.进入列表页\n2.点击导入\n3.上传Excel\n4.选择导入模式\n5.确认',
          '1.导入完成\n2.显示导入汇总'),
    ]
    en_cases = [
        C('', enmod, 'Create Contact—Normal Flow', '新建', 'Sales Rep', 'P0',
          'Logged in CRM\nHas customer data',
          '1.List page\n2.Create\n3.Name/Gender/Biz Type\n4.Mobile or Email\n5.Save',
          '1.Saved\n2.Appears in list',
          'Required: Name, Gender, Biz Type'),
        C('', enmod, 'Create Contact—Required Field Validation', '新建/校验', 'Sales Rep', 'P0',
          'Logged in CRM\nOn create form',
          '1.Leave Name/Gender/Biz Type/Mobile&Email empty\n2.Check validation hints\n3.Fill all required and save',
          '1.Name required hint\n2.Gender required hint\n3.Biz Type required hint\n4."Mobile or Email" hint\n5.Save succeeds'),
        C('', enmod, 'Create Contact—Mobile Only(Pass)', '新建/校验', 'Sales Rep', 'P1',
          'Logged in CRM\nOn create form',
          '1.Name/Gender/Biz Type\n2.Mobile only\n3.Save',
          '1.Saved'),
        C('', enmod, 'Create Contact—Email Only(Pass)', '新建/校验', 'Sales Rep', 'P1',
          'Logged in CRM\nOn create form',
          '1.Name/Gender/Biz Type\n2.Email only\n3.Save',
          '1.Saved'),
        C('', enmod, 'Create Contact—No Customer(Pass)', '新建/校验', 'Sales Rep', 'P2',
          'Logged in CRM\nOn create form',
          '1.Name/Gender/Biz Type/Mobile\n2.Customer empty\n3.Save',
          '1.Saved\n2.No customer linked'),
        C('', enmod, 'Edit Contact—Change Name/Job Title', '编辑', 'Sales Rep', 'P0',
          'Logged in CRM\nOwner of Contact A',
          '1.Detail page\n2.Edit\n3.Change Name/Job Title\n4.Save',
          '1.Saved\n2.Name/Title updated'),
        C('', enmod, 'Delete Contact', '删除', 'Sales Rep', 'P1',
          'Logged in CRM\nOwner of Contact A',
          '1.Detail page\n2.Delete\n3.Confirm',
          '1.Deleted\n2.Removed from list'),
        C('', enmod, 'Change Owner', '权限/转移', 'Sales Rep', 'P1',
          'Logged in CRM\nSales Rep B exists\nA is owner of Contact X',
          '1.Detail\n2.Change Owner\n3.Select B\n4.Confirm',
          '1.Changed\n2.Owner now B'),
        C('', enmod, 'Add Team Member', '团队', 'Sales Rep', 'P1',
          'Logged in CRM\nSales Rep C exists',
          '1.Detail\n2.Add C to Service Team\n3.Save',
          '1.Added\n2.C can see'),
        C('', enmod, 'Detail Sub-tab Switching', '详情/标签页', 'Sales Rep', 'P1',
          'Logged in CRM\nHas related Lead/Oppty',
          '1.Detail\n2.Click Lead/Opportunity tabs\n3.Switch to Detailed Info',
          '1.Tabs switch correctly'),
        C('', enmod, 'List View—My Contact/All', '列表/视图', 'Sales Rep', 'P1',
          'Logged in CRM\nHas contact data',
          '1.List\n2.Check My Contact\n3.Switch to All',
          '1.My shows only mine\n2.All shows all'),
        C('', enmod, 'List Search—by Name', '列表/搜索', 'Sales Rep', 'P1',
          'Logged in CRM\nHas contact "Zhang San"',
          '1.List\n2.Type name\n3.Search',
          '1.Filtered'),
        C('', enmod, 'Batch Import—Excel Template', '导入', 'Sales Rep', 'P1',
          'Logged in CRM\nHas Excel template',
          '1.List\n2.Import\n3.Upload Excel\n4.Select mode\n5.Confirm',
          '1.Imported\n2.Summary shown'),
    ]
    write_yaml(f'{BASE}/zh/联系人.yaml', 'TC-CONTACT', zh_cases)
    write_yaml(f'{BASE}/en/Contact.yaml', 'TC-CONTACT', en_cases)
    print(f'Contact: zh={len(zh_cases)} en={len(en_cases)}')

    # ── Lead ──
    write_yaml(f'{BASE}/zh/线索.yaml', 'TC-LEAD', [
        C('', '线索', '新建线索—正常流程', 'Create', '销售人员', 'P0',
          '已登录;有产品',
          '1.列表\n2.新建\n3.名称/池/类型/来源/级别/详情/流程/类别\n4.产品表\n5.保存',
          '1.成功\n2.待处理'),
        C('', '线索', '新建线索—必填项校验', 'Create/Validation', '销售人员', 'P0',
          '在新建表单',
          '1.所有必填字段留空\n2.点击保存\n3.逐字段填写后保存',
          '1.名称/池/来源/级别/详情/交易类别/产品表均有必填提示\n2.全部填完后保存成功'),
        C('', '线索', '编辑—改名称级别', 'Edit', '销售人员', 'P0',
          '是A负责人;未锁定',
          '1.详情\n2.编辑\n3.改名称/级别\n4.保存',
          '1.成功'),
        C('', '线索', '详情子标签', 'Detail/Tabs', '销售人员', 'P1',
          '有关联数据',
          '1.详情\n2.点流转/联系人/商机/相关/转化',
          '1.各标签正确'),
        C('', '线索', '添加团队成员', 'Team', '销售人员', 'P1',
          '有B',
          '1.详情\n2.服务团队加B\n3.保存\n4.B登录',
          '1.成功\n2.B在My Involved'),
        C('', '线索', '列表视图切换', 'List/View', '销售人员', 'P1',
          '团队有数据',
          '1.列表\n2.点我拥有/团队/参与/全部',
          '1.4视图正确'),
        C('', '线索', '列表搜索—按电话', 'List/Search', '销售人员', 'P2',
          '电话012-3456789',
          '1.列表\n2.输电话\n3.搜索',
          '1.筛选'),
        C('', '线索', '线索转化—前提条件', 'Conversion', '销售人员', 'P1',
          '状态待处理;是负责人',
          '1.详情\n2.跟进中\n3.看转化按钮',
          '1.待处理不可见\n2.跟进中出现'),
        C('', '线索', '锁定/解锁', 'Permission', '销售人员', 'P1',
          '是X负责人',
          '1.详情\n2.锁定\n3.试编辑\n4.解锁',
          '1.锁定不可编辑\n2.解锁后可'),
        C('', '线索', '归集A到B', 'Relation', '销售人员', 'P1',
          '有A和B;是池成员',
          '1.A详情\n2.归集\n3.选B\n4.确认',
          '1.成功\n2.B相关线索显A'),
    ])
    write_yaml(f'{BASE}/en/Lead.yaml', 'TC-LEAD', [
        C('', 'Lead', 'Create Lead—Normal Flow', 'Create', 'Sales Rep', 'P0',
          'Logged in;Products exist',
          '1.List\n2.New\n3.Name/Pool/Type/Source/Level/Details/Pipeline/DealCat\n4.Products\n5.Save',
          '1.Saved\n2.Pending'),
        C('', 'Lead', 'Create Lead—Required Field Validation', 'Create/Validation', 'Sales Rep', 'P0',
          'On create form',
          '1.Leave all required fields empty\n2.Save\n3.Fill each and save',
          '1.Required hints for Name/Pool/Source/Level/Details/DealCat/Products\n2.Save succeeds'),
        C('', 'Lead', 'Edit—Change Name/Level', 'Edit', 'Sales Rep', 'P0',
          'Owner of A;Not locked',
          '1.Detail\n2.Edit\n3.Change Name/Level\n4.Save',
          '1.Saved'),
        C('', 'Lead', 'Detail Sub-tab Switching', 'Detail/Tabs', 'Sales Rep', 'P1',
          'Has related data',
          '1.Detail\n2.Click Flow/Contacts/Oppty/Related/Conversion',
          '1.Tabs correct'),
        C('', 'Lead', 'Add Team Member', 'Team', 'Sales Rep', 'P1',
          'Rep B exists',
          '1.Detail\n2.Service Team add B\n3.Save\n4.B login',
          '1.Added\n2.B sees in My Involved'),
        C('', 'Lead', 'List View Switching', 'List/View', 'Sales Rep', 'P1',
          'Team has data',
          '1.List\n2.Click My/Team/Involved/All',
          '1.4 views correct'),
        C('', 'Lead', 'List Search—by Phone', 'List/Search', 'Sales Rep', 'P2',
          'Phone 012-3456789',
          '1.List\n2.Type number\n3.Search',
          '1.Filtered'),
        C('', 'Lead', 'Lead Conversion Prereqs', 'Conversion', 'Sales Rep', 'P1',
          'Status=Pending;Is owner',
          '1.Detail\n2.Follow Up\n3.Check Convert button',
          '1.Hidden when Pending\n2.Appears after Follow Up'),
        C('', 'Lead', 'Lock/Unlock', 'Permission', 'Sales Rep', 'P1',
          'Is owner of X',
          '1.Detail\n2.Lock\n3.Try edit\n4.Unlock',
          '1.Locked=cannot edit\n2.Unlocked=can'),
        C('', 'Lead', 'Collect A into B', 'Relation', 'Sales Rep', 'P1',
          'A+B exist;Is pool member',
          '1.A detail\n2.Collect\n3.Select B\n4.Confirm',
          '1.Done\n2.B Related shows A'),
    ])
    print('Lead: zh=10 en=10')

    # ── Customer ──
    write_yaml(f'{BASE}/zh/客户.yaml', 'TC-CUSTOMER', [
        C('', '客户', '新建客户—正常流程', 'Create', '销售人员', 'P0',
          '已登录;注册码未占',
          '1.列表\n2.新建\n3.名称/注册码/类型/来源\n4.地址表\n5.保存',
          '1.成功\n2.编号自动\n3.已分配'),
        C('', '客户', '新建客户—必填项校验', 'Create/Validation', '销售人员', 'P0',
          '在新建表单',
          '1.名称/注册码/类型/来源留空\n2.点击保存\n3.逐字段填写后保存',
          '1.名称/注册码/类型/来源均有必填提示\n2.全部填完后保存成功'),
        C('', '客户', '注册码重复', 'Create/Validation', '销售人员', 'P1',
          '已有REG-001',
          '1.填名称\n2.填REG-001\n3.其他\n4.保存',
          '1.失败\n2.提示重复'),
        C('', '客户', '编辑—改名称电话', 'Edit', '销售人员', 'P0',
          '是A负责人',
          '1.详情\n2.编辑\n3.改名称/电话\n4.保存',
          '1.成功\n2.更新'),
        C('', '客户', '详情页子标签', 'Detail/Tabs', '销售人员', 'P1',
          '有关联数据',
          '1.详情\n2.点各标签',
          '1.各标签正确'),
        C('', '客户', '列表视图切换', 'List/View', '销售人员', 'P1',
          '团队有数据',
          '1.列表\n2.点各视图',
          '1.4视图正确'),
        C('', '客户', '列表搜索—按名称', 'List/Search', '销售人员', 'P2',
          '有Securemetric',
          '1.列表\n2.输名称\n3.搜索',
          '1.筛选'),
        C('', '客户', '退回公海', 'Pool', '销售人员', 'P0',
          '是A负责人;A已分配',
          '1.详情\n2.退回\n3.选原因\n4.确认',
          '1.成功\n2.未分配\n3.负责人清空'),
        C('', '客户', '合并A到B', 'Merge', '销售人员', 'P1',
          '有A和B',
          '1.A详情\n2.合并\n3.选B\n4.确认',
          '1.成功\n2.A是B下级'),
        C('', '客户', '客户流失', 'Lifecycle', '销售人员', 'P1',
          '是A负责人;未流失',
          '1.详情\n2.客户流失\n3.确认',
          '1.生命周期变Lost'),
    ])
    write_yaml(f'{BASE}/en/Customer.yaml', 'TC-CUSTOMER', [
        C('', 'Customer', 'Create Customer—Normal Flow', 'Create', 'Sales Rep', 'P0',
          'Logged in;RegCode free',
          '1.List\n2.New\n3.Name/RegCode/Type/Source\n4.Address table\n5.Save',
          '1.Saved\n2.ID auto\n3.Allocated'),
        C('', 'Customer', 'Create Customer—Required Field Validation', 'Create/Validation', 'Sales Rep', 'P0',
          'On create form',
          '1.Leave Name/RegCode/Type/Source empty\n2.Save\n3.Fill each and save',
          '1.Required hints for Name/RegCode/Type/Source\n2.Save succeeds after all filled'),
        C('', 'Customer', 'Create—Duplicate RegCode', 'Create/Validation', 'Sales Rep', 'P1',
          'REG-001 exists',
          '1.Fill name\n2.REG-001\n3.Other\n4.Save',
          '1.Fail\n2.Duplicate error'),
        C('', 'Customer', 'Edit—Change Name/Phone', 'Edit', 'Sales Rep', 'P0',
          'Is owner of A',
          '1.Detail\n2.Edit\n3.Change Name/Phone\n4.Save',
          '1.Saved\n2.Updated'),
        C('', 'Customer', 'Detail Sub-tabs', 'Detail/Tabs', 'Sales Rep', 'P1',
          'Has related data',
          '1.Detail\n2.Click tabs',
          '1.Tabs correct'),
        C('', 'Customer', 'List View Switching', 'List/View', 'Sales Rep', 'P1',
          'Team has data',
          '1.List\n2.Click views',
          '1.4 views correct'),
        C('', 'Customer', 'List Search—by Name', 'List/Search', 'Sales Rep', 'P2',
          'Securemetric exists',
          '1.List\n2.Type name\n3.Search',
          '1.Filtered'),
        C('', 'Customer', 'Return to Pool', 'Pool', 'Sales Rep', 'P0',
          'Is owner of A;A allocated',
          '1.Detail\n2.Return\n3.Select reason\n4.Confirm',
          '1.Success\n2.Unallocated\n3.Owner cleared'),
        C('', 'Customer', 'Merge A into B', 'Merge', 'Sales Rep', 'P1',
          'A and B exist',
          '1.A detail\n2.Merge\n3.Select B\n4.Confirm',
          '1.Success\n2.A becomes B sub'),
        C('', 'Customer', 'Customer Lost', 'Lifecycle', 'Sales Rep', 'P1',
          'Is owner of A;Not Lost',
          '1.Detail\n2.Customer Lost\n3.Confirm',
          '1.Lifecycle=Lost'),
    ])
    print('Customer: zh=10 en=10')

    # ── Opportunity ──
    write_yaml(f'{BASE}/zh/商机.yaml', 'TC-OPPORTUNITY', [
        C('', '商机', '新建商机—正常流程', 'Create', '销售人员', 'P0',
          '有客户和产品',
          '1.列表\n2.新建\n3.名称/客户/Contacts/结单日期/流程/类别/Currency\n4.PA表\n5.提交',
          '1.成功\n2.编号\n3.未开始'),
        C('', '商机', '新建商机—必填项校验', 'Create/Validation', '销售人员', 'P0',
          '在新建表单',
          '1.名称/客户/结单日期/Contacts/类别/流程/Currency留空\n2.点击提交\n3.逐字段填写后提交',
          '1.所有必填字段均有提示\n2.全部填完后提交成功'),
        C('', '商机', '编辑—改名称赢率', 'Edit', '销售人员', 'P0',
          '是A负责人',
          '1.详情\n2.编辑\n3.改名称/赢率\n4.提交',
          '1.成功'),
        C('', '商机', '详情子标签', 'Detail/Tabs', '销售人员', 'P1',
          '有关联数据',
          '1.详情\n2.点各标签',
          '1.各标签正确'),
        C('', '商机', '列表视图切换', 'List/View', '销售人员', 'P1',
          '团队有数据',
          '1.列表\n2.点Owned/Team/Involved/All',
          '1.4视图正确'),
        C('', '商机', '列表搜索—按名称', 'List/Search', '销售人员', 'P2',
          '有多条',
          '1.列表\n2.输名称\n3.搜索',
          '1.筛选'),
        C('', '商机', '暂停/恢复', 'Detail/Action', '销售人员', 'P1',
          '是X负责人;X进行中',
          '1.详情\n2.Suspend\n3.确认\n4.观察',
          '1.暂停\n2.Open出现\n3.阶段不变'),
    ])
    write_yaml(f'{BASE}/en/Opportunity.yaml', 'TC-OPPORTUNITY', [
        C('', 'Opportunity', 'Create Opportunity—Normal Flow', 'Create', 'Sales Rep', 'P0',
          'Customer+products exist',
          '1.List\n2.New\n3.Name/Customer/Contacts/CloseDate/Pipeline/DealCat/Currency\n4.PA table\n5.Submit',
          '1.Submitted\n2.ID auto\n3.Not Started'),
        C('', 'Opportunity', 'Create Opportunity—Required Field Validation', 'Create/Validation', 'Sales Rep', 'P0',
          'On create form',
          '1.Leave Name/Customer/CloseDate/Contacts/DealCat/Pipeline/Currency empty\n2.Submit\n3.Fill each and submit',
          '1.All required hints shown\n2.Submit succeeds after all filled'),
        C('', 'Opportunity', 'Edit—Change Name/WinRate', 'Edit', 'Sales Rep', 'P0',
          'Is owner of A',
          '1.Detail\n2.Edit\n3.Change Name/WinRate\n4.Submit',
          '1.Saved'),
        C('', 'Opportunity', 'Detail Sub-tabs', 'Detail/Tabs', 'Sales Rep', 'P1',
          'Has related data',
          '1.Detail\n2.Click tabs',
          '1.Tabs correct'),
        C('', 'Opportunity', 'List View Switching', 'List/View', 'Sales Rep', 'P1',
          'Team has data',
          '1.List\n2.Click Owned/Team/Involved/All',
          '1.4 views correct'),
        C('', 'Opportunity', 'List Search—by Name', 'List/Search', 'Sales Rep', 'P2',
          'Multiple records',
          '1.List\n2.Type name\n3.Search',
          '1.Filtered'),
        C('', 'Opportunity', 'Suspend/Resume', 'Detail/Action', 'Sales Rep', 'P1',
          'Is X owner;X In Progress',
          '1.Detail\n2.Suspend\n3.Confirm\n4.Observe',
          '1.Suspended\n2.Open appears\n3.Stage unchanged'),
    ])
    print('Opportunity: zh=7 en=7')

    # ── P&L ──
    write_yaml(f'{BASE}/zh/P&L.yaml', 'TC-PL', [
        C('', 'P&L', '新建P&L—正常流程', 'Create', '销售人员', 'P0',
          '有进行中商机',
          '1.列表\n2.新建\n3.选商机/生效时间\n4.Submit',
          '1.成功\n2.Version自动'),
        C('', 'P&L', '新建P&L—必填项校验', 'Create/Validation', '销售人员', 'P1',
          '在新建表单',
          '1.商机/生效时间留空\n2.点击Submit\n3.逐字段填写后Submit',
          '1.商机/生效时间均有必填提示\n2.全部填完后提交成功'),
        C('', 'P&L', '编辑—改Margin', 'Edit', '销售人员', 'P1',
          '是创建人',
          '1.详情\n2.编辑\n3.改Margin\n4.Submit',
          '1.成功'),
        C('', 'P&L', '列表搜索', 'List/Search', '销售人员', 'P2',
          '有多条',
          '1.列表\n2.输关键词\n3.搜索',
          '1.筛选'),
    ])
    write_yaml(f'{BASE}/en/P&L.yaml', 'TC-PL', [
        C('', 'P&L', 'Create P&L—Normal Flow', 'Create', 'Sales Rep', 'P0',
          'In-Progress Oppty exists',
          '1.List\n2.New\n3.Select Oppty/Effective Date\n4.Submit',
          '1.Submitted\n2.Version auto'),
        C('', 'P&L', 'Create P&L—Required Field Validation', 'Create/Validation', 'Sales Rep', 'P1',
          'On create form',
          '1.Leave Oppty/Effective Date empty\n2.Submit\n3.Fill each and submit',
          '1.Required hints for Oppty/Date\n2.Submit succeeds'),
        C('', 'P&L', 'Edit—Change Margin', 'Edit', 'Sales Rep', 'P1',
          'Is creator',
          '1.Detail\n2.Edit\n3.Change Margin\n4.Submit',
          '1.Saved'),
        C('', 'P&L', 'List Search', 'List/Search', 'Sales Rep', 'P2',
          'Multiple records',
          '1.List\n2.Type keyword\n3.Search',
          '1.Filtered'),
    ])
    print('P&L: zh=4 en=4')

    # ── Quotation ──
    write_yaml(f'{BASE}/zh/报价单.yaml', 'TC-QUOTATION', [
        C('', '报价单', '新建报价单—正常流程', 'Create', '销售人员', 'P0',
          '有已审批P&L',
          '1.列表\n2.新建\n3.Header/P&L/Date\n4.确认自动填充\n5.Submit',
          '1.成功\n2.编号自动'),
        C('', '报价单', '新建报价单—必填项校验', 'Create/Validation', '销售人员', 'P1',
          '在新建表单',
          '1.P&L/Header/Date留空\n2.点击Submit\n3.逐字段填写后Submit',
          '1.P&L/Header/Date均有必填提示\n2.全部填完后提交成功'),
        C('', '报价单', 'P&L自动填充验证', 'Create/Linkage', '销售人员', 'P1',
          '有已审批P&L',
          '1.Header/Date\n2.选P&L\n3.观察',
          '1.Currency/Oppty/产品自动'),
        C('', '报价单', '列表搜索—按标题', 'List/Search', '销售人员', 'P2',
          '有多条',
          '1.列表\n2.输标题\n3.搜索',
          '1.筛选'),
    ])
    write_yaml(f'{BASE}/en/Quotation.yaml', 'TC-QUOTATION', [
        C('', 'Quotation', 'Create Quotation—Normal Flow', 'Create', 'Sales Rep', 'P0',
          'Approved P&L exists',
          '1.List\n2.New\n3.Header/P&L/Date\n4.Check auto-fill\n5.Submit',
          '1.Submitted\n2.ID auto'),
        C('', 'Quotation', 'Create Quotation—Required Field Validation', 'Create/Validation', 'Sales Rep', 'P1',
          'On create form',
          '1.Leave P&L/Header/Date empty\n2.Submit\n3.Fill each and submit',
          '1.Required hints for P&L/Header/Date\n2.Submit succeeds'),
        C('', 'Quotation', 'P&L Auto-fill', 'Create/Linkage', 'Sales Rep', 'P1',
          'Approved P&L exists',
          '1.Header/Date\n2.Select P&L\n3.Observe',
          '1.Currency/Oppty/Products auto'),
        C('', 'Quotation', 'List Search—by Header', 'List/Search', 'Sales Rep', 'P2',
          'Multiple records',
          '1.List\n2.Type header\n3.Search',
          '1.Filtered'),
    ])
    print('Quotation: zh=4 en=4')

    # ── PO ──
    write_yaml(f'{BASE}/zh/采购订单.yaml', 'TC-PO', [
        C('', '采购订单', '新建采购订单—正常流程', 'Create', '销售人员', 'P0',
          '有报价单',
          '1.列表\n2.新建\n3.PO编号/报价单/PO文件\n4.保存',
          '1.成功'),
        C('', '采购订单', '新建采购订单—必填项校验', 'Create/Validation', '销售人员', 'P1',
          '在新建表单',
          '1.PO编号/报价单/PO文件留空\n2.点击保存\n3.逐字段填写后保存',
          '1.PO编号/报价单/PO文件均有必填提示\n2.全部填完后保存成功'),
        C('', '采购订单', '列表搜索—按编号', 'List/Search', '销售人员', 'P2',
          '有多条',
          '1.列表\n2.输编号\n3.搜索',
          '1.筛选'),
    ])
    write_yaml(f'{BASE}/en/PO.yaml', 'TC-PO', [
        C('', 'PO', 'Create PO—Normal Flow', 'Create', 'Sales Rep', 'P0',
          'Quotation exists',
          '1.List\n2.New\n3.PO No./Quotation/PO File\n4.Save',
          '1.Saved'),
        C('', 'PO', 'Create PO—Required Field Validation', 'Create/Validation', 'Sales Rep', 'P1',
          'On create form',
          '1.Leave PO No./Quotation/File empty\n2.Save\n3.Fill each and save',
          '1.Required hints for PO No./Quotation/File\n2.Save succeeds'),
        C('', 'PO', 'List Search—by PO No.', 'List/Search', 'Sales Rep', 'P2',
          'Multiple records',
          '1.List\n2.Type number\n3.Search',
          '1.Filtered'),
    ])
    print('PO: zh=3 en=3')

    # ── Sales Order ──
    write_yaml(f'{BASE}/zh/销售订单.yaml', 'TC-SO', [
        C('', '销售订单', '新建销售订单—正常流程', 'Create', '销售人员', 'P0',
          '有报价单',
          '1.列表\n2.新建\n3.PO/下单日期\n4.产品表\n5.Payment Schedule\n6.保存',
          '1.成功\n2.编号'),
        C('', '销售订单', '新建销售订单—必填项校验', 'Create/Validation', '销售人员', 'P1',
          '在新建表单',
          '1.PO/下单日期留空\n2.点击保存\n3.逐字段填写后保存',
          '1.PO/下单日期均有必填提示\n2.全部填完后保存成功'),
        C('', '销售订单', '编辑—改条款', 'Edit', '销售人员', 'P1',
          '是A负责人',
          '1.详情\n2.编辑\n3.改条款\n4.保存',
          '1.成功\n2.条款更新'),
        C('', '销售订单', '列表搜索—按编号', 'List/Search', '销售人员', 'P2',
          '有多条',
          '1.列表\n2.输编号\n3.搜索',
          '1.筛选'),
        C('', '销售订单', '按百分比里程碑', 'Create', '销售人员', 'P1',
          '有报价单',
          '1.表单\n2.填必填\n3.里程碑切按百分比\n4.设比例验证100%\n5.保存',
          '1.成功\n2.里程碑按比例'),
    ])
    write_yaml(f'{BASE}/en/Sales Order.yaml', 'TC-SO', [
        C('', 'Sales Order', 'Create Sales Order—Normal Flow', 'Create', 'Sales Rep', 'P0',
          'Quotation exists',
          '1.List\n2.New\n3.PO/OrderDate\n4.Products table\n5.Payment Schedule\n6.Save',
          '1.Saved\n2.ID auto'),
        C('', 'Sales Order', 'Create Sales Order—Required Field Validation', 'Create/Validation', 'Sales Rep', 'P1',
          'On create form',
          '1.Leave PO/OrderDate empty\n2.Save\n3.Fill each and save',
          '1.Required hints for PO/OrderDate\n2.Save succeeds'),
        C('', 'Sales Order', 'Edit—Change Terms', 'Edit', 'Sales Rep', 'P1',
          'Is owner of A',
          '1.Detail\n2.Edit\n3.Change Terms\n4.Save',
          '1.Saved\n2.Terms updated'),
        C('', 'Sales Order', 'List Search—by No.', 'List/Search', 'Sales Rep', 'P2',
          'Multiple records',
          '1.List\n2.Type number\n3.Search',
          '1.Filtered'),
        C('', 'Sales Order', 'Percentage Milestones', 'Create', 'Sales Rep', 'P1',
          'Quotation exists',
          '1.Form\n2.Fill required\n3.Switch to ByPercentage\n4.Set ratios 100%\n5.Save',
          '1.Saved\n2.Milestones distributed'),
    ])
    print('Sales Order: zh=5 en=5')

    # ── Contract ──
    write_yaml(f'{BASE}/zh/合同.yaml', 'TC-CONTRACT', [
        C('', '合同', '新建合同—正常流程', 'Create', '销售人员', 'P0',
          '有销售订单',
          '1.列表\n2.新建\n3.标题/销售订单/签署/到期/附件/通知\n4.Reminder明细\n5.保存',
          '1.成功\n2.编号'),
        C('', '合同', '新建合同—必填项校验', 'Create/Validation', '销售人员', 'P0',
          '在新建表单',
          '1.标题/SO/签署日期/到期日期/附件留空\n2.点击保存\n3.逐字段填写后保存',
          '1.标题/SO/签署日期/到期日期/附件均有必填提示\n2.全部填完后保存成功'),
        C('', '合同', '列表搜索—按标题', 'List/Search', '销售人员', 'P2',
          '有多条',
          '1.列表\n2.输标题\n3.搜索',
          '1.筛选'),
    ])
    write_yaml(f'{BASE}/en/Contract.yaml', 'TC-CONTRACT', [
        C('', 'Contract', 'Create Contract—Normal Flow', 'Create', 'Sales Rep', 'P0',
          'SO exists',
          '1.List\n2.New\n3.Title/SO/SignedDate/Expiry/Attach/Notify\n4.Reminder table\n5.Save',
          '1.Saved\n2.ID auto'),
        C('', 'Contract', 'Create Contract—Required Field Validation', 'Create/Validation', 'Sales Rep', 'P0',
          'On create form',
          '1.Leave Title/SO/SignDate/ExpiryDate/Attachment empty\n2.Save\n3.Fill each and save',
          '1.Required hints for Title/SO/SignDate/ExpiryDate/Attachment\n2.Save succeeds'),
        C('', 'Contract', 'List Search—by Title', 'List/Search', 'Sales Rep', 'P2',
          'Multiple records',
          '1.List\n2.Type title\n3.Search',
          '1.Filtered'),
    ])
    print('Contract: zh=3 en=3')

    # ── Delivery ──
    write_yaml(f'{BASE}/zh/交付.yaml', 'TC-DELIVERY', [
        C('', '交付', '新建发货单—正常流程', 'Create', '销售人员', 'P0',
          '有销售订单',
          '1.列表\n2.新建\n3.销售订单号\n4.发货产品/数量\n5.保存',
          '1.成功'),
        C('', '交付', '销售订单未选', 'Create/Validation', '销售人员', 'P0',
          '在表单',
          '1.SO留空\n2.保存',
          '1.失败\n2.SO必填'),
        C('', '交付', '列表搜索', 'List/Search', '销售人员', 'P2',
          '有多条',
          '1.列表\n2.输编号\n3.搜索',
          '1.筛选'),
    ])
    write_yaml(f'{BASE}/en/Delivery.yaml', 'TC-DELIVERY', [
        C('', 'Delivery', 'Create Delivery—Normal Flow', 'Create', 'Sales Rep', 'P0',
          'SO exists',
          '1.List\n2.New\n3.SO No.\n4.Products/Qty\n5.Save',
          '1.Saved'),
        C('', 'Delivery', 'Create—SO Required', 'Create/Validation', 'Sales Rep', 'P0',
          'On form',
          '1.SO empty\n2.Save',
          '1.Fail\n2.SO required'),
        C('', 'Delivery', 'List Search', 'List/Search', 'Sales Rep', 'P2',
          'Multiple records',
          '1.List\n2.Type number\n3.Search',
          '1.Filtered'),
    ])
    print('Delivery: zh=3 en=3')

    # ── Invoice ──
    write_yaml(f'{BASE}/zh/开票申请.yaml', 'TC-INVOICE', [
        C('', '开票申请', '新建开票—正常流程', 'Create', '销售人员', 'P0',
          '有销售订单',
          '1.列表\n2.新建\n3.发票类型\n4.SO/公司名称\n5.保存',
          '1.成功\n2.编号\n3.PI/Ref自动'),
        C('', '开票申请', '新建开票—必填项校验', 'Create/Validation', '销售人员', 'P1',
          '在新建表单',
          '1.发票类型/SO/公司名称留空\n2.点击保存\n3.逐字段填写后保存',
          '1.发票类型/SO/公司名称均有必填提示\n2.全部填完后保存成功'),
        C('', '开票申请', '列表搜索', 'List/Search', '销售人员', 'P2',
          '有多条',
          '1.列表\n2.输编号\n3.搜索',
          '1.筛选'),
    ])
    write_yaml(f'{BASE}/en/Invoice.yaml', 'TC-INVOICE', [
        C('', 'Invoice', 'Create Invoice—Normal Flow', 'Create', 'Sales Rep', 'P0',
          'SO exists',
          '1.List\n2.New\n3.InvoiceType\n4.SO/Company\n5.Save',
          '1.Saved\n2.ID auto\n3.PI/Ref auto'),
        C('', 'Invoice', 'Create Invoice—Required Field Validation', 'Create/Validation', 'Sales Rep', 'P1',
          'On create form',
          '1.Leave Type/SO/Company empty\n2.Save\n3.Fill each and save',
          '1.Required hints for Type/SO/Company\n2.Save succeeds'),
        C('', 'Invoice', 'List Search', 'List/Search', 'Sales Rep', 'P2',
          'Multiple records',
          '1.List\n2.Type number\n3.Search',
          '1.Filtered'),
    ])
    print('Invoice: zh=3 en=3')

    # ── Collection ──
    write_yaml(f'{BASE}/zh/回款.yaml', 'TC-COLLECTION', [
        C('', '回款', '新建回款—正常流程', 'Create', '销售人员', 'P0',
          '有客户/回款计划',
          '1.列表(Revenue)\n2.新建\n3.客户/日期/货币/金额\n4.里程碑明细\n5.保存',
          '1.成功\n2.编号\n3.Allocated自动'),
        C('', '回款', '新建回款—必填项校验', 'Create/Validation', '销售人员', 'P0',
          '在新建表单',
          '1.客户/日期/金额/货币留空\n2.点击保存\n3.逐字段填写后保存',
          '1.客户/日期/金额/货币均有必填提示\n2.全部填完后保存成功'),
        C('', '回款', '列表搜索', 'List/Search', '销售人员', 'P2',
          '有多条',
          '1.列表\n2.输客户名\n3.搜索',
          '1.筛选'),
    ])
    write_yaml(f'{BASE}/en/Collection.yaml', 'TC-COLLECTION', [
        C('', 'Collection', 'Create Collection—Normal Flow', 'Create', 'Sales Rep', 'P0',
          'Customer/PaymentPlan exist',
          '1.List(Revenue)\n2.New\n3.Customer/Date/Currency/Amount\n4.Milestones\n5.Save',
          '1.Saved\n2.ID auto\n3.Allocated auto'),
        C('', 'Collection', 'Create Collection—Required Field Validation', 'Create/Validation', 'Sales Rep', 'P0',
          'On create form',
          '1.Leave Customer/Date/Amount/Currency empty\n2.Save\n3.Fill each and save',
          '1.Required hints for Customer/Date/Amount/Currency\n2.Save succeeds'),
        C('', 'Collection', 'List Search', 'List/Search', 'Sales Rep', 'P2',
          'Multiple records',
          '1.List\n2.Type customer\n3.Search',
          '1.Filtered'),
    ])
    print('Collection: zh=3 en=3')

    # ── Product ──
    write_yaml(f'{BASE}/zh/产品.yaml', 'TC-PRODUCT', [
        C('', '产品', '新建产品—正常流程', 'Create', '销售人员', 'P0',
          '有供应商',
          '1.列表(产品管理)\n2.新建\n3.名称/编码/类型/供应商/单价/货币\n4.保存',
          '1.成功\n2.已上架'),
        C('', '产品', '新建产品—必填项校验', 'Create/Validation', '销售人员', 'P0',
          '在新建表单',
          '1.名称/编码/类型/供应商留空\n2.点击保存\n3.逐字段填写后保存',
          '1.名称/编码/类型/供应商均有必填提示\n2.全部填完后保存成功'),
        C('', '产品', '列表搜索', 'List/Search', '销售人员', 'P2',
          '有多条',
          '1.列表\n2.输名称\n3.搜索',
          '1.筛选'),
    ])
    write_yaml(f'{BASE}/en/Product.yaml', 'TC-PRODUCT', [
        C('', 'Product', 'Create Product—Normal Flow', 'Create', 'Sales Rep', 'P0',
          'Supplier exists',
          '1.List(Products)\n2.New\n3.Name/Code/Type/Supplier/UnitPrice/Currency\n4.Save',
          '1.Saved\n2.Published'),
        C('', 'Product', 'Create Product—Required Field Validation', 'Create/Validation', 'Sales Rep', 'P0',
          'On create form',
          '1.Leave Name/Code/Type/Supplier empty\n2.Save\n3.Fill each and save',
          '1.Required hints for Name/Code/Type/Supplier\n2.Save succeeds'),
        C('', 'Product', 'List Search', 'List/Search', 'Sales Rep', 'P2',
          'Multiple records',
          '1.List\n2.Type name\n3.Search',
          '1.Filtered'),
    ])
    print('Product: zh=3 en=3')

    # ── Pipeline Kanban ──
    write_yaml(f'{BASE}/zh/管道看板.yaml', 'TC-KANBAN', [
        C('', '管道看板', '查看看板—验证阶段磁贴', 'View', '销售人员', 'P0',
          '已登录;有数据',
          '1.进看板\n2.观察7磁贴\n3.记录数量和金额',
          '1.7磁贴:Lead/Oppty/Qtn/PO/SO/PI/Pmt\n2.各显示数量金额'),
        C('', '管道看板', '点击磁贴筛选', 'Filter', '销售人员', 'P1',
          '数据已加载',
          '1.进看板\n2.点磁贴\n3.看列表\n4.Reset',
          '1.点击后仅该阶段\n2.Reset恢复'),
        C('', '管道看板', '时间筛选', 'Filter', '销售人员', 'P1',
          '数据已加载',
          '1.进看板\n2.This Year\n3.This Month\n4.Custom',
          '1.各时间数据变化'),
        C('', '管道看板', '查看交易列表', 'View', '销售人员', 'P1',
          '列表有数据',
          '1.进看板\n2.看列表\n3.点项目名',
          '1.列:Project/Amount/Rep/Stage/Date\n2.点名称进详情'),
    ])
    write_yaml(f'{BASE}/en/Pipeline Kanban.yaml', 'TC-KANBAN', [
        C('', 'Pipeline Kanban', 'View—Stage Tiles', 'View', 'Sales Rep', 'P0',
          'Logged in;Data exists',
          '1.Open kanban\n2.Observe 7 tiles\n3.Record counts',
          '1.7 tiles:Lead/Oppty/Qtn/PO/SO/PI/Pmt\n2.Show counts+amounts'),
        C('', 'Pipeline Kanban', 'Filter by Stage Tile', 'Filter', 'Sales Rep', 'P1',
          'Data loaded',
          '1.Open kanban\n2.Click tile\n3.View list\n4.Reset',
          '1.Filters to stage\n2.Reset restores'),
        C('', 'Pipeline Kanban', 'Time Period Filter', 'Filter', 'Sales Rep', 'P1',
          'Data loaded',
          '1.Open kanban\n2.This Year\n3.This Month\n4.Custom',
          '1.Data changes per period'),
        C('', 'Pipeline Kanban', 'View Deal List', 'View', 'Sales Rep', 'P1',
          'List has data',
          '1.Open kanban\n2.View list\n3.Click deal name',
          '1.Columns:Project/Amount/Rep/Stage/Date\n2.Detail page'),
    ])
    print('Pipeline Kanban: zh=4 en=4')


def generate_admin():
    """Generate admin YAML files (from gen_admin.py)"""
    import subprocess
    subprocess.run(['python3', 'scripts/gen_admin.py'], check=True)
    print('Admin YAML files regenerated from gen_admin.py')


if __name__ == '__main__':
    # First, clean the dirs to avoid leftover files
    for d in ['zh', 'en']:
        dirp = f'{BASE}/{d}'
        if os.path.isdir(dirp):
            for f in os.listdir(dirp):
                if f.endswith('.yaml') or f.endswith('.xlsx'):
                    os.remove(os.path.join(dirp, f))

    generate_zh_en()
    generate_admin()
    print('\n🎉 All YAML files regenerated with merged validation cases!')
