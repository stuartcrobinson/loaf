
```sh nesl
#!nesl [@three-char-SHA-256: rr1]
action = "file_write"
path = "/tmp/t_replace-line-range/code.js"
content = <<'EOT_rr1'
function oldImplementation() {
  console.log('line 2');
  console.log('line 3');
  console.log('line 4');
  return 'old';
}
EOT_rr1
#!end_rr1
```

```sh nesl
#!nesl [@three-char-SHA-256: rr2]
action = "file_replace_lines"
path = "/tmp/t_replace-line-range/code.js"
lines = "2-5"
new_content = <<'EOT_rr2'
  // New implementation
  return 'new';
EOT_rr2
#!end_rr2
```


/tmp/t_replace-line-range/code.js content:
```
function oldImplementation() {
  // New implementation
  return 'new';
}
```
