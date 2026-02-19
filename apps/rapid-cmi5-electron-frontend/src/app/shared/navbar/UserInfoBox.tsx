import { AppDispatch, useMDStyleIcons } from '@rapid-cmi5/react-editor';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import {
  modal,
  setModal,
  themeColor,
  setTheme,
  resetPersistance,
} from '@rapid-cmi5/ui';

import { useLogOut } from '../../hooks/useLogOut';

/* Branded */
import { ModalDialog } from '@rapid-cmi5/ui';

/*Material*/
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import ListIcon from '@mui/icons-material/List';

/* Icons */
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Brightness6Icon from '@mui/icons-material/Brightness6';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import KeyIcon from '@mui/icons-material/Key';
import { useEffect, useState } from 'react';
import ConfigureSSOForm from './ssoModal';
import { GitCredentials, SSOConfig } from '@rapid-cmi5/cmi5-build-common';

import {
  gitCredentials,
  isSSOEnabled,
  setAuth,
  setAuthIdToken,
  setAuthToken,
  setDevopsApi,
  setGitCredentials,
  setIsAuthenticated,
  setIsSSOEnabled,
} from '@rapid-cmi5/keycloak';
import ConfigureGitCredentialsForm, {
  configureGitCredsModalId,
  defaultGitCreds,
} from './gitModal';
import JsonFileEditorModal, { configureCmi5ConfigModalId } from './ConfigModal';

/**
 * @typedef propTypes - User Info Box props
 * @property {HTMLElement | null} anchorEl Display Element to anchor the User Info to (hidden when null)
 * @property {() => void} onClose Function to call to close the User Info menu
 */
type propTypes = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  authEnabled: boolean;
};

const clearStoragePromptModalId = 'reset-persistence';
export const configureSSOPromptModalId = 'configure-sso';

export function detectIsElectron(): boolean {
  return typeof window !== 'undefined' && !!(window as any).fsApi;
}

export default function UserInfoBox({
  anchorEl,
  onClose,
  authEnabled,
}: propTypes) {
  const [ssoInfo, setSSOInfo] = useState<SSOConfig>({
    devopsApiUrl: 'https://',
    keycloakClientId: '',
    keycloakRealm: '',
    keycloakScope: '',
    keycloakUrl: 'https://',
    username: '',
    password: '',
  });

  const selGitCredentials = useSelector(gitCredentials);

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const appThemeColor = useSelector(themeColor);
  const logOut = useLogOut();
  const modalObj = useSelector(modal);
  const { gitIcon } = useMDStyleIcons();
  const [
    fileContentsStringOrParsedObject,
    setFileContentsStringOrParsedObject,
  ] = useState('');
  //#region About
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);

  const handleAboutDialogClose = () => {
    setAboutDialogOpen(false);
  };

  const getSSOConfig = async () => {
    if (detectIsElectron()) {
      const settings = await window.userSettingsApi.getSSOConfig();
      if (settings) {
        dispatch(setDevopsApi(settings.devopsApiUrl));
        setSSOInfo(settings);
        // now lets try to login if its valid
        const tokenResponse = await window.userSettingsApi.loginSSO();

        dispatch(setAuthToken(tokenResponse.access_token));
        dispatch(setIsAuthenticated(true));
        dispatch(setIsSSOEnabled(true));
      }
    } else {
      console.log('Web app');
    }
  };
  const getGitCreds = async () => {
    if (detectIsElectron()) {
      const creds = await window.userSettingsApi.getGitCredentials();
      dispatch(setGitCredentials(creds));
    } else {
      console.log('Web app');
    }
  };
  useEffect(() => {
    getGitCreds();
  }, []);

  useEffect(() => {
    getSSOConfig();
  }, []);
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

  const handlePlayerConfig = async () => {
    if (detectIsElectron()) {
      const config = await window.fsApi.readPlayerConfig();
      setFileContentsStringOrParsedObject(config);
      dispatch(
        setModal({
          type: configureCmi5ConfigModalId,
          id: null,
          name: null,
          meta: {
            title: 'Configure SSO',
          },
        }),
      );
      onClose();
      console.log('config', config);
    } else {
      console.log('Web app');
    }
  };

  const handleThemeToggle = () => {
    const newTheme = appThemeColor === 'dark' ? 'light' : 'dark';
    console.log('setting theme', newTheme);

    localStorage.setItem('themeColor', newTheme);

    dispatch(setTheme(newTheme));
    onClose();
  };

  const handleConfigureSSO = () => {
    dispatch(
      setModal({
        type: configureSSOPromptModalId,
        id: null,
        name: null,
        meta: {
          title: 'Configure SSO',
        },
      }),
    );
    onClose();
  };

  const handleConfigureGit = () => {
    dispatch(
      setModal({
        type: configureGitCredsModalId,
        id: null,
        name: null,
        meta: {
          title: 'Configure Git',
        },
      }),
    );
    onClose();
  };

  const handleSaveGitCreds = (data: GitCredentials) => {
    if (detectIsElectron()) {
      window.userSettingsApi.setGitCredentials(data);
      dispatch(setGitCredentials(data));
    } else {
      console.log('Web app');
    }
  };

  const handleSaveSSO = async (data: SSOConfig) => {
    // Handle saving SSO config - implement as needed
    if (detectIsElectron()) {
      await window.userSettingsApi.setSSOConfig(data);
      setSSOInfo(data);
    } else {
      console.log('Web app');
    }
    return;
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
  const handleCloseModal = () => {
    dispatch(setModal({ type: '', id: null, name: null }));
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

        {modalObj.type === configureSSOPromptModalId && (
          <ConfigureSSOForm
            defaultData={ssoInfo}
            modalObj={modalObj}
            handleCloseModal={handleCloseModal}
            handleModalAction={handleCloseModal}
            handleSaveSSO={handleSaveSSO}
          />
        )}
        {modalObj.type === configureGitCredsModalId && (
          <ConfigureGitCredentialsForm
            defaultData={selGitCredentials || defaultGitCreds}
            modalObj={modalObj}
            handleCloseModal={handleCloseModal}
            handleModalAction={handleCloseModal}
            handleSaveGitCreds={handleSaveGitCreds}
          />
        )}
        {modalObj.type === configureCmi5ConfigModalId && (
          <JsonFileEditorModal
            modalId="configureCmi5ConfigModalId"
            modalObj={modalObj}
            title="CMI5 Player Config"
            filename="cfg.json"
            initialJson={fileContentsStringOrParsedObject}
            handleCloseModal={handleCloseModal}
            handleSaveJson={(parsed) => {
              window.fsApi.writePlayerConfig(parsed);
              // 1) write `raw` back to the file
              // 2) optionally store `parsed` in state for runtime use
            }}
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
        <MenuItem onClick={handleConfigureSSO}>
          <ListItemIcon>
            <KeyIcon />
          </ListItemIcon>
          <ListItemText
            primary={'SSO'}
            primaryTypographyProps={{
              color: 'secondary.contrastText',
              variant: 'body2',
            }}
          />
        </MenuItem>
        <MenuItem onClick={handleConfigureGit}>
          <ListItemIcon>{gitIcon}</ListItemIcon>
          <ListItemText
            primary={'Git Credentials'}
            primaryTypographyProps={{
              color: 'secondary.contrastText',
              variant: 'body2',
            }}
          />
        </MenuItem>
        <MenuItem onClick={handlePlayerConfig}>
          <ListItemIcon>
            <ListIcon />
          </ListItemIcon>
          <ListItemText
            primary={'Edit Player Config'}
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

        {authEnabled && (
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
        )}
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
