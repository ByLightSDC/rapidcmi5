// gitFsInstance.ts

import { GitFS } from './fileSystem';

export function detectIsElectron(): boolean {
  // tweak this however you detect it
  return typeof window !== 'undefined' && !!(window as any).fsApi;
}

let gitFs: GitFS;

export function getFsInstance(isElectron? : boolean) {
  if (!gitFs) {
    gitFs = new GitFS(isElectron || detectIsElectron());
  }
  return gitFs;
}

export function createNewFsInstance(isElectron? : boolean) {
  gitFs = new GitFS(isElectron || detectIsElectron());
  return gitFs;
}
