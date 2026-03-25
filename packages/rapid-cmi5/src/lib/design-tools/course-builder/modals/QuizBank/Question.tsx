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
import LockIcon from '@mui/icons-material/Lock';
import { QuestionResponse, QuizQuestion } from '@rapid-cmi5/cmi5-build-common';

/* ------------------------------------------------------------------ */
/*  Type styling config                                                */
/* ------------------------------------------------------------------ */

const TYPE_CONFIG: Record<
  string,
  {
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
    accent: string;
  }
> = {
  multipleChoice: { color: 'primary', accent: '#3b82f6' },
  trueFalse: { color: 'success', accent: '#22c55e' },
  freeResponse: { color: 'secondary', accent: '#a855f7' },
  selectAll: { color: 'info', accent: '#06b6d4' },
  matching: { color: 'warning', accent: '#f59e0b' },
  number: { color: 'error', accent: '#ef4444' },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function QuestionTypeChip({ type }: { type: string }) {
  const label = type
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase());
  const config = TYPE_CONFIG[type];
  return (
    <Chip
      label={label}
      size="small"
      color={config?.color ?? 'default'}
      variant="outlined"
      sx={{
        fontSize: '0.675rem',
        fontWeight: 600,
        height: 22,
        letterSpacing: '0.02em',
        borderRadius: '6px',
      }}
    />
  );
}

function AuthorChip({ author }: { author: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        fontSize: '0.7rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 0.25,
      }}
    >
      {author}
    </Typography>
  );
}

function PrivateBadge() {
  return (
    <Chip
      icon={<LockIcon sx={{ fontSize: '0.75rem !important' }} />}
      label="Private"
      size="small"
      variant="outlined"
      sx={{
        fontSize: '0.65rem',
        fontWeight: 500,
        height: 20,
        borderRadius: '6px',
        color: 'text.secondary',
        borderColor: 'action.disabled',
        '& .MuiChip-icon': { color: 'text.disabled' },
      }}
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
      <Stack spacing={0.5}>
        {typeAttributes.options?.map((option, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1,
              py: 0.5,
              borderRadius: '8px',
              bgcolor: option.correct
                ? 'rgba(34, 197, 94, 0.08)'
                : 'transparent',
              border: '1px solid',
              borderColor: option.correct
                ? 'rgba(34, 197, 94, 0.2)'
                : 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: option.correct
                  ? 'success.main'
                  : 'action.selected',
                color: option.correct ? '#fff' : 'text.secondary',
                fontSize: '0.65rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {option.correct ? '✓' : String.fromCharCode(65 + i)}
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: option.correct ? 'text.primary' : 'text.secondary',
                fontWeight: option.correct ? 600 : 400,
                lineHeight: 1.4,
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
              icon={
                isCorrect ? (
                  <CheckCircleIcon
                    sx={{ fontSize: '0.85rem !important' }}
                  />
                ) : undefined
              }
              sx={{
                fontSize: '0.7rem',
                fontWeight: isCorrect ? 600 : 400,
                height: 24,
                borderRadius: '6px',
              }}
            />
          );
        })}
      </Stack>
    );
  }

  if (type === QuestionResponse.Matching) {
    return (
      <Stack spacing={0.5}>
        {typeAttributes.matching?.map((pair, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1,
              py: 0.5,
              borderRadius: '8px',
              bgcolor: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.12)',
            }}
          >
            <Typography
              variant="caption"
              fontWeight={500}
              color="text.primary"
            >
              {pair.option}
            </Typography>
            <ArrowForwardIcon
              sx={{
                fontSize: '0.7rem',
                color: 'text.disabled',
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              color="success.main"
              fontWeight={600}
            >
              {pair.response}
            </Typography>
          </Box>
        ))}
      </Stack>
    );
  }

  if (type === QuestionResponse.Number) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          px: 1,
          py: 0.5,
          borderRadius: '8px',
          bgcolor: 'rgba(239, 68, 68, 0.06)',
          border: '1px solid rgba(239, 68, 68, 0.12)',
        }}
      >
        <Typography variant="caption" color="error.main" fontWeight={600}>
          Answer: {typeAttributes.correctAnswer}
        </Typography>
      </Box>
    );
  }

  return (
    <Typography
      variant="caption"
      sx={{ fontStyle: 'italic', color: 'text.secondary' }}
    >
      {typeAttributes.correctAnswer
        ? `Answer: ${typeAttributes.correctAnswer}`
        : '(open-ended)'}
    </Typography>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

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
  const typeAccent =
    TYPE_CONFIG[q.quizQuestion?.type]?.accent ?? 'transparent';

  return (
    <Card
      key={q.id}
      variant="outlined"
      sx={{
        position: 'relative',
        borderColor: isSelected ? 'primary.main' : 'divider',
        borderRadius: '10px',
        bgcolor: isSelected ? 'rgba(59, 130, 246, 0.03)' : 'background.paper',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        '&:hover': {
          borderColor: isSelected ? 'primary.main' : 'action.disabled',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        },
        // Left accent stripe for question type
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          bgcolor: typeAccent,
          borderRadius: '10px 0 0 10px',
          opacity: 0.8,
        },
      }}
    >
      <CardActionArea onClick={() => handleSelect(q)} sx={{ p: 0 }}>
        <CardContent
          sx={{ py: 1.25, px: 2, pl: 2.5, '&:last-child': { pb: 1.25 } }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            {/* Checkbox */}
            {multiSelect && (
              <Checkbox
                checked={isSelected}
                size="small"
                icon={<RadioButtonUncheckedIcon fontSize="small" />}
                checkedIcon={<CheckCircleIcon fontSize="small" />}
                sx={{ p: 0, mt: 0.15 }}
                tabIndex={-1}
              />
            )}

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Question text */}
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.5,
                  color: 'text.primary',
                  mb: 0.75,
                }}
              >
                {q.question}
              </Typography>

              {/* Meta row */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                {q.author && <AuthorChip author={q.author} />}
                {q.author && q.quizQuestion?.type && (
                  <Box
                    sx={{
                      width: '1px',
                      height: 12,
                      bgcolor: 'divider',
                    }}
                  />
                )}
                {q.quizQuestion?.type && (
                  <QuestionTypeChip type={q.quizQuestion.type} />
                )}
                {!q.public && <PrivateBadge />}
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
                      borderRadius: '6px',
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Expand toggle */}
            <IconButton
              size="small"
              onClick={(e) => toggleExpand(q.id, e)}
              sx={{ p: 0.25, mt: 0.15, flexShrink: 0 }}
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

      {/* Expanded details */}
      <Collapse in={isExpanded} unmountOnExit>
        <Divider />
        <Box sx={{ px: 2, pl: 2.5, py: 1.25, bgcolor: 'action.hover' }}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 1,
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
                version: {q.rc5Version}
              </Typography>
            )}
          </Box>

          <FormatQuestionOptions q={q.quizQuestion as QuizQuestion} />
        </Box>
      </Collapse>
    </Card>
  );
}