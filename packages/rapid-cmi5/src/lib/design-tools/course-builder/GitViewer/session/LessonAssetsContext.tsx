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
import { debugLog } from '@rapid-cmi5/ui';

export type AssetType = 'image' | 'video' | 'audio' | 'file';

const ASSET_DIRS: Record<AssetType, string> = {
  image: 'Assets/Images',
  video: 'Assets/Videos',
  audio: 'Assets/Audio',
  file: 'Assets/Downloads',
};

export const AUDIO_DIR = ASSET_DIRS.audio;
export const FILE_DIR = ASSET_DIRS.file;

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

  // A custom guard to check current context for each transaction
  const getRequiredContext = () => {
    if (!currentAuPathSel) throw new Error('No au path');
    if (!currentRepoAccessObject) throw new Error('No Repo Access Object');

    return {
      auPath: currentAuPathSel,
      repo: currentRepoAccessObject,
    };
  };

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

  const getAllAssets = async (type: AssetType): Promise<string[]> => {
    const { auPath, repo } = getRequiredContext();
    const path = join(auPath, ASSET_DIRS[type]);
    return await gitFs.listDirectoryFiles(repo, path);
  };

  const getLocalFileBlob = async (
    filePath: string,
    fileType?: string,
  ): Promise<Blob | MediaSource | null> => {
    const { auPath, repo } = getRequiredContext();

    const pathto = join(auPath, filePath);
    return await gitFs.blobImageFile(repo, pathto, fileType || 'image/png');
  };

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

  useEffect(() => {
    if (!currentRepoAccessObject) return;
    debugLog('clean up image cache');
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

export const useFsAssets = () => useContext(CurrentLessonAssetsContext);
