import { Cell } from '@mdxeditor/editor';
import {
  ActivityScore,
  GetActivityCacheHandler,
  SetActivityCacheHandler,
  SetCmi5ProgressHandler,
  SubmitCmiScoreHandler,
} from '@rapid-cmi5/cmi5-build-common';

/**
 * Whether editor will display what CMI5 participants see
 */
export const editorInPlayback$ = Cell<boolean>(true);

export const setProgress$ = Cell<SetCmi5ProgressHandler | null>(null);
export const submitScore$ = Cell<SubmitCmiScoreHandler | null>(null);
export const getActivityCache$ = Cell<GetActivityCacheHandler | null>(null);
export const setActivityCache$ = Cell<SetActivityCacheHandler | null>(null);

export const activeTab$ = Cell<number | null>(null);
