/* eslint-disable react/jsx-no-useless-fragment */
import {
  FileUpload,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui';
import * as yup from 'yup';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { createCourseModalId } from '../../rapidcmi5_mdx/modals/constants';
import { CommonAppModalState } from '@rapid-cmi5/ui';

import { Alert, Box, Button, IconButton, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { useForm, UseFormReturn } from 'react-hook-form';

import {
  DESCRIPTION_GROUP_OPT,
  NAME_GROUP,
  STARTS_WITH_HTTPS_GROUP,
} from '@rapid-cmi5/ui';
import { CreateCourseType } from '../CourseBuilderApiTypes';
import { useContext, useMemo } from 'react';
import { GitContext } from '../GitViewer/session/GitContext';

export function CreateCourseForm({
  defaultData,
  modalObj,
  handleCloseModal,
  handleModalAction,
}: {
  defaultData: CreateCourseType;
  modalObj: CommonAppModalState;
  shouldOpenRepoSelectAfterClone?: boolean;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => void;
}) {
  const { handleCreateCourse } = useContext(GitContext);

  const formMethods = useForm({
    defaultValues: defaultData,
    mode: 'onChange',
  });

  const validationSchema = useMemo(() => {
    return yup.object().shape({
      courseName: NAME_GROUP,
      courseDescription: DESCRIPTION_GROUP_OPT,
      courseId: STARTS_WITH_HTTPS_GROUP(),
      firstAuName: yup.mixed().when('zipFile', {
        is: (file: File | undefined) => !!file,
        then: (schema) => yup.string().optional(),
        otherwise: () => NAME_GROUP,
      }),
      zipFile: yup
        .mixed()
        .test('is-zip', 'Must be a .zip file', (value) =>
          value
            ? value instanceof File &&
              value.name?.toLowerCase().endsWith('.zip')
            : true,
        ),
    });
  }, []);

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
    const { control, setValue, trigger, watch } = formMethods;
    const { errors } = formState;
    const isUploading = watch('zipFile');

    const defaultLessonField = !isUploading && (
      <Grid size={12}>
        <FormControlTextField
          control={control}
          error={Boolean(errors?.firstAuName)}
          helperText={errors?.firstAuName?.message}
          name="firstAuName"
          required
          label="Default Lesson AU Name"
        />
      </Grid>
    );

    const zipUploadField = (
      <Grid size={12}>
        <Tooltip title="Upload an existing CMI5 course zip file into the repo. Must have a valid RC5 version.">
          <IconButton size="small">
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <FileUpload
          buttonEmphasis={false}
          buttonTitle="Import..."
          dataCache={[]}
          fileTypes=".zip"
          isUploading={false}
          noFileSelectedMessage="Import from CMI5 zip"
          onFileSelected={async (file: File, selected: boolean) => {
            if (selected && file instanceof File) {
              setValue('zipFile', file, { shouldValidate: true });
            } else {
              setValue('zipFile', undefined, { shouldValidate: true });
            }
            trigger('zipFile');
          }}
        />
        {errors?.zipFile && (
          <Alert severity="error">{errors.zipFile.message}</Alert>
        )}
      </Grid>
    );

    return (
      <>
        <Grid size={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.courseName)}
            helperText={errors?.courseName?.message}
            name="courseName"
            required
            label="Course Name"
          />
        </Grid>
        <Grid size={6}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <FormControlTextField
                control={control}
                error={Boolean(errors?.courseId)}
                helperText={errors?.courseId?.message}
                name="courseId"
                required
                label="Course ID"
              />
            </Box>
            <Tooltip title="This course id is used for tracking LRS statements made by a student to this specific course. It is also used to deploy scenarios associated with this course. Please ensure this course id is unique.">
              <IconButton size="small" sx={{ mt: 1 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
        <Grid size={12}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.courseDescription)}
            helperText={errors?.courseDescription?.message}
            name="courseDescription"
            label="Description"
          />
        </Grid>
        {defaultLessonField}
        {zipUploadField}
      </>
    );
  };

  return (
    <ModalDialog
      testId={createCourseModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === createCourseModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handleCreateCourse}
          formTitle="Create Course"
          getFormFields={getFormFields}
          instructions=""
          submitButtonText="Create"
          successToasterMessage="Course Created Successfully"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default CreateCourseForm;
