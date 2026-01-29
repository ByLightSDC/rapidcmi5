import Grid from '@mui/material/Grid2';

import { Stack } from '@mui/material';

import { useEffect, useState } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import DownloadIcon from '@mui/icons-material/Download';

import download from 'js-file-download';

import { FormStateType } from '../types/form';
import FormControlTextField from './FormControlTextField';
import FormFieldArray, { tFormFieldRendererProps } from './FormFieldArray';
import FileUpload from '../inputs/file-upload/FileUpload';
import { FormCrudType } from '../redux/utils/types';
import { ButtonIcon } from '../utility/buttons';
import { useToaster } from '../utility/useToaster';

type tFormFieldArrayProps = {
  arrayFieldName: string;
  crudType: FormCrudType;
  downloadHandler: (fileData: any) => any;
  formMethods: UseFormReturn;
  formState: FormStateType;
  testId?: string;
  uploadHandler?: (image: File) => void;
};

/**
 * FileFormFieldArray is a React Component that allows users to upload multiple files
 * display files in a list
 * and display download icon button
 * @param param0
 * @returns
 */
export function FileFormFieldArray({
  arrayFieldName,
  crudType,
  downloadHandler,
  formMethods,
  formState,
  testId,
  uploadHandler,
}: tFormFieldArrayProps) {
  const { control } = formMethods;
  const { errors } = formState;

  const displayToaster = useToaster();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadBlob, setDownloadBlobData] = useState<any>(null);
  const [downloadFileData, setDownloadFileData] = useState<any>(null);

  const { fields, append } = useFieldArray({
    control,
    name: arrayFieldName,
  });

  /**
   * Retrieves blob data
   * @param fieldName
   * @param fieldIndex
   */
  const triggerDownload = async (fieldName: string, fieldIndex: number) => {
    const theFileData = fields[fieldIndex]; //getValues(fieldName);
    setDownloadFileData(theFileData);
    const blobData = await downloadHandler(theFileData);
    if (blobData) {
      setIsDownloading(false);
      setDownloadBlobData(blobData);
    }
  };

  //UE listens for a download blob and triggers downloading to local machine
  useEffect(() => {
    if (!isDownloading && downloadBlob) {
      setIsDownloading(true);
      download(downloadBlob, downloadFileData.name);
      displayToaster({
        message: 'Saving file to downloads...',
        severity: 'warning',
      });
    }
  }, [isDownloading, downloadBlob, displayToaster, downloadFileData?.name]);

  return (
    <>
      {crudType !== FormCrudType.preview && (
        <Grid size={12}>
          <FileUpload
            fileTypes={'*'}
            onFileSelected={(file, selected) => {
              append({
                name: file.name,
                path: file.name,
                type: file.type,
              });
              if (uploadHandler) {
                uploadHandler(file);
              }
            }}
            testId={testId}
          />
        </Grid>
      )}
      <Grid size={12}>
        <FormFieldArray
          allowAdd={false}
          arrayFieldName={'files'}
          arrayRenderItem={(props: tFormFieldRendererProps) => {
            return (
              <Stack
                direction="row"
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FormControlTextField
                  control={control}
                  name={`${props.indexedArrayField}.name`}
                  label="File Name"
                  readOnly={crudType === FormCrudType.view}
                />
                <ButtonIcon
                  id="download-button"
                  tooltip="Download"
                  props={{
                    'aria-label': 'Download File',
                    name: 'download button ' + props.rowIndex,

                    onClick: (event) => {
                      event.stopPropagation();
                      triggerDownload(
                        props.indexedArrayField,
                        props.rowIndex || 0,
                      );
                    },
                  }}
                >
                  <DownloadIcon fontSize="medium" />
                </ButtonIcon>
              </Stack>
            );
          }}
          defaultValues={''}
          errors={errors}
          formMethods={formMethods}
          isExpandable={false}
          isVisibleDeleteAll={false}
          isVisibleAdd={false}
          title=""
          readOnly={
            crudType === FormCrudType.view || crudType === FormCrudType.preview
          }
          width="100%"
        />
      </Grid>
    </>
  );
}
