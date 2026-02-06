
import { usePublisher } from '@mdxeditor/gurx';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import { openNewAudioDialog$ } from '../../plugins/audio';
import { ButtonWithTooltip } from '@mdxeditor/editor';

/**
 * A toolbar button that allows the user to insert audio.
 * For this button to work, you must include `audioPlugin`.
 * @group Toolbar Components
 */
export const InsertAudio = () => {
  const openNewAudioDialog = usePublisher(openNewAudioDialog$);

  return (
    <ButtonWithTooltip
      title={'Insert Audio'}
      aria-label="insert-audio"
      onClick={() => {
        openNewAudioDialog();
      }}
    >
      <AudioFileIcon fontSize="inherit" />
    </ButtonWithTooltip>
  );
};
