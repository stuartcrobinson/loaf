import type { LoafAction, ParseResult, ParseError } from '../../nesl-action-parser/src/index.js';
import { parseNeslResponse } from '../../nesl-action-parser/src/index.js';
import type { FileOpResult } from '../../fs-ops/src/index.js';
import { load as loadYaml } from 'js-yaml';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

export interface ExecutionResult {
  success: boolean;
  totalBlocks: number;
  executedActions: number;
  results: ActionResult[];
  parseErrors: ParseError[];
  fatalError?: string;
  debug?: {
    parseDebug?: any;
  };
}

export interface ActionResult {
  seq: number;
  blockId: string;
  action: string;
  params: Record<string, any>;
  success: boolean;
  error?: string;
  data?: any;
}

export interface LoafOptions {
  repoPath?: string;
  gitCommit?: boolean;
}

export class Loaf {
  private options: LoafOptions;
  private executors: Map<string, (action: LoafAction) => Promise<FileOpResult>> | null = null;

  constructor(options: LoafOptions = {}) {
    this.options = {
      repoPath: options.repoPath || process.cwd(),
      gitCommit: options.gitCommit ?? true
    };
  }

  /**
   * Parse and execute all NESL blocks in LLM output
   * Executes all valid actions sequentially, collecting both successes and failures
   */
  async execute(llmOutput: string): Promise<ExecutionResult> {
    try {
      // Parse NESL blocks
      const parseResult = await parseNeslResponse(llmOutput);

      // Debug info captured in parseResult.debug

      // Initialize executors if needed
      if (!this.executors) {
        try {
          await this.initializeExecutors();
        } catch (error) {
          return {
            success: false,
            totalBlocks: parseResult.summary.totalBlocks,
            executedActions: 0,
            results: [],
            parseErrors: parseResult.errors,
            fatalError: `Failed to initialize executors: ${error instanceof Error ? error.message : String(error)}`
          };
        }
      }

      // Execute each valid action sequentially
      const results: ActionResult[] = [];
      let seq = 1;

      for (const action of parseResult.actions) {
        const result = await this.executeAction(action, seq++);
        results.push(result);
      }

      // Calculate overall success
      const allActionsSucceeded = results.every(r => r.success);
      const noParseErrors = parseResult.errors.length === 0;

      return {
        success: allActionsSucceeded && noParseErrors,
        totalBlocks: parseResult.summary.totalBlocks,
        executedActions: results.length,
        results,
        parseErrors: parseResult.errors,
        debug: {
          parseDebug: parseResult.debug
        }
      };

    } catch (error) {
      // Only truly unexpected errors should reach here
      return {
        success: false,
        totalBlocks: 0,
        executedActions: 0,
        results: [],
        parseErrors: [],
        fatalError: `Unexpected error in execute: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

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

  /**
   * Infer executor from action name/type when not explicitly defined
   * Temporary fallback until all YAML entries have executor field
   */
  private inferExecutor(actionName: string, actionDef: any): string | null {
    // File/dir operations go to fs-ops
    if (actionName.startsWith('file_') || actionName.startsWith('files_') ||
      actionName.startsWith('dir_') || ['ls', 'grep', 'glob'].includes(actionName)) {
      return 'fs-ops';
    }

    // Exec operations
    if (actionName === 'exec') {
      return 'exec';
    }

    // Context operations (future)
    if (actionName.startsWith('context_')) {
      return 'context';
    }

    // Git operations (future)
    if (actionName.startsWith('git_') || actionName === 'undo') {
      return 'git';
    }

    return null;
  }

  /**
   * Execute a single action and format the result
   * Never throws - all errors returned in ActionResult
   */
  private async executeAction(action: LoafAction, seq: number): Promise<ActionResult> {
    const executor = this.executors?.get(action.action);

    if (!executor) {
      return {
        seq,
        blockId: action.metadata.blockId,
        action: action.action,
        params: action.parameters,
        success: false,
        error: `Unknown action: ${action.action}`
      };
    }

    try {
      // Add default cwd for exec actions if not specified
      const enhancedAction = action.action === 'exec' && !action.parameters.cwd
        ? { ...action, parameters: { ...action.parameters, cwd: this.options.repoPath } }
        : action;

      const result = await executor(enhancedAction);

      return {
        seq,
        blockId: action.metadata.blockId,
        action: action.action,
        params: action.parameters,
        success: result.success,
        ...(result.error && { error: result.error }),
        ...(result.data !== undefined && { data: result.data }),
        // Include exec-specific fields at top level
        ...(action.action === 'exec' && {
          data: {
            stdout: result.stdout,
            stderr: result.stderr,
            exit_code: result.exit_code
          }
        })
      };

    } catch (error) {
      // Executors should never throw, but handle just in case
      return {
        seq,
        blockId: action.metadata.blockId,
        action: action.action,
        params: action.parameters,
        success: false,
        error: `Unexpected executor error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}