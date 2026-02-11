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

echo "▶ Zipping build output..."
(
  cd "$DIST_DIR"
  zip -r "$ZIP_NAME" .
)

echo "▶ Copying zip to Electron assets (override)..."
mkdir -p "$TARGET_DIR"
cp -f "$DIST_DIR/$ZIP_NAME" "$TARGET_ZIP"

echo "✅ Done!"
echo "📦 Replaced: $TARGET_ZIP"
