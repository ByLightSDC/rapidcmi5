import React, { useCallback, useContext, useEffect, useState } from 'react';

import ReactDOM from 'react-dom';

import {
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertCodeBlock,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  ShowSandpackInfo,
  StrikeThroughSupSubToggles,
  DirectiveNode,
  EditorInFocus,
  ConditionalContents,
  Separator,
  usePublisher,
  viewMode$,
  useCellValue,
  useRealm,
  UndoRedo,
} from '@mdxeditor/editor';
import { CLEAR_HISTORY_COMMAND } from 'lexical';
import { InsertActivity } from './components/InsertActivity';
import { InsertImage } from './components/InsertImage';
import { InsertVideo } from './components/InsertVideo';
import { InsertLayoutBox } from './components/InsertLayoutBox';

/** Icons */
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';

import { Box, IconButton, Tooltip } from '@mui/material';
import {
  ActivityType,
  AdmonitionTypeEnum,
  AdmonitionTypes,
  RC5ActivityTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';
import { InsertAdmonition } from './components/InsertAdmonition';
import {
  iconButtonSize,
  iconButtonStyle,
  tooltipStyle,
} from '../styles/styles';
import { CONTENT_UPDATED_COMMAND, editorInPlayback$ } from '@rapid-cmi5/ui';
import { useSelector } from 'react-redux';
import { dividerColor } from '@rapid-cmi5/ui';
import { BlockTypeSelect } from './components/BlockTypeSelect';
import { displayData } from '../../../redux/courseBuilderReducer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RC5Context } from '../contexts/RC5Context';
import { ColorTextSplitButton } from './components/ColorTextSplitButton';
import { HighlightSplitButton } from './components/HighlightSplitButton';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';
import { InsertAudio } from './components/InsertAudio';
import { InsertAnimation } from './components/InsertAnimation';
import { TextFxButton } from './components/TextFxButton';

//Admonition
export type RapidAdmonitionKind =
  | 'note'
  | 'tip'
  | 'danger'
  | 'info'
  | 'caution';

function whenInAdmonition(editorInFocus: EditorInFocus | null) {
  const node = editorInFocus?.rootNode;
  if (!node || node.getType() !== 'directive') {
    return false;
  }
  const theKey = (node as DirectiveNode).getMdastNode()
    .name as AdmonitionTypeEnum;
  return AdmonitionTypes.includes(
    (node as DirectiveNode).getMdastNode().name as AdmonitionTypeEnum,
  );
}

//Activity
function whenInActivity(editorInFocus: EditorInFocus | null) {
  const node = editorInFocus?.rootNode;
  if (!node || node.getType() !== 'directive') {
    return false;
  }

  return ActivityType.includes(
    (node as DirectiveNode).getMdastNode().name as RC5ActivityTypeEnum,
  );
}

/**
 * A toolbar component that includes all toolbar components.
 * Notice that some of the buttons will work only if you have the corresponding plugin enabled, so you should use it only for testing purposes.
 * You'll probably want to create your own toolbar component that includes only the buttons that you need.
 * @group Toolbar Components
 */
export const RapidCmi5Toolbar: React.FC = () => {
  const changeViewMode = usePublisher(viewMode$);
  const { getMarkdownData } = useContext(RC5Context);
  const realm = useRealm();
  const [isToolGroup1Visible, setIsToolGroup1Visible] = useState(true);
  const isPlayback = useCellValue(editorInPlayback$);
  const themedDividerColor = useSelector(dividerColor);
  const content = useSelector(displayData);
  const [editor] = useLexicalComposerContext();
  const { isGitLoaded } = useContext(GitContext);

  const toggleGroup = useCallback(
    (whichGroup: number) => {
      if (whichGroup) {
        setIsToolGroup1Visible(!isToolGroup1Visible);
      }
    },
    [isToolGroup1Visible],
  );

  /**
   * UE sets view to Riche Text Editor on mount
   */
  useEffect(() => {
    realm.pub(editorInPlayback$, false);
    changeViewMode('rich-text');
  }, []);

  useEffect(() => {
    if (getMarkdownData() !== content) {
      editor.dispatchCommand(CONTENT_UPDATED_COMMAND, undefined);
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    }
  }, [content]);

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        width: '100%',
        padding: '8px',
        minHeight: '84px',
        borderColor: themedDividerColor,
        borderStyle: 'solid',
        borderWidth: '1px',
      }}
    >
      <DiffSourceToggleWrapper options={['rich-text', 'source']}>
        <ConditionalContents
          options={[
            {
              when: (editor) => editor?.editorType === 'sandpack',
              contents: () => <ShowSandpackInfo />,
            },
            {
              fallback: () => (
                <>
                  <UndoRedo />
                  <Separator />
                  <BoldItalicUnderlineToggles />
                  <StrikeThroughSupSubToggles />
                  <ColorTextSplitButton />
                  <HighlightSplitButton />
                  <TextFxButton />
                  <Separator />
                  <CodeToggle />
                  <ListsToggle />
                  <Separator />

                  <ConditionalContents
                    options={[
                      {
                        when: whenInAdmonition,
                        contents: () => (
                          // eslint-disable-next-line react/jsx-no-useless-fragment
                          <></>
                        ),
                      },
                      {
                        when: whenInActivity,
                        contents: () => (
                          // eslint-disable-next-line react/jsx-no-useless-fragment
                          <></>
                        ),
                      },
                      {
                        fallback: () => (
                          // eslint-disable-next-line react/jsx-no-useless-fragment
                          <BlockTypeSelect />
                        ),
                      },
                    ]}
                  />

                  <InsertAdmonition />
                  <InsertActivity />
                  <Separator />

                  <CreateLink />
                  <InsertImage />
                  <InsertAudio />
                  <InsertVideo />

                  <Separator />
                  <InsertTable />
                  <InsertThematicBreak />
                  <Separator />
                  <InsertCodeBlock />
                  <InsertLayoutBox />
                  <InsertAnimation />
                  {/*REF <InsertSandpack />
                  <InsertFrontmatter /> */}
                  <Separator />
                  <IconPortal>
                    <IconButton
                      aria-label="toggle-playback"
                      color="inherit"
                      size={iconButtonSize}
                      style={iconButtonStyle}
                      onClick={() => {
                        realm.pub(editorInPlayback$, !isPlayback);
                      }}
                    >
                      <>
                        {isPlayback && (
                          <Tooltip title="Toggle Preview OFF" {...tooltipStyle}>
                            <StopScreenShareIcon color="inherit" />
                          </Tooltip>
                        )}
                        {!isPlayback && (
                          <Tooltip title="Toggle Preview ON" {...tooltipStyle}>
                            <ScreenShareIcon color="inherit" />
                          </Tooltip>
                        )}
                      </>
                    </IconButton>
                  </IconPortal>
                </>
              ),
            },
          ]}
        />
      </DiffSourceToggleWrapper>
    </Box>
  );
};

/**
 * Portal to render Mdx Editor dependent icon in the slide menu
 * @param param0
 * @returns
 */
function IconPortal({ children }: { children: JSX.Element | JSX.Element[] }) {
  const modalRoot = document.getElementById('preview-icon-target'); // Get the target DOM node
  if (!modalRoot) {
    return <div style={{ width: '100%', height: '100%' }} />;
  }
  return ReactDOM.createPortal(
    <div className="modal-content">{children}</div>,
    modalRoot, // Render the children into the modalRoot DOM node
  );
}
