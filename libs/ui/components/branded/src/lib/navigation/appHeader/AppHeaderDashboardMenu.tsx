import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { navBarIndex } from '@rapid-cmi5/ui/redux';

/* MUI */
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import { SizingContext } from '../../layout/SizingContext';
import { BookmarksContext } from '../bookmark/BookmarksContext';

/**
 * @typedef {Object} DashboardIcon
 * @property {string} name Name to be displayed by icon
 * @property {OverridableComponent<SvgIconTypeMap>} icon Icon to be displayed
 * @property {number} menuKey index key for icon button
 * @property {string} testId Data Test Id for icon button
 * @property {string} url Url to navigate to when icon button is clicked
 * @property {boolean} [disabled] Whether icon button should be disabled
 * @property {boolean} [hidden] Whether icon button should be hidden
 */
export type DashboardIcon = {
  name: string;
  icon: OverridableComponent<SvgIconTypeMap>;
  menuKey: number;
  testId: string;
  url: string;
  disabled?: boolean;
  hidden?: boolean;
};

/**
 * Displays the list of Dashboard Icons and navigates appropriately
 * @param {DashboardIcon[]} dashboardIcons List of icons to display
 * @return {JSX.Element} React component
 */
export function AppHeaderDashboardMenu({
  appThemeColor = 'light',
  dashboardIcons,
}: {
  appThemeColor?: string;
  dashboardIcons: DashboardIcon[];
}) {
  const { clearAllBookmarks } = useContext(BookmarksContext);
  const { isNarrowWidth } = useContext(SizingContext);

  const navigate = useNavigate();
  const dashboardIconSel = useSelector(navBarIndex);

  // THEME dashboard icons
  const dashboardButtonStyle = {
    height: '26px',
    marginTop: '2px',
    display: 'flex',
    justifyContent: 'flex-end',
    borderRadius: 1,
    color: (theme: any) => `${theme.header.buttonColor}`,
    '&:hover': {
      backgroundColor: 'primary.dark',
      color: (theme: any) => `${theme.header.hoverColor}`,
    },
  };
  // THEME selected dashboard icon style
  const dashboardSelButtonStyle = {
    ...dashboardButtonStyle,
    color: (theme: any) => `${theme.header.selColor}`,

    '&:hover': {
      color: 'white',
    },
  };

  const dashboardIconStyle = {
    margin: '0px',
    padding: '0px',
    fontSize: '20px',
  };

  const dashboardSelIconStyle = {
    padding: '2px',
    border: '1px solid',
    borderColor: (theme: any) => `${theme.header.selColor}`,
    borderRadius: 8,
    fontSize: '32px',
  };

  const onDashboardIconClick = (key: number) => {
    clearAllBookmarks();
    navigate(dashboardIcons[key].url);
  };

  return (
    <Stack
      sx={{ marginTop: '4px' }} //MICO
      data-testid={'app-header-dashboard-menu'}
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      spacing={2}
    >
      {dashboardIcons.map(
        ({
          disabled = false,
          hidden = false,
          name,
          icon,
          menuKey,
          testId,
          url,
        }: DashboardIcon) => {
          if (!hidden) {
            const ItemIcon = icon;
            if (!isNarrowWidth) {
              return (
                <React.Fragment key={menuKey}>
                  <IconButton
                    size="small"
                    aria-label={testId}
                    id={testId}
                    sx={
                      dashboardIconSel === menuKey
                        ? dashboardSelButtonStyle
                        : dashboardButtonStyle
                    }
                    onClick={() => onDashboardIconClick(menuKey)}
                  >
                    <ItemIcon
                      sx={
                        dashboardIconSel === menuKey
                          ? dashboardSelIconStyle
                          : dashboardIconStyle
                      }
                      //REF Circle Outline
                    />
                    <Typography
                      sx={{
                        marginLeft: '4px',
                        //marginTop: '5px',
                        fontSize: '18px',
                        fontWeight: 600,
                        fontVariant: 'small-caps',
                        textTransform: 'lowerCase',
                        //REF textTransform: 'lowerCase',
                      }}
                    >
                      {name}
                    </Typography>
                  </IconButton>
                </React.Fragment>
              );
            }
            return (
              <React.Fragment key={menuKey}>
                <IconButton
                  size="small"
                  aria-label={testId}
                  id={testId}
                  sx={
                    dashboardIconSel === menuKey
                      ? dashboardSelButtonStyle
                      : dashboardButtonStyle
                  }
                  onClick={() => onDashboardIconClick(menuKey)}
                >
                  <Tooltip
                    arrow
                    enterDelay={500}
                    enterNextDelay={500}
                    title={name}
                    placement="bottom"
                  >
                    <ItemIcon
                      sx={
                        dashboardIconSel === menuKey
                          ? dashboardSelIconStyle
                          : dashboardIconStyle
                      }
                    />
                  </Tooltip>
                </IconButton>
              </React.Fragment>
            );
          } else {
            return <></>;
          }
        },
      )}
    </Stack>
  );
}
export default AppHeaderDashboardMenu;
