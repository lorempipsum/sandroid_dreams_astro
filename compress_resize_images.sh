#!/bin/bash

# Directory containing the images
IMAGE_DIR="/home/sandroid/repos/sandroid_dreams_astro/src/images/photography/bristol"
# Temporary directory
TEMP_DIR="/home/sandroid/repos/sandroid_dreams_astro/src/images/photography/bristol/temp"

# Create temp directory if it doesn't exist
mkdir -p "$TEMP_DIR"

# Counter for processed images
count=0

# Process each webp image in the directory
for img in "$IMAGE_DIR"/*.webp; do
  if [ -f "$img" ]; then
    filename=$(basename "$img")
    echo "Processing $filename..."
    
    # Resize to max width 1920px and compress to temporary location
    convert "$img" -resize "1920x>" -quality 85 "$TEMP_DIR/$filename"
    
    # Replace original with compressed version
    mv "$TEMP_DIR/$filename" "$img"
    
    count=$((count+1))
  fi
done

# Clean up
rmdir "$TEMP_DIR"

echo "Finished processing and replacing $count images."
