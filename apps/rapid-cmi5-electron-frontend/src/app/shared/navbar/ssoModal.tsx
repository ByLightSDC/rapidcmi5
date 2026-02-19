/* eslint-disable react/jsx-no-useless-fragment */
import { Grid, Stack } from '@mui/system';
import {
  CommonAppModalState,
  FormControlPassword,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui';
import { useCallback, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import * as yup from 'yup';
import { configureSSOPromptModalId } from './UserInfoBox';
import { SSOConfig } from '@rapid-cmi5/cmi5-build-common';
import {
  Alert,
  Button,
  CircularProgress,
  Collapse,
  Divider,
  Typography,
} from '@mui/material';
import {
  setAuthToken,
  setIsAuthenticated,
  setIsSSOEnabled,
} from '@rapid-cmi5/keycloak';
import { useDispatch } from 'react-redux';

const validationSchema = yup.object().shape({
  keycloakUrl: yup
    .string()
    .url('Must be a valid URL')
    .required('Keycloak URL is required'),
  keycloakRealm: yup.string().required('Realm is required'),
  keycloakClientId: yup.string().required('Client ID is required'),
  keycloakScope: yup.string().required('Scope is required'),
  devopsApiUrl: yup
    .string()
    .url('Must be a valid URL')
    .required('DevOps API URL is required'),
});

const defaultSSOConfig: SSOConfig = {
  keycloakUrl: '',
  keycloakRealm: '',
  keycloakClientId: '',
  keycloakScope: 'profile',
  devopsApiUrl: '',
  username: '',
  password: '',
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
  handleSaveSSO: (data: SSOConfig) => Promise<void>;
}) {
  const [status, setStatus] = useState<FormStatus | null>(null);
  const [isTesting, setIsTesting] = useState(false);

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

  const dispatch = useDispatch();

  const getFormFields = useCallback(
    (formMethods: UseFormReturn, formState: FormStateType): JSX.Element => {
      const { control, getValues, trigger } = formMethods;
      const { errors } = formState;

      const testLogin = async () => {
        setStatus(null);
        setIsTesting(true);

        const ok = await trigger();
        if (!ok) {
          setIsTesting(false);
          setStatus({
            type: 'error',
            message: 'Please fix the validation errors above before testing.',
          });
          return;
        }

        const values = getValues();
        await handleSaveSSO(values as any);

        try {
          const tokenResponse = await window.userSettingsApi.loginSSO(false);
          dispatch(setAuthToken(tokenResponse.access_token));
          dispatch(setIsAuthenticated(true));
          dispatch(setIsSSOEnabled(true));
          setStatus({
            type: 'success',
            message: 'Login successful — SSO connection verified.',
          });
        } catch (e: any) {
          console.error('SSO login test failed', e);
          dispatch(setIsAuthenticated(false));

          let message = 'An unknown error occurred.';
          if (e?.response?.status === 401 || e?.error === 'invalid_grant') {
            message = 'Authentication failed — invalid username or password.';
          } else if (e?.response?.status === 403) {
            message =
              'Authorization failed — this account does not have the required permissions.';
          } else if (
            e?.code === 'ECONNREFUSED' ||
            e?.code === 'ENOTFOUND' ||
            e?.message?.includes('fetch')
          ) {
            message =
              'Could not reach the Keycloak server. Please verify the URL and your network connection.';
          } else if (e?.message) {
            message = e.message;
          }

          setStatus({ type: 'error', message });
        } finally {
          setIsTesting(false);
        }
      };

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
              error={Boolean(errors?.devopsApiUrl)}
              helperText={errors?.devopsApiUrl?.message}
              name="devopsApiUrl"
              required
              label="DevOps API URL"
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
          <Grid size={12}>
            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Credentials
              </Typography>
            </Divider>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.username)}
              helperText={errors?.username?.message}
              name="username"
              required
              label="Username"
              placeholder="john.doe"
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
              placeholder="••••••••"
              readOnly={false}
            />
          </Grid>
          <Grid size={12}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={testLogin}
                disabled={isTesting}
                startIcon={
                  isTesting ? <CircularProgress size={16} /> : undefined
                }
              >
                {isTesting ? 'Attempting Login' : 'Login'}
              </Button>
            </Stack>
          </Grid>
        </>
      );
    },
    [status, isTesting, dispatch, handleSaveSSO],
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
