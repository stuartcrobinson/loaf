📋 Copied to clipboard

=== LOAF RESULTS ===
fix1 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/src/index.ts
fix2 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/hooks/test-data/integration/example-loaf.yml
fix3 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/hooks/src/index.ts
fix4 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/hooks/src/index.ts
fix5 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/hooks/src/index.ts
fix6 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/src/index.ts
fix7 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/src/index.ts
fix8 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/src/index.ts
fix9 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/src/index.ts
fix10 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/src/index.ts
=== END ===

#!/usr/bin/env bash

# Fix 1: Remove double instantiation in orchestrator
#!nesl [@three-char-SHA-256: fix1]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/index.ts"
old_text = <<'EOT_fix1'
          if (configCreated) {
            // Load the newly created config
            this.hooksManager = new HooksManager(undefined, this.options.repoPath);
            const config = await this.hooksManager.loadConfig(loafYmlPath);
            this.hooksManager = new HooksManager(config, this.options.repoPath);
          }
EOT_fix1
new_text = <<'EOT_fix1'
          if (configCreated) {
            // Load the newly created config
            this.hooksManager = new HooksManager(undefined, this.options.repoPath);
            await this.hooksManager.loadConfig(loafYmlPath);
          }
EOT_fix1
#!end_fix1

# Fix 2: Update git stash example to use --keep-index
#!nesl [@three-char-SHA-256: fix2]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/hooks/test-data/integration/example-loaf.yml"
old_text = <<'EOT_fix2'
hooks:
  before:
    - run: git stash --include-untracked
EOT_fix2
new_text = <<'EOT_fix2'
hooks:
  before:
    - run: git stash push --keep-index --include-untracked
EOT_fix2
#!end_fix2

# Fix 3: Remove debug logging from hooks manager
#!nesl [@three-char-SHA-256: fix3]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/hooks/src/index.ts"
old_text = <<'EOT_fix3'
  async runBefore(context?: HookContext): Promise<HookResult> {
    const commands = this.config.hooks?.before || [];
    console.log('[HOOKS] runBefore called. Commands:', commands);
    return this.runCommands(commands, context);
  }
EOT_fix3
new_text = <<'EOT_fix3'
  async runBefore(context?: HookContext): Promise<HookResult> {
    const commands = this.config.hooks?.before || [];
    return this.runCommands(commands, context);
  }
EOT_fix3
#!end_fix3

# Fix 4: Remove debug logging from runCommands
#!nesl [@three-char-SHA-256: fix4]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/hooks/src/index.ts"
old_text = <<'EOT_fix4'
  private async runCommands(commands: Command[], context?: HookContext): Promise<HookResult> {
    const results: CommandResult[] = [];
    console.log('[HOOKS] runCommands called with', commands.length, 'commands');
    
    for (const cmd of commands) {
      console.log('[HOOKS] Executing command:', cmd.run);
EOT_fix4
new_text = <<'EOT_fix4'
  private async runCommands(commands: Command[], context?: HookContext): Promise<HookResult> {
    const results: CommandResult[] = [];
    
    for (const cmd of commands) {
EOT_fix4
#!end_fix4

# Fix 5: Remove more debug logging from runCommands
#!nesl [@three-char-SHA-256: fix5]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/hooks/src/index.ts"
old_text = <<'EOT_fix5'
        // Execute command
        const result = await this.executeCommand(interpolatedCmd);
        console.log(`[HOOKS] Command result for "${cmd.run}":`, {
          success: result.success,
          stdout: result.stdout?.slice(0, 100),
          stderr: result.stderr?.slice(0, 100),
          error: result.error
        });
        
        // Debug: Check .hook-trace file after each command
        if (cmd.run.includes('.hook-trace')) {
          const { existsSync, readFileSync } = await import('fs');
          const tracePath = `${this.repoPath}/.hook-trace`;
          if (existsSync(tracePath)) {
            const content = readFileSync(tracePath, 'utf8');
            console.log(`[HOOKS] After "${cmd.run}", .hook-trace contains:`, JSON.stringify(content));
          } else {
            console.log(`[HOOKS] After "${cmd.run}", .hook-trace does not exist`);
          }
        }
EOT_fix5
new_text = <<'EOT_fix5'
        // Execute command
        const result = await this.executeCommand(interpolatedCmd);
EOT_fix5
#!end_fix5

# Fix 6: Remove debug logging from orchestrator
#!nesl [@three-char-SHA-256: fix6]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/index.ts"
old_text = <<'EOT_fix6'
      // Initialize hooks if enabled and not already initialized
      if (this.options.enableHooks && !this.hooksManager) {
        console.log('[ORCH] Initializing hooks...');
        try {
          const initResult = await this.initializeHooks();
          configCreated = initResult.configCreated || false;
          console.log('[ORCH] Hooks initialized. HooksManager exists:', !!this.hooksManager);
        } catch (error) {
          console.log('[ORCH] Hook initialization failed:', error);
EOT_fix6
new_text = <<'EOT_fix6'
      // Initialize hooks if enabled and not already initialized
      if (this.options.enableHooks && !this.hooksManager) {
        try {
          const initResult = await this.initializeHooks();
          configCreated = initResult.configCreated || false;
        } catch (error) {
EOT_fix6
#!end_fix6

# Fix 7: Remove more orchestrator debug logging
#!nesl [@three-char-SHA-256: fix7]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/index.ts"
old_text = <<'EOT_fix7'
      // Run before hooks
      if (this.hooksManager) {
        console.log('[ORCH] Running before hooks...');
        try {
          const beforeResult = await this.hooksManager.runBefore();
          console.log('[ORCH] Before hooks result:', beforeResult);
          if (!beforeResult.success) {
EOT_fix7
new_text = <<'EOT_fix7'
      // Run before hooks
      if (this.hooksManager) {
        try {
          const beforeResult = await this.hooksManager.runBefore();
          if (!beforeResult.success) {
EOT_fix7
#!end_fix7

# Fix 8: Remove another debug log
#!nesl [@three-char-SHA-256: fix8]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/index.ts"
old_text = <<'EOT_fix8'
        } catch (error) {
          console.log('[ORCH] Before hooks error:', error);
          return {
EOT_fix8
new_text = <<'EOT_fix8'
        } catch (error) {
          return {
EOT_fix8
#!end_fix8

# Fix 9: Remove "no hooksManager" debug log
#!nesl [@three-char-SHA-256: fix9]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/index.ts"
old_text = <<'EOT_fix9'
        }
      } else {
        console.log('[ORCH] No hooksManager - skipping before hooks');
      }
EOT_fix9
new_text = <<'EOT_fix9'
        }
      }
EOT_fix9
#!end_fix9

# Fix 10: Remove debug logging from initializeHooks
#!nesl [@three-char-SHA-256: fix10]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/index.ts"
old_text = <<'EOT_fix10'
        await access(loafYmlPath);
        console.log('[ORCH] Found loaf.yml at:', loafYmlPath);
        this.hooksManager = new HooksManager(undefined, this.options.repoPath);
        const loadedConfig = await this.hooksManager.loadConfig(loafYmlPath);
        console.log('[ORCH] Loaded config:', JSON.stringify(loadedConfig, null, 2));
        // Don't create a new instance - loadConfig updates the existing one
EOT_fix10
new_text = <<'EOT_fix10'
        await access(loafYmlPath);
        this.hooksManager = new HooksManager(undefined, this.options.repoPath);
        await this.hooksManager.loadConfig(loafYmlPath);
        // Don't create a new instance - loadConfig updates the existing one
EOT_fix10
#!end_fix10