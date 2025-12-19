/* CMI5 Flavor */

import { ConsolePopup, LoadingUi } from '@rapid-cmi5/ui/branded';
import { useEffect, useRef, useState } from 'react';
import {
  useGetRangeResourceConsolesGraph,
  useQueryDetails,
} from '@rapid-cmi5/ui/branded';
import { Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import { rangeConsoleDataSel, rangeDataSel } from '../../redux/auReducer';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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

  /**
   * UE forces render when rangeData updates
   */
  useEffect(() => {
    const isDisabled =
      rangeData?.rangeId &&
      rangeData.deployedScenarios &&
      rangeData.deployedScenarios.length > 0 &&
      rangeConsoleData?.credentials &&
      rangeConsoleData.credentials.length > 0
        ? false
        : true;
    setAccessDisabled(isDisabled);

    if (!isDisabled) {
      console.log(
        'rangeConsoleData?.credentials[0].username',
        rangeConsoleData?.credentials[0].username,
      );
      console.log(
        'rangeConsoleData?.credentials[0].password',
        rangeConsoleData?.credentials[0].password,
      );
      const found = rangeConsoleData?.credentials.find(
        (creds) => creds.scenarioUUID === rangeData?.deployedScenarios[0],
      );

      if (found) {
        setUsername(found.username);
        setPassword(found.password);
      }
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
