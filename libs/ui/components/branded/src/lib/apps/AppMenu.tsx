import { IconButton, Tooltip } from '@mui/material';

/* Icons */
import AppsIcon from '@mui/icons-material/Apps';
import { ButtonOptions } from '@rangeos-nx/ui/api/hooks';
import AppIconButtonMenu from './AppIconButtonMenu';

const defaultAppIconStyle = {
  marginLeft: '8px',
  color: (theme: any) => `${theme.header.buttonColor}`,
  '&:hover': {
    backgroundColor: 'primary.dark',
    color: (theme: any) => `${theme.header.hoverColor}`,
  },
};

/**
 * App Menu
 * dropdown menu with links that open in a new tab
 * @param {string} activeId Which app is presenting the menu
 * @param {string} activeInstructions Nav Menu instructions
 * @return {JSX.Element} React Component
 */
export function AppMenu({
  urlOverrides,
  onAppIconClick,
}: {
  urlOverrides?: { [key: string]: string };
  onAppIconClick?: (key: number, index: number) => void;
}) {
  /* app menu icon keys */
  const appsKey = 0;

  return (
    <ButtonOptions
      optionButton={(handleClick: any, tooltip: string) => {
        return (
          <IconButton
            aria-label="apps"
            sx={defaultAppIconStyle}
            onClick={handleClick}
          >
            <Tooltip
              arrow
              enterDelay={500}
              enterNextDelay={500}
              title="App Menu"
              placement="bottom"
            >
              <AppsIcon />
            </Tooltip>
          </IconButton>
        );
      }}
      id={'app-options-menu'}
      tooltip="My Tooltipper"
      onOptionSelect={(optionIndex) =>
        onAppIconClick ? onAppIconClick(appsKey, optionIndex) : {}
      }
    >
      <AppIconButtonMenu activeId="devops-portal" urls={urlOverrides} />
    </ButtonOptions>
  );
}
export default AppMenu;
