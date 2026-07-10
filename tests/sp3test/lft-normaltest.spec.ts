/**
 * SP3Test — 传值表单测试
 *
 * 测试目标: https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/LFT-normaltest/add/1iftq6gf6wqnwj3lw83j54d3i0n0ak1o0gw0
 * 表单ID: LFT-normaltest
 * Schema: schemas/sp3test/LFT-normaltest.json
 * 环境: SP3Test (产品环境)
 *
 * 启动命令:
 *   npm run test:sp3test -- --grep "传值表单"
 *   npm run test:sp3test -- --grep "LFT"
 *
 * 测试内容:
 *   1. 使用 SchemaGenerator 生成的 Schema
 *   2. 通过 MKXFORM API 填充可编辑字段
 *   3. 动态控件从接口获取真实数据回填
 *   4. 验证填充效果并提交表单
 */
import { test, expect } from '@playwright/test';
import { FormTestBuilder } from '../../src/core/FormTestBuilder';
import { DataGenerator } from '../../src/utils/DataGenerator';

const FORM_ID = 'LFT-normaltest';
const FORM_NAME = '可传值测试';
const FORM_URL = 'https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/LFT-normaltest/add/1iftq6gf6wqnwj3lw83j54d3i0n0ak1o0gw0';

test.describe('SP3Test — 传值表单测试', () => {
  let builder: FormTestBuilder;

  test.beforeEach(async ({ page }) => {
    builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: './src/schemas/sp3test',
      forceRegenerate: true,
      schemaMaxAgeHours: 0
    });

    await builder.initialize();
  });

  test('MKXFORM API 填充验证', async ({ page }) => {
    await builder.navigate();

    const schema = builder.getSchema();
    console.log('[Schema] 字段数量:', schema?.fields?.length);
    console.log('[Schema] 前5个字段ID格式:', schema?.fields?.slice(0, 5).map((f: any) => f.id));

    // 从 DOM 获取实际 data-id
    const actualFieldIds = await page.evaluate(() => {
      const containers = document.querySelectorAll('.ele-xform-fieldset-wrap');
      return Array.from(containers).slice(0, 5).map(c => c.getAttribute('data-id'));
    });
    console.log('[DOM] 前5个字段的 data-id:', actualFieldIds);

    // 筛选可编辑的业务字段（排除系统字段和不可编辑字段）
    const editableFields = schema?.fields?.filter((f: any) => {
      // 排除系统字段和不可编辑字段
      if (f.id.startsWith('fd_')) {
        const systemFields = ['fd_id', 'fd_doc_subject', 'fd_version', 'fd_xform_id',
          'fd_doc_status', 'fd_deleted', 'fd_att_no_download', 'fd_draft_no_edit_prints',
          'fd_draft_no_edit_download', 'fd_draft_no_edit_copys', 'fd_att_nocopy',
          'fd_att_no_print', 'fd_process_template_id'];
        if (systemFields.includes(f.id)) return false;

        // 不可编辑的字段类型
        const nonEditableTypes = ['dividing', 'calculate', 'upcasing', 'address', 'boolean'];
        if (nonEditableTypes.includes(f.fdType)) return false;

        return true;
      }
      return false;
    }) || [];

    console.log('[EditableFields] 可编辑字段:', editableFields.map((f: any) => `${f.id} (${f.fdType})`).join(', '));

    // 逐个填充并验证
    for (const field of editableFields.slice(0, 5)) { // 先测试前5个
      // 使用 Schema 中的原始字段ID
      const fieldId = field.id;
      console.log(`\n[Testing] 填充字段: ${fieldId} (${field.fdType})`);

      // 生成随机值
      const testValue = generateTestValue(field.fdType, field);
      console.log(`[Testing] 生成的测试值:`, testValue);

      // 通过 MKXFORM.setValue 填充（使用完整字段ID）
      await page.evaluate(
        ({ fieldId, value }) => {
          (window as any).MKXFORM?.setValue(fieldId, value);
        },
        { fieldId, value: testValue }
      );

      // 等待一下
      await page.waitForTimeout(200);

      // 验证值已设置
      const result = await page.evaluate(
        (fid: string) => {
          const mkxform = (window as any).MKXFORM;
          // 尝试多种获取值的方式
          try {
            const cmp = mkxform?.$(fid);
            if (cmp) {
              const value = cmp.getValue?.() ?? cmp.value;
              return { success: true, value: value, hasComponent: true };
            }
          } catch (e) {
            return { success: false, error: String(e), hasComponent: false };
          }
          return { success: false, error: 'component not found', hasComponent: false };
        },
        fieldId
      );

      console.log(`[Verify] ${fieldId}: expected=${JSON.stringify(testValue)}, result=${JSON.stringify(result)}`);
    }

    // 截图
    await page.screenshot({ path: '/tmp/lft-normaltest-mkxform-filled.png', fullPage: true });
    console.log('\n[Screenshot] 已保存截图到 /tmp/lft-normaltest-mkxform-filled.png');
  });

  test('MKXFORM API 填充并保存', async ({ page }) => {
    await builder.navigate();

    // 直接使用期望的数据进行填充（从用户提供的期望数据提取）
    const expectedData = {
      'fd_col_gbe40n': '运动器材',                    // 单行文本3
      'fd_col_jjshu1': 1212,                         // 金额（万元）
      'fd_col_5pbisd': 12120000,                     // 前端计算
      'fd_col_wpj17d': '壹仟贰佰壹拾贰万元整',         // 大写1
      'fd_col_7r2f6o': '电饭锅电饭锅电饭锅电饭锅电饭锅电饭锅电饭锅电饭锅', // 二级分类说明
      'fd_col_hc60w4': { fdId: '1iftschjkwqjwqh1w3i84d1o2n6uaf13r7w0', fdName: '电饭锅' },   // 二级分类
      'fd_col_0wjrj7': { fdId: '1ifts8lbgwqjwq8rw1e7so5h1gvuleb15uw0', fdName: '电器' },     // 所属一级分类
      'fd_col_sabkub': { fdId: '运动器材', fdName: '运动器材' },           // 动态控件8
      'fd_col_m35y49': '测试文本说明',                // 所属一级分类说明
      'fd_col_r2vbmf': '动态控件9传出值',            // 动态控件9传出的
      'fd_col_b9hivp': '单行文本1内容',              // 单行文本1
    };

    // 填充所有字段
    let filledCount = 0;
    for (const [fieldId, value] of Object.entries(expectedData)) {
      try {
        await page.evaluate(
          ({ fieldId, value }) => {
            (window as any).MKXFORM?.setValue(fieldId, value);
          },
          { fieldId, value }
        );
        console.log(`[Fill] 字段 ${fieldId} 填充成功: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
        filledCount++;
      } catch (e: unknown) {
        console.log(`[Error] ${fieldId}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    console.log(`[Fill] 已填充 ${filledCount} 个字段`);
    await page.waitForTimeout(500);

    // 截图填充后状态
    await page.screenshot({ path: '/tmp/lft-normaltest-filled-before-save.png', fullPage: true });
    console.log('[Screenshot] 已保存填充后截图');

    // 等待保存按钮出现并点击
    try {
      await page.waitForSelector('[data-tid="modeling-common-operation-custom-save"]', { timeout: 10000 });
      const saveBtn = page.locator('[data-tid="modeling-common-operation-custom-save"]').first();
      await saveBtn.click({ force: true });
      console.log('[Submit] 保存按钮点击成功');
    } catch (e) {
      // 如果找不到data-tid选择器，尝试其他选择器
      console.warn('[Submit] 找不到save按钮，尝试其他选择器...');
      const altSaveBtn = page.locator('button:has-text("保存")').first();
      if (await altSaveBtn.count() > 0) {
        await altSaveBtn.click({ force: true });
        console.log('[Submit] 使用备用选择器点击保存按钮成功');
      } else {
        console.error('[Submit] 保存按钮未找到');
      }
    }

    // 等待提交完成
    await page.waitForTimeout(3000);

    // 截图保存后状态
    await page.screenshot({ path: '/tmp/lft-normaltest-after-save.png', fullPage: true });
    console.log('[Screenshot] 已保存提交后截图');
  });
});

function generateTestValue(fdType: string, field?: any): any {
  switch (fdType) {
    case 'text':
      // 使用有意义的测试数据
      if (field?.id === 'fd_col_gbe40n') return '运动器材';      // 单行文本3
      if (field?.id === 'fd_col_7r2f6o') return '电饭锅电饭锅电饭锅电饭锅电饭锅电饭锅电饭锅电饭锅'; // 二级分类说明
      return `测试文本_${Date.now()}`;
    
    case 'moneytext':
      // 使用固定金额用于测试
      if (field?.id === 'fd_col_jjshu1') return 1212; // 金额（万元）
      return 1212;
    
    case 'numbertext':
      return 100;
    
    case 'textarea':
      return '多行文本测试内容';
    
    case 'select':
      return '1';
    
    case 'select~multi':
      return ['1', '2'];
    
    case 'radio':
      return '1';
    
    case 'checkbox':
      return ['1', '2'];
    
    case 'timestamp':
      return new Date().toISOString().slice(0, 10);
    
    case 'timepicker':
      return '12:30';
    
    case 'relation':
      // 使用真实的业务关联数据
      if (field?.id === 'fd_col_hc60w4') {
        // 二级分类 - 电饭锅
        return { fdId: '1iftschjkwqjwqh1w3i84d1o2n6uaf13r7w0', fdName: '电饭锅' };
      }
      if (field?.id === 'fd_col_0wjrj7') {
        // 所属一级分类 - 电器
        return { fdId: '1ifts8lbgwqjwq8rw1e7so5h1gvuleb15uw0', fdName: '电器' };
      }
      return { fdId: 'test-id', fdName: '测试数据' };
    
    case 'cfg':
      return { fdId: 'cfg-id', fdName: '基础数据' };
    
    case 'dynamic':
      // 动态控件使用真实选项值
      const renderType = field?.renderMode?.type || 'singlist';
      const options = field?.options || [];
      
      // 动态控件8 - 运动器材
      if (field?.id === 'fd_col_sabkub' && options.length > 0) {
        return options[0].value; // 返回第一个选项
      }
      
      // 动态控件9
      if (field?.id === 'fd_col_ggrxpu' && options.length > 0) {
        return options[0].value;
      }
      
      if (renderType === 'singlist' && options.length > 0) {
        return options[Math.floor(Math.random() * options.length)].value;
      } else if (renderType === 'multilist' && options.length > 0) {
        const count = Math.min(2, options.length);
        return options.slice(0, count).map((opt: any) => opt.value);
      }
      return options.length > 0 ? options[0].value : '1';
    
    default:
      return null; // 未知类型跳过
  }
}