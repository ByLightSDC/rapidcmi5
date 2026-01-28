/* eslint-disable react/jsx-no-useless-fragment */

/* CCMI5 Flavor */

import { useEffect, useMemo } from 'react';


/* MUI */
import { Alert } from '@mui/material';
import Box from '@mui/material/Box';

import TeamRangeResourceVMActionRow from './TeamRangeResourceVMActionRow';
import TeamRangeResourceContainerActionRow from './TeamRangeResourceContainerActionRow';
import { DeployedRangeConsole } from '@rangeos-nx/frontend/clients/devops-api';
import TeamRangeResourceAutoGraderActionActionRow from './TeamRangeResourceAutoGraderActionRow';
import AutoGraderProgressDisplay from './AutoGraderProgressDisplay';
import { DeployedAutoGrader, queryKeyRangeResourceVMs, Topic } from '@rangeos-nx/frontend/clients/hooks';
import { ListView, iListItemType, LoadingUi } from '@rapid-cmi5/ui';

/**
 * Displays Deployed Scenario VMs, Containers, and Autograders
 * @param {number} counter Change Counter
 * @param {number} counter2 Change Counter for Notifications
 * @param {number} consoleCounter Change Counter for Consoles
 * @param {string} isContextInitialized Title
 * @param {string} rangeId Title
 * @param {string} scenarioId Title
 * @param {string} [queryKey="range-resource-vms"] Query Key
 * @param {string} [title='VMs'] Title
 * @param {Topic.ResourceVM | Topic.ResourceContainer} [topic="ResourceVM"] Topic to display
 * @returns
 */
export default function RangeResources({
  counter,
  counter2,
  consoleCounter,
  getConsolesByOwner,
  isContextInitialized,
  rangeId,
  scenarioId,
  queryKey = queryKeyRangeResourceVMs,
  title = 'VMs',
  topic = Topic.ResourceVM,
  getUpdates,
}: {
  counter: number;
  counter2: number;
  consoleCounter: number;
  isContextInitialized: boolean;
  rangeId: string;
  scenarioId: string;
  queryKey?: string;
  title?: string;
  topic?: Topic.ResourceVM | Topic.ResourceContainer | Topic.ResourceAutoGrader;
  getConsolesByOwner: (
    deployedScenarioId: string,
    ownerUuid: string,
  ) => Partial<DeployedRangeConsole>[];
  getUpdates: (
    deployedScenarioId: string,
    topic?: Topic,
  ) => { [key: string]: any };
}) {
  /**
   * list data
   */
  const rows = useMemo(() => {
    return Object.values(getUpdates(scenarioId, topic));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId, getUpdates, topic, counter, counter2, consoleCounter]);

  /**
   * Counter updated when setUpdates called (typically from query)
   */
  useEffect(() => {
    //rerender when resource changes (query)
    //console.log('counter', counter);
  }, [counter]);

  /**
   * Counter updated when setUpdate called (typically from subscription)
   */
  useEffect(() => {
    //rerender when resource changes (subscription)
    // console.log('counter2', counter2);
  }, [counter2]);

  return (
    <>
      {rows.length > 0 ? (
        <>
          <div id="app-content" style={{ height: 'auto' }}>
            <Box
              className={'contentBox'}
              sx={{ paddingBottom: '0px' }}
              id={title}
            >
              {topic === Topic.ResourceVM && (
                <ListView
                  testId={queryKey}
                  items={rows}
                  renderItem={(itemUpdate: iListItemType, index?: number) => {
                    return (
                      <>
                        {itemUpdate && (
                          <TeamRangeResourceVMActionRow
                            consoleCounter={consoleCounter}
                            counter={counter}
                            data={itemUpdate}
                            getConsolesByOwner={getConsolesByOwner}
                            isTitleDisplay={index === -1}
                            primaryRowTitle={title}
                            rangeId={rangeId}
                            scenarioId={scenarioId}
                          />
                        )}
                      </>
                    );
                  }}
                  shouldShowColumnHeaders={true}
                />
              )}
              {topic === Topic.ResourceContainer && (
                <ListView
                  testId={queryKey}
                  items={rows}
                  renderItem={(itemUpdate: iListItemType, index?: number) => {
                    return (
                      <>
                        {itemUpdate && (
                          <TeamRangeResourceContainerActionRow
                            consoleCounter={consoleCounter}
                            counter={counter}
                            data={itemUpdate}
                            getConsolesByOwner={getConsolesByOwner}
                            isTitleDisplay={index === -1}
                            primaryRowTitle={title}
                            rangeId={rangeId}
                            scenarioId={scenarioId}
                          />
                        )}
                      </>
                    );
                  }}
                  shouldShowColumnHeaders={true}
                />
              )}
              {topic === Topic.ResourceAutoGrader && (
                <>
                  <AutoGraderProgressDisplay
                    deployedScenarioId={scenarioId}
                    counter2={counter2}
                  />
                  <ListView
                    testId={queryKey}
                    items={rows}
                    renderItem={(
                      itemUpdate: DeployedAutoGrader,
                      rowIndex?: number,
                    ) => {
                      return (
                        <>
                          {itemUpdate && (
                            <TeamRangeResourceAutoGraderActionActionRow
                              counter={counter}
                              data={itemUpdate}
                              isTitleDisplay={rowIndex === -1}
                              primaryRowTitle={title}
                              rowIndex={rowIndex}
                              scenarioId={scenarioId}
                            />
                          )}
                        </>
                      );
                    }}
                    shouldShowColumnHeaders={true}
                  />
                </>
              )}
            </Box>
          </div>
        </>
      ) : (
        <Box sx={{ margin: '12px' }}>
          {isContextInitialized ? (
            <Alert severity="info" sx={{ padding: '12px', maxWidth: '480px' }}>
              {topic === Topic.ResourceVM && 'No VMs Found'}
              {topic === Topic.ResourceContainer && 'No Containers Found'}
              {topic === Topic.ResourceAutoGrader && 'No Auto Graders Found'}
            </Alert>
          ) : (
            <LoadingUi />
          )}
        </Box>
      )}
    </>
  );
}
