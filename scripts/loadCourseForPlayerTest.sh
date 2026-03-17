#!/usr/bin/env bash
set -euo pipefail

# ===== CONFIG =====
TEST_CONFIG_DIR="apps/cc-cmi5-player/src/test"
# ==================

usage() {
  echo "Usage: $0 [path-to-published-course.zip] [lessonIndex]"
  echo ""
  echo "  [path-to-published-course.zip]  Path to the zip exported from the editor (default: ~/Downloads/sandbox.zip)"
  echo "  [lessonIndex]                   Zero-based index of the lesson to load (default: 0)"
  echo ""
  echo "Example:"
  echo "  $0"
  echo "  $0 ~/Downloads/sandbox.zip"
  echo "  $0 ~/Downloads/sandbox.zip 1"
  exit 1
}

COURSE_ZIP="${1:-$HOME/Downloads/sandbox.zip}"
LESSON_INDEX="${2:-0}"

if [ ! -f "$COURSE_ZIP" ]; then
  echo "❌ File not found: $COURSE_ZIP"
  exit 1
fi

# Extract to a temp dir
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

echo "▶ Extracting $COURSE_ZIP..."
unzip -q "$COURSE_ZIP" -d "$TMP_DIR"

# Locate all config.json files under compiled_course/blocks/<course>/<lesson>/
mapfile -t CONFIG_FILES < <(find "$TMP_DIR/compiled_course/blocks" -mindepth 3 -maxdepth 3 -name "config.json" 2>/dev/null | sort)

if [ ${#CONFIG_FILES[@]} -eq 0 ]; then
  echo "❌ No config.json found in compiled_course/blocks/<course>/<lesson>/"
  echo "   Zip structure may be unexpected. Contents:"
  ls "$TMP_DIR"
  exit 1
fi

if [ "$LESSON_INDEX" -ge "${#CONFIG_FILES[@]}" ]; then
  echo "❌ lessonIndex $LESSON_INDEX out of range (found ${#CONFIG_FILES[@]} lesson(s))"
  for i in "${!CONFIG_FILES[@]}"; do
    echo "  [$i] ${CONFIG_FILES[$i]#"$TMP_DIR/"}"
  done
  exit 1
fi

SELECTED="${CONFIG_FILES[$LESSON_INDEX]}"
LESSON_PATH="${SELECTED#"$TMP_DIR/"}"

echo "▶ Loading lesson config ($LESSON_PATH)..."
mkdir -p "$TEST_CONFIG_DIR"
cp -f "$SELECTED" "$TEST_CONFIG_DIR/config.json"

echo "✅ Done!"
echo "📄 $TEST_CONFIG_DIR/config.json updated from: $LESSON_PATH"

if [ ${#CONFIG_FILES[@]} -gt 1 ]; then
  echo ""
  echo "ℹ️  ${#CONFIG_FILES[@]} lessons found. Run with a different index to switch:"
  for i in "${!CONFIG_FILES[@]}"; do
    echo "  [$i] ${CONFIG_FILES[$i]#"$TMP_DIR/"}"
  done
fi
