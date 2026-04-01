import SearchIcon from '@mui/icons-material/Search';
import { MenuItem, SxProps } from '@mui/material';
import { UseFormReturn } from 'react-hook-form';

/* MUI */
import Grid from '@mui/material/Grid2';

import * as yup from 'yup';

import { QuizQuestionsFieldGroup } from '../../../course-builder/QuizQuestionsFieldGroup';
import { KSATsFieldGroup } from '../components/KSATsFieldGroup';
import LrsHeaderWithDetails from './LrsStatementHelper';
import {
  RC5ActivityTypeEnum,
  QuizContent,
  SlideTypeEnum,
  QuizCompletionEnum,
  MoveOnCriteriaEnum,
  QuestionResponse,
  QuestionGrading,
  moveOnCriteriaOptions,
  QuizQuestion,
  QuestionBankApi,
  convertFromApi,
} from '@rapid-cmi5/cmi5-build-common';
import {
  ENUM_GROUP,
  REQUIRED_ERROR,
  REQUIRED_ENTRY,
  SPECIFY_AT_LEAST_ONE_ERROR,
  defaultQuestion,
  FormControlIntegerField,
  FormControlSelectField,
  FormControlTextField,
  FormControlUIProvider,
  FormCrudType,
  FormFieldArray,
  FormStateType,
  MiniForm,
  tFormFieldRendererProps,
  ButtonModalMinorUi,
  LessonThemeContext,
  maxFormWidths,
  useLessonThemeStyles,
} from '@rapid-cmi5/ui';
import { featureFlagShouldShowKSATs } from '../../../../featureFlags';

import { useContext, useState } from 'react';

import { GitContext } from '../../../course-builder/GitViewer/session/GitContext';

export function requireField<T>(value: T | undefined | null, field: string): T {
  if (value === undefined || value === null) {
    throw new Error(`Missing "${field}" in quiz bank question`);
  }
  return value;
}

export const QuizForm = ({
  activityKind,
  crudType,
  defaultFormData,
  deleteButton,
  onSave,
}: {
  activityKind: RC5ActivityTypeEnum;
  crudType: FormCrudType;
  defaultFormData: QuizContent;
  deleteButton?: JSX.Element;
  handleCloseModal?: () => void;
  onSave: (activity: RC5ActivityTypeEnum, data: any) => void;
}) => {
  const { QuizBankAddModal, QuizBankSearchModal } = useContext(GitContext);

  const slideType =
    activityKind === RC5ActivityTypeEnum.quiz
      ? SlideTypeEnum.Quiz
      : SlideTypeEnum.CTF;

  const [isSearchBankOpen, setIsSearchBankOpen] = useState(false);
  const [bankQuestion, setBankQuestion] = useState<any>(null);

  /* Lesson Theme */
  const { lessonTheme } = useContext(LessonThemeContext);
  const { outerActivitySxWithConstrainedWidthForm } = useLessonThemeStyles(
    lessonTheme,
    maxFormWidths.quizEditor,
  );

  const validationSchema = yup.object().shape({
    //cmi5QuizId: read-only field auto populated/updated
    completionRequired: ENUM_GROUP(QuizCompletionEnum, false), // Optional for backward compatibility
    moveOnCriteria: ENUM_GROUP(MoveOnCriteriaEnum, true),
    passingScore: yup
      .number()
      .typeError('Must be an integer')
      .required(REQUIRED_ERROR)
      .integer('Must be an integer')
      .min(0, 'There is a minimum value of 0')
      .max(100, 'There is a maximum value of 100'),
    ksats: yup.array().of(
      yup.object().optional().shape({
        element_identifier: REQUIRED_ENTRY,
      }),
    ),
    questions: yup
      .array()
      .of(
        yup.object().shape({
          question: REQUIRED_ENTRY,
          type: ENUM_GROUP(QuestionResponse, true),
          typeAttributes: yup.object().shape({
            correctAnswer: yup.mixed(), // string or number
            grading: ENUM_GROUP(QuestionGrading, true),
            options: yup
              .array()
              .of(
                yup.object().shape({
                  text: REQUIRED_ENTRY,
                }),
              )
              .min(1, SPECIFY_AT_LEAST_ONE_ERROR),
          }),
        }),
      )
      .min(1, SPECIFY_AT_LEAST_ONE_ERROR),
  });

  const onSaveAction = (data: any) => {
    // rename questionids to match quizName
    if (data?.questions && data.questions.length > 0) {
      const idPrefix = `${data.cmi5QuizId}_q`;
      data.questions.forEach((question: any, index: number) => {
        question.cmi5QuestionId = `${idPrefix}${index + 1}`;
      });
    }

    // Sync completionRequired with moveOnCriteria for backward compatibility
    // This ensures both fields have the same value so existing code that reads completionRequired will work
    if (data?.moveOnCriteria) {
      data.completionRequired = data.moveOnCriteria;
    }

    if (onSave) {
      onSave(RC5ActivityTypeEnum.quiz, data as QuizContent);
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
    const { control, getValues, setValue } = formMethods;
    const { errors } = formState;

    /**
     * Renumbers the question ids based on reordering
     */
    const handleReorderQuestions = () => {
      const questions = getValues('questions');
      questions.forEach((question: any, index: number) => {
        question.cmi5QuestionId = `q${index + 1}`;
      });
    };

    const mapBankQuestionToFormQuestion = (
      question: QuestionBankApi,
      index: number,
    ): QuizQuestion => {
      const converted = convertFromApi(question);
      converted.cmi5QuestionId = `q${index + 1}`;
      return converted;
    };

    const handleModalResponse = (selectedQuestions: QuestionBankApi[]) => {
      const existingQuestions = getValues('questions') || [];

      const mappedQuestions = selectedQuestions.map((question, idx) =>
        mapBankQuestionToFormQuestion(question, existingQuestions.length + idx),
      );

      const updatedQuestions = [...existingQuestions, ...mappedQuestions].map(
        (question, index) => ({
          ...question,
          cmi5QuestionId: `q${index + 1}`,
        }),
      );

      setValue('questions', updatedQuestions, {
        shouldDirty: true,
        shouldValidate: true,
      });

      setIsSearchBankOpen(false);
    };
    return (
      <>
        <Grid size={3}>
          <FormControlTextField
            control={control}
            placeholder="Activity Id"
            name={'cmi5QuizId'}
            label="Activity Id"
            error={Boolean(errors?.cmi5QuizId)}
            helperText={errors?.cmi5QuizId?.message}
            readOnly={crudType === FormCrudType.view}
            required
          />
        </Grid>

        <Grid size={4}>
          <FormControlIntegerField
            {...formMethods}
            control={control}
            error={Boolean(errors?.passingScore)}
            helperText={errors?.passingScore?.message}
            name={'passingScore'}
            label="Passing %"
            readOnly={crudType === FormCrudType.view}
            required
          />
        </Grid>
        <Grid size={4}>
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
        <Grid size={11}>
          <FormControlTextField
            control={control}
            placeholder="Title"
            name={'title'}
            label="Title"
            error={Boolean(errors?.title)}
            helperText={errors?.title?.message}
            readOnly={crudType === FormCrudType.view}
          />
        </Grid>

        {bankQuestion && QuizBankAddModal && (
          <QuizBankAddModal
            formType={crudType}
            errors={errors}
            formMethods={formMethods}
            closeModal={() => setBankQuestion(null)}
            question={bankQuestion}
          />
        )}
        {isSearchBankOpen && QuizBankSearchModal && (
          <QuizBankSearchModal
            submitForm={handleModalResponse}
            formType={crudType}
            errors={errors}
            formMethods={formMethods}
            closeModal={() => setIsSearchBankOpen(false)}
            activityType={activityKind}
          />
        )}
        <Grid size={11}>
          <FormFieldArray
            errors={errors?.questions}
            allowReOrder={true}
            allowSingleItemView={true}
            arrayFieldName={`questions`}
            additionalButtons={[
              ...(QuizBankSearchModal
                ? [
                    <ButtonModalMinorUi
                      aria-label="search-question-bank"
                      id="search-question-bank-button"
                      size="small"
                      onClick={() => setIsSearchBankOpen(true)}
                      startIcon={<SearchIcon fontSize="small" />}
                    >
                      Quiz Bank
                    </ButtonModalMinorUi>,
                  ]
                : []),
            ]}
            arrayRenderItem={(props: tFormFieldRendererProps) => {
              return (
                <QuizQuestionsFieldGroup
                  crudType={crudType}
                  formProps={props}
                  slideType={slideType}
                  onAddToBank={
                    QuizBankAddModal ? (q) => setBankQuestion(q) : undefined
                  }
                />
              );
            }}
            defaultValues={{
              ...defaultQuestion,
              cmi5QuestionId: `q${getValues('questions')?.length + 1 || 1}`,
            }}
            defaultIsExpanded={false}
            defaultSingleItemView={true}
            deleteTooltip="Delete Question"
            expandId={`questions`}
            isExpandable={true}
            title="Questions"
            formMethods={formMethods}
            onReorderEntry={handleReorderQuestions}
          />
        </Grid>
        {featureFlagShouldShowKSATs && (
          <Grid size={11.5}>
            <KSATsFieldGroup
              formMethods={formMethods}
              crudType={crudType}
              //#REF scopedKsatsFieldName={scopedKsatsFieldName}
            />
          </Grid>
        )}

        <Grid size={11}>
          <LrsHeaderWithDetails activityType={RC5ActivityTypeEnum.quiz} />
        </Grid>
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
        formTitle={activityKind === RC5ActivityTypeEnum.quiz ? 'Quiz' : 'CTF'}
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
