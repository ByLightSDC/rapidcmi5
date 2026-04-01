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
import { useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { QuizBankAddModalProps } from '@rapid-cmi5/react-editor';
import axios from 'axios';
import {
  currentQuizBankApiVersion,
  QuestionBankApiCreate,
} from '@rapid-cmi5/cmi5-build-common';
import { FormatQuestionOptions, QuestionTypeChip } from './Question';

export function AddToQuizBankForm({
  url,
  token,
  question,
  closeModal,
}: QuizBankAddModalProps) {
  const apiClient = useMemo(() => {
    return axios.create({
      baseURL: url,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, [url]);

  const addToQuizBank = async (question: QuestionBankApiCreate) => {
    try {
      const response = await apiClient.post(
        '/v1/quiz-bank/question-bank',
        { ...question },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Failed to add question to quiz bank', error);
      throw error;
    }
  };

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(question.tags ?? []);

  const validationSchema = yup.object().shape({
    public: yup.boolean(),
  });

  const doAction = async (data: { public: boolean }) => {
    if (!question.type) throw Error('Question type not defined');
    const newQuestion: QuestionBankApiCreate = {
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
      tags,
    };
    await addToQuizBank(newQuestion);
    closeModal();
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
          onClose={closeModal}
          onCancel={closeModal}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default AddToQuizBankForm;
