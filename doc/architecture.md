# 架构设计文档

> 详细架构规范。开发新功能、理解代码结构时阅读本文。

## Schema 驱动架构

### 核心价值

**探查一次，持久化，多次使用。**

### 数据流

```
用户输入（极简 URL）
    ↓
FormTestBuilder → SchemaGenerator → FillerFactory
    ↓           ↓                    ↓
 测试构建    探查/加载模型          填充表单
    ↓
DetailTableBuilder → DetailRowFiller  (明细表)
    ↓
FormSubmitHelper → 提交表单
```

### 组件职责

| 组件 | 职责 | 文件位置 |
|------|------|---------|
| `SchemaGenerator` | DOM 探查生成 Schema，支持加载/保存 JSON | `src/schema/` |
| `SchemaRepository` | Schema 文件持久化（save/load） | `src/schema/` |
| `FieldTypeDetector` | 字段类型检测逻辑 | `src/schema/` |
| `FormTestBuilder` | 主表测试构建器，提供简洁 API | `src/core/` |
| `DetailTableBuilder` | 明细表构建器，处理行增删/填充 | `src/core/` |
| `DetailRowFiller` | 明细表行填充器 | `src/core/` |
| `FormSubmitHelper` | 表单提交工具 | `src/core/` |
| `SelfHealingTestBuilder` | 自愈测试构建器（重试+经验恢复） | `src/core/` |
| `FillerFactory` | 工厂模式，根据 fdType 创建 Filler | `src/filler/` |
| `BaseFiller` | Filler 基类，提供通用能力 | `src/filler/` |
| `ExperienceDatabase` | Filler 经验持久化存储 | `src/experience/` |

---

## 目录结构

```
crm-test-securemetric/
├── config/                          # Playwright 配置 + Global Setup
│   ├── environments.ts              # 环境配置（URL、账号等）
│   ├── playwright.config.ts         # 基础配置
│   ├── playwright.sp3test.config.ts # SP3Test 配置
│   ├── playwright.test.config.ts    # EasyCraft test 配置
│   ├── playwright.securemetric-crm.config.ts # CRM 配置
│   ├── global-setup.ts              # 全局登录 (test)
│   ├── global-setup-sp3test.ts      # 全局登录 (sp3test)
│   └── global-setup-securemetric-crm.ts # 全局登录 (CRM)
│
├── scripts/                         # 构建和工具脚本
│   ├── build.sh                     # MK Widget 打包
│   ├── deploy-widget.sh             # Widget 部署
│   ├── generate-schema.ts           # Schema 生成
│   └── capture-config.ts            # 配置捕获工具
│
├── src/
│   ├── schema/                      # Schema 相关（核心）
│   │   ├── SchemaGenerator.ts       # DOM 探查生成 Schema
│   │   ├── SchemaRepository.ts      # Schema 文件持久化
│   │   └── FieldTypeDetector.ts     # 字段类型检测
│   │
│   ├── filler/                      # 表单填充相关（核心）
│   │   ├── BaseFiller.ts            # Filler 基类
│   │   ├── FdInputFiller.ts         # 单行文本
│   │   ├── TextareaFiller.ts        # 多行文本
│   │   ├── RadioFiller.ts           # 单选
│   │   ├── CheckboxFiller.ts        # 多选
│   │   ├── SelectFiller.ts          # 下拉（单选+多选）
│   │   ├── TimestampFiller.ts       # 日期
│   │   ├── TimepickerFiller.ts      # 时间
│   │   ├── NumbertextFiller.ts      # 数值
│   │   ├── MoneytextFiller.ts       # 金额
│   │   ├── CfgFiller.ts             # 基础数据
│   │   ├── RelationFiller.ts        # 业务关联
│   │   ├── DynamicFiller.ts         # 动态控件
│   │   ├── AddressFiller.ts         # 通讯录选人
│   │   ├── AgencyFiller.ts          # 组织架构选人
│   │   └── FillerFactory.ts         # Filler 工厂
│   │
│   ├── core/                        # 核心组件
│   │   ├── FormTestBuilder.ts       # 主表测试构建器
│   │   ├── DetailTableBuilder.ts    # 明细表构建器
│   │   ├── DetailRowFiller.ts       # 明细表行填充器
│   │   ├── FormSubmitHelper.ts      # 表单提交工具
│   │   └── SelfHealingTestBuilder.ts # 自愈测试构建器
│   │
│   ├── experience/
│   │   └── ExperienceDatabase.ts    # Filler 经验持久化
│   │
│   ├── schemas/                     # ⚠️ Schema 存储路径（非根目录 schemas/）
│   │   ├── sp3test/                 # SP3Test Schema 文件
│   │   ├── test/                    # EasyCraft test Schema 文件
│   │   └── Securemetric-CRM/        # CRM Schema 文件
│   │       └── {module}/            # 按模块分目录
│   │
│   └── index.ts                     # 框架统一导出
│
├── tests/
│   ├── sp3test/                     # SP3Test 环境测试
│   ├── test/                        # EasyCraft test 环境测试
│   └── Securemetric-CRM/            # CRM 环境测试
│       ├── base/                    # 基础模块测试
│       └── manual/                  # 用户手册截图 spec
│
├── doc/
│   ├── test-cases/
│   │   ├── excel/                   # Excel 测试用例
│   │   └── *.md                     # Markdown 测试用例
│   ├── architecture.md              # 本文档
│   ├── coding-standards.md          # 编码规范
│   └── ai-collaboration.md          # AI 协作守则
│
├── wiki/                            # Wiki 知识库（CRM 手册）
├── data/                            # 数据生成器
├── .trae/                           # Trae 规则
└── .claude/                         # Claude Agent 配置
```

---

## Schema 存储路径

> **重要**：Schema 必须存储在 `src/schemas/{env}/`，禁止放在根目录 `schemas/`。

| 环境 | 路径格式 |
|------|---------|
| SP3Test | `./src/schemas/sp3test/{formId}.json` |
| EasyCraft test | `./src/schemas/test/{formId}.json` |
| Securemetric CRM | `./src/schemas/Securemetric-CRM/{module}/{formId}.json` |

---

## Filler 工厂模式

```typescript
// FillerFactory 根据 fdType 创建对应的 Filler
const filler = FillerFactory.create(page, formId, field);
await filler.fill();
```

### fdType → Filler 映射表

| CRM fdType | Filler 类 | 说明 |
|-----------|----------|------|
| `fd_input` | `FdInputFiller` | 单行文本 |
| `textarea` | `TextareaFiller` | 多行文本 |
| `radio` | `RadioFiller` | 单选框 |
| `checkbox` | `CheckboxFiller` | 多选框 |
| `select` | `SelectFiller` | 下拉单选 |
| `select~multi` | `SelectFiller` | 下拉多选 |
| `timestamp` | `TimestampFiller` | 日期选择 |
| `timepicker` | `TimepickerFiller` | 时间选择 |
| `numbertext` | `NumbertextFiller` | 数值输入 |
| `moneytext` | `MoneytextFiller` | 金额输入 |
| `cfg` | `CfgFiller` | 基础数据（单选） |
| `cfg~multi` | `CfgFiller` | 基础数据（多选） |
| `relation` | `RelationFiller` | 业务关联 |
| `dynamic` | `DynamicFiller` | 动态控件 |
| `address` | `AddressFiller` | 通讯录选人 |
| `agency` | `AgencyFiller` | 组织架构选人 |

### 新增字段类型流程

必须同步以下 3 个文件：
1. 创建新的 Filler 类（继承 `BaseFiller`）→ `src/filler/XxxFiller.ts`
2. 在 `FillerFactory` 中注册 → `src/filler/FillerFactory.ts`
3. 在 `src/index.ts` 中导出

---

## 架构优势

| 优势 | 说明 |
|------|------|
| **探查一次，多次使用** | Schema 生成后保存为 JSON，后续直接加载 |
| **工厂模式** | 新增字段类型只需新增 Filler 类，无需修改现有代码 |
| **组件化** | 每个 Filler 独立负责一种字段类型，易于维护 |
| **可调试** | Schema 文件可手动编辑，便于排查问题 |
| **自愈能力** | SelfHealingTestBuilder + ExperienceDatabase 实现跨运行经验积累 |

---

## 已实现模块状态

| 模块 | 状态 |
|------|------|
| SchemaGenerator / Repository / FieldTypeDetector | ✅ |
| FormTestBuilder / DetailTableBuilder / DetailRowFiller | ✅ |
| FormSubmitHelper / SelfHealingTestBuilder | ✅ |
| 所有 Filler（17 种 fdType） | ✅ |
| FillerFactory / ExperienceDatabase | ✅ |
| Global Setup（3 环境） | ✅ |
