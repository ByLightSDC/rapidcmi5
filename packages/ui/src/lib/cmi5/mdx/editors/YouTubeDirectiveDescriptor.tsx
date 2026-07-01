import { DirectiveDescriptor, insertMarkdown$, useCellValues } from '@mdxeditor/editor';
import { LeafDirective } from 'mdast-util-directive';
import { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Stack, TextField, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { usePublisher } from '@mdxeditor/gurx';
import { editorInPlayback$ } from '../state/vars';

/**
 * Example
 * ::youtube[Video of rick]{#dQw4w9WgXcQ}
 * CommonMark Spec https://spec.commonmark.org/0.31.2/
 */

interface YoutubeDirectiveNode extends LeafDirective {
  name: 'youtube';
  attributes: { id: string };
}

function extractVideoId(input: string): string {
  const trimmed = input.trim();
  const urlPatterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
  ];
  for (const pattern of urlPatterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return trimmed;
}

const YoutubeEditor = ({
  mdastNode,
  lexicalNode,
  parentEditor,
}: {
  mdastNode: YoutubeDirectiveNode;
  lexicalNode: any;
  parentEditor: any;
}) => {
  const [editing, setEditing] = useState(false);
  const id = mdastNode.attributes.id ?? '';
  const [inputValue, setInputValue] = useState(
    id ? `https://www.youtube.com/watch?v=${id}` : '',
  );
  const insertMarkdown = usePublisher(insertMarkdown$);
  const [isPlayback] = useCellValues(editorInPlayback$);
  // The iframe's parent is the Lexical decorator span which NVDA announces as 'clickable'.
  // Set role=presentation to hide it from NVDA.
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isPlayback && containerRef.current) {
      const decoratorSpan = containerRef.current.parentElement;
      if (decoratorSpan) {
        decoratorSpan.setAttribute('role', 'presentation');
      }
    }
  }, [isPlayback]);

  const handleDelete = () => {
    parentEditor.update(() => {
      lexicalNode.selectNext();
      lexicalNode.remove();
    });
  };

  const handleSave = () => {
    const newId = extractVideoId(inputValue);
    if (!newId) return;
    insertMarkdown(`::youtube{#${newId}}\n`);
    parentEditor.update(() => {
      lexicalNode.selectNext();
      lexicalNode.remove();
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setInputValue(mdastNode.attributes.id ?? '');
    setEditing(false);
  };

  const embedSrc = `https://www.youtube.com/embed/${mdastNode.attributes.id}`;

  return (
    <Box ref={containerRef} sx={{ position: 'relative', display: 'inline-block' }}>
      {/* Gutter buttons */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'row',
          gap: 0.5,
          padding: 0.5,
          backgroundColor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        {editing ? (
          <>
            <Tooltip title="Save">
              <IconButton size="small" onClick={handleSave} color="primary">
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton size="small" onClick={handleCancel}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip title="Edit video ID">
              <IconButton size="small" onClick={() => setEditing(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={handleDelete} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Edit input */}
      {editing && (
        <Stack direction="row" spacing={1} sx={{ mb: 1, paddingRight: '90px' }}>
          <TextField
            size="small"
            label="YouTube URL or Video ID"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            sx={{ flex: 1 }}
            autoFocus
          />
        </Stack>
      )}

      {/* Embedded player */}
      <iframe
        width="640"
        height="480"
        src={embedSrc}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </Box>
  );
};

export const YoutubeDirectiveDescriptor: DirectiveDescriptor<YoutubeDirectiveNode> =
  {
    name: 'youtube',
    type: 'leafDirective',
    testNode(node) {
      return node.name === 'youtube';
    },
    attributes: ['id'],
    hasChildren: false,
    Editor: ({ mdastNode, lexicalNode, parentEditor }) => (
      <YoutubeEditor
        mdastNode={mdastNode}
        lexicalNode={lexicalNode}
        parentEditor={parentEditor}
      />
    ),
  };
