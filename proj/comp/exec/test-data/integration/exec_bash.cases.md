# Bash Execution Test Cases

## Basic echo
```sh nesl
#!NESL [@three-char-SHA-256: a1b]
action = "exec"
lang = "bash"
code = "echo 'Hello from bash'"
#!END_NESL_a1b
```


```json
{
  "success": true,
  "stdout": "Hello from bash\n",
  "stderr": "",
  "exit_code": 0
}
```

## Multi-line script
```sh nesl
#!NESL [@three-char-SHA-256: a2b]
action = "exec"
lang = "bash"
code = <<'EOT_NESL_a2b'
for i in 1 2 3; do
  echo "Number: $i"
done
EOT_NESL_a2b
#!END_NESL_a2b
```


```json
{
  "success": true,
  "stdout": "Number: 1\nNumber: 2\nNumber: 3\n",
  "stderr": "",
  "exit_code": 0
}
```

## Error output
```sh nesl
#!NESL [@three-char-SHA-256: a3b]
action = "exec"
lang = "bash"
code = "echo 'Error!' >&2 && exit 1"
#!END_NESL_a3b
```


```json
{
  "success": false,
  "stdout": "",
  "stderr": "Error!\n",
  "exit_code": 1
}
```

## Custom working directory
```sh nesl
#!NESL [@three-char-SHA-256: a4b]
action = "exec"
lang = "bash"
code = "pwd"
cwd = "/tmp"
#!END_NESL_a4b
```


```json
{
  "success": true,
  "stdout": "/tmp\n",
  "stderr": "",
  "exit_code": 0
}
```

## Environment variable access
```sh nesl
#!NESL [@three-char-SHA-256: a5b]
action = "exec"
lang = "bash"
code = "echo $HOME"
#!END_NESL_a5b
```


```json
{
  "success": true,
  "stdout": "{HOME_VALUE}\n",
  "stderr": "",
  "exit_code": 0
}
```

## Command not found
```sh nesl
#!NESL [@three-char-SHA-256: a6b]
action = "exec"
lang = "bash"
code = "this_command_does_not_exist"
#!END_NESL_a6b
```


```json
{
  "success": false,
  "stdout": "",
  "stderr": "bash: this_command_does_not_exist: command not found\n",
  "exit_code": 127
}
```

## Quotes and special characters
```sh nesl
#!NESL [@three-char-SHA-256: a7b]
action = "exec"
lang = "bash"
code = "echo \"It's a 'test' with \$pecial chars: * & < >\""
#!END_NESL_a7b
```


```json
{
  "success": true,
  "stdout": "It's a 'test' with $pecial chars: * & < >\n",
  "stderr": "",
  "exit_code": 0
}
```