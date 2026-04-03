import { UseFormReturn } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import * as yup from 'yup';
import { useContext, useEffect, useMemo, useState } from 'react';
import { SxProps } from '@mui/system';

import { Alert } from '@mui/material';
import { KSATsFieldGroup } from '../components/KSATsFieldGroup';
import {
  CodeRunnerContent,
  LanguagesResponseApi,
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
  LessonThemeContext,
  maxFormWidths,
  useLessonThemeStyles,
} from '@rapid-cmi5/ui';
import { featureFlagShouldShowKSATs } from '../../../../featureFlags';
import { useRapidCmi5Opts } from '../../../course-builder/GitViewer/session/RapidCmi5OptsContext';

export const CodeRunnerForm = ({
  crudType,
  defaultFormData,
  deleteButton,
  onSave,
}: {
  crudType: FormCrudType;
  defaultFormData: CodeRunnerContent;
  deleteButton?: JSX.Element;
  handleCloseModal?: () => void;
  onSave: (activity: RC5ActivityTypeEnum, data: any) => void;
}) => {
  const rc5id = defaultFormData?.rc5id;
  const { codeRunnerOps } = useRapidCmi5Opts();

  const { lessonTheme } = useContext(LessonThemeContext);
  const { outerActivitySxWithConstrainedWidthForm } = useLessonThemeStyles(
    lessonTheme,
    maxFormWidths.codeRunnerEditor,
  );

  const [runtimeMap, setRuntimeMap] = useState<LanguagesResponseApi>({});
  const [useRuntimeDropdowns, setUseRuntimeDropdowns] = useState(false);
  const [runtimeError, setRuntimeError] = useState('');

  const programmingLanguageOptions = useMemo(
    () => Object.keys(runtimeMap),
    [runtimeMap],
  );

  const validationSchema = yup.object().shape({
    ksats: yup.array().of(
      yup.object().optional().shape({
        element_identifier: REQUIRED_ENTRY,
      }),
    ),
  });

  useEffect(() => {
    const fetchRuntimes = async () => {
      if (!codeRunnerOps?.listRuntimes) return;

      try {
        const runtimes = await codeRunnerOps.listRuntimes();

        if (!Object.keys(runtimes).length) {
          setRuntimeMap({});
          setUseRuntimeDropdowns(false);
          return;
        }

        setRuntimeMap(runtimes);
        setUseRuntimeDropdowns(true);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.';
        setRuntimeError(message);
      }
    };
    fetchRuntimes();
  }, [codeRunnerOps]);

  const onSaveAction = (data: any) => {
    if (onSave) {
      onSave(RC5ActivityTypeEnum.codeRunner, data as CodeRunnerContent);
    }
  };

  const getFormFields = (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ): JSX.Element => {
    const { control, setValue, getValues, watch } = formMethods;
    const { errors } = formState;

    const selectedLanguage = watch('programmingLanguage');

    const versionOptions = runtimeMap[selectedLanguage];

    const handleLanguageChange = (language: string) => {
      const versions = runtimeMap[language] ?? [];

      setValue('programmingLanguage', language);
      setValue('languageVersion', versions[0] ?? '');
    };

    useEffect(() => {
      if (!useRuntimeDropdowns || !runtimeMap.length) return;

      const currentLanguage = getValues('programmingLanguage');
      const currentVersion = getValues('languageVersion');

      if (!currentLanguage) {
        const firstLanguage = runtimeMap[0];
        const firstVersion = runtimeMap[0][0] ?? '';

        setValue('programmingLanguage', firstLanguage);
        setValue('languageVersion', firstVersion);
        return;
      }

      const matchingRuntime = runtimeMap[currentLanguage];

      if (!matchingRuntime) {
        const firstLanguage = runtimeMap[0];
        const firstVersion = runtimeMap[0][0] ?? '';

        setValue('programmingLanguage', firstLanguage);
        setValue('languageVersion', firstVersion);
        return;
      }

      if (currentVersion && matchingRuntime.includes(currentVersion)) {
        return;
      }

      setValue('languageVersion', matchingRuntime[0] ?? '');
    }, [getValues, runtimeMap, setValue]);

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
                {item}
              </MenuItem>
            ))}
          </FormControlSelectField>
        </Grid>

        {runtimeError && (
          <Grid size={11.5}>
            <Alert severity="error">{runtimeError}</Alert>
          </Grid>
        )}

        {useRuntimeDropdowns ? (
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
                {programmingLanguageOptions.map((item) => (
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
                {versionOptions.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
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
        outerSx={outerActivitySxWithConstrainedWidthForm}
        dataCache={defaultFormData}
        titleEndChildren={deleteButton}
        doAction={onSaveAction}
        formTitle="Code Runner"
        formWidth={null}
        formSxProps={
          {
            flexGrow: 1,
            maxWidth: outerActivitySxWithConstrainedWidthForm.maxWidth,
          } as SxProps
        }
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
