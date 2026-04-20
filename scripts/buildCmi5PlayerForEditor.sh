#!/usr/bin/env bash
set -euo pipefail

# ===== CONFIG =====
APP_NAME="cc-cmi5-player"
DIST_DIR="dist/apps/$APP_NAME"
ZIP_NAME="$APP_NAME.zip"
TARGET_DIR="apps/rapid-cmi5-electron-frontend/src/assets"
TARGET_ZIP="$TARGET_DIR/$ZIP_NAME"
# ==================

echo "▶ Building $APP_NAME..."
npx nx build "$APP_NAME"

# echo "▶ Removing old zip (if any)..."
# rm -f "$DIST_DIR/$ZIP_NAME"
# rm -f "$TARGET_ZIP"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "▶ Zipping build output..."
(
  cd "$DIST_DIR"
  if command -v zip &>/dev/null; then
    zip -r "$ZIP_NAME" .
  else
    # Fallback for Windows (Git Bash without zip)
    # Compress-Archive uses backslash path separators which break JSZip path parsing,
    # so use Node + JSZip to produce a zip with forward-slash paths instead.
    node "$REPO_ROOT/scripts/_buildZip.cjs" "$(pwd)" "$ZIP_NAME"
  fi
)

echo "▶ Copying zip to Electron assets (override)..."
mkdir -p "$TARGET_DIR"
cp -f "$DIST_DIR/$ZIP_NAME" "$TARGET_ZIP"

echo "✅ Done!"
echo "📦 Replaced: $TARGET_ZIP"
