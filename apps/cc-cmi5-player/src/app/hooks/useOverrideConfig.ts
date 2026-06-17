import { config } from '@rapid-cmi5/ui';
import { deepmerge } from '@mui/utils';
import { logger } from '../debug';
import { useState } from 'react';
import { overrideDevOpsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import { cmi5Instance } from '../session/cmi5';
import { Rc5Theme } from '@rapid-cmi5/cmi5-build-common';
import { setOrgTheme } from '../redux/auReducer';
import { useDispatch } from 'react-redux';

interface LocationConfig {
  DEVOPS_API_URL?: string;
  DEVOPS_GQL_URL?: string;
  DEVOPS_GQL_SUBSCRIPTIONS_URL?: string;
  KEYCLOAK_URL?: string;
  KEYCLOAK_REALM?: string;
  KEYCLOAK_CLIENT_ID?: string;
  KEYCLOAK_SCOPE?: string;
  THEME?: Rc5Theme;
}

interface AppConfig {
  locations: {
    name: string;
    url: string;
    config: LocationConfig;
  }[];
}

// We only want to have this for the CMI5 Player
// We may want to change this in the future to support
// Setting this at the course level rather than only
// through the LMS or cfg.json
/**
 * Applies Title and Favicon
 **/
const applyThemeEffects = (theme: Rc5Theme) => {
  if (theme.playerTitle) {
    document.title = theme.playerTitle;
  }
  if (theme.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = theme.faviconUrl;
  }
};

const applyLocationOverrides = (cfg: LocationConfig) => {
  if (cfg.DEVOPS_API_URL != null) config.DEVOPS_API_URL = cfg.DEVOPS_API_URL;
  if (cfg.DEVOPS_GQL_URL != null) config.DEVOPS_GQL_URL = cfg.DEVOPS_GQL_URL;
  if (cfg.DEVOPS_GQL_SUBSCRIPTIONS_URL != null)
    config.DEVOPS_GQL_SUBSCRIPTIONS_URL = cfg.DEVOPS_GQL_SUBSCRIPTIONS_URL;
  if (cfg.KEYCLOAK_URL != null) config.KEYCLOAK_URL = cfg.KEYCLOAK_URL;
  if (cfg.KEYCLOAK_REALM != null) config.KEYCLOAK_REALM = cfg.KEYCLOAK_REALM;
  if (cfg.KEYCLOAK_CLIENT_ID != null)
    config.KEYCLOAK_CLIENT_ID = cfg.KEYCLOAK_CLIENT_ID;
  if (cfg.KEYCLOAK_SCOPE != null) config.KEYCLOAK_SCOPE = cfg.KEYCLOAK_SCOPE;
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

    let mergedTheme: Rc5Theme | undefined;

    try {
      const response = await fetch(path);
      if (!response.ok) throw Error('Could not fetch the cfg.json file');

      const cfg: AppConfig = await response.json();
      if (!cfg.locations)
        throw Error('No locations where found in the cfg.json');

      const deployment =
        cfg.locations.find((b) => window.location.origin.indexOf(b.url) >= 0) ??
        cfg.locations.find((d) => d.name === 'default');

      if (!deployment) throw Error('No default is defined in the cfg.json');

      applyLocationOverrides(deployment.config);
      mergedTheme = deployment.config.THEME;

      if (inProductionMode && launchData?.launchParameters) {
        try {
          const parsedLaunchParams: LocationConfig = JSON.parse(
            launchData.launchParameters,
          );
          applyLocationOverrides(parsedLaunchParams);
          if (parsedLaunchParams.THEME) {
            mergedTheme = deepmerge(
              mergedTheme ?? {},
              parsedLaunchParams.THEME,
            ) as Rc5Theme;
          }
        } catch (err) {
          logger.warn(
            'Failed to parse launchParameters as JSON',
            { launchParameters: launchData.launchParameters },
            'auManager',
          );
        }
      }
    } catch (err) {
      logger.warn('Override configs load failed', err, 'auManager');
    } finally {
      if (mergedTheme) {
        applyThemeEffects(mergedTheme);
        // Set the org level theme settings
        // This is then used by the CoursePresentationContext
        dispatch(setOrgTheme(mergedTheme));
      }

      overrideDevOpsApiClient(config.DEVOPS_API_URL);

      setIsOverridesLoaded(true);
    }
  };

  return { isOverridesLoaded, loadOverrides };
};
