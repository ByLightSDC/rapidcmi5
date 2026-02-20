/* eslint-disable @typescript-eslint/no-explicit-any */
import { commitChangesModalId } from '../../modals/constants';
import { FormControlUIProvider, FormStateType, MiniForm, ModalDialog, AlignmentToolbarControls } from '@rapid-cmi5/ui';
import { UseFormReturn } from 'react-hook-form';

/* MUI */
import Grid from '@mui/material/Grid2';
import { Slider, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { modal } from '@rapid-cmi5/ui';
import React from 'react';
import { BlockPaddingEnum, ContentWidthEnum, DefaultAlignmentEnum, LessonTheme } from '@rapid-cmi5/cmi5-build-common';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const contentWidthDescriptions = new Map<string, string>([
  ['none', 'No width constraint (default)'],
  ['small', 'Narrow content area (55% of available width)'],
  ['medium', 'Standard content area (75% of available width)'],
  ['large', 'Full width content area'],
]);

const blockPaddingDescriptions = new Map<string, string>([
  ['none', 'No block spacing (default)'],
  ['small', 'Compact spacing between blocks (8px)'],
  ['medium', 'Standard spacing between blocks (32px)'],
  ['large', 'Generous spacing between blocks (64px)'],
  ['custom', 'Custom padding value'],
]);

export function LessonSettingsForm({
  handleCloseModal,
  handleModalAction,
  currentTheme,
}: {
  handleCloseModal: () => void;
  handleModalAction: (theme: LessonTheme) => void;
  currentTheme?: LessonTheme;
}) {
  const modalObj = useSelector(modal);

  const [contentWidth, setContentWidth] = React.useState<ContentWidthEnum>(
    currentTheme?.contentWidth || ContentWidthEnum.None,
  );
  const [blockPadding, setBlockPadding] = React.useState<BlockPaddingEnum>(
    currentTheme?.blockPadding || BlockPaddingEnum.None,
  );
  const [customPadding, setCustomPadding] = React.useState<number>(currentTheme?.blockPaddingCustomValue ?? 16);
  const [defaultAlignment, setDefaultAlignment] = React.useState<DefaultAlignmentEnum>(
    currentTheme?.defaultAlignment || DefaultAlignmentEnum.Left,
  );

  const validationSchema = yup.object().shape({});

  const onClose = () => handleCloseModal();
  const onCancel = () => handleCloseModal();

  const onResponse = (isSuccess: boolean, data: any, message: string) => {
    if (isSuccess) {
      const theme: LessonTheme = {
        contentWidth,
        blockPadding,
        defaultAlignment,
      };
      if (blockPadding === BlockPaddingEnum.Custom) {
        theme.blockPaddingCustomValue = customPadding;
      }
      handleModalAction(theme);
    }
  };

  const getFormFields = (formMethods: UseFormReturn, formState: FormStateType): JSX.Element => {
    return (
      <>
        {/* Content Width */}
        <Grid size={11.5}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Content width
          </Typography>
          <ToggleButtonGroup
            value={contentWidth}
            exclusive
            onChange={(_, val) => {
              if (val !== null) setContentWidth(val);
            }}
            size="small"
            fullWidth
          >
            <ToggleButton value={ContentWidthEnum.None}>None</ToggleButton>
            <ToggleButton value={ContentWidthEnum.Small}>S</ToggleButton>
            <ToggleButton value={ContentWidthEnum.Medium}>M</ToggleButton>
            <ToggleButton value={ContentWidthEnum.Large}>L</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {contentWidthDescriptions.get(contentWidth)}
          </Typography>
        </Grid>

        {/* Block Padding */}
        <Grid size={11.5} sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Block padding
          </Typography>
          <ToggleButtonGroup
            value={blockPadding}
            exclusive
            onChange={(_, val) => {
              if (val !== null) setBlockPadding(val);
            }}
            size="small"
            fullWidth
          >
            <ToggleButton value={BlockPaddingEnum.None}>None</ToggleButton>
            <ToggleButton value={BlockPaddingEnum.Small}>S</ToggleButton>
            <ToggleButton value={BlockPaddingEnum.Medium}>M</ToggleButton>
            <ToggleButton value={BlockPaddingEnum.Large}>L</ToggleButton>
            <ToggleButton value={BlockPaddingEnum.Custom}>
              <MoreHorizIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {blockPaddingDescriptions.get(blockPadding)}
          </Typography>
          {blockPadding === BlockPaddingEnum.Custom && (
            <>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Top and Bottom
              </Typography>
              <Grid container alignItems="center" spacing={2}>
                <Grid size={9}>
                  <Slider
                    value={customPadding}
                    onChange={(_, val) => setCustomPadding(val as number)}
                    min={0}
                    max={64}
                    step={4}
                  />
                </Grid>
                <Grid size={3}>
                  <Typography variant="body2" textAlign="center">
                    {customPadding}
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>

        {/* Default Alignment */}
        <Grid size={11.5} sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Default alignment
          </Typography>
          <AlignmentToolbarControls
            currentAlignment={defaultAlignment}
            onAlignmentChange={(val) => setDefaultAlignment(val as DefaultAlignmentEnum)}
          />
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Sets the default text alignment for all slides in this lesson. Per-component alignment overrides take
            precedence.
          </Typography>
        </Grid>
      </>
    );
  };

  return (
    <ModalDialog
      testId={commitChangesModalId}
      buttons={[]}
      dialogProps={{
        open: true,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={{}}
          formTitle="Lesson Settings"
          getFormFields={getFormFields}
          instructions=""
          submitButtonText="Save"
          failToasterMessage="Lesson Settings update failed"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default LessonSettingsForm;
