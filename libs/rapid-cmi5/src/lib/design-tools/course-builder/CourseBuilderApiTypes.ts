export type CreateLessonType = {
  courseName: string;
  coursePath: string;
  auName: string;
  blockName: string;
};

export type CreateCloneType = {
  repoDirName: string;
  repoRemoteUrl: string;
  repoBranch: string;
  repoUsername: string;
  repoPassword: string;
  authorName: string;
  authorEmail: string;
  shallowClone: false;
};

export type CreateLocalRepoType = {
  repoDirName: string;
  repoRemoteUrl: string;
  repoBranch: string;
  authorName: string;
  authorEmail: string;
};

export type ImportRepoZipType = {
  repoDirName: string;
  authorName: string;
  authorEmail: string;
  zipFile?: File;
};

/**
 * UI type only
 * for saving changes
 */
export type SuperSaveFormType = {
  commit: CreateCommitType;
  push: PushType;
  shouldAutoCommit: boolean;
  shouldAutoPush: boolean;
};

export type CreateCommitType = {
  branch?: string;
  authorName: string;
  authorEmail: string;
  commitMessage: string;
};

export type PullType = {
  branch?: string;
  repoUsername: string;
  repoPassword: string;
  allowConflicts: boolean;
};

export type DownloadCmi5Type = {
  createAuMappings: boolean;
  zipName: string;
};

export type GitConfigType = {
  authorName: string;
  authorEmail: string;
  remoteRepoUrl: string;
};

export type PushType = {
  branch?: string;
  repoUsername: string;
  repoPassword: string;
};

export type CreateCourseType = {
  courseName: string;
  courseDescription: string;
  courseId: string;
  firstAuName: string;
  zipFile?: File;
};
