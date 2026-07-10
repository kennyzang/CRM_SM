/**
 * SP3Test — 动态控件完整测试
 *
 * 测试目标: https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/xoex/add/1jo56chk4wcoow2kk3w5ddrk824imb5j3kw0
 * 表单ID: mk_model_2026050955335
 * 明细表ID: mk_model_2026050955335_d_28adn
 * 环境: SP3Test (产品环境)
 *
 * 启动命令:
 *   npm run test:sp3test -- --grep "动态控件测试"
 *   npm run test:sp3test:dynamic
 *
 * 测试内容:
 *   1. 主表：radio / checkbox / select / multiSelect 全覆盖
 *   2. 明细表：radio / checkbox（2行数据）
 *   3. 验证所有动态控件的值正确保存到 payload
 *   4. 提交表单并验证成功响应
 *
 * API 接口:
 *   POST /mkpaas/data/sys-xform/sysXFormCommonControl/executeListAll
 *   POST /sysModelingMain/add (保存表单)
 */
import { test, expect } from '@playwright/test';
import { FormTestBuilder } from '../../src/core/FormTestBuilder';
import fs from 'fs';

const FORM_ID = 'mk_model_2026050955335';
const FORM_NAME = '动态控件完整测试';
const FORM_URL = 'https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/xoex/add/1jo56chk4wcoow2kk3w5ddrk824imb5j3kw0';
const DETAIL_TABLE_ID = 'mk_model_2026050955335_d_28adn';

// 动态字段列表（用于验证）
const DYNAMIC_FIELDS = {
  main: [
    { id: 'fd_col_8jcrae', type: 'radio', label: '单选' },
    { id: 'fd_col_uz8wjj', type: 'checkbox', label: '多选' },
    { id: 'fd_col_i1upsr', type: 'select', label: '下拉单选' },
    { id: 'fd_col_xv0uju', type: 'multiSelect', label: '下拉多选' },
  ],
  detail: [
    { id: 'fd_col_4q2vly', type: 'radio', label: '明细-单选' },
    { id: 'fd_col_clth9i', type: 'checkbox', label: '明细-多选' },
  ]
};

test.describe('SP3Test — 动态控件完整测试', () => {

  test('填充所有动态控件并提交（主表+明细表）', async ({ page }) => {
    const builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: './src/schemas/sp3test',
      forceRegenerate: true,
      schemaMaxAgeHours: 0,
      detailTables: [
        {
          detailModelId: DETAIL_TABLE_ID,
          detailTableName: '明细表1',
        }
      ]
    });

    console.log('\n========== 初始化 ==========');
    await builder.initialize();
    
    console.log('\n========== 导航到表单 ==========');
    await builder.navigate();

    // 打印 Schema 信息
    const schema = builder.getSchema();
    if (schema) {
      const dynamicFields = schema.fields.filter((f: any) => f.fdType === 'dynamic');
      console.log(`[Schema] 发现 ${dynamicFields.length} 个动态控件字段:`);
      dynamicFields.forEach((field: any) => {
        console.log(`  - ${field.label} (${field.id}), renderMode: ${field.renderMode?.type || 'unknown'}`);
      });
      
      if (schema.detailTables?.length) {
        console.log(`\n[Schema] 发现 ${schema.detailTables.length} 个明细表:`);
        schema.detailTables.forEach((dt: any) => {
          const dtDynamic = dt.fields.filter((f: any) => f.fdType === 'dynamic');
          console.log(`  - ${dt.detailTableName} (${dt.detailModelId}): ${dtDynamic.length} 个动态控件`);
        });
      }
    }

    console.log('\n========== 步骤1：填充主表所有字段 ==========');
    await builder.fillAllFields();
    console.log('[Test] ✅ 主表填充完成');
    await page.waitForTimeout(1000);

    // 验证主表 MKXFORM 值
    console.log('\n========== 步骤2：验证主表动态控件值 ==========');
    const mainTableValues = await page.evaluate(() => {
      const mkxform = (window as any).MKXFORM;
      if (!mkxform) return { error: 'MKXFORM not available' };

      const results: Record<string, any> = {};
      
      for (const fieldId of ['fd_col_8jcrae', 'fd_col_uz8wjj', 'fd_col_i1upsr', 'fd_col_xv0uju']) {
        try {
          let cmp = mkxform.$(fieldId);
          if (!cmp) cmp = mkxform.$(`mk_model_2026050955335.${fieldId}`);

          if (cmp) {
            const fibre = cmp._CURRENT_FIBRE;
            const props = fibre?.props;
            
            results[fieldId] = {
              found: true,
              value: props?.value,
              renderMode: props?.renderMode,
            };
            
            console.log(`[Verify] ${fieldId}:`, JSON.stringify(props?.value)?.substring(0, 150));
          } else {
            results[fieldId] = { found: false };
            console.log(`[Verify] ${fieldId}: 未找到组件`);
          }
        } catch (e) {
          results[fieldId] = { error: String(e) };
        }
      }

      return results;
    });

    // 输出验证结果
    let mainTableOk = true;
    for (const [fieldId, info] of Object.entries(mainTableValues)) {
      if (info.found) {
        const hasValidValue = info.value && (
          (Array.isArray(info.value) && info.value.length > 0 && info.value[0]?.fdId) ||
          (typeof info.value === 'object' && !Array.isArray(info.value) && info.value?.fdId)
        );
        if (!hasValidValue) mainTableOk = false;
        const fieldInfo = DYNAMIC_FIELDS.main.find(f => f.id === fieldId);
        console.log(`${hasValidValue ? '✅' : '❌'} ${fieldId} (${fieldInfo?.type || '?'}): ${JSON.stringify(info.value)?.substring(0, 100)}`);
      } else {
        mainTableOk = false;
        console.log(`❌ ${fieldId}: ${info.error || '未找到'}`);
      }
    }

    // 截图记录主表填充结果
    await page.screenshot({
      path: 'tests/temp/dynamic-main-filled.png',
      fullPage: true
    });

    console.log('\n========== 步骤3：填充明细表（2行） ==========');
    await builder.fillDetailTable(2, DETAIL_TABLE_ID);
    console.log('[Test] ✅ 明细表填充完成');
    await page.waitForTimeout(1000);

    // 截图记录完整表单
    await page.screenshot({
      path: 'tests/temp/dynamic-complete-filled.png',
      fullPage: true
    });

    console.log('\n========== 步骤4：提交表单并捕获 Payload ==========');
    
    let capturedPayload: any = null;

    // 监听保存请求
    page.on('request', (request) => {
      if (request.url().includes('/sysModelingMain/add') && request.method() === 'POST') {
        try {
          capturedPayload = JSON.parse(request.postData() || '{}');
          
          // 保存 Payload 到文件
          fs.writeFileSync(
            'tests/temp/dynamic-payload.json',
            JSON.stringify(capturedPayload, null, 2)
          );
          
          console.log('[Test] 🎯 Payload 已捕获并保存到 tests/temp/dynamic-payload.json');
          
          // 分析 dynamicProps
          const dp = capturedPayload?.mechanisms?.['sys-xform']?.dynamicProps;
          
          if (dp) {
            console.log('\n[Test] ═══ 主表 dynamicProps ═══');
            DYNAMIC_FIELDS.main.forEach(field => {
              if (dp[field.id]) {
                console.log(`✅ ${field.id} (${field.type}): ${JSON.stringify(dp[field.id])?.substring(0, 100)}`);
              } else {
                console.log(`❌ ${field.id} (${field.type}): 缺失`);
              }
            });
            
            // 明细表数据
            const detailData = dp[DETAIL_TABLE_ID];
            if (detailData && Array.isArray(detailData)) {
              console.log(`\n[Test] ═══ 明细表数据 (${detailData.length}行) ═══`);
              detailData.forEach((row: any, idx: number) => {
                console.log(`\n--- 第${idx + 1}行 ---`);
                DYNAMIC_FIELDS.detail.forEach(field => {
                  if (row[field.id] !== undefined) {
                    console.log(`✅ ${field.id} (${field.type}): ${JSON.stringify(row[field.id])?.substring(0, 80)}`);
                  } else {
                    console.log(`❌ ${field.id} (${field.type}): 缺失`);
                  }
                });
              });
            }
          }
        } catch (e) {
          console.error('[Test] 解析 payload 失败:', e);
        }
      }
    });

    // 等待保存响应
    const responsePromise = page.waitForResponse(
      (response) => 
        response.url().includes('/sysModelingMain/add') && 
        response.request().method() === 'POST',
      { timeout: 30000 }
    );

    // 点击保存按钮
    console.log('[Test] 点击保存按钮...');
    await page.click('[data-tid="modeling-common-operation-custom-save"]');
    
    let submitSuccess = false;
    let responseData: any = null;

    try {
      const response = await responsePromise;
      responseData = await response.json();
      
      console.log(`\n[Test] ===== 保存响应 =====`);
      console.log(`[Test] 状态码: ${response.status()}`);
      console.log(`[Test] 响应体:`, JSON.stringify(responseData, null, 2));
      
      if (responseData.success === true && responseData.code === 'return.optSuccess') {
        submitSuccess = true;
        console.log(`[Test] ✅ 保存成功！新记录ID: ${responseData.data?.fdId}`);
        console.log(`[Test] ✅ 记录名称: ${responseData.data?.fdName}`);
      } else {
        console.log(`[Test] ❌ 保存失败: ${responseData.msg}`);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error(`[Test] ❌ 等待响应超时或解析失败:`, errorMessage);
    }

    // 等待页面稳定
    await page.waitForTimeout(2000);

    // 最终总结报告
    console.log('\n' + '='.repeat(60));
    console.log('📊 最终验证报告');
    console.log('='.repeat(60));

    if (capturedPayload) {
      const dp = capturedPayload.mechanisms?.['sys-xform']?.dynamicProps;
      
      // 主表验证
      console.log('\n📋 主表动态控件:');
      const mainResults = DYNAMIC_FIELDS.main.map(field => {
        const value = dp?.[field.id];
        const ok = value && (
          (Array.isArray(value) && value.length > 0 && value[0]?.fdId) ||
          (typeof value === 'object' && !Array.isArray(value) && value?.fdId)
        );
        console.log(`  ${ok ? '✅' : '❌'} ${field.id} (${field.type}): ${JSON.stringify(value)?.substring(0, 80)}`);
        return ok;
      });
      
      // 明细表验证
      const detailData = dp?.[DETAIL_TABLE_ID];
      const detailOk = detailData && Array.isArray(detailData) && 
                       detailData.some((row: any) => row['fd_col_4q2vly'] || row['fd_col_clth9i']);
      
      console.log(`\n📋 明细表动态控件: ${detailOk ? '✅ 值已保存' : '❌ 值缺失'}`);
      
      // 总体结论
      const allMainOk = mainResults.every(r => r);
      console.log(`\n🎯 结论:`);
      console.log(`  主表: ${allMainOk ? '✅ 全部通过' : `⚠️ ${mainResults.filter(r => !r).length}个失败`}`);
      console.log(`  明细表: ${detailOk ? '✅ 通过' : '❌ 失败'}`);
      console.log(`  保存响应: ${submitSuccess ? '✅ 成功' : '❌ 失败'}`);
      console.log(`  MKXFORM验证: ${mainTableOk ? '✅ 通过' : '⚠️ 部分失败'}`);
    }

    // 截图记录最终状态
    const screenshotPath = submitSuccess 
      ? 'tests/temp/dynamic-submit-success.png'
      : 'tests/temp/dynamic-submit-failure.png';
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`\n[Test] 📸 截图已保存: ${screenshotPath}`);

    // 断言
    expect(submitSuccess).toBe(true);
  });

  test('单独测试动态控件字段填充（调试用）', async ({ page }) => {
    const builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: './src/schemas/sp3test',
      forceRegenerate: true,
      schemaMaxAgeHours: 0,
    });

    await builder.initialize();
    await builder.navigate();

    console.log('[Test] 导航到表单完成');
    await page.waitForTimeout(2000);

    // 获取 Schema 信息
    const schema = builder.getSchema();
    if (!schema) {
      console.warn('[Test] Schema 为空，跳过测试');
      return;
    }
    
    const dynamicFields = schema.fields.filter((f: any) => f.fdType === 'dynamic');

    console.log(`[Test] 发现 ${dynamicFields.length} 个动态控件字段:`);
    dynamicFields.forEach((field: any) => {
      console.log(`  - ${field.label} (${field.id}), type: ${field.renderMode?.type || 'unknown'}`);
    });

    // 逐个填充并截图
    for (let i = 0; i < Math.min(dynamicFields.length, 4); i++) {
      const field = dynamicFields[i];
      console.log(`\n[Test] 开始填充第 ${i + 1} 个动态控件: ${field.label} (${field.id})`);
      
      await builder.fillField(field.id);
      console.log(`[Test] ✅ ${field.label} 填充完成`);
      
      await page.waitForTimeout(500);
      
      // 截图每个字段的填充结果
      await page.screenshot({
        path: `tests/temp/dynamic-field-${i + 1}-${field.id}.png`,
        fullPage: false
      });
    }

    console.log('\n[Test] 所有动态控件逐个填充完成');
  });
});
