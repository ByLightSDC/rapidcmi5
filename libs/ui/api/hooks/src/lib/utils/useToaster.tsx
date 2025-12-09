import Typography from '@mui/material/Typography';
import { useNotifications } from '@toolpad/core';

export type ToasterProps = {
  message: string;
  severity?: 'error' | 'success' | 'warning' | 'info' | undefined;
  autoHideDuration?: number | undefined;
  preventDuplicate?: boolean | undefined;
};

export const useToaster = () => {
  const notifications = useNotifications();

  const displayToaster = ({
    message,
    severity,
    autoHideDuration = 5000,
    preventDuplicate = true,
  }: ToasterProps) => {
    let key = undefined;
    if (preventDuplicate) {
      // Prevent duplicate messages by providing a key.
      // useNotifications will automatically deduplicate any notifications with
      // the same key.
      // Create the key by Base64 encoding the message. This will ensure that
      // unique messages have unique keys and duplicate messages have duplicate
      // keys.
      // Note: once a notification closes by any method, the same message can
      // then be correctly displayed again because there is no active duplicate.
      key = btoa(message);
    }

    const messageFormatted = (
      <Typography sx={{ whiteSpace: 'pre-line' }}>{message}</Typography>
    );

    notifications.show(messageFormatted, {
      key: key,
      severity: severity,
      autoHideDuration: autoHideDuration,
    });
  };

  return displayToaster;
};
