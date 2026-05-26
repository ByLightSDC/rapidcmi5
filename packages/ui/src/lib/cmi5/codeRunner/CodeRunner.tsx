import {
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  SxProps,
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
  OuterStyle,
} from '@rapid-cmi5/cmi5-build-common';

import { ButtonMainUi } from '../../utility/buttons';
import { LessonThemeContext } from '../mdx/contexts/LessonThemeContext';
import {
  maxFormWidths,
  useLessonThemeStyles,
} from '../../hooks/useLessonThemeStyles';
import { useCodeRunnerApi } from '../../api/codeRunner/useCodeRunnerApi';

type CodeRunnerProps = {
  auProps: Partial<AuContextProps>;
  content: CodeRunnerContent;
  authType: 'Basic' | 'Bearer';
  token?: string;
  url?: string;
  innerSx?: SxProps;
  outerSx?: SxProps;
  outerStyle?: OuterStyle;
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

export function CodeRunner({
  auProps,
  content,
  innerSx,
  outerSx,
  outerStyle,
}: CodeRunnerProps) {
  const { setProgress, submitScore, isAuthenticated, isTestMode } = auProps;
  const { lessonTheme } = useContext(LessonThemeContext);

  const { isCodeRunnerEnabled, executeCode } = useCodeRunnerApi();

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

    const activityContent = buildActivityContent(content);

    try {
      const { cmpinfo, stderr, stdout, success } = await executeCode(
        submissionStr,
        content,
      );
      // Compilation issue
      if (cmpinfo) {
        setCompileStr(cmpinfo);
        submitActivityScore(false, cmpinfo, activityContent);
        return;
      }

      // Full success
      if (success) {
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

  if (!isTestMode && (!isAuthenticated || !isCodeRunnerEnabled))
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 4,
          ...outerSx,
        }}
        {...outerStyle}
      >
        <Box sx={{ ...innerSx }}>
          <CircularProgress />
          <Typography color="text.secondary">
            CodeRunner is connecting...
          </Typography>
        </Box>
      </Box>
    );

  return (
    <Box
      id="code-runner-activity"
      className="paper-activity"
      sx={{
        ...outerSx,
      }}
      {...outerStyle}
    >
      <Box sx={{ padding: 2, ...innerSx }}>
        {isTestMode && !isCodeRunnerEnabled && (
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
      </Box>
    </Box>
  );
}

export default CodeRunner;
