import { Box, Paper, Stack, styled, Typography } from '@mui/material';
import ModalDialog from 'packages/ui/src/lib/modals/ModalDialog';
import { useMemo, useState } from 'react';
import Grid from '@mui/material/Grid2';
import { QUOTE_PRESETS } from './constants';
import { QuotePreset } from './types';
import { ButtonModalMainUi } from 'packages/ui/src/lib/inputs/buttons/buttonsmodal';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useImageDialog } from '../image/useImageDialog';

export const QuotesLayoutSettings = ({
  avatar,
  currentPreset,
  handleCancel,
  handleSubmit,
}: {
  avatar?: string;
  currentPreset?: QuotePreset;
  handleCancel: () => void;
  handleSubmit: (preset: QuotePreset, src: string) => void;
}) => {
  const [selectedPreset, setSelectedPreset] = useState<QuotePreset>(
    currentPreset || QUOTE_PRESETS[0],
  );

  const {
    handleFileSelected,
    handleSaveImage,
    selectedFiles,
    src,
    VisuallyHiddenInput,
  } = useImageDialog({ defaultSrc: avatar });

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
          if (src !== avatar && selectedFiles && selectedFiles.length > 0) {
            console.log('save image', src);
            handleSaveImage();
          }
          handleSubmit(selectedPreset, src);
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
                  accept="image/*" // restrict to image files only
                  onChange={handleFileSelected}
                  multiple
                />
              </ButtonModalMainUi>
              <Box /* vertically center the text */
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
                    'No image file chosen'
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

export default QuotesLayoutSettings;
