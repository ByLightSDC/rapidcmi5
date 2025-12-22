import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useOverrideConfigs } from '../hooks/useOverrideConfig';
import { debugLog } from '@rapid-cmi5/ui';

import { Alert, AlertTitle, CircularProgress, Typography } from '@mui/material';

import { authToken } from '@rapid-cmi5/ui/keycloak';
import ScenarioConsoleTab from '../components/scenario/ScenarioConsoleTab';
import { useCMI5Session } from '../hooks/useCMI5Session';
import { checkForDevMode } from '../utils/DevMode';

enum NoAuManagerState {
  waiting = 'Loading...',
  loadingOverrides = 'Loading Config...',
  authenticating = 'Authenticating...',
  ready = 'Ready',
  error = 'Error',
}

/**
 * Stand-in AUManager When Console is opened in a 2nd Tab
 * @returns 
 */
function NoAuManager() {
  const authTokenSel = useSelector(authToken);
  const dispatch = useDispatch();

  const [noAuManagerState, setNoAuManagerState] = useState(
    NoAuManagerState.waiting,
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [initializationAttempt, setInitializationAttempt] = useState(0);

  const { initializeCmi5, testCmi5, isSessionInitialized, cmi5ErrorMessage } =
    useCMI5Session();

  const { isOverridesLoaded, loadOverrides } = useOverrideConfigs();

  const getReadyDisplay = useCallback(() => {
    if (noAuManagerState === NoAuManagerState.error) {
      return (
        <Alert
          sx={{ position: 'absolute', left: 400, top: -4, zIndex: 9999 }}
          severity="error"
        >
          <AlertTitle>{loadingMessage}</AlertTitle>
        </Alert>
      );
    }

    if (noAuManagerState !== NoAuManagerState.ready) {
      return (
        <div
          style={{
            position: 'absolute',
            left: 400,
            top: 10,
            zIndex: 9999,
            display: 'flex',
          }}
        >
          <CircularProgress size="18px" />
          <Typography color="text.primary" sx={{ marginLeft: '8px' }}>
            {noAuManagerState + loadingMessage}
          </Typography>
        </div>
      );
    }
    return null;
  }, [noAuManagerState, loadingMessage]);
  /**
   * UE Manages Session State
   */
  useEffect(() => {
    if (noAuManagerState !== NoAuManagerState.ready) {
      debugLog('[AU] state', noAuManagerState);
    }

    if (noAuManagerState === NoAuManagerState.waiting) {
      loadOverrides('./cfg.json');
      setNoAuManagerState(NoAuManagerState.loadingOverrides);
      return;
    } else if (noAuManagerState === NoAuManagerState.loadingOverrides) {
      if (isOverridesLoaded) {
        setNoAuManagerState(NoAuManagerState.ready);
        if (checkForDevMode()) {
          debugLog('[AU] test mode');
          testCmi5(true);
          debugLog('[AU] state >', NoAuManagerState.ready);
          setNoAuManagerState(NoAuManagerState.ready);
        } else {
          initializeCmi5(false, true);
          setNoAuManagerState(NoAuManagerState.authenticating);
        }
      }
    } else if (noAuManagerState === NoAuManagerState.authenticating) {
      if (!isAuthenticated) {
        setTimeout(() => {
          setInitializationAttempt(initializationAttempt + 1);
        }, 1000);
      } else {
        setNoAuManagerState(NoAuManagerState.ready);
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOverridesLoaded,
    isAuthenticated,
    isSessionInitialized,
    cmi5ErrorMessage,
    noAuManagerState,
    initializationAttempt,
    dispatch,
    loadOverrides,
    initializeCmi5,
  ]);

  useEffect(() => {
    if (authTokenSel) {
      setIsAuthenticated(true);
    }
  }, [authTokenSel]);

  return (
    <>
      {getReadyDisplay()}
      {isAuthenticated && noAuManagerState === NoAuManagerState.ready && (
        <ScenarioConsoleTab />
      )}
    </>
  );
}

export default NoAuManager;
