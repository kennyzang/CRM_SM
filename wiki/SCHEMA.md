---
title: Wiki Schema — Securemetric CRM Test Knowledge Base
created: 2026-04-22
updated: 2026-04-22
type: schema
tags: [tool/wiki]
---

# Wiki Schema

## Domain

This Wiki is the **automated testing knowledge base** for the Securemetric CRM project, serving the frontend development team's black-box end-to-end testing work.

Coverage:
- UI testing of a CRM application built on a low-code platform
- Playwright TypeScript test framework maintenance and extension
- Business process testing, permission configuration testing, cross-module integration testing
- Pitfall documentation and operational procedure consolidation

## Language Policy

**The CRM system's official language is English.** All wiki content, test cases, page objects, and documentation must be in English.

- Any Chinese text encountered in the CRM UI during testing is treated as a **defect** and should be logged
- Chinese labels are only referenced when necessary to identify CRM elements (e.g., button text "保存" vs "Save")
- All entity names, field labels, and test descriptions use English terminology from the Business Blueprint

## Conventions

- **Filenames**: lowercase, hyphens, no spaces (e.g., `lead-form-widget.md`, `contact-cascader-procedure.md`)
- Every Wiki page starts with YAML frontmatter
- Use `[[wikilinks]]` to link other pages (minimum 2 outbound links per page)
- Update the `updated` date whenever modifying a page
- New pages must be added to the correct section in `index.md`
- All operations must be logged in `log.md`

## Frontmatter

```yaml
---
title: Page Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: entity | concept | procedure | pitfall | test-plan | widget | query | summary
tags: [from taxonomy below]
sources: [raw/articles/source-name.md]
related: [[page-name]]
---
```

## Tag Taxonomy

**Module Tags:**
- `lead` — Lead module
- `contact` — Contact module
- `customer` — Customer module
- `product` — Product module
- `opportunity` — Opportunity module
- `quote` — Quote / Quotation module
- `pl` — PL (Product License / Price List) module
- `so` — SO (Sales Order) module
- `process` — Process / workflow transition
- `permission` — Permission / access control
- `pool` — Lead pool / ocean rules

**Widget Tags:**
- `widget/lui` — LUI internal controls (lui-input / lui-select / lui-cascader / lui-radio)
- `widget/ele` — Element-UI derived controls (ele-*)
- `widget/special` — Special controls (date picker, table select modal, relation field modal)

**Test Tags:**
- `test/create` — Create-type tests
- `test/edit` — Edit-type tests
- `test/list` — List-type tests
- `test/process` — Process / workflow tests
- `test/self-healing` — Self-healing / recovery related
- `test/explore` — Exploratory testing

**Quality Tags:**
- `pitfall` — Documented pitfalls
- `procedure` — Standard operating procedure
- `standard` — Standard practice
- `known-issue` — Known issue (pending fix)
- `unresolved` — Unresolved problem

**Tool Tags:**
- `tool/playwright` — Playwright related
- `tool/mcp` — Playwright MCP related
- `tool/cli` — Playwright CLI related
- `tool/hermes` — Hermes Agent related
- `tool/wiki` — LLM Wiki related

## Page Thresholds

- **Create a page**: An entity/concept mentioned in 2+ sources, or central in one source
- **Append to existing page**: Content already covered by another page
- **Do not create a page**: Mentioned only in footnotes, minor details, or out of scope
- **Split a page**: When exceeding ~200 lines, split into subtopics with cross-links
- **Archive a page**: When fully superseded by new content, move to `_archive/`

## Entity Pages

One page per testable CRM module, containing:
- Module overview and entry path
- Key field data-tid mapping table
- Standard form-filling procedures
- Known issues andnotes / precautions (notes)

## Widget Pages

One page per special control type, containing:
- Control type definition (lui-select / lui-cascader / date-picker etc.)
- Operation steps (with Playwright code examples)
- Known limitations and pitfalls
- Related test cases

## Pitfall Pages

One page per resolved pitfall, containing:
- Problem description
- Root cause analysis
- Fix solution (Playwright code)
- Prevention measures

## Procedure Pages

One page per standard operation, containing:
- Applicable scenarios
- Detailed steps
- Code templates
- Related test cases

## Test Plan Pages

Test plans organized by phase/module, containing:
- Goals and scope
- Test case checklist
- Current progress (percentage)
- Blocking issues

## Update Policy

When new information conflicts with existing content:
1. Check dates — newer sources usually supersede older ones
2. If truly contradictory, note both positions with dates and sources
3. Mark in frontmatter: `contradictions: [page-name]`
4. Flag in lint report for manual review

## Query Pages

Save valuable query results (deep comparisons, complexcomprehensive analysis) to `queries/`. One-off queries not worth re-deriving are not saved.
