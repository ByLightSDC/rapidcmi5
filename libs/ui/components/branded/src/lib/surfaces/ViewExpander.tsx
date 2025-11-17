import { useEffect, useState } from 'react';

import {
  ButtonInfoFormHeaderLayout,
  ButtonInfoField,
} from '../inputs/buttons/buttons';

/* MUI */
import Divider, { DividerProps } from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import { Variant } from '@mui/material/styles/createTypography';

/* Icons */
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { SxProps } from '@mui/system';

/**
 * @interface tViewExpanderProps
 * @property {boolean} [defaultIsExpanded] Wether view is expanded by default
 * @property {string} [expandTestId] Test id
 * @property {JSX.Element} [headerSxProps] Header props used for things like indenting
 * @property {JSX.Element} [iconSxProps] Expander Icon style properties
 * @property {string | JSX.Element | null} [infoTextTitle] Info button text
 * @property {boolean} [shouldEndWithDivider] Display divider after children
 * @property {boolean} [shouldIndicateMore] Indicate nested items when collapsed
 * @property {boolean} [shouldStartWithDivider] Display divider before title
 * @property {string} title Title text
 * @property {JSX.Element} children Expanded children
 * @property {() => void} [onToggleExpansion] Method to call when expansion is toggled
 **/
export type tViewExpanderProps = {
  defaultIsExpanded?: boolean;
  dividerSxProps?: DividerProps;
  expandTestId?: string;
  headerSxProps?: any;
  iconSxProps?: any;
  infoTextTitle?: string | JSX.Element | null;
  rightMenuChildren?: JSX.Element[] | JSX.Element | null;
  shouldEndWithDivider?: boolean;
  shouldIndicateMore?: boolean;
  shouldStartWithDivider?: boolean;
  title: string;
  titleIcon?: JSX.Element;
  titleVariant?: Variant;
  titleSxProps?: SxProps;
  children: JSX.Element;
  onNotifyExpanded?: (isExpanded: boolean, touchId?: string) => void;
};

export function ViewExpander({
  children,
  defaultIsExpanded = true,
  dividerSxProps = {},

  expandTestId = 'view-expand',
  headerSxProps = {
    cursor: 'pointer',
  },
  iconSxProps = {},
  infoTextTitle = null,
  rightMenuChildren = null,
  shouldEndWithDivider = false,
  shouldIndicateMore = true,
  shouldStartWithDivider = false,
  title = '',
  titleIcon,
  titleSxProps = {},
  titleVariant = 'h5',
  onNotifyExpanded,
}: tViewExpanderProps) {
  const [isExpanded, setIsExpanded] = useState(defaultIsExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (onNotifyExpanded) {
      onNotifyExpanded(!isExpanded, expandTestId);
    }
  };

  const iconTransform = isExpanded ? 'rotate(180deg)' : 'rotate(90deg)';

  useEffect(() => {
    setIsExpanded(defaultIsExpanded);
  }, [defaultIsExpanded]);

  return (
    <>
      {shouldStartWithDivider && (
        <Grid item xs={12}>
          <Divider sx={dividerSxProps} />
        </Grid>
      )}
      <Grid item xs={12}>
        <div
          className="content-row-icons"
          style={headerSxProps}
          onClick={toggleExpanded}
        >
          <ListItemIcon data-testid={expandTestId}>
            <ExpandLessIcon
              color="primary"
              sx={{ transform: iconTransform, ...iconSxProps }}
            />
          </ListItemIcon>
          {titleIcon}
          <Typography
            variant={titleVariant}
            sx={{
              height: '24px',
              paddingRight: '4px',
              ...titleSxProps,
            }}
          >
            {shouldIndicateMore ? (isExpanded ? title : title + '...') : title}
          </Typography>
          {infoTextTitle && (
            <ButtonInfoField
              message={infoTextTitle}
              props={{ sx: ButtonInfoFormHeaderLayout }}
            />
          )}
          {rightMenuChildren}
        </div>
      </Grid>

      {isExpanded && children}
      {shouldEndWithDivider && (
        <Grid item xs={12}>
          <Divider />
        </Grid>
      )}
    </>
  );
}

export default ViewExpander;
