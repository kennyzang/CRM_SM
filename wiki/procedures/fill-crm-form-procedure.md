---
title: Fill CRM Form Procedure
created: 2026-04-22
updated: 2026-04-22
type: procedure
tags: [tool/playwright, procedure, standard]
sources: [skills/fill-crm-form.md]
related: [[pitfall-log]], [[widget-special-controls]], [[test-plan-phase-1]]
---

# Fill CRM Form Procedure

> This page is the Wiki version of `skills/fill-crm-form.md`. It is the authoritative standard for CRM form filling. All test code must follow this specification.

---

## CRM UI Framework

The system uses two component libraries on the same page:

| Prefix | Source | Examples |
|--------|--------|----------|
| `lui-*` | LUI (internal) | `lui-input`, `lui-select`, `lui-cascader`, `lui-radio` |
| `ele-*` | Element-UI derivative | `ele-xform-fieldset-wrap`, `ele-detail-save-btn` |

**Key principle**: All interactive elements have `data-tid` attributes. Always prefer `data-tid` selectors.

---

## Selector Priority

```
1. [data-tid="<tid>"]                    ← fastest, most stable
2. fieldset label → input inside          ← reliable when tid unknown
3. input[placeholder*="<hint>"]           ← last resort text fallback
4. screenshot + throw                    ← never silently swallow failures
```

---

## Locator Priority Implementation (ContactCreatePage.ts example)

```typescript
private async findInput(fieldName: string): Promise<Locator> {
  const candidates = [
    `[data-tid="comp-fd_${fieldName}--input"]`,
    `[data-tid="comp-fd_${fieldName.toLowerCase()}--input"]`,
    `input[placeholder*="${fieldName}"]`,
  ];
  for (const sel of candidates) {
    const loc = this.page.locator(sel);
    if (await loc.count() > 0) return loc;
  }
  throw new Error(`Cannot find input for field: ${fieldName}`);
}
```

---

## FormEngine Architecture

The new `FormEngine` class (in `pages/FormEngine.ts`) provides a universal form-filling engine:

1. **Field Registry**: Each module has a schema file (e.g., `pages/registry/lead.fields.ts`)
2. **Type-driven filling**: FormEngine reads `FieldDef.type` and applies the correct interaction strategy
3. **Frame resolution**: Automatically detects if form is in main page or iframe
4. **RANDOM support**: Fields with `RANDOM` value are picked from `FieldDef.options`

### Field Types

| Type | Interaction |
|------|-------------|
| `text` | `.fill()` on input |
| `textarea` | `.fill()` on textarea |
| `cascade` | Click fieldset → pick item from cascader panel |
| `lui-select` | Click selector → pick from listbox |
| `radio` | Click radio by label text match |
| `checkbox` | Click all matching checkboxes |
| `relation-modal` | Click trigger → modal opens → pick row → Confirm |
| `detail-table` | Inline editable table (handled by page object, not FormEngine) |
| `skip` | Pre-filled or intentionally omitted |

---

## Field data-tid Quick Reference

See entity pages for complete field registries:
- [[lead]] — Lead fields
- [[contact]] — Contact fields
- [[customer]] — Customer fields
- [[product]] — Product fields
- [[opportunity]] — Opportunity fields

---

## Data Generation

**Must use generators.** Never hardcode test data:

| Function | Purpose |
|----------|---------|
| `generateLeadName()` | Unique Lead name |
| `generateCustomerName()` | Malaysian-style company name |
| `generateRegistrationCode()` | SSM-format unique code |
| `generateMalaysianEmail()` | Unique email |
| `generateContactTestData()` | Full Contact test data set |
| `generateProductTestData()` | Full Product test data set |
| `generateOpportunityTestData()` | Full Opportunity test data set |

---

## REPEAT Batch Creation

```bash
# Create 5 Leads
REPEAT=5 npx playwright test tests/lead-create.spec.ts --grep "TC-001"

# Create 5 Contacts
REPEAT=5 npx playwright test tests/contact-create.spec.ts --grep "TC-001"
```

---

## Adding a New Form Module

When testing a new CRM form, follow these steps:

1. **Discover data-tids**: Run the corresponding `explore-*.spec.ts`
2. **Create Page Object**: `pages/NewFormPage.ts`
3. **Create Field Registry**: `pages/registry/newform.fields.ts`
4. **Implement field methods**: Follow locator priority rules
5. **Implement `submitForm()`**: Use `Promise.race` pattern with `.catch()` on all branches
6. **Add data generator**: `data/faker-generator.ts`
7. **Write test cases**: `tests/newform-create.spec.ts`

See [[pitfall-log]] for common pitfalls when adding new modules.
