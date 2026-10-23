# CMI5 Builder

Builds CMI5 courses from MkDocs content or an existing `RC5.yaml` course. Run commands from the repository root.

## Build a MkDocs course locally

```bash
npm ci
npm run cmi5-player
npm run cmi5-builder:run -- --args="build ./my-course ./dist/apps/cc-cmi5-player --convert --zip ./cmi5.zip"
```

`./my-course` must contain `mkdocs.yml` or `mkdocs.yaml`. The builder adds the course to the player distribution and writes `./cmi5.zip`. Add `--course-meta ./my-course/course_meta.yaml` to use course metadata.

To build the same MkDocs course and upload it to Moodle, set `MOODLE_WS_TOKEN` and run:

```bash
npm run cmi5-builder:run -- --args="build-moodle ./my-course ./dist/apps/cc-cmi5-player https://moodle.example.test --convert --zip ./cmi5.zip"
```

For command options:

```bash
npm run cmi5-builder:run -- --args="build --help"
```

## Guides

- [Course inputs and MkDocs conversion](docs/course-input.md)
- [Course metadata and theme](docs/metadata.md)
- [Docker build and run](docs/docker.md)
- [OpenDash, Moodle, and AU mappings](docs/integrations.md)
- [Development and tests](docs/development.md)
