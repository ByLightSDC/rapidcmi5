import {
  FormControlCheckboxField,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid2';
import LabelIcon from '@mui/icons-material/Label';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { QuestionBankApiCreate } from 'packages/rapid-cmi5/src/lib/contexts/QuizBankContext';

export function AddToQuizBankForm({
  question,
  handleCloseModal,
  handleModalAction,
}: {
  question: any;
  handleCloseModal: () => void;
  handleModalAction: (question: QuestionBankApiCreate) => Promise<void>;
}) {
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(question.tags ?? []);

  const validationSchema = yup.object().shape({
    public: yup.boolean(),
  });

  const doAction = async (data: any) => {

    if (!question.type) throw Error("Question type not defined");
    const newQuestion: QuestionBankApiCreate = {
      public: data.public ?? true,
      questionType: question.type,
      question: question.question,
      quizQuestion: question,
      rc5Version: '1',
      tags,
    };
    await handleModalAction(newQuestion);
  };

  const getFormFields = (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ): JSX.Element => {
    const { control } = formMethods;

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
        e.preventDefault();
        const newTag = tagInput.trim().replace(/,$/, '');
        if (newTag && !tags.includes(newTag)) {
          setTags((prev) => [...prev, newTag]);
        }
        setTagInput('');
      }
    };

    const handleRemoveTag = (tag: string) => {
      setTags((prev) => prev.filter((t) => t !== tag));
    };

    return (
      <>
        <Grid size={12}>
          <FormControlTextField
            control={control}
            name="question"
            label="Question"
            readOnly={true}
          />
        </Grid>
        <Grid size={12}>
          <FormControlTextField
            control={control}
            name="type"
            label="Type"
            readOnly={true}
          />
        </Grid>

        <Grid size={12}>
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
        </Grid>

        <Grid size={12}>
          <FormControlCheckboxField
            control={control}
            name="public"
            label="Public"
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
            question: question.question,
            public: true,
            tags: question.tags ?? [],
          }}
          doAction={doAction}
          formTitle="Add to Quiz Bank"
          getFormFields={getFormFields}
          instructions=""
          submitButtonText="Add to Bank"
          successToasterMessage="Question Added to Quiz Bank"
          onClose={handleCloseModal}
          onCancel={handleCloseModal}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default AddToQuizBankForm;
