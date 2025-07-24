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

  /**
   * Handle file_move action - moves/renames a file
   * Creates parent directories for destination if needed
   * Overwrites destination if it exists
   */
  private async handleFileMove(action: LoafAction): Promise<FileOpResult> {
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

  /**
   * Handle file_delete action - removes a file
   */
  private async handleFileDelete(action: LoafAction): Promise<FileOpResult> {
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

  /**
   * Handle file_write action - writes/creates/overwrites a file with content
   * Automatically creates parent directories if needed
   */
  private async handleFileWrite(action: LoafAction): Promise<FileOpResult> {
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

  /**
   * Handle file_read action - reads file content
   */
  private async handleFileRead(action: LoafAction): Promise<FileOpResult> {
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

  /**
   * Handle file_read_numbered action - reads file content with line numbers
   * Returns specified lines with line numbers prepended
   * If lines parameter is missing, reads all lines
   * If some lines are out of range, returns available content with error
   */
  private async handleFileReadNumbered(action: LoafAction): Promise<FileOpResult> {
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

  /**
   * Handle file_replace_lines action - replaces specified lines in a file
   * Supports single line ("4") or range ("23-43") specifications
   * Preserves line endings and handles edge cases
   */
  private async handleFileReplaceLines(action: LoafAction): Promise<FileOpResult> {
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

  /**
   * Handle files_read action - reads multiple files and returns their contents
   * Parses multi-line paths parameter, one absolute path per line
   * Returns an array of file contents in the same order as the paths
   */
  private async handleFilesRead(action: LoafAction): Promise<FileOpResult> {
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

  /**
   * Handle file_replace_text action - replaces EXACTLY ONE occurrence
   * Fails if old_text appears 0 or 2+ times
   */
  private async handleFileReplaceText(action: LoafAction): Promise<FileOpResult> {
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

  /**
   * Handle file_replace_all_text action - replaces all occurrences
   * If count provided, validates exact match
   */
  private async handleFileReplaceAllText(action: LoafAction): Promise<FileOpResult> {
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