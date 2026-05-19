/*
  This context is to be used for upload and listing assets in the current lesson while in rapid cmi5.
  The purpose of the context is to upload and retrieve assets based on your current AU while in design mode.
*/

import { createContext, useContext } from 'react';

import { useSelector } from 'react-redux';
import { getFsInstance } from '../utils/gitFsInstance';
import { join } from 'path-browserify';
import { currentRepoAccessObjectSel } from '../../../../redux/repoManagerReducer';
import { currentAuPath } from '../../../../redux/courseBuilderReducer';
import { useGitOperations } from './useGitOperations';

export type AssetType = 'image' | 'video' | 'audio' | 'file';

const ASSET_DIRS: Record<AssetType, string> = {
  image: 'Assets/Images',
  video: 'Assets/Videos',
  audio: 'Assets/Audio',
  file: 'Assets/Downloads',
};

export const AUDIO_DIR = ASSET_DIRS.audio;
export const FILE_DIR = ASSET_DIRS.file;

interface IFsAssetsContext {
  getAsset: (type: AssetType, fileName: string) => Promise<string | undefined>;
  uploadAsset: (
    type: AssetType,
    fileName: string,
    data: Uint8Array<ArrayBuffer>,
  ) => Promise<string>;
  getAllAssets: (type: AssetType) => Promise<string[]>;
}

const defaultFsAssetsContext: IFsAssetsContext = {
  getAsset: async () => undefined,
  uploadAsset: async () => '',
  getAllAssets: async () => [],
};

export const CurrentLessonAssetsContext = createContext<IFsAssetsContext>(
  defaultFsAssetsContext,
);

interface tProviderProps {
  children?: JSX.Element;
}

export const FsAssetsContextProvider = (props: tProviderProps) => {
  const { children } = props;

  const currentAuPathSel = useSelector(currentAuPath);
  const currentRepoAccessObject = useSelector(currentRepoAccessObjectSel);

  const gitFs = getFsInstance();
  const { stageFile } = useGitOperations(gitFs, currentRepoAccessObject);

  const getAsset = async (
    type: AssetType,
    fileName: string,
  ): Promise<string | undefined> => {
    if (!currentAuPathSel) throw Error('No au path');
    if (!currentRepoAccessObject) throw Error('No Repo Access Object');
    const dir = ASSET_DIRS[type];
    const files = await gitFs
      .listDirectoryFiles(currentRepoAccessObject, join(currentAuPathSel, dir))
      .catch(() => [] as string[]);
    if (!files.includes(fileName)) return undefined;
    return `./${dir}/${fileName}`;
  };

  const uploadAsset = async (
    type: AssetType,
    fileName: string,
    data: Uint8Array<ArrayBuffer>,
  ): Promise<string> => {
    console.log('uploadAsset', type, fileName);
    if (!currentAuPathSel) throw Error('No au path');
    if (!currentRepoAccessObject) throw Error('No Repo Access Object');
    const dir = ASSET_DIRS[type];
    const relativePath = join(currentAuPathSel, dir, fileName);
    await gitFs.createFile(currentRepoAccessObject, relativePath, data);
    await stageFile(relativePath);
    return `./${dir}/${fileName}`;
  };

  const getAllAssets = async (type: AssetType): Promise<string[]> => {
    console.log('getAllAssets', type);
    if (!currentAuPathSel) throw Error('No au path');
    if (!currentRepoAccessObject) throw Error('No Repo Access Object');
    const path = join(currentAuPathSel, ASSET_DIRS[type]);
    return await gitFs.listDirectoryFiles(currentRepoAccessObject, path);
  };

  return (
    <CurrentLessonAssetsContext.Provider
      value={{
        getAsset,
        uploadAsset,
        getAllAssets,
      }}
    >
      {children}
    </CurrentLessonAssetsContext.Provider>
  );
};

export const useFsAssets = () => useContext(CurrentLessonAssetsContext);
