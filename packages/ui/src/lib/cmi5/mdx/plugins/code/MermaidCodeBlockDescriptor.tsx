import { ComponentType, useState } from 'react';
import {
  CodeBlockEditorDescriptor,
  CodeBlockEditorProps,
  readOnly$,
  useCodeBlockEditorContext,
} from '@mdxeditor/editor';
import { useCellValues } from '@mdxeditor/gurx';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CodeIcon from '@mui/icons-material/Code';
import { MermaidDiagram } from './MermaidDiagram';
import DeleteIconButton from '../../components/DeleteIconButton';
import { editorInPlayback$ } from '../../state/vars';

/**
 * Props for the diagram edit dialog. The dialog itself lives in the editor
 * package and is injected via createMermaidCodeBlockDescriptor, so none of
 * the editing code is bundled into the player.
 */
export interface MermaidEditDialogProps {
  code: string;
  onSave: (code: string) => void;
  onClose: () => void;
}

/**
 * Diagram plus authoring controls (edit / convert to code block / delete).
 * Controls are hidden in the player and in read-only editors, so learners
 * only ever get the diagram. Edit only appears when a dialog was injected.
 */
function MermaidBlockEditor({
  code,
  EditDialog,
}: CodeBlockEditorProps & {
  EditDialog?: ComponentType<MermaidEditDialogProps>;
}) {
  const { parentEditor, lexicalNode, setCode } = useCodeBlockEditorContext();
  const [readOnly, isPlayback] = useCellValues(readOnly$, editorInPlayback$);
  const muiTheme = useTheme();
  const [isEditing, setIsEditing] = useState(false);

  const showControls = !isPlayback && !readOnly;

  /**
   * Turn the diagram back into a plain code block, keeping its source.
   * Picking "mermaid" in the code block's language list reverses this.
   */
  const onConvertToCode = () => {
    parentEditor.update(() => {
      lexicalNode.setLanguage('');
      setTimeout(() => {
        parentEditor.update(() => {
          lexicalNode.getLatest().select();
        });
      });
    });
  };

  const onDelete = () => {
    parentEditor.update(() => {
      if (lexicalNode.getPreviousSibling()) {
        lexicalNode.selectPrevious();
      } else {
        lexicalNode.selectNext();
      }
      lexicalNode.remove();
    });
  };

  return (
    <Box
      sx={{
        position: 'relative',
        paddingRight: showControls ? '100px' : undefined,
      }}
    >
      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 9,
            display: 'flex',
            backgroundColor:
              muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6',
          }}
        >
          {EditDialog && (
            <Tooltip title="Edit diagram">
              <IconButton
                aria-label="Edit diagram"
                size="small"
                onClick={() => setIsEditing(true)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Convert to code block">
            <IconButton
              aria-label="Convert to code block"
              size="small"
              onClick={onConvertToCode}
            >
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <DeleteIconButton onDelete={onDelete} />
        </Box>
      )}
      <MermaidDiagram code={code} />
      {/* mounted only while open so each edit starts from the saved code */}
      {showControls && EditDialog && isEditing && (
        <EditDialog
          code={code}
          onSave={(newCode) => {
            // one node update = one undo step
            setCode(newCode);
            setIsEditing(false);
          }}
          onClose={() => setIsEditing(false)}
        />
      )}
    </Box>
  );
}

const matchMermaid = (language: string | null | undefined) =>
  language === 'mermaid';

/**
 * Renders ```mermaid fenced code blocks as diagrams with no edit dialog
 * (player, or any editor that doesn't supply one).
 * Priority must beat the codeMirrorPlugin descriptor (priority 1), which also
 * matches 'mermaid' since it is in the codemirror language list.
 */
export const MermaidCodeBlockDescriptor: CodeBlockEditorDescriptor = {
  priority: 2,
  match: matchMermaid,
  Editor: MermaidBlockEditor,
};

/**
 * Editor-only descriptor: same as MermaidCodeBlockDescriptor plus an Edit
 * button that opens the supplied dialog. Call once at module level so the
 * Editor component keeps a stable identity across renders.
 */
export const createMermaidCodeBlockDescriptor = ({
  EditDialog,
}: {
  EditDialog: ComponentType<MermaidEditDialogProps>;
}): CodeBlockEditorDescriptor => ({
  priority: 2,
  match: matchMermaid,
  Editor: (props: CodeBlockEditorProps) => (
    <MermaidBlockEditor {...props} EditDialog={EditDialog} />
  ),
});
