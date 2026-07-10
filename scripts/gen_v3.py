#!/usr/bin/env python3
"""Generate all 14 modules yaml with proper field names and real newlines"""
import os
BASE = 'doc/SM测试用例-收集箱/AI输出/基础功能用例'

# Use \n as actual newlines via triple-quoted strings
def T(id, m, n, c, r, p, pre, steps, exp, notes='', st=None):
    return {'id':id,'m':m,'n':n,'c':c,'r':r,'p':p,
            'pre':pre,'steps':steps,'exp':exp,'notes':notes,
            'st':st or ('草稿' if '销售' in r or '管理' in r else 'Draft')}

def write_yaml(path, cases):
    with open(path, 'w') as f:
        f.write('---\ncases:\n')
        for c in cases:
            f.write(f'\n  - id: {c["id"]}\n    module: {c["m"]}\n    name: {c["n"]}\n    category: {c["c"]}\n    role: {c["r"]}\n    priority: {c["p"]}\n')
            for ki, k in enumerate(['precondition','steps','expected','notes']):
                v = [c['pre'], c['steps'], c['exp'], c['notes']][ki]
                if v:
                    f.write(f'    {k}: |\n')
                    for l in v.split('\n'):
                        f.write(f'      {l}\n')
            f.write(f'    status: {c["st"]}\n')

# Multi-line helpers
def ZP(pre, steps, exp):
    """ZH pre/steps/exp"""
    return (pre, steps, exp)

# ═══════════ CONTACT (16) ═══════════
def contact_data(role, status, mod='联系人', prefix='TC-CONTACT'):
    return [
        T(f'{prefix}-001', mod, '新建联系人—正常流程', '新建', role, 'P0',
          '已登录CRM\n有客户数据',
          '1.进入列表页\n2.点击新建\n3.填写姓名/性别/业务类型\n4.填写手机或邮件\n5.点击保存',
          '1.保存成功\n2.列表出现新记录',
          '必填3个:姓名、性别、业务类型', status),
        T(f'{prefix}-002', mod, '新建联系人—姓名未填', '新建/校验', role, 'P0',
          '已登录CRM\n在新建表单',
          '1.选择性别\n2.选择业务类型\n3.填写手机号\n4.姓名留空\n5.点击保存',
          '1.保存失败\n2.姓名字段必填提示', '', status),
        T(f'{prefix}-003', mod, '新建联系人—性别未选', '新建/校验', role, 'P0',
          '已登录CRM\n在新建表单',
          '1.填写姓名\n2.选择业务类型\n3.填写手机号\n4.性别不选\n5.点击保存',
          '1.保存失败\n2.性别字段必填提示', '', status),
        T(f'{prefix}-004', mod, '新建联系人—业务类型未选', '新建/校验', role, 'P0',
          '已登录CRM\n在新建表单',
          '1.填写姓名\n2.选择性别\n3.填写手机号\n4.业务类型不选\n5.点击保存',
          '1.保存失败\n2.业务类型必填提示', '', status),
        T(f'{prefix}-005', mod, '新建联系人—手机和邮件都不填', '新建/校验', role, 'P0',
          '已登录CRM\n在新建表单',
          '1.填写姓名/性别/业务类型\n2.手机号留空\n3.邮件留空\n4.点击保存',
          '1.保存失败\n2.提示手机和邮件至少填一项', '', status),
        T(f'{prefix}-006', mod, '新建联系人—仅填手机(通过)', '新建/校验', role, 'P1',
          '已登录CRM\n在新建表单',
          '1.填写姓名/性别/业务类型\n2.填写手机号\n3.邮件留空\n4.点击保存',
          '1.保存成功', '', status),
        T(f'{prefix}-007', mod, '新建联系人—仅填邮件(通过)', '新建/校验', role, 'P1',
          '已登录CRM\n在新建表单',
          '1.填写姓名/性别/业务类型\n2.手机号留空\n3.填写邮件\n4.点击保存',
          '1.保存成功', '', status),
        T(f'{prefix}-008', mod, '新建联系人—不关联客户', '新建/校验', role, 'P2',
          '已登录CRM\n在新建表单',
          '1.填写姓名/性别/业务类型/手机号\n2.客户字段留空\n3.点击保存',
          '1.保存成功\n2.未关联客户', '', status),
        T(f'{prefix}-009', mod, '编辑联系人—修改姓名和职务', '编辑', role, 'P0',
          '已登录CRM\n是联系人A的负责人',
          '1.进入详情页\n2.点击编辑\n3.修改姓名和职务\n4.点击保存',
          '1.保存成功\n2.姓名和职务更新', '', status),
        T(f'{prefix}-010', mod, '删除联系人', '删除', role, 'P1',
          '已登录CRM\n是联系人A的负责人',
          '1.进入详情页\n2.点击删除\n3.确认',
          '1.删除成功\n2.列表消失', '', status),
        T(f'{prefix}-011', mod, '变更负责人', '权限/转移', role, 'P1',
          '已登录CRM\n有销售人员B\nA是联系人X的负责人',
          '1.进入详情页\n2.点击变更负责人\n3.选择B\n4.确认',
          '1.变更成功\n2.负责人显示为B', '', status),
        T(f'{prefix}-012', mod, '添加团队成员(服务团队面板)', '团队', role, 'P1',
          '已登录CRM\n有销售人员C',
          '1.进入详情页\n2.服务团队添加C\n3.保存',
          '1.添加成功\n2.C可看到', '', status),
        T(f'{prefix}-013', mod, '详情页子标签页切换', '详情/标签页', role, 'P1',
          '已登录CRM\n有关联线索和商机',
          '1.进入详情页\n2.点击Lead/Opportunity标签\n3.切回Detailed Info',
          '1.标签页正常切换', '', status),
        T(f'{prefix}-014', mod, '列表页视图切换—My Contact/All', '列表/视图', role, 'P1',
          '已登录CRM\n有联系人数据',
          '1.进入列表页\n2.观察My Contact\n3.切换到All',
          '1.My Contact仅显示本人\n2.All显示全部', '', status),
        T(f'{prefix}-015', mod, '列表搜索—按姓名搜索', '列表/搜索', role, 'P1',
          '已登录CRM\n有联系人张三丰',
          '1.进入列表页\n2.输入张三丰\n3.触发搜索',
          '1.筛选出匹配的联系人', '', status),
        T(f'{prefix}-016', mod, '批量导入联系人—Excel模板', '导入', role, 'P1',
          '已登录CRM\n有Excel模板',
          '1.进入列表页\n2.点击导入\n3.上传Excel\n4.选择导入模式\n5.确认',
          '1.导入完成\n2.显示导入汇总', '', status),
    ]

# Write contact
write_yaml(f'{BASE}/zh/联系人.yaml', contact_data('销售人员', '草稿'), )
# English
contact_en = contact_data('Sales Rep', 'Draft', 'Contact')
en_names = ['Create Contact—Normal Flow','Create—Name Required','Create—Gender Required','Create—Type Required',
            'Create—Neither Mobile/Email','Create—Mobile Only(Pass)','Create—Email Only(Pass)','Create—No Customer(Pass)',
            'Edit Contact—Change Name/Job Title','Delete Contact','Change Owner','Add Team Member via Service Team',
            'Detail Page Sub-tab Switching','List View—My Contact/All','List Search—by Name','Batch Import—Excel Template']
for i, c in enumerate(contact_en):
    c['n'] = en_names[i]
write_yaml(f'{BASE}/en/Contact.yaml', contact_en)
print(f'Contact: zh={len(contact_data("销售人员", "草稿"))} en={len(contact_en)}')

print('Contact done')
