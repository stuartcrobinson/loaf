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

/**
 * Handle file_move action - moves/renames a file
 * Creates parent directories for destination if needed
 * Overwrites destination if it exists
 */
async function handleFileMove(action: LoafAction): Promise<FileOpResult> {
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
async function handleFileDelete(action: LoafAction): Promise<FileOpResult> {
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
async function handleFileWrite(action: LoafAction): Promise<FileOpResult> {
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
async function handleFileRead(action: LoafAction): Promise<FileOpResult> {
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
async function handleFileReadNumbered(action: LoafAction): Promise<FileOpResult> {
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
async function handleFileReplaceLines(action: LoafAction): Promise<FileOpResult> {
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
async function handleFilesRead(action: LoafAction): Promise<FileOpResult> {
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
async function handleFileReplaceText(action: LoafAction): Promise<FileOpResult> {
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
async function handleFileReplaceAllText(action: LoafAction): Promise<FileOpResult> {
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