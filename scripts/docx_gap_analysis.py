#!/usr/bin/env python3
"""
DOCX vs Markdown gap analysis.
Extracts content from both CRM DOCX manuals, maps sections to per-module Markdown files,
then identifies concepts/sections present in DOCX but missing from Markdown.

Usage:
    python3 scripts/docx_gap_analysis.py
Output:
    doc/gap-analysis-report.md
"""

import zipfile
import xml.etree.ElementTree as ET
import os
import re
from collections import defaultdict
from pathlib import Path

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

HEADING_STYLES = {"4": 1, "6": 2, "7": 3, "8": 4, "3": 5}
TOC_STYLES = {"16", "17", "12"}

BASE = Path(__file__).parent.parent
ZH_DOCX = BASE / "wiki/user-manuals/doc/CRM客户关系管理-用户手册V1_20250318.docx"
EN_DOCX = BASE / "wiki/user-manuals/doc/CRM-User ManualV1_20250817.docx"
MANUALS_DIR = BASE / "wiki/user-manuals"
ZH_MANUALS_DIR = MANUALS_DIR / "zh"
EN_MANUALS_DIR = MANUALS_DIR / "en"

# Map (module_key, lang) -> markdown file (relative to lang subdir)
MODULE_FILES = {
    ("lead", "zh"): "zh/lead-manual-zh.md",
    ("lead", "en"): "en/lead-manual-en.md",
    ("customer", "zh"): "zh/customer-manual-zh.md",
    ("customer", "en"): "en/customer-manual-en.md",
    ("contact", "zh"): "zh/contact-manual-zh.md",
    ("contact", "en"): "en/contact-manual-en.md",
    ("opportunity", "zh"): "zh/opportunity-manual-zh.md",
    ("opportunity", "en"): "en/opportunity-manual-en.md",
    ("quotation", "zh"): "zh/quotation-manual-zh.md",
    ("quotation", "en"): "en/quotation-manual-en.md",
    ("contract", "zh"): "zh/contract-manual-zh.md",
    ("contract", "en"): "en/contract-manual-en.md",
    ("activity", "zh"): "zh/service-team-activity-manual-zh.md",
    ("activity", "en"): "en/service-team-activity-manual-en.md",
    ("task", "zh"): "zh/task-management-manual-zh.md",
    ("task", "en"): "en/task-management-manual-en.md",
    ("duplicate", "zh"): "zh/duplicate-check-manual-zh.md",
    ("duplicate", "en"): "en/duplicate-check-manual-en.md",
}

# Section headings in DOCX that map to each module
ZH_MODULE_HEADINGS = {
    "lead": ["线索管理", "销售线索"],
    "customer": ["客户"],
    "contact": ["联系人"],
    "opportunity": ["商机"],
    "quotation": ["报价单"],
    "contract": ["合同"],
    "activity": ["销售记录", "销售业务协同", "访客计划", "外勤签到"],
    "task": ["任务管理"],
    "duplicate": ["查重工具", "常用操作"],
}

EN_MODULE_HEADINGS = {
    "lead": ["Lead Management", "Sales Lead"],
    "customer": ["customer", "Customer"],
    "contact": ["Contact"],
    "opportunity": ["Opportunity", "Business Opportunit"],
    "quotation": ["Quotation"],
    "contract": ["Contract"],
    "activity": ["Activity Log", "Sales Business Collaboration", "Visit Plan"],
    "task": ["Task Management"],
    "duplicate": ["Plagiarism detection", "Actions", "duplicate"],
}

# Key concept keywords to check presence — used for gap detection
ZH_CONCEPTS = {
    "lead": [
        "角色权限", "线索池", "领取上限", "超时提醒", "转移规则",
        "转换规则", "线索状态", "无效", "归集", "收回",
        "线索负责人", "跟进行为", "线索池规则",
    ],
    "customer": [
        "角色权限", "公海", "持有量上限", "收回时限", "联合跟进",
        "客户状态", "开票信息", "账户信息", "合并", "转移",
        "公海规则", "超时收回", "业务规则",
    ],
    "contact": [
        "角色权限", "联系人关系图", "转换", "联系人视图",
        "新建联系人",
    ],
    "opportunity": [
        "角色权限", "阶段推进器", "赢率", "暂停", "竞争情报",
        "商机阶段", "查重", "撞单",
    ],
    "quotation": [
        "角色权限", "审批流程", "报价单视图", "创建报价单",
    ],
    "contract": [
        "角色权限", "合同模板", "审批流程",
    ],
    "activity": [
        "角色权限", "销售记录入口", "访客计划", "外勤签到", "工作日报",
        "待办消息", "跟进超时",
    ],
    "task": [
        "角色权限", "任务管理流程", "任务视图", "任务令",
    ],
    "duplicate": [
        "查重工具", "导入", "导出", "打印", "删除", "批量",
        "更换负责人", "工作交接",
    ],
}

EN_CONCEPTS = {
    "lead": [
        "role permission", "lead queue", "claim limit", "timeout reminder", "transfer rule",
        "conversion rule", "lead status", "invalid", "collect", "retrieve",
    ],
    "customer": [
        "role permission", "public pool", "holding limit", "recovery deadline", "joint contact",
        "customer status", "billing info", "bank account", "merge", "transfer",
    ],
    "contact": [
        "role permission", "contact map", "conversion", "contact view",
    ],
    "opportunity": [
        "role permission", "stage pusher", "win rate", "pause", "competitive intelligence",
        "opportunity stage", "duplicate check",
    ],
    "quotation": [
        "role permission", "approval process", "quotation view", "create quotation",
    ],
    "contract": [
        "role permission", "contract template", "approval process",
    ],
    "activity": [
        "role permission", "activity log entry", "visit plan", "field check-in", "daily report",
        "to-do", "timeout",
    ],
    "task": [
        "role permission", "task workflow", "task view", "task order",
    ],
    "duplicate": [
        "duplicate check", "import", "export", "print", "delete", "batch",
        "handover",
    ],
}


def extract_docx_sections(docx_path):
    """Extract paragraphs grouped by heading hierarchy from DOCX."""
    with zipfile.ZipFile(docx_path) as z:
        with z.open("word/document.xml") as f:
            root = ET.parse(f).getroot()

    sections = []  # list of (level, heading_text, [body_lines])
    current_heading = None
    current_level = 0
    current_body = []

    for para in root.iter(f"{{{W}}}p"):
        style_el = para.find(f".//{{{W}}}pStyle")
        style = style_el.get(f"{{{W}}}val") if style_el is not None else "normal"
        texts = [t.text or "" for t in para.iter(f"{{{W}}}t")]
        text = "".join(texts).strip()
        if not text:
            continue

        if style in TOC_STYLES:
            continue  # skip TOC entries

        if style in HEADING_STYLES:
            if current_heading:
                sections.append((current_level, current_heading, current_body))
            current_heading = text
            current_level = HEADING_STYLES[style]
            current_body = []
        else:
            current_body.append(text)

    if current_heading:
        sections.append((current_level, current_heading, current_body))

    return sections


def collect_module_content(sections, module_headings):
    """Collect all paragraphs that fall under headings matching module keywords."""
    result = []
    in_module = False
    capture_level = None

    for level, heading, body in sections:
        matched = any(kw.lower() in heading.lower() for kw in module_headings)
        if matched:
            in_module = True
            capture_level = level
            result.append(f"{'#' * level} {heading}")
            result.extend(body)
        elif in_module:
            if level <= capture_level:
                # Exited module scope
                in_module = False
            else:
                result.append(f"{'#' * level} {heading}")
                result.extend(body)

    return "\n".join(result)


def read_markdown(path):
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def check_concepts(markdown_text, concepts):
    """Return list of concepts missing from markdown (case-insensitive)."""
    missing = []
    lower_md = markdown_text.lower()
    for concept in concepts:
        if concept.lower() not in lower_md:
            missing.append(concept)
    return missing


def analyse_module(module, lang, docx_sections, module_headings, concepts):
    md_file = MANUALS_DIR / MODULE_FILES.get((module, lang), "")
    md_text = read_markdown(md_file)
    docx_text = collect_module_content(docx_sections, module_headings)
    missing = check_concepts(md_text, concepts.get(module, []))
    docx_line_count = len([l for l in docx_text.splitlines() if l.strip()])
    md_line_count = len([l for l in md_text.splitlines() if l.strip()])
    return {
        "module": module,
        "lang": lang,
        "md_file": md_file.name if md_file else "N/A",
        "md_lines": md_line_count,
        "docx_lines": docx_line_count,
        "missing_concepts": missing,
        "docx_snippet": docx_text[:3000],  # first 3000 chars for context
    }


def build_report(analyses):
    lines = [
        "# DOCX vs Markdown Gap Analysis Report",
        "",
        f"> Generated from: CRM-User ManualV1_20250817.docx + CRM客户关系管理-用户手册V1_20250318.docx",
        "",
        "---",
        "",
    ]

    for a in analyses:
        coverage = round(a["md_lines"] / a["docx_lines"] * 100) if a["docx_lines"] else 0
        status = "✅ Good" if len(a["missing_concepts"]) <= 2 else ("⚠️ Partial" if len(a["missing_concepts"]) <= 5 else "❌ Missing")
        lines += [
            f"## {a['module'].upper()} ({a['lang']}) — {status}",
            "",
            f"- **Markdown file**: `{a['md_file']}`",
            f"- **Markdown content**: {a['md_lines']} lines",
            f"- **DOCX source content**: {a['docx_lines']} lines",
            f"- **Estimated coverage**: {coverage}%",
            "",
        ]
        if a["missing_concepts"]:
            lines.append("### Missing / not detected in Markdown")
            lines.append("")
            for c in a["missing_concepts"]:
                lines.append(f"- `{c}`")
            lines.append("")
        else:
            lines.append("### All tracked concepts detected ✅")
            lines.append("")

        lines += [
            "### DOCX source excerpt (first 2000 chars)",
            "",
            "```",
            a["docx_snippet"][:2000],
            "```",
            "",
            "---",
            "",
        ]

    return "\n".join(lines)


def main():
    print("Extracting ZH DOCX sections...")
    zh_sections = extract_docx_sections(ZH_DOCX)
    print(f"  {len(zh_sections)} sections found")

    print("Extracting EN DOCX sections...")
    en_sections = extract_docx_sections(EN_DOCX)
    print(f"  {len(en_sections)} sections found")

    analyses = []
    modules = list(ZH_MODULE_HEADINGS.keys())

    for module in modules:
        print(f"  Analysing {module}...")
        zh_a = analyse_module(module, "zh", zh_sections, ZH_MODULE_HEADINGS[module], ZH_CONCEPTS)
        en_a = analyse_module(module, "en", en_sections, EN_MODULE_HEADINGS[module], EN_CONCEPTS)
        analyses.append(zh_a)
        analyses.append(en_a)

    report = build_report(analyses)
    out_path = BASE / "doc/gap-analysis-report.md"
    out_path.write_text(report, encoding="utf-8")
    print(f"\nReport written to: {out_path}")

    # Summary to stdout
    print("\n=== SUMMARY ===")
    for a in analyses:
        n = len(a["missing_concepts"])
        flag = "✅" if n <= 2 else ("⚠️" if n <= 5 else "❌")
        print(f"{flag} {a['module']:12} [{a['lang']}]  missing={n}  md={a['md_lines']}L  docx={a['docx_lines']}L")


if __name__ == "__main__":
    main()
