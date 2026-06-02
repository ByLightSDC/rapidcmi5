import React, { useContext, useEffect, useMemo, useState } from 'react';
import { DirectiveEditorProps, useCellValues } from '@mdxeditor/editor';
import { useSelector } from 'react-redux';
import { Box, ThemeProvider, useTheme } from '@mui/material';
import { deepmerge } from '@mui/utils';
import {
  AuContextProps,
  QuizContent,
  CTFContent,
  DownloadFileData,
  DownloadFilesContent,
  CodeRunnerContent,
  ScenarioContent,
  ActivityContent,
} from '@rapid-cmi5/cmi5-build-common';
import {
  setProgress$,
  submitScore$,
  getActivityCache$,
  setActivityCache$,
  debugLogError,
  AuQuiz,
  AuCTF,
  FileDownloadLink,
  CodeRunner,
  config,
  LessonThemeContext,
  useLessonStyles,
  maxFormWidths,
  ActivityDirectiveNode,
  darkTheme,
} from '@rapid-cmi5/ui';

import ScenarioConsoles from '../../../scenario/ScenarioConsoles';
import TeamScenarioExercise from '../../../team-consoles/TeamScenarioExercise';
import { activeTabSel } from '../../../../redux/navigationReducer';
import { useCMI5Session } from '../../../../hooks/useCMI5Session';
import { SlideActivityType } from '../../../../../app/types/SlideActivityStatusState';
import { auConfigInitializedSel } from '../../../../redux/auReducer';

type DirectiveName = ActivityDirectiveNode['name'];

const extractJsonString = (node: ActivityDirectiveNode): string | null => {
  const firstChild = node.children?.[0];
  if (!firstChild) return null;

  if (firstChild.type === 'code' && typeof firstChild.value === 'string') {
    return firstChild.value;
  }

  if (firstChild.type === 'paragraph') {
    const textNode = firstChild.children?.[0];
    if (textNode?.type === 'text' && typeof textNode.value === 'string') {
      return textNode.value;
    }
  }

  return null;
};

const parseActivityContent = (
  node: ActivityDirectiveNode,
): ActivityContent | null => {
  const jsonString = extractJsonString(node);
  if (!jsonString) return null;

  try {
    return JSON.parse(jsonString) as ActivityContent;
  } catch (error) {
    debugLogError(`Failed to parse activity content JSON ${error}`);
    return null;
  }
};

const DOWNLOAD_DIRECTIVE: DirectiveName = 'download';

/** Non-editable activity view rendered inside the MDX player. */
export const ActivityPlayback: React.FC<
  DirectiveEditorProps<ActivityDirectiveNode>
> = ({ mdastNode }) => {
  const { name } = mdastNode;
  const [content, setContent] = useState<ActivityContent | null>(null);

  const [setProgress, submitScore, getActivityCache, setActivityCache] =
    useCellValues(
      setProgress$,
      submitScore$,
      getActivityCache$,
      setActivityCache$,
    );

  const activeTab = useSelector(activeTabSel);
  const isConfigInitialized = useSelector(auConfigInitializedSel);
  const { isAuthenticated, isTestMode } = useCMI5Session();
  const muiTheme = useTheme();
  const { lessonTheme } = useContext(LessonThemeContext);

  const auProps: Partial<AuContextProps> = {
    setProgress,
    submitScore,
    setActivityCache,
    getActivityCache,
    activeTab,
    isAuthenticated,
    isTestMode,
  };

  const { innerActivitySx, outerSx, outerStyle } = useLessonStyles(
    lessonTheme,
    mdastNode.attributes?.contentWidth,
    maxFormWidths.downloadsEditor,
    muiTheme.palette.background.paper,
    muiTheme.activity.backgroundColor,
    true,
    true,
  );

  const activityTheme = useMemo(
    () =>
      isConfigInitialized ? deepmerge(darkTheme, config.THEME.DARK) : darkTheme,
    [isConfigInitialized],
  );

  useEffect(() => {
    if (content) return;

    if (!mdastNode.children?.length) {
      debugLogError('Missing activity children');
      return;
    }

    const parsed = parseActivityContent(mdastNode);
    if (parsed) setContent(parsed);
  }, [mdastNode, content]);

  const layoutProps = {
    innerSx: innerActivitySx,
    outerSx,
    outerStyle,
  } as const;

  const renderActivity = (): React.ReactNode => {
    if (!content) return null;

    switch (name) {
      case SlideActivityType.SCENARIO: {
        const scenario = content as ScenarioContent;
        return (
          <ScenarioConsoles
            auProps={auProps}
            content={{
              name: scenario.name,
              uuid: scenario.uuid,
              promptClassId: scenario.promptClass,
            }}
            {...layoutProps}
          />
        );
      }

      case SlideActivityType.QUIZ:
        return (
          <AuQuiz
            auProps={auProps}
            content={content as QuizContent}
            {...layoutProps}
          />
        );

      case SlideActivityType.CTF:
        return (
          <AuCTF
            auProps={auProps}
            content={content as CTFContent}
            {...layoutProps}
          />
        );

      case SlideActivityType.CODE_RUNNER:
        return (
          <CodeRunner
            auProps={auProps}
            content={content as CodeRunnerContent}
            {...layoutProps}
          />
        );

      case SlideActivityType.CONSOLES:
        return (
          <TeamScenarioExercise
            auProps={auProps}
            content={content as ScenarioContent}
            {...layoutProps}
          />
        );

      case DOWNLOAD_DIRECTIVE: {
        const { files } = content as DownloadFilesContent;
        return (
          <Box>
            {files.map((file: DownloadFileData) => (
              <FileDownloadLink
                key={file.path}
                fileData={file}
                auDir=""
                filePath={`./Assets/Downloads/${file.path}`}
              />
            ))}
          </Box>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 0, margin: 0, width: '100%' }}>
      <ThemeProvider theme={activityTheme}>{renderActivity()}</ThemeProvider>
    </div>
  );
};
