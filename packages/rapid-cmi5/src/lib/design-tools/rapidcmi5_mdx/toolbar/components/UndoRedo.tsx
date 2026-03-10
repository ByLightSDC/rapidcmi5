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
    <>
      <MUIButtonWithTooltip
        disabled={!canUndo}
        title="Undo"
        aria-label="undo"
        onClick={() => {
          activeEditor?.dispatchCommand(UNDO_COMMAND, undefined);
        }}
      >
        <UndoIcon />
      </MUIButtonWithTooltip>
      <MUIButtonWithTooltip
        disabled={!canRedo}
        title="Redo"
        aria-label="redo"
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
