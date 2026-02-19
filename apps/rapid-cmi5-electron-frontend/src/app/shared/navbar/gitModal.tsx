/* eslint-disable react/jsx-no-useless-fragment */
import { Grid } from '@mui/system';
import { GitCredentials } from '@rapid-cmi5/cmi5-build-common';
import {
  CommonAppModalState,
  FormControlPassword,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui';
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import * as yup from 'yup';

export const configureGitCredsModalId = 'configureGitCredsModalId';

const validationSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Personal Access Token is required'),
  authorName: yup.string().required('Author Name is required'),
  authorEmail: yup.string().required('Author Email is required'),
});

export const defaultGitCreds: GitCredentials = {
  username: '',
  password: '',
  authorName: '',
  authorEmail: '',
};

export function ConfigureGitCredentialsForm({
  defaultData = defaultGitCreds,
  modalObj,
  handleCloseModal,
  handleModalAction,
  handleSaveGitCreds,
}: {
  defaultData?: GitCredentials;
  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: GitCredentials,
  ) => void;
  handleSaveGitCreds: (data: GitCredentials) => void;
}) {
  const onCancel = () => {
    handleCloseModal();
  };

  const onClose = () => {
    handleCloseModal();
  };

  const onResponse = (
    isSuccess: boolean,
    data: GitCredentials,
    _message: string,
  ) => {
    if (isSuccess) {
      handleModalAction(modalObj.type, 1, data);
    }
  };

  const getFormFields = useCallback(
    (formMethods: UseFormReturn, formState: FormStateType): JSX.Element => {
      const { control } = formMethods;
      const { errors } = formState;

      return (
        <>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.username)}
              helperText={errors?.username?.message}
              name="username"
              required
              label="Git Username"
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
              required
              label="Personal Access Token"
              placeholder="ghp_********"
              readOnly={false}
            />
          </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.authorName)}
              helperText={errors?.authorName?.message}
              name="authorName"
              required
              label="Git Author Name"
              placeholder="FirstName LastName"
              readOnly={false}
            />
          </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.authorEmail)}
              helperText={errors?.authorEmail?.message}
              name="authorEmail"
              required
              label="Git Author Email"
              placeholder="user@gmail.com"
              readOnly={false}
            />
          </Grid>
        </>
      );
    },
    [],
  );

  return (
    <ModalDialog
      testId={configureGitCredsModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === configureGitCredsModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handleSaveGitCreds}
          formTitle="Configure Git Credentials"
          getFormFields={getFormFields}
          instructions="Enter your Git username and Personal Access Token (PAT)."
          submitButtonText="Save"
          successToasterMessage="Git credentials saved"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default ConfigureGitCredentialsForm;
