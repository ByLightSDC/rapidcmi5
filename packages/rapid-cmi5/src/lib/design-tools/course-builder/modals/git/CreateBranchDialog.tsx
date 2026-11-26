import { useRef, useState } from 'react';
import { Box, TextField } from '@mui/material';
import { ModalDialog } from '@rapid-cmi5/ui';
import { getBranchNameError } from '../../GitViewer/utils/branchNames';

export function CreateBranchDialog({
  currentBranch,
  branches,
  onCreate,
  onClose,
}: {
  currentBranch: string;
  branches: string[];
  onCreate: (branch: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const inFlight = useRef(false);
  const validationError = getBranchNameError(name, branches);

  const create = async () => {
    if (inFlight.current) return;
    if (validationError) {
      setError(validationError);
      return;
    }
    inFlight.current = true;
    setCreating(true);
    setError('');
    try {
      await onCreate(name);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      inFlight.current = false;
      setCreating(false);
    }
  };

  return (
    <ModalDialog
      title="Create Branch"
      message={`Create a branch from ${currentBranch} and switch to it. Push when you are ready to publish it.`}
      dialogProps={{
        open: true,
        'aria-label': 'Create Branch',
        onClose: () => {
          if (!inFlight.current) onClose();
        },
      }}
      buttons={['Cancel', 'Create Branch']}
      handleAction={(index) => {
        if (index === 0) onClose();
        else void create();
      }}
      disableSubmit={Boolean(validationError)}
      disableButtons={creating}
      isLoading={creating}
      alertMessage={error}
    >
      <Box
        component="form"
        sx={{ px: 3, pt: 2 }}
        onSubmit={(event) => {
          event.preventDefault();
          void create();
        }}
      >
        <TextField
          autoFocus
          fullWidth
          required
          label="Branch Name"
          placeholder="feature/new-lesson"
          value={name}
          disabled={creating}
          error={Boolean(name && validationError)}
          helperText={
            name
              ? validationError
              : 'Use / to group branches, such as feature/new-lesson.'
          }
          onChange={(event) => {
            setName(event.target.value);
            setError('');
          }}
        />
      </Box>
    </ModalDialog>
  );
}
