
import os, shutil, re

BASE = 'doc/SM测试用例-收集箱/AI输出/基础功能用例'

def make_admin(src_dir, dst_dir, role_from, role_to):
    """复制普通 YAML 到 admin 目录并修改角色"""
    os.makedirs(f'{BASE}/{dst_dir}', exist_ok=True)
    for fname in os.listdir(f'{BASE}/{src_dir}'):
        if not fname.endswith('.yaml'):
            continue
        src = f'{BASE}/{src_dir}/{fname}'
        dst = f'{BASE}/{dst_dir}/{fname}'
        with open(src, 'r') as f:
            content = f.read()
        # Change role
        content = content.replace(f'role: {role_from}', f'role: {role_to}')
        # Change status
        if role_to == '销售管理员':
            content = content.replace("status: 草稿", "status: 草稿")
        elif role_to == 'Sales Admin':
            content = content.replace("status: Draft", "status: Draft")
        with open(dst, 'w') as f:
            f.write(content)

# 生成 admin_zh
make_admin('zh', 'admin_zh', '销售人员', '销售管理员')
# 生成 admin_en
make_admin('en', 'admin_en', 'Sales Rep', 'Sales Admin')

print(f'✅ admin_zh: {len([f for f in os.listdir(f"{BASE}/admin_zh") if f.endswith(".yaml")])} files')
print(f'✅ admin_en: {len([f for f in os.listdir(f"{BASE}/admin_en") if f.endswith(".yaml")])} files')
