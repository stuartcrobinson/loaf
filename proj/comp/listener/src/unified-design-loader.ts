import { readFile } from 'fs/promises';
import { parse as parseYaml } from 'js-yaml';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

interface ToolDefinition {
  output_display?: 'always' | 'never' | 'conditional';
  parameters?: Record<string, any>;
}

interface UnifiedDesign {
  tools: Record<string, ToolDefinition>;
}

let cachedDesign: UnifiedDesign | null = null;

/**
 * Load and cache the unified design configuration.
 * Returns the parsed unified design object.
 */
export async function loadUnifiedDesign(): Promise<UnifiedDesign> {
  if (cachedDesign) {
    return cachedDesign;
  }

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const designPath = join(__dirname, '../../../doc/unified-design.yaml');
  const content = await readFile(designPath, 'utf-8');
  cachedDesign = parseYaml(content) as UnifiedDesign;
  
  return cachedDesign;
}

/**
 * Check if output should be displayed for a given action.
 * Returns true if output should be included in OUTPUTS section.
 */
export async function shouldDisplayOutput(
  action: string, 
  params: Record<string, any> = {}
): Promise<boolean> {
  const design = await loadUnifiedDesign();
  const tool = design.tools[action];
  
  if (!tool) {
    // Unknown tool - default to showing output
    return true;
  }
  
  const displayRule = tool.output_display || 'always';
  
  switch (displayRule) {
    case 'always':
      return true;
    case 'never':
      return false;
    case 'conditional':
      // For exec, check return_output parameter
      if (action === 'exec') {
        return params.return_output !== false;
      }
      // Default for other conditional actions
      return true;
    default:
      return true;
  }
}