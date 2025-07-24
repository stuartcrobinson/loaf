generate edit instructions to uncomment the 'before' and 'after' lines of `const STARTER_LOAF_YML` in this file below. 


```


==== proj/comp/orch/src/createStarterConfig.ts ====

import { writeFile } from 'fs/promises';
import { join } from 'path';

const STARTER_LOAF_YML = `# Loaf configuration
version: 1

hooks:
  # Uncomment and modify these examples as needed
  
  # before:
  #   - run: git stash --include-untracked
  #     continueOnError: false
  
  # after:
  #   - run: git add -A
  #   - run: git commit -m "\${COMMIT_MSG}"
  #     continueOnError: false
  #   - run: git push
  #     continueOnError: true
  #     timeout: 10000  # 10s for slow networks

# Variables available in commands
vars:
  COMMIT_MSG: "AI-assisted changes"
  # Add more variables as needed
`;

/**
 * Creates a starter loaf.yml file if it doesn't exist
 * @returns true if file was created, false if already exists
 */
export async function createStarterConfig(repoPath: string): Promise<boolean> {
  const configPath = join(repoPath, 'loaf.yml');
  
  try {
    await writeFile(configPath, STARTER_LOAF_YML, { flag: 'wx' });
    return true;
  } catch (error: any) {
    if (error.code === 'EEXIST') {
      return false;
    }
    throw error;
  }
}
```


-----


<<<EXPLANATION>>>

Uncomment the 'before' and 'after' hook examples in STARTER_LOAF_YML to provide users with ready-to-use hooks instead of just commented examples

<<<FILE>>>

proj/comp/orch/src/createStarterConfig.ts

<<<SEARCH>>>
  # before:
  #   - run: git stash --include-untracked
  #     continueOnError: false
  
  # after:
  #   - run: git add -A
  #   - run: git commit -m "\${COMMIT_MSG}"
  #     continueOnError: false
  #   - run: git push
  #     continueOnError: true
  #     timeout: 10000  # 10s for slow networks
<<<REPLACE>>>
  before:
    - run: git stash --include-untracked
      continueOnError: false
  
  after:
    - run: git add -A
    - run: git commit -m "\${COMMIT_MSG}"
      continueOnError: false
    - run: git push
      continueOnError: true
      timeout: 10000  # 10s for slow networks
<<<END>>>