/* eslint-disable react/jsx-no-useless-fragment */
import {
  FileUpload,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rangeos-nx/ui/branded';
import * as yup from 'yup';

import { importRepoZipModalId } from '../../rapidcmi5_mdx/modals/constants';
import { CommonAppModalState } from '@rangeos-nx/ui/redux';

import { Alert, Grid, Typography } from '@mui/material';

import { UseFormReturn } from 'react-hook-form';

import { NAME_GROUP } from '@rangeos-nx/ui/validation';
import { ImportRepoZipType } from '../CourseBuilderApiTypes';
import { useContext, useState } from 'react';
import { GitContext } from '../GitViewer/session/GitContext';

export function ImportRepoZipForm({
  defaultData,
  modalObj,
  shouldOpenRepoSelectAfterClone,
  handleCloseModal,
  handleModalAction,
}: {
  defaultData: ImportRepoZipType;
  modalObj: CommonAppModalState;
  shouldOpenRepoSelectAfterClone?: boolean;
  handleCloseModal: () => void;
  handleModalAction: (
    modalId: string,
    buttonAction: number,
    data?: any,
  ) => void;
}) {
  const validationSchema = yup.object().shape({
    repoDirName: NAME_GROUP,
    authorName: NAME_GROUP,
    authorEmail: NAME_GROUP,
    zipFile: yup
      .mixed<File>()
      .required('You must select a zip file')
      .test('fileType', 'Only .zip files are allowed', (file) =>
        file ? file.name.endsWith('.zip') : false,
      ),
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
  const { handleImportRepoZip } = useContext(GitContext);
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
    const { control, setValue, trigger } = formMethods;
    const { errors } = formState;

    return (
      <>
        <Grid item xs={12}>
          <FileUpload
            buttonEmphasis={false}
            buttonTitle="Import Zip"
            dataCache={[]}
            fileTypes=".zip"
            isUploading={false}
            noFileSelectedMessage="Please select a .zip file"
            onFileSelected={async (file: File, selected: boolean) => {
              if (selected && file instanceof File) {
                setValue('zipFile', file, { shouldValidate: true });
                trigger('zipFile');
              } else {
                setValue('zipFile', undefined, { shouldValidate: true });
              }
            }}
          />
          {errors?.zipFile && (
            <Typography color="error" variant="caption">
              {errors.zipFile.message}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.repoDirName)}
            helperText={errors?.repoDirName?.message}
            name="repoDirName"
            required
            label="Repository Name"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.authorName)}
            helperText={errors?.authorName?.message}
            name="authorName"
            required
            label="Author Name"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.authorEmail)}
            helperText={errors?.authorEmail?.message}
            name="authorEmail"
            required
            label="Email"
          />
        </Grid>
      </>
    );
  };

  return (
    <ModalDialog
      testId={importRepoZipModalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === importRepoZipModalId,
      }}
      maxWidth="sm"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handleImportRepoZip}
          formTitle="Import Repository Zip"
          getFormFields={getFormFields}
          instructions="Download source code from your git your repository and import it here"
          submitButtonText="Import"
          successToasterMessage="Repository Imported Successfully"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={onResponse}
          validationSchema={validationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default ImportRepoZipForm;
