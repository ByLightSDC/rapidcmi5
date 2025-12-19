/* eslint-disable react/jsx-no-useless-fragment */
import {
  FormControlPassword,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui/branded';
import * as yup from 'yup';

import { CommonAppModalState } from '@rapid-cmi5/ui/branded';

import { Grid } from '@mui/material';

import { UseFormReturn } from 'react-hook-form';

import {
  NAME_GROUP_OPT,
} from '@rapid-cmi5/ui/branded';
import { PushType } from '../CourseBuilderApiTypes';
import { useContext } from 'react';
import { GitContext } from '../GitViewer/session/GitContext';
import { gitPushModalId } from '../../rapidcmi5_mdx/modals/constants';


export function PushForm({
  defaultData,
  modalObj,
  handleCloseModal,
  handleModalAction,
}: {
  defaultData: PushType;
  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => void;
}) {
  const { handlePushRepo } = useContext(GitContext);

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
  const pullFormFields = (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ): JSX.Element => {
    const { control, getValues, setValue, trigger } = formMethods;
    const { errors, isValid } = formState;
    return (
      <>
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
      testId={gitPushModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === gitPushModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handlePushRepo}
          formTitle="Push Git Repo"
          getFormFields={pullFormFields}
          instructions=""
          submitButtonText="Push"
          successToasterMessage="Pushed Successfully"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default PushForm;
