# CLAUDE.md

> **遇到不确定的问题必须先询问用户确认**，禁止自行假设或静默绕过必填字段。

## Project Overview

Playwright + TypeScript Schema-Driven CRM 自动化测试框架。详细架构 → [doc/architecture.md](doc/architecture.md)

## Environments

| 环境 | 配置文件 | 基础 URL |
|------|---------|----------|
| SP3Test | `config/playwright.sp3test.config.ts` | `https://sp3test.landray.com.cn` |
| EasyCraft test | `config/playwright.test.config.ts` | `https://test.easycraft.ai` |
| Securemetric CRM | `config/playwright.securemetric-crm.config.ts` | `https://crm.securemetric.com` |

## Commands

```bash
npm run test:sp3test / test:test / test:crm   # 环境级运行
npx playwright test --config=config/xxx.config.ts tests/path/to/spec.ts  # 单个 spec
npm run test:headed / test:debug / test:ui / report
npx tsc --noEmit                              # 类型检查（提交前必跑，零错误）
```

## Root Directory Whitelist

允许：`package.json` `tsconfig.json` `.gitignore` `.mcp.json` `CLAUDE.md` `README.md` `.env.*.example` `src/` `tests/` `config/` `scripts/` `doc/` `data/` `.trae/` `.claude/` `auth/` `wiki/`

| 文件类型 | 正确位置 |
|---------|---------|
| Shell / Node 脚本 | `scripts/` |
| Global Setup (*.ts) | `config/` |
| Schema JSON | `src/schemas/{env}/` |
| Excel 用例 | `doc/test-cases/excel/` |
| 截图/图片 | `tests/temp/`（或删除） |

## Key Rules

0. **When in doubt, ask first**
1. 所有表单操作必须通过 **FormTestBuilder** / SelfHealingTestBuilder
2. **fdType 必须匹配 CRM API** — `timestamp` `timepicker` `numbertext` `moneytext` `select~multi`
3. Filler 命名：fdType PascalCase + "Filler"
4. Schema 存储：`./src/schemas/{env}/`，禁止放根目录 `schemas/`
5. `select/select~multi` options 不自动抓取，手动维护在 schema JSON
6. 新增字段类型必须同步 3 个文件：Filler 类 / FillerFactory / `src/index.ts`

## Coding Red Lines

1. 异常处理：必须用 `catch (error: unknown)` + `error instanceof Error` 模式
2. DOM 定位：禁止硬编码 CSS Selector/XPath，用 `data-id`/`data-tid`
3. spec 职责：禁止内联探查/数据生成/DOM 操作/登录逻辑
4. 禁止引入：Midscene.js / POM / Cypress / 运行时 LLM API
5. 循环次数：禁止硬编码，用 `--repeat-each N`
6. npm scripts：禁止新增 per-spec 启动脚本，直接用 `npx playwright test`

详细规范 → [doc/coding-standards.md](doc/coding-standards.md)

## Playwright Agents

只用 **Healer**（Planner / Generator 与本项目架构不兼容）。
Healer 只在正确层级修复，禁止在 spec 中绕过 FormTestBuilder / FillerFactory。

详细规则、禁止模式、提交清单 → [doc/ai-collaboration.md](doc/ai-collaboration.md)

## 两套用户手册流水线

### Pipeline A — Manual（Playwright 截图 → Markdown → 组件）

```
Playwright spec（Edward 账号）
  → 截图 + Markdown 自动写入
  → src/widget/km-ltc-manual-securemetric/docs/manual/{N}-{module}/
  → ./scripts/build.sh          # 打包 km-ltc-manual-securemetric
  → dist/km-ltc-manual-securemetric-TIMESTAMP.zip
  → 上传 MK 平台
```

Spec 位置：`tests/Securemetric-CRM/manual/crm-{module}-manual.spec.ts`

```bash
CRM_USER=edward npx playwright test \
  --config=config/playwright.securemetric-crm.config.ts \
  tests/Securemetric-CRM/manual/crm-{module}-manual.spec.ts --headed
```

规则：
- 所有 manual spec 必须用 **Edward 账号**（`CRM_USER=edward`），不可更换
- 步骤 ≤ 4，Step 1 必须是列表页 + 左侧导航可见
- Mobile/Email 等唯一字段必须用时间戳值（`Date.now()`）
- 新建手册 spec 使用 `/new-manual` skill

### Pipeline B — Wiki（Markdown → HTML → 组件）

```
wiki/user-manuals/{module}-manual-{en|zh}.md   # 手写 Markdown
wiki/assets/{module}-NNN-xxx.png               # 截图
  → 注册到 wiki/docs/generate.py 的 MODULES dict
  → npm run wiki:docs                          # 生成 wiki/docs/output/
  → ./scripts/build.sh wiki                   # 打包 km-ltc-wiki-securemetric
  → dist/km-ltc-wiki-securemetric-TIMESTAMP.zip
  → 上传 MK 平台
```

```bash
npm run wiki:docs            # Markdown → HTML
./scripts/build.sh wiki      # 打包（会清空 dist/，勿直接编辑 dist/）
npm run wiki:serve           # 启动 Wiki MCP server（:3100）
```

新增模块：写 `.md` + 放截图 → 注册 `MODULES` → `wiki:docs` → `build.sh wiki`
