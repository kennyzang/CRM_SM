/**
 * generate-test-output.ts — 从现有 YAML 读取数据重新生成 Excel
 *
 * 读取 zh/ en/ admin_zh/ admin_en 下的 YAML 文件，
 * 重新生成格式化的 Excel (颜色/冻结/筛选/状态下拉)
 */
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';


const OUTPUT_BASE = path.join(__dirname, '..', 'doc/SM测试用例-收集箱/AI输出/基础功能用例');
const DIRS = ['zh', 'en', 'admin_zh', 'admin_en'];

// 业务流顺序：联系人 → 线索 → 客户 → 商机 → P&L → 报价单 → PO → SO → 交付 → 开票 → 回款 → 产品 → 合同 → 管道看板
const ZH_MODULE_ORDER = ['联系人', '线索', '客户', '商机', 'P&L', '报价单', '采购订单', '销售订单', '交付', '开票申请', '回款', '产品', '合同', '管道看板'];
const EN_MODULE_ORDER = ['Contact', 'Lead', 'Customer', 'Opportunity', 'P&L', 'Quotation', 'PO', 'Sales Order', 'Delivery', 'Invoice', 'Collection', 'Product', 'Contract', 'Pipeline Kanban'];

interface TestCase {
  id: string; module: string; name: string; category: string;
  role: string; priority: string; precondition: string; steps: string;
  expected: string; status: string; notes: string;
}

function parseYaml(filepath: string): TestCase[] {
  const text = fs.readFileSync(filepath, 'utf-8');
  const cases: TestCase[] = [];
  // Simple parser: split by "  - id:"
  const blocks = text.split('\n  - id:').slice(1);
  for (const block of blocks) {
    const id = block.match(/^([^\n]+)/)?.[1] || '';
    const module = block.match(/module:\s*(.+)/)?.[1] || '';
    const name = block.match(/name:\s*(.+)/)?.[1] || '';
    const category = block.match(/category:\s*(.+)/)?.[1] || '';
    const role = block.match(/role:\s*(.+)/)?.[1] || '';
    const priority = block.match(/priority:\s*(.+)/)?.[1] || '';
    const status = block.match(/status:\s*(.+)/)?.[1] || '';
    const ext = (tag: string) => {
      // Find header `    tag: |` then collect lines until the next top-level field
      const lines = block.split('\n');
      const headerRe = new RegExp(`^ {2,4}${tag}: \\|\\s*$`);
      let i = 0;
      for (; i < lines.length; i++) {
        if (headerRe.test(lines[i])) { i++; break; }
      }
      if (i === 0 || i > lines.length) return '';
      const collected: string[] = [];
      // Stop at next field header. Match either `    keyword: |` (yaml block scalar)
      // or `    keyword: value` (single-line value, no extra content after)
      const nextFieldRe = /^ {2,4}(?![\d\-\.])\w+:(?:\s*\||\s*[^\n]*)$/;
      for (; i < lines.length; i++) {
        const l = lines[i];
        if (nextFieldRe.test(l)) break;
        if (/^\s*-\s*id:\s*TC-/.test(l)) break;
        collected.push(l.replace(/^\s+/, ''));
      }
      return collected.filter(l => l.trim()).join('\n');
    };

    cases.push({
      id: id.trim(),
      module: module.trim(),
      name: name.trim(),
      category: category.trim(),
      role: role.trim(),
      priority: priority.trim(),
      precondition: ext('precondition'),
      steps: ext('steps'),
      expected: ext('expected'),
      status: status.trim(),
      notes: ext('notes'),
    });
  }
  return cases;
}

// ── Status colors ──
const STATUS_FILL: Record<string, ExcelJS.Fill> = {
  '未测试': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } },
  '通过': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4F4D2' } },
  '失败': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAD4D4' } },
  '阻塞': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE0B2' } },
  '跳过': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E8F5' } },
  '重测中': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE1D5E7' } },
  '草稿': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } },
  'Untested': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } },
  'Draft': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } },
  'Pass': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4F4D2' } },
  'Fail': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAD4D4' } },
  'Blocked': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE0B2' } },
  'Skipped': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E8F5' } },
  'Retesting': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE1D5E7' } },
};

const PRIORITY_FILL: Record<string, ExcelJS.Fill> = {
  P0: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4E4' } },
  P1: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7CC' } },
  P2: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F1FB' } },
};

// 中文文件名 → 模块名映射（admin_zh 中文件名与模块名一致，可直接用 basename）
const ZH_FILE_TO_MODULE: Record<string, string> = {
  '联系人': '联系人', '线索': '线索', '客户': '客户', '商机': '商机',
  'P&L': 'P&L', '报价单': '报价单', '采购订单': '采购订单', '销售订单': '销售订单',
  '交付': '交付', '开票申请': '开票申请', '回款': '回款', '产品': '产品',
  '合同': '合同', '管道看板': '管道看板',
};

// 英文文件名 → 模块名映射
const EN_FILE_TO_MODULE: Record<string, string> = {
  'Contact': 'Contact', 'Lead': 'Lead', 'Customer': 'Customer', 'Opportunity': 'Opportunity',
  'P&L': 'P&L', 'Quotation': 'Quotation', 'PO': 'PO', 'Sales Order': 'Sales Order',
  'Delivery': 'Delivery', 'Invoice': 'Invoice', 'Collection': 'Collection', 'Product': 'Product',
  'Contract': 'Contract', 'Pipeline Kanban': 'Pipeline Kanban',
};

async function makeWorkbook(dir: string, isZh: boolean) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'CRM Test Generator';

  const fontH = isZh ? { name: 'PingFang SC', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
                     : { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  const fontB = isZh ? { name: 'PingFang SC', size: 10 } : { name: 'Calibri', size: 10 };
  const fontP = isZh ? { name: 'PingFang SC', size: 10, bold: true, color: { argb: 'FFC00000' } }
                     : { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFC00000' } };
  const fontSt = isZh ? { name: 'PingFang SC', size: 10, italic: true, color: { argb: 'FF808080' } }
                      : { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF808080' } };

  const colName = isZh ? '用例编号' : 'TC ID';
  const modName = isZh ? '模块' : 'Module';
  const tcName = isZh ? '用例名称' : 'Test Name';
  const catName = isZh ? '分类' : 'Category';
  const roleName = isZh ? '角色' : 'Role';
  const priName = isZh ? '优先级' : 'Priority';
  const preName = isZh ? '前置条件' : 'Precondition';
  const stepName = isZh ? '测试步骤' : 'Steps';
  const expName = isZh ? '预期结果' : 'Expected';
  const staName = isZh ? '测试状态' : 'Status';
  const notName = isZh ? '备注' : 'Notes';

  const cols = [colName, modName, tcName, catName, roleName, priName, preName, stepName, expName, staName, notName];
  const colWidths = [24, 10, 28, 14, 10, 8, 32, 42, 30, 10, 28];

  // 按业务流顺序收集用例
  const moduleOrder = isZh ? ZH_MODULE_ORDER : EN_MODULE_ORDER;
  const yamls = fs.readdirSync(dir).filter(f => f.endsWith('.yaml'));  const allCases: TestCase[] = [];
  for (const mod of moduleOrder) {
    // 找文件名：中文目录下文件名就是模块名.yaml，英文目录下通过映射找
    let yamlFile: string | undefined;
    if (isZh) {
      // admin_zh 中文件名可能带 .yaml 扩展名
      yamlFile = yamls.find(f => path.basename(f, '.yaml') === mod);
    } else {
      // 找英文文件名
      const engFileName = Object.entries(EN_FILE_TO_MODULE).find(([, v]) => v === mod)?.[0];
      if (engFileName) yamlFile = yamls.find(f => path.basename(f, '.yaml') === engFileName);
    }
    if (yamlFile) {
      const cases = parseYaml(path.join(dir, yamlFile));
      allCases.push(...cases);
    } else {
      console.warn(`  ⚠️ 未找到模块 "${mod}" 对应的 YAML 文件`);
    }
  }

  // 单个工作表
  const ws = wb.addWorksheet(isZh ? '测试用例' : 'Test Cases');

  // Header
  const hRow = ws.addRow(cols);
  hRow.eachCell(c => {
    c.style = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } },
                font: fontH, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
                border: { top: { style:'thin', color:{argb:'FF808080'} }, bottom: { style:'thin', color:{argb:'FF808080'} },
                          left: { style:'thin', color:{argb:'FF808080'} }, right: { style:'thin', color:{argb:'FF808080'} } } };
  });
  hRow.height = 24;
  colWidths.forEach((w, i) => { ws.getColumn(i+1).width = w; });

  // Data
  for (let ri = 0; ri < allCases.length; ri++) {
    const tc = allCases[ri];
    const row = ws.addRow([tc.id, tc.module, tc.name, tc.category, tc.role, tc.priority,
      tc.precondition, tc.steps, tc.expected, tc.status, tc.notes]);
    row.height = 50;
    row.eachCell((cell, colNum) => {
      cell.style = {
        font: fontB, alignment: { vertical: 'top', wrapText: true },
        border: { top: { style:'thin', color:{argb:'FFD8D8D8'} }, bottom: { style:'thin', color:{argb:'FFD8D8D8'} },
                  left: { style:'thin', color:{argb:'FFD8D8D8'} }, right: { style:'thin', color:{argb:'FFD8D8D8'} } },
      };
      // Priority
      if (colNum === 6) {
        const fill = PRIORITY_FILL[tc.priority];
        if (fill) cell.fill = fill;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = fontP;
      }
      // Status
      if (colNum === 10) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = fontSt;
        const fill = STATUS_FILL[tc.status];
        if (fill) cell.fill = fill;
      }
      // ID bold
      if (colNum === 1) cell.font = { ...fontB, bold: true };
      // Alternating
      if (ri % 2 === 1 && colNum !== 6 && colNum !== 10)
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F9FC' } };
    });
  }

  // Status data validation
  const statusVals = isZh ? ['草稿', '通过', '失败', '阻塞', '跳过', '重测中']
                          : ['Draft', 'Pass', 'Fail', 'Blocked', 'Skipped', 'Retesting'];
  for (let r = 2; r <= allCases.length + 1; r++) {
    ws.getRow(r).getCell(10).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: [`"${statusVals.join(',')}"`],
      showErrorMessage: true, errorStyle: 'warning',
      error: isZh ? '请从下拉列表中选择' : 'Please select from dropdown',
    };
  }

  // Status conditional formatting — 合并到单个 conditionalFormatting 块，避免 WPS 对同一 sqref 多个独立块的兼容性问题。
  // dxf（差异化样式）里的 solid 填充，Excel/WPS 实际取色用的是 bgColor 而非 fgColor（与普通单元格填充相反的已知行为），
  // 所以这里要同时写 fgColor 和 bgColor，否则条件格式在 Excel/WPS 里都不会显示颜色。
  const range = `J2:J${allCases.length + 1}`;
  let prio = 1;
  const statusRules = [];
  for (const [st, fill] of Object.entries(STATUS_FILL)) {
    if (statusVals.includes(st) && fill.type === 'pattern' && fill.fgColor) {
      const cfFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: fill.fgColor, bgColor: fill.fgColor };
      statusRules.push({ type: 'cellIs' as const, operator: 'equal' as const, formulae: [`"${st}"`], priority: prio++, style: { fill: cfFill } });
    }
  }
  ws.addConditionalFormatting({ ref: range, rules: statusRules });

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: allCases.length + 1, column: cols.length } };
  ws.views = [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }];

  const isAdmin = path.basename(dir).startsWith('admin');
  const filename = isZh
    ? (isAdmin ? 'Securemetric-CRM_测试用例_管理员.xlsx' : 'Securemetric-CRM_测试用例.xlsx')
    : (isAdmin ? 'Securemetric-CRM_test-cases_Admin.xlsx' : 'Securemetric-CRM_test-cases.xlsx');
  await wb.xlsx.writeFile(path.join(dir, filename));
  console.log(`  ✅ ${path.join(dir, filename)} (${allCases.length} 个用例)`);
}

async function main() {
  console.log('📊 从 YAML 重新生成 Excel...');
  for (const d of DIRS) {
    const dir = path.join(OUTPUT_BASE, d);
    if (fs.existsSync(dir)) {
      const isZh = d.startsWith('zh') || d === 'admin_zh';
      await makeWorkbook(dir, isZh);
    }
  }
  console.log('\n🎉 完成！');
}

main().catch(console.error);
