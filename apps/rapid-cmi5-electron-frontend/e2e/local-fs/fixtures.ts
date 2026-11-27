import {
  test as base,
  expect,
  chromium,
  BrowserContext,
  Page,
} from '@playwright/test';
import { mkdtemp, mkdir, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative } from 'node:path';

declare global {
  interface DataTransferItem {
    getAsFileSystemHandle(): Promise<FileSystemHandle | null>;
  }
  interface FileSystemDirectoryHandle {
    queryPermission(options: {
      mode: 'read' | 'readwrite';
    }): Promise<PermissionState>;
    keys(): AsyncIterableIterator<string>;
  }
  interface Window {
    showDirectoryPicker(options?: {
      id?: string;
      mode?: 'read' | 'readwrite';
      startIn?:
        | 'desktop'
        | 'documents'
        | 'downloads'
        | 'music'
        | 'pictures'
        | 'videos'
        | FileSystemHandle;
    }): Promise<FileSystemDirectoryHandle>;
    __localFolderTest: {
      handle?: FileSystemDirectoryHandle;
      dropped?: Promise<FileSystemHandle | null>;
      pickerCalls: number;
    };
  }
}

type LocalFolder = {
  root: string;
  folder: string;
  page: Page;
  context: BrowserContext;
  selectFolder: (folder: string) => Promise<void>;
  restart: () => Promise<Page>;
};

export const test = base.extend<{
  localFolder: LocalFolder;
  recordTrace: boolean;
}>({
  recordTrace: [true, { option: true }],
  localFolder: async (
    { baseURL, headless, httpCredentials, recordTrace },
    use,
    testInfo,
  ) => {
    // No user-supplied directory/profile is accepted. All writes and cleanup
    // are confined to a fresh directory allocated by the operating system.
    const root = await realpath(
      await mkdtemp(join(tmpdir(), 'rapidcmi5-local-fs-')),
    );
    const folder = join(root, 'projects');
    const profile = join(root, 'chrome-profile');
    await mkdir(folder);
    await mkdir(join(profile, 'Default'), { recursive: true });
    await writeFile(
      join(profile, 'Default', 'Preferences'),
      JSON.stringify({
        profile: {
          default_content_setting_values: {
            file_system_write_guard: 1,
            file_system_read_guard: 1,
          },
        },
      }),
    );

    let context: BrowserContext | undefined;
    let page: Page;
    let launchCount = 0;
    const launch = async () => {
      context = await chromium.launchPersistentContext(profile, {
        channel: process.env.LOCAL_FS_CHANNEL || 'chrome',
        headless,
        args: ['--disable-web-security'],
        baseURL,
        httpCredentials,
        viewport: { width: 1440, height: 1000 },
      });
      context.setDefaultTimeout(15_000);
      context.setDefaultNavigationTimeout(30_000);
      await testInfo.attach(`browser-${++launchCount}`, {
        body: JSON.stringify(
          {
            channel: process.env.LOCAL_FS_CHANNEL || 'chrome',
            version: context.browser()?.version(),
            platform: process.platform,
            headless,
            webSecurityDisabled: true,
          },
          null,
          2,
        ),
        contentType: 'application/json',
      });
      if (recordTrace)
        await context.tracing.start({
          screenshots: true,
          snapshots: true,
          sources: true,
        });
      // Only the OS picker is replaced. The supplied handle is created by
      // Chrome from a real directory drop; no filesystem methods are mocked.
      await context.addInitScript(() => {
        if (typeof window.showDirectoryPicker !== 'function') {
          throw new Error(
            'This browser does not expose the native File System Access picker',
          );
        }
        window.__localFolderTest = { pickerCalls: 0 };
        Object.defineProperty(window, 'showDirectoryPicker', {
          configurable: true,
          value: async () => {
            const state = window.__localFolderTest;
            state.pickerCalls++;
            if (!state.handle)
              throw new Error(
                'Unexpected folder picker: no temporary folder selected',
              );
            return state.handle;
          },
        });
      });
      page = context.pages()[0] || (await context.newPage());
      await page.goto('/');
      return page;
    };
    const close = async () => {
      if (!context) return;
      const tracePath = testInfo.outputPath(`trace-${launchCount}.zip`);
      try {
        if (recordTrace) {
          await context.tracing.stop({ path: tracePath });
          await testInfo.attach(`trace-${launchCount}`, {
            path: tracePath,
            contentType: 'application/zip',
          });
        } else {
          // Clear credential-bearing UI before failure snapshots are collected.
          for (const tab of context.pages())
            await tab
              .evaluate(() => {
                window.stop();
                // document.open also removes unload listeners that would block
                // closing a dirty test editor with a native confirmation.
                document.open();
                document.write(
                  '<!doctype html><title>Credential test finished</title>',
                );
                document.close();
              })
              .catch(() => {});
        }
      } finally {
        await context.close();
        context = undefined;
      }
    };

    try {
      await launch();
      await use({
        root,
        folder,
        get page() {
          return page;
        },
        get context() {
          return context!;
        },
        restart: async () => {
          await close();
          return launch();
        },
        selectFolder: async (selectedFolder) => {
          const resolved = await realpath(selectedFolder);
          const child = relative(folder, resolved);
          if (child.startsWith('..') || isAbsolute(child)) {
            throw new Error(
              'Folder selection must stay inside this test’s temporary projects directory',
            );
          }
          // A CDP directory drop gives us a native, structured-cloneable
          // FileSystemDirectoryHandle pointing to the OS temp directory.
          // Keep the capture surface separate from the application's handlers.
          await page.evaluate(() => {
            const target = document.createElement('div');
            target.id = 'local-folder-test-drop';
            Object.assign(target.style, {
              position: 'fixed',
              inset: '0',
              zIndex: '2147483647',
            });
            target.addEventListener('dragenter', (e) => {
              e.preventDefault();
              e.stopPropagation();
            });
            target.addEventListener('dragover', (e) => {
              e.preventDefault();
              e.stopPropagation();
            });
            target.addEventListener('drop', (e) => {
              e.preventDefault();
              e.stopPropagation();
              window.__localFolderTest.dropped =
                e.dataTransfer!.items[0].getAsFileSystemHandle();
            });
            document.body.append(target);
          });
          const cdp = await context!.newCDPSession(page);
          try {
            for (const type of ['dragEnter', 'dragOver', 'drop'] as const) {
              await cdp.send('Input.dispatchDragEvent', {
                type,
                x: 20,
                y: 20,
                data: { items: [], files: [resolved], dragOperationsMask: 1 },
              });
            }
            const result = await page.evaluate(async () => {
              const handle = await window.__localFolderTest.dropped;
              document.getElementById('local-folder-test-drop')!.remove();
              if (!(handle instanceof FileSystemDirectoryHandle))
                throw new Error(
                  'Chrome did not supply a native directory handle',
                );
              window.__localFolderTest.handle = handle;
              return {
                name: handle.name,
                permission: await handle.queryPermission({ mode: 'readwrite' }),
              };
            });
            expect(result.permission).toBe('granted');
          } finally {
            await cdp.detach();
          }
        },
      });
    } finally {
      try {
        await close();
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    }
  },
});

export { expect };
