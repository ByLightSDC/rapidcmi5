import { UseFormReturn } from 'react-hook-form';
import {
  FileDownloadLink,
  FileFormFieldArray,
  FormControlUIProvider,
  FormCrudType,
  FormStateType,
  MiniForm,
} from '@rangeos-nx/ui/branded';
import { Box, Typography } from '@mui/material';
import * as yup from 'yup';
import { DownloadFileData, DownloadFilesContent } from '@rangeos-nx/types/cmi5';

import { RC5ActivityTypeEnum } from '@rangeos-nx/types/cmi5';
import { useContext, useState } from 'react';

import { useImageFile } from '../../data-hooks/useImageFile';
import { useSelector } from 'react-redux';
import { currentAuPath } from 'apps/rapid-cmi5-electron-frontend/src/app/redux/courseBuilderReducer';
import { GitContext } from '../../../course-builder/GitViewer/session/GitContext';

/**
 * Form course creators can use to attack files to a Lesson AU
 * @param param0
 * @returns
 */
export const DownloadFilesForm = ({
  crudType,
  defaultFormData,
  deleteButton,
  onSave,
  testId,
}: {
  crudType: FormCrudType;
  defaultFormData: DownloadFilesContent;
  deleteButton?: JSX.Element;
  handleCloseModal?: () => void;
  onSave?: (activity: RC5ActivityTypeEnum, data: any) => void;
  testId?: string;
}) => {
  const { fileUploadHandler } = useImageFile();
  const validationSchema = yup.object().shape({});
  const auDir = useSelector(currentAuPath);

  const [formHeadTitle, setFormHeadTitle] = useState<string>('Files');
  const { getLocalFileBlob, getLocalFileBlobUrl } = useContext(GitContext);
  const { defaultDownloadFilePath } = useImageFile();
  const isDebugId = false;

  /**
   * fileDownloadHandler
   * @param fileData
   * @returns Blob
   */
  const fileDownloadHandler = async (fileData: DownloadFileData) => {
    if (!auDir) {
      return null;
    }
    const theBlob = await getLocalFileBlob?.(
      `./${defaultDownloadFilePath}/${fileData.path}`,
      auDir,
      fileData.type,
    );

    return theBlob;
  };

  const onSaveAction = (data: any) => {
    if (onSave) {
      onSave(RC5ActivityTypeEnum.download, data as DownloadFilesContent);
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
    const { getValues } = formMethods;

    if (crudType === FormCrudType.preview) {
      setFormHeadTitle(getValues('title'));
    } else {
      setFormHeadTitle('Download Files');
    }

    return (
      <FileFormFieldArray
        arrayFieldName="files"
        crudType={crudType}
        formMethods={formMethods}
        formState={formState}
        downloadHandler={fileDownloadHandler}
        testId={testId}
        uploadHandler={fileUploadHandler}
      />
    );
  };

  return (
    <>
      {isDebugId && <Typography variant="caption">{testId}</Typography>}
      {auDir && crudType === FormCrudType.preview && (
        <Box>
          {defaultFormData.files.map((fileData: DownloadFileData) => {
            return (
              <FileDownloadLink
                fileData={fileData}
                auDir={auDir}
                filePath={`./${defaultDownloadFilePath}/${fileData.path}`}
                getLinkUrl={getLocalFileBlobUrl}
              />
            );
          })}
        </Box>
      )}
      {crudType !== FormCrudType.preview && (
        <FormControlUIProvider>
          <MiniForm
            autoSaveDebounceTime={1000}
            dataCache={defaultFormData}
            titleEndChildren={deleteButton}
            doAction={onSaveAction}
            formTitle={formHeadTitle}
            formWidth="640px"
            getFormFields={getFormFields}
            loadingButtonText="Saving"
            shouldAutoSave={crudType === FormCrudType.edit}
            shouldCheckIsDirty={true}
            shouldDisplaySave={false}
            showPaper={true}
            submitButtonText="Save"
            validationSchema={validationSchema}
          />
        </FormControlUIProvider>
      )}
    </>
  );
};
