import { loadBaseInstructions } from './loader.js';
import { filterByAllowedTools } from './parser.js';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { ActionDefinitions } from '../../../../unified-design.js';

export async function updateInstructions(
  repoPath: string,
  allowedTools: string[]
): Promise<void> {
  const base = await loadBaseInstructions();
  const filtered = filterByAllowedTools(base, allowedTools);
  const outputPath = join(repoPath, 'NESL_INSTRUCTIONS.md');
  
  await writeFile(outputPath, filtered);
}