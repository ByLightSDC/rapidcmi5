# CLAUDE.md — RapidCMI5

Context file for Claude Code. Automatically loaded at the start of every session.

---

## Project Overview

**RapidCMI5** is an open-source CMI5/xAPI course authoring tool built as an **Nx monorepo**.
It targets the Total Learning Architecture (TLA) and ships as:
- A desktop Electron app (Windows + Linux) for authoring courses
- A web-based CMI5 content player
- A Node.js CLI for CI/pipeline-based CMI5 package generation

**Stack:** React 18, TypeScript 5.9, Electron 39, Redux Toolkit, MUI 6, Nx 21
**Version:** 0.9.0 | **License:** AGPL 3

---

## Monorepo Layout

```
rapidcmi5/
├── apps/
│   ├── rapid-cmi5-electron/            # Electron main process (Node.js)
│   ├── rapid-cmi5-electron-frontend/   # Electron renderer (React, Webpack)
│   ├── cc-cmi5-player/                 # Web CMI5 player (React, Webpack)
│   └── cmi5-builder/                   # CLI tool (Node.js, esbuild)
├── libs/
│   ├── keycloak/                       # Auth wrapper (auth-keycloak)
│   ├── ui/api/hooks/                   # UI API hooks
│   └── frontend/clients/               # API clients (devops-api, lms-api, hooks)
├── packages/
│   ├── ui/                             # @rapid-cmi5/ui — shared React component library
│   ├── common/                         # @rapid-cmi5/cmi5-build-common — core CMI5 logic
│   └── rapid-cmi5/                     # @rapid-cmi5/react-editor — editor & Redux state
├── tools/                              # Nx generators
├── scripts/                            # Utility scripts
└── test/                               # Test fixtures
```

---

## Key Entry Points

| App | Entry Point |
|-----|-------------|
| Electron frontend (renderer) | `apps/rapid-cmi5-electron-frontend/src/main.tsx` |
| Electron backend (main process) | `apps/rapid-cmi5-electron/src/main.ts` |
| Electron IPC bridge (preload) | `apps/rapid-cmi5-electron/src/app/api/main.preload.ts` |
| CMI5 Player | `apps/cc-cmi5-player/src/main.tsx` |
| CMI5 Builder CLI | `apps/cmi5-builder/src/main.ts` |

**App wrapper files** (Redux/Provider/Auth setup):
- `apps/rapid-cmi5-electron-frontend/src/app/AppWrapper.tsx`
- `apps/cc-cmi5-player/src/app/AppWrapper.tsx`

---

## Published npm Packages

| Package | Path | Purpose |
|---------|------|---------|
| `@rapid-cmi5/ui` | `packages/ui/` | Shared UI components, Redux slices, hooks, MUI theme |
| `@rapid-cmi5/cmi5-build-common` | `packages/common/` | Course parsing, CMI5 manifest generation, JSON schemas, types |
| `@rapid-cmi5/react-editor` | `packages/rapid-cmi5/` | MDX editor, course/repo Redux reducers |

---

## TypeScript Path Aliases (tsconfig.base.json)

```typescript
@rapid-cmi5/ui                    → packages/ui/src
@rapid-cmi5/cmi5-build-common     → packages/common/src
@rapid-cmi5/react-editor          → packages/rapid-cmi5/src
@rapid-cmi5/keycloak              → libs/keycloak/src
@rangeos-nx/frontend/clients/*    → libs/frontend/clients/*
```

---

## Common Commands

### Development
```bash
npx nx run rapid-cmi5-electron-frontend:serve   # Frontend dev server
npx nx run rapid-cmi5-electron:serve            # Electron app
npx nx run cc-cmi5-player:serve                 # Player dev server
```

### Building (in order — player must be built before electron)
```bash
npx nx reset
npx nx run rapid-cmi5-electron-frontend:build
npx nx run cc-cmi5-player:build
npm run bp                                       # Copies player → electron assets
npx nx run rapid-cmi5-electron:build
npx nx run rapid-cmi5-electron:make              # Creates installers
# Output: ./dist/executables/ (.exe on Windows, .AppImage on Linux)
```

### Testing
```bash
nx run-many --target=test --all                  # All unit tests
npx nx run rapid-cmi5-electron:e2e --ui          # Electron E2E (Playwright)
npx nx run cc-cmi5-player-e2e                    # Player E2E
```

### Linting
```bash
nx run-many --target=lint --all
```

### Package publishing workflow
```bash
nx run [package]:build
cd dist/[package]
npm pack                                         # Test locally: npm i *.tgz
```

### CMI5 Builder CLI scripts (from package.json)
```bash
npm run cmi5-builder   # Build CLI
npm run cmi5-player    # Build player
```

---

## Electron IPC Handlers

The Electron main process (`apps/rapid-cmi5-electron/src/app/api/`) exposes:

- `fs:*` — File system operations (read, write, stat, exists, mkdir, rm, etc.)
- `fs:git*` — Git operations (clone, pull, push, commit, branch, stash, etc.) via `isomorphic-git`
- `cmi5Build` — Build a CMI5 package from a course directory
- `userSettingsApi:*` — SSO/Keycloak auth, SSL certs, recent projects

---

## Frontend Architecture Pattern

Both React frontends follow this structure:

```
src/app/
├── AppWrapper.tsx      # Redux store, React Query, Auth providers
├── App.tsx             # Root component + routing
├── redux/              # Redux slices & store
├── hooks/              # Custom hooks
├── contexts/           # React contexts
├── utils/              # Helpers
├── types/              # TypeScript interfaces
├── shared/             # Shared sub-components
└── styles/             # Component-scoped styles
src/environments/       # prod vs dev env config
src/mocks/              # MSW API mocks
```

---

## State Management

- **Redux Toolkit** + **Redux-Persist**: Global state
  - `repoManagerReducer`: Git repo/branch state (editor app only)
  - `courseBuilderReducer`: Course editing state (editor app only)
  - `commonAppReducer` / `commonAppTransReducer`: Shared app state (from `@rapid-cmi5/ui`)
  - `FrontendEnvironment` slice: Feature flags & runtime config
- **React Query 3**: Server/async state

---

## CMI5 Builder CLI (cmi5-builder)

**Commands:**
- `build` — Parse a course directory and generate a CMI5 `.zip`
- `build-opendash` — Build + upload to OpenDash LMS
- `build-moodle` — Build + upload to Moodle
- `generate-au-terraform` — Generate Terraform AU→scenario mappings

**Service files:**
- `apps/cmi5-builder/src/services/openDash/opendashUploadService.ts`
- `apps/cmi5-builder/src/services/moodle/moodleUploadService.ts`

---

## Content Types Supported (in Player)

- Markdown slides (`MarkdownParser`, `MarkdownSlide`)
- Quizzes (multiple choice, graded — `Quiz`, `QuizQuestion`, `ReviewAnswers`)
- CTF (Capture The Flag) challenges
- JOBE (online judge) coding assessments
- MDX (Markdown + JSX components)

---

## Build Tooling by App

| App | Bundler |
|-----|---------|
| `rapid-cmi5-electron-frontend` | Webpack + Babel |
| `cc-cmi5-player` | Webpack + Babel |
| `rapid-cmi5-electron` (main process) | nx-electron / esbuild |
| `cmi5-builder` | esbuild |
| `packages/ui` | Vite |
| `packages/common` | Rollup / tsc |
| `packages/rapid-cmi5` | Rollup |
| `libs/*` | Rollup / tsc |

---

## CI/CD

- `.github/workflows/ci.yml` — Lint, test, build on PRs
- `.github/workflows/release.yml` — Publish packages to npm on release

---

## Important Config Files

| File | Purpose |
|------|---------|
| `nx.json` | Nx workspace, target defaults, build caching |
| `package.json` | Root dependencies, npm scripts |
| `tsconfig.base.json` | Shared TS config + path aliases |
| `babel.config.json` | Shared Babel config |
| `jest.config.ts` / `jest.preset.js` | Shared Jest config |
| `openapitools.json` | OpenAPI client generation |

---

## Notes for Claude

- Always read files before editing them.
- Prefer `Edit` over `Write` when modifying existing files.
- The player (`cc-cmi5-player`) **must** be built and copied to `apps/rapid-cmi5-electron/src/assets/` before building the Electron app (`npm run bp`).
- Packages in `packages/` are published to npm — changes there affect external consumers.
- `libs/` are internal-only; `packages/` are published.
- IPC channel names use colon-namespacing: `fs:readFile`, `userSettingsApi:getSso`, etc.
- Git operations in the Electron app go through `isomorphic-git` in the main process, not system git.
