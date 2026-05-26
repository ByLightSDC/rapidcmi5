/* Material */
import { ThemeProvider } from '@mui/material';
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

export function App() {
  const theme = useSelector(themeColor);

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
