import { Alert } from '@mui/material';
import { Grid } from '@mui/system';
import { Credentials, GitUserConfig } from '@rapid-cmi5/cmi5-build-common';
import {
  CommonAppModalState,
  FormControlPassword,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui';
import { useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import * as yup from 'yup';

export const configureGlobalGitConfigModalId =
  'configureGlobalGitConfigModalId';

interface GitCredentialsFormData extends GitUserConfig {
  username?: string;
  password?: string;
}

interface ConfigureGlobalGitConfigFormProps {
  defaultData?: GitCredentialsFormData;
  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: GitCredentialsFormData,
  ) => void;
  handleSaveGitConfig: (userConfig: GitUserConfig) => void;
  handleSaveGitCredentials?: (credentials: Credentials) => void;
}

export function ConfigureGlobalGitConfigForm({
  defaultData,
  modalObj,
  handleCloseModal,
  handleModalAction,
  handleSaveGitConfig,
  handleSaveGitCredentials,
}: ConfigureGlobalGitConfigFormProps) {
  const showCredentials = Boolean(handleSaveGitCredentials);

  const validationSchema = useMemo(() => {
    const shape: Record<string, yup.StringSchema> = {
      authorName: yup.string().required('Author Name is required'),
      authorEmail: yup.string().required('Author Email is required'),
    };

    if (showCredentials) {
      shape.username = yup.string().required('Git Username is required');
      shape.password = yup
        .string()
        .required('Personal Access Token is required');
    }

    return yup.object().shape(shape);
  }, [showCredentials]);

  const onCancel = () => {
    handleCloseModal();
  };

  const onClose = () => {
    handleCloseModal();
  };

  const onResponse = (
    isSuccess: boolean,
    data: GitCredentialsFormData,
    _message: string,
  ) => {
    if (isSuccess) {
      handleModalAction(modalObj.type, 1, data);
    }
  };

  const doAction = (data: GitCredentialsFormData) => {
    const { username, password, ...userConfig } = data;
    handleSaveGitConfig(userConfig);

    if (handleSaveGitCredentials && username && password) {
      handleSaveGitCredentials({ username, password });
    }
  };

  const getFormFields = useCallback(
    (formMethods: UseFormReturn, formState: FormStateType): JSX.Element => {
      const { control } = formMethods;
      const { errors } = formState;

      return (
        <>
          {showCredentials && (
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
                  label="Password"
                  placeholder="personal access token"
                  readOnly={false}
                />
              </Grid>
            </>
          )}

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.authorName)}
              helperText={errors?.authorName?.message}
              name="authorName"
              required
              label="Author Name"
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
              label="Author Email"
              placeholder="user@gmail.com"
              readOnly={false}
            />
          </Grid>
          <Alert severity="info">
            Author name and email are required in order to make local commits.
            User name and password are required when pushing changes to a remote
            repository. Password can only be persisted in the desktop version of
            RapidCMI5.
          </Alert>
        </>
      );
    },
    [showCredentials],
  );

  return (
    <ModalDialog
      testId={configureGlobalGitConfigModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === configureGlobalGitConfigModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={doAction}
          formTitle="Configure Git Credentials"
          getFormFields={getFormFields}
          instructions=""
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

export default ConfigureGlobalGitConfigForm;
