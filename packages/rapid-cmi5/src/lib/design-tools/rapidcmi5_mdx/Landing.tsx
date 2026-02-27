import '@mdxeditor/editor/style.css';

/**MUI */
import {
  alpha,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { ButtonOptions, ButtonMinorUi, RowAction } from '@rapid-cmi5/ui';

/** Data */
import { LessonDrawer } from './drawers/LessonDrawer';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { NavViewMenu } from './menu/NavViewMenu';
import { useDispatch, useSelector } from 'react-redux';
import {
  changeViewMode,
  currentViewMode,
} from '../../redux/courseBuilderReducer';
import { ViewModeEnum } from '../course-builder/CourseBuilderTypes';

import { FileDrawer } from './drawers/FileDrawer';
import RC5FileEditor from './editors/RC5FileEditor';
import RC5VisualEditor from './editors/RC5VisualEditor';
import RC5GitEditor from './editors/RC5GitEditor';
import { GitDrawer } from './drawers/GitDrawer';
import { SlideMenu } from './menu/ArchiveSlideMenu';
import { dividerColor } from '@rapid-cmi5/ui';
import WelcomePage from './ProjectSelection/SelectProject';
import React, { useContext, useEffect, useMemo } from 'react';
import OptionCard from './ProjectSelection/Components/OptionCard';
import { GitContext } from '../course-builder/GitViewer/session/GitContext';

/**
 * Icons
 */

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRC5Prompts } from './modals/useRC5Prompts';
import { listItemProps } from './drawers/components/LessonTreeNode';
import { getSvgStyleIcon, StyleIconTypeEnum } from './styles/styleSvgConstants';

enum RepoActionEnum {
  Config,
  Delete,
}

/**
 * RapidCMI5 Course Editor Landing
 * View has menu to navigate 3 views
 *
 * @returns
 */
export function Landing({ showHomeButton }: { showHomeButton?: boolean }) {
  const viewMode = useSelector(currentViewMode);
  const themedDividerColor = useSelector(dividerColor);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changeViewMode(ViewModeEnum.RepoSelector));
  }, []);
  const { currentRepo } = useContext(GitContext);
  const { promptDeleteRepo, promptGitConfig } = useRC5Prompts();

  const theme = useTheme();

  const gitIcon = useMemo(() => {
    return getSvgStyleIcon(StyleIconTypeEnum.GIT, {
      color: theme.palette.primary.main,
      fontSize: 'inherit',
    });
  }, [theme.palette.primary.main]);

  /**
   * context menu for course
   */
  const repoActions = [
    {
      tooltip: 'Project Settings',
      icon: <Box sx={{ marginTop: 1 }}> {gitIcon}</Box>,
    },
    {
      tooltip: 'Delete Project',
      icon: <DeleteForeverIcon color="inherit" />,
    },
  ];

  const onRepoContextAction = (event: any, whichAction: number) => {
    if (!currentRepo) {
      return;
    }

    switch (whichAction) {
      case RepoActionEnum.Delete:
        promptDeleteRepo(currentRepo);
        break;
      case RepoActionEnum.Config:
        promptGitConfig();
        break;
    }
  };

  return (
    <>
      {viewMode === ViewModeEnum.RepoSelector ? (
        <WelcomePage
          setRepoSelected={() => {
            dispatch(changeViewMode(ViewModeEnum.Designer));
          }}
        />
      ) : (
        <Stack
          direction="column"
          sx={{
            width: '100%',
            height: '100%',
            minHeight: 0,
          }}
        >
          <Stack
            direction="row"
            sx={{
              width: '100%',
              height: '100%',
              minHeight: 0,
            }}
          >
            <NavViewMenu showHomeButton={showHomeButton} />
            <Divider orientation="vertical" />
            <PanelGroup direction="horizontal">
              <Panel defaultSize={26} minSize={10}>
                <Stack
                  direction="row"
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    background: alpha(theme.palette.primary.main, 0.15),
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <ListItemText
                    primary={currentRepo}
                    sx={{
                      padding: 2,
                      margin: 0,
                      flex: 1,
                      fontFamily: '"IBM Plex Sans", sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      letterSpacing: '0.01em',
                    }}
                  />
                  <Stack direction="row" sx={{ marginRight: 2 }}>
                    <ButtonOptions
                      optionButton={(handleClick: any, tooltip: string) => {
                        return (
                          <Box
                            sx={{
                              height: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                            }}
                          >
                            <IconButton
                              aria-label="options-menu"
                              disabled={!currentRepo}
                              sx={{
                                color: 'primary',
                                maxHeight: '30px',
                                margin: 'auto',
                              }}
                              onClick={handleClick}
                            >
                              <SettingsIcon
                                fontSize="inherit"
                                color="inherit"
                              />
                            </IconButton>
                          </Box>
                        );
                      }}
                      closeOnClick={true}
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
                        {repoActions.map((option: RowAction, index: number) => (
                          // eslint-disable-next-line react/jsx-no-useless-fragment
                          <React.Fragment key={option.tooltip}>
                            {!option.hidden && (
                              <>
                                {index > 0 && <Divider />}
                                <ListItemButton
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
                {viewMode === ViewModeEnum.Designer && <LessonDrawer />}
                {viewMode === ViewModeEnum.CodeEditor && <FileDrawer />}
                {viewMode === ViewModeEnum.GitEditor && <GitDrawer />}
              </Panel>

              <PanelResizeHandle
                style={{
                  backgroundColor: themedDividerColor,
                  width: 4,
                }}
              />
              <Panel>
                {viewMode === ViewModeEnum.Designer && <RC5VisualEditor />}
                {viewMode === ViewModeEnum.CodeEditor && <RC5FileEditor />}
                {viewMode === ViewModeEnum.GitEditor && <RC5GitEditor />}
              </Panel>
            </PanelGroup>
          </Stack>
        </Stack>
      )}
    </>
  );
}

export default Landing;
