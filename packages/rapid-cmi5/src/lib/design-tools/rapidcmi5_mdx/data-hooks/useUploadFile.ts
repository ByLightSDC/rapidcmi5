import { useMemo } from 'react';
import {
  AssetType,
  useFsAssets,
} from '../../course-builder/GitViewer/session/LessonAssetsContext';

export type AssetUploadHandler = (file: File) => Promise<string>;

const readFileAsBytes = (file: File): Promise<Uint8Array<ArrayBuffer>> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (!reader.result) {
        reject(new Error('FileReader returned no result'));
        return;
      }

      resolve(new Uint8Array(reader.result as ArrayBuffer));
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

/**
 * Returns upload handlers keyed by asset type. Each handler writes the
 * selected file into the lesson asset filesystem and returns the saved
 * asset path.
 */
export const useAssetUploadHandlers = (): Record<
  AssetType,
  AssetUploadHandler
> => {
  const { uploadAsset } = useFsAssets();

  return useMemo(() => {
    const make =
      (type: AssetType): AssetUploadHandler =>
      async (file) => {
        try {
          const data = await readFileAsBytes(file);
          return await uploadAsset(type, file.name, data);
        } catch (error) {
          console.error('[useAssetUploadHandlers] Error saving file:', error);
          return '';
        }
      };

    return {
      image: make('image'),
      video: make('video'),
      audio: make('audio'),
      file: make('file'),
    };
  }, [uploadAsset]);
};
