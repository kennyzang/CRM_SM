import { Page } from '@playwright/test';
import { FillerFactory } from '@/filler/FillerFactory';
import { FormField } from '@/schema/SchemaGenerator';
import { BaseFiller, FillerContext } from '@/filler/BaseFiller';

export interface SmartFillerContext {
  enableMCPInvestigation?: boolean;
  enableSourceCodeQuery?: boolean;
  sourceCodePaths?: string[];
  experienceDBPath?: string;
}

interface DiscoveredType {
  fdType: string;
  discoveredAt: Date;
  method: 'mcp-investigation' | 'source-code' | 'dom-analysis' | 'experience-match';
  confidence: number;
  suggestedFdType?: string;
  sampleDom?: string;
}

export class SmartFillerFactory extends FillerFactory {
  private static discoveryHistory: Map<string, DiscoveredType> = new Map();
  private static readonly FALLBACK_TYPE = 'fd_input';

  static async createSmart(
    page: Page,
    formId: string,
    field: FormField,
    context?: SmartFillerContext
  ): Promise<BaseFiller> {
    if (!this.isKnownType(field.fdType)) {
      console.log(`[SmartFillerFactory] Unknown type: ${field.fdType}, starting auto-discovery`);
      const discovered = await AutoDiscoveryService.discover(page, field, context);

      if (discovered && discovered.suggestedFdType) {
        const newField: FormField = {
          ...field,
          fdType: discovered.suggestedFdType
        };
        console.log(`[SmartFillerFactory] Discovered type: ${discovered.suggestedFdType} (confidence: ${discovered.confidence})`);
        const discoveredFiller = FillerFactory.create(page, formId, newField);
        SmartFillerFactory.addToExperienceDB(field.fdType, discovered);
        return discoveredFiller;
      }
    }

    return FillerFactory.create(page, formId, field);
  }

  private static isKnownType(fdType: string): boolean {
    const knownTypes = [
      'fd_input', 'textarea', 'radio', 'checkbox', 'select', 'select~multi',
      'timestamp', 'timepicker', 'numbertext', 'moneytext', 'relation', 'relation~multi',
      'cfg', 'cfg~multi', 'dynamic', 'text', 'calculate', 'address', 'agency',
      'image', 'switch', 'boolean',
    ];
    return knownTypes.includes(fdType);
  }

  static addToExperienceDB(fdType: string, discovery: DiscoveredType): void {
    console.log(`[SmartFillerFactory] Adding ${fdType} to experience DB`);
    this.discoveryHistory.set(fdType, discovery);
  }

  static getDiscoveryHistory(): Map<string, DiscoveredType> {
    return new Map(this.discoveryHistory);
  }
}

class AutoDiscoveryService {
  static async discover(
    page: Page,
    field: FormField,
    context?: SmartFillerContext
  ): Promise<DiscoveredType | null> {
    console.log(`[AutoDiscovery] Discovering for field: ${field.id} (type: ${field.fdType})`);

    const fromExperience = this.queryExperienceDB(field.fdType);
    if (fromExperience && fromExperience.confidence > 0.9) {
      console.log(`[AutoDiscovery] Found in experience DB (confidence: ${fromExperience.confidence})`);
      return fromExperience;
    }

    if (context?.enableMCPInvestigation) {
      const fromMCP = await this.investigateWithMCP(page, field.id);
      if (fromMCP && fromMCP.confidence > 0.8) {
        console.log(`[AutoDiscovery] Discovered via MCP (confidence: ${fromMCP.confidence})`);
        return fromMCP;
      }
    }

    if (context?.enableSourceCodeQuery) {
      const fromSource = await this.querySourceCode(field.fdType, context.sourceCodePaths);
      if (fromSource) {
        console.log(`[AutoDiscovery] Discovered via source code analysis`);
        return fromSource;
      }
    }

    const fromDOM = await this.analyzeDOMStructure(page, field.id);
    if (fromDOM) {
      console.log(`[AutoDiscovery] Discovered via DOM analysis (confidence: ${fromDOM.confidence})`);
      return fromDOM;
    }

    return null;
  }

  private static queryExperienceDB(fdType: string): DiscoveredType | null {
    const history = SmartFillerFactory.getDiscoveryHistory();
    const found = history.get(fdType);
    return found || null;
  }

  private static async investigateWithMCP(page: Page, fieldId: string): Promise<DiscoveredType | null> {
    return null;
  }

  private static async querySourceCode(fdType: string, paths?: string[]): Promise<DiscoveredType | null> {
    return null;
  }

  private static async analyzeDOMStructure(page: Page, fieldId: string): Promise<DiscoveredType | null> {
    try {
      const analysis = await page.evaluate((id) => {
        const element = document.querySelector(`[data-tid*="${id}--"]`) ||
                       document.querySelector(`[data-id*="${id}"]`) ||
                       document.querySelector(`[id*="${id}"]`);
        
        if (!element) return null;

        const tagName = element.tagName.toLowerCase();
        const className = element.className || '';
        const attributes: Record<string, string> = {};
        
        for (const attr of Array.from(element.attributes)) {
          attributes[attr.name] = attr.value;
        }

        return {
          tagName,
          className,
          attributes,
          html: element.outerHTML.substring(0, 500)
        };
      }, fieldId);

      if (!analysis) return null;

      const suggestedType = this.inferTypeFromDOM(analysis);
      return {
        fdType: fieldId,
        discoveredAt: new Date(),
        method: 'dom-analysis',
        confidence: suggestedType.confidence,
        suggestedFdType: suggestedType.type,
        sampleDom: analysis.html
      };
    } catch (error: unknown) {
      console.warn(`[AutoDiscovery] DOM analysis failed: ${error}`);
      return null;
    }
  }

  private static inferTypeFromDOM(analysis: any): { type: string; confidence: number } {
    const { tagName, className, attributes } = analysis;
    const lowerClass = className.toLowerCase();
    const dataTid = (attributes['data-tid'] || '').toLowerCase();

    if (tagName === 'textarea') {
      return { type: 'textarea', confidence: 0.95 };
    }
    if (tagName === 'select') {
      return { type: 'select', confidence: 0.9 };
    }
    if (lowerClass.includes('el-input') || lowerClass.includes('input')) {
      const type = attributes['type'] || 'text';
      if (type === 'number') return { type: 'numbertext', confidence: 0.85 };
      if (type === 'radio') return { type: 'radio', confidence: 0.9 };
      if (type === 'checkbox') return { type: 'checkbox', confidence: 0.9 };
      return { type: 'fd_input', confidence: 0.8 };
    }
    if (lowerClass.includes('date') || dataTid.includes('date')) {
      return { type: 'timestamp', confidence: 0.85 };
    }
    if (lowerClass.includes('time') || dataTid.includes('time')) {
      return { type: 'timepicker', confidence: 0.85 };
    }
    if (lowerClass.includes('select') || dataTid.includes('select')) {
      return { type: 'select', confidence: 0.85 };
    }
    if (lowerClass.includes('money') || dataTid.includes('money')) {
      return { type: 'moneytext', confidence: 0.9 };
    }
    if (lowerClass.includes('relation') || dataTid.includes('relation')) {
      return { type: 'relation', confidence: 0.85 };
    }
    if (lowerClass.includes('agency') || dataTid.includes('agency')) {
      return { type: 'agency', confidence: 0.9 };
    }
    if (lowerClass.includes('address') || dataTid.includes('address')) {
      return { type: 'address', confidence: 0.9 };
    }
    if (lowerClass.includes('cfg') || dataTid.includes('cfg')) {
      return { type: 'cfg', confidence: 0.8 };
    }

    return { type: 'fd_input', confidence: 0.5 };
  }
}