import { useState } from 'react';
import { CourseAU, ScenarioApi } from '@rapid-cmi5/cmi5-build-common';
import { debugLogError, useRangeApi } from '@rapid-cmi5/ui';
import {
  fetchLaunchUrl,
  randomUuid,
  rewriteLaunchHost,
  fetchFirstAuId,
} from './cmi5LaunchLinks';
import {
  writeConfigViaIpc,
  writeConfigViaHttp,
  loadLessonViaZip,
} from './writeConfig';
import { getFsInstance } from '../../../GitViewer/utils/gitFsInstance';
import type {
  Course,
  RepoAccessObject,
} from '../../../../../redux/repoManagerReducer';

export const DEFAULT_ACTOR_HOMEPAGE = 'https://moodle.com';
export const DEFAULT_RETURN_URL = 'https://lms.example.com/return';

export interface LaunchInPlayerOptions {
  currentLesson: CourseAU | undefined;
  hasIpc: boolean;
  playerUrl: string;
  configPath: string;
  rebuildPlayerZip: boolean;
  repoAccessObject: RepoAccessObject | null;
  currentCourse: Course | null | undefined;
  downloadCmi5Player?: () => Promise<unknown>;
  useRealLaunchLink: boolean;
  lmsApiBase: string;
  lmsCourseId: string;
  lmsToken: string;
  resolvedActorName: string;
  actorHomePage: string;
  returnUrl: string;
  currentAuIndex: number;
  selectedScenario: ScenarioApi | null;
  onSuccess: () => void;
}

/**
 * Orchestrates publishing the current lesson to the cmi5 player and (optionally)
 * fetching a real LMS launch URL + mapping a scenario to the AU.
 */
export function useLaunchInPlayer() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isRangeEnabled, createAuMapping } = useRangeApi();
  const reset = () => {
    setError(null);
    setStatusMsg(null);
  };

  const launch = async (opts: LaunchInPlayerOptions) => {
    const {
      currentLesson,
      hasIpc,
      playerUrl,
      configPath,
      rebuildPlayerZip,
      repoAccessObject,
      currentCourse,
      downloadCmi5Player,
      useRealLaunchLink,
      lmsApiBase,
      lmsCourseId,
      lmsToken,
      resolvedActorName,
      actorHomePage,
      returnUrl,
      currentAuIndex,
      selectedScenario,
      onSuccess,
    } = opts;

    if (!currentLesson) {
      setError('No lesson selected.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMsg(null);

    try {
      const fsInstance = getFsInstance();

      if (hasIpc) {
        const auJson = JSON.stringify(currentLesson, null, 2);
        await writeConfigViaIpc(auJson, playerUrl, configPath);
      } else if (repoAccessObject && currentCourse?.basePath) {
        console.log('Rebduiliding');

        if (rebuildPlayerZip && downloadCmi5Player) {
          setStatusMsg('Downloading player zip…');
          await fsInstance.downloadCmi5PlayerIfNeeded(downloadCmi5Player);
        } else {
          setStatusMsg('Seeding player cache from dev server…');
          await fsInstance.seedPlayerCacheFromDevServer(playerUrl);
        }

        setStatusMsg('Building course zip…');
        const lessonDirPath = `compiled_course/blocks/${currentLesson.dirPath}`;
        const courseDirPath = `compiled_course/blocks/${currentCourse.basePath}`;
        const zipBlob = await fsInstance.buildCmi5CourseBlob(
          repoAccessObject,
          currentCourse.basePath,
        );

        setStatusMsg('Uploading to player…');
        console.log('iploading');
        await loadLessonViaZip(
          playerUrl,
          zipBlob,
          lessonDirPath,
          courseDirPath,
        );
      } else {
        console.log('Writing via http');
        const auJson = JSON.stringify(currentLesson, null, 2);
        await writeConfigViaHttp(playerUrl, auJson);
      }

      if (useRealLaunchLink) {
        if (!lmsToken.trim()) {
          setError('LMS bearer token is required for real launch link.');
          return;
        }
        if (!lmsCourseId.trim()) {
          setError('LMS course ID is required for real launch link.');
          return;
        }
        if (!resolvedActorName.trim()) {
          setError('Actor name is required for real launch link.');
          return;
        }

        setStatusMsg('Requesting launch URL from LMS…');
        const launchUrl = await fetchLaunchUrl({
          lmsApiBase,
          courseId: lmsCourseId.trim(),
          auIndex: currentAuIndex,
          token: lmsToken.trim(),
          actorName: resolvedActorName.trim(),
          actorHomePage: actorHomePage.trim() || DEFAULT_ACTOR_HOMEPAGE,
          registration: randomUuid(),
          returnUrl: returnUrl.trim() || DEFAULT_RETURN_URL,
        });
        const localUrl = rewriteLaunchHost(launchUrl, playerUrl);

        if (selectedScenario) {
          setStatusMsg('Mapping scenario to AU…');
          try {
            const auId = await fetchFirstAuId({
              lmsApiBase,
              courseId: lmsCourseId.trim(),
              token: lmsToken.trim(),
            });

            if (!isRangeEnabled)
              throw Error(
                'Range API was not enabled. Invalid attempt to create mapping.',
              );

            await createAuMapping(auId, selectedScenario.uuid);
          } catch (err: unknown) {
            debugLogError(err instanceof Error ? err.message : String(err));
          }
        }

        window.open(localUrl, '_blank');
        onSuccess();
        return;
      }

      window.open(playerUrl, '_blank');
      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setIsLoading(false);
      setStatusMsg(null);
    }
  };

  return { launch, isLoading, statusMsg, error, reset };
}
