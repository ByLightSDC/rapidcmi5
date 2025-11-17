/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { AppDispatch } from '../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { useAppBreadCrumbs } from '../hooks/useAppBreadCrumbs';

import {
  appHeaderVisible,
  breadCrumbVisible,
  isLoading,
  setAppHeaderVisible,
  setNavbarIndex,
  themeColor,
} from '@rangeos-nx/ui/redux';
import { useLogOut } from '../hooks/useLogOut';

/* Branded */
import {
  AppLogo,
  AppHeaderDashboardMenu,
  LinearProgressDisplayUi,
  AppMenu,
} from '@rangeos-nx/ui/branded';

/* MUI */
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

/* Icons */
import LogoffIcon from '@mui/icons-material/PowerSettingsNew';
import SettingsIcon from '@mui/icons-material/Settings';

import BreadCrumbsUi from './BreadCrumbsUi';
import UserInfoBox from './navbar/UserInfoBox';

import { BuildVersionInfo } from '@rangeos-nx/frontend/clients/devops-api';
import { isAuthenticated } from '@rangeos-nx/ui/keycloak';

/* Layout Notes
height is determined by the toggle icon size in the Navbar , currently medium
*/

const loadingHeight = 6;
const pageMargin = 12;
const pageMarginTop = pageMargin - loadingHeight;
const pageMarginBottom = 0;

/* app menu icon keys */
const appsKey = 0;
const settingsKey = 1;
const logoutKey = 2;

export default function AppHeader() {
  const logOut = useLogOut();
  const dispatch: AppDispatch = useDispatch();
  const appCrumbs = useAppBreadCrumbs();
  const showAppHeader = useSelector(appHeaderVisible);
  const showBreadCrumbsArea = useSelector(breadCrumbVisible);
  const appThemeColor = useSelector(themeColor);
  const loading = useSelector(isLoading);
  const isAuthenticatedSel = useSelector(isAuthenticated);
  const [settingsMenuAnchor, setSettingsMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const [buildVersionData, setBuildVersionData] =
    useState<BuildVersionInfo | null>();

  const onAppIconClick = (iconKey: number, optionIndex?: number) => {
    switch (iconKey) {
      case appsKey:
        //REF -- currently not doing anything here -- onOptionSelect event passes optionIndex
        break;
      case settingsKey:
        // eslint-disable-next-line no-case-declarations
        const menuButtonRef: HTMLElement | null = document.getElementById(
          'settings-menu-anchor',
        );
        setSettingsMenuAnchor(menuButtonRef);
        break;
      case logoutKey:
        logOut();
        break;
      default:
        break;
    }
  };

  // THEME upper right button style
  const appIconStyle = {
    marginLeft: '8px',
    color: (theme: any) => `${theme.header.buttonColor}`,
    '&:hover': {
      backgroundColor: 'primary.dark',
      color: (theme: any) => `${theme.header.hoverColor}`,
    },
  };

  /**
   * Build Version Data is loaded via fetcher component
   */
  const handleVersionDataLoad = (data: BuildVersionInfo) => {
    setBuildVersionData(data);
  };

  return (
    <>
      {showAppHeader && (
        <Box sx={{ height: 'auto', backgroundColor: 'background.paper' }}>
          <Grid
            container
            sx={{
              //we need this to avoid layout issue (see Scenario Designer drawers top alignment)
              height: '45px',
              backgroundColor: (theme: any) => `${theme.header.default}`,
              alignItems: 'center',
              alignContent: 'center',
              paddingTop: '0px',
            }}
          >
            <AppLogo
              assetId="rapid-cmi5"
              isNavOpen={false}
              appThemeColor={appThemeColor}
            />

            <AppHeaderDashboardMenu
              dashboardIcons={[]}
              appThemeColor={appThemeColor}
            />
            <Box
              sx={{
                display: 'flex',
                position: 'absolute',
                right: '8px',
                width: 'auto',
              }}
            >
            
              <IconButton
                aria-label="user-settings"
                id="settings-menu-anchor"
                onClick={() => onAppIconClick(settingsKey)}
                sx={appIconStyle}
              >
                <Tooltip
                  arrow
                  enterDelay={500}
                  enterNextDelay={500}
                  title="User Settings"
                  placement="bottom"
                >
                  <SettingsIcon />
                </Tooltip>
              </IconButton>
              <UserInfoBox
                anchorEl={settingsMenuAnchor}
                onClose={() => setSettingsMenuAnchor(null)}
              />
              <IconButton
                data-testid="button-log-off"
                aria-label="logout"
                onClick={() => onAppIconClick(logoutKey)}
                sx={appIconStyle}
              >
                <Tooltip
                  arrow
                  enterDelay={500}
                  enterNextDelay={500}
                  title="Logout"
                  placement="bottom"
                >
                  <LogoffIcon />
                </Tooltip>
              </IconButton>
            </Box>
          </Grid>
        </Box>
      )}
      <Box sx={{ height: 'auto', backgroundColor: 'background.paper' }}>
        <Divider
          orientation="horizontal"
          variant="fullWidth"
          sx={{
            boxShadow: 0,
            borderBottomWidth: '1.5px',
            backgroundColor: (theme: any) => `${theme.input.outlineColor}`,
            color: (theme: any) => `${theme.header.default}`,
          }}
        />

        {/* Set min height so the page doesnt jump when things are loading  */}
        {showBreadCrumbsArea && (
          <>
            <div style={{ minHeight: loadingHeight }}>
              {loading ? <LinearProgressDisplayUi /> : null}
            </div>

            <div
              style={{
                margin: pageMargin,
                marginTop: pageMarginTop,
                marginBottom: pageMarginBottom,
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <div style={{ display: 'flex', flexGrow: 1 }}>
                <BreadCrumbsUi
                  crumbs={appCrumbs}
                  onHomeClicked={() => {
                    dispatch(setNavbarIndex(-1));
                  }}
                />
              </div>
              <div
                id="breadcrumb-right"
                style={{
                  width: 'auto',
                  display: 'flex',
                  flexGrow: 0,
                  paddingRight: '24px',
                }}
              />
            </div>
          </>
        )}
      </Box>
    </>
  );
}
