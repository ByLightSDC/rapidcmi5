import { useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { cmi5Instance } from '../session/cmi5';
import { sendTerminatedVerb } from '../utils/LmsStatementManager';
import { checkForDevMode } from '../utils/DevMode';
import { logger } from '../debug';

/**
 * ExitSlide is a synthetic final slide always injected by the player.
 * It is never part of the course content — the player adds it automatically.
 *
 * When the user clicks Exit, it:
 * 1. Sends the CMI5 `terminated` verb to the LRS
 * 2. Redirects to the returnURL supplied in the CMI5 launch parameters
 *
 * In dev/test mode it skips the LRS call and just logs.
 */
export default function ExitSlide() {
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = async () => {
    setIsExiting(true);

    // For development, can be removed later -TODO.
    if (checkForDevMode()) {
      const launchParams = cmi5Instance.getLaunchParameters();
      logger.debug(
        'Dev/standalone mode detected. Skipping redirection and sending terminated verb to an LRS. Launch params are:',
        launchParams,
        'lms',
      );
      setIsExiting(false);
      return;
    }

    try {
      await sendTerminatedVerb();
      logger.info('Terminated verb sent successfully', undefined, 'lms');
    } catch (error) {
      logger.error('Error sending terminated verb', error, 'lms');
      // Don't block the exit even if the LRS call fails
    }

    // Return user to launcher if applicable.
    const returnURL = cmi5Instance.getLaunchData().returnURL;
    if (returnURL) {
      window.location.href = returnURL;
    } else {
      logger.warn('No returnURL in CMI5 launch data', undefined, 'lms');
      setIsExiting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 3,
        padding: 4,
      }}
    >
      <Typography variant="h4" color="text.primary" align="center">
        Ready to Leave?
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center">
        Your progress has been saved. You can return and pick up where you left
        off at any time.
      </Typography>
      <Button
        variant="contained"
        size="large"
        startIcon={
          isExiting ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <ExitToAppIcon />
          )
        }
        onClick={handleExit}
        disabled={isExiting}
      >
        {isExiting ? 'Exiting...' : 'Exit Course'}
      </Button>
    </Box>
  );
}
