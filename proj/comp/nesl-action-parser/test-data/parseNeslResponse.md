# Tests

## general

### 001-single-valid-file-create-action

```sh nesl
#!NESL [@three-char-SHA-256: abc]
action = "file_write"
path = "/tmp/test.txt"
content = <<'EOT_NESL_abc'
Hello world!
EOT_NESL_abc
#!END_NESL_abc
````

```json
{
  "actions": [{
    "action": "file_write",
    "parameters": {
      "path": "/tmp/test.txt",
      "content": "Hello world!"
    },
    "metadata": {
      "blockId": "abc",
      "startLine": 1,
      "endLine": 7
    }
  }],
  "errors": [],
  "summary": {
    "totalBlocks": 1,
    "successCount": 1,
    "errorCount": 0
  }
}
```

---

### 002-multiple-blocks-with-one-invalid

```sh nesl
#!NESL [@three-char-SHA-256: gd1]
action = "file_write"
path = "/tmp/good.txt"
content = "valid"
#!END_NESL_gd1

#!NESL [@three-char-SHA-256: bad]
action = "unknown_action"
path = "/tmp/bad.txt"
#!END_NESL_bad
```

```json
{
  "actions": [{
    "action": "file_write",
    "parameters": {
      "path": "/tmp/good.txt",
      "content": "valid"
    },
    "metadata": {
      "blockId": "gd1",
      "startLine": 1,
      "endLine": 5
    }
  }],
  "errors": [{
    "blockId": "bad",
    "action": "unknown_action",
    "errorType": "validation",
    "message": "Unknown action: unknown_action",
    "blockStartLine": 7,
    "neslContent": "#!NESL [@three-char-SHA-256: bad]\naction = \"unknown_action\"\npath = \"/tmp/bad.txt\"\n#!END_NESL_bad"
  }],
  "summary": {
    "totalBlocks": 2,
    "successCount": 1,
    "errorCount": 1
  }
}
```

---

### 003-missing-required-parameter

```sh nesl
#!NESL [@three-char-SHA-256: mis]
action = "file_write"
content = "missing path"
#!END_NESL_mis
```

```json
{
  "actions": [],
  "errors": [{
    "blockId": "mis",
    "action": "file_write",
    "errorType": "validation",
    "message": "Missing required parameter: path",
    "blockStartLine": 1,
    "neslContent": "#!NESL [@three-char-SHA-256: mis]\naction = \"file_write\"\ncontent = \"missing path\"\n#!END_NESL_mis"
  }],
  "summary": {
    "totalBlocks": 1,
    "successCount": 0,
    "errorCount": 1
  }
}
```

---

### 004-type-conversion-with-boolean-and-integer

```sh nesl
#!NESL [@three-char-SHA-256: typ]
action = "exec"
code = "print('hi')"
lang = "python"
cwd = "/tmp"
#!END_NESL_typ
```

```json
{
  "actions": [{
    "action": "exec",
    "parameters": {
      "code": "print('hi')",
      "lang": "python",
      "cwd": "/tmp"
    },
    "metadata": {
      "blockId": "typ",
      "startLine": 1,
      "endLine": 6
    }
  }],
  "errors": [],
  "summary": {
    "totalBlocks": 1,
    "successCount": 1,
    "errorCount": 0
  }
}
```
