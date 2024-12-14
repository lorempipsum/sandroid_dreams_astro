#!/bin/bash
# filepath: check-filenames.sh

# Find any file with spaces in the name
files_with_spaces=$(find . -type f -name "* *" -not -path "./node_modules/*" -not -path "./dist/*")

if [ -n "$files_with_spaces" ]; then
    echo "Error: Found files with spaces in their names:"
    echo "$files_with_spaces"
    echo "Please rename these files to use underscores or hyphens instead of spaces."
    exit 1
fi

echo "✓ No files with spaces found in names"
exit 0