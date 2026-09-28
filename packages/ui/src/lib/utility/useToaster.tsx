import Typography from '@mui/material/Typography';
import { useNotifications } from '@toolpad/core';
import { useCallback } from 'react';

export type ToasterProps = {
  message: string;
  severity?: 'error' | 'success' | 'warning' | 'info' | undefined;
  autoHideDuration?: number | undefined;
  preventDuplicate?: boolean | undefined;
};

export const useToaster = () => {
  const notifications = useNotifications();

  return useCallback(
    ({
      message,
      severity,
      autoHideDuration = 5000,
      preventDuplicate = true,
    }: ToasterProps) => {
      const formattedMessage = (
        <Typography sx={{ whiteSpace: 'pre-line' }}>{message}</Typography>
      );

      notifications.show(formattedMessage, {
        key: preventDuplicate ? message : undefined,
        severity,
        autoHideDuration,
      });
    },
    [notifications],
  );
};
