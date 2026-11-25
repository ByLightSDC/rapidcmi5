import { Box, Typography } from '@mui/material';
import { ModalDialog } from '@rapid-cmi5/ui';

interface RepositoryCompatibilityDialogProps {
  environment: 'browser' | 'desktop' | null;
  onClose: (proceed: boolean) => void;
}

export default function RepositoryCompatibilityDialog({
  environment,
  onClose,
}: RepositoryCompatibilityDialogProps) {
  return (
    <ModalDialog
      testId="repository-compatibility-dialog"
      title={
        environment === 'browser'
          ? 'Open an older Git project in the browser'
          : 'Open a browser project on desktop'
      }
      titleSeverity="warning"
      alertSeverity="warning"
      alertMessage="Chromium now blocks browser creation of .git and restricts writes inside it. Browser projects therefore use .rapid-git; the desktop app continues to use standard .git."
      buttons={
        environment === 'browser' ? ['Cancel', 'Copy and Open'] : ['Close']
      }
      dialogProps={{
        open: environment !== null,
        onClose: () => onClose(false),
        fullWidth: true,
      }}
      handleAction={(index) =>
        onClose(environment === 'browser' && index === 1)
      }
    >
      <Box sx={{ px: 3, pb: 2 }}>
        {environment === 'browser' ? (
          <>
            <Typography paragraph>
              This project has an older .git folder. Back up the project before
              continuing. Copy and Open copies its history, staged changes, and
              Git settings into .rapid-git once. Your files and original .git
              folder stay in place.
            </Typography>
            <Typography paragraph>
              After the copy, browser and desktop Git histories and settings are
              independent. Push and pull through your remote repository to share
              commits. Do not delete or rename the original .git folder to
              continue using desktop Git.
            </Typography>
            <Typography>
              Choose Cancel to leave the project unchanged.
            </Typography>
          </>
        ) : (
          <>
            <Typography paragraph>
              This project contains .rapid-git but no .git folder, so it cannot
              open in the desktop app yet. No conversion has been made.
            </Typography>
            <Box component="ol" sx={{ pl: 3 }}>
              <li>
                Close the project in the browser and back up the entire project
                folder, including hidden folders.
              </li>
              <li>
                In your file manager, enable hidden files and rename .rapid-git
                to .git. Rename only when no .git folder already exists.
              </li>
              <li>
                Return here and open the project again. The renamed folder
                retains your browser Git history, staged changes, and settings.
              </li>
            </Box>
            <Typography>
              To keep using the browser project separately, clone the remote
              into a different folder with the desktop app instead. Push any
              local browser commits first.
            </Typography>
          </>
        )}
      </Box>
    </ModalDialog>
  );
}
