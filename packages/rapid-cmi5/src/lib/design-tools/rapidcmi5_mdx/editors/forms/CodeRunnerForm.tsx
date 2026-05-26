import { UseFormReturn } from 'react-hook-form';
import { toTitleCase } from './formUtils';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import * as yup from 'yup';

import { Alert } from '@mui/material';
import { KSATsFieldGroup } from '../components/KSATsFieldGroup';
import {
  CodeRunnerContent,
  moveOnCriteriaOptions,
  RC5ActivityTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';
import {
  FormCrudType,
  REQUIRED_ENTRY,
  FormStateType,
  FormControlTextField,
  FormControlMonacoField,
  FormControlSelectField,
  FormControlUIProvider,
  MiniForm,
  getErrorMessage,
  useCodeRunnerApi,
} from '@rapid-cmi5/ui';
import { featureFlagShouldShowKSATs } from '../../../../featureFlags';

export const CodeRunnerForm = ({
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
  defaultFormData: CodeRunnerContent;
  deleteButton?: JSX.Element;
  handleCloseModal?: () => void;
  innerSx?: any;
  outerSx?: any;
  outerStyle?: any;
  onSave: (activity: RC5ActivityTypeEnum, data: any) => void;
}) => {
  const rc5id = defaultFormData?.rc5id;
  const { getLanguages } = useCodeRunnerApi();

  const { error, data: runTimes } = getLanguages();

  const validationSchema = yup.object().shape({
    ksats: yup.array().of(
      yup.object().optional().shape({
        element_identifier: REQUIRED_ENTRY,
      }),
    ),
  });

  const onSaveAction = (data: any) => {
    if (onSave) {
      onSave(RC5ActivityTypeEnum.codeRunner, data as CodeRunnerContent);
    }
  };

  const getFormFields = (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ): JSX.Element => {
    const { control, setValue, watch } = formMethods;
    const { errors } = formState;

    const selectedLanguage = watch('programmingLanguage');
    const availableVersions: string[] = runTimes?.body[selectedLanguage] ?? [];

    const handleLanguageChange = () => {
      setValue('languageVersion', '', { shouldDirty: true });
    };

    return (
      <>
        <Grid size={6}>
          <FormControlTextField
            control={control}
            name={'title'}
            label="Title"
            readOnly={crudType === FormCrudType.view}
            sxProps={{ height: '30%' }}
          />
        </Grid>

        <Grid size={5.5}>
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

        {error && (
          <Grid size={11.5}>
            <Alert severity="error">{getErrorMessage(error)}</Alert>
          </Grid>
        )}

        {runTimes ? (
          <>
            <Grid size={5.5}>
              <FormControlSelectField
                control={control}
                name={'programmingLanguage'}
                label="Programming Language"
                error={Boolean(errors?.programmingLanguage)}
                helperText={errors?.programmingLanguage?.message}
                readOnly={crudType === FormCrudType.view}
                onSelect={handleLanguageChange}
              >
                {Object.keys(runTimes.body).map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </FormControlSelectField>
            </Grid>

            <Grid size={5.5}>
              <FormControlSelectField
                control={control}
                name={'languageVersion'}
                label="Version"
                error={Boolean(errors?.languageVersion)}
                helperText={errors?.languageVersion?.message}
                readOnly={crudType === FormCrudType.view}
                shouldDisableSelection={!selectedLanguage}
              >
                {availableVersions.map((version) => (
                  <MenuItem key={version} value={version}>
                    {version}
                  </MenuItem>
                ))}
              </FormControlSelectField>
            </Grid>
          </>
        ) : (
          <>
            <Grid size={5.5}>
              <FormControlTextField
                control={control}
                name={'programmingLanguage'}
                label="Programming Language"
                error={Boolean(errors?.programmingLanguage)}
                helperText={errors?.programmingLanguage?.message}
                readOnly={crudType === FormCrudType.view}
              />
            </Grid>

            <Grid size={5.5}>
              <FormControlTextField
                control={control}
                name={'languageVersion'}
                label="Version"
                error={Boolean(errors?.languageVersion)}
                helperText={errors?.languageVersion?.message}
                readOnly={crudType === FormCrudType.view}
              />
            </Grid>
          </>
        )}

        <Grid size={11.5}>
          <FormControlTextField
            control={control}
            name={`description`}
            minRows={4}
            maxRows={12}
            label="Description"
            readOnly={crudType === FormCrudType.view}
            multiline={true}
            sxProps={{ height: '30%' }}
          />
        </Grid>

        <Grid size={11.5}>
          <FormControlMonacoField
            control={control}
            name={`student`}
            label="Student Code"
            language={selectedLanguage ?? 'javascript'}
            height={300}
            readOnly={crudType === FormCrudType.view}
          />
        </Grid>

        <Grid size={11.5}>
          <FormControlMonacoField
            control={control}
            name={`evaluator`}
            label="Evaluator"
            language={selectedLanguage ?? 'javascript'}
            height={300}
            readOnly={crudType === FormCrudType.view}
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
        className="paper-activity"
        contextMenu={contextMenu}
        outerSx={outerSx}
        outerStyle={outerStyle}
        dataCache={defaultFormData}
        titleEndChildren={deleteButton}
        doAction={onSaveAction}
        formTitle="Code Runner"
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
