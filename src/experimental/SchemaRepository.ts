/**
 * SchemaRepository — Schema 持久化层
 *
 * 负责 Schema 文件的保存和加载
 */
import * as fs from 'fs';
import * as path from 'path';
import { FormSchema } from '@/schema/SchemaGenerator';

export class SchemaRepository {
  private baseDir: string;

  constructor(baseDir: string = '../schemas') {
    this.baseDir = baseDir;
  }

  async save(schema: FormSchema, outputDir?: string): Promise<string> {
    const dir = path.resolve(outputDir || this.baseDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `${schema.formId}.json`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, JSON.stringify(schema, null, 2), 'utf-8');
    console.log(`[SchemaRepository] Schema saved to ${filepath}`);

    return filepath;
  }

  load(formId: string, schemaDir?: string): FormSchema | null {
    const dir = path.resolve(schemaDir || this.baseDir);

    const directPath = path.join(dir, `${formId}.json`);
    if (fs.existsSync(directPath)) {
      const content = fs.readFileSync(directPath, 'utf-8');
      return JSON.parse(content) as FormSchema;
    }

    const testPath = path.join(dir, 'test', `${formId}.json`);
    if (fs.existsSync(testPath)) {
      const content = fs.readFileSync(testPath, 'utf-8');
      return JSON.parse(content) as FormSchema;
    }

    const sp3testPath = path.join(dir, 'sp3test', `${formId}.json`);
    if (fs.existsSync(sp3testPath)) {
      const content = fs.readFileSync(sp3testPath, 'utf-8');
      return JSON.parse(content) as FormSchema;
    }

    return null;
  }

  exists(formId: string, schemaDir?: string): boolean {
    return this.load(formId, schemaDir) !== null;
  }
}

export const schemaRepository = new SchemaRepository();
