//@ts-nocheck
import { createTheme } from '@mui/material/styles';

export const primaryDateStyle = 'MM/dd/yyyy';
export const primaryTimeStyle = 'H:mm';
export const timeStyleWithSeconds = 'H:mm:ss';

export const fieldMarginTop = '8px';
const tabHeight = '38px';
const tooltipColor = '#3C59A2'; //'#505050';
const tooltipOutline = '0px solid #707070';
const tooltipPadding = '4px 16px';

const mainColor = '#3C59A2'; //icons, button fills
const hoverMainColor = '#8AA6D0'; //button hover

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: mainColor,
      dark: '#3C59A2',
      light: hoverMainColor,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D2042D',
      dark: '#3C59A2',
      light: '#D2042D',
      contrastText: '#3C59A2',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.9)', //unusable
      secondary: '#323232D9',
      disabled: 'rgba(0, 0, 0, .6)',
      hint: '#656565',
      interactable: '#212121',
    },
    background: {
      paper: '#F8F8F8',
      default: '#EEEEEE',
    },
  },
  accordion: {
    borderBottom: `1px solid #D4D5DB`,
    backgroundColor: '#EEEEEE',
    borderColor: '#D4D5DB',
    titleBackgroundColor: '#EEEEEE',
  },
  button: {
    disabledBackgroundColor: '#7f8cb9',
    disabledColor: '#C1C9DB',
    minorBackgroundColor: '#3C59A2',
  },
  breadcrumbs: {
    default: '#202020',
    underline: mainColor, //interactive
    hoverColor: '#133c67', //TODO
    hoverBackground: 'A6A6A6',
  },
  card: {
    default: 'linear-gradient(180deg, #3E5BA5 0%, #2E4C94 100%)',
    defaultHover: 'linear-gradient(180deg, #8AA6D0 0%, #8AA6D0 100%)',
    borderColor: '#8AA6D0',
    titleColor: '#FFFFFF',
    formInstructionsColor: '#E5F6FDBF',
  },
  form: {
    backgroundColor: '#EEEEEE',
  },
  header: {
    border: '#ffffffc3', //active se
    buttonColor: '#C5C5C5',
    selColor: '#a4c9eb', //'#a4b8eb',
    default: '#282b30',
    light: '#071285B2', // loading bar color
    dark: '#f1f3f9',
    hoverColor: '#ffffff',
    title: '#3C59A2',
    underline: 'LightGrey', //divider OR parting line
  },
  input: {
    outlineColor: '#CBCBCB',
    fill: '#F5F6F9',
    disabledFill: '#CBCBCB00',
    disabledOutlineColor: '#CBCBCB4D', //before making outline color match fill '#88888860',
  },
  nav: {
    fill: '',
    fillSelected: 'red',
    icon: '#071285d0', // overriden
    iconSelected: '#071285',
    border: '#071285',
    borderSelected: '#071285',
  },
  typography: {
    fontFamily: [
      'Roboto',
      'BarlowCondensed',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: 36,
    },
    h2: {
      fontSize: 28,
    },
    h3: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h4: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    h5: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    h6: {
      fontSize: 16,
      fontWeight: 'bold',
    },

    button: {
      fontWeight: 'bold',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '*::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '*::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
            backgroundColor: '#3C59A2',
            border: '2px solid #dd6fff00', //inset thumb on track background color
            minHeight: '48px',
          },
          '*::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover':
            {
              backgroundColor: '#5871AF',
              borderLeft: '4px solid #f8f8f8',
              cursor: 'pointer',
            },
          '*::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '16px',
          },
          '*::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
            backgroundColor: '#transparent',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          border: '1px solid',
        },
        standardInfo: {
          borderColor: '#03a9f480',
        },

        standardWarning: {
          borderColor: '#ff980080',
        },
        standardError: {
          borderColor: '#EF535080', //light with transparency
        },
        standardSuccess: {
          borderColor: '#4caf5080', //palette.success.dark
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiAutocomplete-popupIndicator': {
            //dropdown arrow
            color: '#071285', //primary.main
            bottom: '6px', //vertically centers
          },
          '& .MuiAutocomplete-clearIndicator': {
            //clear X icon
            color: '#071285', //primary.main
            bottom: '6px', //vertically centers
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paperWidthSm: {
          minWidth: 480,
        },
        paperWidthMd: {
          overflow: 'hidden',
          padding: '0px',
          width: 'auto',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#3C59A2', // text.interactable
          minWidth: 32,
          fontSize: 24,
          '&:hover': {
            color: '#8AA6D0', // primary.light
            cursor: 'pointer',
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          color: '#35549b', // unusable
          fontWeight: 'bold',
          textTransform: 'uppercase',
        },
        primary: {
          fontWeight: 'bold',
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        underline: {
          '&&&:before': {
            borderBottom: '1px solid #CBCBCB30',
          },
          '&&:after': {
            borderBottom: '1px solid #CBCBCB30',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          border: '1px solid #CBCBCB', //text input active border color
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        endIcon: {
          marginLeft: '2px',
          marginRight: '2px',
          marginTop: '-2px',
        },
        startIcon: {
          marginLeft: '2px',
          marginRight: '2px',
          marginTop: '-2px',
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: '4px',
          color: '#3C59A2', // text.interactable
          '&:hover': {
            backgroundColor: '#8AA6D020',
            cursor: 'pointer',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: '#202020', //dropdown arrow color
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          height: tabHeight,
          minHeight: tabHeight,
          minWidth: 144,
          borderRadius: 4,
          color: 'white',
          backgroundColor: '#3C59A2',
          border: '1px solid #07128525',
          fontSize: '14px',
          '&.Mui-selected': {
            border: '0px solid #07128590',
            backgroundColor: '#7f8cb9',
            color: 'white',
            '&:hover': {
              //border: '0px solid #07128590',
              //backgroundColor: '#07128590',
              //color: '#FFFFFF',
              border: '0px solid #07128590',
              backgroundColor: '#7f8cb9',
              color: 'white',
              cursor: 'default',
            },
          },
          '&:hover': {
            border: '1px solid #8AA6D0',
            backgroundColor: '#8AA6D0',
            color: '#FFFFFF',
            cursor: 'pointer',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        arrow: {
          '&:before': {
            color: tooltipOutline,
            border: tooltipOutline,
          },
        },
        tooltip: {
          fontSize: 13,
          fontWeight: 'bold',
          backgroundColor: tooltipColor,
          border: tooltipOutline,
          padding: tooltipPadding,
        },
      },
    },
  },
});
