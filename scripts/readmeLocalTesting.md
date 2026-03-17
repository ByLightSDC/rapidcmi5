## Local Player Testing Scripts

Three npm scripts for quickly testing a published lesson in the player locally.

### Scripts

**`npm run build-and-test-player [zip] [lessonIndex]`**
Runs both steps below in sequence. The recommended entry point.

**`npm run build:player-for-editor`**
Builds the CMI5 player and deploys it into the editor.

**`npm run load:course-for-test [zip] [lessonIndex]`**
Extracts a published course `.zip` and copies the selected lesson's `config.json` into `apps/cc-cmi5-player/src/test/` so the player dev server picks it up.

### Usage

1. Export/publish a course from the editor (produces a `.zip`)
2. Run:
   ```sh
   npm run build-and-test-player ~/Downloads/sandbox.zip
   ```
   Or to test a specific lesson (zero-based index):
   ```sh
   npm run build-and-test-player ~/Downloads/sandbox.zip 1
   ```
3. Start the player dev server as usual

**Defaults:** zip = `~/Downloads/sandbox.zip`, lessonIndex = `0`
