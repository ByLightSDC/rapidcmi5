/* eslint-disable react/jsx-no-useless-fragment */
/**
 * This form is for "demo" and testing purposes only
 * so we can make sure each of the branded field components works correctly
 * it is NOT exported in library index for other use
 */

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';

/* MUI */
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

/* Icons */
import Check from '@mui/icons-material/Check';

import {
  ButtonModalCancelUi,
  ButtonModalMainUi,
} from '../inputs/buttons/buttonsmodal';
import { countries } from '../data-display/map/country-codes';
import { OverflowTypography } from '../data-display/OverflowTypography';
import Form from './Form';
import FormControlComboBoxField from './FormControlComboBoxField';
import FormControlIntegerField from './FormControlIntegerField';
import FormControlIpField from './FormControlIpField';
import FormControlTextField from './FormControlTextField';
import FormControlPassword from './FormControlPassword';
import FormFieldArray, { tFormFieldRendererProps } from './FormFieldArray';
import ViewExpander from '../surfaces/ViewExpander';
import { REQUIRED_ENTRY } from '@rangeos-nx/ui/validation';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ButtonLoadingUi } from '../inputs/buttons/buttons';
import FormControlCheckboxField from './FormControlCheckboxField';
import FormControlDateDisplay from './FormControlDateDisplay';
import NumberWithUnitsField from './NumberWithUnitsField';

const formWidth = 800;

const defaultFormValues = {
  name: 'My Name',
  name_readonly: 'My Disabled Name',

  //IPv4 Field
  ipAddress: '10.10.10.10',
  ipType: 4,
  //IPv6 Field
  ipAddressAlt: 'AAAA:BBBB:CCCC:DDDD:EEEE:FFFF:1111:2222',
  ipTypeAlt: 6,
  //Positive Integer Field
  demoPositiveInt: 400,
  //Any Integer Field
  demoInteger: -23,
  //Combo box field
  countryCode: 'US',
  //Array of Custom Objects Field
  demoArray: [
    {
      field1: 'apple',
      field2: 'plum',
      numberField: 6,
    },
  ],
  //Array of Strings Field
  demoList: ['first', 'second'],
};

export function DemoForm({ editable = true }: { editable?: boolean }) {
  //#region form validation
  const validationSchema = yup.object().shape({
    //ipAddress: handled by IP Address component
    displayError_ipAddress: yup.boolean().oneOf([false], 'hidden message'), // this is used inside the IP Address component so form knows if there's an error
    //ipAddressAlt: handled by IP Address component
    displayError_ipAddressAlt: yup.boolean().oneOf([false], 'hidden message'), // this is used inside the IP Address component so form knows if there's an error
    demoPositiveInt: yup
      .number()
      .typeError('Must be a positive integer')
      .required('Field is required')
      .integer('Must be a positive integer')
      .min(0, 'Must be a positive integer'),
    demoInteger: yup
      .number()
      .typeError('Must be an integer')
      .required('Field is required')
      .integer('Must be an integer'),
    demoArray: yup
      .array()
      .min(1, 'Field is required')
      .of(
        yup.object().shape({
          field1: yup.string().required('Field 1 is required'),
          field2: yup.string().max(5, 'max length 5'),
          numberField: yup
            .number()
            .typeError('Must be an integer')
            .required('Field is required')
            .integer('Must be an integer'),
        }),
      ),
    demoList: yup.array().of(yup.string().required('Field is required')),
  });

  const formMethods = useForm({
    defaultValues: defaultFormValues,
    mode: 'all',
    resolver: yupResolver(validationSchema),
  });
  const { control, handleSubmit, trigger, watch, formState } = formMethods;
  const { errors, isValid } = formState;
  //#endregion

  //#region IP address triggers
  const watchIpv4Address = watch('ipAddress');
  const watchIpv6Address = watch('ipAddressAlt');
  useEffect(() => {
    trigger('ipAddress');
  }, [watchIpv4Address]);
  useEffect(() => {
    trigger('ipAddressAlt');
  }, [watchIpv6Address]);
  //#endregion
  const queryClient = new QueryClient();

  const onSubmit = async (data: any) => {
    //REF console.log('*** DEMO ON SUBMIT ***', data);
  };

  const infoText = 'Additional information about this field';

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Form
          title="Demo Form"
          instructions="Form Instructions"
          formWidth={formWidth}
          showBorder={true}
          formFields={
            <Grid container spacing={2} sx={{ paddingTop: '8px' }}>
              <Grid item xs={12}>
                <Typography align="left" variant="h5">
                  Text Fields
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <FormControlTextField
                  control={control}
                  label="Name"
                  error={false}
                  helperText="Helper Text"
                  infoText={infoText}
                  name="name"
                  placeholder="Type string here"
                  required
                  readOnly={!editable}
                  disabled={false}
                />
              </Grid>

              <Grid item xs={4}>
                <FormControlTextField
                  control={control}
                  label="Name"
                  error={false}
                  helperText="Editable"
                  infoText={infoText}
                  name="name_readonly"
                  required
                  readOnly={true}
                  disabled={true}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControlPassword
                  control={control}
                  error={Boolean(errors?.accessKeySecret)}
                  helperText={errors?.accessKeySecret?.message}
                  infoText={infoText}
                  name="accessKeySecret"
                  required
                  readOnly={!editable}
                  disabled={false}
                />
              </Grid>

              <ViewExpander
                title="IP Address Fields"
                infoTextTitle="two IP formats for demo purposes"
              >
                <Grid item xs={12}>
                  <FormControlIpField
                    errors={errors}
                    infoText={infoText}
                    ipFieldName="ipAddress"
                    label="Required IPv4 Address"
                    readOnly={!editable}
                    required={true}
                    {...formMethods}
                  />
                  <Grid item xs={3} />
                  <FormControlIpField
                    errors={errors}
                    infoText={infoText}
                    ipFieldName="ipAddressAlt"
                    label="Required IPv6 Address"
                    readOnly={!editable}
                    required={true}
                    {...formMethods}
                  />
                  <Grid item xs={3} />
                </Grid>
              </ViewExpander>
              <Grid item xs={12}>
                <Typography align="left" variant="h5">
                  Integers
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <FormControlIntegerField
                  {...formMethods}
                  error={Boolean(errors?.demoPositiveInt)}
                  helperText={errors?.demoPositiveInt?.message}
                  infoText={infoText}
                  name="demoPositiveInt"
                  required={true}
                  label="Positive Integer"
                  readOnly={!editable}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControlTextField
                  control={control}
                  label="Name"
                  error={false}
                  helperText="Helper Text"
                  infoText={infoText}
                  name="name"
                  placeholder="Type string here"
                  required
                  readOnly={!editable}
                  disabled={false}
                />
              </Grid>

              {/* <Grid item xs={8}></Grid> */}
              <Grid item xs={3}>
                <FormControlIntegerField
                  {...formMethods}
                  error={Boolean(errors?.demoInteger)}
                  helperText={errors?.demoInteger?.message}
                  infoText={infoText}
                  name="demoInteger"
                  required={true}
                  label="Any Integer"
                  readOnly={!editable}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography align="left" variant="h5">
                  Combo Box
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <FormControlComboBoxField
                  name="countryCode"
                  label="Country"
                  options={countries}
                  readOnly={!editable}
                  error={Boolean(errors?.countryCode)}
                  formMethods={formMethods}
                  helperText={errors?.countryCode?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <FormFieldArray
                  errors={errors}
                  formMethods={formMethods}
                  arrayFieldName="demoArray"
                  arrayRenderItem={DemoArrayRenderItem}
                  defaultValues={{ field1: 'A', field2: 'B' }}
                  isExpandable={true}
                  infoTextTitle="This button is for demo purposes only!"
                  maxArrayLength={2}
                  title="List With Custom Renderer"
                  readOnly={!editable}
                />
              </Grid>
              <Grid item xs={12}>
                <FormFieldArray
                  expandTestId="list2"
                  errors={errors}
                  formMethods={formMethods}
                  arrayFieldName="demoList"
                  defaultValues={''}
                  isExpandable={true}
                  placeholder="Type name here"
                  maxArrayLength={2}
                  title="List of Strings"
                  readOnly={!editable}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography align="left" variant="h5">
                  Typography Tooltips
                </Typography>
              </Grid>
              <Grid
                item
                xs={4}
                style={{ backgroundColor: 'lightgrey', margin: 1 }}
              >
                <OverflowTypography
                  title="A very long title which should show a tooltip"
                  sxProps={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={7} />
              <Grid
                item
                xs={4}
                style={{ backgroundColor: 'lightgrey', margin: 1 }}
              >
                <OverflowTypography
                  title="A short title"
                  sxProps={{ width: '80px' }}
                />
              </Grid>
            </Grid>
          }
          formButtons={
            <>
              {editable ? (
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
              ) : (
                <ButtonModalMainUi startIcon={null}>OK</ButtonModalMainUi>
              )}
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
      <Divider orientation="horizontal" variant="fullWidth" />

      {/* <Button
        onClick={() => {
          // this button is for "debugging" the data / errors of the form
          // based on what happens in form field components
          console.log(
            '******************values and errors*********************** isValid: ' +
              isValid
          );
          console.log(getValues());
          console.log(errors);
        }}
      >
        Log Data (Debug Only)
      </Button> */}
    </>
  );
}

//#region Custom Rendering for an Array Item
function DemoArrayRenderItem(props: tFormFieldRendererProps) {
  const { formMethods, indexedArrayField, indexedErrors, readOnly } = props;
  const { control } = formMethods;

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <FormControlTextField
          control={control}
          label="Field 1"
          error={Boolean(indexedErrors?.field1)}
          helperText={indexedErrors?.field1?.message}
          name={`${indexedArrayField}.field1`}
          placeholder="Type string here"
          required
          readOnly={readOnly}
        />
      </Grid>
      <Grid item xs={6}>
        <FormControlTextField
          control={control}
          label="Field 2"
          error={Boolean(indexedErrors?.field2)}
          helperText={indexedErrors?.field2?.message}
          name={`${indexedArrayField}.field2`}
          placeholder="Type string here"
          readOnly={readOnly}
        />
      </Grid>
      <Grid item xs={2}>
        <FormControlIntegerField
          {...formMethods}
          label="Integer Field"
          error={Boolean(indexedErrors?.numberField)}
          helperText={indexedErrors?.numberField?.message}
          name={`${indexedArrayField}.numberField`}
          required
          readOnly={readOnly}
        />
      </Grid>
    </Grid>
  );
}
//#endregion

export default DemoForm;
