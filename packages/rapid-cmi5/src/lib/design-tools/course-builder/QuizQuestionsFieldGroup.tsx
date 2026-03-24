/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useMemo, useState } from 'react';

/* MUI */
import Grid from '@mui/material/Grid2';
import { Box, Button, MenuItem, Tooltip } from '@mui/material';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import {
  SlideTypeEnum,
  QuestionResponse,
  responseOptions,
  gradingOptions,
} from '@rapid-cmi5/cmi5-build-common';
import {
  FormCrudType,
  tFormFieldRendererProps,
  useDisplayFocus,
  FormControlSelectField,
  FormControlTextField,
  FormControlCheckboxField,
  FormFieldArray,
  setModal,
} from '@rapid-cmi5/ui';

import { useRC5Prompts } from '../rapidcmi5_mdx/modals/useRC5Prompts';
import { QuizBankContext } from '../../contexts/QuizBankContext';
import QuizBankSearchForm, {
  QuestionType,
} from './modals/QuizBank/QuizBankSearchForm';
import AddToQuizBankForm from './modals/QuizBank/AddToQuizBankForm';

/**
 * @interface fieldGroupProps
 * @extends tFormFieldRendererProps
 * @property {FormCrudType} crudType Mode for displaying data
 * @property {*} [formErrors] Top level form errors
 */
interface fieldGroupProps {
  crudType: FormCrudType;
  formErrors?: any;
  formProps: tFormFieldRendererProps;
  rowIndex?: number;
  slideType: SlideTypeEnum;
  addToQuizBank?: (question: QuestionType) => void;
}

/**
 * Slide Field Group
 * @param props
 * @returns
 */
export function QuizQuestionsFieldGroup(props: fieldGroupProps) {
  const { crudType, formProps, slideType, addToQuizBank } = props;
  const { formMethods, indexedArrayField, indexedErrors, isFocused } =
    formProps;
  const { control, getValues, setValue, trigger, watch } = formMethods;

  const [isAddQuestionBankOpen, setIsAddQuestionBankOpen] = useState(false);

  const watchQuestionType = watch(`${indexedArrayField}.type`);
  const watchQuestion = watch(`${indexedArrayField}.question`);
  const watchGrading = watch(`${indexedArrayField}.typeAttributes.grading`);
  const watchCorrectAnswer = watch(
    `${indexedArrayField}.typeAttributes.correctAnswer`,
  );
  const watchOptions = watch(`${indexedArrayField}.typeAttributes.options`);
  const watchMatching = watch(`${indexedArrayField}.typeAttributes.matching`);

  const isQuestionValid = useMemo(() => {
    if (!watchQuestion?.trim() || !watchQuestionType || !watchGrading)
      return false;
    if (
      watchQuestionType === QuestionResponse.MultipleChoice ||
      watchQuestionType === QuestionResponse.SelectAll
    ) {
      return (
        Array.isArray(watchOptions) &&
        watchOptions.length > 0 &&
        watchOptions.every((o: any) => o.text?.trim())
      );
    }
    if (watchQuestionType === QuestionResponse.TrueFalse) {
      return !!watchCorrectAnswer;
    }
    if (watchQuestionType === QuestionResponse.Matching) {
      return (
        Array.isArray(watchMatching) &&
        watchMatching.length > 0 &&
        watchMatching.every((m: any) => m.option?.trim() && m.response?.trim())
      );
    }
    return !!watchCorrectAnswer?.toString().trim();
  }, [
    watchQuestion,
    watchQuestionType,
    watchGrading,
    watchCorrectAnswer,
    watchOptions,
    watchMatching,
  ]);

  const focusHelper = useDisplayFocus();
  // this effect is for focusing on question field when added as row to array
  useEffect(() => {
    if (isFocused) {
      focusHelper.focusOnElementById(`${indexedArrayField}.question`);
    }
  }, [isFocused]);

  useEffect(() => {
    // Answer field is required as specific selection for true/false question
    if (watchQuestionType === QuestionResponse.TrueFalse) {
      setValue(`${indexedArrayField}.typeAttributes.correctAnswer`, 'True');
      trigger(`${indexedArrayField}.typeAttributes.correctAnswer`);
    } else if (watchQuestionType === QuestionResponse.Matching) {
      const question = getValues(`${indexedArrayField}.question`);
      // default the question for matching
      if (question === '') {
        setValue(`${indexedArrayField}.question`, 'Match the following:');
        trigger(`${indexedArrayField}.question`);
      }
    }
  }, [watchQuestionType]);

  const handleAddToQuizBank = () => {
    if (!addToQuizBank) return;
    const questionData = getValues(indexedArrayField);
    addToQuizBank({
      question: questionData.question,
      type: questionData.type,
      questionData,
    });
  };

  return (
    <Grid
      container
      spacing={0.5}
      sx={{ marginLeft: '12px', width: '100%' }}
      id={indexedArrayField} // this is used for scrolling when new array entry added
    >
      {addToQuizBank && isQuestionValid && (
        <Tooltip title="Save this question to the quiz bank">
          <Button
            size="small"
            variant="outlined"
            startIcon={<BookmarkAddIcon />}
            onClick={() => setIsAddQuestionBankOpen(true)}
          >
            Add to Quiz Bank
          </Button>
        </Tooltip>
      )}
      {addToQuizBank && isAddQuestionBankOpen && (
        <AddToQuizBankForm
          handleCloseModal={() => setIsAddQuestionBankOpen(false)}
          handleModalAction={addToQuizBank}
          question={getValues(indexedArrayField)}
        />
      )}
      <Grid size={4}>
        <FormControlSelectField
          control={control}
          name={`${indexedArrayField}.type`}
          required
          label="Question Type"
          error={Boolean(indexedErrors?.type)}
          helperText={indexedErrors?.type?.message}
          readOnly={
            crudType === FormCrudType.view || slideType === SlideTypeEnum.CTF
          }
        >
          {responseOptions.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </FormControlSelectField>
      </Grid>
      <Grid size={4}>
        <FormControlSelectField
          control={control}
          name={`${indexedArrayField}.typeAttributes.grading`}
          required
          label="Response Type"
          error={Boolean(indexedErrors?.typeAttributes?.grading)}
          helperText={indexedErrors?.typeAttributes?.grading?.message}
          readOnly={
            crudType === FormCrudType.view ||
            slideType === SlideTypeEnum.CTF ||
            watchQuestionType === QuestionResponse.Matching
          }
        >
          {gradingOptions.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </FormControlSelectField>
      </Grid>
      <Grid size={4}>
        <FormControlTextField
          control={control}
          placeholder="Question Id"
          name={`${indexedArrayField}.cmi5QuestionId`}
          label="Question Id"
          readOnly={true}
        />
      </Grid>
      <Grid size={11}>
        <FormControlTextField
          control={control}
          placeholder="Question"
          multiline
          name={`${indexedArrayField}.question`}
          label="Question"
          error={Boolean(indexedErrors?.question)}
          helperText={indexedErrors?.question?.message}
          readOnly={crudType === FormCrudType.view}
          required
        />
      </Grid>
      {(watchQuestionType === QuestionResponse.MultipleChoice ||
        watchQuestionType === QuestionResponse.SelectAll) && (
        <>
          <Grid size={6}>
            <FormControlCheckboxField
              control={control}
              name={`${indexedArrayField}.typeAttributes.shuffleAnswers`}
              label="Shuffle Answer Order"
            />
          </Grid>
          <Grid size={11}>
            <FormFieldArray
              errors={indexedErrors?.typeAttributes}
              arrayFieldName={`${indexedArrayField}.typeAttributes.options`}
              arrayRenderItem={(props: tFormFieldRendererProps) => {
                return (
                  <QuestionOptionsFieldGroup
                    crudType={crudType}
                    formProps={props}
                    questionField={indexedArrayField}
                    questionType={watchQuestionType}
                    slideType={slideType}
                    addToQuizBank={addToQuizBank}
                  />
                );
              }}
              defaultIsExpanded={true}
              defaultValues={{
                text: '',
                correct:
                  watchQuestionType === QuestionResponse.SelectAll
                    ? true
                    : false,
              }}
              isExpandable={true}
              title="Options *"
              {...formProps}
            />
          </Grid>
        </>
      )}
      {watchQuestionType === QuestionResponse.TrueFalse && (
        <Grid size={4}>
          <FormControlSelectField
            control={control}
            name={`${indexedArrayField}.typeAttributes.correctAnswer`}
            required
            label="Answer"
            error={Boolean(indexedErrors?.typeAttributes?.correctAnswer)}
            helperText={indexedErrors?.typeAttributes?.correctAnswer?.message}
            readOnly={crudType === FormCrudType.view}
          >
            <MenuItem key={'true'} value={'True'}>
              True
            </MenuItem>
            <MenuItem key={'false'} value={'False'}>
              False
            </MenuItem>
          </FormControlSelectField>
        </Grid>
      )}
      {watchQuestionType !== QuestionResponse.MultipleChoice &&
        watchQuestionType !== QuestionResponse.Matching &&
        watchQuestionType !== QuestionResponse.SelectAll &&
        watchQuestionType !== QuestionResponse.TrueFalse && (
          <Grid size={11}>
            <FormControlTextField
              control={control}
              placeholder="Answer"
              multiline
              name={`${indexedArrayField}.typeAttributes.correctAnswer`}
              label="Answer"
              error={Boolean(indexedErrors?.typeAttributes?.correctAnswer)}
              helperText={indexedErrors?.typeAttributes?.correctAnswer?.message}
              readOnly={crudType === FormCrudType.view}
            />
          </Grid>
        )}
      {watchQuestionType === QuestionResponse.Matching && (
        <Box
          sx={{
            paddingRight: '8px', // to separate match delete vs quiz question delete
            width: '100%',
          }}
        >
          <FormFieldArray
            errors={indexedErrors?.typeAttributes}
            arrayFieldName={`${indexedArrayField}.typeAttributes.matching`}
            arrayRenderItem={(props: tFormFieldRendererProps) => {
              return (
                <QuestionMatchingFieldGroup
                  crudType={crudType}
                  formProps={props}
                  slideType={slideType}
                  addToQuizBank={addToQuizBank}
                />
              );
            }}
            defaultIsExpanded={true}
            defaultValues={{
              option: '',
              response: '',
            }}
            deleteTooltip="Delete Match"
            isExpandable={true}
            title="Matches *"
            {...formProps}
          />
        </Box>
      )}
    </Grid>
  );
}

interface optionFieldGroupProps extends fieldGroupProps {
  questionField: string;
  questionType: QuestionResponse;
}
function QuestionOptionsFieldGroup(props: optionFieldGroupProps) {
  const { crudType, formProps, questionField, questionType } = props;
  const { formMethods, indexedArrayField, indexedErrors, isFocused, rowIndex } =
    formProps;
  const { control, getValues, setValue, watch } = formMethods;

  const focusHelper = useDisplayFocus();
  // this effect is for focusing on text field when added as row to array
  useEffect(() => {
    if (isFocused) {
      focusHelper.focusOnElementById(`${indexedArrayField}.text`);
    }
  }, [isFocused]);

  const handleOptionSelection = (optionIndex: number, newValue: boolean) => {
    // only ONE correct answer for simple multiple choice (vs selectAll)
    if (questionType === QuestionResponse.MultipleChoice && newValue === true) {
      const options = getValues(`${questionField}.typeAttributes.options`);
      for (let i = 0; i < options.length; i++) {
        if (i !== optionIndex) {
          setValue(
            `${questionField}.typeAttributes.options[${i}].correct`,
            false,
          );
        }
      }
    }
  };

  return (
    <Grid
      container
      spacing={0.5}
      sx={{ marginLeft: '12px', width: '100%' }}
      id={indexedArrayField} // this is used for scrolling when new array entry added
    >
      <Grid size={9}>
        <FormControlTextField
          control={control}
          placeholder="Enter Option"
          multiline
          name={`${indexedArrayField}.text`}
          error={Boolean(indexedErrors?.text)}
          helperText={indexedErrors?.text?.message}
          readOnly={crudType === FormCrudType.view}
          required
        />
      </Grid>
      <Grid size={3}>
        <FormControlCheckboxField
          control={control}
          name={`${indexedArrayField}.correct`}
          label="Correct"
          checkboxProps={{
            disabled: crudType === FormCrudType.view,
          }}
          onChange={(event, value) =>
            handleOptionSelection(rowIndex || 0, value)
          }
        />
      </Grid>
    </Grid>
  );
}

function QuestionMatchingFieldGroup(props: fieldGroupProps) {
  const { crudType, formProps } = props;
  const { formMethods, indexedArrayField, indexedErrors, isFocused, rowIndex } =
    formProps;
  const { control } = formMethods;

  return (
    <Grid
      container
      spacing={0.5}
      sx={{ marginLeft: '12px', width: '100%' }}
      id={indexedArrayField}
    >
      <Grid size={6}>
        <FormControlTextField
          control={control}
          placeholder="Enter Option"
          multiline
          label="Option"
          name={`${indexedArrayField}.option`}
          error={Boolean(indexedErrors?.text)}
          helperText={indexedErrors?.text?.message}
          readOnly={crudType === FormCrudType.view}
          required
        />
      </Grid>
      <Grid size={6}>
        <FormControlTextField
          control={control}
          placeholder="Enter Correct Match"
          multiline
          name={`${indexedArrayField}.response`}
          label="Match"
          error={Boolean(indexedErrors?.response)}
          helperText={indexedErrors?.response?.message}
          readOnly={crudType === FormCrudType.view}
          required
        />
      </Grid>
    </Grid>
  );
}
