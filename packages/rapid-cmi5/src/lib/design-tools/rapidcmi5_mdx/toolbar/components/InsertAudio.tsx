import { usePublisher } from '@mdxeditor/gurx';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import { openNewAudioDialog$ } from '../../plugins/audio';
import { ButtonWithTooltip } from '@mdxeditor/editor';
/**
 * Icons
 */
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material';
import { ButtonMinorUi } from '@rapid-cmi5/ui';
/**
 * A toolbar button that allows the user to insert audio.
 * For this button to work, you must include `audioPlugin`.
 * @group Toolbar Components
 */
export const InsertAudio = ({ isDrawer }: { isDrawer?: boolean }) => {
  const openNewAudioDialog = usePublisher(openNewAudioDialog$);
  const theme = useTheme();

  return (
    <>
      {isDrawer ? (
        <ButtonMinorUi
          title="Insert Audio"
          aria-label="insert-audio"
          startIcon={
            <>
              <AddIcon
                fontSize="large"
                sx={{
                  color: theme.palette.primary.main,
                  fill: theme.palette.primary.main,
                }}
              />
              <AudioFileIcon
                fontSize="small"
                sx={{ fill: theme.palette.primary.main, marginRight: 1 }}
              />
            </>
          }
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: 1,
          }}
          onClick={() => {
            openNewAudioDialog();
          }}
        >
          Audio
        </ButtonMinorUi>
      ) : (
        <ButtonWithTooltip
          title="Insert Audio"
          aria-label="insert-audio"
          onClick={() => {
            openNewAudioDialog();
          }}
        >
          <AudioFileIcon fontSize="small" />
        </ButtonWithTooltip>
      )}
    </>
  );
};
