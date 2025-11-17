import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { selectSnackStatus, setSnackStatus } from './slice';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  },
);

export function FrontendUiSnack() {
  const dispatch = useDispatch();
  const snackStatus = useSelector(selectSnackStatus);
  const modalTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!snackStatus.open) {
      modalTimeout.current = undefined;
    }

    if (snackStatus.open) {
      if (modalTimeout.current !== undefined) {
        clearTimeout(modalTimeout.current);
      }
      modalTimeout.current = setTimeout(() => {
        dispatch(
          setSnackStatus({
            open: false,
            severity: snackStatus.severity,
            message: snackStatus.message,
          }),
        );
      }, 5000);
    }
  }, [dispatch, snackStatus]);

  return (
    <Snackbar
      open={snackStatus.open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert severity={snackStatus.severity}>{snackStatus.message}</Alert>
    </Snackbar>
  );
}
