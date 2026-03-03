
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Stack,
  Tabs,
  Typography,
} from '@mui/material';
import { RepoState } from '../../../redux/repoManagerReducer';
import { RootState } from '../../../redux/store';

import { TabMainUi } from '@rapid-cmi5/ui';

import { useMDStyleIcons } from '../styles/useMDStyleIcons';

import {
  gitViewCurrentTab,
  setGitViewCurrentTab,
} from '../../../redux/courseBuilderReducer';


/**
 * Drawer for GIT view
 * Displays tabs for viewing Pending file changes, Commit History, and Stashes
 * @returns
 */
export const GitDrawer = () => {
  const dispatch = useDispatch();
  const { currentBranch }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );

  const { gitIcon } = useMDStyleIcons();
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
          marginTop:.5
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
            marginBottom:1
          }}
        >
          {gitIcon}
          <Typography>{currentBranch}</Typography>
        </Stack>
      </Stack>
      <Tabs
        orientation="vertical"
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
