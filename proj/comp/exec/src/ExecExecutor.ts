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