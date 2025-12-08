/* eslint-disable react/jsx-no-useless-fragment */
import { useState } from 'react';
import {
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rangeos-nx/ui/branded';

import * as yup from 'yup';

import { CommonAppModalState } from '@rangeos-nx/ui/redux';
import { Grid } from '@mui/material';

import { UseFormReturn } from 'react-hook-form';

import { CreateLessonType } from '../CourseBuilderApiTypes';
import { NAME_GROUP } from '@rangeos-nx/ui/validation';
import { createNewLessonModalId } from '../../rapidcmi5_mdx/modals/constants';

export function CreateLessonForm({
  defaultData,
  modalObj,
  handleCloseModal,
  handleModalAction,
  onCreateLesson,
}: {
  defaultData: CreateLessonType;
  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => void;
  onCreateLesson: (req: CreateLessonType) => void;
}) {
  const validationSchema = yup.object().shape({
    auName: NAME_GROUP,
    // courseName: auto-filled in - readOnly
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

  const [createLessonInstructions, setCreateLessonInstructions] = useState('');
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
    const { control, getValues } = formMethods;
    const { errors } = formState;
    setCreateLessonInstructions(
      `This lesson will be created in the course named ${getValues('courseName')}.`,
    );

    return (
      <>
        <Grid item xs={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.auName)}
            helperText={errors?.auName?.message}
            name="auName"
            required
            label="Lesson AU Name"
            readOnly={false}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlTextField
            control={control}
            name="courseName"
            label="Course Name"
            readOnly={true}
          />
        </Grid>
      </>
    );
  };

  return (
    <ModalDialog
      testId={createNewLessonModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === createNewLessonModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={onCreateLesson}
          formTitle="Create Lesson AU"
          getFormFields={getFormFields}
          instructions={createLessonInstructions}
          submitButtonText="Create"
          successToasterMessage="Lesson AU Created Successfully"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default CreateLessonForm;
