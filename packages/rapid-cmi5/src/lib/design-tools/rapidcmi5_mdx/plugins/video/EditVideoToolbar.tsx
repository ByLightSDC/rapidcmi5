import React from 'react';
import { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx-jsx';
import { openEditVideoDialog$ } from './index';
import { usePublisher, useCellValues } from '@mdxeditor/gurx';
import { readOnly$ } from '@mdxeditor/editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { IconButton, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export interface EditVideoToolbarProps {
  nodeKey: string;
  videoSource: string;
  initialVideoPath: string | null;
  title: string;
  rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
  width?: number;
  height?: number;
  autoplay?: boolean;
  captionSrc?: string;
}

export function EditVideoToolbar({
  nodeKey,
  videoSource,
  initialVideoPath,
  title,
  rest,
  width,
  height,
  autoplay,
  captionSrc,
}: EditVideoToolbarProps): JSX.Element {
  const openEditVideoDialog = usePublisher(openEditVideoDialog$);
  const [editor] = useLexicalComposerContext();
  const [readOnly] = useCellValues(readOnly$);

  return (
    <div
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        display: 'flex',
        gap: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '4px',
        padding: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      <Tooltip title="Edit Video Settings">
        <IconButton
          size="small"
          disabled={readOnly}
          onClick={() => {
            openEditVideoDialog({
              nodeKey,
              initialValues: {
                src: initialVideoPath || videoSource,
                title,
                rest,
                width,
                height,
                autoplay,
                captionSrc,
              },
            });
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete Video">
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
