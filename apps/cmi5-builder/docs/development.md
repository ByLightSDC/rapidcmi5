# Development

Run from the repository root:

```bash
npm run cmi5-builder:build
npm run cmi5-builder:test
node dist/apps/cmi5-builder/main.js --help
```

After a build, calling `dist/apps/cmi5-builder/main.js` directly avoids rebuilding through Nx on every run.

| Location                          | Purpose                                          |
| --------------------------------- | ------------------------------------------------ |
| `src/main.ts` and `src/commands/` | CLI entry point and command options.             |
| `src/build/convertFromMkdocs.ts`  | MkDocs navigation and content conversion.        |
| `src/build/buildCmi5.ts`          | Course distribution and `cmi5.xml` generation.   |
| `src/build/courseOverrides.ts`    | Course metadata, scenarios, and completion exam. |
| `src/build/outputs.ts`            | ZIP and Terraform output.                        |
| `src/services/`                   | OpenDash and Moodle integration.                 |
