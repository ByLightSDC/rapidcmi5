import React, { ChangeEvent, useEffect, useState } from 'react';

import {
  closeVideoDialog$,
  saveVideo$,
  videoDialogState$,
  videoFilePath$,
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
import { alpha, styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import {
  ButtonModalMainUi,
  ComboBoxSelectorUi,
  debugLogError,
  ModalDialog,
  TextFieldMainUi,
  ViewExpander,
} from '@rapid-cmi5/ui';
import { useLessonAssets } from '../../../../contexts/LessonAssetsContext';

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

const VIDEO_DIR = './Assets/Videos/';

/**
 * A custom Video Dialog for video settings.
 * @constructor
 */
export const VideoDialog: React.FC = () => {
  // local state
  const [src, setSrc] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [videoStyle, setVideoStyle] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [fileOptions, setFileOptions] = useState<string[]>([]);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [autoplay, setAutoplay] = useState<boolean>(false);
  const { getAllAssets } = useLessonAssets();
  const [captionSrc, setCaptionSrc] = useState<string>('');
  const [selectedCaptionFiles, setSelectedCaptionFiles] =
    useState<FileList | null>(null);
  const [captionFileOptions, setCaptionFileOptions] = useState<string[]>([]);
  const [dialogOpenCount, setDialogOpenCount] = useState(0);
  const theme = useTheme();

  // get the state from Gurx
  const [state, videoFilePath] = useCellValues(
    videoDialogState$,
    videoFilePath$,
  );

  // set the initial values based on if the user is inserting a new video or
  // editing an existing video
  useEffect(() => {
    if (state.type === 'editing') {
      setSrc(state.initialValues.src ? state.initialValues.src : '');
      setTitle(state.initialValues.title ? state.initialValues.title : '');

      setVideoStyle('');
      setWidth(state.initialValues.width?.toString() ?? '');
      setHeight(state.initialValues.height?.toString() ?? '');
      setAutoplay(state.initialValues.autoplay ?? false);
      setCaptionSrc(state.initialValues.captionSrc ?? '');
      setDialogOpenCount((c) => c + 1);
      if (state.initialValues.rest) {
        const styleAttribute = state.initialValues.rest.find(
          //@ts-ignore
          (attribute) => attribute.name === 'style',
        );
        if (styleAttribute) {
          //@ts-ignore
          setVideoStyle(styleAttribute.value);
        }
      }
    } else {
      setSrc('');
      setTitle('');
      setVideoStyle('');
      setWidth('');
      setHeight('');
      setAutoplay(false);
      setCaptionSrc('');
      setDialogOpenCount((c) => c + 1);
    }

    // clear the files regardless of the editing state
    setSelectedFiles(null);
    setSelectedCaptionFiles(null);
  }, [state]);

  // set up publishers, etc.
  const saveVideo = usePublisher(saveVideo$);
  const closeVideoDialog = usePublisher(closeVideoDialog$);

  // the user is canceling the video so close the dialog window
  const handleCancel = () => {
    closeVideoDialog();
  };

  // the user is submitting the video, so insert it
  const handleSubmit = () => {
    let restParams: any = [];
    if (videoStyle !== '') {
      restParams = [
        {
          type: 'mdxJsxAttribute',
          name: 'style',
          value: videoStyle,
        },
      ];
    }

    const videoParams: any = {
      file: selectedFiles,
      src: src,
      title: title,
      rest: restParams,
      width: width ? parseInt(width, 10) : undefined,
      height: height ? parseInt(height, 10) : undefined,
      autoplay: autoplay,
      captionSrc: captionSrc || undefined,
      captionFile: selectedCaptionFiles,
    };

    saveVideo(videoParams);
  };

  // fill in the list of file options
  useEffect(() => {
    async function fetchData() {
      try {
        const files = await getAllAssets('video');
        // add the current source value
        if (state.type === 'editing' && state.initialValues.src) {
          files.push(state.initialValues.src.replace(VIDEO_DIR, ''));
        }

        // ensure unique
        const videoFiles = [...new Set(files)];
        setFileOptions(videoFiles);
      } catch (error) {
        // Directory doesn't exist yet - this is okay, it will be created when first video is uploaded
        setFileOptions([]);
      }
    }

    fetchData().catch((err) => {
      debugLogError(`Could not fetch video data ${err}`);
    });
  }, [src, state.type]);

  // fetch available .vtt caption files from the same video directory
  useEffect(() => {
    async function fetchCaptionFiles() {
      try {
        const files = await getAllAssets('video');

        if (state.type === 'editing' && state.initialValues.captionSrc) {
          files.push(state.initialValues.captionSrc.replace(VIDEO_DIR, ''));
        }

        // ensure files are unique
        const vttFiles = [
          ...new Set(files.filter((name) => name.endsWith('.vtt'))),
        ];

        setCaptionFileOptions(vttFiles);
      } catch {
        setCaptionFileOptions([]);
      }
    }

    fetchCaptionFiles().catch((err) => {
      debugLogError(`Could not fetch video caption data ${err}`);
    });
  }, [videoFilePath, state.type]);

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
        title={state.type === 'editing' ? 'Edit Video' : 'Insert Video'}
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
          {/* <Stack spacing={2}> */}
          <Grid container alignItems="center" sx={{ width: '100%' }}>
            <Grid size={12} sx={{ mb: 1 }}>
              {/* Files upload section */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor: alpha((theme as any).input.fill, 1.0),
                }}
              >
                <Stack direction="column">
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mb: 2, width: '100%' }}
                  >
                    <ButtonModalMainUi
                      component="label"
                      role={undefined}
                      tabIndex={-1}
                      startIcon={<UploadFileIcon />}
                    >
                      Upload File
                      <VisuallyHiddenInput
                        type="file"
                        accept="video/*" // restrict to video files only
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
                          'No video file chosen'
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                  {/* URL section */}
                  <ComboBoxSelectorUi
                    label="Video"
                    id="video"
                    options={fileOptions}
                    defaultValue={src.replace(VIDEO_DIR, '')}
                    showAllOptions={true}
                    autocompleteProps={{
                      freeSolo: true,
                    }}
                    onSelect={(selectionValue: any) => {
                      if (selectionValue.startsWith('http')) {
                        // if this is not a file system video
                        setSrc(selectionValue);
                      } else {
                        setSrc(`${VIDEO_DIR}${selectionValue}`);
                        setTitle(selectionValue.replace(/\.[^/.]+$/, '')); // removes file extension
                      }
                    }}
                    infoText={`Specify URL or choose from uploaded files. Videos that appear here can be found in Course Files. Expand the lesson folder and look for 'Assets/Videos'.`}
                  />
                </Stack>
              </Paper>
            </Grid>

            <Grid size={0.2} />
            {/* Autoplay section */}
            <Grid size={2.6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoplay}
                    onChange={(e) => setAutoplay(e.target.checked)}
                    name="video-autoplay"
                  />
                }
                label="Autoplay"
              />
            </Grid>
            {/* Width/Height section */}

            <Grid size={4.5}>
              <TextFieldMainUi
                margin="dense"
                label="Width (px)"
                name="video-width"
                type="number"
                value={width}
                onChange={(textValue: string) => setWidth(textValue)}
                infoText={'Optional video width in pixels'}
              />
            </Grid>
            <Grid size={4.5}>
              <TextFieldMainUi
                margin="dense"
                label="Height (px)"
                name="video-height"
                type="number"
                value={height}
                onChange={(textValue: string) => setHeight(textValue)}
                infoText={'Optional video height in pixels'}
              />
            </Grid>

            {/* Captions section */}
            <Grid size={12} sx={{ mt: 2 }}>
              <ViewExpander
                headerSxProps={{ p: '2px', mt: '2px' }}
                title="Accessibility"
                titleVariant="body1"
                //titleSxProps={{ fontWeight: 600 }}
                defaultIsExpanded={false}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 0,
                    borderRadius: 2,
                    backgroundColor: alpha((theme as any).input.fill, 1.0),
                    // backgroundColor: alpha(theme.palette.background.paper, .8),
                    mb: 2,
                  }}
                >
                  <Stack spacing={2} sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2}>
                      <ButtonModalMainUi
                        component="label"
                        role={undefined}
                        tabIndex={-1}
                        startIcon={<UploadFileIcon />}
                      >
                        Upload .vtt File
                        <VisuallyHiddenInput
                          type="file"
                          accept=".vtt"
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const fileList = e.target.files;
                            if (fileList && fileList.length > 0) {
                              setSelectedCaptionFiles(fileList);
                              setCaptionSrc(`${VIDEO_DIR}${fileList[0].name}`);
                            } else {
                              setSelectedCaptionFiles(null);
                            }
                          }}
                        />
                      </ButtonModalMainUi>
                    </Stack>
                    <ComboBoxSelectorUi
                      key={dialogOpenCount}
                      label="Captions File (.vtt)"
                      id="caption-src"
                      options={captionFileOptions}
                      defaultValue={captionSrc.replace(VIDEO_DIR, '')}
                      showAllOptions={true}
                      autocompleteProps={{
                        freeSolo: true,
                      }}
                      onSelect={(selectionValue: any) => {
                        if (!selectionValue) {
                          setCaptionSrc('');
                        } else if (
                          selectionValue.startsWith('http') ||
                          selectionValue.startsWith('./')
                        ) {
                          setCaptionSrc(selectionValue);
                        } else {
                          setCaptionSrc(`${VIDEO_DIR}${selectionValue}`);
                        }
                      }}
                      infoText="Select or specify a WebVTT (.vtt) caption file for accessibility."
                    />

                    {/* Title section */}
                    <TextFieldMainUi
                      autoFocus
                      margin="dense"
                      label="Video Tooltip Title"
                      name="video-title"
                      type="text"
                      fullWidth
                      value={title}
                      onChange={(textValue: string) => setTitle(textValue)}
                      //infoText={'Video Tooltip Text'}
                    />
                  </Stack>
                </Paper>
              </ViewExpander>
            </Grid>
            {/* Style section */}
            <Grid size={12} sx={{ mt: 2 }}>
              <TextFieldMainUi
                margin="dense"
                label="Styles"
                name="video-styles"
                type="text"
                fullWidth
                value={videoStyle}
                onChange={(textValue: string) => setVideoStyle(textValue)}
                infoText="Inline styles Ex. border-radius:8px;"
              />
            </Grid>
          </Grid>
        </>
      </ModalDialog>
    </>
  );
};
