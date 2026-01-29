import { createTheme } from "@mui/system";

export const primaryDateStyleDark = 'MM/dd/yyyy';
export const primaryTimeStyleDark = 'H:mm';
export const timeStyleWithSecondsDark = 'H:mm:ss';

export const dividerColorDark = '#2E2E2E';

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
          backgroundColor: '#015f8a1A', //15%
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
          backgroundColor: '#ff98001A',
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
          backgroundColor: '#ef53501A',
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
          backgroundColor: '#4caf5026',
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
              // border: '2px solid #ffffff88',
              // backgroundColor: '#9e9e9e40',
              // color: '#FFF',
              border: '2px solid #293658',
              backgroundColor: '#293658',
              color: '#FFFFFFCC',
              cursor: 'default',
            },
          },
          '&:hover': {
            border: '1px solid',
            backgroundColor: '#8AA6D0',
            color: 'common.white',
            cursor: 'pointer',
          },
        },
      },
    },
  },
});
