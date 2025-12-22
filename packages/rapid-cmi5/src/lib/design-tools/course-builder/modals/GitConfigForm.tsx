/* eslint-disable react/jsx-no-useless-fragment */
import {
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui';
import * as yup from 'yup';

import { setGitConfigModalId } from '../../rapidcmi5_mdx/modals/constants';
import { CommonAppModalState } from '@rapid-cmi5/ui';

import { Grid } from '@mui/material';

import { UseFormReturn } from 'react-hook-form';

import { NAME_GROUP_OPT } from '@rapid-cmi5/ui';
import { GitConfigType } from '../CourseBuilderApiTypes';
import { useContext } from 'react';
import { GitContext } from '../GitViewer/session/GitContext';

export function GitConfigForm({
  defaultData,
  modalObj,
  handleCloseModal,
  handleModalAction,
}: {
  defaultData: GitConfigType;
  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => void;
}) {
  const { handleGitSetConfig } = useContext(GitContext);

  const validationSchema = yup.object().shape({
    username: NAME_GROUP_OPT,
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
    const { control, getValues, setValue, trigger } = formMethods;
    const { errors, isValid } = formState;
    return (
      <>
        <Grid item xs={9}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.authorEmail)}
            helperText={errors?.authorEmail?.message}
            name="authorEmail"
            label="Email"
            readOnly={false}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.authorName)}
            helperText={errors?.authorName?.message}
            name="authorName"
            label="Author Name"
            readOnly={false}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.remoteRepoUrl)}
            helperText={errors?.remoteRepoUrl?.message}
            name="remoteRepoUrl"
            label="Remote URL"
            readOnly={false}
            multiline
          />
        </Grid>
      </>
    );
  };

  return (
    <ModalDialog
      testId={setGitConfigModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === setGitConfigModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handleGitSetConfig}
          formTitle="Repository Settings"
          getFormFields={getFormFields}
          instructions=""
          successToasterMessage="Set Git Config Successfully"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default GitConfigForm;
