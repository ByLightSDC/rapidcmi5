import { IconButton, Tooltip } from '@mui/material';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import { $createParagraphNode, LexicalNode } from 'lexical';
import { LexicalEditor } from 'lexical';

interface InsertLineReturnButtonProps {
  parentEditor: LexicalEditor;
  lexicalNode: LexicalNode;
}

/**
 * Inserts a paragraph node after the given lexical node and moves the cursor to it.
 */
function InsertLineReturnButton({
  parentEditor,
  lexicalNode,
}: InsertLineReturnButtonProps) {
  return (
    <Tooltip title="Insert paragraph after">
      <IconButton
        size="small"
        aria-label="insert paragraph after"
        onClick={() => {
          parentEditor.update(() => {
            const p = $createParagraphNode();
            lexicalNode.insertAfter(p);
            p.selectEnd();
          });
        }}
      >
        <SubdirectoryArrowLeftIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

export default InsertLineReturnButton;
