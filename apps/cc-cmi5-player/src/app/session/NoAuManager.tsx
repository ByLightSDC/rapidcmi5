import { useCallback, useEffect, useState } from 'react';

import { useOverrideConfigs } from '../hooks/useOverrideConfig';
import { debugLog } from '@rapid-cmi5/ui';

import { Alert, AlertTitle, CircularProgress, Typography } from '@mui/material';

import ScenarioConsoleTab from '../components/scenario/ScenarioConsoleTab';
import { useCMI5Session } from '../hooks/useCMI5Session';
import { checkForDevMode } from '../utils/DevMode';

enum NoAuManagerState {
  waiting = 'Loading...',
  loadingOverrides = 'Loading Config...',
  authenticating = 'Authenticating...',
  loadingScenario = 'Loading Scenario...',
  ready = 'Ready',
  error = 'Error',
}

/**
 * Stand-in AUManager When Console is opened in a 2nd Tab
 * @returns
 */
function NoAuManager() {
  const [noAuManagerState, setNoAuManagerState] = useState(
    NoAuManagerState.waiting,
  );
  const [loadingMessage, setLoadingMessage] = useState('');

  const {
    initializeCmi5WithRange,
    initializeSessionCmi5,
    testCmi5,
    isCmi5RangeConnectionComplete,
    isInitSessionCmi5Complete,
    cmi5ErrorMessage,
  } = useCMI5Session();

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
      debugLog('[NoAU] state', noAuManagerState);
    }

    if (cmi5ErrorMessage) {
      setLoadingMessage(cmi5ErrorMessage);
      setNoAuManagerState(NoAuManagerState.error);
    }

    if (noAuManagerState === NoAuManagerState.waiting) {
      if (checkForDevMode()) {
        debugLog('[NoAU] test mode');
        testCmi5(true);
        setNoAuManagerState(NoAuManagerState.ready);
      } else {
        initializeSessionCmi5();
        setNoAuManagerState(NoAuManagerState.authenticating);
      }
      return;
    } else if (noAuManagerState === NoAuManagerState.authenticating) {
      if (isInitSessionCmi5Complete) {
        loadOverrides('./cfg.json');
        setNoAuManagerState(NoAuManagerState.loadingOverrides);
      }
      return;
    } else if (noAuManagerState === NoAuManagerState.loadingOverrides) {
      if (isOverridesLoaded) {
        setNoAuManagerState(NoAuManagerState.loadingScenario);
      }
      return;
    } else if (noAuManagerState === NoAuManagerState.loadingScenario) {
      if (isCmi5RangeConnectionComplete) {
        setNoAuManagerState(NoAuManagerState.ready);
      } else {
        initializeCmi5WithRange(false, true);
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOverridesLoaded,
    isCmi5RangeConnectionComplete,
    isInitSessionCmi5Complete,
    cmi5ErrorMessage,
    noAuManagerState,
  ]);

  return (
    <>
      {getReadyDisplay()}
      {noAuManagerState === NoAuManagerState.ready && <ScenarioConsoleTab />}
    </>
  );
}

export default NoAuManager;
