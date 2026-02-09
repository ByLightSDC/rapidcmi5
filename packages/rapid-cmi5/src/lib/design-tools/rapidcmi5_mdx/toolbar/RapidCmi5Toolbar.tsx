import React, { useCallback, useContext, useEffect, useState } from 'react';

import ReactDOM from 'react-dom';

import {
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertCodeBlock,
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

import { InsertAdmonition } from './components/InsertAdmonition';
import {
  iconButtonSize,
  iconButtonStyle,
  tooltipStyle,
} from '../styles/styles';

import { useSelector } from 'react-redux';
import { BlockTypeSelect } from './components/BlockTypeSelect';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RC5Context } from '../contexts/RC5Context';
import { ColorTextSplitButton } from './components/ColorTextSplitButton';
import { HighlightSplitButton } from './components/HighlightSplitButton';
import { TextFxButton } from './components/TextFxButton';
import { InsertAudio } from './components/InsertAudio';
import { InsertTable } from './components/InsertTable';
import { InsertAnimation } from './components/InsertAnimation';
import {
  AdmonitionTypeEnum,
  AdmonitionTypes,
  ActivityType,
  RC5ActivityTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';
import {
  editorInPlayback$,
  CONTENT_UPDATED_COMMAND,
  InsertTabs,
  InsertAccordion,
  dividerColor,
  iconColor,
  InsertGrid,
} from '@rapid-cmi5/ui';
import { displayData } from '../../../redux/courseBuilderReducer';
import { SlideMenu } from '../menu/SlideMenu';

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
  const themeIconColor = useSelector(iconColor);
  const themedDividerColor = useSelector(dividerColor);
  const content = useSelector(displayData);
  const [editor] = useLexicalComposerContext();

  const toggleGroup = useCallback(
    (whichGroup: number) => {
      if (whichGroup) {
        setIsToolGroup1Visible(!isToolGroup1Visible);
      }
    },
    [isToolGroup1Visible],
  );

  /**
   * UE sets view to Rich Text Editor on mount
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
        width: '100vw',
        borderBottom: `1px solid ${themedDividerColor}`,
        position: 'sticky',
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      {/* Scroll container */}
      <Box
        sx={{
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Centerer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            px: 1,
          }}
        >
          {/* Actual toolbar row (shrink-to-fit) */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              width: 'max-content',
              p: 1,
              gap: 1,
              overflowX: 'hidden',
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
                            { when: whenInAdmonition, contents: () => <></> },
                            { when: whenInActivity, contents: () => <></> },
                            { fallback: () => <BlockTypeSelect /> },
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
                        <InsertTabs />
                        <InsertAccordion />
                        <InsertGrid />
                        <InsertThematicBreak />
                        <Separator />
                        <InsertCodeBlock />
                        <InsertLayoutBox />
                        <InsertAnimation />
                        <Separator />
                      </>
                    ),
                  },
                ]}
              />
            </DiffSourceToggleWrapper>
          </Box>
        </Box>
      </Box>
      {/* SlideMenu row: if you want it centered relative to the same width, keep it inside the same centered area */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          my: 0.5,
        }}
      >
        <SlideMenu
          extraOptions={[
            <IconButton
              aria-label="toggle-playback"
              size={iconButtonSize}
              style={iconButtonStyle}
              onClick={() => realm.pub(editorInPlayback$, !isPlayback)}
            >
              <Box
                sx={{
                  color: themeIconColor,
                  display: 'flex',
                }}
              >
                {isPlayback ? (
                  <Tooltip title="Toggle Preview OFF" {...tooltipStyle}>
                    <StopScreenShareIcon color="inherit" />
                  </Tooltip>
                ) : (
                  <Tooltip title="Toggle Preview ON" {...tooltipStyle}>
                    <ScreenShareIcon color="inherit" />
                  </Tooltip>
                )}
              </Box>
            </IconButton>,
          ]}
        />
      </Box>
    </Box>
  );
};
