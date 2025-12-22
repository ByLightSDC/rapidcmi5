/* eslint-disable react/jsx-no-useless-fragment */
import {
  FormControlCheckboxField,
  FormControlPassword,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui';
import * as yup from 'yup';

import { cloneRepoModalId } from '../../rapidcmi5_mdx/modals/constants';
import { CommonAppModalState } from '@rapid-cmi5/ui';

import { Grid, Typography } from '@mui/material';

import { UseFormReturn } from 'react-hook-form';

import { GIT_URL_GROUP, NAME_GROUP } from '@rapid-cmi5/ui';
import { CreateCloneType } from '../CourseBuilderApiTypes';
import { useCallback, useContext, useEffect } from 'react';
import { GitContext } from '../GitViewer/session/GitContext';
const validationSchema = yup.object().shape({
  repoDirName: NAME_GROUP,
  repoRemoteUrl: GIT_URL_GROUP(),
  repoBranch: NAME_GROUP,
  repoUsername: NAME_GROUP,
  repoPassword: NAME_GROUP,
  authorName: NAME_GROUP,
  authorEmail: NAME_GROUP,
});

export function CloneRepoForm({
  defaultData,
  modalObj,
  handleCloseModal,
  handleModalAction,
}: {
  defaultData: CreateCloneType;
  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => void;
}) {
  const { handleCloneRepo } = useContext(GitContext);

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
  const getFormFields = useCallback(
    (formMethods: UseFormReturn, formState: FormStateType): JSX.Element => {
      const { control, getValues, setValue, trigger, watch } = formMethods;
      const { errors } = formState;

      /**
       * Defaults the repo name based on a valid repo url (if not already filled in)
       */
      const watchRepoUrl = watch('repoRemoteUrl');

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

      return (
        <>
          <Grid item xs={12}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.repoRemoteUrl)}
              helperText={errors?.repoRemoteUrl?.message}
              name="repoRemoteUrl"
              required
              label="Remote Repository URL"
              multiline={false}
              readOnly={false}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.repoDirName)}
              helperText={errors?.repoDirName?.message}
              name="repoDirName"
              required
              label="Repository Name"
              readOnly={false}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.repoBranch)}
              helperText={errors?.repoBranch?.message}
              name="repoBranch"
              required
              label="Branch"
              readOnly={false}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.repoUsername)}
              helperText={errors?.repoUsername?.message}
              name="repoUsername"
              required
              label="User Name"
              readOnly={false}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlPassword
              control={control}
              error={Boolean(errors?.repoPassword)}
              helperText={errors?.repoPassword?.message}
              name="repoPassword"
              required
              label="Password"
              readOnly={false}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.authorName)}
              helperText={errors?.authorName?.message}
              name="authorName"
              required
              label="Author Name"
              readOnly={false}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlTextField
              control={control}
              error={Boolean(errors?.authorEmail)}
              helperText={errors?.authorEmail?.message}
              name="authorEmail"
              required
              label="Email"
              readOnly={false}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlCheckboxField
              control={control}
              name="shallowClone"
              label="Shallow Clone"
            />
            <Typography>
              This improves performance for very large repos
            </Typography>
          </Grid>
        </>
      );
    },
    [],
  );

  return (
    <ModalDialog
      testId={cloneRepoModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === cloneRepoModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handleCloneRepo}
          formTitle="Clone Repository"
          getFormFields={getFormFields}
          instructions="Select a remote git repository to clone"
          submitButtonText="Clone"
          successToasterMessage="Repository Cloned Successfully"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default CloneRepoForm;
