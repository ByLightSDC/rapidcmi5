// e2e/web-app.web.spec.ts

import { test, expect, Page } from '@playwright/test';
import {
  createRepo,
  selectRecentRepo,
  createCourse,
  selectFirstTreeNodeInDesigner,
  openSaveModal,
  clickModalButton,
  waitForModalToClose,
  uncheckAutoCommit,
  navigateToCodeEditor,
  createLesson,
  cloneRepo,
  navigateToGitEditor,
  verifyRepoName,
  PUBLIC_TEST_REPO,
} from '../e2e-utils.';

// ============================================================================
// Test Fixtures and Setup
// ============================================================================

test.describe.configure({ mode: 'serial' });

// ============================================================================
// Helper Functions - App Lifecycle
// ============================================================================

async function setupPage(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  // Verify app loaded successfully
  const title = await page.title();
  expect(title).toBeTruthy();
  await expect(page.locator('body')).toBeVisible();
}

// ============================================================================
// Tests
// ============================================================================

test.describe('Web App', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('Should create repo', async ({ page }) => {
    await createRepo(page, 'e2e-test-repo', 'main', 'test', 'test@gmail.com', undefined, true);
  });

  test('Should be able to select a recent repo', async ({ page }) => {
    await createRepo(page, 'e2e-test-repo', 'main', 'test', 'test@gmail.com');
    await page.getByTestId('repo-selection-button').click();

    await selectRecentRepo(page, 'e2e-test-repo');
  });

  test('Should add a slide and test cancel/save functionality', async ({
    page,
  }) => {
    await createRepo(page, 'e2e-test-repo', 'main', 'test', 'test@gmail.com');

    await createCourse(page, 'test-course', 'https://test-course', 'test');

    await selectFirstTreeNodeInDesigner(page);
    await page.getByTestId('add-markdown-slide-button').click();

    // Test cancel functionality
    await openSaveModal(page);
    await clickModalButton(page, 'Cancel');
    await waitForModalToClose(page);

    // Test save without auto-commit
    await openSaveModal(page);
    await uncheckAutoCommit(page);
    await clickModalButton(page, 'Save');
    await waitForModalToClose(page);
  });

  test('Should handle navigation with unsaved changes', async ({ page }) => {
    await createRepo(page, 'e2e-test-repo', 'main', 'test', 'test@gmail.com');

    await selectFirstTreeNodeInDesigner(page);
    await page.getByTestId('add-markdown-slide-button').click();

    // First attempt - cancel
    await navigateToCodeEditor(page);
    await expect(page.getByRole('dialog')).toBeVisible();
    await clickModalButton(page, 'Cancel');
    await waitForModalToClose(page);

    // Second attempt - save
    await navigateToCodeEditor(page);
    await expect(page.getByRole('dialog')).toBeVisible();
    await uncheckAutoCommit(page);
    await clickModalButton(page, 'Save');
    await waitForModalToClose(page);

    // Verify navigation succeeded
    const fileDrawer = page.getByTestId('file-drawer');
    await expect(fileDrawer).toBeVisible();
  });

  test('Should create a new course', async ({ page }) => {
    await createRepo(page, 'e2e-test-repo', 'main', 'test', 'test@gmail.com');
    await createCourse(page, 'test', 'https://test', 'new course');
  });

  test('Should create a new course and a new lesson', async ({ page }) => {
    await createRepo(page, 'e2e-test-repo', 'main', 'test', 'test@gmail.com');
    await createCourse(page, 'test', 'https://test', 'new course');
    await createLesson(page, 'newLesson');
  });

  test('Should be able to clone a new repo with a non filesystem compliant name', async ({
    page,
  }) => {
    await cloneRepo(
      page,
      'new Repo',
      PUBLIC_TEST_REPO,
      'main',
      'test',
      'test',
      'test user',
      'test@gmail.com',
      false,
    );
    await navigateToGitEditor(page);

    await verifyRepoName(page, 'new-repo');
  });
});
