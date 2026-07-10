# 编码规范

> TypeScript、DOM 定位、测试文件编写规范。写代码或写 spec 时阅读本文。

## TypeScript 规范

### 异常处理

**强制使用** `catch (error: unknown)` + 类型守卫：

```typescript
// ✅ 正确
try {
  await something();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
}

// ❌ 错误：裸 catch 直接访问 .message
try {
  await something();
} catch (error) {
  console.error(error.message); // TS 错误
}
```

### 类型检查门槛

- `npx tsc --noEmit` **必须零错误**，提交前必跑
- 类型定义在 `SchemaGenerator.ts` 中（`FormSchema`, `FormField`）
- `src/index.ts` 只能导出实际存在的类型和类

### 环境变量

通过环境变量注入，硬编码仅作 fallback 默认值：

| 变量 | 用途 | 默认值 |
|------|------|--------|
| `EASYCRAFT_URL` | EasyCraft 基础 URL | `https://test.easycraft.ai` |
| `EASYCRAFT_USERNAME` | EasyCraft 用户名 | - |
| `EASYCRAFT_PASSWORD` | EasyCraft 密码 | - |
| `CRM_USER` | CRM 用户切换 | `edward` |

---

## DOM 定位规则

EasyCraft 使用两套定位属性：

| 属性 | 格式 | 示例 |
|------|------|------|
| `data-id` | "表名.字段名" | `km_test.fd_name` |
| `data-tid` | "comp-{字段代码}--{控件类型}" | `comp-fd_name--input` |

### 选择器优先级

```
data-tid → id → name → label
```

### 关键选择器速查

| 用途 | 选择器 |
|------|--------|
| 字段容器 | `.ele-xform-fieldset-wrap[data-id="{formId}.{fieldId}"]` |
| 字段标签 | `.ele-xform-fieldset-label-title-align` |
| 必填标记 | `.ele-xform-fieldset-label-required` |
| 控件容器 | `.ele-xform-fieldset-control-wrap` |
| 表单操作栏 | `.ele-cru-layout-header` |
| 下拉面板 | `.lui-select-dropdown` |
| 单选/多选选项文字 | `label.lui-radio-wrapper > span:last-child` |
| 通讯录弹窗 | `.ele-address` |
| 组织弹窗 | `.km-agency-input-search-select-*` |

### 禁止事项

- ❌ 硬编码 CSS Selector 定位具体字段
- ❌ 硬编码 XPath
- ❌ 修改被测系统的 DOM 结构
- ❌ 所有定位必须通过 data-id/data-tid 或 SchemaGenerator 自动探查

---

## 测试文件规则

### spec 职责边界

**只允许**：
- 配置 FormTestBuilder → `initialize()` → `navigate()` → `fillAllFields()` / `fillField()` → `submit()` → 断言 + 截图

**不允许**：
- 内联探查逻辑
- 内联数据生成
- 直接 DOM 操作（`page.locator().fill()` 操作表单字段）
- 写新的登录逻辑（用全局 global-setup）

### 测试文件注释模板

每个 spec 文件头部必须包含：

```typescript
/**
 * 测试名称
 *
 * 测试目标: <表单完整URL>
 * 表单ID: <formId>
 * 明细表ID: <detailTableId> (如有)
 * 环境: <SP3Test / EasyCraft test / Securemetric CRM>
 *
 * 启动命令:
 *   npm run test:<env>:<name>
 *   npm run test:<env> -- --grep "<关键字>"
 *
 * 批量执行示例:
 *   CRM_USER=edward npx playwright test --config=config/xxx.config.ts tests/path/to/spec.ts --repeat-each 5
 *
 * 测试内容:
 *   1. <测试点1>
 *   2. <测试点2>
 */
```

### 命名约定

| 类型 | 格式 | 示例 |
|------|------|------|
| 测试文件 | `<功能>.spec.ts` | `base.spec.ts`, `crm-lead.spec.ts` |
| 测试套件 | `<环境> — <功能描述>` | `SP3Test — 基础控件测试` |
| 测试用例 | 清晰场景描述 | "新建联系人表单并提交" |

### 批量执行规范

- **禁止在代码中硬编码循环次数**
- ✅ 用 Playwright 的 `--repeat-each N` 参数控制执行次数
- ✅ 无头模式：`HEADLESS=true npx playwright test ... --repeat-each 10`
