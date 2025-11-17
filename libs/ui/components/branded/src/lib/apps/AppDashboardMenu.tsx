import { AppLogo } from '@rangeos-nx/ui/branded';
import { useNavigate } from 'react-router';

/* MUI */
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

/* Icons */
import { useSelector } from 'react-redux';
import { plugins } from '@rangeos-nx/ui/redux';

/**
 * @typedef {Object} AppMenuConfigItem
 * @property {string} id Application id
 * @property {boolean} isVisible Whether app should be visible in ap menus
 * @property {string} description App description
 * @property { JSX.Element} icon App icon
 * @property {string} title App title
 * @property {string} url App Url
 */
export type AppMenuConfigItem = {
  id: string;
  isVisible: boolean;
  description: string;
  icon?: JSX.Element;
  iconUrl?: string;
  shouldIFrame?: boolean;
  title: string;
  url: string;
};

/**
 * Returns menu with links to launch apps from a welcome page
 * Home/Blank Page Menu
 * @param {string} activeId Which app is presenting the menu
 * @param {string} activeInstructions Nav Menu instructions
 * @return {JSX.Element} React Component
 */
export function AppDashboardMenu({
  activeId = 'devops-portal',
  activeInstructions,
  canUseAppsMenu = true,
}: {
  activeId?: string;
  activeInstructions?: string;
  canUseAppsMenu?: boolean;
}) {
  const pluginsConfig = useSelector(plugins);

  return (
    <Box
      sx={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {pluginsConfig?.map((config: AppMenuConfigItem, index: number) => {
        const isCurrentApp = config.id === activeId;
        const { isVisible = true } = config;
        return isVisible && isCurrentApp ? (
          <AppBox
            assetId={config.id}
            key={config.id}
            icon={config.icon}
            description={config.description}
            isDisabled={isCurrentApp}
            shouldIFrame={config.shouldIFrame}
            launchUrl={config.url}
            title={config.title}
          />
        ) : null;
      })}
      {pluginsConfig?.map((config: AppMenuConfigItem, index: number) => {
        const isCurrentApp = config.id === activeId;
        const { isVisible = true } = config;
        return canUseAppsMenu && !isCurrentApp && isVisible ? (
          <AppBox
            assetId={config.id}
            key={config.id}
            icon={config.icon}
            description={config.description}
            isDisabled={isCurrentApp}
            shouldIFrame={config.shouldIFrame}
            launchUrl={config.url}
            title={config.title}
          />
        ) : null;
      })}
    </Box>
  );
}

function AppBox({
  assetId,
  icon,
  description,
  title,
  isDisabled,
  launchUrl,
  shouldIFrame = false,
}: {
  assetId: string;
  icon?: JSX.Element;
  description: string;
  title: string;
  isDisabled: boolean;
  shouldIFrame?: boolean;
  launchUrl: string;
}) {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        '&:hover': { cursor: isDisabled ? 'default' : 'pointer' },
      }}
      onClick={() => {
        if (!isDisabled) {
          if (!shouldIFrame) {
            window.open(launchUrl);
          } else {
            navigate(assetId);
          }
        }
      }}
    >
      <Box
        sx={{
          backgroundColor: (theme: any) =>
            `${isDisabled ? theme.palette.grey.A200 : theme.header.default}`,

          borderColor: (theme: any) =>
            `${isDisabled ? theme.palette.grey.A100 : theme.header.border}`,
          borderStyle: 'solid',
          borderRadius: '8px',
          borderWidth: '2px',
          padding: '12px',
          margin: '24px',
          //maxWidth: '236px',
          width: '280px',
          height: '200px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            marginBottom: '-8px', //to correct for logo height causing bottom space
            color: (theme: any) =>
              isDisabled ? theme.palette.grey[500] : theme.header.buttonColor,
          }}
        >
          <AppLogo
            assetId="devops-portal"
            bgColor="transparent"
            //app specific TODO assetId={assetId}
            //bgColor={isDisabled ? 'transparent' : undefined}
            isOverrideOpen={true}
          />
          <Typography
            sx={{
              fontFamily: 'BarlowCondensed',
              fontSize: '24px',
              color: (theme: any) =>
                isDisabled ? theme.palette.grey[500] : theme.header.buttonColor,
            }}
          >
            {title}
          </Typography>
          {icon}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            paddingLeft: '12px',
            paddingTop: '8px',
            color: (theme: any) =>
              isDisabled ? theme.palette.grey[500] : theme.header.buttonColor,
          }}
        >
          <Typography
            sx={{
              color: (theme: any) =>
                `${
                  isDisabled
                    ? theme.palette.grey[500]
                    : theme.header.buttonColor
                }`,
              justifyContent: 'center',
              paddingRight: '12px',
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>

      {/* {instructions && <>{instructions}</>} */}
    </Box>
  );
}

export default AppDashboardMenu;
