import { load } from 'js-yaml';
import type { HooksConfig } from './types.js';

/**
 * Parses YAML content into HooksConfig object
 * @throws Error if YAML is invalid
 */
export function parseYamlConfig(content: string): HooksConfig {
  try {
    // Empty string returns null from js-yaml
    if (content.trim() === '') {
      return null as any;
    }

    const parsed = load(content);
    
    // js-yaml returns undefined for empty documents sometimes
    if (parsed === undefined) {
      return null as any;
    }

    return parsed as HooksConfig;
  } catch (error: any) {
    throw new Error(`Invalid YAML: ${error.message}`);
  }
}