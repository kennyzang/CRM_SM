export interface PerformanceMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
  averageDuration: number;
  slowestField: { fieldId: string; duration: number } | null;
  fastestField: { fieldId: string; duration: number } | null;
  fieldTypeStats: Record<string, { count: number; totalDuration: number; avgDuration: number }>;
  timestamp: Date;
}

export interface FieldPerformance {
  fieldId: string;
  fieldType: string;
  duration: number;
  success: boolean;
  timestamp: Date;
}

export class PerformanceMonitor {
  private metrics: Map<string, FieldPerformance[]> = new Map();
  private operationTimings: Map<string, number> = new Map();
  private startTimes: Map<string, number> = new Map();

  startOperation(operationName: string): void {
    this.startTimes.set(operationName, Date.now());
  }

  endOperation(operationName: string): number {
    const startTime = this.startTimes.get(operationName);
    if (!startTime) {
      console.warn(`[PerformanceMonitor] No start time found for operation: ${operationName}`);
      return 0;
    }
    
    const duration = Date.now() - startTime;
    this.operationTimings.set(operationName, duration);
    this.startTimes.delete(operationName);
    
    return duration;
  }

  recordFieldPerformance(fieldId: string, fieldType: string, duration: number, success: boolean): void {
    const performance: FieldPerformance = {
      fieldId,
      fieldType,
      duration,
      success,
      timestamp: new Date()
    };

    if (!this.metrics.has(fieldType)) {
      this.metrics.set(fieldType, []);
    }
    
    this.metrics.get(fieldType)!.push(performance);
  }

  getMetrics(): PerformanceMetrics {
    const allPerformances: FieldPerformance[] = [];
    let passed = 0;
    let failed = 0;
    let totalDuration = 0;

    for (const performances of this.metrics.values()) {
      allPerformances.push(...performances);
      for (const p of performances) {
        if (p.success) passed++;
        else failed++;
        totalDuration += p.duration;
      }
    }

    const totalTests = allPerformances.length;
    const successRate = totalTests > 0 ? passed / totalTests : 0;
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0;

    let slowestField: { fieldId: string; duration: number } | null = null;
    let fastestField: { fieldId: string; duration: number } | null = null;

    for (const p of allPerformances) {
      if (!slowestField || p.duration > slowestField.duration) {
        slowestField = { fieldId: p.fieldId, duration: p.duration };
      }
      if (!fastestField || p.duration < fastestField.duration) {
        fastestField = { fieldId: p.fieldId, duration: p.duration };
      }
    }

    const fieldTypeStats: Record<string, { count: number; totalDuration: number; avgDuration: number }> = {};
    for (const [fieldType, perfs] of this.metrics.entries()) {
      const count = perfs.length;
      const totalDur = perfs.reduce((sum, p) => sum + p.duration, 0);
      fieldTypeStats[fieldType] = {
        count,
        totalDuration: totalDur,
        avgDuration: count > 0 ? totalDur / count : 0
      };
    }

    return {
      totalTests,
      passedTests: passed,
      failedTests: failed,
      successRate,
      averageDuration,
      slowestField,
      fastestField,
      fieldTypeStats,
      timestamp: new Date()
    };
  }

  getOperationTimings(): Record<string, number> {
    return Object.fromEntries(this.operationTimings);
  }

  getFieldTypePerformance(fieldType: string): FieldPerformance[] {
    return this.metrics.get(fieldType) || [];
  }

  clear(): void {
    this.metrics.clear();
    this.operationTimings.clear();
    this.startTimes.clear();
  }

  generateReport(): string {
    const metrics = this.getMetrics();
    const timings = this.getOperationTimings();

    let report = '\n';
    report += '='.repeat(60) + '\n';
    report += '       PERFORMANCE REPORT\n';
    report += '='.repeat(60) + '\n\n';

    report += `Total Tests: ${metrics.totalTests}\n`;
    report += `Passed: ${metrics.passedTests} | Failed: ${metrics.failedTests}\n`;
    report += `Success Rate: ${(metrics.successRate * 100).toFixed(2)}%\n`;
    report += `Average Duration: ${metrics.averageDuration.toFixed(2)}ms\n\n`;

    if (metrics.slowestField) {
      report += `Slowest Field: ${metrics.slowestField.fieldId} (${metrics.slowestField.duration}ms)\n`;
    }
    if (metrics.fastestField) {
      report += `Fastest Field: ${metrics.fastestField.fieldId} (${metrics.fastestField.duration}ms)\n`;
    }

    report += '\n--- Operation Timings ---\n';
    for (const [op, duration] of Object.entries(timings)) {
      report += `${op}: ${duration}ms\n`;
    }

    report += '\n--- Field Type Stats ---\n';
    for (const [type, stats] of Object.entries(metrics.fieldTypeStats)) {
      report += `${type}: count=${stats.count}, avg=${stats.avgDuration.toFixed(2)}ms\n`;
    }

    report += '\n' + '='.repeat(60) + '\n';

    return report;
  }
}

export class DOMCache {
  private cache: Map<string, { element: any; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttlMs: number = 5000) {
    this.ttl = ttlMs;
  }

  set(key: string, element: any): void {
    this.cache.set(key, { element, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.element;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export class AsyncBatchSaver {
  private queue: any[] = [];
  private isSaving = false;
  private batchSize: number;
  private flushIntervalMs: number;
  private intervalId?: NodeJS.Timeout;
  private saveFn: (items: any[]) => Promise<void>;

  constructor(
    saveFn: (items: any[]) => Promise<void>,
    options?: { batchSize?: number; flushIntervalMs?: number }
  ) {
    this.saveFn = saveFn;
    this.batchSize = options?.batchSize || 10;
    this.flushIntervalMs = options?.flushIntervalMs || 5000;

    this.intervalId = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);
  }

  add(item: any): void {
    this.queue.push(item);
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.isSaving || this.queue.length === 0) return;

    this.isSaving = true;
    const items = this.queue.splice(0, this.batchSize);

    try {
      await this.saveFn(items);
    } catch (error) {
      console.error('[AsyncBatchSaver] Failed to save batch:', error);
      this.queue.unshift(...items);
    } finally {
      this.isSaving = false;
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.flush();
  }
}

export const globalPerformanceMonitor = new PerformanceMonitor();
export const globalDOMCache = new DOMCache();