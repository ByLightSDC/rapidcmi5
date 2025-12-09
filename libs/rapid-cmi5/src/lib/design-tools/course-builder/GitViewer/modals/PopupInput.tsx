import {
  Popover,
  TextField,
  Box,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import { ButtonInfoField, ButtonInfoFormHeaderLayout, useToaster } from '@rangeos-nx/ui/api/hooks';
import {
  ButtonModalCancelUi,
  ButtonModalMainUi,
  FileUpload,
} from '@rangeos-nx/ui/branded';
import { dirname } from 'path-browserify';
import { useEffect, useState } from 'react';

interface PopupInputProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSubmit: (name: string, fileData?: string | Uint8Array) => void;
  onCreateFile: (name: string, fileData: string | Uint8Array) => void;
  onCreateFolder: (name: string) => void;
  type: 'file' | 'dir';
}

const PopupInput: React.FC<PopupInputProps> = ({
  anchorEl,
  onClose,
  onSubmit,
  onCreateFile,
  onCreateFolder,
  type,
}) => {
  const [name, setName] = useState('');
  const [fileFormData, setFileFormData] = useState<File | null>(null);
  const [folderFormData, setFolderFormData] = useState<File[]>([]);

  const [percentComplete, setPercentComplete] = useState(0);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [isFolderSelected, setIsFolderSelected] = useState(false);
  const displayToaster = useToaster();

  useEffect(() => {
    //console.log(folderFormData);
  }, [folderFormData]);
  /**
   * If a file was imported, add it to the project,
   * Otherwise create a new blank file
   * @returns
   */
  const resetState = () => {
    setName('');
    setFileFormData(null);
    setFolderFormData([]);
    setIsFileSelected(false);
    setIsFolderSelected(false);
    setPercentComplete(0);
    onClose();
  };
  const handleSubmit = () => {
    if (!name?.trim()) {
      displayToaster({
        autoHideDuration: 5000,
        message: 'Please enter a name for the file / folder',
        severity: 'error',
      });
      return;
    }
    if (isFileSelected) {
      if (fileFormData) {
        const fileReader = new FileReader();
        fileReader.onload = function (event: any) {
          if (fileReader.result) {
            const imgData = new Uint8Array(fileReader.result as ArrayBuffer);
            onCreateFile(name, imgData);
          }
        };
        fileReader.readAsArrayBuffer(fileFormData);
      }
      resetState();
      return;
    } else if (isFolderSelected) {
      onCreateFolder(name);
      if (folderFormData) {
        for (const subfileFormData of folderFormData) {
          const fileReader = new FileReader();
          fileReader.onload = function (event: any) {
            if (fileReader.result) {
              const imgData = new Uint8Array(fileReader.result as ArrayBuffer);
              onCreateFile(`${name}/${subfileFormData.name}`, imgData);
            }
          };
          fileReader.readAsArrayBuffer(subfileFormData);
        }
      }

      resetState();

      return;
    }
    // There was no upload, just an empty file or folder has been created
    else if (name.trim()) {
      onSubmit(name);

      resetState();
    }
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={resetState}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{
        onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
          e.stopPropagation(),
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) =>
          e.stopPropagation(),
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          borderColor: '#333',
          borderStyle: 'solid',
          borderWidth: '1px',
        }}
        onClick={(e) => e.stopPropagation()} // Prevent click events from affecting the parent
        onKeyDown={(e) => e.stopPropagation()} // Prevent keydown events from affecting the parent
      >
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <Typography variant="h4">
            {type === 'file' ? 'Create File' : 'Create Folder'}
          </Typography>
          {type === 'file' && (
            <ButtonInfoField
              name="info"
              message={
                <Stack
                  direction="column"
                  sx={{
                    display: 'flex',
                    marginLeft: '8px',
                  }}
                >
                  <Typography variant="caption" sx={{ whiteSpace: 'pre' }}>
                    Create New File <br />
                    1. Enter file Name
                    <br />
                    2. Click SAVE
                    <br />
                    OR
                    <br />
                    Import Existing File <br />
                    1. Click IMPORT... and select file
                    <br />
                    2. Click SAVE
                    <br />
                    <br />
                    You can also drag and drop files from your desktop into
                    folders.
                    <br />
                  </Typography>
                </Stack>
              }
              props={{ sx: ButtonInfoFormHeaderLayout }}
              triggerOnClick={true}
            />
          )}
        </Stack>
        <TextField
          autoFocus
          size="small"
          variant="outlined"
          placeholder={`Enter ${type} name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
          sx={{ width: '180px' }}
        />
        <FileUpload
          buttonEmphasis={false}
          buttonTitle="Import..."
          dataCache={fileFormData ? [fileFormData] : []}
          fileTypes=".png,.txt,.json,.jpg,.zip"
          isUploading={false}
          noFileSelectedMessage=""
          percentLoaded={percentComplete}
          {...(type === 'file'
            ? {
                onFileSelected: (file: File, selected: boolean) => {
                  setIsFileSelected(selected);
                  if (file && selected) {
                    setFileFormData(file);
                    if (name === '' || name === undefined) {
                      setName(file.name);
                    }
                  }
                },
              }
            : {
                onFolderSelected: (files: File[], selected: boolean) => {
                  setIsFolderSelected(selected);
                  if (files && selected && files.length > 0) {
                    setFolderFormData(files);

                    if (name === '' || name === undefined) {
                      const firstFile = files[0];
                      const folderName = dirname(firstFile.webkitRelativePath);
                      setName(folderName);
                    }
                  }
                },
              })}
        />

        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}
          onClick={(e) => e.stopPropagation()} // Ensure button clicks don't affect parent
        >
          <ButtonModalCancelUi onClick={resetState}>Cancel</ButtonModalCancelUi>
          <ButtonModalMainUi onClick={handleSubmit}>Save</ButtonModalMainUi>
        </Box>
      </Box>
    </Popover>
  );
};

export default PopupInput;
