// e2e/electron-app.spec.ts
import {
  test,
  expect,
  _electron as electron,
  Page,
  ElectronApplication,
} from '@playwright/test';

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
// Helper Functions - Navigation
// ============================================================================

async function navigateToCodeEditor(window: Page): Promise<void> {
  await window.getByTestId('code-editor-button').click();
}

async function navigateToGitEditor(window: Page): Promise<void> {
  await window.getByTestId('git-editor-button').click();
}

// ============================================================================
// Helper Functions - Course Tree
// ============================================================================

async function selectFirstTreeNodeInDesigner(window: Page): Promise<void> {
  const courseTree = window.getByTestId('course-tree');
  const firstLesson = courseTree
    .locator('li.tree-branch-wrapper[role="treeitem"]')
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

async function openSaveModal(window: Page): Promise<void> {
  const saveFilesButton = window.getByTestId('save-files-button');
  await expect(saveFilesButton).toBeEnabled({ timeout: 5000 });
  await saveFilesButton.click();

  const modal = window.getByRole('dialog');
  await expect(modal).toBeVisible();
}

async function uncheckAutoCommit(window: Page): Promise<void> {
  const autoCommit = window.locator('#shouldAutoCommit');
  await expect(autoCommit).toBeVisible();
  await autoCommit.uncheck();
  await window.waitForTimeout(100);
  await expect(autoCommit).not.toBeChecked();
}

async function clickModalButton(
  window: Page,
  buttonName: 'Save' | 'Cancel' | 'Delete',
): Promise<void> {
  const button = window.getByTestId(`modal_button_${buttonName}`);
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
  await button.click();
}

async function waitForModalToClose(window: Page): Promise<void> {
  const modal = window.getByRole('dialog');
  await expect(modal).toBeHidden();
}

/**
 * Workaround for input validation issue where typing causes cursor to jump.
 * Simulates user pressing Backspace to trigger validation.
 */
async function typeInConfirmationField(
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

async function waitForInitializationModal(window: Page): Promise<void> {
  const initModal = window.getByTestId('initializing-fs-modal');
  await expect(initModal).toBeVisible();
  await expect(initModal).toBeHidden({ timeout: 30000 });
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
      await expect(repoSelector).toHaveText(/.+/);
      const repoName = (await repoSelector.textContent())
        ?.replace(/\s+/g, ' ')
        .trim() ?? '';

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
      await window.getByTestId('create-course-button').click();

      // Fill out course form
      const modal = window.getByRole('dialog');
      await expect(modal).toBeVisible();

      await window.getByTestId('field-courseName').fill('test');
      await window.getByTestId('field-courseId').fill('https://test');
      await window.getByTestId('field-courseDescription').fill('test description');

      // Submit form
      const submitButton = window.getByTestId('submit-button');
      await expect(submitButton).toBeEnabled();
      await submitButton.click();
      await waitForModalToClose(window);

      // Verify course was created
      const courseSelector = window.getByTestId('courses-selector');
      await expect(courseSelector).toHaveText('test');
    } finally {
      await closeElectronWindow();
    }
  });
});