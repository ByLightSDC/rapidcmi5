import React, { useContext, useMemo, useState } from 'react';
import { DirectiveEditorProps, useCellValues } from '@mdxeditor/editor';

import ScenarioConsoles from '../../../scenario/ScenarioConsoles';
import TeamScenarioExercise from '../../../team-consoles/TeamScenarioExercise';
import { useSelector } from 'react-redux';
import { activeTabSel } from '../../../../redux/navigationReducer';
import { useCMI5Session } from '../../../../hooks/useCMI5Session';
import { SlideActivityType } from '../../../../../app/types/SlideActivityStatusState';
import { Box, ThemeProvider, useTheme } from '@mui/material';
import { deepmerge } from '@mui/utils';
import {
  AuContextProps,
  ScenarioContent,
  QuizContent,
  CTFContent,
  DownloadFileData,
  CodeRunnerContent,
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
  CoursePresentationContext,
  useLessonStyles,
  maxFormWidths,
  ActivityDirectiveNode,
  darkTheme,
  useCoursePresentation,
} from '@rapid-cmi5/ui';
import { auConfigInitializedSel } from '../../../../redux/auReducer';

/**
 * Non editable Activity View
 * @param param0
 * @returns
 */

export const ActivityPlayback: React.FC<
  DirectiveEditorProps<ActivityDirectiveNode>
> = ({ mdastNode }) => {
  const { name } = mdastNode; //scenario, quiz, etc.
  const [fromJson, setFromJson] = useState<any>(undefined);
  const [setProgress, submitScore, getActivityCache, setActivityCache] =
    useCellValues(
      setProgress$,
      submitScore$,
      getActivityCache$,
      setActivityCache$,
    );

  const activeTab = useSelector(activeTabSel);
  const { isAuthenticated, isTestMode } = useCMI5Session();

  const auProps: Partial<AuContextProps> = {
    setProgress: setProgress,
    submitScore: submitScore,
    setActivityCache,
    getActivityCache,
    activeTab: activeTab,
    isAuthenticated: isAuthenticated,
    isTestMode: isTestMode,
  };

  const muiTheme = useTheme();
  const { rc5Theme } = useCoursePresentation();
  const { innerActivitySx, outerSx, outerStyle } = useLessonStyles(
    rc5Theme,
    mdastNode?.attributes?.contentWidth,
    maxFormWidths.downloadsEditor,
    muiTheme.palette.background.paper,
    muiTheme.activity.backgroundColor,
    true,
    true,
  );

  /**
   * update theme with overrides from cfg file
   */
  const isConfigInitialized = useSelector(auConfigInitializedSel);
  const activityTheme = useMemo(() => {
    const base = darkTheme;
    if (!isConfigInitialized) {
      return base;
    }
    const overriddenTheme = deepmerge(base, rc5Theme.dark);
    return overriddenTheme;
  }, [isConfigInitialized]);

  /** Get Default Form Data from MDAST Node */
  React.useEffect(() => {
    if (!fromJson) {
      if (mdastNode?.children?.length > 0) {
        try {
          let jsonContent;
          const cnode = mdastNode.children[0];

          if (cnode.type === 'code') {
            jsonContent = cnode.value;
          } else if (cnode.type === 'paragraph') {
            const tnode = cnode.children[0];
            if (tnode.type === 'text') {
              jsonContent = tnode.value;
            }
          }
          //console.log('mounted activity json str=', jsonNode.value);
          if (!jsonContent) return;
          const json = JSON.parse(jsonContent);
          setFromJson(json);
        } catch (e) {
          //TODO validation here
          console.log(e);
        }
      } else {
        debugLogError('Missing activity children');
      }
    }
  }, [mdastNode?.children, fromJson]);

  return (
    <div
      style={{
        padding: 0,
        margin: 0,
        width: '100%',
      }}
    >
      <ThemeProvider theme={activityTheme}>
        {name === SlideActivityType.SCENARIO && fromJson && (
          <ScenarioConsoles
            auProps={auProps}
            content={{
              name: (fromJson as ScenarioContent).name ?? '',
              uuid: (fromJson as ScenarioContent).uuid,
              promptClassId: (fromJson as ScenarioContent).promptClass,
            }}
            innerSx={innerActivitySx}
            outerSx={outerSx}
            outerStyle={outerStyle}
          />
        )}

        {name === SlideActivityType.QUIZ && fromJson && (
          <AuQuiz
            auProps={auProps}
            content={fromJson as QuizContent}
            innerSx={innerActivitySx}
            outerSx={outerSx}
            outerStyle={outerStyle}
          />
        )}

        {name === SlideActivityType.CTF && fromJson && (
          <AuCTF
            auProps={auProps}
            content={fromJson as CTFContent}
            innerSx={innerActivitySx}
            outerSx={outerSx}
            outerStyle={outerStyle}
          />
        )}
        {name === SlideActivityType.CODE_RUNNER && fromJson && (
          <CodeRunner
            auProps={auProps}
            content={fromJson as CodeRunnerContent}
            innerSx={innerActivitySx}
            outerSx={outerSx}
            outerStyle={outerStyle}
          />
        )}
        {name === SlideActivityType.CONSOLES && fromJson && (
          <>
            <TeamScenarioExercise
              auProps={auProps}
              content={fromJson as ScenarioContent}
              innerSx={innerActivitySx}
              outerSx={outerSx}
              outerStyle={outerStyle}
            />
            {/* REF keep for testing individual scenario UI with a deployed scenario requires ScenarioWrapper, debugRangeId, debugScenarioId
           <ScenarioConsoles
            auProps={auProps}
            content={fromJson as TeamConsolesContent}
          /> */}
          </>
        )}
        {name === 'download' && fromJson && (
          <Box>
            {fromJson.files.map((fileData: DownloadFileData) => {
              return (
                <FileDownloadLink
                  fileData={fileData}
                  auDir=""
                  filePath={`./Assets/Downloads/${fileData.path}`}
                />
              );
            })}
          </Box>
        )}
      </ThemeProvider>
    </div>
  );
};
