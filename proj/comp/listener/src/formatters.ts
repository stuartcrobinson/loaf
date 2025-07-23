import type { OrchestratorResult } from '../../orch/src/types.js';

// export function formatSummary(orchResult: OrchestratorResult, timestamp: Date): string {
//   const lines = ['', '=== LOAF RESULTS ==='];

//   // Add execution results
//   if (orchResult.results) {
//     for (const result of orchResult.results) {
//       const icon = result.success ? '✅' : '❌';
//       const primaryParam = getPrimaryParamFromResult(result);

//       if (result.success) {
//         lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam}`.trim());
//       } else {
//         lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam} - ${getErrorSummary(result.error)}`.trim());
//       }
//     }
//   }

//   // Add parse errors - group by blockId
//   if (orchResult.parseErrors) {
//     const errorsByBlock = new Map<string, any[]>();

//     for (const error of orchResult.parseErrors) {
//       const blockId = error.blockId || 'unknown';
//       if (!errorsByBlock.has(blockId)) {
//         errorsByBlock.set(blockId, []);
//       }
//       errorsByBlock.get(blockId)!.push(error);
//     }

//     // Format grouped errors
//     for (const [blockId, errors] of errorsByBlock) {
//       const firstError = errors[0];
//       const action = firstError.action || 'parse';
//       const lineInfo = firstError.blockStartLine ? `, line ${firstError.blockStartLine}` : '';

//       if (errors.length === 1) {
//         // Single error - simple format
//         lines.push(`${blockId} ❌ ${action}${lineInfo} - ${firstError.errorType}: ${firstError.message}`);
//       } else {
//         // Multiple errors - list them
//         lines.push(`${blockId} ❌ ${action}${lineInfo} - ${errors.length} errors:`);
//         const uniqueMessages = [...new Set(errors.map(e => `  ${e.errorType}: ${e.message}`))];
//         lines.push(...uniqueMessages);
//       }
//     }
//   }

//   lines.push('=== END ===', '');
//   return lines.join('\n');
// }


export function formatSummary(orchResult: OrchestratorResult, timestamp: Date): string {
  const lines = ['', '=== LOAF RESULTS ==='];

  // DEBUG: Log raw orchestrator result for parse errors
  if (orchResult.parseErrors && orchResult.parseErrors.length > 0) {
    // console.log('DEBUG: Raw parseErrors:', JSON.stringify(orchResult.parseErrors, null, 2));
  }

  // Add execution results
  if (orchResult.results) {
    for (const result of orchResult.results) {
      const icon = result.success ? '✅' : '❌';
      const primaryParam = getPrimaryParamFromResult(result);

      if (result.success) {
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam}`.trim());
      } else {
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam} - ${getErrorSummary(result.error)}`.trim());
      }
    }
  }

  // Add parse errors - group by blockId
  if (orchResult.parseErrors) {
    const errorsByBlock = new Map<string, any[]>();

    // Group errors by blockId
    for (const error of orchResult.parseErrors) {
      const blockId = error.blockId || 'unknown';
      if (!errorsByBlock.has(blockId)) {
        errorsByBlock.set(blockId, []);
      }
      errorsByBlock.get(blockId)!.push(error);
    }

    // Format grouped errors
    for (const [blockId, errors] of errorsByBlock) {
      const firstError = errors[0];
      const action = firstError.action || '-';
      const lineInfo = firstError.blockStartLine ? ` (line ${firstError.blockStartLine})` : '';

      // Pad action to 10 characters for alignment
      const paddedAction = action.padEnd(10);

      if (errors.length === 1) {
        // Single error
        lines.push(`${blockId} ❌ ${paddedAction} ERROR: ${firstError.message}${lineInfo}`);
      } else {
        // Multiple errors - count unique messages
        const messageCount = new Map<string, number>();
        for (const error of errors) {
          const msg = error.message;
          messageCount.set(msg, (messageCount.get(msg) || 0) + 1);
        }

        // First line shows total count
        lines.push(`${blockId} ❌ ${paddedAction} ERROR: ${errors.length} syntax errors${lineInfo}`);

        // Sub-bullets for each unique error type
        const indent = ' '.repeat(20); // Align with ERROR: column
        for (const [msg, count] of messageCount) {
          if (count > 1) {
            lines.push(`${indent}- ${msg} (${count} occurrences)`);
          } else {
            lines.push(`${indent}- ${msg}`);
          }
        }
      }
    }
  }

  lines.push('=== END ===', '');
  return lines.join('\n');
}

function getPrimaryParamFromResult(result: any): string {
  if (!result.params) return '';
  if (result.params.path) return result.params.path;
  if (result.params.paths) {
    const paths = result.params.paths.trim().split('\n').filter((p: string) => p.trim());
    return `(${paths.length} files)`;
  }
  if (result.params.pattern) return result.params.pattern;
  if (result.params.lang) return result.params.lang;
  if (result.params.old_path) return result.params.old_path;
  return '';
}

function getErrorSummary(error?: string): string {
  if (!error) return 'Unknown error';

  // Extract key error info
  if (error.includes('File not found')) return 'File not found';
  if (error.includes('no such file or directory')) return 'File not found';
  if (error.includes('Permission denied')) return 'Permission denied';
  if (error.includes('Output too large')) return error; // Keep full message

  // For other errors, take first part before details
  const match = error.match(/^[^:]+:\s*([^'(]+)/);
  if (match) return match[1].trim();

  return error.split('\n')[0]; // First line only
}

/**
 * Format file read output in a human-readable way
 */
function formatFileReadOutput(result: any): string[] {
  const lines: string[] = [];

  if (result.action === 'file_read') {
    // Simple file read - data contains { path, content }
    const path = result.data.path || result.params?.path || 'unknown';
    lines.push(`=== START FILE: ${path} ===`);
    lines.push((result.data.content !== undefined ? result.data.content : result.data) || '[empty file]');
    lines.push(`=== END FILE: ${path} ===`);
  } else if (result.action === 'file_read_numbered') {
    // Numbered file read - data contains { path, content } where content has line numbers
    const path = result.data.path || result.params?.path || 'unknown';
    lines.push(`=== START FILE: [numbered] ${path} ===`);
    lines.push((result.data.content !== undefined ? result.data.content : result.data) || '[empty file]');
    lines.push(`=== END FILE: [numbered] ${path} ===`);
  } else if (result.action === 'files_read') {
    // Multiple files read - data contains { paths: string[], content: string[] }
    // Each element in content array corresponds to the file at the same index in paths
    if (result.data.paths && result.data.content) {
      lines.push(`Reading ${result.data.paths.length} files:`);

      // List all files first
      for (const path of result.data.paths) {
        lines.push(`- ${path}`);
      }

      // Add blank line before file contents
      lines.push('');

      // Format each file's content with START/END markers
      for (let i = 0; i < result.data.paths.length; i++) {
        const path = result.data.paths[i];
        const content = result.data.content[i];

        lines.push(`=== START FILE: ${path} ===`);
        lines.push(content || '[empty file]');
        lines.push(`=== END FILE: ${path} ===`);

        // Add blank line between files (except after the last one)
        if (i < result.data.paths.length - 1) {
          lines.push('');
        }
      }
    } else {
      // Fallback for unexpected format
      lines.push(`Reading 0 files:`);
    }
  }

  return lines;
}

export function formatFullOutput(orchResult: OrchestratorResult): string {
  const lines = ['=== LOAF RESULTS ==='];

  // Add execution results
  if (orchResult.results) {
    for (const result of orchResult.results) {
      const icon = result.success ? '✅' : '❌';
      const primaryParam = getPrimaryParamFromResult(result);

      if (result.success) {
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam}`.trim());
      } else {
        lines.push(`${result.blockId} ${icon} ${result.action} ${primaryParam} - ${getErrorSummary(result.error)}`.trim());
      }
    }
  }

  // Add parse errors - group by blockId
  if (orchResult.parseErrors) {
    const errorsByBlock = new Map<string, any[]>();

    // Group errors by blockId
    for (const error of orchResult.parseErrors) {
      const blockId = error.blockId || 'unknown';
      if (!errorsByBlock.has(blockId)) {
        errorsByBlock.set(blockId, []);
      }
      errorsByBlock.get(blockId)!.push(error);
    }

    // Format grouped errors
    for (const [blockId, errors] of errorsByBlock) {
      const firstError = errors[0];
      const action = firstError.action || '-';
      const lineInfo = firstError.blockStartLine ? ` (line ${firstError.blockStartLine})` : '';

      // Pad action to 10 characters for alignment
      const paddedAction = action.padEnd(10);

      if (errors.length === 1) {
        // Single error
        lines.push(`${blockId} ❌ ${paddedAction} ERROR: ${firstError.message}${lineInfo}`);
      } else {
        // Multiple errors - count unique messages
        const messageCount = new Map<string, number>();
        for (const error of errors) {
          const msg = error.message;
          messageCount.set(msg, (messageCount.get(msg) || 0) + 1);
        }

        // First line shows total count
        lines.push(`${blockId} ❌ ${paddedAction} ERROR: ${errors.length} syntax errors${lineInfo}`);

        // Sub-bullets for each unique error type
        const indent = ' '.repeat(20); // Align with ERROR: column
        for (const [msg, count] of messageCount) {
          if (count > 1) {
            lines.push(`${indent}- ${msg} (${count} occurrences)`);
          } else {
            lines.push(`${indent}- ${msg}`);
          }
        }
      }
    }
  }

  lines.push('=== END ===', '', '=== OUTPUTS ===');

  // Add outputs for successful actions based on output_display rules
  if (orchResult.results) {
    for (const result of orchResult.results) {
      if (result.success && result.data && shouldShowOutput(result.action, result.params)) {
        const primaryParam = getPrimaryParamFromResult(result);
        // For file read operations, don't include path in header since it's shown in the formatted output
        const includeParam = !['file_read', 'file_read_numbered', 'files_read'].includes(result.action);
        const header = (primaryParam && includeParam)
          ? `[${result.blockId}] ${result.action} ${primaryParam}:`
          : `[${result.blockId}] ${result.action}:`;
        lines.push('', header);

        // Special formatting for file read operations
        if (['file_read', 'file_read_numbered', 'files_read'].includes(result.action)) {
          const formattedOutput = formatFileReadOutput(result);
          lines.push(...formattedOutput);
        } else if (typeof result.data === 'string') {
          lines.push(result.data.trimEnd());
        } else if (result.data.stdout || result.data.stderr) {
          if (result.data.stdout) {
            lines.push(`stdout:\n${result.data.stdout.trimEnd()}`);
          }
          if (result.data.stderr) {
            lines.push(`stderr:\n${result.data.stderr.trimEnd()}`);
          }
        } else {
          lines.push(JSON.stringify(result.data, null, 2));
        }
      }
    }
  }

  lines.push('=== END ===');
  return lines.join('\n');
}

/**
 * Check if output should be displayed for an action based on unified-design.yaml rules.
 * This is a simplified check - the real implementation would load from unified-design.yaml.
 */
function shouldShowOutput(action: string, params?: any): boolean {
  // Actions with output_display: never
  const neverShowOutput = ['file_write', 'file_replace_text', 'file_replace_all_text', 'file_append', 'file_delete', 'file_move', 'dir_create', 'dir_delete'];
  if (neverShowOutput.includes(action)) {
    return false;
  }

  // Actions with output_display: always
  const alwaysShowOutput = ['file_read', 'file_read_numbered', 'files_read', 'ls', 'grep', 'glob'];
  if (alwaysShowOutput.includes(action)) {
    return true;
  }

  // Actions with output_display: conditional
  if (action === 'exec') {
    // Check return_output parameter (default is true)
    return params?.return_output !== false;
  }

  // Default to showing output for unknown actions
  return true;
}

