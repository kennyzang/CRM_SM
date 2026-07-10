#!/usr/bin/env python3
"""
CRM User Manuals → Static HTML Site Generator

Usage:
    cd wiki/docs && python3 generate.py

Output:
    wiki/docs/output/  — 部署这个文件夹即可
"""

import io
import os
import re
import json
import markdown
import shutil
from pathlib import Path
from datetime import datetime

try:
    from PIL import Image as _PILImage
    _PILLOW_OK = True
except ImportError:
    _PILLOW_OK = False

# ── Config ──────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent  # wiki/
MANUALS_DIR = BASE_DIR / "user-manuals"
ZH_MANUALS_DIR = MANUALS_DIR / "zh"
EN_MANUALS_DIR = MANUALS_DIR / "en"
ASSETS_DIR  = BASE_DIR / "assets"
OUTPUT_DIR  = Path(__file__).resolve().parent / "output"

# 模块定义（按显示顺序）
MODULES = {
    "lead": {
        "zh": "线索", "en": "Lead", "icon": "🎯",
        "desc_zh": "销售线索获取、分配与跟进转化",
        "desc_en": "Lead acquisition, assignment and conversion",
    },
    "contact": {
        "zh": "联系人", "en": "Contact", "icon": "👤",
        "desc_zh": "管理客户与合作伙伴联系人信息",
        "desc_en": "Manage customer and partner contacts",
    },
    "opportunity": {
        "zh": "商机", "en": "Opportunity", "icon": "💼",
        "desc_zh": "跟进商机进展、阶段管理与预测",
        "desc_en": "Track deal progress, stages and forecasting",
    },
    "pl": {
        "zh": "P&L", "en": "P&L", "icon": "💰",
        "desc_zh": "产品成本与利润核算、定价及审批",
        "desc_en": "Product cost & profit analysis, pricing and approval",
    },
    "quotation": {
        "zh": "报价单", "en": "Quotation", "icon": "📋",
        "desc_zh": "创建与管理产品报价单及审批流程",
        "desc_en": "Create and manage quotations and approval workflows",
    },
    "sales-order": {
        "zh": "销售订单", "en": "Sales Order", "icon": "📦",
        "desc_zh": "销售订单创建、付款计划与审批",
        "desc_en": "Sales order creation, payment schedules and approvals",
    },
    "invoice-application": {
        "zh": "发票申请", "en": "Invoice Application", "icon": "🧾",
        "desc_zh": "发票申请提交、审核与里程碑结算",
        "desc_en": "Invoice requests, review and milestone billing",
    },
    "customer": {
        "zh": "客户", "en": "Customer", "icon": "🏢",
        "desc_zh": "客户档案管理、公海池规则与联合跟进",
        "desc_en": "Customer account management, public pool and joint followers",
    },
    "po": {
        "zh": "采购订单", "en": "Purchase Order", "icon": "📄",
        "desc_zh": "客户采购订单录入与销售订单前置条件",
        "desc_en": "Customer PO entry and prerequisite for Sales Order",
    },
    "contract": {
        "zh": "合同", "en": "Contract", "icon": "📝",
        "desc_zh": "合同管理、到期提醒与客户档案同步",
        "desc_en": "Contract management, expiry reminders and customer file sync",
    },
    "payment-schedule": {
        "zh": "付款计划", "en": "Payment Schedule", "icon": "💳",
        "desc_zh": "应收款跟踪、里程碑付款与完工百分比",
        "desc_en": "Receivable tracking, milestone payments and completion %",
    },
    "collection": {
        "zh": "客户回款", "en": "Collection", "icon": "💵",
        "desc_zh": "客户回款登记、财务确认与银行入账",
        "desc_en": "Customer payment collection and finance confirmation",
    },
    "pipeline-kanban": {
        "zh": "销售管道", "en": "Pipeline Kanban", "icon": "📊",
        "desc_zh": "销售管道看板 — 7 阶段总览、项目列表与筛选",
        "desc_en": "Sales pipeline dashboard — 7-stage overview, project list and filtering",
    },
    "duplicate-check": {
        "zh": "重名检查", "en": "Duplicate Check", "icon": "🔍",
        "desc_zh": "搜索已有客户和联系人，防止重复录入",
        "desc_en": "Search existing customers and contacts to prevent duplicate entries",
    },
    "service-team-activity": {
        "zh": "服务团队与活动", "en": "Service Team & Activity", "icon": "👥",
        "desc_zh": "服务团队权限管理与销售互动记录",
        "desc_en": "Service team permission management and sales activity logging",
    },
    "task-management": {
        "zh": "任务管理", "en": "Task Management", "icon": "✅",
        "desc_zh": "跨实体任务创建、分配、进度追踪与提醒",
        "desc_en": "Cross-entity task creation, assignment, progress tracking and reminders",
    },
    "delivery": {
        "zh": "发货", "en": "Delivery", "icon": "🚚",
        "desc_zh": "发货记录管理、物流追踪与运费核算",
        "desc_en": "Delivery record management, logistics tracking and shipping cost accounting",
    },
    "signature": {
        "zh": "签章上传", "en": "Signature Upload", "icon": "✍️",
        "desc_zh": "上传个人或公司签章图片，配置免密授权与默认签章",
        "desc_en": "Upload personal or company signature images, configure password-free authorization and default signature",
    },
    "basic-data": {
        "zh": "基础数据设置", "en": "Basic Data Settings", "icon": "⚙️",
        "desc_zh": "公司主体（法律实体）配置、成员管理与税率设置",
        "desc_en": "Company entity configuration, member management and tax rate setup",
    },
    "lead-queue": {
        "zh": "线索池规则", "en": "Lead Queue Management", "icon": "🗂️",
        "desc_zh": "线索池分配规则、归属条件、超时提醒与回收规则",
        "desc_en": "Lead queue assignment rules, ownership conditions, timeout reminders and reclaim rules",
    },
    "public-pool": {
        "zh": "公海池规则", "en": "Public Pool Management", "icon": "🌊",
        "desc_zh": "公海池领取规则、不活跃回收周期与转移规则",
        "desc_en": "Public pool claiming rules, inactivity reclaim periods and transfer rules",
    },
    "permission-config": {
        "zh": "权限配置指南", "en": "Permission Configuration", "icon": "🔐",
        "desc_zh": "按岗位配置角色权限——销售、财务、运营等各岗位权限清单",
        "desc_en": "Role permission setup by job function — Account Manager, Finance, Operations and more",
    },
}

# ── Sidebar navigation groups ────────────────────────────────────
NAV_GROUPS = [
    {
        "key": "dashboard",
        "role": "user",
        "label_en": "Dashboard",
        "label_zh": "仪表板",
        "collapsible": False,
        "default_open": True,
        "modules": ["pipeline-kanban"],
    },
    {
        "key": "main-flow",
        "role": "user",
        "label_en": "Main Flow",
        "label_zh": "主流程",
        "collapsible": True,
        "default_open": True,
        "modules": [
            "contact", "customer", "lead", "opportunity",
            "pl", "quotation", "po", "sales-order", "invoice-application", "collection",
        ],
    },
    {
        "key": "tools",
        "role": "user",
        "label_en": "Documents & Tools",
        "label_zh": "单据与工具",
        "collapsible": True,
        "default_open": True,
        "modules": [
            "payment-schedule", "contract",
            "duplicate-check", "service-team-activity",
            "task-management", "delivery", "signature",
        ],
    },
    {
        "key": "admin",
        "role": "admin",
        "label_en": "Admin Settings",
        "label_zh": "管理员设置",
        "collapsible": True,
        "default_open": True,
        "modules": ["basic-data", "lead-queue", "public-pool", "permission-config"],
    },
]

# ── CSS ─────────────────────────────────────────────────────────
CSS = """
/* ── Securemetric Brand Palette ── */
:root {
  --primary:        #F5A623;
  --primary-dark:   #C47D00;
  --primary-deeper: #1C1C1E;
  --primary-bg:     #FFF8EC;
  --primary-light:  #FDE8B4;
  --primary-border: #F9C96D;
  --primary-muted:  #FEF3DC;

  --sidebar-w: 256px;
  --toc-w:     220px;
  --bg:        #F5F6F7;
  --card-bg:   #ffffff;
  --text:      #1C1C1E;
  --text-muted:#6B7280;
  --border:    #E5E7EB;
  --code-bg:   #1C1C1E;
  --code-text: #E5E7EB;
  --radius:    8px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
}

/* ── Left Sidebar ── */
.sidebar {
  position: fixed; left: 0; top: 0; bottom: 0;
  width: var(--sidebar-w);
  background: var(--card-bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
}

/* Amber accent bar at the very top */
.sidebar::before {
  content: "";
  display: block;
  height: 3px;
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
  flex-shrink: 0;
}

.sidebar-brand {
  padding: 16px 20px 14px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.sidebar-brand h2 {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-deeper);
  display: flex; align-items: center; gap: 8px;
  letter-spacing: 0.1px;
}

.sidebar-brand h2 .brand-dot {
  display: inline-block;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
}

.sidebar-brand small {
  display: block; font-size: 11px; color: var(--text-muted); margin-top: 3px;
}

/* Search trigger */
.sidebar-search {
  padding: 10px 12px 8px;
  flex-shrink: 0;
}

.search-trigger {
  display: flex; align-items: center; gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  font-family: inherit;
}

.search-trigger:hover {
  border-color: var(--primary-border);
  color: var(--primary-dark);
  background: var(--primary-muted);
}

.search-trigger kbd {
  margin-left: auto;
  font-size: 11px;
  padding: 1px 5px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: white;
  color: var(--text-muted);
  font-family: inherit;
}

/* Scrollable nav area */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}

.nav-section {
  padding: 10px 20px 4px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-muted);
  font-weight: 700;
}

.nav-link {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 20px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 13.5px;
  transition: all 0.15s;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background: var(--primary-muted);
  color: var(--primary-dark);
  border-left-color: var(--primary-border);
}

.nav-link.active {
  background: var(--primary-bg);
  color: var(--primary-dark);
  border-left-color: var(--primary);
  font-weight: 600;
}

.nav-link .icon { font-size: 15px; flex-shrink: 0; }

/* ── Nav Groups (collapsible sections) ── */
.nav-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 20px 4px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-muted);
  font-weight: 700;
  background: none;
  border: none;
  font-family: inherit;
  text-align: left;
  cursor: default;
}

.nav-group-header.collapsible {
  cursor: pointer;
}

.nav-group-header.collapsible:hover {
  color: var(--primary-dark);
}

.nav-group-chevron {
  font-size: 10px;
  line-height: 1;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.nav-group-header[aria-expanded="false"] .nav-group-chevron {
  transform: rotate(-90deg);
}

.nav-group-items {
  overflow: hidden;
  max-height: 2000px;
  transition: max-height 0.25s ease;
}

.nav-group-items.collapsed {
  max-height: 0;
}

/* Sidebar lang toggle (bottom) */
.sidebar-lang {
  flex-shrink: 0;
  padding: 10px 14px;
  border-top: 1px solid var(--border);
  background: var(--card-bg);
}

.sidebar-lang-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 6px;
}

.lang-toggle-group {
  display: flex; gap: 6px;
}

.lang-toggle-btn {
  flex: 1;
  padding: 5px 0;
  font-size: 13px;
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  color: var(--text-muted);
  transition: all 0.15s;
  text-align: center;
  font-family: inherit;
  font-weight: 500;
}

.lang-toggle-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  font-weight: 700;
}

.lang-toggle-btn:hover:not(.active) {
  background: var(--primary-muted);
  border-color: var(--primary-border);
  color: var(--primary-dark);
}

/* ── Right TOC Sidebar ── */
.toc-sidebar {
  position: fixed; right: 0; top: 0; bottom: 0;
  width: var(--toc-w);
  background: var(--card-bg);
  border-left: 1px solid var(--border);
  padding: 24px 14px 40px;
  overflow-y: auto;
  z-index: 100;
}

.toc-sidebar-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

/* Reset python-markdown .toc wrapper */
.toc-sidebar .toc { all: unset; display: block; }

.toc-sidebar ul {
  list-style: none;
  padding: 0; margin: 0;
}

.toc-sidebar li { margin: 0; }

.toc-sidebar a {
  display: block;
  padding: 4px 8px;
  font-size: 12.5px;
  color: var(--text-muted);
  text-decoration: none;
  border-left: 2px solid transparent;
  border-radius: 0 4px 4px 0;
  transition: all 0.15s;
  line-height: 1.5;
  margin-bottom: 1px;
}

.toc-sidebar a:hover {
  color: var(--primary-dark);
  background: var(--primary-muted);
}

.toc-sidebar a.toc-active {
  color: var(--primary-dark);
  border-left-color: var(--primary);
  font-weight: 600;
  background: var(--primary-bg);
}

/* Nested indent */
.toc-sidebar ul ul a { padding-left: 18px; font-size: 12px; }
.toc-sidebar ul ul ul a { padding-left: 28px; }

/* ── Main Content ── */
.main {
  margin-left: var(--sidebar-w);
  margin-right: var(--toc-w);
  min-height: 100vh;
}

.main.no-toc {
  margin-right: 0;
}

.content {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 48px 80px;
}

/* ── Home Page ── */
.home-hero {
  padding: 8px 0 10px;
  margin-bottom: 14px;
}

.home-hero h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-deeper);
  margin-bottom: 6px;
  display: flex; align-items: center; gap: 10px;
}

.home-hero h1::before {
  content: "";
  display: inline-block;
  width: 4px; height: 28px;
  border-radius: 2px;
  background: var(--primary);
  flex-shrink: 0;
}

.home-hero p { display: none; }

.section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 6px;
}

/* ── Home page groups ── */
.home-section { margin-bottom: 14px; }

.home-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--border);
  cursor: default;
  user-select: none;
}

.home-section-header.collapsible { cursor: pointer; }

.home-section-header.collapsible:hover .home-section-label {
  color: var(--primary-dark);
}

.home-section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-muted);
  transition: color 0.15s;
}

.home-section-chevron {
  font-size: 10px;
  color: var(--text-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.home-section-header[aria-expanded="false"] .home-section-chevron {
  transform: rotate(-90deg);
}

.home-section-items {
  overflow: hidden;
  max-height: 2000px;
  transition: max-height 0.25s ease;
}

.home-section-items.collapsed { max-height: 0; }

.module-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-left: 3px solid var(--border);
  border-radius: var(--radius);
  padding: 9px 14px;
  text-decoration: none;
  color: var(--text);
  transition: all 0.15s;
}

.module-card:hover {
  border-color: var(--primary-border);
  border-left-color: var(--primary);
  background: var(--primary-bg);
  box-shadow: 0 2px 10px rgba(245, 166, 35, 0.12);
  text-decoration: none;
}

.content .module-card:hover {
  text-decoration: none;
}

.module-card .card-icon {
  font-size: 22px;
  flex-shrink: 0;
  width: 34px;
  text-align: center;
}

.card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-deeper);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-arrow {
  color: #D1D5DB;
  flex-shrink: 0;
  font-size: 16px;
  transition: color 0.15s;
}

.module-card:hover .card-arrow { color: var(--primary); }

/* ── Markdown Content Styles ── */
.content h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-deeper);
  margin: 32px 0 14px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--primary-light);
}

.content h1:first-child { margin-top: 0; }

.content h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-deeper);
  margin: 32px 0 12px;
  padding-top: 4px;
  padding-left: 10px;
  border-left: 3px solid var(--primary);
}

.content h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--primary-deeper);
  margin: 24px 0 8px;
}

.content h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 20px 0 8px;
}

.content p { margin: 12px 0; }

.content a { color: var(--primary-dark); text-decoration: none; }
.content a:hover { text-decoration: underline; }

.content strong { font-weight: 600; color: var(--primary-deeper); }

.content blockquote {
  border-left: 4px solid var(--primary);
  background: var(--primary-bg);
  padding: 12px 16px;
  margin: 16px 0;
  border-radius: 0 var(--radius) var(--radius) 0;
}

.content blockquote p { margin: 4px 0; color: var(--primary-dark); }

.content ul, .content ol {
  margin: 12px 0;
  padding-left: 24px;
}

.content li { margin: 4px 0; }

.content code {
  background: var(--primary-muted);
  color: var(--primary-dark);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.88em;
  font-family: "SF Mono", "Fira Code", monospace;
}

.content pre {
  background: var(--code-bg);
  color: var(--code-text);
  padding: 16px 20px;
  border-radius: var(--radius);
  overflow-x: auto;
  margin: 16px 0;
  border-top: 3px solid var(--primary);
}

.content pre code {
  background: none;
  padding: 0;
  color: inherit;
  font-size: 13px;
}

.content table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 14px;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
}

.content th {
  background: var(--primary-deeper);
  color: #ffffff;
  font-weight: 700;
  text-align: left;
  padding: 10px 14px;
  border: 1px solid #2e2e30;
  font-size: 12px;
  letter-spacing: 0.3px;
}

.content td {
  padding: 10px 14px;
  border: 1px solid var(--border);
}

.content tr:nth-child(even) td { background: var(--primary-muted); }

.content tr:hover td { background: var(--primary-bg); }

.content img {
  max-width: min(100%, 800px);
  height: auto;
  display: block;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  margin: 16px 0;
}

.content hr {
  border: none;
  border-top: 1px solid var(--primary-light);
  margin: 32px 0;
}

/* ── Search Modal ── */
.search-overlay {
  display: none;
  position: fixed; inset: 0;
  background: rgba(28, 28, 30, 0.55);
  z-index: 1000;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  backdrop-filter: blur(3px);
}

.search-overlay.open {
  display: flex;
}

.search-modal {
  background: var(--card-bg);
  border-radius: 12px;
  border-top: 3px solid var(--primary);
  width: 600px;
  max-width: calc(100vw - 40px);
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 60px rgba(0,0,0,0.25);
  overflow: hidden;
}

.search-input-wrap {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.search-input-wrap svg {
  flex-shrink: 0;
  color: var(--primary);
}

.search-input {
  flex: 1;
  border: none; outline: none;
  font-size: 16px;
  background: transparent;
  color: var(--text);
  font-family: inherit;
}

.search-input::placeholder { color: #B5B5B5; }

.search-results {
  overflow-y: auto;
  flex: 1;
}

.search-result-item {
  display: block;
  padding: 13px 20px;
  border-bottom: 1px solid var(--border);
  text-decoration: none;
  color: var(--text);
  transition: background 0.1s;
}

.search-result-item:hover {
  background: var(--primary-bg);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 3px;
}

.search-result-excerpt {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.search-result-meta {
  font-size: 11px;
  color: var(--primary-dark);
  margin-top: 4px;
  font-weight: 500;
}

.search-result-item mark {
  background: var(--primary-light);
  color: var(--primary-dark);
  border-radius: 2px;
}

.search-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

.search-footer {
  padding: 8px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 14px;
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-footer kbd {
  background: var(--primary-muted);
  border: 1px solid var(--primary-border);
  border-radius: 3px;
  padding: 1px 5px;
  font-family: inherit;
  color: var(--primary-dark);
}

/* ── Content images — clickable ── */
.content img {
  cursor: zoom-in;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  transition: box-shadow 0.15s, opacity 0.15s;
  max-width: 100%;
}
.content img:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,.15);
  opacity: .92;
}

/* ── Lightbox ── */
.lightbox {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,.85);
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  animation: lb-fade-in .15s ease;
}
.lightbox.open { display: flex; }
@keyframes lb-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.lightbox-img {
  max-width: min(92vw, 1200px);
  max-height: 90vh;
  object-fit: contain;
  border-radius: var(--radius);
  box-shadow: 0 8px 48px rgba(0,0,0,.6);
  cursor: default;
  animation: lb-scale-in .15s ease;
}
@keyframes lb-scale-in {
  from { transform: scale(.94); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
.lightbox-close {
  position: fixed;
  top: 18px;
  right: 22px;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255,255,255,.15);
  color: #fff;
  font-size: 20px;
  line-height: 36px;
  text-align: center;
  border-radius: 50%;
  cursor: pointer;
  transition: background .15s;
}
.lightbox-close:hover { background: rgba(255,255,255,.28); }
.lightbox-caption {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,.75);
  font-size: 13px;
  max-width: 80vw;
  text-align: center;
  pointer-events: none;
}
.lightbox-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(255,255,255,.15);
  color: #fff;
  font-size: 22px;
  line-height: 44px;
  text-align: center;
  border-radius: 50%;
  cursor: pointer;
  transition: background .15s;
  z-index: 1;
  user-select: none;
}
.lightbox-nav:hover { background: rgba(255,255,255,.28); }
.lightbox-nav.prev { left: 18px; }
.lightbox-nav.next { right: 18px; }
.lightbox-nav:disabled { opacity: .25; cursor: default; }
.lightbox-counter {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,.6);
  font-size: 13px;
  pointer-events: none;
}

/* ── Role tabs ── */
.role-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 12px 0;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.role-tab {
  flex: 1;
  padding: 6px 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  transition: color 0.15s, border-color 0.15s;
  text-align: center;
  white-space: nowrap;
}
.role-tab:hover { color: var(--text); }
.role-tab.active {
  color: var(--primary-dark);
  border-bottom-color: var(--primary);
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .sidebar { display: none; }
  .toc-sidebar { display: none; }
  .main { margin-left: 0; margin-right: 0; }
  .content { padding: 24px 20px 60px; }
  .card-grid { grid-template-columns: 1fr; }
}
"""

# ── JS ──────────────────────────────────────────────────────────
JS = """
// NOTE: Search requires HTTP server (not file:// protocol)
// Start with: cd wiki/docs/output && python3 -m http.server 8080

const LANG_KEY = 'crm-lang';
const ROLE_KEY = 'crm-role';

// ── Lang helpers ────────────────────────────────────────────────
function getLang() {
  return localStorage.getItem(LANG_KEY) || 'en';
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

function applyLang(lang) {
  const isZh = lang === 'zh';

  // Sidebar nav: hrefs and labels
  document.querySelectorAll('.nav-link[data-zh]').forEach(link => {
    const href = isZh ? link.dataset.zh : link.dataset.en;
    const label = isZh ? link.dataset.labelZh : link.dataset.labelEn;
    if (href) link.setAttribute('href', href);
    const labelEl = link.querySelector('.nav-label');
    if (labelEl && label) labelEl.textContent = label;
  });

  // Sidebar nav group labels
  document.querySelectorAll('.nav-group-header[data-label-zh]').forEach(btn => {
    const labelEl = btn.querySelector('.nav-group-label');
    if (labelEl) labelEl.textContent = isZh ? btn.dataset.labelZh : btn.dataset.labelEn;
  });

  // Home page section labels
  document.querySelectorAll('.home-section-header[data-label-zh]').forEach(btn => {
    const labelEl = btn.querySelector('.home-section-label');
    if (labelEl) labelEl.textContent = isZh ? btn.dataset.labelZh : btn.dataset.labelEn;
  });

  // Home page: module card hrefs, titles and descriptions
  document.querySelectorAll('.module-card[data-zh]').forEach(card => {
    const href = isZh ? card.dataset.zh : card.dataset.en;
    if (href) card.setAttribute('href', href);
    const titleEl = card.querySelector('.card-title');
    const descEl  = card.querySelector('.card-desc');
    if (titleEl) titleEl.textContent = isZh ? card.dataset.titleZh : card.dataset.titleEn;
    if (descEl)  descEl.textContent  = isZh ? card.dataset.descZh  : card.dataset.descEn;
  });

  // Home page: hero title and subtitle
  const heroTitle = document.getElementById('hero-title');
  const heroDesc  = document.getElementById('hero-desc');
  const homeSection = document.getElementById('home-section-label');
  if (heroTitle) heroTitle.textContent = isZh ? 'Securemetric CRM 用户手册' : 'Securemetric CRM Manual';
  if (heroDesc)  heroDesc.textContent  = isZh ? '选择模块查看详细操作指南' : 'Select a module to view the user guide';
  if (homeSection) homeSection.textContent = isZh ? '用户手册' : 'User Manuals';

  // Lang toggle buttons active state
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Role tab labels
  document.querySelectorAll('.role-tab[data-label-zh]').forEach(btn => {
    btn.textContent = isZh ? btn.dataset.labelZh : btn.dataset.labelEn;
  });

  document.documentElement.lang = lang;
}

// ── Lang toggle clicks ──────────────────────────────────────────
function initLangToggle() {
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const newLang = btn.dataset.lang;
      setLang(newLang);

      // Detect if on a module page: path ends in /en/ or /zh/
      const parts = location.pathname.replace(/\\/$/, '').split('/');
      const currentLang = parts[parts.length - 1]; // 'en' or 'zh'

      if ((currentLang === 'en' || currentLang === 'zh') && currentLang !== newLang) {
        // Module page: navigate to sibling lang directory
        location.href = '../' + newLang + '/';
      } else {
        // Index page or already correct lang: update in place
        applyLang(newLang);
      }
    });
  });
}

// ── Right TOC scroll-spy ────────────────────────────────────────
function initScrollSpy() {
  const tocSidebar = document.getElementById('toc-sidebar');
  if (!tocSidebar) return;

  const headings = Array.from(
    document.querySelectorAll('.content h1[id], .content h2[id], .content h3[id], .content h4[id]')
  );
  if (!headings.length) return;

  const tocLinks = Array.from(tocSidebar.querySelectorAll('a[href^="#"]'));

  function getActiveId() {
    const offset = 100;
    let active = headings[0] ? headings[0].id : null;
    for (const h of headings) {
      if (h.getBoundingClientRect().top <= offset) {
        active = h.id;
      } else {
        break;
      }
    }
    return active;
  }

  function updateSpy() {
    const activeId = getActiveId();
    tocLinks.forEach(link => {
      const matches = link.getAttribute('href') === '#' + activeId;
      link.classList.toggle('toc-active', matches);
    });
  }

  window.addEventListener('scroll', updateSpy, { passive: true });
  updateSpy();

  // Smooth scroll for TOC anchor links
  tocLinks.forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ── Search ──────────────────────────────────────────────────────
let searchIndex = null;

async function loadSearchIndex() {
  if (searchIndex !== null) return searchIndex;
  try {
    const res = await fetch(ROOT + 'search-index.json');
    if (!res.ok) throw new Error('not found');
    searchIndex = await res.json();
  } catch {
    searchIndex = [];
  }
  return searchIndex;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function highlightMatch(text, query) {
  const safe = escapeHtml(text);
  if (!query) return safe;
  const qi = safe.toLowerCase().indexOf(query.toLowerCase());
  if (qi < 0) return safe;
  return safe.slice(0, qi) +
    '<mark>' + safe.slice(qi, qi + query.length) + '</mark>' +
    safe.slice(qi + query.length);
}

function renderResults(entries, query) {
  const container = document.getElementById('search-results');
  if (!entries.length) {
    container.innerHTML = '<div class="search-empty">No results found</div>';
    return;
  }

  container.innerHTML = entries.slice(0, 12).map(entry => {
    const raw = entry.content.replace(/\\s+/g, ' ');
    const q = query.toLowerCase();
    const ci = raw.toLowerCase().indexOf(q);
    const start = Math.max(0, ci - 50);
    const excerpt = (start > 0 ? '…' : '') + raw.slice(start, start + 180) + '…';

    const langLabel = entry.lang === 'zh' ? '中文' : 'EN';
    return (
      '<a href="' + ROOT + entry.url + '" class="search-result-item">' +
      '<div class="search-result-title">' + highlightMatch(entry.title, query) + '</div>' +
      '<div class="search-result-excerpt">' + highlightMatch(excerpt, query) + '</div>' +
      '<div class="search-result-meta">' + entry.module_en + ' · ' + langLabel + '</div>' +
      '</a>'
    );
  }).join('');
}

function doSearch(query, lang) {
  const container = document.getElementById('search-results');
  if (!searchIndex || !query.trim()) {
    container.innerHTML = '<div class="search-empty">Type to search across all modules</div>';
    return;
  }

  const q = query.toLowerCase();
  const results = searchIndex
    .filter(e => e.lang === lang)
    .map(e => {
      const score =
        (e.title.toLowerCase().includes(q) ? 10 : 0) +
        (e.module_en.toLowerCase().includes(q) ? 5 : 0) +
        (e.content.toLowerCase().includes(q) ? 1 : 0);
      return score > 0 ? { ...e, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  renderResults(results, query);
}

function openSearch() {
  document.getElementById('search-overlay').classList.add('open');
  setTimeout(() => document.getElementById('search-input').focus(), 30);
  loadSearchIndex(); // preload index
}

function closeSearch() {
  document.getElementById('search-overlay').classList.remove('open');
  document.getElementById('search-input').value = '';
  document.getElementById('search-results').innerHTML =
    '<div class="search-empty">Type to search across all modules</div>';
}

function initSearch() {
  const trigger  = document.getElementById('search-trigger');
  const overlay  = document.getElementById('search-overlay');
  const input    = document.getElementById('search-input');

  if (!overlay || !input) return;

  if (trigger) trigger.addEventListener('click', openSearch);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeSearch();
  });

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      await loadSearchIndex();
      doSearch(input.value, getLang());
    }, 200);
  });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.contains('open') ? closeSearch() : openSearch();
    }
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeSearch();
    }
  });
}

// ── Group toggle helper ─────────────────────────────────────────
function applyGroupState(btn, items, isOpen) {
  btn.setAttribute('aria-expanded', String(isOpen));
  items.classList.toggle('collapsed', !isOpen);
}

function syncPeer(groupKey, isOpen, selfPrefix) {
  const peerPrefix = selfPrefix === 'group-' ? 'home-group-' : 'group-';
  const peerItemsEl = document.getElementById(peerPrefix + groupKey);
  const peerBtnSel = selfPrefix === 'group-'
    ? `.home-section-header[data-group="${groupKey}"]`
    : `.nav-group-header[data-group="${groupKey}"]`;
  const peerBtn = document.querySelector(peerBtnSel);
  if (peerBtn) peerBtn.setAttribute('aria-expanded', String(isOpen));
  if (peerItemsEl) peerItemsEl.classList.toggle('collapsed', !isOpen);
}

// ── Nav Groups (sidebar collapse / expand) ──────────────────────
function initNavGroups() {
  document.querySelectorAll('.nav-group-header.collapsible').forEach(btn => {
    const groupKey = btn.dataset.group;
    const items = document.getElementById('group-' + groupKey);
    if (!items) return;

    const stored = localStorage.getItem('nav-group-' + groupKey);
    const defaultOpen = btn.dataset.defaultOpen === 'true';
    const isOpen = stored === null ? defaultOpen : stored === 'true';
    applyGroupState(btn, items, isOpen);

    btn.addEventListener('click', () => {
      const newState = btn.getAttribute('aria-expanded') === 'false';
      applyGroupState(btn, items, newState);
      localStorage.setItem('nav-group-' + groupKey, String(newState));
      syncPeer(groupKey, newState, 'group-');
    });
  });
}

// ── Ensure active nav item is visible ──────────────────────────
function ensureActiveNavVisible() {
  const activeLink = document.querySelector('.nav-link.active');
  if (!activeLink) return;

  // Auto-expand the group that contains the active link
  const groupItems = activeLink.closest('.nav-group-items');
  if (groupItems && groupItems.classList.contains('collapsed')) {
    const groupKey = groupItems.id.replace('group-', '');
    const btn = document.querySelector(`.nav-group-header[data-group="${groupKey}"]`);
    if (btn) {
      applyGroupState(btn, groupItems, true);
      localStorage.setItem('nav-group-' + groupKey, 'true');
      syncPeer(groupKey, true, 'group-');
    }
  }

  // Scroll within .sidebar-nav only (not the whole document) — instant, no jitter
  const nav = document.querySelector('.sidebar-nav');
  if (!nav) return;
  const linkTop = activeLink.offsetTop;
  const center = linkTop - nav.clientHeight / 2 + activeLink.offsetHeight / 2;
  nav.scrollTop = Math.max(0, center);
}

// ── Home Groups (home page collapse / expand) ───────────────────
function initHomeGroups() {
  document.querySelectorAll('.home-section-header.collapsible').forEach(btn => {
    const groupKey = btn.dataset.group;
    const items = document.getElementById('home-group-' + groupKey);
    if (!items) return;

    const stored = localStorage.getItem('nav-group-' + groupKey);
    const defaultOpen = btn.dataset.defaultOpen === 'true';
    const isOpen = stored === null ? defaultOpen : stored === 'true';
    applyGroupState(btn, items, isOpen);

    btn.addEventListener('click', () => {
      const newState = btn.getAttribute('aria-expanded') === 'false';
      applyGroupState(btn, items, newState);
      localStorage.setItem('nav-group-' + groupKey, String(newState));
      syncPeer(groupKey, newState, 'home-group-');
    });
  });
}

// ── Lightbox ─────────────────────────────────────────────────────
function initLightbox() {
  const lb       = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightbox-img');
  const lbCap    = document.getElementById('lightbox-caption');
  const lbClose  = document.getElementById('lightbox-close');
  const lbPrev   = document.getElementById('lightbox-prev');
  const lbNext   = document.getElementById('lightbox-next');
  const lbCount  = document.getElementById('lightbox-counter');
  if (!lb) return;

  const imgs = Array.from(document.querySelectorAll('.content img'));
  let current = 0;

  function show(idx) {
    current = idx;
    const img = imgs[idx];
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    lbCap.textContent = img.alt || '';
    lbCount.textContent = imgs.length > 1 ? `${idx + 1} / ${imgs.length}` : '';
    lbPrev.disabled = idx === 0;
    lbNext.disabled = idx === imgs.length - 1;
  }

  function open(idx) {
    show(idx);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 200);
  }

  imgs.forEach((img, i) => {
    img.addEventListener('click', () => open(i));
  });

  lbPrev.addEventListener('click', e => { e.stopPropagation(); if (current > 0) show(current - 1); });
  lbNext.addEventListener('click', e => { e.stopPropagation(); if (current < imgs.length - 1) show(current + 1); });

  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  lbClose.addEventListener('click', close);
  lbImg.addEventListener('click', e => e.stopPropagation());

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft'  && current > 0)              show(current - 1);
    if (e.key === 'ArrowRight' && current < imgs.length - 1) show(current + 1);
  });
}

// ── Role tabs ───────────────────────────────────────────────────
function applyRole(role) {
  document.querySelectorAll('.nav-group[data-role]').forEach(el => {
    el.style.display = el.dataset.role === role ? '' : 'none';
  });
  document.querySelectorAll('.home-section[data-role]').forEach(el => {
    el.style.display = el.dataset.role === role ? '' : 'none';
  });
  document.querySelectorAll('.role-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === role);
  });
}

function initRoleTabs() {
  // Auto-detect role from active nav item (so admin pages open in admin tab)
  const activeLink = document.querySelector('.nav-link.active');
  const activeGroup = activeLink && activeLink.closest('.nav-group[data-role]');
  const role = activeGroup
    ? activeGroup.dataset.role
    : (localStorage.getItem(ROLE_KEY) || 'user');
  localStorage.setItem(ROLE_KEY, role);
  applyRole(role);

  document.querySelectorAll('.role-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const newRole = btn.dataset.role;
      localStorage.setItem(ROLE_KEY, newRole);
      applyRole(newRole);
    });
  });
}

// ── Boot ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const lang = getLang();
  applyLang(lang);
  initLangToggle();
  initNavGroups();
  initRoleTabs();
  initLightbox();
  ensureActiveNavVisible();
  initHomeGroups();
  initScrollSpy();
  initSearch();

  // Smooth scroll for non-TOC anchor links in content
  document.querySelectorAll('.content a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const rawHref = a.getAttribute('href');
      const decoded = decodeURIComponent(rawHref);
      let target = document.getElementById(decoded.replace(/^#/, ''));

      // Fallback: try prefix match (markdown [TOC] may use "#7-中文" but id is "7")
      if (!target) {
        const baseId = decoded.replace(/^#/, '').split(/[-_]/)[0];
        target = document.getElementById(baseId);
      }

      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Handle direct URL hash navigation (e.g. /customer/zh/#7-xxx)
  if (location.hash) {
    const rawHash = location.hash;
    // Decode URL-encoded chars (e.g. %E5%B8%B8 → 中)
    const hash = decodeURIComponent(rawHash);
    let target = document.getElementById(hash.replace(/^#/, ''));

    // Fallback: markdown [TOC] may generate hashes like "#7-中文标题"
    // but actual heading id is just "#7". Try prefix match.
    if (!target) {
      const baseId = hash.replace(/^#/, '').split(/[-_]/)[0];
      target = document.getElementById(baseId);
    }

    if (target) {
      // Double rAF + setTimeout to ensure layout is fully painted
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 0);
        });
      });
    }
  }
});
"""


# ── Helpers ─────────────────────────────────────────────────────

def fix_crm_links(html: str) -> str:
    """Strip hardcoded CRM domains from direct links, keeping only the path.

    Transforms href="http://any-host/web/#/..." → href="/web/#/..."
    so the link resolves against whichever domain serves the wiki.
    """
    return re.sub(
        r'href="https?://[^/"]+(/web/#/[^"]*)"',
        r'href="\1"',
        html,
    )


def fix_image_paths(html: str, page_dir: str, root: str = "") -> str:
    """Fix relative image paths to point to correct asset locations.

    Python's markdown library emits <img alt="..." src="..."> (alt before src),
    so we match the whole <img> tag and extract attributes independently.
    root: relative prefix to reach the output root (e.g. "../../" for depth-2 pages).
    """
    def replacer(m):
        tag = m.group(0)
        src_m = re.search(r'src="([^"]*)"', tag)
        alt_m = re.search(r'alt="([^"]*)"', tag)
        if not src_m:
            return tag
        src = src_m.group(1)
        alt = alt_m.group(1) if alt_m else ""
        if src.startswith("../assets/"):
            src = root + "assets/" + src[len("../assets/"):]
        elif src.startswith("assets/"):
            src = root + src
        return f'<img src="{src}" alt="{alt}" loading="lazy">'

    html = re.sub(r'<img\b[^>]*/?>', replacer, html)
    return html


def read_frontmatter(text: str) -> dict:
    """Extract YAML frontmatter."""
    m = re.match(r'^---\n(.*?)\n---\n', text, re.DOTALL)
    if not m:
        return {}
    result = {}
    for line in m.group(1).split('\n'):
        if ':' in line:
            key, val = line.split(':', 1)
            result[key.strip()] = val.strip()
    return result


def strip_toc_h1(toc_html: str) -> str:
    """
    The markdown toc extension wraps everything under a top-level <li> for the h1.
    For the right sidebar we start from h2. Extract the inner <ul> of that first li.
    """
    m = re.search(
        r'<div class="toc">\s*<ul>\s*<li>[^<]*<ul>(.*?)</ul>\s*</li>\s*</ul>\s*</div>',
        toc_html,
        re.DOTALL,
    )
    if m:
        return f'<div class="toc"><ul>{m.group(1)}</ul></div>'
    # Fallback: return as-is (page may have no h1 or a flat structure)
    return toc_html


def generate_search_index(entries: list) -> None:
    """Write search-index.json to the output directory."""
    index_path = OUTPUT_DIR / "search-index.json"
    index_path.write_text(
        json.dumps(entries, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"✅ search-index.json ({len(entries)} entries)")


# ── Page builder ─────────────────────────────────────────────────

def build_html_page(
    title: str,
    content_html: str,
    active_nav: str = "",
    lang: str = "en",
    toc_html: str = "",
    root: str = "",
) -> str:
    """Build a full HTML page with left sidebar, right TOC, and search modal.

    root: relative path prefix to reach the site root (e.g. '../../' for depth-2 pages).
    """

    # ── Grouped nav ──
    nav_groups_html = ""
    for group in NAV_GROUPS:
        group_items_html = ""
        for mod_key in group["modules"]:
            if mod_key not in MODULES:
                continue
            mod_info = MODULES[mod_key]
            zh_files = sorted(ZH_MANUALS_DIR.glob(f"{mod_key}-manual*-zh.md"))
            en_files = sorted(EN_MANUALS_DIR.glob(f"{mod_key}-manual*-en.md"))
            if not zh_files and not en_files:
                continue

            zh_href = root + mod_key + "/zh/" if zh_files else ""
            en_href = root + mod_key + "/en/" if en_files else ""
            is_active = active_nav == mod_key
            cls = "active" if is_active else ""
            default_href = en_href or zh_href

            group_items_html += (
                f'<a href="{default_href}" class="nav-link {cls}" '
                f'data-zh="{zh_href}" data-en="{en_href}" '
                f'data-label-zh="{mod_info["zh"]}" data-label-en="{mod_info["en"]}">'
                f'<span class="icon">{mod_info["icon"]}</span>'
                f'<span class="nav-label">{mod_info["en"]}</span>'
                f'</a>\n'
            )

        if not group_items_html:
            continue

        collapsible_cls = "collapsible" if group["collapsible"] else ""
        aria_expanded = "true" if group["default_open"] else "false"
        collapsed_cls = "" if group["default_open"] else "collapsed"
        chevron = '<span class="nav-group-chevron">▾</span>' if group["collapsible"] else ""

        group_role = group.get("role", "user")
        nav_groups_html += (
            f'<div class="nav-group" data-role="{group_role}">\n'
            f'  <button class="nav-group-header {collapsible_cls}"'
            f' data-group="{group["key"]}"'
            f' data-default-open="{"true" if group["default_open"] else "false"}"'
            f' data-label-zh="{group["label_zh"]}"'
            f' data-label-en="{group["label_en"]}"'
            f' aria-expanded="{aria_expanded}">'
            f'<span class="nav-group-label">{group["label_en"]}</span>'
            f'{chevron}'
            f'</button>\n'
            f'  <div class="nav-group-items {collapsed_cls}" id="group-{group["key"]}">\n'
            f'{group_items_html}'
            f'  </div>\n'
            f'</div>\n'
        )

    # ── Home link ──
    home_cls = "active" if not active_nav else ""
    home_link = (
        f'<a href="{root}index.html" class="nav-link {home_cls}" '
        f'data-zh="{root}index.html" data-en="{root}index.html" '
        f'data-label-zh="首页" data-label-en="Home">'
        f'<span class="icon">🏠</span>'
        f'<span class="nav-label">Home</span>'
        f'</a>'
    )

    # ── Lang toggle — always shown on every page ──
    lang_toggle_html = """
  <div class="sidebar-lang">
    <div class="sidebar-lang-label">Language</div>
    <div class="lang-toggle-group">
      <button class="lang-toggle-btn" data-lang="en">EN</button>
      <button class="lang-toggle-btn" data-lang="zh">中文</button>
    </div>
  </div>"""

    # ── Right TOC sidebar ──
    toc_sidebar_html = ""
    has_toc = bool(toc_html and toc_html.strip())
    if has_toc:
        toc_sidebar_html = f"""
<aside class="toc-sidebar" id="toc-sidebar">
  <div class="toc-sidebar-title">On This Page</div>
  {toc_html}
</aside>"""

    main_class = "main" if has_toc else "main no-toc"

    # Prepend ROOT constant so JS can resolve paths relative to site root
    js_with_root = f"const ROOT = {json.dumps(root)};\n" + JS

    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — Securemetric CRM</title>
<link rel="icon" type="image/x-icon" href="{root}favicon.ico">
<style>{CSS}</style>
</head>
<body>

<nav class="sidebar" id="sidebar">
  <div class="sidebar-brand">
    <h2><span class="brand-dot"></span>Securemetric CRM</h2>
    <small>User Manual · {datetime.now().strftime("%Y-%m-%d")}</small>
  </div>

  <div class="sidebar-search">
    <button class="search-trigger" id="search-trigger" aria-label="Search documentation">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      Search docs...
      <kbd>Ctrl K</kbd>
    </button>
  </div>

  <div class="role-tabs">
    <button class="role-tab" data-role="user" data-label-zh="普通用户" data-label-en="User">User</button>
    <button class="role-tab" data-role="admin" data-label-zh="管理员" data-label-en="Admin">Admin</button>
  </div>

  <div class="sidebar-nav">
    {home_link}
    {nav_groups_html}
  </div>
  {lang_toggle_html}
</nav>

{toc_sidebar_html}

<div class="search-overlay" id="search-overlay" role="dialog" aria-modal="true" aria-label="Search">
  <div class="search-modal">
    <div class="search-input-wrap">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input type="text" class="search-input" id="search-input"
             placeholder="Search documentation..." autocomplete="off" spellcheck="false" />
    </div>
    <div class="search-results" id="search-results">
      <div class="search-empty">Type to search across all modules</div>
    </div>
    <div class="search-footer">
      <span><kbd>↵</kbd> open</span>
      <span><kbd>Esc</kbd> close</span>
      <span><kbd>Ctrl K</kbd> toggle</span>
    </div>
  </div>
</div>

<main class="{main_class}">
  <div class="content">
    {content_html}
  </div>
</main>

<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer">
  <button class="lightbox-close" id="lightbox-close" aria-label="Close">✕</button>
  <button class="lightbox-nav prev" id="lightbox-prev" aria-label="Previous image">‹</button>
  <img class="lightbox-img" id="lightbox-img" src="" alt="" />
  <button class="lightbox-nav next" id="lightbox-next" aria-label="Next image">›</button>
  <div class="lightbox-counter" id="lightbox-counter"></div>
  <div class="lightbox-caption" id="lightbox-caption"></div>
</div>

<script>{js_with_root}</script>
</body>
</html>"""


def build_home_page() -> str:
    """Build the home page with grouped, collapsible module cards."""

    def make_card(mod_key: str) -> str:
        mod_info = MODULES.get(mod_key)
        if not mod_info:
            return ""
        zh_files = sorted(ZH_MANUALS_DIR.glob(f"{mod_key}-manual*-zh.md"))
        en_files = sorted(EN_MANUALS_DIR.glob(f"{mod_key}-manual*-en.md"))
        if not zh_files and not en_files:
            return ""
        zh_href = mod_key + "/zh/" if zh_files else ""
        en_href = mod_key + "/en/" if en_files else ""
        default_link = en_href or zh_href
        desc_zh = mod_info.get("desc_zh", "")
        desc_en = mod_info.get("desc_en", "")
        return (
            f'<a href="{default_link}" class="module-card"'
            f' data-zh="{zh_href}" data-en="{en_href}"'
            f' data-title-zh="{mod_info["zh"]}" data-title-en="{mod_info["en"]}"'
            f' data-desc-zh="{desc_zh}" data-desc-en="{desc_en}">'
            f'<span class="card-icon">{mod_info["icon"]}</span>'
            f'<span class="card-body">'
            f'<span class="card-title">{mod_info["en"]}</span>'
            f'<span class="card-desc">{desc_en}</span>'
            f'</span>'
            f'<span class="card-arrow">›</span>'
            f'</a>\n'
        )

    sections_html = ""
    for group in NAV_GROUPS:
        group_cards = "".join(make_card(mk) for mk in group["modules"])
        if not group_cards:
            continue
        collapsible_cls = "collapsible" if group["collapsible"] else ""
        aria_expanded = "true" if group["default_open"] else "false"
        collapsed_cls = "" if group["default_open"] else "collapsed"
        chevron = '<span class="home-section-chevron">▾</span>' if group["collapsible"] else ""
        group_role = group.get("role", "user")
        sections_html += (
            f'<div class="home-section" data-role="{group_role}">\n'
            f'  <div class="home-section-header {collapsible_cls}"'
            f' data-group="{group["key"]}"'
            f' data-default-open="{"true" if group["default_open"] else "false"}"'
            f' data-label-zh="{group["label_zh"]}"'
            f' data-label-en="{group["label_en"]}"'
            f' aria-expanded="{aria_expanded}">'
            f'<span class="home-section-label">{group["label_en"]}</span>'
            f'{chevron}'
            f'</div>\n'
            f'  <div class="home-section-items {collapsed_cls}" id="home-group-{group["key"]}">\n'
            f'    <div class="card-grid">{group_cards}</div>\n'
            f'  </div>\n'
            f'</div>\n'
        )

    hero = f"""
<div class="home-hero">
  <h1 id="hero-title">Securemetric CRM Manual</h1>
  <p id="hero-desc">Select a module below to view the user guide</p>
</div>
{sections_html}"""
    return build_html_page("Home", hero, lang="en", toc_html="")


# ── Manual converter ─────────────────────────────────────────────

def convert_manual(md_path: Path) -> tuple:
    """
    Convert a single manual markdown file to HTML.
    Returns: (filename, html_page, toc_html, search_entry)
    """
    text = md_path.read_text(encoding="utf-8")
    fm = read_frontmatter(text)

    # Strip frontmatter before conversion
    content = re.sub(r'^---\n.*?\n---\n', '', text, flags=re.DOTALL)

    # Convert markdown → HTML
    md = markdown.Markdown(extensions=['tables', 'fenced_code', 'toc', 'attr_list'])
    html = md.convert(content)

    # Extract and clean TOC (strip h1 level for right sidebar)
    raw_toc = md.toc or ""
    toc_html = strip_toc_h1(raw_toc) if raw_toc.strip() else ""

    # Determine lang
    filename = md_path.stem
    is_zh = filename.endswith("-zh")
    lang = "zh" if is_zh else "en"

    # Determine module key — sort by length descending so "lead-queue" matches before "lead"
    module_key = None
    for mk in sorted(MODULES, key=len, reverse=True):
        if filename.startswith(mk):
            module_key = mk
            break

    # Fix image paths (depth=2 → root is ../../)
    html = fix_image_paths(html, str(md_path.parent), root="../../")

    # Strip hardcoded CRM domains from direct links
    html = fix_crm_links(html)

    # Title
    title = fm.get("title", md_path.stem)
    if module_key and module_key in MODULES:
        mod = MODULES[module_key]
        title = f"{mod['zh']} 用户手册" if is_zh else f"{mod['en']} User Manual"

    # Skip files that don't match any known module
    if not module_key:
        print(f"⚠️  Skipping {md_path.name} — no matching module key in MODULES")
        return None, None, None, None

    # Output path: {module_key}/{lang}/index.html
    out_path = f"{module_key}/{lang}/index.html"

    # Build search entry (plain text, first 3000 chars)
    plain = re.sub(r'<[^>]+>', ' ', html)
    plain = re.sub(r'\s+', ' ', plain).strip()
    search_entry = {
        "url": f"{module_key}/{lang}/",
        "title": title,
        "lang": lang,
        "module_en": MODULES[module_key]["en"],
        "content": plain[:3000],
    }

    html_page = build_html_page(
        title,
        html,
        active_nav=module_key,
        lang=lang,
        toc_html=toc_html,
        root="../../",
    )
    return out_path, html_page, toc_html, search_entry


# ── Asset copy with compression ──────────────────────────────────

def _copy_assets_compressed(src_dir: Path, dst_dir: Path) -> None:
    """Copy assets to dst_dir, compressing PNG/JPG with Pillow when available."""
    total_orig = total_new = 0
    for src in sorted(src_dir.iterdir()):
        dst = dst_dir / src.name
        suffix = src.suffix.lower()
        if _PILLOW_OK and suffix == ".png":
            orig = src.read_bytes()
            img = _PILImage.open(io.BytesIO(orig)).convert("RGB")
            quantized = img.quantize(
                colors=256,
                method=_PILImage.Quantize.FASTOCTREE,
                dither=_PILImage.Dither.FLOYDSTEINBERG,
            )
            buf = io.BytesIO()
            quantized.save(buf, format="PNG", optimize=True)
            compressed = buf.getvalue()
            dst.write_bytes(compressed if len(compressed) < len(orig) else orig)
            total_orig += len(orig)
            total_new += min(len(compressed), len(orig))
        elif _PILLOW_OK and suffix in (".jpg", ".jpeg"):
            orig = src.read_bytes()
            img = _PILImage.open(io.BytesIO(orig)).convert("RGB")
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=85, optimize=True)
            compressed = buf.getvalue()
            dst.write_bytes(compressed if len(compressed) < len(orig) else orig)
            total_orig += len(orig)
            total_new += min(len(compressed), len(orig))
        else:
            shutil.copy2(src, dst)
            sz = src.stat().st_size
            total_orig += sz
            total_new += sz
    if _PILLOW_OK and total_orig:
        saved = (1 - total_new / total_orig) * 100
        print(f"   images: {total_orig/1024:.0f} KB → {total_new/1024:.0f} KB (saved {saved:.0f}%)")


# ── Main ─────────────────────────────────────────────────────────

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Copy assets to output (compress images if Pillow is available)
    assets_out = OUTPUT_DIR / "assets"
    if assets_out.exists():
        shutil.rmtree(assets_out)
    assets_out.mkdir(parents=True)
    if ASSETS_DIR.exists():
        _copy_assets_compressed(ASSETS_DIR, assets_out)

    # Build home page
    home_html = build_home_page()
    (OUTPUT_DIR / "index.html").write_text(home_html, encoding="utf-8")
    print("✅ index.html")

    # Find all manual markdown files
    md_files = sorted({
        f for f in MANUALS_DIR.rglob("*.md")
        if "-manual" in f.stem
    })

    # Convert manuals and collect search entries
    search_entries = []
    for md_path in md_files:
        out_path, html_page, _toc, search_entry = convert_manual(md_path)
        if out_path is None:
            continue
        out_file = OUTPUT_DIR / out_path
        out_file.parent.mkdir(parents=True, exist_ok=True)
        out_file.write_text(html_page, encoding="utf-8")
        search_entries.append(search_entry)
        print(f"✅ {out_path}")

    # Write search index
    generate_search_index(search_entries)

    # Copy favicon if present
    favicon_src = Path(__file__).parent / "favicon.ico"
    if favicon_src.exists():
        shutil.copy(favicon_src, OUTPUT_DIR / "favicon.ico")
        print("✅ favicon.ico")

    # Copy CNAME if present (GitHub Pages)
    cname_src = Path(__file__).parent / "CNAME"
    if cname_src.exists():
        shutil.copy(cname_src, OUTPUT_DIR / "CNAME")
        print("✅ CNAME")

    print(f"\n🎉 Done! {len(md_files)} manuals generated")
    print(f"📂 Output: {OUTPUT_DIR}")
    print(f"🚀 Preview: cd {OUTPUT_DIR} && python3 -m http.server 8080")


if __name__ == "__main__":
    main()
