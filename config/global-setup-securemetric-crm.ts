import { FullConfig } from '@playwright/test';
import { runGlobalSetup } from '../src/setup/GlobalSetup';
import { getEnvironment } from './environments';

export default async function globalSetup(_config: FullConfig) {
  // 只登录 CRM_USER 指定的账号，避免登录所有账号
  const targetUser = process.env.CRM_USER;
  const accountFilter = targetUser ? [targetUser] : undefined;

  if (targetUser) {
    console.log(`[Config] 使用账号：${targetUser}, 只登录此账号`);
  } else {
    console.log('[Config] 未指定 CRM_USER 环境变量，将登录所有配置的账号');
  }

  await runGlobalSetup(getEnvironment('securemetric-crm'), accountFilter);
}
