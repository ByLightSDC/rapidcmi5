# Uploads and mappings

Build the player first with `npm run cmi5-player`. The examples below use `npm run cmi5-builder:run`, which builds the CLI before each invocation.

## OpenDash

Set both `JWT_OPENDASH` and `JWT_DEVOPS_API`; the upload command checks for both. Use `--convert` for MkDocs input.

```bash
npm run cmi5-builder:run -- --args="build-opendash ./my-course ./dist/apps/cc-cmi5-player https://dash.example.test --convert --zip ./cmi5.zip"
```

Add `--apply-au-mappings https://api.example.test` to create AU mappings. Add `--use-real-auid` for an OpenDash endpoint that accepts the generated AU ID.

## Moodle

Set `MOODLE_WS_TOKEN` for the Moodle web service used to upload CMI5 courses. Pass `--convert` to build a MkDocs course and upload the resulting ZIP in one command. Omit it for an existing RC5 course. You can also pass `--course-meta` to override course metadata before upload.

```bash
npm run cmi5-builder:run -- --args="build-moodle ./my-course ./dist/apps/cc-cmi5-player https://moodle.example.test --convert --zip ./cmi5.zip"
```

## Terraform AU mapping file

For one course, add `--generate-tf ./au_mapping.tf.json` to `build`. For a directory of existing RC5 courses:

```bash
npm run cmi5-builder:run -- --args="generate-au-terraform ./courses ./au_mapping.tf.json"
```
