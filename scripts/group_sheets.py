#!/usr/bin/env python3
"""Group small YAML modules into larger sheets + admin YAMLs"""
import os, re

BASE = 'doc/SM测试用例-收集箱/AI输出/基础功能用例'

# Group definitions: prefix_order, new_filename, [modules_to_include]
GROUPS_ZH = [
    ('01', '联系人', ['contact']),
    ('02', '线索', ['lead']),
    ('03', '客户', ['customer']),
    ('04', '商机', ['opportunity']),
    ('05', '报价与订单', ['quotation', 'so', 'contract', 'delivery']),
    ('06', '采购与开票', ['po', 'invoice', 'collection']),
    ('07', '支撑数据', ['pl', 'product', 'kanban']),
]

GROUPS_EN = [
    ('01', 'Contact', ['contact']),
    ('02', 'Lead', ['lead']),
    ('03', 'Customer', ['customer']),
    ('04', 'Opportunity', ['opportunity']),
    ('05', 'Quotation & Order', ['quotation', 'so', 'contract', 'delivery']),
    ('06', 'PO & Invoice', ['po', 'invoice', 'collection']),
    ('07', 'Support Data', ['pl', 'product', 'kanban']),
]

# Admin extra files that exist
ADMIN_ZH_EXTRAS = {
    '联系人': 'contact',
    '线索': 'lead',
    '客户': 'customer',
    '商机': 'opportunity',
}
ADMIN_EN_EXTRAS = {
    'Contact': 'contact',
    'Lead': 'lead',
    'Customer': 'customer',
    'Opportunity': 'opportunity',
}

def merge_yamls(src_dir, dst_dir, groups, is_admin=False, admin_src_dir=None):
    os.makedirs(dst_dir, exist_ok=True)
    for prefix, sheet_name, modules in groups:
        merged = f'# {sheet_name} — {"管理员" if is_admin else "销售"}角色\n'
        merged += '# 系统生成文件，请勿手动编辑\n---\ncases:\n'
        for mod in modules:
            # Read source yaml
            src_path = f'{src_dir}/{mod}.yaml'
            if not os.path.exists(src_path):
                continue
            with open(src_path) as f:
                content = f.read()
            # Extract cases (everything after "cases:")
            m = re.search(r'^cases:\n(.*)', content, re.DOTALL)
            if m:
                cases_text = m.group(1)
                # If admin, we keep as-is (role already in yaml)
                # If not admin AND is_admin mode, we skip (will add admin extras separately)
                merged += cases_text
        # For admin, also append admin extra cases for matching groups
        if is_admin and admin_src_dir:
            admin_mod = ADMIN_ZH_EXTRAS.get(sheet_name) or ADMIN_EN_EXTRAS.get(sheet_name)
            if admin_mod:
                admin_path = f'{admin_src_dir}/{admin_mod}.yaml'
                if os.path.exists(admin_path):
                    with open(admin_path) as f:
                        admin_content = f.read()
                    am = re.search(r'^cases:\n(.*)', admin_content, re.DOTALL)
                    if am:
                        merged += am.group(1)

        with open(f'{dst_dir}/{prefix}_{sheet_name}.yaml', 'w') as f:
            f.write(merged)

    # Cleanup old individual yamls
    for f in os.listdir(dst_dir):
        if re.match(r'^\d{2}_', f):
            continue  # keep grouped
        if f.endswith('.yaml') and f != '.gitkeep':
            os.remove(f'{dst_dir}/{f}')

# First, group zh/
print('Grouping zh/...')
merge_yamls(f'{BASE}/zh', f'{BASE}/zh', GROUPS_ZH)

# Group en/
print('Grouping en/...')
merge_yamls(f'{BASE}/en', f'{BASE}/en', GROUPS_EN)

# Admin zh - only admin extras in grouped format
print('Grouping admin_zh/...')
# Create admin_zh from zh groups + admin extras
merge_yamls(f'{BASE}/zh', f'{BASE}/admin_zh', GROUPS_ZH, is_admin=True, admin_src_dir=f'{BASE}/admin_zh_raw')

# Create admin_en from en groups + admin extras
print('Grouping admin_en/...')
merge_yamls(f'{BASE}/en', f'{BASE}/admin_en', GROUPS_EN, is_admin=True, admin_src_dir=f'{BASE}/admin_en_raw')

print('Done')
