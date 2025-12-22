import { useState } from 'react';
import {
  Menu,
  MenuItem,
  TextField,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { ILessonNode } from './LessonTreeNode';

import { Check, Close, Delete, Edit } from '@mui/icons-material';

/**
 * Provides wrapper for menu of desired options
 * @param {any} [optionButton] Button to display for launching menu instead of vertical ... icon
 * @param {string} [id] Id for ButtonOptions
 * @param {string} [tooltip] The tooltip to display for button
 * @param {string[]} [menuOptions] The options for the menu
 * @param {boolean} [closeOnClick=false] Whether to close menu on any click
 * @param {boolean} [disabled] Whether to disable the button which brings up menu
 * @param {(optionIndex: number) => void} onOptionSelect Function to call when an option is selected
 * @param {() => void} onTrigger Function called when menu to opened
 * @returns {React.ReactElement}
 */
export function Renamer({
  id = 'renamer',
  anchor,
  anchorPos = [0, 0],
  element,
  onClose,
  onSave,
}: {
  id?: string;
  anchor: HTMLElement | null;
  anchorPos: number[];
  element: ILessonNode  | null;
  onClose?: () => void;
  onSave?: (theName: string, element: ILessonNode ) => void;
}) {
  const [newName, setNewName] = useState(element?.name || '');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(anchor);

  const handleClose = () => {
    setAnchorEl(null);
    if (onClose) {
      onClose();
    }
  };
  const handleSave = () => {
    if (onSave && element) {
      onSave(newName, element);
    }
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <Menu
      id="rename-menu"
      open={open}
      //anchorEl={anchorEl}
      anchorReference="anchorPosition"
      anchorPosition={{ top: anchorPos[1], left: anchorPos[0] }}
      onClose={handleClose}
      // onClick={(event) => {
      //   event.stopPropagation();
      //   handleCancel();
      // }}
      sx={{ zIndex: 9999 }}
    >
      <MenuItem data-testid={id}>
        <TextField
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') handleSave();
          }}
          autoFocus
        />
        <IconButton
          sx={{ '&:focus': { outline: 'none' } }}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleSave();
          }}
        >
          <Check fontSize="small" />
        </IconButton>
      </MenuItem>
    </Menu>
  );
}
