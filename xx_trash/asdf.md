Looking at the codebase structure and imports, here are additional files likely needing changes:

```
/Users/stuart/repos/loaf/proj/comp/instruct-gen/templates/base-instructions.md
/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_write.ts
/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_read.ts
/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_read_numbered.ts
/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_replace_text.ts
/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_replace_all_text.ts
/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_replace_lines.ts
/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_delete.ts
/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/file_move.ts
/Users/stuart/repos/loaf/proj/comp/fs-ops/src/actions/files_read.ts
/Users/stuart/repos/loaf/proj/comp/exec/src/executeCommand.ts
```

**Reasoning:**
- `base-instructions.md` - Referenced by loader.ts, likely contains action documentation
- `fs-ops/src/actions/*.ts` - All handlers imported by fs-ops/index.ts
- `executeCommand.ts` - Referenced by ExecExecutor.ts

**Potential additional files (less certain):**
- Package.json files if adding new shared module
- Any test files that reference the YAML directly
- Build configuration if YAML is referenced there