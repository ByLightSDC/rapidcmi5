import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  AlertTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tabs,
  Typography,
} from '@mui/material';
import { RepoState } from '../../../redux/repoManagerReducer';
import { RootState } from '../../../redux/store';

import { RowAction, TabMainUi } from '@rapid-cmi5/ui';

import { useMDStyleIcons } from '../styles/useMDStyleIcons';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';

import {
  gitViewCurrentTab,
  setGitViewCurrentTab,
} from '../../../redux/courseBuilderReducer';

/* Icons */
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SettingsIcon from '@mui/icons-material/Settings';

import { useRC5Prompts } from '../modals/useRC5Prompts';
import React from 'react';
import { listItemProps } from './components/LessonTreeNode';
import { Renamer } from './components/Renamer';
import { ButtonOptions, ButtonMinorUi } from '@rapid-cmi5/ui';

enum RepoActionEnum {
  // TriggerRename,
  // Rename,
  Delete,
  Config,
}

/**
 * context menu for course
 */
const repoActions = [
  // {
  //   tooltip: 'Rename Repository',
  //   icon: <EditIcon color="inherit" />,
  //   hidden: true, // hidden for showing the edit field to rename course
  // },
  // {
  //   tooltip: 'Rename Repository',
  //   icon: <EditIcon color="inherit" />,
  // },
  {
    tooltip: 'Delete Local Repository',
    icon: <DeleteForeverIcon color="inherit" />,
  },
  {
    tooltip: 'Config Settings',
    icon: <SettingsIcon color="inherit" />,
  },
];

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
  const { promptDeleteRepo } = useRC5Prompts();
  const { isRepoConnectedToRemote, handleChangeRepoName, currentRepo } =
    useContext(GitContext);
  const { gitIcon } = useMDStyleIcons();

  const currentTab = useSelector(gitViewCurrentTab);

  const { promptAttachRemoteRepo, promptGitConfig } = useRC5Prompts();

  // const [menuAnchor, setMenuAnchor] = useState<any>(null);
  // const [menuAnchorPos, setMenuAnchorPos] = useState<number[]>([0, 0]);

  // const handleCancelNameChange = () => {
  //   setMenuAnchor(null);
  // };

  // const updateRepositoryName = (newName: string, record: any) => {
  //   handleChangeRepoName(newName);
  // };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    dispatch(setGitViewCurrentTab(newValue));
  };

  const onRepoContextAction = (event: any, whichAction: number) => {
    if (!currentRepo) {
      return;
    }

    switch (whichAction) {
      case RepoActionEnum.Delete:
        promptDeleteRepo(currentRepo);
        break;
      // case RepoActionEnum.Rename:
      //   setMenuAnchor(event.target);

      //   break;
      // case RepoActionEnum.TriggerRename:
      //   setMenuAnchorPos([event.clientX - 60, event.clientY + 20]);
      //   break;
      case RepoActionEnum.Config:
        promptGitConfig();
        break;
    }
  };

  return (
    <Stack
      direction="column"
      sx={{
        backgroundColor: 'background.default',
        height: '100%',
        padding: '12px',
        overflowY: 'auto',
      }}
      spacing={2}
    >
      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
        VERSION CONTROL
      </Typography>
      <Stack
        direction="row"
        sx={{
          display: 'flex',
          alignContent: 'center',
          marginBottom: '12px',
          width: '100%',
        }}
      >
        {/* <BranchSelector
          currentBranch={currentBranch || undefined}
          availableBranches={allBranches}
          disabled={!allBranches || allBranches?.length === 0}
          //RED onAction={promptCloneRepo}
          onSelect={handleCheckoutBranch}
        /> */}
        <Typography>{currentRepo}</Typography>
        <div style={{ flexGrow: 1 }} />
        <Stack direction="row">
          <ButtonOptions
            optionButton={(handleClick: any, tooltip: string) => {
              return (
                <IconButton
                  aria-label="options-menu"
                  className="nodrag"
                  disabled={!currentRepo}
                  sx={{
                    color: 'primary',
                    maxHeight: '30px',
                  }}
                  onClick={handleClick}
                >
                  <MoreVertIcon fontSize="inherit" color="inherit" />
                </IconButton>
              );
            }}
            closeOnClick={true}
            // onTrigger={(event?: any) => {
            //   onRepoContextAction(event, RepoActionEnum.TriggerRename);
            // }}
          >
            <List
              sx={{
                backgroundColor: (theme: any) => `${theme.nav.fill}`,
                color: (theme: any) => `${theme.nav.icon}`,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: 'auto',
              }}
              component="nav"
            >
              <Typography
                sx={{ ml: 3, pl: 3 }}
                data-testid="current-repo-name"
                variant="caption"
              >
                {currentRepo}...
              </Typography>
              {repoActions.map((option: RowAction, index: number) => (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <React.Fragment key={option.tooltip}>
                  {!option.hidden && (
                    <>
                      {index > 0 && <Divider />}
                      <ListItemButton
                        sx={{
                          height: 30,
                        }}
                        onClick={(event) => {
                          onRepoContextAction(event, index);
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            padding: '0px',
                            margin: '0px',
                            marginRight: '2px',
                            minWidth: '0px',
                          }}
                        >
                          {option.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={option.tooltip}
                          slotProps={{ primary: listItemProps }}
                        />
                      </ListItemButton>
                    </>
                  )}
                </React.Fragment>
              ))}
            </List>
          </ButtonOptions>
        </Stack>
      </Stack>

      {!isRepoConnectedToRemote && (
        <Alert severity="warning" sx={{ lineHeight: 1, padding: 1 }}>
          <AlertTitle sx={{ lineHeight: 1, fontWeight: 'bold' }}>
            No Repository Connected
          </AlertTitle>
          <Stack direction="column">
            It is highly recommended that you use Version Control to back up
            your work!
            <ButtonMinorUi
              sx={{ marginTop: 1, paddingRight: 1 }}
              color="warning"
              startIcon={<AddIcon />}
              onClick={promptAttachRemoteRepo}
            >
              Add Remote
            </ButtonMinorUi>
          </Stack>
        </Alert>
      )}

      {isRepoConnectedToRemote && (
        <Stack direction="column">
          <Stack
            direction="row"
            spacing={1}
            sx={{
              marginTop: '4px',
            }}
          >
            {gitIcon}
            <Typography>Branch</Typography>
          </Stack>
          <Typography>{currentBranch}</Typography>
        </Stack>
      )}
      <Tabs
        orientation="vertical"
        sx={{ marginTop: '12px' }}
        value={currentTab}
        onChange={handleTabChange}
      >
        <TabMainUi label="File Status" style={{ marginBottom: '8px' }} />
        <TabMainUi label="Commit History" style={{ marginBottom: '8px' }} />
        {/* <TabMainUi label="Stashes" style={{ marginBottom: '8px' }} /> */}
      </Tabs>

      {/* {menuAnchor && (
        <Renamer
          anchor={menuAnchor}
          anchorPos={menuAnchorPos}
          element={{
            id: '',
            name: currentRepo || '',
            parent: '',
            children: [],
          }}
          onClose={handleCancelNameChange}
          onSave={updateRepositoryName}
        />
      )} */}
    </Stack>
  );
};
