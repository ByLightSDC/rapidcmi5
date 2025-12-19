/* eslint-disable @typescript-eslint/no-explicit-any */

/* CMI5 Player Flavor */

import { createContext, useRef, useState } from 'react';

import {
  DeployedPackageDetail,
  DeployedRangeConsole,
  DeployedScenario,
} from '@rapid-cmi5/ui/branded';
import { Topic } from '@rapid-cmi5/ui/branded';
import ContainerUpdates from './graph/ContainerUpdates';
import ConsoleUpdates from './graph/ConsoleUpdates';
import ScenarioUpdates from './graph/ScenarioUpdates';
import VMUpdates from './graph/VMUpdates';

// the graphql data returned (based on DeployedScenario with additional package details)

export interface DeployedScenarioData extends Partial<DeployedScenario> {
  packages: Partial<DeployedPackageDetail>[];
}

/**
 * @interface iScenarioUpdatesContext
 * @property {boolean} isContextInitialized Whether content has been initialized (all initial data processed)
 * @property {boolean} isEnabled Whether context is enabled
 * @property {number} initializationChange Tracks number of items intialized
 * @property {number} consoleStatusChangeCounter Tracks updates to consoles
 * @property {number} containerStatusChangeCounter Tracks updates to containers
 * @property {number} vmStatusChangeCounter Tracks updates to vms
 * @property {string} blockingErrorMsg Error Message from retrieving scenario data which blocks display of rest of data('' if no error)
 * @property { (ownerUuid: string) => Partial<DeployedRangeConsole>[]} getConsolesByOwner Method to get list of Consoles for given owner (container or VM)
 * @property { (topic: Topic) => number} getLastAddTimeByTopic Method to retrieve last time record was added for given topic
 * @property {string} rangeId Returns current range ID
 * @property {string} scenarioId Returns current scenario ID
 * @property {uuid: string => any} getUpdate Method to get current data for resource with given uuid
 * @property {() => {[key: string]any} } getUpdates Method to return ALL current resource data items
 * @property {(topic: Topic, errorMsg: string) => void} setErrorMsg Method to call to set query error msg for a given topic
 * @property {(topic: Topic, isInitialized: boolean) => void } setInitialized Method to set initialization for a given topic
 * @property {(data: any, topic: Topic) => void} setUpdate Method to update resource data for given item / topic
 * @property {(data: any[], topic: Topic, skipCounter?: boolean) => void} setUpdates Method to update a list of resources for given topic
 * @property {} addListener {(listenerKey: string, callback: (topic: Topic, updates: any[]) => void) => void}
 * @property {} removeListener {(listenerKey: string) => void}
 */
interface iScenarioUpdatesContext {
  isContextInitialized: boolean;
  isEnabled: boolean;
  initializationChange: number;
  consoleStatusChangeCounter: number;
  containerStatusChangeCounter: number;
  scenarioStatusChangeCounter: number;
  vmStatusChangeCounter: number;
  blockingErrorMsg: string;
  getConsolesByOwner: (ownerUuid: string) => Partial<DeployedRangeConsole>[];
  getLastAddTimeByTopic: (topic: Topic) => number;
  getUpdate: (uuid: string) => any;
  getUpdates: (topic?: Topic) => { [key: string]: any };
  rangeId: string;
  scenarioId: string;
  setErrorMsg: (topic: Topic, errorMsg: string) => void;
  setInitialized: (topic: Topic, isInitialized: boolean) => void;
  setUpdate: (data: any, topic: Topic) => void;
  setUpdates: (data: any[], topic: Topic, skipCounter?: boolean) => void;
  addListener: (
    listenerKey: string,
    callback: (topic: Topic, updates: any[]) => void,
  ) => void;
  removeListener: (listenerKey: string) => void;
}

/** @constant
 * Context for Range Scenario (packages)
 *  @type {React.Context<iScenarioUpdatesContext>}
 */
export const ScenarioUpdatesContext = createContext<iScenarioUpdatesContext>(
  {} as iScenarioUpdatesContext,
);

/**
 * @interface tProviderProps
 * @property {*} [children] Children
 * @property {boolean} [isEnabled=true] Whether context is enabled
 * @property {boolean} [skipScenarioLoading=false] Whether to skip queries for scenario level (scenario/packages)
 */
interface tProviderProps {
  children?: any;
  filterScenarios: string[];
  isEnabled?: boolean;
  rangeIdSel: string;
  scenarioIdSel: string;
  skipScenarioLoading?: boolean;
}

/**
 * React context for Deployed Scenario
 * Tracks changes to packages, vms, containers
 * Stores user preferences for things like netmap settings
 * @param {tProviderProps} props Component props
 * @return {JSX.Element} React context
 */
export const ScenarioUpdatesContextProvider: any = (props: tProviderProps) => {
  const {
    children,
    filterScenarios,
    isEnabled = true,
    rangeIdSel,
    scenarioIdSel,
    skipScenarioLoading = false,
  } = props;

  //Counters By Topic
  const [consoleStatusChangeCounter, setConsoleStatusChangeCounter] =
    useState(0);
  const [containerStatusChangeCounter, setContainerStatusChangeCounter] =
    useState(0);
  const [initializationChange, setInitializatonChange] = useState(0);
  const [scenarioStatusChangeCounter, setScenarioChangeCounter] = useState(0);
  const [vmStatusChangeCounter, setVmStatusChangeCounter] = useState(0);
  const [blockingErrorMsg, setBlockingErrorMsg] = useState('');

  //Initialization By Topic
  const initialized = useRef<{ [key: string]: boolean }>({
    [Topic.ResourceScenario]: skipScenarioLoading,
    [Topic.ResourceVM]: false,
    [Topic.ResourceContainer]: false,
    [Topic.ResourceConsole]: false,
  });

  const ownedConsoles = useRef<{
    [key: string]: Partial<DeployedRangeConsole>[];
  }>({});

  //all status
  //to find root scenario, getUpdate(getScenarioId())
  const updates = useRef<{ [key: string]: any }>({});
  const updatesByTopic = useRef<{ [topic: string]: { [key: string]: any } }>(
    {},
  );
  const lastAddedByTopic = useRef<{ [topic: string]: number }>({});

  const listeners = useRef<{
    [key: string]: (topic: Topic, output: any[]) => void;
  }>({});

  //#region Getters
  /**
   * Returns the last time that a record was added for given topic
   * @param {Topic} topic
   * @returns time of last add
   */
  const getLastAddTimeByTopic = (topic: Topic) => {
    if (Object.prototype.hasOwnProperty.call(lastAddedByTopic.current, topic)) {
      return lastAddedByTopic.current[topic];
    }
    return 0;
  };

  /**
   * Graph Updates for a Range OS object in the Range/Deployed Scenario
   * @param {string} uuid RangeOS object id
   * @returns {*} RangeOS update for object
   */
  const getUpdate = (uuid: string) => {
    if (Object.prototype.hasOwnProperty.call(updates.current, uuid)) {
      return updates.current[uuid];
    }
    return undefined;
  };

  /**
   * Graph Updates for all RangeOS objects in the Range/Deployed Scenario
   * @returns { [key: string]: any } Updates
   */
  const getUpdates = (topic?: Topic) => {
    if (topic) {
      if (Object.prototype.hasOwnProperty.call(updatesByTopic.current, topic)) {
        return updatesByTopic.current[topic];
      }
      return [];
    }
    return updates.current;
  };

  /**
   * Returns the list of consoles for given "owner"
   * @param {string} ownerUuid Id of console owner (container or VM)
   * @returns {Partial<DeployedRangeConsole>[]}
   */
  const getConsolesByOwner = (ownerUuid: string) => {
    let consoles: Partial<DeployedRangeConsole>[] = [];
    if (
      Object.prototype.hasOwnProperty.call(ownedConsoles.current, ownerUuid)
    ) {
      consoles = ownedConsoles.current[ownerUuid];
    }
    return consoles;
  };

  //#endregion

  /**
   * Notify when graph subscription updates occur
   * @param {Topic} topic Topic updated
   * @param {any[]} updates List of updates that occurred
   */
  const notifyUpdates = (topic: Topic, updates: any[]) => {
    const listenerKeys = Object.keys(listeners.current);
    for (let i = 0; i < listenerKeys.length; i++) {
      const callback = listeners.current[listenerKeys[i]];
      if (callback) {
        callback(topic, updates);
      }
    }
  };

  //#Region Setters
  /**
   * Maintains list of consoles by VM or Container uuid so status is current
   * @param {Partial<DeployedRangeConsole>} console Console being updated
   */
  const setConsoleByOwner = (console: any) => {
    const consoleItem: Partial<DeployedRangeConsole> = {
      ...console,
    };

    const ownerKey = console.rangeContainer
      ? console.rangeContainer
      : console.rangeVM;
    if (ownerKey) {
      if (
        !Object.prototype.hasOwnProperty.call(ownedConsoles.current, ownerKey)
      ) {
        ownedConsoles.current[ownerKey] = [consoleItem];
      } else {
        // add or update console data in array
        let consoleIndex = -1;
        if (ownedConsoles.current[ownerKey].length > 0) {
          const currentConsoles = Object.values(
            ownedConsoles.current[ownerKey],
          );
          consoleIndex = currentConsoles.findIndex(
            (item) => item.uuid === console.uuid,
          );
        }
        if (consoleIndex >= 0) {
          ownedConsoles.current[ownerKey][consoleIndex] =
            // new = {..old, ..updated}
            ownedConsoles.current[ownerKey][consoleIndex] = {
              ...ownedConsoles.current[ownerKey][consoleIndex],
              ...consoleItem,
            };
        } else {
          ownedConsoles.current[ownerKey].push(consoleItem);
        }
      }
    }
  };

  const setErrorMsg = (topic: Topic, errorMsg: string) => {
    switch (topic) {
      // blocking errors
      case Topic.ResourcePackage:
      case Topic.ResourceScenario:
      case Topic.Scenario: // netmap scenario
        setBlockingErrorMsg(errorMsg);
        break;
    }
  };

  const setInitialized = (topic: Topic, isInitialized: boolean) => {
    switch (topic) {
      case Topic.ResourcePackage:
      case Topic.ResourceScenario:
      case Topic.ResourceContainer:
      case Topic.ResourceVM:
      case Topic.ResourceConsole:
        initialized.current[topic] = isInitialized;
        break;
    }
    setInitializatonChange(initializationChange + 1);
    // console.log('initialized', initialized.current);
  };

  /**
   * store & notify records with a status
   * @param data
   * @param topic
   * @param skipCounter Don't notify on updates
   */
  const setUpdates = (data: any[], topic: Topic, skipCounter = true) => {
    // console.log('MULTI setUpdates ' + topic, data);
    for (let i = 0; i < data.length; i++) {
      setUpdate(data[i], topic, skipCounter);
    }

    if (!skipCounter) {
      switch (topic) {
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

  /**
   * store & notify record with status
   * @param data
   * @param topic
   * @param skipCounter Don't notify on updates
   */
  const setUpdate = (
    data: any,
    topic: Topic,
    skipCounter?: boolean,
    skipNotify?: boolean,
  ) => {
    // console.log('setUpdate ' + topic, data);

    //Filter
    if (topic === Topic.Scenario) {
      if (!filterScenarios.includes(data.uuid)) {
        return;
      }
    }
    let isNew = false;
    updates.current[data.uuid] = data;
    if (!Object.prototype.hasOwnProperty.call(updatesByTopic.current, topic)) {
      isNew = true;
      updatesByTopic.current[topic] = {};
    } else if (
      !Object.prototype.hasOwnProperty.call(
        updatesByTopic.current[topic],
        data.uuid,
      )
    ) {
      isNew = true;
    }
    updatesByTopic.current[topic][data.uuid] = data;

    // handle special additional processing for some topics
    if (topic === Topic.ResourceConsole) {
      //In addition to storing status, also stores relationship with vm or container owner
      setConsoleByOwner(data);
    }

    if (topic === Topic.ResourcePackage) {
      //when a new package is added

      // sort by VMs and Containers by uuid so display order will be consistent
      updates.current[data.uuid] = data;
    }

    if (skipCounter) {
      return;
    }
    switch (topic) {
      case Topic.ResourceConsole:
        setConsoleStatusChangeCounter((currentCounter) => {
          return currentCounter + 1;
        });
        notifyUpdates(topic, [data]);
        break;
      case Topic.ResourceContainer:
        setContainerStatusChangeCounter((currentCounter) => {
          return currentCounter + 1;
        });
        notifyUpdates(topic, [data]);
        break;
      case Topic.ResourceScenario:
        setScenarioChangeCounter((currentCounter) => {
          return currentCounter + 1;
        });
        notifyUpdates(topic, [data]);
        break;
      case Topic.ResourceVM:
        setVmStatusChangeCounter((currentCounter) => {
          return currentCounter + 1;
        });
        notifyUpdates(topic, [data]);
        break;
    }

    if (isNew) {
      lastAddedByTopic.current[topic] = new Date().getTime();
    }
  };
  //#endregion

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
   * Method for unregistering from update notifications
   * @param {string} listenerKey Listener's unique id
   */
  const removeListener = (listenerKey: string) => {
    delete listeners.current[listenerKey];
  };

  return (
    <ScenarioUpdatesContext.Provider
      value={{
        addListener,
        isContextInitialized:
          initialized.current[Topic.ResourceScenario] &&
          initialized.current[Topic.ResourceVM] &&
          initialized.current[Topic.ResourceContainer] &&
          initialized.current[Topic.ResourceConsole],
        initializationChange: initializationChange,
        isEnabled: isEnabled,
        consoleStatusChangeCounter,
        containerStatusChangeCounter,
        scenarioStatusChangeCounter,
        vmStatusChangeCounter,
        blockingErrorMsg,
        getConsolesByOwner,
        getLastAddTimeByTopic,
        getUpdate,
        getUpdates,
        rangeId: rangeIdSel,
        scenarioId: scenarioIdSel,
        removeListener,
        setErrorMsg,
        setInitialized,
        setUpdate,
        setUpdates,
      }}
    >
      {rangeIdSel && scenarioIdSel && (
        <ScenarioUpdates rangeId={rangeIdSel} scenarioId={scenarioIdSel} />
      )}
      {rangeIdSel &&
        scenarioIdSel &&
        initialized.current[Topic.ResourceScenario] && (
          <>
            <ConsoleUpdates rangeId={rangeIdSel} scenarioId={scenarioIdSel} />
            <ContainerUpdates rangeId={rangeIdSel} scenarioId={scenarioIdSel} />
            <VMUpdates rangeId={rangeIdSel} scenarioId={scenarioIdSel} />
          </>
        )}
      {children}
    </ScenarioUpdatesContext.Provider>
  );
};
