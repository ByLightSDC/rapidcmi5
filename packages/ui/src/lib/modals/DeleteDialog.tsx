/**
 * Quickly have deletion confirmations for actions using a modal
 */

import { useState } from 'react';
import { Alert, Box, TextField, Typography } from '@mui/material';
import { ModalDialog } from './ModalDialog';

export function DeleteDialog({
  confirmOpen,
  closeConfirm,
  objectType,
  confirmWord,
  itemLabel,
  onConfirm,
  isDeleting = false,
  error,
}: {
  confirmOpen: boolean;
  closeConfirm: () => void;
  objectType: string;
  confirmWord: string;
  itemLabel: string;
  onConfirm: () => void;
  isDeleting?: boolean;
  error?: string;
}) {
  const [confirmText, setConfirmText] = useState('');

  const canSubmit =
    !isDeleting && confirmText.toLowerCase() === confirmWord.toLowerCase();

  const handleClose = () => {
    setConfirmText('');
    closeConfirm();
  };

  const handleAction = (index: number) => {
    if (index === 0) {
      handleClose();
      return;
    }
    if (canSubmit) onConfirm();
  };

  return (
    <ModalDialog
      testId="delete-dialog"
      title={`Delete ${objectType}`}
      titleSeverity="warning"
      buttons={['Cancel', 'Delete']}
      dialogProps={{ open: confirmOpen, onClose: handleClose, fullWidth: true }}
      maxWidth="xs"
      disableSubmit={!canSubmit}
      isLoading={isDeleting}
      alertMessage={error}
      alertSeverity="error"
      handleAction={handleAction}
    >
      <Box
        sx={{
          px: 3,
          pt: 1,
          pb: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            You are about to permanently delete:
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 1,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {itemLabel}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Type <strong>{confirmWord}</strong> to confirm:
          </Typography>
          <TextField
            autoFocus
            autoComplete="off"
            size="small"
            fullWidth
            placeholder={`Type "${confirmWord}" to confirm`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSubmit) onConfirm();
              if (e.key === 'Escape') handleClose();
            }}
            error={
              confirmText.length > 0 &&
              confirmText.toLowerCase() !== confirmWord.toLowerCase()
            }
            inputProps={{
              'data-testid': 'delete-confirm-input',
              spellCheck: false,
            }}
          />
        </Box>
        <Alert severity="warning">
          This action is permanent and cannot be undone.
        </Alert>
      </Box>
    </ModalDialog>
  );
}
