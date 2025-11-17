/* MUI */
import { Box } from '@mui/material';
import ViewFile from '../../course-builder/GitViewer/Components/SelectedRepo/ViewFile';
import { currentFsTypeSel } from 'apps/rapid-cmi5-electron-frontend/src/app/redux/repoManagerReducer';
import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';
import FileSystemLoader from './components/FileSystemLoader';

/**
 * Rapid CMI5 File Editor
 * @returns
 */
export default function RC5FileEditor() {
  /**
   * UE for debugging
   */

  const currentFsType = useSelector(currentFsTypeSel);
  const { isFsLoaded, isGitLoaded } = useContext(GitContext);

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        width: '100%',
        height: '100%',
        padding: '12px',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        <FileSystemLoader
          isFileSystemLoaded={isFsLoaded}
          isGitLoaded={isGitLoaded}
          currentFsType={currentFsType}
        />

        <ViewFile />
      </Box>
    </Box>
  );
}
