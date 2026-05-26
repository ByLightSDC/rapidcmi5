import { Typography } from '@mui/material';
import { Box, SxProps } from '@mui/system';
import {
  DownloadFilesContent,
  RC5ActivityTypeEnum,
  DownloadFileData,
  OuterStyle,
} from '@rapid-cmi5/cmi5-build-common';
import {
  FormCrudType,
  FormStateType,
  FileFormFieldArray,
  FileDownloadLink,
  FormControlUIProvider,
  MiniForm,
} from '@rapid-cmi5/ui';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useAssetUploadHandlers } from '../../data-hooks/useUploadFile';
import * as yup from 'yup';
import { currentAuPath } from '../../../../redux/courseBuilderReducer';
import {
  ASSET_DIRS,
  useLessonAssets,
} from '../../../course-builder/GitViewer/session/LessonAssetsContext';

/**
 * Form course creators can use to attack files to a Lesson AU
 * @param param0
 * @returns
 */
export const DownloadFilesForm = ({
  contextMenu,
  crudType,
  defaultFormData,
  deleteButton,
  onSave,
  testId,
  innerSx,
  outerSx,
  outerStyle,
}: {
  contextMenu?: JSX.Element;
  crudType: FormCrudType;
  defaultFormData: DownloadFilesContent;
  deleteButton?: JSX.Element;
  handleCloseModal?: () => void;
  onSave?: (activity: RC5ActivityTypeEnum, data: any) => void;
  testId?: string;
  innerSx?: SxProps;
  outerSx?: SxProps;
  outerStyle?: OuterStyle;
}) => {
  const { file: fileUploadHandler } = useAssetUploadHandlers();
  const validationSchema = yup.object().shape({});
  const auDir = useSelector(currentAuPath);

  const [formHeadTitle, setFormHeadTitle] = useState<string>('Files');
  const { getLocalFileBlob, getLocalFileBlobUrl } = useLessonAssets();
  const isDebugId = false;

  /**
   * fileDownloadHandler
   * @param fileData
   * @returns Blob
   */
  const fileDownloadHandler = async (fileData: DownloadFileData) => {
    const theBlob = await getLocalFileBlob(
      `./${ASSET_DIRS.file}/${fileData.path}`,
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
                filePath={`./${ASSET_DIRS.file}/${fileData.path}`}
                getLinkUrl={getLocalFileBlobUrl}
              />
            );
          })}
        </Box>
      )}
      {crudType !== FormCrudType.preview && (
        <FormControlUIProvider>
          <MiniForm
            className="paper-activity"
            contextMenu={contextMenu}
            outerSx={outerSx}
            outerStyle={outerStyle}
            autoSaveDebounceTime={1000}
            dataCache={defaultFormData}
            titleEndChildren={deleteButton}
            doAction={onSaveAction}
            formTitle={formHeadTitle}
            formWidth={null}
            formSxProps={{ width: '100%', flexGrow: 1, ...innerSx, margin: 0 }}
            getFormFields={getFormFields}
            loadingButtonText="Saving"
            shouldAutoSave={crudType === FormCrudType.edit}
            shouldCheckIsDirty={true}
            shouldDisplaySave={false}
            showPaper={false}
            submitButtonText="Save"
            validationSchema={validationSchema}
          />
        </FormControlUIProvider>
      )}
    </>
  );
};
