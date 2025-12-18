import { useParams } from 'react-router';
import React, { useRef, useState } from 'react';
import {
  useGetRangeResourceConsolesGraph,
  useQueryDetails,
} from '@rapid-cmi5/ui/api/hooks';
import { Alert } from '@mui/material';
import { LoadingUi } from '../../indicators/Loading';
import ConsolePopup from './ConsolePopup';

/**
 * Used in a tab to display a full screen console.
 * @constructor
 */
export function ConsoleTab() {
  const { connectionId, guacUser, guacPassword, rangeId, scenarioId } =
    useParams();

  const [isConsoleInitialized, setIsConsoleInitialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const consoleRef: any = useRef(null);

  const consolesQuery = useGetRangeResourceConsolesGraph(
    rangeId ? rangeId : '',
    scenarioId ? scenarioId : '',
  );
  useQueryDetails({
    queryObj: consolesQuery,
    errorFunction: (queryError: any) => {
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

  const [currentZIndex, setCurrentZIndex] = useState<number>(999);

  return (
    <div>
      {!isConsoleInitialized ? (
        <LoadingUi message={'Loading...'} />
      ) : (
        <div>
          {errorMessage ? (
            <Alert severity="error">{errorMessage}</Alert>
          ) : (
            consoleRef.current && (
              <ConsolePopup
                isTab={true}
                currentZIndex={currentZIndex}
                setCurrentZIndex={setCurrentZIndex}
                windowNumber={1}
                connectionId={connectionId || ''}
                connectionType={consoleRef.current.details.connectionType}
                connectionUrl={consoleRef.current.url}
                guacUserName={guacUser}
                guacPassword={guacPassword}
                rangeId={rangeId}
                resizeMethod={consoleRef.current.parameters.resizeMethod}
                protocol={consoleRef.current.protocol}
                scenarioId={scenarioId}
                token=""
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

export default ConsoleTab;
