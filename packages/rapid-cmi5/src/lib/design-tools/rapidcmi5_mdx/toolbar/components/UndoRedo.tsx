import { mergeRegister } from '@lexical/utils';
import { useCellValues } from '@mdxeditor/gurx';
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import React, { useEffect } from 'react';
import UndoIcon from '@mui/icons-material/Undo';

//import { IS_APPLE } from '../../../utils/detectMac';
//import { activeEditor$, iconComponentFor$, useTranslation } from '../../core';
//import { MultipleChoiceToggleGroup } from '.././primitives/toolbar';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';
import {
  activeEditor$,
  iconComponentFor$,
  IS_APPLE,
  MultipleChoiceToggleGroup,
  useTranslation,
} from '@mdxeditor/editor';

/**
 * A toolbar component that lets the user undo and redo changes in the editor.
 * @group Toolbar Components
 */
export function UndoRedo() {
  const [iconComponentFor, activeEditor] = useCellValues(
    iconComponentFor$,
    activeEditor$,
  );
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  const t = useTranslation();

  useEffect(() => {
    if (!activeEditor) {
      return;
    }

    return mergeRegister(
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [activeEditor]);

  return (
    // <MultipleChoiceToggleGroup
    //   items={[
    //     {
    //       title: t('toolbar.undo', 'Undo {{shortcut}}', { shortcut: IS_APPLE ? '⌘Z' : 'Ctrl+Z' }),
    //       disabled: !canUndo,
    //       contents: iconComponentFor('undo'),
    //       active: false,
    //       onChange: () => activeEditor?.dispatchCommand(UNDO_COMMAND, undefined)
    //     },
    //     {
    //       title: t('toolbar.redo', 'Redo {{shortcut}}', { shortcut: IS_APPLE ? '⌘Y' : 'Ctrl+Y' }),
    //       disabled: !canRedo,
    //       contents: iconComponentFor('redo'),
    //       active: false,
    //       onChange: () => activeEditor?.dispatchCommand(REDO_COMMAND, undefined)
    //     }
    //   ]}
    // />
    <>
      <MUIButtonWithTooltip
        disabled={!canUndo}
        title="Insert Tabs"
        aria-label="insert-tabs"
        onClick={() => {
          activeEditor?.dispatchCommand(UNDO_COMMAND, undefined);
        }}
      >
        {/* {iconComponentFor('undo')} */}
        <UndoIcon />
      </MUIButtonWithTooltip>
      <MUIButtonWithTooltip
        disabled={!canRedo}
        title="Insert Tabs"
        aria-label="insert-tabs"
        onClick={() => {
          activeEditor?.dispatchCommand(REDO_COMMAND, undefined);
        }}
      >
        <UndoIcon sx={{ transform: 'scaleX(-1)' }} />
      </MUIButtonWithTooltip>
    </>
  );
}
export default UndoRedo;
