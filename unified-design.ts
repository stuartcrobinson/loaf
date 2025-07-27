
export const NESL_SYNTAX_EXAMPLE = `\`\`\`sh nesl
#!nesl [@three-char-SHA-256: k7m]
action = "file_write"
path = "/tmp/\\"hello\\".txt"
content = <<'EOT_k7m'
Hello world!
how are you?
EOT_k7m
#!end_k7m
\`\`\``;

export const ActionDefinitions = {
  file_write: {
    type: 'write' as const,
    executor: 'fs-ops' as const,
    description: 'Create new file while creating any necessary parent dirs. overwrites if already exists',
    accessibility: ['llm'] as const,
    output_display: 'never' as const,
    primary_param: 'path' as const,
    parameters: {
      path: { type: 'string', required: true, format: 'absolute_path' },
      content: { type: 'string', required: true }
    },
    returns: { success: 'boolean', error: 'string?' }
  },
  
  file_replace_text: {
    type: 'write' as const,
    executor: 'fs-ops' as const,
    description: 'Replace first and only instance of substring in file. must exist only once',
    accessibility: ['llm'] as const,
    output_display: 'never' as const,
    primary_param: 'path' as const,
    parameters: {
      path: { type: 'string', required: true, format: 'absolute_path' },
      old_text: { type: 'string', required: true },
      new_text: { type: 'string', required: true }
    },
    returns: { success: 'boolean', replacements_made: 'integer?', error: 'string?' }
  },
  
  file_replace_text_range: {
    type: 'write' as const,
    executor: 'fs-ops' as const,
    description: 'Replace first and only instance of text range in file. must exist only once',
    accessibility: ['llm'] as const,
    output_display: 'never' as const,
    primary_param: 'path' as const,
    parameters: {
      path: { type: 'string', required: true, format: 'absolute_path' },
      old_text_beginning: { type: 'string', required: true },
      old_text_end: { type: 'string', required: true },
      new_text: { type: 'string', required: true }
    },
    returns: { success: 'boolean', replacements_made: 'integer?', error: 'string?' }
  },
  
  file_replace_all_text: {
    type: 'write' as const,
    executor: 'fs-ops' as const,
    description: 'Replace each matching substring in file. Number of matches (count) should usually be known and declared ahead of time.',
    accessibility: ['llm'] as const,
    output_display: 'never' as const,
    primary_param: 'path' as const,
    parameters: {
      path: { type: 'string', required: true, format: 'absolute_path' },
      old_text: { type: 'string', required: true },
      new_text: { type: 'string', required: true },
      count: { type: 'integer', required: false }
    },
    returns: { success: 'boolean', replacements_made: 'integer?', error: 'string?' }
  },

  files_replace_all_text: {
    type: 'write' as const,
    executor: 'fs-ops' as const,
    description: 'Replace all occurrences of substring in multiple files. Processes each file independently',
    accessibility: ['llm'] as const,
    parameters: {
      paths: { type: 'string', format: 'multiline_absolute_paths' },
      old_text: { type: 'string', required: true },
      new_text: { type: 'string', required: true }
    },
    returns: {
      success: 'boolean',
      results: {
        type: 'array',
        items: {
          path: 'string',
          replacements_made: 'integer',
          error: 'string?'
        }
      },
      error: 'string?'
    }
  },

  files_replace_text_in_parents: {
    type: 'write' as const,
    executor: 'fs-ops' as const,
    description: 'Replace all occurrences of substring in a given node of a parsed file that supports grouping, like markdown, code (ast), etc',
    accessibility: ['llm'] as const,
    parameters: {
      path: { type: 'string', required: true },
      parents: { type: 'string', required: true, format: 'multiline_absolute_paths' },
      old_text: { type: 'string', required: true },
      new_text: { type: 'string', required: true }
    },
    returns: { success: 'boolean', error: 'string?' }
  },

  file_append: {
    type: 'write' as const,
    executor: 'fs-ops' as const,
    description: 'Append to file',
    accessibility: ['llm'] as const,
    parameters: {
      path: { type: 'string', required: true, format: 'absolute_path' },
      content: { type: 'string', required: true }
    },
    returns: { success: 'boolean', error: 'string?' }
  },
  
  file_delete: {
    type: 'write' as const,
    executor: 'fs-ops' as const,
    description: 'Delete file',
    accessibility: ['llm'] as const,
    output_display: 'never' as const,
    primary_param: 'path' as const,
    parameters: {
      path: { type: 'string', required: true, format: 'absolute_path' }
    },
    returns: { success: 'boolean', error: 'string?' }
  },
  
  file_move: {
    type: 'write' as const,
    executor: 'fs-ops' as const,
    description: 'Move/rename file',
    accessibility: ['llm'] as const,
    output_display: 'never' as const,
    primary_param: 'old_path' as const,
    parameters: {
      old_path: { type: 'string', required: true, format: 'absolute_path' },
      new_path: { type: 'string', required: true, format: 'absolute_path' }
    },
    returns: { success: 'boolean', error: 'string?' }
  },

  file_read: {
    type: 'read' as const,
    executor: 'fs-ops' as const,
    description: 'Read single file content',
    accessibility: ['llm'] as const,
    output_display: 'always' as const,
    primary_param: 'path' as const,
    parameters: {
      path: { type: 'string', required: true, format: 'absolute_path' }
    },
    returns: { success: 'boolean', content: 'string?', error: 'string?' }
  },

  file_read_numbered: {
    type: 'read' as const,
    executor: 'fs-ops' as const,
    description: 'Read file content with line numbers for specified line range',
    accessibility: ['llm'] as const,
    output_display: 'always' as const,
    primary_param: 'path' as const,
    parameters: {
      path: { type: 'string', required: true, format: 'absolute_path' },
      lines: { type: 'string', required: false, description: "Line range: single '4' or range '23-43'. If omitted, reads all lines." },
      delimiter: { type: 'string', required: false, default: ': ', description: 'Delimiter between line number and content' }
    },
    returns: { success: 'boolean', content: 'string?', error: 'string?' }
  },

  file_replace_lines: {
    type: 'write' as const,
    executor: 'fs-ops' as const,
    description: 'Replace specified line range in file with new content',
    accessibility: ['llm'] as const,
    output_display: 'never' as const,
    primary_param: 'path' as const,
    parameters: {
      path: { type: 'string', required: true, format: 'absolute_path' },
      lines: { type: 'string', required: true, description: "Line range: single '4' or range '23-43'" },
      new_content: { type: 'string', required: true, description: 'Content to replace the line range with' }
    },
    returns: { success: 'boolean', lines_replaced: 'integer?', error: 'string?' }
  },

  files_read: {
    type: 'read' as const,
    executor: 'fs-ops' as const,
    description: 'Read and concatenate contents of multiple files into a single string, with clear file delimiters',
    accessibility: ['llm'] as const,
    output_display: 'always' as const,
    primary_param: 'paths' as const,
    parameters: {
      paths: {
        type: 'string',
        required: true,
        format: 'multiline_absolute_paths',
        description: 'One absolute file path per line. Empty lines are ignored.'
      }
    },
    returns: {
      success: 'boolean',
      data: {
        paths: 'array',
        content: 'array'
      },
      error: 'string?'
    },
    example: `paths: |
  /home/user/projects/src/main.py
  /home/user/projects/src/utils.py
  /home/user/projects/README.md`
  },
  
  dir_create: {
    type: 'write' as const,
    executor: 'fs-ops' as const,
    description: 'Create directory',
    accessibility: ['llm'] as const,
    output_display: 'never' as const,
    primary_param: 'path' as const,
    parameters: {
      path: { type: 'string', required: true, format: 'absolute_path' }
    },
    returns: { success: 'boolean', error: 'string?' }
  },
  
  dir_delete: {
    type: 'write' as const,
    executor: 'fs-ops' as const,
    description: 'Delete directory',
    accessibility: ['llm'] as const,
    output_display: 'never' as const,
    primary_param: 'path' as const,
    parameters: {
      path: { type: 'string', required: true, format: 'absolute_path' }
    },
    returns: { success: 'boolean', error: 'string?' }
  },
  
  ls: {
    type: 'read' as const,
    executor: 'fs-ops' as const,
    description: 'List directory contents',
    accessibility: ['llm'] as const,
    output_display: 'always' as const,
    primary_param: 'path' as const,
    parameters: {
      path: { type: 'string', required: true, format: 'absolute_path' }
    },
    returns: {
      success: 'boolean',
      data: {
        type: 'array',
        items: {
          name: 'string',
          type: 'string',
          size: 'integer',
          modified: 'timestamp'
        }
      },
      error: 'string'
    }
  },
  
  grep: {
    type: 'read' as const,
    description: 'Search pattern in files',
    accessibility: ['llm'] as const,
    output_display: 'always' as const,
    primary_param: 'pattern' as const,
    parameters: {
      pattern: { type: 'string', required: true },
      path: { type: 'string', required: true, format: 'absolute_path' },
      include: { type: 'string', required: false }
    },
    returns: {
      success: 'boolean',
      data: {
        type: 'array',
        items: {
          file: 'string',
          line_number: 'integer',
          line: 'string'
        }
      },
      error: 'string'
    }
  },
  
  glob: {
    type: 'read' as const,
    description: 'Find files matching pattern',
    accessibility: ['llm'] as const,
    output_display: 'always' as const,
    primary_param: 'pattern' as const,
    parameters: {
      pattern: { type: 'string', required: true },
      base_path: { type: 'string', required: true, format: 'absolute_path' }
    },
    returns: {
      success: 'boolean',
      data: {
        type: 'array',
        items: 'string'
      },
      error: 'string'
    }
  },
  
  exec: {
    type: 'dynamic' as const,
    description: 'Execute code',
    accessibility: ['llm'] as const,
    output_display: 'conditional' as const,
    primary_param: 'lang' as const,
    parameters: {
      code: { type: 'string', required: true },
      lang: { type: 'enum', values: ['python', 'javascript', 'bash'], required: true },
      version: { type: 'string', required: false },
      cwd: { type: 'string', required: false, format: 'absolute_path' },
      return_output: { type: 'boolean', required: false, default: true }
    },
    returns: { success: 'boolean', stdout: 'string?', stderr: 'string?', exit_code: 'integer?', error: 'string?' }
  },

  context_add: {
    type: 'meta' as const,
    description: 'Add item to working context (persistent)',
    accessibility: ['llm', 'user'] as const,
    parameters: {
      path: { type: 'string', required: true, format: 'absolute_path' }
    },
    returns: { success: 'boolean', error: 'string?' }
  },
  
  context_remove: {
    type: 'meta' as const,
    description: 'Remove item from working context',
    accessibility: ['llm', 'user'] as const,
    parameters: {
      path: { type: 'string', required: true, format: 'absolute_path' }
    },
    returns: { success: 'boolean', error: 'string?' }
  },
  
  context_list: {
    type: 'meta' as const,
    description: 'List items in working context',
    accessibility: ['llm', 'user'] as const,
    parameters: {},
    returns: {
      success: 'boolean',
      data: {
        type: 'array',
        items: {
          path: 'string',
          size: 'integer'
        }
      },
      error: 'string'
    }
  },
  
  context_prune: {
    type: 'meta' as const,
    description: 'Remove unused items from working context',
    accessibility: ['llm', 'user'] as const,
    parameters: {},
    returns: { success: 'boolean', removed: 'array of strings', error: 'string?' }
  },
  
  context_clear: {
    type: 'meta' as const,
    description: 'Clear all working context items',
    accessibility: ['llm', 'user'] as const,
    parameters: {},
    returns: { success: 'boolean', error: 'string?' }
  },
  
  git_squash: {
    type: 'git' as const,
    description: 'Squash commits',
    slash_command: true,
    parameters: {
      mode: { type: 'enum', values: ['auto_ai', 'ai_messages', 'hours', 'days', 'contiguous_only=true', 'msg_contains'], required: true },
      message: { type: 'string', required: false },
      hours: { type: 'integer', required: false, when: 'mode=hours' },
      days: { type: 'integer', required: false, when: 'mode=days' },
      msg_target: { type: 'string', required: false, when: 'mode=msg_contains' }
    },
    returns: { success: 'boolean', error: 'string?' }
  },
  
  undo: {
    type: 'git' as const,
    description: 'Undo last AI changes',
    accessibility: ['user'] as const,
    constraints: ['No changes since last AI operation'],
    parameters: {},
    returns: { success: 'boolean', error: 'string?' }
  },
  
  git_step_back: {
    type: 'git' as const,
    description: 'Move to previous commit',
    accessibility: ['user'] as const,
    behavior: 'Stashes untracked changes',
    parameters: {},
    returns: { success: 'boolean', stashed_files: 'array of strings', error: 'string?' }
  },
  
  git_step_forward: {
    type: 'git' as const,
    description: 'Move to next commit',
    accessibility: ['user'] as const,
    behavior: 'Attempts to pop stashed changes',
    parameters: {},
    returns: { success: 'boolean', conflicts: 'array of strings', error: 'string?' }
  }
} as const;

export const TransactionModel = {
  strategy: 'operation_group',
  conflict_detection: {
    methods: [
      'mtime comparison (fast but unreliable)',
      'checksum comparison (slower but accurate)',
      'git status check (catches git-tracked changes)'
    ],
    timing: [
      'Check immediately before operation group',
      'Check after each write operation',
      'Final check before commit'
    ]
  },
  implementation: [
    'Begin: git commit current state',
    'Execute: track all operations',
    'Validate: check for external modifications',
    'Success: git commit with summary',
    'Failure: git reset --hard to start'
  ],
  atomicity: 'none'
};

export const SecurityModel = {
  path_validation: {
    type: 'allowlist',
    allowed_roots: ['/home/user/projects', '/tmp/ai-coder'],
    blacklist_patterns: ['.*\\.ssh.*', '.*\\.git/config', '/etc/.*', '/sys/.*', '/proc/.*']
  },
  canonicalization: 'required'
};

export const SystemConfig = {
  encoding: 'utf-8',
  line_endings: 'preserve',
  max_file_size: 10485760,
  git_auto_push: false,
  commit_message_format: 'AI: {operation_summary}'
};

export type ActionName = keyof typeof ActionDefinitions;
export type ActionDef<T extends ActionName> = typeof ActionDefinitions[T];