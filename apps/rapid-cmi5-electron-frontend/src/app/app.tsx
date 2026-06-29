import { useEffect } from 'react';
import { BrowserRouter as RouterWrapper } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { setDividerColor, setIconColor, themeColor } from '@rapid-cmi5/ui';

/* Shared */
import AppHeader from './shared/AppHeader';

/* Branded */
import { SizingContextProvider, TimePickerProvider } from '@rapid-cmi5/ui';

/* Material */
import { NotificationsProvider } from '@toolpad/core';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import { ThemeProvider } from '@mui/material';
import Box from '@mui/material/Box';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { darkTheme } from './styles/muiThemeDark';
import { lightTheme } from './styles/muiTheme';
import UserConfig from './contexts/UserConfigContext';
import Auth from './contexts/AuthContext';
import { RapidCmi5Wrapper } from './RapidCmi5Wrapper';
import CodingAgentsPanel from './components/terminal/CodingAgentsPanel';
import TerminalPanel from './components/terminal/TerminalPanel';
import { AppUiProvider, useAppUi } from './contexts/AppUiContext';

export default function App() {
  const dispatch = useDispatch();
  const theme = useSelector(themeColor);

  useEffect(() => {
    const iconColor =
      theme === 'dark'
        ? darkTheme.palette.primary.main
        : lightTheme.palette.primary.main;
    const dividerColor =
      theme === 'dark'
        ? darkTheme.palette.primary.main
        : lightTheme.palette.primary.main;

    dispatch(setIconColor(iconColor));
    dispatch(setDividerColor(dividerColor || 'grey'));
  }, [dispatch, theme]);

  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <NotificationsProvider
            slotProps={{
              snackbar: {
                anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
              },
            }}
          >
            <RouterWrapper>
              <Paper
                elevation={0}
                style={{
                  width: '100%',
                  height: '100vh',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <SizingContextProvider>
                  <TimePickerProvider>
                    <UserConfig>
                      <Auth>
                        <AppUiProvider>
                          <AppWorkspace />
                        </AppUiProvider>
                      </Auth>
                    </UserConfig>
                  </TimePickerProvider>
                </SizingContextProvider>
              </Paper>
            </RouterWrapper>
          </NotificationsProvider>
        </LocalizationProvider>
      </CssBaseline>
    </ThemeProvider>
  );
}

function AppWorkspace() {
  const {
    isElectron,
    aiOpen,
    terminalOpen,
    closeAiPanel,
    setTerminalOpen,
    setAiThinking,
  } = useAppUi();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: 0,
      }}
    >
      <a href="#app-routes" className="skip-link">
        Skip to main content
      </a>
      <AppHeader />

      <main
        id="app-routes"
        style={{
          display: 'flex',
          flex: '1 1 auto',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <PanelGroup
          direction="vertical"
          style={{
            width: '100%',
            height: '100%',
            minHeight: 0,
          }}
        >
          <Panel style={{ overflow: 'hidden' }}>
            <PanelGroup
              direction="horizontal"
              style={{
                width: '100%',
                height: '100%',
                minWidth: 0,
              }}
            >
              <Panel style={{ overflow: 'hidden' }}>
                <Box
                  sx={{
                    minWidth: 0,
                    height: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <RapidCmi5Wrapper />
                </Box>
              </Panel>
              {isElectron && aiOpen && (
                <>
                  <PanelResizeHandle
                    style={{
                      width: 1,
                      backgroundColor: 'grey',
                      opacity: 0.4,
                      cursor: 'col-resize',
                    }}
                  />
                  <Panel
                    defaultSize={32}
                    minSize={18}
                    maxSize={55}
                    style={{
                      overflow: 'hidden',
                      position: 'relative',
                      zIndex: 1400,
                    }}
                  >
                    <CodingAgentsPanel
                      open={aiOpen}
                      onClose={closeAiPanel}
                      onThinkingChange={setAiThinking}
                    />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
          {isElectron && terminalOpen && (
            <>
              <PanelResizeHandle
                style={{
                  height: 1,
                  backgroundColor: 'grey',
                  opacity: 0.4,
                  cursor: 'row-resize',
                }}
              />
              <Panel
                defaultSize={28}
                minSize={16}
                maxSize={60}
                style={{ overflow: 'hidden' }}
              >
                <TerminalPanel
                  open={terminalOpen}
                  onOpenChange={setTerminalOpen}
                  showFloatingButton={false}
                />
              </Panel>
            </>
          )}
        </PanelGroup>
      </main>
    </Box>
  );
}
