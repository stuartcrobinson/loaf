=== PROCESSED: 2025-07-23 14:04:59 ===
ERROR Block 1: File path is outside repository: /Users/stuart/repos/loaf/proj/comp/hooks/doc/API.md
ERROR Block 2: File path is outside repository: /Users/stuart/repos/loaf/proj/comp/hooks/doc/ARCH.md
ERROR Block 3: File path is outside repository: /Users/stuart/repos/loaf/proj/comp/hooks/doc/ARCH.md
===

=== PROCESSED: 2025-07-23 12:58:52 ===
SUCCESS Block 1: Updated /Users/stuart/repos/loaf/proj/comp/hooks/doc/API.md
SUCCESS Block 2: Updated /Users/stuart/repos/loaf/proj/comp/hooks/doc/ARCH.md
SUCCESS Block 3: Updated /Users/stuart/repos/loaf/proj/comp/hooks/doc/ARCH.md
===

Looking at the hooks component docs, I need to update the dependencies to remove `proj/comp/exec` and reflect that shell execution will be internal. Here are the updates:

<<<EXPLANATION>>>
Remove dependency on proj/comp/exec since hooks will implement shell execution internally. This better aligns with the component's focused responsibility.
<<<FILE>>>
/Users/stuart/repos/loaf/proj/comp/hooks/doc/API.md
<<<SEARCH>>>
## Dependencies

```yaml
dependencies:
  proj/comp/exec:                    # [IMPLEMENTED]
    functions: [executeCommand]
    types: [ExecResult]
  
  external/js-yaml:
    functions: [load]
  
  external/shell-escape:
    functions: [escape]
```
<<<REPLACE>>>
## Dependencies

```yaml
dependencies:
  external/js-yaml:
    functions: [load]
  
  external/shell-escape:
    functions: [escape]
  
  node:child_process:
    functions: [exec]
  
  node:util:
    functions: [promisify]
```
<<<END>>>

<<<EXPLANATION>>>
Update architecture doc to reflect internal shell execution implementation and remove references to exec component.
<<<FILE>>>
/Users/stuart/repos/loaf/proj/comp/hooks/doc/ARCH.md
<<<SEARCH>>>
### Command Execution
- Uses `proj/comp/exec` for consistency
- Default cwd is repository root
- Sequential execution (no parallelism)
<<<REPLACE>>>
### Command Execution
- Internal shell execution using child_process.exec
- Default cwd is repository root
- Sequential execution (no parallelism)
- Promisified exec for async/await pattern
<<<END>>>

<<<EXPLANATION>>>
Add internal implementation details section to document the shell execution approach.
<<<FILE>>>
/Users/stuart/repos/loaf/proj/comp/hooks/doc/ARCH.md
<<<SEARCH>>>
## Future Considerations
- User-level default configuration
- Hook conditions (e.g., only on success)
- Parallel execution option
<<<REPLACE>>>
## Internal Implementation

### Shell Execution
- Direct use of `child_process.exec` with promisify wrapper
- Custom timeout implementation (exec doesn't support natively)
- Process killing on timeout using process.kill()
- Error standardization for consistent handling

### Process Management
```javascript
// Timeout approach
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Command timeout')), timeout)
);
Promise.race([execPromise, timeoutPromise]);
```

## Future Considerations
- User-level default configuration
- Hook conditions (e.g., only on success)
- Parallel execution option
- Extract shell execution if needed by other components
<<<END>>>