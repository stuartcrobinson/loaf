import { writeFile } from 'fs/promises';
import { join } from 'path';

const STARTER_LOAF_YML = `# Loaf configuration
version: 1

# File system guard configuration
fs-guard:
  # Allowed paths (supports glob patterns)
  # Relative paths are resolved from this config file's location
  allowed:
    - "./**"           # All files in project
    - "/tmp/**"        # Temporary files
  
  # Denied paths (more specific rules override less specific)
  denied:
    - "**/.git/**"     # Git internals
    - "**/.ssh/**"     # SSH keys
    - "**/node_modules/**"  # Dependencies
  
  # Whether to follow symlinks (default: false)
  followSymlinks: false

# Git hooks configuration
hooks:
  before: []
  after: []
  
  # Example hooks (uncomment to use):
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