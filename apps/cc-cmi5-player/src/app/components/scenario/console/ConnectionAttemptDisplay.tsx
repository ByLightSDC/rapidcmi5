import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ConnectionState, AlertSeverity } from './constants';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { ButtonMinorUi } from '@rapid-cmi5/ui';

const MAX_SECONDS_COUNTDOWN = 10;
const MAX_CONNECTION_RETRYS = 3;

/**
 * Display UI to indicate to the user the status of the connection process.
 * If waiting to connect, show a Connecting... message.
 * If success, display nothing.
 * If error, show a countdown for a second attempt at connection.
 * If still in error after all attempts, display a button to manually connect.
 * @param isConnected True if a connection has been established.
 * @param numConnectionAttempts The total number of times connecting has been tried.
 * @param errorMsg Empty string when no error, otherwise contains guacamole error.
 * @param connectionFunction The function to call to try again to connect.
 * @constructor
 */
export default function ConnectionAttemptDisplay({
  isConnected,
  numConnectionAttempts,
  errorMsg,
  connectionFunction,
}: {
  isConnected: boolean;
  numConnectionAttempts: number;
  errorMsg: string;
  connectionFunction: any;
}) {
  const [connectionState, setConnectionState] = useState(
    ConnectionState.Connecting,
  );

  const [severity, setSeverity] = useState<AlertSeverity | undefined>(
    AlertSeverity.info,
  );

  const [timerDisplay, setTimerDisplay] = useState(0);

  // used to clear timers on unmount
  const timerId = useRef<ReturnType<typeof setTimeout> | number>(0);

  /**
   * Always clear any timer on dismount.
   */
  useEffect(() => {
    return () => {
      clearTimeout(timerId.current);
    };
  }, []);

  /**
   * If there are seconds left, wait one second and check again.
   * If there are no seconds left, try to connect.
   */
  const updateReconnectCountdown = useCallback(
    (secondsLeft: number) => {
      clearTimeout(timerId.current);
      setTimerDisplay(secondsLeft);

      if (secondsLeft > 0) {
        timerId.current = setTimeout(() => {
          updateReconnectCountdown(secondsLeft - 1);
        }, 1000);
      } else {
        connectionFunction();
      }
    },
    [connectionFunction],
  );

  /**
   * Set the state by determining if there is an error message.
   */
  useEffect(() => {
    if (errorMsg === '') {
      if (isConnected) {
        updateConnectionState(ConnectionState.Success);
      } else {
        updateConnectionState(ConnectionState.Connecting);
      }
    } else {
      if (numConnectionAttempts <= MAX_CONNECTION_RETRYS) {
        updateConnectionState(ConnectionState.ErrorRetry);
        updateReconnectCountdown(MAX_SECONDS_COUNTDOWN);
      } else {
        updateConnectionState(ConnectionState.ErrorFinal);
      }
    }
  }, [isConnected, errorMsg, updateReconnectCountdown, numConnectionAttempts]);

  /**
   * Set the connection state and alter the color of the alert.
   * @param state
   */
  const updateConnectionState = (state: ConnectionState) => {
    setConnectionState(state);

    switch (state) {
      case ConnectionState.Connecting:
        setSeverity(AlertSeverity.info);
        break;
      case ConnectionState.Success:
        setSeverity(AlertSeverity.success);
        break;
      case ConnectionState.ErrorRetry:
        setSeverity(AlertSeverity.warning);
        break;
      case ConnectionState.ErrorFinal:
        setSeverity(AlertSeverity.error);
        break;
    }
  };

  /**
   * User has decided not to wait for the countdown.
   * Clear the timer and try to connect now.
   */
  const onRetryNowClick = () => {
    clearTimeout(timerId.current);
    connectionFunction();
  };

  return (
    <div>
      {connectionState === ConnectionState.Success ? (
        <div></div>
      ) : (
        <div style={{ padding: '12px' }}>
          <Alert severity={severity} sx={{ width: 'auto', maxWidth: '580px' }}>
            {connectionState === ConnectionState.Connecting && 'Connecting...'}
            {connectionState === ConnectionState.ErrorRetry && (
              <Stack>
                <Box>Error</Box>
                <Box>{errorMsg}</Box>
                <Box>
                  Retry attempt {numConnectionAttempts} of{' '}
                  {MAX_CONNECTION_RETRYS} in {timerDisplay} seconds...
                </Box>
                <Box>
                  <ButtonMinorUi
                    startIcon={<ArrowBackIosIcon />}
                    onClick={onRetryNowClick}
                  >
                    Retry Now
                  </ButtonMinorUi>
                </Box>
              </Stack>
            )}
            {connectionState === ConnectionState.ErrorFinal && (
              <Stack>
                <Box>Error</Box>
                <Box>{errorMsg}</Box>
                <Box>
                  <ButtonMinorUi
                    startIcon={<ArrowBackIosIcon />}
                    onClick={onRetryNowClick}
                  >
                    Retry Again
                  </ButtonMinorUi>
                </Box>
              </Stack>
            )}
          </Alert>
        </div>
      )}
    </div>
  );
}
