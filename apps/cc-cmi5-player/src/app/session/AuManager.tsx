import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  auDisplayInitializedSel,
  auJsonSel,
  auViewedSlidesSel,
  courseAUProgressSel,
  setIsConfigInitialized,
  setIsDisplayInitialized,
} from '../redux/auReducer';
import { activeTabSel, setActiveTab } from '../redux/navigationReducer';

import { progressAU, resumeAU } from '../utils/AuUtils';
import { cmi5Instance } from '../session/cmi5';
import { store } from '../redux/store';
import { checkForDevMode } from '../utils/DevMode';
import { useCMI5Session } from '../hooks/useCMI5Session';
import { useOverrideConfigs } from '../hooks/useOverrideConfig';
import { logger, refreshLoggingConfig } from '../debug';
import { useAuContent } from '../hooks/useAuContent';
import { Alert, AlertTitle, CircularProgress, Typography } from '@mui/material';
import {
  ActivityCacheGetState,
  ActivityCacheSetState,
  ActivityScore,
  AuContextProps,
  AuManagerState,
  QuizState,
  RC5ActivityTypeEnum,
  SlideTypeEnum,
} from '@rapid-cmi5/types/cmi5';
import MenuLayout from '../components/MenuLayout';
import { getAutoGradersProgress } from '../utils/Cmi5Helpers';

import { modal, setModal } from '@rapid-cmi5/ui/redux';
import {
  classChangeModalId,
  classPromptModalId,
} from '../components/CourseModals';
import { debugLogError } from '../debug';
import { config } from '@rapid-cmi5/frontend/environment';
import { useActivitySession } from '../hooks/useActivitySession';
import Auth from '../Auth';
import { handleActivityScoring } from '../utils/LmsStatementManager';
import { debugLog } from '@rapid-cmi5/ui/branded';

/**
 * Context for Building CMI5 Course
 * @see ICourseBuilderContext
 * @return {Context} React Context
 */
export const AuManagerContext = createContext<AuContextProps>({
  activeTab: 0,
  progressPercent: 0,
  viewedSlides: [],
  scenario: undefined, //TODO scenario, //from redux, may be more up to date than course data
  slides: [],
  setActiveTab: (tab: number) => {},
  setProgress: (makeProgress: boolean) => {},
  slideData: 'Loading...',
  submitScore: () => {},
  getActivityCache: null,
  setActivityCache: null,
  isAuthenticated: false,
  isTestMode: false,
});

function AuManager() {
  const modalObj = useSelector(modal);
  const auJson = useSelector(auJsonSel);
  const activeTab = useSelector(activeTabSel);
  const viewedSlides = useSelector(auViewedSlidesSel);
  const isDisplayInitialized = useSelector(auDisplayInitializedSel);
  const dispatch = useDispatch();
  const courseAUProgress = useSelector(courseAUProgressSel);

  const isInitializedProgressData = useRef(false);
  const [auManagerState, setAuManagerState] = useState(AuManagerState.waiting);

  const [loadingMessage, setLoadingMessage] = useState('');
  const [initializationAttempt, setInitializationAttempt] = useState(0);
  const [cmi5ReadyAttempts, setCmi5ReadyAttempts] = useState(0);

  const {
    isAuthenticated,
    isTestMode,
    initializeCmi5,
    testCmi5,
    isSessionInitialized,
    cmi5ErrorMessage,
  } = useCMI5Session();

  const {
    handleGetQuizProgress,
    handleSetQuizProgress,
    handleGetAutoGraderProgress,
    handleSetSetAuoGraderProgress,
  } = useActivitySession();

  const { isOverridesLoaded, loadOverrides } = useOverrideConfigs();
  const { isContentLoaded, contentErrorMessage, loadContent } = useAuContent();

  //#region Session Methods

  const handleSetActivityCache = (
    atype: RC5ActivityTypeEnum,
    state?: ActivityCacheSetState,
  ) => {
    if (atype === RC5ActivityTypeEnum.quiz) {
      handleSetQuizProgress(state as QuizState);
    } else if (atype === RC5ActivityTypeEnum.scenario) {
      handleSetSetAuoGraderProgress(state as string);
    } else if (atype === RC5ActivityTypeEnum.ctf) {
      logger.debug(
        'CTF Cache has not been implemented yet',
        undefined,
        'auManager',
      );
    } else if (atype === RC5ActivityTypeEnum.jobe) {
      logger.debug(
        'Jobe Cache has not been implemented yet',
        undefined,
        'auManager',
      );
    }
  };

  const handleGetActivityCache = async (
    atype: RC5ActivityTypeEnum,
    state?: ActivityCacheGetState,
  ) => {
    if (atype === RC5ActivityTypeEnum.quiz) {
      return await handleGetQuizProgress(state as QuizState);
    } else if (atype === RC5ActivityTypeEnum.scenario) {
      return await handleGetAutoGraderProgress();
    } else if (atype === RC5ActivityTypeEnum.ctf) {
      logger.debug(
        'CTF Cache has not been implemented yet',
        undefined,
        'auManager',
      );
    } else if (atype === RC5ActivityTypeEnum.jobe) {
      logger.debug(
        'Jobe Cache has not been implemented yet',
        undefined,
        'auManager',
      );
    }

    return null;
  };

  const changeActiveTab = (selTab: number) => {
    logger.debug('Set Active Tab', { selTab }, 'auManager');
    dispatch(setActiveTab(selTab));
  };

  const setProgress = (makeProgress: boolean) => {
    logger.debug(
      'Context Set AU Progress',
      { activeTab, makeProgress },
      'auManager',
    );
    progressAU(
      activeTab,
      makeProgress,
      auJson,
      viewedSlides,
      dispatch,
      store.getState,
    );
  };

  const slideData = useMemo(() => {
    if (auJson?.slides && auJson?.slides.length > 0 && activeTab >= 0) {
      if (activeTab >= auJson?.slides.length) {
        debugLogError(`Slide Index ${activeTab}  does not exist`);
        setActiveTab(0); //reset
        return 'There was a problem loading this slide.';
      }
      return auJson?.slides[activeTab].content as string;
    }
    return 'Loading...';
  }, [activeTab, auJson?.slides]);

  const submitScore = (data: ActivityScore) => {
    logger.debug('Context Submit Score', { data }, 'auManager');

    logger.debug(
      'AuManager.submitScore - slide identification',
      {
        activeTab,
        auJsonExists: !!auJson,
        auJsonSlidesLength: auJson?.slides?.length || 0,
        auJsonSlides:
          auJson?.slides?.map((slide: any, index: number) => ({
            index,
            filepath: slide.filepath,
            title: slide.title,
            content: slide.content
              ? `${slide.content.substring(0, 100)}...`
              : 'No content',
          })) || [],
        currentSlideData: auJson?.slides?.[activeTab] || null,
      },
      'auManager',
    );

    // Use the simplified handleActivityScoring function
    // Pass slideIndex but let the function determine the correct slideGuid
    handleActivityScoring(
      {
        activityData: data,
        slideGuid: null, // Let function determine this
        slideIndex: activeTab,
      },
      dispatch,
      store.getState,
    );
  };

  const getAutoGraderProgress = () => {
    logger.debug('Context Get AutoGrader', undefined, 'auManager');
    return getAutoGradersProgress();
  };
  //#endregion

  const getReadyDisplay = useCallback(() => {
    if (auManagerState === AuManagerState.error) {
      return (
        <Alert
          sx={{
            position: 'absolute',
            left: 400,
            top: -4,
            zIndex: 9999,
            backgroundColor: '#0000004D',
          }}
          severity="error"
        >
          <AlertTitle>{loadingMessage}</AlertTitle>
        </Alert>
      );
    }

    if (auManagerState !== AuManagerState.ready) {
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
            {auManagerState + loadingMessage}
          </Typography>
        </div>
      );
    }
    return null;
  }, [auManagerState, loadingMessage]);

  const shouldRequireClassId = auJson.promptClassId
    ? auJson.promptClassId
    : false;

  const auHasScenario =
    auJson.rangeosScenarioUUID || auJson.rangeosScenarioName ? true : false;
  const auHasTeamScenario = auJson.teamSSOEnabled ? true : false;

  /**
   * UE Manages Session State
   */
  useEffect(() => {
    if (auManagerState !== AuManagerState.ready) {
      logger.debug('[AU] state', { auManagerState }, 'auManager');
    }

    if (cmi5ErrorMessage) {
      setLoadingMessage(cmi5ErrorMessage);
      setAuManagerState(AuManagerState.error);
    }

    if (auManagerState === AuManagerState.waiting) {
      loadOverrides('./cfg.json');
      setAuManagerState(AuManagerState.loadingOverrides);
      return;
    } else if (auManagerState === AuManagerState.loadingOverrides) {
      if (isOverridesLoaded) {
        // Refresh logging configuration after overrides are applied
        refreshLoggingConfig();
        loadContent('./config.json');
        setAuManagerState(AuManagerState.loadingContent);
      }
      return;
    } else if (auManagerState === AuManagerState.loadingContent) {
      if (isContentLoaded) {
        logger.debug('[AU] content', { auJson }, 'auManager');

        debugLog('auHasScenario ' + auHasScenario, auJson.rangeosScenarioName);
        debugLog('auHasTeamScenario ', auJson.teamSSOEnabled);
        //TODO
        if (auHasScenario) {
          config.CMI5_SSO_ENABLED = false;
        } else if (auHasTeamScenario) {
          config.CMI5_SSO_ENABLED = true;
        } else {
          config.CMI5_SSO_ENABLED = false;
        }
        //flag config file is finalized with all env variables needed

        //if no sso is needed, set display ready
        //otherwise token use effect will update it after sso authentication achieved
        if (!config.CMI5_SSO_ENABLED) {
          dispatch(setIsDisplayInitialized(true));
        }

        if (checkForDevMode()) {
          logger.debug('[AU] test mode', undefined, 'auManager');
          testCmi5(true);
          logger.debug(
            '[AU] state >',
            { state: AuManagerState.ready },
            'auManager',
          );
          if (auHasScenario && shouldRequireClassId) {
            dispatch(setModal({ type: classPromptModalId, id: '', name: '' }));
          } else {
            setAuManagerState(AuManagerState.ready);
            dispatch(setIsConfigInitialized(true));
          }
        } else {
          initializeCmi5(shouldRequireClassId, auHasScenario);
          setAuManagerState(AuManagerState.authenticating);
        }
      }
      if (contentErrorMessage) {
        setLoadingMessage(contentErrorMessage);
        setAuManagerState(AuManagerState.error);
      }
      return;
    } else if (auManagerState === AuManagerState.authenticating) {
      if (!isAuthenticated) {
        setTimeout(() => {
          setInitializationAttempt(initializationAttempt + 1);
        }, 1000);
      } else {
        setAuManagerState(AuManagerState.loadingScenario);
      }
      return;
    } else if (auManagerState === AuManagerState.loadingScenario) {
      if (isSessionInitialized) {
        // Add additional check for CMI5 readiness before calling resumeAU
        if (cmi5Instance.xapi !== null && cmi5Instance.xapi !== undefined) {
          logger.debug(
            '[AU] CMI5 ready, calling resumeAU',
            undefined,
            'auManager',
          );
          resumeAU(dispatch, isInitializedProgressData, auJson); // gets cmi5 progress and sets active tab
          setAuManagerState(AuManagerState.ready);
          dispatch(setIsConfigInitialized(true));

          // Reset CMI5 ready attempts on success
          setCmi5ReadyAttempts(0);
        } else {
          // Wait a bit more for CMI5 to be ready, with retry limit
          const maxCmi5ReadyAttempts = 50; // 5 seconds max (50 * 100ms)
          if (cmi5ReadyAttempts < maxCmi5ReadyAttempts) {
            logger.debug(
              `[AU] CMI5 not ready yet, waiting... (attempt ${cmi5ReadyAttempts + 1}/${maxCmi5ReadyAttempts})`,
              undefined,
              'auManager',
            );
            setTimeout(() => {
              setCmi5ReadyAttempts(cmi5ReadyAttempts + 1);
            }, 100);
          } else {
            // CMI5 failed to become ready after maximum attempts
            logger.error(
              '[AU] CMI5 failed to become ready after maximum attempts, proceeding anyway',
              undefined,
              'auManager',
            );
            resumeAU(dispatch, isInitializedProgressData, auJson);
            setAuManagerState(AuManagerState.ready);
            dispatch(setIsConfigInitialized(true));

            setCmi5ReadyAttempts(0);
          }
        }
      }
      return;
    } else if (auManagerState === AuManagerState.error) {
      return;
    } else if (auManagerState === AuManagerState.ready) {
      // respond to slide index changes
    }

    // After active tab or config (auJson) populates -----------------

    if (isTestMode) {
      return;
    }

    logger.debug('[AU] activeSlide', { activeTab }, 'auManager');

    if (auJson?.slides) {
      // this prevents completion of an activity slide until the desired actvities are completed
      let makeProgress = true;

      if (auJson.slides[activeTab]) {
        const content = auJson.slides[activeTab].content;
        if (typeof content === 'string') {
          if (
            content.indexOf(':::quiz') >= 0 ||
            content.indexOf(':::ctf') >= 0 ||
            content.indexOf(':::jobe') >= 0 ||
            content.indexOf(':::consoles') >= 0 ||
            content.indexOf(':::scenario') >= 0
          ) {
            makeProgress = false;
          }
        }
      }

      if (
        isContentLoaded &&
        isOverridesLoaded &&
        isAuthenticated &&
        isSessionInitialized
      ) {
        // Only call progressAU if:
        // 1. We haven initialized progress data yet, OR
        // 2. This is a fresh start (not resuming)
        if (isInitializedProgressData.current) {
          progressAU(
            activeTab,
            makeProgress,
            auJson,
            viewedSlides,
            dispatch,
            store.getState,
          );
        }
      }
      /*
      // Call progressAU for slide navigation to update slide status and progress
      progressAU(
        activeTab, // slideIdx - the slide index to process
        makeProgress,
        auJson,
        viewedSlides,
        dispatch,
        store.getState,
      );
      isInitializedProgressData.current = true;
      */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isContentLoaded,
    isOverridesLoaded,
    isAuthenticated,
    isSessionInitialized,
    contentErrorMessage,
    cmi5ErrorMessage,
    auManagerState,
    auJson,
    activeTab, // Re-added to trigger progress updates on slide navigation
    initializationAttempt,
    cmi5ReadyAttempts, // Added to trigger CMI5 readiness checks
  ]);

  /**
   * Clear class id prompt if feature is not supported for this au
   */
  useEffect(() => {
    if (auJson) {
      if (
        !shouldRequireClassId &&
        (modalObj.type === classPromptModalId ||
          modalObj.type === classChangeModalId)
      ) {
        dispatch(setModal({ type: '', id: '', name: '' }));
      }
    }
  }, [modalObj.type, auJson, shouldRequireClassId, dispatch]);

  return (
    <AuManagerContext.Provider
      value={{
        activeTab: activeTab,
        progressPercent: 0,
        viewedSlides: [],
        scenario: undefined, //TODO scenario, //from redux, may be more up to date than course data
        slides: auJson.slides,
        slideData,
        setActiveTab: changeActiveTab,
        setProgress: setProgress,
        submitScore: submitScore,
        setActivityCache: handleSetActivityCache,
        getActivityCache: handleGetActivityCache,
        isAuthenticated: isAuthenticated,
        isTestMode: isTestMode,
      }}
    >
      <>
        {getReadyDisplay()}
        {isDisplayInitialized && <MenuLayout />}
        {!isDisplayInitialized && config.CMI5_SSO_ENABLED && (
          <Typography>Waiting for SSO Authentication</Typography>
        )}
      </>
    </AuManagerContext.Provider>
  );
}

export default AuManager;
