#!/usr/bin/env bash
set -euo pipefail

# ===== CONFIG =====
APP_NAME="cc-cmi5-player"
DIST_DIR="dist/apps/$APP_NAME"
ZIP_NAME="$APP_NAME.zip"
TARGET_DIR="apps/rapid-cmi5-electron-frontend/src/assets"
# ==================

echo "▶ Building $APP_NAME..."
npx nx build "$APP_NAME"

echo "▶ Zipping build output..."
cd "$DIST_DIR"
zip -r "$ZIP_NAME" .
cd - > /dev/null

echo "▶ Copying zip to Electron assets..."
mkdir -p "$TARGET_DIR"
cp -f "$DIST_DIR/$ZIP_NAME" "$TARGET_ZIP"

echo "✅ Done!"
echo "📦 $TARGET_DIR/$ZIP_NAME"
