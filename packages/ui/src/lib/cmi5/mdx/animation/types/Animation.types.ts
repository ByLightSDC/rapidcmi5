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
  targetNodeKey: string;     // Runtime key (changes per session)
  stableId?: string;         // Stable identifier (survives reload) - V1
  directiveId?: string;      // Animation directive ID - V2 (Phase 2)
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
