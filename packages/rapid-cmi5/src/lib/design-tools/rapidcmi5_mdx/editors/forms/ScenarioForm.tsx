import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControlCheckboxField,
  FormControlSelectField,
  FormControlTextField,
  FormControlUIProvider,
  FormCrudType,
  FormStateType,
  MiniForm,
  NAME_GROUP_OPT,
  UUID_GROUP,
} from '@rapid-cmi5/ui';
import { Alert, alpha, Box, MenuItem, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid2';

import * as yup from 'yup';
import {
  moveOnCriteriaOptions,
  RC5ScenarioContent,
} from '@rapid-cmi5/cmi5-build-common';

import { getInfoText } from '../../../../utils/infoButtonText';
import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import LrsHeaderWithDetails from './LrsStatementHelper';
import { useContext } from 'react';
import { GitContext } from '../../../course-builder/GitViewer/session/GitContext';

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
  const { GetScenariosForm } = useContext(GitContext);
  const theme = useTheme();

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

    return (
      <Grid>
        <Grid size={11}>
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
        <Grid size={11}>
          <Alert severity="warning">
            This activity requires Basic AUTH authentication and cannot be used
            in conjunction with a Team Exercise Scenario which authenticates via
            SSO.
          </Alert>
        </Grid>
        {GetScenariosForm ? (
          <Grid size={7.5}>
            <GetScenariosForm
              submitForm={onApplyScenario}
              formType={crudType}
              errors={errors}
              formMethods={formMethods}
            />

            {/* Selected Scenario Display */}
            {scenarioName ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  my: 1.5,
                  p: 1,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.primary.main}`,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                }}
              >
                <CheckCircleIcon
                  sx={{
                    fontSize: 20,
                    color: theme.palette.primary.main,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      color: theme.palette.text.primary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {scenarioName}
                  </Typography>
                  {scenarioUuid && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                      }}
                    >
                      {scenarioUuid}
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  my: 1,
                  p:1,
                  borderRadius: 2,
                  border: `1px dashed ${theme.palette.divider}`,
                  bgcolor: theme.palette.background.paper,
                }}
              >
                <FolderOpenIcon
                  sx={{
                    fontSize: 20,
                    color: alpha(theme.palette.text.secondary, 0.7),
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha(theme.palette.text.secondary, 0.7),
                  }}
                >
                  No scenario selected
                </Typography>
              </Box>
            )}
          </Grid>
        ) : (
          <>
            <Grid size={7.5}>
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
            <Grid size={7.5}>
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
          </>
        )}

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
        <Grid size={5.4}>
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
          <Grid size={5.6} sx={{ marginTop: '-12px' }}>
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
        <Grid size={11}>
          <LrsHeaderWithDetails activityType={RC5ActivityTypeEnum.scenario} />
        </Grid>
      </Grid>
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