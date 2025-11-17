/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

/* MUI */
import Alert, { AlertColor } from '@mui/material/Alert';
import Box from '@mui/material/Box';

import {
  debugLog,
  debugLogError,
  debugLogObj,
  debugLogWarning,
} from '../utility/logger';
import { useQueryClient } from 'react-query';

/**
 * @typedef {Object} BulkDeleteActionInput
 * @property {*[]} itemList Item(s) to be deleted
 * @property {string} processId
 * @property {string} topicId Topic being processed
 * @property {*} deleteQuery Hook to call to delete item(s)
 * @property {*} queryKey Hook query key for invalidating query after deletion(s)
 * @property {*} [meta] Additional meta passed through system
 */
export type BulkDeleteActionInput = {
  itemList: any[];
  processId: string;
  topicId: string;
  deleteQuery: any;
  queryKey: string;
  meta?: any;
};

/**
 * @typedef {Object} BulkDeleteActionOutput
 * @property {string} topicId Topic being processed
 * @property {*} [meta] Meta passed through system
 * @property {string} processId
 * @property {boolean} [isComplete] Whether process is complete
 * @property {number} errorCount Error count
 * @property {number} successCount Success Count
 * @property {number} totalCount Total Count
 * @property {any[]} itemList List of items to be deleted
 * @property { [key: string]: any} outputErrors Error details by asset uuid
 * @property { [key: string]: any} outputs Success payloads by asset uuid
 */
export type BulkDeleteActionOutput = {
  topicId: string;
  meta?: any;
  processId: string;
  isComplete?: boolean;
  errorCount: number;
  successCount: number;
  totalCount: number;
  itemList: any[];
  outputErrors: { [key: string]: { [key: string]: any } };
  outputs: { [key: string]: { [key: string]: any } };
};

enum AlertHeaderText {
  InProgress = 'Bulk Delete in Progress',
  Successful = 'Bulk Delete Completed Successfully',
  Errored = 'Bulk Delete Failed!',
}
/**
 * @interface IBulkDeleteActionContext
 * @property {{ (processId: string) => BulkDeleteActionOutput | null}} getOutput Retrieve package output
 * @property {(
    inputList: any[],
    topicId: string,
    deleteQuery: any,
    queryKey: string,
    meta?: any,
    reqProcessId?: string
  ) => string} createProcess Initiate processing to delete item(s)
 * @property {(
    listenerKey: string,
    callback: (processId: string, output: BulkDeleteActionOutput) => void
  ) => void} addListener Register for process cue events
 * @property {(listenerKey: string) => void} removeListener Unregister from process cue
 */
interface IBulkDeleteActionContext {
  getOutput: (processId: string) => BulkDeleteActionOutput | null;
  createProcess: (
    inputList: any[],
    topicId: string,
    deleteQuery: any,
    queryKey: string,
    meta?: any,
    reqProcessId?: string,
  ) => string;
  addListener: (
    listenerKey: string,
    callback: (processId: string, output: BulkDeleteActionOutput) => void,
  ) => void;
  removeListener: (listenerKey: string) => void;
  getBulkDeleteActionOutputs: () => any;
}

/**
 * BulkDeleteActionContext encapsulates the action to execute API calls in order to delete selected item(s)
 * @return {IBulkDeleteActionContext} React Context
 */
export const BulkDeleteActionContext = createContext<IBulkDeleteActionContext>({
  getOutput: (processId: string) => null,
  createProcess: (
    inputList: any[],
    topicId: string,
    deleteQuery: any,
    queryKey: string,
    meta?: any,
    reqProcessId?: string,
  ) => '',
  addListener: (
    listenerKey: string,
    callback: (processId: string, output: BulkDeleteActionOutput) => void,
  ) => {},
  removeListener: (listenerKey: string) => {},
  getBulkDeleteActionOutputs: () => {},
});

/**
 * @interface IProviderProps
 * @property {*} [children] Children
 */
interface IProviderProps {
  children?: JSX.Element;
}

/**
 * BulkDeleteActionContextProvider
 * Executes API calls in order to delete selected topic item(s)
 * @param {IProviderProps} props
 * @returns
 */
export const BulkDeleteActionContextProvider: any = (props: IProviderProps) => {
  const { children } = props;
  const queryClient = useQueryClient();
  const [changeCounter, setIsChangeCounter] = useState(0);
  const [isGoing, setIsGoing] = useState(false);
  const [alertDisplayType, setAlertDisplayType] = useState('none');
  const [alertHeaderText, setAlertHeaderText] = useState(
    AlertHeaderText.InProgress,
  );
  const [alertText, setAlertText] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('warning');

  const listeners = useRef<{
    [key: string]: (processId: string, output: BulkDeleteActionOutput) => void;
  }>({});
  const process = useRef<BulkDeleteActionInput | null | undefined>(null);

  const outputs = useRef<{ [key: string]: BulkDeleteActionOutput }>({});
  const cuer = useRef<BulkDeleteActionInput[]>([]);

  const getTotalCountText = (topic: string, totalCount: number) => {
    return `${totalCount} ${topic}${totalCount > 1 ? 's' : ''}`;
  };

  //#region getters
  /**
   * Get outputs
   * @returns
   */
  const getBulkDeleteActionOutputs = () => {
    return outputs.current;
  };

  /**
   * Returns API output for process
   * @param {string} processId Package Id
   * @returns BulkDeleteActionOutput
   */
  const getOutput = (processId: string) => {
    return Object.prototype.hasOwnProperty.call(outputs.current, processId)
      ? outputs.current[processId]
      : null;
  };
  //#endregion

  /**
   * Method to delete API data by topic and uuid
   * @param {string} uuid API data record uuid
   * @param {string} topicId API topic
   * @param {*} deleteQuery API hook to call for
   * @param{*} [deletePayload] optional additional payload for delete hook
   * @returns
   */
  const deleteItem = async (
    uuid: string,
    topicId: string,
    deleteQuery: any,
    deletePayload?: any,
  ) => {
    if (deleteQuery) {
      // eslint-disable-next-line no-useless-catch
      try {
        const payload = deletePayload ? { uuid: uuid, ...deletePayload } : uuid;
        const response = await deleteQuery.mutateAsync(payload);

        return response.data;
      } catch (error: any) {
        throw error;
      }
    }
    // This should not happen -- it means apiTopicsHookData is missing info for this topic
    console.log(
      '*************** missing apihook to delete for topic: ' + topicId,
    );
    return null;
  };

  /**
   * Creates process to delete the given item(s)
   * Creates process and output, adds process to cue
   * @param {*[]} inputList Item(s) to delete
   * @param {string} topicId Topic being processed
   * @param {*} deleteQuery Hook to call to delete item(s) -- must be passed in because it has to be set up in a react component
   * @param {*} [meta] Additional information listeners need to process after event complete
   * @param {string} [reqProcessId] Requested process id
   * @returns {string} Process Id
   */
  const createProcess = (
    inputList: any[],
    topicId: string,
    deleteQuery: any,
    queryKey: string,
    meta?: any,
    reqProcessId?: string,
  ) => {
    const processId = reqProcessId || uuidv4();
    const process: BulkDeleteActionInput = {
      itemList: inputList,
      processId,
      topicId,
      deleteQuery,
      queryKey,
      meta,
    };
    const output: BulkDeleteActionOutput = {
      topicId,
      meta,
      itemList: inputList,
      processId,
      errorCount: 0,
      successCount: 0,
      totalCount: inputList.length || 0,
      outputErrors: {},
      outputs: {},
    };

    if (!Object.isExtensible(outputs.current)) {
      debugLogWarning('[BDAC] createProcess Attempting to avoid script error');
      const newRegistry = { ...outputs.current };
      outputs.current = newRegistry;
    }
    debugLog('[BDAC] create process', processId);
    outputs.current[processId] = output;

    const theCue = [...cuer.current];
    theCue.push(process);
    cuer.current = theCue;
    setIsChangeCounter(changeCounter + 1);
    return processId;
  };

  /**
   * Register for completed processes
   * @param {string} listenerKey
   * @param {(processId: string, output: BulkDeleteActionOutput) => void} callback
   */
  const addListener = (
    listenerKey: string,
    callback: (processId: string, output: BulkDeleteActionOutput) => void,
  ) => {
    listeners.current[listenerKey] = callback;
  };

  /**
   * Unregister listening for completed processes
   * @param {string} listenerKey
   */
  const removeListener = (listenerKey: string) => {
    delete listeners.current[listenerKey];
  };

  /**
   * Retrieves files, adds them to outputs, and checks for process completion
   * @param processId
   * @param sourceData
   */
  const doAPIAction = async (processId: string, sourceData: any) => {
    debugLog('doAPIAction', processId);
    try {
      const apiData = await deleteItem(
        sourceData.uuid,
        sourceData.topic,
        sourceData.deleteQuery,
        sourceData.meta?.deletePayload,
      );
      //set success
      debugLog('processId', processId);
      if (Object.prototype.hasOwnProperty.call(outputs.current, processId)) {
        outputs.current[processId].successCount++;
        outputs.current[processId].outputs[sourceData.uuid] = apiData;
      } else {
        debugLogError('[BDAC] missing process after success ' + processId);
        return;
      }
    } catch (error: any) {
      debugLogError('[BDAC] error');
      debugLogObj(error);
      if (Object.prototype.hasOwnProperty.call(outputs.current, processId)) {
        outputs.current[processId].errorCount++;
        outputs.current[processId].outputErrors[sourceData.uuid] =
          error?.message;
      } else {
        debugLogError('[BDAC] missing process after error' + processId);
        return;
      }
    }
    // update tracking in alert
    const totalCount = outputs.current[processId].totalCount;
    const totalCountText = getTotalCountText(sourceData.topic, totalCount);
    setAlertText(
      `${outputs.current[processId].successCount}/${totalCountText} deleted`,
    );
    setAlertDisplayType('block');

    if (
      outputs.current[processId].successCount +
        outputs.current[processId].errorCount ===
      outputs.current[processId].totalCount
    ) {
      if (outputs.current[processId].successCount > 0) {
        queryClient.invalidateQueries(sourceData.queryKey);
      }
      setAlertHeaderText(
        outputs.current[processId].errorCount > 0
          ? AlertHeaderText.Errored
          : AlertHeaderText.Successful,
      );
      setAlertSeverity(
        outputs.current[processId].errorCount > 0 ? 'error' : 'success',
      );
      completeProcess(outputs.current[processId]);
    }
  };

  /**
   * Notify completed process
   * @param {BulkDeleteActionOutput} output
   */
  const completeProcess = (output: BulkDeleteActionOutput) => {
    debugLog('[BDAC] complete process', output.processId);
    const listenerKeys = Object.keys(listeners.current);
    for (let i = 0; i < listenerKeys.length; i++) {
      const callback = listeners.current[listenerKeys[i]];
      if (callback) {
        callback(output.processId, output);
      }
    }
    setIsGoing(false);
  };

  /**
   * Checks to see there is a next process that should be started
   * Updates isGoing state to trigger movement
   */
  const nextProcess = () => {
    if (cuer.current.length > 0) {
      //REF

      const theCue = [...cuer.current];
      process.current = theCue.pop();
      cuer.current = theCue;

      if (process.current) {
        const thingsToDelete: any[] = [];
        const itemList = process.current?.itemList || [];
        for (let i = 0; i < itemList.length; i++) {
          thingsToDelete.push({
            uuid: itemList[i].id,
            topic: process.current.topicId,
            deleteQuery: process.current.deleteQuery,
            queryKey: process.current.queryKey,
            meta: process.current.meta,
          });
        }

        if (thingsToDelete.length > 0) {
          const totalCountText = getTotalCountText(
            process.current.topicId,
            thingsToDelete.length,
          );
          setAlertDisplayType('block');
          setAlertHeaderText(AlertHeaderText.InProgress);
          setAlertText(`0/${totalCountText} deleted`);
          setAlertSeverity('warning');
          startProcess(process.current.processId, thingsToDelete, doAPIAction);
        } else {
          completeProcess(outputs.current[process.current.processId]);
        }
      }
    } else {
      process.current = null;
      setIsGoing(false);
    }
  };

  /**
   * Start making API calls for the current process
   * @param {string} processId Package Id
   * @param {any[]} arr  Array of API calls to make
   * @param {(processId: string, sourceData: any) => any} apiPostCallback Method to call when record is deleted
   */
  const startProcess = (
    processId: string,
    arr: any[],
    apiPostCallback: (processId: string, sourceData: any) => any,
  ) => {
    for (let i = 0; i < arr.length; i++) {
      apiPostCallback(processId, arr[i]);
    }
  };

  /**
   * UE Updates going state based on whether cue is empty or not
   */
  useEffect(() => {
    if (!isGoing && cuer.current.length > 0) {
      setIsGoing(true);
    } else if (cuer.current.length === 0) {
      setIsGoing(false);
    }
  }, [cuer.current.length]);

  /** UE flips isGoing state when cue is filled
   * Initiates next process in the cue
   */
  useEffect(() => {
    if (isGoing) {
      nextProcess();
    } else {
      if (cuer.current.length > 0) {
        setIsGoing(true);
      }
    }
  }, [isGoing]);

  return (
    <BulkDeleteActionContext.Provider
      value={{
        getOutput,
        getBulkDeleteActionOutputs,
        addListener,
        createProcess,
        removeListener,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          zIndex: 99999,
          bottom: '24px',
          right: '24px',
          display: alertDisplayType,
        }}
      >
        <Alert
          sx={{ width: '400px' }}
          severity={alertSeverity as AlertColor}
          onClose={() => setAlertDisplayType('none')}
        >
          {alertText.length > 0 && (
            <>
              <div>
                <strong>{alertHeaderText}</strong>
              </div>
              <div>{alertText}</div>
            </>
          )}
        </Alert>
      </Box>
      {children}
    </BulkDeleteActionContext.Provider>
  );
};
