import { promisify } from 'util';
import { exec } from 'child_process';
import { readFile } from 'fs/promises';
import { interpolateCommand } from './interpolateCommand.js';
import { validateCommand } from './validateCommand.js';
import { formatHookResult } from './formatHookResult.js';
import { parseYamlConfig } from './parseYamlConfig.js';
import { validateConfig } from './validateConfig.js';
import type { CommandResult } from './types.js';

// Public types
export interface HooksConfig {
  version?: number;
  hooks?: {
    before?: Command[];
    after?: Command[];
  };
  vars?: Record<string, string>;
}

export interface Command {
  run: string;
  continueOnError?: boolean;
  timeout?: number;
  cwd?: string;
}

export interface HookContext {
  [key: string]: string | number | boolean;
}

export interface HookResult {
  success: boolean;
  executed: number;
  errors?: Array<{
    command: string;
    error: string;
  }>;
}

// Promisified exec
const execAsync = promisify(exec);

// Main class
export class HooksManager {
  private config: HooksConfig;
  private repoPath: string;

  constructor(config?: HooksConfig, repoPath?: string) {
    this.config = config || { hooks: {}, vars: {} };
    this.repoPath = repoPath || process.cwd();
  }

  async runBefore(context?: HookContext): Promise<HookResult> {
    const commands = this.config.hooks?.before || [];
    return this.runCommands(commands, context);
  }

  async runAfter(context?: HookContext): Promise<HookResult> {
    const commands = this.config.hooks?.after || [];
    return this.runCommands(commands, context);
  }

  async loadConfig(path: string): Promise<HooksConfig> {
    try {
      const content = await readFile(path, 'utf8');
      const config = parseYamlConfig(content);
      
      const validation = validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Invalid config: ${validation.error}`);
      }
      
      this.config = config;
      return config;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(`Config file not found: ${path}`);
      }
      throw error;
    }
  }

  private async runCommands(commands: Command[], context?: HookContext): Promise<HookResult> {
    const results: CommandResult[] = [];
    
    for (const cmd of commands) {
      try {
        // Interpolate variables
        const interpolatedCmd = interpolateCommand(cmd, this.config.vars || {}, context);
        
        // Validate command
        const validation = validateCommand(interpolatedCmd);
        if (!validation.valid) {
          const result: CommandResult = {
            command: cmd.run,
            success: false,
            error: validation.error || 'Invalid command'
          };
          results.push(result);
          
          if (!cmd.continueOnError) {
            break;
          }
          continue;
        }
        
        // Execute command
        const result = await this.executeCommand(interpolatedCmd);
        results.push({
          command: cmd.run,
          ...result
        });
        
        if (!result.success && !cmd.continueOnError) {
          break;
        }
      } catch (error: any) {
        const result: CommandResult = {
          command: cmd.run,
          success: false,
          error: error.message
        };
        results.push(result);
        
        if (!cmd.continueOnError) {
          break;
        }
      }
    }
    
    return formatHookResult(results);
  }

  private async executeCommand(cmd: Command): Promise<Omit<CommandResult, 'command'>> {
    const timeout = cmd.timeout || 30000;
    const options = {
      cwd: cmd.cwd || this.repoPath,
      timeout,
      encoding: 'utf8' as const
    };
    
    try {
      const { stdout, stderr } = await execAsync(cmd.run, options);
      return {
        success: true,
        stdout: stdout || '',
        stderr: stderr || ''
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout || '',
        stderr: error.stderr || ''
      };
    }
  }
}