/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
// import { useAppBreadCrumbs } from '../hooks/useAppBreadCrumbs';

import { appHeaderVisible, themeColor } from '@rapid-cmi5/ui';
import { useLogOut } from '../hooks/useLogOut';

/* Branded */
import { AppLogo, AppHeaderDashboardMenu } from '@rapid-cmi5/ui';

/* MUI */
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

/* Icons */
import SettingsIcon from '@mui/icons-material/Settings';

import UserInfoBox from './navbar/UserInfoBox';
import { Typography } from '@mui/material';

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

export default function AppHeader({ authEnabled }: { authEnabled: boolean }) {
  const logOut = useLogOut();
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
      case logoutKey:
        logOut();
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
        <Box
          sx={{
            height: '35px',
            backgroundColor: (theme: any) => `${theme.header.default}`,
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            px: 1,
          }}
        >
          {/* Left section - Logo and Dashboard Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AppLogo
              assetId="rapid-cmi5"
              isNavOpen={false}
              appThemeColor={appThemeColor}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: '15px',
                letterSpacing: '0.02em',
                color: (theme: any) => `${theme.header.buttonColor}`,
                userSelect: 'none',
                opacity: 0.9,
              }}
            >
              Rapid CMI5
            </Typography>
          </Box>

          {/* Center section - could add breadcrumbs or title here */}
          <Box sx={{ flex: 1 }} />

          {/* Right section - Settings and User */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              aria-label="user-settings"
              id="settings-menu-anchor"
              onClick={() => onAppIconClick(settingsKey)}
              size="small"
              sx={{
                color: (theme: any) => `${theme.header.buttonColor}`,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  color: (theme: any) => `${theme.header.hoverColor}`,
                },
              }}
            >
              <Tooltip
                arrow
                enterDelay={500}
                enterNextDelay={500}
                title="User Settings"
                placement="bottom"
              >
                <SettingsIcon fontSize="small" />
              </Tooltip>
            </IconButton>

            <UserInfoBox
              anchorEl={settingsMenuAnchor}
              onClose={() => setSettingsMenuAnchor(null)}
              authEnabled={authEnabled}
            />
          </Box>
        </Box>
      )}
      {/* <Box sx={{ height: 'auto', backgroundColor: 'background.paper' }}>
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
      </Box> */}
    </>
  );
}
