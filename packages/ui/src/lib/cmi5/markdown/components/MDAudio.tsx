import React from 'react';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
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
 * The result of interpreting a caption file, regardless of extension: timed VTT
 * cues, or a block of plain text.
 */
type ParsedTranscript =
  | { kind: 'vtt'; cues: VttCue[] }
  | { kind: 'text'; text: string };

/**
 * Interprets raw caption file contents as either timed VTT or plain text. The
 * rule is content-based, not extension-based: attempt a VTT parse and, if it
 * yields at least one cue, treat the file as timed VTT; otherwise fall back to
 * plain text so a `.txt`, mislabeled, or cue-less file is never dropped.
 */
function parseTranscript(raw: string): ParsedTranscript {
  const cues = parseVtt(raw);
  if (cues.length > 0) {
    return { kind: 'vtt', cues };
  }
  // Strip a leading `WEBVTT` header line so header-only files don't leak it.
  const text = raw.replace(/^﻿?WEBVTT[^\n]*\n?/, '').trim();
  return { kind: 'text', text };
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
  // Back-compat: legacy inline transcript text (content authored before the
  // file-only model). Rendered read-only when no caption file is present.
  const legacyText = prop(node, 'dataCaptionText', 'data-caption-text') ?? '';
  const autoplay =
    node?.properties?.autoplay !== undefined &&
    node?.properties?.autoplay !== false;

  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [cues, setCues] = React.useState<VttCue[]>([]);
  const [text, setText] = React.useState<string>(legacyText);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const [expanded, setExpanded] = React.useState<boolean>(false);
  // Resolved (fetchable) URLs. Relative course paths must be turned into blob
  // URLs via getLocalImage — the same generic file resolver used for images.
  const [src, setSrc] = React.useState<string | undefined>(rawSrc);
  const [captionSrc, setCaptionSrc] = React.useState<string | undefined>(
    rawCaptionSrc,
  );

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
    if (isRelative(rawCaptionSrc)) {
      auProps.getLocalImage(rawCaptionSrc as string, auPath).then((blob) => {
        if (blob) setCaptionSrc(blob);
      });
    }
  }, [rawSrc, rawCaptionSrc, auProps]);

  // Fetch the caption file and interpret it as timed VTT or plain text. Falls
  // back to any legacy inline text if there is no file or it cannot be loaded.
  React.useEffect(() => {
    let cancelled = false;
    setCues([]);
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
        /* keep the legacy-text fallback if the file cannot be loaded */
      });
    return () => {
      cancelled = true;
    };
  }, [captionSrc, legacyText]);

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

  const hasCues = cues.length > 0;
  const hasText = text.trim() !== '';
  const hasTranscript = hasCues || hasText;
  // Stable id linking the toggle button to the transcript panel it controls, so
  // assistive tech can associate the two (WCAG 1.2.1 / 1.2.3: the transcript is
  // the text alternative for this audio-only content and must be discoverable).
  const panelId = React.useId();

  return (
    <span style={{ display: 'block' }}>
      <audio
        ref={audioRef}
        src={src}
        title={title}
        aria-label={title || 'Audio'}
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
            aria-controls={panelId}
            onClick={() => setExpanded((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textDecoration: 'underline',
              font: 'inherit',
            }}
          >
            {/* Decorative CC glyph — hidden from assistive tech so the button's
                accessible name stays "Show/Hide transcript" and NVDA announces
                it as a button, not "CC Show transcript". */}
            <ClosedCaptionIcon aria-hidden="true" style={{ fontSize: '1.1em' }} />
            {expanded ? 'Hide transcript' : 'Show transcript'}
          </button>
          {expanded && (
            <span
              id={panelId}
              role="region"
              aria-label="Transcript"
              style={{ display: 'block' }}
            >
              {hasCues ? (
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
              ) : (
                <span
                  style={{
                    display: 'block',
                    whiteSpace: 'pre-wrap',
                    marginTop: 4,
                  }}
                >
                  {text}
                </span>
              )}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
