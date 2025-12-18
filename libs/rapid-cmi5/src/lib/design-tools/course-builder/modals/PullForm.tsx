/* eslint-disable react/jsx-no-useless-fragment */
import {
  FormControlCheckboxField,
  FormControlPassword,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui/branded';
import * as yup from 'yup';

import { gitPullModalId } from '../../rapidcmi5_mdx/modals/constants';
import { CommonAppModalState } from '@rapid-cmi5/ui/redux';

import { Grid, Typography } from '@mui/material';

import { UseFormReturn } from 'react-hook-form';

import { NAME_GROUP_OPT } from '@rapid-cmi5/ui/validation';
import { PullType } from '../CourseBuilderApiTypes';
import { useContext } from 'react';
import { GitContext } from '../GitViewer/session/GitContext';

export function PullForm({
  defaultData,
  modalObj,
  handleCloseModal,
  handleModalAction,
}: {
  defaultData: PullType;
  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => void;
}) {
  const { handlePull } = useContext(GitContext);

  const validationSchema = yup.object().shape({
    username: NAME_GROUP_OPT,
  });

  const onCancel = () => {
    handleCloseModal();
  };

  const onClose = () => {
    handleCloseModal();
  };

  const onResponse = (isSuccess: boolean, data: any, message: string) => {
    if (isSuccess) {
      handleModalAction(modalObj.type, 1, data);
    }
  };

  /**
   * Returns form fields unique to this form
   * @param {UseFormReturn} formMethods React hook form methods
   * @param {FormStateType} formState React hook form state fields (ex. errors, isValid)
   * @return {JSX.Element} Render elements
   */
  const pullFormFields = (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ): JSX.Element => {
    const { control } = formMethods;
    const { errors } = formState;
    return (
      <>
        <Grid item xs={11}>
          <Typography>
            Staged changes will be commited before the repo is pulled.
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.repoUsername)}
            helperText={errors?.repoUsername?.message}
            name="repoUsername"
            required
            label="User Name"
            readOnly={false}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlPassword
            control={control}
            error={Boolean(errors?.repoPassword)}
            helperText={errors?.repoPassword?.message}
            name="repoPassword"
            required
            label="Password"
            readOnly={false}
          />
        </Grid>

        <Grid item xs={6}>
          <FormControlCheckboxField
            control={control}
            error={errors?.allowConflicts}
            label="Attempt Merge with Conflicts"
            name="allowConflicts"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.branch)}
            helperText={errors?.branch?.message}
            name="branch"
            label="Branch"
            readOnly={true}
          />
        </Grid>
      </>
    );
  };

  return (
    <ModalDialog
      testId={gitPullModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === gitPullModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handlePull}
          formTitle="Pull Git Repo"
          getFormFields={pullFormFields}
          instructions=""
          submitButtonText="Pull"
          successToasterMessage="Pulled Successfully"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default PullForm;
