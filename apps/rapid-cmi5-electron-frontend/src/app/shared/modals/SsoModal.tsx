/* eslint-disable react/jsx-no-useless-fragment */
import { Grid } from '@mui/system';
import {
  CommonAppModalState,
  FormControlCheckboxField,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui';
import { useCallback, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import * as yup from 'yup';
import { configureSSOPromptModalId } from '../navbar/UserInfoBox';
import { SSOConfig } from '@rapid-cmi5/cmi5-build-common';
import { Alert, Collapse } from '@mui/material';

const validationSchema = yup.object().shape({
  keycloakUrl: yup
    .string()
    .url('Must be a valid URL')
    .required('Keycloak URL is required'),
  keycloakRealm: yup.string().required('Realm is required'),
  keycloakClientId: yup.string().required('Client ID is required'),
  keycloakScope: yup.string().required('Scope is required'),
  rangeRestApiUrl: yup
    .string()
    .url('Must be a valid URL')
    .required('DevOps API URL is required'),
});

const defaultSSOConfig: SSOConfig = {
  keycloakUrl: '',
  keycloakRealm: '',
  keycloakClientId: '',
  keycloakScope: 'profile',
  rangeRestApiUrl: '',
  ssoEnabled: false,
};

interface FormStatus {
  type: 'success' | 'error';
  message: string;
}

export function ConfigureSSOForm({
  defaultData = defaultSSOConfig,
  modalObj,
  handleCloseModal,
  handleModalAction,
  handleSaveSSO,
}: {
  defaultData?: SSOConfig;
  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: SSOConfig,
  ) => void;
  handleSaveSSO: (data: SSOConfig) => void;
}) {
  const [status, setStatus] = useState<FormStatus | null>(null);
  const onCancel = () => {
    setStatus(null);
    handleCloseModal();
  };

  const onClose = () => {
    setStatus(null);
    handleCloseModal();
  };

  const onResponse = (isSuccess: boolean, data: SSOConfig, message: string) => {
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
          {status && (
            <Grid size={12}>
              <Collapse in={!!status}>
                <Alert
                  severity={status.type}
                  onClose={() => setStatus(null)}
                  sx={{ mb: 1 }}
                >
                  {status.message}
                </Alert>
              </Collapse>
            </Grid>
          )}

          <Grid size={6}>
            <FormControlCheckboxField
              control={control}
              name="ssoEnabled"
              label="Enable SSO?"
            />
          </Grid>
          <Grid size={12}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.keycloakUrl)}
              helperText={errors?.keycloakUrl?.message}
              name="keycloakUrl"
              required
              label="Keycloak URL"
              placeholder="https://keycloak.example.com/auth/"
              readOnly={false}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.rangeRestApiUrl)}
              helperText={errors?.rangeRestApiUrl?.message}
              name="rangeRestApiUrl"
              required
              label="Range REST API URL"
              placeholder="https://rangeos-api.example.com"
              readOnly={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.keycloakRealm)}
              helperText={errors?.keycloakRealm?.message}
              name="keycloakRealm"
              required
              label="Realm"
              placeholder="cloudcents"
              readOnly={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.keycloakClientId)}
              helperText={errors?.keycloakClientId?.message}
              name="keycloakClientId"
              required
              label="Client ID"
              placeholder="rangeos-dashboard"
              readOnly={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.keycloakScope)}
              helperText={errors?.keycloakScope?.message}
              name="keycloakScope"
              required
              label="Scope"
              placeholder="profile"
              readOnly={false}
            />
          </Grid>
        </>
      );
    },
    [status],
  );

  return (
    <ModalDialog
      testId={configureSSOPromptModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === configureSSOPromptModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handleSaveSSO}
          formTitle="Configure SSO"
          getFormFields={getFormFields}
          instructions="Enter your Keycloak SSO configuration details"
          submitButtonText="Save"
          successToasterMessage="SSO Configuration Saved"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default ConfigureSSOForm;
