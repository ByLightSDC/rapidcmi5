import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControlCheckboxField,
  FormControlSelectField,
  FormControlTextField,
  FormControlUIProvider,
  FormCrudType,
  FormStateType,
  META_LABEL_GROUP,
  MiniForm,
  NAME_GROUP_OPT,
  UUID_GROUP,
} from '@rapid-cmi5/ui';
import { Alert, MenuItem, SxProps, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import * as yup from 'yup';
import {
  moveOnCriteriaOptions,
  OuterStyle,
  ScenarioContent,
} from '@rapid-cmi5/cmi5-build-common';

import { getInfoText } from '../../../../utils/infoButtonText';
import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import LrsHeaderWithDetails from '../../../../shared/forms/LrsStatementHelper';

import { toTitleCase } from '../../../../shared/forms/formUtils';
import { useEffect } from 'react';

import { ScenarioSelectorField } from './ScenarioSelectorField';
import { SCENARIO_GRID } from './formSettings';

export const ScenarioForm = ({
  contextMenu,
  crudType,
  defaultFormData,
  deleteButton,
  innerSx,
  outerSx,
  outerStyle,
  onSave,
}: {
  contextMenu?: JSX.Element;
  crudType: FormCrudType;
  defaultFormData: ScenarioContent;
  deleteButton?: JSX.Element;
  handleCloseModal?: () => void;
  innerSx?: SxProps;
  outerSx?: SxProps;
  outerStyle?: OuterStyle;
  onSave: (activity: RC5ActivityTypeEnum, data: any) => void;
}) => {
  const validationSchema = yup.object().shape({
    uuid: UUID_GROUP,
    name: NAME_GROUP_OPT,
    defaultClassId: yup.string().when('promptClass', {
      is: true,
      then: () => META_LABEL_GROUP,
      otherwise: (schema) => schema.nullable().optional(),
    }),
  });

  const onSaveAction = (data: any) => {
    if (onSave) {
      onSave(RC5ActivityTypeEnum.scenario, data);
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
    const scenarioName = watch('name');
    const scenarioUuid = watch('uuid');

    useEffect(() => {
      if (watchPromptClass) {
        trigger('defaultClassId');
      }
    }, [watchPromptClass]);

    return (
      <>
        <Grid size={SCENARIO_GRID.full}>
          <Typography variant="body2">
            This activity will present participants with console access to a
            deployed scenario. If <b>Prompt Student for Class Id</b> is
            selected, instructor must pre-deploy Scenarios from the{' '}
            <span>
              <AssignmentIndIcon
                sx={{ position: 'relative', top: 4 }}
                fontSize="small"
              />
              <b> CLASSES</b>
            </span>
            dashboard in RangeOS. If left unchecked, an instance of this
            scenario will be automatically deployed.
          </Typography>
        </Grid>
        <Grid size={SCENARIO_GRID.full}>
          <Alert severity="warning" sx={{ maxWidth: '640px' }}>
            This activity requires Basic AUTH authentication and cannot be used
            in conjunction with a Team Exercise Scenario which authenticates via
            SSO.
          </Alert>
        </Grid>
        <Grid size={SCENARIO_GRID.full}>
          <ScenarioSelectorField
            control={control}
            errors={errors}
            setValue={setValue}
            trigger={trigger}
            scenarioUuid={scenarioUuid}
            scenarioName={scenarioName}
          />
        </Grid>

        <Grid size={SCENARIO_GRID.moveOnCriteria}>
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
                {toTitleCase(item)}
              </MenuItem>
            ))}
          </FormControlSelectField>
        </Grid>
        <Grid size={SCENARIO_GRID.promptClass}>
          <FormControlCheckboxField
            control={control}
            name="promptClass"
            label="Prompt Student for Class Id"
            infoText={getInfoText('cmiCourse', 'promptClass')}
            checkboxProps={{
              disabled: crudType === FormCrudType.view,
            }}
          />
        </Grid>
        {watchPromptClass && (
          <Grid size={SCENARIO_GRID.classId}>
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
        <Grid size={SCENARIO_GRID.full}>
          <LrsHeaderWithDetails activityType={RC5ActivityTypeEnum.scenario} />
        </Grid>
      </>
    );
  };

  return (
    <FormControlUIProvider>
      <MiniForm
        className="paper-activity"
        contextMenu={contextMenu}
        outerSx={outerSx}
        outerStyle={outerStyle}
        dataCache={defaultFormData}
        titleEndChildren={deleteButton}
        doAction={onSaveAction}
        formTitle="Individual Training Scenario"
        formWidth={null}
        formSxProps={{ width: '100%', flexGrow: 1, ...innerSx, margin: 0 }}
        getFormFields={getFormFields}
        loadingButtonText="Saving"
        shouldAutoSave={true}
        shouldCheckIsDirty={true}
        shouldDisplaySave={false}
        showPaper={false}
        submitButtonText="Save"
        validationSchema={validationSchema}
      />
    </FormControlUIProvider>
  );
};
