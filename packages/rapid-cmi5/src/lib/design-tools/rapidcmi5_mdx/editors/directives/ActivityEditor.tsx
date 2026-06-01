import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DirectiveEditorProps,
  useCellValue,
  useLexicalNodeRemove,
  useMdastNodeUpdater,
} from '@mdxeditor/editor';

import {
  Box,
  IconButton,
  Stack,
  ThemeProvider,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { deepmerge } from '@mui/utils';

import { CodeRunnerForm } from '../../../../features/codeRunner/components/CodeRunnerForm';

import { QuizForm } from '../../../../features/quiz/components/QuizForm';
import { useAuContext } from '../../data-hooks/useAuContext';
import DeleteIconButton from '../components/DeleteIconButton';
import { useDispatch } from 'react-redux';
import PaletteIcon from '@mui/icons-material/Palette';

import { DownloadFilesForm } from './DownloadFilesForm';
import {
  RC5ActivityTypeEnum,
  ActivityJsonNode,
  QuizContent,
  CTFContent,
  CodeRunnerContent,
  ContentWidthEnum,
} from '@rapid-cmi5/cmi5-build-common';
import {
  useTimeStampUUID,
  editorInPlayback$,
  debugLog,
  debugLogError,
  jsonFormatSpaces,
  FormCrudType,
  AuQuiz,
  AuCTF,
  CodeRunner,
  useLessonStyles,
  LessonThemeContext,
  maxFormWidths,
  BlockAppearanceForm,
  ActivityDirectiveNode,
  InsertLineReturnButton,
  darkTheme,
  config,
} from '@rapid-cmi5/ui';

import ScenarioMock from './ScenarioMock';
import {
  updateScenario,
  updateTeamScenario,
} from '../../../../redux/courseBuilderReducer';
import { ScenarioForm } from '../../../../features/scenarios/components/forms/IndividualScenarioForm';
import { TeamConsolesForm } from '../../../../features/scenarios/components/forms/TeamScenarioForm';

/**
 * MDX Editor for Activities
 * @param param0 <ActivityDirectiveNode>
 * @returns
 */
export const ActivityEditor: React.FC<
  DirectiveEditorProps<ActivityDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
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

  const muiTheme: any = useTheme();

  const { lessonTheme } = useContext(LessonThemeContext);
  const {
    blockAppearanceOpen,
    contentWidthDisplay,
    innerSx,
    innerActivitySx,
    outerSx,
    outerStyle,
    setBlockAppearanceOpen,
    setContentWidth,
  } = useLessonStyles(
    lessonTheme,
    mdastNode?.attributes?.contentWidth,
    maxFormWidths.downloadsEditor,
    muiTheme.palette.background.paper,
    muiTheme.activity.backgroundColor,
    isPlayback,
    false,
  );

  /**
   * Handle Activity Deletion
   */
  const onDelete = useCallback((payload?: KeyboardEvent) => {
    if (mdastNode.name === 'scenario') {
      dispatch(
        updateScenario({
          scenario: undefined,
        }),
      );
    } else if (mdastNode.name === 'consoles') {
      dispatch(
        updateTeamScenario({
          scenario: undefined,
        }),
      );
    }
    if (payload) {
      //FUTURE handle keyboard shortcut deletion
    } else {
      removeNode();
    }
    return false;
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

  /** Update mdast node when content width changes */
  const onContentWidthChange = useCallback(
    (newContentWidth?: ContentWidthEnum) => {
      setContentWidth(newContentWidth);

      const attrs = { ...mdastNode.attributes } as Record<string, string>;

      if (newContentWidth) {
        attrs['contentWidth'] = newContentWidth;
      } else {
        delete attrs['contentWidth'];
      }

      updateMdastNode({
        ...mdastNode,
        attributes: attrs,
      });
    },
    [],
  );

  /** Shared context menu */
  const contextMenu = useMemo(() => {
    /* Gutter buttons — absolutely positioned to the right of the decorator */
    if (!isPlayback) {
      return (
        <Box
          sx={{
            backgroundColor:
              muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6',
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        >
          <Tooltip title="Block Appearance">
            <IconButton
              onClick={() => setBlockAppearanceOpen(true)}
              size="small"
            >
              <PaletteIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <InsertLineReturnButton
            parentEditor={parentEditor}
            lexicalNode={lexicalNode}
          />
          <DeleteIconButton
            onDelete={() => {
              onDelete();
            }}
          />
        </Box>
      );
    }
    return undefined;
  }, [muiTheme.palette.mode]);

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
    <>
      <div
        style={{
          padding: 0,
          margin: 0,
          width: '100%',
        }}
      >
        <ActivityThemeWrapper isPlayback={isPlayback}>
          {name === 'scenario' && fromJson && (
            <>
              {isPlayback && (
                <ScenarioMock
                  activity={RC5ActivityTypeEnum.scenario}
                  scenarioName={fromJson?.name}
                  innerSx={innerActivitySx}
                  outerSx={outerSx}
                  outerStyle={outerStyle}
                />
              )}
              {!isPlayback && (
                <ScenarioForm
                  contextMenu={contextMenu}
                  crudType={isEditable ? FormCrudType.edit : FormCrudType.view}
                  defaultFormData={fromJson}
                  innerSx={innerActivitySx}
                  outerSx={outerSx}
                  outerStyle={outerStyle}
                  onSave={onSave}
                />
              )}
            </>
          )}
          {name === 'quiz' && fromJson && (
            <>
              {isPlayback && (
                <AuQuiz
                  auProps={auProps}
                  content={fromJson as QuizContent}
                  innerSx={innerActivitySx}
                  outerSx={outerSx}
                  outerStyle={outerStyle}
                />
              )}
              {!isPlayback && (
                <QuizForm
                  activityKind={RC5ActivityTypeEnum.quiz}
                  contextMenu={contextMenu}
                  crudType={isEditable ? FormCrudType.edit : FormCrudType.view}
                  defaultFormData={fromJson}
                  innerSx={innerSx}
                  outerSx={outerSx}
                  outerStyle={outerStyle}
                  onSave={onSave}
                />
              )}
            </>
          )}
          {name === 'ctf' && fromJson && (
            <>
              {isPlayback && (
                <>
                  {fromJson.questions.length === 0 ? (
                    <Stack
                      direction="column"
                      sx={{ ...outerStyle }}
                      {...outerStyle}
                    >
                      <Box sx={{ ...innerActivitySx }}>
                        <Typography sx={{ fontWeight: 'bold' }}>CTF</Typography>
                        <Typography>{'CTF has no questions.'}</Typography>
                      </Box>
                    </Stack>
                  ) : (
                    <AuCTF
                      auProps={auProps}
                      content={fromJson as CTFContent}
                      innerSx={innerActivitySx}
                      outerSx={outerSx}
                      outerStyle={outerStyle}
                    />
                  )}
                </>
              )}
              {!isPlayback && (
                <QuizForm
                  activityKind={RC5ActivityTypeEnum.ctf}
                  contextMenu={contextMenu}
                  crudType={isEditable ? FormCrudType.edit : FormCrudType.view}
                  defaultFormData={fromJson}
                  innerSx={innerActivitySx}
                  outerSx={outerSx}
                  outerStyle={outerStyle}
                  onSave={onSave}
                />
              )}
            </>
          )}
          {name === 'codeRunner' && fromJson && (
            <>
              {isPlayback && (
                <CodeRunner
                  auProps={auProps}
                  content={fromJson as CodeRunnerContent}
                  innerSx={innerActivitySx}
                  outerSx={outerSx}
                  outerStyle={outerStyle}
                />
              )}
              {!isPlayback && (
                <CodeRunnerForm
                  contextMenu={contextMenu}
                  crudType={isEditable ? FormCrudType.edit : FormCrudType.view}
                  defaultFormData={fromJson}
                  innerSx={innerActivitySx}
                  outerSx={outerSx}
                  outerStyle={outerStyle}
                  onSave={onSave}
                />
              )}
            </>
          )}
          {name === 'consoles' && fromJson && (
            <>
              {isPlayback && (
                <ScenarioMock
                  activity={RC5ActivityTypeEnum.consoles}
                  scenarioName={fromJson?.name}
                  innerSx={innerActivitySx}
                  outerSx={outerSx}
                  outerStyle={outerStyle}
                />
              )}
              {!isPlayback && (
                <TeamConsolesForm
                  contextMenu={contextMenu}
                  crudType={isEditable ? FormCrudType.edit : FormCrudType.view}
                  defaultFormData={fromJson}
                  innerSx={innerActivitySx}
                  outerSx={outerSx}
                  outerStyle={outerStyle}
                  onSave={onSave}
                />
              )}
            </>
          )}
        </ActivityThemeWrapper>
        {name === 'download' && fromJson && (
          <DownloadFilesForm
            contextMenu={contextMenu}
            crudType={
              isEditable && !isPlayback
                ? FormCrudType.edit
                : FormCrudType.preview
            }
            defaultFormData={fromJson}
            testId={rc5id}
            onSave={onSave}
            innerSx={innerActivitySx}
            outerSx={outerSx}
            outerStyle={outerStyle}
          />
        )}
      </div>
      <BlockAppearanceForm
        open={blockAppearanceOpen}
        currentContentWidth={contentWidthDisplay}
        onClose={() => setBlockAppearanceOpen(false)}
        onSave={(newContentWidth) => {
          setContentWidth(newContentWidth);
          onContentWidthChange(newContentWidth);
        }}
      />
    </>
  );
};

/**
 * update theme with overrides from cfg file
 */

const ActivityThemeWrapper = ({
  children,
  isPlayback,
}: {
  children: JSX.Element | JSX.Element[];
  isPlayback: boolean;
}) => {
  if (isPlayback) {
    const overriddenTheme: any = deepmerge(darkTheme, config.THEME.DARK);

    if (overriddenTheme?.palette?.info?.light) {
      return <ThemeProvider theme={overriddenTheme}>{children}</ThemeProvider>;
    }
    return <>{children}</>;
  }
  return <>{children}</>;
};
