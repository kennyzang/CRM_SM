#!/usr/bin/env python3
"""Recover all test case YAMLs from compact data + templates"""
import os, shutil

BASE = 'doc/SM测试用例-收集箱/AI输出/基础功能用例'
os.makedirs(f'{BASE}/zh', exist_ok=True)
os.makedirs(f'{BASE}/en', exist_ok=True)
os.makedirs(f'{BASE}/admin_zh', exist_ok=True)
os.makedirs(f'{BASE}/admin_en', exist_ok=True)

def make(module, name, cat, role, prio, pre, steps, exp, notes='', status='草稿'):
    return dict(id=None, module=module, name=name, cat=cat, role=role, prio=prio,
                pre=pre, steps=steps, exp=exp, notes=notes, status=status)

def write_yaml(filepath, cases, header=''):
    with open(filepath, 'w') as f:
        f.write(f'# {header}\n---\ncases:\n')
        for c in cases:
            f.write(f'\n  - id: {c["id"]}\n    module: {c["module"]}\n    name: {c["name"]}\n    category: {c["cat"]}\n    role: {c["role"]}\n    priority: {c["prio"]}\n')
            for k in ['pre','steps','exp','notes']:
                f.write(f'    {k}: |\n')
                for line in c[k].split('\n'):
                    f.write(f'      {line}\n')
            f.write(f'    status: {c["status"]}\n')

def seq(id_start, count):
    return [f'TC-{id_start}-{str(i).zfill(3)}' for i in range(1, count+1)]

# ═══════════════════ 联系人 (16) ═══════════════════
contact = [
    make('联系人','新建联系人 — 正常流程','新建','销售人员','P0','1. 已登录 CRM 系统\n2. 有客户数据','1. 进入联系人列表页\n2. 点击新建\n3. 填写必填字段：姓名、性别、业务类型\n4. 填写手机或邮件\n5. 点击保存','1. 保存成功\n2. 列表出现新记录','必填3个：姓名、性别、业务类型'),
    make('联系人','新建联系人 — 姓名未填','新建 / 校验','销售人员','P0','1. 已登录 CRM\n2. 在新建表单','1. 选择性别\n2. 选择业务类型\n3. 填写手机号\n4. 姓名留空\n5. 点击保存','1. 保存失败\n2. 姓名字段必填提示'),
    make('联系人','新建联系人 — 性别未选','新建 / 校验','销售人员','P0','1. 已登录 CRM\n2. 在新建表单','1. 填写姓名\n2. 选择业务类型\n3. 填写手机号\n4. 性别不选\n5. 点击保存','1. 保存失败\n2. 性别字段必填提示'),
    make('联系人','新建联系人 — 业务类型未选','新建 / 校验','销售人员','P0','1. 已登录 CRM\n2. 在新建表单','1. 填写姓名\n2. 选择性别\n3. 填写手机号\n4. 业务类型不选\n5. 点击保存','1. 保存失败\n2. 业务类型必填提示'),
    make('联系人','新建联系人 — 手机和邮件都不填','新建 / 校验','销售人员','P0','1. 已登录 CRM\n2. 在新建表单','1. 填写姓名、性别、业务类型\n2. 手机留空\n3. 邮件留空\n4. 点击保存','1. 保存失败\n2. 提示至少填一项'),
    make('联系人','新建联系人 — 仅填手机不填邮件','新建 / 校验','销售人员','P1','1. 已登录 CRM\n2. 在新建表单','1. 填写姓名、性别、业务类型\n2. 填写手机号\n3. 邮件留空\n4. 点击保存','1. 保存成功'),
    make('联系人','新建联系人 — 仅填邮件不填手机','新建 / 校验','销售人员','P1','1. 已登录 CRM\n2. 在新建表单','1. 填写姓名、性别、业务类型\n2. 手机留空\n3. 填写邮件\n4. 点击保存','1. 保存成功'),
    make('联系人','新建联系人 — 不关联客户','新建 / 校验','销售人员','P2','1. 已登录 CRM\n2. 在新建表单','1. 填写姓名、性别、业务类型、手机号\n2. 客户留空\n3. 点击保存','1. 保存成功\n2. 未关联客户'),
    make('联系人','编辑联系人 — 修改姓名和职务','编辑','销售人员','P0','1. 已登录 CRM\n2. 是联系人 A 的负责人','1. 进入详情页\n2. 点击编辑\n3. 修改姓名和职务\n4. 点击保存','1. 保存成功\n2. 姓名和职务更新'),
    make('联系人','删除联系人','删除','销售人员','P1','1. 已登录 CRM\n2. 是联系人 A 的负责人','1. 进入详情页\n2. 点击删除\n3. 确认','1. 删除成功\n2. 列表消失'),
    make('联系人','变更负责人','权限 / 转移','销售人员','P1','1. 已登录 CRM\n2. 有销售人员 B\n3. A 是联系人 X 的负责人','1. 进入详情页\n2. 点击变更负责人\n3. 选择 B\n4. 确认','1. 变更成功\n2. 负责人为 B'),
    make('联系人','添加团队成员','团队','销售人员','P1','1. 已登录 CRM\n2. 有销售人员 C','1. 进入详情页\n2. 服务团队添加 C\n3. 保存','1. 添加成功\n2. C 可见'),
    make('联系人','详情页子标签页切换','详情 / 标签页','销售人员','P1','1. 已登录 CRM\n2. 有关联线索和商机','1. 进入详情页\n2. 点击 Lead 和 Opportunity 标签\n3. 切回 Detailed Info','1. 标签页正常切换'),
    make('联系人','列表页视图切换 — My Contact / All','列表 / 视图','销售人员','P1','1. 已登录 CRM\n2. 有联系人数据','1. 进入列表页\n2. 观察默认视图\n3. 切换到 All','1. My Contact 仅本人负责\n2. All 全部可见'),
    make('联系人','列表搜索 — 按姓名搜索','列表 / 搜索','销售人员','P1','1. 已登录 CRM\n2. 存在联系人张三丰','1. 进入列表页\n2. 输入张三丰\n3. 触发搜索','1. 筛选出匹配的联系人'),
    make('联系人','批量导入联系人 — Excel 模板导入','导入','销售人员','P1','1. 已登录 CRM\n2. 已准备 Excel 模板','1. 进入列表页\n2. 点击导入\n3. 上传 Excel\n4. 选择导入模式\n5. 确认','1. 导入完成\n2. 显示导入汇总'),
]
for i, c in enumerate(contact):
    c['id'] = f'TC-CONTACT-{str(i+1).zfill(3)}'

# Quick write contact
write_yaml(f'{BASE}/zh/contact.yaml', contact, '联系人')
# English version with translations
contact_en = [dict(**c, id=f'TC-CONTACT-{str(i+1).zfill(3)}', module='Contact', role='Sales Rep',
                   status='Draft', name=c['name'].replace('联系人','Contact') if '联系' in c['name'] else c['name']) for i, c in enumerate(contact)]
# Fix names
names = ['Create Contact — Normal Flow','Create Contact — Name Required','Create Contact — Gender Required',
         'Create Contact — Type Required','Create Contact — Neither Mobile/Email','Create Contact — Mobile Only',
         'Create Contact — Email Only','Create Contact — No Customer','Edit Contact — Change Name & Job Title',
         'Delete Contact','Change Owner','Add Team Member','Detail Page Sub-tab Switching',
         'List Page View Switching — My Contact / All','List Search — Search by Name',
         'Batch Import Contacts — Excel Template']
for i, c in enumerate(contact_en):
    c['name'] = names[i]
write_yaml(f'{BASE}/en/contact.yaml', contact_en, 'Contact')

print('Contact done!')
# ... more modules to follow
