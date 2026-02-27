// hooks/usePublishActions.ts
import { useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';
import { saveAs } from 'file-saver';
import { useSelector } from 'react-redux';
import { config } from '@rapid-cmi5/ui';
import { debugLog } from '@rapid-cmi5/ui';
import { DownloadCmi5Type } from '../../CourseBuilderApiTypes';
import {
  RepoAccessObject,
  RepoState,
} from '../../../../redux/repoManagerReducer';
import { RootState } from '../../../../redux/store';
import { getRepoAccess } from './GitContext';
import { getRepoPath, GitFS } from '../utils/fileSystem';
import { join } from 'path-browserify';
import {
  CourseAU,
  generateBlockId,
  generateCourseJson,
} from '@rapid-cmi5/cmi5-build-common';

export const usePublishActions = (
  fsInstance: GitFS,
  repoAccessObject: RepoAccessObject | null,
  token?: string,
  downloadCmi5Zip?: () => Promise<any>,
  processAu?: (au: CourseAU, blockId: string) => Promise<void>,
) => {
  const { currentBranch, fileState }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );
  const currentCourse = fileState.selectedCourse;

  const handleDownloadCmi5Zip = async (req: DownloadCmi5Type) => {
    const r = getRepoAccess(repoAccessObject);
    if (!currentBranch || !currentCourse) return null;

    try {
      let res = null;
      const repoPath = getRepoPath(r);

      const folderStructure = await fsInstance.getFolderStructure(
        join(repoPath, currentCourse.basePath),
        currentCourse.basePath,
        true,
      );

      if (!folderStructure) throw new Error('Course folder was empty');

      const courseData = generateCourseJson(folderStructure);

      if (fsInstance.isElectron) {
        await window.ipc.cmi5Build(
          join(r.fileSystemType, r.repoName),
          currentCourse.basePath,
          req.zipName,
          req.createAuMappings,
        );
      } else {
        if (!downloadCmi5Zip) throw Error('Download cmi5 zip is not defined');
        await fsInstance.downloadCmi5PlayerIfNeeded(downloadCmi5Zip);

        await fsInstance.buildCmi5Course(
          r,
          currentCourse.basePath,
          req.zipName,
        );
      }

      if (processAu) {
        if (!courseData) {
          throw new Error('Course data was null');
        }
        for (const block of courseData.blocks) {
          const blockId = generateBlockId({
            courseId: courseData.courseId,
            blockName: block.blockName,
          });

          for (const au of block.aus) {
            await processAu(au, blockId);
          }
        }
      }
    } catch (err: any) {
      debugLog('Failed downloading cmi5 zip', currentCourse.basePath);
      throw Error(err);
    }

    return;
  };

  const resolvePCTEProjects = useCallback(async (): Promise<any[]> => {
    try {
      const response = await axios.get(
        `${config.DEVOPS_API_URL}/v1/cmi5/courses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data ?? [];
    } catch (e) {
      console.error('Could not retrieve available projects from PCTE', e);
      return [];
    }
  }, [token]);

  const generatePCTEZip = useCallback(async (repo: string) => {
    const r = getRepoAccess(repoAccessObject);

    if (!repo) {
      console.error('No repo selected');
      return null;
    }

    const zip = await fsInstance.generateRepoZip(r);
    if (Object.keys(zip.files).length === 0) {
      console.error('Generated ZIP is empty');
      return null;
    }

    return zip;
  }, []);

  const publishToPCTE = useCallback(
    async (repoSrc: string, repoDest: string) => {
      const zip = await generatePCTEZip(repoSrc);
      if (!zip) return;

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      if (zipBlob.size === 0) {
        console.error('Generated ZIP blob is empty');
        return;
      }

      const formData = new FormData();
      formData.append(
        'file',
        new File([zipBlob], `${repoSrc}.zip`, { type: 'application/zip' }),
      );
      formData.append('project', repoDest);

      try {
        await axios.post(`${config.DEVOPS_API_URL}/v1/cmi5/courses`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Upload failed:', error);
      }
    },
    [generatePCTEZip, token],
  );

  return {
    resolvePCTEProjects,
    publishToPCTE,
    handleDownloadCmi5Zip,
  };
};
