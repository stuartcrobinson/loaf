📋 Copied to clipboard

=== LOAF RESULTS ===
gt1 ✅ file_read /Users/stuart/repos/loaf/proj/comp/hooks/test/integration/git-integration.test.ts
gt2 ✅ file_read /Users/stuart/repos/loaf/proj/comp/hooks/test/integration/hooks-abort.test.ts
=== END ===

The hooks integration tests need fixing - they're missing `allowed-tools` in their configs. Let me check these test files:

```sh nesl
#!nesl [@three-char-SHA-256: gt1]
action = "file_read"
path = "/Users/stuart/repos/loaf/proj/comp/hooks/test/integration/git-integration.test.ts"
#!end_gt1
```

```sh nesl
#!nesl [@three-char-SHA-256: gt2]
action = "file_read"
path = "/Users/stuart/repos/loaf/proj/comp/hooks/test/integration/hooks-abort.test.ts"
#!end_gt2
```