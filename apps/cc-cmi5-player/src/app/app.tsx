/* Material */
import { NotificationsProvider } from '@toolpad/core';
import AppRoutes from './AppRoutes';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  CoursePresentationProvider,
  darkTheme,
  lightTheme,
  themeColor,
} from '@rapid-cmi5/ui';
import { useSelector } from 'react-redux';
import { courseDataSel, orgThemeSel } from './redux/auReducer';

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
    </CoursePresentationProvider>
  );
}

export default App;
