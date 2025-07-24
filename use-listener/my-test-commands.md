📋 Copied to clipboard

=== LOAF RESULTS ===
wa1 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/fs-ops/test/integration/write_action_result.test.ts
wa2 ✅ file_replace_all_text /Users/stuart/repos/loaf/proj/comp/fs-ops/test/integration/write_action_result.test.ts
wc1 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/fs-ops/test/integration/write_result_contents.test.ts
wc2 ✅ file_replace_all_text /Users/stuart/repos/loaf/proj/comp/fs-ops/test/integration/write_result_contents.test.ts
wr1 ✅ file_replace_text /Users/stuart/repos/loaf/proj/comp/fs-ops/test/integration/write_replace_result_contents.test.ts
wr2 ✅ file_replace_all_text /Users/stuart/repos/loaf/proj/comp/fs-ops/test/integration/write_replace_result_contents.test.ts
tc1 ✅ file_write /Users/stuart/repos/loaf/tsconfig.base.json
=== END ===

#!/bin/bash
# Fix for write_action_result.test.ts

#!nesl [@three-char-SHA-256: wa1]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/test/integration/write_action_result.test.ts"
old_text = <<'EOT_wa1'
import { readFileSync, rmSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';
import { parseNeslResponse } from '../../../nesl-action-parser/src/index.js';
import { executeFileOperation } from '../../src/index.js';
EOT_wa1
new_text = <<'EOT_wa1'
import { readFileSync, rmSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';
import { parseNeslResponse } from '../../../nesl-action-parser/src/index.js';
import { FsOpsExecutor } from '../../src/index.js';
import type { FsGuard } from '../../../fs-guard/src/index.js';

// Mock FsGuard that allows all operations
const mockGuard: FsGuard = {
  async check(action) {
    return { allowed: true };
  }
};

const executor = new FsOpsExecutor(mockGuard);
EOT_wa1
#!end_wa1

#!nesl [@three-char-SHA-256: wa2]
action = "file_replace_all_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/test/integration/write_action_result.test.ts"
old_text = "executeFileOperation"
new_text = "executor.execute"
#!end_wa2

# Fix for write_result_contents.test.ts

#!nesl [@three-char-SHA-256: wc1]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/test/integration/write_result_contents.test.ts"
old_text = <<'EOT_wc1'
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, rmSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';
import { parseNeslResponse } from '../../../nesl-action-parser/src/index.js';
import { executeFileOperation } from '../../src/index.js';
EOT_wc1
new_text = <<'EOT_wc1'
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, rmSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';
import { parseNeslResponse } from '../../../nesl-action-parser/src/index.js';
import { FsOpsExecutor } from '../../src/index.js';
import type { FsGuard } from '../../../fs-guard/src/index.js';

// Mock FsGuard that allows all operations
const mockGuard: FsGuard = {
  async check(action) {
    return { allowed: true };
  }
};

const executor = new FsOpsExecutor(mockGuard);
EOT_wc1
#!end_wc1

#!nesl [@three-char-SHA-256: wc2]
action = "file_replace_all_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/test/integration/write_result_contents.test.ts"
old_text = "executeFileOperation"
new_text = "executor.execute"
#!end_wc2

# Fix for write_replace_result_contents.test.ts

#!nesl [@three-char-SHA-256: wr1]
action = "file_replace_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/test/integration/write_replace_result_contents.test.ts"
old_text = <<'EOT_wr1'
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, rmSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';
import { parseNeslResponse } from '../../../nesl-action-parser/src/index.js';
import { executeFileOperation } from '../../src/index.js';
EOT_wr1
new_text = <<'EOT_wr1'
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, rmSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';
import { parseNeslResponse } from '../../../nesl-action-parser/src/index.js';
import { FsOpsExecutor } from '../../src/index.js';
import type { FsGuard } from '../../../fs-guard/src/index.js';

// Mock FsGuard that allows all operations
const mockGuard: FsGuard = {
  async check(action) {
    return { allowed: true };
  }
};

const executor = new FsOpsExecutor(mockGuard);
EOT_wr1
#!end_wr1

#!nesl [@three-char-SHA-256: wr2]
action = "file_replace_all_text"
path = "/Users/stuart/repos/loaf/proj/comp/fs-ops/test/integration/write_replace_result_contents.test.ts"
old_text = "executeFileOperation"
new_text = "executor.execute"
#!end_wr2

# Fix the tsconfig.json issue

#!nesl [@three-char-SHA-256: tc1]
action = "file_write"
path = "/Users/stuart/repos/loaf/tsconfig.base.json"
content = <<'EOT_tc1'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
EOT_tc1
#!end_tc1