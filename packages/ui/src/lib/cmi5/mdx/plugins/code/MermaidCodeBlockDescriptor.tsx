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
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import VerticalAlignCenterIcon from '@mui/icons-material/VerticalAlignCenter';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import {
  MermaidAlign,
  MermaidDiagram,
  getMermaidAlign,
  withMermaidAlign,
} from './MermaidDiagram';
import DeleteIconButton from '../../components/DeleteIconButton';
import { AlignmentToolbarControls } from '../../components/AlignmentToolbarControls';
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
const ALIGN_ICON_SX = { transform: 'rotate(90deg)' };

/** Same icons as AlignmentToolbarControls, for the toggle button. */
const AlignIcon = ({ align }: { align: MermaidAlign }) =>
  align === 'right' ? (
    <VerticalAlignTopIcon fontSize="small" sx={ALIGN_ICON_SX} />
  ) : align === 'center' ? (
    <VerticalAlignCenterIcon fontSize="small" sx={ALIGN_ICON_SX} />
  ) : (
    <VerticalAlignBottomIcon fontSize="small" sx={ALIGN_ICON_SX} />
  );

function MermaidBlockEditor({
  code,
  meta,
  EditDialog,
}: CodeBlockEditorProps & {
  EditDialog?: ComponentType<MermaidEditDialogProps>;
}) {
  const { parentEditor, lexicalNode, setCode, setMeta } =
    useCodeBlockEditorContext();
  const [readOnly, isPlayback] = useCellValues(readOnly$, editorInPlayback$);
  const muiTheme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isAlignOpen, setIsAlignOpen] = useState(false);

  const showControls = !isPlayback && !readOnly;
  const align = getMermaidAlign(meta);
  const toolbarBg =
    muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6';

  /**
   * Turn the diagram back into a plain code block, keeping its source.
   * Picking "mermaid" in the code block's language list reverses this.
   * Meta (alignment) is cleared too: the CodeMirror descriptor only matches
   * code blocks without meta, so a leftover `align=` would block it.
   */
  const onConvertToCode = () => {
    parentEditor.update(() => {
      lexicalNode.setMeta('');
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
        // wide enough for the 4-button toolbar, so a right-aligned
        // diagram is never covered by it
        paddingRight: showControls ? '140px' : undefined,
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
            backgroundColor: toolbarBg,
          }}
        >
          <Tooltip title="Alignment">
            <IconButton
              aria-label="Toggle diagram alignment"
              aria-expanded={isAlignOpen}
              size="small"
              onClick={() => setIsAlignOpen((open) => !open)}
              sx={{ opacity: isAlignOpen ? 1 : 0.6 }}
            >
              <AlignIcon align={align} />
            </IconButton>
          </Tooltip>
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
      {/* second row, like the image toolbar's alignment controls */}
      {showControls && isAlignOpen && (
        <Box
          sx={{
            position: 'absolute',
            top: 34,
            right: 0,
            zIndex: 9,
            display: 'flex',
            backgroundColor: toolbarBg,
          }}
        >
          <AlignmentToolbarControls
            currentAlignment={align}
            onAlignmentChange={(value) => setMeta(withMermaidAlign(meta, value))}
          />
        </Box>
      )}
      <MermaidDiagram code={code} align={align} />
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
 * Priority 2 keeps it ahead of the codeMirrorPlugin descriptor (priority 1)
 * should 'mermaid' ever be added to codeBlockLanguages. It is currently only
 * in the picker's languageOptions (vars.ts), so authors can switch back.
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
