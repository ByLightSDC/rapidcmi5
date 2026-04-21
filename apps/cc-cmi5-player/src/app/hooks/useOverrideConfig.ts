import { config } from '@rapid-cmi5/ui';
import { logger } from '../debug';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuLogo } from '../redux/auReducer';
import { overrideDevOpsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import { cmi5Instance } from '../session/cmi5';

interface ThemeConfig {
  SLIDE_BACKGROUND?: string;
  LOGO_DARK?: string;
  LOGO_LIGHT?: string;
  LOGO_WIDTH?: string;
}

interface LocationConfig {
  DEVOPS_API_URL?: string;
  DEVOPS_GQL_URL?: string;
  DEVOPS_GQL_SUBSCRIPTIONS_URL?: string;
  KEYCLOAK_URL?: string;
  KEYCLOAK_REALM?: string;
  KEYCLOAK_CLIENT_ID?: string;
  KEYCLOAK_SCOPE?: string;
  THEME?: ThemeConfig;
}

interface AppConfig {
  locations: {
    name: string;
    url: string;
    config: LocationConfig;
  }[];
}

const applyConfig = (cfg: LocationConfig) => {
  if (cfg.DEVOPS_API_URL != null) config.DEVOPS_API_URL = cfg.DEVOPS_API_URL;
  if (cfg.DEVOPS_GQL_URL != null) config.DEVOPS_GQL_URL = cfg.DEVOPS_GQL_URL;
  if (cfg.DEVOPS_GQL_SUBSCRIPTIONS_URL != null)
    config.DEVOPS_GQL_SUBSCRIPTIONS_URL = cfg.DEVOPS_GQL_SUBSCRIPTIONS_URL;
  if (cfg.KEYCLOAK_URL != null) config.KEYCLOAK_URL = cfg.KEYCLOAK_URL;
  if (cfg.KEYCLOAK_REALM != null) config.KEYCLOAK_REALM = cfg.KEYCLOAK_REALM;
  if (cfg.KEYCLOAK_CLIENT_ID != null)
    config.KEYCLOAK_CLIENT_ID = cfg.KEYCLOAK_CLIENT_ID;
  if (cfg.KEYCLOAK_SCOPE != null) config.KEYCLOAK_SCOPE = cfg.KEYCLOAK_SCOPE;
  if (cfg.THEME != null) {
    if (cfg.THEME.LOGO_DARK) config.THEME.LOGO_DARK = cfg.THEME.LOGO_DARK;
    if (cfg.THEME.LOGO_LIGHT) config.THEME.LOGO_LIGHT = cfg.THEME.LOGO_LIGHT;
    if (cfg.THEME.LOGO_WIDTH) config.THEME.LOGO_WIDTH = cfg.THEME.LOGO_WIDTH;
    if (cfg.THEME.SLIDE_BACKGROUND)
      config.THEME.SLIDE_BACKGROUND = cfg.THEME.SLIDE_BACKGROUND;
  }
};

export const useOverrideConfigs = () => {
  const [isOverridesLoaded, setIsOverridesLoaded] = useState(false);
  const dispatch = useDispatch();

  const loadOverrides = async (path: string, inProductionMode = true) => {
    let launchData;
    if (inProductionMode) {
      launchData = cmi5Instance.launchData;
      if (!launchData) {
        logger.error(
          'CMI5 workflow has failed to set launch data, will not be able to use Launch Params',
        );
      }
    }

    try {
      const response = await fetch(path);
      if (!response.ok) throw Error('Could not fetch the cfg.json file');

      const cfg: AppConfig = await response.json();
      if (!cfg.locations)
        throw Error('No locations where found in the cfg.json');

      const deployment =
        cfg.locations.find((b) => b.url === window.location.origin) ??
        cfg.locations.find((d) => d.name === 'default');

      if (!deployment) throw Error('No default is defined in the cfg.json');

      applyConfig(deployment.config);

      if (inProductionMode && launchData?.launchParameters) {
        try {
          logger.debug('launch params', launchData.launchParameters);
          const parsedLaunchParams: LocationConfig = JSON.parse(
            launchData.launchParameters,
          );
          applyConfig(parsedLaunchParams);
          logger.debug(
            'Overrode config from launch params',
            parsedLaunchParams,
            'auManager',
          );
        } catch (e) {
          logger.warn(
            'Failed to parse launchParameters as JSON',
            { launchParameters: launchData.launchParameters },
            'auManager',
          );
        }
      }
    } catch (error) {
      logger.warn('Override configs load failed', error, 'auManager');
    } finally {
      dispatch(
        setAuLogo({
          dark: config.THEME.LOGO_DARK,
          light: config.THEME.LOGO_LIGHT,
          width: config.THEME.LOGO_WIDTH,
        }),
      );
      overrideDevOpsApiClient(config.DEVOPS_API_URL);

      setIsOverridesLoaded(true);
    }
  };

  return { isOverridesLoaded, loadOverrides };
};
