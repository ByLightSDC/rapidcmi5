/* MUI */
import Box from '@mui/material/Box';

export const drawerClosedWidth = 64;
export const drawerOpenWidth = 232; //256;
export const iconPaddingLeft = '0px';
export const logoMarginTop = '8px';
export const logoMarginBottom = '0px';
export const navMenuDirection = 'row';

export function AppLogo({
  appThemeColor = 'light',
  bgColor,
  isNavOpen = false,
  isOverrideOpen = false,
  assetId = 'rapid-cmi5',
}: {
  appThemeColor?: string;
  bgColor?: string;
  isNavOpen?: boolean;
  isOverrideOpen?: boolean;
  assetId?: string;
}) {
  const logoContainerHeight = '35px'; //REF '102px';

  return (
    <header aria-label="app logo">
      <img
        height={logoContainerHeight}
        style={{
          background: bgColor ? bgColor : 'inherit',
          marginLeft: '24px',
          marginTop: '5px',
          marginRight: '24px',
        }}
        src={
          appThemeColor === 'light'
            ? `./assets/${assetId}/RapidCMI5.png`
            : `./assets/${assetId}/RapidCMI5.png`
        }
        alt="Rapid CMI5 Logo"
      />
    </header>
  );
}

export default AppLogo;
