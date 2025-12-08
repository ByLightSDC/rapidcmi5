import { expect, Page } from '@playwright/test';

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

export const createCourse = async (
  window: Page,
  courseName: string,
  courseId: string,
  courseDescription: string,
) => {
  await window.getByTestId('create-course-button').click();

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
  const repoSelector = window.getByTestId('Repositories-selector');
  await expect(repoSelector).toHaveText(expectedName);
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
  await window.getByTestId('clone-repo-button').click();

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
