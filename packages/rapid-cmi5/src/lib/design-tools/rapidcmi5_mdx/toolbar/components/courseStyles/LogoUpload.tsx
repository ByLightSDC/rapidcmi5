import { useCallback, useEffect, useState } from 'react';

import {
  Alert,
  FormControlLabel,
  Stack as MuiStack,
  Switch,
  Typography,
} from '@mui/material';
import { Box, Stack } from '@mui/system';
import {
  ButtonModalMinorUi,
  FileUpload,
  IMAGE_FILE_TYPES,
} from '@rapid-cmi5/ui';

import { useLessonAssets } from '../../../../course-builder/GitViewer/session/LessonAssetsContext';

type LogoUploadProps = {
  lightLogoPath: string;
  darkLogoPath: string;
  onSetLightLogo: (path: string) => void;
  onSetDarkLogo: (path: string) => void;
};

export default function LogoUpload({
  lightLogoPath,
  darkLogoPath,
  onSetLightLogo,
  onSetDarkLogo,
}: LogoUploadProps) {
  // "Same for both" is UI-only: when toggled on, uploads write to both
  // setters. Default to "same" when paths match (covers the empty/empty
  // initial state and the user-imported-once case).
  const [useSameLogo, setUseSameLogo] = useState(
    () => lightLogoPath === darkLogoPath,
  );

  const handleSetBoth = useCallback(
    (path: string) => {
      onSetLightLogo(path);
      onSetDarkLogo(path);
    },
    [onSetLightLogo, onSetDarkLogo],
  );

  const handleToggleSame = (next: boolean) => {
    setUseSameLogo(next);
    // When turning "same" on, mirror the light path into dark so the data
    // matches what the UI is now showing as a single shared logo.
    if (next && lightLogoPath !== darkLogoPath) {
      onSetDarkLogo(lightLogoPath);
    }
  };

  return (
    <Stack spacing={2}>
      <FormControlLabel
        control={
          <Switch
            checked={useSameLogo}
            onChange={(e) => handleToggleSame(e.target.checked)}
          />
        }
        label="Use same logo for light and dark mode"
      />

      {useSameLogo ? (
        <LogoSlot logoPath={lightLogoPath} onSetLogo={handleSetBoth} />
      ) : (
        <MuiStack spacing={2}>
          <LogoSlot
            label="Light logo"
            logoPath={lightLogoPath}
            onSetLogo={onSetLightLogo}
          />
          <LogoSlot
            label="Dark logo"
            logoPath={darkLogoPath}
            onSetLogo={onSetDarkLogo}
          />
        </MuiStack>
      )}
    </Stack>
  );
}

type LogoSlotProps = {
  label?: string;
  logoPath: string;
  onSetLogo: (path: string) => void;
};

function LogoSlot({ label, logoPath, onSetLogo }: LogoSlotProps) {
  const { setLessonLogo, getLocalFileBlobUrl } = useLessonAssets();

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [lookupComplete, setLookupComplete] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  useEffect(() => {
    if (!logoPath) {
      setLogoUrl(null);
      setLookupComplete(false);
      return;
    }
    let cancelled = false;
    setLookupComplete(false);
    void getLocalFileBlobUrl(logoPath).then((url) => {
      if (!cancelled) {
        setLogoUrl(url);
        setLookupComplete(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [logoPath, getLocalFileBlobUrl]);

  if (logoPath && logoUrl && !isReplacing) {
    return (
      <Stack spacing={1} alignItems="flex-start">
        {label && (
          <Typography variant="subtitle2" fontWeight="bold">
            {label}
          </Typography>
        )}
        <img
          src={logoUrl}
          alt={label ? `${label}` : 'Lesson logo'}
          style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain' }}
        />
        <ButtonModalMinorUi onClick={() => setIsReplacing(true)}>
          Replace logo
        </ButtonModalMinorUi>
      </Stack>
    );
  }

  const notFound = !!logoPath && lookupComplete && !logoUrl;

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      {notFound && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Logo file not found: {logoPath}
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
            // Resolve the blob URL up front so the image renders on the
            // same cycle as the prop change — otherwise intervening
            // re-renders can cancel the useEffect-driven lookup.
            const url = await getLocalFileBlobUrl(savedPath);
            setLogoUrl(url);
            setLookupComplete(true);
            setIsReplacing(false);
            onSetLogo(savedPath);
          } else {
            throw Error('Invalid file');
          }
        }}
      />
    </Box>
  );
}
