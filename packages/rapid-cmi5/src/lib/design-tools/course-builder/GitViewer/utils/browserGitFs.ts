import { normalize } from 'path-browserify';
import type { FileSystemObject } from './fileSystem';
import { RAPID_GIT_CONFIG, usesRapidGitConfig } from './gitMetadata';

const adapters = new WeakMap<object, FileSystemObject>();

/**
 * isomorphic-git hardcodes .git/config. Redirect only browser local config
 * operations; objects, refs, HEAD and the index stay shared with desktop Git.
 * Use this adapter for Git calls, leaving ordinary filesystem access intact.
 */
export function wrapBrowserGitFs(fs: FileSystemObject): FileSystemObject {
  const cached = adapters.get(fs);
  if (cached) return cached;

  const mapPath = (value: unknown): unknown => {
    if (typeof value !== 'string') return value;
    const filepath = normalize(value);
    return usesRapidGitConfig(filepath) && filepath.endsWith('/.git/config')
      ? `${filepath.slice(0, -'config'.length)}${RAPID_GIT_CONFIG}`
      : value;
  };
  const promises = new Proxy(fs.promises, {
    get(target, method) {
      const original = Reflect.get(target, method);
      if (typeof original !== 'function') return original;
      return (...args: unknown[]) => {
        const filepath = typeof args[0] === 'string' ? normalize(args[0]) : '';
        // init creates an unused hooks directory, which Chrome blocks. No Git
        // hook is executed by this app, so no on-disk directory is necessary.
        if (
          method === 'mkdir' &&
          usesRapidGitConfig(filepath) &&
          filepath.endsWith('/.git/hooks')
        ) {
          return Promise.resolve(undefined);
        }
        args[0] = mapPath(args[0]);
        if (method === 'rename' || method === 'copyFile' || method === 'link') {
          args[1] = mapPath(args[1]);
        }
        return Reflect.apply(original, target, args);
      };
    },
  });
  const adapter = new Proxy(fs, {
    get(target, property) {
      return property === 'promises' ? promises : Reflect.get(target, property);
    },
  });
  adapters.set(fs, adapter);
  return adapter;
}
