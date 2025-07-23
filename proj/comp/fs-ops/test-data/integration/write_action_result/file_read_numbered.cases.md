# file_read_numbered Integration Tests

## file_read_numbered

### 001-read-single-line

```sh nesl
#!NESL [@three-char-SHA-256: rs1]
action = "file_write"
path = "/tmp/t_read-single-line/numbered.txt"
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
action = "file_read_numbered"
path = "/tmp/t_read-single-line/numbered.txt"
lines = "3"
#!END_NESL_rs2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-single-line/numbered.txt",
    "content": "3: Line 3"
  }
}
```

### 002-read-line-range

```sh nesl
#!NESL [@three-char-SHA-256: rr1]
action = "file_write"
path = "/tmp/t_read-line-range/numbered.txt"
content = <<'EOT_NESL_rr1'
First line
Second line
Third line
Fourth line
Fifth line
Sixth line
Seventh line
EOT_NESL_rr1
#!END_NESL_rr1
```

```sh nesl
#!NESL [@three-char-SHA-256: rr2]
action = "file_read_numbered"
path = "/tmp/t_read-line-range/numbered.txt"
lines = "3-5"
#!END_NESL_rr2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-line-range/numbered.txt",
    "content": "3: Third line\n4: Fourth line\n5: Fifth line"
  }
}
```

### 003-read-with-custom-delimiter

```sh nesl
#!NESL [@three-char-SHA-256: cd1]
action = "file_write"
path = "/tmp/t_read-with-custom-delimiter/numbered.txt"
content = <<'EOT_NESL_cd1'
import os
import sys

def main():
    print("Hello, World!")
    
if __name__ == "__main__":
    main()
EOT_NESL_cd1
#!END_NESL_cd1
```

```sh nesl
#!NESL [@three-char-SHA-256: cd2]
action = "file_read_numbered"
path = "/tmp/t_read-with-custom-delimiter/numbered.txt"
lines = "4-7"
delimiter = "    "
#!END_NESL_cd2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-with-custom-delimiter/numbered.txt",
    "content": "4    def main():\n5        print(\"Hello, World!\")\n6        \n7    if __name__ == \"__main__\":"
  }
}
```

### 004-read-with-empty-delimiter

```sh nesl
#!NESL [@three-char-SHA-256: ed1]
action = "file_write"
path = "/tmp/t_read-with-empty-delimiter/numbered.txt"
content = <<'EOT_NESL_ed1'
apple
banana
cherry
date
EOT_NESL_ed1
#!END_NESL_ed1
```

```sh nesl
#!NESL [@three-char-SHA-256: ed2]
action = "file_read_numbered"
path = "/tmp/t_read-with-empty-delimiter/numbered.txt"
lines = "2-3"
delimiter = ""
#!END_NESL_ed2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-with-empty-delimiter/numbered.txt",
    "content": "2banana\n3cherry"
  }
}
```

### 005-read-out-of-range-lines

```sh nesl
#!NESL [@three-char-SHA-256: or1]
action = "file_write"
path = "/tmp/t_read-out-of-range-lines/numbered.txt"
content = <<'EOT_NESL_or1'
Only
Three
Lines
EOT_NESL_or1
#!END_NESL_or1
```

```sh nesl
#!NESL [@three-char-SHA-256: or2]
action = "file_read_numbered"
path = "/tmp/t_read-out-of-range-lines/numbered.txt"
lines = "2-10"
#!END_NESL_or2
```

```json
{
  "success": false,
  "error": "file_read_numbered: Requested lines 2-10 but file only has 3 lines",
  "data": {
    "path": "/tmp/t_read-out-of-range-lines/numbered.txt",
    "content": "2: Three\n3: Lines"
  }
}
```

### 006-read-single-line-file

```sh nesl
#!NESL [@three-char-SHA-256: sl1]
action = "file_write"
path = "/tmp/t_read-single-line-file/numbered.txt"
content = "Just one line"
#!END_NESL_sl1
```

```sh nesl
#!NESL [@three-char-SHA-256: sl2]
action = "file_read_numbered"
path = "/tmp/t_read-single-line-file/numbered.txt"
lines = "1"
#!END_NESL_sl2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-single-line-file/numbered.txt",
    "content": "1: Just one line"
  }
}
```

### 007-read-empty-file

```sh nesl
#!NESL [@three-char-SHA-256: ef1]
action = "file_write"
path = "/tmp/t_read-empty-file/numbered.txt"
content = ""
#!END_NESL_ef1
```

```sh nesl
#!NESL [@three-char-SHA-256: ef2]
action = "file_read_numbered"
path = "/tmp/t_read-empty-file/numbered.txt"
lines = "1"
#!END_NESL_ef2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-empty-file/numbered.txt",
    "content": ""
  }
}
```

### 008-invalid-line-format

```sh nesl
#!NESL [@three-char-SHA-256: if1]
action = "file_write"
path = "/tmp/t_invalid-line-format/numbered.txt"
content = "Some content"
#!END_NESL_if1
```

```sh nesl
#!NESL [@three-char-SHA-256: if2]
action = "file_read_numbered"
path = "/tmp/t_invalid-line-format/numbered.txt"
lines = "abc"
#!END_NESL_if2
```

```json
{
  "success": false,
  "error": "file_read_numbered: Invalid line specification 'abc'"
}
```

### 009-invalid-line-range

```sh nesl
#!NESL [@three-char-SHA-256: ir1]
action = "file_write"
path = "/tmp/t_invalid-line-range/numbered.txt"
content = "Some content"
#!END_NESL_ir1
```

```sh nesl
#!NESL [@three-char-SHA-256: ir2]
action = "file_read_numbered"
path = "/tmp/t_invalid-line-range/numbered.txt"
lines = "5-3"
#!END_NESL_ir2
```

```json
{
  "success": false,
  "error": "file_read_numbered: Invalid line range '5-3' (start must be <= end)"
}
```

### 010-read-nonexistent-file

```sh nesl
```

```sh nesl
#!NESL [@three-char-SHA-256: nf1]
action = "file_read_numbered"
path = "/tmp/t_read-nonexistent-file/does-not-exist.txt"
lines = "1-5"
#!END_NESL_nf1
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, open '/tmp/t_read-nonexistent-file/does-not-exist.txt'"
}
```

### 011-read-completely-out-of-range

```sh nesl
#!NESL [@three-char-SHA-256: co1]
action = "file_write"
path = "/tmp/t_read-completely-out-of-range/numbered.txt"
content = <<'EOT_NESL_co1'
Line 1
Line 2
EOT_NESL_co1
#!END_NESL_co1
```

```sh nesl
#!NESL [@three-char-SHA-256: co2]
action = "file_read_numbered"
path = "/tmp/t_read-completely-out-of-range/numbered.txt"
lines = "5-10"
#!END_NESL_co2
```

```json
{
  "success": false,
  "error": "file_read_numbered: Requested lines 5-10 but file only has 2 lines",
  "data": {
    "path": "/tmp/t_read-completely-out-of-range/numbered.txt",
    "content": ""
  }
}
```

### 012-read-all-lines-missing-parameter

```sh nesl
#!NESL [@three-char-SHA-256: al1]
action = "file_write"
path = "/tmp/t_read-all-lines-missing-parameter/numbered.txt"
content = <<'EOT_NESL_al1'
First line
Second line
Third line
Fourth line
Fifth line
EOT_NESL_al1
#!END_NESL_al1
```

```sh nesl
#!NESL [@three-char-SHA-256: al2]
action = "file_read_numbered"
path = "/tmp/t_read-all-lines-missing-parameter/numbered.txt"
#!END_NESL_al2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-all-lines-missing-parameter/numbered.txt",
    "content": "1: First line\n2: Second line\n3: Third line\n4: Fourth line\n5: Fifth line"
  }
}
```

### 013-read-large-line-numbers

```sh nesl
#!NESL [@three-char-SHA-256: ll1]
action = "file_write"
path = "/tmp/t_read-large-line-numbers/numbered.txt"
content = <<'EOT_NESL_ll1'
Line 1
Line 2
Line 3
Line 4
Line 5
Line 6
Line 7
Line 8
Line 9
Line 10
Line 11
Line 12
EOT_NESL_ll1
#!END_NESL_ll1
```

```sh nesl
#!NESL [@three-char-SHA-256: ll2]
action = "file_read_numbered"
path = "/tmp/t_read-large-line-numbers/numbered.txt"
lines = "9-11"
#!END_NESL_ll2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_read-large-line-numbers/numbered.txt",
    "content": " 9: Line 9\n10: Line 10\n11: Line 11"
  }
}
```