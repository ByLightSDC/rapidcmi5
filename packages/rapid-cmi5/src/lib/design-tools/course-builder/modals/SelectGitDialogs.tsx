import { useDispatch, useSelector } from 'react-redux';
import { modal, setModal } from '@rapid-cmi5/ui';

/* Branded */
import {
  defaultCloneRepoData,
  defaultCommitData,
  defaultCreateCourseData,
  defaultCreateLessonData,
  defaultGitConfigData,
  defaultImportRepoZipData,
  ModalDialog,
  ViewExpander,
} from '@rapid-cmi5/ui';
import { useContext, useEffect, useState } from 'react';
import { GitContext } from '../GitViewer/session/GitContext';
import DirectoryTreeView from '../GitViewer/Components/SelectedRepo/DirectoryTree';
import RepositorySelector from '../selectors/RepositorySelector';
import CourseSelector from '../selectors/CourseSelector';
import { Box, Stack } from '@mui/system';

import {
  attachRemoteRepoModalId,
  cloneRepoModalId,
  commitChangesModalId,
  createCourseModalId,
  createLocalRepoModalId,
  createNewLessonModalId,
  downloadCmi5ZipModalId,
  gitPullModalId,
  gitPushModalId,
  importRepoZipModalId,
  revertCommitModalId,
  selectRepoModalId,
  setGitConfigModalId,
} from '../../rapidcmi5_mdx/modals/constants';
import CloneRepoForm from './CloneRepoForm';
import { CreateCourseForm } from './CreateCourseForm';
import { CreateLessonForm } from './CreateLessonForm';
import { RepoState } from '../../../redux/repoManagerReducer';
import CommitForm from './CommitForm';
import { RootState } from '../../../redux/store';
import PullForm from './PullForm';
import PushForm from './PushForm';
import GitConfigForm from './GitConfigForm';
import DownloadCmi5ZipForm from './DownloadCmi5ZipForm';
import AttachRemoteRepoForm from './AttachRemoteRepoForm';
import { useCourseData } from '../../rapidcmi5_mdx/data-hooks/useCourseData';
import ImportRepoZipForm from './ImportRepoZipForm';
import { TextField, Alert } from '@mui/material';
import { RC5Context } from '../../rapidcmi5_mdx/contexts/RC5Context';
import CreateLocalRepoForm from './CreateLocalRepoForm';

/**
 * Select Repo, Course, AU
 * @returns
 */
export function SelectGitDialogs() {
  const dispatch = useDispatch();
  const modalObj = useSelector(modal);
  // need to fix
  // TODO

  const currentAuth = { parsedUserToken: { email: 'test', name: 'test' } };
  const { currentBranch }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );

  const { handleCreateLesson } = useCourseData();
  const {
    currentCourse,
    availableCourses,
    handleLoadCourse,
    currentRepo,
    availableRepos,
    handleChangeRepo,
    currentGitConfig,
    directoryTree,
    handleGitCommitReset,
    isElectron,
  } = useContext(GitContext);
  const { sendMessage } = useContext(RC5Context);

  const getInstructions = () => {
    if (!availableRepos) {
      return 'Click + to Clone a remote repository';
    }
    if (!currentRepo) {
      return 'Select a repository to start managing courses.';
    }
    if (!availableCourses) {
      return 'Click + to Create a new course.';
    }
    if (!currentCourse) {
      return 'Select a course to start editing lesson AUs.';
    }

    return 'Manage repositories and courses.';

    //message={`Select a repository, then a course.\n If you don't have a repository, click + to Clone. `}
  };

  // Confirmation is used for things such as reverting to a commit hash
  const [confirmationName, setConfirmationName] = useState('');
  const isNameMatch =
    confirmationName.toLowerCase() ===
    modalObj?.meta?.confirmNameOnRevert?.toLowerCase();
  const forceDisableSubmit =
    modalObj?.meta?.confirmNameOnRevert !== '' ? !isNameMatch : false;
  const nameConfirmedError = isNameMatch
    ? ''
    : 'You must enter name to match item ...';

  const promptCreateCourse = () => {
    dispatch(
      setModal({
        type: createCourseModalId,
        id: null,
        name: null,
        meta: {
          title: 'Create Course',
        },
      }),
    );
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

  const promptSelectRepo = () => {
    dispatch(
      setModal({
        type: selectRepoModalId,
        id: null,
        name: null,
      }),
    );
  };

  const handleModalResponse = (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => {
    if (modalObj.meta.notify) {
      sendMessage({
        type: modalObj.meta.notify,
        meta: modalObj.meta,
      });

      return;
    }

    switch (modalId) {
      case cloneRepoModalId:
        //after clone we end up here
        promptSelectRepo();
        return;
      case createCourseModalId:
        break;
      case createNewLessonModalId:
        //automatically save files
        break;
    }
    dispatch(setModal({ type: '', id: null, name: null }));
  };

  /**
   * Close modal
   */
  const handleCloseModal = () => {
    if (modalObj.meta?.notify) {
      sendMessage({
        type: modalObj.meta.notify,
        meta: modalObj.meta,
      });
      return;
    }
    dispatch(setModal({ type: '', id: null, name: null }));
  };

  useEffect(() => {
    //REF
  }, [modalObj.type]);

  return (
    <div data-testid="git-modals">
      {modalObj.type === selectRepoModalId && (
        <ModalDialog
          testId={selectRepoModalId}
          buttons={['Done']}
          dialogProps={{
            fullWidth: true,
            open: modalObj.type === selectRepoModalId,
          }}
          maxWidth="sm"
          title="Course Settings"
          // REF Wait until done ? handleAction={handlSelectCourse}
          message={getInstructions()}
          handleAction={handleCloseModal}
        >
          <Stack
            direction="column"
            spacing={3}
            sx={{
              //backgroundColor: 'pink',
              marginTop: '8px',
              padding: '12px',
              minHeight: '180px',
              width: '100%',
              height: '100%',
            }}
          >
            <RepositorySelector
              currentRepo={currentRepo || undefined}
              availableRepos={availableRepos}
              disabled={!availableRepos || availableRepos?.length === 0}
              onAction={promptCloneRepo}
              onSelect={handleChangeRepo}
            />
            {/* <Divider /> */}
            <CourseSelector
              currentCoursePath={currentCourse?.basePath || undefined}
              currentRepo={currentRepo || undefined}
              availableCourses={availableCourses}
              disabled={!availableCourses || availableCourses?.length === 0}
              onAction={() => {
                //saveCurrentLesson();
                promptCreateCourse();
              }}
              onSelect={(coursePath: string) => {
                console.log('onSelect', coursePath);
                //saveCurrentLesson();
                handleLoadCourse(coursePath);
              }}
            />
            {currentRepo && (
              <ViewExpander
                shouldStartWithDivider={false}
                shouldEndWithDivider={false}
                defaultIsExpanded={false}
                titleVariant="body1"
                title={`Browse Files`}
              >
                {/* this extra div is to correct margin that parent stack imparts,
                AND scrolling */}
                <div
                  className="scrollingDiv"
                  style={{ margin: 0, height: '100%' }}
                >
                  <DirectoryTreeView
                    currentRepo={currentRepo}
                    directoryTree={directoryTree}
                    isReadOnly={true}
                  />
                </div>
              </ViewExpander>
            )}
          </Stack>
        </ModalDialog>
      )}
      {/* prompt clone */}
      {modalObj.type === cloneRepoModalId && (
        <CloneRepoForm
          defaultData={{
            ...defaultCloneRepoData,
            authorEmail:
              currentAuth?.parsedUserToken?.email?.toLowerCase() || '',
            authorName: currentAuth?.parsedUserToken?.name || '',
            shallowClone: false,
          }}
          modalObj={modalObj}
          handleCloseModal={handleCloseModal}
          handleModalAction={handleModalResponse}
        />
      )}
      {modalObj.type === createLocalRepoModalId && (
        <CreateLocalRepoForm
          defaultData={{
            ...defaultCloneRepoData,
            repoRemoteUrl: '',
            authorEmail: currentAuth?.parsedUserToken?.email?.toLowerCase(),
            authorName: currentAuth?.parsedUserToken?.name,
            shallowClone: false,
          }}
          modalObj={modalObj}
          handleCloseModal={handleCloseModal}
          handleModalAction={handleModalResponse}
        />
      )}
      {modalObj.type === importRepoZipModalId && (
        <ImportRepoZipForm
          defaultData={{
            ...defaultImportRepoZipData,
            authorEmail: currentAuth?.parsedUserToken?.email?.toLowerCase(),
            authorName: currentAuth?.parsedUserToken?.name,
          }}
          modalObj={modalObj}
          handleCloseModal={handleCloseModal}
          handleModalAction={handleModalResponse}
        />
      )}
      {/* prompt attach remote repo */}
      {modalObj.type === attachRemoteRepoModalId && (
        <AttachRemoteRepoForm
          defaultData={{
            ...defaultGitConfigData,
            authorEmail: currentAuth?.parsedUserToken?.email?.toLowerCase(),
            authorName: currentAuth?.parsedUserToken?.name,
          }}
          modalObj={modalObj}
          handleCloseModal={handleCloseModal}
          handleModalAction={handleModalResponse}
        />
      )}
      {/* prompt commit */}
      {modalObj.type === commitChangesModalId && (
        <CommitForm
          defaultData={{
            ...defaultCommitData,
            authorEmail: currentGitConfig?.authorEmail?.toLowerCase(),
            authorName: currentGitConfig?.authorName,
            branch: currentBranch || '',
          }}
          modalObj={modalObj}
          handleCloseModal={handleCloseModal}
          handleModalAction={handleModalResponse}
        />
      )}

      {/* Reset to Git commit hash */}
      <ModalDialog
        testId={revertCommitModalId}
        buttons={['Cancel', 'Confirm']}
        dialogProps={{
          open: modalObj.type === revertCommitModalId,
        }}
        disableSubmit={forceDisableSubmit}
        message={confirmMessage(
          modalObj.meta?.message || '',
          true,
          'by typing "Confirm"',
          modalObj?.meta?.permanentWarning,
        )}
        specialCancelLayout="2%"
        title={modalObj.meta?.title || 'Warning'}
        handleAction={(whichButton) => {
          handleCloseModal();

          if (whichButton === 0) {
            return;
          }
          handleGitCommitReset(modalObj?.meta?.commitHash);
        }}
        maxWidth="sm"
      >
        <Box sx={{ marginLeft: '24px', marginRight: '24px', width: '90%' }}>
          <TextField
            autoComplete="off"
            sx={{
              borderRadius: '4px',
              width: '100%',
              marginBottom: '8px',
            }}
            InputLabelProps={{ shrink: true }} // always put label above box even if empty
            InputProps={{
              sx: {
                backgroundColor: (theme: any) => `${theme.input.fill}`,
              },
              inputProps: {
                'data-testid': 'field-name-confirmation',
              },
            }}
            data-testid={'name-confirmation'}
            id={'name-confirmation'}
            aria-label={'Name Confirmation'}
            name={'name-confirmation'}
            value={confirmationName}
            required
            error={Boolean(nameConfirmedError)}
            helperText={nameConfirmedError}
            margin="dense"
            variant="outlined"
            fullWidth={true}
            size="small"
            spellCheck={false}
            multiline={false}
            placeholder={'Type confirm here...'}
            onChange={(event) => {
              const newEntry = event.target.value;
              setConfirmationName(newEntry);
            }}
            onKeyDown={(event) => {
              if (event.code === 'Enter') {
                // prevent enter from causing submit of form...
                event.preventDefault();
              }
            }}
          />
          <Alert sx={{ width: 'auto' }} severity="warning">
            {modalObj?.meta?.permanentWarning}
          </Alert>
        </Box>
      </ModalDialog>
      {/* prompt pull */}
      {modalObj.type === gitPullModalId && (
        <PullForm
          defaultData={{
            repoUsername: '',
            repoPassword: '',
            branch: currentBranch || '',
            allowConflicts: false,
          }}
          modalObj={modalObj}
          handleCloseModal={handleCloseModal}
          handleModalAction={handleModalResponse}
        />
      )}
      {modalObj.type === downloadCmi5ZipModalId && (
        <DownloadCmi5ZipForm
          isElectron={isElectron}
          defaultData={{
            createAuMappings: true,
            zipName: `${currentCourse?.basePath || 'cmi5 '}.zip`,
          }}
          modalObj={modalObj}
          handleCloseModal={handleCloseModal}
          handleModalAction={handleModalResponse}
        />
      )}
      {/* prompt set config */}
      {modalObj.type === setGitConfigModalId && (
        <GitConfigForm
          defaultData={{
            ...defaultGitConfigData,
            authorEmail: currentGitConfig.authorEmail,
            authorName: currentGitConfig.authorName,
            remoteRepoUrl: currentGitConfig.remoteRepoUrl,
          }}
          modalObj={modalObj}
          handleCloseModal={handleCloseModal}
          handleModalAction={handleModalResponse}
        />
      )}
      {/* prompt push */}
      {modalObj.type === gitPushModalId && (
        <PushForm
          defaultData={{
            repoUsername: '',
            repoPassword: '',
            branch: currentBranch || '',
            force: false,
          }}
          modalObj={modalObj}
          handleCloseModal={handleCloseModal}
          handleModalAction={handleModalResponse}
        />
      )}
      {/* prompt create course */}
      {modalObj.type === createCourseModalId && (
        <CreateCourseForm
          defaultData={defaultCreateCourseData}
          modalObj={modalObj}
          handleCloseModal={handleCloseModal}
          handleModalAction={handleModalResponse}
        />
      )}
      {/* prompt create lesson */}
      {modalObj.type === createNewLessonModalId && (
        <CreateLessonForm
          defaultData={{
            ...defaultCreateLessonData,
            courseName: modalObj.meta.courseName,
            blockName: modalObj.meta.blockName,
            coursePath: modalObj.meta.coursePath,
          }}
          modalObj={modalObj}
          handleCloseModal={handleCloseModal}
          handleModalAction={handleModalResponse}
          onCreateLesson={handleCreateLesson}
        />
      )}
    </div>
  );
}

/**
 * Format message for named delete item
 */
const confirmMessage = (
  promptMessage: string,
  confirmNameOnDelete = false,
  confirmItemLabel = 'Confirm',
  permanentWarning = 'This action is permanent!',
) => {
  return (
    <>
      {promptMessage}
      <div>
        {confirmNameOnDelete
          ? `
    Confirm ${confirmItemLabel} below...`
          : `${permanentWarning}`}
      </div>
    </>
  );
};

export default SelectGitDialogs;
