import { useCallback, useContext, useRef, useState } from 'react';
import { CommonAppModalState, ModalDialog } from '@rapid-cmi5/ui';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SecurityIcon from '@mui/icons-material/Security';
import { CertInfo } from '@rapid-cmi5/cmi5-build-common';
import { UserConfigContext } from '../../contexts/UserConfigContext';

export const configureCertsModalId = 'configureCertsModalId';

export default function CertificateManagerModal({
  modalObj,
  handleCloseModal,
}: {
  modalObj: CommonAppModalState;
  handleCloseModal: () => void;
}) {
  const { certs, addCert, removeCert } = useContext(UserConfigContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setError(undefined);
      setLoading(true);

      try {
        const contents = await file.text();
        await addCert(file.name, contents);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to add certificate');
      } finally {
        setLoading(false);
        // Reset the input so the same file can be re-selected
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [addCert],
  );

  const handleRemove = useCallback(
    async (cert: CertInfo) => {
      setError(undefined);
      try {
        await removeCert(cert.id);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to remove certificate');
      }
    },
    [removeCert],
  );

  return (
    <ModalDialog
      testId={configureCertsModalId}
      buttons={['Close']}
      dialogProps={{
        open: modalObj.type === configureCertsModalId,
      }}
      handleAction={handleCloseModal}
      title="TLS Certificates"
      maxWidth="sm"
    >
      <Box sx={{ py: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add custom CA certificates for connecting to servers with self-signed
          or internal certificates. Certificates must be in PEM format (.pem,
          .crt, .cer).
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setError(undefined)}
          >
            {error}
          </Alert>
        )}

        {certs.length > 0 ? (
          <List dense>
            {certs.map((cert) => (
              <ListItem
                key={cert.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemove(cert)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <SecurityIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={cert.filename}
                  secondary={
                    cert.subject ??
                    `Added ${new Date(cert.addedAt).toLocaleDateString()}`
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 3 }}
          >
            No custom certificates installed.
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pem,.crt,.cer"
            hidden
            onChange={handleFileSelect}
          />
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? 'Adding…' : 'Upload Certificate'}
          </Button>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: 'block' }}
        >
          Note: A restart is recommended after adding or removing certificates.
        </Typography>
      </Box>
    </ModalDialog>
  );
}
