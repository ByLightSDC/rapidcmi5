/* eslint-disable react/jsx-no-useless-fragment */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { defaultScenarioResourceData, ScenarioResources } from './types';
import {

  defaultSortOrder,
  getErrorMessageDetail,

  infiniteRecordLimit,

  queryHooksConfig,

  Topic,
} from '@rangeos-nx/frontend/clients/hooks';

import {
  DeployedRangeConsole,
  DevopsApiClient,
} from '@rangeos-nx/frontend/clients/devops-api';

import { routeDelim } from '../scenario/ScenarioConsoleTab';
import { sendScenarioEventVerb } from '../../utils/LmsStatementManager';
import { debugLog, debugLogError, logger } from '../../debug';

import { useCellValue } from '@mdxeditor/editor';
import { AuManagerContext } from '../../session/AuManager';
import { TeamConsolesContent, ScenarioSubmitResponse, ActivityScore, RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import { ConsoleProvider } from '../scenario/console/ConsoleContext';
import ConsolesDisplay from '../scenario/console/ConsolesDisplay';

interface iTeamConsolesContext {
  isContextInitialized: boolean;
  isEnabled: boolean;
  addListener: (
    listenerKey: string,
    callback: (topic: Topic, updates: any[]) => void,
  ) => void;
  getAutogradersPercentComplete: (deployedScenarioId: string) => number;
  getConsolesByOwner: (
    deployedScenarioId: string,
    ownerUuid: string,
  ) => Partial<DeployedRangeConsole>[];
  getInitialized: (deployedScenarioId: string, topic: Topic) => boolean;
  getUpdates: (
    deployedScenarioId: string,
    topic?: Topic,
  ) => { [key: string]: any };
  getScenario: (
    scenarioId: string,
    scenarioName?: string,
  ) => ScenarioResources | null;
  loadScenario: (
    scenarioId: string,
    scenarioName: string,
    activityId: string,
  ) => void;
  removeListener: (listenerKey: string) => void;
  setUpdate: (
    deployedScenarioId: string,
    data: any,
    topic: Topic,
    skipCounter?: boolean,
  ) => void;
  setUpdates: (
    deployedScenarioId: string,
    data: any[],
    topic: Topic,
    skipCounter?: boolean,
  ) => void;
  autoGraderStatusChangeCounter: number;
  consoleStatusChangeCounter: number;
  containerStatusChangeCounter: number;

  scenarioStatusChangeCounter: number;
  vmStatusChangeCounter: number;
  //initializationCounter: number;
  //setInitializationCounter: (counter: number) => void;
}

export const TeamConsolesContext = createContext<iTeamConsolesContext>(
  {} as iTeamConsolesContext,
);

/**
 * @interface tProviderProps
 * @property {*} [children] Children
 * @property {boolean} [isEnabled=true] Whether context is enabled
 * @property {boolean} [skipScenarioLoading=false] Whether to skip queries for scenario level (scenario/packages)
 */
interface tProviderProps {
  children?: any;
  isEnabled: boolean;
}

/**
 * Team context
 * loads one or more Scenarios and their resources (VMs, Containers, Consoles, and Autograders)
 * @param props
 * @returns
 */
export const TeamScenarioContextProvider: any = (props: tProviderProps) => {
  const { isEnabled, children } = props;
  const listeners = useRef<{
    [key: string]: (topic: Topic, output: any[]) => void;
  }>({});

  const { submitScore } = useContext(AuManagerContext);

  //array of loaded scenario data
  const scenarios = useRef<ScenarioResources[]>([]);
  //Counters By Topic
  const [autoGraderStatusChangeCounter, setAutoGraderStatusChangeCounter] =
    useState(0);
  const [consoleStatusChangeCounter, setConsoleStatusChangeCounter] =
    useState(0);
  const [containerStatusChangeCounter, setContainerStatusChangeCounter] =
    useState(0);
  const [scenarioStatusChangeCounter, setScenarioChangeCounter] = useState(0);
  const [vmStatusChangeCounter, setVmStatusChangeCounter] = useState(0);

  const [isContextInitialized, setIsContextInitialized] = useState(false);

  const placeHolderScenarioId = 'team';

  /**
   * Registry method for listening to update notifications
   * @param {string} listenerKey Listener's unique id
   * @param {(topic: Topic, updates: any[]) => void} callback Notification callback method
   */
  const addListener = (
    listenerKey: string,
    callback: (topic: Topic, updates: any[]) => void,
  ) => {
    listeners.current[listenerKey] = callback;
  };

  /**
   * Returns the list of consoles for given "owner"
   * @param {string} ownerUuid Id of console owner (container or VM)
   * @returns {Partial<DeployedRangeConsole>[]}
   */
  const getConsolesByOwner = (
    deployedScenarioId: string,
    ownerUuid: string,
  ) => {
    const theScenario = getScenarioByDeployedId(deployedScenarioId);
    if (theScenario === null) {
      return [];
    }

    let consoles: Partial<DeployedRangeConsole>[] = [];
    if (
      Object.prototype.hasOwnProperty.call(theScenario.ownedConsoles, ownerUuid)
    ) {
      consoles = theScenario.ownedConsoles[ownerUuid];
    }
    return consoles;
  };

  /**
   * Returns whether a scenario has autograders
   * @param deployedScenarioId
   * @returns
   */
  const getHasAutograders = (deployedScenarioId: string) => {
    const updates = getUpdates(deployedScenarioId, Topic.ResourceAutoGrader);
    return (
      updates && typeof updates === 'object' && Object.keys(updates).length > 0
    );
  };

  /**
   * Returns whether a scenario's topic has been initialized
   * Initialized means the records were queried
   * @param deployedScenarioId
   * @param topic
   * @returns
   */
  const getInitialized = (deployedScenarioId: string, topic: Topic) => {
    const theScenario = getScenarioByDeployedId(deployedScenarioId);
    if (
      theScenario &&
      Object.prototype.hasOwnProperty.call(theScenario.initialized, topic)
    ) {
      return true;
    }
    return false;
  };

  /**
   * Returns percent of autograders with results
   * @param deployedScenarioId
   * @returns
   */
  const getAutogradersPercentComplete = (deployedScenarioId: string) => {
    const graders = Object.values(
      getUpdates(deployedScenarioId, Topic.ResourceAutoGrader),
    );
    if (graders.length > 0) {
      let numComplete = 0;
      for (let i = 0; i < graders.length; i++) {
        if (graders[i].result?.success === true) {
          numComplete++;
        }
      }
      return (numComplete / (graders.length * 1.0)) * 100;
    }
    return -1;
  };

  /**
   * Retrieves scenario resources record by static scenario id and name
   * @param rangeId
   * @param scenarioId
   * @param scenarioName
   * @returns
   */
  const getScenario = useCallback(
    (scenarioId: string, scenarioName?: string) => {
      // load then
      // notify loaded
      // search by static scenario id
      let theScenarios = scenarios.current.filter(
        (s) => s.scenarioId === scenarioId,
      );
      // search less specific by name, for cases where content is playing back on a different system than it was authored on
      // TODO we may want to scope to RangeId here
      if (scenarioName && theScenarios.length === 0) {
        theScenarios = scenarios.current.filter(
          (s) => s.scenarioName === scenarioName,
        );
      }
      if (theScenarios.length > 0) {
        return theScenarios[0];
      }
      return null;
    },
    [],
  );

  /**
   * Retrieves scenario resources record by static scenario id and name
   * @param rangeId
   * @param scenarioId
   * @param scenarioName
   * @returns
   */
  const getScenarioByDeployedId = (deployedScenarioId: string) => {
    //load then
    //notify loaded
    // search by static scenario id
    const theScenarios = scenarios.current.filter(
      (s) => s.deployedScenarioId === deployedScenarioId,
    );

    if (theScenarios.length > 0) {
      return theScenarios[0];
    }
    return null;
  };

  /**
   * Graph Updates for all RangeOS objects in the Range/Deployed Scenario
   * @returns { [key: string]: any } Updates
   */
  const getUpdates = (deployedScenarioId: string, topic?: Topic) => {
    //REF console.log('[getUpdates] deployedScenarioId', deployedScenarioId);

    if (topic) {
      const theScenario = getScenarioByDeployedId(deployedScenarioId);
      if (theScenario === null) {
        debugLogError('no scenario found to update');
        return {};
      }
      if (
        Object.prototype.hasOwnProperty.call(theScenario.updatesByTopic, topic)
      ) {
        return theScenario.updatesByTopic[topic];
      }
      return [];
    }
    return {};
  };

  /**
   * store & notify record with status
   * @param data
   * @param topic
   * @param skipCounter Don't notify on updates
   */
  const setUpdate = useCallback(
    (
      deployedScenarioId: string,
      data: any,
      topic: Topic,
      skipCounter?: boolean,
      skipNotify?: boolean,
    ) => {
      // console.log('setUpdate ' + topic, data);

      const theScenario = getScenarioByDeployedId(deployedScenarioId);
      if (theScenario === null) {
        console.log('no scenario found to update' + deployedScenarioId);
        return;
      }

      theScenario.updates[data.uuid] = data;
      if (
        !Object.prototype.hasOwnProperty.call(theScenario.updatesByTopic, topic)
      ) {
        theScenario.updatesByTopic[topic] = {};
      }

      theScenario.updatesByTopic[topic][data.uuid] = data;

      // handle special additional processing for some topics
      if (topic === Topic.ResourceConsole) {
        //In addition to storing status, also stores relationship with vm or container owner
        setConsoleByOwner(theScenario, data);
      } else if (topic === Topic.ResourcePackage) {
        // sort by VMs and Containers by uuid so display order will be consistent
        if (data.vmSpecifications && data.vmSpecifications.length > 1) {
          data.vmSpecifications.sort((a: any, b: any) =>
            a.uuid > b.uuid ? 1 : b.uuid > a.uuid ? -1 : 0,
          );
        }
        if (
          data.containerSpecifications &&
          data.containerSpecifications.length > 1
        ) {
          data.containerSpecifications.sort((a: any, b: any) =>
            a.uuid > b.uuid ? 1 : b.uuid > a.uuid ? -1 : 0,
          );
        }
        theScenario.updates[data.uuid] = data;
      } else if (topic === Topic.ResourceAutoGrader) {
        if (theScenario.initialized[Topic.ResourceAutoGrader]) {
          submitAutoGraderScores(
            {
              uuid: theScenario.deployedScenarioId || '',
              name: theScenario.scenarioName,
            },
            theScenario,
          );
        }
      }

      //console.log(' theScenario.updatesByTopic', theScenario);

      if (skipCounter) {
        return;
      }
      notifyUpdates(topic, [data]);
    },
    [],
  );

  const loadScenario = useCallback(
    async (scenarioId: string, scenarioName: string, rc5Id: string) => {
      if (!queryHooksConfig.headers.Authorization) {
        debugLogError('Missing creds');
        return;
      }

      //console.log('loadScenario', scenarios.current);
      const loadedScenario = getScenario(scenarioId, scenarioName);
      if (loadedScenario !== null) {
        return;
      }

      let matchingDeployedScenarios: any = null;

      try {
        //get all ranges
        const rangeResponse = await DevopsApiClient.rangeList(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined, // cmi5Key
          undefined,
          infiniteRecordLimit,
          undefined,
          undefined,
          undefined,
          queryHooksConfig,
        );
        const allRanges = rangeResponse.data.data;
        if (!allRanges) {
          debugLogError('No Ranges Found');
          return;
        }

        // search each range for scenario by matching name
        let isFinding = true;
        let counter = 0;
        let theRangeId: string | undefined = undefined;
        do {
          theRangeId = allRanges[counter].uuid;
          if (theRangeId) {
            try {
              //find deployed scenarios with matching name
              matchingDeployedScenarios =
                await DevopsApiClient.scenariosListByRangeId(
                  theRangeId,
                  undefined,
                  scenarioName,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  infiniteRecordLimit,
                  undefined,
                  undefined,
                  defaultSortOrder,
                  undefined,
                  queryHooksConfig,
                );
              if (
                matchingDeployedScenarios?.data?.data &&
                matchingDeployedScenarios.data.data.length > 0
              ) {
                isFinding = false;
              }
            } catch (e: any) {
              //do nothing, check the next scenario
            }
          }
          counter++;
        } while (isFinding && counter < allRanges.length);

        if (
          !theRangeId ||
          !matchingDeployedScenarios?.data?.data ||
          matchingDeployedScenarios.data.data.length === 0
        ) {
          console.log(`No Scenario Found name=${scenarioName}`);
          return;
        } else {
          console.log(
            `Scenario Found name=${scenarioName} range=${theRangeId}`,
          );
        }

        //use the first returned
        const deployedScenarioId = matchingDeployedScenarios.data.data[0].uuid;
        if (deployedScenarioId) {
          const foundIndex = scenarios.current.findIndex(
            (s) => s.deployedScenarioId === deployedScenarioId,
          );

          if (foundIndex >= 0) {
            // console.log('already stored, update only', foundIndex);
          } else {
            const newScenario = {
              ...structuredClone(defaultScenarioResourceData),
              rangeId: theRangeId,
              activityId: rc5Id,
              scenarioId: scenarioId,
              scenarioName: scenarioName,
              deployedScenarioId: deployedScenarioId,
            };
            scenarios.current.push(newScenario);
          }

          setUpdate(
            deployedScenarioId,
            matchingDeployedScenarios.data.data[0],
            Topic.Scenario,
          );
        } else {
          console.log(
            `Scenario Missing uuid name=${scenarioName} range=${theRangeId}`,
          );
        }
      } catch (error: any) {
        debugLog('error loading scenarios');
        debugLogError(error);

        //add detail for context
        throw getErrorMessageDetail(
          error,
          `An error occurred retrieving the Scenario named ${scenarioName}`,
          true,
        );
      }
    },
    [getScenario, setUpdate],
  );

  const notifyUpdates = (topic: Topic, updates: any[]) => {
    if (listeners.current && typeof listeners.current === 'object') {
      const listenerKeys = Object.keys(listeners.current);
      for (let i = 0; i < listenerKeys.length; i++) {
        const callback = listeners.current[listenerKeys[i]];
        if (callback) {
          callback(topic, updates);
        }
      }
    }
  };

  /**
   * Method for unregistering from update notifications
   * @param {string} listenerKey Listener's unique id
   */
  const removeListener = (listenerKey: string) => {
    delete listeners.current[listenerKey];
  };

  /**
   * Maintains list of consoles by VM or Container uuid so status is current
   * @param {Partial<DeployedRangeConsole>} console Console being updated
   */
  const setConsoleByOwner = (scenario: ScenarioResources, console: any) => {
    const consoleItem: Partial<DeployedRangeConsole> = {
      ...console,
    };

    const ownerKey = console.rangeContainer
      ? console.rangeContainer
      : console.rangeVM;
    if (ownerKey) {
      if (
        !Object.prototype.hasOwnProperty.call(scenario.ownedConsoles, ownerKey)
      ) {
        scenario.ownedConsoles[ownerKey] = [consoleItem];
      } else {
        // add or update console data in array
        let consoleIndex = -1;
        if (scenario.ownedConsoles[ownerKey].length > 0) {
          const currentConsoles = Object.values(
            scenario.ownedConsoles[ownerKey],
          );
          consoleIndex = currentConsoles.findIndex(
            (item) => item.uuid === console.uuid,
          );
        }
        if (consoleIndex >= 0) {
          scenario.ownedConsoles[ownerKey][consoleIndex] =
            // new = {..old, ..updated}
            scenario.ownedConsoles[ownerKey][consoleIndex] = {
              ...scenario.ownedConsoles[ownerKey][consoleIndex],
              ...consoleItem,
            };
        } else {
          scenario.ownedConsoles[ownerKey].push(consoleItem);
        }
      }
    }
  };

  /**
   * submit auto grader scores
   * @param {TeamConsolesContent} content Slide Content
   * @param {ScenarioResources} scenario Loaded Scenario and its resources
   */
  const submitAutoGraderScores = (
    content: TeamConsolesContent,
    scenario: ScenarioResources,
  ) => {
    let completedTasks = 0;
    let totalTasks = 0;
    let allCompleted = true;

    const obj = scenario.updatesByTopic[Topic.ResourceAutoGrader];
    if (obj && typeof obj === 'object' && obj !== null) {
      const kk = Object.keys(obj);
      if (kk?.length > 0) {
        for (let i = 0; i < kk.length; i++) {
          if (obj[kk[i]].result?.success) {
            completedTasks++;
          }
        }
        totalTasks = kk.length;
        allCompleted = completedTasks >= totalTasks;
      }
    }

    const scoreData: ScenarioSubmitResponse = {
      completedTasks,
      totalTasks,
      allCompleted,
      autoGraderResults: [], // Could include detailed results if needed
    };

    // Ensure the scenario content has the UUID that matches the parsed markdown
    // The scenarioContent should already have the correct uuid from the markdown
    const enrichedScenarioContent = {
      ...content,
      // Make sure we have the uuid field that the getActivityId function looks for
      uuid: scenario?.scenarioId || content?.rc5id,
    };

    const activityScore: ActivityScore = {
      activityType: RC5ActivityTypeEnum.consoles,
      activityContent: enrichedScenarioContent,
      scoreData,
    };

    if (submitScore) {
      submitScore(activityScore);
    }
  };

  /**
   * store & notify records with a status
   * @param data
   * @param topic
   * @param skipCounter Don't notify on updates
   */
  const setUpdates = (
    deployedScenarioId: string,
    data: any[],
    topic: Topic,
    skipCounter = true,
  ) => {
    for (let i = 0; i < data.length; i++) {
      setUpdate(deployedScenarioId, data[i], topic, skipCounter);
    }

    //update initialized value
    const theScenario = getScenarioByDeployedId(deployedScenarioId);
    if (theScenario !== null) {
      if (
        topic === Topic.ResourceAutoGrader &&
        !theScenario.initialized[topic]
      ) {
        if (data.length === 0) {
          submitAutoGraderScores(
            {
              uuid: theScenario.deployedScenarioId || '',
              name: theScenario.scenarioName,
            },
            theScenario,
          );
        }
      }

      theScenario.initialized[topic] = true;

      //we dont need to wait for autograders, they can pop in
      if (
        theScenario.initialized[Topic.ResourceVM] &&
        theScenario.initialized[Topic.ResourceContainer] &&
        theScenario.initialized[Topic.ResourceConsole] &&
        theScenario.initialized[Topic.ResourceAutoGrader]
      ) {
        setIsContextInitialized(true);
      }
    }

    if (!skipCounter) {
      switch (topic) {
        case Topic.ResourceAutoGrader:
          setAutoGraderStatusChangeCounter((currentCounter) => {
            return currentCounter + 1;
          });
          break;
        case Topic.ResourceConsole:
          setConsoleStatusChangeCounter((currentCounter) => {
            return currentCounter + 1;
          });
          break;
        case Topic.ResourceContainer:
          setContainerStatusChangeCounter((currentCounter) => {
            return currentCounter + 1;
          });
          break;
        case Topic.ResourceScenario:
          setScenarioChangeCounter((currentCounter) => {
            return currentCounter + 1;
          });
          break;
        case Topic.ResourceVM:
          setVmStatusChangeCounter((currentCounter) => {
            return currentCounter + 1;
          });
          break;
      }
    }
  };

  const firstLoadedScenario = useMemo(() => {
    if (scenarios.current.length > 0) {
      if (scenarios.current[0].deployedScenarioId) {
        return scenarios.current[0];
      }
      return scenarios.current[0];
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioStatusChangeCounter]);

  useEffect(() => {
    debugLog('Team Consoles Context');
  }, []);

  return (
    <TeamConsolesContext.Provider
      value={{
        addListener,
        getAutogradersPercentComplete,
        getConsolesByOwner,
        getInitialized,
        getScenario,
        getUpdates,
        isContextInitialized: isContextInitialized,
        isEnabled,
        loadScenario,
        removeListener,
        setUpdate,
        setUpdates,
        autoGraderStatusChangeCounter,
        consoleStatusChangeCounter,
        containerStatusChangeCounter,
        scenarioStatusChangeCounter,
        vmStatusChangeCounter,
      }}
    >
      <ConsoleProvider
        isRouteRelative={true}
        routeDelim={routeDelim}
        key={placeHolderScenarioId}
        rangeId={'placeholder'}
        scenarioId={
          firstLoadedScenario?.deployedScenarioId || placeHolderScenarioId
        }
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
        <ConsolesDisplay>{children}</ConsolesDisplay>
      </ConsoleProvider>
      )
    </TeamConsolesContext.Provider>
  );
};
