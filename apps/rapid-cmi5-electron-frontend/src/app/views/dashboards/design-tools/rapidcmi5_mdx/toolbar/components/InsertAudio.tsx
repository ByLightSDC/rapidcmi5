import React from 'react';
import { usePublisher } from '@mdxeditor/gurx';
import { Tooltip, IconButton } from '@mui/material';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import { openNewAudioDialog$ } from '../../plugins/audio';

/**
 * A toolbar button that allows the user to insert audio.
 * For this button to work, you must include `audioPlugin`.
 * @group Toolbar Components
 */
export const InsertAudio = () => {
  const openNewAudioDialog = usePublisher(openNewAudioDialog$);

  return (
    <Tooltip title="Insert Audio">
      <IconButton
        onClick={() => {
          openNewAudioDialog();
        }}
        size="small"
      >
        <AudioFileIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
};
