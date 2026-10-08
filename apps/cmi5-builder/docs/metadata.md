# Course metadata

Pass a YAML file explicitly with `--course-meta`; the builder does not discover it automatically.

```bash
npm run cmi5-builder:run -- --args="build ./my-course ./dist/apps/cc-cmi5-player --convert --course-meta ./my-course/course_meta.yaml --zip ./cmi5.zip"
```

```yaml
courseBaseId: https://example.org/courses/greyspace
courseDescription: Greyspace engineering training.
courseTheme:
  contentWidth: large
  blockPadding: small
  light:
    palette:
      primary:
        main: '#315A96'
```

`courseTheme` is stored in `RC5.yaml` and supports the fields in [`ThemeSchema`](../../../packages/common/src/lib/types/ui/theme.ts): layout, alignment, logo paths, and light/dark MUI theme overrides. `contentWidth` accepts `none`, `small`, `medium`, or `large`.

Other overrides:

| Field                  | Effect                                                                          |
| ---------------------- | ------------------------------------------------------------------------------- |
| `courseName`           | Sets the course title and block names.                                          |
| `completionExam: true` | Adds a final “Complete” question to the last AU.                                |
| `scenarioOverride`     | Adds a scenario slide to every AU; `uuid` and `name` set its scenario identity. |
