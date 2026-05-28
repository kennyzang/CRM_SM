---
title: Create Form Test Best Practices
created: 2026-04-24
updated: 2026-04-24
type: procedure
tags: [best-practice, playwright, formengine, create-form]
related: [[prompt-templates]], [[pitfall-log]], [[fill-crm-form-procedure]]
---

# Create Form Test Best Practices

> Scope: Lead / Contact / Customer / Opportunity / Product 等新建表单测试场景
> Prerequisite: 阅读 `wiki/prompt-templates.md` 和 `wiki/pitfalls/pitfall-log.md`

---

## 1. 四层模型（Layer Model）

架构严格分为四层，每层单一职责。跨层的代码是异味。

```
┌─────────────────────────────────────────────────┐
│  Layer 4: Spec  (tests/*-form.spec.ts)          │
│  • 只写业务语言                                   │
│  • 零 Playwright locator                         │
│  • 调用 Page Object 方法，断言业务结果             │
├─────────────────────────────────────────────────┤
│  Layer 3: Page Object  (pages/*FormPage.ts)      │
│  • 每个 CRM 表单一个类                            │
│  • extends FormEngine                            │
│  • 暴露 createXxx(data) / verifyXxxInList()      │
│  • 负责 detail-table 和非标准字段                 │
├─────────────────────────────────────────────────┤
│  Layer 2: FormEngine  (pages/FormEngine.ts)      │
│  • 通用 fillForm(schema, data)                   │
│  • 8 种字段类型策略                               │
│  • frame 检测、失败截图                           │
│  • 不因模块而修改                                 │
├─────────────────────────────────────────────────┤
│  Layer 1: Registry  (pages/registry/*.fields.ts) │
│  • FormSchema: 每个字段一个 FieldDef              │
│  • 包含全部 locator 知识                          │
│  • DOM 变更时唯一需要修改的文件                    │
└─────────────────────────────────────────────────┘
```

### 各层职责归属

| 关注点 | 所属层 |
|---|---|
| `data-tid` 值 | Registry |
| 字段交互类型（radio、cascade 等） | Registry |
| 下拉/radio/cascade 的可用选项 | Registry |
| `required: true` 标记 | Registry |
| 表单导航、提交、about:blank 处理 | Page Object |
| detail-table 填写（如 Principal Allocation） | Page Object |
| `fillForm()` 调度循环 | FormEngine |
| frame 检测 | FormEngine |
| 字段找不到时的截图报错 | FormEngine |
| 测试数据构造 | Spec（通过 faker-generator） |
| `expect()` 断言 | Spec（业务断言）/ Page Object（基础设施断言） |
| `beforeEach` / `afterEach` hooks | Spec |

**为什么重要：** CRM 升级改变一个 `data-tid` 时，只改 Layer 1 一行。没有这个分层，往往要重写 Layer 3 或 Layer 4。

---

## 2. Registry 规范

### 2.1 每个 FieldDef 的必填项

```typescript
{
  label: string;     // CRM 表单中显示的英文标签（用于日志和兜底定位）
  type: FieldType;   // text | textarea | cascade | lui-select | radio | checkbox | relation-modal | detail-table | skip
  required: boolean; // CRM 不填就拒绝保存时为 true
}
```

至少需要一个定位锚，优先级：

1. `tid` — `data-tid` 属性值。有就用，最稳定。
2. `testId` — `data-testid`，仅在无 `data-tid` 时使用。
3. label 兜底 — 省略 `tid` 和 `testId` 时 FormEngine 自动用 `.ele-xform-fieldset-wrap` + label 文本定位。不需要手写。
4. `placeholders` — `input[placeholder*="..."]`，仅 `text` 类型字段，最后手段。

### 2.2 推荐但非必填字段

- `options: string[]` — 凡要用 `RANDOM` 的字段必须有。动态加载选项时设 `options: []` 并注释原因。
- `row?: number` — `detail-table` 列单元格用，0-based 行索引。

### 2.3 命名规范

| 对象 | 规则 | 示例 |
|---|---|---|
| Schema 常量 | `SCREAMING_SNAKE_SCHEMA` | `LEAD_SCHEMA`, `CONTACT_SCHEMA` |
| 默认数据常量 | `DEFAULT_XXX_DATA` | `DEFAULT_LEAD_DATA` |
| 字段 key | `camelCase`，用语义名 | `leadName` 而非 `compFdNameInput` |
| 文件名 | `{module}.fields.ts` | `lead.fields.ts` |

### 2.4 CRM typo 处理

CRM 源码有已知拼写错误，registry 吸收这些 typo，使其他文件无感知。在 `tid` 同行注释标明：

```typescript
details: {
  label: 'Details',
  tid: 'comp-fd_remark--teaxtarea',  // CRM typo: "teaxtarea" not "textarea"
  type: 'textarea',
  required: false,
},
```

**已知 typo 全表（截至 2026-04-24）：**

| Typo 写法 | 正确写法 | 涉及字段 |
|---|---|---|
| `teaxtarea` | `textarea` | Lead/Contact/Customer 详情 textarea |
| `raido` | `radio` | Lead customerType, Contact gender |
| `prodcut` | `product` | Principal Allocation 金额行 |
| `comp-fd_add--input` | `comp-fd_address--input` | Contact 地址（CRM 用 `add` 缩写） |

### 2.5 条件字段（Conditional Fields）

条件字段：只有当另一字段设为特定值后才出现在 DOM 中（例如 `customerType = 'New Customer'` → `customerName` 出现）。

规则：

1. 在条件字段的 FieldDef 上注明条件：

```typescript
customerName: {
  label: 'Customer',
  tid: 'comp-fd_new_customer--input',
  type: 'text',
  required: true,
  // Conditional: only visible when customerType = 'New Customer'
  // Do not include in test data unless customerType is also set to 'New Customer'
},
```

2. **控制字段必须在 Schema 对象中排在被控字段之前**。`fillForm()` 按 `Object.entries(schema)` 插入顺序执行，注册顺序即填写顺序。

3. 测试数据中若测条件路径，两个字段都要传；若测默认路径，不传被控字段。

4. 对可见性的断言用 Page Object 的 `assertFieldVisible(key)` 方法，不在 Spec 层写裸 locator。

### 2.6 verified-date 注释

每个 FieldDef 首次加入时必须有确认日期注释，让后续维护者知道最后验证时间：

```typescript
leadName: {
  label: 'Lead Name',
  tid: 'comp-fd_name--input',  // confirmed 2026-04-22 via Playwright MCP DOM inspection
  type: 'text',
  required: true,
},
```

### 2.7 动态加载选项

服务端动态加载选项的字段设 `options: []` 并注释，FormEngine 会 fallback 到选第一个可见项：

```typescript
salesPipeline: {
  label: 'Sales Pipeline',
  tid: 'ef-fs-fd_lead_stage-desktop',
  type: 'lui-select',
  options: [],  // loaded dynamically — RANDOM not supported; FormEngine picks first
  required: false,
},
```

---

## 3. 测试用例结构

### 3.1 标准 Spec 骨架

```typescript
/**
 * {module}-form.spec.ts — {Module} Creation Tests
 *
 * Run: npx playwright test tests/{module}-form.spec.ts
 * Bulk: REPEAT=N npx playwright test tests/{module}-form.spec.ts --grep "TC-001"
 */
import { test, expect } from '@playwright/test';
import { {Module}FormPage } from '../pages/{Module}FormPage';
import { {MODULE}_SCHEMA } from '../pages/registry/{module}.fields';
import { Logger } from '../utils/logger';
import { generateFaker{Module}Data } from '../data/faker-generator';
import { RANDOM } from '../types/field.types';

const REPEAT = Math.max(1, parseInt(process.env.REPEAT || '1', 10));

test.describe('{Module} Form — Create Scenarios', () => {
  let logger: Logger;
  let formPage: {Module}FormPage;

  test.beforeEach(async ({ page }, info) => {
    logger   = new Logger(info.title);
    formPage = new {Module}FormPage(page, logger);
    await formPage.navigateToCreate();
  });

  test.afterEach(async ({}, info) => {
    const status = info.status === info.expectedStatus ? 'PASSED ✓' : 'FAILED ✗';
    logger.info(`Test ${status}: ${info.title}`);
    if (info.error) logger.error(String(info.error.message));
  });

  // ─── TC-001: 全字段正向路径 ─────────────────────────────────────────────
  test('TC-001: Create {module} with valid Malaysia-style data', async ({ page }) => {
    const failures: string[] = [];
    for (let i = 1; i <= REPEAT; i++) {
      if (REPEAT > 1) logger.info(`── Iteration ${i}/${REPEAT} ──`);
      if (i > 1) await formPage.navigateToCreate();

      const data = generateFaker{Module}Data();
      const result = await formPage.create{Module}({ ...data, source: RANDOM, leadLevel: RANDOM });

      expect(result.{primaryId}).toBeTruthy();
      // 可选：断言 RANDOM 解析值
      // expect(sourceOptions).toContain(result.source);

      await formPage.verify{Module}InList(data.{primaryName}).catch((err: Error) => {
        failures.push(`[iter ${i}] ${err.message}`);
        logger.warn(`List verification failed: ${err.message}`);
      });

      if (i < REPEAT) await page.waitForTimeout(10000); // 限流间隔
    }
    if (failures.length > 0) throw new Error(`${failures.length} failure(s):\n${failures.join('\n')}`);
  });

  // ─── TC-002: 表单默认状态 ───────────────────────────────────────────────
  test('TC-002: {Describe default state}', async () => {
    // 用 Page Object 断言方法，不写裸 locator
    await formPage.assertDefaultRadioSelected('customerType', 'Existing Customer');
  });

  // ─── TC-003: 条件字段显示逻辑 ──────────────────────────────────────────
  test('TC-003: Switch to New Customer reveals Customer input', async () => {
    await formPage.fillField({MODULE}_SCHEMA.customerType, 'New Customer');
    await formPage.assertFieldVisible('customerName');
  });
});

// ─── 边界场景（Phase 2 预留）────────────────────────────────────────────────
test.describe.skip('{Module} Form — Boundary Scenarios', () => {
  test('TC-B001: {primaryName} at max length (200 chars)', async () => {});
  test('TC-B002: Missing required fields shows validation error', async () => {});
  test('TC-B003: Duplicate {uniqueField} rejected', async () => {});
});
```

### 3.2 TC 编号规范

| ID | 场景类型 |
|---|---|
| TC-001 | 正向路径（全必填字段，典型选项） |
| TC-002 | 默认状态断言（表单打开时的初始状态） |
| TC-003 | 条件字段行为（字段 A 控制字段 B 的可见性） |
| TC-B001 | 边界：字段最大长度 |
| TC-B002 | 边界：缺少必填字段时的校验报错 |
| TC-B003 | 边界：重复唯一键被拒绝 |
| TC-P001 | 流程：工作流状态变更（放在 flow spec，不在 form spec） |

### 3.3 beforeEach 规则

- 永远在 `beforeEach` 里调用 `formPage.navigateToCreate()`，不在测试体内调用。
- 表单在 iframe 内时，`navigateToCreate()` 末尾必须调用 `resolveFormFrame()`（FormEngine 提供，Page Object 触发）。
- Contact（窗口自关闭表单）的 `beforeEach` 必须从 test 参数接收 `context` 并传入 Page Object 构造函数。
- `beforeEach` 内不放任何 `expect()` 断言，只做导航。

### 3.4 afterEach 规则

- 只记录 pass/fail 状态和错误信息。
- 不在 `afterEach` 里截图（Playwright config 已配置 `screenshot: 'only-on-failure'`）。
- 不在 `afterEach` 里删除记录——清理策略见 §3.5。

### 3.5 记录积累策略

测试创建的记录会累积在 CRM 中，这是有意为之（当前阶段）。积累的记录为流程测试提供真实 fixture。

当积累导致列表超过一页时，通过 CRM 管理后台批量删除，并在 `wiki/log.md` 记录清理日期，不要在测试代码里加 afterEach 删除。

---

## 4. 测试数据规则

### 4.1 必须使用 faker-generator

Spec 或 Page Object 中禁止硬编码测试数据。始终调用 `data/faker-generator.ts` 中的 `generateFaker{Module}Data()`。

**原因：** 硬编码数据在第二次运行时因注册码、邮箱重复而失败。Faker generator 附加 6 字符随机后缀保证每次唯一。

```typescript
// ✅ 正确
const data = generateFakerLeadData();

// ❌ 错误
const data = { leadName: 'Test Lead', registrationCode: '2024010100001-ABCD' };
```

### 4.2 RANDOM vs 显式值

| 场景 | 使用 |
|---|---|
| 不关心具体选哪项 | `RANDOM` |
| 该值需要被断言或驱动后续行为 | 显式字符串 |
| 该字段控制另一字段的显示（条件字段） | 显式字符串（必须匹配触发值） |
| 测试某个特定下拉项 | 显式字符串 |
| `options: []`（动态加载）字段 | `RANDOM` 仍可用，FormEngine 选第一项 |

```typescript
source: RANDOM,          // 不关心
customerType: 'New Customer',  // TC-003 需要触发 customerName 出现
```

### 4.3 唯一性保证

`faker-generator.ts` 中唯一性后缀为 `faker.string.alphanumeric(6).toUpperCase()`，加在：

- Lead Name：`${company} — ${dealType} (${suffix})`
- Registration Code：`${YYYYMMDD}${random}-${suffix}`
- Email：嵌入域名随机词

新增实体时，有唯一键的字段必须用同样的后缀模式，不能只依赖时间戳（CI 中 1 秒内可能产生冲突）。

### 4.4 DEFAULT_XXX_DATA 常量

每个 registry 文件导出 `DEFAULT_XXX_DATA`，为常见可选字段提供 `RANDOM` 默认值。Page Object 的 `create{Module}()` 中合并：

```typescript
const formData: FormData = {
  ...DEFAULT_LEAD_DATA,  // source: RANDOM, leadLevel: RANDOM 等
  ...data,               // 调用者的覆盖优先
};
```

---

## 5. Locator 层级

### 5.1 优先级（FormEngine `_locateContainer` 执行顺序）

1. `[data-tid="<tid>"]` — 有就用。
2. `[data-testid="<testId>"]` — 无 `data-tid` 时用。
3. `.ele-xform-fieldset-wrap` + label 文本兜底 — 自动，不需要手写。
4. `input[placeholder*="..."]` — 仅 `text` 类型，最后手段。
5. 截图 + throw — 永远不要静默吞掉找不到的情况。

### 5.2 禁止使用的 locator 模式

| 禁止 | 原因 | 替代 |
|---|---|---|
| `:nth-child(N)` / `.nth(N)` （N > 0） | 行顺序变动即断 | `filter({ hasText: '已知文本' })` |
| 纯 CSS 类链 `.parent .child .grandson` | DOM 重构即断 | 容器 `data-tid` 范围内定位 |
| XPath 字符串 | 脆弱不可读 | `data-tid` |
| `page.locator('input').first()` 无过滤 | 匹配错误元素 | 作用域限定到 fieldset 或容器 |
| 动态 ID 如 `#react-select-3-input` | 每次渲染变化 | `data-tid` 或 ARIA role |
| Spec 层裸 locator | 违反四层边界 | 移入 Page Object 或 FormEngine |

### 5.3 下拉选项作用域

打开 `lui-select` 或 cascader 后，选项定位必须作用域在新打开的面板内，不能全局搜索——页面中残留的已关闭面板 DOM 会被全局 `.locator('.lui-select-item')` 匹配到：

```typescript
// ✅ 作用域在激活面板内
const panel = page.locator('.lui-select-dropdown').first();
const option = panel.locator('[role="option"]').filter({ hasText: value }).first();

// ❌ 全局作用域，会匹配残留的隐藏选项
const option = page.locator('.lui-select-item').filter({ hasText: value }).first();
```

### 5.4 Radio 按钮

始终点击 `.lui-radio-wrapper`（可见包装器），不点击隐藏的 `<input type="radio">`（pointer-events: none）：

```typescript
// ✅ 点可见包装器
const wrapper = container.locator('.lui-radio-wrapper').filter({ hasText: value }).first();
await wrapper.locator('.lui-radio').first().click({ force: true });

// ❌ 点隐藏 input（无效）
await page.locator('input[type="radio"][value="2"]').click();
```

---

## 6. 填写顺序

### 6.1 Registry 插入顺序即填写顺序

`fillForm(schema, data)` 按 `Object.entries(schema)` 插入顺序遍历字段。**控制字段必须在 Schema 对象中排在被控字段之前。**

```typescript
export const LEAD_SCHEMA: FormSchema = {
  leadName:     { ... },
  customerType: { ... },  // 控制字段——先填
  customerName: { ... },  // 条件字段——后填（customerType = 'New Customer' 后才可见）
  ...
};
```

### 6.2 必填字段先于可选字段

同一依赖组内，必填字段排在可选字段前，使必填字段失败更早暴露，诊断更清晰。

### 6.3 detail-table 最后

Schema 中 `detail-table` 类型字段被 FormEngine 跳过。Page Object 必须在 `fillForm()` 返回后单独填写，并在 `submitForm()` 前调用：

```typescript
async createLead(data: LeadData): Promise<FormResult & { leadId?: string }> {
  const result = await this.fillForm(LEAD_SCHEMA, formData);  // 跳过 principalAllocation
  await this.fillPrincipalAllocationTable();                   // detail-table 最后
  await this.dismissAnyOpenModal();
  await this.submitForm();
  ...
}
```

### 6.4 进入 detail-table 前关闭下拉

`lui-select` 下拉有时在选完后仍留在 DOM 中。调用 `fillPrincipalAllocationTable()` 前必须关闭所有残留下拉，否则表格格元格的点击会被拦截。

```typescript
private async _closeSalesPipelineDropdown(): Promise<void> {
  const overlays = [
    '.lui-select-dropdown:visible',
    '.lui-popup:visible',
    '.lui-cascade-panel:visible',
  ];
  for (const sel of overlays) {
    if (await this.page.locator(sel).first().isVisible({ timeout: 500 }).catch(() => false)) {
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(800);
    }
  }
}
```

---

## 7. 断言策略

### 7.1 TC-001 中的硬失败 vs 软失败

**硬失败**（立即停止测试）：
- `navigateToCreate()` 失败
- `fillForm()` 因字段找不到而 throw
- `submitForm()` 失败（按钮找不到、返回了校验错误）

**软失败**（收集到数组，最后统一 throw）：
- `verifyXxxInList()` 失败——记录可能在结果的其他页，或搜索不可靠，不代表记录未创建

```typescript
// 硬失败——无 try/catch，直接 throw
const result = await formPage.createLead(data);

// 软失败——收集，不立即 throw
await formPage.verifyLeadInList(leadName).catch((err: Error) => {
  failures.push(`[iter ${i}] ${err.message}`);
  logger.warn(`List verification failed: ${err.message}`);
});
```

### 7.2 各层的断言职责

**Layer 1（Registry）：** 无断言，只有数据。

**Layer 2（FormEngine）：** 字段找不到时 throw + 截图，不用 `expect()`。

**Layer 3（Page Object）：** 仅用 `expect()` 做**基础设施断言**（对所有测试用例都成立的不变量）：
- `assertSaveSuccess()` — URL 已离开 `/add/` 或出现成功 toast
- `assertFieldVisible(key)` — 给定 schema key 的元素可见
- `assertDefaultRadioSelected(key, value)` — 给定 radio 选项带有 `checked` 样式

**Layer 4（Spec）：** 用 `expect()` 做**业务结果断言**：
- `expect(result.leadId).toBeTruthy()`
- `expect(result.leadName).toBe(data.leadName)`

### 7.3 RANDOM 解析值断言

RANDOM 解析后的实际值在 `FormResult` 中返回，可做更精确的断言：

```typescript
const sourceOptions = ['Search Engine', 'Customer Referral', 'Conference', ...];
expect(sourceOptions).toContain(result.source);
// 优于只写 expect(result.source).toBeTruthy()
// 能捕获 FormEngine 因残留 DOM 选到意外值的情况
```

### 7.4 TC-B002：必填校验测试模式

Page Object 需要一个专用方法，提交表单后期待校验错误而非成功：

```typescript
// 在 Page Object 中：
async submitAndExpectValidationError(): Promise<string> {
  await this.submitForm();
  const errEl = this.page
    .locator('[class*="validation"], [class*="error"]')
    .filter({ hasText: /cannot be empty|required|必填/i })
    .first();
  await errEl.waitFor({ state: 'visible', timeout: 8000 });
  return ((await errEl.textContent()) ?? '').trim();
}

// Spec TC-B002 中：
test('TC-B002: Missing Lead Name shows validation error', async () => {
  await formPage.fillForm(LEAD_SCHEMA, {
    customerType: 'New Customer',
    customerName: data.customerName,
    registrationCode: data.registrationCode,
    // leadName 故意省略
  });
  const errMsg = await formPage.submitAndExpectValidationError();
  expect(errMsg).toMatch(/Lead Name|cannot be empty/i);
});
```

注意：不要修改 `BasePage.submitForm()` 来支持这个场景，新增独立方法。

---

## 8. CRM 专项模式

### 8.1 网络遮罩（#__network-tips）

CRM 在慢速网络下随机弹出全页遮罩拦截所有点击。在以下时机调用 `handleNetworkTipsOverlay()`：

- 每次 `navigateToCreate()` / `navigateToList()` 之后
- 点击保存按钮之前
- 页面 reload 之后

无遮罩时方法立即返回，预防性调用安全且廉价。

### 8.2 窗口自关闭表单（Contact 模式）

Contact 表单保存后调用 `window.close()`，页面变为 `about:blank`，无法在同一 page 实例上验证。

模式：把 `BrowserContext` 传入 Page Object 构造函数；保存后检测 `about:blank`，从 context 新开页面验证：

```typescript
// beforeEach（contact spec）：
contactPage = new ContactCreatePage(page, logger, context);

// ContactCreatePage.verifyContactInList()：
if (this.page.url() === 'about:blank' && this.context) {
  const verifyPage = await this.context.newPage();
  // 在 verifyPage 上导航并验证
  await verifyPage.close();
}
```

任何 CRM 表单有 `window.close()` 行为的模块，都必须遵循此模式。

### 8.3 about:blank 瞬态重定向

即使表单不调用 `window.close()`，CRM SPA 导航也可能产生短暂 `about:blank`。ID 提取逻辑必须处理：

```typescript
let leadId = this._extractIdFromUrl();
if (!leadId && this.page.url() === 'about:blank') {
  await this.page.waitForURL(u => u.href !== 'about:blank', { timeout: 8000 }).catch(() => {});
  if (this.page.url() !== 'about:blank') leadId = this._extractIdFromUrl();
}
```

### 8.4 Cascader：可搜索 vs 不可搜索

CRM 有两种 cascader 变体，FormEngine 通过检测页面是否出现 `"No relevant content was searched"` 自动判断。无需测试代码处理，记录于此供理解和排障。

| 变体 | 行为 | FormEngine 处理 |
|---|---|---|
| 可搜索 | 需要先输入文字才显示选项 | 向搜索框输入 `optionText`，等待结果 |
| 不可搜索 | 选项立即出现 | 等待 `.lui-cascade-item-content-label:visible`，点击匹配项 |

### 8.5 关联记录 Modal（Select Record）

关联字段打开一个含记录列表的 Modal：

1. 点击 fieldset 内的 `.lui-select-selector`（不是隐藏的 `input[type="search"]`）
2. 等待 `.lui-modal-content` 可见
3. 优先点击行内 `checkbox` 或 `radio`，兜底点整行
4. 点击 `.lui-modal-footer` 内的主按钮，接受文本：`Confirm / OK / 确认 / Insert`
5. 等待 Modal `hidden`

Principal Allocation Modal 中的产品记录是账号范围的。默认账号（`soo`）下 Modal 可能为空，`Yuwin` 账号下有产品记录。需优雅处理：

```typescript
if (!hasRows || firstRowText.includes('Lead Stage')) {
  logger.warn('No valid products — skipping. Run with ACCOUNT_USERNAME=Yuwin for products.');
  await page.keyboard.press('Escape');
  return;
}
```

### 8.6 Promise.race 提交陷阱

`submitForm()` 并发等待三个信号（toast、URL 重定向、校验错误）。**必须在 `Promise.race()` 前给所有分支加 `.catch(() => {})`**，否则失败分支在 Node 15+ 产生 unhandled rejection 崩溃进程：

```typescript
toastP.catch(() => {});
redirectP.catch(() => {});
const outcome = await Promise.race([toastP, redirectP]);
```

新增第四个 race 分支时同样必须加 `.catch(() => {})`。

### 8.7 Frame 感知填写

某些 CRM 新建表单在 `<iframe>` 内渲染。FormEngine 的 `resolveFormFrame()` 先探测 main page，再遍历所有 frame。在 `navigateToCreate()` 中的表单加载后必须调用：

```typescript
async navigateToCreate(): Promise<void> {
  await this._navigateWithRetry(CREATE_URL);
  await this.handleNetworkTipsOverlay();
  await this._waitForFormReady();
  await this.resolveFormFrame();  // 设置 formFrame，后续所有 fillField() 使用它
}
```

---

## 9. 维护工作流

### 9.1 DOM 变更 5 分钟检查清单

```bash
# Step 1: 运行冒烟测试，找到哪个字段报错
npx playwright test tests/{module}-form.spec.ts --grep "TC-001" 2>&1 | grep "FormEngine"
# 输出示例：[FormEngine] Cannot locate field "Source"

# Step 2: 打开该模块的 registry 文件
# "Cannot locate field 'Source'" → 打开 pages/registry/lead.fields.ts
# 找到 source 的 FieldDef

# Step 3: 用真实浏览器打开 CRM 表单（HEADLESS=false）
# F12 → 右键目标字段 → Inspect
# 复制 data-tid 属性值

# Step 4: 修改 registry（一行）
# tid: 'ef-fs-fd_source-v2-desktop',  // updated 2026-04-24 — CRM upgrade

# Step 5: 重跑验证
npx playwright test tests/{module}-form.spec.ts --grep "TC-001"
```

预期耗时：5 分钟。超时则说明根因不是 tid 变化，可能是字段类型变更。

### 9.2 字段类型变更（cascade → lui-select）

1. 更新 registry 中的 `type`
2. 更新 `options`（如果选项列表也变了）
3. 不修改 `FormEngine.ts`（除非是新类型 FormEngine 不支持）
4. 若真是新类型：在 `field.types.ts` 的 `FieldType` 中添加，在 `fillField()` 中添加 case，在 `FormEngine.ts` 中实现 handler

### 9.3 Schema 完整性检查（手动）

目前没有自动化检查 registry 是否覆盖表单全部字段。新增模块时，用 explore spec 对比：

```bash
HEADLESS=false npx playwright test tests/explore-{module}.spec.ts
```

explore spec 输出所有可见 `data-tid`。explore 输出中有但 registry 中没有的，加 `skip` 类型占位：

```typescript
unknownField: {
  label: 'Unknown Field',
  tid: 'comp-fd_some_unknown--input',
  type: 'skip',     // 尚未测试；加此占位防止静默遗漏
  required: false,  // TODO: 确认正确 type 和 options — 发现于 YYYY-MM-DD
},
```

### 9.4 新增实体完整清单

新增 CRM 表单支持（如 Quote）时：

1. 运行 `explore-{module}.spec.ts` 获取所有 `data-tid` 和字段类型
2. 创建 `pages/registry/{module}.fields.ts`（含 SCHEMA 和 DEFAULT_DATA）
3. 创建 `pages/{Module}FormPage.ts`（extends FormEngine），实现 `navigateToCreate()` / `create{Module}()` / `verify{Module}InList()`
4. 在 `data/faker-generator.ts` 追加 `generateFaker{Module}Data()`
5. 创建 `tests/{module}-form.spec.ts`（遵循 TC-001/002/003/B 骨架）
6. 在 `wiki/entities/{module}.md` 记录字段和选项，更新 `wiki/index.md`

有 `window.close()` 行为时，步骤 3 遵循 Contact 模式；有 detail-table 时在 `fillForm()` 返回后单独处理。

---

## 10. Prompt 模板使用指南

### 10.1 模板选择

| 场景 | 使用模板 |
|---|---|
| 全新表单模块（Quote、SO 等首次添加测试） | Template 1 |
| 现有 Page Object 追加业务流程步骤（Follow-up、转化） | Template 2 |
| CRM 升级导致 `data-tid` 失效，单个字段报错 | Template 3 |
| 测试失败，需要根因诊断和最小修复 | Template 4 |
| 不知道用哪个 | Template 1 + Template 0 前缀 |

所有 prompt 前必须加 Template 0（强制约束）。

### 10.2 Template 1 字段表格式

字段表是 Template 1 的关键输入。从 explore spec 输出或 DevTools 直接填写，不要留空让 AI 探索（浪费 token，且会产生幻觉 tid）：

```
| Field | data-tid | Type | Required | Options |
|-------|----------|------|----------|---------|
| Opportunity Name | comp-fd_name--input | text | Yes | — |
| Deal Category | ef-fs-fd_deal_category-desktop | cascade | No | PKI, OTP, ADSS... |
| Sales Pipeline | ef-fs-fd_opportunity_stage-desktop | lui-select | No | (dynamically loaded) |
```

### 10.3 Template 1 条件字段扩展

字段表中加 "Notes" 列描述依赖关系，并在 prompt 末尾附加：

```
[Conditional fields]
- customerName field only appears when customerType = 'New Customer'
- In the schema, customerType MUST be listed before customerName
- TC-003 must assert that switching to 'New Customer' makes the Customer input visible
- TC-003 must NOT use page.locator() — use formPage.assertFieldVisible('customerName')
```

### 10.4 Template 3 预期输出格式

AI 修复 registry 时，输出必须是：

```
File: pages/registry/{form}.fields.ts
Before:
  tid: 'ef-fs-fd_source-desktop',
After:
  tid: 'ef-fs-fd_source-v2-desktop',  // updated YYYY-MM-DD — CRM upgrade
Reason: CRM upgrade renamed fieldset data-tid.
```

若 AI 输出了全文件重写、修改了测试代码或生成了 explore 脚本，拒绝并用 Template 0 重新约束。

### 10.5 Template 4 诊断顺序

使用 Template 4 时必须提供：
1. 完整错误信息（从终端复制，不要意译）
2. `reports/logs/` 下测试日志文件的最后 50 行
3. FormEngine 保存的 debug 截图路径（如有）

AI 诊断顺序：
1. 字段找不到？→ 检查 registry tid
2. 超时？→ 检查 `waitFor` 超时，是否需要 `handleNetworkTipsOverlay()`
3. 竞态条件？→ 检查失败步骤前是否有 modal/overlay 未关闭
4. 数据问题？→ 检查 faker-generator 输出是否符合 CRM 校验规则

---

## 附录：快速参考卡

### 新增实体文件映射

```
pages/registry/{module}.fields.ts   → Layer 1 — DOM 变更时改这里
pages/{Module}FormPage.ts           → Layer 3 — 表单行为变更时改这里
data/faker-generator.ts             → 追加 generate{Module}Data()
tests/{module}-form.spec.ts         → Layer 4 — 测试场景变更时改这里
wiki/entities/{module}.md           → 创建后记录字段文档
```

### Locator 速查表

```
data-tid             → 始终优先
data-testid          → 无 data-tid 时用
fieldset + label     → 自动兜底（无需手写）
input[placeholder]   → text 字段最后手段
.nth(N)  N>0         → 禁止
XPath                → 禁止
纯 CSS 类链           → 禁止
Spec 层裸 locator    → 禁止
```

### CRM Typo 字典（截至 2026-04-24）

| 字段 | 写 | 期望写法 | 实体 |
|---|---|---|---|
| Details textarea | `comp-fd_remark--teaxtarea` | `--textarea` | Lead/Contact/Customer |
| Scope textarea | `comp-fd_scope--teaxtarea` | `--textarea` | Customer |
| Radio 按钮 | `--raido-1` / `--raido-2` | `--radio-1` | Lead customerType, Contact gender |
| 估算金额 | `fd_prodcut_amt-{N}-...` | `fd_product_amt` | Lead Principal Allocation |
| Contact 地址 | `comp-fd_add--input` | `comp-fd_address--input` | Contact |

### TC-001 完成检查单

新模块 TC-001 完成前确认所有项：

- [ ] `generateFaker{Module}Data()` 存在，每次调用产生唯一值
- [ ] `result.{primaryId}` 断言为 truthy
- [ ] `verify{Module}InList()` 用软失败模式（不是硬 `await expect`）
- [ ] Spec 体内无 `page.locator()` 调用
- [ ] `DEFAULT_{MODULE}_DATA` 在 `create{Module}()` 内合并，不在 Spec 内
- [ ] `navigateToCreate()` 在 `beforeEach` 中，不在测试体内
- [ ] 支持 `REPEAT` 环境变量进行批量创建
- [ ] 限流延迟（`page.waitForTimeout(10000)`）在 repeat 循环内，不在 `beforeEach` 中
