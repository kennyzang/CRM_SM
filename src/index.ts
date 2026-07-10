/**
 * EasyCraft 表单测试框架 - 统一导出 (System B)
 *
 * 核心模块：Schema + Core + Filler + Utils（正在使用）
 * 实验性模块：已移至 src/experimental/（未使用，详见该目录 README.md）
 */

// ========== Schema 相关 ==========
export { SchemaGenerator } from '@/schema/SchemaGenerator';
export type { FormSchema, FormField, FieldOption, I18nContent, FieldI18n } from '@/schema/SchemaGenerator';

// [已归档] SchemaRepository, FieldTypeDetector - 未使用，见 src/experimental/
// export { SchemaRepository, schemaRepository } from '@/schema/SchemaRepository';
// export { FieldTypeDetector } from '@/schema/FieldTypeDetector';

// ========== Core 相关 ==========
export { FormTestBuilder } from '@/core/FormTestBuilder';
export type { FormTestConfig } from '@/core/FormTestBuilder';
export { DetailTableBuilder } from '@/core/DetailTableBuilder';
export type { DetailTableConfig, RowData } from '@/core/DetailTableBuilder';

// [已归档] SelfHealingTestBuilder - 自愈功能未启用，见 src/experimental/
// export { SelfHealingTestBuilder } from '@/core/SelfHealingTestBuilder';
// export type { SelfHealingConfig } from '@/core/SelfHealingTestBuilder';

// [已归档] SmartFillerFactory - 智能发现未使用，见 src/experimental/
// export { SmartFillerFactory } from '@/core/SmartFillerFactory';
// export type { SmartFillerContext } from '@/core/SmartFillerFactory';

// [已归档] TestAutomationSkill - 全能自动化未集成，见 src/experimental/
// export { TestAutomationSkill } from '@/core/TestAutomationSkill';
// export type { TestConfig, TestResult } from '@/core/TestAutomationSkill';

// ========== Utils 相关（核心） ==========
export { DataGenerator } from '@/utils/DataGenerator';

// [已归档] MCPInvestigator - AI探查器，违反项目规则（禁止运行时LLM），见 src/experimental/
// export { MCPInvestigator } from '@/utils/MCPInvestigator';
// export type { MCPInvestigationResult } from '@/utils/MCPInvestigator';

// [已归档] QuickTestHelper - 快速测试辅助，与 schema-driven-test 重复，见 src/experimental/
// export { createQuickTest, runQuickTest } from '@/utils/QuickTestHelper';
// export type { QuickTestOptions } from '@/utils/QuickTestHelper';

// [已归档] PerformanceMonitor - 性能监控，当前无性能瓶颈，见 src/experimental/
// export { PerformanceMonitor, DOMCache, AsyncBatchSaver, globalPerformanceMonitor, globalDOMCache } from '@/utils/PerformanceMonitor';
// export type { PerformanceMetrics, FieldPerformance } from '@/utils/PerformanceMonitor';

// ========== Filler 相关 ==========
export { FillerFactory } from '@/filler/FillerFactory';
export { BaseFiller } from '@/filler/BaseFiller';
export { AddressFiller } from '@/filler/AddressFiller';
export { AgencyFiller } from '@/filler/AgencyFiller';
export { DynamicFiller } from '@/filler/DynamicFiller';
export type { FillerContext } from '@/filler/BaseFiller';

// [已归档] ExperienceDatabase - 经验数据库，与 Schema 先行架构冲突，见 src/experimental/
// export { ExperienceDatabase, experienceDB } from '@/experience/ExperienceDatabase';
// export type { ExperienceRecord, ExperienceQuery, ExperienceStats } from '@/experience/ExperienceDatabase';

// ========== Mock 数据相关 ==========
export { MockDatabase } from '@/mock/MockDatabase';
export type { PersonProfile, MockData } from '@/mock/MockDatabase';
