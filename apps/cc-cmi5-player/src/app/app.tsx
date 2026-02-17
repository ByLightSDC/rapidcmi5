/* Material */
import { ThemeProvider, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { NotificationsProvider } from '@toolpad/core';
import AppRoutes from './AppRoutes';
import { debugLog } from './debug';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSelector } from 'react-redux';
import { themeColor } from '@rapid-cmi5/ui';
import { darkTheme } from './styles/muiThemeDark';
import { lightTheme } from './styles/muiTheme';
import { CustomTheme } from './styles/createPalette';

export function App() {
  const theme = useSelector(themeColor);

  // Handle session termination when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        // TODO: this should not called on a page refresh
        // sendTerminatedVerb().catch((error) => {
        //   debugLog('error sending terminated statement ', error);
        // });
        // Notify LMS that session is terminating (CMI5 protocol requirement)
        // if (cmi5Instance && typeof cmi5Instance.terminate === 'function') {
        //   await cmi5Instance.terminate();
        //   debugLog('CMI5 session terminated');
        // }
      } catch (error) {
        // Don't block the unload - just log the error
        debugLog('CMI5 session terminated ', error);
      }
    };

    // Add event listener for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <NotificationsProvider
          slotProps={{
            snackbar: {
              anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
            },
          }}
        >
          <AppRoutes />
        </NotificationsProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
