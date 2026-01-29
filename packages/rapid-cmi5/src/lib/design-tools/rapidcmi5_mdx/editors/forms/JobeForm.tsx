import { UseFormReturn } from 'react-hook-form';

/* MUI */
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';

import * as yup from 'yup';

import { KSATsFieldGroup } from '../components/KSATsFieldGroup';
import { JobeContent, moveOnCriteriaOptions, RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import { FormCrudType, REQUIRED_ENTRY, FormStateType, FormControlTextField, FormControlSelectField, FormControlUIProvider, MiniForm } from '@rapid-cmi5/ui';
import { featureFlagShouldShowKSATs } from '../../../../featureFlags';

export const JobeForm = ({
  crudType,
  defaultFormData,
  deleteButton,
  onSave,
}: {
  crudType: FormCrudType;
  defaultFormData: JobeContent;
  deleteButton?: JSX.Element;
  handleCloseModal?: () => void;
  onSave: (activity: RC5ActivityTypeEnum, data: any) => void;
}) => {
  // Get the unique rc5id from the form data for scoping ksats to individual activity
  const rc5id = defaultFormData?.rc5id;
  const validationSchema = yup.object().shape({
    // student: DESCRIPTION_GROUP,
    // evaluator: DESCRIPTION_GROUP,
    ksats: yup.array().of(
      yup.object().optional().shape({
        element_identifier: REQUIRED_ENTRY,
      }),
    ),
  });

  const onSaveAction = (data: any) => {
    if (onSave) {
      onSave(RC5ActivityTypeEnum.jobe, data as JobeContent);
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
    const { control, setValue, trigger } = formMethods;
    const { errors } = formState;

    return (
      <>
        <Grid size={7.5}>
          <FormControlTextField
            control={control}
            name={'title'}
            label="Title"
            readOnly={crudType === FormCrudType.view}
            sxProps={{ height: '30%' }}
          />
        </Grid>
        <Grid size={4.5}>
          <FormControlSelectField
            control={control}
            name={'moveOnCriteria'}
            required
            label="Move On Criteria"
            error={Boolean(errors?.moveOnCriteria)}
            helperText={errors?.moveOnCriteria?.message}
            readOnly={crudType === FormCrudType.view}
          >
            {moveOnCriteriaOptions.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </FormControlSelectField>
        </Grid>
        <Grid size={11.5}>
          <FormControlTextField
            control={control}
            name={`student`}
            minRows={4}
            maxRows={12}
            //required
            label="Student Code"
            readOnly={crudType === FormCrudType.view}
            multiline={true}
            sxProps={{ height: '30%' }}
          />
        </Grid>
        <Grid size={11.5}>
          <FormControlTextField
            control={control}
            name={`evaluator`}
            minRows={4}
            maxRows={12}
            //required
            label="Evaluator"
            readOnly={crudType === FormCrudType.view}
            multiline={true}
            sxProps={{ height: '30%' }}
          />
        </Grid>
        {featureFlagShouldShowKSATs && (
          <Grid size={11.5}>
            <KSATsFieldGroup formMethods={formMethods} crudType={crudType} />
          </Grid>
        )}
      </>
    );
  };

  return (
    <FormControlUIProvider>
      <MiniForm
        dataCache={defaultFormData}
        titleEndChildren={deleteButton}
        doAction={onSaveAction}
        formTitle="Jobe In The Box"
        formWidth="640px"
        getFormFields={getFormFields}
        loadingButtonText="Saving"
        shouldAutoSave={true}
        shouldCheckIsDirty={true}
        shouldDisplaySave={false}
        showPaper={true}
        submitButtonText="Save"
        validationSchema={validationSchema}
      />
    </FormControlUIProvider>
  );
};
