# NESL Tool API Reference

## Syntax
```sh
#!nesl [@three-char-SHA-256: q8r]
action = "tool_name"
param1 = <<'EOT_q8r'
value line 1
value line 2
EOT_q8r
param2 = "value"
#!end_q8r
```

Constraints:
- Block ID must be exactly 3 characters
- Always use heredocs (`<<'EOT_[id]'...EOT_[id]`) for file contents
- All paths must be absolute

## Tools

### `file_write`
Write content to file (creates or overwrites)  
- `path`
- `content`

### `file_replace_text`
Replace exactly one text occurrence  
- `path`
- `old_text`
- `new_text` 

### `file_replace_lines`
Replace the given line(s) with the supplied `new_content` string
- `path`
- `lines` eg "3" or a range like "2-13"
- `new_content` 

### `file_read`
Read file contents  
- `path` 

### `file_read_numbered`
Read file with line numbers  
- `path`

### `files_read`
Read multiple files  
- `paths`

### `exec`
Execute shell commands  
- `lang`
- `code`