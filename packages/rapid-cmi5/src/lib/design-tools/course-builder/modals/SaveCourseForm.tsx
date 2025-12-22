
import {
  ModalDialog,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  FormControlCheckboxField,
  FormControlPassword,
  CommonAppModalState,
  NAME_GROUP_OPT,
  ButtonMinorUi,
  useToaster,
} from '@rapid-cmi5/ui';
import { Alert, Grid, Typography } from '@mui/material';
import { Stack } from '@mui/system';

import AddIcon from '@mui/icons-material/Add';

import * as yup from 'yup';

import { UseFormReturn } from 'react-hook-form';
import { SuperSaveFormType } from '../CourseBuilderApiTypes';

import {
  cacheWarning,
  saveCourseFileModalId,
} from '../../rapidcmi5_mdx/modals/constants';
import { useCallback, useContext, useEffect, useState } from 'react';
import { GitContext } from '../GitViewer/session/GitContext';
import { MessageType } from '../CourseBuilderTypes';
import { useRC5Prompts } from '../../rapidcmi5_mdx/modals/useRC5Prompts';
import { useDispatch, useSelector } from 'react-redux';
import { RC5Context } from '../../rapidcmi5_mdx/contexts/RC5Context';
import {
  courseOperations,
  updateDirtyDisplay,
} from '../../../redux/courseBuilderReducer';

export function SaveCourseForm({
  defaultData,
  modalId = saveCourseFileModalId,
  modalObj,
  handleCloseModal,
  handleModalAction,
}: {
  defaultData: SuperSaveFormType;
  modalId?: string;
  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => void;
}) {
  const {
    currentGitConfig,
    handleCommit,
    handleNavToGitView,
    handlePushRepo,
    handleStageAll,
    currentCourse,
    isRepoConnectedToRemote,
  } = useContext(GitContext);
  const { discardLessonChanges, saveCourseFile, sendMessage } =
    useContext(RC5Context);
  const { promptAttachRemoteRepo } = useRC5Prompts();

  const displayToaster = useToaster();
  const dispatch = useDispatch();
  const courseOperationsSet = useSelector(courseOperations);

  const [superSaveData, setSuperData] =
    useState<SuperSaveFormType>(defaultData);

  const [saveError, setSaveErrorMessage] = useState<string | null>(null);
  const [saveProgressMessage, setSaveProgressMessage] = useState('');
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const handleAddRemoteBeforeSave = () => {
    promptAttachRemoteRepo(undefined, {
      notify: MessageType.saveCourse,
      cacheMeta: modalObj.meta,
    });
  };

  const handleFormChanges = (data: any) => {
    setSuperData(data);
  };

  // This use effect generates a standard default commit based on the files added, edited, or deleted
  useEffect(() => {
    const courseOperationsList = Object.entries(courseOperationsSet).map(
      ([filepath, operation]) =>
        'File: ' + filepath + ', Operation: ' + operation,
    );
    const defaultCommit = courseOperationsList.join('\n');

    if (
      !superSaveData.commit.commitMessage ||
      superSaveData.commit.commitMessage === ''
    ) {
      setSuperData((prev) => {
        return {
          ...prev,
          commit: {
            ...prev.commit,
            commitMessage: defaultCommit,
          },
        };
      });
    }
  }, [courseOperationsSet]);

  const handleSaveFileActions = useCallback(
    async (whichButton: number, meta?: any) => {
      if (whichButton === 0) {
        handleCloseModal();
        await discardLessonChanges();
      } else if (whichButton === 1) {
        handleCloseModal();
        return;
      } else if (whichButton === 2) {
        console.time('saveCourseFile');

        let successMessage = 'Files Saved Locally';
        if (superSaveData.shouldAutoCommit && superSaveData.shouldAutoPush) {
          successMessage = 'Files Saved & Pushed to Remote';
        } else if (superSaveData.shouldAutoPush) {
          successMessage = 'Files Saved & Pushed to Remote';
        } else if (superSaveData.shouldAutoCommit) {
          successMessage = 'Files Saved & Committed Locally';
        }
        try {
          setSaveProgressMessage('Saving Course Files...');

          const changedFiles = await saveCourseFile();
          console.timeEnd('saveCourseFile');

          setSaveProgressMessage('Updating Modified Files...');
          // @Aaron My Attempt to fix a bug where all files do not get staged
          // await handleNavToGitView();

          // Stage
          setSaveProgressMessage('Staging Files...');
          const stagePath = currentCourse
            ? [currentCourse.basePath]
            : changedFiles;
          await handleStageAll(false, stagePath);

          //Commit
          if (superSaveData.shouldAutoCommit) {
            setSaveProgressMessage('Committing Changes...');
            console.log('superSaveData.commit', superSaveData.commit);
            await handleCommit(superSaveData.commit);
          }

          //Push
          if (superSaveData.shouldAutoPush && isRepoConnectedToRemote) {
            setSaveProgressMessage('Pushing to Remote...');
            console.log('superSaveData.push', superSaveData.push);
            await handlePushRepo(superSaveData.push);
          }
        } catch (e: any) {
          console.log('e while saving', e);
          //setSaveProgressMessage('Error ' + saveProgressMessage);
          const errorInfo = {
            name: e?.name,
            message: e?.message,
            stack: e?.stack,
          };
          setSaveErrorMessage(errorInfo.message);
          return;
        }
        displayToaster({
          message: successMessage,
          severity: 'success',
        });
      }

      delay(2000);

      dispatch(updateDirtyDisplay({ counter: 0 }));

      handleModalAction(modalId, 2, superSaveData);
    },
    [
      superSaveData,
      discardLessonChanges,
      dispatch,
      displayToaster,
      handleCloseModal,
      handleCommit,
      handleModalAction,
      handleNavToGitView,
      handlePushRepo,
      handleStageAll,
      modalId,
      saveCourseFile,
      sendMessage,
    ],
  );

  const validationSchema = yup.object().shape({
    username: NAME_GROUP_OPT,
  });

  /**
   * Returns form fields unique to this form
   * @param {UseFormReturn} formMethods React hook form methods
   * @param {FormStateType} formState React hook form state fields (ex. errors, isValid)
   * @return {JSX.Element} Render elements
   */
  const getFormFields = (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ): JSX.Element => {
    const { control, getValues, setValue, trigger, watch } = formMethods;
    const { errors, isValid } = formState;

    const theData = getValues();
    if (Object.keys(theData).length === 0) {
      return <div />;
    }

    const shouldCommit = watch('shouldAutoCommit');
    const shouldPush = watch('shouldAutoPush');
    return (
      <>
        {!isRepoConnectedToRemote && (
          <>
            <Grid item xs={12}>
              <Typography sx={{ whiteSpace: 'preWrap', paddingBottom: '8px' }}>
                {cacheWarning}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="warning">
                <Stack direction="column">
                  It is highly recommended that you use Version Control to back
                  up your work.
                  <ButtonMinorUi
                    sx={{ marginTop: 1, paddingRight: 1, maxWidth: '200px' }}
                    color="warning"
                    startIcon={<AddIcon />}
                    onClick={handleAddRemoteBeforeSave}
                  >
                    Add Remote
                  </ButtonMinorUi>
                </Stack>
              </Alert>
            </Grid>
          </>
        )}

        <>
          <Grid item xs={12}>
            <Typography sx={{ whiteSpace: 'preWrap' }}>
              {cacheWarning}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 'bold', marginTop: 2 }}
            >
              More Save Options...
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <FormControlCheckboxField
              control={control}
              name={'shouldAutoCommit'}
              label="Commit Changes"
              infoText="Save a snapshot of changes to the local repository in yourweb browser."
            />
            {isRepoConnectedToRemote && (
              <FormControlCheckboxField
                control={control}
                name={'shouldAutoPush'}
                label="Push to Remote"
                infoText={
                  <>
                    Push commits to the linked remote repository
                    <br />
                    <i>{currentGitConfig.remoteRepoUrl}</i>
                  </>
                }
              />
            )}
          </Grid>
          {shouldCommit && (
            <Grid item xs={11.5}>
              <FormControlTextField
                control={control}
                error={Boolean(errors?.commit?.commitMessage)}
                helperText={errors?.commit?.commitMessage?.message}
                name="commit.commitMessage"
                required
                label="Commit Message"
                multiline={true}
                maxRows={8}
                readOnly={false}
              />
            </Grid>
          )}
          {shouldPush && isRepoConnectedToRemote && (
            <>
              <Grid item xs={6}>
                <FormControlTextField
                  control={control}
                  error={Boolean(errors?.push?.repoUsername)}
                  helperText={errors?.push?.repoUsername?.message}
                  name="push.repoUsername"
                  required
                  label="User Name"
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlPassword
                  control={control}
                  error={Boolean(errors?.push?.repoPassword)}
                  helperText={errors?.push?.repoPassword?.message}
                  name="push.repoPassword"
                  required
                  label="Password"
                  readOnly={false}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlTextField
                  control={control}
                  error={Boolean(errors?.push?.branch)}
                  helperText={errors?.push?.branch?.message}
                  name="push.branch"
                  label="Branch"
                  readOnly={true}
                />
              </Grid>
            </>
          )}

          {saveProgressMessage && (
            <Grid item xs={12}>
              <Typography variant="body1">{saveProgressMessage}</Typography>
            </Grid>
          )}
        </>

        {saveError && (
          <Grid item xs={12}>
            <Alert
              onClose={() => {
                setSaveErrorMessage(null);
                setSaveProgressMessage('');
              }}
              severity="error"
            >
              {saveError}
            </Alert>
          </Grid>
        )}
      </>
    );
  };

  return (
    <ModalDialog
      testId={modalId}
      buttons={['Discard', 'Cancel', 'Save']}
      dialogProps={{
        fullWidth: true,
        open: modalObj.type === modalId,
      }}
      handleAction={(whichButton) =>
        handleSaveFileActions(whichButton, modalObj.meta)
      }
      maxWidth={saveError ? 'lg' : 'sm'}
    >
      <FormControlUIProvider>
        <MiniForm
          autoSaveDebounceTime={100}
          dataCache={superSaveData}
          doAction={handleFormChanges}
          formTitle={modalObj?.meta?.title || 'Save Changes?'}
          formWidth="100%"
          getFormFields={getFormFields}
          instructions=""
          submitButtonText="Save"
          shouldAutoSave={true}
          shouldShowAutoSaveIndicator={false}
          shouldDisplaySave={false}
          showInternalError={true}
          successToasterMessage="Saved Successfully"
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default SaveCourseForm;
