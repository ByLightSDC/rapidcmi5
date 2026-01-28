import { debugLog } from 'packages/ui/src/lib/utility/logger';
import {
  AnimationConfig,
  AnimationTrigger,
  EntranceEffect,
  ExitEffect,
  PlaybackState,
} from '../types/Animation.types';

/**
 * Animation Engine Options
 */
export interface AnimationEngineOptions {
  onAnimationStart?: (animationId: string) => void;
  onAnimationComplete?: (animationId: string) => void;
  onAllComplete?: () => void;
  prefersReducedMotion?: boolean;
  /**
   * Optional hook used by editor to mark playing state; player can omit.
   */
  onMarkPlaying?: (targetNodeKey: string, playing: boolean) => void;
  /**
   * Enable verbose diagnostics (debugLog). Default: false/undefined.
   */
  enableDiagnostics?: boolean;
  /**
   * Custom element finder function
   * Allows player/editor to provide their own element lookup strategy
   */
  findElement?: (targetNodeKey: string) => HTMLElement | null;
}

/**
 * Animation Engine
 * Orchestrates the application of CSS animations to DOM elements
 *
 * This is a shared library used by both:
 * - cc-infrastructure-portal (editor with preview)
 * - cc-cmi5-player (runtime playback)
 */
export class AnimationEngine {
  private animations: AnimationConfig[];
  private options: AnimationEngineOptions;
  private playbackState: PlaybackState = PlaybackState.IDLE;
  private currentAnimationIndex = 0;
  private animationTimeouts: Map<string, number> = new Map();
  private animationElements: Map<string, HTMLElement> = new Map();

  constructor(
    animations: AnimationConfig[],
    options: AnimationEngineOptions = {},
  ) {
    this.animations = [...animations].sort((a, b) => a.order - b.order);
    this.options = options;
  }

  /**
   * Start playing all animations in sequence
   */
  public async playAll(): Promise<void> {
    if (this.playbackState === PlaybackState.PLAYING) {
      console.warn('Animations are already playing');
      return;
    }

    this.playbackState = PlaybackState.PLAYING;
    this.currentAnimationIndex = 0;

    // Initialize elements (hide those with entrance effects)
    this.initialize();

    // Small delay to ensure hidden state is applied
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Play animations based on their triggers
    await this.playAnimationSequence();

    this.playbackState = PlaybackState.IDLE;
    this.options.onAllComplete?.();
  }

  /**
   * Play a single animation by ID
   */
  public async playSingle(animationId: string): Promise<void> {
    const animation = this.animations.find((a) => a.id === animationId);
    if (!animation) {
      console.warn(`Animation not found: ${animationId}`);
      return;
    }

    if (!animation.enabled) {
      debugLog(
        `Animation ${animationId} is disabled, skipping`,
        undefined,
        undefined,
        'engine',
      );
      return;
    }

    await this.applyAnimation(animation);
  }

  /**
   * Stop all playing animations
   */
  public stop(): void {
    this.playbackState = PlaybackState.STOPPED;

    // Clear all timeouts
    this.animationTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.animationTimeouts.clear();

    // Remove animation classes from all elements
    this.animationElements.forEach((element) => {
      this.removeAnimationClasses(element);
    });
    this.animationElements.clear();

    this.currentAnimationIndex = 0;
  }

  /**
   * Reset all animations to initial state (prepare for replay)
   * This hides elements with entrance effects so they can be animated in again
   */
  public reset(): void {
    this.stop();
    this.playbackState = PlaybackState.IDLE;

    debugLog(
      '🔄 Resetting animations to initial state (preparing for replay)',
      undefined,
      undefined,
      'engine',
    );
    this.animations.forEach((anim) => {
      const element = this.findElement(anim.targetNodeKey);
      if (element) {
        // Remove ALL animation classes first
        this.removeAnimationClasses(element);

        // Then hide if it has entrance effect
        if (
          anim.entranceEffect &&
          anim.entranceEffect !== EntranceEffect.NONE
        ) {
          element.classList.add('anim-hidden');
        }
      }
    });
  }

  /**
   * Cleanup all animations and restore elements to normal visible state
   * Use this when done previewing (not preparing for replay)
   */
  public cleanup(): void {
    this.stop();
    this.playbackState = PlaybackState.IDLE;

    debugLog(
      '🧹 Cleaning up animations and restoring normal state',
      undefined,
      undefined,
      'engine',
    );
    this.animations.forEach((anim) => {
      const element = this.findElement(anim.targetNodeKey);
      if (element) {
        // Remove ALL animation classes and restore visibility
        this.removeAnimationClasses(element);

        // Remove anim-hidden class and ensure element is visible
        element.classList.remove('anim-hidden');
        element.style.opacity = '';
        element.style.visibility = '';
      }
    });
  }

  /**
   * Initialize elements - hide those with entrance effects
   * Call this before playing animations
   */
  public initialize(): void {
    debugLog(
      '🎬 Initializing animation states',
      undefined,
      undefined,
      'engine',
    );
    this.animations.forEach((anim) => {
      const element = this.findElement(anim.targetNodeKey);
      if (element) {
        // Clean up any existing animation classes first
        this.removeAnimationClasses(element);

        // Then hide if it has entrance effect
        if (
          anim.entranceEffect &&
          anim.entranceEffect !== EntranceEffect.NONE
        ) {
          element.classList.add('anim-hidden');
        }
      }
    });
  }

  /**
   * Play animations in sequence based on their configuration
   */
  private async playAnimationSequence(): Promise<void> {
    const onSlideOpenAnims = this.animations.filter(
      (a) => a.enabled && a.trigger === AnimationTrigger.ON_SLIDE_OPEN,
    );
    const afterDelayAnims = this.animations.filter(
      (a) => a.enabled && a.trigger === AnimationTrigger.AFTER_DELAY,
    );
    const onPreviousCompleteAnims = this.animations.filter(
      (a) => a.enabled && a.trigger === AnimationTrigger.ON_PREVIOUS_COMPLETE,
    );

    debugLog(
      '📋 Animation sequence:',
      {
        onSlideOpen: onSlideOpenAnims.length,
        afterDelay: afterDelayAnims.length,
        onPreviousComplete: onPreviousCompleteAnims.length,
      },
      undefined,
      'engine',
    );

    // Play all "on slide open" animations simultaneously
    if (onSlideOpenAnims.length > 0) {
      debugLog(
        '▶️ Playing "on slide open" animations',
        { count: onSlideOpenAnims.length },
        undefined,
        'engine',
      );
      await Promise.all(
        onSlideOpenAnims.map((anim) => this.applyAnimation(anim)),
      );
    }

    // Play "after delay" animations
    if (afterDelayAnims.length > 0) {
      debugLog(
        '▶️ Playing "after delay" animations',
        { count: afterDelayAnims.length },
        undefined,
        'engine',
      );
      for (const anim of afterDelayAnims) {
        if (this.playbackState === PlaybackState.STOPPED) break;
        await this.applyAnimation(anim);
      }
    }

    // Play "on previous complete" animations in sequence
    if (onPreviousCompleteAnims.length > 0) {
      debugLog(
        '▶️ Playing "on previous complete" animations',
        { count: onPreviousCompleteAnims.length },
        undefined,
        'engine',
      );
      for (const anim of onPreviousCompleteAnims) {
        if (this.playbackState === PlaybackState.STOPPED) break;
        await this.applyAnimation(anim);
      }
    }
  }

  /**
   * Apply animation to a single element
   */
  private async applyAnimation(animation: AnimationConfig): Promise<void> {
    return new Promise((resolve) => {
      const element = this.findElement(animation.targetNodeKey);

      if (!element) {
        console.warn(
          `❌ Element not found for animation: ${animation.id} (key: ${animation.targetNodeKey})`,
        );
        resolve();
        return;
      }

      if (this.options.enableDiagnostics) {
        debugLog(
          '✅ Found element for animation',
          { id: animation.id, element },
          undefined,
          'engine',
        );
      }
      this.animationElements.set(animation.id, element);

      // Mark as playing (editor-only hook; player can leave undefined)
      this.options.onMarkPlaying?.(animation.targetNodeKey, true);

      // Apply entrance effect
      if (
        animation.entranceEffect &&
        animation.entranceEffect !== EntranceEffect.NONE
      ) {
        if (this.options.enableDiagnostics) {
          debugLog(
            '🎨 Applying entrance effect',
            { effect: animation.entranceEffect, element },
            undefined,
            'engine',
          );
        }
        this.applyEntranceEffect(element, animation);
      }

      // Calculate total duration
      const totalDuration = (animation.delay + animation.duration) * 1000;

      // Handle animation complete
      const timeoutId = window.setTimeout(() => {
        // Apply exit effect if specified
        if (animation.exitEffect && animation.exitEffect !== ExitEffect.NONE) {
          if (this.options.enableDiagnostics) {
            debugLog(
              '🎨 Applying exit effect',
              { effect: animation.exitEffect },
              undefined,
              'engine',
            );
          }
          this.applyExitEffect(element, animation);
        }

        // Mark as stopped
        this.options.onMarkPlaying?.(animation.targetNodeKey, false);

        this.options.onAnimationComplete?.(animation.id);
        this.animationTimeouts.delete(animation.id);
        resolve();
      }, totalDuration);

      this.animationTimeouts.set(animation.id, timeoutId);
      this.options.onAnimationStart?.(animation.id);
    });
  }

  /**
   * Apply entrance effect to element
   */
  private applyEntranceEffect(
    element: HTMLElement,
    animation: AnimationConfig,
  ): void {
    // Remove ALL old animation classes first
    this.removeAnimationClasses(element);

    // Remove hidden state
    element.classList.remove('anim-hidden');

    // Build animation class name
    const direction = animation.direction ? `-${animation.direction}` : '';
    const className = `anim-entrance-${animation.entranceEffect}${direction}`;

    // Set animation properties
    const duration = this.options.prefersReducedMotion
      ? 0.01
      : animation.duration;
    const delay = this.options.prefersReducedMotion ? 0 : animation.delay;
    const easing = animation.easing || 'ease';

    // Apply animation class
    element.classList.add(className);

    // Set animation properties via inline styles (highest priority)
    element.style.animationDuration = `${duration}s`;
    element.style.animationDelay = `${delay}s`;
    element.style.animationTimingFunction = easing;
    element.style.animationFillMode = 'both'; // Ensure animation state persists
  }

  /**
   * Apply exit effect to element
   */
  private applyExitEffect(
    element: HTMLElement,
    animation: AnimationConfig,
  ): void {
    // Remove entrance classes
    this.removeAnimationClasses(element);

    // Build animation class name
    const direction = animation.direction ? `-${animation.direction}` : '';
    const className = `anim-exit-${animation.exitEffect}${direction}`;

    // Apply animation class
    element.classList.add(className);

    // Set animation properties
    const duration = this.options.prefersReducedMotion
      ? 0.01
      : animation.duration;
    const easing = animation.easing || 'ease';

    element.style.animationDuration = `${duration}s`;
    element.style.animationDelay = '0s';
    element.style.animationTimingFunction = easing;

    debugLog(
      `Applied exit effect: ${className} to element`,
      element,
      undefined,
      'engine',
    );
  }

  /**
   * Find DOM element by target node key
   * Uses custom finder if provided, otherwise uses default strategy
   */
  private findElement(nodeKey: string): HTMLElement | null {
    // Use custom finder if provided
    if (this.options.findElement) {
      return this.options.findElement(nodeKey);
    }

    // Default finding strategy
    return this.defaultFindElement(nodeKey);
  }

  /**
   * Default element finding strategy
   * V2: Looks for elements by data-anim-directive-id attribute
   * This requires animations to use the :anim directive wrapper pattern
   */
  private defaultFindElement(nodeKey: string): HTMLElement | null {
    // Find the animation config to get the directiveId
    const animation = this.animations.find((a) => a.targetNodeKey === nodeKey);

    if (!animation?.directiveId) {
      console.warn(
        `❌ Animation missing directiveId - cannot find element. Animation ID: ${animation?.id || 'unknown'}`,
        'All animations must use the :anim{id="..."} directive wrapper pattern.',
      );
      return null;
    }

    // Find element by directive ID attribute (set by AnimDirectiveDescriptor)
    const directiveElement = document.querySelector<HTMLElement>(
      `[data-anim-directive-id="${animation.directiveId}"]`,
    );

    if (!directiveElement) {
      console.warn(
        `❌ Could not find element with data-anim-directive-id="${animation.directiveId}"`,
        'Ensure the :anim{id="' + animation.directiveId + '"} directive exists in the markdown.',
      );
    }

    return directiveElement;
  }

  /**
   * Remove all animation classes from element
   */
  private removeAnimationClasses(element: HTMLElement): void {
    const classes = Array.from(element.classList).filter(
      (cls) => cls.startsWith('anim-entrance-') || cls.startsWith('anim-exit-'),
    );

    if (classes.length > 0) {
      element.classList.remove(...classes);
    }

    // Clear all animation-related inline styles
    element.style.animationDuration = '';
    element.style.animationDelay = '';
    element.style.animationTimingFunction = '';
    element.style.animationFillMode = '';
  }

  /**
   * Get current playback state
   */
  public getPlaybackState(): PlaybackState {
    return this.playbackState;
  }

  /**
   * Check if user prefers reduced motion
   */
  public static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
