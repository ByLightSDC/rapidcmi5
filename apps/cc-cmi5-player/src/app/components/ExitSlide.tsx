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
    console.log('[ExitSlide] Exit Course clicked — sending terminated verb...');

    if (checkForDevMode()) {
      console.log('[ExitSlide] 🧪 Dev/standalone mode detected');
      console.log('[ExitSlide] Would send: terminated verb to LRS');
      const launchParams = cmi5Instance.getLaunchParameters();
      console.log('[ExitSlide] Launch params:', launchParams);
      console.log('[ExitSlide] Would redirect to: returnURL (not available in dev mode)');
      logger.debug('Dev mode — skipping LRS call and returnURL redirect', undefined, 'lms');
      setIsExiting(false);
      return;
    }

    try {
      await sendTerminatedVerb();
      console.log('[ExitSlide] ✅ Terminated verb sent successfully');
      logger.info('Terminated verb sent successfully', undefined, 'lms');
    } catch (error) {
      console.error('[ExitSlide] ❌ Error sending terminated verb', error);
      logger.error('Error sending terminated verb', error, 'lms');
      // Don't block the exit even if the LRS call fails
    }

    const returnURL = cmi5Instance.getLaunchData().returnURL;
    console.log('[ExitSlide] returnURL:', returnURL);
    if (returnURL) {
      window.location.href = returnURL;
    } else {
      console.warn('[ExitSlide] ⚠️ No returnURL in CMI5 launch data');
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
        Ready to leave?
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center">
        Your progress has been saved. You can return and pick up where you left off at any time.
      </Typography>
      <Button
        variant="contained"
        size="large"
        startIcon={isExiting ? <CircularProgress size={18} color="inherit" /> : <ExitToAppIcon />}
        onClick={handleExit}
        disabled={isExiting}
      >
        {isExiting ? 'Exiting...' : 'Exit Course'}
      </Button>
    </Box>
  );
}
