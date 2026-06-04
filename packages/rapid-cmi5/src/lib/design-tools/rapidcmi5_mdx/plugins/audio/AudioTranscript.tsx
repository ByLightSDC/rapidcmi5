import React from 'react';
import { parseVtt, VttCue } from './parseVtt';
import styles from './styles/audio-plugin.module.css';

interface AudioTranscriptProps {
  /** URL of the WebVTT caption/transcript file. */
  captionSrc: string;
  /** Ref to the associated audio element, used for highlighting and seeking. */
  audioRef: React.RefObject<HTMLAudioElement>;
}

/**
 * Formats a number of seconds as `M:SS` for display alongside a cue.
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * A transcript panel for an audio element. Audio has no native captions UI, so
 * this fetches the associated WebVTT file, renders it as a collapsible list of
 * cues below the player, highlights the cue matching the current playback time,
 * and lets the learner click a cue to seek the audio to that point.
 */
export function AudioTranscript({
  captionSrc,
  audioRef,
}: AudioTranscriptProps): JSX.Element | null {
  const [cues, setCues] = React.useState<VttCue[]>([]);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);

  // Fetch and parse the VTT whenever the source changes.
  React.useEffect(() => {
    let cancelled = false;
    setError(false);
    setCues([]);

    if (!captionSrc) {
      return;
    }

    fetch(captionSrc)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load transcript: ${res.status}`);
        }
        return res.text();
      })
      .then((text) => {
        if (!cancelled) {
          setCues(parseVtt(text));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [captionSrc]);

  // Track the active cue against the audio's current time.
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio || cues.length === 0) {
      return;
    }

    const onTimeUpdate = () => {
      const t = audio.currentTime;
      const index = cues.findIndex((cue) => t >= cue.start && t < cue.end);
      setActiveIndex(index);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [audioRef, cues]);

  const handleCueClick = (cue: VttCue) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = cue.start;
    }
  };

  // Nothing to show if the transcript could not be loaded or has no cues.
  if (error || cues.length === 0) {
    return null;
  }

  return (
    <div className={styles.transcriptContainer}>
      <button
        type="button"
        className={styles.transcriptToggle}
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? 'Hide transcript' : 'Show transcript'}
      </button>
      {expanded && (
        <ol className={styles.transcriptList}>
          {cues.map((cue, index) => (
            <li
              key={`${cue.start}-${index}`}
              className={
                index === activeIndex
                  ? `${styles.transcriptCue} ${styles.transcriptCueActive}`
                  : styles.transcriptCue
              }
            >
              <button
                type="button"
                className={styles.transcriptCueButton}
                onClick={() => handleCueClick(cue)}
              >
                <span className={styles.transcriptTime}>
                  {formatTime(cue.start)}
                </span>
                <span className={styles.transcriptText}>{cue.text}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
