/* eslint-disable react/jsx-no-useless-fragment */

import { useContext, useMemo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setModal } from '@rangeos-nx/ui/redux';
import { activeTabSel } from '../../redux/navigationReducer';
import { sendScenarioEventVerb } from '../../utils/LmsStatementManager';
import {
  auJsonSel,
  rangeConsoleDataSel,
  rangeDataSel,
  setStudentId,
} from '../../redux/auReducer';

import { cmi5Instance } from '../../session/cmi5';
import { LaunchData } from '@xapi/cmi5';

// Console

import {
  ScenarioUpdatesContext,
  ScenarioUpdatesContextProvider,
} from './ScenarioUpdatesContext';
import {
  ConsolesDisplay,
  ConsoleProvider,
  OverflowTypography,
  DataFetcher,
} from '@rangeos-nx/ui/branded';
import {
  getScenarioStatusIcon,
  queryKeyRangeResourceContainers,
  Topic,
  useGetRangeResourceScenario,
} from '@rangeos-nx/ui/api/hooks';
import {
  DeployedScenario,
  DeployedScenarioDetailStatusEnum,
} from '@rangeos-nx/frontend/clients/devops-api';

/* MUI */
import { Box, IconButton, ListItemIcon, Stack, Tooltip } from '@mui/material';

/* Icons*/
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DangerousIcon from '@mui/icons-material/Dangerous';

import {
  confirmDeleteButtonText,
  deleteModalId,
  deletePrompt,
  deleteTitle,
} from './constants';
import RangeResources from './list-views/RangeResources';
import ScenarioModals from './ScenarioModals';
import { routeDelim } from './ScenarioConsoleTab';
import { debugLog, logger } from '../../debug';
import TimeClock from './TimeClock';
import { ScenarioContentType } from './scenarioSchema';

/**
 * Wraps course to persist Scenario Console State across slides
 * @returns
 */
function ScenarioWrapper({ children }: { children: any }) {
  const dispatch = useDispatch();
  const [initializationAttempt, setInitializationAttempt] = useState(0);
  const [scenarioId, setScenarioId] = useState<string | undefined>(undefined);
  const rangeData = useSelector(rangeDataSel);
  const rangeConsoleData = useSelector(rangeConsoleDataSel);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
    if (!isDisabled) {
      console.log('[Scenario Wrapper] rangeData', rangeData);
      console.log('[Scenario Wrapper] credentials set');
      debugLog('guacUser', rangeConsoleData?.credentials[0].username);
      debugLog('guacPassword', rangeConsoleData?.credentials[0].password);

      const found = rangeConsoleData?.credentials.find(
        (creds) => creds.scenarioUUID === rangeData?.deployedScenarios[0],
      );

      if (found) {
        setUsername(found.username);
        setPassword(found.password);
      }

      setScenarioId(rangeData?.deployedScenarios[0]);
    } else {
      //console.log('[Scenario Wrapper] Disabled (no scenarios or console creds yet');
      setScenarioId(undefined);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rangeData.rangeId,
    rangeData.deployedScenarios.length,
    rangeConsoleData.credentials.length,
  ]);

  /**
   * UE initializes AU
   */
  useEffect(() => {
    if (!cmi5Instance.isAuthenticated) {
      // console.info(
      //   'AU Launch Data - CMI5 not authenticated yet, waiting...',
      //   initializationAttempt,
      // );
      setTimeout(() => {
        setInitializationAttempt(initializationAttempt + 1);
      }, 1000);
      return;
    }

    //OBE? setLaunchData(cmi5Instance.getLaunchData());
  }, [initializationAttempt]);

  return (
    <>
      {scenarioId ? (
        <ConsoleProvider
          isRouteRelative={true}
          routeDelim={routeDelim}
          key={scenarioId}
          guacUser={username}
          guacPassword={password}
          rangeId={rangeData?.rangeId}
          scenarioId={scenarioId}
          onScenarioEvent={async (eventType, scenarioIdParam, metadata) => {
            // Send LRS statement
            if (scenarioIdParam) {
              sendScenarioEventVerb(scenarioIdParam, eventType, metadata).catch(
                (error) => {
                  logger.warn(
                    'Failed to send scenario event LRS statement:',
                    { error },
                    'lms',
                  );
                },
              );
            }
          }}
        >
          <DataFetcher
            showIndicator={false}
            apiHook={useGetRangeResourceScenario}
            payload={{ id: scenarioId, rangeId: rangeData?.rangeId }}
            shouldSuppressToaster={false}
            onDataLoad={(data) => {
              // console.log('deployed scenario', data);
              dispatch(setStudentId(data.studentId));
            }}
            onError={undefined}
          />
          <ConsolesDisplay>
            <ScenarioUpdatesContextProvider
              key={scenarioId}
              filterScenarios={scenarioId}
              rangeIdSel={rangeData?.rangeId}
              scenarioIdSel={scenarioId}
            >
              {children}
            </ScenarioUpdatesContextProvider>
          </ConsolesDisplay>
        </ConsoleProvider>
      ) : (
        children
      )}
    </>
  );
}

export default ScenarioWrapper;
