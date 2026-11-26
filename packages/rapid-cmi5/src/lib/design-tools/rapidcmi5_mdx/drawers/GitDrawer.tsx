import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Stack, Tabs, Typography } from '@mui/material';
import { RepoState } from '../../../redux/repoManagerReducer';
import { RootState } from '../../../redux/store';

import { TabMainUi } from '@rapid-cmi5/ui';

import {
  gitViewCurrentTab,
  setGitViewCurrentTab,
} from '../../../redux/courseBuilderReducer';
import { DrawerAddButton } from './components/DrawerAddButton';
import BranchSelector from '../../course-builder/selectors/BranchSelector';
import { CreateBranchDialog } from '../../course-builder/modals/git/CreateBranchDialog';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';

/**
 * Drawer for GIT view
 * Displays tabs for viewing Pending file changes, Commit History, and Stashes
 * @returns
 */
export const GitDrawer = () => {
  const dispatch = useDispatch();
  const { currentBranch, allBranches }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );

  const {
    handleCheckoutBranch,
    handleCreateBranch,
    gettingRepoStatus,
    isGitLoaded,
    isInMerge,
  } = useContext(GitContext);
  const [switching, setSwitching] = useState(false);
  const [branchError, setBranchError] = useState('');
  const [creatingBranch, setCreatingBranch] = useState(false);
  const selectBranch = async (branch: string) => {
    setSwitching(true);
    setBranchError('');
    try {
      await handleCheckoutBranch(branch);
    } catch (error) {
      setBranchError(error instanceof Error ? error.message : String(error));
    } finally {
      setSwitching(false);
    }
  };
  const branchControlsDisabled =
    switching ||
    gettingRepoStatus ||
    !isGitLoaded ||
    isInMerge ||
    !currentBranch ||
    allBranches.length === 0;
  const currentTab = useSelector(gitViewCurrentTab);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    dispatch(setGitViewCurrentTab(newValue));
  };

  return (
    <Stack
      direction="column"
      sx={{
        backgroundColor: 'background.default',
        height: '100%',
        padding: 1,
        overflowY: 'auto',
      }}
      spacing={0}
    >
      <Typography
        variant="caption"
        sx={{
          fontFamily: '"IBM Plex Sans", sans-serif',
          fontWeight: 'bold',
          marginTop: 0.5,
        }}
      >
        VERSION CONTROL
      </Typography>
      <Stack
        direction="row"
        sx={{
          justifyContent: 'flex-start',
          minWidth: '100px',
          marginTop: '4px',
          marginBottom: 1,
          gap: 0.5,
        }}
      >
        <BranchSelector
          currentBranch={currentBranch ?? undefined}
          availableBranches={allBranches}
          disabled={branchControlsDisabled}
          onSelect={selectBranch}
        />
        <DrawerAddButton
          label="Create Branch"
          id="create-branch-button"
          disabled={branchControlsDisabled}
          onClick={() => setCreatingBranch(true)}
        />
      </Stack>
      {branchError && (
        <Alert severity="error" onClose={() => setBranchError('')}>
          {branchError}
        </Alert>
      )}
      {creatingBranch && currentBranch && (
        <CreateBranchDialog
          currentBranch={currentBranch}
          branches={allBranches}
          onCreate={handleCreateBranch}
          onClose={() => setCreatingBranch(false)}
        />
      )}
      <Tabs
        orientation="vertical"
        aria-label="Git Tabs"
        sx={{ marginTop: '12px' }}
        value={currentTab}
        onChange={handleTabChange}
      >
        <TabMainUi label="File Status" style={{ marginBottom: '8px' }} />
        <TabMainUi label="Commit History" style={{ marginBottom: '8px' }} />
        {/*REF <TabMainUi label="Stashes" style={{ marginBottom: '8px' }} /> */}
      </Tabs>
    </Stack>
  );
};
