import React, { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';

import {
  closeImageDialog$,
  saveImage$,
  imageDialogState$,
  imageFilePath$,
} from './index';

import { useCellValues, usePublisher } from '@mdxeditor/gurx';

// MUI
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import {
  ButtonModalMainUi,
  ComboBoxSelectorUi,
  ModalDialog,
  TextFieldMainUi,
} from '@rapid-cmi5/ui';

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

const IMAGE_DIR = './Assets/Images/';

/**
 * A custom Image Dialog for image settings.
 * See documentation here:
 *   https://mdxeditor.dev/editor/docs/images
 *   and the Image section here:
 *   https://mdxeditor.dev/editor/api
 * @constructor
 */
export const ImageDialog: React.FC = () => {
  // local state
  const [src, setSrc] = useState<string>('');
  const [altText, setAltText] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [imageStyle, setImageStyle] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [fileOptions, setFileOptions] = useState<string[]>([]);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [aspectLocked, setAspectLocked] = useState<boolean>(true);
  // natural dims of the current image — loaded from the resolved blob URL
  const naturalDimsRef = useRef<{ width: number; height: number } | null>(null);

  const { isFsLoaded, handleGetFolderStructure, handlePathExists } =
    useContext(GitContext);

  // get the state from Gurx
  const [state, imageFilePath] = useCellValues(
    imageDialogState$,
    imageFilePath$,
  );

  // set the initial values based on if the user is inserting a new image or
  // editing an existing image
  useEffect(() => {
    if (state.type === 'editing') {
      setSrc(state.initialValues.src ? state.initialValues.src : '');
      setAltText(
        state.initialValues.altText ? state.initialValues.altText : '',
      );
      setTitle(state.initialValues.title ? state.initialValues.title : '');
      setLinkUrl(state.initialValues.href ?? '');

      setImageStyle('');
      // If the image has no stored px dimensions, we'll populate from natural dims
      // once the image loads (see effect below). Set empty for now.
      const storedWidth = typeof state.initialValues.width === 'number' ? state.initialValues.width.toString() : '';
      const storedHeight = typeof state.initialValues.height === 'number' ? state.initialValues.height.toString() : '';
      setWidth(storedWidth);
      setHeight(storedHeight);
      if (state.initialValues.rest) {
        const styleAttribute = state.initialValues.rest.find(
          //@ts-ignore
          (attribute) => attribute.name === 'style',
        );
        if (styleAttribute) {
          //@ts-ignore
          setImageStyle(styleAttribute.value);
        }
      }
    } else {
      setSrc('');
      setAltText('');
      setTitle('');
      setLinkUrl('');
      setImageStyle('');
      setWidth('');
      setHeight('');
    }

    // clear the file regardless of the editing state
    setSelectedFiles(null);

    // reset lock and natural dims so stale ratios don't carry over
    naturalDimsRef.current = null;
    setAspectLocked(true);
  }, [state]);

  // Load natural dims from the resolved blob URL when the dialog opens.
  // If no stored px dims, also pre-populate the width/height fields.
  useEffect(() => {
    if (state.type !== 'editing') return;
    const urlToLoad = state.initialValues.resolvedSrc ?? state.initialValues.src;
    if (!urlToLoad) return;
    const img = new Image();
    img.onload = () => {
      naturalDimsRef.current = { width: img.naturalWidth, height: img.naturalHeight };
      // Pre-populate fields only when image has no stored dimensions
      const hasStoredDims = typeof state.initialValues.width === 'number' || typeof state.initialValues.height === 'number';
      if (!hasStoredDims) {
        setWidth(String(img.naturalWidth));
        setHeight(String(img.naturalHeight));
      }
    };
    img.src = urlToLoad;
  }, [state]);

  // set up publishers, etc.
  const saveImage = usePublisher(saveImage$);
  const closeImageDialog = usePublisher(closeImageDialog$);

  // the user is canceling the image so close the dialog window
  const handleCancel = () => {
    closeImageDialog();
  };

  // the user is submitting the image, so insert it
  const handleSubmit = () => {
    let restParams: any = [];
    if (imageStyle !== '') {
      restParams = [
        {
          type: 'mdxJsxAttribute',
          name: 'style',
          value: imageStyle,
        },
      ];
    }

    const imageParams: any = {
      file: selectedFiles,
      src: src,
      altText: altText,
      title: title,
      rest: restParams,
      width: width ? parseInt(width, 10) : undefined,
      height: height ? parseInt(height, 10) : undefined,
      href: linkUrl || undefined,
    };

    saveImage(imageParams);
  };

  // fill in the list of file options
  useEffect(() => {
    const path = imageFilePath;

    async function fetchData() {
      try {
        const exists = await handlePathExists(path);
        if (!exists) return;

        const treeData = await handleGetFolderStructure(path, true);
        const fileOptions = [];

        // add the current source value
        if (state.type === 'editing' && state.initialValues.src) {
          fileOptions.push(state.initialValues.src.replace(IMAGE_DIR, ''));
        }

        // add the list of files
        for (let i = 0; i < treeData.length; i++) {
          const imageName = treeData[i].name;
          if (fileOptions[0] !== imageName) {
            // don't add if already added as initial value
            fileOptions.push(imageName);
          }
        }
        setFileOptions(fileOptions);
      } catch (error) {
        // Directory doesn't exist yet - this is okay, it will be created when first image is uploaded
        console.debug('Image directory does not exist yet:', path);
        setFileOptions([]);
      }
    }

    if (isFsLoaded) {
      fetchData();
    }
  }, [imageFilePath, src, state.type, isFsLoaded]);

  // handle file selection
  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      setSelectedFiles(fileList);
      if (fileList.length > 0) {
        setAltText(fileList[0].name.replace(/\.[^/.]+$/, '')); // removes file extension
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
        title={state.type === 'editing' ? 'Edit Image' : 'Insert Image'}
        buttons={['Cancel', state.type === 'editing' ? 'apply' : 'insert']}
        dialogProps={{
          open: true,
          fullWidth: true,
        }}
        handleAction={(index: number) => {
          if (index === 0) {
            handleCancel();
          } else {
            handleSubmit();
          }
        }}
      >
        {/*<DialogContent sx={{ paddingTop: '20px' }}>*/}
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
                      accept="image/*" // restrict to image files only
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
                        'No image file chosen'
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>

            {/* URL section */}
            <ComboBoxSelectorUi
              label="Image"
              id="image"
              options={fileOptions}
              defaultValue={src.replace(IMAGE_DIR, '')}
              showAllOptions={true}
              autocompleteProps={{
                freeSolo: true,
              }}
              onSelect={(selectionValue: any) => {
                if (selectionValue.startsWith('http')) {
                  // if this is not a file system image
                  setSrc(selectionValue);
                } else {
                  setSrc(`${IMAGE_DIR}${selectionValue}`);
                  setAltText(selectionValue.replace(/\.[^/.]+$/, '')); // removes file extension
                }
              }}
              infoText={`Specify URL or choose from uploaded files. Images that appear here can be found in Course Files. Expand the lesson folder and look for 'Assets/Images'.`}
            />

            {/* Alt section */}
            <TextFieldMainUi
              margin="dense"
              label="Alt Text"
              name="alt-text"
              type="text"
              fullWidth
              value={altText}
              onChange={(textValue: string) => setAltText(textValue)}
              infoText={'Text to display when image is not visible'}
            />

            {/* Title section */}
            <TextFieldMainUi
              autoFocus
              margin="dense"
              label="Title"
              name="image-title"
              type="text"
              fullWidth
              value={title}
              onChange={(textValue: string) => setTitle(textValue)}
              infoText={'Image Tooltip Text'}
            />

            {/* Link URL section */}
            <TextFieldMainUi
              margin="dense"
              label="Link URL"
              type="url"
              fullWidth
              value={linkUrl}
              onChange={(textValue: string) => setLinkUrl(textValue)}
              placeholder="https://example.com"
              infoText={'Optional URL to navigate to when image is clicked'}
            />

            {/* Width/Height section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
                <TextFieldMainUi
                  margin="dense"
                  label="Width (px)"
                  name="image-width"
                  type="number"
                  fullWidth
                  value={width}
                  onChange={(textValue: string) => {
                    setWidth(textValue);
                    if (aspectLocked && naturalDimsRef.current && textValue !== '') {
                      const ratio = naturalDimsRef.current.height / naturalDimsRef.current.width;
                      const computed = Math.round(parseInt(textValue, 10) * ratio);
                      setHeight(isNaN(computed) ? '' : String(computed));
                    }
                  }}
                  infoText={'Optional image width in pixels'}
                />
              </Box>
              <Tooltip title={aspectLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}>
                <IconButton
                  size="small"
                  onClick={() => setAspectLocked((prev) => !prev)}
                  color={aspectLocked ? 'primary' : 'default'}
                  aria-label={aspectLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                  sx={{ mt: '4px', flexShrink: 0 }}
                >
                  {aspectLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
                <TextFieldMainUi
                  margin="dense"
                  label="Height (px)"
                  name="image-height"
                  type="number"
                  fullWidth
                  value={height}
                  onChange={(textValue: string) => {
                    setHeight(textValue);
                    if (aspectLocked && naturalDimsRef.current && textValue !== '') {
                      const ratio = naturalDimsRef.current.width / naturalDimsRef.current.height;
                      const computed = Math.round(parseInt(textValue, 10) * ratio);
                      setWidth(isNaN(computed) ? '' : String(computed));
                    }
                  }}
                  infoText={'Optional image height in pixels'}
                />
              </Box>
            </Box>
          </Stack>
        </>
      </ModalDialog>
    </>
  );
};
