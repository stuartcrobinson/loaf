export { loadConfig } from './load.js';
export { createStarterConfig } from './create.js';
export { validateConfig } from './validate.js';
export type { LoafConfig, FsGuardConfig, ExecGuardConfig } from './types.js';
export type { ValidationResult } from './validate.js';

import { access } from 'fs/promises';
import { join } from 'path';

export async function configExists(repoPath: string): Promise<boolean> {
  try {
    await access(join(repoPath, 'loaf.yml'));
    return true;
  } catch {
    return false;
  }
}