import { Box, Paper, Stack, Typography } from '@mui/material';
import ModalDialog from 'packages/ui/src/lib/modals/ModalDialog';
import { useCallback, useState } from 'react';
import Grid from '@mui/material/Grid2';
import { STATEMENT_PRESETS, StatementPreset } from '@rapid-cmi5/ui';


/**
 * Modal dialog for configuring a statements block.
 *
 * Allows the user to select a layout preset , then passes
 * the chosen preset back via `handleSubmit`.
 *

 * @param currentPreset - The active preset to pre-select in the layout picker.
 * @param handleCancel - Called when the user dismisses the dialog without saving.
 * @param handleSubmit - Called with the chosen preset and image src on confirm.
 */
export const StatementsSettings = ({
  currentPreset,
  handleCancel,
  handleSubmit,
}: {
  currentPreset?: StatementPreset;
  handleCancel: () => void;
  handleSubmit: (preset: StatementPreset) => void;
}) => {
  const [selectedPreset, setSelectedPreset] = useState<StatementPreset>(
    currentPreset || STATEMENT_PRESETS[0],
  );



  const handleApply = useCallback(() => {
    handleSubmit(selectedPreset);
  }, [selectedPreset]);

  return (
    <ModalDialog
      maxWidth="sm"
      title="Statements"
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
            {STATEMENT_PRESETS.map((preset) => (
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
                  <Box sx={{ display: 'flex', gap: 0.5 }}></Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>
    </ModalDialog>
  );
};

export default StatementsSettings;
