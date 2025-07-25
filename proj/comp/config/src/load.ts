import { readFile } from 'fs/promises';
import { join } from 'path';
import { load as loadYaml } from 'js-yaml';
import type { LoafConfig, FsGuardConfig } from './types.js';
import { validateConfig } from './validate.js';

export async function loadConfig(repoPath: string): Promise<LoafConfig> {
  const configPath = join(repoPath, 'loaf.yml');

  try {
    const content = await readFile(configPath, 'utf8');
    const config = loadYaml(content) as LoafConfig;

    // Validate config structure
    const validation = validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid config: ${validation.error}`);
    }

    return config;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Return default config when file doesn't exist
      return {
        version: 1,
        'fs-guard': {
          allowed: [`${repoPath}/**`, '/tmp/**'],
          denied: ['/**/.git/**', '/**/.ssh/**', '/etc/**', '/sys/**', '/proc/**']
        }
      };
    }
    throw error;
  }
}