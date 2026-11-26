import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Stack, Tabs, Typography, useTheme } from '@mui/material';
import { RepoState } from '../../../redux/repoManagerReducer';
import { RootState } from '../../../redux/store';

import { TabMainUi } from '@rapid-cmi5/ui';

import {
  gitViewCurrentTab,
  setGitViewCurrentTab,
} from '../../../redux/courseBuilderReducer';
import { GitCompareArrows } from 'lucide-react';
import BranchSelector from '../../course-builder/selectors/BranchSelector';
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

  const { handleCheckoutBranch, gettingRepoStatus, isGitLoaded, isInMerge } =
    useContext(GitContext);
  const [switching, setSwitching] = useState(false);
  const [branchError, setBranchError] = useState('');
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
  const currentTab = useSelector(gitViewCurrentTab);
  const currentTheme = useTheme();
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
      <Stack direction="column">
        <Stack
          direction="row"
          spacing={1}
          sx={{
            marginTop: '4px',
            marginBottom: 1,
          }}
        >
          <GitCompareArrows
            color={currentTheme.button.iconColor}
            strokeWidth={1.15}
          />
          <BranchSelector
            currentBranch={currentBranch ?? undefined}
            availableBranches={allBranches}
            disabled={
              switching || gettingRepoStatus || !isGitLoaded || isInMerge
            }
            styleProps={{ flex: 1, minWidth: 0 }}
            onSelect={selectBranch}
          />
        </Stack>
      </Stack>
      {branchError && (
        <Alert severity="error" onClose={() => setBranchError('')}>
          {branchError}
        </Alert>
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
