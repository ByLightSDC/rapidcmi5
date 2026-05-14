import { useCallback, useEffect, useState } from 'react';

import { useOverrideConfigs } from '../hooks/useOverrideConfig';
import { config, debugLog } from '@rapid-cmi5/ui';
import { Alert, AlertTitle, CircularProgress, Typography } from '@mui/material';

import ScenarioConsoleTab from '../components/scenario/ScenarioConsoleTab';
import { useCMI5Session } from '../hooks/useCMI5Session';
import { checkForDevMode } from '../utils/DevMode';
import { useDispatch, useSelector } from 'react-redux';
import { auJsonSel, setIsConfigInitialized } from '../redux/auReducer';
import { useAuContent } from '../hooks/useAuContent';
import { refreshLoggingConfig } from '../debug';
import { authToken, isAuthenticated } from '@rapid-cmi5/keycloak';

enum NoAuManagerState {
  waiting = 'Loading...',
  loadingContent = 'Loading Content...',
  loadingOverrides = 'Loading Config...',
  authenticating = 'Authenticating...',
  authenticatingSSO = 'Authenticating via SSO...',
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
  const auJson = useSelector(auJsonSel);
  const token = useSelector(authToken);
  const dispatch = useDispatch();

  const {
    initializeCmi5WithRange,
    initializeSessionCmi5,
    testCmi5,
    isCmi5RangeConnectionComplete,
    isInitSessionCmi5Complete,
    cmi5ErrorMessage,
  } = useCMI5Session();

  const { isOverridesLoaded, loadOverrides } = useOverrideConfigs();
  const { isContentLoaded, contentErrorMessage, loadContent } = useAuContent();

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

  const auHasScenario =
    auJson.rangeosScenarioUUID || auJson.rangeosScenarioName ? true : false;
  const auHasTeamScenario = auJson.teamSSOEnabled ? true : false;

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
      loadContent('./config.json');
      setNoAuManagerState(NoAuManagerState.loadingContent);
      return;
    } else if (noAuManagerState === NoAuManagerState.loadingContent) {
      if (isContentLoaded) {
        debugLog('auHasScenario ' + auHasScenario, auJson.rangeosScenarioName);
        debugLog('auHasTeamScenario ', auJson.teamSSOEnabled);

        if (auHasScenario) {
          config.CMI5_SSO_ENABLED = false;
        } else if (auHasTeamScenario) {
          config.CMI5_SSO_ENABLED = true;
        } else {
          config.CMI5_SSO_ENABLED = false;
        }
        //flag config file is finalized with all env variables needed
        if (!config.CMI5_SSO_ENABLED) {
          debugLog('[AU] basic auth configured', 'auth');
        } else {
          debugLog('[AU] waiting for SSO token', 'auth');
        }

        if (checkForDevMode()) {
          debugLog('[NoAU] test mode');
          testCmi5(true);
        } else {
          initializeSessionCmi5();
        }
        setNoAuManagerState(NoAuManagerState.authenticating);
      }
      if (contentErrorMessage) {
        setLoadingMessage(contentErrorMessage);
        setNoAuManagerState(NoAuManagerState.error);
      }
      return;
    } else if (noAuManagerState === NoAuManagerState.authenticating) {
      if (checkForDevMode() || isInitSessionCmi5Complete) {
        loadOverrides('./cfg.json');
        setNoAuManagerState(NoAuManagerState.loadingOverrides);
      }
      return;
    } else if (noAuManagerState === NoAuManagerState.loadingOverrides) {
      if (isOverridesLoaded) {
        // Refresh logging configuration after overrides are applied
        refreshLoggingConfig();
        //this kicks off SSO token retrieval if needed, but also signals to the rest of the app that config is finalized and content can be rendered
        dispatch(setIsConfigInitialized(true));
        if (config.CMI5_SSO_ENABLED) {
          setNoAuManagerState(NoAuManagerState.authenticatingSSO);
        } else {
          setNoAuManagerState(NoAuManagerState.loadingScenario);
        }
      }
      return;
    } else if (noAuManagerState === NoAuManagerState.authenticatingSSO) {
      if (token) {
        debugLog('token set, continue to scenario');
        setNoAuManagerState(NoAuManagerState.loadingScenario);
      }
    } else if (noAuManagerState === NoAuManagerState.loadingScenario) {
      if (checkForDevMode() || isCmi5RangeConnectionComplete) {
        debugLog('[NoAU] CMI5 connection complete');
        setNoAuManagerState(NoAuManagerState.ready);
      } else {
        // we may need to check more than once
        initializeCmi5WithRange(false, auHasScenario);
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    isContentLoaded,
    isOverridesLoaded,
    isCmi5RangeConnectionComplete,
    contentErrorMessage,
    auJson,
    isInitSessionCmi5Complete,
    cmi5ErrorMessage,
    noAuManagerState,
    token,
  ]);

  return (
    <>
      {getReadyDisplay()}
      {noAuManagerState === NoAuManagerState.ready && <ScenarioConsoleTab />}
    </>
  );
}

export default NoAuManager;
