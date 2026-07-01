import React from 'react';
import { AuContextProps } from '@rapid-cmi5/cmi5-build-common';

/**
 * A single parsed WebVTT cue.
 */
interface VttCue {
  /** Start time in seconds. */
  start: number;
  /** End time in seconds. */
  end: number;
  /** Cue text. */
  text: string;
}

/**
 * Converts a WebVTT timestamp (`HH:MM:SS.mmm` or `MM:SS.mmm`) into seconds.
 * Returns `NaN` if the timestamp cannot be parsed.
 */
function timestampToSeconds(timestamp: string): number {
  const parts = timestamp.trim().split(':');
  if (parts.length < 2 || parts.length > 3) {
    return NaN;
  }
  const seconds = parts.map((p) => Number(p.replace(',', '.')));
  if (seconds.some((n) => Number.isNaN(n))) {
    return NaN;
  }
  if (seconds.length === 3) {
    const [h, m, s] = seconds;
    return h * 3600 + m * 60 + s;
  }
  const [m, s] = seconds;
  return m * 60 + s;
}

/**
 * Parses WebVTT text into an ordered list of timed cues. Cue settings and
 * identifiers are ignored — only timing and text are retained.
 */
function parseVtt(vtt: string): VttCue[] {
  const cues: VttCue[] = [];
  const blocks = vtt.replace(/\r\n?/g, '\n').split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split('\n').filter((line) => line.trim() !== '');
    if (lines.length === 0) {
      continue;
    }
    const arrowIndex = lines.findIndex((line) => line.includes('-->'));
    if (arrowIndex === -1) {
      continue;
    }
    const [startRaw, endRaw] = lines[arrowIndex].split('-->');
    if (!startRaw || !endRaw) {
      continue;
    }
    const start = timestampToSeconds(startRaw);
    const end = timestampToSeconds(endRaw.trim().split(/\s+/)[0]);
    if (Number.isNaN(start) || Number.isNaN(end)) {
      continue;
    }
    const text = lines
      .slice(arrowIndex + 1)
      .map((line) => line.replace(/<[^>]+>/g, ''))
      .join('\n')
      .trim();
    if (text === '') {
      continue;
    }
    cues.push({ start, end, text });
  }
  return cues;
}

/**
 * Formats seconds as `M:SS`.
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Reads the value of a hast property, accounting for react-markdown's camelCase
 * conversion of `data-*` attributes.
 */
function prop(
  node: { properties?: Record<string, unknown> } | undefined,
  ...keys: string[]
): string | undefined {
  const properties = node?.properties;
  if (!properties) {
    return undefined;
  }
  for (const key of keys) {
    const value = properties[key];
    if (typeof value === 'string' && value !== '') {
      return value;
    }
  }
  return undefined;
}

/**
 * Player-side renderer for `<audio>` elements in course content.
 *
 * Audio has no native captions UI, so this renders the native player followed
 * by an optional collapsible transcript panel. The transcript comes from one of
 * two sources serialized onto the element by the editor:
 *  - `data-caption-src`: a WebVTT file (timed; highlights the active cue and
 *    seeks the audio on cue click).
 *  - `data-caption-text`: a block of plain text (static, no timing).
 *
 * The native `data-audio-id` / `src` / `autoplay` / inline styles are preserved
 * so existing playback + LRS tracking (MediaEventManager) keep working.
 */
export default function MDAudio(
  props: { node: any; auProps?: AuContextProps } & Record<string, unknown>,
): JSX.Element {
  const { node, auProps } = props;

  const rawSrc = prop(node, 'src');
  const title = prop(node, 'title');
  const audioId = prop(node, 'dataAudioId', 'data-audio-id');
  const rawCaptionSrc = prop(node, 'dataCaptionSrc', 'data-caption-src');
  const captionText = prop(node, 'dataCaptionText', 'data-caption-text');
  const autoplay =
    node?.properties?.autoplay !== undefined &&
    node?.properties?.autoplay !== false;

  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [cues, setCues] = React.useState<VttCue[]>([]);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  // Resolved (fetchable) URLs. Relative course paths must be turned into blob
  // URLs via getLocalImage — the same generic file resolver used for images.
  const [src, setSrc] = React.useState<string | undefined>(rawSrc);
  const [captionSrc, setCaptionSrc] = React.useState<string | undefined>(
    rawCaptionSrc,
  );

  const isText = typeof captionText === 'string' && captionText.trim() !== '';

  // Resolve relative course paths to blob URLs (mirrors MarkdownImage).
  React.useEffect(() => {
    const isRelative = (p?: string) =>
      typeof p === 'string' && (p.startsWith('./') || p.startsWith('../'));
    const auPath = auProps?.au?.dirPath;
    if (!auProps?.getLocalImage || !auPath) {
      return;
    }
    if (isRelative(rawSrc)) {
      auProps.getLocalImage(rawSrc as string, auPath).then((blob) => {
        if (blob) setSrc(blob);
      });
    }
    if (!isText && isRelative(rawCaptionSrc)) {
      auProps.getLocalImage(rawCaptionSrc as string, auPath).then((blob) => {
        if (blob) setCaptionSrc(blob);
      });
    }
  }, [rawSrc, rawCaptionSrc, isText, auProps]);

  // Fetch + parse VTT (skipped in text mode).
  React.useEffect(() => {
    let cancelled = false;
    setCues([]);
    if (isText || !captionSrc) {
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
        /* no transcript panel if it cannot be loaded */
      });
    return () => {
      cancelled = true;
    };
  }, [captionSrc, isText]);

  // Highlight the active cue as the audio plays.
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio || cues.length === 0) {
      return;
    }
    const onTimeUpdate = () => {
      const t = audio.currentTime;
      setActiveIndex(cues.findIndex((cue) => t >= cue.start && t < cue.end));
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    return () => audio.removeEventListener('timeupdate', onTimeUpdate);
  }, [cues]);

  const hasTranscript = isText || cues.length > 0;

  return (
    <span style={{ display: 'block' }}>
      <audio
        ref={audioRef}
        src={src}
        title={title}
        controls
        autoPlay={autoplay}
        data-audio-id={audioId}
        style={{ display: 'block', width: '100%' }}
      />
      {hasTranscript && (
        <span style={{ display: 'block', marginTop: 4 }}>
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textDecoration: 'underline',
              font: 'inherit',
            }}
          >
            {expanded ? 'Hide transcript' : 'Show transcript'}
          </button>
          {expanded &&
            (isText ? (
              <span
                style={{ display: 'block', whiteSpace: 'pre-wrap', marginTop: 4 }}
              >
                {captionText}
              </span>
            ) : (
              <ol style={{ listStyle: 'none', padding: 0, marginTop: 4 }}>
                {cues.map((cue, index) => (
                  <li key={`${cue.start}-${index}`}>
                    <button
                      type="button"
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = cue.start;
                        }
                      }}
                      style={{
                        display: 'flex',
                        gap: 8,
                        background:
                          index === activeIndex
                            ? 'rgba(60, 132, 244, 0.15)'
                            : 'none',
                        border: 'none',
                        padding: '2px 4px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        font: 'inherit',
                        width: '100%',
                      }}
                    >
                      <span style={{ opacity: 0.6, minWidth: 40 }}>
                        {formatTime(cue.start)}
                      </span>
                      <span>{cue.text}</span>
                    </button>
                  </li>
                ))}
              </ol>
            ))}
        </span>
      )}
    </span>
  );
}
