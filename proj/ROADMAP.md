

loaf-cli 


FIVE things i want to finish before release 


- fs permissions - read/write allowlist/denylist
- tools allowlist (to block cmd line stuff for file security)

- LLM instructions generator (based on tools allowlist)

X hooks for custom git etc before and after executions


- npx run usage
- settings file loaf.yaml - hooks, fs permissions 

LATER:


- search/replace by range file_replace_text_range
- copy paste mode 
    - include clipboard watcher to automatically execute outputs that have been copied and then if user copies "nesl" 
- git squash stuff
    
----


? loaf init -- create the loaf.yaml file with file permissions based on cwd
    i think this has been done already by claude? 


-----

TODO:

- allow case insensitive tool action names.  too hard to read evyerthing now in LLM raw output

- the error message should also show the intended file path
```
e5f ✅ file_write /Users/stuart/repos/loaf/proj/comp/hooks/src/interpolateCommand.ts
a1b ❌ FILE_WRITE ERROR: Unknown action: FILE_WRITE (line 25)

...

#!nesl [@three-char-SHA-256: a1b]
action = "FILE_WRITE"
path = "/Users/stuart/repos/loaf/proj/comp/hooks/src/formatHookResult.ts"
content = <<'EOT_a1b'
import type { CommandResult, HookResult } from './types.js';
```

---

- tell the LLM about how to read the pasted files snapshot.  it tries to find the specific file then gets confused. waste of time/tokens
```
Let me first check what's currently in the index.ts file and then implement the HooksManager:Analyzed dataView analysisjavascript// Check current index.ts
const indexContent = await window.fs.readFile('/Users/stuart/repos/loaf/proj/comp/hooks/src/index.ts', { encoding: 'utf8' });
console.log("Current index.ts:");
console.log(indexContent);
OutputResult

ErrorError

File not found: No file named "/Users/stuart/repos/loaf/proj/comp/hooks/src/index.ts"Let me check the paste content for the index.ts file. I can see it has the skeleton but no implementation.
```

- the /Users/stuart/repos/loaf/use-listener/test-listener-live.ts script is VERY SLOW TO USE!!! SLOW AT SAVING FILES!!! wtf why??? and i want it to prepend results to the input file AS EACH ITEM SUCCEEDS.  dont wait for the whole thing. and our debug needs more outputs for exec stuff.  show the whole stdout etc

---

claude is really bad at using numbered file reads.  it keeps requesting line ranges for numbered file reads that are totally stupid and terrible.  but then it never actually uses the replace by lines number function anyway.  it thinks about stuff per section.  need to give it that capability in search/repalce