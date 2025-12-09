import React from 'react';

import { brandedTheme } from '../styles/muiTheme';
import { brandedThemeDark } from '../styles/muiThemeDark';

/* MUI */
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useSelector } from 'react-redux';
import { AppMenuConfigItem, plugins, themeColor } from '@rangeos-nx/ui/redux';
import { IconAsset } from './IconAsset';
import { useNavigate } from 'react-router';
import { config } from '@rangeos-nx/frontend/environment';

/**
 * Returns drop down menu with links to launch apps
 * @param {string} activeId Which app is presenting the menu
 * @return {JSX.Element} React Component
 */
export function AppIconButtonMenu({
  activeId = 'devops-portal',
  urls = {},
}: {
  activeId: string;
  urls?: { [key: string]: string };
}) {
  const pluginsConfig = useSelector(plugins);
  const appThemeColor = useSelector(themeColor);
  const navigate = useNavigate();
  const currentTheme =
    appThemeColor === 'light' ? brandedTheme : brandedThemeDark;

  /**
   * Launches app in a second tab
   * @param {any} event Mouse event
   * @param {string} launchUrl App Url to launch
   */
  const handleSelect = (
    event: any,
    linkConfig: AppMenuConfigItem,
    url: string,
  ) => {
    if (!linkConfig.shouldIFrame) {
      window.open(url);
    } else {
      navigate(linkConfig.id);
    }
  };

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {pluginsConfig?.map((linkConfig: AppMenuConfigItem, index: number) => {
        const isCurrentApp = linkConfig.id === activeId;
        const { isVisible = true, url, id } = linkConfig;

        let finalUrl = url;

        if (Object.prototype.hasOwnProperty.call(urls, id)) {
          finalUrl = urls[id];
        } else if (id === 'keycloak') {
          finalUrl = config.KEYCLOAK_URL;
        }

        return (
          // test for current app / visibility requires empty react element to wrap
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <React.Fragment key={'app-menu-item-' + index}>
            {!isCurrentApp && isVisible && finalUrl ? (
              <>
                <ListItemButton
                  sx={{
                    color: (theme: any) =>
                      `${
                        isCurrentApp ? theme.palette.grey[500] : theme.nav.icon
                      }`,
                    '&:hover': {
                      backgroundColor: isCurrentApp
                        ? undefined
                        : 'primary.light',
                      color: isCurrentApp ? undefined : 'primary.contrastText',
                      cursor: isCurrentApp ? 'default' : 'pointer',
                    },
                  }}
                  onClick={(event) =>
                    isCurrentApp
                      ? undefined
                      : handleSelect(event, linkConfig, finalUrl)
                  }
                >
                  {linkConfig.iconUrl && (
                    <IconAsset
                      iconUrl={linkConfig.iconUrl}
                      isCurrentApp={isCurrentApp}
                      currentTheme={currentTheme}
                    />
                  )}
                  {linkConfig.icon && linkConfig.icon}
                  <ListItemText
                    sx={{
                      marginLeft: '4px',
                      color: 'inherit',
                      '&:hover': {
                        color: 'inherit',
                      },
                    }}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                    secondaryTypographyProps={{ variant: 'subtitle2' }}
                    inset={false}
                    primary={linkConfig.title}
                  />
                </ListItemButton>
                <Divider variant="fullWidth" />
              </>
            ) : null}
          </React.Fragment>
        );
      })}
    </>
  );
}

export default AppIconButtonMenu;
