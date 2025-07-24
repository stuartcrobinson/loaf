📋 Copied to clipboard

=== LOAF RESULTS ===
fg1 ✅ file_write /Users/stuart/repos/loaf/proj/comp/orch/src/types.ts
fg2 ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-guard/src/types.ts
fg3 ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-guard/src/FsGuard.ts
fg4 ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-guard/src/index.ts
fg5 ✅ file_write /Users/stuart/repos/loaf/proj/comp/orch/src/loadConfig.ts
fg6 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts
fg7 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts
fg8 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts
fg9 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts
fg10 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts
fg11 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts
fg12 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts
fg13 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts
fg14 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts
fg15 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts
fg16 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts
fg17 ✅ file_write /Users/stuart/repos/loaf/proj/comp/exec/src/ExecExecutor.ts
fg18 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/exec/src/index.ts
fg19 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/src/index.ts
fg20 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/src/index.ts
fg21 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/src/index.ts
fg22 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/src/index.ts
fg23 ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-guard/package.json
fg24 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/src/createStarterConfig.ts
fg25 ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-guard/tsconfig.json
=== END ===

Looking at the fs-guard architecture documents and the current code structure, I need to implement the fs-guard component as outlined in the TODO.md file. This requires refactoring the executors from functions to classes and integrating fs-guard at the fs-ops level.

Let me implement these changes:

```sh nesl
#!nesl [@three-char-SHA-256: fg1]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/types.ts"
content = <<'EOT_fg1'
import type { HooksConfig } from '../../hooks/src/index.js';

export interface LoafConfig {
  version: number;
  hooks?: HooksConfig;
  'fs-guard'?: FsGuardConfig;
  'exec-guard'?: ExecGuardConfig; // future
}

export interface FsGuardConfig {
  allowed?: string[];
  denied?: string[];
  followSymlinks?: boolean;
}

export interface ExecGuardConfig {
  languages?: string[];
  timeout?: number;
}
EOT_fg1
#!end_fg1
```

```sh nesl
#!nesl [@three-char-SHA-256: fg2]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-guard/src/types.ts"
content = <<'EOT_fg2'
export interface GuardCheckResult {
  allowed: boolean;
  reason?: string;
}

export interface PathPermission {
  type: 'read' | 'write';
  path: string;
  paramName: string;
}
EOT_fg2
#!end_fg2
```

```sh nesl
#!nesl [@three-char-SHA-256: fg3]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-guard/src/FsGuard.ts"
content = <<'EOT_fg3'
import { realpath } from 'fs/promises';
import { minimatch } from 'minimatch';
import { dirname, resolve, isAbsolute } from 'path';
import type { LoafAction } from '../../nesl-action-parser/src/index.js';
import type { FsGuardConfig } from '../../orch/src/types.js';
import type { GuardCheckResult, PathPermission } from './types.js';

export class FsGuard {
  private allowedPatterns: string[];
  private deniedPatterns: string[];
  private followSymlinks: boolean;

  // Permission mapping for each action
  private static readonly ACTION_PERMISSIONS: Record<string, PathPermission[]> = {
    file_read: [{ type: 'read', path: 'path', paramName: 'path' }],
    file_write: [{ type: 'write', path: 'path', paramName: 'path' }],
    file_create: [{ type: 'write', path: 'path', paramName: 'path' }],
    file_delete: [{ type: 'write', path: 'path', paramName: 'path' }],
    file_replace_text: [
      { type: 'read', path: 'path', paramName: 'path' },
      { type: 'write', path: 'path', paramName: 'path' }
    ],
    file_replace_all_text: [
      { type: 'read', path: 'path', paramName: 'path' },
      { type: 'write', path: 'path', paramName: 'path' }
    ],
    file_move: [
      { type: 'read', path: 'old_path', paramName: 'old_path' },
      { type: 'write', path: 'new_path', paramName: 'new_path' }
    ],
    files_read: [{ type: 'read', path: 'paths', paramName: 'paths' }],
    file_read_numbered: [{ type: 'read', path: 'path', paramName: 'path' }],
    file_replace_lines: [
      { type: 'read', path: 'path', paramName: 'path' },
      { type: 'write', path: 'path', paramName: 'path' }
    ],
    dir_create: [{ type: 'write', path: 'path', paramName: 'path' }],
    dir_delete: [{ type: 'write', path: 'path', paramName: 'path' }],
    ls: [{ type: 'read', path: 'path', paramName: 'path' }],
    grep: [{ type: 'read', path: 'path', paramName: 'path' }],
    glob: [{ type: 'read', path: 'base_path', paramName: 'base_path' }]
  };

  constructor(config: FsGuardConfig, private repoRoot: string) {
    this.allowedPatterns = config.allowed || [`${repoRoot}/**`];
    this.deniedPatterns = config.denied || ['/**'];
    this.followSymlinks = config.followSymlinks ?? false;

    // Resolve relative patterns from repo root
    this.allowedPatterns = this.allowedPatterns.map(p => this.resolvePattern(p));
    this.deniedPatterns = this.deniedPatterns.map(p => this.resolvePattern(p));
  }

  async check(action: LoafAction): Promise<GuardCheckResult> {
    const permissions = FsGuard.ACTION_PERMISSIONS[action.action];
    if (!permissions) {
      // Unknown action - let fs-ops handle it
      return { allowed: true };
    }

    // Check each required permission
    for (const perm of permissions) {
      const paramValue = action.parameters[perm.paramName];
      if (!paramValue) {
        continue; // Let fs-ops handle missing params
      }

      // Handle multi-path parameters (files_read)
      const paths = perm.paramName === 'paths' 
        ? this.parseMultilinePaths(paramValue)
        : [paramValue];

      for (const path of paths) {
        const result = await this.checkPath(path, perm.type);
        if (!result.allowed) {
          return result;
        }
      }
    }

    return { allowed: true };
  }

  private async checkPath(path: string, permType: 'read' | 'write'): Promise<GuardCheckResult> {
    // Canonicalize path if it exists
    let canonicalPath = path;
    try {
      if (this.followSymlinks) {
        canonicalPath = await realpath(path);
      }
    } catch (error: any) {
      // Path doesn't exist yet
      if (permType === 'read') {
        // Can't read non-existent file
        return {
          allowed: false,
          reason: `Path does not exist: ${path}`
        };
      }
      // For writes, check parent directory if file doesn't exist
      try {
        const parent = dirname(path);
        if (this.followSymlinks) {
          canonicalPath = resolve(await realpath(parent), path.split('/').pop()!);
        }
      } catch {
        // Parent doesn't exist either - use non-canonical path
        canonicalPath = resolve(path);
      }
    }

    // Find most specific matching rule
    const allowMatch = this.findMostSpecificMatch(canonicalPath, this.allowedPatterns);
    const denyMatch = this.findMostSpecificMatch(canonicalPath, this.deniedPatterns);

    // If both match, most specific wins
    if (allowMatch && denyMatch) {
      if (allowMatch.specificity >= denyMatch.specificity) {
        return { allowed: true };
      }
    }

    // Deny match takes precedence
    if (denyMatch) {
      return {
        allowed: false,
        reason: `${permType === 'read' ? 'Read' : 'Write'} access denied for '${path}'`
      };
    }

    // Must have an allow match
    if (!allowMatch) {
      return {
        allowed: false,
        reason: `${permType === 'read' ? 'Read' : 'Write'} access denied for '${path}' - no matching allow rule`
      };
    }

    return { allowed: true };
  }

  private findMostSpecificMatch(path: string, patterns: string[]): { pattern: string; specificity: number } | null {
    let bestMatch: { pattern: string; specificity: number } | null = null;

    for (const pattern of patterns) {
      if (minimatch(path, pattern, { dot: true, nonegate: true, nocase: false })) {
        const specificity = this.calculateSpecificity(pattern);
        if (!bestMatch || specificity > bestMatch.specificity) {
          bestMatch = { pattern, specificity };
        }
      }
    }

    return bestMatch;
  }

  private calculateSpecificity(pattern: string): number {
    // Count non-wildcard segments
    const segments = pattern.split('/').filter(s => s.length > 0);
    let specificity = 0;
    
    for (const segment of segments) {
      if (!segment.includes('*') && !segment.includes('?')) {
        specificity += 2; // Exact segment
      } else if (segment === '*') {
        specificity += 0; // Single wildcard
      } else if (segment === '**') {
        specificity += 0; // Recursive wildcard
      } else {
        specificity += 1; // Partial wildcard
      }
    }

    return specificity;
  }

  private resolvePattern(pattern: string): string {
    if (isAbsolute(pattern)) {
      return pattern;
    }
    return resolve(this.repoRoot, pattern);
  }

  private parseMultilinePaths(paths: string): string[] {
    return paths
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
}
EOT_fg3
#!end_fg3
```

```sh nesl
#!nesl [@three-char-SHA-256: fg4]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-guard/src/index.ts"
content = <<'EOT_fg4'
export { FsGuard } from './FsGuard.js';
export type { GuardCheckResult, PathPermission } from './types.js';
EOT_fg4
#!end_fg4
```

```sh nesl
#!nesl [@three-char-SHA-256: fg5]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/loadConfig.ts"
content = <<'EOT_fg5'
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
EOT_fg5
#!end_fg5
```

Now I need to refactor fs-ops to use a class-based approach:

```sh nesl
#!nesl [@three-char-SHA-256: fg6]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts"
old_text = <<'EOT_fg6'
/**
 * fs-ops - File system operations executor for loaf
 * 
 * Handles all file and directory operations from parsed NESL actions
 */

import type { LoafAction } from '../../nesl-action-parser/src/index.js';
import { writeFile, mkdir, unlink, rename, readFile } from 'fs/promises';
import { dirname } from 'path';
import { formatNodeError } from './formatNodeError.js';
import { fileExists } from './fileSystemUtils.js';
import { replaceText } from './replaceText.js';
import { extractNumberedLines } from './extractNumberedLines.js';

export interface FileOpResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class FileOpError extends Error {
  constructor(
    message: string,
    public code: string,
    public path?: string,
    public operation?: string
  ) {
    super(message);
    this.name = 'FileOpError';
  }
}

/**
 * Execute a file system operation from a parsed NESL action
 * Never throws - all errors returned in result
 */
export async function executeFileOperation(action: LoafAction): Promise<FileOpResult> {
  try {
    const handler = actionHandlers[action.action];



    if (!handler) {
      return {
        success: false,
        error: `Unknown action: ${action.action}`
      };
    }

    const result = await handler(action);
    return result;

  } catch (error: any) {
    // This should never happen - handlers should catch their own errors
    return {
      success: false,
      error: `Unexpected error in executeFileOperation: ${error.message}`
    };
  }
}
EOT_fg6
new_text = <<'EOT_fg6'
/**
 * fs-ops - File system operations executor for loaf
 * 
 * Handles all file and directory operations from parsed NESL actions
 */

import type { LoafAction } from '../../nesl-action-parser/src/index.js';
import type { FsGuard } from '../../fs-guard/src/index.js';
import { writeFile, mkdir, unlink, rename, readFile } from 'fs/promises';
import { dirname } from 'path';
import { formatNodeError } from './formatNodeError.js';
import { fileExists } from './fileSystemUtils.js';
import { replaceText } from './replaceText.js';
import { extractNumberedLines } from './extractNumberedLines.js';

export interface FileOpResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class FileOpError extends Error {
  constructor(
    message: string,
    public code: string,
    public path?: string,
    public operation?: string
  ) {
    super(message);
    this.name = 'FileOpError';
  }
}

/**
 * File system operations executor with security guard
 */
export class FsOpsExecutor {
  private handlers: Map<string, (action: LoafAction) => Promise<FileOpResult>>;

  constructor(private guard: FsGuard) {
    this.handlers = new Map([
      ['file_write', this.handleFileWrite.bind(this)],
      ['file_replace_text', this.handleFileReplaceText.bind(this)],
      ['file_replace_all_text', this.handleFileReplaceAllText.bind(this)],
      ['file_delete', this.handleFileDelete.bind(this)],
      ['file_move', this.handleFileMove.bind(this)],
      ['file_read', this.handleFileRead.bind(this)],
      ['files_read', this.handleFilesRead.bind(this)],
      ['file_read_numbered', this.handleFileReadNumbered.bind(this)],
      ['file_replace_lines', this.handleFileReplaceLines.bind(this)],
      ['dir_create', this.handleDirCreate.bind(this)],
      ['dir_delete', this.handleDirDelete.bind(this)],
      ['ls', this.handleLs.bind(this)],
      ['grep', this.handleGrep.bind(this)],
      ['glob', this.handleGlob.bind(this)]
    ]);
  }

  /**
   * Execute a file system operation with guard checks
   */
  async execute(action: LoafAction): Promise<FileOpResult> {
    try {
      // Check fs-guard permissions first
      const guardResult = await this.guard.check(action);
      if (!guardResult.allowed) {
        return {
          success: false,
          error: `fs-guard violation: ${guardResult.reason}`
        };
      }

      const handler = this.handlers.get(action.action);
      if (!handler) {
        return {
          success: false,
          error: `Unknown action: ${action.action}`
        };
      }

      return await handler(action);
    } catch (error: any) {
      // This should never happen - handlers should catch their own errors
      return {
        success: false,
        error: `Unexpected error in execute: ${error.message}`
      };
    }
  }
EOT_fg6
#!end_fg6
```

Now I need to move all the handler functions to be class methods:

```sh nesl
#!nesl [@three-char-SHA-256: fg7]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts"
old_text = <<'EOT_fg7'
/**
 * Handle file_move action - moves/renames a file
 * Creates parent directories for destination if needed
 * Overwrites destination if it exists
 */
async function handleFileMove(action: LoafAction): Promise<FileOpResult> {
EOT_fg7
new_text = <<'EOT_fg7'
  /**
   * Handle file_move action - moves/renames a file
   * Creates parent directories for destination if needed
   * Overwrites destination if it exists
   */
  private async handleFileMove(action: LoafAction): Promise<FileOpResult> {
EOT_fg7
#!end_fg7
```

```sh nesl
#!nesl [@three-char-SHA-256: fg8]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts"
old_text = <<'EOT_fg8'
/**
 * Handle file_delete action - removes a file
 */
async function handleFileDelete(action: LoafAction): Promise<FileOpResult> {
EOT_fg8
new_text = <<'EOT_fg8'
  /**
   * Handle file_delete action - removes a file
   */
  private async handleFileDelete(action: LoafAction): Promise<FileOpResult> {
EOT_fg8
#!end_fg8
```

```sh nesl
#!nesl [@three-char-SHA-256: fg9]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts"
old_text = <<'EOT_fg9'
/**
 * Handle file_write action - writes/creates/overwrites a file with content
 * Automatically creates parent directories if needed
 */
async function handleFileWrite(action: LoafAction): Promise<FileOpResult> {
EOT_fg9
new_text = <<'EOT_fg9'
  /**
   * Handle file_write action - writes/creates/overwrites a file with content
   * Automatically creates parent directories if needed
   */
  private async handleFileWrite(action: LoafAction): Promise<FileOpResult> {
EOT_fg9
#!end_fg9
```

```sh nesl
#!nesl [@three-char-SHA-256: fg10]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts"
old_text = <<'EOT_fg10'
/**
 * Handle file_read action - reads file content
 */
async function handleFileRead(action: LoafAction): Promise<FileOpResult> {
EOT_fg10
new_text = <<'EOT_fg10'
  /**
   * Handle file_read action - reads file content
   */
  private async handleFileRead(action: LoafAction): Promise<FileOpResult> {
EOT_fg10
#!end_fg10
```

```sh nesl
#!nesl [@three-char-SHA-256: fg11]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts"
old_text = <<'EOT_fg11'
/**
 * Handle file_read_numbered action - reads file content with line numbers
 * Returns specified lines with line numbers prepended
 * If lines parameter is missing, reads all lines
 * If some lines are out of range, returns available content with error
 */
async function handleFileReadNumbered(action: LoafAction): Promise<FileOpResult> {
EOT_fg11
new_text = <<'EOT_fg11'
  /**
   * Handle file_read_numbered action - reads file content with line numbers
   * Returns specified lines with line numbers prepended
   * If lines parameter is missing, reads all lines
   * If some lines are out of range, returns available content with error
   */
  private async handleFileReadNumbered(action: LoafAction): Promise<FileOpResult> {
EOT_fg11
#!end_fg11
```

```sh nesl
#!nesl [@three-char-SHA-256: fg12]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts"
old_text = <<'EOT_fg12'
/**
 * Handle file_replace_lines action - replaces specified lines in a file
 * Supports single line ("4") or range ("23-43") specifications
 * Preserves line endings and handles edge cases
 */
async function handleFileReplaceLines(action: LoafAction): Promise<FileOpResult> {
EOT_fg12
new_text = <<'EOT_fg12'
  /**
   * Handle file_replace_lines action - replaces specified lines in a file
   * Supports single line ("4") or range ("23-43") specifications
   * Preserves line endings and handles edge cases
   */
  private async handleFileReplaceLines(action: LoafAction): Promise<FileOpResult> {
EOT_fg12
#!end_fg12
```

```sh nesl
#!nesl [@three-char-SHA-256: fg13]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts"
old_text = <<'EOT_fg13'
/**
 * Handle files_read action - reads multiple files and returns their contents
 * Parses multi-line paths parameter, one absolute path per line
 * Returns an array of file contents in the same order as the paths
 */
async function handleFilesRead(action: LoafAction): Promise<FileOpResult> {
EOT_fg13
new_text = <<'EOT_fg13'
  /**
   * Handle files_read action - reads multiple files and returns their contents
   * Parses multi-line paths parameter, one absolute path per line
   * Returns an array of file contents in the same order as the paths
   */
  private async handleFilesRead(action: LoafAction): Promise<FileOpResult> {
EOT_fg13
#!end_fg13
```

```sh nesl
#!nesl [@three-char-SHA-256: fg14]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts"
old_text = <<'EOT_fg14'
/**
 * Handle file_replace_text action - replaces EXACTLY ONE occurrence
 * Fails if old_text appears 0 or 2+ times
 */
async function handleFileReplaceText(action: LoafAction): Promise<FileOpResult> {
EOT_fg14
new_text = <<'EOT_fg14'
  /**
   * Handle file_replace_text action - replaces EXACTLY ONE occurrence
   * Fails if old_text appears 0 or 2+ times
   */
  private async handleFileReplaceText(action: LoafAction): Promise<FileOpResult> {
EOT_fg14
#!end_fg14
```

```sh nesl
#!nesl [@three-char-SHA-256: fg15]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts"
old_text = <<'EOT_fg15'
/**
 * Handle file_replace_all_text action - replaces all occurrences
 * If count provided, validates exact match
 */
async function handleFileReplaceAllText(action: LoafAction): Promise<FileOpResult> {
EOT_fg15
new_text = <<'EOT_fg15'
  /**
   * Handle file_replace_all_text action - replaces all occurrences
   * If count provided, validates exact match
   */
  private async handleFileReplaceAllText(action: LoafAction): Promise<FileOpResult> {
EOT_fg15
#!end_fg15
```

Now I need to add the placeholder handler methods and remove the old code:

```sh nesl
#!nesl [@three-char-SHA-256: fg16]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts"
old_text = <<'EOT_fg16'
// Internal function stubs for each operation

async function createFile(path: string, content: string): Promise<void> {
  throw new Error('Not implemented');
}



async function replaceTextInFile(path: string, oldText: string, newText: string, count?: number): Promise<number> {
  throw new Error('Not implemented');
}

async function deleteFile(path: string): Promise<void> {
  throw new Error('Not implemented');
}

async function moveFile(oldPath: string, newPath: string): Promise<void> {
  throw new Error('Not implemented');
}

async function readFileContent(path: string): Promise<string> {
  throw new Error('Not implemented');
}

async function createDirectory(path: string): Promise<void> {
  throw new Error('Not implemented');
}

async function deleteDirectory(path: string): Promise<void> {
  throw new Error('Not implemented');
}

interface DirEntry {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modified: Date;
}

async function listDirectory(path: string): Promise<DirEntry[]> {
  throw new Error('Not implemented');
}

interface GrepResult {
  file: string;
  line_number: number;
  line: string;
}

async function searchFiles(pattern: string, path: string, include?: string): Promise<GrepResult[]> {
  throw new Error('Not implemented');
}

async function globFiles(pattern: string, basePath: string): Promise<string[]> {
  throw new Error('Not implemented');
}

// Action handler mapping
const actionHandlers: Record<string, (action: LoafAction) => Promise<FileOpResult>> = {
  'file_write': handleFileWrite,
  'file_replace_text': handleFileReplaceText,
  'file_replace_all_text': handleFileReplaceAllText,
  'file_delete': handleFileDelete,
  'file_move': handleFileMove,
  'file_read': handleFileRead,
  'files_read': handleFilesRead,
  'file_read_numbered': handleFileReadNumbered,
  'file_replace_lines': handleFileReplaceLines,
  'dir_create': async (action) => {
    return { success: false, error: 'Not implemented' };
  },
  'dir_delete': async (action) => {
    return { success: false, error: 'Not implemented' };
  },
  'ls': async (action) => {
    return { success: false, error: 'Action not implemented: ls' };
  },
  'grep': async (action) => {
    return { success: false, error: 'Not implemented' };
  },
  'glob': async (action) => {
    return { success: false, error: 'Not implemented' };
  }
};
EOT_fg16
new_text = <<'EOT_fg16'
  private async handleDirCreate(action: LoafAction): Promise<FileOpResult> {
    return { success: false, error: 'Not implemented' };
  }

  private async handleDirDelete(action: LoafAction): Promise<FileOpResult> {
    return { success: false, error: 'Not implemented' };
  }

  private async handleLs(action: LoafAction): Promise<FileOpResult> {
    return { success: false, error: 'Action not implemented: ls' };
  }

  private async handleGrep(action: LoafAction): Promise<FileOpResult> {
    return { success: false, error: 'Not implemented' };
  }

  private async handleGlob(action: LoafAction): Promise<FileOpResult> {
    return { success: false, error: 'Not implemented' };
  }
}

/**
 * Legacy function export for backward compatibility
 * @deprecated Use FsOpsExecutor class instead
 */
export async function executeFileOperation(action: LoafAction): Promise<FileOpResult> {
  throw new Error('Direct function call deprecated. Use FsOpsExecutor class.');
}
EOT_fg16
#!end_fg16
```

Now I need to convert the exec component to a class as well:

```sh nesl
#!nesl [@three-char-SHA-256: fg17]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/exec/src/ExecExecutor.ts"
content = <<'EOT_fg17'
import type { LoafAction } from '../../nesl-action-parser/src/index.js';
import type { FileOpResult } from '../../fs-ops/src/index.js';
import { executeCommand } from './executeCommand.js';

/**
 * Executor for shell/code execution operations
 */
export class ExecExecutor {
  constructor(/* future: execGuard */) {}

  async execute(action: LoafAction): Promise<FileOpResult> {
    if (action.action !== 'exec') {
      return {
        success: false,
        error: `ExecExecutor only handles 'exec' action, got: ${action.action}`
      };
    }

    return executeCommand(action);
  }
}
EOT_fg17
#!end_fg17
```

```sh nesl
#!nesl [@three-char-SHA-256: fg18]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/exec/src/index.ts"
old_text = <<'EOT_fg18'
// Re-export all public functions
export { executeCommand } from './executeCommand';
export { mapLanguageToCommand } from './mapLanguageToCommand';
export { buildSpawnOptions } from './buildSpawnOptions';
export { formatExecResult } from './formatExecResult';

// Re-export types
export type { ExecResult } from './types';
EOT_fg18
new_text = <<'EOT_fg18'
// Re-export all public functions
export { executeCommand } from './executeCommand';
export { mapLanguageToCommand } from './mapLanguageToCommand';
export { buildSpawnOptions } from './buildSpawnOptions';
export { formatExecResult } from './formatExecResult';
export { ExecExecutor } from './ExecExecutor';

// Re-export types
export type { ExecResult } from './types';
EOT_fg18
#!end_fg18
```

Now I need to update the orchestrator to use the new class-based executors:

```sh nesl
#!nesl [@three-char-SHA-256: fg19]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/index.ts"
old_text = <<'EOT_fg19'
import type { LoafAction, ParseResult, ParseError } from '../../nesl-action-parser/src/index.js';
import { parseNeslResponse } from '../../nesl-action-parser/src/index.js';
import type { FileOpResult } from '../../fs-ops/src/index.js';
import type { HooksConfig, HookContext, HookResult } from '../../hooks/src/index.js';
import { HooksManager } from '../../hooks/src/index.js';
import { load as loadYaml } from 'js-yaml';
import { readFile, access } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createStarterConfig } from './createStarterConfig.js';
EOT_fg19
new_text = <<'EOT_fg19'
import type { LoafAction, ParseResult, ParseError } from '../../nesl-action-parser/src/index.js';
import { parseNeslResponse } from '../../nesl-action-parser/src/index.js';
import type { FileOpResult } from '../../fs-ops/src/index.js';
import { FsOpsExecutor } from '../../fs-ops/src/index.js';
import type { HooksConfig, HookContext, HookResult } from '../../hooks/src/index.js';
import { HooksManager } from '../../hooks/src/index.js';
import { FsGuard } from '../../fs-guard/src/index.js';
import { ExecExecutor } from '../../exec/src/index.js';
import { load as loadYaml } from 'js-yaml';
import { readFile, access } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createStarterConfig } from './createStarterConfig.js';
import { loadConfig } from './loadConfig.js';
import type { LoafConfig } from './types.js';
EOT_fg19
#!end_fg19
```

```sh nesl
#!nesl [@three-char-SHA-256: fg20]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/index.ts"
old_text = <<'EOT_fg20'
export class Loaf {
  private options: LoafOptions;
  private executors: Map<string, (action: LoafAction) => Promise<FileOpResult>> | null = null;
  private hooksManager: HooksManager | null = null;

  constructor(options: LoafOptions = {}) {
    this.options = {
      repoPath: options.repoPath || process.cwd(),
      gitCommit: options.gitCommit ?? true,
      hooks: options.hooks,
      enableHooks: options.enableHooks ?? true,
      createConfigIfMissing: options.createConfigIfMissing ?? false
    };
  }
EOT_fg20
new_text = <<'EOT_fg20'
export class Loaf {
  private options: LoafOptions;
  private executors: Map<string, (action: LoafAction) => Promise<FileOpResult>> | null = null;
  private hooksManager: HooksManager | null = null;
  private config: LoafConfig | null = null;

  constructor(options: LoafOptions = {}) {
    this.options = {
      repoPath: options.repoPath || process.cwd(),
      gitCommit: options.gitCommit ?? true,
      hooks: options.hooks,
      enableHooks: options.enableHooks ?? true,
      createConfigIfMissing: options.createConfigIfMissing ?? false
    };
  }
EOT_fg20
#!end_fg20
```

```sh nesl
#!nesl [@three-char-SHA-256: fg21]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/index.ts"
old_text = <<'EOT_fg21'
  /**
   * Initialize action executors with dynamic imports
   * Loads routing from unified-design.yaml
   */
  private async initializeExecutors(): Promise<void> {
    this.executors = new Map();

    // Load unified-design.yaml
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const yamlPath = join(__dirname, '../../../../unified-design.yaml');
    const yamlContent = await readFile(yamlPath, 'utf8');
    const design = loadYaml(yamlContent) as any;

    // Map executor names to modules
    const executorModules: Record<string, () => Promise<any>> = {
      'fs-ops': () => import('../../fs-ops/src/index.js'),
      'exec': () => import('../../exec/src/index.js')
    };

    // Load executors on demand
    const loadedExecutors: Record<string, (action: LoafAction) => Promise<FileOpResult>> = {};

    // Build routing table from YAML
    for (const [actionName, actionDef] of Object.entries(design.tools)) {
      const executor = (actionDef as any).executor || this.inferExecutor(actionName, actionDef);

      if (!executor) {
        console.warn(`No executor defined for action: ${actionName}`);
        continue;
      }

      // Load executor module if not already loaded
      if (!loadedExecutors[executor]) {
        if (executorModules[executor]) {
          const module = await executorModules[executor]();
          // Handle different export names
          if (executor === 'exec') {
            loadedExecutors[executor] = module.executeCommand;
          } else {
            loadedExecutors[executor] = module.executeFileOperation || module.executeOperation;
          }
        } else {
          // Skip planned but unimplemented executors silently
          if (!['context', 'git'].includes(executor)) {
            console.warn(`Unknown executor: ${executor}`);
          }
          continue;
        }
      }

      this.executors.set(actionName, loadedExecutors[executor]);
    }
  }
EOT_fg21
new_text = <<'EOT_fg21'
  /**
   * Initialize action executors with configuration
   */
  private async initializeExecutors(): Promise<void> {
    // Load configuration
    this.config = await loadConfig(this.options.repoPath!);

    // Create fs-guard
    const fsGuard = new FsGuard(
      this.config['fs-guard'] || {
        allowed: [`${this.options.repoPath}/**`, '/tmp/**'],
        denied: ['/**/.git/**', '/**/.ssh/**', '/etc/**', '/sys/**', '/proc/**']
      },
      this.options.repoPath!
    );

    // Create executors
    const fsOps = new FsOpsExecutor(fsGuard);
    const exec = new ExecExecutor();

    // Load unified-design.yaml for routing
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const yamlPath = join(__dirname, '../../../../unified-design.yaml');
    const yamlContent = await readFile(yamlPath, 'utf8');
    const design = loadYaml(yamlContent) as any;

    // Build routing table from YAML
    this.executors = new Map();

    for (const [actionName, actionDef] of Object.entries(design.tools)) {
      const executorName = (actionDef as any).executor || this.inferExecutor(actionName, actionDef);

      switch (executorName) {
        case 'fs-ops':
          this.executors.set(actionName, (action) => fsOps.execute(action));
          break;
        case 'exec':
          this.executors.set(actionName, (action) => exec.execute(action));
          break;
        // Skip unimplemented executors
        case 'context':
        case 'git':
          break;
        default:
          console.warn(`Unknown executor: ${executorName} for action: ${actionName}`);
      }
    }
  }
EOT_fg21
#!end_fg21
```

Now I need to update the hooks initialization to use the loaded config:

```sh nesl
#!nesl [@three-char-SHA-256: fg22]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/index.ts"
old_text = <<'EOT_fg22'
  /**
   * Initialize hooks manager with configuration
   * Loads from options or loaf.yml file
   */
  private async initializeHooks(): Promise<{ configCreated: boolean }> {
    let configCreated = false;

    if (this.options.hooks) {
      // Use provided configuration
      // Wrap the hooks in the expected HooksConfig structure
      const hooksConfig: HooksConfig = {
        hooks: this.options.hooks,
        vars: {}
      };
      this.hooksManager = new HooksManager(hooksConfig, this.options.repoPath);
    } else {
      // Try to load from loaf.yml
      const loafYmlPath = join(this.options.repoPath!, 'loaf.yml');
      try {
        await access(loafYmlPath);
        this.hooksManager = new HooksManager(undefined, this.options.repoPath);
        await this.hooksManager.loadAndSetConfig(loafYmlPath);
        // Don't create a new instance - loadAndSetConfig updates the existing one
      } catch (error: any) {
        if (error.code === 'ENOENT' && this.options.createConfigIfMissing) {
          // Create starter config
          configCreated = await createStarterConfig(this.options.repoPath!);
          if (configCreated) {
            // Load the newly created config
            this.hooksManager = new HooksManager(undefined, this.options.repoPath);
            await this.hooksManager.loadAndSetConfig(loafYmlPath);
          }
        }
        // If not ENOENT or createConfigIfMissing is false, hooks remain disabled
      }
    }

    return { configCreated };
  }
EOT_fg22
new_text = <<'EOT_fg22'
  /**
   * Initialize hooks manager with configuration
   */
  private async initializeHooks(): Promise<{ configCreated: boolean }> {
    let configCreated = false;

    // Ensure config is loaded
    if (!this.config) {
      this.config = await loadConfig(this.options.repoPath!);
    }

    if (this.options.hooks) {
      // Use provided configuration
      const hooksConfig: HooksConfig = {
        hooks: this.options.hooks,
        vars: {}
      };
      this.hooksManager = new HooksManager(hooksConfig, this.options.repoPath);
    } else if (this.config.hooks) {
      // Use hooks from loaded config
      this.hooksManager = new HooksManager(this.config.hooks, this.options.repoPath);
    } else if (this.options.createConfigIfMissing) {
      // Create starter config if missing
      const loafYmlPath = join(this.options.repoPath!, 'loaf.yml');
      try {
        await access(loafYmlPath);
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          configCreated = await createStarterConfig(this.options.repoPath!);
          if (configCreated) {
            // Reload config
            this.config = await loadConfig(this.options.repoPath!);
            if (this.config.hooks) {
              this.hooksManager = new HooksManager(this.config.hooks, this.options.repoPath);
            }
          }
        }
      }
    }

    return { configCreated };
  }
EOT_fg22
#!end_fg22
```

Now let me add the fs-guard package.json:

```sh nesl
#!nesl [@three-char-SHA-256: fg23]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-guard/package.json"
content = <<'EOT_fg23'
{
  "name": "@loaf/fs-guard",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.js"
  },
  "dependencies": {
    "minimatch": "^9.0.3"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
EOT_fg23
#!end_fg23
```

Now I need to update the createStarterConfig to include fs-guard configuration:

```sh nesl
#!nesl [@three-char-SHA-256: fg24]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/createStarterConfig.ts"
old_text = <<'EOT_fg24'
const STARTER_LOAF_YML = `# Loaf configuration
version: 1

hooks:
  before: []
  after: []
  
  # Example hooks (uncomment to use):
  # before:
  #   - run: git stash --include-untracked
  #     continueOnError: false
  
  # after:
  #   - run: git add -A
  #   - run: git commit -m "\${COMMIT_MSG}"
  #     continueOnError: false
  #   - run: git push
  #     continueOnError: true
  #     timeout: 10000  # 10s for slow networks

# Variables available in commands
vars:
  COMMIT_MSG: "AI-assisted changes"
  # Add more variables as needed
`;
EOT_fg24
new_text = <<'EOT_fg24'
const STARTER_LOAF_YML = `# Loaf configuration
version: 1

# File system guard configuration
fs-guard:
  # Allowed paths (supports glob patterns)
  # Relative paths are resolved from this config file's location
  allowed:
    - "./**"           # All files in project
    - "/tmp/**"        # Temporary files
  
  # Denied paths (more specific rules override less specific)
  denied:
    - "**/.git/**"     # Git internals
    - "**/.ssh/**"     # SSH keys
    - "**/node_modules/**"  # Dependencies
  
  # Whether to follow symlinks (default: false)
  followSymlinks: false

# Git hooks configuration
hooks:
  before: []
  after: []
  
  # Example hooks (uncomment to use):
  # before:
  #   - run: git stash --include-untracked
  #     continueOnError: false
  
  # after:
  #   - run: git add -A
  #   - run: git commit -m "\${COMMIT_MSG}"
  #     continueOnError: false
  #   - run: git push
  #     continueOnError: true
  #     timeout: 10000  # 10s for slow networks

# Variables available in commands
vars:
  COMMIT_MSG: "AI-assisted changes"
  # Add more variables as needed
`;
EOT_fg24
#!end_fg24
```

Finally, let me add a tsconfig.json for the fs-guard component:

```sh nesl
#!nesl [@three-char-SHA-256: fg25]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-guard/tsconfig.json"
content = <<'EOT_fg25'
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
EOT_fg25
#!end_fg25
```

These changes implement the fs-guard component as specified in the architecture documents. The key aspects:

1. **Config architecture refactor**: Single `loaf.yml` file contains all component configs
2. **Class-based executors**: Both fs-ops and exec converted from functions to classes accepting dependencies
3. **fs-guard integration**: Intercepts at fs-ops executor level, checking permissions before operations
4. **Most-specific-wins precedence**: Pattern specificity calculated by non-wildcard segments
5. **Clear error messages**: "fs-guard violation:" prefix distinguishes from OS errors

The implementation follows the ARCH.md decisions precisely, including canonicalization strategy, permission model, and error handling. The executor refactor breaks backward compatibility but enables proper dependency injection for security guards.