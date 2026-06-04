import React, { ChangeEvent, useEffect, useState } from 'react';

import {
  closeAudioDialog$,
  saveAudio$,
  audioDialogState$,
  audioFilePath$,
} from './index';

import { useCellValues, usePublisher } from '@mdxeditor/gurx';

// MUI
import {
  Box,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import {
  ButtonModalMainUi,
  ComboBoxSelectorUi,
  debugLogError,
  ModalDialog,
  TextFieldMainUi,
} from '@rapid-cmi5/ui';
import { useLessonAssets } from '../../../course-builder/GitViewer/session/LessonAssetsContext';

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
  const [autoplay, setAutoplay] = useState<boolean>(false);


  const { getAllAssets } = useLessonAssets();
  const [captionSrc, setCaptionSrc] = useState<string>('');
  const [selectedCaptionFiles, setSelectedCaptionFiles] = useState<FileList | null>(null);
  const [captionFileOptions, setCaptionFileOptions] = useState<string[]>([]);



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
      setAutoplay(state.initialValues.autoplay ?? false);
      setCaptionSrc(state.initialValues.captionSrc ?? '');
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
      setAutoplay(false);
      setCaptionSrc('');
    }

    // clear files regardless of editing state
    setSelectedFiles(null);
    setSelectedCaptionFiles(null);
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
      autoplay: autoplay,
      captionSrc: captionSrc || undefined,
      captionFile: selectedCaptionFiles,
    };

    saveAudio(audioParams);
  };

  // fill in the list of file options
  useEffect(() => {
    const path = audioFilePath;

    async function fetchData() {
      try {
        // add the current source value
        const files = await getAllAssets('audio');

        if (state.type === 'editing' && state.initialValues.src) {
          files.push(state.initialValues.src.replace(AUDIO_DIR, ''));
        }
        // ensure unique
        const audioFiles = [...new Set(files)];

        setFileOptions(audioFiles);
      } catch (error) {
        // Directory doesn't exist yet - this is okay, it will be created when first audio is uploaded
        console.debug('Audio directory does not exist yet:', path);
        setFileOptions([]);
      }
    }

    fetchData().catch((err) => {
      debugLogError(`Could not fetch audio data ${err}`);
    });
  }, [audioFilePath, src, state.type]);

  // fetch available .vtt files from the audio directory
  useEffect(() => {
    async function fetchVttFiles() {
      try {
        const files = await getAllAssets('audio');

        if (state.type === 'editing' && state.initialValues.captionSrc) {
          files.push(state.initialValues.captionSrc.replace(AUDIO_DIR, ''));
        }

        const vttOptions = [
          ...new Set(files.filter((fileName) => fileName.endsWith('.vtt'))),
        ];

        setCaptionFileOptions(vttOptions);
      } catch {
        setCaptionFileOptions([]);
      }
    }

    void fetchVttFiles();
  }, [audioFilePath, state.type]);

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

  const handleCaptionFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      setSelectedCaptionFiles(fileList);
      setCaptionSrc(`${AUDIO_DIR}${fileList[0].name}`);
    } else {
      setSelectedCaptionFiles(null);
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
                    Upload File
                    <VisuallyHiddenInput
                      type="file"
                      accept="audio/*" // restrict to audio files only
                      onChange={handleFileSelected}
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
                        'No audio file chosen'
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

            {/* Caption / Transcript (VTT) section */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle2">Transcript / Captions (VTT)</Typography>
                <Stack direction="row" spacing={2}>
                  <ButtonModalMainUi
                    component="label"
                    role={undefined}
                    tabIndex={-1}
                    startIcon={<UploadFileIcon />}
                  >
                    Upload VTT
                    <VisuallyHiddenInput
                      type="file"
                      accept=".vtt"
                      onChange={handleCaptionFileSelected}
                    />
                  </ButtonModalMainUi>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption">
                      {selectedCaptionFiles && selectedCaptionFiles.length > 0
                        ? selectedCaptionFiles[0].name
                        : 'No VTT file chosen'}
                    </Typography>
                  </Box>
                </Stack>
                <ComboBoxSelectorUi
                  label="Caption File"
                  id="audio-caption"
                  options={captionFileOptions}
                  defaultValue={captionSrc.replace(AUDIO_DIR, '')}
                  showAllOptions={true}
                  autocompleteProps={{ freeSolo: true }}
                  onSelect={(selectionValue: any) => {
                    if (!selectionValue) {
                      setCaptionSrc('');
                    } else if (selectionValue.startsWith('http')) {
                      setCaptionSrc(selectionValue);
                    } else {
                      setCaptionSrc(`${AUDIO_DIR}${selectionValue}`);
                    }
                  }}
                  infoText="Associate a WebVTT (.vtt) transcript file with this audio. The transcript will be displayed below the audio player."
                />
              </Stack>
            </Paper>

            {/* Autoplay section */}
            <FormControlLabel
              control={
                <Switch
                  checked={autoplay}
                  onChange={(e) => setAutoplay(e.target.checked)}
                  name="audio-autoplay"
                />
              }
              label="Autoplay"
            />
          </Stack>
        </>
      </ModalDialog>
    </>
  );
};
