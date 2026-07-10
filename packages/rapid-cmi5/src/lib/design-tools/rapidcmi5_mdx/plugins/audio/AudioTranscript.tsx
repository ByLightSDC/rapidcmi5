import React from 'react';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import { parseTranscript, VttCue } from './parseVtt';
import styles from './styles/audio-plugin.module.css';

interface AudioTranscriptProps {
  /**
   * Fetchable URL of the caption file (blob URL in the builder, relative path
   * in the player). May be a `.vtt` or `.txt` file — the content decides how it
   * renders (timed cues vs. plain text), not the extension.
   */
  captionSrc?: string;
  /**
   * Back-compat only: inline plain-text transcript from legacy content authored
   * before the file-only model (serialized as `data-caption-text`). Rendered
   * read-only when no `captionSrc` file is present. The dialog no longer
   * produces this.
   */
  fallbackText?: string;
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
 * The visible contents of the transcript toggle: a decorative CC glyph followed
 * by the label. The icon is `aria-hidden` so the button's accessible name stays
 * "Show/Hide transcript" and screen readers (e.g. NVDA) announce it as a button
 * without reading "CC" as stray text.
 */
function ToggleLabel({ expanded }: { expanded: boolean }): JSX.Element {
  return (
    <>
      <ClosedCaptionIcon
        aria-hidden="true"
        fontSize="small"
        className={styles.transcriptToggleIcon}
      />
      {expanded ? 'Hide transcript' : 'Show transcript'}
    </>
  );
}

/**
 * A transcript panel for an audio element. Audio has no native captions UI, so
 * this fetches the associated caption file and renders it below the player as a
 * collapsible panel.
 *
 * The caption file may be timed WebVTT or plain text. We attempt a VTT parse
 * and, if it yields cues, render the timed list (highlighting the active cue and
 * seeking on click); otherwise we render the file's text statically. This lets a
 * single file picker accept `.vtt` or `.txt` transparently.
 */
export function AudioTranscript({
  captionSrc,
  fallbackText,
  audioRef,
}: AudioTranscriptProps): JSX.Element | null {
  const [cues, setCues] = React.useState<VttCue[]>([]);
  const [text, setText] = React.useState<string>('');
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const [expanded, setExpanded] = React.useState<boolean>(false);

  const legacyText =
    typeof fallbackText === 'string' && fallbackText.trim() !== ''
      ? fallbackText
      : '';

  // Fetch and interpret the caption file whenever the source changes.
  React.useEffect(() => {
    let cancelled = false;
    setCues([]);
    // Default to the legacy inline text (if any) until/unless a file loads.
    setText(legacyText);

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
      .then((raw) => {
        if (cancelled) {
          return;
        }
        const parsed = parseTranscript(raw);
        if (parsed.kind === 'vtt') {
          setCues(parsed.cues);
          setText('');
        } else {
          setCues([]);
          setText(parsed.text);
        }
      })
      .catch(() => {
        // Fall back to legacy inline text if the file cannot be loaded.
        if (!cancelled) {
          setCues([]);
          setText(legacyText);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [captionSrc, legacyText]);

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

  const hasCues = cues.length > 0;
  const hasText = text.trim() !== '';

  // Nothing to show if neither a timed transcript nor any text is available.
  if (!hasCues && !hasText) {
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
        <ToggleLabel expanded={expanded} />
      </button>
      {expanded &&
        (hasCues ? (
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
        ) : (
          <div
            className={styles.transcriptText}
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {text}
          </div>
        ))}
    </div>
  );
}
