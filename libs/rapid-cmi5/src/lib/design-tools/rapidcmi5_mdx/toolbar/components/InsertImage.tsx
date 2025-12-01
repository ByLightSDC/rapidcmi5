import React from 'react';

import { openNewImageDialog$ } from '../../plugins/image';
import {
  ButtonWithTooltip,
  iconComponentFor$,
  readOnly$,
} from '@mdxeditor/editor';
import { useCellValues, usePublisher } from '@mdxeditor/gurx';

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
export const InsertImage = React.forwardRef<
  HTMLButtonElement,
  Record<string, never>
>((_, forwardedRef) => {
  const openNewImageDialog = usePublisher(openNewImageDialog$);
  const [readOnly, iconComponentFor] = useCellValues(
    readOnly$,
    iconComponentFor$,
  );

  return (
    <ButtonWithTooltip
      title={'Insert image'}
      aria-label="insert-image"
      disabled={readOnly}
      onClick={() => {
        openNewImageDialog();
      }}
    >
      {iconComponentFor('add_photo')}
    </ButtonWithTooltip>
  );
});
