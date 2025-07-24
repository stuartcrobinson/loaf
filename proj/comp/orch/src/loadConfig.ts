import { readFile } from 'fs/promises';
import { join } from 'path';
import { load as loadYaml } from 'js-yaml';
import type { LoafConfig } from './types.js';

export async function loadConfig(repoPath: string): Promise<LoafConfig> {
  const configPath = join(repoPath, 'loaf.yml');

  try {
    const content = await readFile(configPath, 'utf8');
    const config = loadYaml(content) as LoafConfig;

    // Validate config structure
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid config: must be an object');
    }

    if (!config.version) {
      throw new Error('Config missing version');
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