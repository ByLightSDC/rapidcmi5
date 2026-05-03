import { commitChangesModalId } from '../../modals/constants';

import { type UseFormReturn } from 'react-hook-form';

/* MUI */
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';

import * as yup from 'yup';
import React from 'react';
import { MoveOnCriteriaEnum, moveOnCriteriaOptions } from '@rapid-cmi5/cmi5-build-common';
import { type FormStateType, SelectorMainUi, ModalDialog, FormControlUIProvider, MiniForm } from '@rapid-cmi5/ui';

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
}: {
  handleCloseModal: () => void;
  handleModalAction: (moveOn: MoveOnCriteriaEnum) => void;
  currentMoveOn?: MoveOnCriteriaEnum;
}) {

  const [moveOnCriteria, setMoveOnCriteria] = React.useState(
    currentMoveOn || MoveOnCriteriaEnum.CompletedAndPassed,
  );

  const validationSchema = yup.object().shape({
    //
  });

  const onClose = () => {
    handleCloseModal();
  };

  const onCancel = () => {
    handleCloseModal();
  };

  const onResponse = (isSuccess: boolean, _data: any, _message: string) => {
    if (isSuccess) {
      handleModalAction(moveOnCriteria);
    }
  };

  const getFormFields = (
    _formMethods: UseFormReturn,
    _formState: FormStateType,
  ): JSX.Element => {

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
