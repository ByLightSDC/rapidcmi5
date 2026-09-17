#!/bin/bash

# This script builds and packages the most recent cmi5 builder and cmi5 player
# for use within the cmi5 gitlab component

set -e  # Exit immediately if a command exits with a non-zero status

# CONFIGURATION
IMAGE_NAME="${IMAGE_NAME:-registry.global.rangeos.engineering/components/cmi5/cmi5-builder}"
# Defaults to the tag pointing at HEAD; override for a revision build:
#   VERSION=v0.20.0-r3 ./scripts/create_cmi5_builder_release.sh
VERSION="${VERSION:-$(git describe --tags --exact-match 2>/dev/null || true)}"
if [ -z "$VERSION" ]; then
  echo "❌ No VERSION set and HEAD is not tagged. Set VERSION=vX.Y.Z and retry." >&2
  exit 1
fi
DIST_DIR="dist"
BUILD_DIR="apps/cmi5-builder"
IS_DEVELOP=false
PLATFORM="${PLATFORM:-linux/amd64}"

# Parse flags
while [[ $# -gt 0 ]]; do
  case $1 in
    --develop)
      IS_DEVELOP=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--develop]"
      exit 1
      ;;
  esac
done

echo "🔨 Building nx projects..."
npx nx build cc-cmi5-player
npx nx build cmi5-builder

echo "🧹 Cleaning previous dist..."
[ -d "$BUILD_DIR/dist" ] && rm -rf "$BUILD_DIR/dist"

echo "📁 Copying dist folder..."
cp -r "$DIST_DIR" "$BUILD_DIR/"

cd "$BUILD_DIR"

if [ "$IS_DEVELOP" = true ]; then
  TAG_VERSION="develop-${VERSION}"
  MOVING_TAG="develop"
else
  TAG_VERSION="${VERSION}"
  MOVING_TAG="latest"
fi

# --provenance/--sbom must be off: with Docker Desktop's containerd image store,
# buildx otherwise pushes an OCI image index with attestation entries, and the
# GitLab registry rejects it with "Invalid tag: missing manifest digest".
echo "🐳 Building and pushing Docker image with tags: ${MOVING_TAG}, ${TAG_VERSION}"
docker buildx build \
  --platform "$PLATFORM" \
  --provenance=false \
  --sbom=false \
  -t "${IMAGE_NAME}:${MOVING_TAG}" \
  -t "${IMAGE_NAME}:${TAG_VERSION}" \
  --push \
  .

echo "✅ Done!"
