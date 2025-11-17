/* eslint-disable @typescript-eslint/no-explicit-any */

import { breadCrumbLeft } from '@rangeos-nx/ui/redux';
import { useNavigate } from 'react-router';
import { BreadCrumb } from '../types/breadCrumb';
import { useBreadCrumbs } from '../hooks/useBreadCrumbs';

/* MUI */
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

/* Icons */
import HomeIcon from '@mui/icons-material/Home';
import { useSelector } from 'react-redux';

/* eslint-disable-next-line */
export interface BreadcrumbProps {
  crumbs?: BreadCrumb[];
  showHome?: boolean;
  homeUrl?: string;
  onHomeClicked?: () => void;
}

const maxCrumbWidth = '370px';
const crumbFontSize = '14px';

// #region breadcrumb - right item
const breadCrumbsRightItem = 'breadCrumbRowItem';

/**
 * Moves the given element into the breadcrumbs row as a right element
 * @param {string} itemId  id of element to move to breadcrumbs row
 */
export const addRightBreadCrumbItem = (itemId: string) => {
  const moveElement = document.getElementById(itemId);
  const destinationDiv = document.getElementById(breadCrumbsRightItem);
  if (destinationDiv && moveElement) {
    destinationDiv.appendChild(moveElement);
  }
};

export default function BreadCrumbsUi(props: BreadcrumbProps) {
  const { showHome = false, homeUrl = '/', onHomeClicked } = props;
  let { crumbs = [] } = props;
  const navigate = useNavigate();
  const defaultCrumbs = useBreadCrumbs();
  const leftMargin = useSelector(breadCrumbLeft);
  if (crumbs?.length > 0) {
    //use as is
  } else {
    crumbs = defaultCrumbs;
  }

  return (
    <Breadcrumbs
      separator="›"
      role="navigation"
      aria-label="breadcrumb"
      sx={{
        height: 'auto',
        fontSize: crumbFontSize,
        color: (theme: any) => `${theme.breadcrumbs.default}`,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        width: '90%',
        paddingLeft: `${leftMargin}px`,
      }}
    >
      {showHome ? (
        <div style={{ height: crumbFontSize }}>
          <IconButton
            size="small"
            aria-label="home"
            sx={{
              height: 'inherit',
              fontSize: 'inherit',
              color: (theme: any) => `${theme.breadcrumbs.default}`,
              '&:hover': {
                color: (theme: any) => `${theme.breadcrumbs.hoverColor}`,
                backgroundColor: (theme: any) =>
                  `${theme.breadcrumbs.hoverBackground}`,
              },
            }}
            onClick={() => {
              if (onHomeClicked) {
                onHomeClicked();
              }
              navigate(homeUrl);
            }}
          >
            <Tooltip arrow enterDelay={500} enterNextDelay={500} title="Home">
              <HomeIcon />
            </Tooltip>
          </IconButton>
        </div>
      ) : null}
      {crumbs?.map((crumb, index) => (
        <BreadcrumbItem crumb={crumb} key={index} />
      ))}
    </Breadcrumbs>
  );
}

function BreadcrumbItem({ crumb }: { crumb: BreadCrumb }): JSX.Element {
  const navigate = useNavigate();
  if (crumb.url) {
    return (
      <Link
        className="crumb-text"
        component="button"
        gutterBottom={false}
        sx={{
          fontSize: crumbFontSize,
          margin: '0px',
          padding: '0px',
          height: 'auto',
          maxWidth: maxCrumbWidth,
          textDecorationColor: (theme: any) => `${theme.breadcrumbs.underline}`,
          '&:hover': {
            color: (theme: any) => `${theme.breadcrumbs.hoverColor}`,
            textDecorationColor: (theme: any) =>
              `${theme.breadcrumbs.hoverColor}`,
          },
          color: (theme: any) => `${theme.breadcrumbs.underline}`,
        }}
        onClick={() => navigate(`${crumb.url}`)}
      >
        {crumb.label}
      </Link>
    );
  }

  //THEME Interactable Text
  return (
    <Typography
      variant="body1"
      className="crumb-text"
      gutterBottom={false}
      sx={{
        fontSize: crumbFontSize,
        height: 'auto',
        color: (theme: any) => `${theme.breadcrumbs.default}`,
        margin: '0px',
        padding: '0px',
        maxWidth: maxCrumbWidth,
        display: 'inline-block', // so maxWidth will apply to span created in list item
        cursor: 'default', // cursor does not change to text edit mode when hovering breadcrumb
      }}
    >
      {crumb.label}
    </Typography>
  );
}
