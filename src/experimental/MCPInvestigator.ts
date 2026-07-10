import { Page } from '@playwright/test';

export interface MCPInvestigationResult {
  fieldId: string;
  snapshot?: any;
  domStructure?: string;
  suggestedType?: string;
  confidence?: number;
  timestamp: string;
  error?: string;
}

export class MCPInvestigator {
  private enabled: boolean;

  constructor(enabled: boolean = false) {
    this.enabled = enabled;
  }

  async investigateField(fieldId: string, page: Page): Promise<MCPInvestigationResult> {
    const result: MCPInvestigationResult = {
      fieldId,
      timestamp: new Date().toISOString(),
    };

    if (!this.enabled) {
      console.log('[MCPInvestigator] MCP investigation is disabled, skipping');
      return result;
    }

    console.log(`[MCPInvestigator] Starting investigation for field: ${fieldId}`);

    try {
      await page.waitForTimeout(500);

      const pageSnapshot = await this.getPageSnapshot(page);
      result.snapshot = pageSnapshot;

      result.domStructure = this.analyzeDOM(pageSnapshot, fieldId);
      const suggestion = this.suggestFieldType(result.domStructure);
      result.suggestedType = suggestion.type;
      result.confidence = suggestion.confidence;

      console.log(`[MCPInvestigator] Investigation complete for ${fieldId}`);
      if (result.suggestedType) {
        console.log(`  Suggested type: ${result.suggestedType} (confidence: ${result.confidence?.toFixed(2)})`);
      }

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[MCPInvestigator] Investigation failed: ${errorMessage}`);
      result.error = errorMessage;
      return result;
    }
  }

  private async getPageSnapshot(page: Page): Promise<any> {
    console.log('[MCPInvestigator] Getting page snapshot via evaluate');
    
    try {
      const snapshot = await page.evaluate(() => {
        const getElementInfo = (el: Element) => {
          const info: any = {
            tagName: el.tagName,
            id: el.id || null,
            classNames: Array.from(el.classList) || [],
            attributes: {},
            children: []
          };
          
          for (const attr of el.attributes) {
            info.attributes[attr.name] = attr.value;
          }
          
          for (const child of Array.from(el.children)) {
            info.children.push(getElementInfo(child));
          }
          
          return info;
        };
        
        return {
          title: document.title,
          url: window.location.href,
          body: getElementInfo(document.body)
        };
      });
      
      return snapshot;
    } catch (error: unknown) {
      console.warn('[MCPInvestigator] Failed to get full snapshot, falling back to simple mode');
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  private analyzeDOM(snapshot: any, fieldId: string): string {
    const domInfo: string[] = [];

    if (!snapshot?.body?.children) {
      return 'No DOM data available';
    }

    domInfo.push('=== DOM Analysis ===');
    domInfo.push(`Field ID: ${fieldId}`);
    
    const searchField = (node: any): boolean => {
      const matchesField = (text: string): boolean => {
        if (!text) return false;
        const lowerText = text.toLowerCase();
        const lowerField = fieldId.toLowerCase();
        return lowerText.includes(lowerField);
      };

      const checkAttributes = (attrs: any): boolean => {
        for (const [key, value] of Object.entries(attrs)) {
          if (typeof value === 'string' && matchesField(value)) {
            domInfo.push(`  Found in ${key}: ${value}`);
            return true;
          }
        }
        return false;
      };

      let found = false;

      if (node.attributes && checkAttributes(node.attributes)) {
        domInfo.push(`  Tag: ${node.tagName}`);
        if (node.id) domInfo.push(`  ID: ${node.id}`);
        if (node.classNames && node.classNames.length > 0) {
          domInfo.push(`  Classes: ${node.classNames.join(' ')}`);
        }
        found = true;
      }

      if (node.children) {
        for (const child of node.children) {
          if (searchField(child)) {
            found = true;
          }
        }
      }

      return found;
    };

    searchField(snapshot.body);

    return domInfo.join('\n');
  }

  private suggestFieldType(domStructure: string): { type: string; confidence: number } {
    const suggestions: { type: string; pattern: string; confidence: number }[] = [
      { type: 'fd_input', pattern: 'comp.*input', confidence: 0.9 },
      { type: 'fd_input', pattern: 'el-input', confidence: 0.85 },
      { type: 'textarea', pattern: 'textarea', confidence: 0.9 },
      { type: 'select', pattern: 'select', confidence: 0.8 },
      { type: 'select', pattern: 'el-select', confidence: 0.85 },
      { type: 'radio', pattern: 'radio', confidence: 0.85 },
      { type: 'checkbox', pattern: 'checkbox', confidence: 0.85 },
      { type: 'timestamp', pattern: 'date|time', confidence: 0.8 },
      { type: 'timestamp', pattern: 'el-date', confidence: 0.85 },
      { type: 'numbertext', pattern: 'number', confidence: 0.8 },
      { type: 'address', pattern: 'address', confidence: 0.85 },
      { type: 'agency', pattern: 'agency', confidence: 0.9 },
      { type: 'cfg', pattern: 'cfg|picker', confidence: 0.75 },
      { type: 'relation', pattern: 'relation', confidence: 0.85 },
    ];

    for (const suggestion of suggestions) {
      const regex = new RegExp(suggestion.pattern, 'i');
      if (regex.test(domStructure)) {
        return { type: suggestion.type, confidence: suggestion.confidence };
      }
    }

    return { type: 'fd_input', confidence: 0.5 };
  }

  async saveInvestigation(result: MCPInvestigationResult, outputPath: string = './test-results/mcp') {
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const safeFieldId = result.fieldId.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${safeFieldId}-${result.timestamp.replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(outputPath, filename);
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
      console.log(`[MCPInvestigator] Investigation saved to: ${filepath}`);
    } catch (error: unknown) {
      console.warn(`[MCPInvestigator] Failed to save investigation: ${error}`);
    }
  }
}