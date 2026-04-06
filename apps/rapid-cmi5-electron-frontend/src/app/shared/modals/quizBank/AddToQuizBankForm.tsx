import {
  FormControlCheckboxField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/system';
import Grid from '@mui/material/Grid2';
import LabelIcon from '@mui/icons-material/Label';
import { useState } from 'react';
import {
  Control,
  FieldValues,
  UseFormReturn,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { GetQuizBankAddModalProps } from '@rapid-cmi5/react-editor';
import { currentQuizBankApiVersion } from '@rapid-cmi5/cmi5-build-common';
import { FormatQuestionOptions, QuestionTypeChip } from './QuestionCard';

function TagInput({
  control,
  setValue,
}: {
  control: Control;
  setValue: UseFormSetValue<FieldValues>;
}) {
  const tags = (useWatch({ control, name: 'tags' }) as string[]) ?? [];
  const [tagInput, setTagInput] = useState('');

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (newTag && !tags.includes(newTag)) {
        setValue('tags', [...tags, newTag], { shouldValidate: true });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setValue(
      'tags',
      tags.filter((t) => t !== tag),
      { shouldValidate: true },
    );
  };

  return (
    <>
      <TextField
        fullWidth
        size="small"
        label="Tags — press Enter to add"
        placeholder="Add tag..."
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleTagKeyDown}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LabelIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      {tags.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              color="primary"
              variant="outlined"
              onDelete={() => handleRemoveTag(tag)}
            />
          ))}
        </Box>
      )}
    </>
  );
}

export function AddToQuizBankForm({
  addQuestion,
  question,
  closeModal,
}: GetQuizBankAddModalProps) {

  const validationSchema = yup.object().shape({
    public: yup.boolean(),
    tags: yup
      .array()
      .of(yup.string().trim().max(50, 'Each tag must be 50 characters or less'))
      .max(20, 'You can add up to 20 tags'),
  });

  const doAction = async (data: { public: boolean; tags: string[] }) => {
    if (!question.type) throw Error('Question type not defined');
    if (!addQuestion) throw Error('Add question to quiz bank is undefined')
    await addQuestion({
      publicQuestion: data.public ?? true,
      questionType: question.type,
      question: question.question,
      cmi5QuestionId: question.cmi5QuestionId,
      correctAnswer: question.typeAttributes.correctAnswer,
      grading: question.typeAttributes.grading,
      options: question.typeAttributes.options ?? undefined,
      matching: question.typeAttributes.matching ?? undefined,
      shuffleAnswers: question.typeAttributes.shuffleAnswers ?? undefined,
      rc5QuizBankApiVersion: currentQuizBankApiVersion,
      tags: data.tags,
    });
    closeModal();
  };

  const getFormFields = (
    formMethods: UseFormReturn,
    _formState: FormStateType,
  ): JSX.Element => {
    const { control, setValue } = formMethods;

    return (
      <>
        <Grid size={12}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1.5,
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="h4" fontWeight={600} mb={1}>
              Question: {question.question}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.75}>
              <QuestionTypeChip type={question.type} />
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <FormatQuestionOptions q={question} />
          </Box>
        </Grid>

        <Grid size={12} sx={{ paddingTop: 1 }}>
          <TagInput control={control} setValue={setValue} />
        </Grid>

        {/* Whether to show question to all users*/}
        <Grid size={12}>
          <FormControlCheckboxField
            control={control}
            name="public"
            label="Public"
            infoText="Public questions can be seen and used by other course authors."
          />
        </Grid>
      </>
    );
  };

  return (
    <ModalDialog buttons={[]} dialogProps={{ open: true }} maxWidth="sm">
      <FormControlUIProvider>
        <MiniForm
          dataCache={{
            public: true,
            tags: question.tags ?? [],
          }}
          doAction={doAction}
          formTitle="Add to Quiz Bank"
          getFormFields={getFormFields}
          instructions=""
          submitButtonText="Add to Bank"
          successToasterMessage="Question Added to Quiz Bank"
          onClose={closeModal}
          onCancel={closeModal}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default AddToQuizBankForm;
