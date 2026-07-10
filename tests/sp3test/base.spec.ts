/**
 * SP3Test — 基础控件测试
 *
 * 测试目标: https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/xoex/add/1j8mp363lw7o2w1cj6w310l96c2fasdj63w0
 * 表单ID: mk_model_202510291co55
 * 明细表ID: mk_model_202510291co55_d_fw62y, mk_model_202510291co55_d_7nm7e
 * 环境: SP3Test (产品环境)
 *
 * 启动命令:
 *   npm run test:sp3test:base
 *   npm run test:sp3test -- --grep "基础控件测试"
 *
 * 测试内容: 使用 Mock 数据库生成的真实数据填充主表和两个明细表（2行），提交表单
 */
import { test } from '@playwright/test';
import { FormTestBuilder } from '../../src/core/FormTestBuilder';
import { MockDatabase } from '../../src/mock/MockDatabase';

const FORM_ID = 'mk_model_202510291co55';
const FORM_NAME = '基础控件测试_sp3test';
const FORM_URL = 'https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/xoex/add/1j8mp363lw7o2w1cj6w310l96c2fasdj63w0';
const DETAIL_TABLE_ID = 'mk_model_202510291co55_d_fw62y';
const DETAIL_TABLE_ID_1 = 'mk_model_202510291co55_d_7nm7e';

test.describe('SP3Test — 基础控件测试', () => {
  let builder: FormTestBuilder;

  test.beforeEach(async ({ page }) => {
    builder = new FormTestBuilder(page, {
      formId: FORM_ID,
      formName: FORM_NAME,
      url: FORM_URL,
      schemaPath: './src/schemas/sp3test',
      forceRegenerate: true,
      schemaMaxAgeHours: 0,
      detailTables: [
        { detailModelId: DETAIL_TABLE_ID, detailTableName: '明细表' },
        { detailModelId: DETAIL_TABLE_ID_1, detailTableName: '明细表1' }
      ]
    });

    await builder.initialize();
  });

  test('填充主表和两个明细表（Mock数据，2行明细表）', async ({ page }) => {
    await builder.navigate();

    // 使用 MockDatabase 填充主表的姓名和备注字段
    const mainPerson = MockDatabase.generatePersonProfile();
    console.log('[Test] 主表数据:', JSON.stringify(mainPerson, null, 2));
    
    // 单独填充主表的姓名和备注（使用有意义的数据）
    await builder.fillField('fd_name', mainPerson.name);
    await builder.fillField('fd_note', mainPerson.note);

    // 其他主表字段使用默认随机填充
    await builder.fillAllFields();

    // 明细表使用 MockDatabase 生成的数据
    const person1 = MockDatabase.generatePersonProfile();
    const person2 = MockDatabase.generatePersonProfile();

    // 使用 __AUTO__ 标记让选项类字段自动随机填充
    const detailRowsData = [
      {
        fd_name: person1.name,
        fd_note: person1.note,
        fd_gender: '__AUTO__',      // 自动随机选择
        fd_inserest: '__AUTO__',    // 自动随机选择
        fd_post: '__AUTO__',        // 自动随机选择
        fd_birthday: new Date(person1.birthday).getTime(),
        fd_salary_cur: person1.currentSalary,
        fd_salary: person1.expectedSalary,
        fd_skill: '__AUTO__',       // 自动随机选择
        fd_time: '__AUTO__',        // 自动随机选择
      },
      {
        fd_name: person2.name,
        fd_note: person2.note,
        fd_gender: '__AUTO__',      // 自动随机选择
        fd_inserest: '__AUTO__',    // 自动随机选择
        fd_post: '__AUTO__',        // 自动随机选择
        fd_birthday: new Date(person2.birthday).getTime(),
        fd_salary_cur: person2.currentSalary,
        fd_salary: person2.expectedSalary,
        fd_skill: '__AUTO__',       // 自动随机选择
        fd_time: '__AUTO__',        // 自动随机选择
      }
    ];

    console.log('[Test] 填充明细表（2行）:', JSON.stringify(detailRowsData, null, 2));
    await builder.fillDetailTableWithData(detailRowsData, DETAIL_TABLE_ID);

    // 明细表1使用随机生成的文本数据
    const detail1RowsData = [
      {
        fd_col_j21kpo: MockDatabase.generateNote(),
        fd_col_ouvtwp: MockDatabase.generateName()
      },
      {
        fd_col_j21kpo: MockDatabase.generateNote(),
        fd_col_ouvtwp: MockDatabase.generateName()
      }
    ];

    console.log('[Test] 填充明细表1（2行）:', JSON.stringify(detail1RowsData, null, 2));
    await builder.fillDetailTableWithData(detail1RowsData, DETAIL_TABLE_ID_1);

    await builder.submit();

    console.log('[Test] 主表和明细表填充完成并已提交');
  });
});