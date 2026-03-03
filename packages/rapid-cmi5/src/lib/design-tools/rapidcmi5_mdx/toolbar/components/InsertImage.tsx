import React from 'react';

import { openNewImageDialog$ } from '../../plugins/image';
import {
  ButtonWithTooltip,
  iconComponentFor$,
  readOnly$,
} from '@mdxeditor/editor';
import { useCellValues, usePublisher } from '@mdxeditor/gurx';
/**
 * Icons
 */
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import { useTheme } from '@mui/material';
import { ButtonMinorUi } from '@rapid-cmi5/ui';

/**
 * This toolbar button allows the user to insert an image from either a URL
 * or a file.
 *
 * Unlike MDXEDitor's built in image plugin, this kind of image can handle extra
 * things like custom properties and being loaded from the local file system.
 *
 * For the button to work, the 'imagePlugin' must be enabled in the
 * MDXEditor.
 * @group Toolbar Components
 */
export const InsertImage = ({ isDrawer }: { isDrawer?: boolean }) => {
  const openNewImageDialog = usePublisher(openNewImageDialog$);
  const theme = useTheme();
  const [readOnly, iconComponentFor] = useCellValues(
    readOnly$,
    iconComponentFor$,
  );

  return (
    <>
      {isDrawer ? (
        <ButtonMinorUi
          title="Insert Image"
          aria-label="insert-image"
          startIcon={
            <>
              <AddIcon
                fontSize="large"
                sx={{
                  color: theme.palette.primary.main,
                  fill: theme.palette.primary.main,
                }}
              />
              <ImageIcon
                fontSize="small"
                sx={{ fill: theme.palette.primary.main, marginRight: 1 }}
              />
            </>
          }
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: 1,
          }}
          onClick={() => {
            openNewImageDialog();
          }}
        >
          Image
        </ButtonMinorUi>
      ) : (
        <ButtonWithTooltip
          title="Insert Image"
          aria-label="insert-image"
          onClick={() => {
            openNewImageDialog();
          }}
        >
          <ImageIcon fontSize="small" />
        </ButtonWithTooltip>
      )}
    </>
  );
};
