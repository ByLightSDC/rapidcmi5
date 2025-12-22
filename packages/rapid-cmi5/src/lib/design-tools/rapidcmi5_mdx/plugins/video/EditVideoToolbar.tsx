import React from 'react';
import { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx-jsx';
import { openEditVideoDialog$ } from './index';
import { usePublisher } from '@mdxeditor/gurx';
import { IconButton, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export interface EditVideoToolbarProps {
  nodeKey: string;
  videoSource: string;
  initialVideoPath: string | null;
  title: string;
  rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
  width?: number;
  height?: number;
}

export function EditVideoToolbar({
  nodeKey,
  videoSource,
  initialVideoPath,
  title,
  rest,
  width,
  height,
}: EditVideoToolbarProps): JSX.Element {
  const openEditVideoDialog = usePublisher(openEditVideoDialog$);

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
          onClick={() => {
            openEditVideoDialog({
              nodeKey,
              initialValues: {
                src: initialVideoPath || videoSource,
                title,
                rest,
                width,
                height,
              },
            });
          }}
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
}
