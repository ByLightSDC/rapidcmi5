import {
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useContext, useEffect, useState } from 'react';

import { MonacoEditor, resolveMonacoLanguage } from '../../forms/MonacoEditor';
import {
  AuContextProps,
  ActivityScore,
  RC5ActivityTypeEnum,
  CodeRunnerContent,
  CodeRunnerSubmitResponse,
  ExecuteCodeBodyApi,
  ExecuteCodeResponseApi,
} from '@rapid-cmi5/cmi5-build-common';
import { ButtonMainUi } from '../../utility/buttons';
import { LessonThemeContext } from '../mdx/contexts/LessonThemeContext';
import {
  maxFormWidths,
  useLessonThemeStyles,
} from '../../hooks/useLessonThemeStyles';

type CodeRunnerProps = {
  auProps: Partial<AuContextProps>;
  content: CodeRunnerContent;
  submitCode?: (body: ExecuteCodeBodyApi) => Promise<ExecuteCodeResponseApi>;
};

function buildCodeRunnerQuizId(content: CodeRunnerContent): string {
  if (content.cmi5QuizId) {
    return content.cmi5QuizId;
  }

  if (content.title) {
    return (
      content.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '') + '-codeRunner'
    );
  }

  const contentHash = Math.abs(
    content.evaluator?.split('').reduce((acc: number, char: string) => {
      acc = (acc << 5) - acc + char.charCodeAt(0);
      return acc & acc;
    }, 0) || 0,
  )
    .toString(36)
    .slice(0, 8);

  return `codeRunner-activity-${contentHash}`;
}

function buildActivityContent(content: CodeRunnerContent): CodeRunnerContent {
  return {
    ...content,
    cmi5QuizId: buildCodeRunnerQuizId(content),
  };
}

export function CodeRunner({ auProps, content, submitCode }: CodeRunnerProps) {
  const { setProgress, submitScore, isAuthenticated, isTestMode } = auProps;
  const { lessonTheme } = useContext(LessonThemeContext);

  const monacoLanguage = resolveMonacoLanguage(
    content.programmingLanguage ?? 'javascript',
  );

  const { blockPadding, outerActivitySxWithConstrainedWidthForm } =
    useLessonThemeStyles(lessonTheme, maxFormWidths.codeRunnerPlayback);

  const [submissionStr, setSubmissionStr] = useState('');
  const [successStr, setSuccessStr] = useState('');
  const [errorStr, setErrorStr] = useState('');
  const [compileStr, setCompileStr] = useState('');

  useEffect(() => {
    setSubmissionStr(content.student ?? '');
  }, [content]);

  const submitActivityScore = (
    isSuccess: boolean,
    message: string,
    activityContent: CodeRunnerContent,
  ) => {
    if (!submitScore) return;

    const codeRunnerResponse: CodeRunnerSubmitResponse = {
      isSuccess,
      message,
    };

    const scoreData: ActivityScore = {
      activityType: RC5ActivityTypeEnum.codeRunner,
      activityContent,
      scoreData: codeRunnerResponse,
    };

    submitScore(scoreData);
  };

  const handleSubmit = async () => {
    setSuccessStr('');
    setErrorStr('');
    setCompileStr('');
    if (!submitCode) return;

    const activityContent = buildActivityContent(content);

    try {
      const response = await submitCode({
        submissionContent: `${submissionStr}${content.evaluator}`,
        language: content.programmingLanguage,
        languageVersion: content.languageVersion,
      });

      const stdout = response.stdout?.trim() ?? '';
      const stderr = response.stderr?.trim() ?? '';
      const cmpinfo =
        (
          response as { cmpinfo?: string; compileinfo?: string }
        ).cmpinfo?.trim() ??
        (
          response as { cmpinfo?: string; compileinfo?: string }
        ).compileinfo?.trim() ??
        '';

      // Compilation issue
      if (cmpinfo) {
        setCompileStr(cmpinfo);
        submitActivityScore(false, cmpinfo, activityContent);
        return;
      }

      // Full success
      if (response.success) {
        setSuccessStr(stdout || 'Submission passed successfully.');
        setProgress?.(true);
        submitActivityScore(true, stdout || 'Success', activityContent);
        return;
      }

      // Failure: show both stdout and stderr
      const failureMessage = [stdout, stderr].filter(Boolean).join('\n\n');
      setErrorStr(failureMessage || 'Submission failed.');
      submitActivityScore(
        false,
        failureMessage || 'Submission failed.',
        activityContent,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred.';
      setErrorStr(message);
      submitActivityScore(false, message, activityContent);
    }
  };

  if (!isTestMode && (!isAuthenticated || !submitCode))
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 4,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">
          CodeRunner is connecting...
        </Typography>
      </Box>
    );

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
      {isTestMode && !submitCode && (
        <Alert severity="info" sx={{ mb: 1.5 }}>
          Test mode active: no submission will be sent.
        </Alert>
      )}

      {content.title && (
        <Typography
          color="text.primary"
          align="center"
          variant="h3"
          sx={{ fontWeight: 800, pb: 1 }}
        >
          {content.title}
        </Typography>
      )}

      {content.description && (
        <Typography color="text.primary" sx={{ fontWeight: 800, pb: 1 }}>
          {content.description}
        </Typography>
      )}

      {content.evaluator ? (
        <Box sx={{ overflow: 'hidden', m: 0.5 }}>
          <MonacoEditor
            height={400}
            language={monacoLanguage}
            value={submissionStr}
            onChange={(value) => setSubmissionStr(value ?? '')}
          />
        </Box>
      ) : (
        <Alert
          severity="error"
          sx={{
            maxWidth: '480px',
            m: 1.5,
            mx: 'auto',
          }}
        >
          CodeRunner is missing an evaluation script.
        </Alert>
      )}

      {successStr && (
        <Alert
          sx={{ m: 1.5, whiteSpace: 'pre-wrap' }}
          icon={<CheckIcon fontSize="inherit" />}
          severity="success"
        >
          <AlertTitle>Success</AlertTitle>
          {successStr}
        </Alert>
      )}

      {compileStr && (
        <Alert sx={{ m: 1.5, whiteSpace: 'pre-wrap' }} severity="warning">
          <AlertTitle>Compilation Error</AlertTitle>
          {compileStr}
        </Alert>
      )}

      {errorStr && (
        <Alert sx={{ m: 1.5, whiteSpace: 'pre-wrap' }} severity="error">
          <AlertTitle>Execution Failed</AlertTitle>
          {errorStr}
        </Alert>
      )}
      {content.evaluator && (
        <Box sx={{ m: 0.5, mt: 1.5 }}>
          <ButtonMainUi onClick={handleSubmit}>Submit</ButtonMainUi>
        </Box>
      )}
    </Paper>
  );
}

export default CodeRunner;
