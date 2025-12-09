/* eslint-disable @typescript-eslint/no-explicit-any */

import { UseFormReturn } from 'react-hook-form';

import * as yup from 'yup';
import { NAME_GROUP } from '@rangeos-nx/ui/validation';

/* Branded */
import {
  FormControlTextField,
  FormStateType,
  SharedFormWithProvider,
} from '@rangeos-nx/ui/branded';

/* MUI */
import Grid from '@mui/material/Grid';

/* Constants */
//import { defaultPostPutData, navId } from './constants';

/* API Topic */
import {
  Topic,
  usePostInitializeCMI5Scenarios,
} from '@rangeos-nx/ui/api/hooks';

import { ClassEntry, defaultClassEntryData } from '../session/constants';
import { useEffect } from 'react';
import { FormCrudType } from '@rangeos-nx/ui/redux';

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
    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        <Grid item xs={5}>
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
      </>
    );
  };

  useEffect(() => {}, []);

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
