/* eslint-disable react/jsx-no-useless-fragment */
import {
  FormControlPassword,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
  ViewExpander,
} from '@rapid-cmi5/ui';
import * as yup from 'yup';

import { createLocalRepoModalId } from '../../rapidcmi5_mdx/modals/constants';
import { CommonAppModalState } from '@rapid-cmi5/ui';

import Grid from '@mui/material/Grid2';

import { UseFormReturn } from 'react-hook-form';

import { GIT_URL_GROUP, NAME_GROUP } from '@rapid-cmi5/ui';
import { CreateCloneType } from '../CourseBuilderApiTypes';
import { useContext, useEffect, useMemo } from 'react';
import { GitContext } from '../GitViewer/session/GitContext';
import { Alert, Typography } from '@mui/material';

import CheckIcon from '@mui/icons-material/Check';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';

export function CreateLocalRepoForm({
  defaultData,
  modalObj,
  shouldOpenRepoSelectAfterClone,
  handleCloseModal,
  handleModalAction,
}: {
  defaultData: CreateCloneType;
  modalObj: CommonAppModalState;
  shouldOpenRepoSelectAfterClone?: boolean;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => void;
}) {
  const { handleCreateLocalRepo } = useContext(GitContext);

  const validationSchema = yup.object().shape({
    repoDirName: NAME_GROUP,
    repoRemoteUrl: GIT_URL_GROUP(false),
    repoBranch: NAME_GROUP,
    authorName: NAME_GROUP,
    authorEmail: NAME_GROUP,
  });

  const onCancel = () => {
    handleCloseModal();
  };

  const onClose = () => {
    handleCloseModal();
  };

  const onResponse = (isSuccess: boolean, data: any, message: string) => {
    if (isSuccess) {
      handleModalAction(modalObj.type, 1, data);
    }
  };

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
    const { errors } = formState;

    /**
     * Defaults the repo name based on a valid repo url (if not already filled in)
     */
    const watchRepoUrl = watch('repoRemoteUrl');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const urlError = Boolean(errors['repoRemoteUrl']);
      const repoName = getValues('repoDirName') || '';
      if (
        !urlError &&
        watchRepoUrl &&
        watchRepoUrl.endsWith('.git') && // to prevent timing issue between typed change and error change
        repoName.length === 0
      ) {
        const lastSlash = watchRepoUrl.lastIndexOf('/');
        const defaultName = watchRepoUrl
          .substring(lastSlash + 1)
          .replace('.git', '');
        setValue('repoDirName', defaultName);
        trigger('repoDirName');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchRepoUrl, errors['repoRemoteUrl']]);

    const hasRequiredErrors = useMemo(() => {
      if (
        errors?.repoUsername ||
        errors?.repoPassword ||
        errors?.authorName ||
        errors?.authorEmail
      ) {
        return true;
      }
      return false;
    }, [
      errors?.repoUsername,
      errors?.repoPassword,
      errors?.authorName,
      errors?.authorEmail,
    ]);

    return (
      <>
        <Grid size={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.repoDirName)}
            helperText={errors?.repoDirName?.message}
            name="repoDirName"
            required
            label="New Project Name"
            readOnly={false}
          />
        </Grid>
        <Grid size={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.repoBranch)}
            helperText={errors?.repoBranch?.message}
            name="repoBranch"
            required
            label="Remote Branch"
            readOnly={false}
          />
        </Grid>
        <ViewExpander
          rightMenuChildren={
            hasRequiredErrors ? (
              <ReportProblemIcon color="error" fontSize="medium" />
            ) : (
              <CheckIcon color="success" fontSize="medium" />
            )
          }
          title="Git Credentials"
          defaultIsExpanded={false}
        >
          <>
            <Grid size={12}>
              <Typography variant="caption">
                Git Configuration for Tracking Changes
              </Typography>
            </Grid>

            <Grid size={6}>
              <FormControlTextField
                control={control}
                error={Boolean(errors?.authorName)}
                helperText={errors?.authorName?.message}
                name="authorName"
                required
                label="Author Name"
                placeholder="FirstName LastName"
                readOnly={false}
              />
            </Grid>
            <Grid size={6}>
              <FormControlTextField
                control={control}
                error={Boolean(errors?.authorEmail)}
                helperText={errors?.authorEmail?.message}
                name="authorEmail"
                required
                label="Email"
                placeholder="user@gmail.com"
                readOnly={false}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlTextField
                control={control}
                error={Boolean(errors?.repoUsername)}
                helperText={errors?.repoUsername?.message}
                name="repoUsername"
                label="User Name"
                placeholder="user.name"
                readOnly={false}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlPassword
                control={control}
                error={Boolean(errors?.repoPassword)}
                helperText={errors?.repoPassword?.message}
                name="repoPassword"
                label="Password"
                placeholder="Personal Access Token"
                readOnly={false}
              />
            </Grid>
            <Grid size={12}>
              <FormControlTextField
                control={control}
                error={Boolean(errors?.repoRemoteUrl)}
                helperText={errors?.repoRemoteUrl?.message}
                name="repoRemoteUrl"
                label="Remote Repository URL"
                multiline={true}
                placeholder="https://mycourserepo.git"
                readOnly={false}
                data-testid=""
              />
            </Grid>
            <Alert severity="info">
              Author name and email are required to commit changes locally.
              <br />
              User Name, Password, and Remote Repository URL are required in
              order to push changes remotely. You can change these later.
            </Alert>
          </>
        </ViewExpander>
      </>
    );
  };

  return (
    <ModalDialog
      testId={createLocalRepoModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === createLocalRepoModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handleCreateLocalRepo}
          formTitle="Create Project"
          getFormFields={getFormFields}
          instructions=""
          submitButtonText="Create"
          failToasterMessage="Project Creation Failed"
          successToasterMessage="Project Created Successfully"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default CreateLocalRepoForm;
