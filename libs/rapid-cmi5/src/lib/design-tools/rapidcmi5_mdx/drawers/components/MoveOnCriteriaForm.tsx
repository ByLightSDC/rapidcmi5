import { commitChangesModalId } from '../../modals/constants';
import {
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
  SelectorMainUi,
} from '@rapid-cmi5/ui/branded';
import { UseFormReturn } from 'react-hook-form';
import { Grid, Typography } from '@mui/material';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { modal } from '@rapid-cmi5/ui/redux';
import React from 'react';
import {
  MoveOnCriteriaEnum,
  moveOnCriteriaOptions,
} from '@rapid-cmi5/types/cmi5';

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
  const modalObj = useSelector(modal);

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

  const onResponse = (isSuccess: boolean, data: any, message: string) => {
    if (isSuccess) {
      handleModalAction(moveOnCriteria);
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
        <Grid item xs={11.5}>
          <SelectorMainUi
            value={moveOnCriteria}
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
