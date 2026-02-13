import { sendSlideEventVerb } from './LmsStatementManager';
import { store } from '../redux/store';
import { logger } from '../debug';

/**
 * MediaEventManager
 *
 * Manages runtime event listeners for audio and video elements in the course content.
 * Automatically attaches listeners to track playback events and send them to the LRS.
 *
 * Usage:
 *   import { mediaEventManager } from './MediaEventManager';
 *
 *   // After content renders:
 *   mediaEventManager.attachMediaEventListeners();
 *
 * Events Tracked:
 *   Audio: play, pause, ended, progress (25%, 50%, 75%)
 *   Video: play, pause, ended, progress (25%, 50%, 75%), fullscreen
 */
export class MediaEventManager {
  private attachedElements = new WeakSet<HTMLMediaElement>();

  /**
   * Attach event listeners to all audio/video elements in the DOM
   * Safe to call multiple times - prevents duplicate listener attachment
   */
  public attachMediaEventListeners(): void {
    // Find all audio and video elements with tracking IDs
    const audioElements = document.querySelectorAll<HTMLAudioElement>(
      'audio[data-audio-id]',
    );
    const videoElements = document.querySelectorAll<HTMLVideoElement>(
      'video[data-video-id]',
    );

    // Also check for audio elements without data-audio-id (fallback)
    const allAudioElements =
      document.querySelectorAll<HTMLAudioElement>('audio');
    const allVideoElements =
      document.querySelectorAll<HTMLVideoElement>('video');

    logger.debug(
      `Found ${audioElements.length} audio elements with data-audio-id`,
      undefined,
      'media',
    );
    logger.debug(
      `Found ${allAudioElements.length} total audio elements`,
      undefined,
      'media',
    );
    logger.debug(
      `Found ${videoElements.length} video elements with data-video-id`,
      undefined,
      'media',
    );
    logger.debug(
      `Found ${allVideoElements.length} total video elements`,
      undefined,
      'media',
    );

    // Log all audio elements for debugging
    allAudioElements.forEach((audio, index) => {
      const hasId = audio.hasAttribute('data-audio-id');
      const audioId = audio.getAttribute('data-audio-id');
      const src = audio.getAttribute('src');
      logger.trace(
        `Audio ${index}: hasId=${hasId}, id=${audioId}, src=${src}`,
        undefined,
        'media',
      );
    });

    audioElements.forEach((audio) => this.attachAudioListeners(audio));
    videoElements.forEach((video) => this.attachVideoListeners(video));

    // If no audio elements have data-audio-id, attach to all audio elements with generated IDs
    if (audioElements.length === 0 && allAudioElements.length > 0) {
      logger.warn(
        'No audio elements with data-audio-id found, attaching to all audio elements',
        undefined,
        'media',
      );
      allAudioElements.forEach((audio, index) => {
        // Generate a temporary ID for tracking
        if (!audio.hasAttribute('data-audio-id')) {
          audio.setAttribute('data-audio-id', `audio-${index}-${Date.now()}`);
        }
        this.attachAudioListeners(audio);
      });
    }

    // Same for video
    if (videoElements.length === 0 && allVideoElements.length > 0) {
      logger.warn(
        'No video elements with data-video-id found, attaching to all video elements',
        undefined,
        'media',
      );
      allVideoElements.forEach((video, index) => {
        // Generate a temporary ID for tracking
        if (!video.hasAttribute('data-video-id')) {
          video.setAttribute('data-video-id', `video-${index}-${Date.now()}`);
        }
        this.attachVideoListeners(video);
      });
    }
  }

  /**
   * Attach all audio event listeners to an audio element
   */
  private attachAudioListeners(audio: HTMLAudioElement): void {
    // Prevent duplicate listeners using WeakSet
    if (this.attachedElements.has(audio)) {
      return;
    }
    this.attachedElements.add(audio);

    const audioId = audio.getAttribute('data-audio-id');

    // Programmatically trigger autoplay for elements with the autoplay attribute
    // Browsers only honor the autoplay HTML attribute at initial page load,
    // not when elements are dynamically mounted in SPAs

    if (audio.hasAttribute('autoplay')) {
      // Mute first — browsers block unmuted autoplay without prior user interaction
      audio.muted = true;
      audio
        .play()
        .then(() => {
          // Remove the muted HTML attribute so native controls allow unmuting
          audio.removeAttribute('muted');

          // On first user click, unmute and refresh controls
          const enableUnmute = () => {
            audio.muted = false;
            audio.removeAttribute('controls');
            requestAnimationFrame(() => {
              audio.setAttribute('controls', 'true');
            });
            audio.removeEventListener('click', enableUnmute);
          };
          audio.addEventListener('click', enableUnmute);

          logger.info(
            `Audio ${audioId} autoplay succeeded, click-to-unmute listener attached`,
            undefined,
            'media',
          );
        })
        .catch((err) => {
          console.error(
            `[MediaEventManager] Audio ${audioId} - play() FAILED:`,
            err.name,
            err.message,
          );
          logger.warn(
            `Audio ${audioId} autoplay failed: ${err.message}`,
            undefined,
            'media',
          );
        });
    }

    // Track play event
    audio.addEventListener('play', () => {
      const slideNumber = this.getCurrentSlideNumber();
      const slideName = this.getSlideName();
      logger.info(
        `Audio ${audioId} started playing on slide ${slideNumber}`,
        undefined,
        'media',
      );
      sendSlideEventVerb(slideNumber, 'audio_play', slideName);
    });

    // Track completion
    audio.addEventListener('ended', () => {
      const slideNumber = this.getCurrentSlideNumber();
      const slideName = this.getSlideName();
      logger.info(
        `Audio ${audioId} completed on slide ${slideNumber}`,
        undefined,
        'media',
      );
      sendSlideEventVerb(slideNumber, 'audio_complete', slideName);
    });

    // Track pause (for analytics)
    audio.addEventListener('pause', () => {
      // Don't track pause if audio has ended (ended event already fired)
      if (!audio.ended) {
        const slideNumber = this.getCurrentSlideNumber();
        const slideName = this.getSlideName();
        logger.debug(
          `Audio ${audioId} paused on slide ${slideNumber}`,
          undefined,
          'media',
        );
        sendSlideEventVerb(slideNumber, 'audio_pause', slideName);
      }
    });

    // Track progress milestones (25%, 50%, 75%)
    const milestones = new Set<number>();
    audio.addEventListener('timeupdate', () => {
      if (audio.duration && !isNaN(audio.duration)) {
        const progress = (audio.currentTime / audio.duration) * 100;

        // Check each milestone
        if (progress >= 25 && !milestones.has(25)) {
          milestones.add(25);
          const slideNumber = this.getCurrentSlideNumber();
          const slideName = this.getSlideName();
          logger.debug(
            `Audio ${audioId} reached 25% on slide ${slideNumber}`,
            undefined,
            'media',
          );
          sendSlideEventVerb(slideNumber, 'audio_progress_25', slideName);
        }
        if (progress >= 50 && !milestones.has(50)) {
          milestones.add(50);
          const slideNumber = this.getCurrentSlideNumber();
          const slideName = this.getSlideName();
          logger.debug(
            `Audio ${audioId} reached 50% on slide ${slideNumber}`,
            undefined,
            'media',
          );
          sendSlideEventVerb(slideNumber, 'audio_progress_50', slideName);
        }
        if (progress >= 75 && !milestones.has(75)) {
          milestones.add(75);
          const slideNumber = this.getCurrentSlideNumber();
          const slideName = this.getSlideName();
          logger.debug(
            `Audio ${audioId} reached 75% on slide ${slideNumber}`,
            undefined,
            'media',
          );
          sendSlideEventVerb(slideNumber, 'audio_progress_75', slideName);
        }
      }
    });
  }

  /**
   * Attach all video event listeners to a video element
   */
  private attachVideoListeners(video: HTMLVideoElement): void {
    // Prevent duplicate listeners using WeakSet
    if (this.attachedElements.has(video)) {
      return;
    }
    this.attachedElements.add(video);

    const videoId = video.getAttribute('data-video-id');

    // Programmatically trigger autoplay for elements with the autoplay attribute
    // Browsers only honor the autoplay HTML attribute at initial page load,
    // not when elements are dynamically mounted in SPAs
    // Diagnostic logging for autoplay debugging

    if (video.hasAttribute('autoplay')) {
      // Ensure video.muted property is true (not just the HTML attribute)
      // This is required for browser autoplay policy compliance
      video.muted = true;

      video
        .play()
        .then(() => {
          // Remove the muted HTML attribute so native controls allow unmuting
          video.removeAttribute('muted');

          // On first user click, unmute and refresh controls
          const enableUnmute = () => {
            video.muted = false;
            video.removeAttribute('controls');
            requestAnimationFrame(() => {
              video.setAttribute('controls', 'true');
            });
            video.removeEventListener('click', enableUnmute);
          };
          video.addEventListener('click', enableUnmute);

          logger.info(
            `Video ${videoId} autoplay succeeded, click-to-unmute listener attached`,
            undefined,
            'media',
          );
        })
        .catch((err) => {
          console.error(
            `[MediaEventManager] Video ${videoId} - play() FAILED:`,
            err.name,
            err.message,
          );
          logger.warn(
            `Video ${videoId} autoplay failed: ${err.message}`,
            undefined,
            'media',
          );
        });
    }

    // Track play event
    video.addEventListener('play', () => {
      const slideNumber = this.getCurrentSlideNumber();
      const slideName = this.getSlideName();
      logger.info(
        `Video ${videoId} started playing on slide ${slideNumber}`,
        undefined,
        'media',
      );
      sendSlideEventVerb(slideNumber, 'video_play', slideName);
    });

    // Track completion
    video.addEventListener('ended', () => {
      const slideNumber = this.getCurrentSlideNumber();
      const slideName = this.getSlideName();
      logger.info(
        `Video ${videoId} completed on slide ${slideNumber}`,
        undefined,
        'media',
      );
      sendSlideEventVerb(slideNumber, 'video_complete', slideName);
    });

    // Track pause (for analytics)
    video.addEventListener('pause', () => {
      // Don't track pause if video has ended (ended event already fired)
      if (!video.ended) {
        const slideNumber = this.getCurrentSlideNumber();
        const slideName = this.getSlideName();
        logger.debug(
          `Video ${videoId} paused on slide ${slideNumber}`,
          undefined,
          'media',
        );
        sendSlideEventVerb(slideNumber, 'video_pause', slideName);
      }
    });

    // Track progress milestones (25%, 50%, 75%)
    const milestones = new Set<number>();
    video.addEventListener('timeupdate', () => {
      if (video.duration && !isNaN(video.duration)) {
        const progress = (video.currentTime / video.duration) * 100;

        // Check each milestone
        if (progress >= 25 && !milestones.has(25)) {
          milestones.add(25);
          const slideNumber = this.getCurrentSlideNumber();
          const slideName = this.getSlideName();
          logger.debug(
            `Video ${videoId} reached 25% on slide ${slideNumber}`,
            undefined,
            'media',
          );
          sendSlideEventVerb(slideNumber, 'video_progress_25', slideName);
        }
        if (progress >= 50 && !milestones.has(50)) {
          milestones.add(50);
          const slideNumber = this.getCurrentSlideNumber();
          const slideName = this.getSlideName();
          logger.debug(
            `Video ${videoId} reached 50% on slide ${slideNumber}`,
            undefined,
            'media',
          );
          sendSlideEventVerb(slideNumber, 'video_progress_50', slideName);
        }
        if (progress >= 75 && !milestones.has(75)) {
          milestones.add(75);
          const slideNumber = this.getCurrentSlideNumber();
          const slideName = this.getSlideName();
          logger.debug(
            `Video ${videoId} reached 75% on slide ${slideNumber}`,
            undefined,
            'media',
          );
          sendSlideEventVerb(slideNumber, 'video_progress_75', slideName);
        }
      }
    });

    // Track fullscreen changes (video-specific)
    video.addEventListener('fullscreenchange', () => {
      const slideNumber = this.getCurrentSlideNumber();
      const slideName = this.getSlideName();
      const isFullscreen = document.fullscreenElement === video;

      logger.debug(
        `Video ${videoId} fullscreen ${isFullscreen ? 'entered' : 'exited'} on slide ${slideNumber}`,
        undefined,
        'media',
      );

      const eventType = isFullscreen
        ? 'video_fullscreen_enter'
        : 'video_fullscreen_exit';

      sendSlideEventVerb(slideNumber, eventType, slideName);
    });
  }

  /**
   * Get the current slide number from Redux store
   */
  private getCurrentSlideNumber(): number {
    const state = store.getState();
    return state.navigation?.activeTab ?? 0;
  }

  /**
   * Get the current slide name from Redux store
   */
  private getSlideName(): string | undefined {
    const state = store.getState();
    const slides = state.au?.courseAUProgress?.courseStructure?.slides;
    const activeTab = state.navigation?.activeTab;
    return slides?.[activeTab]?.slideTitle;
  }

  /**
   * Cleanup listeners (if needed for SPA navigation)
   * Note: WeakSet automatically handles cleanup when elements are removed from DOM
   */
  public cleanup(): void {
    // WeakSet automatically handles cleanup when elements are garbage collected
    // This method is here for potential future manual cleanup needs
  }
}

// Singleton instance for global use
export const mediaEventManager = new MediaEventManager();
