export type ConflictBlock = {
  // content ranges (inclusive line numbers)
  left_start: number;
  left_end: number;
  right_start: number;
  right_end: number;
};

const START_RE = /^\s*<{7}.*$/; // <<<<<<< HEAD or <<<<<<< branch
const SEP_RE = /^\s*={7}\s*$/; // =======
const END_RE = /^\s*>{7}.*$/; // >>>>>>> branch

export function parseConflictBlocksFromModel(content: string): ConflictBlock[] {
  const blocks: ConflictBlock[] = [];
  if (!content || content.length === 0) return blocks;
  const lines = content.split(/\r?\n/);
  const lineCount = lines.length;

  enum State {
    Idle,
    InLeft,
    InRight,
  }
  let state: State = State.Idle;

  let leftStart = -1,
    leftEnd = -1;
  let baseStart = -1,
    baseEnd = -1;
  let rightStart = -1,
    rightEnd = -1;

  for (let line = 0; line < lineCount; line++) {
    const text = lines[line];

    if (state === State.Idle) {
      if (START_RE.test(text)) {
        leftStart = line + 1;
        state = State.InLeft;
      }
      continue;
    }

    if (state === State.InLeft) {
      if (SEP_RE.test(text)) {
        leftEnd = line;
        rightStart = line + 2;
        state = State.InRight;
        continue;
      }
      continue;
    }

    if (state === State.InRight) {
      if (END_RE.test(text)) {
        rightEnd = line;

        // finalize block
        blocks.push({
          left_start: leftStart,
          left_end: Math.max(leftStart, leftEnd),
          right_start: rightStart,
          right_end: Math.max(rightStart, rightEnd),
        });

        // reset state for next block
        state = State.Idle;
        leftStart = leftEnd = -1;
        baseStart = baseEnd = -1;
        rightStart = rightEnd = -1;
      }
    }
  }

  return blocks;
}
