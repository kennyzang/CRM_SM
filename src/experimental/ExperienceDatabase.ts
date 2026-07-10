import * as fs from 'fs';
import * as path from 'path';

export interface ExperienceRecord {
  id: string;
  timestamp: Date;
  formId: string;
  fieldId: string;
  fieldType: string;
  fillerUsed: string;
  success: boolean;
  error?: string;
  solution?: string;
  recoveryMethod?: string;
  duration: number;
  environment: string;
  metadata?: Record<string, any>;
}

export interface ExperienceQuery {
  fieldType?: string;
  formId?: string;
  success?: boolean;
  errorPattern?: string;
  limit?: number;
  since?: Date;
}

export interface ExperienceStats {
  total: number;
  successRate: number;
  byFieldType: Record<string, { total: number; success: number }>;
  recentFailures: ExperienceRecord[];
}

export class ExperienceDatabase {
  private dbPath: string;
  private records: ExperienceRecord[] = [];
  private pendingRecords: ExperienceRecord[] = [];
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private autoSave: boolean = true;
  private flushIntervalMs: number = 5000;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || './data/experience-db.json';
    this.load();
    this.startFlushTimer();
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.pendingRecords.length > 0) {
        this.flush();
      }
    }, this.flushIntervalMs);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  setAutoSave(enabled: boolean): void {
    this.autoSave = enabled;
    if (!enabled) {
      this.stopFlushTimer();
    } else {
      this.startFlushTimer();
    }
  }

  flush(): void {
    if (this.pendingRecords.length === 0) return;

    this.records.push(...this.pendingRecords);
    this.pendingRecords = [];

    this.save();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(data);
        this.records = parsed.map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp)
        }));
        console.log(`[ExperienceDB] Loaded ${this.records.length} records`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[ExperienceDB] Failed to load database: ${errorMessage}`);
      this.records = [];
    }
  }

  save(): void {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.dbPath, JSON.stringify(this.records, null, 2));
      console.log(`[ExperienceDB] Saved ${this.records.length} records`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[ExperienceDB] Failed to save database: ${errorMessage}`);
    }
  }

  addRecord(record: Omit<ExperienceRecord, 'id' | 'timestamp'>): ExperienceRecord {
    const newRecord: ExperienceRecord = {
      ...record,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.pendingRecords.push(newRecord);

    if (!this.autoSave) {
      this.flush();
    }

    console.log(`[ExperienceDB] Added record: ${newRecord.id} (${record.success ? 'SUCCESS' : 'FAILURE'}), pending: ${this.pendingRecords.length}`);

    return newRecord;
  }

  findSimilar(query: ExperienceQuery): ExperienceRecord[] {
    let results = [...this.records];

    if (query.fieldType) {
      results = results.filter(r => r.fieldType === query.fieldType);
    }

    if (query.formId) {
      results = results.filter(r => r.formId === query.formId);
    }

    if (query.success !== undefined) {
      results = results.filter(r => r.success === query.success);
    }

    if (query.errorPattern) {
      try {
        const regex = new RegExp(query.errorPattern, 'i');
        results = results.filter(r =>
          r.error && regex.test(r.error)
        );
      } catch (regexError) {
        console.warn(`[ExperienceDB] Invalid regex pattern: ${query.errorPattern}`);
      }
    }

    if (query.since) {
      const sinceTime = query.since.getTime();
      results = results.filter(r => r.timestamp.getTime() >= sinceTime);
    }

    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return results;
  }

  findBestSolution(fieldType: string, errorMessage?: string): ExperienceRecord | null {
    const query: ExperienceQuery = {
      fieldType,
      success: true,
      limit: 10,
    };

    let results = this.findSimilar(query);

    if (errorMessage) {
      const errorKeywords = this.extractKeywords(errorMessage);
      results = results.filter(r =>
        r.solution && this.hasKeywordMatch(r.solution, errorKeywords)
      );
    }

    return results[0] || null;
  }

  getStats(): ExperienceStats {
    const total = this.records.length;
    const successes = this.records.filter(r => r.success).length;
    const successRate = total > 0 ? successes / total : 0;

    const byFieldType: Record<string, { total: number; success: number }> = {};
    for (const record of this.records) {
      if (!byFieldType[record.fieldType]) {
        byFieldType[record.fieldType] = { total: 0, success: 0 };
      }
      byFieldType[record.fieldType].total++;
      if (record.success) {
        byFieldType[record.fieldType].success++;
      }
    }

    const recentFailures = this.findSimilar({ success: false, limit: 5 });

    return {
      total,
      successRate,
      byFieldType,
      recentFailures,
    };
  }

  private generateId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they']);
    
    const words = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
    
    const frequency: Record<string, number> = {};
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private hasKeywordMatch(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
  }

  clear(): void {
    this.records = [];
    this.pendingRecords = [];
    this.save();
    console.log('[ExperienceDB] Database cleared');
  }

  destroy(): void {
    this.flush();
    this.stopFlushTimer();
    console.log('[ExperienceDB] Destroyed');
  }
}

export const experienceDB = new ExperienceDatabase();