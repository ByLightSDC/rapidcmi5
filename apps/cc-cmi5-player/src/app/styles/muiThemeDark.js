import { createTheme } from '@mui/material/styles';

export const primaryDateStyle = 'MM/dd/yyyy';
export const primaryTimeStyle = 'H:mm';
export const timeStyleWithSeconds = 'H:mm:ss';

const tabHeight = '38px';
const tooltipColor = '#303030';
const tooltipOutline = '1px solid #505050'; //'2px solid #505050';
const tooltipPadding = '4px 16px';

const colorPop = true;
const mainColor = '#6F96FF'; //icons, button fills
const hoverMainColor = '#8cadfa'; //button hover

export const darkTheme = createTheme({
  palette: {
    error: {
      main: '#fc5451', // textfield error and helper text
    },
    mode: 'dark',
    primary: {
      main: mainColor,
      dark: '#3C59A2',
      light: hoverMainColor,
      contrastText: '#fff',
    },
    secondary: {
      main: '#a8a7a7',
      dark: '#FFFFFF',
      light: '#FFFFFF',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.85)',
      disabled: 'rgba(255, 255, 255, 0.6)',
      hint: 'rgba(255, 255, 255, 0.6)',
      interactable: '#ffffffe8', // white @ 90% opacity
    },
    background: {
      paper: '#212125',
      default: '#282b30',
    },
  },
  // accordion: {
  //   borderBottom: `1px solid #36393e`,
  //   backgroundColor: '#282b30',
  //   borderColor: '#36393e',
  //   titleBackgroundColor: '#282b30',
  // },
  // card: {
  //   default: 'linear-gradient(180deg, #3E5BA5BF 0%, #2E4C94BF 100%)',
  //   borderColor: '#8AA6D0',
  //   defaultHover: 'linear-gradient(180deg, #8AA6D0 0%, #8AA6D0 100%)',

  //   titleColor: '#FFFFFF', // white
  //   instructionsColor: colorPop ? '#edb445' : '#edb445',
  //   formInstructionsColor: '#212125',
  // },
  breadcrumbs: {
    default: '#C8C8C8', //disabled breadcrumb text
    underline: mainColor,
    hoverColor: '#a8a7a7',
    hoverBackground: '#FFC84020',
  },
  button: {
    disabledBackgroundColor: '#293658', //'#07128580',
    disabledColor: '#C1C9DB99',
    gradient: 'linear-gradient(180deg, #405CA7 0%, #2C4B93 100%)',
    minorBackgroundColor: '#213157', //'#333333',
    indicatorColor: mainColor,
    iconColor: mainColor,
  },
  form: {
    backgroundColor: '#282b30',
  },
  header: {
    // border: '#ffffffb0',
    // buttonColor: '#C5C5C5',
    // selColor: '#A5BEFF', //'#a4c9eb', //selColor: '#A5BEFF',
    // default: '#282b30',
    // hoverColor: '#FFFFFF',
    // light: '#9AA8CD', //loading bar color
    // dark: '#333',
    title: '#ffffffc0', // white @ 80% opacity
    //underline: '#666666'//'DarkGray', //divider OR parting line
  },
  input: {
    outlineColor: '#464646', //see overrides below MuiFilledInput, MuiFilledInput+MuiOutlinedInput
    fill: '#26272C',
    disabledFill: '#26272C',
    disabledOutline: '#26272C',
    disabledOutlineColor: '#26272C', //before making outline color match fill  '#36393E',
  },
  nav: {
    fill: '',
    fillSelected: '#3D4047',
    icon: '#ffffffc0',
    iconSelected: '#FFC840',
    border: '#FFC840d0',
    borderSelected: '#FFC840',
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
            backgroundColor: '#808080b0',
            border: '2px solid #dd6fff00', //inset thumb on track background color
            minHeight: '48px',
          },
          '*::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover':
            {
              backgroundColor: '#808080d0',
              borderLeft: '4px solid #2d2d2d',
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
    MuiDialog: {
      styleOverrides: {
        paperWidthSm: {
          borderStyle: 'solid',
          borderColor: '#333',
          minWidth: 480,
        },
        paperWidthMd: {
          overflow: 'hidden',
          width: 'auto',
        },
        paper: {
          backgroundColor: '#282b30',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        arrow: {
          '&:before': {
            color: tooltipColor,
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
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        underline: {
          '&&&:before': {
            borderBottom: '1px solid #59595930', // input border color with some transparency
          },
          '&&:after': {
            borderBottom: '1px solid #59595930',
          },
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
          color: mainColor,
          '&:hover': {
            color: '#6F96FF',
            backgroundColor: '#6F96FF20',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          border: '1px solid #42464D', // input fill borderColor
        },
      },
    },
    // careful, settings here can trigger scrollbar
    MuiTab: {
      styleOverrides: {
        root: {
          height: tabHeight,
          minHeight: tabHeight,
          minWidth: 144,
        },
      },
    },
  },
});
