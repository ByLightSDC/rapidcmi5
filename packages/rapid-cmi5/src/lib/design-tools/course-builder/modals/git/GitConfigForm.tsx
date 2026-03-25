/* eslint-disable react/jsx-no-useless-fragment */
import {
  FormControlPassword,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui';
import * as yup from 'yup';

import { CommonAppModalState } from '@rapid-cmi5/ui';

import Grid from '@mui/material/Grid2';

import { UseFormReturn } from 'react-hook-form';

import { NAME_GROUP_OPT } from '@rapid-cmi5/ui';
import { useContext } from 'react';
import { Alert, Typography } from '@mui/material';
import { setGitConfigModalId } from '../../../rapidcmi5_mdx/modals/constants';
import { GitConfigType } from '../../CourseBuilderApiTypes';
import { GitContext } from '../../GitViewer/session/GitContext';

export function GitConfigForm({
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
  const { isRepoConnectedToRemote, handleChangeRepoName, currentRepo } =
    useContext(GitContext);

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
  const getFormFields = (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ): JSX.Element => {
    const { control, getValues, setValue, trigger } = formMethods;
    const { errors, isValid } = formState;
    return (
      <>
        <Grid size={12}>
          <Typography variant="caption">Commit Settings</Typography>
        </Grid>
        <Grid size={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.authorName)}
            helperText={errors?.authorName?.message}
            name="authorName"
            label="Author Name"
            placeholder="FirstName LastName"
            readOnly={false}
          />
        </Grid>
        <Grid size={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.authorEmail)}
            helperText={errors?.authorEmail?.message}
            name="authorEmail"
            label="Email"
            placeholder="FirstName LastName"
            readOnly={false}
          />
        </Grid>
        <Grid size={12}>
          <Typography variant="caption">Remote Repository</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.username)}
            helperText={errors?.username?.message}
            name="username"
            label="User Name"
            placeholder="user.name"
            readOnly={false}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControlPassword
            control={control}
            error={Boolean(errors?.password)}
            helperText={errors?.password?.message}
            name="password"
            label="Password"
            placeholder="personal access token"
            readOnly={false}
          />
        </Grid>

        <Grid size={12}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.remoteRepoUrl)}
            helperText={errors?.remoteRepoUrl?.message}
            name="remoteRepoUrl"
            label="Remote Repository URL"
            placeholder="https://mycourserepo.git"
            readOnly={false}
            multiline
          />
        </Grid>
        {!isRepoConnectedToRemote && (
          <Alert severity="warning">
            The remote Repository MUST be blank. Please ensure there is no
            README file before you add the remote.
          </Alert>
        )}
      </>
    );
  };

  return (
    <ModalDialog
      testId={setGitConfigModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === setGitConfigModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handleGitSetConfig}
          formTitle="Project Settings"
          getFormFields={getFormFields}
          instructions=""
          successToasterMessage="Set Git Config Successfully"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default GitConfigForm;
