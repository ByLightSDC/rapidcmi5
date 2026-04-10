import { ChangeEvent, useEffect, useState } from 'react';
import { placeholderAvatar } from '../quotes/constants';

const IMAGE_DIR = './Assets/Images/';

export function useImageDialog({
  defaultSrc = placeholderAvatar,
}: {
  defaultSrc?: string;
}) {
  const [src, setSrc] = useState<string>(defaultSrc);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [altText, setAltText] = useState<string>('');

  // handle file selection
  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      setSelectedFiles(fileList);
      if (fileList.length > 0) {
        setAltText(fileList[0].name.replace(/\.[^/.]+$/, '')); // removes file extension
        setSrc(`${IMAGE_DIR}${fileList[0].name}`);
      }
    } else {
      setSelectedFiles(null);
    }
  };

  // set the initial values based on if the user is inserting a new image or
  // editing an existing image
  useEffect(() => {
    //console.log('wipe');
    //setSrc(defaultSrc);

    // clear the file regardless of the editing state
    setSelectedFiles(null);
  }, []);

  return {
    src,
    handleFileSelected,
    selectedFiles,
    setSrc,
  };
}
