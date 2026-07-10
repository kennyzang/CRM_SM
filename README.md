# CRM 黑盒回归测试框架

基于 Playwright 的 Schema-Driven 自动化测试框架，支持动态表单字段探查、智能数据填充，覆盖 EasyCraft CRM 多个部署环境。

## 特性

- **Schema-Driven**: 自动探查页面 DOM 结构生成 JSON Schema，探查一次，多次复用
- **智能填充**: 基于字段类型自动填充随机测试数据（支持 16 种 fdType）
- **组件化设计**: 独立的 Filler 组件处理不同字段类型，开闭原则
- **自愈测试**: SelfHealingTestBuilder 提供重试 + ExperienceDatabase 经验学习
- **多环境支持**: SP3Test、EasyCraft test、Securemetric CRM 三个环境
- **用户手册**: 自动生成双语（EN/ZH）操作手册静态站点
- **知识库 Wiki**: 48 个页面覆盖 12 个业务实体，支持 MCP 检索

## 快速开始

```bash
npm install
npx playwright install
npm test
```

## 运行命令

```bash
# 按环境运行（执行该环境下所有 spec）
npm run test:sp3test              # SP3Test
npm run test:test                 # EasyCraft test
npm run test:crm                  # Securemetric CRM

# 单个 spec（无需 per-spec 启动脚本）
npx playwright test --config=config/playwright.sp3test.config.ts tests/sp3test/base.spec.ts

# 通用
npm run test:headed               # 可见浏览器
npm run test:debug                # Playwright 调试模式
npm run test:ui                   # Playwright UI 模式
npm run report                    # 查看报告

# Wiki 知识库
npm run wiki:docs                 # 重新生成 HTML 文档站
```

## 多环境支持

| 环境 | 配置文件 | 命令前缀 | 基础 URL |
|------|---------|---------|----------|
| SP3Test | `config/playwright.sp3test.config.ts` | `test:sp3test:*` | `https://sp3test.landray.com.cn` |
| EasyCraft test | `config/playwright.test.config.ts` | `test:test:*` | `https://test.easycraft.ai` |
| Securemetric CRM | `config/playwright.securemetric-crm.config.ts` | `test:crm:*` | `https://crm.securemetric.com` |

## 项目结构

```
src/
├── schema/
│   ├── SchemaGenerator.ts      # DOM 探查生成 Schema
│   ├── SchemaRepository.ts     # Schema 文件持久化（加载/保存）
│   └── FieldTypeDetector.ts    # 字段类型检测逻辑
├── filler/
│   ├── BaseFiller.ts           # Filler 基类
│   ├── FdInputFiller.ts        # fd_input（单行文本）
│   ├── TextareaFiller.ts       # textarea（多行文本）
│   ├── RadioFiller.ts          # radio（单选框）
│   ├── CheckboxFiller.ts       # checkbox（多选框）
│   ├── SelectFiller.ts         # select / select~multi（下拉）
│   ├── TimestampFiller.ts      # timestamp（日期）
│   ├── TimepickerFiller.ts     # timepicker（时间）
│   ├── NumbertextFiller.ts     # numbertext（数值）
│   ├── MoneytextFiller.ts      # moneytext（金额）
│   ├── CfgFiller.ts            # cfg / cfg~multi（基础数据）
│   ├── RelationFiller.ts       # relation（业务关联）
│   ├── DynamicFiller.ts        # dynamic（动态控件）
│   ├── AddressFiller.ts        # address（通讯录选人）
│   ├── AgencyFiller.ts         # agency（组织架构选人）
│   └── FillerFactory.ts        # Filler 工厂
├── core/
│   ├── FormTestBuilder.ts          # 主表测试构建器
│   ├── DetailTableBuilder.ts       # 明细表构建器
│   ├── DetailRowFiller.ts          # 明细表行填充器
│   ├── FormSubmitHelper.ts         # 表单提交工具
│   ├── SelfHealingTestBuilder.ts   # 自愈测试构建器（重试 + 经验学习）
│   └── SmartFillerFactory.ts       # AI 辅助 Filler 发现
├── experience/
│   └── ExperienceDatabase.ts   # Filler 成功/失败经验持久化存储
├── mock/
│   ├── MockDatabase.ts         # 测试数据 Mock
│   └── MalaysiaMockData.ts     # 马来西亚本地化数据
├── utils/
│   └── DataGenerator.ts        # 随机数据生成
├── schemas/
│   ├── sp3test/                # SP3Test Schema
│   ├── test/                   # EasyCraft test Schema
│   └── Securemetric-CRM/       # Securemetric CRM Schema
│       └── base/               # 基础模块 Schema
└── index.ts                    # 公共 API 导出

tests/
├── sp3test/                    # SP3Test 环境测试
│   ├── base.spec.ts            # 基础控件测试
│   ├── cfg.spec.ts             # 基础数据(Cfg)测试
│   ├── relation.spec.ts        # 业务关联测试
│   └── hybrid.spec.ts          # 混合模式（Midscene AI）
├── test/                       # EasyCraft test 环境测试
│   ├── base.spec.ts            # 基础控件测试
│   ├── relation.spec.ts        # 业务关联测试
│   └── seed.spec.ts            # Playwright Agent 认证
└── Securemetric-CRM/           # Securemetric CRM 测试
    ├── base/
    │   └── crm-lead.spec.ts    # CRM 线索表单测试
    └── manual/                 # 用户手册截图 spec

config/
├── playwright.sp3test.config.ts          # SP3Test 配置
├── playwright.test.config.ts             # EasyCraft test 配置
└── playwright.securemetric-crm.config.ts # Securemetric CRM 配置

wiki/                           # 知识库（48 页，12 个业务实体）
├── index.md
├── entities/                   # 实体文档
├── user-manuals/               # 双语操作手册（EN/ZH）
└── docs/output/                # 生成的 HTML 静态站

src/widget/
└── km-ltc-manual-securemetric/ # 用户手册 Portal 组件
    └── docs/public/            # 独立文档站（index.html）
```

## 核心架构

### FormTestBuilder

测试构建器，提供简洁的 API：

```typescript
const builder = new FormTestBuilder(page, {
  formId: 'mk_model_20260425gq4b1',
  formName: 'CRM Lead',
  url: 'https://crm.securemetric.com/...',
});

await builder.initialize();      // 加载或生成 Schema（已有 Schema 文件则不导航）
await builder.navigate();        // 导航到表单
await builder.fillAllFields();   // 填充所有字段
await builder.submit();          // 提交表单
```

### SelfHealingTestBuilder

继承自 `FormTestBuilder`，增加自愈能力：

```typescript
const builder = new SelfHealingTestBuilder(page, config, {
  maxRetries: 3,
  enableSelfHealing: true,
  enableExperienceDB: true,
});
```

### FillerFactory

工厂模式，根据 `fdType` 创建对应的 Filler：

```typescript
const filler = FillerFactory.create(page, formId, field);
await filler.fill();
```

## 支持的 fdType

| fdType | 说明 | Filler 类 |
|--------|------|-----------|
| `fd_input` | 单行文本 | `FdInputFiller` |
| `textarea` | 多行文本 | `TextareaFiller` |
| `radio` | 单选框 | `RadioFiller` |
| `checkbox` | 多选框 | `CheckboxFiller` |
| `select` | 单选下拉 | `SelectFiller` |
| `select~multi` | 多选下拉 | `SelectFiller` |
| `timestamp` | 日期选择 | `TimestampFiller` |
| `timepicker` | 时间选择 | `TimepickerFiller` |
| `numbertext` | 数值 | `NumbertextFiller` |
| `moneytext` | 金额 | `MoneytextFiller` |
| `cfg` | 基础数据单选 | `CfgFiller` |
| `cfg~multi` | 基础数据多选 | `CfgFiller` |
| `relation` | 业务关联 | `RelationFiller` |
| `dynamic` | 动态控件 | `DynamicFiller` |
| `address` | 通讯录选人 | `AddressFiller` |
| `agency` | 组织架构选人 | `AgencyFiller` |

## Wiki 知识库

`wiki/` 目录包含完整的 CRM 知识库（48 个 Markdown 页面，覆盖 12 个业务实体）。

```bash
npm run wiki:docs       # 生成可搜索 HTML 站点
```

生成的 HTML 站点：`wiki/docs/output/index.html`

## AI 辅助工具集成

### Claude Code

指令文件：`CLAUDE.md`。包含 Playwright Test Agents（仅推荐 Healer）、架构规则、禁止模式。

Skill 快捷命令（`.claude/skills/`）：
- `/new-filler` — 创建新 Filler 类
- `/new-spec` — 创建新测试 spec
- `/new-manual` — 创建新用户手册 spec

### Trae

规则文件：`.trae/rules/project-rules.md`（优先级最高）和 `.trae/rules.md`。

Skill 快捷命令（`.trae/skills/`）：
- `schema-driven-test` — Schema 驱动测试创建
- `crm-test-creator` — CRM 测试用例创建

### CodeBuddy

指令文件：`.codebuddy/instructions.md`。

### Qoder

知识库：`.qoder/repowiki/zh/`（中文架构文档，80+ 页面）。

### Playwright Test Agents

| Agent | 文件 | 推荐度 |
|-------|------|--------|
| Healer | `.claude/agents/playwright-test-healer.md` | ✅ 推荐 |
| Planner | `.claude/agents/playwright-test-planner.md` | ❌ 不推荐 |
| Generator | `.claude/agents/playwright-test-generator.md` | ❌ 不推荐 |

> Planner/Generator 生成标准 Playwright 代码，绕过 Schema → Filler → Builder 架构，与本框架不兼容。

## 扩展新字段类型

1. 确认 CRM 的 `fdType` 值（来自 API 元数据）
2. 创建 `src/filler/{FdType}Filler.ts`，继承 `BaseFiller`，实现 `fill()`
3. 在 `FillerFactory.ts` 注册：`['fdType', MyFiller]`
4. 在 `src/schema/FieldTypeDetector.ts` 添加检测规则
5. 在 `src/index.ts` 导出新 Filler 类

详见 `doc/ARCHITECTURE.md`。

## 常见问题

### Schema 中 select 选项为空

SchemaGenerator 不自动展开下拉捕获选项，需手动在 Schema JSON 中填写 `options`。

### 单选/多选框 label 显示为数字

LUI 组件 DOM 无 `for` 属性，SchemaGenerator 已通过 `ancestor::label` XPath 修复。手动修正已有的 Schema JSON 中对应字段即可。

### 登录失败

检查 `global-setup.ts` 中的选择器是否匹配当前登录页面。

### 字段填充失败

检查 Schema 中 `fdType` 是否与 CRM API 返回值一致（`timestamp` 非 `date`，`timepicker` 非 `time`，`numbertext` 非 `number`）。

### Schema 路径

Schema 统一存储在 `./src/schemas/{env}/`，可通过 `schemaPath` 参数自定义。
