# AI 协作守则

> Agent 规则、禁止模式、提交清单、常见问题。AI 协作或调试时阅读本文。

## Playwright Test Agents

项目已集成 Playwright Test Agents（v1.56+），Claude Code 环境下可用。

### 可用 Agent

| Agent | 用途 | 推荐 |
|-------|------|------|
| Healer | 修复失败的测试 | ✅ **唯一推荐** |
| Planner | 生成测试计划 | ❌ 与架构不兼容 |
| Generator | 生成测试代码 | ❌ 与架构不兼容 |

### Healer 使用规则

1. **只在正确层级修复**：
   - Filler bug → `src/filler/XxxFiller.ts`
   - Schema 问题 → `src/schema/SchemaGenerator.ts` 或 `FieldTypeDetector.ts`
   - 测试配置 → `tests/sp3test/` 或 `tests/test/` 或 `tests/Securemetric-CRM/`
   - 框架 bug → `src/core/`

2. **禁止行为**：
   - 在 spec 中添加 `page.locator().fill()` 绕过 FormTestBuilder
   - 绕过 FillerFactory 进行字段操作
   - 硬编码 CSS Selector
   - 引入 `waitFor('networkidle')`（已废弃）

3. **认证上下文**：`tests/test/seed.spec.ts` 提供 Healer 的认证页面上下文

4. **更新 Agent 定义**：Playwright 版本更新后执行 `npx playwright init-agents --loop=claude`

---

## 禁止引入的依赖和模式

| 禁止项 | 原因 | 替代方案 |
|--------|------|---------|
| AI 视觉定位 / 运行时 LLM | 更慢更贵更不稳定 | data-id/data-tid |
| Page Object Model (POM) | FormTestBuilder 已实现同等抽象 | FormTestBuilder |
| Cypress / Selenium | 已锁定 Playwright 技术栈 | Playwright |
| 手写 Schema 文件 | SchemaGenerator 自动生成 | SchemaGenerator |
| 运行时 LLM API 依赖 | 测试必须确定性可重复 | 静态数据 |
| `waitFor('networkidle')` | 已废弃且不可靠 | `waitForSelector` 等 |

---

## 提交前检查清单

提交代码前必须逐项确认：

1. [ ] `npx tsc --noEmit` **零错误**
2. [ ] 新增字段类型已同步 3 个文件（Filler / Factory / index.ts 导出）
3. [ ] spec 无内联探查/数据生成/DOM 操作逻辑
4. [ ] 环境变量有 fallback 默认值
5. [ ] `catch (error: unknown)` 模式统一
6. [ ] `src/index.ts` 导出的类型实际存在
7. [ ] 根目录无违规文件（对照白名单）

---

## 常见问题

### Schema 生成失败

确保表单页面完全加载，`.ele-xform-fieldset-wrap` 存在。

### 字段填充失败

检查 `fdType` 是否正确，对应 Filler 是否已实现。

### Schema 路径错误

Schema 必须在 `./src/schemas/{env}/`，不是根目录 `schemas/`。

### 登录失败

检查 `config/global-setup*.ts` 中的选择器是否匹配当前登录页面。

### TypeScript 编译错误（非本次引入）

以下为已知的历史问题，与近期变更无关：
- `FormSubmitHelper.ts(140)` → `"enabled"` 类型不匹配
- 部分旧 spec 文件的类型问题

---

## 用户手册测试特殊规则

### 默认账号

所有用户手册 spec 使用 **Edward 账号**（`CRM_USER=edward`），不可更换。

### 步骤限制

- 步骤 ≤ 4，Step 1 必须是模块入口（列表页+左侧导航可见）
- 表单填充为一个步骤

### 唯一字段处理

Mobile / Email 等系统唯一字段必须用时间戳值：

```ts
const ts = Date.now().toString()
data.mobile = `011${ts.slice(-7)}`
data.email  = `contact${ts.slice(-10)}@securemetric-test.com`
```

### 输出路径

`src/widget/km-ltc-manual-securemetric/docs/manual/{N}-{module}/`
