import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import { VisibilityOff, Visibility } from '@mui/icons-material';

interface CloneDialogProps {
  repos: Array<string>;
  open: boolean;
  handleClose: () => void;
  handleClone: (
    repoDirName: string,
    repoRemoteUrl: string,
    repoBranch: string,
    repoUsername: string,
    repoPassword: string,
  ) => void;
}

export default function CloneForm(props: CloneDialogProps) {
  const [inputRepoDirName, setInputRepoDirName] = React.useState<string>('');
  const [inputRemoteRepo, setInputRemoteRepo] = React.useState<string>('');
  const [inputRemoteRepoBranch, setInputRemoteRepoBranch] =
    React.useState<string>('main');
  const [inputRemoteRepoPassword, setInputRemoteRepoPassword] =
    React.useState<string>('');
  const [inputRemoteRepoUsername, setInputRemoteRepoUsername] =
    React.useState<string>('');

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };
  const { open, handleClose, repos, handleClone } = props;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();

          handleClone(
            inputRepoDirName,
            inputRemoteRepo,
            inputRemoteRepoBranch,
            inputRemoteRepoUsername,
            inputRemoteRepoPassword,
          );

          handleClose();
        },
      }}
    >
      <DialogTitle>Clone Repository</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Select a remote git repository to clone
        </DialogContentText>

        <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
          {/* Input for Repo Directory Name */}
          <InputLabel htmlFor="repo-dir-name">Repo Dir Name</InputLabel>
          <OutlinedInput
            id="repo-dir-name"
            type="text"
            value={inputRepoDirName}
            onChange={(e) => setInputRepoDirName(e.target.value)}
            placeholder="Input Repo Dir Name"
            label="Repo Dir Name"
          />
        </FormControl>

        <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
          {/* Input for Repo Directory Name */}
          <InputLabel htmlFor="repo-branch-name">Repo Branch Name</InputLabel>
          <OutlinedInput
            id="repo-branch-name"
            type="text"
            value={inputRemoteRepoBranch}
            onChange={(e) => setInputRemoteRepoBranch(e.target.value)}
            placeholder="Input Repo Branch Name"
            label="Repo Branch Name"
          />
        </FormControl>

        <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
          {/* Input for Repo Directory Name */}
          <InputLabel htmlFor="repo-branch-name">Repo Username</InputLabel>
          <OutlinedInput
            id="repo-branch-username"
            type="text"
            value={inputRemoteRepoUsername}
            onChange={(e) => setInputRemoteRepoUsername(e.target.value)}
            placeholder="Input Repo Username"
            label="Repo Username"
          />
        </FormControl>

        <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
          {/* Input for Remote Repo URL */}
          <InputLabel htmlFor="remote-repo-url">Repo Remote URL</InputLabel>
          <OutlinedInput
            id="remote-repo-url"
            type="text"
            value={inputRemoteRepo}
            onChange={(e) => setInputRemoteRepo(e.target.value)}
            placeholder="Input Repo Remote URL"
            label="Repo Remote URL"
          />
        </FormControl>

        <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
          {/* Password Input with Toggle Visibility */}
          <InputLabel htmlFor="outlined-adornment-password">
            Password
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? 'text' : 'password'}
            value={inputRemoteRepoPassword}
            onChange={(e) => setInputRemoteRepoPassword(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  onMouseUp={handleMouseUpPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit">Clone</Button>
      </DialogActions>
    </Dialog>
  );
}
