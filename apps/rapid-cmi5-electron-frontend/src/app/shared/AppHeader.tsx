import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  appHeaderVisible,
  RapidCmi5Icon,
  RapidCmi5Title,
} from '@rapid-cmi5/ui';

/* MUI */
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

/* Icons */
import { Astroid, Settings, SquareTerminal } from 'lucide-react';

import UserInfoBox from './navbar/UserInfoBox';
import { Stack } from '@mui/material';
import { useAppUi } from '../contexts/AppUiContext';

/* app menu icon keys */
const appsKey = 0;
const settingsKey = 1;
const thinIconProps = {
  size: 20,
  strokeWidth: 1.75,
  absoluteStrokeWidth: true,
};

export default function AppHeader() {
  const {
    isElectron,
    aiOpen,
    terminalOpen,
    toggleAiPanel,
    toggleTerminalPanel,
  } = useAppUi();
  const showAppHeader = useSelector(appHeaderVisible);
  const [settingsMenuAnchor, setSettingsMenuAnchor] =
    React.useState<null | HTMLElement>(null);

  const handleOpenTerminal = () => {
    toggleTerminalPanel();
  };

  const handleOpenAi = () => {
    toggleAiPanel();
  };

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
        <RapidCmi5Icon isDarkThemeOnly={true} />
        <RapidCmi5Title />
      </Stack>
    );
  }, []);

  if (!showAppHeader) return null;

  return (
    <Box
      sx={{
        height: '40px',
        backgroundColor: (theme: any) => `${theme.header.default}`,
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        px: 1,
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
          disableTouchRipple
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
            <Settings {...thinIconProps} />
          </Tooltip>
        </IconButton>

        <UserInfoBox
          anchorEl={settingsMenuAnchor}
          onClose={() => setSettingsMenuAnchor(null)}
        />
      </Box>

      {isElectron && (
        <>
          <IconButton
            aria-label="terminal"
            aria-pressed={terminalOpen}
            disableTouchRipple
            onClick={handleOpenTerminal}
            size="small"
            sx={{
              color: (theme: any) => `${theme.header.buttonColor}`,
              borderRadius: '4px',
              backgroundColor: terminalOpen
                ? 'action.selected'
                : 'transparent',
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
              title={terminalOpen ? 'Close Terminal' : 'Open Terminal'}
              placement="bottom"
            >
              <SquareTerminal {...thinIconProps} />
            </Tooltip>
          </IconButton>
          <IconButton
            aria-label="ai-tools"
            aria-pressed={aiOpen}
            disableTouchRipple
            onClick={handleOpenAi}
            size="small"
            sx={{
              color: (theme: any) => `${theme.header.buttonColor}`,
              borderRadius: '4px',
              backgroundColor: aiOpen ? 'action.selected' : 'transparent',
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
              title={aiOpen ? 'Close AI Tools' : 'Open AI Tools'}
              placement="bottom"
            >
              <Astroid {...thinIconProps} />
            </Tooltip>
          </IconButton>
        </>
      )}
    </Box>
  );
}
