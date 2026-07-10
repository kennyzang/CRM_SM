#!/usr/bin/env python3
"""Rebuild admin_zh and admin_en YAMLs from zh/en + admin extras"""
import os, shutil, re

BASE = 'doc/SM测试用例-收集箱/AI输出/基础功能用例'

# ── Read zh/en YAMLs and convert ──
def convert_to_admin(src_dir, dst_dir, role_from, role_to, prefix):
    """Copy YAMLs from src to dst, change role and prefix IDs"""
    os.makedirs(dst_dir, exist_ok=True)
    for yaml in os.listdir(src_dir):
        if not yaml.endswith('.yaml'):
            continue
        with open(f'{src_dir}/{yaml}', 'r') as f:
            content = f.read()
        # Change role
        content = content.replace(f"role: {role_from}", f"role: {role_to}")
        # Prefix admin IDs
        content = re.sub(r'^  - id: TC-', f'  - id: TC-ADMIN-', content, flags=re.MULTILINE)
        with open(f'{dst_dir}/{yaml}', 'w') as f:
            f.write(content)
    print(f'  {src_dir} -> {dst_dir}')

# ── Admin extra cases ──
ZH_EXTRAS = {
    'contact': """
  - id: TC-ADMIN-CONTACT-017
    module: 联系人
    name: 批量删除联系人（列表页多选删除）
    category: 删除
    role: 销售管理员
    priority: P1
    precondition: |
      1. 已登录 CRM 系统作为销售管理员
      2. 列表页存在多条联系人记录
    steps: |
      1. 进入联系人列表页
      2. 勾选多条联系人
      3. 点击「批量删除」按钮
      4. 确认删除
    expected: |
      1. 删除成功，选中的联系人全部消失
    status: 草稿
    notes: |
      管理员可批量删除
""",
    'lead': """
  - id: TC-ADMIN-LEAD-017
    module: 线索
    name: 分配线索 — 管理员将未分配线索指派给销售
    category: 分配
    role: 销售管理员
    priority: P0
    precondition: |
      1. 已登录 CRM 系统作为线索池管理员
      2. 存在一条状态为未分配的线索
    steps: |
      1. 进入线索 X 的详情页
      2. 点击「分配」按钮
      3. 搜索并选择目标销售人员
      4. 确认分配
    expected: |
      1. 分配成功
      2. 线索状态变为待处理
      3. 责任人更新为被指派的销售人员
    status: 草稿
    notes: |
      手册：管理员可将未分配线索指派给指定销售。

  - id: TC-ADMIN-LEAD-018
    module: 线索
    name: 收回线索 — 管理员强制收回已分配线索
    category: 收回
    role: 销售管理员
    priority: P1
    precondition: |
      1. 已登录 CRM 系统作为线索池管理员
      2. 线索 X 状态为待处理/跟进中
    steps: |
      1. 进入线索 X 的详情页
      2. 点击「收回」按钮
      3. 确认收回
    expected: |
      1. 收回成功
      2. 线索状态变为未分配
    status: 草稿
    notes: |
      手册：管理员可强制收回已分配线索。

  - id: TC-ADMIN-LEAD-019
    module: 线索
    name: 转移线索 — 管理员将线索移至另一线索池
    category: 转移
    role: 销售管理员
    priority: P1
    precondition: |
      1. 已登录 CRM 系统作为线索池管理员
      2. 存在两个不同的线索池
    steps: |
      1. 进入线索 X 的详情页
      2. 点击「转移」按钮
      3. 选择目标线索池
      4. 确认转移
    expected: |
      1. 转移成功
      2. 线索归属的线索池变更为目标池
    status: 草稿
    notes: |
      手册：管理员可将线索移至其他线索池（需规则允许转移）。
""",
    'customer': """
  - id: TC-ADMIN-CUSTOMER-014
    module: 客户
    name: 分配客户 — 管理员将公海客户指派给销售
    category: 分配 / 公海
    role: 销售管理员
    priority: P0
    precondition: |
      1. 已登录 CRM 系统作为公海管理员
      2. 存在一条未分配状态的客户
    steps: |
      1. 进入客户 X 的详情页
      2. 点击「分配」按钮
      3. 搜索并选择目标销售人员
      4. 确认分配
    expected: |
      1. 分配成功
      2. 客户状态变为已分配
      3. 负责人更新为被指派的销售
    status: 草稿
    notes: |
      手册：公海管理员可将客户指派给指定销售。

  - id: TC-ADMIN-CUSTOMER-015
    module: 客户
    name: 收回客户 — 管理员强制收回已分配客户
    category: 收回 / 公海
    role: 销售管理员
    priority: P1
    precondition: |
      1. 已登录 CRM 系统作为公海管理员
      2. 客户 X 状态为已分配
    steps: |
      1. 进入客户 X 的详情页
      2. 点击「收回」按钮
      3. 确认
    expected: |
      1. 收回成功
      2. 客户状态变为未分配
    status: 草稿
    notes: |
      手册：公海管理员可强制收回已分配客户。

  - id: TC-ADMIN-CUSTOMER-016
    module: 客户
    name: 转移客户 — 管理员将客户移至另一公海
    category: 转移 / 公海
    role: 销售管理员
    priority: P1
    precondition: |
      1. 已登录 CRM 系统作为公海管理员
      2. 存在两个不同的公海
    steps: |
      1. 进入客户 X 的详情页
      2. 点击「转移」按钮
      3. 选择目标公海
      4. 确认
    expected: |
      1. 转移成功
      2. 客户所属公海变更
    status: 草稿
    notes: |
      手册：管理员可将客户移至其他公海（需规则允许转移）。
""",
    'opportunity': """
  - id: TC-ADMIN-OPPORTUNITY-014
    module: 商机
    name: 导入商机 — 批量导入 Excel
    category: 导入
    role: 销售管理员
    priority: P2
    precondition: |
      1. 已登录 CRM 系统作为销售管理员
      2. 已准备 Excel 导入模板
    steps: |
      1. 进入商机列表页
      2. 点击「导入」按钮
      3. 上传 Excel 文件
      4. 确认导入
    expected: |
      1. 导入完成
      2. 列表页出现新商机
    status: 草稿
    notes: |
      手册权限表：仅销售管理员有商机导入权限。
""",
}

EN_EXTRAS = {
    'contact': """
  - id: TC-ADMIN-CONTACT-017
    module: Contact
    name: Batch Delete Contacts
    category: Delete
    role: Sales Admin
    priority: P1
    precondition: |
      1. Logged into CRM as Sales Admin
      2. Multiple contacts exist
    steps: |
      1. Enter Contact list page
      2. Check multiple contacts
      3. Click batch delete button
      4. Confirm
    expected: |
      1. Deleted successfully, selected contacts disappear
    status: Draft
    notes: |
      Admin can batch delete.
""",
    'lead': """
  - id: TC-ADMIN-LEAD-017
    module: Lead
    name: Assign Lead — Admin Assigns to Sales
    category: Assign
    role: Sales Admin
    priority: P0
    precondition: |
      1. Logged into CRM as Lead Pool Admin
      2. An unallocated lead exists
    steps: |
      1. Enter Lead X detail page
      2. Click Assign button
      3. Search and select target sales rep
      4. Confirm
    expected: |
      1. Assigned successfully
      2. Lead status changes to Pending
      3. Owner updated
    status: Draft
    notes: |
      Admin can assign unallocated leads to sales reps.

  - id: TC-ADMIN-LEAD-018
    module: Lead
    name: Reclaim Lead — Admin Force Reclaims
    category: Reclaim
    role: Sales Admin
    priority: P1
    precondition: |
      1. Logged into CRM as Pool Admin
      2. Lead X is Pending/Following Up
    steps: |
      1. Enter Lead X detail page
      2. Click Reclaim button
      3. Confirm
    expected: |
      1. Reclaimed successfully
      2. Status changes to Unallocated
    status: Draft
    notes: |
      Admin can force reclaim allocated leads.

  - id: TC-ADMIN-LEAD-019
    module: Lead
    name: Transfer Lead — Move to Another Pool
    category: Transfer
    role: Sales Admin
    priority: P1
    precondition: |
      1. Logged into CRM as Pool Admin
      2. Two lead pools exist
    steps: |
      1. Enter Lead X detail page
      2. Click Transfer button
      3. Select target pool
      4. Confirm
    expected: |
      1. Transferred successfully
      2. Pool affiliation changed
    status: Draft
    notes: |
      Admin can transfer leads between pools.
""",
    'customer': """
  - id: TC-ADMIN-CUSTOMER-014
    module: Customer
    name: Assign Customer — Assign to Sales
    category: Assign / Pool
    role: Sales Admin
    priority: P0
    precondition: |
      1. Logged into CRM as High Seas Admin
      2. An unallocated customer exists
    steps: |
      1. Enter Customer X detail page
      2. Click Assign button
      3. Select target sales rep
      4. Confirm
    expected: |
      1. Assigned successfully
      2. Status changes to Allocated
      3. Owner updated
    status: Draft
    notes: |
      High Seas Admin can assign customers to sales.

  - id: TC-ADMIN-CUSTOMER-015
    module: Customer
    name: Reclaim Customer — Force Reclaim
    category: Reclaim / Pool
    role: Sales Admin
    priority: P1
    precondition: |
      1. Logged into CRM as High Seas Admin
      2. Customer X is Allocated
    steps: |
      1. Enter Customer X detail page
      2. Click Reclaim button
      3. Confirm
    expected: |
      1. Reclaimed successfully
      2. Status changes to Unallocated
    status: Draft
    notes: |
      Admin can force reclaim allocated customers.

  - id: TC-ADMIN-CUSTOMER-016
    module: Customer
    name: Transfer Customer — Move to Another Pool
    category: Transfer / Pool
    role: Sales Admin
    priority: P1
    precondition: |
      1. Logged into CRM as High Seas Admin
      2. Two high seas pools exist
    steps: |
      1. Enter Customer X detail page
      2. Click Transfer button
      3. Select target pool
      4. Confirm
    expected: |
      1. Transferred successfully
      2. Pool changed
    status: Draft
    notes: |
      Admin can transfer customers between pools.
""",
    'opportunity': """
  - id: TC-ADMIN-OPPORTUNITY-014
    module: Opportunity
    name: Import Opportunities — Batch Excel
    category: Import
    role: Sales Admin
    priority: P2
    precondition: |
      1. Logged into CRM as Sales Admin
      2. Excel template ready
    steps: |
      1. Enter Opportunity list page
      2. Click Import button
      3. Upload Excel
      4. Confirm
    expected: |
      1. Import complete
      2. New opportunities in list
    status: Draft
    notes: |
      Permission table: Only Sales Admin has opportunity import permission.
""",
}

def append_extras(extras_map, dst_dir):
    for fname, extra in extras_map.items():
        filepath = f'{dst_dir}/{fname}.yaml'
        if os.path.exists(filepath):
            with open(filepath, 'a') as f:
                f.write(extra)
            print(f'  + extras -> {filepath}')

if __name__ == '__main__':
    print('Rebuilding admin_zh...')
    convert_to_admin(f'{BASE}/zh', f'{BASE}/admin_zh', '销售人员', '销售管理员', 'TC-ADMIN-')
    append_extras(ZH_EXTRAS, f'{BASE}/admin_zh')

    print('Rebuilding admin_en...')
    convert_to_admin(f'{BASE}/en', f'{BASE}/admin_en', 'Sales Rep', 'Sales Admin', 'TC-ADMIN-')
    append_extras(EN_EXTRAS, f'{BASE}/admin_en')

    print('Done')
