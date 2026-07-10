/**
 * environments.ts — 多环境 + 多账号统一配置
 *
 * 新增环境只需在 ENVIRONMENTS 中添加一个对象，无需修改任何其他文件。
 * 新增账号只需在对应环境的 accounts 数组中添加一项。
 */
import * as path from 'path';

export interface AccountConfig {
  /** 登录用户名 */
  username: string;
  /** 登录密码 */
  password: string;
  /** Session 文件路径（相对于项目根目录） */
  sessionFile: string;
}

export interface EnvironmentConfig {
  /** 环境唯一标识，用于脚本和日志 */
  id: string;
  /** 环境显示名 */
  name: string;
  /** 基础 URL（不含路径），也作为 cfgDataFetcher 的 baseURL */
  baseURL: string;
  /** 登录页完整 URL */
  loginURL: string;
  /** 登录成功后验证 Session 的页面 URL */
  validateURL: string;
  /** Session 有效期（分钟），超过则强制重新登录 */
  sessionMaxAgeMinutes: number;
  /** 登录页是否有语言切换器（test.easycraft.ai 有，其余没有） */
  hasLanguageSwitcher: boolean;
  /** Schema 存储路径（相对于项目根目录） */
  schemaPath: string;
  /** Playwright testMatch 规则 */
  testMatch: string | string[];
  /** 该环境下的所有账号 */
  accounts: AccountConfig[];
  /** 默认账号的用户名（用于 playwright config 的全局 storageState） */
  defaultAccount: string;
}

// ─────────────────────────────────────────
// 环境列表 — 在此处维护所有环境和账号
// ─────────────────────────────────────────
export const ENVIRONMENTS: Record<string, EnvironmentConfig> = {

  /** EasyCraft 公有云测试环境 */
  'test': {
    id: 'test',
    name: 'EasyCraft Test',
    baseURL: 'https://test.easycraft.ai',
    loginURL: 'https://test.easycraft.ai/web/#/login',
    validateURL: 'https://test.easycraft.ai/web/#/current',
    sessionMaxAgeMinutes: 120,
    hasLanguageSwitcher: true,
    schemaPath: './src/schemas/test',
    testMatch: ['**/tests/test/**/*.spec.ts'],
    accounts: [
      {
        username: process.env.EASYCRAFT_USERNAME || 'xiex',
        password: process.env.EASYCRAFT_PASSWORD || '1',
        sessionFile: 'auth/auth.json',
      },
    ],
    defaultAccount: process.env.EASYCRAFT_USERNAME || 'xiex',
  },

  /** SP3Test 产品环境 */
  'sp3test': {
    id: 'sp3test',
    name: 'SP3Test',
    baseURL: 'https://sp3test.landray.com.cn/mkpaas',
    loginURL: 'https://sp3test.landray.com.cn/mkpaas/web/#/mklogin',
    validateURL: 'https://sp3test.landray.com.cn/mkpaas/web/#/current/sys-modeling/app/xoex/list',
    sessionMaxAgeMinutes: 120,
    hasLanguageSwitcher: false,
    schemaPath: './src/schemas/sp3test',
    testMatch: ['**/tests/sp3test/**/*.spec.ts'],
    accounts: [
      { username: 'jm', password: '1', sessionFile: 'auth/auth-sp3test.json' },
    ],
    defaultAccount: 'jm',
  },

  /** Securemetric CRM 内网环境 */
  'securemetric-crm': {
    id: 'securemetric-crm',
    name: 'Securemetric CRM',
    baseURL: 'http://172.18.114.231:8088',
    loginURL: 'http://172.18.114.231:8088/web/#/mklogin',
    validateURL: 'http://172.18.114.231:8088/web/#/current/sys-modeling/app/km-ltc/list',
    sessionMaxAgeMinutes: 120,
    hasLanguageSwitcher: false,
    schemaPath: './src/schemas/Securemetric-CRM/base',
    testMatch: ['**/tests/Securemetric-CRM/**/*.spec.ts'],
    accounts: [
      { username: 'soo',    password: '1', sessionFile: 'auth/auth-securemetric-crm.json' },
      { username: 'edward', password: '1', sessionFile: 'auth/auth-securemetric-crm-edward.json' },
      // 各部门用户（密码均为 1）
      { username: 'ck',     password: '1', sessionFile: 'auth/auth-securemetric-crm-ck.json' },
      { username: 'yuwin',  password: '1', sessionFile: 'auth/auth-securemetric-crm-yuwin.json' },
      { username: 'chew',   password: '1', sessionFile: 'auth/auth-securemetric-crm-chew.json' },
      { username: 'shimi',  password: '1', sessionFile: 'auth/auth-securemetric-crm-shimi.json' },
      { username: 'wo',     password: '1', sessionFile: 'auth/auth-securemetric-crm-wo.json' },
      { username: 'alan',    password: '1', sessionFile: 'auth/auth-securemetric-crm-alan.json' },
      { username: 'faizul',  password: '1', sessionFile: 'auth/auth-securemetric-crm-faizul.json' },
      { username: 'affendi', password: '1', sessionFile: 'auth/auth-securemetric-crm-affendi.json' },
    ],
    defaultAccount: 'soo',
  },

};

// ─────────────────────────────────────────
// 辅助函数
// ─────────────────────────────────────────

export function getEnvironment(envId: string): EnvironmentConfig {
  const env = ENVIRONMENTS[envId];
  if (!env) {
    throw new Error(
      `Unknown environment: "${envId}". Available: ${Object.keys(ENVIRONMENTS).join(', ')}`
    );
  }
  return env;
}

export function getAccount(env: EnvironmentConfig, username: string): AccountConfig {
  const account = env.accounts.find(a => a.username === username);
  if (!account) {
    throw new Error(
      `Account "${username}" not found in environment "${env.id}". ` +
      `Available: ${env.accounts.map(a => a.username).join(', ')}`
    );
  }
  return account;
}

export function getDefaultAccount(env: EnvironmentConfig): AccountConfig {
  return getAccount(env, env.defaultAccount);
}

/** 返回账号 Session 文件的绝对路径（基于项目根目录） */
export function resolveSessionFile(account: AccountConfig, rootDir: string): string {
  return path.join(rootDir, account.sessionFile);
}

/** 返回默认账号 Session 文件的绝对路径 */
export function resolveDefaultSessionFile(env: EnvironmentConfig, rootDir: string): string {
  return resolveSessionFile(getDefaultAccount(env), rootDir);
}
