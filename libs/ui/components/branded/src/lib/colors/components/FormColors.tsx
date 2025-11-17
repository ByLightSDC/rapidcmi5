/* eslint-disable react/jsx-no-useless-fragment */

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';

/* MUI */
import Grid from '@mui/material/Grid';

/* Icons */
import Check from '@mui/icons-material/Check';

import { ButtonModalCancelUi } from '../../inputs/buttons/buttonsmodal';

import FormControlTextField from '../../forms/FormControlTextField';

import { QueryClient, QueryClientProvider } from 'react-query';
import { ButtonLoadingUi } from '../../inputs/buttons/buttons';
import Form from '../../forms/Form';

import { One, Two } from '../constants';

const formWidth = 480;

const defaultFormValues = {
  name: 'My Name',
};

export function FormColors() {
  //#region form validation
  const validationSchema = yup.object().shape({});

  const formMethods = useForm({
    defaultValues: defaultFormValues,
    mode: 'all',
    resolver: yupResolver(validationSchema),
  });
  const { control, handleSubmit, formState } = formMethods;
  const { errors, isValid } = formState;
  //#endregion

  const queryClient = new QueryClient();

  const onSubmit = async (data: any) => {};

  const infoText = 'Additional information about this field';

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Form
          title="Sample Form"
          instructions="Form Instructions"
          formWidth={formWidth}
          showBorder={true}
          showPaper={true}
          formFields={
            <Grid container spacing={2} sx={{ paddingTop: '8px' }}>
              <One sx={{ position: 'absolute', left: 240, top: 60 }} />
              <Two
                sx={{ position: 'absolute', left: 234, top: 140, zIndex: 999 }}
              />
              <Grid item xs={12}>
                <FormControlTextField
                  control={control}
                  label="Name"
                  error={false}
                  helperText="Helper Text"
                  infoText={infoText}
                  name="name"
                  placeholder="Type string here"
                  required
                  readOnly={false}
                  disabled={false}
                />
              </Grid>
            </Grid>
          }
          formButtons={
            <>
              <ButtonModalCancelUi id="cancel-button">
                Cancel
              </ButtonModalCancelUi>
              <ButtonLoadingUi
                id="submit-button"
                startIcon={<Check />}
                disabled={!isValid}
                loading={false}
              >
                Save
              </ButtonLoadingUi>
            </>
          }
          sxProps={{
            color: 'text.secondary',
            width: formWidth,
            height: 'auto',
            padding: '24px',
          }}
          onSubmit={handleSubmit(onSubmit)}
        />
      </QueryClientProvider>
    </>
  );
}

export default FormColors;
