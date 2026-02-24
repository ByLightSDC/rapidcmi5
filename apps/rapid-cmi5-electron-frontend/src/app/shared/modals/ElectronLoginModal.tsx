import { Grid } from '@mui/system';
import { Credentials } from '@rapid-cmi5/cmi5-build-common';
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

export const configureSSOCredsModalId = 'configureSSOCredsModalId';

const validationSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});
const defaultSSOCreds: Credentials = {
  username: '',
  password: '',
};
export function ConfigureSSOCredentialsForm({
  defaultData = defaultSSOCreds,

  modalObj,
  handleCloseModal,
  handleModalAction,
  handleSaveSSOCreds,
}: {
  defaultData?: Credentials;

  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: Credentials,
  ) => void;
  handleSaveSSOCreds: (data: Credentials) => void;
}) {
  const onCancel = () => {
    handleCloseModal();
  };

  const onClose = () => {
    handleCloseModal();
  };

  const onResponse = (
    isSuccess: boolean,
    data: Credentials,
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
          <Grid size={{ xs: 12 }}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.username)}
              helperText={errors?.username?.message}
              name="username"
              required
              label="SSO Username"
              placeholder="user@example.com"
              readOnly={false}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlPassword
              control={control}
              error={Boolean(errors?.password)}
              helperText={errors?.password?.message}
              name="password"
              required
              label="SSO Password"
              placeholder="Enter your password"
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
      testId={configureSSOCredsModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === configureSSOCredsModalId,
      }}
      maxWidth="xs"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handleSaveSSOCreds}
          formTitle="SSO Login"
          getFormFields={getFormFields}
          instructions="Enter your SSO credentials to authenticate."
          submitButtonText="Login"
          successToasterMessage="SSO Login Successful"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default ConfigureSSOCredentialsForm;
