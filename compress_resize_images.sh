#!/bin/bash

# Recursively compress and resize images under src/images.
# Only processes an image if its width is greater than 1920px.

IMAGE_DIR="src/images"
MAX_WIDTH=1920
QUALITY=85

# Find supported image types recursively
find "$IMAGE_DIR" -type f \( -iname '*.webp' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -print0 |
while IFS= read -r -d '' img; do
    width=$(identify -format "%w" "$img" 2>/dev/null)
    if [ -z "$width" ]; then
        echo "Skipping $img (unable to determine width)"
        continue
    fi

    if [ "$width" -le "$MAX_WIDTH" ]; then
        echo "Skipping $img (width $width <= $MAX_WIDTH)"
        continue
    fi

    echo "Processing $img (width $width > $MAX_WIDTH)..."
    mogrify -resize "${MAX_WIDTH}x>" -quality "$QUALITY" "$img"

done

echo "Finished processing images."
