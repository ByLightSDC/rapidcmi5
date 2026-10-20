import { useEffect, useState } from 'react';
/* MUI */
import Divider, { DividerProps } from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import ButtonBase from '@mui/material/ButtonBase';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import { Variant } from '@mui/material/styles/createTypography';

/* Icons */
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { SxProps } from '@mui/system';
import {
  ButtonInfoField,
  ButtonInfoFormHeaderLayout,
} from '../utility/buttons';

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
  initialFocus?: boolean;
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
  initialFocus = false,
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
        <Grid size={12}>
          <Divider sx={dividerSxProps} />
        </Grid>
      )}
      {/* ButtonBase gives the expandable header standard keyboard interaction. */}
      <Grid size={12}>
        <Box
          className="content-row-icons"
          style={headerSxProps}
          sx={{ gap: 0.5 }}
        >
          <ButtonBase
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            data-testid={expandTestId}
            data-drawer-initial-focus={initialFocus ? 'true' : undefined}
            // Keep old look after witching to button, add visible keyboard focus
            sx={{
              flexGrow: 1,
              minWidth: 0,
              justifyContent: 'flex-start',
              textAlign: 'left',
              borderRadius: 1,
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 1,
              },
            }}
          >
            <ListItemIcon>
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
              {shouldIndicateMore
                ? isExpanded
                  ? title
                  : title + '...'
                : title}
            </Typography>
          </ButtonBase>
          {infoTextTitle && (
            <ButtonInfoField
              message={infoTextTitle}
              props={{ sx: ButtonInfoFormHeaderLayout }}
            />
          )}
          {rightMenuChildren}
        </Box>
      </Grid>
      {isExpanded && children}
      {shouldEndWithDivider && (
        <Grid size={12}>
          <Divider />
        </Grid>
      )}
    </>
  );
}

export default ViewExpander;
