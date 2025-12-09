import { UseFormReturn } from 'react-hook-form';
import {
  FormControlSelectField,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
} from '@rangeos-nx/ui/branded';
import { Grid, MenuItem } from '@mui/material';
import * as yup from 'yup';
import { JobeContent, moveOnCriteriaOptions } from '@rangeos-nx/types/cmi5';

import { RC5ActivityTypeEnum } from '@rangeos-nx/types/cmi5';
import { KSATsFieldGroup } from '../components/KSATsFieldGroup';
import { FormCrudType } from '@rangeos-nx/ui/redux';

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
  const validationSchema = yup.object().shape({
    // student: DESCRIPTION_GROUP,
    // evaluator: DESCRIPTION_GROUP,
    // ksats: yup.array().of(
    //   yup.object().optional().shape({
    //     element_identifier: REQUIRED_ENTRY,
    //   }),
    // ),
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
        <Grid item xs={7.5}>
          <FormControlTextField
            control={control}
            name={'title'}
            label="Title"
            readOnly={crudType === FormCrudType.view}
            sxProps={{ height: '30%' }}
          />
        </Grid>
        <Grid item xs={4.5}>
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
        <Grid item xs={11.5}>
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
        <Grid item xs={11.5}>
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
        {/* <Grid item xs={11.5}>
          <KSATsFieldGroup formMethods={formMethods} crudType={crudType} />
        </Grid> */}
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
