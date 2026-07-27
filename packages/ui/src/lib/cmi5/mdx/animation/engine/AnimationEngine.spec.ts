import { AnimationEngine } from './AnimationEngine';
import {
  AnimationConfig,
  AnimationTrigger,
  EntranceEffect,
  PlaybackState,
} from '../types/Animation.types';

/**
 * Covers pause/resume (WCAG 2.2.2). The interesting part is that pausing has to
 * halt BOTH the CSS animation and the setTimeout that drives sequencing — if
 * only the CSS freezes, the sequence silently runs ahead of what the user sees.
 */
describe('AnimationEngine pause/resume', () => {
  const makeAnimation = (
    overrides: Partial<AnimationConfig> = {},
  ): AnimationConfig =>
    ({
      id: 'anim-1',
      order: 1,
      targetNodeKey: 'node-1',
      directiveId: 'directive-1',
      entranceEffect: EntranceEffect.FADE_IN,
      trigger: AnimationTrigger.ON_SLIDE_OPEN,
      duration: 10,
      delay: 0,
      enabled: true,
      ...overrides,
    }) as AnimationConfig;

  let element: HTMLElement;

  const makeEngine = (animations: AnimationConfig[]) =>
    new AnimationEngine(animations, { findElement: () => element });

  beforeEach(() => {
    jest.useFakeTimers();
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    jest.useRealTimers();
    element.remove();
  });

  it('freezes the CSS animation and reports PAUSED', async () => {
    const engine = makeEngine([makeAnimation()]);

    engine.playAll();
    await jest.advanceTimersByTimeAsync(100);

    engine.pause();

    expect(engine.getPlaybackState()).toBe(PlaybackState.PAUSED);
    expect(element.style.animationPlayState).toBe('paused');
  });

  it('unfreezes the CSS animation on resume', async () => {
    const engine = makeEngine([makeAnimation()]);

    engine.playAll();
    await jest.advanceTimersByTimeAsync(100);
    engine.pause();
    engine.resume();

    expect(engine.getPlaybackState()).toBe(PlaybackState.PLAYING);
    expect(element.style.animationPlayState).toBe('');
  });

  it('does not complete while paused, no matter how much time passes', async () => {
    const onAllComplete = jest.fn();
    const engine = new AnimationEngine([makeAnimation({ duration: 1 })], {
      findElement: () => element,
      onAllComplete,
    });

    engine.playAll();
    await jest.advanceTimersByTimeAsync(100);
    engine.pause();

    // Well past the 1s duration — a naive implementation would fire here.
    await jest.advanceTimersByTimeAsync(10000);

    expect(onAllComplete).not.toHaveBeenCalled();
    expect(engine.getPlaybackState()).toBe(PlaybackState.PAUSED);
  });

  it('resumes with only the remaining time, not a full restart', async () => {
    const onAnimationComplete = jest.fn();
    // 1s total; pause 400ms in leaves 600ms to run.
    const engine = new AnimationEngine([makeAnimation({ duration: 1 })], {
      findElement: () => element,
      onAnimationComplete,
    });

    engine.playAll();
    // playAll waits 50ms before starting, so the timeout is armed at t=50.
    await jest.advanceTimersByTimeAsync(450);

    engine.pause();
    await jest.advanceTimersByTimeAsync(5000); // paused: nothing advances
    engine.resume();

    // 300ms into the 600ms remainder — still pending.
    await jest.advanceTimersByTimeAsync(300);
    expect(onAnimationComplete).not.toHaveBeenCalled();

    // Past the remainder — now it completes.
    await jest.advanceTimersByTimeAsync(400);
    expect(onAnimationComplete).toHaveBeenCalledWith('anim-1');
  });

  it('ignores pause() when nothing is playing', () => {
    const engine = makeEngine([makeAnimation()]);

    engine.pause();

    expect(engine.getPlaybackState()).toBe(PlaybackState.IDLE);
  });

  it('clears the frozen play-state on stop so it cannot leak to the next slide', async () => {
    const engine = makeEngine([makeAnimation()]);

    engine.playAll();
    await jest.advanceTimersByTimeAsync(100);
    engine.pause();
    engine.stop();

    expect(element.style.animationPlayState).toBe('');
  });
});
