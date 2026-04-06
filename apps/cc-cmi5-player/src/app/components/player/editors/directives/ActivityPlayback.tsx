import React, { useState } from 'react';
import { DirectiveEditorProps, useCellValues } from '@mdxeditor/editor';

import ScenarioConsoles from '../../../scenario/ScenarioConsoles';
import TeamScenarioExercise from '../../../team-consoles/TeamScenarioExercise';
import { useSelector } from 'react-redux';
import { activeTabSel } from '../../../../redux/navigationReducer';
import { useCMI5Session } from '../../../../hooks/useCMI5Session';
import { SlideActivityType } from '../../../../../app/types/SlideActivityStatusState';
import { Box } from '@mui/material';
import {
  AuContextProps,
  RC5ScenarioContent,
  QuizContent,
  CTFContent,
  TeamConsolesContent,
  DownloadFileData,
  CodeRunnerContent,
  useCodeRunnerApi,
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
} from '@rapid-cmi5/ui';
import { cmi5Instance } from '../../../../session/cmi5';

/**
 * Non editable Activity View
 * @param param0
 * @returns
 */

export const ActivityPlayback: React.FC<DirectiveEditorProps> = ({
  mdastNode,
}) => {
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

  const { executeCode } = useCodeRunnerApi(
    'Basic',
    config.DEVOPS_API_URL,
    cmi5Instance.getAuthToken(),
  );

  return (
    <div
      style={{
        padding: 0,
        margin: 0,
        width: '100%',
      }}
    >
      {name === SlideActivityType.SCENARIO && fromJson && (
        <ScenarioConsoles
          auProps={auProps}
          content={{
            scenarioName: (fromJson as RC5ScenarioContent).name,
            scenarioUUID: (fromJson as RC5ScenarioContent).uuid,
            promptClassId: (fromJson as RC5ScenarioContent).promptClass,
          }}
        />
      )}

      {name === SlideActivityType.QUIZ && fromJson && (
        <AuQuiz auProps={auProps} content={fromJson as QuizContent} />
      )}

      {name === SlideActivityType.CTF && fromJson && (
        <AuCTF auProps={auProps} content={fromJson as CTFContent} />
      )}
      {name === SlideActivityType.CODE_RUNNER && fromJson && (
        <CodeRunner
          auProps={auProps}
          content={fromJson as CodeRunnerContent}
          submitCode={executeCode}
        />
      )}
      {name === SlideActivityType.CONSOLES && fromJson && (
        <>
          <TeamScenarioExercise
            auProps={auProps}
            content={fromJson as TeamConsolesContent}
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
    </div>
  );
};
