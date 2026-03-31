/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from '@rapid-cmi5/ui';
import { logger } from '../debug';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuLogo } from '../redux/auReducer';
import { overrideDevOpsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import { cmi5Instance } from '../session/cmi5';

export type ConfigType = {
  [key: string]:
    | string
    | boolean
    | DeploymentLocation[]
    | { [key: string]: string };
};

/**
 * Processes a template.
 *
 * @param template
 */
export type DeploymentLocation = {
  name: string;
  url: string;
  config: { [key: string]: string | boolean | { [key: string]: string } };
};

/**
 * Load cfg file and override config env params
 * @returns
 */
export const useOverrideConfigs = () => {
  const [isOverridesLoaded, setIsOverridesLoaded] = useState(false);

  const dispatch = useDispatch();

  // env that can be overriden
  const whiteList: string[] = [
    'AUTH_URL',
    'CMI5_PLAYER_VERSION',
    'DEVOPS_API_URL',
    'DEVOPS_GQL_URL',
    'DEVOPS_GQL_SUBSCRIPTIONS_URL',
    'DEVOPS_API_CMI_VERSION',
    'KEYCLOAK_CLIENT_ID',
    'KEYCLOAK_URL',
    'KEYCLOAK_REALM',
    'KEYCLOAK_CLIENT_ID',
    'KEYCLOAK_SCOPE',
    'LOGGING_ENABLED',
    'LOGGING_LEVEL',
    'LOGGING_COMPONENTS',
    'THEME',
  ];

  const themeWhiteList: string[] = [
    'SLIDE_BACKGROUND',
    'LOGO_DARK',
    'LOGO_LIGHT',
  ];

  /**
   * Only allow whitelisted properties in theme
   * @param propToOverride
   * @param cfg
   * @returns
   */
  const getSanitizedTheme = (defaults: ConfigType, cfg: ConfigType) => {
    const themeConfig: ConfigType = structuredClone(defaults);
    const themeKeys = Object.keys(cfg);
    for (let j = 0; j < themeKeys.length; j++) {
      const themeKey = themeKeys[j];
      if (themeWhiteList.includes(themeKey)) {
        themeConfig[themeKey] = cfg[themeKey];
      }
    }
    return themeConfig;
  };

  const loadOverrides = async (path: string, inProductionMode = true) => {
    let launchData;
    if (inProductionMode) {
      launchData = cmi5Instance.launchData;
      logger.debug(
        'Loading override launch params',
        { launchData },
        'auManager',
      );

      // If there is no launch data returned something is wrong
      if (!launchData) {
        console.error(
          'CMI5 workflow has failed to set launch data, will not be able to use Launch Params',
        );
      }
    }

    logger.debug('Loading override configs', { path }, 'auManager');

    try {
      logger.debug('Fetching override config file', { path }, 'auManager');
      const response = await fetch(path);

      if (response.ok) {
        const cfg: ConfigType = await response.json();
        logger.debug(
          'Override config loaded',
          {
            configKeys: Object.keys(cfg),
            hasLocations: 'locations' in cfg,
          },
          'auManager',
        );

        const kk = Object.keys(cfg);
        // override env vars with config
        for (let i = 0; i < kk.length; i++) {
          const propToOverride: string = kk[i];
          if (whiteList.includes(propToOverride)) {
            //sanitize theme
            if (propToOverride === 'THEME') {
              (config as any)[propToOverride] = getSanitizedTheme(
                (config as any)[propToOverride],
                cfg[propToOverride] as { [key: string]: string },
              );
            } else {
              (config as any)[propToOverride] = cfg[propToOverride];
            }

          }
        }

        if (kk.includes('locations')) {
          const deployments: DeploymentLocation[] = cfg[
            'locations'
          ] as DeploymentLocation[];
          // find this deployment in locations

          for (let k = 0; k < deployments.length; k++) {
            if (deployments[k].url === window.location.origin) {
              logger.debug(
                'Deployment location found',
                {
                  name: deployments[k].name,
                  config: deployments[k].config,
                },
                'auManager',
              );

              // override env vars with config
              const locationConfigKeys = Object.keys(deployments[k].config);
              for (let l = 0; l < locationConfigKeys.length; l++) {
                const propToOverride: string = locationConfigKeys[l];
                if (whiteList.includes(propToOverride)) {
                  //sanitize theme
                  if (propToOverride === 'THEME') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (config as any)[propToOverride] = getSanitizedTheme(
                      (config as any)[propToOverride],
                      deployments[k].config[propToOverride] as {
                        [key: string]: string;
                      },
                    );
                  } else {
                    (config as any)[propToOverride] =
                      deployments[k].config[propToOverride];
                  }

                  logger.debug(
                    'Overrode config from location',
                    {
                      property: propToOverride,
                      value: deployments[k].config[propToOverride],
                    },
                    'auManager',
                  );
                } else if (themeWhiteList.includes(propToOverride)) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (config.THEME as any)[propToOverride] =
                    deployments[k].config[propToOverride];
                  logger.debug(
                    'Overrode theme from location',
                    {
                      property: propToOverride,
                      value: deployments[k].config[propToOverride],
                    },
                    'auManager',
                  );
                }
              }
              break;
            }
          }
        }
      } else {
        logger.warn(
          'Failed to fetch override config',
          {
            status: response.status,
            statusText: response.statusText,
          },
          'auManager',
        );
      }

      // Apply whitelisted launch params on top of cfg.json (launch params win)
      if (inProductionMode && launchData?.launchParameters) {
        const launchParams = launchData.launchParameters;
        try {
          console.log('launch params', launchParams);
          const parsedLaunchParams: { [key: string]: string | boolean } =
            JSON.parse(launchParams);
          const lpKeys = Object.keys(parsedLaunchParams);
          for (let i = 0; i < lpKeys.length; i++) {
            const prop = lpKeys[i];
            if (whiteList.includes(prop)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (config as any)[prop] = parsedLaunchParams[prop];
              logger.debug(
                'Overrode config from launch params',
                { property: prop, value: parsedLaunchParams[prop] },
                'auManager',
              );
            } else if (themeWhiteList.includes(prop)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (config.THEME as any)[prop] = parsedLaunchParams[prop];
              logger.debug(
                'Overrode theme from launch params',
                { property: prop, value: parsedLaunchParams[prop] },
                'auManager',
              );
            }
          }
        } catch (e) {
          logger.warn(
            'Failed to parse launchParameters as JSON',
            { launchParameters: launchParams },
            'auManager',
          );
        }
      }

      logger.debug('Config after overrides', config, 'auManager');

      overrideDevOpsApiClient(config.DEVOPS_API_URL);
      dispatch(
        setAuLogo({
          dark: config.THEME.LOGO_DARK,
          light: config.THEME.LOGO_LIGHT,
        }),
      );

      logger.debug('Config Success', config, 'auth');
      setIsOverridesLoaded(true);

      // CRITICAL FIX: Refresh logging config after overrides are loaded
      try {
        const { refreshLoggingConfig } = await import('../debug');
        refreshLoggingConfig();
        logger.debug(
          'Override configs loaded successfully and logging refreshed',
          undefined,
          'auManager',
        );
      } catch (error) {
        logger.warn('Override configs load failed', error, 'auManager');
      }
      // overwrite config
    } catch (e) {
      dispatch(
        setAuLogo({
          dark: config.THEME.LOGO_DARK,
          light: config.THEME.LOGO_LIGHT,
        }),
      );
      logger.debug('Config Fail', config, 'auth');
      setIsOverridesLoaded(true);
    }
  };

  return { isOverridesLoaded, loadOverrides };
};
