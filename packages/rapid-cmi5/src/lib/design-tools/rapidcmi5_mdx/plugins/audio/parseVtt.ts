/**
 * A single parsed WebVTT cue.
 */
export interface VttCue {
  /** Start time in seconds. */
  start: number;
  /** End time in seconds. */
  end: number;
  /** Cue text with line breaks preserved as `\n`. */
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
 * Parses the text of a WebVTT file into an ordered list of cues. Cue settings
 * (positioning, region, etc.) and cue identifiers are ignored — only the
 * timing and text are retained, which is all a transcript panel needs.
 *
 * @param vtt - Raw WebVTT file contents.
 * @returns The cues in document order. Malformed cues are skipped.
 */
export function parseVtt(vtt: string): VttCue[] {
  const cues: VttCue[] = [];
  // Normalize line endings and split into blocks separated by blank lines.
  const blocks = vtt.replace(/\r\n?/g, '\n').split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split('\n').filter((line) => line.trim() !== '');
    if (lines.length === 0) {
      continue;
    }

    // Find the line that contains the `-->` timing arrow. An optional cue
    // identifier may precede it.
    const arrowIndex = lines.findIndex((line) => line.includes('-->'));
    if (arrowIndex === -1) {
      continue;
    }

    const [startRaw, endRaw] = lines[arrowIndex].split('-->');
    if (!startRaw || !endRaw) {
      continue;
    }

    const start = timestampToSeconds(startRaw);
    // The end timestamp may be followed by cue settings; take the first token.
    const end = timestampToSeconds(endRaw.trim().split(/\s+/)[0]);
    if (Number.isNaN(start) || Number.isNaN(end)) {
      continue;
    }

    const text = lines
      .slice(arrowIndex + 1)
      // Strip simple inline tags (e.g. <c>, <v Speaker>) for plain display.
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
