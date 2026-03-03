import { config } from '@rapid-cmi5/ui';
import { logger } from '../debug';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuLogo } from '../redux/auReducer';
import { overrideDevOpsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import { cmi5Instance } from '../session/cmi5';

/**
 * Processes a template.
 *
 * @param template
 */
export type DeploymentLocation = {
  name: string;
  url: string;
  config: { [key: string]: string | boolean };
};

/**
 * Load cfg file and override config env params
 * @returns
 */
export const useOverrideConfigs = () => {
  const [isOverridesLoaded, setIsOverridesLoaded] = useState(false);
  useState(false);

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
  ];

  const themeWhiteList: string[] = ['SLIDE_BACKGROUND', 'SLIDE_LOGO'];

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
        console.error('CMI5 workflow has failed to set launch data.');
        throw Error(
          'Launch data is null, there was an error in the cmi5 launch work flow',
        );
      }
    }

    logger.debug('Loading override configs', { path }, 'auManager');

    try {
      logger.debug('Fetching override config file', { path }, 'auManager');
      const response = await fetch(path);

      if (response.ok) {
        const cfg: { [key: string]: string | boolean | DeploymentLocation[] } =
          await response.json();
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (config as any)[propToOverride] = cfg[propToOverride];
            logger.debug(
              'Overrode config property',
              {
                property: propToOverride,
                value: cfg[propToOverride],
              },
              'auManager',
            );
          } else if (themeWhiteList.includes(propToOverride)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (config.THEME as any)[propToOverride] = cfg[propToOverride];
            logger.debug(
              'Overrode theme property',
              {
                property: propToOverride,
                value: cfg[propToOverride],
              },
              'auManager',
            );
          }
        }

        if (kk.includes('locations')) {
          const deployments: DeploymentLocation[] = cfg[
            'locations'
          ] as DeploymentLocation[];
          // find this deployment in locations
          logger.debug(
            'Looking for deployment location',
            {
              currentOrigin: window.location.origin,
              availableDeployments: deployments.map((d) => ({
                name: d.name,
                url: d.url,
              })),
            },
            'auManager',
          );

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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (config as any)[propToOverride] =
                    deployments[k].config[propToOverride];
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

      logger.debug(
        'Config after overrides',
        {
          DEVOPS_API_URL: config.DEVOPS_API_URL,
          SLIDE_LOGO: config.THEME.SLIDE_LOGO,
        },
        'auManager',
      );

      overrideDevOpsApiClient(config.DEVOPS_API_URL);
      logger.debug(
        'DevOps API client overridden',
        {
          url: config.DEVOPS_API_URL,
        },
        'auManager',
      );

      dispatch(setAuLogo(config.THEME.SLIDE_LOGO));
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
      logger.warn(
        'Exception loading override configs',
        { error: e, path },
        'auManager',
      );
      console.log(e);
      logger.debug(
        'No overrides found, using defaults',
        undefined,
        'auManager',
      );
      dispatch(setAuLogo(config.THEME.SLIDE_LOGO));
      setIsOverridesLoaded(true);
    }
  };

  return { isOverridesLoaded, loadOverrides };
};
