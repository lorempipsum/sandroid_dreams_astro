#!/bin/bash

# Check if path argument is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <directory_path>"
    exit 1
fi

# Validate path exists
if [ ! -d "$1" ]; then
    echo "Error: Directory '$1' does not exist"
    exit 1
fi

# Function to process filename
process_file() {
    local file dir base newbase
    file="$1"
    dir=$(dirname "$file")
    base=$(basename "$file")
    newbase="${base// /_}"
    
    if [ "$base" != "$newbase" ]; then
        local newpath="$dir/$newbase"
        mv -v "$file" "$newpath"
    fi
}

# Find and process all files recursively
export -f process_file
find "$1" -type f -name "* *" -exec bash -c 'process_file "$0"' {} \;

echo "Filename cleanup complete!"