import download from 'js-file-download';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { modal, setModal, themeColor, setTheme } from '@rapid-cmi5/ui/redux';


import { TextField } from '@mui/material';
import { useState } from 'react';
import ModalDialog from '../../modals/ModalDialog';
import { FileUpload } from '../file-upload/FileUpload';

export const importFileModalId = 'importFileModalId';

/**
 * Verifies whether file chosen is a valid format for import
 * @param {string} body Text to be verified
 * @param {any} fileFormatData File selected
 * @return {boolean} Whether file is valid for import
 */
export const getIsValidExport = (body: string, fileFormatData: any) => {
  //TODO
  return true;
};

export function FileImportDialog({
  handleImport,
  message = 'This will replace any data in your current plan with data from the imported file.',
  title = 'Import File',
  modalId = importFileModalId,
}: {
  handleImport: (body: any, fileFormData: any) => void;
  message?: string;
  modalId?: string;
  title?: string;
}) {
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [fileImportError, setFileImportError] = useState<any>(null);
  const [fileFormData, setFileFormData] = useState<any>(null);
  const [isImporting] = useState(false);
  const [percentComplete, setPercentComplete] = useState(0);

  const dispatch = useDispatch();
  const modalObj = useSelector(modal);
  const fileButtonTitle = modalObj.meta?.fileButtonTitle || 'Select File ...';
  const fileTypes = modalObj.meta?.fileTypes || '.json';

  const noFileSelectedMessage =
    modalObj.meta?.noFileSelectedMessage || 'No file selected';

  const handleImportAction = (buttonIndex: number) => {
    if (buttonIndex === 1) {
      // if (!getIsValidFileType(fileFormData.type)) {
      //     setFileImportError('File type not supported');
      //   }
      setFileImportError('');
      const reader = new FileReader();
      reader.readAsText(fileFormData);
      const errMsg = null;
      reader.onload = (evt: any) => {
        try {
          const body = evt.target.result;
          if (getIsValidExport(body, fileFormData)) {
            if (handleImport) {
              handleImport(body, fileFormData);
              setFileImportError(errMsg);
            }
          } else {
            setFileImportError('Unrecognized format');
          }
        } catch (e: any) {
          const errMsg = e.message;
          setFileImportError(errMsg);
        }
      };
    }
    dispatch(setModal({ type: '', id: null, name: null }));
  };

  return (
    <div data-testid="modals">
      {modalObj.type !== '' && (
        <ModalDialog
          testId={modalId}
          buttons={['Cancel', 'Import']}
          dialogProps={{ open: modalObj.type === modalId }}
          message={message}
          title={title}
          handleAction={handleImportAction}
          maxWidth="xs"
        >
          <FileUpload
            buttonTitle={fileButtonTitle}
            dataCache={fileFormData}
            fileTypes={fileTypes}
            isUploading={isImporting}
            noFileSelectedMessage={noFileSelectedMessage}
            percentLoaded={percentComplete}
            testId={modalId}
            onFileSelected={(file, selected) => {
              setFileImportError('');
              setIsFileSelected(selected);
              if (file && selected) {
                setFileFormData(file);
              } else {
                setFileFormData(null);
              }
            }}
          />
        </ModalDialog>
      )}
    </div>
  );
}

export default FileImportDialog;
