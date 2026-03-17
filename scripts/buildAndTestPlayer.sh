#!/usr/bin/env bash
set -euo pipefail

# ===== CONFIG =====
DEFAULT_COURSE_ZIP="$HOME/Downloads/sandbox.zip"
# ==================

COURSE_ZIP="${1:-$DEFAULT_COURSE_ZIP}"
LESSON_INDEX="${2:-0}"

echo "========================================"
echo " Step 1: Build player + deploy to editor"
echo "========================================"
bash "$(dirname "$0")/buildCmi5PlayerForEditor.sh"

echo ""
echo "========================================"
echo " Step 2: Load course config for testing"
echo "========================================"
bash "$(dirname "$0")/loadCourseForPlayerTest.sh" "$COURSE_ZIP" "$LESSON_INDEX"
