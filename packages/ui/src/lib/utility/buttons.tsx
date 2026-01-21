/*MUI */
import { styled } from '@mui/material';

import Button, { ButtonProps } from '@mui/material/Button';
import Chip, { ChipProps } from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

/*Icon */
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TouchAppIcon from '@mui/icons-material/TouchApp';

/*Constants */
const minLoadingButtonWidth = '94px'; // so button wont change size when "Loading"
const minButtonHeight = '32px';
const maxButtonHeight = '30px';
import {
  Alert,
  AlertProps,
  Box,
  ClickAwayListener,
  IconButton,
  IconButtonProps,
  Popper,
} from '@mui/material';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { copyTextToClipboard } from './copy';

const zOrderAboveDialog = 9999;
const defaultInfoIcon = <div />;
/**
 * ButtonInfoField
 * @param param0
 * @returns
 */
export function ButtonInfoField({
  alertProps = { icon: defaultInfoIcon, severity: 'info' },
  alertSxProps = {},
  boxProps = {},
  infoIcon = <QuestionMarkIcon fontSize="small" />,
  name = '',
  props = {},
  message = 'More Information',
  popperPlacement = 'top', //'left-end',
  triggerOnClick = false,
}: {
  alertProps?: AlertProps;
  alertSxProps?: any;
  boxProps?: any;
  infoIcon?: JSX.Element;
  name?: string;
  props?: IconButtonProps;
  message?: string | JSX.Element;
  popperPlacement?:
    | 'auto-end'
    | 'auto-start'
    | 'auto'
    | 'bottom-end'
    | 'bottom-start'
    | 'bottom'
    | 'left-end'
    | 'left-start'
    | 'left'
    | 'right-end'
    | 'right-start'
    | 'right'
    | 'top-end'
    | 'top-start'
    | 'top';
  triggerOnClick?: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAlert, setIsAlert] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  //REF
  // const handleToggleAlert = (event: any) => {
  //   setAnchorEl(event?.currentTarget);
  //   setIsSticky(!isAlert);
  //   setIsAlert(!isAlert);
  // };

  const handleClick = (event: any) => {
    event.stopPropagation();
    if (triggerOnClick) {
      if (!isAlert) {
        setAnchorEl(event?.currentTarget);
        setIsAlert(true);
      }
    }
  };

  const handleCloseAlert = (event: any) => {
    event.stopPropagation();
    setIsAlert(false);
    setIsSticky(false);
  };

  const handleIn = (event: any) => {
    event.stopPropagation();
    if (!triggerOnClick && !isAlert) {
      setAnchorEl(event?.currentTarget);
      setIsAlert(true);
    }
  };

  const handleOut = (event: any) => {
    event.stopPropagation();
    if (!triggerOnClick && !isSticky) {
      setIsAlert(false);
    }
  };

  return (
    <Box
      sx={{
        margin: '2px',
        padding: '0px',
        maxHeight: '64px',
        display: 'flex',
        alignItems: 'center',
        ...boxProps,
      }}
    >
      <div
        style={{ width: '80%', display: 'flex', justifyContent: 'center' }}
        onMouseEnter={handleIn}
        onMouseLeave={handleOut}
        onFocus={handleIn}
        onBlur={handleOut}
        onClick={handleClick}
      >
        <ButtonIcon
          id={name || 'button-info'}
          name={name || 'button-info'}
          props={{ ...props }}
        >
          {infoIcon}
        </ButtonIcon>
      </div>
      <Popper
        id="info-field-alert"
        open={isAlert}
        anchorEl={anchorEl}
        placement={popperPlacement}
        style={{ zIndex: zOrderAboveDialog }}
      >
        <ClickAwayListener onClickAway={handleCloseAlert}>
          <Alert
            severity="info"
            //REF onClose={handleCloseAlert}
            sx={{
              maxWidth: '480px',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              margin: '4px',
              padding: '6px 16px 6px 6px',
              ...alertSxProps,
            }}
            {...alertProps}
            action={
              <>
                {triggerOnClick ? (
                  <IconButton
                    sx={{ marginRight: '12px', padding: '0px' }}
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={(evt) => {
                      handleCloseAlert(evt);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                ) : undefined}
              </>
            }
          >
            {message}
          </Alert>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
}

const StyledButton = styled(Button)(({ theme }: { theme: any }) => ({
  margin: 2, //REF
  padding: 0,
  //REF paddingTop: 1, //text align fix
  minHeight: minButtonHeight,
}));

const StyledChip = styled(Chip)(({ theme }: { theme: any }) => ({
  margin: 4,
}));

const StyledIconButton = styled(IconButton)(({ theme }: { theme: any }) => ({
  size: 'small',
}));

const StyledLoadingButton = styled(Button)(({ theme }: { theme: any }) => ({
  margin: 2,
  padding: 0,
}));

interface BrandedButtonProps extends ButtonProps {
  loadingText?: string;
  sxProps?: any;
  tooltip?: string;
  buttonProps?: ButtonProps;
}

/**
 * @interface BrandedChipProps
 * @extends {ChipProps}
 * @prop {any} [sxprops] SX props passed to MUI Chip
 */
interface BrandedChipProps extends ChipProps {
  sxprops?: any;
}

export function ButtonMainUi(props: BrandedButtonProps) {
  const { sxProps, ...buttonProps } = props;

  return (
    <StyledButton
      id={props?.id ?? 'main-button'}
      data-testid={props?.id ?? 'main-button'}
      role="button"
      type="button"
      variant="contained"
      sx={{
        //border: '2px solid',
        borderStyle: 'solid',
        borderWidth: '1px', //MG
        borderColor: 'primary.light',
        //backgroundColor: 'primary.main',
        background: 'linear-gradient(180deg, #405CA7 0%, #2C4B93 100%)', //mico to-do
        color: 'common.white',
        //Recent fix to make button fit child text
        minWidth: 'auto',
        //this effects select & create button
        //icon height determines height of button
        //start icon has a padding that causes right side to look off
        paddingLeft: props?.children
          ? props?.startIcon
            ? '0px'
            : '6px'
          : '0px',
        paddingRight: props?.children
          ? props?.startIcon
            ? '6px'
            : '6px'
          : '0px',
        whiteSpace: 'nowrap',
        '&:hover': {
          background: 'transparent',
          backgroundColor: 'primary.light',
          cursor: 'pointer',
        },
        '&:disabled': {
          boxShadow: 2,
          backgroundColor: (theme: any) =>
            `${theme.button.disabledBackgroundColor}`,
          color: (theme: any) => `${theme.button.disabledColor}`,
        },
        ...props?.sxProps,
      }}
      startIcon={<CheckCircleIcon />}
      {...buttonProps}
    >
      {props.children}
    </StyledButton>
  );
}

export function ButtonMinorUi(props: BrandedButtonProps) {
  const { sxProps, tooltip, variant = 'outlined', ...buttonProps } = props;
  return (
    //button method to retrieve injected option OR default requires empty react element to wrap
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {tooltip ? (
        <ButtonTooltip title={tooltip}>
          <span>
            <StyledButton
              id={props?.id ?? 'minor-button'}
              data-testid={props?.id ?? 'minor-button'}
              role="button"
              type="button"
              variant={variant}
              sx={{
                color: (theme: any) => `${theme.breadcrumbs.underline}`,
                //Recent fix to make button fit child text
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                px: props?.children
                  ? props?.startIcon
                    ? '8px 12px'
                    : '12px'
                  : '8px',
                py: '6px',
                height: 'auto',
                minHeight: '32px',
                //margin: '8px',
                backgroundColor: (theme: any) => `${theme.nav.fill}`,
                '&:hover': {
                  boxShadow: 3,
                  color: 'primary.light',
                  borderColor: 'primary.light',
                  backgroundColor: (theme: any) => `${theme.nav.fill}`,
                },
                '& .MuiButton-startIcon': {
                  marginRight: props?.children ? '6px' : '0px',
                  marginLeft: '-2px',
                },
                ...props?.sxProps,
              }}
              {...buttonProps}
            >
              {props.children}
            </StyledButton>
          </span>
        </ButtonTooltip>
      ) : (
        <StyledButton
          id={props?.id ?? 'minor-button'}
          data-testid={props?.id ?? 'minor-button'}
          role="button"
          type="button"
          variant="outlined"
          sx={{
            color: (theme: any) => `${theme.breadcrumbs.underline}`,
            //Recent fix to make button fit child text
            minWidth: 'auto',
            whiteSpace: 'nowrap',
            paddingLeft: props?.startIcon ? '4px' : '6px',
            paddingRight: props?.children
              ? props?.startIcon
                ? '8px'
                : '8px'
              : '4px',
            backgroundColor: (theme: any) => `${theme.nav.fill}`,
            '&:hover': {
              boxShadow: 3,
              color: 'primary.light',
              borderColor: 'primary.light',
              backgroundColor: (theme: any) => `${theme.nav.fill}`,
            },
            ...props?.sxProps,
          }}
          {...buttonProps}
        >
          {props.children}
        </StyledButton>
      )}
    </>
  );
}

export function ButtonAlertUi({
  children,
  props = {},
  severity = 'info',
  sxProps = {},
}: {
  children?: any;
  props?: ButtonProps;
  severity?: string;
  sxProps?: any;
}) {
  const getButtonColor = (theme: any) => {
    switch (severity) {
      case 'info':
        return `${theme.palette.info.light}`;
      case 'warning':
        return `${theme.palette.warning.light}`;
      case 'error':
        return `${theme.palette.error.light}`;
      case 'success':
        return `${theme.palette.success.light}`;
      default:
        return `${theme.palette.info.light}`;
    }
  };

  return (
    <Button
      id={props?.id ?? 'modal-main-button'}
      data-testid={props?.id ?? 'modal-main-button'}
      role="button"
      type="button"
      size="small"
      {...props} //order important
      sx={{
        backgroundColor: (theme: any) => getButtonColor(theme),
        color: 'white',
        margin: '6px',
        ...sxProps,
        maxHeight: maxButtonHeight,
      }}
    >
      {children}
    </Button>
  );
}

/**
 * Branded Chip Button
 * @param {BrandedChipProps} props
 * @return {JSX.Element} React Component
 */
export function ButtonChipUi(props: BrandedChipProps) {
  return (
    <StyledChip
      id={props?.id ?? 'chip-button'}
      data-testid={props?.id ?? 'chip-button'}
      role="button"
      variant="outlined"
      sx={{
        backgroundColor: (theme: any) => `${theme.nav.fill}`,
        '&:hover': {
          color: 'primary.light',
          borderColor: 'primary.light',
        },
        ...props?.sxprops,
      }}
      {...props}
    >
      {props.children}
    </StyledChip>
  );
}

export function ButtonLoadingUi(props: BrandedButtonProps) {
  return (
    <StyledLoadingButton
      id={props?.id ?? 'loading-button'}
      data-testid={props?.id ?? 'loading-button'}
      type={props?.type || 'submit'}
      disableElevation
      variant="outlined"
      loading={true}
      loadingPosition="center"
      loadingIndicator={
        <Box //contains circular loader & Loading text
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: (theme: any) =>
              `${theme.button.disabledBackgroundColor}`,
          }}
        >
          <CircularProgress sx={{ color: 'common.white' }} size={14} />
          <Typography
            sx={{
              color: 'common.white',
              marginLeft: '4px',
              fontSize: '12px',
              minWidth: '52px',
              maxWidth: undefined,
            }}
            variant="button"
          >
            {props.loadingText || 'Loading'}
          </Typography>
        </Box>
      }
      sx={{
        boxShadow: 1,
        border: '1px solid',
        //borderColor: 'primary.light',
        borderColor: (theme: any) => `${theme.breadcrumbs.underline}`,
        // background: 'linear-gradient(180deg, #405CA7 0%, #2C4B93 100%)', //mico to-do
        backgroundColor: 'primary.dark', //'primary.main',
        color: 'common.white', //'primary.contrastText',
        minHeight: minButtonHeight,
        //maxHeight: maxButtonHeight,

        paddingLeft: props?.startIcon ? '8px' : '12px',
        paddingRight: '12px',
        '&:hover': {
          border: '1px solid',
          borderColor: 'primary.light',
          backgroundColor: 'primary.light',
          cursor: 'pointer',
        },
        '&:disabled': {
          boxShadow: 2,
          backgroundColor: (theme: any) =>
            `${theme.button.disabledBackgroundColor}`,
          color: (theme: any) => `${theme.button.disabledColor}`,
        },
        ...props.sxProps,
      }}
      startIcon={<CheckCircleIcon />}
      {...props}
    >
      {props.children}
    </StyledLoadingButton>
  );
}

export function ButtonSelectUi(props: BrandedButtonProps) {
  const { sxProps, ...buttonProps } = props;

  return (
    <StyledButton
      id={props?.id ?? 'main-button'}
      data-testid={props?.id ?? 'main-button'}
      role="button"
      type="button"
      variant="contained"
      sx={{
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: 'primary.light',
        background: 'linear-gradient(180deg, #405CA7 0%, #2C4B93 100%)', //mico to-do
        color: 'common.white',
        minWidth: 'auto',
        height: '36px',
        paddingLeft: '6px',
        paddingRight: '6px',
        marginTop: '8px',
        whiteSpace: 'nowrap',
        '&:hover': {
          background: 'transparent',
          backgroundColor: 'primary.light',
          cursor: 'pointer',
        },
        '&:disabled': {
          boxShadow: 2,
          backgroundColor: (theme: any) =>
            `${theme.button.disabledBackgroundColor}`,
          color: (theme: any) => `${theme.button.disabledColor}`,
        },
        ...props?.sxProps,
      }}
      startIcon={
        <TouchAppIcon
          sx={{
            margin: 0,
            padding: 0,
            width: '24px',
            height: '24px', //minButtonHeight-2, //MG maybe
          }}
        />
      }
      {...buttonProps}
    />
  );
}

/**
 * Icon button to copy given text to the clipboard
 * @param {string} [id] Optional id for button
 * @param {string} [name='button-copy'] name for button
 * @param {string} text Actual text to be copied to clipboard
 * @param {strimg} [tooltip] Optional tooltip to display for button
 * @param {*} [sxProps] Style properties to apply to button
 * @return {JSX.Element} Rendered button
 */
export function ButtonCopyText({
  iconColor = 'white',
  iconSize = 'small',
  id = '',
  label,
  name = 'button-copy',
  text,
  tooltip = '',
  sxProps = {},
}: {
  iconColor?: string;
  iconSize?: string;
  id?: string;
  label?: JSX.Element | string;
  name?: string;
  props?: IconButtonProps;
  sxProps?: any;
  text: string;
  tooltip?: string;
}) {
  return (
    <ButtonIcon
      id={id}
      name={name}
      tooltip={tooltip}
      sxProps={sxProps}
      props={{
        onClick: (event) => {
          event.stopPropagation();
          copyTextToClipboard(text);
        },
      }}
    >
      <>
        {label}
        <ContentCopyIcon sx={{ color: iconColor, size: iconSize }} />
      </>
    </ButtonIcon>
  );
}

//For buttons next to Form Headers
//because the buttoninfofield is not working correctly
export const ButtonInfoFormHeaderLayout = {
  margin: '0px 8px',
};

export const ButtonInfoGridItemLayout = {
  display: 'flex',
  alignItems: 'center',
  maxHeight: '36px',
};

export function ButtonIcon({
  id = '',
  name = 'button-icon-default',
  tooltip = '',
  tooltipProps = {},
  props = {},
  sxProps = {},
  children,
}: {
  id?: string;
  name?: string;
  props?: IconButtonProps;
  sxProps?: any;
  tooltip?: string;
  tooltipProps?: Partial<TooltipProps>;
  children: JSX.Element;
}) {
  return (
    //button method to retrieve injected option OR default requires empty react element to wrap
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {tooltip ? (
        <ButtonTooltip
          id={id ?? name}
          title={tooltip}
          tooltipProps={tooltipProps}
        >
          <StyledIconButton
            aria-label={id ?? name}
            data-testid={id ?? name}
            name={name}
            role="button"
            sx={{ ...sxProps }}
            {...props}
          >
            {children}
          </StyledIconButton>
        </ButtonTooltip>
      ) : (
        <StyledIconButton aria-label={name} sx={{ ...sxProps }} {...props}>
          {children}
        </StyledIconButton>
      )}
    </>
  );
}

export function ButtonTooltip({
  id = 'tooltip',
  tooltipProps = {},
  title = '',
  children,
}: {
  id?: string;
  title?: string;
  tooltipProps?: Partial<TooltipProps>;
  children: JSX.Element;
}) {
  return (
    <Tooltip
      key={id}
      arrow
      enterDelay={500}
      enterNextDelay={500}
      // maintain any \n in tooltip by having the span
      title={<span style={{ whiteSpace: 'pre-line' }}>{title}</span>}
      PopperProps={{ style: { zIndex: 99999 } }} // ON TOP even when on context menu
      {...tooltipProps}
    >
      {/* span included here so that we can see the tooltip even if button is disabled */}
      <span>{children}</span>
    </Tooltip>
  );
}

/**
 * Provides wrapper for menu of desired options
 * @param {any} [optionButton] Button to display for launching menu instead of vertical ... icon
 * @param {string} [id] Id for ButtonOptions
 * @param {string} [tooltip] The tooltip to display for button
 * @param {string[]} [menuOptions] The options for the menu
 * @param {boolean} [closeOnClick=false] Whether to close menu on any click
 * @param {boolean} [disabled] Whether to disable the button which brings up menu
 * @param {(optionIndex: number) => void} onOptionSelect Function to call when an option is selected
 * @param {() => void} onTrigger Function called when menu to opened
 * @returns {React.ReactElement}
 */
export function ButtonOptions({
  children,
  optionButton,
  id = 'options',
  tooltip = '',
  menuOptions = [],
  closeOnClick = false,
  disabled = false,
  onOptionSelect,
  onTrigger,
}: {
  children?: JSX.Element;
  optionButton?: any;
  id?: string;
  tooltip?: string;
  menuOptions?: string[];
  closeOnClick?: boolean;
  disabled?: boolean;
  onOptionSelect?: (optionIndex: number) => void;
  onTrigger?: (event?: any) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onTrigger) {
      onTrigger(event);
    }
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const defaultOptionButton = (onHandleClick: any, aTooltip: string) => (
    <ButtonIcon
      id={id}
      tooltip={aTooltip}
      props={{
        onClick: onHandleClick,
        disabled: disabled,
      }}
    >
      <MoreVertIcon fontSize="medium" />
    </ButtonIcon>
  );

  const styledOptionButton = () => {
    return optionButton
      ? optionButton(handleClick, tooltip)
      : defaultOptionButton(handleClick, tooltip);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      {styledOptionButton()}
      {menuOptions && (
        <Menu
          MenuListProps={{
            'aria-labelledby': 'options-button',
          }}
          id="options-menu"
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          onClick={(event) => {
            //  CCUI-1234 - close when item clicked as well but don't propagate further
            if (closeOnClick) {
              event.stopPropagation();
              handleClose();
            }
          }}
          sx={{ zIndex: 9999 }}
        >
          {menuOptions.map((option: string, index: number) => (
            <MenuItem
              key={'option-' + index}
              data-testid={id + '-option-' + index}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
      )}
      {children && open && (
        <Menu
          MenuListProps={{
            'aria-labelledby': 'options-button',
            sx: {
              bgcolor: 'transparent',
              height: 'auto',
              padding: '0px',
              margin: '0px',
            },
          }}
          id="options-menu"
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          onClick={(event) => {
            //  CCUI-1234 - close when item clicked as well but don't propagate further
            if (closeOnClick) {
              event.stopPropagation();
              handleClose();
            }
          }}
          sx={{ zIndex: 9999 }}
        >
          {children}
        </Menu>
      )}
    </>
  );
}
