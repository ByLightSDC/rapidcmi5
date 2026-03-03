import React from 'react';

import { openNewVideoDialog$ } from '../../plugins/video';
import { ButtonWithTooltip, readOnly$ } from '@mdxeditor/editor';
import { useCellValues, usePublisher } from '@mdxeditor/gurx';
import VideocamIcon from '@mui/icons-material/Videocam';
/**
 * Icons
 */
import AddIcon from '@mui/icons-material/Add';
import { ButtonMinorUi } from '@rapid-cmi5/ui';
import { useTheme } from '@mui/material';
/**
 * This toolbar button allows the user to insert a video from either a URL
 * or a file.
 *
 * For the button to work, the 'videoPlugin' must be enabled in the
 * MDXEditor.
 * @group Toolbar Components
 */
export const InsertVideo = ({ isDrawer }: { isDrawer?: boolean }) => {
  const openNewVideoDialog = usePublisher(openNewVideoDialog$);
  const [readOnly] = useCellValues(readOnly$);
  const theme = useTheme();

  return (
    <>
      {isDrawer ? (
        <ButtonMinorUi
          title="Insert Video"
          aria-label="insert-video"
          startIcon={
            <>
              <AddIcon
                fontSize="large"
                sx={{
                  color: theme.palette.primary.main,
                  fill: theme.palette.primary.main,
                }}
              />
              <VideocamIcon
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
            openNewVideoDialog();
          }}
        >
          Video
        </ButtonMinorUi>
      ) : (
        <ButtonWithTooltip
          title="Insert Video"
          aria-label="insert-video"
          onClick={() => {
            openNewVideoDialog();
          }}
        >
          <VideocamIcon fontSize="small" />
        </ButtonWithTooltip>
      )}
    </>
    // <ButtonWithTooltip
    //   title={'Insert video'}
    //   aria-label="insert-video"
    //   disabled={readOnly}
    //   onClick={() => {
    //     openNewVideoDialog();
    //   }}
    // >
    //   <VideocamIcon />
    // </ButtonWithTooltip>
  );
};
