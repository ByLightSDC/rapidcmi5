/*
  This context is to be used for upload and listing assets in the current lesson while in rapid cmi5.
  The purpose of the context is to upload and retrieve assets based on your current AU while in design mode.
*/

import { createContext, useContext, useEffect, useRef } from 'react';

import { useSelector } from 'react-redux';
import { getFsInstance } from '../utils/gitFsInstance';
import { join } from 'path-browserify';
import { currentRepoAccessObjectSel } from '../../../../redux/repoManagerReducer';
import {
  currentAuPath,
  currentSlideNum,
} from '../../../../redux/courseBuilderReducer';
import { useGitOperations } from './useGitOperations';

export type AssetType = 'image' | 'video' | 'audio' | 'file';

export const ASSET_DIRS: Record<AssetType, string> = {
  image: 'Assets/Images',
  video: 'Assets/Videos',
  audio: 'Assets/Audio',
  file: 'Assets/Downloads',
};

interface CurrentLessonAssetsContext {
  getAsset: (type: AssetType, fileName: string) => Promise<string | undefined>;
  uploadAsset: (
    type: AssetType,
    fileName: string,
    data: Uint8Array<ArrayBuffer>,
  ) => Promise<string>;
  getAllAssets: (type: AssetType) => Promise<string[]>;
  getLocalFileBlob: (
    filePath: string,
    fileType?: string,
  ) => Promise<Blob | MediaSource | null>;
  getLocalFileBlobUrl: (
    filePath: string,
    fileType?: string,
  ) => Promise<string | null>;
}

const defaultFsAssetsContext: CurrentLessonAssetsContext = {
  getAsset: async () => undefined,
  uploadAsset: async () => '',
  getAllAssets: async () => [],
  getLocalFileBlob: async () => null,
  getLocalFileBlobUrl: async () => null,
};

export const CurrentLessonAssetsContext =
  createContext<CurrentLessonAssetsContext>(defaultFsAssetsContext);

interface tProviderProps {
  children?: JSX.Element;
}

export const CurrentLessonAssetsContextProvider = (props: tProviderProps) => {
  const { children } = props;

  const currentAuPathSel = useSelector(currentAuPath);
  const currentRepoAccessObject = useSelector(currentRepoAccessObjectSel);
  const slideNumber = useSelector(currentSlideNum);

  const gitFs = getFsInstance();
  const { stageFile } = useGitOperations(gitFs, currentRepoAccessObject);

  const imageCache = useRef<Map<string, string>>(new Map());

  /**
   * Asserts that the current AU path and repo are available, and returns them
   * as a single object. Use at the top of every asset operation so callers
   * never have to null-check the context selectors themselves.
   *
   * @throws If there is no current AU path or no current repo access object.
   */
  const getRequiredContext = () => {
    if (!currentAuPathSel) throw new Error('No au path');
    if (!currentRepoAccessObject) throw new Error('No Repo Access Object');

    return {
      auPath: currentAuPathSel,
      repo: currentRepoAccessObject,
    };
  };

  /**
   * Looks up an asset by type and file name within the current AU.
   *
   * @param type - Which asset bucket to search (image, video, audio, file).
   * @param fileName - The asset's file name (not a full path).
   * @returns The AU-relative path (e.g. `./Assets/Images/foo.png`) if the file
   * exists, otherwise `undefined`.
   */
  const getAsset = async (
    type: AssetType,
    fileName: string,
  ): Promise<string | undefined> => {
    const { auPath, repo } = getRequiredContext();

    const dir = ASSET_DIRS[type];
    const exists = await gitFs.fileExists(repo, join(auPath, dir, fileName));
    if (exists) return `./${dir}/${fileName}`;
    return undefined;
  };

  /**
   * Writes a new asset into the current AU's asset directory for the given
   * type and stages it for commit.
   *
   * @param type - Which asset bucket to write into.
   * @param fileName - File name to save the asset as.
   * @param data - Raw file bytes to write.
   * @returns The AU-relative path to the saved asset
   * (e.g. `./Assets/Images/foo.png`).
   */
  const uploadAsset = async (
    type: AssetType,
    fileName: string,
    data: Uint8Array<ArrayBuffer>,
  ): Promise<string> => {
    const { auPath, repo } = getRequiredContext();

    const dir = ASSET_DIRS[type];
    const relativePath = join(auPath, dir, fileName);
    await gitFs.createFile(repo, relativePath, data);
    await stageFile(relativePath);
    return `./${dir}/${fileName}`;
  };

  /**
   * Lists every file name in the current AU's asset directory for the given
   * type. Subdirectories are excluded.
   *
   * @param type - Which asset bucket to list.
   * @returns An array of file names contained directly in that directory.
   */
  const getAllAssets = async (type: AssetType): Promise<string[]> => {
    const { auPath, repo } = getRequiredContext();
    const path = join(auPath, ASSET_DIRS[type]);
    return await gitFs.listDirectoryFiles(repo, path);
  };

  /**
   * Reads an asset out of the current AU as a Blob. Does not cache — every
   * call re-reads from the underlying filesystem.
   *
   * @param filePath - AU-relative path to the asset (e.g. `./Assets/Images/foo.png`).
   * @param fileType - MIME type to assign to the resulting Blob. Defaults to
   * `'image/png'`.
   * @returns The Blob, or `null` if the file could not be read.
   */
  const getLocalFileBlob = async (
    filePath: string,
    fileType?: string,
  ): Promise<Blob | MediaSource | null> => {
    const { auPath, repo } = getRequiredContext();

    const pathto = join(auPath, filePath);
    return await gitFs.blobImageFile(repo, pathto, fileType || 'image/png');
  };

  /**
   * Returns a cached object URL for an asset, creating one if needed. The
   * cache is keyed by `filePath` and wiped whenever the slide, AU, or repo
   * changes (URLs are revoked on cleanup).
   *
   * @param filePath - AU-relative path to the asset.
   * @param fileType - MIME type to assign when first creating the Blob.
   * Defaults to `'image/png'`.
   * @returns A blob URL safe to assign to `src`, or `null` if the file could
   * not be read.
   */
  const getLocalFileBlobUrl = async (
    filePath: string,
    fileType?: string,
  ): Promise<string | null> => {
    const cached = imageCache.current.get(filePath);
    if (cached) return cached;

    const theBlob = await getLocalFileBlob(filePath, fileType);
    if (theBlob === null) return null;

    const blobUrl = URL.createObjectURL(theBlob as Blob);
    imageCache.current.set(filePath, blobUrl);
    return blobUrl;
  };

  // We will cleanup the image cache anytime the slide, au, or repo changes
  useEffect(() => {
    if (!currentRepoAccessObject) return;
    imageCache.current.forEach((url) => URL.revokeObjectURL(url));
    imageCache.current = new Map();

    return () => {
      if (imageCache.current) {
        imageCache.current.forEach((url) => URL.revokeObjectURL(url));
      }
    };
  }, [slideNumber, currentAuPathSel, currentRepoAccessObject]);

  return (
    <CurrentLessonAssetsContext.Provider
      value={{
        getAsset,
        uploadAsset,
        getAllAssets,
        getLocalFileBlob,
        getLocalFileBlobUrl,
      }}
    >
      {children}
    </CurrentLessonAssetsContext.Provider>
  );
};

export const useLessonAssets = () => useContext(CurrentLessonAssetsContext);
