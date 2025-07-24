import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { HooksManager } from '../../src/index.js';

const TEST_DIR = '/tmp/t_hooks_test';

describe('HooksManager Integration', () => {
  beforeEach(() => {
    // Create test directory
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  test('executes before and after hooks', async () => {
    const config = {
      hooks: {
        before: [
          { run: `echo 'before' > ${TEST_DIR}/before.txt` }
        ],
        after: [
          { run: `echo 'after' > ${TEST_DIR}/after.txt` }
        ]
      }
    };

    const hooks = new HooksManager(config);
    
    // Run before hooks
    const beforeResult = await hooks.runBefore();
    expect(beforeResult.success).toBe(true);
    expect(beforeResult.executed).toBe(1);
    expect(existsSync(`${TEST_DIR}/before.txt`)).toBe(true);
    expect(readFileSync(`${TEST_DIR}/before.txt`, 'utf8').trim()).toBe('before');

    // Run after hooks
    const afterResult = await hooks.runAfter();
    expect(afterResult.success).toBe(true);
    expect(afterResult.executed).toBe(1);
    expect(existsSync(`${TEST_DIR}/after.txt`)).toBe(true);
    expect(readFileSync(`${TEST_DIR}/after.txt`, 'utf8').trim()).toBe('after');
  });

  test('variable interpolation works', async () => {
    const config = {
      hooks: {
        before: [
          { run: `echo '${TEST_DIR}/\${MSG}' > ${TEST_DIR}/var.txt` }
        ]
      },
      vars: {
        MSG: 'hello-world'
      }
    };

    const hooks = new HooksManager(config);
    const result = await hooks.runBefore();
    
    expect(result.success).toBe(true);
    expect(readFileSync(`${TEST_DIR}/var.txt`, 'utf8').trim()).toBe(`${TEST_DIR}/hello-world`);
  });

  test('context overrides vars', async () => {
    const config = {
      hooks: {
        after: [
          { run: `echo '\${STATUS}' > ${TEST_DIR}/status.txt` }
        ]
      },
      vars: {
        STATUS: 'from-config'
      }
    };

    const hooks = new HooksManager(config);
    const result = await hooks.runAfter({ STATUS: 'from-context' });
    
    expect(result.success).toBe(true);
    expect(readFileSync(`${TEST_DIR}/status.txt`, 'utf8').trim()).toBe('from-context');
  });

  test('continueOnError allows execution to continue', async () => {
    const config = {
      hooks: {
        before: [
          { run: 'false', continueOnError: true },  // Will fail
          { run: `echo 'second' > ${TEST_DIR}/second.txt` }
        ]
      }
    };

    const hooks = new HooksManager(config);
    const result = await hooks.runBefore();
    
    expect(result.success).toBe(false);
    expect(result.executed).toBe(2);
    expect(result.errors).toHaveLength(1);
    expect(existsSync(`${TEST_DIR}/second.txt`)).toBe(true);
  });

  test('stops on error without continueOnError', async () => {
    const config = {
      hooks: {
        before: [
          { run: 'false' },  // Will fail
          { run: `echo 'should not run' > ${TEST_DIR}/should-not-exist.txt` }
        ]
      }
    };

    const hooks = new HooksManager(config);
    const result = await hooks.runBefore();
    
    expect(result.success).toBe(false);
    expect(result.executed).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(existsSync(`${TEST_DIR}/should-not-exist.txt`)).toBe(false);
  });

  test('timeout kills long-running commands', async () => {
    const config = {
      hooks: {
        before: [
          { run: 'sleep 5', timeout: 100 }  // 100ms timeout
        ]
      }
    };

    const hooks = new HooksManager(config);
    const start = Date.now();
    const result = await hooks.runBefore();
    const duration = Date.now() - start;
    
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(duration).toBeLessThan(1000); // Should timeout quickly
  });

  test('loads config from YAML file', async () => {
    const yamlPath = `${TEST_DIR}/loaf.yml`;
    const yamlContent = `
version: 1
hooks:
  before:
    - run: echo 'from yaml' > ${TEST_DIR}/yaml.txt
vars:
  TEST: value
`;
    
    // Write YAML file
    const { writeFileSync } = await import('fs');
    writeFileSync(yamlPath, yamlContent);

    const hooks = new HooksManager();
    const config = await hooks.loadConfig(yamlPath);
    
    expect(config.version).toBe(1);
    expect(config.vars?.TEST).toBe('value');
    
    // Run hooks to verify they work
    const result = await hooks.runBefore();
    expect(result.success).toBe(true);
    expect(readFileSync(`${TEST_DIR}/yaml.txt`, 'utf8').trim()).toBe('from yaml');
  });

  test('custom cwd works', async () => {
    const subDir = `${TEST_DIR}/subdir`;
    mkdirSync(subDir, { recursive: true });
    
    const config = {
      hooks: {
        before: [
          { run: 'pwd > output.txt', cwd: subDir }
        ]
      }
    };

    const hooks = new HooksManager(config);
    const result = await hooks.runBefore();
    
    expect(result.success).toBe(true);
    const output = readFileSync(`${subDir}/output.txt`, 'utf8').trim();
    
    // On macOS, /tmp is a symlink to /private/tmp, so pwd might return the resolved path
    // We need to handle both cases for cross-platform compatibility
    const expectedPaths = [
      subDir,
      subDir.replace(/^\/tmp/, '/private/tmp')
    ];
    
    expect(expectedPaths).toContain(output);
  });
});