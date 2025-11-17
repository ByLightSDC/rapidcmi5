import Button, { ButtonProps } from '@mui/material/Button';
//import styled from '@emotion/styled';

/* Material UI */
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material';

const minButtonWidth = '0px';
const minButtonHeight = '32px';

const StyledButton = styled(Button)(({ theme }: { theme: any }) => ({
  margin: 2,
  padding: 0,
  //paddingTop: 2, //text align fix
  minHeight: minButtonHeight,
  role: 'button',
}));

export function ButtonModalMainUi(props: ButtonProps) {
  // optional "type" prop to override - when multiple "main" buttons in form - e.g. upload file
  const { sx, ...otherProps } = props;

  const type = props.type ? props.type : 'submit';
  return (
    <StyledButton
      id={props?.id ?? 'modal-main-button'}
      data-testid={props?.id ?? 'modal-main-button'}
      role="button"
      type="button"
      variant="contained"
      sx={{
        backgroundColor: 'primary.dark', //'primary.main' to 'primary.dark'
        border: '1px solid',
        borderColor: 'primary.light',

        color: 'common.white',
        minWidth: minButtonWidth,
        //maxHeight: maxButtonHeight,
        paddingLeft: props?.startIcon ? '0px' : '6px',
        paddingRight: props?.children
          ? props?.startIcon
            ? '6px'
            : '4px'
          : '0px',

        '&:hover': {
          border: '2px solid',
          borderColor: 'primary.light',
          backgroundColor: 'primary.light',
          cursor: 'pointer',
        },
        '&:disabled': {
          backgroundColor: (theme: any) =>
            `${theme?.button?.disabledBackgroundColor ?? 'blue'}`,
          color: (theme: any) => `${theme?.button?.disabledColor ?? 'white'}`,
        },
        ...sx,
      }}
      startIcon={<CheckCircleIcon />}
      {...otherProps}
    >
      {props.children}
    </StyledButton>
  );
}

export function ButtonModalMinorUi(props: ButtonProps) {
  return (
    <StyledButton
      id={props?.id ?? 'modal-minor-button'}
      data-testid={props?.id ?? 'modal-minor-button'}
      role="button"
      type="button"
      variant="outlined"
      sx={{
        boxShadow: 1,
        backgroundColor: 'primary.dark',
        color: 'common.white',
        minWidth: minButtonWidth,
        // minHeight: minButtonHeight,
        paddingLeft: props?.startIcon ? '4px' : '12px',
        paddingRight: props?.children
          ? props?.startIcon
            ? '12px'
            : '12px'
          : '0px',
        '&:hover': {
          boxShadow: 2,
          backgroundColor: 'primary.light',
          //color: 'primary.light',
          borderColor: 'primary.light',
        },
        '&:disabled': {
          boxShadow: 2,
          backgroundColor: (theme: any) =>
            `${theme.button.disabledBackgroundColor}`,
          color: (theme: any) => `${theme.button.disabledColor}`,
        },
      }}
      {...props}
    >
      {props.children}
    </StyledButton>
  );
}

export function ButtonModalCancelUi(props: ButtonProps) {
  return (
    <StyledButton
      id={props?.id ?? 'modal-minor-button'}
      data-testid={props?.id ?? 'modal-minor-button'}
      role="button"
      type="button"
      variant="outlined"
      sx={{
        boxShadow: 1,
        borderColor: (theme: any) => `primary.dark`,
        color: (theme: any) => `${theme.breadcrumbs.underline}`,
        minWidth: minButtonWidth,
        //minHeight: minButtonHeight,
        paddingLeft: props?.children
          ? props?.startIcon
            ? '8px'
            : '12px'
          : '0px',
        paddingRight: props?.children
          ? props?.startIcon
            ? '12px'
            : '12px'
          : '0px',
        '&:hover': {
          boxShadow: 2,
          backgroundColor: 'primary.light',
          color: 'common.white',
          borderColor: 'primary.light',
        },
        '&:disabled': {
          boxShadow: 2,
          //backgroundColor: (theme: any) => `${theme.button.disabledBackgroundColor}`,
          color: (theme: any) => `${theme.button.disabledColor}`,
        },
      }}
      {...props}
    >
      {props.children}
    </StyledButton>
  );
}
