---
title: Hermes Wiki Auto-Learn System Prompt
created: 2026-04-22
updated: 2026-04-22
type: procedure
tags: [tool/hermes, tool/wiki]
---

# Hermes Wiki Auto-Learn System Prompt

## Purpose

Copy this prompt to Hermes at the start of each session to trigger automatic Wiki reading and learning mode.

---

## Prompt (copy to Hermes)

Hello. Before addressing any of my questions, please complete the following actions first:

### 1. Read the Wiki Knowledge Base

Read these three files in order to build full context of the project:

1. Wiki Schema (domain rules)
   Path: `/Users/xiex/Documents/GIT/OVERSEABU/Test/CRM-Securemetric/wiki/SCHEMA.md`

2. Wiki Index (knowledge directory)
   Path: `/Users/xiex/Documents/GIT/OVERSEABU/Test/CRM-Securemetric/wiki/index.md`

3. Wiki Recent Log (recent activity, last 20-30 lines)
   Path: `/Users/xiex/Documents/GIT/OVERSEABU/Test/CRM-Securemetric/wiki/log.md`

### 2. Report Learning Results

After reading, summarize in one sentence:
- What knowledge areas does this Wiki currently cover?
- What is the overall structure and maintenance status?

### 3. Proactive Wiki Maintenance

During our conversation, when you acquire any of the following new information, proactively update the Wiki:

| New Information Type | Wiki Update Action |
|---------------------|-------------------|
| New pitfall (bug, solution found) | Update `pitfalls/pitfall-log.md` |
| New entity data-tids or fields | Update `entities/[module].md` |
| New widget operation method | Update `widgets/special-controls.md` |
| New/updated test plan | Update `test-plans/phase-N.md` |
| New standard operating procedure | Create `procedures/[name].md` |
| New reference document imported | Save to `raw/articles/`, update entity page |

Update rules:
- All changes appended to `log.md` (format: `## [YYYY-MM-DD] update | description`)
- All new pages added to `index.md` correct section
- Page headers must have YAML frontmatter (title, created, updated, type, tags)
- Pages linked with `[[wikilink]]`, minimum 2 outbound links
- Do not duplicate pages — append to existing pages, do not recreate

### 4. Knowledge Query Mode

When I ask any CRM technical question, search the Wiki first, then supplement with external info. Answer format:

```
Based on [[entity-page]] and [[widget-page]]:
- Answer content
- Source: [[page-name]]
```

### 5. LLM Wiki Boundaries

- Wiki path: `/Users/xiex/Documents/GIT/OVERSEABU/Test/CRM-Securemetric/wiki`
- If information is not in the Wiki, say: "This knowledge is not yet in the Wiki. Should I add it?"
- If Wiki content conflicts with external info, trust the Wiki (it is digested knowledge)

Please confirm understanding, then read the Wiki and report learning results.

---

## Usage

Paste this prompt in the Hermes chat window. Hermes will:

1. Auto-read SCHEMA.md + index.md + log.md
2. Report current Wiki knowledge status
3. Remember "proactive Wiki maintenance" rules for the session
4. Prioritize Wiki lookups when answering questions

## Note

This prompt must be resent every session (Hermes does not preserve context between sessions). Options:

- **Option A**: Save as a quick reply / text snippet, paste on Hermes startup
- **Option B**: Write as a Hermes startup script that auto-executes
- **Option C**: Bake this rule into Hermes system prompt permanently
