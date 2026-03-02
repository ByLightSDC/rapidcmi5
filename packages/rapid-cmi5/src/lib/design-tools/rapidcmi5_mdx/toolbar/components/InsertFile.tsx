import React from 'react';

import { ButtonWithTooltip, readOnly$ } from '@mdxeditor/editor';
import { useCellValues, usePublisher } from '@mdxeditor/gurx';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { insertActivityDirective$ } from '../../plugins/Activity';
import { ContainerDirective } from 'mdast-util-directive';
import { getDefaultData } from '@rapid-cmi5/ui';
import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';

/**
 * This toolbar button allows the user to attach a file that can be downloaded
 * follows the Activity pattern which is a directive that contains json
 * MDXEditor.
 * @group Toolbar Components
 */
export const InsertFile = React.forwardRef<
  HTMLButtonElement,
  Record<string, never>
>((_, forwardedRef) => {
  //const openNewVideoDialog = usePublisher(openNewVideoDialog$);
  const [readOnly] = useCellValues(readOnly$);
  const insertActivity = usePublisher(insertActivityDirective$);

  return (
    <ButtonWithTooltip
      title={'Insert File'}
      aria-label="insert-file"
      disabled={readOnly}
      onClick={() => {
        insertActivity({
          type: 'containerDirective',
          attributes: {},
          name: 'download',
          children: [
            {
              type: 'code',
              lang: 'json',
              value: getDefaultData(RC5ActivityTypeEnum.download),
            },
          ],
        } as ContainerDirective);
      }}
    >
      <AttachFileIcon />
    </ButtonWithTooltip>
  );
});
