# NESL Tool API Reference

## NESL Syntax example 


```sh nesl
#!nesl [@three-char-SHA-256: q8r]
action = "tool_name"
param1 = <<'EOT_q8r'
value line 1

 value line 2
EOT_q8r
param2 = "value"
#!end_q8r
```

equivalent json:

```json
{
 "action": "tool_name",
 "param1": "value line 1\n\n value line 2",
 "param2": "value"
}
```

**Critical constraints:**
- Paths: always absolute
- Whitespace: preserved exactly in heredocs

## Tools

### `file_write` - Create/overwrite file
```sh
#!nesl [@three-char-SHA-256: fw1]
action = "file_write"
path = "/home/user/script.py"
content = <<'EOT_fw1'
#!/usr/bin/env python3
print("Hello")
EOT_fw1
#!end_fw1
```

### `file_replace_text` - Replace one occurrence
```sh
#!nesl [@three-char-SHA-256: fr2]
action = "file_replace_text"
path = "/etc/config.ini"
old_text = <<'EOT_fr2'
debug = false
EOT_fr2
new_text = <<'EOT_fr2'
debug = true
EOT_fr2
#!end_fr2
```

### `file_read` - Read single file
```sh
#!nesl [@three-char-SHA-256: rd3]
action = "file_read"
path = "/var/log/app.log"
#!end_rd3
```

### `files_read` - Read multiple files
```sh
#!nesl [@three-char-SHA-256: rm4]
action = "files_read"
paths = <<'EOT_rm4'
/tmp/file1.txt
/tmp/file2.txt
/usr/local/bin/script.sh
EOT_rm4
#!end_rm4
```