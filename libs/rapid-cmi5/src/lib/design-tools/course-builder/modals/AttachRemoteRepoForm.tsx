/* eslint-disable react/jsx-no-useless-fragment */
import {
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui/branded';
import * as yup from 'yup';

import { attachRemoteRepoModalId } from '../../rapidcmi5_mdx/modals/constants';
import { CommonAppModalState } from '@rapid-cmi5/ui/redux';

import { Grid, Typography } from '@mui/material';

import { UseFormReturn } from 'react-hook-form';

import { GIT_URL_GROUP, NAME_GROUP } from '@rapid-cmi5/ui/validation';
import { GitConfigType } from '../CourseBuilderApiTypes';
import { useContext } from 'react';
import { GitContext } from '../GitViewer/session/GitContext';

export function AttachRemoteRepoForm({
  defaultData,
  modalObj,
  handleCloseModal,
  handleModalAction,
}: {
  defaultData: GitConfigType;
  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => void;
}) {
  const { handleGitSetConfig } = useContext(GitContext);

  const validationSchema = yup.object().shape({
    remoteRepoUrl: GIT_URL_GROUP(),
    authorEmail: NAME_GROUP,
    authorName: NAME_GROUP,
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
  const getFormFields = (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ): JSX.Element => {
    const { control } = formMethods;
    const { errors } = formState;
    return (
      <>
        <Grid item xs={12} sx={{ marginBottom: '12px' }}>
          <Typography>The remote repository...</Typography>
          <Typography>• MUST be empty (NO branches, NO README)</Typography>
          <Typography>• MUST be able to PUSH and PULL over https</Typography>
        </Grid>

        <Grid item xs={12}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.remoteRepoUrl)}
            helperText={errors?.remoteRepoUrl?.message}
            multiline={true}
            name="remoteRepoUrl"
            required
            label="Remote Repository URL"
            readOnly={false}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.authorName)}
            helperText={errors?.authorName?.message}
            name="authorName"
            required
            label="Name"
            readOnly={false}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.authorEmail)}
            helperText={errors?.authorEmail?.message}
            name="authorEmail"
            required
            label="Email"
            readOnly={false}
          />
        </Grid>
      </>
    );
  };

  return (
    <ModalDialog
      testId={attachRemoteRepoModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === attachRemoteRepoModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handleGitSetConfig}
          formTitle="Add Remote Repository"
          getFormFields={getFormFields}
          submitButtonText="Add Remote"
          failToasterMessage="Add Remote Repository Failed"
          successToasterMessage="Add Remote Repository Successfully"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default AttachRemoteRepoForm;
