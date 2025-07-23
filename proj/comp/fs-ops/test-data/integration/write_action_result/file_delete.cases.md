# file_delete Integration Tests

## file_delete

### 001-delete-existing-file

```sh nesl
#!NESL [@three-char-SHA-256: cre]
action = "file_write"
path = "/tmp/t_delete-existing-file/to-delete.txt"
content = "This file will be deleted"
#!END_NESL_cre
```

```sh nesl
#!NESL [@three-char-SHA-256: del]
action = "file_delete"
path = "/tmp/t_delete-existing-file/to-delete.txt"
#!END_NESL_del
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_delete-existing-file/to-delete.txt"
  }
}
```

### 002-delete-nonexistent-file

```sh nesl
```

```sh nesl
#!NESL [@three-char-SHA-256: dnf]
action = "file_delete"
path = "/tmp/t_delete-nonexistent-file/does-not-exist.txt"
#!END_NESL_dnf
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, unlink '/tmp/t_delete-nonexistent-file/does-not-exist.txt'"
}
```
