/* Material */
import { ThemeProvider } from '@mui/material';
import { NotificationsProvider } from '@toolpad/core';
import AppRoutes from './AppRoutes';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  CoursePresentationContext,
  CoursePresentationProvider,
  darkTheme,
  lightTheme,
  themeColor,
} from '@rapid-cmi5/ui';
import { useSelector } from 'react-redux';
import { useContext } from 'react';
import { courseDataSel, orgThemeSel } from './redux/auReducer';

// This setup allows us to grab the currentTheme after all overides
// So that we may setup the mui theme with the proper settings based on the
// course level and org level theme settings
function ThemedApp() {
  const { currentTheme } = useContext(CoursePresentationContext);

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

export function App() {
  const themeMode = useSelector(themeColor);
  const courseData = useSelector(courseDataSel);
  const orgTheme = useSelector(orgThemeSel);
  return (
    <CoursePresentationProvider
      themeMode={themeMode}
      baseDarkTheme={darkTheme}
      baseLightTheme={lightTheme}
      orgTheme={orgTheme}
      courseTheme={courseData?.courseTheme}
    >
      <ThemedApp />
    </CoursePresentationProvider>
  );
}

export default App;
