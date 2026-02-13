import React from 'react';
import { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx-jsx';
import { openEditAudioDialog$ } from './index';
import { usePublisher } from '@mdxeditor/gurx';
import { IconButton, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export interface EditAudioToolbarProps {
  nodeKey: string;
  audioSource: string;
  initialAudioPath: string | null;
  title: string;
  rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
  autoplay?: boolean;
}

export function EditAudioToolbar({
  nodeKey,
  audioSource,
  initialAudioPath,
  title,
  rest,
  autoplay,
}: EditAudioToolbarProps): JSX.Element {
  const openEditAudioDialog = usePublisher(openEditAudioDialog$);

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
      <Tooltip title="Edit Audio Settings">
        <IconButton
          size="small"
          onClick={() => {
            openEditAudioDialog({
              nodeKey,
              initialValues: {
                src: initialAudioPath || audioSource,
                title,
                rest,
                autoplay,
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
