import { UseFormReturn } from 'react-hook-form';

/* MUI */
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';

import * as yup from 'yup';

import { KSATsFieldGroup } from '../components/KSATsFieldGroup';
import {
  JobeContent,
  moveOnCriteriaOptions,
  RC5ActivityTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';
import {
  FormCrudType,
  REQUIRED_ENTRY,
  FormStateType,
  FormControlTextField,
  FormControlSelectField,
  FormControlUIProvider,
  MiniForm,
  LessonThemeContext,
  maxFormWidths,
  useLessonThemeStyles,
} from '@rapid-cmi5/ui';
import { featureFlagShouldShowKSATs } from '../../../../featureFlags';
import { useContext, useEffect, useState } from 'react';
import { SxProps } from '@mui/system';
import { useRapidCmi5Opts } from '../../../course-builder/GitViewer/session/RapidCmi5OptsContext';

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
  // Get the unique rc5id from the form data for scoping ksats to individual activity
  const rc5id = defaultFormData?.rc5id;

  const { codeRunnerOps } = useRapidCmi5Opts();
  /* Lesson Theme */
  const { lessonTheme } = useContext(LessonThemeContext);
  const { outerActivitySxWithConstrainedWidthForm } = useLessonThemeStyles(
    lessonTheme,
    maxFormWidths.jobeEditor,
  );

  const validationSchema = yup.object().shape({
    // student: DESCRIPTION_GROUP,
    // evaluator: DESCRIPTION_GROUP,
    ksats: yup.array().of(
      yup.object().optional().shape({
        element_identifier: REQUIRED_ENTRY,
      }),
    ),
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
    const { control, setValue, getValues, watch } = formMethods;
    const { errors } = formState;
    const selectedLanguage = watch('programmingLanguage');

    const handleLanguageChange = (language: string) => {
      const versions = runtimeMap[language] ?? [];
      setVersionOptions(versions);
      setValue('languageVersion', versions[0] ?? '');
    };

    const [runtimeMap, setRuntimeMap] = useState<Record<string, string[]>>({});
    const [programmingLanguageOptions, setProgrammingLanguageOptions] =
      useState<string[]>([]);
    const [versionOptions, setVersionOptions] = useState<string[]>([]);
    const [useRuntimeDropdowns, setUseRuntimeDropdowns] = useState(false);

    useEffect(() => {
      const fetchRuntimes = async () => {
        const runtimes = (await codeRunnerOps?.listRuntimes()) as unknown as
          | Record<string, string[]>
          | undefined;
        if (!runtimes || !Object.keys(runtimes).length) return;
        setRuntimeMap(runtimes);
        setProgrammingLanguageOptions(Object.keys(runtimes));
        setUseRuntimeDropdowns(true);

        if (!getValues('programmingLanguage')) {
          const firstLanguage = Object.keys(runtimes)[0];
          const firstVersions = runtimes[firstLanguage] ?? [];
          setVersionOptions(firstVersions);
          setValue('programmingLanguage', firstLanguage);
          setValue('languageVersion', firstVersions[0] ?? '');
        }
      };
      fetchRuntimes();
    }, [codeRunnerOps]);

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
        <Grid size={11.5}>
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
        formTitle="Jobe In The Box"
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
