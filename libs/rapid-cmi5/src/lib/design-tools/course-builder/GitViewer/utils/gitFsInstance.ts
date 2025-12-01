// gitFsInstance.ts

import { GitFS } from "./fileSystem";

export function detectIsElectron(): boolean {
  // tweak this however you detect it
  return typeof window !== 'undefined' && !!(window as any).fsApi;
}

export const gitFs = new GitFS(detectIsElectron());
