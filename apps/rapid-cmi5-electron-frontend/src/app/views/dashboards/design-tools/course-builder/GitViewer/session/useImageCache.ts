import { useEffect, useRef } from 'react';
import { getRepoPath, GitFS } from '../utils/fileSystem';
import {
  Course,
  RepoAccessObject,
} from 'apps/rapid-cmi5-electron-frontend/src/app/redux/repoManagerReducer';
import path from 'path-browserify';
import { getRepoAccess } from './GitContext';

export const useImageCache = (
  repoAccessObject: RepoAccessObject | null,
  currentCourse: Course | null,
  slideNumber: number,
  fsInstance: GitFS,
) => {
  const imageCache = useRef<Map<string, string>>(new Map());

  /**
   * getLocalFileBlob
   * @param filePath
   * @param slidePath
   * @param fileType
   * @returns Blob for any type of file
   */
  const getLocalFileBlob = async (
    filePath: string,
    slidePath: string,
    fileType?: string,
  ): Promise<Blob | MediaSource | null> => {
    const r = getRepoAccess(repoAccessObject);
    if (!currentCourse?.basePath) return null;
    const pathto = path.join(slidePath, filePath);
    const theBlob = await fsInstance.blobImageFile(
      r,
      pathto,
      fileType || 'image/png',
    );

    return theBlob;
  };

  /**
   * getLocalFileBlobUrl
   * @param filePath
   * @param slidePath
   * @param fileType
   * @param shouldNotCache
   * @returns Blob Link URL
   */
  const getLocalFileBlobUrl = async (
    filePath: string,
    slidePath: string,
    fileType?: string,
    shouldNotCache?: boolean,
  ): Promise<string | null> => {
    if (!currentCourse?.basePath) return null;

    const r = getRepoAccess(repoAccessObject);
    const repoPath = getRepoPath(r);

    const pathto = path.join(slidePath, filePath);
    const cacheKey = `${repoPath}/${pathto}`;
    const cached = imageCache.current.get(cacheKey);
    if (cached) return cached;

    const theBlob = await fsInstance.blobImageFile(
      r,
      pathto,
      fileType || 'image/png',
    );

    if (theBlob !== null) {
      const blobUrl = URL.createObjectURL(theBlob as Blob);
      if (!shouldNotCache) {
        imageCache.current.set(cacheKey, blobUrl);
      }
      return blobUrl;
    }

    return null;
  };

  useEffect(() => {
    if (!repoAccessObject) {
      return;
    }
    // Cleanup image blob URLs to avoid memory leaks
    imageCache.current.forEach((url) => URL.revokeObjectURL(url));
    imageCache.current = new Map();

    return () => {
      if (imageCache.current) {
        imageCache.current.forEach((url) => URL.revokeObjectURL(url));
      }
    };
  }, [slideNumber]);

  return { getLocalFileBlob, getLocalFileBlobUrl };
};
