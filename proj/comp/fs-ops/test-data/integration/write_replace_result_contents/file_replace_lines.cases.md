# file_replace_lines Integration Tests

## file_replace_lines

### 001-replace-single-line

```sh nesl
#!NESL [@three-char-SHA-256: rs1]
action = "file_write"
path = "/tmp/t_replace-single-line/test.txt"
content = <<'EOT_NESL_rs1'
Line 1
Line 2
Line 3
Line 4
Line 5
EOT_NESL_rs1
#!END_NESL_rs1
```

```sh nesl
#!NESL [@three-char-SHA-256: rs2]
action = "file_replace_lines"
path = "/tmp/t_replace-single-line/test.txt"
lines = "3"
new_content = "This is the new line 3"
#!END_NESL_rs2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_replace-single-line/test.txt",
    "lines_replaced": 1
  }
}
```

```
Line 1
Line 2
This is the new line 3
Line 4
Line 5
```

### 002-replace-line-range

```sh nesl
#!NESL [@three-char-SHA-256: rr1]
action = "file_write"
path = "/tmp/t_replace-line-range/code.js"
content = <<'EOT_NESL_rr1'
function oldImplementation() {
  console.log('line 2');
  console.log('line 3');
  console.log('line 4');
  return 'old';
}
EOT_NESL_rr1
#!END_NESL_rr1
```

```sh nesl
#!NESL [@three-char-SHA-256: rr2]
action = "file_replace_lines"
path = "/tmp/t_replace-line-range/code.js"
lines = "2-5"
new_content = <<'EOT_NESL_rr2'
  // New implementation
  return 'new';
EOT_NESL_rr2
#!END_NESL_rr2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_replace-line-range/code.js",
    "lines_replaced": 4
  }
}
```

```
function oldImplementation() {
  // New implementation
  return 'new';
}
```

### 003-replace-entire-file

```sh nesl
#!NESL [@three-char-SHA-256: re1]
action = "file_write"
path = "/tmp/t_replace-entire-file/small.txt"
content = <<'EOT_NESL_re1'
Old line 1
Old line 2
Old line 3
EOT_NESL_re1
#!END_NESL_re1
```

```sh nesl
#!NESL [@three-char-SHA-256: re2]
action = "file_replace_lines"
path = "/tmp/t_replace-entire-file/small.txt"
lines = "1-3"
new_content = <<'EOT_NESL_re2'
Completely new content
With multiple lines
EOT_NESL_re2
#!END_NESL_re2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_replace-entire-file/small.txt",
    "lines_replaced": 3
  }
}
```

```
Completely new content
With multiple lines
```

### 004-replace-with-empty-content

```sh nesl
#!NESL [@three-char-SHA-256: ec1]
action = "file_write"
path = "/tmp/t_replace-with-empty-content/deletable.txt"
content = <<'EOT_NESL_ec1'
Keep this line
Delete this line
Keep this line too
EOT_NESL_ec1
#!END_NESL_ec1
```

```sh nesl
#!NESL [@three-char-SHA-256: ec2]
action = "file_replace_lines"
path = "/tmp/t_replace-with-empty-content/deletable.txt"
lines = "2"
new_content = ""
#!END_NESL_ec2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_replace-with-empty-content/deletable.txt",
    "lines_replaced": 1
  }
}
```

```
Keep this line

Keep this line too
```

### 005-replace-nonexistent-file

```
```

```sh nesl
#!NESL [@three-char-SHA-256: ne1]
action = "file_replace_lines"
path = "/tmp/t_replace-nonexistent-file/missing.txt"
lines = "1-5"
new_content = "This should fail"
#!END_NESL_ne1
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, open '/tmp/t_replace-nonexistent-file/missing.txt'"
}
```

### 006-invalid-line-specification

```sh nesl
#!NESL [@three-char-SHA-256: il1]
action = "file_write"
path = "/tmp/t_invalid-line-specification/test.txt"
content = <<'EOT_NESL_il1'
Line 1
Line 2
Line 3
EOT_NESL_il1
#!END_NESL_il1
```

```sh nesl
#!NESL [@three-char-SHA-256: il2]
action = "file_replace_lines"
path = "/tmp/t_invalid-line-specification/test.txt"
lines = "abc"
new_content = "This should fail"
#!END_NESL_il2
```

```json
{
  "success": false,
  "error": "file_replace_lines: Invalid line specification 'abc'"
}
```

### 007-out-of-range-lines

```sh nesl
#!NESL [@three-char-SHA-256: or1]
action = "file_write"
path = "/tmp/t_out-of-range-lines/short.txt"
content = <<'EOT_NESL_or1'
Only one line
EOT_NESL_or1
#!END_NESL_or1
```

```sh nesl
#!NESL [@three-char-SHA-256: or2]
action = "file_replace_lines"
path = "/tmp/t_out-of-range-lines/short.txt"
lines = "5-10"
new_content = "Out of range"
#!END_NESL_or2
```

```json
{
  "success": false,
  "error": "file_replace_lines: Line range 5-10 is out of bounds (file has 1 lines)"
}
```

### 008-partial-out-of-range

```sh nesl
#!NESL [@three-char-SHA-256: po1]
action = "file_write"
path = "/tmp/t_partial-out-of-range/partial.txt"
content = <<'EOT_NESL_po1'
Line 1
Line 2
Line 3
EOT_NESL_po1
#!END_NESL_po1
```

```sh nesl
#!NESL [@three-char-SHA-256: po2]
action = "file_replace_lines"
path = "/tmp/t_partial-out-of-range/partial.txt"
lines = "2-5"
new_content = "Partial replacement"
#!END_NESL_po2
```

```json
{
  "success": false,
  "error": "file_replace_lines: Line range 2-5 is out of bounds (file has 3 lines)"
}
```

### 009-reversed-line-range

```sh nesl
#!NESL [@three-char-SHA-256: rv1]
action = "file_write"
path = "/tmp/t_reversed-line-range/reverse.txt"
content = <<'EOT_NESL_rv1'
Line 1
Line 2
Line 3
EOT_NESL_rv1
#!END_NESL_rv1
```

```sh nesl
#!NESL [@three-char-SHA-256: rv2]
action = "file_replace_lines"
path = "/tmp/t_reversed-line-range/reverse.txt"
lines = "3-1"
new_content = "Invalid range"
#!END_NESL_rv2
```

```json
{
  "success": false,
  "error": "file_replace_lines: Invalid line range '3-1' (start must be <= end)"
}
```

### 010-multiline-replacement

```sh nesl
#!NESL [@three-char-SHA-256: ml1]
action = "file_write"
path = "/tmp/t_multiline-replacement/function.py"
content = <<'EOT_NESL_ml1'
def old_function():
    # This is line 2
    # This is line 3
    # This is line 4
    return None
EOT_NESL_ml1
#!END_NESL_ml1
```

```sh nesl
#!NESL [@three-char-SHA-256: ml2]
action = "file_replace_lines"
path = "/tmp/t_multiline-replacement/function.py"
lines = "2-4"
new_content = <<'EOT_NESL_ml2'
    """
    New docstring spanning
    multiple lines
    """
    x = 42
    y = x * 2
EOT_NESL_ml2
#!END_NESL_ml2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_multiline-replacement/function.py",
    "lines_replaced": 3
  }
}
```

```
def old_function():
    """
    New docstring spanning
    multiple lines
    """
    x = 42
    y = x * 2
    return None
```

### 011-preserve-line-endings

```sh nesl
#!NESL [@three-char-SHA-256: pl1]
action = "file_write"
path = "/tmp/t_preserve-line-endings/mixed.txt"
content = "Line 1\r\nLine 2\r\nLine 3\r\n"
#!END_NESL_pl1
```

```sh nesl
#!NESL [@three-char-SHA-256: pl2]
action = "file_replace_lines"
path = "/tmp/t_preserve-line-endings/mixed.txt"
lines = "2"
new_content = "New Line 2"
#!END_NESL_pl2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_preserve-line-endings/mixed.txt",
    "lines_replaced": 1
  }
}
```

```
Line 1
New Line 2
Line 3

```

### 012-empty-file

```sh nesl
#!NESL [@three-char-SHA-256: ef1]
action = "file_write"
path = "/tmp/t_empty-file/empty.txt"
content = ""
#!END_NESL_ef1
```

```sh nesl
#!NESL [@three-char-SHA-256: ef2]
action = "file_replace_lines"
path = "/tmp/t_empty-file/empty.txt"
lines = "1"
new_content = "Cannot replace in empty file"
#!END_NESL_ef2
```

```json
{
  "success": false,
  "error": "file_replace_lines: Line range 1 is out of bounds (file has 0 lines)"
}
```

### 013-zero-line-number

```sh nesl
#!NESL [@three-char-SHA-256: zl1]
action = "file_write"
path = "/tmp/t_zero-line-number/test.txt"
content = <<'EOT_NESL_zl1'
Line 1
Line 2
EOT_NESL_zl1
#!END_NESL_zl1
```

```sh nesl
#!NESL [@three-char-SHA-256: zl2]
action = "file_replace_lines"
path = "/tmp/t_zero-line-number/test.txt"
lines = "0"
new_content = "Invalid line number"
#!END_NESL_zl2
```

```json
{
  "success": false,
  "error": "file_replace_lines: Invalid line specification '0'"
}
```

### 014-negative-line-number

```sh nesl
#!NESL [@three-char-SHA-256: nl1]
action = "file_write"
path = "/tmp/t_negative-line-number/test.txt"
content = <<'EOT_NESL_nl1'
Line 1
Line 2
EOT_NESL_nl1
#!END_NESL_nl1
```

```sh nesl
#!NESL [@three-char-SHA-256: nl2]
action = "file_replace_lines"
path = "/tmp/t_negative-line-number/test.txt"
lines = "-1"
new_content = "Invalid line number"
#!END_NESL_nl2
```

```json
{
  "success": false,
  "error": "file_replace_lines: Invalid line specification '-1'"
}
```

### 015-last-line-no-newline

```sh nesl
#!NESL [@three-char-SHA-256: ln1]
action = "file_write"
path = "/tmp/t_last-line-no-newline/no-newline.txt"
content = "Line 1\nLine 2\nLine 3"
#!END_NESL_ln1
```

```sh nesl
#!NESL [@three-char-SHA-256: ln2]
action = "file_replace_lines"
path = "/tmp/t_last-line-no-newline/no-newline.txt"
lines = "3"
new_content = "New last line without newline"
#!END_NESL_ln2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_last-line-no-newline/no-newline.txt",
    "lines_replaced": 1
  }
}
```

```
Line 1
Line 2
New last line without newline
```