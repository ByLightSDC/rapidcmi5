/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
// import { useAppBreadCrumbs } from '../hooks/useAppBreadCrumbs';

import { appHeaderVisible, themeColor } from '@rapid-cmi5/ui/redux';

/* Branded */
import { AppLogo, AppHeaderDashboardMenu } from '@rapid-cmi5/ui/branded';

/* MUI */
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

/* Icons */
import LogoffIcon from '@mui/icons-material/PowerSettingsNew';
import SettingsIcon from '@mui/icons-material/Settings';

import UserInfoBox from './navbar/UserInfoBox';

import { BuildVersionInfo } from '@rapid-cmi5/frontend/clients/devops-api';

/* Layout Notes
height is determined by the toggle icon size in the Navbar , currently medium
*/

const loadingHeight = 6;
const pageMargin = 12;
const pageMarginTop = pageMargin - loadingHeight;
const pageMarginBottom = 0;

/* app menu icon keys */
const appsKey = 0;
const settingsKey = 1;
const logoutKey = 2;

export default function AppHeader() {
  const showAppHeader = useSelector(appHeaderVisible);
  const appThemeColor = useSelector(themeColor);
  const [settingsMenuAnchor, setSettingsMenuAnchor] =
    React.useState<null | HTMLElement>(null);

  const onAppIconClick = (iconKey: number, optionIndex?: number) => {
    switch (iconKey) {
      case appsKey:
        //REF -- currently not doing anything here -- onOptionSelect event passes optionIndex
        break;
      case settingsKey:
        // eslint-disable-next-line no-case-declarations
        const menuButtonRef: HTMLElement | null = document.getElementById(
          'settings-menu-anchor',
        );
        setSettingsMenuAnchor(menuButtonRef);
        break;
      default:
        break;
    }
  };

  // THEME upper right button style
  const appIconStyle = {
    marginLeft: '8px',
    color: (theme: any) => `${theme.header.buttonColor}`,
    '&:hover': {
      backgroundColor: 'primary.dark',
      color: (theme: any) => `${theme.header.hoverColor}`,
    },
  };

  return (
    <>
      {showAppHeader && (
        <Box sx={{ height: 'auto', backgroundColor: 'background.paper' }}>
          <Grid
            container
            sx={{
              //we need this to avoid layout issue (see Scenario Designer drawers top alignment)
              height: '45px',
              backgroundColor: (theme: any) => `${theme.header.default}`,
              alignItems: 'center',
              alignContent: 'center',
              paddingTop: '0px',
            }}
          >
            <AppLogo
              assetId="rapid-cmi5"
              isNavOpen={false}
              appThemeColor={appThemeColor}
            />

            <AppHeaderDashboardMenu
              dashboardIcons={[]}
              appThemeColor={appThemeColor}
            />
            <Box
              sx={{
                display: 'flex',
                position: 'absolute',
                right: '8px',
                width: 'auto',
              }}
            >
              <IconButton
                aria-label="user-settings"
                id="settings-menu-anchor"
                onClick={() => onAppIconClick(settingsKey)}
                sx={appIconStyle}
              >
                <Tooltip
                  arrow
                  enterDelay={500}
                  enterNextDelay={500}
                  title="User Settings"
                  placement="bottom"
                >
                  <SettingsIcon />
                </Tooltip>
              </IconButton>
              <UserInfoBox
                anchorEl={settingsMenuAnchor}
                onClose={() => setSettingsMenuAnchor(null)}
              />
              <IconButton
                data-testid="button-log-off"
                aria-label="logout"
                onClick={() => onAppIconClick(logoutKey)}
                sx={appIconStyle}
              >
                <Tooltip
                  arrow
                  enterDelay={500}
                  enterNextDelay={500}
                  title="Logout"
                  placement="bottom"
                >
                  <LogoffIcon />
                </Tooltip>
              </IconButton>
            </Box>
          </Grid>
        </Box>
      )}
      <Box sx={{ height: 'auto', backgroundColor: 'background.paper' }}>
        <Divider
          orientation="horizontal"
          variant="fullWidth"
          sx={{
            boxShadow: 0,
            borderBottomWidth: '1.5px',
            backgroundColor: (theme: any) => `${theme.input.outlineColor}`,
            color: (theme: any) => `${theme.header.default}`,
          }}
        />
      </Box>
    </>
  );
}
