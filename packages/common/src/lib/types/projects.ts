export type DirMeta = {
  // not needed for electron
  dirHandle?: FileSystemDirectoryHandle;
  id: string;
  createdAt?: string;
  name: string;
  isValid: boolean;
  lastAccessed: string;
  remoteUrl?: string;
};
