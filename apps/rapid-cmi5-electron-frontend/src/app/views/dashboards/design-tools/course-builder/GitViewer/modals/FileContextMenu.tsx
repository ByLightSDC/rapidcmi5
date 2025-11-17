import { useState } from 'react';
import {
  Menu,
  MenuItem,
  TextField,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Check, Close, Delete, Edit } from '@mui/icons-material';
import { IFlatMetadata } from 'react-accessible-treeview/dist/TreeView/utils';
import { INode } from 'react-accessible-treeview';

import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';

interface FileContextMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  element: INode<IFlatMetadata>;
  onRename: (newName: string, element: INode<IFlatMetadata>) => void;
  onDelete: (element: INode<IFlatMetadata>) => void;
  onCopy: (element: INode<IFlatMetadata>) => void;
  onPaste: (element: INode<IFlatMetadata>) => void;
}

const FileContextMenu: React.FC<FileContextMenuProps> = ({
  anchorEl,
  onClose,
  element,
  onRename,
  onCopy,
  onPaste,
  onDelete,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(element.name);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRenameSubmit = () => {
    onRename(newName, element);
    setIsRenaming(false);
    onClose();
  };

  const handleCopy = (element: INode<IFlatMetadata>) => {
    onCopy(element);
    onClose();
  };

  const handlePaste = (element: INode<IFlatMetadata>) => {
    onPaste(element);
    onClose();
  };

  return (
    <Menu
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{
        onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
          e.stopPropagation(),
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) =>
          e.stopPropagation(),
      }}
    >
      {/* Rename Option */}
      <MenuItem
        onClick={(e) => e.stopPropagation()} // Prevent click propagation
      >
        {isRenaming ? (
          <TextField
            size="small"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') handleRenameSubmit();
            }}
            autoFocus
          />
        ) : (
          `Rename "${element.name}"`
        )}
        <IconButton
          sx={{ '&:focus': { outline: 'none' } }}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            isRenaming ? handleRenameSubmit() : setIsRenaming(true);
          }}
        >
          {isRenaming ? <Check fontSize="small" /> : <Edit fontSize="small" />}
        </IconButton>
      </MenuItem>
      {/* Copy Option */}
      <MenuItem
        onClick={(e) => {
          e.stopPropagation();
          handleCopy(element);
        }}
      >
        Copy
        <IconButton sx={{ '&:focus': { outline: 'none' } }} size="small">
          <ContentPasteIcon fontSize="small" />
        </IconButton>
      </MenuItem>
      {/* Paste Option (only in folder)*/}
      {element.isBranch && (
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handlePaste(element);
          }}
        >
          Paste
          <IconButton sx={{ '&:focus': { outline: 'none' } }} size="small">
            <ContentPasteGoIcon fontSize="small" />
          </IconButton>
        </MenuItem>
      )}
      {/* Delete Confirmation */}
      <MenuItem
        onClick={(e) => e.stopPropagation()} // Prevent click propagation
      >
        {isDeleting ? (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">Delete "{element.name}"?</Typography>
            <IconButton
              sx={{ '&:focus': { outline: 'none' } }}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(element);
              }}
              color="error"
            >
              <Check fontSize="small" />
            </IconButton>
            <IconButton
              sx={{ '&:focus': { outline: 'none' } }}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleting(false);
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <>
            Delete "{element.name}"
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleting(true);
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </>
        )}
      </MenuItem>
    </Menu>
  );
};

export default FileContextMenu;
