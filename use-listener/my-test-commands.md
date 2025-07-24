📋 Copied to clipboard

=== LOAF RESULTS ===
fix1 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/hooks/test/integration/git-integration.test.ts
=== END ===

#!nesl [@three-char-SHA-256: fix1]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/hooks/test/integration/git-integration.test.ts"
old_text = <<'EOT_fix1'
    const loafConfig = `version: 1
hooks:
  before:
    - run: echo "BEFORE_HOOK_RAN" > .hook-trace
    - run: git add .hook-trace
    - run: git stash --include-untracked
      continueOnError: true
      
  after:
    - run: echo "AFTER_HOOK_RAN" >> .hook-trace
    - run: git add -A
    - run: git commit -m "\${COMMIT_MSG}"
    - run: git push origin main

vars:
  COMMIT_MSG: "AI-assisted changes via NESL"
`;
EOT_fix1
new_text = <<'EOT_fix1'
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
EOT_fix1
#!end_fix1