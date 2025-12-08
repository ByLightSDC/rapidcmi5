import { Box, Tooltip } from '@mui/material';
import { useContextMenu } from '../../hooks/useContextMenu';
import FileContextMenu from '../../modals/FileContextMenu';
import { FormatListBulleted, Javascript, Css } from '@mui/icons-material';
import { IFlatMetadata } from 'react-accessible-treeview/dist/TreeView/utils';
import { INode } from 'react-accessible-treeview';
import SyncIcon from '@mui/icons-material/Sync';
import { RepoState } from '../../../../../redux/repoManagerReducer';
import { RootState } from '../../../../../redux/store';
import { useSelector } from 'react-redux';

interface FileIconProps {
  element: INode<IFlatMetadata>;
}

export const TreeFileIcon: React.FC<FileIconProps> = ({ element }) => {
  const {
    menuAnchorEl,
    handleOpenMenu,
    handleCloseMenu,
    onDelete,
    onRename,
    onCopy,
    onPaste,
  } = useContextMenu();
  const { fileState }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      onContextMenu={(e) => {
        e.stopPropagation();
        handleOpenMenu(e, element);
      }}
    >
      {element.id === fileState.selectedCourse?.basePath && (
        <Tooltip title="Current Course" arrow>
          <SyncIcon sx={{ color: 'green', fontSize: 15 }} />
        </Tooltip>
      )}

      <p>{element.name}</p>
      <FileType filename={element.name} />

      {/* Reused Context Menu */}
      <FileContextMenu
        anchorEl={menuAnchorEl}
        onClose={handleCloseMenu}
        element={element}
        onDelete={onDelete}
        onRename={onRename}
        onCopy={onCopy}
        onPaste={onPaste}
      />
    </Box>
  );
};

export const FileType = ({ filename }: { filename: string }) => {
  const extension = filename.slice(filename.lastIndexOf('.') + 1);
  switch (extension) {
    case 'js':
      return <Javascript />;
    case 'css':
      return <Css />;
    case 'json':
      return <FormatListBulleted />;

    default:
      return null;
  }
};
