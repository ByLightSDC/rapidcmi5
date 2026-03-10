import { readOnly$ } from '@mdxeditor/editor';
import { useCellValues, usePublisher } from '@mdxeditor/gurx';

import { insertActivityDirective$ } from '../../plugins/Activity';
import { ContainerDirective } from 'mdast-util-directive';
import { ButtonMinorUi, getDefaultData } from '@rapid-cmi5/ui';
import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';

/**
 * Icons
 */
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useTheme } from '@mui/material';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';

/**
 * This toolbar button allows the user to attach a file that can be downloaded
 * follows the Activity pattern which is a directive that contains json
 * MDXEditor.
 * @group Toolbar Components
 */
export const InsertFile = ({ isDrawer }: { isDrawer?: boolean }) => {
  const [readOnly] = useCellValues(readOnly$);
  const insertActivity = usePublisher(insertActivityDirective$);
  const theme = useTheme();

  const handleInsert = () => {
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
  };
  return (
    <>
      {isDrawer ? (
        <ButtonMinorUi
          title="File"
          aria-label="insert-file"
          startIcon={
            <>
              <AddIcon
                fontSize="large"
                sx={{
                  color: theme.palette.primary.main,
                  fill: theme.palette.primary.main,
                }}
              />
              <AttachFileIcon
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
            handleInsert();
          }}
        >
          File
        </ButtonMinorUi>
      ) : (
        <MUIButtonWithTooltip
          title="Insert File"
          aria-label="insert-file"
          onClick={() => {
            handleInsert();
          }}
        >
          <AttachFileIcon fontSize="small" />
        </MUIButtonWithTooltip>
      )}
    </>
  );
};
