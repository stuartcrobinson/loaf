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

export interface ExecutionResult {
  success: boolean;
  totalBlocks: number;
  executedActions: number;
  results: ActionResult[];
  parseErrors: ParseError[];
  fatalError?: string;
  hookErrors?: {
    before?: string[];
    after?: string[];
  };
  configCreated?: boolean;
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
  hooks?: HooksConfig;
  enableHooks?: boolean;
  createConfigIfMissing?: boolean;
}

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

  /**
   * Parse and execute all NESL blocks in LLM output
   * Executes all valid actions sequentially, collecting both successes and failures
   */
  async execute(llmOutput: string): Promise<ExecutionResult> {
    const hookErrors: ExecutionResult['hookErrors'] = {};
    let configCreated = false;

    try {
      // Initialize hooks if enabled and not already initialized
      if (this.options.enableHooks && !this.hooksManager) {
        try {
          const initResult = await this.initializeHooks();
          configCreated = initResult.configCreated || false;
        } catch (error) {
          return {
            success: false,
            totalBlocks: 0,
            executedActions: 0,
            results: [],
            parseErrors: [],
            fatalError: `Failed to initialize hooks: ${error instanceof Error ? error.message : String(error)}`
          };
        }
      }

      // Run before hooks
      if (this.hooksManager) {
        try {
          const beforeResult = await this.hooksManager.runBefore();
          if (!beforeResult.success) {
            // Before hook failure is fatal
            return {
              success: false,
              totalBlocks: 0,
              executedActions: 0,
              results: [],
              parseErrors: [],
              hookErrors: {
                before: beforeResult.errors?.map(e => `${e.command}: ${e.error}`) || ['Unknown before hook error']
              },
              fatalError: 'Before hooks failed - aborting execution'
            };
          }
        } catch (error) {
          return {
            success: false,
            totalBlocks: 0,
            executedActions: 0,
            results: [],
            parseErrors: [],
            fatalError: `Before hooks threw unexpected error: ${error instanceof Error ? error.message : String(error)}`
          };
        }
      }

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

      // Calculate execution success (before considering after hooks)
      const allActionsSucceeded = results.every(r => r.success);
      const noParseErrors = parseResult.errors.length === 0;
      const executionSuccess = allActionsSucceeded && noParseErrors;

      // Run after hooks with context
      if (this.hooksManager) {
        try {
          // Build rich context for hooks
          const modifiedFiles = new Set<string>();
          const operations: string[] = [];
          const errors: string[] = [];

          for (const result of results) {
            if (result.action.startsWith('file_') && result.params.path) {
              modifiedFiles.add(result.params.path);
            }

            operations.push(`${result.action}${result.success ? '' : ' (failed)'}`);

            if (!result.success && result.error) {
              errors.push(`${result.action}: ${result.error}`);
            }
          }

          const afterContext: HookContext = {
            success: executionSuccess,
            executedActions: results.length,
            totalBlocks: parseResult.summary.totalBlocks,
            modifiedFiles: Array.from(modifiedFiles).join(','),
            operations: operations.join(','),
            errors: errors.join('; '),
            errorCount: errors.length
          };

          const afterResult = await this.hooksManager.runAfter(afterContext);
          if (!afterResult.success) {
            // After hook failure is non-fatal but recorded
            hookErrors.after = afterResult.errors?.map(e => `${e.command}: ${e.error}`) || ['Unknown after hook error'];
          }
        } catch (error) {
          // After hook unexpected errors are also non-fatal
          hookErrors.after = [`After hooks threw unexpected error: ${error instanceof Error ? error.message : String(error)}`];
        }
      }

      return {
        success: executionSuccess && !hookErrors.after, // After hook errors affect overall success
        totalBlocks: parseResult.summary.totalBlocks,
        executedActions: results.length,
        results,
        parseErrors: parseResult.errors,
        ...(Object.keys(hookErrors).length > 0 && { hookErrors }),
        ...(configCreated && { configCreated }),
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