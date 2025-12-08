// e2e/electron-app.spec.ts

import {
  test,
  expect,
  _electron as electron,
  Page,
  ElectronApplication,
} from '@playwright/test';
import {
  navigateToGitEditor,
  typeInConfirmationField,
  clickModalButton,
  waitForModalToClose,
  waitForInitializationModal,
  selectFirstTreeNodeInDesigner,
  openSaveModal,
  uncheckAutoCommit,
  navigateToCodeEditor,
  createCourse,
  createLesson,
  cloneRepo,
  verifyRepoName,
} from './e2e-utils.';

const PUBLIC_TEST_REPO =
  'https://github.com/aaiirr123/rapid-cmi5-test-course.git';

// ============================================================================
// Test Fixtures and Setup
// ============================================================================

let electronApp: ElectronApplication;

test.describe.configure({ mode: 'serial' });

// ============================================================================
// Helper Functions - App Lifecycle
// ============================================================================

async function getElectronWindow(): Promise<Page> {
  electronApp = await electron.launch({
    args: ['./dist/apps/rapid-cmi5-electron/main.js'],
    env: {
      ELECTRON_IS_TEST: 'true',
    },
  });

  await electronApp.evaluate(async ({ session }) => {
    await session.defaultSession.clearStorageData();
  });

  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  // Verify app loaded successfully
  const title = await window.title();
  expect(title).toBeTruthy();
  await expect(window.locator('body')).toBeVisible();

  return window;
}

async function closeElectronWindow(): Promise<void> {
  if (electronApp) {
    await electronApp.close();
  }
}

// ============================================================================
// Tests
// ============================================================================

test.describe('Electron App', () => {
  test('Should reset repos', async () => {
    const window = await getElectronWindow();

    try {
      await navigateToGitEditor(window);

      // Get repository name
      const repoSelector = window.getByTestId('Repositories-selector');
      await expect(repoSelector).toHaveText('sandbox');
      const repoName =
        (await repoSelector.textContent())?.replace(/\s+/g, ' ').trim() ?? '';

      // Open delete modal
      await window.getByTestId('delete-repo-button').click();
      const modal = window.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Confirm deletion
      await typeInConfirmationField(window, repoName);
      await clickModalButton(window, 'Delete');
      await waitForModalToClose(window);

      // Wait for reinitialization
      await waitForInitializationModal(window);
    } finally {
      await closeElectronWindow();
    }
  });

  test('Should add a slide and test cancel/save functionality', async () => {
    const window = await getElectronWindow();

    try {
      await selectFirstTreeNodeInDesigner(window);
      await window.getByTestId('add-markdown-slide-button').click();

      // Test cancel functionality
      await openSaveModal(window);
      await clickModalButton(window, 'Cancel');
      await waitForModalToClose(window);

      // Test save without auto-commit
      await openSaveModal(window);
      await uncheckAutoCommit(window);
      await clickModalButton(window, 'Save');
      await waitForModalToClose(window);
    } finally {
      await closeElectronWindow();
    }
  });

  test('Should handle navigation with unsaved changes', async () => {
    const window = await getElectronWindow();

    try {
      await selectFirstTreeNodeInDesigner(window);
      await window.getByTestId('add-markdown-slide-button').click();

      // First attempt - cancel
      await navigateToCodeEditor(window);
      await expect(window.getByRole('dialog')).toBeVisible();
      await clickModalButton(window, 'Cancel');
      await waitForModalToClose(window);

      // Second attempt - save
      await navigateToCodeEditor(window);
      await expect(window.getByRole('dialog')).toBeVisible();
      await uncheckAutoCommit(window);
      await clickModalButton(window, 'Save');
      await waitForModalToClose(window);

      // Verify navigation succeeded
      const fileDrawer = window.getByTestId('file-drawer');
      await expect(fileDrawer).toBeVisible();
    } finally {
      await closeElectronWindow();
    }
  });

  test('Should create a new course', async () => {
    const window = await getElectronWindow();

    try {
      await createCourse(window, 'test', 'https://test', 'new course');
    } finally {
      await closeElectronWindow();
    }
  });

  test('Should create a new course and a new lesson', async () => {
    const window = await getElectronWindow();

    try {
      await createCourse(window, 'test', 'https://test', 'new course');
      await createLesson(window, 'newLesson');
    } finally {
      await closeElectronWindow();
    }
  });

  test('Should be able to clone a new repo with a non filesystem compliant name', async () => {
    const window = await getElectronWindow();

    try {
      await navigateToGitEditor(window);
      await cloneRepo(
        window,
        'new Repo',
        PUBLIC_TEST_REPO,
        'main',
        'test',
        'test',
        'test user',
        'test@gmail.com',
        false,
      );
      await verifyRepoName(window, 'new-repo');
    } finally {
      await closeElectronWindow();
    }
  });
});
