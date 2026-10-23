import { commitChangesModalId } from '../../modals/constants';

import { UseFormReturn } from 'react-hook-form';

/* MUI */
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import * as yup from 'yup';
import { useSelector } from 'react-redux';
import React from 'react';
import {
  DEFAULT_SLIDE_DWELL_SECONDS,
  MoveOnCriteriaEnum,
  moveOnCriteriaOptions,
} from '@rapid-cmi5/cmi5-build-common';
import { modal, FormStateType, SelectorMainUi, ModalDialog, FormControlUIProvider, MiniForm } from '@rapid-cmi5/ui';

const moveOnOptionDescriptions = new Map<string, string>([
  [
    'completed',
    'The Assignable Unit (AU) is satisfied when all content is completed.',
  ],
  [
    'passed',
    'The Assignable Unit (AU) is satisfied when all content is passed.',
  ],
  [
    'completed-and-passed',
    'The Assignable Unit (AU) is satisfied when all content is completed and passed.',
  ],
  ['not-applicable', 'Not Applicable'],
]);

export function MoveOnCriteriaForm({
  handleCloseModal,
  handleModalAction,
  currentMoveOn,
  currentSlideDwellSeconds,
}: {
  handleCloseModal: () => void;
  handleModalAction: (
    moveOn: MoveOnCriteriaEnum,
    slideDwellSeconds: number,
  ) => void;
  currentMoveOn?: MoveOnCriteriaEnum;
  currentSlideDwellSeconds?: number;
}) {
  const modalObj = useSelector(modal);

  const [moveOnCriteria, setMoveOnCriteria] = React.useState(
    currentMoveOn || MoveOnCriteriaEnum.CompletedAndPassed,
  );
  const [slideDwellSeconds, setSlideDwellSeconds] = React.useState(
    String(currentSlideDwellSeconds ?? DEFAULT_SLIDE_DWELL_SECONDS),
  );
  const parsedDwellSeconds = Number(slideDwellSeconds);
  const isDwellValid =
    slideDwellSeconds.trim() !== '' &&
    Number.isInteger(parsedDwellSeconds) &&
    parsedDwellSeconds >= 0;

  const validationSchema = yup.object().shape({
    //
  });

  const onClose = () => {
    handleCloseModal();
  };

  const onCancel = () => {
    handleCloseModal();
  };

  const onResponse = (isSuccess: boolean, data: any, message: string) => {
    if (isSuccess && isDwellValid) {
      handleModalAction(moveOnCriteria, parsedDwellSeconds);
    }
  };

  const getFormFields = (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ): JSX.Element => {
    const { control, getValues, setValue, trigger } = formMethods;
    const { errors, isValid } = formState;
    return (
      <>
        <Grid size={11.5}>
          <SelectorMainUi
            defaultValue={moveOnCriteria}
            options={moveOnCriteriaOptions}
            onSelect={setMoveOnCriteria}
            listItemProps={{
              textTransform: 'capitalize',
            }}
          />
          <Typography variant="body2">
            {moveOnOptionDescriptions.get(moveOnCriteria)}
          </Typography>
        </Grid>
        <Grid size={11.5}>
          <TextField
            label="Slide dwell time (seconds)"
            type="number"
            size="small"
            fullWidth
            value={slideDwellSeconds}
            onChange={(e) => setSlideDwellSeconds(e.target.value)}
            error={!isDwellValid}
            helperText={
              isDwellValid
                ? 'A slide without activities is credited when the learner scrolls to its bottom or stays on it this long. 0 credits it as soon as it is viewed.'
                : 'Enter a whole number of seconds, 0 or more.'
            }
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
          />
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
          // doAction={handleCommit}
          formTitle="Set Move On Criteria"
          getFormFields={getFormFields}
          instructions=""
          submitButtonText="Save"
          failToasterMessage="Set MoveOn Criteria for AU Failed"
          //successToasterMessage="Changes Set Successfully"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default MoveOnCriteriaForm;
