import { ModalDialog } from '@rapid-cmi5/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import LabelIcon from '@mui/icons-material/Label';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import { useState } from 'react';
import { QuestionType } from './QuizBankSearchForm';

export function AddToQuizBankForm({
  question,
  handleCloseModal,
  handleModalAction,
}: {
  question: QuestionType;
  handleCloseModal: () => void;
  handleModalAction: (question: QuestionType) => void;
}) {
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(question.tags ?? []);

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

  const handleConfirm = () => {
    handleModalAction({ ...question, tags });
  };

  return (
    <ModalDialog
      buttons={[]}
      dialogProps={{ open: true }}
      maxWidth="sm"
    >
      <Stack spacing={2} sx={{ p: 1, minWidth: 380 }}>
        <Typography variant="h6" fontWeight={600}>
          Add to Quiz Bank
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Question
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {question.question}
          </Typography>
        </Box>

        <Divider />

        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Tags — type a tag and press Enter
          </Typography>
          <TextField
            fullWidth
            size="small"
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
          <Button variant="outlined" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<BookmarkAddIcon />}
            onClick={handleConfirm}
          >
            Add to Bank
          </Button>
        </Box>
      </Stack>
    </ModalDialog>
  );
}

export default AddToQuizBankForm;
