import React, { ChangeEvent, useContext, useEffect, useState } from 'react';

import {
  closeVideoDialog$,
  saveVideo$,
  videoDialogState$,
  videoFilePath$,
} from './index';

import { useCellValues, usePublisher } from '@mdxeditor/gurx';

// MUI
import { Box, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import EditIcon from '@mui/icons-material/Edit';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import {
  ButtonModalMainUi,
  ComboBoxSelectorUi,
  ModalDialog,
  TextFieldMainUi,
} from '@rangeos-nx/ui/branded';
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
  const { handleGetFolderStructure } = useContext(GitContext);

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
    }

    // clear the file regardless of the editing state
    setSelectedFiles(null);
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
    };

    saveVideo(videoParams);
  };

  // fill in the list of file options
  useEffect(() => {
    const path = videoFilePath;

    async function fetchData() {
      try {
        const treeData = await handleGetFolderStructure(path, true);
        const fileOptions = [];

        // add the current source value
        if (state.type === 'editing' && state.initialValues.src) {
          fileOptions.push(state.initialValues.src.replace(VIDEO_DIR, ''));
        }

        // add the list of files
        for (let i = 0; i < treeData.length; i++) {
          const videoName = treeData[i].name;
          if (fileOptions[0] !== videoName) {
            // don't add if already added as initial value
            fileOptions.push(videoName);
          }
        }
        setFileOptions(fileOptions);
      } catch (error) {
        // Directory doesn't exist yet - this is okay, it will be created when first video is uploaded
        console.debug('Video directory does not exist yet:', path);
        setFileOptions([]);
      }
    }

    fetchData();
  }, [videoFilePath, src, state.type]);

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
                      accept="video/*" // restrict to video files only
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

            {/* Title section */}
            <TextFieldMainUi
              autoFocus
              margin="dense"
              label="Title"
              name="video-title"
              type="text"
              fullWidth
              value={title}
              onChange={(textValue: string) => setTitle(textValue)}
              infoText={'Video Tooltip Text'}
            />

            {/* Width/Height section */}
            <Grid container alignItems="center">
              <Grid item xs={6}>
                <TextFieldMainUi
                  margin="dense"
                  label="Width (px)"
                  name="video-width"
                  type="number"
                  fullWidth
                  value={width}
                  onChange={(textValue: string) => setWidth(textValue)}
                  infoText={'Optional video width in pixels'}
                />
              </Grid>
              <Grid item xs={6}>
                <TextFieldMainUi
                  margin="dense"
                  label="Height (px)"
                  name="video-height"
                  type="number"
                  fullWidth
                  value={height}
                  onChange={(textValue: string) => setHeight(textValue)}
                  infoText={'Optional video height in pixels'}
                />
              </Grid>
            </Grid>

            {/* Style section */}
            <Grid container alignItems="center">
              <Grid item xs={12}>
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
          </Stack>
        </>
      </ModalDialog>
    </>
  );
};
