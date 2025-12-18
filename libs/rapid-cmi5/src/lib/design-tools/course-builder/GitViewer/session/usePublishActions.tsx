// hooks/usePublishActions.ts
import { useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';
import { saveAs } from 'file-saver';
import { useSelector } from 'react-redux';
import { authToken } from '@rapid-cmi5/ui/keycloak';
import { config } from '@rapid-cmi5/frontend/environment';
import { debugLog } from '@rapid-cmi5/ui/branded';
import { DownloadCmi5Type } from '../../CourseBuilderApiTypes';
import {
  RepoAccessObject,
  RepoState,
} from '../../../../redux/repoManagerReducer';
import { RootState } from '../../../../redux/store';
import { getRepoAccess } from './GitContext';
import { getRepoPath, GitFS } from '../utils/fileSystem';
import { join } from 'path-browserify';
import { buildCmi5ZipParams } from '../../../rapidcmi5_mdx/main';

export const usePublishActions = (
  fsInstance: GitFS,
  repoAccessObject: RepoAccessObject | null,
  token?: string,
  buildCmi5Zip?: (params: buildCmi5ZipParams) => Promise<AxiosResponse<object>>,
) => {
  const { currentBranch, fileState }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );
  const currentCourse = fileState.selectedCourse;

  const handleDownloadCmi5Zip = async (req: DownloadCmi5Type) => {
    if (!buildCmi5Zip) {
      debugLog('Build cmi5 zip function was not passed into the hook');
      return;
    }

    const r = getRepoAccess(repoAccessObject);
    if (!currentBranch || !currentCourse) return null;
    debugLog('Downloading cmi5 zip', currentCourse.basePath);

    try {
      let res = null;
      const repoPath = getRepoPath(r);
      if (fsInstance.isElectron) {
        await window.ipc.cmi5Build(
          join(r.fileSystemType, r.repoName),
          currentCourse.basePath,
          req.zipName,
        );
      } else {
        const zip = await fsInstance.generateCourseZip(
          r,
          currentCourse.basePath,
        );

        const zipFiles = Object.keys(zip.files);

        if (zipFiles.length === 0) {
          console.error('Generated ZIP is empty');
          return;
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        res = await buildCmi5Zip({
          zipBlob: zipBlob as File,
          zipName: req.zipName,
          createAuMappings: req.createAuMappings,
        });

        // res = await buildCmi5Zip(
        //   zipBlob as File,
        //   req.zipName,
        //   req.createAuMappings,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //     },
        //     responseType: 'blob',
        //   },
        // );
      }

      if (res?.data) {
        saveAs(res.data as Blob, req.zipName);
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
