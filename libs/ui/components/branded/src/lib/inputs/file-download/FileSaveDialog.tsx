import download from 'js-file-download';
import { useDispatch, useSelector } from 'react-redux';
import { modal, setModal } from '@rapid-cmi5/ui/redux';

/* Branded */
import { AlertColor, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import ModalDialog from '../../modals/ModalDialog';

export const saveFileModalId = 'saveFileModalId';

type tFileSaveProps = {
  buttons?: string[];
  saveStr: string;
  defaultFileName?: string;
  saveFormatStr?: string;
  saveMessage?: string;
  saveTitle?: string;
  titleSeverity?: AlertColor;
};

/**
 * Presents a save dialog
 * Saves a file to downloads folder on users desktop
 * @param {{(fileName: string) => string}} applyNameToSaveStr method to pass final string through in cases where you need to inject file name specified into content being saved
 * @return {JSX.Element} React Component
 */
export function FileSaveDialog({
  applyNameToSaveStr,
  onClose,
}: {
  applyNameToSaveStr?: (fileName: string) => string;
  onClose?: (meta: any) => void;
}) {
  const dispatch = useDispatch();
  const modalObj = useSelector(modal);

  const meta: tFileSaveProps = modalObj.meta;
  const saveStr = meta?.saveStr;
  const buttonTexts = meta?.buttons || ['Cancel', 'Save'];
  const defaultFileName = meta?.defaultFileName || 'myFile';
  const saveFormatStr = meta?.saveFormatStr || 'application/json;charset=utf-8';
  const saveMessage = meta?.saveMessage || 'File will be saved to downloads';
  const saveTitle = meta?.saveTitle || 'Save File';
  const [fileNamed, setFileNamed] = useState<string>(defaultFileName);

  const handleSaveAction = (buttonIndex: number) => {
    if (buttonIndex === 1) {
      if (!fileNamed) {
        console.log('missing file name');
        return;
      }
      const finalFileName =
        fileNamed.indexOf('.') >= 0 ? fileNamed : fileNamed + '.json';

      let finalSaveStr = saveStr;
      if (applyNameToSaveStr) {
        finalSaveStr = applyNameToSaveStr(fileNamed);
      }
      const bytes = new TextEncoder().encode(finalSaveStr);
      const blob = new Blob([bytes], {
        type: saveFormatStr,
      });

      download(blob, finalFileName);
    }
    dispatch(setModal({ type: '', id: null, name: null }));
    if (onClose) {
      onClose(meta);
    }
  };

  /**UE updates file name when default changes */
  useEffect(() => {
    setFileNamed(defaultFileName);
  }, [defaultFileName]);

  return (
    <div data-testid="modals">
      {modalObj.type !== '' && (
        <ModalDialog
          testId={saveFileModalId}
          buttons={buttonTexts}
          dialogProps={{ open: modalObj.type === saveFileModalId }}
          message={saveMessage}
          title={saveTitle}
          titleSeverity={meta?.titleSeverity}
          handleAction={handleSaveAction}
          maxWidth="xs"
        >
          <TextField
            autoComplete="off"
            sx={{
              marginTop: '12px',
              marginLeft: '12px',
              marginRIght: '12px',
              borderRadius: '4px',
              //...sxProps,
            }}
            //InputLabelProps={{ shrink: false }} // dont show label
            label="File Name"
            defaultValue={defaultFileName}
            value={fileNamed}
            margin="dense"
            variant="outlined"
            size="small"
            spellCheck={false}
            multiline={false}
            placeholder={defaultFileName}
            onChange={(event) => {
              setFileNamed(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.code === 'Enter') {
                event.preventDefault();
                handleSaveAction(1);
              }
            }}
          />
        </ModalDialog>
      )}
    </div>
  );
}

export default FileSaveDialog;
