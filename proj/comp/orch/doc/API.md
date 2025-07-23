# Component: loaf

## Component Type
standard

## Dependencies

```yaml
dependencies:
  proj/comp/nesl-action-parser:  # [IMPLEMENTED]
    functions: [parseNeslResponse]
    types: [ParseResult, LoafAction, ParseError, ValidationResult, TransformError]
  
  proj/comp/fs-ops:              # [PARTIALLY IMPLEMENTED]
    functions: [executeFileOperation]
    types: [FileOpResult]
    classes:
      FileOpError:
        extends: Error
  
  proj/comp/exec:                # [PLANNED]
    functions: [executeCommand]
    types: [ExecResult]
  
  proj/comp/git-tx:              # [PLANNED - v1.2]
    functions: [ensureCleanRepo, commitChanges]
    types: [GitError]
  
  proj/comp/context:             # [PLANNED]
    functions: [addPath, removePath, listPaths, clearContext]
    types: [ContextError]
  
  external/nesl-js:
    functions: [parseNesl]
    types: [Block, ParseResult, ParseError]
```

## Exports

```yaml
exports:
  classes:
    Loaf:
      constructor: [options?: LoafOptions]
      methods: [execute]
  types: 
    - ExecutionResult
    - ActionResult  
    - LoafOptions
  # Note: ParseError is re-exported from nesl-action-parser
```

### Loaf (class)
- **Purpose**: Main orchestrator executing NESL blocks from LLM output
- **Constructor**: `new Loaf(options?: LoafOptions)`
- **State**: Maintains working directory and context set across execute() calls

### execute
- **Signature**: `async execute(llmOutput: string): Promise<ExecutionResult>`
- **Purpose**: Parse and execute all NESL blocks in LLM output, commit results
- **Process**: 
  1. Parse NESL blocks
  2. Convert to actions
  3. Execute all valid actions
  4. (v1.2: Git commit with summary)
- **Throws**: Never - all errors captured in ExecutionResult
- **Test-data**: `test-data/execute/basic-operations.md` [IMPLEMENTED]

### ExecutionResult (type)
```typescript
interface ExecutionResult {
  success: boolean              // False if any action failed
  totalBlocks: number          // Count of NESL blocks found
  executedActions: number      // Count of actions attempted
  results: ActionResult[]      // All execution results
  parseErrors: ParseError[]    // NESL parsing errors
  fatalError?: string         // System failure (v1.2: will include git errors)
}
```

### ActionResult (type)
```typescript
interface ActionResult {
  seq: number                  // Execution order
  blockId: string             // NESL block ID
  action: string              // Action type
  params: Record<string, any> // Input parameters
  success: boolean
  error?: string              // Error message if failed
  data?: any                  // Action-specific output
}
```

### ParseError (type)
```typescript
interface ParseError {
  blockId?: string            // If error is block-specific
  error: NeslError            // From parser
}
```

### LoafOptions (type)
```typescript
interface LoafOptions {
  repoPath?: string           // Default: process.cwd()
  gitCommit?: boolean         // v1.2 feature - Default: true
}
```

## Internal Architecture

### Execution Flow
```
execute(llmOutput)
  → parseNESL(llmOutput) → NeslParseResult
  → for each valid block:
    → convertToActions(block) → LoafAction[]
    → for each action:
      → route to appropriate executor
      → capture result
  → commitChanges(results)
  → return ExecutionResult
```

### Action Routing
- file_* → fs-ops
- dir_* → fs-ops
- exec → exec
- context_* → context
- ls, grep, glob → fs-ops (read operations)

### Error Handling
- Parser errors: Skip block, record error
- Conversion errors: Skip action, record error
- Execution errors: Continue execution, record error
- Git errors: Fatal, abort with fatalError