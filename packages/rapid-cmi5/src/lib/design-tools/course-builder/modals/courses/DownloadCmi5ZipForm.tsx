import {
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
  CommonAppModalState,
} from '@rapid-cmi5/ui';
import * as yup from 'yup';

import Grid from '@mui/material/Grid2';

import { UseFormReturn } from 'react-hook-form';
import { NAME_GROUP_OPT } from '@rapid-cmi5/ui';
import { DownloadCmi5Type } from '../../CourseBuilderApiTypes';
import { useContext, useState } from 'react';
import { GitContext } from '../../GitViewer/session/GitContext';
import { downloadCmi5ZipModalId } from '../../../rapidcmi5_mdx/modals/constants';

export function DownloadCmi5ZipForm({
  defaultData,
  modalObj,
  handleCloseModal,
  handleModalAction,
}: {
  defaultData: DownloadCmi5Type;
  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => void;
}) {
  const { handleDownloadCmi5Zip } = useContext(GitContext);

  const [currentCourseId, setCurrentCourseId] = useState<string>('');
  const [courseHasUUID, setCourseHasUUID] = useState(true);

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
    const { control } = formMethods;
    const { errors } = formState;

    return (
      <>
        <Grid size={6} sx={{ marginTop: '8px' }}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.zipName)}
            helperText={errors?.zipName?.message}
            name="zipName"
            required
            label="Zip Name"
            readOnly={false}
          />
        </Grid>
      </>
    );
  };

  return (
    <ModalDialog
      testId={downloadCmi5ZipModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === downloadCmi5ZipModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handleDownloadCmi5Zip}
          formTitle="Publish Course"
          getFormFields={pullFormFields}
          instructions="Download a CMI5 zip file containing all of the lessons in this course. The downloaded file can be uploaded to a RangeOS LMS course activity."
          submitButtonText="Download"
          successToasterMessage="Download Succeeded"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default DownloadCmi5ZipForm;
