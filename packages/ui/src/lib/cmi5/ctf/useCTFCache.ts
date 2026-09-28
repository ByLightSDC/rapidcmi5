import { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import type {
  AnswerType,
  CTFState,
  GetActivityCacheHandler,
  SetActivityCacheHandler,
} from '@rapid-cmi5/cmi5-build-common';
import { debugLogError } from '../../utility/logger';

type UseCTFCacheOptions = {
  activeTab?: number;
  answers: Record<string, AnswerType>;
  ctfId: string;
  currentQuestion: number;
  grades: Record<string, 0 | 1>;
  questionCount: number;
  score: number;
  submitted: boolean;
  getActivityCache?: GetActivityCacheHandler | null;
  setActivityCache?: SetActivityCacheHandler | null;
  hydrate: (state: CTFState) => void;
};

type CacheSnapshot = Omit<UseCTFCacheOptions, 'getActivityCache' | 'hydrate'>;

function isValidCTFState(
  state: unknown,
  ctfId: string,
  slideNumber: number,
  questionCount: number,
): state is CTFState {
  if (!state || typeof state !== 'object') return false;

  const progress = state as Partial<CTFState>;
  return (
    progress.ctfId === ctfId &&
    progress.slideNumber === slideNumber &&
    Number.isInteger(progress.currentQuestion) &&
    progress.currentQuestion !== undefined &&
    progress.currentQuestion >= 0 &&
    (questionCount === 0 || progress.currentQuestion < questionCount) &&
    !!progress.answers &&
    typeof progress.answers === 'object' &&
    !!progress.grades &&
    typeof progress.grades === 'object' &&
    typeof progress.score === 'number' &&
    typeof progress.submitted === 'boolean'
  );
}

function toCTFState(snapshot: CacheSnapshot): CTFState | null {
  if (snapshot.activeTab === undefined) return null;

  return {
    ctfId: snapshot.ctfId,
    slideNumber: snapshot.activeTab,
    currentQuestion: snapshot.currentQuestion,
    answers: snapshot.answers,
    grades: snapshot.grades,
    score: snapshot.score,
    submitted: snapshot.submitted,
  };
}

export function useCTFCache(options: UseCTFCacheOptions): void {
  const {
    activeTab,
    ctfId,
    getActivityCache,
    hydrate,
    questionCount,
    setActivityCache,
  } = options;
  const cacheKey = activeTab === undefined ? null : `${activeTab}/${ctfId}`;
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const pendingAnswerSave = useRef<ReturnType<typeof debounce> | null>(null);
  const hydratedKeyRef = useRef<string | null>(hydratedKey);
  hydratedKeyRef.current = hydratedKey;
  const latest = useRef<CacheSnapshot>(options);
  latest.current = options;

  useEffect(() => {
    setHydratedKey(null);
    if (activeTab === undefined) return;

    let cancelled = false;
    const load = async () => {
      try {
        const progress = getActivityCache
          ? await getActivityCache(RC5ActivityTypeEnum.ctf, {
              ctfId,
              slideNumber: activeTab,
            })
          : null;

        if (
          !cancelled &&
          isValidCTFState(progress, ctfId, activeTab, questionCount)
        ) {
          hydrate(progress);
        }
      } catch (error) {
        if (!cancelled) debugLogError(`Could not get CTF state: ${error}`);
      } finally {
        if (!cancelled) setHydratedKey(`${activeTab}/${ctfId}`);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [activeTab, ctfId, getActivityCache, hydrate, questionCount]);

  useEffect(() => {
    if (!setActivityCache || !cacheKey || hydratedKey !== cacheKey) return;

    const saveAnswers = debounce(() => {
      const state = toCTFState(latest.current);
      if (state) setActivityCache(RC5ActivityTypeEnum.ctf, state);
    }, 5000);

    pendingAnswerSave.current = saveAnswers;
    saveAnswers();
    return () => {
      saveAnswers.cancel();
      if (pendingAnswerSave.current === saveAnswers) {
        pendingAnswerSave.current = null;
      }
    };
  }, [cacheKey, hydratedKey, options.answers, setActivityCache]);

  useEffect(() => {
    if (!setActivityCache || !cacheKey || hydratedKey !== cacheKey) return;

    pendingAnswerSave.current?.cancel();
    pendingAnswerSave.current = null;
    const state = toCTFState(latest.current);
    if (state) setActivityCache(RC5ActivityTypeEnum.ctf, state);
  }, [
    cacheKey,
    hydratedKey,
    options.currentQuestion,
    options.grades,
    options.score,
    options.submitted,
    setActivityCache,
  ]);

  useEffect(() => {
    return () => {
      pendingAnswerSave.current?.cancel();
      const snapshot = latest.current;
      const state = toCTFState(snapshot);
      if (
        state &&
        snapshot.setActivityCache &&
        hydratedKeyRef.current === `${state.slideNumber}/${state.ctfId}`
      ) {
        snapshot.setActivityCache(RC5ActivityTypeEnum.ctf, state);
      }
    };
  }, []);
}
