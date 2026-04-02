import { Editor } from '@monaco-editor/react';
import { useTheme } from '@mui/system';
import { Alert, AlertTitle, Box, Paper, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

import { useContext, useEffect, useState } from 'react';
import { resolveMonacoLanguage } from '../../forms/FormControlMonacoField';
import {
  AuContextProps,
  ActivityScore,
  RC5ActivityTypeEnum,
  CodeRunnerContent,
  CodeRunnerSubmitResponse,
} from '@rapid-cmi5/cmi5-build-common';
import { ButtonMainUi } from '../../utility/buttons';
import { LessonThemeContext } from '../mdx/contexts/LessonThemeContext';
import {
  maxFormWidths,
  useLessonThemeStyles,
} from '../../hooks/useLessonThemeStyles';

export function CodeRunner({
  auProps,
  content,
  submitCode,
}: {
  auProps: Partial<AuContextProps>;
  content: CodeRunnerContent;
  submitCode: (
    code: string,
    language: string,
    runtime: string,
  ) => Promise<{ stdout: string; stderr: string }>;
}) {
  const { setProgress, submitScore } = auProps;

  const codeRunnerContent = content;
  const theme = useTheme();
  const monacoTheme = theme.palette.mode === 'light' ? 'light' : 'vs-dark';
  const monacoLanguage = resolveMonacoLanguage(codeRunnerContent.programmingLanguage ?? 'javascript');

  // state
  const [submissionStr, setSubmissionStr] = useState<string>('');
  const [successStr, setSuccessStr] = useState<string>('');
  const [errorStr, setErrorStr] = useState<string>('');

  /* Lesson Theme */
  const { lessonTheme } = useContext(LessonThemeContext);
  const { blockPadding, outerActivitySxWithConstrainedWidthForm } =
    useLessonThemeStyles(lessonTheme, maxFormWidths.codeRunnerPlayback);

  const handleSubmit = async () => {
    setSuccessStr('');
    setErrorStr('');
    const response = await submitCode(
      submissionStr + codeRunnerContent.evaluator,
      content.programmingLanguage,
      content.languageVersion,
    );
    if (response.stderr !== '' || response.stderr !== undefined) {
      setSuccessStr(response.stderr);
      setErrorStr('');
      if (setProgress) {
        setProgress(true);
      }

      // Submit score for LRS tracking and slide completion
      if (submitScore) {
        // Ensure cmi5QuizId is set (generate if missing)
        const activityContent = { ...codeRunnerContent };
        if (!activityContent.cmi5QuizId) {
          // Generate deterministic ID from title or content hash (same logic as parser)
          if (activityContent.title) {
            activityContent.cmi5QuizId =
              activityContent.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/--+/g, '-')
                .replace(/^-|-$/g, '') + '-codeRunner';
          } else {
            // Create a simple hash from the evaluator content for consistency
            const contentHash = Math.abs(
              activityContent.evaluator
                ?.split('')
                .reduce((a: number, b: string) => {
                  a = (a << 5) - a + b.charCodeAt(0);
                  return a & a;
                }, 0) || 0,
            )
              .toString(36)
              .substr(0, 8);
            activityContent.cmi5QuizId = 'codeRunner-activity-' + contentHash;
          }
        }

        const codeRunnerResponse: CodeRunnerSubmitResponse = {
          isSuccess: true,
          message: response.stdout,
        };
        const scoreData: ActivityScore = {
          activityType: RC5ActivityTypeEnum.codeRunner,
          activityContent: activityContent,
          scoreData: codeRunnerResponse, // CodeRunnerSubmitResponse
        };
        submitScore(scoreData);
        console.log('CodeRunner activity score submitted');
      }
    } else {
      setSuccessStr('');
      setErrorStr(response.stdout);

      // Also submit score for failed attempts to track activity completion
      if (submitScore) {
        // Ensure cmi5QuizId is set (generate if missing)
        const activityContent = { ...codeRunnerContent };
        if (!activityContent.cmi5QuizId) {
          // Generate deterministic ID from title or content hash (same logic as parser)
          if (activityContent.title) {
            activityContent.cmi5QuizId =
              activityContent.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/--+/g, '-')
                .replace(/^-|-$/g, '') + '-codeRunner';
          } else {
            // Create a simple hash from the evaluator content for consistency
            const contentHash = Math.abs(
              activityContent.evaluator
                ?.split('')
                .reduce((a: number, b: string) => {
                  a = (a << 5) - a + b.charCodeAt(0);
                  return a & a;
                }, 0) || 0,
            )
              .toString(36)
              .substr(0, 8);
            activityContent.cmi5QuizId = 'codeRunner-activity-' + contentHash;
          }
        }

        const codeRunnerResponse: CodeRunnerSubmitResponse = {
          isSuccess: true,
          message: response.stdout,
        };
        const scoreData: ActivityScore = {
          activityType: RC5ActivityTypeEnum.codeRunner,
          activityContent: activityContent,
          scoreData: codeRunnerResponse, // CodeRunnerSubmitResponse with isSuccess: false
        };
        submitScore(scoreData);
        console.log('CodeRunner activity score submitted (failed attempt)');
      }
    }
  };

  useEffect(() => {
    setSubmissionStr(codeRunnerContent.student);
  }, [codeRunnerContent]);

  return (
    <Paper
      className="paper-activity"
      variant="outlined"
      sx={{
        backgroundColor: 'background.default',
        ...outerActivitySxWithConstrainedWidthForm,
        padding: blockPadding,
      }}
    >
      {codeRunnerContent.title && (
        <Typography
          color="text.primary"
          align="center"
          variant="h3"
          style={{
            fontWeight: 800,
            paddingBottom: '8px',
          }}
        >
          {codeRunnerContent.title}
        </Typography>
      )}

      {codeRunnerContent.description && (
        <Typography
          color="text.primary"
          style={{
            fontWeight: 800,
            paddingBottom: '8px',
          }}
        >
          {codeRunnerContent.description}
        </Typography>
      )}
      {codeRunnerContent.evaluator && (
        <Box
          sx={{
            overflow: 'hidden',
            margin: '4px',
          }}
        >
          <Editor
            height={200}
            language={monacoLanguage}
            theme={monacoTheme}
            value={submissionStr}
            onChange={(value) => setSubmissionStr(value ?? '')}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              fontSize: 13,
              lineNumbers: 'on',
              tabSize: 2,
            }}
          />
        </Box>
      )}
      {!codeRunnerContent.evaluator && (
        <Alert
          severity="error"
          sx={{
            maxWidth: '480px',
            margin: '12px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          CodeRunner In The Box is missing an evaluation script.
        </Alert>
      )}
      {successStr && (
        <Alert
          sx={{ margin: '12px' }}
          icon={<CheckIcon fontSize="inherit" />}
          severity="success"
        >
          <AlertTitle>Success</AlertTitle>
          {successStr}
        </Alert>
      )}
      {errorStr && (
        <Alert sx={{ margin: '12px' }} severity="error">
          <AlertTitle>Bad Request</AlertTitle>
          {errorStr}
        </Alert>
      )}
      {codeRunnerContent.evaluator && (
        <Box sx={{ margin: '4px', marginTop: '12px' }}>
          <ButtonMainUi disabled={false} onClick={handleSubmit}>
            Submit
          </ButtonMainUi>
        </Box>
      )}
    </Paper>
  );
}

export default CodeRunner;
