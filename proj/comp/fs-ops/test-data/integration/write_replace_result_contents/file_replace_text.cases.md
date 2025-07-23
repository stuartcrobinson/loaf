# file_replace_text Integration Tests

## file_replace_text

### 001-simple-text-replacement

```sh nesl
#!NESL [@three-char-SHA-256: st1]
action = "file_write"
path = "/tmp/t_simple-text-replacement/replace-test.txt"
content = "Hello World"
#!END_NESL_st1
```

```sh nesl
#!NESL [@three-char-SHA-256: rpl]
action = "file_replace_text"
path = "/tmp/t_simple-text-replacement/replace-test.txt"
old_text = "Hello"
new_text = "Goodbye"
#!END_NESL_rpl
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_simple-text-replacement/replace-test.txt",
    "replacements": 1
  }
}
```

```
Goodbye World
```

### 002-replace-with-count-limit

```sh nesl
#!NESL [@three-char-SHA-256: rc1]
action = "file_write"
path = "/tmp/t_replace-with-count-limit/multi-replace.txt"
content = "foo bar foo baz foo qux foo"
#!END_NESL_rc1
```

```sh nesl
#!NESL [@three-char-SHA-256: cnt]
action = "file_replace_all_text"
path = "/tmp/t_replace-with-count-limit/multi-replace.txt"
old_text = "foo"
new_text = "bar"
count = "2"
#!END_NESL_cnt
```

```json
{
  "success": false,
  "error": "file_replace_all_text: expected 2 occurrences but found 4"
}
```

### 003-replace-text-not-found

```sh nesl
#!NESL [@three-char-SHA-256: nf1]
action = "file_write"
path = "/tmp/t_replace-text-not-found/no-match.txt"
content = "This file has no matches"
#!END_NESL_nf1
```

```sh nesl
#!NESL [@three-char-SHA-256: nfr]
action = "file_replace_text"
path = "/tmp/t_replace-text-not-found/no-match.txt"
old_text = "nonexistent"
new_text = "replacement"
#!END_NESL_nfr
```

```json
{
  "success": false,
  "error": "file_replace_text: old_text not found in file"
}
```

### 004-replace-in-nonexistent-file

```sh nesl
#!NESL [@three-char-SHA-256: rnf]
action = "file_replace_text"
path = "/tmp/t_replace-in-nonexistent-file/does-not-exist-replace.txt"
old_text = "text"
new_text = "other"
#!END_NESL_rnf
```

```json
{
  "success": false,
  "error": "ENOENT: no such file or directory, open '/tmp/t_replace-in-nonexistent-file/does-not-exist-replace.txt'"
}
```

### 005-multiline-replacement

```sh nesl
#!NESL [@three-char-SHA-256: ml1]
action = "file_write"
path = "/tmp/t_multiline-replacement/multiline-replace.txt"
content = <<'EOT_NESL_ml1'
export function oldName() {
  console.log('oldName');
  return oldName;
}

function oldName() {
  return oldName;
}

const x = oldName();
EOT_NESL_ml1
#!END_NESL_ml1
```

```sh nesl
#!NESL [@three-char-SHA-256: mlr]
action = "file_replace_text"
path = "/tmp/t_multiline-replacement/multiline-replace.txt"
old_text = <<'EOT_NESL_mlr'
export function oldName() {
  console.log('oldName');
  return oldName;
}
EOT_NESL_mlr
new_text = <<'EOT_NESL_mlr'
export function newName() {
  console.log('newName');
  return newName;
}
EOT_NESL_mlr
#!END_NESL_mlr
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_multiline-replacement/multiline-replace.txt",
    "replacements": 1
  }
}
```

```
export function newName() {
  console.log('newName');
  return newName;
}

function oldName() {
  return oldName;
}

const x = oldName();
```

### 006-empty-old-text-error

```sh nesl
#!NESL [@three-char-SHA-256: em1]
action = "file_write"
path = "/tmp/t_empty-old-text-error/empty-search.txt"
content = "Some content here"
#!END_NESL_em1
```

```sh nesl
#!NESL [@three-char-SHA-256: emt]
action = "file_replace_text"
path = "/tmp/t_empty-old-text-error/empty-search.txt"
old_text = ""
new_text = "something"
#!END_NESL_emt
```

```json
{
  "success": false,
  "error": "file_replace_text: old_text cannot be empty"
}
```

### 007-file-replace-text-multiple-occurrences

```sh nesl
#!NESL [@three-char-SHA-256: mo1]
action = "file_write"
path = "/tmp/t_file-replace-text-multiple-occurrences/multiple-occurrences.txt"
content = "duplicate text with duplicate word and duplicate again"
#!END_NESL_mo1
```

```sh nesl
#!NESL [@three-char-SHA-256: mul]
action = "file_replace_text"
path = "/tmp/t_file-replace-text-multiple-occurrences/multiple-occurrences.txt"
old_text = "duplicate"
new_text = "unique"
#!END_NESL_mul
```

```json
{
  "success": false,
  "error": "file_replace_text: old_text appears 3 times, must appear exactly once"
}
```

### 008-file-replace-all-text-no-count

```sh nesl
#!NESL [@three-char-SHA-256: ra1]
action = "file_write"
path = "/tmp/t_file-replace-all-text-no-count/replace-all.txt"
content = "foo bar foo baz foo"
#!END_NESL_ra1
```

```sh nesl
#!NESL [@three-char-SHA-256: all]
action = "file_replace_all_text"
path = "/tmp/t_file-replace-all-text-no-count/replace-all.txt"
old_text = "foo"
new_text = "bar"
#!END_NESL_all
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_file-replace-all-text-no-count/replace-all.txt",
    "replacements": 3
  }
}
```

```
bar bar bar baz bar
```

### 009-file-replace-all-text-count-mismatch

```sh nesl
#!NESL [@three-char-SHA-256: cm1]
action = "file_write"
path = "/tmp/t_file-replace-all-text-count-mismatch/count-mismatch.txt"
content = "test this test case"
#!END_NESL_cm1
```

```sh nesl
#!NESL [@three-char-SHA-256: mis]
action = "file_replace_all_text"
path = "/tmp/t_file-replace-all-text-count-mismatch/count-mismatch.txt"
old_text = "test"
new_text = "check"
count = "5"
#!END_NESL_mis
```

```json
{
  "success": false,
  "error": "file_replace_all_text: expected 5 occurrences but found 2"
}
```

### 010-complex-multiline-multiple-occurrences

```sh nesl
#!NESL [@three-char-SHA-256: cm1]
action = "file_write"
path = "/tmp/t_complex-multiline-multiple-occurrences/listener.txt"
content = <<'EOT_NESL_cm1'
async function startListener(config) {
  const watcher = createWatcher();
  console.log('Starting listener');
  return watcher;
}

async function stopListener(watcher) {
  await watcher.close();
  console.log('Stopped listener');
}

async function startListener(altConfig) {
  // Different implementation
  return createAltWatcher();
}
EOT_NESL_cm1
#!END_NESL_cm1
```

```sh nesl
#!NESL [@three-char-SHA-256: cm2]
action = "file_replace_text"
path = "/tmp/t_complex-multiline-multiple-occurrences/listener.txt"
old_text = <<'EOT_NESL_cm2'
async function startListener(config) {
  const watcher = createWatcher();
  console.log('Starting listener');
  return watcher;
}
EOT_NESL_cm2
new_text = <<'EOT_NESL_cm2'
async function startListener(config) {
  const watcher = createWatcher(config);
  console.log('Starting listener with config');
  return watcher;
}
EOT_NESL_cm2
#!END_NESL_cm2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_complex-multiline-multiple-occurrences/listener.txt",
    "replacements": 1
  }
}
```

```
async function startListener(config) {
  const watcher = createWatcher(config);
  console.log('Starting listener with config');
  return watcher;
}

async function stopListener(watcher) {
  await watcher.close();
  console.log('Stopped listener');
}

async function startListener(altConfig) {
  // Different implementation
  return createAltWatcher();
}
```

### 011-whitespace-sensitive-replacement

```sh nesl
#!NESL [@three-char-SHA-256: ws1]
action = "file_write"
path = "/tmp/t_whitespace-sensitive-replacement/indented.txt"
content = <<'EOT_NESL_ws1'
class FileProcessor {
  processFile(path) {
    if (path) {
      return readFile(path);
    }
  }
  
  processFiles(paths) {
    return paths.map(p => this.processFile(p));
  }
}
EOT_NESL_ws1
#!END_NESL_ws1
```

```sh nesl
#!NESL [@three-char-SHA-256: ws2]
action = "file_replace_text"
path = "/tmp/t_whitespace-sensitive-replacement/indented.txt"
old_text = <<'EOT_NESL_ws2'
  processFile(path) {
    if (path) {
      return readFile(path);
    }
  }
EOT_NESL_ws2
new_text = <<'EOT_NESL_ws2'
  async processFile(path) {
    if (path) {
      return await readFile(path);
    }
  }
EOT_NESL_ws2
#!END_NESL_ws2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_whitespace-sensitive-replacement/indented.txt",
    "replacements": 1
  }
}
```

```
class FileProcessor {
  async processFile(path) {
    if (path) {
      return await readFile(path);
    }
  }
  
  processFiles(paths) {
    return paths.map(p => this.processFile(p));
  }
}
```

### 012-partial-match-should-not-replace

```sh nesl
#!NESL [@three-char-SHA-256: pm1]
action = "file_write"
path = "/tmp/t_partial-match-should-not-replace/partial.txt"
content = <<'EOT_NESL_pm1'
export function validateInput(data) {
  if (!data) throw new Error('Invalid input');
  return true;
}

export function validateInputWithLogging(data) {
  console.log('Validating:', data);
  if (!data) throw new Error('Invalid input');
  return true;
}
EOT_NESL_pm1
#!END_NESL_pm1
```

```sh nesl
#!NESL [@three-char-SHA-256: pm2]
action = "file_replace_text"
path = "/tmp/t_partial-match-should-not-replace/partial.txt"
old_text = <<'EOT_NESL_pm2'
export function validateInput(data) {
  if (!data) throw new Error('Invalid input');
  return true;
}

export function validateInputWithLogging(data) {
EOT_NESL_pm2
new_text = "// This should not match"
#!END_NESL_pm2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_partial-match-should-not-replace/partial.txt",
    "replacements": 1
  }
}
```

```
// This should not match
  console.log('Validating:', data);
  if (!data) throw new Error('Invalid input');
  return true;
}
```

### 013-exact-newline-matching

```sh nesl
#!NESL [@three-char-SHA-256: nl1]
action = "file_write"
path = "/tmp/t_exact-newline-matching/newlines.txt"
content = <<'EOT_NESL_nl1'
function one() {
  return 1;
}


function two() {
  return 2;
}
EOT_NESL_nl1
#!END_NESL_nl1
```

```sh nesl
#!NESL [@three-char-SHA-256: nl2]
action = "file_replace_text"
path = "/tmp/t_exact-newline-matching/newlines.txt"
old_text = <<'EOT_NESL_nl2'
}

function two() {
EOT_NESL_nl2
new_text = <<'EOT_NESL_nl2'
}

// Added comment
function two() {
EOT_NESL_nl2
#!END_NESL_nl2
```

```json
{
  "success": false,
  "error": "file_replace_text: old_text not found in file"
}
```

### 014-complex-code-block-replacement

```sh nesl
#!NESL [@three-char-SHA-256: cb1]
action = "file_write"
path = "/tmp/t_complex-code-block-replacement/complex.txt"
content = <<'EOT_NESL_cb1'
const handler = {
  async process(data) {
    const result = await transform(data);
    if (result.error) {
      throw new Error(result.error);
    }
    return result.value;
  },
  
  validate(data) {
    return data != null;
  }
};
EOT_NESL_cb1
#!END_NESL_cb1
```

```sh nesl
#!NESL [@three-char-SHA-256: cb2]
action = "file_replace_all_text"
path = "/tmp/t_complex-code-block-replacement/complex.txt"
old_text = <<'EOT_NESL_cb2'
  async process(data) {
    const result = await transform(data);
    if (result.error) {
      throw new Error(result.error);
    }
    return result.value;
  }
EOT_NESL_cb2
new_text = <<'EOT_NESL_cb2'
  async process(data) {
    try {
      const result = await transform(data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.value;
    } catch (e) {
      console.error('Process failed:', e);
      throw e;
    }
  }
EOT_NESL_cb2
#!END_NESL_cb2
```

```json
{
  "success": true,
  "data": {
    "path": "/tmp/t_complex-code-block-replacement/complex.txt",
    "replacements": 1
  }
}
```

```
const handler = {
  async process(data) {
    try {
      const result = await transform(data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.value;
    } catch (e) {
      console.error('Process failed:', e);
      throw e;
    }
  },
  
  validate(data) {
    return data != null;
  }
};
```

### 015-trailing-whitespace-sensitivity

```sh nesl
#!NESL [@three-char-SHA-256: tw1]
action = "file_write"
path = "/tmp/t_trailing-whitespace-sensitivity/trailing.txt"
content = "function test() {  \n  return true;\n}\n"
#!END_NESL_tw1
```

```sh nesl
#!NESL [@three-char-SHA-256: tw2]
action = "file_replace_text"
path = "/tmp/t_trailing-whitespace-sensitivity/trailing.txt"
old_text = "function test() {\n  return true;\n}"
new_text = "function test() {\n  return false;\n}"
#!END_NESL_tw2
```

```json
{
  "success": false,
  "error": "file_replace_text: old_text not found in file"
}
```

### 016-file-replace-text-multiple-identical-values

```sh nesl
#!NESL [@three-char-SHA-256: mv1]
action = "file_write"
path = "/tmp/t_file-replace-text-multiple-identical-values/app.js"
content = <<'EOT_NESL_mv1'
// Application code
function process() {
  const value = 100;
  console.log(value);
  
  if (value > 50) {
    console.log("High value");
  }
  
  return value;
}

function validate() {
  const value = 100;
  return value > 0;
}
EOT_NESL_mv1
#!END_NESL_mv1

#!NESL [@three-char-SHA-256: mv2]
action = "file_replace_text"
path = "/tmp/t_file-replace-text-multiple-identical-values/app.js"
old_text = <<'EOT_NESL_mv2'
  const value = 100;
EOT_NESL_mv2
new_text = <<'EOT_NESL_mv2'
  const value = 999;
EOT_NESL_mv2
#!END_NESL_mv2
```

```json
{
  "success": false,
  "error": "file_replace_text: old_text appears 2 times, must appear exactly once"
}
```

### 017-file-replace-text-section-not-found

```sh nesl
#!NESL [@three-char-SHA-256: sn1]
action = "file_write"
path = "/tmp/t_file-replace-text-section-not-found/readme.md"
content = <<'EOT_NESL_sn1'
# Project README

This is a sample project.

## Installation

Run the following command:
- npm install

## Usage

Start the application with:
- npm start
EOT_NESL_sn1
#!END_NESL_sn1
```

```sh nesl
#!NESL [@three-char-SHA-256: sn2]
action = "file_replace_text"
path = "/tmp/t_file-replace-text-section-not-found/readme.md"
old_text = <<'EOT_NESL_sn2'
## Configuration

Configure the app by editing config.json
EOT_NESL_sn2
new_text = <<'EOT_NESL_sn2'
## Configuration

Configure the app by editing settings.yaml
EOT_NESL_sn2
#!END_NESL_sn2
```

```json
{
  "success": false,
  "error": "file_replace_text: old_text not found in file"
}
```