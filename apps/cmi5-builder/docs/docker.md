# Docker

Build the image from the repository root after building the Nx targets:

```bash
npm ci
npm run cmi5-player
npm run cmi5-builder:build
docker build -f apps/cmi5-builder/Dockerfile -t cmi5-builder:local .
```

The image includes the player. Mount the course read-only and the output directory read-write:

```bash
COURSE_DIR=/absolute/path/to/my-course
mkdir -p ./cmi5-output
docker run --rm \
  --mount type=bind,source="$COURSE_DIR",target=/workspace/course,readonly \
  --mount type=bind,source="$(pwd)/cmi5-output",target=/output \
  cmi5-builder:local build /workspace/course /output/player \
  --convert --zip /output/cmi5.zip
```

Set `COURSE_DIR` to your course's absolute path. Add `--course-meta /workspace/course/course_meta.yaml` if that file exists. The entrypoint copies the bundled player into `/output/player` if it is missing. Use a fresh output directory after updating the player image.

## Published image

The [release workflow](../../../.github/workflows/release.yml) pushes `ghcr.io/bylightsdc/cmi5-builder:v<version>` and updates `:latest` for stable versions. It runs when a version tag starts the release pipeline, including while the GitHub Release is a draft. The compiled builder is passed between workflow jobs as a temporary artifact; it is not attached to the release.

The [internal registry script](../../../scripts/create_cmi5_builder_release.sh) remains available. Run it from the repository root.
