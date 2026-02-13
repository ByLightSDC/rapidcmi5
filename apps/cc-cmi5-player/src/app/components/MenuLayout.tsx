/* eslint-disable react/jsx-no-useless-fragment */
import { DRAWER_WIDTH } from './ContentLayout';
import TabPanel from './TabPanel';
import Drawer from '@mui/material/Drawer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import ReorderIcon from '@mui/icons-material/Reorder';

/** Icons */
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import { Box, Switch, Tooltip, Typography, useTheme } from '@mui/material';
import { classIdSel, studentIdSel } from '../redux/auReducer';
import { useDispatch, useSelector } from 'react-redux';
import { cmi5Instance } from '../session/cmi5';

import { classChangeModalId } from './CourseModals';
import RC5Player from './player/RC5Player';

import ScenarioWrapper from './scenario/ScenarioWrapper';
import { TeamScenarioContextProvider } from './team-consoles/TeamScenarioContext';
import { useCMI5Session } from '../hooks/useCMI5Session';
import {
  ButtonInfoField,
  ButtonInfoFormHeaderLayout,
  ButtonMainUi,
  config,
  dividerColor,
  setDividerColor,
  setIconColor,
  setModal,
  setTheme,
  themeColor,
} from '@rapid-cmi5/ui';
import { CustomTheme } from '../styles/createPalette';

/**
 * The main slide content.
 * Renders a layout with a collapsable menu on the left, and slide content on
 * the right.
 */
export default function MenuLayout() {
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(true);
  const [isSplitPanelShown, setIsSplitPanelShown] = useState(false);
  const currentTheme: CustomTheme = useTheme();
  const dispatch = useDispatch();
  const classId = useSelector(classIdSel);
  const studentId = useSelector(studentIdSel);
  const themedDividerColor = useSelector(dividerColor);
  const theColor = useSelector(themeColor);
  const muiTheme = useTheme();
  const { palette } = muiTheme;

  const [password, setPassword] = useState('');
  const [clearUserName, setCleanUserName] = useState('');
  const slideRef = useRef<HTMLDivElement>(null);

  const userName = cmi5Instance.getLaunchParameters().actor?.account?.name;
  const regId = cmi5Instance.getLaunchParameters().registration;

  const featureFlagChangeClassRoom = false;

  useCMI5Session();

  const getStrippedUserName = useCallback((inputName: string) => {
    const pcteCharindex = inputName.indexOf('@pcte.mil');

    if (pcteCharindex >= 0) {
      const cleanName = inputName.substring(0, pcteCharindex);
      setCleanUserName(cleanName);
      setPassword(`${cleanName}!`);
    } else {
      setCleanUserName(inputName);
      setPassword('');
    }
  }, []);

  useEffect(() => {
    if (userName) {
      getStrippedUserName(userName);
    }
  }, [userName, getStrippedUserName]);

  const handleMenuDrawerOpen = () => {
    setIsMenuDrawerOpen(true);
  };

  const handleMenuDrawerClose = () => {
    setIsMenuDrawerOpen(false);
  };

  const handleDividerOn = () => {
    setIsSplitPanelShown(true);

    // if the drawer is still open, close it
    if (isMenuDrawerOpen) {
      handleMenuDrawerClose();
    }
  };

  const handleDividerOff = () => {
    setIsSplitPanelShown(false);

    // if the drawer is still closed, open it
    if (!isMenuDrawerOpen) {
      handleMenuDrawerOpen();
    }
  };

  useEffect(() => {
    if (currentTheme) {
      const iconColor = currentTheme.button.iconColor;
      const dividerColor = currentTheme.input.outlineColor;
      dispatch(setIconColor(iconColor));
      dispatch(setDividerColor(dividerColor || 'grey'));
    }
  }, [currentTheme, dispatch]);

  return (
    <>
      <Drawer
        sx={{
          width: isMenuDrawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            backgroundColor: 'background.default',
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={isMenuDrawerOpen}
      >
        <div>
          <TabPanel />
        </div>
      </Drawer>

      <PanelGroup direction="horizontal">
        <Panel defaultSize={45} minSize={5}>
          <Box
            ref={slideRef}
            sx={{
              //presentation background color
              backgroundColor: palette.background.paper,
              height: '100%',
              width: '100%',
              overflow: 'auto',
            }}
          >
            <Stack
              direction="row"
              sx={{
                position: 'absolute',
                zIndex: (theme) => theme.zIndex.appBar + 1,
                //backgroundColor: leave blank so it matches presentation background
              }}
            >
              <IconButton
                tabIndex={-1}
                aria-label="split"
                size={'small'}
                color="primary"
                onClick={() => {
                  if (isMenuDrawerOpen) {
                    handleMenuDrawerClose();
                  } else {
                    handleMenuDrawerOpen();
                  }
                }}
              >
                {isMenuDrawerOpen ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
              </IconButton>

              <IconButton
                tabIndex={-1}
                aria-label="split"
                color="primary"
                disabled={isSplitPanelShown}
                onClick={() => {
                  if (isSplitPanelShown) {
                    handleDividerOff();
                  } else {
                    handleDividerOn();
                  }
                }}
              >
                <VerticalSplitIcon />
              </IconButton>

              <IconButton
                aria-label="split"
                color="primary"
                disabled={!isSplitPanelShown}
                onClick={() => {
                  if (isSplitPanelShown) {
                    handleDividerOff();
                  } else {
                    handleDividerOn();
                  }
                }}
              >
                <ReorderIcon />
              </IconButton>
              <Switch
                checked={theColor === 'dark'}
                icon={
                  <LightModeIcon
                    color="primary"
                    fontSize="small"
                    sx={{
                      backgroundColor: 'background.default',
                      borderRadius: '12px',
                      borderStyle: 1,
                    }}
                  />
                }
                checkedIcon={
                  <DarkModeIcon
                    color="primary"
                    fontSize="small"
                    sx={{
                      backgroundColor: 'background.default',
                      borderRadius: '12px',
                      borderStyle: 1,
                    }}
                  />
                }
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  if (event.target.checked) {
                    dispatch(setTheme('dark'));
                    return;
                  }
                  dispatch(setTheme('light'));
                }}
              />
              {featureFlagChangeClassRoom && (
                <ButtonInfoField
                  alertSxProps={{
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    borderColor: (theme: CustomTheme) => `${theme.input.outlineColor}`,
                    color: 'white',
                  }}
                  infoIcon={<AccountCircleIcon fontSize="inherit" color="primary" />}
                  name="account-info-icon"
                  message={
                    <Stack
                      direction="column"
                      sx={{
                        display: 'flex',
                        marginLeft: '8px',
                      }}
                    >
                      {studentId && <Typography variant="caption">Student Id: {studentId}</Typography>}
                      <Typography variant="caption">Registration Id: {regId}</Typography>
                      {classId && <Typography variant="caption">Class Id: {classId}</Typography>}
                      <Typography variant="caption">
                        User Name:
                        {clearUserName}
                      </Typography>
                      {password && (
                        <Typography variant="caption">
                          Password:
                          {password}
                        </Typography>
                      )}
                      {classId && (
                        <div>
                          <ButtonMainUi
                            startIcon={<AssignmentIndIcon />}
                            onClick={() => {
                              dispatch(
                                setModal({
                                  type: classChangeModalId,
                                  id: '',
                                  name: '',
                                }),
                              );
                            }}
                          >
                            Change ClassRoom
                          </ButtonMainUi>
                        </div>
                      )}
                    </Stack>
                  }
                  props={{ sx: ButtonInfoFormHeaderLayout }}
                  triggerOnClick={true}
                />
              )}

              {!featureFlagChangeClassRoom && (
                <IconButton aria-label="split" color="primary">
                  <Tooltip
                    arrow
                    enterDelay={500}
                    enterNextDelay={500}
                    sx={{ maxWidth: '480px' }}
                    title={
                      <Stack
                        direction="column"
                        sx={{
                          display: 'flex',
                        }}
                      >
                        {studentId && <Typography variant="caption">Student Id:{studentId}</Typography>}
                        <Typography variant="caption">Registration Id:{regId}</Typography>
                        {classId && <Typography variant="caption">Class Id:{classId}</Typography>}
                        <Typography variant="caption">
                          User Name:
                          {clearUserName}
                        </Typography>
                        {password && (
                          <Typography variant="caption">
                            Password:
                            {password}
                          </Typography>
                        )}
                      </Stack>
                    }
                    placement="bottom"
                  >
                    <AccountCircleIcon />
                  </Tooltip>
                </IconButton>
              )}
            </Stack>

            <>
              {!config.CMI5_SSO_ENABLED && (
                <ScenarioWrapper>
                  <RC5Player />
                </ScenarioWrapper>
              )}
              {config.CMI5_SSO_ENABLED && (
                <TeamScenarioContextProvider isEnabled={true}>
                  <RC5Player />
                </TeamScenarioContextProvider>
              )}
            </>
          </Box>
        </Panel>
        {isSplitPanelShown && (
          <>
            <PanelResizeHandle
              style={{
                width: 4,
                backgroundColor: themedDividerColor,
              }}
            />
            <Panel></Panel>
          </>
        )}
      </PanelGroup>
    </>
  );
}
