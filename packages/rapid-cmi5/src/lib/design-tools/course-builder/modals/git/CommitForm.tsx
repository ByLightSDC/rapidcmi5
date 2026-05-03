/* eslint-disable react/jsx-no-useless-fragment */
import {
  FormControlTextField,
  FormControlUIProvider,
  type FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui';
import * as yup from 'yup';


import { type CommonAppModalState } from '@rapid-cmi5/ui';

import Grid from '@mui/material/Grid2';
import { type UseFormReturn } from 'react-hook-form';

import {
  DESCRIPTION_GROUP,
  EMAIL_BASE,

  NAME_GROUP_OPT,
} from '@rapid-cmi5/ui';
import { useContext } from 'react';
import { commitChangesModalId } from '../../../rapidcmi5_mdx/modals/constants';
import { type CreateCommitType } from '../../CourseBuilderApiTypes';
import { GitContext } from '../../GitViewer/session/GitContext';

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

  const onResponse = (isSuccess: boolean, data: any) => {
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
    const { control } = formMethods;
    const { errors } = formState;
    return (
      <>
        <Grid size={11.5}>
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

        <Grid size={9}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.authorEmail)}
            helperText={errors?.authorEmail?.message}
            name="authorEmail"
            label="Email"
            readOnly={false}
          />
        </Grid>
        <Grid size={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.authorName)}
            helperText={errors?.authorName?.message}
            name="authorName"
            label="Author Name"
            readOnly={false}
          />
        </Grid>
        <Grid size={6}>
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
