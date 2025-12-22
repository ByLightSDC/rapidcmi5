/* eslint-disable react/jsx-no-useless-fragment */
import {
  FormControlPassword,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  commitChangesModalId,
} from '../../rapidcmi5_mdx/modals/constants';
import { CommonAppModalState } from '@rapid-cmi5/ui';

import { Box, Grid } from '@mui/material';

import { UseFormReturn } from 'react-hook-form';

import {
  DESCRIPTION_GROUP,
  EMAIL_BASE,
  EMAIL_GROUP,
  NAME_GROUP,
  NAME_GROUP_OPT,
} from '@rapid-cmi5/ui';
import { CreateCommitType } from '../CourseBuilderApiTypes';
import { useContext } from 'react';
import { GitContext } from '../GitViewer/session/GitContext';

export function CommitForm({
  defaultData,
  modalObj,
  handleCloseModal,
  handleModalAction,
}: {
  defaultData: CreateCommitType;
  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => void;
}) {
  const { handleCommit } = useContext(GitContext);

  const validationSchema = yup.object().shape({
    commitMessage: DESCRIPTION_GROUP,
    authorName: NAME_GROUP_OPT,
    authorEmail: yup.string().matches(EMAIL_BASE.regex, EMAIL_BASE.regexError),
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
        <Grid item xs={11.5}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.commitMessage)}
            helperText={errors?.commitMessage?.message}
            name="commitMessage"
            required
            label="Commit Message"
            readOnly={false}
          />
        </Grid>

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
        <Grid item xs={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.branch)}
            helperText={errors?.branch?.message}
            name="branch"
            label="Branch"
            readOnly={true}
          />
        </Grid>
      </>
    );
  };

  return (
    <ModalDialog
      testId={commitChangesModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === commitChangesModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handleCommit}
          formTitle="Commit Staged Changes"
          getFormFields={getFormFields}
          instructions=""
          submitButtonText="Commit"
          successToasterMessage="Changes Committed Successfully"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default CommitForm;
