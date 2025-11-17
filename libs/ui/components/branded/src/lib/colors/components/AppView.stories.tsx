import { PaperWrapper } from '../../storybook/PaperWrapper';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { commonAppReducer } from '@rangeos-nx/ui/redux';
import { BrowserRouter } from 'react-router';
import { Provider } from 'react-redux';
import { Meta } from '@storybook/react';

/**
 * MUI
 */
import { Box, Divider, IconButton, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import AppLogo from '../../apps/AppLogo';
import { One, Three, Two } from '../constants';
import { Color, useTheme } from '@mui/material/styles';
import { AppMenu } from '@rangeos-nx/ui/branded';

import LogoffIcon from '@mui/icons-material/PowerSettingsNew';
import SettingsIcon from '@mui/icons-material/Settings';

// THEME upper right button style
const appIconStyle = {
  marginLeft: '8px',
  color: (theme: any) => `${theme.header.buttonColor}`,
  '&:hover': {
    backgroundColor: 'primary.dark',
    color: (theme: any) => `${theme.header.hoverColor}`,
  },
};

export default {
  title: 'Colors/Components/App View',
} as Meta;

const mock = createSlice({
  name: 'commonAppTrans',
  initialState: {
    appHeaderVisible: true,
    breadCrumbLeft: 8,
    breadCrumbVisible: true,
    plugins: [],
  },

  reducers: {
    setAppHeaderVisible: (state, action) => {
      //
    },
    setBreadCrumbLeft: (state, action) => {
      //
    },
    setBreadCrumbVisible: (state, action) => {
      //
    },
    setPlugins: (state, action) => {
      //
    },
  },
});

const store = configureStore({
  reducer: {
    commonApp: commonAppReducer,
    commonAppTrans: mock.reducer,
  },
});

const Template = ({ args }) => (
  <PaperWrapper>
    <Provider store={store}>
      <BrowserRouter>
        <Box
          sx={{
            borderColor: (theme: any) => `${theme.input.outlineColor}`,
            borderStyle: 'solid',
            borderWidth: 0.5,
          }}
        >
          <Box
            sx={{
              height: '40px',
              backgroundColor: (theme: any) => `${theme.header.default}`,
            }}
          >
            <StoryAppHeader />
          </Box>
          <Divider
            orientation="horizontal"
            variant="fullWidth"
            sx={{
              boxShadow: 0,
              borderBottomWidth: '1.5px',
              backgroundColor: (theme: any) => `${theme.input.outlineColor}`,
              color: (theme: any) => `${theme.header.default}`,
            }}
          ></Divider>

          <One sx={{ position: 'relative', left: 300, top: -25 }} />

          <Paper sx={{ minHeight: '480px' }}>
            <Two sx={{ position: 'relative', left: 100, top: 100 }} />
          </Paper>
        </Box>
      </BrowserRouter>
    </Provider>
  </PaperWrapper>
);

export const Primary = Template.bind({});
Primary.args = {
  color1: 'header.default',
  color2: 'background.paper',
  color3: 'header.buttonColor',
  color4: 'header.hoverColor',
};

Primary.argTypes = {
  color1: {
    description:
      '[1] AppHeader Background <b><i>header.default<i></b>See Color Variables story for swatches',
  },
  color2: {
    description: '[2] App  Background <b><i>background.paper<i></b>',
  },
  color3: {
    description: '[3] AppHeader Icon  <b><i>header.buttonColor<i></b>',
  },
  color4: {
    description: 'AppHeader Icon Hover  <b><i>header.hoverColor<i></b>',
  },
};

function StoryAppHeader() {
  const currentThemeData = useTheme();

  return (
    <Grid
      container
      sx={{
        //we need this to avoid layout issue (see Scenario Designer drawers top alignment)
        height: '40px',
        backgroundColor: (theme: any) => `${theme.header.default}`,
        alignItems: 'center',
        alignContent: 'center',
        paddingTop: '0px',
      }}
    >
      <AppLogo
        assetId="devops-portal"
        isNavOpen={false}
        appThemeColor={currentThemeData.palette.mode}
      />
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          justifyContent: 'flex-end',
          right: '12px',
        }}
      >
        <AppMenu />
        <IconButton
          aria-label="user-settings"
          id="settings-menu-anchor"
          sx={appIconStyle}
        >
          <SettingsIcon />
        </IconButton>

        <IconButton
          data-testid="button-log-off"
          aria-label="logout"
          sx={appIconStyle}
        >
          <LogoffIcon />
        </IconButton>

        <Three sx={{ position: 'absolute' }} />
      </Box>
    </Grid>
  );
}
