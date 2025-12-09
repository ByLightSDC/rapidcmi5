import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControlCheckboxField,
  FormControlSelectField,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
} from '@rangeos-nx/ui/branded';
import { Alert, Grid, MenuItem, Typography } from '@mui/material';
import * as yup from 'yup';
import {
  moveOnCriteriaOptions,
  RC5ScenarioContent,
} from '@rangeos-nx/types/cmi5';

import { NAME_GROUP_OPT, UUID_GROUP } from '@rangeos-nx/ui/validation';

import { getInfoText } from '../../../../utils/infoButtonText';
import { RC5ActivityTypeEnum } from '@rangeos-nx/types/cmi5';
import LrsHeaderWithDetails from './LrsStatementHelper';
import { FormCrudType } from '@rangeos-nx/ui/redux';

export const ScenarioForm = ({
  crudType,
  defaultFormData,
  deleteButton,
  onSave,
}: {
  crudType: FormCrudType;
  defaultFormData: RC5ScenarioContent;
  deleteButton?: JSX.Element;
  handleCloseModal?: () => void;
  onSave: (activity: RC5ActivityTypeEnum, data: any) => void;
}) => {
  const validationSchema = yup.object().shape({
    uuid: UUID_GROUP,
    name: NAME_GROUP_OPT,
    defaultClassId: NAME_GROUP_OPT,
  });

  const onSaveAction = (data: any) => {
    if (onSave) {
      onSave(RC5ActivityTypeEnum.scenario, data as RC5ScenarioContent);
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
    const { control, setValue, trigger, watch } = formMethods;
    const { errors } = formState;

    const watchPromptClass = watch('promptClass');
    /**
     *
     * @param {string} topicId
     * @param {any} item New value of field
     */
    const onApplyScenario = (topicId: string, item: any) => {
      if (!item || !item.meta) {
        return;
      }
      setValue('uuid', item.meta.uuid, { shouldDirty: true });
      setValue('name', item.meta.name, { shouldDirty: true });
      trigger('uuid');
    };

    return (
      <>
        <Grid item xs={11}>
          <Typography variant="body2">
            This activity will present participants with console access to a
            deployed scenario. If <b>Prompt User for Class ID</b> is selected,
            instructor must pre-deploy Scenarios from the <br />
            <span>
              <AssignmentIndIcon
                sx={{ position: 'relative', top: 4 }}
                fontSize="small"
              />
              <b> CLASSES</b>
            </span>{' '}
            dashboard. If left unchecked, an instance of this scenario will be
            automatically deployed.
          </Typography>
        </Grid>
        <Grid item xs={11}>
          <Alert severity="warning">
            This activity requires Basic AUTH authentication and cannot be used
            in conjunction with a Team Exercise Scenario which authenticates via
            SSO.
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
        <Grid item xs={5.4}>
          <FormControlCheckboxField
            control={control}
            name="promptClass"
            label="Prompt User for Class ID"
            infoText={getInfoText('cmiCourse', 'promptClass')}
            checkboxProps={{
              disabled: crudType === FormCrudType.view,
            }}
          />
        </Grid>
        {watchPromptClass && (
          <Grid item xs={5.6} sx={{ marginTop: '-12px' }}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.defaultClassId)}
              helperText={errors?.defaultClassId?.message}
              name="defaultClassId"
              label="Class Id"
              readOnly={crudType === FormCrudType.view}
            />
          </Grid>
        )}
        {/* <Grid item xs={11.5}>
          <KSATsFieldGroup formMethods={formMethods} crudType={crudType} />
        </Grid> */}
        <Grid item xs={11}>
          <LrsHeaderWithDetails activityType={RC5ActivityTypeEnum.scenario} />
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
        formTitle="Individual Training Scenario"
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
