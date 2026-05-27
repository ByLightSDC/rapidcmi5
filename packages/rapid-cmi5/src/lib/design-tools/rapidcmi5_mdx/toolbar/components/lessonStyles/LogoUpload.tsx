import { useEffect, useState } from 'react';

import { Alert } from '@mui/material';
import { Box, Stack } from '@mui/system';
import {
  ButtonModalMinorUi,
  FileUpload,
  IMAGE_FILE_TYPES,
} from '@rapid-cmi5/ui';

import { useLessonAssets } from '../../../../course-builder/GitViewer/session/LessonAssetsContext';

export default function LogoUpload({
  currentLogoPath,
  handleSetContentLogo,
}: {
  currentLogoPath: string;
  handleSetContentLogo: (path: string) => void;
}) {
  const { setLessonLogo, getLocalFileBlobUrl } = useLessonAssets();

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [lookupComplete, setLookupComplete] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  useEffect(() => {
    if (!currentLogoPath) {
      setLogoUrl(null);
      setLookupComplete(false);
      return;
    }
    let cancelled = false;
    setLookupComplete(false);
    void getLocalFileBlobUrl(currentLogoPath).then((url) => {
      if (!cancelled) {
        setLogoUrl(url);
        setLookupComplete(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentLogoPath, getLocalFileBlobUrl]);

  if (currentLogoPath && logoUrl && !isReplacing) {
    return (
      <Stack spacing={1} alignItems="flex-start">
        <img
          src={logoUrl}
          alt="Lesson logo"
          style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain' }}
        />
        <ButtonModalMinorUi onClick={() => setIsReplacing(true)}>
          Replace logo
        </ButtonModalMinorUi>
      </Stack>
    );
  }

  const notFound = !!currentLogoPath && lookupComplete && !logoUrl;

  return (
    <Box>
      {notFound && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Logo file not found: {currentLogoPath}
        </Alert>
      )}
      <FileUpload
        buttonEmphasis={false}
        buttonTitle="Import..."
        dataCache={[]}
        fileTypes={IMAGE_FILE_TYPES}
        isUploading={false}
        noFileSelectedMessage="Import a logo to use for the lesson"
        onFileSelected={async (file: File, selected: boolean) => {
          if (selected && file instanceof File) {
            const bytes = new Uint8Array(await file.arrayBuffer());
            const savedPath = await setLessonLogo(file.name, bytes);
            handleSetContentLogo(savedPath);
            setIsReplacing(false);
          } else {
            throw Error('Invalid file');
          }
        }}
      />
    </Box>
  );
}
