import { RC5ActivityTypeEnum } from './activity';
import { Cmi5Scenario, CourseAU, CourseData } from './course';
import { QuizState } from './quiz';
import { ActivityScore } from './score';
import { SlideType } from './slide';

export type SetCmi5ProgressHandler = (progress: boolean) => void;
export type SubmitCmiScoreHandler = (data: ActivityScore) => void;
export type SetCmi5QuizProgressHandler = (data: QuizState) => void;
export type GetCmi5QuizProgressHandler = (
  quizState: QuizState,
) => Promise<QuizState>;
export type SetAutoGraderProgressHandler = (uuid: string) => Promise<void>;
export type GetAutoGraderProgressHandler = () => Promise<Set<string>>;

export type GetActivityCacheHandler = (
  atype: RC5ActivityTypeEnum,
  state?: ActivityCacheGetState,
) => Promise<ActivityCacheGetReturnType>;
export type SetActivityCacheHandler = (
  atype: RC5ActivityTypeEnum,
  state?: ActivityCacheSetState,
) => void;
export type ActivityCacheSetState = QuizState | string;
export type ActivityCacheGetState = QuizState;
export type ActivityCacheGetReturnType = QuizState | Set<string> | null;

export interface AuContextProps {
  activeTab: number;
  course?: CourseData;
  au?: CourseAU;
  getSlide?: (props: AuContextProps) => JSX.Element | null;
  progressPercent: number;
  scenario?: Cmi5Scenario | undefined;
  slides: SlideType[];
  viewedSlides: number[];
  setActiveTab: (selTab: number) => void;
  setProgress: SetCmi5ProgressHandler | null;
  slideData?: string;
  submitScore: SubmitCmiScoreHandler | null;
  setActivityCache: SetActivityCacheHandler | null;
  getActivityCache: GetActivityCacheHandler | null;
  getLocalImage?: (imagePath: string, auPath: string) => Promise<string | null>;
  isAuthenticated: boolean;
  isTestMode: boolean;
}

export enum AuManagerState {
  waiting = 'Loading...',
  loadingOverrides = 'Loading Config...',
  loadingContent = 'Loading Content...',
  authenticating = 'Authenticating...',
  loadingScenario = 'Loading Scenario...',
  initializingProgress = 'Retrieving Progress...',
  ready = 'Ready',
  error = 'Error',
}
