/**
 * CfgDataFetcher — 获取 cfg 字段的动态选项数据
 *
 * 通过 findByEnum 接口获取基础数据字段的选项列表。
 * baseURL 优先级：
 *   1. 调用方显式传入
 *   2. 从当前页面 URL 的 origin 自动推断
 *
 * SP3Test 特殊处理：API 挂在 /mkpaas 路径下，需额外尝试带和不带前缀的 URL。
 */
import { Page } from '@playwright/test';

export interface CfgOption {
  fdId: string;
  fdName: string;
  [key: string]: any;
}

export interface CfgDataResponse {
  code?: number;
  success?: boolean;
  msg?: string;
  message?: string;
  data?: {
    list?: CfgOption[];
    content?: CfgOption[];
    total?: number;
  };
}

const CFG_API_PATHS = [
  '/sys-xform/sysXFormCfgData/findByEnum',
  '/data/sys-xform/sysXFormCfgData/findByEnum',
];

/** 从页面 URL origin 推断 baseURL，无需硬编码域名列表 */
function detectBaseURL(page: Page): string {
  try {
    const origin = new URL(page.url()).origin;
    // SP3Test 的 API 挂在 /mkpaas 子路径下
    if (origin.includes('sp3test.landray.com.cn') && page.url().includes('/mkpaas/')) {
      return `${origin}/mkpaas`;
    }
    return origin;
  } catch {
    return 'https://test.easycraft.ai';
  }
}

/** 构建候选 API URL 列表（去重） */
function buildApiUrls(baseURL: string): string[] {
  const urls: string[] = [];
  for (const apiPath of CFG_API_PATHS) {
    urls.push(`${baseURL}${apiPath}`);
    // SP3Test：同时尝试带 /mkpaas 和不带的变体
    if (baseURL.endsWith('/mkpaas')) {
      const root = baseURL.replace('/mkpaas', '');
      urls.push(`${root}${apiPath}`);
    }
  }
  return [...new Set(urls)];
}

export async function fetchCfgOptions(
  page: Page,
  cfgId: string,
  baseURL?: string
): Promise<CfgOption[]> {
  const actualBaseURL = baseURL || detectBaseURL(page);
  const apiUrls = buildApiUrls(actualBaseURL);

  console.log(`[CfgDataFetcher] baseURL=${actualBaseURL}  cfgId=${cfgId}`);

  for (const apiUrl of apiUrls) {
    try {
      console.log(`[CfgDataFetcher] Trying: ${apiUrl}`);
      const response: CfgDataResponse = await page.evaluate(
        async ({ url, enumId }) => {
          return new Promise<CfgDataResponse>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
            xhr.withCredentials = true;
            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try {
                    resolve(JSON.parse(xhr.responseText) as CfgDataResponse);
                  } catch {
                    resolve({ data: { list: [], content: [] } } as CfgDataResponse);
                  }
                } else {
                  reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
              }
            };
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send(JSON.stringify({ enumId, pageRequest: { pageSize: 1000, pageNo: 1 } }));
          });
        },
        { url: apiUrl, enumId: cfgId }
      );

      const options = response.data?.list || response.data?.content || [];
      if (options.length > 0) {
        console.log(`[CfgDataFetcher] ✓ Got ${options.length} options from ${apiUrl}`);
        return options;
      }
    } catch (error) {
      console.log(`[CfgDataFetcher] ✗ ${apiUrl} — ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.warn(`[CfgDataFetcher] No options found for cfgId: ${cfgId}`);
  return [];
}

export function convertCfgOptionsToFieldOptions(
  cfgOptions: CfgOption[]
): { label: string; value: string }[] {
  return cfgOptions.map(opt => {
    const dynamicProps = (opt as any).dynamicProps;
    if (dynamicProps) {
      return {
        label: dynamicProps.fdNameUs || dynamicProps.fdNameCn || opt.fdName || 'Unknown',
        value: opt.fdId,
      };
    }
    return { label: opt.fdName || 'Unknown', value: opt.fdId };
  });
}

export default { fetchCfgOptions, convertCfgOptionsToFieldOptions };
