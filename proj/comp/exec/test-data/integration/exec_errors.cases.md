# Execution Error Test Cases

## Missing interpreter
```sh nesl
#!NESL [@three-char-SHA-256: e1r]
action = "exec"
lang = "cobol"
code = "DISPLAY 'hello'."
#!END_NESL_e1r
```

```json
{
  "success": false,
  "stdout": "",
  "stderr": "",
  "error": "exec: cobol not found in PATH (ENOENT)"
}
```

## Invalid working directory
```sh nesl
#!NESL [@three-char-SHA-256: e2r]
action = "exec"
lang = "bash"
code = "pwd"
cwd = "/nonexistent/directory/path"
#!END_NESL_e2r
```

```json
{
  "success": false,
  "stdout": "",
  "stderr": "",
  "error": "exec: Working directory does not exist '/nonexistent/directory/path' (ENOENT)"
}
```

## Process timeout
```sh nesl
#!NESL [@three-char-SHA-256: e3r]
action = "exec"
lang = "bash"
code = "sleep 2"
timeout = 200
#!END_NESL_e3r
```

```json
{
  "success": false,
  "stdout": "",
  "stderr": "",
  "error": "exec: Process timeout after 0.2s (TIMEOUT)"
}
```

## Timeout with partial output
```sh nesl
#!NESL [@three-char-SHA-256: e4r]
action = "exec"
lang = "bash"
code = "echo 'Started'; sleep 2; echo 'Never seen'"
timeout = 200
#!END_NESL_e4r
```

```json
{
  "success": false,
  "stdout": "Started\n",
  "stderr": "",
  "error": "exec: Process timeout after 0.2s (TIMEOUT)"
}
```
<!-- 
## Large output truncation
```sh nesl
#!NESL [@three-char-SHA-256: e5r]
action = "exec"
lang = "bash"
code = "for i in {1..100000}; do echo 'Line '$i': This is a very long line of output that will eventually exceed our size limit'; done"
#!END_NESL_e5r
```

```json
{
  "success": true,
  "stdout": "Line 1: This is a very long...[truncated - 1MB limit]...Line 9999: This is a very long",
  "stderr": "",
  "exit_code": 0
}
``` -->

## Permission denied
```sh nesl
#!NESL [@three-char-SHA-256: e6r]
action = "exec"
lang = "bash"
code = "cat /private/etc/sudoers"
#!END_NESL_e6r
```

```json
{
  "success": false,
  "stdout": "",
  "stderr": "cat: /private/etc/sudoers: Permission denied\n",
  "exit_code": 1
}
```
<!-- 
## Memory allocation failure
```sh nesl
#!NESL [@three-char-SHA-256: e7r]
action = "exec"
lang = "python"
code = "a = [0] * (10**10)"
#!END_NESL_e7r
```

```json
{
  "success": false,
  "stdout": "",
  "stderr": "MemoryError\n",
  "exit_code": 1
}
``` -->

## Interactive command (no stdin)
```sh nesl
#!NESL [@three-char-SHA-256: e8r]
action = "exec"
lang = "python"
code = "name = input('Enter name: '); print(f'Hello {name}')"
timeout = 200
#!END_NESL_e8r
```

```json
{
  "success": false,
  "stdout": "Enter name: ",
  "stderr": "",
  "error": "exec: Process timeout after 0.2s (TIMEOUT)"
}
```

## Unsupported language
```sh nesl
#!NESL [@three-char-SHA-256: e9r]
action = "exec"
lang = "rust"
code = "println!(\"Hello\");"
#!END_NESL_e9r
```

```json
{
  "success": false,
  "stdout": "",
  "stderr": "",
  "error": "exec: Unsupported language 'rust' (LANG_UNSUPPORTED)"
}
```

## Empty code
```sh nesl
#!NESL [@three-char-SHA-256: e10r]
action = "exec"
lang = "bash"
code = ""
#!END_NESL_e10r
```

```json
{
  "success": true,
  "stdout": "",
  "stderr": "",
  "exit_code": 0
}
```