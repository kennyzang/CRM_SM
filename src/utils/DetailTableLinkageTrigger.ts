/**
 * 明细表关联控件联动触发器
 *
 * 基于源码分析：
 * - el-form/widget/xform-relation/index.tsx (onChange → processOutData → getValueDetail → setOutParams)
 * - el-form/widget/xform-detail-table/table.tsx (明细表行数据更新)
 * - sys-xform/src/components/api/functions/setValue.ts (MKXFORM.setValue 实现)
 *
 * 核心问题：
 * MKXFORM.setValue() 只更新了 value prop，不会触发组件内部的完整联动链路：
 *   1. processOutData() - 加工传出数据
 *   2. getValueDetail() - API 获取详细信息
 *   3. setOutParams() - 设置其他字段的值
 *
 * 解决方案：
 * 手动执行联动链路，通过以下方式之一：
 *   A. 获取组件实例，直接调用内部方法
 *   B. 模拟完整的联动流程（API + 数据设置）
 */

import type { Page } from '@playwright/test';
import type { IOutParamItem } from '@/schema/SchemaGenerator';

declare global {
  interface Window {
    mk?: {
      emit: (event: string, data?: any) => void;
      [key: string]: any;
    };
  }
}

export interface ILinkageFieldConfig {
  /** 目标字段名（当前行） */
  targetField: string;
  /** 来源字段名（API 返回数据中的字段） */
  sourceField: string;
  /** 字段类型 */
  fdType?: string;
}

export interface IDetailTableRow {
  [key: string]: any;
}

export class DetailTableLinkageTrigger {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 触发明细表关联控件的联动（主方法）
   *
   * @param detailTableId 明细表 ID（如 mk_Principal_Allocation_list）
   * @param relationFieldId 关联控件字段名（如 fd_product_list）
   * @param rowIndex 行索引（从 0 开始）
   * @param outParams 传出参数映射（从 Schema 的 field.outParams 获取）
   * @param showColumns API 查询时需要返回的字段列表（从 outParams targetField 提取，即产品模型字段）
   * @returns 是否成功触发联动
   */
  async triggerLinkage(
    detailTableId: string,
    relationFieldId: string,
    rowIndex: number,
    outParams?: IOutParamItem[],
    showColumns?: string[],
  ): Promise<boolean> {
    console.log(`[DetailTableLinkageTrigger] 🚀 Triggering linkage for ${detailTableId}.${relationFieldId} [row ${rowIndex}]`);
    if (outParams && outParams.length > 0) {
      console.log(`[DetailTableLinkageTrigger] 📋 Using outParams (${outParams.length} mappings):`, outParams.map(p => `${p.sourceField.fdName}→${p.targetField.fdName}`).join(', '));
    }

    try {
      // 方式1：尝试通过组件实例直接调用内部方法
      const directResult = await this.tryDirectComponentCall(detailTableId, relationFieldId, rowIndex);
      if (directResult) {
        console.log(`[DetailTableLinkageTrigger] ✅ Direct component call succeeded`);
        return true;
      }

      // 方式2：手动模拟联动流程
      console.log(`[DetailTableLinkageTrigger] ⚠️ Direct call failed, trying manual linkage simulation...`);
      const manualResult = await this.simulateLinkageProcess(detailTableId, relationFieldId, rowIndex, outParams, showColumns);
      if (manualResult) {
        console.log(`[DetailTableLinkageTrigger] ✅ Manual linkage simulation succeeded`);
        return true;
      }

      console.warn(`[DetailTableLinkageTrigger] ❌ All methods failed`);
      return false;
    } catch (error) {
      console.error(`[DetailTableLinkageTrigger] Error triggering linkage:`, error);
      return false;
    }
  }

  /**
   * 方式1：尝试通过组件实例直接调用内部方法
   *
   * 原理：通过 React Fiber 访问组件实例的内部方法
   */
  private async tryDirectComponentCall(
    detailTableId: string,
    relationFieldId: string,
    rowIndex: number,
  ): Promise<boolean> {
    return this.page.evaluate(({ detailTableId, relationFieldId, rowIndex }) => {
      const mkxform = window.MKXFORM;
      if (!mkxform) {
        console.log('[DetailTableLinkageTrigger] MKXFORM not available');
        return false;
      }

      const fieldId = `${detailTableId}.${relationFieldId}`;
      const cmp = mkxform.$(fieldId);
      if (!cmp) {
        console.log(`[DetailTableLinkageTrigger] Component not found: ${fieldId}`);
        return false;
      }

      // 尝试通过 React Fiber 获取组件内部的 onChange 方法
      const fiber = cmp._CURRENT_FIBRE || cmp.__fiber;
      if (!fiber) {
        console.log('[DetailTableLinkageTrigger] React Fiber not found');
        return false;
      }

      const stateNode = fiber.stateNode;
      if (!stateNode) {
        console.log('[DetailTableLinkageTrigger] State node not found');
        return false;
      }

      // 尝试访问内部的 onChange 或 processOutData 方法
      const internalMethods = ['processOutData', 'onChange', 'handleRelationChange'];
      for (const method of internalMethods) {
        if (typeof stateNode[method] === 'function') {
          console.log(`[DetailTableLinkageTrigger] Found internal method: ${method}`);

          try {
            // 获取当前值
            const currentValue = cmp.getValue();
            if (currentValue && Array.isArray(currentValue) && currentValue.length > 0) {
              // 调用内部方法
              if (method === 'processOutData') {
                stateNode[method](currentValue);
                console.log(`[DetailTableLinkageTrigger] ✅ Called ${method}() successfully`);
                return true;
              } else if (method === 'onChange' || method === 'handleRelationChange') {
                stateNode[method](currentValue);
                console.log(`[DetailTableLinkageTrigger] ✅ Called ${method}() successfully`);

                // 等待异步操作完成
                return new Promise((resolve) => setTimeout(() => resolve(true), 2000));
              }
            }
          } catch (e) {
            console.warn(`[DetailTableLinkageTrigger] Error calling ${method}:`, e);
          }
        }
      }

      // 尝试通过 ref 获取子组件实例
      const childCmp = stateNode.selectRef?.current || stateNode.modalRef?.current;
      if (childCmp && typeof childCmp.processOutData === 'function') {
        const currentValue = cmp.getValue();
        if (currentValue && Array.isArray(currentValue) && currentValue.length > 0) {
          childCmp.processOutData(currentValue);
          console.log('[DetailTableLinkageTrigger] ✅ Called child component processOutData()');
          return true;
        }
      }

      console.log('[DetailTableLinkageTrigger] No suitable internal method found');
      return false;
    }, { detailTableId, relationFieldId, rowIndex });
  }

  /**
   * 方式2：手动模拟联动流程
   *
   * 原理：模拟 xform-relation/index.tsx 中的完整流程：
   *   1. getValueDetail() - 调用 API 获取关联数据详细信息
   *   2. setOutParams() - 将信息设置到当前行的其他字段
   *
   * @param outParams 传出参数映射（从 Schema 的 field.outParams 获取）
   * @param showColumns API 查询时需要返回的字段列表（从 outParams sourceField 提取）
   */
  private async simulateLinkageProcess(
    detailTableId: string,
    relationFieldId: string,
    rowIndex: number,
    outParams?: IOutParamItem[],
    showColumns?: string[],
  ): Promise<boolean> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`[DetailTableLinkageTrigger] Attempt ${attempt}/${MAX_RETRIES} to get relation info...`);

      try {
        // 步骤1：获取当前行的关联字段选中值
        const relationInfo = await this.page.evaluate(({ detailTableId, relationFieldId, rowIndex }) => {
          const mkxform = window.MKXFORM;
          if (!mkxform) return { error: 'MKXFORM not available' };

          const data = mkxform.getValue(detailTableId);
          if (!data || !data.values || !data.values[rowIndex]) {
            return {
              error: 'No data or row not found',
              hasData: !!data,
              hasValues: !!(data && data.values),
              valuesLength: data?.values?.length,
              rowIndex
            };
          }

          const row = data.values[rowIndex];

          // 尝试多种可能的字段名格式（动态使用 relationFieldId）
          const fieldNames = [
            `${detailTableId}.${relationFieldId}`,
            relationFieldId,
          ];

          let selectedList = null;
          for (const fieldName of fieldNames) {
            if (row[fieldName] && Array.isArray(row[fieldName]) && row[fieldName].length > 0) {
              selectedList = row[fieldName];
              console.log(`[DetailTableLinkageTrigger] Found relation value in field: ${fieldName}`);
              break;
            }
          }

          // 如果还没找到，打印所有键帮助调试
          if (!selectedList) {
            console.log(`[DetailTableLinkageTrigger] Available keys in row:`, Object.keys(row));
            console.log(`[DetailTableLinkageTrigger] Row data sample:`, JSON.stringify(row).substring(0, 500));
          }

          return {
            selectedId: selectedList?.[0]?.fdId || selectedList?.[0]?.fd_id,
            selectedName: selectedList?.[0]?.fdName || selectedList?.[0]?.fd_name,
            selectedListLength: selectedList?.length || 0,
            rowData: row,
            allKeys: Object.keys(row),
            error: selectedList ? null : 'Relation value not found in any expected field'
          };
        }, { detailTableId, relationFieldId, rowIndex });

        // 详细日志输出
        if (relationInfo.error) {
          console.log(`[DetailTableLinkageTrigger] ⚠️ Attempt ${attempt}: ${relationInfo.error}`);
          
          if (attempt < MAX_RETRIES) {
            console.log(`[DetailTableLinkageTrigger] Waiting ${RETRY_DELAY_MS}ms before retry...`);
            await this.page.waitForTimeout(RETRY_DELAY_MS);
            continue;
          }
          
          console.log(`[DetailTableLinkageTrigger] ❌ All ${MAX_RETRIES} attempts failed`);
          console.log(`[DetailTableLinkageTrigger] Final debug info:`, JSON.stringify({
            hasData: relationInfo.hasData,
            valuesLength: relationInfo.valuesLength,
            allKeys: relationInfo.allKeys
          }));
          return false;
        }

        if (!relationInfo.selectedId) {
          console.log(`[DetailTableLinkageTrigger] No relation selected in row ${rowIndex} (attempt ${attempt})`);
          
          if (attempt < MAX_RETRIES) {
            await this.page.waitForTimeout(RETRY_DELAY_MS);
            continue;
          }
          
          return false;
        }

        // 成功获取到关联选中信息
        console.log(`[DetailTableLinkageTrigger] ✅ Successfully got relation info on attempt ${attempt}`);
        console.log(`[DetailTableLinkageTrigger] Selected ID: ${relationInfo.selectedId}`);
        console.log(`[DetailTableLinkageTrigger] Selected Name: ${relationInfo.selectedName}`);

        // 步骤2：调用 API 获取关联数据的详细信息（模拟 getValueDetail）
        let detailData = await this.fetchRelationDetail(
          detailTableId,
          relationFieldId,
          relationInfo.selectedId,
          showColumns,
        );
        if (!detailData) {
          console.warn(`[DetailTableLinkageTrigger] Failed to fetch relation detail`);
          return false;
        }

        console.log(`[DetailTableLinkageTrigger] Relation detail fetched:`, Object.keys(detailData));

        // 步骤3：将详细信息设置到当前行的其他字段（模拟 setOutParams）
        // 🔑 关键：根据 outParams 动态映射字段
        if (outParams && outParams.length > 0) {
          await this.applyLinkageFieldsToRow(detailTableId, rowIndex, detailData, outParams);
        } else {
          console.warn(`[DetailTableLinkageTrigger] ⚠️ No outParams provided, skipping field mapping`);
        }

        // 步骤4：触发明细表的数据更新事件
        await this.triggerDetailTableUpdate(detailTableId, rowIndex);

        console.log(`[DetailTableLinkageTrigger] ✅ Linkage simulation completed`);
        return true;
      } catch (error) {
        console.error(`[DetailTableLinkageTrigger] Error in simulation (attempt ${attempt}):`, error);
        
        if (attempt < MAX_RETRIES) {
          console.log(`[DetailTableLinkageTrigger] Retrying after error...`);
          await this.page.waitForTimeout(RETRY_DELAY_MS);
          continue;
        }
        
        return false;
      }
    }  // end for loop
    
    return false;  // Should not reach here
  }

  /**
   * 调用 API 获取关联数据详细信息
   *
   * 模拟 xform-relation/index.tsx 中的 getOptionData 调用
   *
   * @param detailTableId 明细表 ID
   * @param relationFieldId 关联字段名
   * @param selectedId 已选中的数据 ID
   * @param showColumns API 查询时需要返回的字段列表（从 outParams sourceField 提取）
   */
  private async fetchRelationDetail(
    detailTableId: string,
    relationFieldId: string,
    selectedId: string,
    showColumns?: string[],
  ): Promise<any | null> {
    // 构建查询字段列表：优先使用 outParams 推导的 showColumns，兜底使用通用字段
    const columns = showColumns && showColumns.length > 0
      ? ['fd_id', 'fd_name', ...showColumns]  // 始终包含 fd_id 和 fd_name 用于匹配和显示
      : ['fd_id', 'fd_name'];

    return this.page.evaluate(async ({ detailTableId, relationFieldId, selectedId, columns }) => {
      try {
        // 从页面 URL 提取 xformId
        const url = window.location.href;
        const match = url.match(/\/add\/([^/?]+)/);
        const xformId = match ? match[1] : '';

        if (!xformId) {
          console.error('[DetailTableLinkageTrigger] Cannot extract xformId from URL');
          return null;
        }

        // 构建请求体
        const requestBody = {
          xformId,
          docId: '',
          controlId: `${detailTableId}.${relationFieldId}`,
          dynamic: {},
          showColumns: columns,
          queryRequest: {
            pageNo: 1,
            pageSize: 10,
            conditions: {
              $and: [{
                fd_id: { '$eq': selectedId }
              }]
            }
          }
        };

        console.log('[DetailTableLinkageTrigger] Fetching relation detail with:', JSON.stringify(requestBody).substring(0, 200));

        const response = await fetch('/data/sys-modeling/xform/associate/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          credentials: 'include',
        });

        if (!response.ok) {
          console.error(`[DetailTableLinkageTrigger] ❌ API request failed: HTTP ${response.status}`);
          let respText = '';
          try { respText = await response.text(); } catch(e) {}
          console.error(`[DetailTableLinkageTrigger] Response body: ${respText?.substring(0, 300)}`);
          return null;
        }

        const json = await response.json();

        if (!json.success) {
          console.error('[DetailTableLinkageTrigger] ❌ API returned success=false:', JSON.stringify(json).substring(0, 300));
          return null;
        }

        const contentArr = json.data?.content;
        if (!contentArr || !Array.isArray(contentArr)) {
          console.error(`[DetailTableLinkageTrigger] ❌ No content array in response, data keys:`, json.data ? Object.keys(json.data) : 'null');
          return null;
        }

        console.log(`[DetailTableLinkageTrigger] API returned ${contentArr.length} items, searching for id=${selectedId}`);
        if (contentArr.length > 0) {
          console.log(`[DetailTableLinkageTrigger] First item keys:`, Object.keys(contentArr[0]));
          console.log(`[DetailTableLinkageTrigger] First item sample:`, JSON.stringify(contentArr[0]).substring(0, 300));
        }

        // 尝试多种 ID 字段匹配
        const item = contentArr.find((item: Record<string, unknown>) =>
          item.fd_id === selectedId || item.fdId === selectedId || item.id === selectedId
        );
        if (item) {
          console.log('[DetailTableLinkageTrigger] ✅ Relation detail retrieved:', Object.keys(item));
          return item;
        }

        console.warn(`[DetailTableLinkageTrigger] ⚠️ Item ${selectedId} not found in ${contentArr.length} results`);
        return null;
      } catch (error) {
        console.error('[DetailTableLinkageTrigger] Error fetching relation detail:', error);
        return null;
      }
    }, { detailTableId, relationFieldId, selectedId, columns });
  }

  /**
   * 将联动字段应用到当前行（基于 outParams 配置的动态映射）
   *
   * 模拟 setOutParams 的逻辑：
   * - targetField.fdName → 产品模型字段（从 API 返回读取）
   * - sourceField.fdName → 明细表字段（写入目标）
   * - 将 API 返回的数据中 targetField.fdName 的值，设置到 sourceField.fdName
   */
  private async applyLinkageFieldsToRow(
    detailTableId: string,
    rowIndex: number,
    detailData: any,
    outParams: IOutParamItem[],
  ): Promise<void> {
    // 🔑 构建映射列表：targetField=产品模型字段(API读取), sourceField=明细表字段(写入)
    const mappings = outParams.map(p => ({
      source: p.targetField.fdName,   // API 响应中的产品模型字段
      target: p.sourceField.fdName,   // 明细表中要写入的字段
    }));

    console.log(`[DetailTableLinkageTrigger] 📋 Applying ${mappings.length} field mappings:`);
    mappings.forEach(m => console.log(`    ${m.source} → ${m.target}`));

    await this.page.evaluate(({ detailTableId, rowIndex, detailData, mappings }) => {
      const mkxform = window.MKXFORM;
      if (!mkxform) return;

      const currentData = mkxform.getValue(detailTableId);
      if (!currentData || !currentData.values || !currentData.values[rowIndex]) {
        console.error('[DetailTableLinkageTrigger] Invalid detail table data');
        return;
      }

      const row = currentData.values[rowIndex];
      const updatedControls: Array<{ fieldId: string; value: unknown }> = [];

      // 🔑 根据 outParams 动态映射字段
      mappings.forEach(({ source, target }: { source: string; target: string }) => {
        const sourceValue = detailData[source];

        // 检查源字段是否有值
        if (sourceValue !== undefined && sourceValue !== null) {
          const oldTargetValue = row[target];

          // 只有当值真正变化时才更新
          if (JSON.stringify(oldTargetValue) !== JSON.stringify(sourceValue)) {
            row[target] = sourceValue;
            updatedControls.push({
              fieldId: `${detailTableId}.${target}`,
              value: sourceValue,
            });
            console.log(`[DetailTableLinkageTrigger]   ✓ ${source}(${JSON.stringify(sourceValue)?.substring(0, 50)}) → ${target}`);
          }
        } else {
          console.log(`[DetailTableLinkageTrigger]   ⚠️ Source field "${source}" has no value, skipping → ${target}`);
        }
      });

      if (updatedControls.length > 0) {
        // 优先使用 updateControl 逐字段更新（可绕过非可编辑字段过滤）
        let anyUpdated = false;
        for (const { fieldId, value } of updatedControls) {
          if (typeof mkxform.updateControl === 'function') {
            mkxform.updateControl(fieldId, rowIndex, value);
            console.log(`[DetailTableLinkageTrigger]   updateControl: ${fieldId}[${rowIndex}] =`, JSON.stringify(value)?.substring(0, 80));
            anyUpdated = true;
          }
        }
        if (!anyUpdated) {
          // 回退到 setValue
          mkxform.setValue(detailTableId, currentData);
        }
        console.log(`[DetailTableLinkageTrigger] ✅ Row data updated: ${updatedControls.length} fields set`);
      } else {
        console.log('[DetailTableLinkageTrigger] ⚠️ No fields updated (all values same or source empty)');
      }
    }, { detailTableId, rowIndex, detailData, mappings });
  }

  /**
   * 触发明细表的数据更新事件
   *
   * 确保明细表组件重新渲染并显示更新后的数据
   */
  private async triggerDetailTableUpdate(detailTableId: string, rowIndex: number): Promise<void> {
    await this.page.evaluate(({ detailTableId, rowIndex }) => {
      const mkxform = window.MKXFORM;
      if (!mkxform) return;

      const table = mkxform.$(detailTableId);
      if (!table) return;

      // 尝试多种方式触发明细表更新
      const updateMethods = ['forceUpdate', 'refresh', 'reload', 'update'];

      for (const method of updateMethods) {
        if (typeof table[method] === 'function') {
          try {
            table[method]();
            console.log(`[DetailTableLinkageTrigger] Triggered table.${method}()`);
            break;
          } catch (e) {
            // ignore
          }
        }
      }

      // 触发自定义事件通知明细表数据已变化
      if (window.mk && typeof window.mk.emit === 'function') {
        window.mk.emit('XFORM_DETAIL_TABLE_DATA_CHANGE', {
          tableName: detailTableId,
          rowIndex,
        });
      }
    }, { detailTableId, rowIndex });

    // 等待 UI 更新
    await this.page.waitForTimeout(1000);
  }

  /**
   * 批量触发明细表多行联动
   *
   * @param detailTableId 明细表 ID
   * @param relationFieldId 关联控件字段名
   * @param rowCount 总行数
   * @returns 成功触发的行数
   */
  async triggerBatchLinkage(
    detailTableId: string,
    relationFieldId: string,
    rowCount: number,
    outParams?: IOutParamItem[],
    showColumns?: string[],
  ): Promise<number> {
    console.log(`\n[DetailTableLinkageTrigger] 📦 Batch triggering linkage for ${rowCount} rows...`);

    let successCount = 0;

    for (let i = 0; i < rowCount; i++) {
      console.log(`[DetailTableLinkageTrigger] → Processing row ${i + 1}/${rowCount}`);

      const success = await this.triggerLinkage(detailTableId, relationFieldId, i, outParams, showColumns);
      if (success) {
        successCount++;
      }

      // 行间等待，避免并发问题
      await this.page.waitForTimeout(500);
    }

    console.log(`[DetailTableLinkageTrigger] ✅ Batch linkage completed: ${successCount}/${rowCount} rows succeeded\n`);
    return successCount;
  }

  /**
   * 验证联动字段是否已填充
   */
  async verifyLinkageFields(
    detailTableId: string,
    rowIndex: number,
  ): Promise<{ filled: boolean; fields: Record<string, any> }> {
    return this.page.evaluate(({ detailTableId, rowIndex }) => {
      const mkxform = window.MKXFORM;
      if (!mkxform) return { filled: false, fields: {} };

      const data = mkxform.getValue(detailTableId);
      if (!data || !data.values || !data.values[rowIndex]) {
        return { filled: false, fields: {} };
      }

      const row = data.values[rowIndex];
      const checkFields = ['fd_product_principal', 'fd_sm_cost', 'fd_sm_s_price', 'fd_product_type'];
      const fields: Record<string, any> = {};
      let filled = true;

      checkFields.forEach(field => {
        const value = row[field];
        fields[field] = value;

        if (value === undefined || value === null || value === '') {
          filled = false;
        }
      });

      return { filled, fields };
    }, { detailTableId, rowIndex });
  }
}
