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

import {
  RowAction,
  TabMainUi,
} from '@rangeos-nx/ui/branded';

import { useMDStyleIcons } from '../styles/useMDStyleIcons';
import RepositorySelector from '../../course-builder/selectors/RepositorySelector';
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

import { useRC5Prompts } from '../modals/useRC5Prompts';
import React from 'react';
import { listItemProps } from './components/LessonTreeNode';
import { Renamer } from './components/Renamer';
import FileSystemSelector from '../../course-builder/selectors/FileSystemSelector';
import { ButtonOptions, ButtonMinorUi } from '@rangeos-nx/ui/api/hooks';

enum RepoActionEnum {
  TriggerRename,
  Rename,
  Delete,
}

/**
 * context menu for course
 */
const repoActions = [
  {
    tooltip: 'Rename Repository',
    icon: <EditIcon color="inherit" />,
    hidden: true, // hidden for showing the edit field to rename course
  },
  {
    tooltip: 'Rename Repository',
    icon: <EditIcon color="inherit" />,
  },
  {
    tooltip: 'Delete Local Repository',
    icon: <DeleteForeverIcon color="inherit" />,
  },
];

/**
 * Drawer for GIT view
 * Displays tabs for viewing Pending file changes, Commit History, and Stashes
 * @returns
 */
export const GitDrawer = () => {
  const dispatch = useDispatch();
  const { availableRepos, currentBranch, fileSystemType }: RepoState =
    useSelector((state: RootState) => state.repoManager);
  const { promptDeleteRepo } = useRC5Prompts();
  const {
    handleChangeRepo,
    isRepoConnectedToRemote,
    handleNavToGitView,
    handleChangeRepoName,
    handleChangeFileSystem,
    currentRepo,
    isElectron,
  } = useContext(GitContext);
  const { gitIcon } = useMDStyleIcons();

  const currentTab = useSelector(gitViewCurrentTab);

  const {
    promptAttachRemoteRepo,
    promptCloneRepo,
    promptImportRepoZip,
    promptCreateLocalRepo,
  } = useRC5Prompts();

  const [menuAnchor, setMenuAnchor] = useState<any>(null);
  const [menuAnchorPos, setMenuAnchorPos] = useState<number[]>([0, 0]);

  const handleCancelNameChange = () => {
    setMenuAnchor(null);
  };

  const updateRepositoryName = (newName: string, record: any) => {
    handleChangeRepoName(newName);
  };

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
      case RepoActionEnum.Rename:
        setMenuAnchor(event.target);

        break;
      case RepoActionEnum.TriggerRename:
        setMenuAnchorPos([event.clientX - 60, event.clientY + 20]);
        break;
    }
  };

  useEffect(() => {
    handleNavToGitView();
  }, []);

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
          //backgroundColor: 'pink',
        }}
      >
        <RepositorySelector
          currentRepo={currentRepo || undefined}
          availableRepos={availableRepos}
          disabled={!availableRepos || availableRepos?.length === 0}
          //RED onAction={promptCloneRepo}
          onSelect={handleChangeRepo}
        />
        {/* <BranchSelector
          currentBranch={currentBranch || undefined}
          availableBranches={allBranches}
          disabled={!allBranches || allBranches?.length === 0}
          //RED onAction={promptCloneRepo}
          onSelect={handleCheckoutBranch}
        /> */}
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
            onTrigger={(event?: any) => {
              onRepoContextAction(event, RepoActionEnum.TriggerRename);
            }}
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
              <Typography sx={{ marginLeft: '12px' }} variant="caption">
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

      <Stack
        direction="row"
        gap={0}
        flexWrap="wrap"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <ButtonMinorUi
          tooltip="Create a new local repository (start from scratch)"
          startIcon={<AddIcon />}
          onClick={promptCreateLocalRepo}
        >
          New
        </ButtonMinorUi>
        <ButtonMinorUi
          tooltip="Clone a remote repository containing RapidCMI5 content"
          startIcon={<AddIcon />}
          onClick={promptCloneRepo}
          data-testid="clone-repo-button"
        >
          Clone
        </ButtonMinorUi>
        <ButtonMinorUi
          tooltip="Import a RapidCMI5 repository from a zip file"
          startIcon={<AddIcon />}
          onClick={promptImportRepoZip}
        >
          Import
        </ButtonMinorUi>
      </Stack>

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
        <TabMainUi label="Stashes" style={{ marginBottom: '8px' }} />
      </Tabs>
      {!isElectron && (
        <FileSystemSelector
          currentFs={fileSystemType}
          onSelect={handleChangeFileSystem}
        />
      )}

      {menuAnchor && (
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
      )}
    </Stack>
  );
};
