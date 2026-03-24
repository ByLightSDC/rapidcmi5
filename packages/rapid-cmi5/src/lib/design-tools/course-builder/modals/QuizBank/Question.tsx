import {
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import { Box, Stack } from '@mui/system';
import { QuestionBankApi } from 'packages/rapid-cmi5/src/lib/contexts/QuizBankContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { QuestionResponse, QuizQuestion } from '@rapid-cmi5/cmi5-build-common';
import { requireField } from '../../../rapidcmi5_mdx/editors/forms/QuizForm';

const TYPE_COLORS: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'
> = {
  multipleChoice: 'primary',
  trueFalse: 'success',
  freeResponse: 'secondary',
  selectAll: 'info',
  matching: 'warning',
  number: 'error',
};

function QuestionTypeChip({ type }: { type: string }) {
  const label = type
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase());
  return (
    <Chip
      label={label}
      size="small"
      color={TYPE_COLORS[type] ?? 'default'}
      variant="outlined"
      sx={{ fontSize: '0.7rem', height: 20 }}
    />
  );
}

function AuthorChip({ author }: { author: string }) {
  return (
    <Chip
      label={author}
      size="small"
      color={'default'}
      variant="outlined"
      sx={{ fontSize: '0.7rem', height: 20 }}
    />
  );
}

function FormatQuestionOptions({ q }: { q: QuizQuestion }) {
  const { type, typeAttributes } = q;

  if (
    type === QuestionResponse.MultipleChoice ||
    type === QuestionResponse.SelectAll
  ) {
    return (
      <Stack spacing={0.4}>
        {typeAttributes.options?.map((option, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              bgcolor: option.correct ? 'rgba(76,175,80,0.08)' : 'transparent',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                minWidth: 18,
                fontWeight: 700,
                color: option.correct ? 'success.main' : 'text.secondary',
              }}
            >
              {option.correct ? '✓' : String.fromCharCode(65 + i)}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: option.correct ? 'success.main' : 'text.primary',
                fontWeight: option.correct ? 600 : 400,
              }}
            >
              {option.text}
            </Typography>
          </Box>
        ))}
      </Stack>
    );
  }

  if (type === QuestionResponse.TrueFalse) {
    return (
      <Stack direction="row" spacing={1}>
        {(['True', 'False'] as const).map((val) => {
          const isCorrect = typeAttributes.correctAnswer === val;
          return (
            <Chip
              key={val}
              label={val}
              size="small"
              color={isCorrect ? 'success' : 'default'}
              variant={isCorrect ? 'filled' : 'outlined'}
              icon={isCorrect ? <CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} /> : undefined}
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          );
        })}
      </Stack>
    );
  }

  if (type === QuestionResponse.Matching) {
    return (
      <Stack spacing={0.4}>
        {typeAttributes.matching?.map((pair, i) => (
          <Box
            key={i}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Typography variant="caption" color="text.primary">
              {pair.option}
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: '0.75rem', color: 'text.secondary', flexShrink: 0 }} />
            <Typography variant="caption" color="success.main" fontWeight={600}>
              {pair.response}
            </Typography>
          </Box>
        ))}
      </Stack>
    );
  }

  if (type === QuestionResponse.Number) {
    return (
      <Typography variant="caption" color="success.main" fontWeight={600}>
        Answer: {typeAttributes.correctAnswer}
      </Typography>
    );
  }

  // FreeResponse (and any unknown type)
  return (
    <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
      {typeAttributes.correctAnswer
        ? `Answer: ${typeAttributes.correctAnswer}`
        : '(open-ended)'}
    </Typography>
  );
}

export default function QuestionCard({
  q,
  isSelected,
  isExpanded,
  multiSelect,
  toggleExpand,
  handleSelect,
}: {
  q: QuestionBankApi;
  isSelected: boolean;
  isExpanded: boolean;
  multiSelect: boolean;
  toggleExpand: (id: string, e: React.MouseEvent) => void;
  handleSelect: (q: QuestionBankApi) => void;
}) {

  return (
    <Card
      key={q.id}
      variant="outlined"
      sx={{
        borderColor: isSelected ? 'primary.main' : 'divider',
        transition: 'border-color 0.15s',
      }}
    >
      <CardActionArea onClick={() => handleSelect(q)} sx={{ p: 0 }}>
        <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            {multiSelect && (
              <Checkbox
                checked={isSelected}
                size="small"
                icon={<RadioButtonUncheckedIcon fontSize="small" />}
                checkedIcon={<CheckCircleIcon fontSize="small" />}
                sx={{ p: 0, mt: 0.25 }}
                tabIndex={-1}
              />
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {q.question}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                {q.author && <AuthorChip author={q.author} />}
                {q.quizQuestion.type && (
                  <QuestionTypeChip type={q.quizQuestion.type} />
                )}
                {q.tags?.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="filled"
                    sx={{
                      fontSize: '0.65rem',
                      height: 18,
                      bgcolor: 'action.hover',
                    }}
                  />
                ))}
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => toggleExpand(q.id, e)}
              sx={{ p: 0.25, mt: 0.25, flexShrink: 0 }}
            >
              {isExpanded ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
        </CardContent>
      </CardActionArea>

      <Collapse in={isExpanded} unmountOnExit>
        <Divider />
        <Box sx={{ px: 1.5, py: 1, bgcolor: 'action.hover' }}>
          {/* Dates & version */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 0.75,
              flexWrap: 'wrap',
            }}
          >
            {q.dateCreated && (
              <Typography variant="caption" color="text.secondary">
                Created: {new Date(q.dateCreated).toLocaleDateString()}
              </Typography>
            )}
            {q.dateEdited && (
              <Typography variant="caption" color="text.secondary">
                Edited: {new Date(q.dateEdited).toLocaleDateString()}
              </Typography>
            )}
            {q.rc5Version && (
              <Typography variant="caption" color="text.secondary">
                v{q.rc5Version}
              </Typography>
            )}
          </Box>

          <FormatQuestionOptions q={q.quizQuestion as QuizQuestion} />
        </Box>
      </Collapse>
    </Card>
  );
}
