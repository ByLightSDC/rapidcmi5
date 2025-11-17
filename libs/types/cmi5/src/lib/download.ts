import { BaseActivity } from './activity';

export type DownloadFilesContent = BaseActivity & {
  files: DownloadFileData[];
};

export type DownloadFileData = {
  name: string;
  path: string;
  type: string;
};
