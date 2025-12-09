import { UseFormReturn } from 'react-hook-form';
import {
  FormControlSelectField,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
} from '@rangeos-nx/ui/branded';
import { Alert, Box, Grid, MenuItem, Typography } from '@mui/material';
import * as yup from 'yup';
import {
  moveOnCriteriaOptions,
  TeamConsolesContent,
} from '@rangeos-nx/types/cmi5';

import {
  NAME_GROUP_OPT,
  REQUIRED_ENTRY,
  UUID_GROUP,
} from '@rangeos-nx/ui/validation';

import { RC5ActivityTypeEnum } from '@rangeos-nx/types/cmi5';
import LrsHeaderWithDetails from './LrsStatementHelper';
import { FormCrudType } from '@rangeos-nx/ui/redux';

export const TeamConsolesForm = ({
  crudType,
  defaultFormData,
  deleteButton,
  onSave,
}: {
  crudType: FormCrudType;
  defaultFormData: TeamConsolesContent;
  deleteButton?: JSX.Element;
  handleCloseModal?: () => void;
  onSave: (activity: RC5ActivityTypeEnum, data: any) => void;
}) => {
  const validationSchema = yup.object().shape({
    uuid: UUID_GROUP,
    name: NAME_GROUP_OPT,
    ksats: yup.array().of(
      yup.object().optional().shape({
        element_identifier: REQUIRED_ENTRY,
      }),
    ),
  });

  const onSaveAction = (data: any) => {
    if (onSave) {
      onSave(RC5ActivityTypeEnum.consoles, data as TeamConsolesContent);
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

    /**
     *
     * @param {string} topicId
     * @param {any} item New value of field
     */
    const onApplyScenario = (topicId: string, item: any) => {
      setValue('uuid', item.meta.uuid, { shouldDirty: true });
      setValue('name', item.meta.name, { shouldDirty: true });
      trigger('uuid');
    };

    return (
      <>
        <Grid item xs={11}>
          <Typography variant="body2">
            This activity will present participants with console access to a
            deployed scenario. Instructor MUST deploy the scenario manually.
          </Typography>
        </Grid>
        <Grid item xs={11}>
          <Alert severity="warning">
            This activity requires SSO authentication and cannot be used in
            conjunction with an Individual Training Scenario which is
            authenticated via Basic Auth.
          </Alert>
        </Grid>
        <Grid item xs={7.5}>
          <FormControlTextField
            control={control}
            name={'name'}
            required
            label="Scenario Name"
            error={Boolean(errors?.name)}
            helperText={errors?.name?.message}
            readOnly={crudType === FormCrudType.view}
          />
        </Grid>
        <Grid item xs={7.5}>
          <FormControlTextField
            control={control}
            name={'uuid'}
            required
            label="Scenario UUID"
            error={Boolean(errors?.uuid)}
            helperText={errors?.uuid?.message}
            readOnly={crudType === FormCrudType.view}
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
        {/* <Grid item xs={11.5}>
          <KSATsFieldGroup formMethods={formMethods} crudType={crudType} />
        </Grid> */}
        <Grid item xs={11}>
          <LrsHeaderWithDetails activityType={RC5ActivityTypeEnum.consoles} />
        </Grid>
      </>
    );
  };

  return (
    <FormControlUIProvider>
      <MiniForm
        dataCache={defaultFormData}
        titleEndChildren={deleteButton}
        doAction={onSaveAction}
        formTitle="Team Exercise Scenario"
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
