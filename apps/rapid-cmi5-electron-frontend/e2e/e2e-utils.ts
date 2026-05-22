import { expect, Locator, Page } from '@playwright/test';
import { join } from 'path-browserify';
export const PUBLIC_TEST_REPO =
  'https://github.com/aaiirr123/rapid-cmi5-test-course.git';

// ============================================================================
// Helper Functions - Local-only debug aids
// ============================================================================

/**
 * Halt the test at this line and keep the browser open for manual
 * inspection. The Playwright Inspector opens beside the browser with
 * a Resume button; clicking it lets the test continue and finish.
 *
 * Use it to peek at end-of-test state, hover over elements to discover
 * locators, or to manually click around in the same browser session
 * the test was driving.
 *
 * Safe to leave committed (though not encouraged): this is a no-op in
 * CI runs (where `process.env.CI` is set) and in headless local runs,
 * so an accidentally-committed `pauseForInspection` won't hang CI.
 *
 * Usage:
 *
 *   import { pauseForInspection } from '../../e2e-utils';
 *   // ... your test ...
 *   await pauseForInspection(page);
 *
 * Pairs best with `npm run nxe:e2e:chromium:debug` (or the Playwright
 * panel's "Show browser — one worker" toggle), which run headed.
 */
export async function pauseForInspection(page: Page): Promise<void> {
  if (process.env.CI) return;
  await page.pause();
}

// ============================================================================
// Helper Functions - Sandbox launch (preferred entry point for UI tests)
// ============================================================================

/**
 * Wipes every browser-side storage the app uses so the next sandbox
 * launch starts from a known-clean state.
 *
 * The sandbox persists across page reloads via:
 *   - localStorage (redux-persist root, git user config)
 *   - sessionStorage (transient app state)
 *   - IndexedDB (`rc5DB` — ZenFS virtual filesystem holding the sandbox
 *     course files; idb-keyval defaults — file handles, recent projects)
 *   - cookies (none used currently, but cheap to clear)
 *
 * Without this reset, openSandbox short-circuits when `checkSandBox()`
 * returns true — meaning every test inherits whatever state the
 * previous test left in IndexedDB.
 *
 * Must be called while on the app origin (not about:blank), because
 * IndexedDB is partitioned per-origin.
 */
async function resetSandboxStorage(page: Page): Promise<void> {
  // Wipe cookies at the context level — works even before navigation.
  await page.context().clearCookies();

  // Wipe origin-scoped storage. Run inside the page so we hit the right
  // origin's storage partition.
  await page.evaluate(async () => {
    try {
      localStorage.clear();
    } catch {
      // localStorage can throw if disabled — ignore.
    }
    try {
      sessionStorage.clear();
    } catch {
      // Same.
    }

    // Delete every IndexedDB database the origin owns. `databases()` is
    // a relatively recent API but supported in modern Chromium.
    if ('databases' in indexedDB) {
      const dbs = await indexedDB.databases();
      await Promise.all(
        dbs.map(
          (db) =>
            new Promise<void>((resolve) => {
              if (!db.name) return resolve();
              const req = indexedDB.deleteDatabase(db.name);
              req.onsuccess = () => resolve();
              req.onerror = () => resolve(); // best-effort
              req.onblocked = () => resolve(); // best-effort
            }),
        ),
      );
    }
  });
}

/**
 * Navigates from cold load to the Visual Designer with the seeded sandbox
 * course open, **after wiping all browser storage** so the sandbox is
 * reconstructed from its seed on every call.
 *
 * Sequence:
 *   1. Navigate to `/` so we're on the app origin (needed for
 *      origin-scoped storage APIs).
 *   2. Wipe localStorage, sessionStorage, IndexedDB, cookies.
 *   3. Reload so the app's bootstrap reruns against a clean slate.
 *   4. Click "Launch Sandbox".
 *   5. Wait for the Visual Designer drawer to mount.
 *
 * This is the preferred entry point for UI / directive / theme tests
 * because it sidesteps the entire Production-Mode filesystem-and-git
 * setup (create-repo, clone-repo, author-credentials, etc.) that the
 * legacy `createRepo` flow exercises. Use the sandbox fixture in
 * `e2e/fixtures/sandbox-fixtures.ts` to get this called automatically
 * in `beforeEach`.
 *
 * **Removed** the prior "if already in the designer, return" short-circuit:
 * test isolation requires a fresh storage wipe even if a previous test
 * left the designer mounted in the same browser context.
 */
export async function launchSandbox(window: Page): Promise<void> {
  // 1. Land on the origin so we can address its storage.
  await window.goto('/');
  await window.waitForLoadState('domcontentloaded');

  // 2. Wipe every persistent store the app could be reading from.
  await resetSandboxStorage(window);

  // 3. Reload so the app's bootstrap reruns against a clean slate.
  await window.reload();
  await window.waitForLoadState('domcontentloaded');

  // 4. Click Launch Sandbox. The button has to appear first — it won't
  //    be visible until the app's project-selection screen mounts.
  const launchButton = window.getByTestId('launch-sandbox-button');
  await expect(launchButton).toBeVisible({ timeout: 15_000 });
  await launchButton.click();

  // 5. The Visual Designer drawer mount is the load-complete signal.
  const designer = window.getByTestId('visual-designer-drawer');
  await expect(designer).toBeVisible({ timeout: 30_000 });
}

// ============================================================================
// Helper Functions - Editor / directive insertion
// ============================================================================

/**
 * Focuses the editor's contenteditable surface so subsequent toolbar /
 * Block Library button clicks have a selection to insert at. MDXEditor's
 * `insertNodes` is a no-op without an active selection inside the editor.
 *
 * Returns the editor locator so callers can chain further interactions.
 */
export async function focusEditor(page: Page): Promise<Locator> {
  const editor = page
    .getByTestId('rc5-visual-editor')
    .locator('.mdxeditor-root-contenteditable')
    .first();
  await expect(editor).toBeVisible();
  await editor.click();
  return editor;
}

/**
 * Opens the Block Library drawer (right-side panel listing every insertable
 * block) by clicking the toolbar toggle. Idempotent — if the drawer is
 * already open, this is a no-op.
 *
 * Also focuses the editor first so the drawer sees a valid selection
 * (the drawer's "insert allowed?" gating depends on `$isRangeSelection`
 * being true and `isCollapsed`, which both require a focused editor).
 */
export async function openBlockLibrary(page: Page): Promise<void> {
  // The drawer's selection-gating requires the editor to have a collapsed
  // range selection. Click into the editor so the Lexical selection model
  // updates before we open the drawer.
  await focusEditor(page);

  const drawer = page.getByTestId('block-library-drawer');
  if (await drawer.isVisible().catch(() => false)) {
    return;
  }

  await page.getByTestId('block-library-toggle').click();
  await expect(drawer).toBeVisible();
}

/**
 * Runs a directive-insertion smoke test by reading the baseline count of
 * `target`, clicking the element with `insertButtonTestId`, and asserting
 * the count grew by exactly one.
 *
 * **Why relative counts (N → N+1) instead of absolute (0 → 1):** the
 * sandbox seed slide isn't empty — it has ~10 `<hr>` separators, may gain
 * other elements over time, and we don't want a flake whenever the seed
 * evolves. The relative pattern is robust to that.
 *
 * Used by `directive-insertion.spec.ts` (toolbar path).
 * `block-library-insertion.spec.ts` uses the drawer variant below.
 */
export async function assertInsertionAddsOne(
  page: Page,
  insertButtonTestId: string,
  target: Locator,
): Promise<void> {
  const before = await target.count();

  await focusEditor(page);

  const insertButton = page.getByTestId(insertButtonTestId);
  await expect(insertButton).toBeVisible();
  await insertButton.click();

  await expect(target).toHaveCount(before + 1);
}

/**
 * Like {@link assertInsertionAddsOne}, but opens the Block Library drawer
 * first so the test can click an item *inside the drawer*. Used by
 * `block-library-insertion.spec.ts`.
 *
 * Some Block Library items live in collapsed accordion sections inside
 * the drawer (e.g. Code Block is under "Media"). Pass an optional
 * `expandSection` text to expand that section after the drawer opens.
 */
export async function assertBlockLibraryInsertionAddsOne(
  page: Page,
  itemTestId: string,
  target: Locator,
  options: { expandSection?: string } = {},
): Promise<void> {
  const before = await target.count();

  await openBlockLibrary(page);

  if (options.expandSection) {
    // ViewExpander sections within the drawer don't have stable test-ids;
    // match on the section heading's accessible name. When the section is
    // collapsed the heading text is `"<Section>..."` (ellipsis appended by
    // ViewExpander's `shouldIndicateMore`); when expanded it's just
    // `"<Section>"`. A regex anchored at the start matches either form,
    // so we can safely call this whether the section is open or closed.
    const escaped = options.expandSection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sectionHeader = page
      .getByTestId('block-library-drawer')
      .getByRole('heading', { name: new RegExp(`^${escaped}`) });
    await sectionHeader.click();
  }

  const insertButton = page.getByTestId(itemTestId);
  await expect(insertButton).toBeVisible();
  await insertButton.click();

  await expect(target).toHaveCount(before + 1);
}

// ============================================================================
// Helper Functions - Navigation
// ============================================================================

export async function navigateToCodeEditor(window: Page): Promise<void> {
  await window.getByTestId('code-editor-button').click();
}

export async function navigateToGitEditor(window: Page): Promise<void> {
  await window.getByTestId('git-editor-button').click();
}

// ============================================================================
// Helper Functions - Course Tree
// ============================================================================

export async function selectFirstTreeNodeInDesigner(
  window: Page,
): Promise<void> {
  const firstLesson = window
    .locator('[role="treeitem"][aria-level="1"]')
    .first();

  await expect(firstLesson).toBeVisible();

  // Expand lesson if collapsed
  const expanded = await firstLesson.getAttribute('aria-expanded');
  if (expanded !== 'true') {
    const header = firstLesson
      .locator('.tree-node__branch, .tree-node')
      .first();
    await header.click();
    await expect(firstLesson).toHaveAttribute('aria-expanded', 'true');
  }

  // Select first slide
  const firstSlide = firstLesson
    .locator('ul[role="group"]')
    .getByRole('treeitem')
    .first();

  await expect(firstSlide).toBeVisible();
  await firstSlide.click();
  await window.waitForTimeout(500);
}

// ============================================================================
// Helper Functions - Modal Actions
// ============================================================================

export async function openSaveModal(window: Page): Promise<void> {
  const saveFilesButton = window.getByTestId('save-files-button');
  await expect(saveFilesButton).toBeEnabled({ timeout: 5000 });
  await saveFilesButton.click();

  const modal = window.getByRole('dialog');
  await expect(modal).toBeVisible();
}

export async function uncheckAutoCommit(window: Page): Promise<void> {
  const autoCommit = window.locator('#shouldAutoCommit');
  await expect(autoCommit).toBeVisible();
  await autoCommit.uncheck();
  await window.waitForTimeout(100);
  await expect(autoCommit).not.toBeChecked();
}

export async function clickModalButton(
  window: Page,
  buttonName: 'Save' | 'Cancel' | 'Delete',
): Promise<void> {
  const button = window.getByTestId(`modal_button_${buttonName}`);
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
  await button.click();
}

export async function waitForModalToClose(window: Page): Promise<void> {
  const modal = window.getByRole('dialog');
  await expect(modal).toBeHidden();
}

/**
 * Workaround for input validation issue where typing causes cursor to jump.
 * Simulates user pressing Backspace to trigger validation.
 */
export async function typeInConfirmationField(
  window: Page,
  text: string,
): Promise<void> {
  const confirmField = window.getByTestId('field-name-confirmation');
  await confirmField.fill(text);
  await confirmField.click();

  // Workaround: trigger validation by simulating backspace
  await confirmField.press('End');
  await confirmField.press('Backspace');
}

export async function waitForInitializationModal(window: Page): Promise<void> {
  const initModal = window.getByTestId('initializing-fs-modal');
  await expect(initModal).toBeVisible();
  await expect(initModal).toBeHidden({ timeout: 30000 });
}

export const createRepo = async (
  window: Page,
  repoName: string,
  branch: string,
  authorName: string,
  authorEmail: string,
  remoteUrl?: string,
  isWebApp = false,
) => {
  const createRepoButton = window.getByTestId('create-repo-button');
  await expect(createRepoButton).toBeAttached();
  await expect(createRepoButton).toBeVisible();
  await createRepoButton.click();

  // Fill out course form
  const modal = window.getByRole('dialog');
  await expect(modal).toBeVisible();

  if (remoteUrl) {
    await window.getByTestId('field-repoRemoteUrl').fill(remoteUrl);
  }

  await window.getByTestId('field-repoDirName').fill(repoName);
  await window.getByTestId('field-repoBranch').fill(branch);

  // Author fields live under a "Git Credentials" expander that is
  // collapsed by default. Expand it before filling.
  await expandGitCredentials(window);
  await window.getByTestId('field-authorName').fill(authorName);
  await window.getByTestId('field-authorEmail').fill(authorEmail);

  // Submit form
  const submitButton = window.getByTestId('submit-button');
  await expect(submitButton).toBeEnabled();

  await submitButton.click();

  await waitForModalToClose(window);

  await createCourse(window, 'introduction', 'https://intro', '');
};

/**
 * Expands the "Git Credentials" accordion in the create/clone repo dialog.
 * The author/email/username/password inputs are hidden inside this
 * ViewExpander (defaultIsExpanded=false) since CCUI-XXXX. Idempotent:
 * if already expanded, this is a no-op (clicking re-collapses it, so
 * we only click when the author field isn't already attached).
 */
export const expandGitCredentials = async (window: Page) => {
  const authorField = window.getByTestId('field-authorName');
  if (await authorField.count() > 0 && await authorField.isVisible().catch(() => false)) {
    return;
  }
  await window.getByTestId('expand-git-credentials').click();
  await expect(authorField).toBeVisible();
};

export const selectRecentRepo = async (window: Page, projectName: string) => {
  const recentProjectsCard = window.getByTestId('recent-projects-card');
  await expect(recentProjectsCard).toBeVisible();

  // Find the project by name using the ListItemText primary text
  const projectButton = window.getByRole('button', {
    name: new RegExp(projectName, 'i'),
  });

  // Ensure it's visible (may need to scroll)
  await projectButton.scrollIntoViewIfNeeded();
  await expect(projectButton).toBeVisible();

  // Click to open the project
  await projectButton.click();
  // Verify course was created
  // const courseSelector = window.getByTestId('courses-selector');
  // await expect(courseSelector).toHaveText(courseName);
};

export const createCourse = async (
  window: Page,
  courseName: string,
  courseId: string,
  courseDescription: string,
) => {
  const createCourseButton = window.getByTestId('create-course-button');

  await expect(createCourseButton).toBeVisible();
  await expect(createCourseButton).toBeEnabled();
  await createCourseButton.click({ force: true });

  // Fill out course form
  const modal = window.getByRole('dialog');
  await expect(modal).toBeVisible();

  await window.getByTestId('field-courseName').fill(courseName);
  await window.getByTestId('field-courseId').fill(courseId);
  await window.getByTestId('field-courseDescription').fill(courseDescription);

  // Submit form
  const submitButton = window.getByTestId('submit-button');
  await expect(submitButton).toBeEnabled();
  await submitButton.click();
  await waitForModalToClose(window);

  // Verify course was created
  const courseSelector = window.getByTestId('courses-selector');
  await expect(courseSelector).toHaveText(courseName);
};

export const createLesson = async (window: Page, lessonName: string) => {
  await window.getByTestId('create-lesson-button').click();

  // Fill out course form
  const modal = window.getByRole('dialog');
  await expect(modal).toBeVisible();

  await window.getByTestId('field-auName').fill(lessonName);

  // Submit form
  const submitButton = window.getByTestId('submit-button');
  await expect(submitButton).toBeEnabled();
  await submitButton.click();
  await waitForModalToClose(window);

  const treeNode = window.locator('.tree-node', { hasText: lessonName });
  await expect(treeNode).toBeVisible();
};
export const verifyRepoName = async (window: Page, expectedName: string) => {
  const repoDisplay = window.getByTestId('current-repo-name');
  await expect(repoDisplay).toHaveText(expectedName);
};

export const cloneRepo = async (
  window: Page,
  repoName: string,
  repoUrl: string,
  branch: string,
  username: string,
  password: string,
  authorName: string,
  email: string,
  shallowClone: boolean,
) => {
  const createRepoButton = window.getByTestId('clone-repo-button');
  await expect(createRepoButton).toBeAttached();
  await expect(createRepoButton).toBeVisible();
  await createRepoButton.click();

  // Fill out course form
  const modal = window.getByRole('dialog');
  await expect(modal).toBeVisible();

  const repoNameField = window.getByTestId('field-repoRemoteUrl');
  await repoNameField.click();

  await repoNameField.clear();
  await repoNameField.press('End');
  await repoNameField.press('Backspace');
  await repoNameField.fill(repoUrl);
  await window.getByTestId('field-repoDirName').fill(repoName);
  await window.getByTestId('field-repoBranch').fill(branch);

  // Credentials live under the same "Git Credentials" expander as createRepo.
  await expandGitCredentials(window);
  await window.getByTestId('field-repoUsername').fill(username);
  await window.getByTestId('field-repoPassword').fill(password);
  await window.getByTestId('field-authorName').fill(authorName);
  await window.getByTestId('field-authorEmail').fill(email);
  const shallowCloneCheckBox = window.locator('#shallowClone');

  if (shallowClone) await shallowCloneCheckBox.check();
  // Submit form
  const submitButton = window.getByTestId('submit-button');
  await expect(submitButton).toBeEnabled();
  await submitButton.click();
  const repoSelectButton = window.getByTestId('modal_button_Done');
  repoSelectButton.click();
  await waitForModalToClose(window);
};
