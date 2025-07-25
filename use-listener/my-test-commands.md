📋 Copied to clipboard

=== LOAF RESULTS ===
gf3 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/hooks/test/integration/git-integration.test.ts
=== END ===

The first fix failed because I looked at the wrong version of the file. Let me fix the git-integration test properly:

```sh nesl
#!nesl [@three-char-SHA-256: gf3]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/hooks/test/integration/git-integration.test.ts"

old_text = <<'EOT_gf3'
    const loafConfig = `version: 1
hooks:
  before:
    - run: echo "BEFORE_HOOK_RAN" > .hook-trace
    - run: git add .hook-trace
    - run: git stash push --keep-index --include-untracked
      continueOnError: true
      
  after:
    - run: echo "AFTER_HOOK_RAN" >> .hook-trace
    - run: git add -A
    - run: git commit -m "\${COMMIT_MSG}"
    - run: git push origin main

vars:
  COMMIT_MSG: "AI-assisted changes via NESL"
`;
EOT_gf3

new_text = <<'EOT_gf3'
    const loafConfig = `version: 1
allowed-tools:
  - file_write
  - file_read
  - exec
hooks:
  before:
    - run: echo "BEFORE_HOOK_RAN" > .hook-trace
    - run: git add .hook-trace
    - run: git stash push --keep-index --include-untracked
      continueOnError: true
      
  after:
    - run: echo "AFTER_HOOK_RAN" >> .hook-trace
    - run: git add -A
    - run: git commit -m "\${COMMIT_MSG}"
    - run: git push origin main

vars:
  COMMIT_MSG: "AI-assisted changes via NESL"
`;
EOT_gf3

#!end_gf3
```

Now run the tests again to see if we need to fix defaults.ts or if there are other issues.