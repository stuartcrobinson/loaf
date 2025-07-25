📋 Copied to clipboard

=== LOAF RESULTS ===
a1b ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_write.ts
a2b ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_read.ts
a3b ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_read_numbered.ts
a4b ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_replace_text.ts
a5b ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_replace_all_text.ts
a6b ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_replace_lines.ts
a7b ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_delete.ts
a8b ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_move.ts
a9b ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/files_read.ts
b1c ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-ops/src/utils.ts
c2d ✅ file_write /Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts
d3e ✅ file_delete /Users/stuart/repos/loaf/proj/comp/fs-ops/src/fileSystemUtils.ts
d4e ✅ file_delete /Users/stuart/repos/loaf/proj/comp/fs-ops/src/formatNodeError.ts
=== END ===

I'll refactor the fs-ops code to have one file per action. Let me start by creating the new action files and then update the main index.ts file.

```sh nesl
#!nesl [@three-char-SHA-256: a1b]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_write.ts"
content = <<'EOT_a1b'
import type { LoafAction } from '../../../nesl-action-parser/src/index.js';
import type { FsGuard } from '../../../fs-guard/src/index.js';
import type { FileOpResult } from '../index.js';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { formatNodeError, fileExists } from '../utils.js';

export async function handle__file_write(guard: FsGuard, action: LoafAction): Promise<FileOpResult> {
  const { path, content } = action.parameters;

  try {
    // Create parent directories if needed
    const parentDir = dirname(path);
    await mkdir(parentDir, { recursive: true });

    // Write file
    await writeFile(path, content, 'utf8');
    const bytesWritten = Buffer.byteLength(content, 'utf8');

    // Temporary debug for test 004
    if (path.includes('move-to-existing-file')) {
      // console.log(`DEBUG: Wrote file ${path}`);
      const exists = await fileExists(path);
      // console.log(`DEBUG: File exists after write: ${exists}`);
    }

    return {
      success: true,
      data: {
        path,
        bytesWritten
      }
    };

  } catch (error: any) {
    return {
      success: false,
      error: formatNodeError(error, path, 'open')
    };
  }
}
EOT_a1b
#!end_a1b
```

```sh nesl
#!nesl [@three-char-SHA-256: a2b]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_read.ts"
content = <<'EOT_a2b'
import type { LoafAction } from '../../../nesl-action-parser/src/index.js';
import type { FsGuard } from '../../../fs-guard/src/index.js';
import type { FileOpResult } from '../index.js';
import { readFile } from 'fs/promises';
import { formatNodeError } from '../utils.js';

export async function handle__file_read(guard: FsGuard, action: LoafAction): Promise<FileOpResult> {
  const { path } = action.parameters;

  try {
    const content = await readFile(path, 'utf8');

    return {
      success: true,
      data: {
        path,
        content
      }
    };

  } catch (error: any) {
    return {
      success: false,
      error: formatNodeError(error, path, 'open')
    };
  }
}
EOT_a2b
#!end_a2b
```

```sh nesl
#!nesl [@three-char-SHA-256: a3b]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_read_numbered.ts"
content = <<'EOT_a3b'
import type { LoafAction } from '../../../nesl-action-parser/src/index.js';
import type { FsGuard } from '../../../fs-guard/src/index.js';
import type { FileOpResult } from '../index.js';
import { readFile } from 'fs/promises';
import { formatNodeError } from '../utils.js';
import { extractNumberedLines } from '../extractNumberedLines.js';

export async function handle__file_read_numbered(guard: FsGuard, action: LoafAction): Promise<FileOpResult> {
  const { path, lines, delimiter = ": " } = action.parameters;

  try {
    const content = await readFile(path, 'utf8');

    // Extract and number the requested lines
    const { result, outOfRange } = extractNumberedLines(content, lines, delimiter);

    // If out of range, return error with partial content
    if (outOfRange) {
      return {
        success: false,
        error: `file_read_numbered: Requested lines ${outOfRange.requested} but file only has ${outOfRange.actual} lines`,
        data: {
          path,
          content: result
        }
      };
    }

    return {
      success: true,
      data: {
        path,
        content: result
      }
    };

  } catch (error: any) {
    // Check if it's our custom validation error
    if (error.message && error.message.startsWith('Invalid line')) {
      return {
        success: false,
        error: `file_read_numbered: ${error.message}`
      };
    }

    return {
      success: false,
      error: formatNodeError(error, path, 'open')
    };
  }
}
EOT_a3b
#!end_a3b
```

```sh nesl
#!nesl [@three-char-SHA-256: a4b]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_replace_text.ts"
content = <<'EOT_a4b'
import type { LoafAction } from '../../../nesl-action-parser/src/index.js';
import type { FsGuard } from '../../../fs-guard/src/index.js';
import type { FileOpResult } from '../index.js';
import { readFile, writeFile } from 'fs/promises';
import { formatNodeError } from '../utils.js';
import { replaceText } from '../replaceText.js';

export async function handle__file_replace_text(guard: FsGuard, action: LoafAction): Promise<FileOpResult> {
  const { path, old_text, new_text } = action.parameters;

  // Validate old_text is not empty
  if (!old_text || old_text.length === 0) {
    return {
      success: false,
      error: 'file_replace_text: old_text cannot be empty'
    };
  }

  try {
    // Read existing file content
    const content = await readFile(path, 'utf8');

    // Count occurrences first
    let count = 0;
    let searchIndex = 0;
    while (true) {
      const index = content.indexOf(old_text, searchIndex);
      if (index === -1) break;
      count++;
      searchIndex = index + old_text.length;
    }

    // Validate exactly one occurrence
    if (count === 0) {
      return {
        success: false,
        error: `file_replace_text: old_text not found in file`
      };
    }
    if (count > 1) {
      return {
        success: false,
        error: `file_replace_text: old_text appears ${count} times, must appear exactly once`
      };
    }

    // Replace the single occurrence
    const { result, replacements } = replaceText(content, old_text, new_text, 1);

    // Write updated content back
    await writeFile(path, result, 'utf8');

    return {
      success: true,
      data: {
        path,
        replacements
      }
    };

  } catch (error: any) {
    // Special case for empty old_text validation error
    if (error.message === 'old_text cannot be empty') {
      return {
        success: false,
        error: 'file_replace_text: old_text cannot be empty'
      };
    }

    return {
      success: false,
      error: formatNodeError(error, path, 'open')
    };
  }
}
EOT_a4b
#!end_a4b
```

```sh nesl
#!nesl [@three-char-SHA-256: a5b]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_replace_all_text.ts"
content = <<'EOT_a5b'
import type { LoafAction } from '../../../nesl-action-parser/src/index.js';
import type { FsGuard } from '../../../fs-guard/src/index.js';
import type { FileOpResult } from '../index.js';
import { readFile, writeFile } from 'fs/promises';
import { formatNodeError } from '../utils.js';
import { replaceText } from '../replaceText.js';

export async function handle__file_replace_all_text(guard: FsGuard, action: LoafAction): Promise<FileOpResult> {
  const { path, old_text, new_text, count } = action.parameters;

  // Validate old_text is not empty
  if (!old_text || old_text.length === 0) {
    return {
      success: false,
      error: 'file_replace_all_text: old_text cannot be empty'
    };
  }

  try {
    // Read existing file content
    const content = await readFile(path, 'utf8');

    // If count specified, validate it matches actual occurrences
    if (count !== undefined) {
      // Count actual occurrences
      let actualCount = 0;
      let searchIndex = 0;
      while (true) {
        const index = content.indexOf(old_text, searchIndex);
        if (index === -1) break;
        actualCount++;
        searchIndex = index + old_text.length;
      }

      if (actualCount !== count) {
        return {
          success: false,
          error: `file_replace_all_text: expected ${count} occurrences but found ${actualCount}`
        };
      }
    }

    // Replace all occurrences
    const { result, replacements } = replaceText(content, old_text, new_text);

    // Write updated content back
    await writeFile(path, result, 'utf8');

    return {
      success: true,
      data: {
        path,
        replacements
      }
    };

  } catch (error: any) {
    // Special case for empty old_text validation error
    if (error.message === 'old_text cannot be empty') {
      return {
        success: false,
        error: 'file_replace_all_text: old_text cannot be empty'
      };
    }

    return {
      success: false,
      error: formatNodeError(error, path, 'open')
    };
  }
}
EOT_a5b
#!end_a5b
```

```sh nesl
#!nesl [@three-char-SHA-256: a6b]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_replace_lines.ts"
content = <<'EOT_a6b'
import type { LoafAction } from '../../../nesl-action-parser/src/index.js';
import type { FsGuard } from '../../../fs-guard/src/index.js';
import type { FileOpResult } from '../index.js';
import { readFile, writeFile } from 'fs/promises';
import { formatNodeError } from '../utils.js';

export async function handle__file_replace_lines(guard: FsGuard, action: LoafAction): Promise<FileOpResult> {
  const { path, lines, new_content } = action.parameters;

  try {
    // Read existing file content
    const content = await readFile(path, 'utf8');

    // Handle empty file edge case
    if (content === '') {
      return {
        success: false,
        error: `file_replace_lines: Line range ${lines} is out of bounds (file has 0 lines)`
      };
    }

    // Split into lines, preserving empty lines
    // Check if content ends with a newline
    const endsWithNewline = content.match(/\r?\n$/);
    const fileLines = content.split(/\r?\n|\r/);

    // If the file ends with a newline, split gives us an extra empty element
    // Remove it for line counting, but remember it existed
    if (endsWithNewline && fileLines[fileLines.length - 1] === '') {
      fileLines.pop();
    }

    const totalLines = fileLines.length;

    // Parse line specification
    let startLine: number;
    let endLine: number;

    if (!lines || lines === '') {
      return {
        success: false,
        error: `file_replace_lines: Invalid line specification '${lines}'`
      };
    }

    if (lines.includes('-')) {
      // Range format: "23-43"
      const parts = lines.split('-');
      if (parts.length !== 2) {
        return {
          success: false,
          error: `file_replace_lines: Invalid line specification '${lines}'`
        };
      }

      startLine = parseInt(parts[0], 10);
      endLine = parseInt(parts[1], 10);

      if (isNaN(startLine) || isNaN(endLine)) {
        return {
          success: false,
          error: `file_replace_lines: Invalid line specification '${lines}'`
        };
      }

      if (startLine < 1 || endLine < 1) {
        return {
          success: false,
          error: `file_replace_lines: Invalid line specification '${lines}'`
        };
      }

      if (startLine > endLine) {
        return {
          success: false,
          error: `file_replace_lines: Invalid line range '${lines}' (start must be <= end)`
        };
      }
    } else {
      // Single line format: "4"
      startLine = parseInt(lines, 10);
      if (isNaN(startLine) || startLine < 1) {
        return {
          success: false,
          error: `file_replace_lines: Invalid line specification '${lines}'`
        };
      }
      endLine = startLine;
    }

    // Check if lines are out of range
    if (startLine > totalLines || endLine > totalLines) {
      return {
        success: false,
        error: `file_replace_lines: Line range ${lines} is out of bounds (file has ${totalLines} lines)`
      };
    }

    // Split new content into lines
    // Empty content should produce one empty line, not zero lines
    const newLines = new_content.split(/\r?\n|\r/);

    // Reconstruct the file with replaced lines
    const resultLines: string[] = [];

    // Add lines before the replacement range
    for (let i = 0; i < startLine - 1; i++) {
      resultLines.push(fileLines[i]);
    }

    // Add the new content
    resultLines.push(...newLines);

    // Add lines after the replacement range
    for (let i = endLine; i < totalLines; i++) {
      resultLines.push(fileLines[i]);
    }

    // Join back with newlines
    let result = resultLines.join('\n');

    // If the original file ended with a newline, preserve it
    if (endsWithNewline) {
      result += '\n';
    }

    // Write the file back
    await writeFile(path, result, 'utf8');

    const linesReplaced = endLine - startLine + 1;

    return {
      success: true,
      data: {
        path,
        lines_replaced: linesReplaced
      }
    };

  } catch (error: any) {
    return {
      success: false,
      error: formatNodeError(error, path, 'open')
    };
  }
}
EOT_a6b
#!end_a6b
```

```sh nesl
#!nesl [@three-char-SHA-256: a7b]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_delete.ts"
content = <<'EOT_a7b'
import type { LoafAction } from '../../../nesl-action-parser/src/index.js';
import type { FsGuard } from '../../../fs-guard/src/index.js';
import type { FileOpResult } from '../index.js';
import { unlink } from 'fs/promises';
import { formatNodeError } from '../utils.js';

export async function handle__file_delete(guard: FsGuard, action: LoafAction): Promise<FileOpResult> {
  const { path } = action.parameters;

  try {
    await unlink(path);

    return {
      success: true,
      data: {
        path
      }
    };

  } catch (error: any) {
    return {
      success: false,
      error: formatNodeError(error, path, 'unlink')
    };
  }
}
EOT_a7b
#!end_a7b
```

```sh nesl
#!nesl [@three-char-SHA-256: a8b]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_move.ts"
content = <<'EOT_a8b'
import type { LoafAction } from '../../../nesl-action-parser/src/index.js';
import type { FsGuard } from '../../../fs-guard/src/index.js';
import type { FileOpResult } from '../index.js';
import { rename, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { formatNodeError, fileExists } from '../utils.js';

export async function handle__file_move(guard: FsGuard, action: LoafAction): Promise<FileOpResult> {
  const { old_path, new_path } = action.parameters;

  try {
    // Pre-flight check for better error messages
    const sourceExists = await fileExists(old_path);

    if (!sourceExists) {
      return {
        success: false,
        error: `file_move: Source file not found '${old_path}' (ENOENT)`
      };
    }

    // Check if destination exists (for overwrote flag)
    const destExists = await fileExists(new_path);

    // Create parent directories for destination
    const parentDir = dirname(new_path);
    await mkdir(parentDir, { recursive: true });

    // Move the file
    await rename(old_path, new_path);

    const result: FileOpResult = {
      success: true,
      data: {
        old_path,
        new_path
      }
    };

    if (destExists) {
      result.data.overwrote = true;
    }

    return result;

  } catch (error: any) {
    return {
      success: false,
      error: formatNodeError(error, old_path, 'rename', new_path)
    };
  }
}
EOT_a8b
#!end_a8b
```

```sh nesl
#!nesl [@three-char-SHA-256: a9b]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/files_read.ts"
content = <<'EOT_a9b'
import type { LoafAction } from '../../../nesl-action-parser/src/index.js';
import type { FsGuard } from '../../../fs-guard/src/index.js';
import type { FileOpResult } from '../index.js';
import { readFile } from 'fs/promises';
import { formatNodeError } from '../utils.js';

export async function handle__files_read(guard: FsGuard, action: LoafAction): Promise<FileOpResult> {
  const { paths } = action.parameters;

  // Parse the multi-line paths string
  const pathList = paths
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);  // Remove empty lines

  if (pathList.length === 0) {
    return {
      success: false,
      error: 'files_read: No paths provided'
    };
  }

  // Read all files, collecting content and errors
  const results: Array<{ path: string; content?: string; error?: string }> = [];

  for (const filePath of pathList) {
    try {
      const content = await readFile(filePath, 'utf8');
      results.push({ path: filePath, content });
    } catch (error: any) {
      // Collect error for this file
      const errorMsg = formatNodeError(error, filePath, 'open');
      results.push({ path: filePath, error: errorMsg });
    }
  }

  // Check if any files failed to read
  const failedFiles = results.filter(r => r.error);
  if (failedFiles.length > 0) {
    // Return error listing all failed files
    const errorDetails = failedFiles
      .map(f => `  ${f.path}: ${f.error}`)
      .join('\n');
    return {
      success: false,
      error: `files_read: Failed to read ${failedFiles.length} file(s):\n${errorDetails}`
    };
  }

  // All files read successfully - return contents as array
  const contents = results.map(r => r.content!);

  return {
    success: true,
    data: {
      paths: pathList,
      content: contents
    }
  };
}
EOT_a9b
#!end_a9b
```

Now let me create the utils.ts file with the shared utilities:

```sh nesl
#!nesl [@three-char-SHA-256: b1c]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/utils.ts"
content = <<'EOT_b1c'
import { stat } from 'fs/promises';

/**
 * Check if a file or directory exists
 * @param path - File or directory path to check
 * @returns true if exists, false otherwise
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format Node.js filesystem errors into consistent error messages
 * @param error - The error object from Node.js
 * @param path - The file path involved in the operation
 * @param operation - The operation that was attempted
 * @returns Formatted error message string
 */
export function formatNodeError(error: any, path: string, operation: string, dest?: string): string {
  // Node.js errors have a code property
  if (error.code) {
    switch (error.code) {
      case 'ENOENT':
        if (operation === 'rename' && dest) {
          return `ENOENT: no such file or directory, rename '${path}' -> '${dest}'`;
        }
        return `ENOENT: no such file or directory, ${operation} '${path}'`;
      case 'EEXIST':
        return `EEXIST: file already exists, ${operation} '${path}'`;
      case 'EACCES':
        if (operation === 'rename' && dest) {
          return `EACCES: permission denied, rename '${path}' -> '${dest}'`;
        }
        return `EACCES: permission denied, ${operation} '${path}'`;
      case 'EISDIR':
        return `EISDIR: illegal operation on a directory, ${operation} '${path}'`;
      case 'ENOTDIR':
        return `ENOTDIR: not a directory, ${operation} '${path}'`;
      case 'ENOTEMPTY':
        return `ENOTEMPTY: directory not empty, ${operation} '${path}'`;
      default:
        return `${error.code}: ${error.message}`;
    }
  }
  
  // Fallback for non-Node errors
  return error.message || `Unknown error during ${operation} on '${path}'`;
}
EOT_b1c
#!end_b1c
```

Now, let's update the main index.ts file:

```sh nesl
#!nesl [@three-char-SHA-256: c2d]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/index.ts"
content = <<'EOT_c2d'
/**
 * fs-ops - File system operations executor for loaf
 * 
 * Handles all file and directory operations from parsed NESL actions
 */

import type { LoafAction } from '../../nesl-action-parser/src/index.js';
import type { FsGuard } from '../../fs-guard/src/index.js';

// Import all implemented action handlers
import { handle__file_write } from './actions/file_write.js';
import { handle__file_read } from './actions/file_read.js';
import { handle__file_read_numbered } from './actions/file_read_numbered.js';
import { handle__file_replace_text } from './actions/file_replace_text.js';
import { handle__file_replace_all_text } from './actions/file_replace_all_text.js';
import { handle__file_replace_lines } from './actions/file_replace_lines.js';
import { handle__file_delete } from './actions/file_delete.js';
import { handle__file_move } from './actions/file_move.js';
import { handle__files_read } from './actions/files_read.js';

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

// Actions that are specified but not yet implemented
const NOT_IMPLEMENTED = new Set([
  'dir_create',
  'dir_delete',
  'ls',
  'grep',
  'glob',
  'file_replace_text_range',
  'file_append',
  'exec',
  'context_add',
  'context_remove',
  'context_list',
  'context_prune',
  'context_clear',
  'git_squash',
  'undo',
  'git_step_back',
  'git_step_forward',
  'files_replace_all_text',
  'files_replace_text_in_parents'
]);

/**
 * File system operations executor with security guard
 */
export class FsOpsExecutor {
  private handlers: Map<string, (action: LoafAction) => Promise<FileOpResult>>;

  constructor(private guard: FsGuard) {
    this.handlers = new Map([
      ['file_write', (action) => handle__file_write(this.guard, action)],
      ['file_read', (action) => handle__file_read(this.guard, action)],
      ['file_read_numbered', (action) => handle__file_read_numbered(this.guard, action)],
      ['file_replace_text', (action) => handle__file_replace_text(this.guard, action)],
      ['file_replace_all_text', (action) => handle__file_replace_all_text(this.guard, action)],
      ['file_replace_lines', (action) => handle__file_replace_lines(this.guard, action)],
      ['file_delete', (action) => handle__file_delete(this.guard, action)],
      ['file_move', (action) => handle__file_move(this.guard, action)],
      ['files_read', (action) => handle__files_read(this.guard, action)]
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
        // Check if it's a known but not implemented action
        if (NOT_IMPLEMENTED.has(action.action)) {
          return {
            success: false,
            error: `Action not yet implemented: ${action.action}`
          };
        }
        // Truly unknown action
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
}

/**
 * Legacy function export for backward compatibility
 * @deprecated Use FsOpsExecutor class instead
 */
export async function executeFileOperation(action: LoafAction): Promise<FileOpResult> {
  throw new Error('Direct function call deprecated. Use FsOpsExecutor class.');
}
EOT_c2d
#!end_c2d
```

Now let's remove the old utility files that have been moved to utils.ts:

```sh nesl
#!nesl [@three-char-SHA-256: d3e]
action = "file_delete"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/fileSystemUtils.ts"
#!end_d3e
```

```sh nesl
#!nesl [@three-char-SHA-256: d4e]
action = "file_delete"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/src/formatNodeError.ts"
#!end_d4e
```

The refactoring is complete! Here's what we've accomplished:

1. **One file per action**: Each implemented action now has its own file in `src/actions/`
2. **Clear naming**: Files are named exactly like the actions (e.g., `file_write.ts`)
3. **Function naming**: All handlers use the `handle__` prefix for easy visual scanning
4. **Three error types**: 
   - "fs-guard violation" for permission denied
   - "Action not yet implemented" for known but unimplemented actions
   - "Unknown action" for truly unrecognized actions
5. **Shared utilities**: Common functions moved to `utils.ts`
6. **Clean index.ts**: Much smaller, just imports and wires up the handlers

The structure is now much cleaner and it's easy to see:
- What actions are implemented (look at the imports)
- Where each action's code lives (in its own file)
- What actions are planned but not implemented (in the `NOT_IMPLEMENTED` set)