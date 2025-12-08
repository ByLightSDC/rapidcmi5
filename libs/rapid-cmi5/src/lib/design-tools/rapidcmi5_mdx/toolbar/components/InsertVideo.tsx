import React from 'react';

import { openNewVideoDialog$ } from '../../plugins/video';
import { ButtonWithTooltip, readOnly$ } from '@mdxeditor/editor';
import { useCellValues, usePublisher } from '@mdxeditor/gurx';
import VideocamIcon from '@mui/icons-material/Videocam';

/**
 * This toolbar button allows the user to insert a video from either a URL
 * or a file.
 *
 * For the button to work, the 'videoPlugin' must be enabled in the
 * MDXEditor.
 * @group Toolbar Components
 */
export const InsertVideo = React.forwardRef<
  HTMLButtonElement,
  Record<string, never>
>((_, forwardedRef) => {
  const openNewVideoDialog = usePublisher(openNewVideoDialog$);
  const [readOnly] = useCellValues(readOnly$);

  return (
    <ButtonWithTooltip
      title={'Insert video'}
      aria-label="insert-video"
      disabled={readOnly}
      onClick={() => {
        openNewVideoDialog();
      }}
    >
      <VideocamIcon />
    </ButtonWithTooltip>
  );
});
