import React, { useEffect } from 'react';
import { Cell, map, useCellValue, usePublisher } from '@mdxeditor/gurx';
import {
  ButtonWithTooltip,
  TableNode,
  activeEditor$,
  iconComponentFor$,
  useTranslation,
} from '@mdxeditor/editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ButtonMinorUi, insertTable$ } from '@rapid-cmi5/ui';

/**
 * Icons
 */
import AddIcon from '@mui/icons-material/Add';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useTheme } from '@emotion/react';

const disableInsertTableButton$ = Cell<boolean>(false, (r) => {
  r.link(
    r.pipe(
      activeEditor$,
      map((editor) =>
        ['td', 'th'].includes(
          editor?.getRootElement()?.parentNode?.nodeName.toLowerCase() ?? '',
        ),
      ),
    ),
    disableInsertTableButton$,
  );
});

/**
 * A toolbar button that allows the user to insert a table.
 * For this button to work, you need to have the `tablePlugin` plugin enabled.
 * @group Toolbar Components
 */
export const InsertTable = ({ isDrawer }: { isDrawer?: boolean }) => {
  const iconComponentFor = useCellValue(iconComponentFor$);
  const insertTable = usePublisher(insertTable$);
  const theme: any = useTheme();
  const t = useTranslation();

  // Do not allow inserting a table inside a table cell, markdown does not support it
  const isDisabled = useCellValue(disableInsertTableButton$);

  // In a child component
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.registerNodeTransform(TableNode, (node) => {
      // Validate/transform on create
      //if (node.getType() !== 'table') node.remove();
    });
  }, [editor]);

  return (
    <>
      {isDrawer ? (
        <ButtonMinorUi
          title="Insert Table"
          aria-label="insert-table"
          //startIcon={iconComponentFor('table')}
          startIcon={
            <>
              <AddIcon
                fontSize="large"
                sx={{
                  color: theme.palette.primary.main,
                  fill: theme.palette.primary.main,
                }}
              />
              <TableChartIcon
                fontSize="small"
                sx={{ fill: theme.palette.primary.main, marginRight: 1 }}
              />
            </>
          }
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            margin: 1,
            padding: 1,
          }}
          onClick={() => {
            insertTable({ rows: 3, columns: 3 });
          }}
        >
          Table
        </ButtonMinorUi>
      ) : (
        <ButtonWithTooltip
          title={t('toolbar.table', 'Insert Table')}
          onClick={() => {
            insertTable({ rows: 3, columns: 3 });
          }}
          {...(isDisabled
            ? { 'aria-disabled': true, 'data-disabled': true, disabled: true }
            : {})}
        >
          {iconComponentFor('table')}
        </ButtonWithTooltip>
      )}
    </>
  );
};
