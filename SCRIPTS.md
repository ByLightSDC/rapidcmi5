# Root Package Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `pretty` | `npm run pretty` | Runs Prettier to format all JS/TS/JSON files across the repo. |
| `bp` | `npm run bp` | Runs the player-replacer utility (`utils/player-replacer.js`). Copies the built player bundle into the editor. |
| `build:player-for-editor` | `npm run build:player-for-editor` | Builds the `cc-cmi5-player` app, zips the output, and copies it into the Electron frontend's assets (`apps/rapid-cmi5-electron-frontend/src/assets/cc-cmi5-player.zip`). When you publish a course from the **browser-based editor**, that zip is fetched and bundled directly into the exported `course.zip` — so the published course will contain this just-built player. Note: the packaged **Electron desktop app** uses a separate pre-extracted `cc-cmi5-player-dist` baked in at Electron build time; this script does not update that. |
| `load:course-for-test` | `npm run load:course-for-test [path-to.zip] [lessonIndex]` | Extracts a published course zip (defaults to `~/Downloads/sandbox.zip`) and copies the selected lesson's `config.json` into the player's test config directory so the player dev server can load it. |
| `build-and-test-player` | `npm run build-and-test-player [path-to.zip] [lessonIndex]` | Combines `build:player-for-editor` and `load:course-for-test` in sequence. Builds and deploys the player to the editor, then loads a course config for local testing. |
| `cmi5-builder` | `npm run cmi5-builder` | Builds the `cmi5-builder` (editor) library via Nx. |
| `cmi5-player` | `npm run cmi5-player` | Builds the `cc-cmi5-player` standalone app via Nx. |
| `postinstall` | _(runs automatically after `npm install`)_ | Installs native Electron dependencies for the current platform via `electron-builder`. |

## Electron App Scripts (`nxe:*`)

| Script | Command | Description |
|--------|---------|-------------|
| `nxe:build:frontend` | `npm run nxe:build:frontend` | Production build of the Electron renderer (frontend) app. |
| `nxe:build:backend` | `npm run nxe:build:backend` | Production build of the Electron main process (backend). |
| `nxe:serve:frontend` | `npm run nxe:serve:frontend` | Dev server for the Electron renderer — hot reload for frontend changes. |
| `nxe:serve:backend` | `npm run nxe:serve:backend` | Dev server for the Electron main process. |
| `nxe:test:frontend` | `npm run nxe:test:frontend` | Runs tests for the Electron frontend. |
| `nxe:test:backend` | `npm run nxe:test:backend` | Runs tests for the Electron main process. |
| `nxe:package:app` | `npm run nxe:package:app` | Packages the Electron app without creating an installer (pre-package only). Useful for smoke-testing the packaged binary locally. |
| `nxe:make:app` | `npm run nxe:make:app` | Fully packages and creates a distributable installer for the Electron app. |
