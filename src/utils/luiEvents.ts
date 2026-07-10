import type { Page } from '@playwright/test';

/**
 * LUI 组件事件工具
 *
 * 基于以下源码分析：
 * - lui/packages/core/src/components/Select/generate.tsx
 * - lui/packages/core/src/components/Cascader/cascader.tsx
 * - el-form/widget/xform-association/index.tsx
 *
 * 核心发现：
 * 1. Select 通过 triggerChange() 调用 onChange(value, option)
 * 2. Cascader 通过 props.onChange(mergedKeys, mergedItems) 更新值
 * 3. xform-association 通过 currentValue state 和 onChange 回调更新
 */

/**
 * 触发 LUI Select 的值变更
 *
 * Select 组件内部通过 triggerChange() 调用 onChange(value, option)
 */
export async function luiSelectSetValue(
  page: Page,
  selector: string,
  value: string | string[],
): Promise<void> {
  const values = Array.isArray(value) ? value : [value];

  await page.evaluate(
    ({ sel, vals }) => {
      const container = document.querySelector(sel) as HTMLElement;
      if (!container) return;

      // 查找内部的 input/隐藏字段并设置值
      const input = container.querySelector('input[type="hidden"], input[name]') as HTMLInputElement;
      if (input) {
        input.value = vals.join(',');
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },
    { sel: selector, vals: values },
  );
}

/**
 * 触发 LUI Cascader 的值变更
 *
 * Cascader 通过 props.onChange(mergedKeys, mergedItems) 更新值
 */
export async function luiCascaderSetValue(
  page: Page,
  selector: string,
  keys: string[],
): Promise<void> {
  await page.evaluate(
    ({ sel, k }) => {
      const container = document.querySelector(sel) as HTMLElement;
      if (!container) return;

      // 查找隐藏输入字段
      const input = container.querySelector('input[type="hidden"]') as HTMLInputElement;
      if (input) {
        input.value = JSON.stringify(k);
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    },
    { sel: selector, k: keys },
  );
}

/**
 * 等待 LUI Select 面板中的选项渲染完成
 */
export async function waitForLuiSelectOptions(
  page: Page,
  timeout = 8000,
): Promise<boolean> {
  try {
    await page.waitForFunction(
      () => {
        const options = document.querySelectorAll(
          '.lui-select-item:not(.lui-select-item-disabled)',
        );
        return options.length > 0;
      },
      { timeout },
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * 等待 LUI Cascader 面板渲染完成
 */
export async function waitForLuiCascaderPanel(
  page: Page,
  timeout = 8000,
): Promise<boolean> {
  try {
    await page.waitForFunction(
      () => {
        const panel = document.querySelector('.lui-cascader-panel');
        const items = document.querySelectorAll('.lui-cascade-item');
        return panel !== null && items.length > 0;
      },
      { timeout },
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * 查找 LUI Select 的触发器元素选择器
 */
export function getLuiSelectTriggerSelector(fieldId: string): string[] {
  return [
    `.ele-xform-fieldset-wrap[data-id*="${fieldId}"] .lui-select-selector`,
    `.lui-select-selector:has(#rc_select_${fieldId})`,
    `#rc_select_${fieldId}`,
    `.lui-select-selector`,
  ];
}

/**
 * 查找 LUI Cascader 的触发器元素选择器
 */
export function getLuiCascaderTriggerSelector(fieldId: string): string[] {
  return [
    `.ele-xform-fieldset-wrap[data-id*="${fieldId}"] .lui-cascader-selector`,
    `.lui-cascader-selector`,
    `.lui-cascader`,
  ];
}

/**
 * 获取组件值（通过 React Fiber）
 * 用于验证值是否真正被组件接收
 */
export async function getComponentValue(
  page: Page,
  fieldId: string,
): Promise<unknown> {
  return page.evaluate((id) => {
    const cmp = window.MKXFORM?.$(id) as any;
    if (cmp) {
      return cmp.getValue?.() ?? cmp.value ?? cmp._CURRENT_FIBRE?.memoizedProps?.value;
    }
    return null;
  }, fieldId);
}

/**
 * 获取组件选项（通过 React Fiber）
 */
export async function getComponentOptions(
  page: Page,
  fieldId: string,
): Promise<unknown[]> {
  return page.evaluate((id) => {
    const cmp = window.MKXFORM?.$(id) as any;
    if (cmp) {
      return cmp._CURRENT_FIBRE?.memoizedProps?.options ?? [];
    }
    return [];
  }, fieldId);
}
