import { createTheme } from '@mui/material/styles';

export const primaryDateStyle = 'MM/dd/yyyy';
export const primaryTimeStyle = 'H:mm';
export const timeStyleWithSeconds = 'H:mm:ss';

export const dividerColor = '#2E2E2E';

const tabHeight = '38px';
const tooltipColor = '#6F96FF'; //'#303030';
const tooltipOutline = '0px solid #505050'; //'2px solid #505050';
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
      contrastText: '#212121',
    },
    secondary: {
      main: '#ed6c02', //#A5BEFF
      dark: '#FFFFFF',
      light: '#FFFFFF',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.85)',
      disabled: 'rgba(255, 255, 255, 0.6)',
    },
    background: {
      paper: '#212125',
      default: '#282b30',
    },
  },
  accordion: {
    borderBottom: `1px solid #36393e`,
    backgroundColor: '#282b30',
    borderColor: '#36393e',
    titleBackgroundColor: '#282b30',
  },
  breadcrumbs: {
    default: '#C8C8C8', //disabled breadcrumb text
  },
  button: {
    disabledBackgroundColor: '#293658', //'#07128580',
    disabledColor: '#C1C9DB99',
    minorBackgroundColor: '#213157', //'#333333',
  },
  card: {
    default: 'linear-gradient(180deg, #3E5BA5BF 0%, #2E4C94BF 100%)',
    borderColor: '#8AA6D0',
    defaultHover: 'linear-gradient(180deg, #8AA6D0 0%, #8AA6D0 100%)',

    titleColor: '#FFFFFF', // white
    instructionsColor: colorPop ? '#edb445' : '#edb445',
    formInstructionsColor: '#212125',
  },
  header: {
    border: '#ffffffb0',
    buttonColor: '#C5C5C5',
    default: '#282b30',
    hoverColor: '#FFFFFF',
    light: '#9AA8CD', //loading bar color
    dark: '#333',
    title: '#ffffffc0', // white @ 80% opacity
  },
  input: {
    outlineColor: '#464646', //see overrides below MuiFilledInput, MuiFilledInput+MuiOutlinedInput
    fill: '#26272C',
    disabledFill: '#26272C',
    disabledOutlineColor: '#26272C', //before making outline color match fill  '#36393E',
  },
  nav: {
    fill: '',
    fillSelected: '#FFC84018',
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
            borderLeft: '4px solid #2d2d2d',
            minHeight: '48px',
          },
          '*::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover':
            {
              backgroundColor: '#808080d0',
              borderLeft: '4px solid #2d2d2d',
              cursor: 'pointer',
            },
          '*::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '14px',
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
          backgroundColor: '#383838',
          '& .MuiAlert-action': {
            '& .MuiIconButton-root': {
              color: '#b0b0b0', //close button
              '&:hover': { color: '#fff', background: '#ffffff1a' },
            },
          },
        },
        standardInfo: {
          backgroundColor: '#22282F',
          color: 'white',
          borderColor: '#03a9f4BF', //25%

          '& .MuiAlert-icon': { color: '#03a9f4BF' },
          '& .MuiAlert-action': {
            color: 'white',
            '& .MuiIconButton-root': {
              color: 'white', //close button
              '&:hover': { background: '#0288d1' }, //10% opacity
            },
          },
        }, //palette.info.main
        standardWarning: {
          backgroundColor: '#372E27',
          color: 'white',
          borderColor: '#ff9800BF',
          '& .MuiAlert-icon': { color: '#ff9800BF' },
          '& .MuiAlert-action': {
            color: 'white',
            '& .MuiIconButton-root': {
              color: 'white', //close button
              '&:hover': { background: '#ed6c02' }, //10% opacity
            },
          },
        }, //palette.warning.main
        standardError: {
          backgroundColor: '#35282A',
          color: 'white',
          borderColor: '#ef5350BF',
          '& .MuiAlert-icon': { color: '#ef5350BF' },
          '& .MuiAlert-action': {
            color: 'white',
            '& .MuiIconButton-root': {
              color: 'white', //close button
              '&:hover': { background: '#d32f2f' },
            },
          },
        }, //palette.error.main
        standardSuccess: {
          backgroundColor: '#2B362D',
          color: 'white',
          borderColor: '#4caf50BF',
          '& .MuiAlert-icon': { color: '#4caf50BF' },
          '& .MuiAlert-action': {
            color: 'white',
            '& .MuiIconButton-root': {
              color: 'white', //close button
              '&:hover': { background: '#2e7d32' }, //10% opacity
            },
          },
        }, //palette.success.main},
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiAutocomplete-popupIndicator': {
            //dropdown arrow
            color: '#6F96FF', //primary.main
            bottom: '6px', //vertically centers
          },
          '& .MuiAutocomplete-clearIndicator': {
            //clear X button
            color: '#6F96FF', //primary.main
            bottom: '6px', //vertically centers
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
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: mainColor,
          minWidth: 32,
          fontSize: 24,
          '&:hover': {
            color: '#6F96FF', // primary.main
            cursor: 'pointer',
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        },
        primary: {
          fontWeight: 'bold',
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
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: '#6F96FF', //primary.main - dropdown arrow color
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
          border: '1px solid #6F96FF',
          color: 'common.white',
          backgroundColor: '#3C59A2',
          fontSize: '14px',
          '&.Mui-selected': {
            border: '2px solid #293658',
            backgroundColor: '#293658',
            color: '#FFFFFFCC',
            '&:hover': {
              border: '2px solid #293658',
              backgroundColor: '#293658',
              color: '#FFFFFFCC',
              cursor: 'default',
            },
          },
          '&:hover': {
            border: '1px solid',
            borderColor: '#6F96FF',
            backgroundColor: '#8AA6D0',
            color: '#FFFFFF',
            cursor: 'pointer',
          },
        },
      },
    },
  },
});
