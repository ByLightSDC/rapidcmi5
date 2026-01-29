export enum AnimationTrigger {
  ON_SLIDE_OPEN = 'onSlideOpen',
  AFTER_DELAY = 'afterDelay',
  ON_PREVIOUS_COMPLETE = 'onPreviousComplete',
}

export enum EntranceEffect {
  NONE = 'none',
  FADE_IN = 'fadeIn',
  APPEAR = 'appear',
  FLY_IN = 'flyIn',
}

export enum ExitEffect {
  NONE = 'none',
  FADE_OUT = 'fadeOut',
  DISAPPEAR = 'disappear',
  FLY_OUT = 'flyOut',
}

export type Direction = 'top' | 'bottom' | 'left' | 'right';

export interface AnimationConfig {
  id: string;
  order: number;
  targetNodeKey: string;     // Runtime Lexical key (internal use, changes per session)
  directiveId: string;       // Animation directive ID (e.g., "anim_fadeIn_1") - REQUIRED for V2
  /** @deprecated Legacy V1 - no longer used. All animations must use directiveId */
  stableId?: string;
  targetLabel?: string;
  entranceEffect?: EntranceEffect;
  exitEffect?: ExitEffect;
  trigger: AnimationTrigger;
  duration: number; // In seconds
  delay: number; // In seconds
  easing?: string;
  direction?: Direction;
  enabled: boolean;
}

export interface SlideAnimationData {
  version: string;
  animations: AnimationConfig[];
}

/**
 * Playback state enum for animation engine
 */
export enum PlaybackState {
  IDLE = 'idle',
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
}
