/**
 * Securemetric CRM — URL 常量
 *
 * 集中管理所有模块的新建页、列表页、查重页 URL。
 * 所有测试文件统一从此处导入，避免散落和重复。
 *
 * 环境: http://172.18.114.231:8088
 */

const BASE = 'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc'

// ─── Contact Person 联系人 ────────────────────────────────────────
export const CONTACT_ADD_URL   = `${BASE}/add/1huk4vljow4bw7civw3cdgsju212d8jr1sw1`
export const CONTACT_LIST_URL  = `${BASE}/listView/1hvp2cluhw58w6l8fw3611h2s3vd75k91dw1/1i20pgcrdw6awilsw3ip2cvq36n244duq8w1?type=list&navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1`
export const CONTACT_DEDUP_URL = `${BASE}/listView/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1/undefined?navId=1hvp21k7lw4vw6h64w37pp9dm27vj66f3cw1`

// ─── Lead 线索 ────────────────────────────────────────────────────
export const LEAD_ADD_URL  = `${BASE}/add/1htdn56g4w5ew3qpn9w24s4lj72d31qpk2we`
export const LEAD_LIST_URL = `${BASE}/listView/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1/1i2b2u2how6aw3k7dw1a3anjl3jnug8m31w1`

// ─── Customer 客户 ────────────────────────────────────────────────
export const CUSTOMER_ADD_URL = `${BASE}/add/1hvjheq3nw4vw4j48w3doaci42dfrsq13tw1`

// ─── Opportunity 商机 ─────────────────────────────────────────────
export const OPPORTUNITY_ADD_URL = `${BASE}/add/1i02ls02kw5jw69bw36pppvh884viq1fciw1?lbpmTemplateId=1i0aaofkow4uw5ecpw295jcfe1h88ca3t5w1`

// ─── P&L ─────────────────────────────────────────────────────────
export const PL_ADD_URL = `${BASE}/add/1jolf9tffwfwtegbw1dkpp192vc2vnk3nqw0`
