import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCellValues, usePublisher } from '@mdxeditor/gurx';
import { $getNodeByKey } from 'lexical';

// MUI
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SettingsIcon from '@mui/icons-material/Settings';

import { iconComponentFor$, readOnly$ } from '@mdxeditor/editor';

import { openEditImageDialog$, disableImageSettingsButton$ } from './index';
import { useEffect } from 'react';
import { useTheme } from '@mui/system';

export interface EditImageToolbarProps {
  nodeKey: string;
  imageSource: string;
  initialImagePath: string | null;
  title: string;
  alt: string;
  rest: any;
  width?: number;
  height?: number;
  href?: string;
}

/**
 * This little toolbar appears in the top-right corner of an image in the editor.
 * @param nodeKey
 * @param imageSource
 * @param initialImagePath
 * @param title
 * @param alt
 * @param rest
 * @constructor
 */
export function EditImageToolbar({
  nodeKey,
  imageSource,
  initialImagePath,
  title,
  alt,
  rest,
  width,
  height,
  href,
}: EditImageToolbarProps): JSX.Element {
  const [disableImageSettingsButton, iconComponentFor, readOnly] =
    useCellValues(disableImageSettingsButton$, iconComponentFor$, readOnly$);
  const [editor] = useLexicalComposerContext();
  const openEditImageDialog = usePublisher(openEditImageDialog$);
  const muiTheme = useTheme();

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        backgroundColor:
          muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6',
        position: 'absolute',
        right: 0,
        top: 0,
        display: 'flex',
        zIndex: 1,
      }}
    >
      <IconButton
        aria-label="edit"
        disabled={readOnly}
        onClick={(e) => {
          openEditImageDialog({
            nodeKey: nodeKey,
            initialValues: {
              src: !initialImagePath ? imageSource : initialImagePath,
              title,
              altText: alt,
              rest: rest,
              width, // undefined if 'inherit'
              height, // undefined if 'inherit'
              href,
            },
          });
        }}
      >
        <SettingsIcon />
      </IconButton>
      <IconButton
        aria-label="delete"
        disabled={readOnly}
        onClick={(e) => {
          e.preventDefault();
          editor.update(() => {
            $getNodeByKey(nodeKey)?.remove();
          });
        }}
      >
        <DeleteForeverIcon />
      </IconButton>
    </Stack>
  );
}
