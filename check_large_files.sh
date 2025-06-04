#!/bin/bash

# Fail if any file larger than 2MB exists in the repo (excluding node_modules and dist)

LARGE_FILES=$(find . -type f -size +2M \
  -not -path './node_modules/*' \
  -not -path './dist/*' \
  -not -path './.git/*' \
  -not -path './src/assets/bristol-data/*' \
  -not -path './public/bristol-data/*' \
  -not -path './src/content/*' \
  -not -path './src/data/*' \
  -not -path './src/images/*' \
  -not -path './src/assets/svg/*')

if [ -n "$LARGE_FILES" ]; then
    echo "Error: Found files larger than 2MB:" >&2
    echo "$LARGE_FILES" >&2
    exit 1
fi

echo "✓ No files larger than 2MB found"
exit 0
