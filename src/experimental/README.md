# 🧪 Experimental Features（实验性功能）

> **归档日期**: 2026-01-10  
> **原因**: 已实现但未投入使用，为保持核心代码库简洁而归档  
> **状态**: 可从 Git 历史恢复，或重新启用

---

## 📋 目录说明

本目录存放**已实现但当前未使用**的高级功能模块。

这些功能由 AI 批量生成，设计理念先进，但与当前实际需求不匹配。

---

## 📦 归档的模块清单

### 核心增强类（3个）

| 模块 | 原位置 | 功能 | 未使用原因 |
|------|--------|------|-----------|
| **SelfHealingTestBuilder** | `src/core/` | 自愈测试构建器（自动重试+MCP探查+经验学习） | 测试足够稳定，无需自愈 |
| **SmartFillerFactory** | `src/core/` | 智能 Filler 工厂（自动发现未知字段类型） | SchemaGenerator 已解决类型识别 |
| **TestAutomationSkill** | `src/core/` | 全能测试自动化 Skill（一键生成并运行测试） | 与 FormTestBuilder 功能重叠 |

### 工具类（3个）

| 模块 | 原位置 | 功能 | 未使用原因 |
|------|--------|------|-----------|
| **MCPInvestigator** | `src/utils/` | MCP 协议页面探查器 | 违反项目规则：禁止运行时 LLM API |
| **QuickTestHelper** | `src/utils/` | 快速测试辅助工具 | 与 schema-driven-test skill 重复 |
| **PerformanceMonitor** | `src/utils/` | 性能监控器（字段级性能指标+缓存） | 当前表单规模小，无性能瓶颈 |

### 数据管理类（2个）

| 模块 | 原位置 | 功能 | 未使用原因 |
|------|--------|------|-----------|
| **ExperienceDatabase** | `src/experience/` | 测试经验数据库（记录成功/失败策略） | 与"Schema 先行"架构冲突 |
| **SchemaRepository** | `src/schema/` | 多 Schema 管理器（版本控制+缓存） | 当前只需单 Schema 场景 |

### 辅助类（1个）

| 模块 | 原位置 | 功能 | 未使用原因 |
|------|--------|------|-----------|
| **FieldTypeDetector** | `src/schema/` | 字段类型检测器（DOM 分析自动检测） | SchemaGenerator 已内置类型检测 |

---

## 🎯 为什么未使用？

### 项目背景

这是一个**低代码平台表单自动化测试框架**，核心需求：

```
✅ 必须解决：
   1. 探查表单结构（Schema）
   2. 自动填充各种控件（Filler）
   3. 处理明细表（DetailTable）
   4. 提交表单并验证

❌ 不需要：
   - AI 驱动的智能发现（太慢、太贵、不稳定）
   - 自愈机制（测试失败率极低）
   - 性能监控（单个表单秒级完成）
   - 经验学习（每次都是新数据）
```

### 设计理念冲突

| 归档模块的设计哲学 | 实际项目需要 |
|-------------------|-------------|
| 企业级、可扩展、智能化 | 简单、实用、稳定 |
| 抽象层次多（Builder→Skill→Helper） | 一层抽象就够（FormTestBuilder） |
| 运行时动态决策 | 配置时静态决定 |
| AI 赋能 | 确定性优先 |

---

## 💡 如果将来想启用？

### 方案 1: 从 Git 恢复到原位置

```bash
# 恢复单个文件
git show HEAD~1:src/core/SelfHealingTestBuilder.ts > src/core/SelfHealingTestBuilder.ts

# 或恢复所有文件
git checkout HEAD~1 -- src/core/SelfHealingTestBuilder.ts \
  src/core/SmartFillerFactory.ts \
  src/core/TestAutomationSkill.ts \
  # ... 其他文件

# 更新 src/index.ts 取消注释对应导出
```

### 方案 2: 直接在 experimental/ 目录中使用

```typescript
// 导入路径改为：
import { SelfHealingTestBuilder } from '../experimental/SelfHealingTestBuilder';
import { SmartFillerFactory } from '../experimental/SmartFillerFactory';
```

### 方案 3: 选择性启用部分功能

如果只需要某个功能的核心思想：

#### 示例：只启用重试机制（从 SelfHealingTestBuilder 提取）

```typescript
// 在 FormTestBuilder 中添加（约20行）
async submitWithRetry(maxRetries = 2): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await this.submit();
      return;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`[Retry] 第${attempt}次重试...`);
      await this.page.waitForTimeout(1000);
    }
  }
}
```

#### 示例：只启用 fallback 逻辑（从 SmartFillerFactory 提取）

```typescript
// 在 FillerFactory 中添加（约15行）
static createWithFallback(page, formId, field) {
  try {
    return this.create(page, formId, field);
  } catch (error) {
    console.warn(`[Fallback] 未知类型 ${field.fdType}，使用 InputFiller`);
    return new FdInputFiller({ page, formId, field });
  }
}
```

---

## 📊 代码统计

| 指标 | 数值 |
|------|------|
| **归档文件数** | 9 个 |
| **总代码行数** | ~1,580 行 |
| **占原代码库比例** | 28% |
| **减少维护负担** | 显著 ✅ |

---

## 🔗 相关文档

- [未使用功能分析报告](../../doc/未使用功能分析报告.md) - 详细分析过程
- [UNUSED-FEATURES-ANALYSIS.md](../../doc/UNUSED-FEATURES-ANALYSIS.md) - WorkBuddy 分析报告
- [架构设计文档](../../doc/核心文档/架构设计.md) - 当前使用的架构

---

## 📝 变更日志

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-01-10 | 归档 | 从核心目录移动到 experimental/，更新 index.ts 移除导出 |

---

## ⚠️ 注意事项

1. **这些代码未经充分测试** - 可能存在边界情况 bug
2. **依赖可能过时** - 部分依赖的模块也已归档
3. **不建议直接使用** - 如需类似功能，建议参考思想后重新实现
4. **Git 是时光机** - 随时可恢复，不用担心丢失

---

**最后更新**: 2026-01-10  
**维护者**: 项目团队
