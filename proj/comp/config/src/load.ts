import { readFile } from 'fs/promises';
import { join } from 'path';
import { load as loadYaml } from 'js-yaml';
import type { LoafConfig } from './types.js';
import { validateConfig } from './validate.js';
import { createStarterConfig } from './create.js';
import { DEFAULT_LOAF_YAML } from './base-loaf.yml-defaults.js';

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

    // Keep patterns as-is, resolution happens in FsGuard
    return config;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Create the config file
      await createStarterConfig(repoPath);

      // Return config by parsing the same YAML we just wrote
      const config = loadYaml(DEFAULT_LOAF_YAML) as LoafConfig;

      return config;
    }
    throw error;
  }
}