import { setModal } from '@rapid-cmi5/ui/branded';
import {
  attachRemoteRepoModalId,
  cloneRepoModalId,
  commitChangesModalId,
  createLocalRepoModalId,
  createNewLessonModalId,
  deleteAllSlidesModalId,
  deleteCourseModalId,
  deleteLessonModalId,
  deleteRepoModalId,
  gitPullModalId,
  gitPushModalId,
  importRepoZipModalId,
  publishPcteModalId,
  remindFileSystem,
  revertCommitModalId,
  saveCourseFileBeforeModalId,
  saveCourseFileModalId,
  setGitConfigModalId,
} from './constants';
import { useDispatch, useSelector } from 'react-redux';
import {
  MessageType,
  ViewModeEnum,
} from '../../course-builder/CourseBuilderTypes';

import { isDisplayDirty } from '../../../redux/courseBuilderReducer';
import { useContext } from 'react';
import { RC5Context } from '../contexts/RC5Context';

export const useRC5Prompts = () => {
  const dispatch = useDispatch();
  const hasFilesToSave = useSelector(isDisplayDirty);
  const { sendMessage } = useContext(RC5Context);

  const promptAttachRemoteRepo = (e: any, meta?: any) => {
    dispatch(
      setModal({
        type: attachRemoteRepoModalId,
        id: null,
        name: null,
        meta: {
          ...meta,
          title: 'Attach Remote Repo',
        },
      }),
    );
  };

  const promptDeleteAllSlides = () => {
    dispatch(
      setModal({
        type: deleteAllSlidesModalId,
        id: null,
        name: null,
        meta: {
          title: 'Delete All',
          message: 'Are you sure you want to delete all slides?',
        },
      }),
    );
  };

  /**
   * Save Course File
   */
  const promptSaveCourseFile = (
    title?: string,
    message?: string,
    meta?: any,
    modalId?: string,
  ) => {
    dispatch(
      setModal({
        type: modalId || saveCourseFileModalId,
        id: null,
        name: null,
        meta: {
          title: title || 'Save Course?',
          message: '',
          ...meta,
        },
      }),
    );
  };

  /**
   * Change Course
   */
  const promptChangeCourse = (coursePath: string) => {
    if (hasFilesToSave) {
      promptSaveCourseFile(
        'Save Changes First?',
        remindFileSystem,
        {
          notify: MessageType.changeCourse,
          coursePath: coursePath,
        },
        saveCourseFileBeforeModalId,
      );
    } else {
      sendMessage({
        type: MessageType.changeCourse,
        meta: { coursePath },
      });
    }
  };

  const promptCloneRepo = () => {
    dispatch(
      setModal({
        type: cloneRepoModalId,
        id: null,
        name: null,
        meta: {
          title: 'Clone Repo',
        },
      }),
    );
  };

  const promptCreateLocalRepo = () => {
    dispatch(
      setModal({
        type: createLocalRepoModalId,
        id: null,
        name: null,
        meta: {
          title: 'Create Local Repo',
        },
      }),
    );
  };

  const promptImportRepoZip = () => {
    dispatch(
      setModal({
        type: importRepoZipModalId,
        id: null,
        name: null,
        meta: {
          title: 'Import Repo Zip',
        },
      }),
    );
  };

  const promptCommit = () => {
    dispatch(
      setModal({
        type: commitChangesModalId,
        id: null,
        name: null,
        meta: {
          title: 'Commit Staged Changes',
        },
      }),
    );
  };

  const promptRevertToCommit = (repoName: string, commitHash: string) => {
    dispatch(
      setModal({
        type: revertCommitModalId,
        id: null,
        name: repoName,
        meta: {
          commitHash,
          title: `Reverting to commit ${commitHash} on repository ${repoName}`,
          confirmNameOnRevert: 'confirm',
          message: `Are you sure you want to revert to the commit ${commitHash}`,
          permanentWarning:
            'This will only effect your local files. It will erase any work and all commits which occured after the commit you are resetting to. The remote repository will remain intact.',
        },
      }),
    );
  };

  const promptCreateCourse = () => {
    if (hasFilesToSave) {
      promptSaveCourseFile(
        'Save Changes First?',
        remindFileSystem,
        {
          notify: MessageType.createCourse,
        },
        saveCourseFileBeforeModalId,
      );
    } else {
      sendMessage({
        type: MessageType.createCourse,
      });
    }
  };

  const promptCreateLesson = (
    courseTitle: string,
    coursePath: string,
    blockName: string,
  ) => {
    dispatch(
      setModal({
        type: createNewLessonModalId,
        id: null,
        name: null,
        meta: {
          courseName: courseTitle,
          blockName: blockName,
          coursePath: coursePath,
        },
      }),
    );
  };

  const promptDeleteCourse = (courseName: string, coursePath: string) => {
    dispatch(
      setModal({
        type: deleteCourseModalId,
        id: null,
        name: courseName,
        meta: {
          title: 'Delete Course',
          message: 'Are you sure you want to delete the course named ',
          coursePath: coursePath,
        },
      }),
    );
  };

  const promptDeleteLesson = (lessonName: string, lessonIndex: number) => {
    dispatch(
      setModal({
        type: deleteLessonModalId,
        id: null,
        name: lessonName,
        meta: {
          title: 'Delete Lesson',
          message: 'Are you sure you want to delete the lesson named ',
          lessonIndex: lessonIndex,
        },
      }),
    );
  };

  const promptDeleteRepo = (repoName: string) => {
    dispatch(
      setModal({
        type: deleteRepoModalId,
        id: null,
        name: repoName,
        meta: {
          title: 'Delete Local Repository',
          confirmNameOnDelete: true,
          message:
            'Are you sure you want to delete the local git repository named ',
          permanentWarning:
            'This will only effect your local files. The remote repository will remain intact. Be sure to commit any pending changes!',
        },
      }),
    );
  };

  const promptDownloadCourseCMI5Zip = () => {
    if (hasFilesToSave) {
      promptSaveCourseFile(
        'Save Changes First?',
        remindFileSystem,
        {
          notify: MessageType.downloadCourseZip,
        },
        saveCourseFileBeforeModalId,
      );
    } else {
      sendMessage({
        type: MessageType.downloadCourseZip,
      });
    }
  };

  const promptGitConfig = () => {
    dispatch(
      setModal({
        type: setGitConfigModalId,
        id: null,
        name: null,
        meta: {
          title: 'Set Git Config',
        },
      }),
    );
  };

  const promptNavAway = (destination: ViewModeEnum) => {
    if (hasFilesToSave) {
      promptSaveCourseFile('Save Changes First?', remindFileSystem, {
        notify: MessageType.navigate,
        meta: { destination },
      });
    } else {
      sendMessage({
        type: MessageType.navigate,
        meta: { meta: { destination }, message: saveCourseFileBeforeModalId },
      });
    }
  };

  const promptPull = () => {
    dispatch(
      setModal({
        type: gitPullModalId,
        id: null,
        name: null,
        meta: {
          title: 'Pull From Remote Git Repo',
        },
      }),
    );
  };

  const promptPublishPcteModal = () => {
    dispatch(
      setModal({
        type: publishPcteModalId,
        id: null,
        name: null,
      }),
    );
  };

  const promptPush = () => {
    dispatch(
      setModal({
        type: gitPushModalId,
        id: null,
        name: null,
        meta: {
          title: 'Push to Remote Git Repo',
        },
      }),
    );
  };

  return {
    promptAttachRemoteRepo,
    promptChangeCourse,
    promptCloneRepo,
    promptCreateLocalRepo,
    promptImportRepoZip,
    promptCommit,
    promptRevertToCommit,
    promptDeleteAllSlides,
    promptGitConfig,
    promptPull,
    promptPush,
    promptCreateCourse,
    promptCreateLesson,
    promptDeleteCourse,
    promptDeleteLesson,
    promptDeleteRepo,
    promptDownloadCourseCMI5Zip,
    promptNavAway,
    promptPublishPcteModal,
    promptSaveCourseFile,
  };
};
