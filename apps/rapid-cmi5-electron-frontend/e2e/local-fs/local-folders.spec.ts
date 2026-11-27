import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test, expect } from './fixtures';
import {
  selectFirstTreeNodeInDesigner,
  uncheckAutoCommit,
  waitForModalToClose,
  selectRecentRepo,
} from '../e2e-utils.';

async function markdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name === '.rapid-git' || entry.name === '.git') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await markdownFiles(path)));
    else if (entry.isFile() && /\.mdx?$/.test(entry.name)) files.push(path);
  }
  return files;
}

test('native local handles read, write, enumerate, delete and survive Chrome restart', async ({
  localFolder,
}) => {
  let page = localFolder.page;
  await localFolder.selectFolder(localFolder.folder);
  await page.evaluate(async () => {
    const directory = await window.showDirectoryPicker({ mode: 'readwrite' });
    const nested = await directory.getDirectoryHandle('native-api', {
      create: true,
    });
    const file = await nested.getFileHandle('regression.txt', { create: true });
    const writer = await file.createWritable();
    await writer.write('Chrome local filesystem regression');
    await writer.close();
    // Exercise Chrome's structured serialization of local directory handles.
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('local-folder-regression', 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore('handles');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').put(directory, 'directory');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  });
  const diskPath = join(localFolder.folder, 'native-api', 'regression.txt');
  expect(await readFile(diskPath, 'utf8')).toBe(
    'Chrome local filesystem regression',
  );

  page = await localFolder.restart();
  const result = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('local-folder-regression', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const directory = await new Promise<FileSystemDirectoryHandle>(
      (resolve, reject) => {
        const request = db
          .transaction('handles')
          .objectStore('handles')
          .get('directory');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      },
    );
    db.close();
    const native = directory instanceof FileSystemDirectoryHandle;
    const permission = await directory.queryPermission({ mode: 'readwrite' });
    const nested = await directory.getDirectoryHandle('native-api');
    const names: string[] = [];
    for await (const name of nested.keys()) names.push(name);
    const file = await nested.getFileHandle('regression.txt');
    const text = await (await file.getFile()).text();
    await nested.removeEntry('regression.txt');
    return {
      native,
      permission,
      names,
      text,
      pickerCalls: window.__localFolderTest.pickerCalls,
    };
  });
  expect(result).toEqual({
    native: true,
    permission: 'granted',
    names: ['regression.txt'],
    text: 'Chrome local filesystem regression',
    pickerCalls: 0,
  });
  expect(await readdir(join(localFolder.folder, 'native-api'))).toEqual([]);
});

test('create local project, save a slide, and reopen recent project after Chrome restart', async ({
  localFolder,
}) => {
  let page = localFolder.page;
  await localFolder.selectFolder(localFolder.folder);
  const repoName = 'local-fs-regression';
  await page.getByTestId('create-repo-button').click();
  await page.getByTestId('field-repoDirName').fill(repoName);
  await page.getByTestId('field-repoBranch').fill('main');
  const author = page.getByTestId('field-authorName');
  if (!(await author.isVisible()))
    await page.getByRole('dialog').getByTestId('view-expand').click();
  await author.fill('E2E Test');
  await page.getByTestId('field-authorEmail').fill('e2e@example.com');
  await page.getByTestId('submit-button').click();
  await waitForModalToClose(page);
  await page.getByTestId('create-course-button').click();
  await page.getByTestId('field-courseName').fill('introduction');
  await page.getByTestId('field-courseId').fill('https://e2e.example/course');
  await page.getByTestId('submit-button').click();
  await waitForModalToClose(page);
  const repoPath = join(localFolder.folder, repoName);
  expect(await readdir(repoPath)).toContain('.rapid-git');
  await page.getByTestId('create-lesson').click();
  await page.getByTestId('field-auName').fill('Local folder lesson');
  await page.getByTestId('submit-button').click();
  await waitForModalToClose(page);
  await expect(
    page.locator('.tree-node', { hasText: 'Local folder lesson' }),
  ).toBeVisible();
  await selectFirstTreeNodeInDesigner(page);
  await page
    .getByRole('button', { name: 'Edit Markdown', exact: true })
    .click();
  const source = page.locator('.cm-content').first();
  await expect(source).toBeVisible();
  const marker = 'Saved through Chrome File System Access';
  await source.fill(`# Local folder regression\n\n${marker}\n`);
  await page
    .getByRole('button', { name: 'Edit Rich Text', exact: true })
    .click();
  const save = page.getByRole('button', { name: /^Save Files$/i });
  await expect(save).toBeEnabled();
  await save.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await uncheckAutoCommit(page);
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Save', exact: true })
    .click();
  await waitForModalToClose(page);

  let savedPath: string | undefined;
  await expect
    .poll(
      async () => {
        for (const file of await markdownFiles(repoPath)) {
          if ((await readFile(file, 'utf8')).includes(marker)) {
            savedPath = file;
            return true;
          }
        }
        return false;
      },
      { message: 'Saved slide must exist on the actual OS filesystem' },
    )
    .toBe(true);

  page = await localFolder.restart();
  // Do not inject another handle: this must use the application's saved handle.
  await selectRecentRepo(page, repoName);
  await selectFirstTreeNodeInDesigner(page);
  await expect(page.locator('[contenteditable="true"]').first()).toContainText(
    marker,
  );
  expect(await page.evaluate(() => window.__localFolderTest.pickerCalls)).toBe(
    0,
  );
  expect(await readFile(savedPath!, 'utf8')).toContain(marker);

  // Also exercise explicit folder selection with the same on-disk project.
  await page.getByTestId('repo-selection-button').click();
  const externalMarker = 'Content changed by another local editor';
  await writeFile(
    savedPath!,
    (await readFile(savedPath!, 'utf8')).replace(marker, externalMarker),
  );
  await localFolder.selectFolder(repoPath);
  await page.getByTestId('open-repo-button').click();
  await selectFirstTreeNodeInDesigner(page);
  await expect(page.locator('[contenteditable="true"]').first()).toContainText(
    externalMarker,
  );
  expect(await page.evaluate(() => window.__localFolderTest.pickerCalls)).toBe(
    1,
  );
});
