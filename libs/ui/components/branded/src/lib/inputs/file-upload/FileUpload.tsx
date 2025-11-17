/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';

/* MUI */
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

/* Branded */
import {
  ButtonModalCancelUi,
  ButtonModalMinorUi,
} from '../buttons/buttonsmodal';
import { SxProps } from '@mui/system';

// Choose between folder or file upload with the onFileSelected or onFolderSelected functions
type tFileUploadProps = {
  buttonTitle?: string;
  buttonEmphasis?: boolean;
  dataCache?: File[];
  noFileSelectedMessage?: string;
  enabled?: boolean;
  fileTypes?: string;
  isUploading?: boolean;
  percentLoaded?: number;
  sxProps?: SxProps;
  testId?: string;
  onFileSelected?: (files: File, selected: boolean, testId?: string) => void;
  onFolderSelected?: (
    files: File[],
    selected: boolean,
    testId?: string,
  ) => void;
};

export function FileUpload({
  dataCache,
  buttonTitle = 'Select File ...',
  buttonEmphasis = true,
  noFileSelectedMessage = 'No file selected',
  enabled = true,
  fileTypes = '.zip',
  isUploading = false,
  percentLoaded = 0,
  sxProps = {},
  testId = 'file-upload',
  onFileSelected,
  onFolderSelected,
}: tFileUploadProps) {
  const [fileNames, setFileNames] = useState<String[]>([noFileSelectedMessage]);
  const [selectedFile, setSelectedFile] = useState<File | File[] | null>(null);

  useEffect(() => {
    if (dataCache?.length) {
      handleFileSelection(dataCache);
    }
  }, [dataCache]);

  const handleFileSelection = (files: File[]) => {
    if (files === null) {
      setSelectedFile(null);
      setFileNames([noFileSelectedMessage]);
      return;
    }

    if (onFileSelected) {
      const file = files[0];
      onFileSelected(file, true, testId);
      setSelectedFile(file);
      setFileNames([file.name]);
    } else if (onFolderSelected) {
      onFolderSelected(files, true, testId);
      setSelectedFile(files);
      setFileNames(files.map((file) => file.name));
    }
  };

  const onFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length < 1) return;

    const fileArray = Array.from(files);
    if (!fileArray || fileArray.length < 1) return;

    handleFileSelection(fileArray);

    // you can extend this to handle all files if needed
    e.target.value = ''; // allow same file re-selection
  };

  const ButtonComponent = buttonEmphasis
    ? ButtonModalMinorUi
    : ButtonModalCancelUi;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        backgroundColor: (theme: any) => `${theme.input.fill}`,
        border: '1px solid',
        borderRadius: '4px',
        borderColor: (theme: any) => `${theme.input.outlineColor}`,
        maxHeight: '200px',
        padding: '8px',
        textAlign: 'center',
        ...sxProps,
      }}
    >
      <div>
        {isUploading === true ? (
          <Box display="flex" alignItems="center" sx={{ minWidth: '300px' }}>
            <Box width="100%" mr={1}>
              <LinearProgress
                id="import-linear-progress"
                variant="determinate"
                value={percentLoaded}
              />
            </Box>
            <Box minWidth={35}>
              <Typography variant="body2" color="textSecondary">
                {percentLoaded + '%'}
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            {
              <ButtonComponent
                type={!selectedFile ? 'button' : undefined}
                disabled={!enabled}
                startIcon={null}
                onClick={() =>
                  document.getElementById(`${testId}-input`)?.click()
                }
              >
                {buttonTitle}
              </ButtonComponent>
            }
            <input
              type="file"
              name="file"
              data-testid={testId}
              id={`${testId}-input`}
              accept={fileTypes}
              onChange={onFileSelection}
              style={{ display: 'none' }}
              multiple={!!onFolderSelected}
              {...(onFolderSelected
                ? {
                    webkitdirectory: 'true',
                    mozdirectory: 'true',
                    directory: 'true',
                  }
                : {})}
            />
          </>
        )}

        <Box
          sx={{
            maxHeight: '100px',
            overflowY: 'auto',
            marginTop: '8px',
          }}
        >
          {fileNames.map((fileName, idx) => (
            <Typography
              data-testid="file-name"
              variant="body2"
              textAlign={'left'}
              style={{ marginTop: '8px' }}
              key={idx}
            >
              {fileName}
            </Typography>
          ))}
        </Box>
      </div>
    </Box>
  );
}
export default FileUpload;
