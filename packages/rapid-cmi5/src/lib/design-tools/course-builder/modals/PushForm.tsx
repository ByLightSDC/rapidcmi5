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

import { CommonAppModalState } from '@rapid-cmi5/ui';

import { Typography } from '@mui/material';

import { UseFormReturn } from 'react-hook-form';

import { NAME_GROUP_OPT } from '@rapid-cmi5/ui';
import { PushType } from '../CourseBuilderApiTypes';
import { useContext } from 'react';
import { GitContext } from '../GitViewer/session/GitContext';
import { gitPushModalId } from '../../rapidcmi5_mdx/modals/constants';
import Grid from '@mui/material/Grid2';

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
  const pushFormFields = (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ): JSX.Element => {
    const { control, watch } = formMethods;
    const { errors } = formState;
    const isForceChecked = watch('force');

    return (
      <>
        <Grid size={6}>
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
        <Grid size={6}>
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

        <Grid size={12}>
          <FormControlCheckboxField
            control={control}
            name="force"
            error={errors?.force}
            label="Force push"
          />
          {isForceChecked && (
            <Typography
              variant="body2"
              color="warning.main"
              sx={{ mt: 1, ml: 4 }}
            >
              ⚠️ Warning: Force push will overwrite remote history. This cannot
              be undone and may affect other collaborators.
            </Typography>
          )}
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
          getFormFields={pushFormFields}
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
