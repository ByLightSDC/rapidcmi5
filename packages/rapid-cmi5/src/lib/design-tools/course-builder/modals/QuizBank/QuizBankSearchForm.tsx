import { ModalDialog } from '@rapid-cmi5/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import LabelIcon from '@mui/icons-material/Label';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState, useCallback, useEffect } from 'react';
import { quizBankSearchModalId } from '../../../rapidcmi5_mdx/modals/constants';
import { QuestionBankApi } from '../../../../contexts/QuizBankContext';
import QuestionCard from './Question';

type SearchMode = 'question' | 'tags';

export type QuestionType = {
  question: string;
  type: string;
  tags?: string[];
  questionData: any;
};

export function QuizBankSearchForm({
  handleCloseModal,
  handleModalAction,
  onSearch,
  multiSelect = false,
}: {
  handleCloseModal: () => void;
  handleModalAction: (data: QuestionType[]) => void;
  onSearch: (query: string, mode: SearchMode) => Promise<QuestionBankApi[]>;
  multiSelect?: boolean;
}) {
  const [searchMode, setSearchMode] = useState<SearchMode>('question');
  const [inputValue, setInputValue] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [results, setResults] = useState<QuestionBankApi[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const runSearch = useCallback(
    async (query: string, mode: SearchMode) => {
      if (!query.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      setLoading(true);
      setHasSearched(true);
      try {
        const data = await onSearch(query.trim(), mode);
        console.log('this is data', data);
        if (data) setResults(data);
      } finally {
        setLoading(false);
      }
    },
    [onSearch],
  );

  const handleModeChange = (_: React.MouseEvent, value: SearchMode | null) => {
    if (!value) return;
    setSearchMode(value);
    setInputValue('');
    setTagInput('');
    setActiveTags([]);
    setResults([]);
    setHasSearched(false);
  };

  const handleQuestionInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value;
    setInputValue(val);
    clearTimeout((handleQuestionInputChange as any)._t);
    (handleQuestionInputChange as any)._t = setTimeout(
      () => runSearch(val, 'question'),
      350,
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (newTag && !activeTags.includes(newTag)) {
        const updated = [...activeTags, newTag];
        setActiveTags(updated);
        setTagInput('');
        runSearch(updated.join(','), 'tags');
      } else {
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    const updated = activeTags.filter((t) => t !== tag);
    setActiveTags(updated);
    if (updated.length === 0) {
      setResults([]);
      setHasSearched(false);
    } else {
      runSearch(updated.join(','), 'tags');
    }
  };

  const handleSelectSingle = (question: QuestionBankApi) => {
    const questionType: QuestionType = {
      question: question.question,
      questionData: question.quizQuestion,
      type: question.quizQuestion.type,
      tags: question.tags,
    };
    handleModalAction([questionType]);
  };

  const handleToggleMultiSelect = (question: QuestionBankApi) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) {
        next.delete(question.id);
      } else {
        next.add(question.id);
      }
      return next;
    });
  };

  const handleConfirmMultiSelect = () => {
    const chosen = results.filter((q) => selected.has(q.id));
    const cleaned = chosen.map((question) => {
      return {
        cmi5QuestionId: question.id,
        question: question.question,
        questionData: question.quizQuestion,
        type: question.quizQuestion.type,
        tags: question.tags,
      };
    });
    handleModalAction(cleaned);
  };

  const handleCancel = () => handleCloseModal();

  useEffect(() => {
    const populateSearch = async (searchMode: SearchMode) => {
      setLoading(true);
      setHasSearched(true);
      try {
        const data = await onSearch('', searchMode);
        console.log('this is data', data);
        if (data) setResults(data);
      } finally {
        setLoading(false);
      }
    };
    populateSearch(searchMode);
  }, [searchMode]);

  return (
    <ModalDialog
      testId={quizBankSearchModalId}
      buttons={[]}
      dialogProps={{ open: true }}
      maxWidth="sm"
    >
      <Stack spacing={2} sx={{ p: 1, minWidth: 420 }}>
        {/* Title */}
        <Typography variant="h6" fontWeight={600}>
          Quiz Bank Search
        </Typography>

        {/* Mode toggle */}
        <ToggleButtonGroup
          value={searchMode}
          exclusive
          onChange={handleModeChange}
          size="small"
        >
          <ToggleButton value="question">
            <QuizIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Question
          </ToggleButton>
          <ToggleButton value="tags">
            <LabelIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Tags
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Search input */}
        {searchMode === 'question' ? (
          <TextField
            fullWidth
            size="small"
            placeholder="Search questions..."
            value={inputValue}
            onChange={handleQuestionInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {loading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <SearchIcon fontSize="small" />
                  )}
                </InputAdornment>
              ),
            }}
          />
        ) : (
          <Stack spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type a tag and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {loading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <LabelIcon fontSize="small" />
                    )}
                  </InputAdornment>
                ),
              }}
            />
            {activeTags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {activeTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Stack>
        )}

        {/* Results */}
        {hasSearched && (
          <>
            <Divider />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: 'block' }}
              >
                {loading
                  ? 'Searching...'
                  : results.length === 0
                    ? 'No questions found'
                    : `${results.length} question${results.length !== 1 ? 's' : ''} found`}
              </Typography>
              <Stack
                spacing={1}
                sx={{ maxHeight: 300, overflowY: 'auto', pr: 0.5 }}
              >
                {results.map((q) => {
                  const isSelected = selected.has(q.id);
                  const isExpanded = expandedIds.has(q.id);
                  const qd = q.quizQuestion ?? {};
                  const choices: {
                    text?: string;
                    label?: string;
                    correct?: boolean;
                  }[] = qd.choices ?? qd.options ?? [];
                  const correctAnswer = qd.answer ?? qd.correctAnswer;
                  return (
                    <QuestionCard
                      multiSelect={multiSelect}
                      isExpanded={isExpanded}
                      isSelected={isSelected}
                      q={q}
                      toggleExpand={toggleExpand}
                      handleSelect={
                        multiSelect
                          ? handleToggleMultiSelect
                          : handleSelectSingle
                      }
                    />
                  );
                })}
              </Stack>
            </Box>
          </>
        )}

        {/* Footer actions */}
        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}
        >
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          {multiSelect && selected.size > 0 && (
            <Button
              variant="contained"
              onClick={handleConfirmMultiSelect}
              startIcon={<CheckCircleIcon />}
            >
              Add {selected.size} Question{selected.size !== 1 ? 's' : ''}
            </Button>
          )}
        </Box>
      </Stack>
    </ModalDialog>
  );
}

export default QuizBankSearchForm;
