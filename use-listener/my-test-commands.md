📋 Copied to clipboard

=== LOAF RESULTS ===
c34 ✅ file_write /Users/stuart/repos/loaf/proj/comp/config/test/unit/load.test.ts
c35 ✅ file_write /Users/stuart/repos/loaf/proj/comp/config/test/unit/create.test.ts
c36 ✅ file_write /Users/stuart/repos/loaf/proj/comp/config/test/unit/validate.test.ts
c37 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/doc/ARCH.md
c38 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/doc/API.md
c39 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/doc/API.md
c40 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/doc/API.md
c41 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/doc/API.md
=== END ===

```sh nesl
#!nesl [@three-char-SHA-256: c34]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/config/test/unit/load.test.ts"
content = <<'EOT_c34'
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { loadConfig } from '../../src/load.js';

const TEST_DIR = '/tmp/t_config_load_test';

describe('loadConfig', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  test('loads valid config', async () => {
    const configContent = `version: 1
hooks:
  before:
    - run: echo "test"
vars:
  TEST: value
fs-guard:
  allowed:
    - "./**"
`;
    writeFileSync(join(TEST_DIR, 'loaf.yml'), configContent);

    const config = await loadConfig(TEST_DIR);
    
    expect(config.version).toBe(1);
    expect(config.hooks?.before).toHaveLength(1);
    expect(config.vars?.TEST).toBe('value');
    expect(config['fs-guard']?.allowed).toContain('./**');
  });

  test('returns default config when file missing', async () => {
    const config = await loadConfig(TEST_DIR);
    
    expect(config.version).toBe(1);
    expect(config['fs-guard']).toBeDefined();
    expect(config['fs-guard']?.allowed).toContain(`${TEST_DIR}/**`);
    expect(config['fs-guard']?.allowed).toContain('/tmp/**');
    expect(config.hooks).toBeUndefined();
  });

  test('throws on invalid YAML', async () => {
    const invalidYaml = `version: 1
  invalid: yaml: structure
`;
    writeFileSync(join(TEST_DIR, 'loaf.yml'), invalidYaml);

    await expect(loadConfig(TEST_DIR)).rejects.toThrow('Invalid YAML');
  });

  test('throws on invalid config structure', async () => {
    const invalidConfig = `version: "not a number"`;
    writeFileSync(join(TEST_DIR, 'loaf.yml'), invalidConfig);

    await expect(loadConfig(TEST_DIR)).rejects.toThrow('Invalid config: Config version must be a number');
  });

  test('throws on missing version', async () => {
    const noVersion = `hooks:
  before:
    - run: echo "test"
`;
    writeFileSync(join(TEST_DIR, 'loaf.yml'), noVersion);

    await expect(loadConfig(TEST_DIR)).rejects.toThrow('Invalid config: Config missing version');
  });
});
EOT_c34
#!end_c34

#!nesl [@three-char-SHA-256: c35]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/config/test/unit/create.test.ts"
content = <<'EOT_c35'
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { createStarterConfig } from '../../src/create.js';

const TEST_DIR = '/tmp/t_config_create_test';

describe('createStarterConfig', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  test('creates starter config when missing', async () => {
    const created = await createStarterConfig(TEST_DIR);
    
    expect(created).toBe(true);
    expect(existsSync(join(TEST_DIR, 'loaf.yml'))).toBe(true);
    
    const content = readFileSync(join(TEST_DIR, 'loaf.yml'), 'utf8');
    expect(content).toContain('version: 1');
    expect(content).toContain('fs-guard:');
    expect(content).toContain('hooks:');
    expect(content).toContain('vars:');
  });

  test('returns false when file exists', async () => {
    writeFileSync(join(TEST_DIR, 'loaf.yml'), 'existing content');
    
    const created = await createStarterConfig(TEST_DIR);
    
    expect(created).toBe(false);
    
    // Verify existing content unchanged
    const content = readFileSync(join(TEST_DIR, 'loaf.yml'), 'utf8');
    expect(content).toBe('existing content');
  });

  test('throws on write error', async () => {
    // Make directory read-only (Unix-specific)
    if (process.platform !== 'win32') {
      await createStarterConfig(TEST_DIR); // Create file first
      rmSync(join(TEST_DIR, 'loaf.yml'));
      mkdirSync(join(TEST_DIR, 'loaf.yml')); // Create directory with same name
      
      await expect(createStarterConfig(TEST_DIR)).rejects.toThrow();
    }
  });
});
EOT_c35
#!end_c35

#!nesl [@three-char-SHA-256: c36]
action = "file_write"
path = "/Users/stuart/repos/loaf/proj/comp/config/test/unit/validate.test.ts"
content = <<'EOT_c36'
import { describe, test, expect } from 'vitest';
import { validateConfig } from '../../src/validate.js';

describe('validateConfig', () => {
  test('accepts valid config', () => {
    const config = {
      version: 1,
      hooks: {
        before: [{ run: 'echo test' }],
        after: [{ run: 'echo done' }]
      },
      vars: {
        TEST: 'value'
      },
      'fs-guard': {
        allowed: ['./**'],
        denied: ['**/.git/**'],
        followSymlinks: false
      }
    };

    const result = validateConfig(config);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('rejects non-object config', () => {
    const result = validateConfig('not an object');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Config must be an object');
  });

  test('rejects missing version', () => {
    const result = validateConfig({ hooks: {} });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Config missing version');
  });

  test('rejects non-number version', () => {
    const result = validateConfig({ version: '1' });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Config version must be a number');
  });

  test('rejects non-array hooks.before', () => {
    const result = validateConfig({
      version: 1,
      hooks: { before: 'not an array' }
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('hooks.before must be an array');
  });

  test('rejects non-array hooks.after', () => {
    const result = validateConfig({
      version: 1,
      hooks: { after: {} }
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('hooks.after must be an array');
  });

  test('rejects non-object vars', () => {
    const result = validateConfig({
      version: 1,
      vars: []
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('vars must be an object');
  });

  test('rejects non-string var values', () => {
    const result = validateConfig({
      version: 1,
      vars: { TEST: 123 }
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("var 'TEST' must be a string");
  });

  test('rejects non-array fs-guard.allowed', () => {
    const result = validateConfig({
      version: 1,
      'fs-guard': { allowed: 'not an array' }
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('fs-guard.allowed must be an array');
  });

  test('rejects non-boolean fs-guard.followSymlinks', () => {
    const result = validateConfig({
      version: 1,
      'fs-guard': { followSymlinks: 'yes' }
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('fs-guard.followSymlinks must be a boolean');
  });

  test('accepts minimal config', () => {
    const result = validateConfig({ version: 1 });
    expect(result.valid).toBe(true);
  });

  test('accepts empty hooks', () => {
    const result = validateConfig({
      version: 1,
      hooks: {}
    });
    expect(result.valid).toBe(true);
  });
});
EOT_c36
#!end_c36

#!nesl [@three-char-SHA-256: c37]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/doc/ARCH.md"
old_text = <<'EOT_c37'
- **Before Hook Failure**: Fatal - prevents NESL execution
- **After Hook Failure**: fatal
EOT_c37
new_text = <<'EOT_c37'
- **Before Hook Failure**: Fatal - prevents NESL execution
- **After Hook Failure**: Fatal - affects overall execution success
EOT_c37
#!end_c37

#!nesl [@three-char-SHA-256: c38]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/doc/API.md"
old_text = <<'EOT_c38'
- **Process**: 
  1. Run before hooks (if enabled)
  2. Parse NESL blocks
  3. Convert to actions
  4. Execute all valid actions
  5. Run after hooks with execution context (if enabled)
  6. (v1.2: Git commit with summary)
EOT_c38
new_text = <<'EOT_c38'
- **Process**: 
  1. Run before hooks (if enabled) - failure aborts execution
  2. Parse NESL blocks
  3. Convert to actions
  4. Execute all valid actions
  5. Run after hooks with execution context (if enabled) - failure affects overall success
  6. (v1.2: Git commit with summary)
EOT_c38
#!end_c38

#!nesl [@three-char-SHA-256: c39]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/doc/API.md"
old_text = <<'EOT_c39'
interface ExecutionResult {
  success: boolean              // False if any action failed or hooks failed
  totalBlocks: number          // Count of NESL blocks found
  executedActions: number      // Count of actions attempted
  results: ActionResult[]      // All execution results
  parseErrors: ParseError[]    // NESL parsing errors
  fatalError?: string         // System failure (v1.2: will include git errors)
  hookErrors?: {              // Hook execution errors
    before?: string[]         // Before hook errors
    after?: string[]          // After hook errors
  }
}
EOT_c39
new_text = <<'EOT_c39'
interface ExecutionResult {
  success: boolean              // False if any action failed or hooks failed
  totalBlocks: number          // Count of NESL blocks found
  executedActions: number      // Count of actions attempted
  results: ActionResult[]      // All execution results
  parseErrors: ParseError[]    // NESL parsing errors
  fatalError?: string         // System failure (v1.2: will include git errors)
  hookErrors?: {              // Hook execution errors
    before?: string[]         // Before hook errors (always fatal)
    after?: string[]          // After hook errors (affects success)
  }
}
EOT_c39
#!end_c39

#!nesl [@three-char-SHA-256: c40]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/doc/API.md"
old_text = <<'EOT_c40'
interface LoafOptions {
  repoPath?: string           // Default: process.cwd()
  gitCommit?: boolean         // v1.2 feature - Default: true
  hooks?: HooksConfig         // Hook configuration (if not provided, loads from loaf.yml)
  enableHooks?: boolean       // Enable hook execution - Default: true
}
EOT_c40
new_text = <<'EOT_c40'
interface LoafOptions {
  repoPath?: string           // Default: process.cwd()
  gitCommit?: boolean         // v1.2 feature - Default: true
  hooks?: HooksConfig         // Hook configuration (overrides loaf.yml)
  enableHooks?: boolean       // Enable hook execution - Default: true
}
EOT_c40
#!end_c40

#!nesl [@three-char-SHA-256: c41]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/doc/API.md"
old_text = <<'EOT_c41'
- Hook errors (before): Fatal, abort with fatalError
- Parser errors: Skip block, record error
- Conversion errors: Skip action, record error
- Execution errors: Continue execution, record error
- Hook errors (after): Record but don't affect success if actions succeeded
- Git errors: Fatal, abort with fatalError
EOT_c41
new_text = <<'EOT_c41'
- Hook errors (before): Fatal, abort with fatalError
- Parser errors: Skip block, record error
- Conversion errors: Skip action, record error
- Execution errors: Continue execution, record error
- Hook errors (after): Record and affect overall success
- Git errors: Fatal, abort with fatalError
EOT_c41
#!end_c41
```