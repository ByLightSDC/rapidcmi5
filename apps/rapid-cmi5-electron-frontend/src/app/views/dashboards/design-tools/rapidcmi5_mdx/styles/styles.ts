import { TooltipProps } from '@mui/material';

const myGrey = '#2E2E2E';
const myLightGray = '#3F3F3F';
export const bgColor = myGrey; //'DarkSlateGray'
export const toolsBgColor = myGrey;
export const borderBgColor = myLightGray;
export const textColorGray = '#B0B0B0';
export const iconButtonStyle = {
  padding: '2px',
  margin: 0,
  marginLeft: '4px',
  marginRight: '4px',
  height: '32px',
  width: '32px',
};

export const tooltipStyle: Partial<TooltipProps> = {
  placement: 'top',
};

export const iconButtonSize = undefined;

/**
 * REF handy for debugging
 */
const testOverrideStyle = {
  '& .MuiOutlinedInput-notchedOutline': {
    border: `5px solid red`,
  },
  '&.Mui-focused': {
    '& .MuiOutlinedInput-notchedOutline': {
      border: `5px dotted red`,
    },
  },
};

/**
 * default text field style with no border
 * to override the blue highlighted default focus
 * its distracting in this context
 */
export const overrideTextInputStyle = {
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&.Mui-focused': {
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
};

export const expandedToolStackStyle = {
  backgroundColor: toolsBgColor,
  display: 'flex',
  width: '90%',
  justifyContent: 'flex-start',
  alignItems: 'center',
  alignContent: 'center',
  color: 'white',
  height: 'auto',
  marginBottom: '12px',
  flexWrap: 'wrap',
};
