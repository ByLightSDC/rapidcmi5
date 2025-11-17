import { DragEvent, useEffect } from 'react';

/** MUI */
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { FolderOpen, Folder } from '@mui/icons-material';
import { useContextMenu } from '../../hooks/useContextMenu';
import FileContextMenu from '../../modals/FileContextMenu';
import { INode } from 'react-accessible-treeview/dist/TreeView/types';
import { IFlatMetadata } from 'react-accessible-treeview/dist/TreeView/utils';
import { CreateNewFolder, NoteAdd } from '@mui/icons-material';
import PopupInput from '../../modals/PopupInput';
import { usePopup } from '../../hooks/usePopup';
import { tooltipStyle } from '../../../../rapidcmi5_mdx/styles/styles';

/**
 * Icons
 */

interface FolderIconProps {
  isOpen: boolean;
  isReadOnly?: boolean;
  element: INode<IFlatMetadata>;
  currentRepo: string | null;
  currentLesson?: string;
}

export const TreeFolderIcon: React.FC<FolderIconProps> = ({
  isOpen,
  isReadOnly,
  element,
}) => {
  const {
    menuAnchorEl,
    handleOpenMenu,
    handleCloseMenu,
    onDelete,
    onRename,
    onCopy,
    onPaste,
  } = useContextMenu();
  const {
    popupAnchorEl,
    popupType,
    handleOpenPopup,
    handleClosePopup,
    handleNewDir,
    handleNewFile,
  } = usePopup();

  /**
   * Create File/s from files data
   * @param files
   */
  const dropImageIntoFolder = async (files?: any) => {
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const fileReader = new FileReader();
        fileReader.onload = function (event: any) {
          if (fileReader.result) {
            // console.log('b file', files[i]);
            const imgData = new Uint8Array(fileReader.result as ArrayBuffer);
            handleNewFile(element, files[i].name, imgData);
          }
        };
        fileReader.readAsArrayBuffer(files[i]);
      }
    }
  };

  const onDragStart = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onDragStop = (event: DragEvent<HTMLDivElement>) => {
    const { files } = event.dataTransfer;
    event.preventDefault();
    event.stopPropagation();
    dropImageIntoFolder(files);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between', //makes action icons align far right
        width: '100%',
        height: '24px', //no other way to trim vertical padding on folder icons
        color: 'text.hint',
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        handleOpenMenu(e, element);
      }}
      onDragEnter={(event) => {
        onDragStart(event);
      }}
      onDragOver={(event) => {
        onDragOver(event);
      }}
      onDrop={(event) => {
        onDragStop(event);
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: 0,
        }}
      >
        {isOpen ? <FolderOpen /> : <Folder />}
        <Typography
          sx={{ fontFamily: 'monaco', fontSize: '13px', padding: '0px' }}
        >
          {element.name}
        </Typography>
      </Box>

      {!isReadOnly && (
        <FileContextMenu
          anchorEl={menuAnchorEl}
          onClose={handleCloseMenu}
          element={element}
          onDelete={onDelete}
          onRename={onRename}
          onCopy={onCopy}
          onPaste={onPaste}
        />
      )}

      {!isReadOnly && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            sx={{
              '&:focus': { outline: 'none' }, 
            }}
            size="small"
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPopup(e, 'dir');
            }}
            color="primary"
          >
            <Tooltip arrow title="Create Folder" {...tooltipStyle}>
              <CreateNewFolder />
            </Tooltip>
          </IconButton>
          <IconButton
            sx={{
              '&:focus': { outline: 'none' },
            }}
            size="small"
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPopup(e, 'file');
            }}
            color="secondary"
          >
            <Tooltip arrow title="Create File" {...tooltipStyle}>
              <NoteAdd />
            </Tooltip>
          </IconButton>
        </Box>
      )}

      <PopupInput
        anchorEl={popupAnchorEl}
        onClose={handleClosePopup}
        onCreateFile={(name: string, fileData: string | Uint8Array) => {

          handleNewFile(element, name, fileData);
        }}
        onCreateFolder={(name: string) => {
          handleNewDir(element, name);
        }}
        // Used for creating empty file or folder, not for imports
        onSubmit={(name: string) => {
          if (popupType === 'file') {
            handleNewFile(element, name, '');
          } else {
            handleNewDir(element, name);
          }
          handleClosePopup();
        }}
        type={popupType || 'file'}
      />
    </Box>
  );
};
