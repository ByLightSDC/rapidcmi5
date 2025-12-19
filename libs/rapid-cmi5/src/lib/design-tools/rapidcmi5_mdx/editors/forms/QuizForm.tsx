import { MenuItem } from '@mui/material';
import { UseFormReturn } from 'react-hook-form';
import {
  defaultQuestion,
  ENUM_GROUP,
  FormControlIntegerField,
  FormControlSelectField,
  FormControlTextField,
  FormControlUIProvider,
  FormCrudType,
  FormFieldArray,
  FormStateType,
  MiniForm,
  REQUIRED_ENTRY,
  REQUIRED_ERROR,
  SPECIFY_AT_LEAST_ONE_ERROR,
  tFormFieldRendererProps,
} from '@rapid-cmi5/ui/branded';
import { Grid } from '@mui/material';
import * as yup from 'yup';
import {
  MoveOnCriteriaEnum,
  moveOnCriteriaOptions,
  QuestionGrading,
  QuestionResponse,
  QuizCompletionEnum,
  QuizContent,
  SlideTypeEnum,
} from '@rapid-cmi5/cmi5-build/common';


import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build/common';
import { QuizQuestionsFieldGroup } from '../../../course-builder/QuizQuestionsFieldGroup';
import { KSATsFieldGroup } from '../components/KSATsFieldGroup';
import LrsHeaderWithDetails from './LrsStatementHelper';

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
  const slideType =
    activityKind === RC5ActivityTypeEnum.quiz
      ? SlideTypeEnum.Quiz
      : SlideTypeEnum.CTF;

  // Get the unique rc5id from the form data for scoping ksats to individual activity
  //#REF
  // const rc5id = defaultFormData?.rc5id;
  // const scopedKsatsFieldName = rc5id ? `ksats_${rc5id}` : 'ksats';

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
    //#REF [scopedKsatsFieldName]: yup.array().of(yup.string()).optional(),
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
    const { control, getValues } = formMethods;
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

    return (
      <>
        <Grid item xs={3}>
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

        {/*<Grid item xs={2.5}>*/}
        {/*  <FormControlSelectField*/}
        {/*    control={control}*/}
        {/*    name={'completionRequired'}*/}
        {/*    required*/}
        {/*    label="Completion"*/}
        {/*    error={Boolean(errors?.completionRequired)}*/}
        {/*    helperText={errors?.completionRequired?.message}*/}
        {/*    readOnly={crudType === FormCrudType.view}*/}
        {/*  >*/}
        {/*    {completionOptions.map((item) => (*/}
        {/*      <MenuItem key={item} value={item}>*/}
        {/*        {item}*/}
        {/*      </MenuItem>*/}
        {/*    ))}*/}
        {/*  </FormControlSelectField>*/}
        {/*</Grid>*/}

        <Grid item xs={4}>
          <FormControlIntegerField
            {...formMethods}
            control={control}
            error={Boolean(errors?.passingScore)}
            helperText={errors?.passingScore?.message}
            //infoText={interfaceIndexHelperText}
            name={'passingScore'}
            label="Passing %"
            readOnly={crudType === FormCrudType.view}
            required
          />
        </Grid>
        <Grid item xs={4}>
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
        <Grid item xs={11}>
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
        <Grid item xs={11}>
          <FormFieldArray
            errors={errors?.questions}
            allowReOrder={true}
            allowSingleItemView={true}
            arrayFieldName={`questions`}
            arrayRenderItem={(props: tFormFieldRendererProps) => {
              return (
                <QuizQuestionsFieldGroup
                  crudType={crudType}
                  formProps={props}
                  slideType={slideType}
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
        {/* <Grid item xs={11.5}>
          <KSATsFieldGroup
            formMethods={formMethods}
            crudType={crudType}
            //#REF scopedKsatsFieldName={scopedKsatsFieldName}
          />
        </Grid> */}

        <Grid item xs={11}>
          <LrsHeaderWithDetails activityType={RC5ActivityTypeEnum.quiz} />
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
        formTitle={activityKind === RC5ActivityTypeEnum.quiz ? 'Quiz' : 'CTF'}
        formWidth="800px"
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
