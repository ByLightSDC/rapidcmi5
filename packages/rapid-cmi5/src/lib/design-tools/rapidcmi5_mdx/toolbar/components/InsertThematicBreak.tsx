import { useCellValue, usePublisher } from '@mdxeditor/gurx';
import {
  ButtonWithTooltip,
  iconComponentFor$,
  insertThematicBreak$,
  useTranslation,
} from '@mdxeditor/editor';

/**
 * Icons
 */
import AddIcon from '@mui/icons-material/Add';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import { useTheme } from '@mui/material';
import { ButtonMinorUi } from '@rapid-cmi5/ui';

/**
 * A toolbar button that allows the user to insert a thematic break (rendered as an HR HTML element).
 * For this button to work, you need to have the `thematicBreakPlugin` plugin enabled.
 * @group Toolbar Components
 */
export const InsertThematicBreak = ({ isDrawer }: { isDrawer?: boolean }) => {
  const insertThematicBreak = usePublisher(insertThematicBreak$);
  const theme: any = useTheme();

  return (
    <>
      {isDrawer ? (
        <ButtonMinorUi
          title="Insert Thematic Break"
          aria-label="insert-thematic-break"
          startIcon={
            <>
              <AddIcon
                fontSize="large"
                sx={{
                  color: theme.palette.primary.main,
                  fill: theme.palette.primary.main,
                }}
              />
              <HorizontalRuleIcon
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
            insertThematicBreak();
          }}
        >
          Thematic Break
        </ButtonMinorUi>
      ) : (
        <ButtonWithTooltip
          title="Insert Thematic Break"
          aria-label="insert-thematic-break"
          onClick={() => {
            insertThematicBreak();
          }}
        >
          <HorizontalRuleIcon fontSize="small" />
        </ButtonWithTooltip>
      )}
    </>
  );
};
