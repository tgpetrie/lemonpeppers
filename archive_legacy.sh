#!/bin/bash
ARCHIVE_DIR="frontend/src/_archive"
COMP_DIR="frontend/src/components"

# Ensure archive folder exists
mkdir -p "$ARCHIVE_DIR"

echo "🔍 Searching for legacy files in $COMP_DIR ..."

# Move any *.bak or *.backup.jsx into archive
find "$COMP_DIR" -maxdepth 1 \( -name "*.bak" -o -name "*.backup.jsx" -o -name "*.jsx.backup" \) | while read -r file; do
  echo "📦 Archiving $file → $ARCHIVE_DIR/"
  git mv "$file" "$ARCHIVE_DIR"/ || true
done

echo "✅ Done. Run 'git commit -m \"Archive legacy backup components\"' to finalize."