# files_read Integration Tests

## files_read

### 001-read-multiple-files

```sh nesl
#!NESL [@three-char-SHA-256: rm1]
action = "file_write"
path = "/tmp/t_read-multiple-files/files-read-test/file1.txt"
content = "Content of file 1"
#!END_NESL_rm1

#!NESL [@three-char-SHA-256: rm2]
action = "file_write"
path = "/tmp/t_read-multiple-files/files-read-test/file2.txt"
content = "Content of file 2"
#!END_NESL_rm2

#!NESL [@three-char-SHA-256: rm3]
action = "file_write"
path = "/tmp/t_read-multiple-files/files-read-test/subdir/file3.txt"
content = "Content of file 3 in subdirectory"
#!END_NESL_rm3
```

```sh nesl
#!NESL [@three-char-SHA-256: rm4]
action = "files_read"
paths = <<'EOT_NESL_rm4'
/tmp/t_read-multiple-files/files-read-test/file1.txt
/tmp/t_read-multiple-files/files-read-test/file2.txt
/tmp/t_read-multiple-files/files-read-test/subdir/file3.txt
EOT_NESL_rm4
#!END_NESL_rm4
```

```json
{
  "success": true,
  "data": {
    "paths": [
      "/tmp/t_read-multiple-files/files-read-test/file1.txt",
      "/tmp/t_read-multiple-files/files-read-test/file2.txt",
      "/tmp/t_read-multiple-files/files-read-test/subdir/file3.txt"
    ],
    "content": [
      "Content of file 1",
      "Content of file 2",
      "Content of file 3 in subdirectory"
    ]
  }
}
```

### 002-read-with-empty-lines

```sh nesl
#!NESL [@three-char-SHA-256: el1]
action = "file_write"
path = "/tmp/t_read-with-empty-lines/files-read-empty-lines/first.txt"
content = "First file"
#!END_NESL_el1

#!NESL [@three-char-SHA-256: el2]
action = "file_write"
path = "/tmp/t_read-with-empty-lines/files-read-empty-lines/second.txt"
content = "Second file"
#!END_NESL_el2
```

```sh nesl
#!NESL [@three-char-SHA-256: el3]
action = "files_read"
paths = <<'EOT_NESL_el3'
/tmp/t_read-with-empty-lines/files-read-empty-lines/first.txt

/tmp/t_read-with-empty-lines/files-read-empty-lines/second.txt

EOT_NESL_el3
#!END_NESL_el3
```

```json
{
  "success": true,
  "data": {
    "paths": [
      "/tmp/t_read-with-empty-lines/files-read-empty-lines/first.txt",
      "/tmp/t_read-with-empty-lines/files-read-empty-lines/second.txt"
    ],
    "content": [
      "First file",
      "Second file"
    ]
  }
}
```

### 003-read-with-missing-file

```sh nesl
#!NESL [@three-char-SHA-256: mf1]
action = "file_write"
path = "/tmp/t_read-with-missing-file/files-read-missing/exists.txt"
content = "This file exists"
#!END_NESL_mf1
```

```sh nesl
#!NESL [@three-char-SHA-256: mf2]
action = "files_read"
paths = <<'EOT_NESL_mf2'
/tmp/t_read-with-missing-file/files-read-missing/exists.txt
/tmp/t_read-with-missing-file/files-read-missing/does-not-exist.txt
/tmp/t_read-with-missing-file/files-read-missing/also-missing.txt
EOT_NESL_mf2
#!END_NESL_mf2
```

```json
{
  "success": false,
  "error": "files_read: Failed to read 2 file(s):\n  /tmp/t_read-with-missing-file/files-read-missing/does-not-exist.txt: ENOENT: no such file or directory, open '/tmp/t_read-with-missing-file/files-read-missing/does-not-exist.txt'\n  /tmp/t_read-with-missing-file/files-read-missing/also-missing.txt: ENOENT: no such file or directory, open '/tmp/t_read-with-missing-file/files-read-missing/also-missing.txt'"
}
```

### 004-read-empty-paths

```
```

```sh nesl
#!NESL [@three-char-SHA-256: ep1]
action = "files_read"
paths = <<'EOT_NESL_ep1'


EOT_NESL_ep1
#!END_NESL_ep1
```

```json
{
  "success": false,
  "error": "files_read: No paths provided"
}
```

### 005-read-single-file

```sh nesl
#!NESL [@three-char-SHA-256: sf1]
action = "file_write"
path = "/tmp/t_read-single-file/files-read-single/only.txt"
content = "Only file content"
#!END_NESL_sf1
```

```sh nesl
#!NESL [@three-char-SHA-256: sf2]
action = "files_read"
paths = "/tmp/t_read-single-file/files-read-single/only.txt"
#!END_NESL_sf2
```

```json
{
  "success": true,
  "data": {
    "paths": ["/tmp/t_read-single-file/files-read-single/only.txt"],
    "content": ["Only file content"]
  }
}
```

### 006-read-files-with-special-content

```sh nesl
#!NESL [@three-char-SHA-256: sc1]
action = "file_write"
path = "/tmp/t_read-files-with-special-content/files-read-special/quotes.txt"
content = "File with \"quotes\" and 'apostrophes'"
#!END_NESL_sc1

#!NESL [@three-char-SHA-256: sc2]
action = "file_write"
path = "/tmp/t_read-files-with-special-content/files-read-special/multiline.txt"
content = <<'EOT_NESL_sc2'
Line 1
Line 2
Line 3
EOT_NESL_sc2
#!END_NESL_sc2
```

```sh nesl
#!NESL [@three-char-SHA-256: sc3]
action = "files_read"
paths = <<'EOT_NESL_sc3'
/tmp/t_read-files-with-special-content/files-read-special/quotes.txt
/tmp/t_read-files-with-special-content/files-read-special/multiline.txt
EOT_NESL_sc3
#!END_NESL_sc3
```

```json
{
  "success": true,
  "data": {
    "paths": [
      "/tmp/t_read-files-with-special-content/files-read-special/quotes.txt",
      "/tmp/t_read-files-with-special-content/files-read-special/multiline.txt"
    ],
    "content": [
      "File with \"quotes\" and 'apostrophes'",
      "Line 1\nLine 2\nLine 3"
    ]
  }
}
```