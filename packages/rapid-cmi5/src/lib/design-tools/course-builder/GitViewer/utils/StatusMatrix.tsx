import { StatusRow } from 'isomorphic-git';

export type StatusMatrix = StatusRow[];

export const stagedStatuses = [
  'staged',
  'added',
  'deleted_staged',
  'deleted_staged_with_changes',
  'deleted_staged_with_rename',
];

export const isDeletedStatus = (status: FileStatus) =>
  [
    'deleted_unstaged',
    'deleted_staged',
    'deleted_staged_with_changes',
    'deleted_staged_with_rename',
  ].includes(status);

export type FileStatus =
  | 'untracked'
  | 'modified'
  | 'added'
  | 'added_with_changes'
  | 'unmodified'
  | 'staged'
  | 'staged_with_changes'
  | 'deleted_unstaged'
  | 'deleted_staged'
  | 'deleted_staged_with_changes'
  | 'deleted_staged_with_rename'
  | 'added_then_deleted'
  | 'unknown';

const FILE = 0;
const HEAD = 1;
const WORKDIR = 2;
const STAGE = 3;

// The HEAD status is either absent (0) or present (1).
const HEAD_ABSENT = 0;
const HEAD_PRESENT = 1;

// The WORKDIR status is either absent (0), identical to HEAD (1), or different from HEAD (2).
const WORKDIR_ABSENT = 0;
const WORKDIR_IDENTICAL = 1;
const WORKDIR_DIFFERENT = 2;

// The STAGE status is either absent (0), identical to HEAD (1), identical to WORKDIR (2), or different from WORKDIR (3).
const STAGE_ABSENT = 0;
const STAGE_IDENTICAL_TO_HEAD = 1;
const STAGE_IDENTICAL_TO_WORKDIR = 2;
const STAGE_DIFFERENT_TO_WORKDIR = 3;

export function getModifiedFilenames(matrix: StatusMatrix) {
  return matrix
    .filter((row) => row[HEAD] !== row[WORKDIR])
    .map((row) => row[FILE]);
}

export function getUnstagedFilenames(matrix: StatusMatrix) {
  return matrix
    .filter((row) => row[WORKDIR] !== row[STAGE])
    .map((row) => row[FILE]);
}

export function getStagedFilenames(matrix: StatusMatrix) {
  return matrix
    .filter((row) => row[STAGE] >= STAGE_IDENTICAL_TO_WORKDIR)
    .map((row) => row[FILE]);
}

export function getRemovableFilenames(matrix: StatusMatrix) {
  return matrix
    .filter(
      (row) => row[WORKDIR] === HEAD_ABSENT && row[STAGE] !== STAGE_ABSENT,
    )
    .map((row) => row[FILE]);
}

export function getRemovedFilenames(matrix: StatusMatrix) {
  return matrix
    .filter(
      (row) => row[WORKDIR] === HEAD_PRESENT && row[STAGE] === STAGE_ABSENT,
    )
    .map((row) => row[FILE]);
}

export const getFileStatus = (
  HEAD: number,
  WORKDIR: number,
  STAGE: number,
): FileStatus => {
  if (HEAD === 0 && WORKDIR === 2 && STAGE === 0) return 'untracked'; // New, untracked
  if (HEAD === 0 && WORKDIR === 2 && STAGE === 2) return 'added'; // Added, staged
  if (HEAD === 0 && WORKDIR === 2 && STAGE === 3) return 'added_with_changes'; // Added, staged, with unstaged changes
  if (HEAD === 1 && WORKDIR === 1 && STAGE === 1) return 'unmodified'; // Unmodified
  if (HEAD === 1 && WORKDIR === 2 && STAGE === 1) return 'modified'; // Modified, unstaged
  if (HEAD === 1 && WORKDIR === 2 && STAGE === 2) return 'staged'; // Modified, staged
  if (HEAD === 1 && WORKDIR === 2 && STAGE === 3) return 'staged_with_changes'; // Modified, staged, with unstaged changes
  if (HEAD === 1 && WORKDIR === 0 && STAGE === 1) return 'deleted_unstaged'; // Deleted, unstaged
  if (HEAD === 1 && WORKDIR === 0 && STAGE === 0) return 'deleted_staged'; // Deleted, staged
  if (HEAD === 0 && WORKDIR === 0 && STAGE === 3) return 'added_then_deleted';
  if (HEAD === 1 && WORKDIR === 2 && STAGE === 0)
    return 'deleted_staged_with_changes'; // Deleted, staged, with unstaged-modified changes (new file of the same name)
  if (HEAD === 1 && WORKDIR === 1 && STAGE === 0)
    return 'deleted_staged_with_rename'; // Deleted, staged, with unstaged rename

  return 'unknown'; // Default fallback
};

type GitStatus =
  | 'ignored'
  | 'unmodified'
  | '*modified'
  | '*deleted'
  | '*added'
  | 'absent'
  | 'modified'
  | 'deleted'
  | 'added'
  | '*unmodified'
  | '*absent'
  | '*undeleted'
  | '*undeletemodified';

export function mapGitStatus(status: GitStatus): FileStatus {
  switch (status) {
    case 'ignored':
      return 'unknown'; // or return 'ignored' if you support it
    case 'unmodified':
      return 'unmodified';
    case '*added':
      return 'untracked'; // untracked, not staged
    case 'added':
      return 'added'; // staged new file
    case '*modified':
      return 'modified'; // unstaged mods
    case 'modified':
      return 'staged'; // staged mods
    case '*deleted':
      return 'deleted_unstaged'; // removed in WD, not staged
    case 'deleted':
      return 'deleted_staged'; // removed, staged
    case '*unmodified':
      return 'unmodified'; // index differs, WD==HEAD
    case '*undeleted':
      return 'deleted_staged_with_rename'; // index deleted, WD still has file
    case '*undeletemodified':
      return 'deleted_staged_with_changes'; // index deleted, WD has modified file
    case '*absent':
      return 'unknown'; // present only in index (index differs)
    case 'absent':
      return 'unknown'; // nowhere (HEAD/WD/index)
    default:
      return 'unknown';
  }
}
