import { existsSync, readFileSync, promises as fs } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { randomUUID } from 'node:crypto';
import { selectFirstTreeNodeInDesigner } from '../e2e-utils.';
import { parse } from 'dotenv';
import * as git from 'isomorphic-git';
import { Page } from '@playwright/test';
import { test, expect } from './fixtures';

// Read credentials only in the test worker. Never put them in browser bundles,
// URLs, Playwright fill() step titles, attachments, or traced network requests.
const envPath = resolve(__dirname, '../../../../.env');
const settings = {
  ...(existsSync(envPath) ? parse(readFileSync(envPath)) : {}),
  ...process.env,
};
const remote = settings.NX_E2E_URL;
const token = settings.NX_E2E_TOKEN;
const branch = settings.NX_E2E_BRANCH?.trim() || 'main';

test.use({
  recordTrace: false,
  trace: 'off',
  screenshot: 'off',
  video: 'off',
  // Direct browser requests can otherwise stop at Chrome's native HTTP Basic
  // auth prompt before isomorphic-git receives the server's 401 response.
  httpCredentials:
    remote && token
      ? {
          username:
            settings.NX_E2E_USERNAME ||
            (new URL(remote).hostname.includes('github')
              ? 'x-access-token'
              : 'oauth2'),
          password: token,
          origin: new URL(remote).origin,
        }
      : undefined,
});
test.skip(
  !remote || !token,
  'Set NX_E2E_URL and NX_E2E_TOKEN in the environment or root .env',
);

test.afterEach(async ({ localFolder }, testInfo) => {
  if (testInfo.status === testInfo.expectedStatus) return;
  const overlay = localFolder.page
    .frameLocator('#webpack-dev-server-client-overlay')
    .locator('body');
  const text = await overlay.innerText({ timeout: 1000 }).catch(() => '');
  if (text)
    await testInfo.attach('dev-server-error', {
      body: text.replaceAll(token!, '[redacted]'),
      contentType: 'text/plain',
    });
});

async function filesBelow(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === '.rapid-git') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesBelow(path)));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

async function saveAndCommit(page: Page, message: string) {
  await page.getByRole('button', { name: /^Save Files$/i }).click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('#shouldAutoCommit').check();
  const push = dialog.locator('#shouldAutoPush');
  if (await push.count()) await push.uncheck();
  await dialog.getByTestId('field-commit.commitMessage').fill(message);
  // MiniForm persists its save options through a 100ms autosave debounce.
  await page.waitForTimeout(250);
  await dialog.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(dialog).toBeHidden({ timeout: 30_000 });
}

async function remoteBranchOid(
  url: string,
  username: string,
  password: string,
) {
  const response = await fetch(
    `${url.replace(/\/$/, '')}/info/refs?service=git-upload-pack`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
      },
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (!response.ok)
    throw new Error(`Remote branch lookup failed (HTTP ${response.status})`);
  const advertised = [
    ...(await response.text()).matchAll(
      /([0-9a-f]{40}) (refs\/heads\/[^\0\n]+)/g,
    ),
  ];
  const oid = advertised.find((ref) => ref[2] === `refs/heads/${branch}`)?.[1];
  if (!oid)
    throw new Error(`The Git server did not advertise branch ${branch}`);
  return oid;
}

function allowedPush(
  data: Buffer | null,
  oldOid: string | undefined,
  newOid: string | undefined,
) {
  if (!data || !oldOid || !newOid) return false;
  const commands: string[] = [];
  let offset = 0;
  while (offset + 4 <= data.length) {
    const size = Number.parseInt(
      data.toString('ascii', offset, offset + 4),
      16,
    );
    offset += 4;
    if (size === 0) break;
    if (!Number.isFinite(size) || size < 4 || offset + size - 4 > data.length)
      return false;
    commands.push(
      data
        .toString('utf8', offset, offset + size - 4)
        .split('\0')[0]
        .trim(),
    );
    offset += size - 4;
  }
  return (
    commands.length === 1 &&
    commands[0] === `${oldOid} ${newOid} refs/heads/${branch}`
  );
}

test(`authenticated clone: commit a slide, delete it in the main editor, commit and push ${branch}`, async ({
  localFolder,
}, testInfo) => {
  test.setTimeout(240_000);
  const url = new URL(remote!);
  expect(url.protocol, 'Use an HTTPS Git clone URL').toBe('https:');
  expect(
    Boolean(url.username || url.password),
    'Keep credentials out of the clone URL',
  ).toBe(false);
  const page = localFolder.page;
  const diagnostics: string[] = [];
  const username =
    settings.NX_E2E_USERNAME ||
    (url.hostname.includes('github') ? 'x-access-token' : 'oauth2');
  const redact = (text: string) =>
    [
      token!,
      Buffer.from(`${username}:${token}`).toString('base64'),
      encodeURIComponent(token!),
    ].reduce((value, secret) => value.replaceAll(secret, '[redacted]'), text);
  page.on('console', (message) => {
    if (message.type() === 'error') diagnostics.push(redact(message.text()));
  });
  page.on('requestfailed', (request) =>
    diagnostics.push(
      `${new URL(request.url()).hostname}: ${request.failure()?.errorText}`,
    ),
  );
  page.on('response', (response) => {
    if (new URL(response.url()).origin === url.origin)
      diagnostics.push(`Git HTTP response: ${response.status()}`);
  });
  let initialHead: string | undefined;
  let pushOid: string | undefined;
  const canReceive = (request: import('@playwright/test').Request) => {
    if (!pushOid) return false;
    const target = new URL(request.url());
    const base = url.pathname.replace(/\/$/, '');
    if (target.origin !== url.origin) return false;
    if (request.method() === 'GET')
      return (
        target.pathname === `${base}/info/refs` &&
        target.searchParams.get('service') === 'git-receive-pack'
      );
    return (
      request.method() === 'POST' &&
      target.pathname === `${base}/git-receive-pack` &&
      allowedPush(request.postDataBuffer(), initialHead, pushOid)
    );
  };
  // Allow only the verified, fast-forward update from this clone's original
  // branch to its final deletion commit. Other remote refs remain blocked.
  await localFolder.context.route('**/*git-receive-pack*', (route) =>
    canReceive(route.request()) ? route.continue() : route.abort(),
  );
  await localFolder.selectFolder(localFolder.folder);
  await page.getByTestId('clone-repo-button').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByTestId('field-repoRemoteUrl').fill(remote!);
  const repoName = 'authenticated-e2e-clone';
  await dialog.getByTestId('field-repoDirName').fill(repoName);
  await dialog.getByTestId('field-repoBranch').fill(branch);
  await dialog.getByTestId('view-expand').click();
  await dialog
    .getByTestId('field-repoUsername')
    .fill(
      settings.NX_E2E_USERNAME ||
        (url.hostname.includes('github') ? 'x-access-token' : 'oauth2'),
    );
  // fill(token) would put the secret in the Playwright reporter's step title.
  await dialog.getByTestId('field-repoPassword').evaluate((element, secret) => {
    const input = element as HTMLInputElement;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!.set!.call(input, secret);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, token!);
  await dialog.getByTestId('field-authorName').fill('Local FS E2E');
  await dialog
    .getByTestId('field-authorEmail')
    .fill('local-fs-e2e@example.com');
  await dialog.getByTestId('submit-button').click();
  try {
    await expect(dialog).toBeHidden({ timeout: 60_000 });
  } catch {
    const text = redact(
      `${diagnostics.join('\n')}\n\n${await page.locator('body').innerText()}`,
    );
    await testInfo.attach('clone-error', {
      body: text,
      contentType: 'text/plain',
    });
    throw new Error(
      'Authenticated clone did not complete; see the sanitized clone-error attachment',
    );
  }

  const dir = join(localFolder.folder, repoName);
  const gitdir = join(dir, '.rapid-git');
  const repo = { fs: { promises: fs }, dir, gitdir };
  initialHead = await git.resolveRef({ ...repo, ref: 'HEAD' });
  expect(await git.currentBranch(repo)).toBe(branch);
  const existing = new Set(await filesBelow(dir));
  await page
    .getByRole('button', { name: 'select-design', exact: true })
    .click();
  await selectFirstTreeNodeInDesigner(page);
  const originalSlideCount = await page
    .locator('[role="treeitem"][aria-level="2"]')
    .count();
  await page.getByRole('button', { name: 'Add Slide', exact: true }).click();
  await expect(page.locator('[role="treeitem"][aria-level="2"]')).toHaveCount(
    originalSlideCount + 1,
  );
  const marker = `E2E slide lifecycle ${randomUUID()}`;
  await page
    .getByRole('button', { name: 'Edit Markdown', exact: true })
    .click();
  await page.locator('.cm-content').first().fill(`# E2E slide\n\n${marker}\n`);
  await page
    .getByRole('button', { name: 'Edit Rich Text', exact: true })
    .click();
  await expect(page.locator('[contenteditable="true"]').first()).toContainText(
    marker,
  );
  await saveAndCommit(page, 'E2E add slide with content');

  const added = await git.resolveRef({ ...repo, ref: 'HEAD' });
  expect((await git.readCommit({ ...repo, oid: added })).commit.parent).toEqual(
    [initialHead],
  );
  let slidePath: string | undefined;
  for (const file of await filesBelow(dir)) {
    if (
      !existing.has(file) &&
      /\.mdx?$/.test(file) &&
      (await fs.readFile(file, 'utf8')).includes(marker)
    )
      slidePath = file;
  }
  expect(
    slidePath,
    'The new slide must be a new Markdown file on disk',
  ).toBeTruthy();
  const filepath = relative(dir, slidePath!).split('\\').join('/');
  expect(
    new TextDecoder().decode(
      (await git.readBlob({ ...repo, oid: added, filepath })).blob,
    ),
  ).toContain(marker);
  const configs = (await filesBelow(dir)).filter((file) =>
    file.endsWith('/RC5.yaml'),
  );
  const config = (
    await Promise.all(
      configs.map(async (file) => ({
        file,
        content: await fs.readFile(file, 'utf8'),
      })),
    )
  ).find((value) => value.content.includes(filepath));
  expect(
    config,
    'The saved course configuration must reference the new slide',
  ).toBeTruthy();

  // Delete from the main visual editor, exercising its queued file deletion.
  // Do not remove the file through the file tree or Node's filesystem.
  await page.locator('[role="treeitem"][aria-level="2"]').nth(1).click();
  await expect(page.locator('[contenteditable="true"]').first()).toContainText(
    marker,
  );
  await page.getByRole('button', { name: 'Delete Slide', exact: true }).click();
  await expect(page.locator('[role="treeitem"][aria-level="2"]')).toHaveCount(
    originalSlideCount,
  );
  await saveAndCommit(page, 'E2E delete slide through main editor');
  const deleted = await git.resolveRef({ ...repo, ref: 'HEAD' });
  const deletion = (await git.readCommit({ ...repo, oid: deleted })).commit;
  expect(deletion.parent).toEqual([added]);
  expect(deletion.message.trim()).toBe('E2E delete slide through main editor');
  expect(
    await fs.access(slidePath!).then(
      () => true,
      () => false,
    ),
    'Deleting the slide must remove its Markdown file from disk',
  ).toBe(false);
  expect(await fs.readFile(config!.file, 'utf8')).not.toContain(filepath);
  expect(await git.listFiles({ ...repo, ref: deleted })).not.toContain(
    filepath,
  );
  expect(await git.status({ ...repo, filepath })).toBe('absent');
  expect(await git.listFiles({ ...repo, ref: deleted })).toEqual(
    await git.listFiles({ ...repo, ref: initialHead }),
  );

  // Verify the configured branch has not advanced. Never force push.
  expect(await remoteBranchOid(remote!, username, token!)).toBe(initialHead);
  pushOid = deleted;
  await page.getByRole('button', { name: 'select-git', exact: true }).click();
  await page
    .getByRole('button', { name: 'Push to Remote', exact: true })
    .click();
  const pushDialog = page.getByRole('dialog');
  await expect(pushDialog.getByTestId('field-branch')).toHaveValue(branch);
  await pushDialog.getByTestId('field-repoUsername').fill(username);
  await pushDialog
    .getByTestId('field-repoPassword')
    .evaluate((element, secret) => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )!.set!.call(element, secret);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, token!);
  await pushDialog.locator('#force').uncheck();
  await pushDialog.getByTestId('submit-button').click();
  try {
    await expect(pushDialog).toBeHidden({ timeout: 60_000 });
  } catch {
    await testInfo.attach('push-error', {
      body: redact(
        `${diagnostics.join('\n')}\n\n${await page.locator('body').innerText()}`,
      ),
      contentType: 'text/plain',
    });
    throw new Error(
      `Push to ${branch} did not complete; see the sanitized push-error attachment`,
    );
  }
  expect(await remoteBranchOid(remote!, username, token!)).toBe(deleted);
  await testInfo.attach('pushed-branch', {
    body: JSON.stringify({ branch, added, deleted }, null, 2),
    contentType: 'application/json',
  });
});
