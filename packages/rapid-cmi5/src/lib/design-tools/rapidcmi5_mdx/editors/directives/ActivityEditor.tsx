import React, { useCallback, useMemo, useState } from 'react';
import {
  DirectiveEditorProps,
  useCellValue,
  useLexicalNodeRemove,
  useMdastNodeUpdater,
} from '@mdxeditor/editor';

import { Stack, Typography } from '@mui/material';

import { ScenarioForm } from '../forms/ScenarioForm';
import { JobeForm } from '../forms/JobeForm';



import { QuizForm } from '../forms/QuizForm';
import { useAuContext } from '../../data-hooks/useAuContext';
import DeleteIconButton from '../components/DeleteIconButton';
import RightMenuContainer from '../components/RightMenuContainer';
import { useDispatch, useSelector } from 'react-redux';

import { TeamConsolesForm } from '../forms/TeamConsolesForm';
import { DownloadFilesForm } from './DownloadFilesForm';
import { RC5ActivityTypeEnum, ActivityJsonNode, QuizContent, CTFContent, JobeContent } from '@rapid-cmi5/cmi5-build-common';
import { useTimeStampUUID, editorInPlayback$, dividerColor, debugLog, debugLogError, jsonFormatSpaces, FormCrudType, AuQuiz, AuCTF, JobeInTheBox } from '@rapid-cmi5/ui';
import { updateScenario, updateTeamScenario } from '@rapid-cmi5/react-editor';

/**
 * MDX Editor for Activities
 * @param param0
 * @returns
 */
export const ActivityEditor: React.FC<DirectiveEditorProps> = ({
  lexicalNode,
  mdastNode,
  parentEditor,
  descriptor,
}) => {
  const { generateId } = useTimeStampUUID();
  const { name } = mdastNode; //scenario, quiz, etc.
  const dispatch = useDispatch();
  const removeNode = useLexicalNodeRemove();
  const [rc5id, setRC5Id] = useState<any>(undefined);
  const [fromJson, setFromJson] = useState<any>(undefined);
  const updateMdastNode = useMdastNodeUpdater();
  const isEditable = parentEditor.isEditable();
  const isPlayback = useCellValue(editorInPlayback$);
  const auProps = useAuContext();
  const themedDividerColor = useSelector(dividerColor);

  // style for playback boxes
  const staticStyle = useMemo(() => {
    return {
      padding: '40px',
      border: '1px solid',
      borderRadius: '12px',
      borderColor: themedDividerColor,
      borderWidth: '2px',
    };
  }, [themedDividerColor]);

  /**
   * Handle Activity Deletion
   */
  const onDelete = useCallback((payload?: KeyboardEvent) => {
    if (payload) {
      //FUTURE handle keyboard shortcut deletion
    } else {
      removeNode();
    }
    return false;
  }, []);

  const onDeleteScenario = useCallback((payload?: KeyboardEvent) => {
    //delete scenario from redux and course data
    dispatch(
      updateScenario({
        scenario: undefined,
      }),
    );

    onDelete(payload);
  }, []);

  const onDeleteTeamScenario = useCallback((payload?: KeyboardEvent) => {
    //delete scenario from redux and course data
    debugLog('updateTeamScenario (delete activity)');
    dispatch(
      updateTeamScenario({
        scenario: undefined,
      }),
    );

    onDelete(payload);
  }, []);

  /**
   * Update lexical node with form data
   * @param {*} data Form Data
   */
  const saveFormDataToLexical = (data: any) => {
    if (!mdastNode.children || mdastNode.children.length === 0) {
      debugLogError('Missing children!');
      return;
    }
    const firstChild = mdastNode.children[0];

    //inject local internal id if none present
    if (!Object.prototype.hasOwnProperty.call(data, 'rc5id')) {
      data = { ...data, rc5id: rc5id };
    }

    const updatedJson = JSON.stringify(data, null, jsonFormatSpaces);

    //treat json as transient code block so it is more easily editable in raw view
    const updatedCodeBlock = {
      ...firstChild,
      type: 'code',
      lang: 'json',
      value: updatedJson,
    };

    updateMdastNode({
      ...mdastNode,
      children: [updatedCodeBlock as any],
    });

    setFromJson(data);
  };

  /**
   * Save callback for all activities
   * @param {ActivityKind} activity
   * @param {*} data Form Data
   */
  const onSave = (activity: RC5ActivityTypeEnum, data: any) => {
    //update scenario in redux & course data if im a scenario activity
    if (activity === RC5ActivityTypeEnum.scenario) {
      dispatch(
        updateScenario({
          scenario: { uuid: data?.uuid || undefined, name: data?.name },
        }),
      );
      // if (data.uuid) {
      //   dispatch(
      //     updateScenario({
      //       scenario: { uuid: data?.uuid || undefined, name: data?.name },
      //     }),
      //   );
      // } else {
      //   dispatch(
      //     updateScenario({
      //       scenario: undefined,
      //     }),
      //   );
      // }
    } else if (activity === RC5ActivityTypeEnum.consoles) {
      debugLog('updateTeamScenario (save activity)', data);
      dispatch(
        updateTeamScenario({
          scenario: { uuid: data?.uuid || undefined, name: data?.name },
        }),
      );
    }
    saveFormDataToLexical(data);
  };

  /** Get Default Form Data from MDAST Node */
  React.useEffect(() => {
    if (!fromJson) {
      if (mdastNode?.children?.length > 0) {
        try {
          let jsonNode;
          const childNode = mdastNode.children[0];
          if (childNode.type === 'code') {
            jsonNode = childNode as ActivityJsonNode;
          }
          // We need to support the old style not in code blocks
          else if (childNode.type === 'paragraph') {
            const textNode = childNode.children[0];
            if (textNode.type !== 'text') return;
            jsonNode = textNode as ActivityJsonNode;
          }

          if (!jsonNode) return;

          const json = JSON.parse(jsonNode.value);
          // stash local rc5 id, pull from json OR generate
          if (Object.prototype.hasOwnProperty.call(json, 'rc5id')) {
            setRC5Id(json['rc5id']);
          } else {
            setRC5Id(generateId());
          }
          //console.log('mount', json);
          setFromJson(json);
        } catch (e) {
          //TODO validation here like we do in source view
          console.log(e);
        }
      } else {
        debugLogError('Missing activity children');
      }
    }
  }, [fromJson, mdastNode?.children]);

  return (
    <div
      style={{
        padding: 0,
        margin: 0,
        width: '100%',
      }}
    >
      {name === 'scenario' && fromJson && (
        <>
          {isPlayback && (
            <Stack direction="column" sx={staticStyle}>
              <Typography sx={{ fontWeight: 'bold' }}>Scenario</Typography>
              <Typography>
                {`During a lesson, access to VM consoles and Autograder tasks associated with the scenario (${fromJson?.name}) will appear here.`}
              </Typography>
            </Stack>
          )}
          {!isPlayback && (
            <ScenarioForm
              crudType={isEditable ? FormCrudType.edit : FormCrudType.view}
              defaultFormData={fromJson}
              deleteButton={
                !isPlayback ? (
                  <RightMenuContainer>
                    <DeleteIconButton onDelete={onDeleteScenario} />
                  </RightMenuContainer>
                ) : undefined
              }
              onSave={onSave}
            />
          )}
        </>
      )}
      {name === 'quiz' && fromJson && (
        <>
          {isPlayback && (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              {fromJson.questions.length === 0 ? (
                <Stack direction="column" sx={staticStyle}>
                  <Typography sx={{ fontWeight: 'bold' }}>Quiz</Typography>
                  <Typography>{'Quiz has no questions.'}</Typography>
                </Stack>
              ) : (
                <AuQuiz auProps={auProps} content={fromJson as QuizContent} />
              )}
            </>
          )}
          {!isPlayback && (
            <QuizForm
              activityKind={RC5ActivityTypeEnum.quiz}
              crudType={isEditable ? FormCrudType.edit : FormCrudType.view}
              defaultFormData={fromJson}
              deleteButton={
                !isPlayback ? (
                  <RightMenuContainer>
                    <DeleteIconButton onDelete={onDelete} />
                  </RightMenuContainer>
                ) : undefined
              }
              onSave={onSave}
            />
          )}
        </>
      )}
      {name === 'ctf' && fromJson && (
        <>
          {isPlayback && (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              {fromJson.questions.length === 0 ? (
                <Stack direction="column" sx={staticStyle}>
                  <Typography sx={{ fontWeight: 'bold' }}>CTF</Typography>
                  <Typography>{'CTF has no questions.'}</Typography>
                </Stack>
              ) : (
                <AuCTF auProps={auProps} content={fromJson as CTFContent} />
              )}
            </>
          )}
          {!isPlayback && (
            <QuizForm
              activityKind={RC5ActivityTypeEnum.ctf}
              crudType={isEditable ? FormCrudType.edit : FormCrudType.view}
              defaultFormData={fromJson}
              deleteButton={
                !isPlayback ? (
                  <RightMenuContainer>
                    <DeleteIconButton onDelete={onDelete} />
                  </RightMenuContainer>
                ) : undefined
              }
              onSave={onSave}
            />
          )}
        </>
      )}
      {name === 'jobe' && fromJson && (
        <>
          {isPlayback && (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              {!fromJson.evaluator ? (
                <Stack direction="column" sx={staticStyle}>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    Jobe In The Box
                  </Typography>
                  <Typography>
                    {'Jobe In The Box is missing an evaluation script.'}
                  </Typography>
                </Stack>
              ) : (
                <JobeInTheBox
                  auProps={auProps}
                  content={fromJson as JobeContent}
                />
              )}
            </>
          )}
          {!isPlayback && (
            <JobeForm
              crudType={isEditable ? FormCrudType.edit : FormCrudType.view}
              defaultFormData={fromJson}
              deleteButton={
                !isPlayback ? (
                  <RightMenuContainer>
                    <DeleteIconButton onDelete={onDelete} />
                  </RightMenuContainer>
                ) : undefined
              }
              onSave={onSave}
            />
          )}
        </>
      )}
      {name === 'consoles' && fromJson && (
        <>
          {isPlayback && (
            <Stack direction="column" sx={staticStyle}>
              <Typography sx={{ fontWeight: 'bold' }}>Team Consoles</Typography>
              <Typography>
                {`During a lesson, access to VM consoles and Autograder tasks associated with the scenario (${fromJson?.name}) will appear here.`}
              </Typography>
            </Stack>
          )}
          {!isPlayback && (
            <TeamConsolesForm
              crudType={isEditable ? FormCrudType.edit : FormCrudType.view}
              defaultFormData={fromJson}
              deleteButton={
                !isPlayback ? (
                  <RightMenuContainer>
                    <DeleteIconButton onDelete={onDeleteTeamScenario} />
                  </RightMenuContainer>
                ) : undefined
              }
              onSave={onSave}
            />
          )}
        </>
      )}
      {name === 'download' && fromJson && (
        <DownloadFilesForm
          crudType={
            isEditable && !isPlayback ? FormCrudType.edit : FormCrudType.preview
          }
          defaultFormData={fromJson}
          deleteButton={
            isEditable && !isPlayback ? (
              <RightMenuContainer>
                <DeleteIconButton onDelete={onDelete} />
              </RightMenuContainer>
            ) : undefined
          }
          testId={rc5id}
          onSave={onSave}
        />
      )}
    </div>
  );
};
