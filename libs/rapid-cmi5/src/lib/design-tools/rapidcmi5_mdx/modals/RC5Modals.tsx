/* eslint-disable react/jsx-no-useless-fragment */

import { modal, setModal } from '@rangeos-nx/ui/redux';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteCourseModalId,
  deleteLessonModalId,
  deleteRepoModalId,
  saveCourseFileBeforeModalId,
  saveCourseFileModalId,
  warningModalId,
} from './constants';
import {
  ButtonCopyText,
  defaultCommitData,
  ModalDialog,
} from '@rangeos-nx/ui/branded';
import { RC5Context } from '../contexts/RC5Context';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Box, TextField, Typography } from '@mui/material';
import SelectGitDialogs from '../../course-builder/modals/SelectGitDialogs';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';

import { RootState } from '../../../redux/store';
import { RepoState } from '../../../redux/repoManagerReducer';
import SaveCourseForm from '../../course-builder/modals/SaveCourseForm';
import { SuperSaveFormType } from '../../course-builder/CourseBuilderApiTypes';

export default function RC5Modals() {
  const modalObj = useSelector(modal);
  const dispatch = useDispatch();
  const { deleteLesson, sendMessage } = useContext(RC5Context);
  const { currentGitConfig, handleDeleteCourse, handleDeleteCurrentRepo } =
    useContext(GitContext);

  const { currentBranch }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );

  // cache user preferences in save form data
  const [superSaveDataCache, setSuperDataCache] =
    useState<SuperSaveFormType | null>(null);

  // #region delete confirmation
  const [confirmationName, setConfirmationName] = useState('');
  const isNameMatch =
    confirmationName.toLowerCase() === modalObj?.name?.toLowerCase();
  const forceDisableSubmit = modalObj?.meta?.confirmNameOnDelete
    ? !isNameMatch
    : false;
  const nameConfirmedError = isNameMatch
    ? ''
    : 'You must enter name to match item ...';

  /**
   * Format message for named delete item
   */
  const confirmMessage = (
    itemName: string,
    promptMessage: string,
    confirmNameOnDelete = false,
    confirmItemLabel = 'item name',
    permanentWarning = 'This action is permanent!',
  ) => {
    return (
      <>
        {promptMessage}
        {itemName && promptMessage.indexOf('named') >= 0 && (
          <>
            {confirmNameOnDelete ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                }}
              >
                <ButtonCopyText
                  label={
                    <Typography
                      color="textPrimary"
                      variant="body1"
                      sx={{
                        paddingBottom: '2px',
                        paddingRight: '4px',
                        height: 'auto',
                      }}
                    >
                      <strong>{itemName}</strong>
                    </Typography>
                  }
                  name="copy-name"
                  text={itemName}
                  tooltip={'Copy Name'}
                  iconColor="primary"
                />
                ?
              </div>
            ) : (
              <>
                <strong>{itemName}</strong>?
              </>
            )}
          </>
        )}
        <div>
          {confirmNameOnDelete
            ? `
    Confirm ${confirmItemLabel} below...`
            : `${permanentWarning}`}
        </div>
      </>
    );
  };
  // #endregion

  /**
   * Close modal
   */
  const handleCloseModal = () => {
    // clear confirmation name in case of reopen
    setConfirmationName('');
    dispatch(setModal({ type: '', id: null, name: null }));
  };

  const handleDeleteActions = async (
    type: string,
    whichButton: number,
    meta?: any,
  ) => {
    handleCloseModal();

    if (whichButton === 0) {
      return;
    }

    if (whichButton === 1) {
      switch (type) {
        case deleteLessonModalId:
          deleteLesson(meta.lessonIndex);
          break;
        case deleteCourseModalId:
          handleDeleteCourse(meta.coursePath);
          break;
        case deleteRepoModalId:
          await handleDeleteCurrentRepo();
          break;
      }
    }

    //REF dispatch(updateDirtyDisplay({ counter: 0 }));
  };

  const handleModalResponse = (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => {
    if (modalId === saveCourseFileModalId) {
      //store username and password for later
      //console.log('setSuperDataCache', data);
      setSuperDataCache(data);
    }
    console.log('cache meta?', modalObj.meta);
    handleCloseModal();
    if (modalObj.meta.notify) {
      sendMessage({
        type: modalObj.meta.notify,
        meta: modalObj.meta,
      });
      return;
    }
  };

  const defaultSaveData = useMemo(() => {
    const theDefaultData = {
      commit: {
        ...defaultCommitData,
        authorEmail: currentGitConfig?.authorEmail?.toLowerCase(),
        authorName: currentGitConfig?.authorName,
        branch: currentBranch || 'main',
        commitMessage: '',
      },
      push: {
        repoUsername: superSaveDataCache?.push.repoUsername || '',
        repoPassword: superSaveDataCache?.push.repoPassword || '',
        branch: currentBranch || 'main',
      },
      shouldAutoCommit: superSaveDataCache
        ? superSaveDataCache.shouldAutoCommit
        : true,
      shouldAutoPush: superSaveDataCache
        ? superSaveDataCache.shouldAutoPush
        : true,
    };

    return theDefaultData;
  }, [
    currentGitConfig?.authorEmail,
    currentGitConfig?.authorName,
    superSaveDataCache,
    currentBranch,
  ]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {modalObj.type !== '' && (
        <>
          <SelectGitDialogs />
          {/* prompt apply changes to code editor view */}
          {modalObj.type === saveCourseFileModalId && (
            <SaveCourseForm
              defaultData={defaultSaveData}
              modalObj={modalObj}
              handleCloseModal={handleCloseModal}
              handleModalAction={handleModalResponse}
            />
          )}

          {/* prompt apply changes before course settings or something that   */}
          <SaveCourseForm
            defaultData={defaultSaveData}
            modalId={saveCourseFileBeforeModalId}
            modalObj={modalObj}
            handleCloseModal={handleCloseModal}
            handleModalAction={handleModalResponse}
          />
          {/* delete course */}
          <ModalDialog
            testId={deleteCourseModalId}
            buttons={['Cancel', 'Delete']}
            dialogProps={{
              open: modalObj.type === deleteCourseModalId,
            }}
            message={confirmMessage(
              modalObj?.name || '',
              modalObj.meta?.message || '',
            )}
            specialCancelLayout="2%"
            title={modalObj.meta?.title || 'Warning'}
            handleAction={async (whichButton) => {
              await handleDeleteActions(
                deleteCourseModalId,
                whichButton,
                modalObj.meta,
              );
            }}
            maxWidth="xs"
          />
          {/* delete lesson */}
          <ModalDialog
            testId={deleteLessonModalId}
            buttons={['Cancel', 'Delete']}
            dialogProps={{
              open: modalObj.type === deleteLessonModalId,
            }}
            message={confirmMessage(
              modalObj?.name || '',
              modalObj.meta?.message || '',
            )}
            specialCancelLayout="2%"
            title={modalObj.meta?.title || 'Warning'}
            handleAction={(whichButton) =>
              handleDeleteActions(
                deleteLessonModalId,
                whichButton,
                modalObj.meta,
              )
            }
            maxWidth="xs"
          />
          {/* delete repo */}
          <ModalDialog
            testId={deleteRepoModalId}
            buttons={['Cancel', 'Delete']}
            dialogProps={{
              open: modalObj.type === deleteRepoModalId,
            }}
            disableSubmit={forceDisableSubmit}
            message={confirmMessage(
              modalObj?.name || '',
              modalObj.meta?.message || '',
              true,
              'repository name',
              modalObj?.meta?.permanentWarning,
            )}
            specialCancelLayout="2%"
            title={modalObj.meta?.title || 'Warning'}
            handleAction={async (whichButton) => {
              await handleDeleteActions(
                deleteRepoModalId,
                whichButton,
                modalObj.meta,
              );
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
                placeholder={'Type item name here...'}
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

          {/* warning */}
          <ModalDialog
            testId={warningModalId}
            buttons={['Ok']}
            dialogProps={{
              open: modalObj.type === warningModalId,
            }}
            message={modalObj.meta?.message || ''}
            title={modalObj.meta?.title || 'Warning'}
            handleAction={handleCloseModal}
            maxWidth="xs"
          />
        </>
      )}
    </>
  );
}
