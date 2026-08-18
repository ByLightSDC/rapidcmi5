import React from 'react';
import { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx-jsx';
import { openEditAudioDialog$ } from './index';
import { usePublisher, useCellValues } from '@mdxeditor/gurx';
import { readOnly$ } from '@mdxeditor/editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export interface EditAudioToolbarProps {
  nodeKey: string;
  audioSource: string;
  initialAudioPath: string | null;
  title: string;
  rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
  autoplay?: boolean;
  captionSrc?: string;
}

export function EditAudioToolbar({
  nodeKey,
  audioSource,
  initialAudioPath,
  title,
  rest,
  autoplay,
  captionSrc,
}: EditAudioToolbarProps): JSX.Element {
  const openEditAudioDialog = usePublisher(openEditAudioDialog$);
  const [editor] = useLexicalComposerContext();
  const [readOnly] = useCellValues(readOnly$);

  return (
    <div
      style={{
        position: 'absolute',
        // Floats above the box, nudged down to overlap the border/padding a
        // bit rather than sitting apart from it — but stays clear of the
        // native audio controls, which start below the container's 8px
        // top padding.
        bottom: 'calc(100% - 16px)',
        right: '8px',
        display: 'flex',
        gap: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '4px',
        padding: '2px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      <Tooltip title="Edit Audio Settings">
        <IconButton
          size="small"
          disabled={readOnly}
          onClick={() => {
            openEditAudioDialog({
              nodeKey,
              initialValues: {
                src: initialAudioPath || audioSource,
                title,
                rest,
                autoplay,
                captionSrc,
              },
            });
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete Audio">
        <IconButton
          size="small"
          aria-label="delete"
          disabled={readOnly}
          onClick={(e) => {
            e.preventDefault();
            editor.update(() => {
              $getNodeByKey(nodeKey)?.remove();
            });
          }}
        >
          <DeleteForeverIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
}
