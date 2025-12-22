import { AppDispatch } from '@rapid-cmi5/react-editor';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { modal, setModal, themeColor, setTheme, resetPersistance } from '@rapid-cmi5/ui';

import { useLogOut } from '../../hooks/useLogOut';

/* Branded */
import {
  ModalDialog,
} from '@rapid-cmi5/ui';

/*Material*/
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Stack } from '@mui/system';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/* Icons */
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Brightness6Icon from '@mui/icons-material/Brightness6';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useState } from 'react';

/**
 * @typedef propTypes - User Info Box props
 * @property {HTMLElement | null} anchorEl Display Element to anchor the User Info to (hidden when null)
 * @property {() => void} onClose Function to call to close the User Info menu
 */
type propTypes = { anchorEl: HTMLElement | null; onClose: () => void };

const clearStoragePromptModalId = 'reset-persistence';

export default function UserInfoBox({ anchorEl, onClose }: propTypes) {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const appThemeColor = useSelector(themeColor);
  const logOut = useLogOut();
  const modalObj = useSelector(modal);

  //#region About
  const [isAboutDisabled, setAboutDisabled] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
 
  const handleAboutDialogClose = () => {
    setAboutDialogOpen(false);
  };

  /**
   * Handles error returned from API call
   * @param {any} error error returned from api call
   */
  const handleInitialDataError = (error: string) => {
    // wont be able to view About Build Version Information
    setAboutDisabled(true);
  };
  //#endregion

  /**
   * Handles cancel and apply options for clearing storage
   * If applied, dispatches reset action to redux slices so they can reset
   * Clears modal
   * Navigates user to welcome page
   * @param {number} buttonIndex Which button option clicked
   */
  const handleClearStorage = (buttonIndex: number) => {
    if (buttonIndex === 1) {
      dispatch(resetPersistance());
      dispatch(setModal({ type: '', id: null, name: null }));
      //redirect to welcome
      navigate('/');
    } else {
      dispatch(setModal({ type: '', id: null, name: null }));
    }
  };

  const handleThemeToggle = () => {
    const newTheme = appThemeColor === 'dark' ? 'light' : 'dark';

    localStorage.setItem('themeColor', newTheme);

    dispatch(setTheme(newTheme));
    onClose();
  };

  const handleLogout = async () => {
    logOut();
  };

  /**
   * Prompts user on whether they want to clear app data
   * Closes options menu
   */
  const handlePromptClearStorage = () => {
    dispatch(
      setModal({
        id: null,
        meta: undefined,
        name: null,
        type: clearStoragePromptModalId,
      }),
    );
    onClose();
  };

  return (
    <section aria-label="user info">
      {/* dont fetch until the menu opens (anchor defined) to ensure that the authToken is set in queryHooksConfig */}

      <div data-testid="modals">
        <AboutBuildVersionDialog
          appThemeColor={appThemeColor}
          isOpen={aboutDialogOpen}
          onClose={handleAboutDialogClose}
        />
        {modalObj.type !== '' && (
          <ModalDialog
            testId={clearStoragePromptModalId}
            buttons={['Cancel', 'Clear Data']}
            dialogProps={{ open: modalObj.type === clearStoragePromptModalId }}
            message="This action will reset all app data including settings and form data."
            title="Clear Data"
            handleAction={handleClearStorage}
            maxWidth="xs"
          />
        )}
      </div>
      <Menu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        anchorReference="anchorEl"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(anchorEl)}
        onClose={onClose}
        sx={{ zIndex: 9999 }}
      >
        <MenuItem onClick={handleThemeToggle}>
          <ListItemIcon>
            <Brightness6Icon />
          </ListItemIcon>
          <ListItemText
            primary={appThemeColor === 'dark' ? 'LIGHT THEME' : 'DARK THEME'}
            primaryTypographyProps={{
              color: 'secondary.contrastText',
              variant: 'body2',
            }}
          />
        </MenuItem>
        <MenuItem onClick={handlePromptClearStorage}>
          <ListItemIcon>
            <DeleteForeverIcon
              sx={{
                transform: 'scaleX(-1)',
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary="Clear Data"
            primaryTypographyProps={{
              color: 'secondary.contrastText',
              variant: 'body2',
            }}
          />
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              color: 'secondary.contrastText',
              variant: 'body2',
            }}
          />
        </MenuItem>
      </Menu>
    </section>
  );
}

type tAboutProps = {
  appThemeColor: string;
  isOpen: boolean;
  onClose: () => void;
};
function AboutBuildVersionDialog(props: tAboutProps) {
  const { appThemeColor, isOpen, onClose } = props;
  return (
    <div data-testid="about-build-version-modal">
      <ModalDialog
        title={
          <img
            width={320}
            height={68}
            style={
              {
                //marginLeft: '12px',
                //marginTop: '5px',
                //marginRight: '24px',
              }
            }
            src={
              appThemeColor === 'light'
                ? `/assets/devops-portal/Logo_H_Color.png`
                : `/assets/devops-portal/Logo_Header_Dk_ROS.png`
            }
            alt="By Light RangeOS Logo"
          />
        }
        buttons={['OK']}
        dialogProps={{
          open: isOpen,
        }}
        handleAction={() => onClose()}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            paddingLeft: '24px',
          }}
        >
          {/* <Stack direction="column" style={{}}>
            <Typography variant="body2">
              <strong>Build ID: </strong>
              {`${versionData?.buildId}`}
            </Typography>
            <Typography variant="body2">
              <strong>Git Branch: </strong>
              {`${versionData?.gitBranch}`}
            </Typography>
            <Typography variant="body2">
              <strong>Git Commit: </strong>
              {`${versionData?.gitCommit}`}
            </Typography>
          </Stack> */}
        </Box>
      </ModalDialog>
    </div>
  );
}
