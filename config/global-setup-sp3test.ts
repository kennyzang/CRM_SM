import { FullConfig } from '@playwright/test';
import { runGlobalSetup } from '../src/setup/GlobalSetup';
import { getEnvironment } from './environments';

export default async function globalSetup(_config: FullConfig) {
  await runGlobalSetup(getEnvironment('sp3test'));
}
