import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import ModalDialog from '../../modals/ModalDialog';
import { FileUpload } from '../file-upload/FileUpload';
import { modal, setModal } from '../../redux/commonAppReducer';

export const importFileModalId = 'importFileModalId';

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
  const [fileFormData, setFileFormData] = useState<any>(null);
  const [isImporting] = useState(false);

  const dispatch = useDispatch();
  const modalObj = useSelector(modal);
  const fileButtonTitle = modalObj.meta?.fileButtonTitle || 'Select File ...';
  const fileTypes = modalObj.meta?.fileTypes || '.json';

  const noFileSelectedMessage =
    modalObj.meta?.noFileSelectedMessage || 'No file selected';

  const handleImportAction = (buttonIndex: number) => {
    if (buttonIndex === 1) {
 
      const reader = new FileReader();
      reader.readAsText(fileFormData);
      reader.onload = (evt: any) => {
        try {
          const body = evt.target.result;
            if (handleImport) {
              handleImport(body, fileFormData);
            }
          
        } catch (e: any) {
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
            testId={modalId}
            onFileSelected={(file, selected) => {
             
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
