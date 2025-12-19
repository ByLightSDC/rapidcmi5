import { useDispatch, useSelector } from 'react-redux';
import { modal, setModal } from '@rapid-cmi5/ui/branded';

/* Branded */
import { ModalDialog } from '@rapid-cmi5/ui/branded';
import { useContext, useEffect, useState } from 'react';
import {
  DialogContent,
  DialogContentText,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { GitContext } from '../session/GitContext';
import { publishPcteModalId } from '../../../rapidcmi5_mdx/modals/constants';

/**
 * Select Repo, Course, AU
 * @returns
 */
export function PublishPcteDialogs() {
  const dispatch = useDispatch();
  const modalObj = useSelector(modal);
  const { publishToPCTE, currentRepo, resolvePCTEProjects } =
    useContext(GitContext);

  const [isCreatingNewRepo, setIsCreatingNewRepo] = useState<boolean>(false);
  const [newRepoName, setNewRepoName] = useState<string>('');
  const [pcteProjects, setPcteProjects] = useState<any[]>([]);
  const [selectedRepoDest, setSelectedRepoDest] = useState<string>('');

  const handleRepoDestChange = (value: string) => {
    if (value === 'NEW_REPO') {
      setIsCreatingNewRepo(true);
      setSelectedRepoDest('');
    } else {
      setIsCreatingNewRepo(false);
      setSelectedRepoDest(value);
    }
  };

  const handlePublishPcte = (buttonIndex: number) => {
    if (buttonIndex === 1) {
      if (currentRepo) {
        const repoDest = isCreatingNewRepo ? newRepoName : selectedRepoDest;
        publishToPCTE(currentRepo, repoDest);
      }
    }
    dispatch(setModal({ type: '', id: null, name: null }));
  };

  useEffect(() => {
    async function getAvailablePcteProjects() {
      try {
        const projects = await resolvePCTEProjects();
        setPcteProjects(projects);
      } catch (e) {
        console.error('Could not get available projects from PCTE');
      }
    }
    getAvailablePcteProjects();
  }, []);

  return (
    <div data-testid="modals">
      {modalObj.type !== '' && (
        <ModalDialog
          testId={publishPcteModalId}
          buttons={['Cancel', 'Publish']}
          dialogProps={{
            fullWidth: true,
            open: modalObj.type === publishPcteModalId,
          }}
          message=""
          title="Publish PCTE"
          handleAction={handlePublishPcte}
        >
          <DialogContent>
            <DialogContentText>
              You will be publishing this repository to PCTE : {currentRepo}
            </DialogContentText>

            <FormControl fullWidth margin="dense">
              <InputLabel>Select Repository Destination in PCTE</InputLabel>
              <Select
                value={isCreatingNewRepo ? 'NEW_REPO' : selectedRepoDest}
                onChange={(e) => handleRepoDestChange(e.target.value)}
                required
              >
                {pcteProjects.map((repo) => (
                  <MenuItem key={repo.name} value={repo.name}>
                    {repo.name}
                  </MenuItem>
                ))}
                <MenuItem value="NEW_REPO">Create New Repository</MenuItem>
              </Select>
            </FormControl>
            {/* Input Field for New Repository Name */}
            {isCreatingNewRepo && (
              <TextField
                fullWidth
                margin="dense"
                label="New Repository Name"
                variant="outlined"
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
                required
              />
            )}
          </DialogContent>
        </ModalDialog>
      )}
    </div>
  );
}

export default PublishPcteDialogs;
