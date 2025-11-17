/* Material */
import { ThemeProvider } from '@mui/material';
import { darkTheme } from './styles/muiThemeDark';
import { useEffect } from 'react';
import { NotificationsProvider } from '@toolpad/core';
import AppRoutes from './AppRoutes';
import { debugLog } from './debug';

export function App() {
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
    <ThemeProvider theme={darkTheme}>
      <NotificationsProvider
        slotProps={{
          snackbar: {
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          },
        }}
      >
        <AppRoutes />
      </NotificationsProvider>
    </ThemeProvider>
  );
}

export default App;
