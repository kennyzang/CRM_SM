#!/usr/bin/env python3
"""探查 Securemetric CRM 后台「销售管理员/销售人员」权限组成员 + 线索池/公海池 Admin 名单。

数据来自真实接口（非页面截图/UI 猜测），可重复运行以获取当前最新配置：
  - POST /data/sys-right/sysRightGroup/get          权限组具名成员
  - POST /data/sys-modeling/sysModelingMain/data     线索池/公海池列表（含 fd_pool_admin）

认证复用 Playwright 已保存的 storage state（auth/auth-securemetric-crm*.json）里的
X-AUTH-TOKEN / isMkLogin cookie，跟前端测试账号共用同一套登录态。

用法：
  python3 scripts/probe_sm_role_members.py [account]   # account 默认 soo，对应 auth/auth-securemetric-crm-{account}.json

输出落盘到 doc/SM测试用例-收集箱/AI输出/role-members-snapshot.json（AI 产出物统一放该子目录，
与收集箱里的人工原始资料 0-4.md / Role Definition.docx 区分开）。
"""
import json
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "http://172.18.114.231:8088"

RIGHT_GROUPS = {
    "销售管理员": "1jmdajltbwhw32fiwug8jiv1tf8b7i7m7bw0",
    "销售人员": "1jmdbnta4whw339cw2h2rvhl36m4dnq2aaw0",
}

# (名称, fdListViewId, navId) —— 从 CRM 后台「Business Rules」页面 URL 中提取
POOL_LIST_VIEWS = {
    "线索池 (Lead Queue)": (
        "1hth1o76iw5ow19cndw6fc5u8bgkqva28twe",
        "1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1",
    ),
    "公海池 (Public Pool)": (
        "1i03ava4ow5jw123aw1q8gev71o4d7oo2pw1",
        "1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1",
    ),
}


def load_cookie(account: str) -> dict:
    auth_file = ROOT / "auth" / f"auth-securemetric-crm-{account}.json" if account != "soo" \
        else ROOT / "auth" / "auth-securemetric-crm.json"
    if not auth_file.exists():
        raise SystemExit(f"找不到登录态文件: {auth_file}")
    data = json.loads(auth_file.read_text())
    cookies = {c["name"]: c["value"] for c in data.get("cookies", []) if c.get("domain") == "172.18.114.231"}
    if "X-AUTH-TOKEN" not in cookies:
        raise SystemExit(f"{auth_file} 中没有找到 172.18.114.231 的 X-AUTH-TOKEN，登录态可能已过期，需要重新用该账号登录一次 CRM 生成 session 文件")
    return cookies


def post(session: requests.Session, path: str, body: dict) -> dict:
    resp = session.post(f"{BASE_URL}{path}", json=body, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    if not data.get("success"):
        raise RuntimeError(f"{path} 调用失败: {data}")
    return data["data"]


def fetch_right_group_members(session: requests.Session) -> dict:
    result = {}
    for role_name, fd_id in RIGHT_GROUPS.items():
        data = post(session, "/data/sys-right/sysRightGroup/get", {"fdId": fd_id})
        members = [e["fdName"] for e in data.get("fdSysOrgElements", [])]
        result[role_name] = {
            "fdId": fd_id,
            "members_raw": members,
            "note": "Role users 挂的是公司实体而非具名用户" if not members else None,
        }
    return result


def fetch_pool_admins(session: requests.Session) -> dict:
    result = {}
    for pool_label, (list_view_id, nav_id) in POOL_LIST_VIEWS.items():
        body = {
            "fdListViewId": list_view_id,
            "fdMode": 1,
            "type": "list",
            "navId": nav_id,
            "sorts": {"fd_create_time": "desc"},
            "conditions": {"$and": [{}]},
            "pageSize": 50,
            "params": {},
        }
        data = post(session, "/data/sys-modeling/sysModelingMain/data", body)
        rows = []
        for row in data.get("content", []):
            rows.append({
                "pool_name": (row.get("fd_pool_name") or "").strip(),
                "pool_no": row.get("fd_pool_no"),
                "admins": [a["fdName"] for a in row.get("fd_pool_admin", [])],
                "member_departments": [m["fdName"] for m in row.get("fd_pool_member_d", [])],
            })
        result[pool_label] = rows
    return result


def main():
    account = sys.argv[1] if len(sys.argv) > 1 else "soo"
    cookies = load_cookie(account)

    session = requests.Session()
    session.cookies.update(cookies)
    session.headers.update({
        "Content-Type": "application/json;charset=UTF-8",
        "Referer": f"{BASE_URL}/web/",
        "x-accept-language": "en-US",
    })

    output = {
        "source": "live API (172.18.114.231:8088), non-guessed",
        "queried_with_account": account,
        "right_groups": fetch_right_group_members(session),
        "pools": fetch_pool_admins(session),
    }

    out_path = ROOT / "doc" / "SM测试用例-收集箱" / "AI输出" / "role-members-snapshot.json"
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2))
    print(json.dumps(output, ensure_ascii=False, indent=2))
    print(f"\n已写入: {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
