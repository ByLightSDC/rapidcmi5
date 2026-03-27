import { AppDispatch, useMDStyleIcons } from '@rapid-cmi5/react-editor';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import {
  modal,
  setModal,
  themeColor,
  setTheme,
  resetPersistance,
  ModalDialog,
} from '@rapid-cmi5/ui';

/* Material */
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';

/* Icons */
import ListIcon from '@mui/icons-material/List';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Brightness6Icon from '@mui/icons-material/Brightness6';

import SecurityIcon from '@mui/icons-material/Security';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import KeyIcon from '@mui/icons-material/Key';

import { useContext, useState } from 'react';

import CertificateManagerModal, {
  configureCertsModalId,
} from '../modals/CertificateManagerModal';
import { detectIsElectron } from '../../utils/appType';
import JsonFileEditorModal from '../modals/JsonFileEditorModal';
import {
  configureGlobalGitConfigModalId,
  ConfigureGlobalGitConfigForm,
} from '../modals/GitGlobalConfigModal';
import ConfigureSSOForm, {
  configureSSOPromptModalId,
} from '../modals/SsoConfigModal';
import { AuthContext } from '../../contexts/AuthContext';
import { UserConfigContext } from '../../contexts/UserConfigContext';
import { configureSSOCredsModalId } from '../modals/ElectronLoginModal';

interface UserInfoBoxProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const clearStoragePromptModalId = 'reset-persistence';
const configureCmi5CFGModalId = 'configureCmi5CFGModalId';

export default function UserInfoBox({ anchorEl, onClose }: UserInfoBoxProps) {
  const isElectron = detectIsElectron();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const appThemeColor = useSelector(themeColor);
  const modalObj = useSelector(modal);
  const { gitIcon } = useMDStyleIcons();
  const { logout, token } = useContext(AuthContext);
  const {
    setGitUser,
    gitUser,
    setSSOConfig,
    ssoConfig,
    gitCredentials,
    setGitCredentials,
  } = useContext(UserConfigContext);

  const [playerConfigContents, setPlayerConfigContents] = useState('');
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);

  // ── Modal helpers ──

  const handleCloseModal = () => {
    dispatch(setModal({ type: '', id: null, name: null }));
  };

  const openModal = (type: string, title: string) => {
    dispatch(setModal({ type, id: null, name: null, meta: { title } }));
    onClose();
  };

  // ── Actions ──

  const handleThemeToggle = () => {
    const newTheme = appThemeColor === 'dark' ? 'light' : 'dark';
    localStorage.setItem('themeColor', newTheme);
    dispatch(setTheme(newTheme));
    onClose();
  };

  const handlePlayerConfig = async () => {
    if (isElectron) {
      const config = await window.fsApi.readPlayerConfig();
      setPlayerConfigContents(config);
      openModal(configureCmi5CFGModalId, 'CMI5 Player Config');
    }
  };

  const handleClearStorage = (buttonIndex: number) => {
    if (buttonIndex === 1) {
      dispatch(resetPersistance());
      navigate('/');
    }
    handleCloseModal();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleLogin = () => {
    openModal(configureSSOCredsModalId, 'Login to SSO');
    onClose();
  };

  return (
    <section aria-label="user info">
      <div data-testid="modals">
        <AboutBuildVersionDialog
          appThemeColor={appThemeColor}
          isOpen={aboutDialogOpen}
          onClose={() => setAboutDialogOpen(false)}
        />

        {modalObj.type === clearStoragePromptModalId && (
          <ModalDialog
            testId={clearStoragePromptModalId}
            buttons={['Cancel', 'Clear Data']}
            dialogProps={{ open: true }}
            message="This action will reset all app data including settings and form data."
            title="Clear Data"
            handleAction={handleClearStorage}
            maxWidth="xs"
          />
        )}

        {modalObj.type === configureCertsModalId && (
          <CertificateManagerModal
            modalObj={modalObj}
            handleCloseModal={handleCloseModal}
          />
        )}
        {modalObj.type === configureSSOPromptModalId && (
          <ConfigureSSOForm
            defaultData={
              ssoConfig || {
                ssoEnabled: false,
                keycloakClientId: '',
                keycloakRealm: '',
                keycloakScope: '',
                keycloakUrl: '',
                rangeRestApiUrl: '',
                quizBankApiUrl: '',
              }
            }
            modalObj={modalObj}
            handleCloseModal={handleCloseModal}
            handleModalAction={handleCloseModal}
            handleSaveSSO={setSSOConfig}
          />
        )}

        {modalObj.type === configureGlobalGitConfigModalId && (
          <ConfigureGlobalGitConfigForm
            defaultData={{
              authorEmail: gitUser?.authorEmail ?? '',
              authorName: gitUser?.authorName ?? '',
              password: gitCredentials?.password ?? '',
              username: gitCredentials?.username ?? '',
            }}
            modalObj={modalObj}
            handleCloseModal={handleCloseModal}
            handleModalAction={handleCloseModal}
            handleSaveGitConfig={setGitUser}
            handleSaveGitCredentials={setGitCredentials}
          />
        )}

        {modalObj.type === configureCmi5CFGModalId && (
          <JsonFileEditorModal
            modalId={configureCmi5CFGModalId}
            modalObj={modalObj}
            title="CMI5 Player Config"
            filename="cfg.json"
            initialJson={playerConfigContents}
            handleCloseModal={handleCloseModal}
            handleSaveJson={(text) => {
              window.fsApi.writePlayerConfig(text);
            }}
          />
        )}
      </div>

      <Menu
        id="user-info-menu"
        anchorEl={anchorEl}
        keepMounted
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        open={Boolean(anchorEl)}
        onClose={onClose}
        sx={{ zIndex: 9999 }}
      >
        <MenuItem onClick={handleThemeToggle}>
          <ListItemIcon>
            <Brightness6Icon />
          </ListItemIcon>
          <MenuItemText
            label={appThemeColor === 'dark' ? 'LIGHT THEME' : 'DARK THEME'}
          />
        </MenuItem>

        <MenuItem
          onClick={() =>
            openModal(configureGlobalGitConfigModalId, 'Configure Git')
          }
        >
          <ListItemIcon>{gitIcon}</ListItemIcon>
          <MenuItemText label="Git Config" />
        </MenuItem>

        {isElectron && (
          <>
            <MenuItem
              onClick={() =>
                openModal(configureSSOPromptModalId, 'Configure SSO')
              }
            >
              <ListItemIcon>
                <KeyIcon />
              </ListItemIcon>
              <MenuItemText label="SSO Config" />
            </MenuItem>
            {/* 
              Used to quickly change the cmi5 player cfg.json file.
              This is important for airgap installs so that we can more easily fix issues with URLs
              where it may be difficult to get a new version of the application to.
            */}
            <MenuItem onClick={handlePlayerConfig}>
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <MenuItemText label="Edit cfg.json" />
            </MenuItem>
            <MenuItem
              onClick={() =>
                openModal(configureCertsModalId, 'TLS Certificates')
              }
            >
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <MenuItemText label="TLS Certificates" />
            </MenuItem>

            {ssoConfig?.ssoEnabled &&
              (token ? (
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToAppIcon />
                  </ListItemIcon>
                  <MenuItemText label="Logout" />
                </MenuItem>
              ) : (
                <MenuItem onClick={handleLogin}>
                  <ListItemIcon>
                    <ExitToAppIcon />
                  </ListItemIcon>
                  <MenuItemText label="Login" />
                </MenuItem>
              ))}
          </>
        )}
        <MenuItem
          onClick={() => {
            dispatch(
              setModal({
                id: null,
                meta: undefined,
                name: null,
                type: clearStoragePromptModalId,
              }),
            );
            onClose();
          }}
        >
          <ListItemIcon>
            <DeleteForeverIcon sx={{ transform: 'scaleX(-1)' }} />
          </ListItemIcon>
          <MenuItemText label="Clear Data" />
        </MenuItem>
      </Menu>
    </section>
  );
}

function MenuItemText({ label }: { label: string }) {
  return (
    <ListItemText
      primary={label}
      primaryTypographyProps={{
        color: 'secondary.contrastText',
        variant: 'body2',
      }}
    />
  );
}

interface AboutBuildVersionDialogProps {
  appThemeColor: string;
  isOpen: boolean;
  onClose: () => void;
}

function AboutBuildVersionDialog({
  appThemeColor,
  isOpen,
  onClose,
}: AboutBuildVersionDialogProps) {
  return (
    <div data-testid="about-build-version-modal">
      <ModalDialog
        title={
          <img
            width={320}
            height={68}
            src={
              appThemeColor === 'light'
                ? '/assets/devops-portal/Logo_H_Color.png'
                : '/assets/devops-portal/Logo_Header_Dk_ROS.png'
            }
            alt="By Light RangeOS Logo"
          />
        }
        buttons={['OK']}
        dialogProps={{ open: isOpen }}
        handleAction={() => onClose()}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            paddingLeft: '24px',
          }}
        />
      </ModalDialog>
    </div>
  );
}
