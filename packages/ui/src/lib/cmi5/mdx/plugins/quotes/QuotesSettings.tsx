import { Box, Paper, Stack, styled, Typography } from '@mui/material';
import ModalDialog from 'packages/ui/src/lib/modals/ModalDialog';
import { useCallback, useState } from 'react';
import Grid from '@mui/material/Grid2';
import { ButtonModalMainUi } from 'packages/ui/src/lib/inputs/buttons/buttonsmodal';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useImageDialog } from '../image/useImageDialog';
import { useCellValue } from '@mdxeditor/editor';
import { QUOTE_PRESETS, QuotePreset } from '@rapid-cmi5/ui';
import { imageUploadHandler$ } from '../image/methods';

// used for uploading files
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

/**
 * Modal dialog for configuring a quotes block.
 *
 * Allows the user to select a layout preset and upload an avatar image.
 * Calls `imageUploadHandler` when a new file is selected, then passes
 * the resolved src and chosen preset back via `handleSubmit`.
 *
 * @param currentAvatar - Current avatar path or URL pre-populated in the dialog.
 * @param currentPreset - The active preset to pre-select in the layout picker.
 * @param handleCancel - Called when the user dismisses the dialog without saving.
 * @param handleSubmit - Called with the chosen preset and image src on confirm.
 */
export const QuotesSettings = ({
  currentAvatar,
  currentPreset,
  handleCancel,
  handleSubmit,
}: {
  currentAvatar?: string;
  currentPreset?: QuotePreset;
  handleCancel: () => void;
  handleSubmit: (preset: QuotePreset, src: string) => void;
}) => {
  const [selectedPreset, setSelectedPreset] = useState<QuotePreset>(
    currentPreset || QUOTE_PRESETS[0],
  );

  const { handleFileSelected, selectedFiles, src } = useImageDialog({
    defaultSrc: currentAvatar,
  });
  const imageUploadHandler = useCellValue(imageUploadHandler$);

  const handleApply = useCallback(() => {
    if (selectedFiles && selectedFiles.length > 0) {
      console.log('upload file here-------------', selectedFiles);
      if (imageUploadHandler) {
        imageUploadHandler(selectedFiles[0]);
      }
    }
    handleSubmit(selectedPreset, src);
  }, [selectedPreset, src]);

  return (
    <ModalDialog
      maxWidth="sm"
      title="Quotes"
      buttons={['Cancel', 'Apply']}
      dialogProps={{
        open: true,
      }}
      handleAction={(index: number) => {
        if (index === 0) {
          handleCancel();
        } else {
          handleApply();
        }
      }}
    >
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1" gutterBottom>
            Select Layout
          </Typography>
          <Grid container spacing={2}>
            {QUOTE_PRESETS.map((preset) => (
              <Grid size={6} key={preset.id}>
                <Paper
                  variant={
                    selectedPreset.id === preset.id ? 'elevation' : 'outlined'
                  }
                  elevation={selectedPreset.id === preset.id ? 4 : 0}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    border:
                      selectedPreset.id === preset.id
                        ? '2px solid'
                        : '1px solid',
                    borderColor:
                      selectedPreset.id === preset.id
                        ? 'primary.main'
                        : 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => {
                    setSelectedPreset(preset);
                  }}
                >
                  <Typography
                    variant="caption"
                    align="center"
                    display="block"
                    sx={{ mb: 1, fontWeight: 'medium' }}
                  >
                    {preset.name}
                  </Typography>
                  {/* Visual preview: render equal-width mini grid boxes */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}></Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Typography variant="subtitle1" gutterBottom>
            Select Avatar
          </Typography>
          <Stack spacing={2}>
            {/* Files upload section */}
            <Stack direction="row" spacing={2}>
              <ButtonModalMainUi
                component="label"
                role={undefined}
                tabIndex={-1}
                startIcon={<UploadFileIcon />}
              >
                Upload File
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelected}
                />
              </ButtonModalMainUi>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" align="center">
                  {selectedFiles && selectedFiles.length > 0 ? (
                    <Box component="span">
                      {Array.from(selectedFiles).map(
                        (file: File, index: number) => (
                          <span key={file.name}>
                            {file.name}
                            {index < selectedFiles.length - 1 && ', '}
                          </span>
                        ),
                      )}
                    </Box>
                  ) : (
                    currentAvatar || 'No image file chosen'
                  )}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </ModalDialog>
  );
};

export default QuotesSettings;
