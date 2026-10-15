import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityScore,
  AuAutoGrader,
  GetActivityCacheHandler,
  RC5ActivityTypeEnum,
  ScenarioContent,
  ScenarioSubmitResponse,
  SetActivityCacheHandler,
  SetCmi5ProgressHandler,
  SubmitCmiScoreHandler,
} from '@rapid-cmi5/cmi5-build-common';

import { cmi5Instance } from '../../../session/cmi5';
import { ScenarioUpdatesContext } from '../ScenarioUpdatesContext';
import { debugLogError } from '@rapid-cmi5/ui';
import { logger } from '../../../debug';
import {
  AutoGrader,
  DevopsApiClient,
} from '@rangeos-nx/frontend/clients/devops-api';

/** Attempts before a failed autograder fetch is surfaced to the learner. */
const AUTOGRADER_FETCH_ATTEMPTS = 3;
const AUTOGRADER_RETRY_BASE_MS = 1000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type UseAutoGraderProgressArgs = {
  isTestMode?: boolean;
  isAuthenticated?: boolean;
  getActivityCache?: GetActivityCacheHandler | null | undefined;
  setActivityCache?: SetActivityCacheHandler | null | undefined;
  setProgress?: SetCmi5ProgressHandler | null | undefined;
  submitScore?: SubmitCmiScoreHandler | null | undefined;
  scenarioContent?: ScenarioContent;
  slideGuid?: string; // Add slideGuid to help identify the correct scenario activity
};

//REFACTOR
export function useAutoGraderProgress({
  getActivityCache,
  setActivityCache,
  isTestMode,
  isAuthenticated,
  setProgress,
  submitScore,
  scenarioContent,
  slideGuid,
}: UseAutoGraderProgressArgs) {
  const { rangeId, scenarioId } = useContext(ScenarioUpdatesContext);

  // so we know when we get back auto graders from DevOps API
  // Only set after a SUCCESSFUL fetch — a failure must never look like
  // "this scenario has no autograders", which auto-passes the activity.
  const [agsLoaded, setAgsLoaded] = useState(false);
  const [agsError, setAgsError] = useState<string | null>(null);
  // bumped by retryAutoGraders to re-run the fetch
  const [agsFetchKey, setAgsFetchKey] = useState(0);

  // The auto graders assciated with a scenario, populated from DevOps API
  const [autoGraders, setAutoGraders] = useState<AuAutoGrader[]>([]);
  // Keep track of completed auto grader tasks based on UUID
  // This is a local copy only, the data is persisted through setActivityCache
  const [finishedTaskUUIDs, setFinishedTaskUUIDs] = useState<Set<string>>(
    new Set(),
  );

  // Derive task UUIDs from autograders
  const tasksUUIDs = useMemo(
    () => autoGraders.map((ag) => ag.uuid),
    [autoGraders],
  );

  // Cache is ready when either test mode or authenticated
  const readyToHydrate = useMemo(
    () => Boolean(isTestMode || isAuthenticated),
    [isTestMode, isAuthenticated],
  );

  // Are all tasks completed?
  const allCompleted = useMemo(() => {
    if (tasksUUIDs.length === 0) return false;
    for (const uuid of tasksUUIDs) {
      if (!finishedTaskUUIDs.has(uuid)) return false;
    }
    return true;
  }, [tasksUUIDs, finishedTaskUUIDs]);

  // Used in the progress bar for the auto grader tab
  const labProgress = useMemo(() => {
    const total = autoGraders.length;
    if (total === 0) return 0;
    return Math.round((finishedTaskUUIDs.size / total) * 100);
  }, [finishedTaskUUIDs.size, autoGraders.length]);

  // Load completed UUIDs from cache when ready
  const loadAutograderCache = useCallback(async () => {
    if (!readyToHydrate || !getActivityCache) return new Set<string>();
    try {
      const content = (await getActivityCache(
        RC5ActivityTypeEnum.scenario,
      )) as Set<string>;
      setFinishedTaskUUIDs(content ?? new Set());

      return content ?? new Set<string>();
    } catch {
      setFinishedTaskUUIDs(new Set());
      return new Set<string>();
    }
  }, []);

  // Push a UUID into both the LRS, redux, and local var while on the tab
  // This should be coming from a graphql subscription.
  const markCompleted = useCallback((uuid: string) => {
    if (setActivityCache) {
      setActivityCache(RC5ActivityTypeEnum.scenario, uuid);
    }

    setFinishedTaskUUIDs((prev) => {
      if (prev.has(uuid)) return prev;
      const next = new Set(prev);
      next.add(uuid);

      return next;
    });
  }, []);

  /*
    UE Block
  */

  // Fetch deployed autograders from DevOps API
  useEffect(() => {
    if (!rangeId || !scenarioId) return;
    let cancelled = false;

    setAgsLoaded(false);
    setAgsError(null);

    const fetchAutoGraders = async (): Promise<AuAutoGrader[]> => {
      const res = await DevopsApiClient.deployedAutoGradersList(
        rangeId,
        scenarioId,
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
        undefined,
        {
          headers: { Authorization: `Basic ${cmi5Instance.getAuthToken()}` },
        },
      );

      // A missing list is a bad response, not an empty scenario.
      const list = res?.data?.data;
      if (!Array.isArray(list)) {
        throw new Error('Autograder response did not include a list');
      }

      return list.map((ag: AutoGrader) => {
        const metaData: any = ag?.metadata ?? {};
        const quizQuestion = metaData?.rangeOsUI?.quizQuestion ?? {};
        return {
          name: ag?.name || '',
          uuid: ag?.uuid || '',
          activityId: quizQuestion['activityId'] || '',
          question: quizQuestion['question'] || '',
          questionId: quizQuestion['questionId'] || '',
          questionType: quizQuestion['questionType'] || '',
        } as AuAutoGrader;
      });
    };

    (async () => {
      for (let attempt = 1; attempt <= AUTOGRADER_FETCH_ATTEMPTS; attempt++) {
        try {
          const ags = await fetchAutoGraders();
          if (cancelled) return;
          setAutoGraders(ags);
          setAgsLoaded(true);
          return;
        } catch (error) {
          if (cancelled) return;
          logger.warn(
            'Could not fetch autograders',
            { attempt, rangeId, scenarioId, error },
            'api',
          );
          if (attempt < AUTOGRADER_FETCH_ATTEMPTS) {
            await wait(AUTOGRADER_RETRY_BASE_MS * 2 ** (attempt - 1));
            if (cancelled) return;
          }
        }
      }

      // Leave agsLoaded false so the "no autograders" auto-pass cannot fire.
      debugLogError('Could not fetch autograders');
      setAutoGraders([]);
      setAgsError(
        'Could not load the auto graders for this scenario, so progress cannot be recorded yet.',
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [rangeId, scenarioId, agsFetchKey]);

  const retryAutoGraders = useCallback(() => {
    setAgsFetchKey((key) => key + 1);
  }, []);

  // Preload the network portion for autograders
  // This first time this is called it will save time by completing the network portion
  // an hydrating redux.
  // After the first time, it will load from redux to your local vars.
  useEffect(() => {
    if (readyToHydrate) {
      loadAutograderCache();
    }
  }, [readyToHydrate, loadAutograderCache]);

  // Decide when to progress:
  // - If autograders are loaded AND there are none -> progress
  // - If allCompleted -> progress
  useEffect(() => {
    if (!readyToHydrate) return;

    if (agsLoaded && tasksUUIDs.length === 0) {
      // if there are no autograders, we need report progress back via submitScore
      //in the future we will mark move on as not applicable
      if (submitScore && scenarioContent) {
        const completedTasks = 0;
        const totalTasks = 0;

        const scoreData: ScenarioSubmitResponse = {
          completedTasks,
          totalTasks,
          allCompleted: true,
          autoGraderResults: [], // Could include detailed results if needed
        };

        const activityScore: ActivityScore = {
          activityType: RC5ActivityTypeEnum.scenario,
          activityContent: scenarioContent,
          scoreData,
        };

        submitScore(activityScore);
      }
    }

    if (allCompleted) {
      //  autograders present, we need report progress back via submitScore
      if (submitScore && scenarioContent) {
        const completedTasks = tasksUUIDs.length;
        const totalTasks = tasksUUIDs.length;
        const scoreData: ScenarioSubmitResponse = {
          completedTasks,
          totalTasks,
          allCompleted,
          autoGraderResults: [], // Could include detailed results if needed
        };

        const activityScore: ActivityScore = {
          activityType: RC5ActivityTypeEnum.scenario,
          activityContent: scenarioContent,
          scoreData,
        };

        submitScore(activityScore);
      }

      return;

      // here
    }
  }, [readyToHydrate, agsLoaded, tasksUUIDs.length, allCompleted]);

  return {
    finishedTaskUUIDs,
    labProgress,
    markCompleted,
    autoGraders,
    agsLoaded,
    agsError,
    retryAutoGraders,
  };
}
