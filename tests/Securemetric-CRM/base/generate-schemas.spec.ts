/**
 * Schema Generation — Securemetric CRM 关键模块
 *
 * 一次性生成以下模块的表结构 Schema：
 *   - 报价 (Quotation)
 *   - PO (Purchase Order)
 *   - SO (Sales Order)
 *   - 合同 (Contract)
 *   - 发货 (Delivery)
 *   - 发票 (Invoice)
 *   - 客户付款 (Customer Payment)
 *
 * 运行命令:
 *   npx playwright test --config=config/playwright.securemetric-crm.config.ts \
 *     tests/Securemetric-CRM/base/generate-schemas.spec.ts --headed
 */
import { test } from '@playwright/test';
import { FormTestBuilder } from '../../../src/core/FormTestBuilder';
import * as path from 'path';

const SCHEMA_DIR = path.join(__dirname, '../../../src/schemas/Securemetric-CRM/base');

const MODULES = [
  {
    name: 'Opportunity (商机)',
    formId: 'mk_km_ltc_opportunity',
    formName: 'Opportunity',
    url: 'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1i02ls02kw5jw69bw36pppvh884viq1fciw1?lbpmTemplateId=1i0aaofkow4uw5ecpw295jcfe1h88ca3t5w1',
  },
  {
    name: 'Product (产品)',
    formId: 'mk_km_ltc_product',
    formName: 'Product',
    url: 'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1j1ckq9k1wcw22b3iw2f103901k2097813w0',
  },
  {
    name: '报价 (Quotation)',
    formId: 'mk_ltc_quotation',
    formName: 'Quotation',
    url: 'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1huk5ae1mw4fw7b59wsflfgsvtk48i373gw1?lbpmTemplateId=1i1c8edbsw4uwbk2iwv4112es5asrt2cofw1',
  },
  {
    name: 'PO (Purchase Order)',
    formId: 'mk_ltc_po',
    formName: 'Purchase Order',
    url: 'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1jg704qdaw58w85evw38o1vp21929sf963w4',
  },
  {
    name: 'SO (Sales Order)',
    formId: 'mk_ltc_so',
    formName: 'Sales Order',
    url: 'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1i16imb35w60w37jw1l2npp1f6lgd3188uw1',
  },
  {
    name: '合同 (Contract)',
    formId: 'mk_ltc_contract',
    formName: 'Contract',
    url: 'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1jihb07vbw5fw21kofw7b5qu2gcc7mo12ow4',
  },
  {
    name: '发货 (Delivery)',
    formId: 'mk_ltc_delivery',
    formName: 'Delivery',
    url: 'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1jihct6p2w5fw21p33w27t64ed12seupkmw4',
  },
  {
    name: '发票 (Invoice)',
    formId: 'mk_ltc_invoice',
    formName: 'Invoice',
    url: 'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1i196enviw61wj64w3dnri7d2smn2ou27pw1',
  },
  {
    name: '客户付款 (Customer Payment)',
    formId: 'mk_ltc_customer_payment',
    formName: 'Customer Payment',
    url: 'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/add/1i176k8omw60whh8w7rcq5a2h7njoq99bew1',
  },
];

for (const mod of MODULES) {
  test(`Generate schema: ${mod.name}`, async ({ page }) => {
    const builder = new FormTestBuilder(page, {
      formId: mod.formId,
      formName: mod.formName,
      url: mod.url,
      schemaPath: SCHEMA_DIR,
      forceRegenerate: true,
    });

    await builder.initialize({ forceRegenerate: true });

    const schema = builder.getSchema();
    console.log(`[${mod.name}] formId=${schema.formId}, fields=${schema.fields.length}`);
    if (schema.detailTables && schema.detailTables.length > 0) {
      for (const dt of schema.detailTables) {
        console.log(`  明细表: ${dt.detailTableName} (${dt.fields.length} fields)`);
      }
    }
  });
}
