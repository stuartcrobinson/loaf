📋 Copied to clipboard

=== LOAF RESULTS ===
f1x ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/orch/src/index.ts
=== END ===

You're right. The fix is simple - remove the `&& result.data` condition that's preventing the exec data from being included:

```sh nesl
#!nesl [@three-char-SHA-256: f1x]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/orch/src/index.ts"
old_text = <<'EOT_f1x'
        ...(action.action === 'exec' && result.data && {
EOT_f1x
new_text = <<'EOT_f1x'
        ...(action.action === 'exec' && {
EOT_f1x
#!end_f1x
```

This will include the exec data in the expected format since:
1. ExecResult has flat stdout/stderr/exit_code fields
2. We need to wrap them in a `data` object for the ActionResult
3. The `result.data` check was blocking this because exec results don't have a data field