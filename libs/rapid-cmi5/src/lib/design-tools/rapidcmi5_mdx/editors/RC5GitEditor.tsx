import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import {
  currentFsTypeSel,
  setCurrentWorkingDir,
} from '../../../redux/repoManagerReducer';

/* MUI */
import {
  Badge,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { Stack } from '@mui/system';

/* Icons **/
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SettingsIcon from '@mui/icons-material/Settings';
import SpokeIcon from '@mui/icons-material/Spoke';

import { GitContext } from '../../course-builder/GitViewer/session/GitContext';
import DeleteRepoButton from '../../course-builder/GitViewer/Components/GitActions/DeleteRepoButton';

import { iconButtonStyle, tooltipStyle } from '../styles/styles';

import GitLogs from '../../course-builder/GitViewer/Components/GitActions/GitLogs';
import { gitViewCurrentTab } from '../../../redux/courseBuilderReducer';
import GitFileStatus from '../../course-builder/GitViewer/Components/GitActions/GitFileStatus';
import { useRC5Prompts } from '../modals/useRC5Prompts';
import FileSystemLoader from './components/FileSystemLoader';
import { useToaster, ButtonMinorUi } from '@rapid-cmi5/ui/api/hooks';

/**
 * Rapid CMI5 Git Editor
 * @returns
 */
export default function RC5GitEditor({ top = '0px' }: { top?: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const displayToaster = useToaster();
  const currentTab = useSelector(gitViewCurrentTab);
  const currentFsType = useSelector(currentFsTypeSel);

  const {
    handleStageAll,
    handleUnstageAll,
    modifiedFiles,
    stashFiles,
    canPop,
    canStash,
    canPush,
    canCommit,
    gitRepoCommits,
    handleGitStashChanges,
    handleGitStashPopChanges,
    unpushedCommits,
    isRepoConnectedToRemote,
    handleStageFile,
    handleUnStageFile,
    handleRevertFile,
    handleRemoveFile,
    numStaged,
    handleGetDiff,
    handleResolveMerge,
    isInMerge,
    handleNavToFile,
    currentRepo,
    isFsLoaded,
    isGitLoaded,
  } = useContext(GitContext);

  const {
    promptCommit,
    promptPull,
    promptPush,
    promptGitConfig,
    promptRevertToCommit,
  } = useRC5Prompts();

  //@Aaron these should move to git context
  const handeGitStash = async () => {
    try {
      await handleGitStashChanges();
      displayToaster({
        autoHideDuration: 5000,
        message: 'Changes have been stashed',
        severity: 'success',
      });
    } catch (error: any) {
      displayToaster({
        autoHideDuration: 8000,
        message: error.message,
        severity: 'error',
      });
      return;
    }
  };

  const handeGitStashPop = async () => {
    try {
      await handleGitStashPopChanges();
      displayToaster({
        autoHideDuration: 5000,
        message: 'Changes have been popped from stash',
        severity: 'success',
      });
    } catch (error: any) {
      displayToaster({
        autoHideDuration: 8000,
        message: error.message,
        severity: 'error',
      });
      return;
    }
  };

  const handeGitResetFile = async (filepath: string) => {
    try {
      await handleRevertFile(filepath);
      displayToaster({
        autoHideDuration: 5000,
        message: `${filepath} has been reverted`,
        severity: 'success',
      });
    } catch (error: any) {
      displayToaster({
        autoHideDuration: 8000,
        message: error.message,
        severity: 'error',
      });
      return;
    }
  };

  const handleResetToCommitHash = async (commitHash: string) => {
    try {
      if (!currentRepo) {
        throw new Error('No repo selected');
      }
      promptRevertToCommit(currentRepo, commitHash);
    } catch (error: any) {
      return;
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        width: '100%',
        height: '100%',
        padding: '12px',
        overflowY: 'auto',
        position: 'relative', // Important for absolute positioning of loader
      }}
    >
      {/* File System Loader Overlay */}
      <FileSystemLoader
        isFileSystemLoaded={isFsLoaded}
        isGitLoaded={isGitLoaded}
        currentFsType={currentFsType}
      />

      {currentRepo && (
        <Box
          data-testid='git-editor'
          sx={{
            marginTop: '12px',
            height: 'auto',
            pointerEvents: isFsLoaded ? 'auto' : 'none',
            opacity: isFsLoaded ? 1 : 0.5,
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              dispatch(setCurrentWorkingDir('/'));
            }
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{
              width: '100%',
              display: 'flex',
              alignContent: 'center',
              marginTop: '12px',
            }}
          >
            <Stack direction="row" sx={{ position: 'relative' }}>
              {isInMerge ? (
                <ButtonMinorUi
                  onClick={() => handleResolveMerge()}
                  disabled={!canCommit || !isFsLoaded}
                  startIcon=<AddIcon />
                >
                  Merge Changes
                </ButtonMinorUi>
              ) : (
                <ButtonMinorUi
                  disabled={!canCommit || !isFsLoaded}
                  onClick={promptCommit}
                  startIcon=<AddIcon />
                >
                  Commit Changes
                </ButtonMinorUi>
              )}

              <Badge
                sx={{
                  position: 'absolute',
                  right: 0,
                }}
                badgeContent={numStaged}
                slotProps={{
                  badge: {
                    sx: {
                      color: 'common.white',
                      bgcolor: 'success.main',
                      borderRadius: 1,
                    },
                  },
                }}
              />
            </Stack>

            <Stack direction="row" sx={{ position: 'relative' }}>
              <ButtonMinorUi
                startIcon=<ArrowUpwardIcon />
                disabled={!canPush || !isRepoConnectedToRemote || !isFsLoaded}
                onClick={promptPush}
              >
                Push to Remote
              </ButtonMinorUi>
              <Badge
                sx={{
                  position: 'absolute',
                  right: 0,
                }}
                badgeContent={unpushedCommits}
                slotProps={{
                  badge: {
                    sx: {
                      color: 'common.white',
                      bgcolor: 'primary.main',
                    },
                  },
                }}
              />
            </Stack>
            <ButtonMinorUi
              startIcon=<ArrowDownwardIcon />
              disabled={!isRepoConnectedToRemote || !isFsLoaded}
              onClick={promptPull}
            >
              Pull from Remote
            </ButtonMinorUi>

            <ButtonMinorUi
              disabled={!canStash || !isFsLoaded}
              onClick={handeGitStash}
              startIcon=<SpokeIcon />
            >
              Stash Changes
            </ButtonMinorUi>

            <Stack
              direction="row"
              sx={{
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              {/* <ButtonMinorUi onClick={promptPublishPcteModal}>
                Publish
              </ButtonMinorUi>
              <PublishPcteDialogs /> */}
              <IconButton
                aria-label="design-view"
                color="primary"
                style={iconButtonStyle}
                onClick={() => promptGitConfig()}
                disabled={!isFsLoaded}
              >
                <Tooltip arrow title={`Settings`} {...tooltipStyle}>
                  <SettingsIcon color="inherit" />
                </Tooltip>
              </IconButton>
              <DeleteRepoButton isButtonStyleMinimized={true} />
            </Stack>
          </Stack>

          {currentTab === 0 && (
            <GitFileStatus
              modifiedFiles={modifiedFiles}
              handleStageAll={() => handleStageAll(true)}
              handleUnstageAll={handleUnstageAll}
              handeleStageFile={handleStageFile}
              handeleUnStageFile={handleUnStageFile}
              handleRevertFile={handeGitResetFile}
              handleRemoveFile={handleRemoveFile}
              handleGetDiff={handleGetDiff}
              handleNavToFile={handleNavToFile}
            />
          )}
          {currentTab === 1 && (
            <GitLogs
              gitRepoCommits={gitRepoCommits}
              onGitReset={handleResetToCommitHash}
            />
          )}
          {currentTab === 2 && (
            <>
              <Divider sx={{ marginTop: '24px' }} />
              <Stack
                direction="row"
                spacing={2}
                sx={{ marginLeft: '12px', marginTop: '24px' }}
              >
                {!canPop && (
                  <Typography align="center">No stashes found</Typography>
                )}
                {canPop && (
                  <>
                    <Typography align="center" sx={{ paddingTop: '0px' }}>
                      1 stash found
                    </Typography>
                    <ButtonMinorUi
                      onClick={handeGitStashPop}
                      disabled={!isFsLoaded}
                    >
                      Apply Stash
                    </ButtonMinorUi>
                  </>
                )}
              </Stack>
              {canPop && (
                <GitFileStatus
                  modifiedFiles={stashFiles}
                  handleGetDiff={handleGetDiff}
                />
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
