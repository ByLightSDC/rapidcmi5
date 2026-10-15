import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import { UseFormReturn } from 'react-hook-form';
import {
  debugLogError,
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
import {
  Alert,
  Box,
  Divider,
  MenuItem,
  SxProps,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import * as yup from 'yup';
import {
  moveOnCriteriaOptions,
  OuterStyle,
  RC5ActivityTypeEnum,
  ScenarioContent,
} from '@rapid-cmi5/cmi5-build-common';

import LrsHeaderWithDetails from '../../../../shared/forms/LrsStatementHelper';
import { toTitleCase } from '../../../../shared/forms/formUtils';
import { useEffect, useMemo } from 'react';

import { ScenarioSelectorField } from './ScenarioSelectorField';
import { ScenarioTypeCard } from './ScenarioTypeCard';
import { SCENARIO_GRID } from './formSettings';
import {
  getActivityForDeploymentType,
  getScenarioDeploymentType,
  ScenarioDeploymentType,
} from './scenarioDeploymentType';

const scenarioTypeOptions: {
  type: ScenarioDeploymentType;
  title: string;
  description: string;
  deployedBy: string;
  signIn: string;
  icon: JSX.Element;
}[] = [
  {
    type: ScenarioDeploymentType.Individual,
    title: 'Individual Training',
    description:
      'Each student gets their own copy of the scenario, deployed automatically when they launch the lesson.',
    deployedBy: 'Automatic, at launch',
    signIn: 'Basic Auth',
    icon: <PersonIcon />,
  },
  {
    type: ScenarioDeploymentType.Class,
    title: 'Class Deployment',
    description:
      'The instructor deploys scenarios for the whole class ahead of time. Students enter a Class Id at launch to reach theirs.',
    deployedBy: 'Instructor, from Classes',
    signIn: 'Basic Auth',
    icon: <AssignmentIndIcon />,
  },
  {
    type: ScenarioDeploymentType.Team,
    title: 'Team Exercise',
    description:
      'Students work as a team in a scenario the instructor deploys, with console access to its VMs and containers.',
    deployedBy: 'Instructor, from Manage Ranges',
    signIn: 'SSO',
    icon: <GroupsIcon />,
  },
];

/**
 * Single form for all scenario activities. The selected deployment type
 * decides which directive (:::scenario or :::consoles) the data is saved to.
 */
export const ScenarioActivityForm = ({
  contextMenu,
  crudType,
  defaultFormData,
  directiveName,
  innerSx,
  outerSx,
  outerStyle,
  onSave,
}: {
  contextMenu?: JSX.Element;
  crudType: FormCrudType;
  defaultFormData: ScenarioContent;
  directiveName: string;
  innerSx?: SxProps;
  outerSx?: SxProps;
  outerStyle?: OuterStyle;
  onSave: (activity: RC5ActivityTypeEnum, data: any) => void;
}) => {
  const isReadOnly = crudType === FormCrudType.view;

  // scenarioType is form-only state, stripped before saving
  // memoized so MiniForm does not reset the form on every render
  const formData = useMemo(
    () => ({
      ...defaultFormData,
      scenarioType: getScenarioDeploymentType(directiveName, defaultFormData),
    }),
    [defaultFormData],
  );

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
    const { scenarioType, ...content } = data;
    if (!scenarioType) return;

    if (scenarioType === ScenarioDeploymentType.Team) {
      delete content.promptClass;
      delete content.promptClassId;
      delete content.defaultClassId;
    } else {
      content.promptClass = scenarioType === ScenarioDeploymentType.Class;
      if (!content.promptClass) {
        delete content.defaultClassId;
      }
    }
    onSave(
      getActivityForDeploymentType(scenarioType),
      content as ScenarioContent,
    );
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
    const scenarioType: ScenarioDeploymentType | undefined =
      watch('scenarioType');
    const watchPromptClass = watch('promptClass');
    const scenarioName = watch('name');
    const scenarioUuid = watch('uuid');
    const selectedOption = scenarioTypeOptions.find(
      (option) => option.type === scenarioType,
    );

    useEffect(() => {
      if (watchPromptClass) {
        trigger('defaultClassId').catch((err) => debugLogError(err));
      }
    }, [watchPromptClass]);

    const onSelectType = (type: ScenarioDeploymentType) => {
      setValue('scenarioType', type, { shouldDirty: true });
      setValue('promptClass', type === ScenarioDeploymentType.Class, {
        shouldDirty: true,
      });
    };

    return (
      <>
        <Grid size={SCENARIO_GRID.full}>
          <Typography variant="body2" color="text.secondary">
            Give students hands-on console access to a RangeOS scenario. Choose
            how the scenario gets deployed.
          </Typography>
        </Grid>
        <Grid size={SCENARIO_GRID.full}>
          <Typography
            variant="overline"
            color="text.secondary"
            component="div"
            sx={{ marginBottom: 1 }}
          >
            Deployment Type
          </Typography>
          <Box
            role="group"
            aria-label="Deployment type"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 2,
            }}
          >
            {scenarioTypeOptions.map((option) => (
              <ScenarioTypeCard
                key={option.type}
                id={option.type}
                icon={option.icon}
                title={option.title}
                description={option.description}
                deployedBy={option.deployedBy}
                signIn={option.signIn}
                isSelected={scenarioType === option.type}
                isDisabled={isReadOnly}
                onSelect={() => onSelectType(option.type)}
              />
            ))}
          </Box>
        </Grid>

        {selectedOption && (
          <>
            <Grid size={SCENARIO_GRID.full}>
              <Divider sx={{ marginBottom: 2 }} />
              <Typography
                component="h3"
                variant="subtitle1"
                sx={{ fontWeight: 600 }}
              >
                {selectedOption.title} Settings
              </Typography>
            </Grid>
            <Grid size={SCENARIO_GRID.full}>
              <Alert severity="info">
                {scenarioType === ScenarioDeploymentType.Individual && (
                  <>
                    Nothing to do ahead of time. A copy of this scenario is
                    deployed for each student when they launch the lesson.
                  </>
                )}
                {scenarioType === ScenarioDeploymentType.Class && (
                  <>
                    Before class, the instructor deploys this scenario from the{' '}
                    <AssignmentIndIcon
                      sx={{ position: 'relative', top: 4 }}
                      fontSize="small"
                    />
                    <b> CLASSES</b> dashboard in RangeOS. Students are asked for
                    the Class Id when they launch.
                  </>
                )}
                {scenarioType === ScenarioDeploymentType.Team && (
                  <>
                    Before the exercise, the instructor deploys this scenario
                    from the <b>Manage Ranges</b> dashboard in RangeOS.
                  </>
                )}
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
                readOnly={isReadOnly}
              >
                {moveOnCriteriaOptions.map((item) => (
                  <MenuItem key={item} value={item}>
                    {toTitleCase(item)}
                  </MenuItem>
                ))}
              </FormControlSelectField>
            </Grid>
            {scenarioType === ScenarioDeploymentType.Class && (
              <Grid size={SCENARIO_GRID.classId}>
                <FormControlTextField
                  control={control}
                  error={Boolean(errors?.defaultClassId)}
                  helperText={errors?.defaultClassId?.message}
                  name="defaultClassId"
                  label="Class Id"
                  required
                  readOnly={isReadOnly}
                />
              </Grid>
            )}
            <Grid size={SCENARIO_GRID.full}>
              <LrsHeaderWithDetails
                activityType={getActivityForDeploymentType(selectedOption.type)}
              />
            </Grid>
          </>
        )}
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
        dataCache={formData}
        doAction={onSaveAction}
        formTitle="Scenario"
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
