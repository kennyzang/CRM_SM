---
title: AI Prompt Templates for CRM Automated Testing
created: 2026-04-22
updated: 2026-04-22
type: procedure
tags: [tool/playwright, tool/hermes, procedure]
---

# AI Prompt Templates for CRM Automated Testing

> Applicable to: Claude Code / Cursor / Copilot Chat / any AI coding assistant with system prompts
> Core principle: **Read code first, then generate code; no blind DOM exploration; output runnable code in one shot**

---

## Template 0: Universal Rules Prefix (must prepend to ALL templates)

Paste at the **top** of every template.

```
[MANDATORY CONSTRAINTS — redo if violated]
1. No DOM exploration: do NOT generate explore scripts, do NOT loop through multiple selectors
2. No dynamic IDs / long XPath chains / pure CSS hierarchy paths
3. All field locators must follow this priority:
   data-tid > data-testid > parent container + label text > fixed text button
4. Read files before generating any code; all changes must be line-precise
5. Output format: pure code blocks, no summaries, no "please confirm" filler
6. If info is insufficient, list the specific files to read, wait for confirmation before generating
```

---

## Template 1: Architecture Initialization

**Use case**: Adding a brand-new form module (e.g., "Customer Create", "Product Create")
**Expected token cost**: Low (template specifies all file paths, no exploration needed)

```
[Role] You are a senior Playwright/TypeScript test architect, familiar with low-code systems (lui-*, ele-* components).

[Task] Add full automated test support for {MODULE_NAME} ({MODULE_DESCRIPTION}).

[Read these files to understand the existing architecture before coding]
1. pages/registry/lead.fields.ts        → Field registry pattern
2. pages/FormEngine.ts                   → Universal form-filling engine API
3. pages/LeadFormPage.ts                 → Page Object pattern example
4. types/field.types.ts                  → FieldDef / FormSchema interface definitions
5. tests/lead-form.spec.ts              → Test case pattern example
6. data/faker-generator.ts              → Data generator existing methods

[Field info] (from CRM system / design doc — NOT from exploration scripts)
| Field | data-tid | Type | Required | Options (dropdown/radio only) |
|-------|----------|------|----------|-------------------------------|
{PASTE_FIELD_TABLE_HERE}

[Deliverables — all required]
1. pages/registry/{module}.fields.ts    → Field registry (FieldDef for all fields)
2. pages/{Module}FormPage.ts            → Page Object (extends FormEngine, <200 lines)
3. data/faker-generator.ts new method   → generate{Module}Data() function (append, don't replace)
4. tests/{module}-form.spec.ts          → Test cases (TC-001 happy path + TC-002/003 boundaries)

[Prohibitions]
- No explore scripts
- No individual fillXxx() methods in Page Object (use fillForm() uniformly)
- No hardcoded URLs (import BASE_URL from config/env.config.ts)
- No Playwright locators in test cases (page.locator / page.getByRole)
```

**How to use**:
1. Replace `{MODULE_NAME}` with module name (e.g., `Customer`)
2. Replace `{MODULE_DESCRIPTION}` with one-line description
3. Fill the field table from CRM form or design doc (**critical** — pre-filled table saves tokens)
4. Paste to AI, get 4 runnable files in one shot

---

## Template 2: Business Flow Extension

**Use case**: Adding business flow steps to existing module (e.g., "Follow-up", "Convert to Opportunity", "Create Quote")
**Expected token cost**: Very low (changes confined to known files)

```
[Role] You are a Playwright automation test engineer, extending business flows on existing POM architecture.

[Task] Add the following business steps to {PAGE_CLASS} (file: pages/{filename}.ts):
{STEP_LIST}
Each step format: N. Step name — trigger element description — expected result

[Read these files before coding]
1. pages/ClueFlowPage.ts               → Existing flow step patterns
2. pages/FormEngine.ts                 → Utility methods like _findActionButton()
3. config/labels.ts                    → EN/ZH button/label mapping

[Deliverables]
1. Append methods to {PAGE_CLASS} only, do NOT modify existing methods
2. Append TC-Fxxx test cases to tests/lead-flow.spec.ts
3. Each method: log + implementation + error handling (follow followUp() pattern)

[Locator rules]
- Buttons: prefer _findActionButton(['EnText', '中文Text']) — pass both languages
- Modals: .lui-modal-content or .lui-drawer-body (no data-dialog-id)
- Confirm button: filter hasText /Confirm|OK|确认|确定/i
- Prohibited: dynamic IDs, index nth() (except nth(0) meaning "first")

[Method signature format]
async {methodName}(param?: string): Promise<void> {
  this.logger.info('{action description}…');
  // implementation
  this.logger.info('✓ {completion description}');
}
```

**How to use**:
1. Fill `{STEP_LIST}` with clear trigger element descriptions (button text, modal type)
2. No need to explore DOM in advance — `_findActionButton()` accepts multiple candidate texts
3. AI will replicate the existing `followUp()` pattern for new steps

---

## Template 3: Form Change Adaptation

**Use case**: CRM upgrade changed a field's data-tid / component type, needs quick fix
**Expected token cost**: Very low (only registry changes, no test code touched)

```
[Role] You are a Playwright maintenance engineer, focused on field locator fixes, not test logic changes.

[Background] After CRM update, the following field locator is broken:
Field name: {FIELD_NAME}
Form: {FORM_NAME} (registry file: pages/registry/{form}.fields.ts)
Failure reason: {REASON} (e.g., data-tid changed / component changed from cascade to lui-select)
New correct info: {NEW_INFO} (e.g., new data-tid="comp-fd_xxx--input", type still text)

[Read files]
1. pages/registry/{form}.fields.ts     → Find current FieldDef for this field
2. types/field.types.ts                → Confirm FieldType enum

[Deliverables]
- ONLY modify the FieldDef in pages/registry/{form}.fields.ts
- Max 3 lines changed (tid / type / options)
- No Page Object or test case modifications
- Output format:
  File: pages/registry/{form}.fields.ts
  Before: (original code snippet)
  After: (new code snippet)
  Reason: (one sentence)

[Prohibited]
- No FormEngine.ts modifications (unless it's an engine bug)
- No test case file modifications
- No explore scripts or diagnostic code
```

**How to use**:
1. Use when test fails with `[FormEngine] Cannot locate field "xxx"`
2. Provide the new data-tid (copied from browser DevTools)
3. Fix in 30 seconds, no need to understand the whole Page Object

---

## Template 4: Script Debug Optimization

**Use case**: Test failure needs root cause diagnosis and fix, not a full rewrite
**Expected token cost**: Medium (requires reading error log and related files)

```
[Role] You are a Playwright debugging expert, fixing test failures with minimal changes, no refactoring working code.

[Failure info]
Test file: tests/{spec_file}.ts
Test case: {TEST_TITLE}
Error message:
{PASTE_ERROR_MESSAGE_HERE}

Log snippet (last 50 lines):
{PASTE_LOG_SNIPPET_HERE}

Screenshot: {SCREENSHOT_PATH} (if available)

[Read these files for diagnosis]
1. tests/{spec_file}.ts                → Failed test case code
2. pages/{PageClass}.ts                → Related Page Object
3. pages/registry/{form}.fields.ts    → Field registry (if error involves field locator)
4. pages/FormEngine.ts                 → Engine logic (if error is a type error)

[Diagnosis flow (check in order)]
1. Field locator failure? → Check registry tid, verify with browser DevTools
2. Timeout? → Check waitFor timeout, is handleNetworkTipsOverlay() needed?
3. Race condition? → Check if modal/overlay should be closed before field operation
4. Data issue? → Check faker-generator.ts output against CRM validation rules

[Deliverables]
1. Output diagnosis conclusion first (2-3 sentences), then code
2. Only modify the minimal code range causing the failure
3. No wrapping problems in new try/catch (unless genuine async exception handling needed)
4. No adding extra waitForTimeout() as a band-aid (find root cause first)
5. If root cause is wrong tid in registry, only modify registry; if engine bug, fix engine

[Prohibited]
- No rewriting entire Page Object or spec file
- No leaving test.only() / test.skip() in committed code
- No using force: true to mask real visibility issues (unless confirmed as lui component pointer-events issue)
```

**How to use**:
1. Copy last 50 log lines from test report (`reports/logs/`)
2. Copy complete error message (including Error: and first 5 lines of stack trace)
3. AI provides "diagnosis + minimal fix", not a full file rewrite

---

## Quick Reference: Core Token-Saving Techniques

| Technique | Description | Savings |
|-----------|-------------|---------|
| **Pre-fill field table** | Fill the field table in Template 1 yourself, AI doesn't explore | 5 stars |
| **Specify file paths** | Each template lists "read these files first", AI won't read randomly | 4 stars |
| **Use registry + FormEngine** | Describe fields once clearly, AI doesn't guess | 4 stars |
| **Ban explore scripts** | Explicitly write "no exploration scripts" | 4 stars |
| **Limit change scope** | Say "only modify registry" or "only append methods", AI won't refactor | 3 stars |
| **Copy real errors** | Template 4 with real error info, AI doesn't guess | 3 stars |
| **RANDOM sentinel** | Use RANDOM in test data, no need to list options each time | 2 stars |

---

## Architecture Change Checklist

After each CRM version upgrade, run this checklist (5 minutes):

```bash
# 1. Run a smoke test, see which field reports [FormEngine] Cannot locate
npx playwright test tests/lead-form.spec.ts --grep "TC-001" 2>&1 | grep "FormEngine"

# 2. Open the registry file for the broken field
# e.g., "Cannot locate field 'Source'" → open pages/registry/lead.fields.ts

# 3. Check new data-tid in browser DevTools (F12 → right-click element → Copy outerHTML)

# 4. Fix the tid in the registry (one-line change)

# 5. Re-run to confirm fix
npx playwright test tests/lead-form.spec.ts --grep "TC-001"
```

**Conclusion: When DOM changes, go from "editing 1000 lines of Page Object" to "editing 1 line of registry".**
