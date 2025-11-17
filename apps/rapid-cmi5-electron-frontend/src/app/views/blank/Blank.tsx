/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { isLoggingOut } from '@rangeos-nx/ui/keycloak';
import { auth } from '@rangeos-nx/ui/keycloak';
import { useSelector } from 'react-redux';

/*Branded */
import {
  AppDashboardMenu,
  AppMenu,
  BookmarksContext,
  ModalDialog,
  useNavBar,
} from '@rangeos-nx/ui/branded';

import Typography from '@mui/material/Typography';

type Props = {
  message?: string;
};

export default function Blank(props: Props) {
  const { initialized, keycloak } = useKeycloak();
  const { clearAllBookmarks } = useContext(BookmarksContext);
  const authInfo = useSelector(auth);
  const isLogOutInProgress = useSelector(isLoggingOut);

  const isAuthenticated = initialized && keycloak?.authenticated;
  const aTitle = isAuthenticated
    ? `Welcome, ${authInfo?.username}!`
    : 'Welcome to Imerzi!';
  const instructions = isAuthenticated
    ? 'Choose a dashboard from the menu above...'
    : 'Please wait while we connect you...';
  const loggingOutModalId = 'log-out';
  const shouldShowAppMenu = false;

  useNavBar(-1);

  /**
   * Use Effect clears all bookmark data when landing mounts
   */
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    clearAllBookmarks();
  }, []);

  return (
    <div id="app-content">
      <div data-testid="modals">
        {isLogOutInProgress && (
          <ModalDialog
            testId={loggingOutModalId}
            buttons={[]}
            dialogProps={{ open: true }}
            message="Please wait..."
            title="Logging Out"
            maxWidth="xs"
          />
        )}
      </div>
      <Typography
        variant="h3"
        className="content-header-text"
        sx={{
          width: 'auto',
          color: (theme: any) => `${theme.header.title}`,
          marginTop: '12px',
          paddingLeft: '24px',
        }}
      >
        {aTitle}
      </Typography>
      <Typography
        sx={{
          width: 'auto',
          color: (theme: any) => `${theme.header.title}`,
          paddingTop: '4px',
          paddingLeft: '28px',
        }}
      >
        {instructions}
      </Typography>

      {!shouldShowAppMenu ? null : (
        <AppDashboardMenu activeId="devops-portal" />
      )}
    </div>
  );
}
