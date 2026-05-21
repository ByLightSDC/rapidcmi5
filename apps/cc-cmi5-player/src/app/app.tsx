/* Material */
import { ThemeProvider } from '@mui/material';
import { NotificationsProvider } from '@toolpad/core';
import AppRoutes from './AppRoutes';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useOverrideTheme } from './hooks/useOverrideTheme';
import { useEffect } from 'react';

export function App() {
  const { currentTheme } = useOverrideTheme();

  
  return (
    <ThemeProvider theme={currentTheme}>
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
