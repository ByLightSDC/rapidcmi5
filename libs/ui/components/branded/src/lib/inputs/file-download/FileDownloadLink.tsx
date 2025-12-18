import { IconButton, Stack, Typography } from '@mui/material';
import { DownloadFileData } from '@rapid-cmi5/types/cmi5';
import { useEffect, useState } from 'react';

import FilePresentIcon from '@mui/icons-material/FilePresent';

/**
 * FileDownloadLink
 * Displays href link for downloading a file
 * @param param0
 * @returns React Component
 */
export const FileDownloadLink = ({
  fileData,
  filePath,
  auDir,
  getLinkUrl,
}: {
  fileData: DownloadFileData;
  filePath: string;
  auDir: string;
  getLinkUrl?: (
    filePath: string,
    slidePath: string,
    fileType?: string,
    shouldNotCache?: boolean,
  ) => Promise<string | null>;
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const handleDownload = () => {
    if (blobUrl) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileData.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const loadFile = async () => {
      if (getLinkUrl) {
        const blobUrl = await getLinkUrl?.(
          filePath,
          auDir,
          fileData.type,
          true,
        );
        setBlobUrl(blobUrl);
      } else {
        setBlobUrl(filePath);
      }
    };

    if (fileData.path) {
      loadFile();
    }
  }, [auDir, fileData.path, fileData.type, getLinkUrl]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {blobUrl && (
        <Stack direction="row" sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleDownload}>
            <FilePresentIcon />
          </IconButton>
          <a href={`${blobUrl}`} download={fileData.name}>
            {fileData.name}
          </a>
        </Stack>
      )}
      {!blobUrl && <Typography>Loading link...</Typography>}
    </>
  );
};
