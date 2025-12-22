import { useDispatch, useSelector } from 'react-redux';
import axios, { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import sha256 from 'crypto-js/sha256';
import { Statement } from '@xapi/xapi';
import Cmi5 from '@xapi/cmi5';
import { debugLog } from '../debug';
import { setAuthToken } from '@rapid-cmi5/ui/keycloak';
import { queryHooksConfig, useToaster } from '@rapid-cmi5/ui';
import {
  sendInitializedVerb,
  sendRangeosAuthVerb,
} from '../utils/LmsStatementManager';
import {
  auSessionInitializedSel,
  classIdSel,
  rangeConsoleDataAttemptsSel,
  rangeDataAttemptsSel,
  rangeDataSel,
  setClassId,
  setIsSessionInitialized,
  setRangeConsoleData,
  setRangeConsoleDataAttempts,
  setRangeConsoleDataError,
  setRangeData,
  setRangeDataAttempts,
  setRangeDataError,
} from '../redux/auReducer';
import { rangeDataType } from '../types/AuState';

import {
  InitScenarioResponse,
  ScenarioConsolesResponse,
} from '../types/SlideState';
import { config } from '@rapid-cmi5/ui';
import { cmi5Instance } from '../session/cmi5';
import { useCallback, useEffect, useRef, useState } from 'react';
import { setModal } from '@rapid-cmi5/ui';
import { classPromptModalId } from '../components/CourseModals';
import { checkForDevMode } from '../utils/DevMode';

type sessionState = {
  authToken: string;
  initializedDate: Date;
  fetchUrl: string;
};

export const numRetries = 5;
export const retryDelay = 20000;
const featureFlagSkipClassPromptIfCached = true;

/**
 * CMI5 Plugin Instance
 * Initialized CMI5
 * @returns
 */
export const useCMI5Session = () => {
  const dispatch = useDispatch();
  const classId = useSelector(classIdSel);
  const displayToaster = useToaster();
  const rangeData = useSelector(rangeDataSel);
  const savedRangeDataAttempts = useSelector(rangeDataAttemptsSel);
  const savedRangeConsoleDataAttempts = useSelector(
    rangeConsoleDataAttemptsSel,
  );
  const rangeDataAttempts = useRef<number>(0);
  const rangeConsoleDataAttempts = useRef<number>(0);

  //const [isSessionInitialized, setIsSessioninitialized] = useState(false);
  const [isTestMode, setIsTestMode] = useState(checkForDevMode());
  const [cmi5ErrorMessage, setCMI5ErrorMessage] = useState('');
  const isSessionInitialized = useSelector(auSessionInitializedSel);

  /**
   * Gets Credentials for Console
   * @param cmi5Instance
   * @param rangeData
   * @returns
   */
  const getConsoleCredentials = useCallback(
    async (cmi5Instance: Cmi5, rangeData: rangeDataType) => {
      if (rangeData.deployedScenarios.length === 0) {
        return;
      }

      try {
        const response = await axios.get<ScenarioConsolesResponse>(
          `${config.DEVOPS_API_URL}${config.DEVOPS_API_CMI_VERSION}/registration/${
            cmi5Instance.getLaunchParameters().registration
          }/consoles`,
          {
            headers: { Authorization: `Basic ${cmi5Instance.getAuthToken()}` },
          },
        );
        debugLog('Console request', response);
        if (response.data.length === 0 || response.data[0].password === '') {
          let errorMessage =
            'Error getting guacamole credentials (data not found)';
          if (rangeConsoleDataAttempts.current < numRetries) {
            errorMessage =
              errorMessage +
              '. Retrying...' +
              rangeConsoleDataAttempts.current +
              '/' +
              numRetries;
            rangeConsoleDataAttempts.current =
              rangeConsoleDataAttempts.current + 1;
            setTimeout(() => {
              getConsoleCredentials(cmi5Instance, rangeData);
            }, retryDelay);
            dispatch(
              setRangeConsoleDataAttempts(rangeConsoleDataAttempts.current),
            );
          } else {
            errorMessage = errorMessage + '. Maximum attempts reached.';
          }
          dispatch(setRangeConsoleDataError(errorMessage));
        } else {
          dispatch(setRangeConsoleData({ credentials: response.data }));
          dispatch(setRangeConsoleDataError(''));
        }
      } catch (error) {
        let errorMessage = 'Error getting guacamole credentials';
        if (rangeConsoleDataAttempts.current < numRetries) {
          errorMessage =
            errorMessage +
            '. Retrying...' +
            rangeConsoleDataAttempts.current +
            '/' +
            numRetries;

          rangeConsoleDataAttempts.current =
            rangeConsoleDataAttempts.current + 1;
          setTimeout(() => {
            getConsoleCredentials(cmi5Instance, rangeData);
          }, retryDelay);
          dispatch(
            setRangeConsoleDataAttempts(rangeConsoleDataAttempts.current),
          );
        } else {
          errorMessage = errorMessage + '. Maximum attempts reached.';
        }
        dispatch(setRangeConsoleDataError(errorMessage));
      }
    },
    [dispatch],
  );

  /**
   * Posts a CMI5 users hashed authentication token to the LRS as a xAPI statment.
   * DevopsAPI can then verify that the user on a particular AU ID is coming
   * from a registered LRS that RangeOS trusts.
   * @returns
   */
  const postAuAuth = async () => {
    try {
      sendRangeosAuthVerb().catch((error) => {
        debugLog('error sending hash token statement ', error);
      });
      return true;
    } catch (error) {
      debugLog('error sending hash token statement ', error);
      throw error;
    }
  };

  /**
   * Initialize Session
   * @returns
   */
  const initializeSession = async () => {
    const launchParams = cmi5Instance.getLaunchParameters();
    console.log('🚀 CMI5 Player Launch Parameters:', {
      fetch: launchParams.fetch,
      registration: launchParams.registration,
      activityId: launchParams.activityId,
      actor: launchParams.actor,
      endpoint: launchParams.endpoint,
    });

    if (cmi5Instance.getLaunchParameters().fetch === 'test') {
      debugLog('Cmi5 is in test mode');
      setIsTestMode(true);
      return;
    }

    // Get the session storage ID - CRITICAL FIX: Include activityId to make it unique per AU
    const sessionStorageId = `cmi5-initialize-${
      cmi5Instance.getLaunchParameters().registration
    }-${cmi5Instance.getLaunchParameters().activityId.split('/').pop()}`;
    // If AU has been initialized before, we can use the session storage data
    const cmi5InitSessionString = sessionStorage.getItem(sessionStorageId);

    // ENHANCED LOGGING: Track session initialization for debugging
    console.log('🔍 CMI5 Session Initialization Debug:', {
      registration: launchParams.registration,
      activityId: launchParams.activityId,
      sessionStorageId,
      hasExistingSession: !!cmi5InitSessionString,
      sessionStorageKeys: Object.keys(sessionStorage).filter((key) =>
        key.startsWith('cmi5-'),
      ),
      auId: launchParams.activityId.split('/').pop(),
    });

    debugLog('Existing session id', sessionStorageId);
    debugLog('Existing session string', cmi5InitSessionString);
    let cmi5InitSession: sessionState | undefined = undefined;

    if (cmi5InitSessionString !== null) {
      const cmi5InitSessionObj = JSON.parse(
        cmi5InitSessionString,
      ) as sessionState;

      if (cmi5InitSessionObj.fetchUrl !== launchParams.fetch) {
        cmi5InitSession = undefined;
      } else {
        cmi5InitSession = {
          authToken: cmi5InitSessionObj.authToken,
          initializedDate: new Date(cmi5InitSessionObj.initializedDate),
          fetchUrl: launchParams.fetch,
        };
      }
    } else {
      console.log('🆕 No existing session found, will create new session');
    }

    // Try to initialize the CMI5 session with the session storage data, it might not be valid
    let initializeData:
      | Awaited<ReturnType<typeof cmi5Instance.initialize>>
      | undefined = undefined;

    console.log('🎯 Attempting CMI5 initialization:', {
      hasExistingSession: !!cmi5InitSession,
      currentActivityId: launchParams.activityId,
      registration: launchParams.registration,
    });

    try {
      if (Cmi5.isCmiAvailable) {
        console.log(
          '🔄 Calling cmi5Instance.initialize with existing session data...',
        );
        initializeData = await cmi5Instance.initialize(cmi5InitSession);
        console.log(
          '✅ CMI5 initialization with existing session succeeded:',
          initializeData,
        );
      } else {
        debugLog(
          'Cmi5 Data is not available, assuming testing, no progress will be saved',
        );
        setIsTestMode(true);
      }
    } catch (error) {
      console.warn(
        '❌ Error initializing CMI5 with sessionStorage data, assume new session: ',
        error,
      );
      try {
        if (Cmi5.isCmiAvailable) {
          console.log(
            '🔄 Fallback: Calling cmi5Instance.initialize() without session data...',
          );
          initializeData = await cmi5Instance.initialize();
          console.log(
            '✅ CMI5 fallback initialization succeeded:',
            initializeData,
          );
        } else {
          debugLog(
            'Cmi5 Data is not available, assuming testing, no progress will be saved',
          );
          setIsTestMode(true);
        }
      } catch (error) {
        console.error(
          '💥 FATAL: Error initializing CMI5 with new session, this is a fatal error',
          error,
        );
        //throw new Error('Error initializing CMI5 with new session');
        setCMI5ErrorMessage('Error initializing CMI5 with new session');
      }
    }

    console.info('Successful CMI5 Session initialization', initializeData);
    setCMI5ErrorMessage('');

    // CRITICAL LOGGING: Track xAPI instance status
    console.log('🔍 xAPI Instance Status After Initialization:', {
      xapiExists: !!cmi5Instance.xapi,
      xapiNull: cmi5Instance.xapi === null,
      xapiUndefined: cmi5Instance.xapi === undefined,
      registration: cmi5Instance.getLaunchParameters().registration,
      activityId: cmi5Instance.getLaunchParameters().activityId,
    });

    // Send Initialized verb to LRS after successful CMI5 initialization
    try {
      sendInitializedVerb().catch((error) => {
        debugLog('error sending initialized verb ', error);
      });
    } catch (error) {
      debugLog('Error sending Initialized verb to LRS:', error);
      console.log('Error sending Initialized verb to LRS');
      // Don't throw error - initialization should continue even if LRS statement fails
    }

    return { sessionStorageId, fetchUrl: launchParams.fetch };
  };

  /**
   * Stores auth token so API & Graph queries can use it
   * @param authToken
   */
  const storeAuthToken = (authToken: string) => {
    console.log('[useCmi5Session] storeAuthToken');
    //store in auth slice for shared components
    dispatch(setAuthToken(`Basic ${authToken}`));
    //store in hooks so it can used for API calls
    queryHooksConfig.headers.Authorization = `Basic ${authToken}`;
  };

  /**
   * Kick off scenario
   */
  const initializeScenarios = useCallback(async () => {
    debugLog('Calling init scenarios', classId);
    try {
      const response = await axios.post<InitScenarioResponse>(
        `${config.DEVOPS_API_URL}${config.DEVOPS_API_CMI_VERSION}/scenarios`,
        { classId: classId ? classId : undefined },
        { headers: { Authorization: `Basic ${cmi5Instance.getAuthToken()}` } },
      );

      // this may be a timing thing
      if (response.data.deployedScenarios?.length === 0) {
        let errorMessage = `No deployed scenarios found`;
        if (classId) {
          errorMessage = `No deployed scenarios found for Class Id ${classId}`;
        }

        if (rangeDataAttempts.current < numRetries) {
          rangeDataAttempts.current = rangeDataAttempts.current + 1;
          console.log('rangeDataAttempts.current', rangeDataAttempts.current);
          errorMessage =
            errorMessage + '. Retrying...' + rangeDataAttempts.current + '/5';
          setTimeout(() => {
            initializeScenarios();
          }, retryDelay);
          dispatch(setRangeDataAttempts(rangeDataAttempts.current));
        } else {
          errorMessage = errorMessage + '. Maximum attempts reached.';
        }

        setCMI5ErrorMessage(errorMessage);
        dispatch(setRangeDataError(errorMessage));
      } else {
        // success - clear errors

        const assignedClassId = response.data.classId || classId || '';
        window.localStorage.setItem('cmi5-classId', assignedClassId);
        dispatch(setClassId(assignedClassId));
        setCMI5ErrorMessage('');
        dispatch(setRangeDataError(''));
        displayToaster({
          message: `Scenario Initialized! (classId: ${assignedClassId})`,
          severity: 'success',
        });
      }

      dispatch(setRangeData(response.data));
    } catch (error) {
      let errorMessage = 'Error initializing scenarios';
      if (error instanceof AxiosError) {
        console.log('the error response ', error.response);
      }

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        if (rangeDataAttempts.current < numRetries) {
          rangeDataAttempts.current = rangeDataAttempts.current + 1;
          errorMessage =
            'Error initializing scenarios Retrying... ' +
            rangeDataAttempts.current +
            '/' +
            numRetries;

          setTimeout(() => {
            console.log('debug recall method');
            initializeScenarios();
          }, retryDelay);
          dispatch(setRangeDataAttempts(rangeDataAttempts.current));
        } else {
          errorMessage = 'Maximum attempts reached. ' + errorMessage;
        }
      }

      setCMI5ErrorMessage(errorMessage);
      dispatch(setRangeDataError(errorMessage));
    }
  }, [classId, dispatch, displayToaster]);

  /**
   * main loop
   */
  const initializeCmi5 = async (
    shouldPromptClassId: boolean,
    auHasScenario: boolean,
  ) => {
    debugLog('initialize CMI5 session', shouldPromptClassId);
    try {
      const res = await initializeSession();
      const sessionStorageId = res?.sessionStorageId;
      const fetchUrl = res?.fetchUrl;

      if (sessionStorageId === undefined) return;
      const authToken = cmi5Instance.getAuthToken();
      if (!config.CMI5_SSO_ENABLED) {
        storeAuthToken(authToken);
      }
      const initializedDate = cmi5Instance.getInitializedDate();
      // Store this in session storage since fetch can only be done once and we need the token on page refresh
      if (sessionStorageId) {
        const sessionData = {
          authToken,
          initializedDate: initializedDate.getTime(),
          activityId: cmi5Instance.getLaunchParameters().activityId, // Store the activity ID for comparison
          fetchUrl: fetchUrl,
        };
        console.log('💾 Storing CMI5 session data:', {
          sessionStorageId,
          authToken: authToken ? `${authToken.substring(0, 20)}...` : 'null',
          initializedDate: initializedDate.toISOString(),
          activityId: sessionData.activityId,
        });
        sessionStorage.setItem(sessionStorageId, JSON.stringify(sessionData));
      }
      await postAuAuth();
      debugLog('has scenario', auHasScenario);
      rangeDataAttempts.current = 0;
      rangeConsoleDataAttempts.current = 0;
      dispatch(setRangeDataAttempts(rangeDataAttempts.current));
      dispatch(setRangeConsoleDataAttempts(rangeConsoleDataAttempts.current));
      if (auHasScenario) {
        if (shouldPromptClassId) {
          debugLog('should prompt classId', classId);
          // If registration was new, class id would be empty here
          // If we don't want to annoy the user with repetitive prompts, we can skip
          if (featureFlagSkipClassPromptIfCached && classId) {
            debugLog('continue with cached class id');
            await initializeScenarios();
            dispatch(setIsSessionInitialized(true));
          } else {
            debugLog('prompt class id');
            dispatch(setModal({ type: classPromptModalId, id: '', name: '' }));
          }
        } else {
          debugLog('do not prompt class id');
          await initializeScenarios();
          dispatch(setIsSessionInitialized(true));
        }
      } else {
        debugLog('no scenario, class id skipped');
        dispatch(setIsSessionInitialized(true));
      }
    } catch (error) {
      //TODO
      setCMI5ErrorMessage('Cmi5 params not working');
      // reload without query params
      document.location.search =
        'endpoint=test&fetch=test&actor=test&activityId=test&registration=test';
      // console.log('Cmi5 params not working, assuming test, ', error);
    }
  };

  const testCmi5 = async (isTest: boolean) => {
    setIsTestMode(isTest);
  };

  /**
   *
   */
  useEffect(() => {
    debugLog('UE rangeData updated', rangeData);
    if (rangeData) {
      getConsoleCredentials(cmi5Instance, rangeData);
    }
  }, [rangeData, rangeData.deployedScenarios, getConsoleCredentials]);

  /**
   *
   */
  useEffect(() => {
    debugLog('UE retry load rangeData');
    const retry = async () => {
      rangeDataAttempts.current = 0;
      await initializeScenarios();
      dispatch(setIsSessionInitialized(true));
    };
    if (savedRangeDataAttempts === -1) {
      retry();
    }
  }, [savedRangeDataAttempts, dispatch, initializeScenarios]);

  /**
   *
   */
  useEffect(() => {
    debugLog('UE retry get console creds ');
    if (savedRangeConsoleDataAttempts === -1) {
      rangeConsoleDataAttempts.current = 0;
      if (rangeData) {
        getConsoleCredentials(cmi5Instance, rangeData);
      }
    }
  }, [savedRangeConsoleDataAttempts, getConsoleCredentials, rangeData]);

  return {
    initializeCmi5,
    initializeScenarios,
    isAuthenticated: cmi5Instance?.isAuthenticated,
    isSessionInitialized,
    isTestMode,
    testCmi5,
    cmi5ErrorMessage,
  };
};
