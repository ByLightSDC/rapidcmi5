#!/bin/bash
set -e

# ===== CONFIG =====
# please put the location of your testing repo
PACK_OUTPUT_DIR="$HOME/Documents/rangeos-nx-rc5-migration"   # 👈 change this
# ==================

mkdir -p "$PACK_OUTPUT_DIR"

npx nx build cmi5-build-common
npx nx build rapid-cmi5-ui
npx nx build rapid-cmi5

cd ../dist/packages

cd common
COMMON_TGZ=$(npm pack)
cp "$COMMON_TGZ" "$PACK_OUTPUT_DIR/"
cd ..

cd ui
UI_TGZ=$(npm pack)
cp "$UI_TGZ" "$PACK_OUTPUT_DIR/"
cd ..

cd rapid-cmi5
RAPID_TGZ=$(npm pack)
cp "$RAPID_TGZ" "$PACK_OUTPUT_DIR/"
cd ..

echo "✅ npm packs copied to: $PACK_OUTPUT_DIR"
