import { useCallback, useContext, useMemo } from 'react';
import {
  getRepoAccess,
  GitContext,
} from '../../course-builder/GitViewer/session/GitContext';
import { useSelector } from 'react-redux';

import { debugLog, debugLogError } from '@rapid-cmi5/ui';
import { getRepoPath } from '../../course-builder/GitViewer/utils/fileSystem';

import { join } from 'path-browserify';
import { currentAuPath } from '../../../redux/courseBuilderReducer';
import { currentRepoAccessObjectSel, RepoAccessObject } from '../../../redux/repoManagerReducer';

/**
 * This hook is used to create an image upload handler for the image plugin.
 * The upload handler takes care of writing the image to the local file system.
 * Note: imageUploadHandler uses a callback that is kept up-to-date whenever
 * the course or lesson changes.
 */
export const useImageFile = () => {
  const currentRepoAccessObject = useSelector(currentRepoAccessObjectSel);
  const { handleStageFile, handleCreateFile } = useContext(GitContext);

  const currentAuPathSel = useSelector(currentAuPath);

  const imagePath = 'Assets/Images';
  const videoPath = 'Assets/Videos';
  const audioPath = 'Assets/Audio';
  const defaultDownloadFilePath = 'Assets/Downloads';

  // memoized so the value is updated when current course or lesson changes

  const getGenericFilePath = (
    repoAccessObject: RepoAccessObject | null,
    auPath: string | undefined,
    filePath: string,
  ) => {
    if (!auPath) return '';

    try {
      const r = getRepoAccess(repoAccessObject);
      const repoPath = getRepoPath(r);
      return join(repoPath, auPath, filePath);
    } catch (error) {
      debugLog('Repo access not ready for file path', error);
      return '';
    }
  };

  const downloadFilePath = useMemo(() => {
    return getGenericFilePath(
      currentRepoAccessObject,
      currentAuPathSel,
      defaultDownloadFilePath,
    );
  }, [currentRepoAccessObject, currentAuPathSel, defaultDownloadFilePath]);

  const imageFilePath = useMemo(() => {
    return getGenericFilePath(
      currentRepoAccessObject,
      currentAuPathSel,
      imagePath,
    );
  }, [currentRepoAccessObject, currentAuPathSel, imagePath]);

  const videoFilePath = useMemo(() => {
    return getGenericFilePath(
      currentRepoAccessObject,
      currentAuPathSel,
      videoPath,
    );
  }, [currentRepoAccessObject, currentAuPathSel, videoPath]);

  const audioFilePath = useMemo(() => {
    return getGenericFilePath(
      currentRepoAccessObject,
      currentAuPathSel,
      audioPath,
    );
  }, [currentRepoAccessObject, currentAuPathSel, audioPath]);

  const imageUploadHandler = useCallback(
    async (image: File) => {
      try {
        const r = getRepoAccess(currentRepoAccessObject);
        const repoPath = getRepoPath(r);
        if (!repoPath || !currentAuPathSel) {
          debugLogError('Throw an error');
          return '';
        }

        const fileName = image.name;

        await new Promise<void>((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = async function () {
            try {
              if (fileReader.result) {
                const relativePath = join(currentAuPathSel, imagePath, fileName);
                const imgData = new Uint8Array(fileReader.result as ArrayBuffer);
                await handleCreateFile(relativePath, false, imgData);
                await handleStageFile(relativePath);
              }
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          fileReader.onerror = () => reject(fileReader.error);
          fileReader.readAsArrayBuffer(image);
        });

        return `./${imagePath}/${fileName}`;
      } catch {
        return '';
      }
    },
    [currentRepoAccessObject, currentAuPathSel],
  );

  const fileUploadHandler = useCallback(
    async (aFile: File) => {
      try {
        const r = getRepoAccess(currentRepoAccessObject);
        const repoPath = getRepoPath(r);

        if (!repoPath || !currentAuPathSel) {
          debugLogError('Throw an error');
          return '';
        }

        const fileName = aFile.name;

        await new Promise<void>((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = async function () {
            try {
              if (fileReader.result) {
                const fileData = new Uint8Array(fileReader.result as ArrayBuffer);
                await handleCreateFile(
                  `${currentAuPathSel}/${defaultDownloadFilePath}/${fileName}`,
                  false,
                  fileData,
                );
              }
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          fileReader.onerror = () => reject(fileReader.error);
          fileReader.readAsArrayBuffer(aFile);
        });

        const returnFilePath = `./${defaultDownloadFilePath}/${fileName}`;
        return returnFilePath;
      } catch {
        return '';
      }
    },
    [currentRepoAccessObject, currentAuPathSel],
  );

  const videoUploadHandler = useCallback(
    async (video: File) => {
      if (!currentRepoAccessObject || !currentAuPathSel) {
        debugLogError('Throw an error');
        return Promise.resolve('');
      }

      const fileName = video.name;

      await new Promise<void>((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = async function () {
          try {
            if (fileReader.result) {
              const videoData = new Uint8Array(fileReader.result as ArrayBuffer);
              const relativePath = join(currentAuPathSel, videoPath, fileName);
              await handleCreateFile(relativePath, false, videoData);
              await handleStageFile(relativePath);
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        fileReader.onerror = () => reject(fileReader.error);
        fileReader.readAsArrayBuffer(video);
      });

      const returnFilePath = `./${videoPath}/${fileName}`;
      return returnFilePath;
    },
    [currentRepoAccessObject, currentAuPathSel],
  );

  const audioUploadHandler = useCallback(
    async (audio: File) => {
      if (!currentRepoAccessObject || !currentAuPathSel) {
        debugLogError('Throw an error');
        return Promise.resolve('');
      }

      const fileName = audio.name;

      if (audio) {
        // Wait for file to be read and saved before returning
        await new Promise<void>((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = async function (event: any) {
            try {
              if (fileReader.result) {
                const audioData = new Uint8Array(
                  fileReader.result as ArrayBuffer,
                );

                const relativePath = join(
                  currentAuPathSel,
                  audioPath,
                  fileName,
                );

                await handleCreateFile(relativePath, false, audioData);
                await handleStageFile(relativePath);
              }

              resolve();
            } catch (error) {
              console.error('[audioUploadHandler] Error saving file:', error);
              reject(error);
            }
          };
          fileReader.onerror = () => reject(fileReader.error);
          fileReader.readAsArrayBuffer(audio);
        });
      }

      const returnFilePath = `./${audioPath}/${fileName}`;
      return Promise.resolve(returnFilePath);
    },
    [currentRepoAccessObject, currentAuPathSel],
  );

  return {
    fileUploadHandler,
    defaultDownloadFilePath,
    downloadFilePath,
    imageFilePath,
    imageUploadHandler,
    videoFilePath,
    videoUploadHandler,
    audioFilePath,
    audioUploadHandler,
  };
};
