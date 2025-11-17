# 🛡️ CMI5 Builder

The **CMI5 Builder** is a CLI tool designed to convert MkDocs-based courses into CMI5-compliant packages. It leverages existing types used in the CMI5 Player and Rapid CMI5 tools to automatically generate course files, configuration, and mappings required for deployment to LMS platforms like Moodle or OpenDash.

---

## 🚀 TL;DR

### 🏗️ Build the Player and Builder Scripts

```bash
npx nx build cmi5-builder --skip-nx-cache
npx nx build cc-cmi5-player --skip-nx-cache
```

There are three base commands for this cli tool,
build (local zip without uploading)
build-opendash (can upload to PCTE if used normally, or upload to v9 opendash with the command --use-real-auid )
build-moodle (can upload to moodle, needs aditional information such as class id and section id)

# build

### 🧰 Generate a CMI5 Course Zip and Terraform AU Mappings

This will create cmi5.zip in the cmi5-output directory, the generate-tf is optional and you may instead use the --apply-mappings command create mappings

```bash
node ./dist/apps/cmi5-builder/main.js build <course_path> ./dist/apps/cc-cmi5-player/ --zip --generate-tf
```

# build-opendash

### ☁️ Upload to OpenDash PCTE

You will need to provide a PCTE JWT named JWT_OPENDASH

```bash
node ./dist/apps/cmi5-builder/main.js build-opendash <course dir> ./apps/cmi5-builder/dist/ https://dash.ent1.pcte.mil
```

### ☁️ with AU Mappings

You will need to provide a PCTE JWT named JWT_DEVOPS_API, this will be the same JWT value as the one above, but it needs a seperate name

```bash
node ./dist/apps/cmi5-builder/main.js build-opendash <course dir> ./apps/cmi5-builder/dist/ https://dash.ent1.pcte.mil  --apply-au-mappings https://rangeos-api.ent1.pcte.mil
```

### ☁️ Upload to OpenDash V9 (Develop)

```bash
node ./dist/apps/cmi5-builder/main.js build-opendash <course dir> ./apps/cmi5-builder/dist/ https://dash.ent1.pcte.mil --use-real-auid --apply-au-mappings https://rangeos-api.ent1.pcte.mil
```

# build-moodle

### ☁️ Upload to Moodle (without AU Mappings)

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
node ./dist/apps/cmi5-builder/main.js build-moodle <course dir> ./apps/cmi5-builder/dist/ https://moodle.develop-cp.rangeos.engineering --moodle-course-id  <courseid> --moodle-section-id <sectionid>

```

### With Au Mappings

You will need to provide a ROS JWT named JWT_DEVOPS_API

```bash
node ./dist/apps/cmi5-builder/main.js build-moodle <course dir> ./apps/cmi5-builder/dist/ https://moodle.develop-cp.rangeos.engineering --moodle-course-id  <courseid> --moodle-section-id <sectionid> --apply-au-mappings https://rangeos-api.develop-cp.rangeos.engineering

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
