import React, { ChangeEvent, useContext, useEffect, useState } from 'react';

import {
  closeAudioDialog$,
  saveAudio$,
  audioDialogState$,
  audioFilePath$,
} from './index';

import { useCellValues, usePublisher } from '@mdxeditor/gurx';

// MUI
import { Box, Paper, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import {
  ButtonModalMainUi,
  ComboBoxSelectorUi,
  ModalDialog,
  TextFieldMainUi,
} from '@rapid-cmi5/ui/branded';
import { GitContext } from '../../../course-builder/GitViewer/session/GitContext';

// used for uploading files
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const AUDIO_DIR = './Assets/Audio/';

/**
 * A custom Audio Dialog for audio settings.
 * @constructor
 */
export const AudioDialog: React.FC = () => {
  // local state
  const [src, setSrc] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [audioStyle, setAudioStyle] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [fileOptions, setFileOptions] = useState<string[]>([]);

  const { isFsLoaded, handleGetFolderStructure, handlePathExists } =
    useContext(GitContext);

  // get the state from Gurx
  const [state, audioFilePath] = useCellValues(
    audioDialogState$,
    audioFilePath$,
  );

  // set the initial values based on if the user is inserting a new audio or
  // editing an existing audio
  useEffect(() => {
    if (state.type === 'editing') {
      setSrc(state.initialValues.src ? state.initialValues.src : '');
      setTitle(state.initialValues.title ? state.initialValues.title : '');

      setAudioStyle('');
      if (state.initialValues.rest) {
        const styleAttribute = state.initialValues.rest.find(
          //@ts-ignore
          (attribute) => attribute.name === 'style',
        );
        if (styleAttribute) {
          //@ts-ignore
          setAudioStyle(styleAttribute.value);
        }
      }
    } else {
      setSrc('');
      setTitle('');
      setAudioStyle('');
    }

    // clear the file regardless of the editing state
    setSelectedFiles(null);
  }, [state]);

  // set up publishers, etc.
  const saveAudio = usePublisher(saveAudio$);
  const closeAudioDialog = usePublisher(closeAudioDialog$);

  // the user is canceling the audio so close the dialog window
  const handleCancel = () => {
    closeAudioDialog();
  };

  // the user is submitting the audio, so insert it
  const handleSubmit = () => {
    let restParams: any = [];
    if (audioStyle !== '') {
      restParams = [
        {
          type: 'mdxJsxAttribute',
          name: 'style',
          value: audioStyle,
        },
      ];
    }

    const audioParams: any = {
      file: selectedFiles,
      src: src,
      title: title,
      rest: restParams,
    };

    saveAudio(audioParams);
  };

  // fill in the list of file options
  useEffect(() => {
    const path = audioFilePath;

    async function fetchData() {
      try {
        const treeData = await handleGetFolderStructure(path, true);
        const fileOptions = [];

        // add the current source value
        if (state.type === 'editing' && state.initialValues.src) {
          fileOptions.push(state.initialValues.src.replace(AUDIO_DIR, ''));
        }

        // add the list of files
        for (let i = 0; i < treeData.length; i++) {
          const audioName = treeData[i].name;
          if (fileOptions[0] !== audioName) {
            // don't add if already added as initial value
            fileOptions.push(audioName);
          }
        }
        setFileOptions(fileOptions);
      } catch (error) {
        // Directory doesn't exist yet - this is okay, it will be created when first audio is uploaded
        console.debug('Audio directory does not exist yet:', path);
        setFileOptions([]);
      }
    }

    fetchData();
  }, [audioFilePath, src, state.type]);

  // handle file selection
  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      setSelectedFiles(fileList);
      if (fileList.length > 0) {
        setTitle(fileList[0].name.replace(/\.[^/.]+$/, '')); // removes file extension
      }
    } else {
      setSelectedFiles(null);
    }
  };

  // don't open the dialog unless appropriate
  if (state.type === 'inactive') {
    return null;
  }

  // the dialog is open, so show the form
  return (
    <>
      <ModalDialog
        title={state.type === 'editing' ? 'Edit Audio' : 'Insert Audio'}
        buttons={['Cancel', state.type === 'editing' ? 'apply' : 'insert']}
        dialogProps={{
          open: true,
        }}
        handleAction={(index: number) => {
          if (index === 0) {
            handleCancel();
          } else {
            handleSubmit();
          }
        }}
      >
        <>
          <Stack spacing={2}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
              }}
            >
              <Stack spacing={2}>
                {/* Files upload section */}
                <Stack direction="row" spacing={2}>
                  <ButtonModalMainUi
                    component="label"
                    role={undefined}
                    tabIndex={-1}
                    startIcon={<UploadFileIcon />}
                  >
                    Upload Files
                    <VisuallyHiddenInput
                      type="file"
                      accept="audio/*" // restrict to audio files only
                      onChange={handleFileSelected}
                      multiple
                    />
                  </ButtonModalMainUi>
                  <Box /* vertically center the text */
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption" align="center">
                      {selectedFiles && selectedFiles.length > 0 ? (
                        <Box component="span">
                          {Array.from(selectedFiles).map(
                            (file: File, index: number) => (
                              <span key={file.name}>
                                {file.name}
                                {index < selectedFiles.length - 1 && ', '}
                              </span>
                            ),
                          )}
                        </Box>
                      ) : (
                        'No file(s) chosen'
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>

            {/* URL section */}
            <ComboBoxSelectorUi
              label="Audio"
              id="audio"
              options={fileOptions}
              defaultValue={src.replace(AUDIO_DIR, '')}
              showAllOptions={true}
              autocompleteProps={{
                freeSolo: true,
              }}
              onSelect={(selectionValue: any) => {
                if (selectionValue.startsWith('http')) {
                  // if this is not a file system audio
                  setSrc(selectionValue);
                } else {
                  setSrc(`${AUDIO_DIR}${selectionValue}`);
                  setTitle(selectionValue.replace(/\.[^/.]+$/, '')); // removes file extension
                }
              }}
              infoText={`Specify URL or choose from uploaded files. Audio files that appear here can be found in Course Files. Expand the lesson folder and look for 'Assets/Audio'.`}
            />

            {/* Title section */}
            <TextFieldMainUi
              autoFocus
              margin="dense"
              label="Title"
              name="audio-title"
              type="text"
              fullWidth
              value={title}
              onChange={(textValue: string) => setTitle(textValue)}
              infoText={'Audio Tooltip Text'}
            />

            {/* Style section */}
            <TextFieldMainUi
              margin="dense"
              label="Styles"
              name="audio-styles"
              type="text"
              fullWidth
              value={audioStyle}
              onChange={(textValue: string) => setAudioStyle(textValue)}
              infoText="Inline styles Ex. border-radius:8px;"
            />
          </Stack>
        </>
      </ModalDialog>
    </>
  );
};
