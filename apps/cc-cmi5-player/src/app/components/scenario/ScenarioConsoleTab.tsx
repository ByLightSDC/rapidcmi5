/* CMI5 Flavor */

import { useCallback, useEffect, useRef, useState } from 'react';

import { Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import { rangeConsoleDataSel, rangeDataSel } from '../../redux/auReducer';
import { useGetRangeResourceConsolesGraph } from '@rangeos-nx/frontend/clients/hooks';
import { config, debugLog, LoadingUi, useQueryDetails } from '@rapid-cmi5/ui';
import ConsolePopup from './console/ConsolePopup';

export const routeDelim = 'A';

/**
 * Used in a tab to display a full screen console.
 * CMI5 player cannot use react router for nested routes
 * @constructor
 */
export function ScenarioConsoleTab() {
  //PARAMS

  const searchParams = new URLSearchParams(window.location.search);
  const connectionId = searchParams.get('console') || '';
  const rangeId = searchParams.get('rangeId');
  const scenarioId = searchParams.get('scenarioId');

  const [isAccessDisabled, setAccessDisabled] = useState(true);
  const [currentZIndex, setCurrentZIndex] = useState<number>(999);
  const rangeData = useSelector(rangeDataSel);
  const rangeConsoleData = useSelector(rangeConsoleDataSel);
  const [isConsoleInitialized, setIsConsoleInitialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const consoleRef: any = useRef(null);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState<string | undefined>(undefined);

  //console.log('Console Tab Query');
  //console.log('rangeId', rangeId);
  //console.log('scenarioId', scenarioId);

  const consolesQuery = useGetRangeResourceConsolesGraph(
    rangeId ? rangeId : '',
    scenarioId ? scenarioId : '',
  );

  useQueryDetails({
    queryObj: consolesQuery,
    errorFunction: (queryError: any) => {
      console.log('Unable to retrieve console', queryError);
      setErrorMessage('Unable to retrieve console');
      setIsConsoleInitialized(true);
    },
    successFunction: (successData: any) => {
      const consoles = successData?.rangeConsoles || [];
      setIsConsoleInitialized(true);

      let consoleToDisplay;
      for (let i = 0; i < consoles.length; i++) {
        const cnsl = consoles[i];
        if (cnsl.details?.connectionId === connectionId) {
          consoleToDisplay = cnsl;
          break;
        }
      }

      if (!consoleToDisplay) {
        setErrorMessage('Console not found');
      } else {
        consoleRef.current = consoleToDisplay;
      }
    },
    shouldDisplayToaster: false,
  });

  const getBasicAuthConsoleDisabled = useCallback(() => {
    return Boolean(
      rangeData?.rangeId &&
        rangeData.deployedScenarios &&
        rangeData.deployedScenarios.length > 0 &&
        rangeConsoleData?.credentials &&
        rangeConsoleData.credentials.length > 0
        ? false
        : true,
    );
  }, [
    rangeData.rangeId,
    rangeData.deployedScenarios,
    rangeConsoleData.credentials,
  ]);

  const getCredentials = useCallback(() => {
    if (config.CMI5_SSO_ENABLED) {
      setUsername(undefined);
      setPassword(undefined);
    } else {
      if (rangeConsoleData?.credentials?.length > 0) {
        debugLog(
          'rangeConsoleData?.credentials',
          rangeConsoleData?.credentials,
        );

        const found = rangeConsoleData?.credentials.find(
          (creds) => creds.scenarioUUID === rangeData?.deployedScenarios[0],
        );

        // work around for older version of api in pcte
        if (found) {
          debugLog('found creds for scenario in deployed scenario', found);
          setUsername(found.username);
          setPassword(found.password);
        } else {
          debugLog('found creds for scenario in console data');
          setUsername(rangeConsoleData.credentials[0].username);
          setPassword(rangeConsoleData.credentials[0].password);
        }
      }
    }
  }, [rangeConsoleData?.credentials, rangeData?.deployedScenarios]);

  /**
   * UE forces render when rangeData updates
   * handles basic auth and sso consoles
   */
  useEffect(() => {
    const isDisabled = config.CMI5_SSO_ENABLED
      ? false
      : getBasicAuthConsoleDisabled();
    setAccessDisabled(isDisabled);

    if (!isDisabled) {
      getCredentials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rangeData.rangeId,
    rangeData.deployedScenarios.length,
    rangeConsoleData.credentials.length,
  ]);

  const hasConsole =
    isConsoleInitialized && !isAccessDisabled && consoleRef.current;

  return (
    <div>
      {!isConsoleInitialized && <LoadingUi message={'Loading...'} />}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {hasConsole && (
        <ConsolePopup
          routeDelim={routeDelim}
          isRouteRelative={true}
          isTab={true}
          currentZIndex={currentZIndex}
          setCurrentZIndex={setCurrentZIndex}
          connectionId={connectionId}
          connectionType={consoleRef.current.details.connectionType}
          connectionUrl={consoleRef.current.url}
          guacUserName={username}
          guacPassword={password}
          rangeId={rangeId || ''}
          resizeMethod={consoleRef.current.parameters.resizeMethod}
          protocol={consoleRef.current.protocol}
          scenarioId={scenarioId || ''}
          token=""
        />
      )}
    </div>
  );
}

export default ScenarioConsoleTab;
