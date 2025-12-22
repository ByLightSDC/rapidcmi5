import { Collapse, Stack, Tooltip, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import RepositorySelector from '../../../course-builder/selectors/RepositorySelector';
import FileSystemSelector from '../../../course-builder/selectors/FileSystemSelector';
import { fsType } from '../../../../redux/repoManagerReducer';

export default function ChangeRepoExpander({
  isExpanded,
  availableRepos,
  fileSystemType,
  currentRepo,
  handleChangeRepo,
  handleChangeFileSystem,
  isElectron,
}: {
  isExpanded: boolean;
  isElectron: boolean;
  availableRepos: string[];
  fileSystemType: fsType;
  currentRepo: string | null;
  handleChangeRepo: (name: string) => void;
  handleChangeFileSystem: (fs: fsType) => void;
}) {
  return (
    <Stack
      direction="row"
      sx={{
        margin: '12px',
        marginBottom: 0,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 1,
      }}
    >
      <Collapse in={isExpanded} orientation="vertical" sx={{ flex: 1 }}>
        <Stack direction="column" spacing={2}>
          {/* Repository Selector with Info Icon */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <RepositorySelector
              currentRepo={currentRepo || undefined}
              availableRepos={availableRepos}
              disabled={!availableRepos || availableRepos?.length === 0}
              onSelect={handleChangeRepo}
            />
            <Tooltip title="Select which repository to load or edit.">
              <IconButton size="small">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* File System Selector with Info Icon */}
          {!isElectron && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <FileSystemSelector
                currentFs={fileSystemType}
                onSelect={handleChangeFileSystem}
              />
              <Tooltip
                title="Choose the file system source — local allows you to choose a directory
              on your computer to work from, in-browser stores your data in the browser and can be erased if your
              browser data is cleared
             "
              >
                <IconButton size="small">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      </Collapse>
    </Stack>
  );
}
