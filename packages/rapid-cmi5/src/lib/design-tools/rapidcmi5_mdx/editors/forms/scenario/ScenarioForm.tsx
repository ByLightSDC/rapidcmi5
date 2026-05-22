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
  RC5ScenarioContent,
  OuterStyle,
} from '@rapid-cmi5/cmi5-build-common';

import { getInfoText } from '../../../../../utils/infoButtonText';
import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import LrsHeaderWithDetails from '../LrsStatementHelper';

import { toTitleCase } from '../formUtils';
import { useEffect } from 'react';
import { ScenarioSelectionForm } from '../../../../../components/modals/ScenarioSelectionModal';
import { ScenarioCard } from './ScenarioCard';

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
  defaultFormData: RC5ScenarioContent;
  deleteButton?: JSX.Element;
  handleCloseModal?: () => void;
  innerSx?: SxProps;
  outerSx?: SxProps;
  outerStyle?: OuterStyle;
  onSave: (activity: RC5ActivityTypeEnum, data: any) => void;
}) => {
  const gridSize = 12;

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
    const scenarioName = watch('name');
    const scenarioUuid = watch('uuid');

    /**
     *
     * @param {string} topicId
     * @param {any} item New value of field
     */
    const onApplyScenario = (item: any) => {
      if (!item) {
        return;
      }
      setValue('uuid', item.uuid, { shouldDirty: true });
      setValue('name', item.name, { shouldDirty: true });
      trigger('uuid');
    };

    /**
     * UE triggers validation on the class id field if should prompt is turned on
     */
    useEffect(() => {
      if (watchPromptClass) {
        trigger('defaultClassId');
      }
    }, [watchPromptClass]);

    return (
      // <Grid container>
      <>
        <Grid size={gridSize}>
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
            </span>{' '}
            dashboard in RangeOS. If left unchecked, an instance of this
            scenario will be automatically deployed.
          </Typography>
        </Grid>
        <Grid size={gridSize}>
          <Alert severity="warning" sx={{ maxWidth: '640px' }}>
            This activity requires Basic AUTH authentication and cannot be used
            in conjunction with a Team Exercise Scenario which authenticates via
            SSO.
          </Alert>
        </Grid>
        <Grid size={gridSize}>
          <ScenarioSelectionForm
            submitForm={onApplyScenario}
            errors={errors}
            control={control}
          />
          <ScenarioCard
            scenarioUUID={scenarioUuid}
            scenarioName={scenarioName}
          />
        </Grid>

        <Grid size={3.2}>
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
        <Grid size={3.2}>
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
          <Grid size={5.6}>
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
        <Grid size={12}>
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
