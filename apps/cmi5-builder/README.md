# 🛡️ CMI5 Builder

The **CMI5 Builder** is a CLI tool designed to convert MkDocs-based courses into CMI5-compliant packages. It leverages existing types used in the CMI5 Player and Rapid CMI5 tools to automatically generate course files, configuration, and mappings required for deployment to LMS platforms like Moodle or OpenDash.

---

## Local npm workflow

Run these commands from the repository root. Install dependencies with `npm ci`, then build the player once before packaging a course. The builder writes course files into the player distribution passed as its second path argument.
For `--convert`, the course folder must contain `mkdocs.yml` or `mkdocs.yaml` and the files referenced by its `nav` section.

MkDocs navigation controls the converted course structure: Markdown leaves become slides, each leaf's immediate parent becomes its AU, and the higher navigation labels identify a block. Because CMI5 blocks are flat, the builder joins multiple higher labels in the block name. A Markdown leaf with no named parent uses the course title as its AU. Block groupings appear in `cmi5.xml`; on disk, each AU sits directly in `compiled_course/blocks/<au>/` so it can load `../RC5.yaml`. Shared MkDocs assets go in `compiled_course/blocks/_assets/`. The builder copies only Markdown pages listed in `nav`.

```bash
npm run cmi5-player
npm run cmi5-builder:run -- --args="build ./courses/my-course ./dist/apps/cc-cmi5-player --zip ./cmi5.zip"
```

`cmi5-builder:run` is an Nx target that builds the builder and then runs its CLI. npm's first `--` passes the following option to Nx; Nx's `--args` forwards the quoted command and options to the builder. [npm documents the `--` separator](https://docs.npmjs.com/cli/commands/npm-run/), and [Nx documents `--args` forwarding](https://nx.dev/docs/kb/pass-args-to-commands).

To build or test the builder without running a course command:

```bash
npm run cmi5-builder:build
npm run cmi5-builder:test
```

To see the builder's own command options:

```bash
npm run cmi5-builder:run -- --args="--help"
npm run cmi5-builder:run -- --args="build --help"
```

For repeated runs after a build, call the compiled CLI directly and skip the Nx build step:

```bash
node dist/apps/cmi5-builder/main.js build ./courses/my-course ./dist/apps/cc-cmi5-player --zip ./cmi5.zip
```

The CLI also provides `build-opendash`, `build-moodle`, and `generate-au-terraform`. For example:

```bash
npm run cmi5-builder:run -- --args="generate-au-terraform ./courses ./au_mapping.tf.json"
npm run cmi5-builder:run -- --args="build-opendash ./courses/my-course ./dist/apps/cc-cmi5-player https://dash.example.test --zip ./cmi5.zip"
npm run cmi5-builder:run -- --args="build-moodle ./courses/my-course ./dist/apps/cc-cmi5-player https://moodle.example.test --zip ./cmi5.zip"
```

Upload commands require the credentials described below. `build` supports `--course-meta`, `--convert`, `--generate-tf`, and `--apply-au-mappings`; inspect each command's `--help` for its exact options.

# build

### 🧰 Generate a CMI5 Course Zip and Terraform AU Mappings

This creates a course ZIP and a Terraform AU mapping file at the paths provided. Omit either option if you do not need that output.

```bash
npm run cmi5-builder:run -- --args="build ./courses/my-course ./dist/apps/cc-cmi5-player --zip ./cmi5.zip --generate-tf ./au_mapping.tf.json"
```

# build-opendash

### ☁️ Upload to OpenDash PCTE

You will need to provide a PCTE JWT named JWT_OPENDASH

```bash
npm run cmi5-builder:run -- --args="build-opendash ./courses/my-course ./dist/apps/cc-cmi5-player https://dash.example.test --zip ./cmi5.zip"
```

### ☁️ with AU Mappings

You will need to provide a PCTE JWT named JWT_DEVOPS_API, this will be the same JWT value as the one above, but it needs a seperate name

```bash
npm run cmi5-builder:run -- --args="build-opendash ./courses/my-course ./dist/apps/cc-cmi5-player https://dash.example.test --apply-au-mappings https://rangeos-api.example.test --zip ./cmi5.zip"
```

### ☁️ Upload to OpenDash V9 (Develop)

```bash
npm run cmi5-builder:run -- --args="build-opendash ./courses/my-course ./dist/apps/cc-cmi5-player https://dash.example.test --use-real-auid --apply-au-mappings https://rangeos-api.example.test --zip ./cmi5.zip"
```

# build-moodle

### ☁️ Upload to Moodle

You will need to provide a ENV called MOODLE_WS_TOKEN that is generated from moodle

steps to get a WS Token
Ensure a Service is created called cmi5-pipeline, if not

1. go to moodle site administration
2. Scroll to the bottom and go to webservices and click manage tokens
3. Click External Services
4. Click add under Custom services
5. Information here is whatever
6. Click add functions and select mod_cmi5launch_get_cmi5_course, mod_cmi5launch_upload_cmi5_course, mod_cmi5launch_update_cmi5_course

Once you have either created or ensured the service exists continue on to get the token

1. go to moodle site administration
2. Scroll to the bottom and go to webservices and click manage tokens
3. Click create a token
4. Name is whatever, choose admin for user, and choose the cmi5-pipeline service

```bash
npm run cmi5-builder:run -- --args="build-moodle ./courses/my-course ./dist/apps/cc-cmi5-player https://moodle.example.test --zip ./cmi5.zip"

```

---

## 🐳 Running with Docker

> The Docker container includes a prebuilt version of the CMI5 player.

### Build a course from a mounted volume

```bash
docker run -v ./os:/home/work/course cmi5-builder:0.0.1 build ../course/ ../player/ --zip
```

### Access the container to inspect or retrieve output

```bash
docker run -it \
  -v ./os:/home/work/course \
  -v ./cmi5-output:/home/work/builder/cmi5-output \
  --entrypoint bash cmi5-builder:0.0.1
```

---

## 📦 Quick Example: Basic Scenario Course

### 1. Setup

```bash
mkdir -p example/au1
```

### 2. `example/RC5.yaml`

```yaml
blocks:
  - blockName: Net Exam
    aus:
      - auName: au1
        assetsPath: ""
        backgroundImage: ""
        slides:
          - slideTitle: lab
            type: markdown
            filepath: example/au1/lab.md
        dirPath: example/au1
    blockDescription: ""
courseId: https://next-exam-ros.com
courseTitle: Net Exam
courseDescription: Net Exam.

```

### 3. `example/au1/lab.md`

:::scenario
```json
{
  "uuid": "uuid",
  "name": "net exam",
  "promptClass": true
}
```
:::

📁 Directory Overview

```
example/
├── RC5.yaml
└── au1/
    └── lab.md
```

With this you now have a mkdocs course which will have one scenario slide.

### 4. Build with Docker

```bash
docker run -it \
  -v ./example:/home/work/course \
  -v ./cmi5-output:/home/work/builder/cmi5-output \
  cmi5-builder:0.0.1 build ../course/ ../player/ --zip
```

---

## 🔐 Handling JWTs

If uploading to OpenDash, put in the `.env` file:

```env
JWT_OPENDASH=
JWT_DEVOPS_API=
```

Then:

```bash
docker run --env-file .env ...
```

Or pass directly:

```bash
docker run -e JWT_OPENDASH='your.jwt.token.here' ...
```

---

## 📈 `course_meta.yaml` Example

This file allows you to override course-wide metadata and inject scenario-wide settings:

```yaml
courseName: Test Upload OS Course 2
courseDescription: The OS course 2
courseBaseId: https://rangeos/courses/os
completionExam: true
scenarioOverride:
  introTitle: OS Student Workstations
  introContent: OS Student Workstations
  uuid: 230ab835-6fdc-422e-9915-ee7f0e0068c9
  promptClassId: true
```

The completion exam will allow you to add a quiz question at the last AU of a course which requires the user to enter in "Complete" in order to finish the course.
The scenario override will add in a scenario slide to every single AU in a course.

```bash
node ./dist/apps/cmi5-builder/main.js build-opendash ./os/ ./apps/cmi5-builder/dist/ https://dash.ent1.pcte.mil \
  --course-meta ./apps/cmi5-builder/course_meta.yaml \
  --apply-au-mappings https://rangeos-api.ent1.pcte.mil
```

---

## 🧠 Terminology

- **AU (Assignable Unit)**: A unit of content launched through OpenDash or Moodle.
- **Block**: A metadata grouping of AUs (currently only one block is used).
- **CMI5 Player**: The built React app (`cc-cmi5-player`) used to display AUs.
- **config.json**: AU-specific metadata in JSON format. This is read over the network by the CMI5 Player.
- **course.json**: Full course metadata (follows the `CourseData` type). This is used by CMI5 Builder and Rapid CMI5 and contains the config.json data for every AU.
- **cmi5.xml**: XML file containing CMI5-compliant metadata for the course, this is read by the LMS.
- **cmi5.zip**: Final package containing the player, AU data, XML, and assets.

---

## Source layout

`src/main.ts` is the CLI entry point. It registers the commands and loads environment variables.

Run the builder's unit tests with `npx nx test cmi5-builder`. This target uses Vitest.

| Location | Responsibility |
| --- | --- |
| `src/commands/` | Define CLI arguments and run the build, upload, and Terraform commands. |
| `src/build/buildCmi5.ts` | Build the course distribution and write `cmi5.xml`. |
| `src/build/courseOverrides.ts` | Apply optional course metadata, scenario slides, and completion exams. |
| `src/build/convertFromMkdocs.ts` | Convert MkDocs navigation and content into course data. |
| `src/build/outputs.ts` | Create ZIP files and Terraform AU mapping files. |
| `src/fileSystem/` | Read course folders into the shared folder structure. |
| `src/services/` | Upload courses and create remote AU mappings. |

The command handlers call `buildCmi5` for course generation, then invoke the output or upload helpers requested by the command options.
