📋 Copied to clipboard

=== LOAF RESULTS ===
upd1 ❌ file_replace_text /Users/stuart/repos/loaf/proj/comp/hooks/test/integration/hooks-basic.test.ts - old_text appears 7 times, must appear exactly once
chk2 ✅ file_read /Users/stuart/repos/loaf/proj/comp/orch/src/index.ts
=== END ===

The hooks-basic tests are using the old nested structure. Need to update those too.

```sh nesl
#!nesl [@three-char-SHA-256: upd1]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/hooks/test/integration/hooks-basic.test.ts"
old_text = <<'EOT_upd1'
    const hooks = new HooksManager(config);
EOT_upd1
new_text = <<'EOT_upd1'
    const hooks = new HooksManager(config.hooks, config.vars);
EOT_upd1
#!end_upd1
```

Actually, I need to check the orchestrator again since fix4 failed:

```sh nesl
#!nesl [@three-char-SHA-256: chk2]
action = "file_read"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/index.ts"
#!end_chk2
```