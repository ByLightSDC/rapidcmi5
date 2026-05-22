import { UseFormReturn } from 'react-hook-form';
import { toTitleCase } from '../formUtils';
import {
  FormControlSelectField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  NAME_GROUP_OPT,
  REQUIRED_ENTRY,
  UUID_GROUP,
} from '@rapid-cmi5/ui';
import { Alert, MenuItem, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import * as yup from 'yup';
import {
  moveOnCriteriaOptions,
  TeamConsolesContent,
} from '@rapid-cmi5/cmi5-build-common';
import { FormCrudType } from '@rapid-cmi5/ui';

import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';

import LrsHeaderWithDetails from '../LrsStatementHelper';

import { ScenarioSelectionForm } from '../../../../../components/modals/scenarios/ScenarioSelectionModal';
import { ScenarioCard } from './ScenarioCard';

export const TeamConsolesForm = ({
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
  defaultFormData: TeamConsolesContent;
  deleteButton?: JSX.Element;
  handleCloseModal?: () => void;
  innerSx?: any;
  outerSx?: any;
  outerStyle?: any;
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
    const { control, setValue, trigger, watch } = formMethods;
    const { errors } = formState;
    const scenarioName = watch('name');
    const scenarioUuid = watch('uuid');

    const onApplyScenario = (item: any) => {
      setValue('uuid', item.uuid, { shouldDirty: true });
      setValue('name', item.name, { shouldDirty: true });
      trigger('uuid');
    };

    return (
      <>
        <Grid size={11}>
          <Typography variant="body2">
            This activity provides console access to VMs and Containers in a
            deployed RangeOS scenario. The instructor MUST deploy the scenario
            from the Manage Ranges dashboard in RangeOS.
          </Typography>
        </Grid>
        <Grid size={11}>
          <Alert severity="warning">
            This activity requires SSO authentication and cannot be used in
            conjunction with an Individual Training Scenario which is
            authenticated via Basic Auth.
          </Alert>
        </Grid>
        <ScenarioSelectionForm
          submitForm={onApplyScenario}
          errors={errors}
          control={control}
        />

        {/* Selected Scenario Display */}
        <ScenarioCard scenarioUUID={scenarioUuid} scenarioName={scenarioName} />

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
                {toTitleCase(item)}
              </MenuItem>
            ))}
          </FormControlSelectField>
        </Grid>

        {/* <Grid size={11.5}>
          <KSATsFieldGroup formMethods={formMethods} crudType={crudType} />
        </Grid> */}
        <Grid size={11}>
          <LrsHeaderWithDetails activityType={RC5ActivityTypeEnum.consoles} />
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
        formTitle="Team Exercise Scenario"
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
