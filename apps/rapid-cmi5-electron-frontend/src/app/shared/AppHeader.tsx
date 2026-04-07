/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
// import { useAppBreadCrumbs } from '../hooks/useAppBreadCrumbs';
import { appHeaderVisible } from '@rapid-cmi5/ui';

/* MUI */
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

/* Icons */
import SettingsIcon from '@mui/icons-material/Settings';

import UserInfoBox from './navbar/UserInfoBox';
import { Stack } from '@mui/material';

/* app menu icon keys */
const appsKey = 0;
const settingsKey = 1;

export default function AppHeader() {
  const showAppHeader = useSelector(appHeaderVisible);
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

  /**
   * RapidCMI5 Book + bolt icon
   */
  const logoIcon = useMemo(() => {
    return (
      <Stack direction="row" sx={{ paddingLeft: '4px' }}>
        <svg
          aria-hidden="true"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 210 194"
          height={21.85}
          width={23}
          fill="#7795F8"
        >
          <path d="m119.64,176.34L16.56,107.92v-11.94l99.11,24.72L197.5,5.24,75.61,0,0,94.35v20.14l123.69,79.51,72.07-100.94-17.33-2.74-58.78,86.02ZM99.42,20.32h32.02l-20.47,29.24h16.93l-51.96,50.04,13.52-37.35h-19.38l29.36-41.92Z" />
          <polygon points="36.07 112.17 119.08 142.81 191.17 46.48 119.08 154.23 36.07 112.17" />
        </svg>
        <svg
          aria-hidden="true"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="236 0 716 194"
          height={20}
          width={74}
          fill="#FFFFFF"
        >
          <path d="m286.21,101.19l-12.43,58.43h-25.51l28.72-135.32h31.07c22.62,0,32.66,11.79,27.79,35.22l-1.63,7.75c-3.37,16.34-10.24,22.11-18.08,24.41,5.86,4.01,9.78,10.25,5.06,31.24-2.99,12.99-6.37,29.58-6.77,36.69h-25.1c-.23-6.12,2.71-20.38,7.23-41.66,2.84-13.38,1.54-16.77-6.76-16.77h-3.6Zm4.28-20.15h3.49c9.24,0,12.31-2.76,14.66-14.83l1.57-8.33c1.75-9.09.67-13.43-7.91-13.43h-4.06l-7.75,36.58Z" />
          <path d="m360.56,126.58l-10.13,33.05h-26.94l46.79-135.32h39.37l-10.13,135.32h-25.71l3-33.05h-16.25Zm18.74-22.39c1.62-16,4.3-44.42,5.45-57.12h-1.03c-2.6,10.22-10.92,39.59-16.21,57.12h11.79Z" />
          <path d="m438.41,24.31h30.02c24.71,0,33.48,14.67,28.89,37.27l-2.18,10.75c-4.47,22.26-13.3,33.14-39.71,33.14h-8.76l-11.39,54.16h-25.58l28.72-135.32Zm12.81,60.43h5.28c8.62,0,11.04-4.41,12.99-13.41l2.41-11.62c1.95-9.2,1.51-15.25-7.16-15.25h-5.08l-8.43,40.28Z" />
          <path d="m542.87,24.31l-28.72,135.32h-25.51l28.72-135.32h25.51Z" />
          <path d="m559.13,24.31h28.55c29.11,0,35.76,16.14,29.68,44.67l-11.22,52.69c-5.15,24-11.84,37.96-39.66,37.96h-36.07l28.72-135.32Zm.94,115.23h5.08c9.15,0,12.56-5.48,14.7-15.49l13.43-63.41c2.14-9.96,1.66-16.1-8.17-16.1h-4.73l-20.31,95Z" />
          <path d="m711.57,116.64l-1.32,5.92c-4.59,19.31-9.09,39.09-38.67,39.09-23.95,0-32.85-13.22-27.2-39.5l13.05-61.27c5.56-25.84,14.32-38.6,37.46-38.6,31.77,0,31.65,22.38,27.81,38.32l-1.12,5.25h-25.57l2.07-9.74c1.88-8.63.87-12.86-4.69-12.86-5.09,0-7.03,3.87-9.11,13.52l-14.75,69.71c-1.81,8.87-1.86,14.26,4.14,14.26,5.36,0,7.51-4.14,9.79-14.34l2.14-9.76h25.97Z" />
          <path d="m791.86,116.51c4.51-20.94,10.61-49.33,14.53-65.93h-.7c-8.48,27.07-25.63,80.57-35.23,109.04h-21.47c3.23-29.59,9.16-84.09,11.95-109.39h-.83c-3.11,15.89-9.1,43.91-13.84,67.23l-8.41,42.15h-23.6l28.72-135.32h37.07c-2.8,29.41-5.85,60.3-8.28,78.89h.49c6.28-19.59,17.22-51.7,26.99-78.89h37.11l-28.72,135.32h-24.9l9.13-43.11Z" />
          <path d="m878.06,24.31l-28.72,135.32h-25.51l28.72-135.32h25.51Z" />
          <path d="m945.29,49.84h-31.25c-2.34,9.38-4.97,20.82-6.65,27.15,3.6-3.87,9.04-5.9,15.3-5.9,17.15,0,21.7,12.87,17.34,34l-3.17,15.34c-5.07,24.36-10.82,40.67-38.93,40.67-26.53,0-31.29-14.9-27.79-32.64l.88-4.48h24.8l-1.24,6.12c-1.34,7.09-.67,11.38,5.54,11.38,5.67,0,7.88-5.64,10.28-17.17l4.11-19.99c1.81-8.86.04-12.16-5.06-12.16s-7.69,3.6-9.91,11.44l-22.73-2.15c4.31-13.92,13.6-51.68,18.73-73.36h56.47l-6.71,21.75Z" />
        </svg>
      </Stack>
    );
  }, []);

  return (
    <>
      {showAppHeader && (
        <Box
          sx={{
            height: '40px',
            backgroundColor: (theme: any) => `${theme.header.default}`,
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            //px: 1,
          }}
        >
          {/* Left section - Logo and Dashboard Menu */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              marginLeft: '8px',
              marginTop: '6px', //this offsets loading bar that appears under the app header box
            }}
          >
            {logoIcon}
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
            />
          </Box>
        </Box>
      )}
    </>
  );
}
