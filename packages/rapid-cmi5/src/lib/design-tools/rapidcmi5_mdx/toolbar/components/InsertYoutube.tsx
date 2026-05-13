import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { useTheme } from '@mui/material';
import { ButtonMinorUi } from '@rapid-cmi5/ui';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';
import { YoutubeDialog } from '../../plugins/youtube/YoutubeDialog';

export const InsertYoutube = ({ isDrawer }: { isDrawer?: boolean }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const theme = useTheme();

  return (
    <>
      {isDrawer ? (
        <ButtonMinorUi
          title="Insert YouTube Video"
          aria-label="insert-youtube"
          startIcon={
            <>
              <AddIcon
                fontSize="large"
                sx={{
                  color: theme.palette.primary.main,
                  fill: theme.palette.primary.main,
                }}
              />
              <YouTubeIcon
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
          onClick={() => setDialogOpen(true)}
        >
          YouTube
        </ButtonMinorUi>
      ) : (
        <MUIButtonWithTooltip
          title="Insert YouTube Video"
          aria-label="insert-youtube"
          onClick={() => setDialogOpen(true)}
        >
          <YouTubeIcon fontSize="small" />
        </MUIButtonWithTooltip>
      )}
      <YoutubeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};
