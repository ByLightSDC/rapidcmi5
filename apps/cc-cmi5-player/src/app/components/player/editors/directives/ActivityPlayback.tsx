import React, { useContext, useEffect, useMemo, useState } from 'react';
import { DirectiveEditorProps, useCellValues } from '@mdxeditor/editor';
import { useSelector } from 'react-redux';
import { Box, ThemeProvider, useTheme } from '@mui/material';
import { deepmerge } from '@mui/utils';
import {
  AuContextProps,
  QuizContentSchemaZod,
  CTFContentSchema,
  DownloadFileData,
  DownloadFilesContentSchema,
  CodeRunnerContentSchema,
  ScenarioContentSchema,
  validateScenarioContent,
  DirectiveToActivityMapping,
  ActivityDirectiveNode,
  DirectiveName,
  SlideActivityType,
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
  darkTheme,
} from '@rapid-cmi5/ui';

import ScenarioConsoles from '../../../scenario/ScenarioConsoles';
import TeamScenarioExercise from '../../../team-consoles/TeamScenarioExercise';
import { activeTabSel } from '../../../../redux/navigationReducer';
import { useCMI5Session } from '../../../../hooks/useCMI5Session';
import { auConfigInitializedSel } from '../../../../redux/auReducer';

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
  name: DirectiveName,
): DirectiveToActivityMapping | null => {
  const jsonString = extractJsonString(node);
  if (!jsonString) return null;

  let raw: unknown;
  try {
    raw = JSON.parse(jsonString);
  } catch (error) {
    debugLogError(`Failed to parse activity content JSON ${error}`);
    return null;
  }

  const logInvalid = (error: unknown): null => {
    debugLogError(`Invalid ${name} content: ${error}`);
    return null;
  };

  switch (name) {
    case SlideActivityType.SCENARIO: {
      const r = validateScenarioContent(raw);
      return r.valid ? { name, content: r.data } : logInvalid(r.errors);
    }
    case SlideActivityType.QUIZ: {
      const r = QuizContentSchemaZod.safeParse(raw);
      return r.success
        ? { name, content: r.data }
        : logInvalid(r.error.message);
    }
    case SlideActivityType.CTF: {
      const r = CTFContentSchema.safeParse(raw);
      return r.success
        ? { name, content: r.data }
        : logInvalid(r.error.message);
    }
    case SlideActivityType.CODE_RUNNER: {
      const r = CodeRunnerContentSchema.safeParse(raw);
      return r.success
        ? { name, content: r.data }
        : logInvalid(r.error.message);
    }
    case SlideActivityType.CONSOLES: {
      const r = ScenarioContentSchema.safeParse(raw);
      return r.success
        ? { name, content: r.data }
        : logInvalid(r.error.message);
    }
    case SlideActivityType.DOWNLOAD: {
      const r = DownloadFilesContentSchema.safeParse(raw);
      return r.success
        ? { name, content: r.data }
        : logInvalid(r.error.message);
    }
    default:
      return null;
  }
};

/** Non-editable activity view rendered inside the MDX player. */
export const ActivityPlayback: React.FC<
  DirectiveEditorProps<ActivityDirectiveNode>
> = ({ mdastNode }) => {
  const [parsed, setParsed] = useState<DirectiveToActivityMapping | null>(null);

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
    if (parsed) return;

    if (!mdastNode.children?.length) {
      debugLogError('Missing activity children');
      return;
    }

    const result = parseActivityContent(mdastNode, mdastNode.name);
    if (result) setParsed(result);
  }, [mdastNode, parsed]);

  const layoutProps = {
    innerSx: innerActivitySx,
    outerSx,
    outerStyle,
  } as const;

  const renderActivity = (): React.ReactNode => {
    if (!parsed) return null;

    switch (parsed.name) {
      case SlideActivityType.SCENARIO: {
        const { content } = parsed;
        return (
          <ScenarioConsoles
            auProps={auProps}
            content={content}
            {...layoutProps}
          />
        );
      }

      case SlideActivityType.QUIZ:
        return (
          <AuQuiz auProps={auProps} content={parsed.content} {...layoutProps} />
        );

      case SlideActivityType.CTF:
        return (
          <AuCTF auProps={auProps} content={parsed.content} {...layoutProps} />
        );

      case SlideActivityType.CODE_RUNNER:
        return (
          <CodeRunner
            auProps={auProps}
            content={parsed.content}
            {...layoutProps}
          />
        );

      case SlideActivityType.CONSOLES:
        return (
          <TeamScenarioExercise
            auProps={auProps}
            content={parsed.content}
            {...layoutProps}
          />
        );

      case SlideActivityType.DOWNLOAD: {
        const { files } = parsed.content;
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
