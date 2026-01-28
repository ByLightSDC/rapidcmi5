
import Editor from 'react-simple-code-editor';
// @ts-expect-error - prismjs types are not fully compatible
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another

import { Alert, AlertTitle, Box, Paper, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

import useJobeGrader from './useJobeGrader';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AuContextProps, JobeContent, ActivityScore, RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import { dividerColor } from '../../redux/commonAppReducer';
import { ButtonMainUi } from '../../utility/buttons';

export function JobeInTheBox({
  auProps,
  content,
}: {
  auProps: Partial<AuContextProps>;
  content: JobeContent;
}) {
  const { setProgress, submitScore } = auProps;

  const jobeContent = content;
  const { submitCode } = useJobeGrader(jobeContent);
  const themedDividerColor = useSelector(dividerColor);

  // state
  const [submissionStr, setSubmissionStr] = useState<string>('');
  const [successStr, setSuccessStr] = useState<string>('');
  const [errorStr, setErrorStr] = useState<string>('');

  const handleSubmit = async () => {
    setSuccessStr('');
    setErrorStr('');
    const response = await submitCode(submissionStr, jobeContent.evaluator);
    if (response.isSuccess) {
      setSuccessStr(response.message);
      setErrorStr('');
      if (setProgress) {
        setProgress(true);
      }

      // Submit score for LRS tracking and slide completion
      if (submitScore) {
        // Ensure cmi5QuizId is set (generate if missing)
        const activityContent = { ...jobeContent };
        if (!activityContent.cmi5QuizId) {
          // Generate deterministic ID from title or content hash (same logic as parser)
          if (activityContent.title) {
            activityContent.cmi5QuizId =
              activityContent.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/--+/g, '-')
                .replace(/^-|-$/g, '') + '-jobe';
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
            activityContent.cmi5QuizId = 'jobe-activity-' + contentHash;
          }
        }

        const scoreData: ActivityScore = {
          activityType: RC5ActivityTypeEnum.jobe,
          activityContent: activityContent,
          scoreData: response, // JobeSubmitResponse
        };
        submitScore(scoreData);
        console.log('Jobe activity score submitted');
      }
    } else {
      setSuccessStr('');
      setErrorStr(response.message);

      // Also submit score for failed attempts to track activity completion
      if (submitScore) {
        // Ensure cmi5QuizId is set (generate if missing)
        const activityContent = { ...jobeContent };
        if (!activityContent.cmi5QuizId) {
          // Generate deterministic ID from title or content hash (same logic as parser)
          if (activityContent.title) {
            activityContent.cmi5QuizId =
              activityContent.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/--+/g, '-')
                .replace(/^-|-$/g, '') + '-jobe';
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
            activityContent.cmi5QuizId = 'jobe-activity-' + contentHash;
          }
        }

        const scoreData: ActivityScore = {
          activityType: RC5ActivityTypeEnum.jobe,
          activityContent: activityContent,
          scoreData: response, // JobeSubmitResponse with isSuccess: false
        };
        submitScore(scoreData);
        console.log('Jobe activity score submitted (failed attempt)');
      }
    }
  };

  useEffect(() => {
    setSubmissionStr(jobeContent.student);
  }, [jobeContent]);

  //REF TODO className="hover:prose-a:text-blue-500"
  return (
    <Paper
      className="paper-activity"
      variant="outlined"
      sx={{
        backgroundColor: 'background.default',
        minWidth: '320px',
        maxWidth: '1152px',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: '12px',
      }}
    >
      {jobeContent.title && (
        <Typography
          color="text.primary"
          align="center"
          variant="h3"
          style={{
            fontWeight: 800,
            paddingBottom: '8px',
          }}
        >
          {jobeContent.title}
        </Typography>
      )}
      <Editor
        value={submissionStr}
        onValueChange={(code) => setSubmissionStr(code)}
        highlight={(code) => highlight(code, languages.js)}
        padding={10}
        style={{
          borderRadius: '6px',
          borderColor: themedDividerColor,
          borderStyle: 'solid',
          borderWidth: '2px',
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 15,
          width: '100%',
          minHeight: '120px',
          margin: '4px',
        }}
      />
      {successStr && (
        <Alert
          sx={{ margin: '12px' }}
          icon={<CheckIcon fontSize="inherit" />}
          // sx={{ position: "relative", left: 100, top:0 }}
          severity="success"
        >
          <AlertTitle>Success</AlertTitle>
          {successStr}
        </Alert>
      )}
      {errorStr && (
        <Alert sx={{ margin: '12px' }} severity="error">
          <AlertTitle>BadRequest</AlertTitle>
          {errorStr}
        </Alert>
      )}
      <Box sx={{ margin: '4px', marginTop: '12px' }}>
        <ButtonMainUi
          //sx={{ margin: '4px' }}
          disabled={false}
          onClick={handleSubmit}
        >
          Submit
        </ButtonMainUi>
      </Box>
    </Paper>
  );
}

export default JobeInTheBox;
