
#!/bin/bash
# https://claude.ai/chat/89fcf145-9202-4b4f-84db-322ae77a5449
# https://chatgpt.com/c/687f8e06-9f44-8324-b817-4536ca8c3b9c

output_file="snapshot_selections.txt"
copy_files_mode=false

# Check for flag
if [[ "$1" == "p" ]]; then  # p for paths
  copy_files_mode=true
fi

file_list=$(cat <<'EOF'

use-listener/test-listener-live.ts use-listener/my-test-commands.md proj/comp/listener/src/formatters.ts proj/comp/listener/src/listener.ts replacer/replacer_llm_instructions.md

/Users/stuart/repos/loaf/replacer/replacer_llm_instructions.md

EOF
)

# Extract, split, deduplicate while preserving order
# Normalize to absolute paths, then dedupe while preserving order
unique_files=$(echo "$file_list" | tr ' \n' '\n' | grep -v '^$' | xargs -I{} realpath "{}" | awk '!seen[$0]++')


# Count files
file_count=$(echo "$unique_files" | wc -l | tr -d ' ')

if $copy_files_mode; then
  # Copy the list of file paths directly to clipboard
  echo "$unique_files" | xargs -I{} realpath "{}" | pbcopy
  echo "📋 Copied list of $file_count file paths to clipboard."
else
  echo "$unique_files" | while read -r file; do
    {
      echo "=== START FILE: $file ==="
      cat "$file"
      echo
      echo "=== END FILE: $file ==="
      echo
    }
  done | tee "$output_file" | pbcopy
  echo "✅ Concatenated $file_count files into $output_file"
fi


# /Users/stuart/repos/loaf/replacer/replacer_llm_instructions.md
# /Users/stuart/repos/loaf/xd5_ref.md
# /Users/stuart/repos/loaf/unified-design.yaml
# # # # # # # # proj/comp/listener/src/errors.ts proj/comp/listener/src/formatters.ts proj/comp/listener/src/index.ts proj/comp/listener/src/listener.ts proj/comp/listener/src/types.ts proj/comp/listener/src/utils.ts proj/comp/listener/doc/ABSTRACT.md proj/comp/listener/doc/API.md proj/comp/listener/doc/ARCH.md proj/comp/listener/test/integration/listener-workflow.test.ts proj/comp/listener/test-data/integration/listener-workflow.md proj/comp/listener/test-data/startListener.json replacer/replacer_llm_instructions.md xd5_ref.md



# # # # # # # # /Users/stuart/repos/loaf/proj/comp/nesl-action-parser/doc/ABSTRACT.md
# # # # # # # # /Users/stuart/repos/loaf/proj/comp/nesl-action-parser/doc/API.md
# # # # # # # # /Users/stuart/repos/loaf/proj/comp/nesl-action-parser/doc/ARCH.md

# # # # # # # # /Users/stuart/repos/loaf/proj/comp/fs-ops/doc/ABSTRACT.md
# # # # # # # # /Users/stuart/repos/loaf/proj/comp/fs-ops/doc/API.md
# # # # # # # # /Users/stuart/repos/loaf/proj/comp/fs-ops/doc/ARCH.md

# # # # # # # # /Users/stuart/repos/loaf/proj/doc/API.md
# # # # # # # # /Users/stuart/repos/loaf/proj/doc/ARCH.md
# # # # # # # # /Users/stuart/repos/loaf/proj/doc/TODO.md
