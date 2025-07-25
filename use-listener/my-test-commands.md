📋 Copied to clipboard

=== LOAF RESULTS ===
vt1 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/config/test/unit/validate.test.ts
vt2 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/config/test/unit/validate.test.ts
ot1 ❌ file_create ERROR: Unknown action: file_create (line 121)
ot2 ❌ file_create ERROR: Unknown action: file_create (line 267)
=== END ===

📋 Copied to clipboard

=== LOAF RESULTS ===
vt1 ❌ file_replace_text /home/user/proj/comp/config/test/unit/validate.test.ts - Read access denied for
vt2 ❌ file_replace_text /home/user/proj/comp/config/test/unit/validate.test.ts - Read access denied for
ot1 ❌ file_create ERROR: Unknown action: file_create (line 112)
ot2 ❌ file_create ERROR: Unknown action: file_create (line 258)
=== END ===

Looking at the test patterns, here are the test cases needed:

```sh nesl
#!nesl [@three-char-SHA-256: vt1]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/config/test/unit/validate.test.ts"
old_text = <<'EOT_vt1'
  test('accepts minimal config', () => {
    const result = validateConfig({ version: 1 });
    expect(result.valid).toBe(true);
  });
EOT_vt1
new_text = <<'EOT_vt1'
  test('rejects missing allowed-tools', () => {
    const result = validateConfig({ version: 1 });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Config missing required allowed-tools');
  });

  test('rejects non-array allowed-tools', () => {
    const result = validateConfig({
      version: 1,
      'allowed-tools': 'not an array'
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('allowed-tools must be an array');
  });

  test('rejects non-string items in allowed-tools', () => {
    const result = validateConfig({
      version: 1,
      'allowed-tools': ['file_read', 123, 'file_write']
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('allowed-tools must contain only strings');
  });

  test('accepts valid allowed-tools', () => {
    const result = validateConfig({
      version: 1,
      'allowed-tools': ['file_read', 'file_write', 'exec']
    });
    expect(result.valid).toBe(true);
  });

  test('accepts minimal config', () => {
    const result = validateConfig({ 
      version: 1,
      'allowed-tools': []
    });
    expect(result.valid).toBe(true);
  });
EOT_vt1
#!end_vt1
```

```sh nesl
#!nesl [@three-char-SHA-256: vt2]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/config/test/unit/validate.test.ts"
old_text = <<'EOT_vt2'
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
EOT_vt2
new_text = <<'EOT_vt2'
  test('accepts valid config', () => {
    const config = {
      version: 1,
      'allowed-tools': ['file_read', 'file_write', 'exec'],
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
EOT_vt2
#!end_vt2
```

```sh nesl
#!nesl [@three-char-SHA-256: ot1]
action = "file_create"
path = "/Users/stuart/repos/loaf/proj/comp/orch/test-data/execute/allowed-tools.md"
content = <<'EOT_ot1'
# Allowed Tools Tests

### file_write blocked by allowed-tools

```nesl
#!nesl [@three-char-SHA-256: abc]
action = "file_write"
path = "/tmp/blocked.txt"
content = <<'EOT_abc'
This should be blocked
EOT_abc
#!end_abc
```

```json
{
  "success": false,
  "totalBlocks": 1,
  "executedActions": 1,
  "results": [
    {
      "seq": 1,
      "blockId": "abc",
      "action": "file_write",
      "params": {
        "path": "/tmp/blocked.txt",
        "content": "This should be blocked"
      },
      "success": false,
      "error": "Tool 'file_write' is not in allowed-tools list"
    }
  ],
  "parseErrors": []
}
```

### exec blocked when not in allowed-tools

```nesl
#!nesl [@three-char-SHA-256: def]
action = "exec"
language = "bash"
script = <<'EOT_def'
echo "Should not run"
EOT_def
#!end_def
```

```json
{
  "success": false,
  "totalBlocks": 1,
  "executedActions": 1,
  "results": [
    {
      "seq": 1,
      "blockId": "def",
      "action": "exec",
      "params": {
        "language": "bash",
        "script": "echo \"Should not run\""
      },
      "success": false,
      "error": "Tool 'exec' is not in allowed-tools list"
    }
  ],
  "parseErrors": []
}
```

### Multiple actions with some blocked

```nesl
#!nesl [@three-char-SHA-256: ghi]
action = "file_read"
path = "/tmp/test-read.txt"
#!end_ghi

#!nesl [@three-char-SHA-256: jkl]
action = "file_write"
path = "/tmp/test-write.txt"
content = <<'EOT_jkl'
test content
EOT_jkl
#!end_jkl

#!nesl [@three-char-SHA-256: mno]
action = "exec"
language = "bash"
script = <<'EOT_mno'
ls /tmp
EOT_mno
#!end_mno
```

```json
{
  "success": false,
  "totalBlocks": 3,
  "executedActions": 3,
  "results": [
    {
      "seq": 1,
      "blockId": "ghi",
      "action": "file_read",
      "params": {
        "path": "/tmp/test-read.txt"
      },
      "success": false,
      "error": "No such file or directory"
    },
    {
      "seq": 2,
      "blockId": "jkl",
      "action": "file_write",
      "params": {
        "path": "/tmp/test-write.txt",
        "content": "test content"
      },
      "success": false,
      "error": "Tool 'file_write' is not in allowed-tools list"
    },
    {
      "seq": 3,
      "blockId": "mno",
      "action": "exec",
      "params": {
        "language": "bash",
        "script": "ls /tmp"
      },
      "success": false,
      "error": "Tool 'exec' is not in allowed-tools list"
    }
  ],
  "parseErrors": []
}
```
EOT_ot1
#!end_ot1
```

```sh nesl
#!nesl [@three-char-SHA-256: ot2]
action = "file_create"
path = "/Users/stuart/repos/loaf/proj/comp/orch/test/allowed-tools.test.ts"
content = <<'EOT_ot2'
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { marked, Token } from 'marked';
import { Loaf } from '../src/index.js';
import { clearActionSchemaCache } from '../../nesl-action-parser/src/index.js';
import { writeFileSync, mkdirSync, rmSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('allowed-tools enforcement', () => {
  beforeEach(() => {
    clearActionSchemaCache();
  });

  it('blocks tools not in allowed-tools list', async () => {
    const testConfig = `version: 1
allowed-tools:
  - file_read`;

    const configDir = '/tmp/test-loaf-config';
    mkdirSync(configDir, { recursive: true });
    writeFileSync(join(configDir, 'loaf.yml'), testConfig);

    const loaf = await Loaf.create({ repoPath: configDir });

    const input = `#!nesl [@three-char-SHA-256: xyz]
action = "file_write"
path = "/tmp/test.txt"
content = <<'EOT_xyz'
blocked content
EOT_xyz
#!end_xyz`;

    const result = await loaf.execute(input);
    
    expect(result.success).toBe(false);
    expect(result.results[0].error).toBe("Tool 'file_write' is not in allowed-tools list");

    rmSync(configDir, { recursive: true, force: true });
  });

  it('allows tools in allowed-tools list', async () => {
    const testConfig = `version: 1
allowed-tools:
  - file_write`;

    const configDir = '/tmp/test-loaf-config2';
    mkdirSync(configDir, { recursive: true });
    writeFileSync(join(configDir, 'loaf.yml'), testConfig);

    const loaf = await Loaf.create({ repoPath: configDir });

    const input = `#!nesl [@three-char-SHA-256: xyz]
action = "file_write"
path = "/tmp/allowed-test.txt"
content = <<'EOT_xyz'
allowed content
EOT_xyz
#!end_xyz`;

    const result = await loaf.execute(input);
    
    expect(result.success).toBe(true);
    expect(result.results[0].success).toBe(true);

    rmSync(configDir, { recursive: true, force: true });
    rmSync('/tmp/allowed-test.txt', { force: true });
  });

  it('validates tool names against actual executors', async () => {
    const testConfig = `version: 1
allowed-tools:
  - file_read
  - invalid_tool_name`;

    const configDir = '/tmp/test-loaf-config3';
    mkdirSync(configDir, { recursive: true });
    writeFileSync(join(configDir, 'loaf.yml'), testConfig);

    await expect(Loaf.create({ repoPath: configDir })).rejects.toThrow(
      /Invalid tool in allowed-tools: 'invalid_tool_name'/
    );

    rmSync(configDir, { recursive: true, force: true });
  });

  it('uses test data from allowed-tools.md', async () => {
    const testPath = join(__dirname, '../test-data/execute/allowed-tools.md');
    const mdContent = readFileSync(testPath, 'utf8');
    
    const tokens = marked.lexer(mdContent);
    const codeBlocks = tokens.filter(t => t.type === 'code') as Array<Token & { type: 'code', text: string, lang?: string }>;
    const testNames = tokens
      .filter(t => t.type === 'heading' && 'depth' in t && t.depth === 3)
      .map(t => (t as any).text as string);

    const testConfig = `version: 1
allowed-tools:
  - file_read`;

    const configDir = '/tmp/test-loaf-config4';
    mkdirSync(configDir, { recursive: true });
    writeFileSync(join(configDir, 'loaf.yml'), testConfig);

    const loaf = await Loaf.create({ repoPath: configDir });

    for (let i = 0; i < testNames.length; i++) {
      const input = codeBlocks[i * 2].text;
      const expected = JSON.parse(codeBlocks[i * 2 + 1].text);
      const result = await loaf.execute(input);

      const { debug, ...resultWithoutDebug } = result;
      expect(resultWithoutDebug).toEqual(expected);
    }

    rmSync(configDir, { recursive: true, force: true });
  });
});
EOT_ot2
#!end_ot2
```