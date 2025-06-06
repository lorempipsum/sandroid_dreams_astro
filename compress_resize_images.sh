#!/bin/bash

# Recursively compress and resize images under src/images.
# Converts all images to .webp format and deletes original files.
# Only resizes images if their width is greater than 1920px.

IMAGE_DIR="src/images"
MAX_WIDTH=1920
QUALITY=85

# Find supported image types recursively
find "$IMAGE_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) -print0 |
while IFS= read -r -d '' img; do
    width=$(identify -format "%w" "$img" 2>/dev/null)
    if [ -z "$width" ]; then
        echo "Skipping $img (unable to determine width)"
        continue
    fi

    # Get file extension and base name
    extension="${img##*.}"
    base_name="${img%.*}"
    webp_file="${base_name}.webp"

    # Skip if already webp and width is acceptable
    if [[ "${extension,,}" == "webp" ]] && [ "$width" -le "$MAX_WIDTH" ]; then
        echo "Skipping $img (already webp and width $width <= $MAX_WIDTH)"
        continue
    fi

    echo "Processing $img (width $width)..."
    
    # Convert to webp with resize and compression
    if [ "$width" -gt "$MAX_WIDTH" ]; then
        convert "$img" -resize "${MAX_WIDTH}x>" -quality "$QUALITY" "$webp_file"
    else
        convert "$img" -quality "$QUALITY" "$webp_file"
    fi
    
    # Delete original file if conversion was successful and it's not already webp
    if [ -f "$webp_file" ] && [[ "${extension,,}" != "webp" ]]; then
        echo "Deleting original: $img"
        rm "$img"
    fi

done

echo "Finished processing images."
