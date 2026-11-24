import { usePublisher } from '@mdxeditor/gurx';
import { insertCodeBlock$ } from '@mdxeditor/editor';
import { useTheme } from '@mui/material';
import { ButtonMinorUi } from '@rapid-cmi5/ui';

/**
 * Icons
 */
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';

/** Starter diagram so the block renders immediately; authors edit via the block's Edit button. */
export const DEFAULT_MERMAID_DIAGRAM = `flowchart LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Do this]
    B -->|No| D[Do that]`;

/**
 * Inserts a Mermaid diagram: a fenced code block with language "mermaid",
 * which the Mermaid code block descriptor renders as a diagram.
 */
export const InsertMermaid = ({ isDrawer }: { isDrawer?: boolean }) => {
  const insertCodeBlock = usePublisher(insertCodeBlock$);
  const theme = useTheme();

  const insertMermaid = () =>
    insertCodeBlock({ language: 'mermaid', code: DEFAULT_MERMAID_DIAGRAM });

  return isDrawer ? (
    <ButtonMinorUi
      title="Insert Mermaid Diagram"
      aria-label="insert-mermaid-diagram"
      startIcon={
        <>
          <AddIcon
            fontSize="large"
            sx={{
              color: theme.palette.primary.main,
              fill: theme.palette.primary.main,
            }}
          />
          <AccountTreeIcon
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
      onClick={insertMermaid}
    >
      Mermaid Diagram
    </ButtonMinorUi>
  ) : (
    <MUIButtonWithTooltip
      title="Insert Mermaid Diagram"
      aria-label="insert-mermaid-diagram"
      onClick={insertMermaid}
    >
      <AccountTreeIcon fontSize="small" />
    </MUIButtonWithTooltip>
  );
};
