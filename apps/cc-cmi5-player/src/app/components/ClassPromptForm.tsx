/* eslint-disable @typescript-eslint/no-explicit-any */

import { UseFormReturn } from 'react-hook-form';

import * as yup from 'yup';

/* Branded */

/* MUI */
import Grid from '@mui/material/Grid2';

/* Constants */
//import { defaultPostPutData, navId } from './constants';

/* API Topic */

import { ClassEntry, defaultClassEntryData } from '../session/constants';
import {
  FormCrudType,
  NAME_GROUP,
  FormStateType,
  FormControlTextField,
  SharedFormWithProvider,
} from '@rapid-cmi5/ui';
import {
  Topic,
  usePostInitializeCMI5Scenarios,
} from '@rangeos-nx/frontend/clients/hooks';
import { DateTimePicker } from '@mui/x-date-pickers';

/**
 * @typedef {Object} tFormProps
 * @property {FormCrudType} crudType APi request method type
 * @property {boolean} [isModal] Whether form is presented in a modal
 * @property {string} [title] Form title
 * @property {string} [uuid] UUID of data to populate the form
 * @property {() => void} [onCancel] Method to cancel the form
 * @property {() => void} [onClose] Method to close the form
 * @property {(isSuccess: boolean, data: any, message: string) => void} [onResponse] Callback when success response is received after form submission
 */
type tFormProps = {
  crudType: FormCrudType;
  dataCache?: any;
  defaultCache?: any;
  isModal?: boolean;
  title?: string;
  uuid?: string;
  onCancel?: () => void;
  onClose?: () => void;
  onResponse?: (isSuccess: boolean, data: any, message: string) => void;
};

/**
 * Class Prompt Form
 * @param {tFormProps} props Component props
 * @returns {React.ReactElement}
 */
export default function ClassPromptForm(props: tFormProps) {
  const { crudType, onResponse } = props;

  const formTopic = Topic.ClassEntry;
  const validationSchema = yup.object().shape({
    classId: NAME_GROUP,
    endDate: yup.date(),
  });

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
    // const handleEndDateChange = (value: Date | null) => {
    //   formMethods.setValue('endDate', value?.toISOString());
    // };
    return (
      <>
        <Grid size={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.name)}
            helperText={errors?.name?.message}
            name="classId"
            required
            label="Class Id"
            readOnly={crudType === FormCrudType.view}
          />
        </Grid>
        {/* <Grid size={6}>
          <DateTimePicker
            label="End Date"
            name="endDate"
            disablePast
            slotProps={{ textField: { required: true, fullWidth: true } }}
            onChange={handleEndDateChange}
            readOnly={crudType === FormCrudType.view}
          />
        </Grid> */}
      </>
    );
  };

  return (
    <SharedFormWithProvider<ClassEntry, ClassEntry, ClassEntry>
      {...props}
      crudLabel="Enter"
      featureNameOverride="Class"
      isRoutable={false}
      postHook={usePostInitializeCMI5Scenarios}
      hasFile={false}
      formTopic={formTopic}
      validationSchema={validationSchema}
      defaultPostData={defaultClassEntryData}
      defaultPutData={defaultClassEntryData}
      getFormFields={getFormFields}
      onResponse={onResponse}
    />
  );
}
