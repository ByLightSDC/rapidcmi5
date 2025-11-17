import { createSlice } from '@reduxjs/toolkit';
import { Meta } from '@storybook/react';

/**
 * MUI
 */
import { Box } from '@mui/material';
import { FormColors } from './FormColors';

export default {
  title: 'Colors/Components/Form',
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

const Template = ({ args }) => (
  <div id="app-content">
    <Box className={'contentBox'} id="content">
      <FormColors />
      <Box id="footer_nav" sx={{ margin: '0px' }} />
    </Box>
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  backgroundColor: 'background.default',
  inputFillColor: 'input.fill',
  primaryButtonColor: 'linear-gradient(180deg, #405CA7 0%, #2C4B93 100%)',
  cancelButtonColor: 'background.default',
  infoButtonColor: 'info.main',
  titleTextColor: 'text.primary',
  primaryButtonTextColor: 'common.white',
  cancelButtonTextColor: 'primary.main',
  instructionsTextColor: 'text.hint',
  inputTextColor: 'text.primary',
  inputDisabledTextColor: 'text.disabled',
};

Primary.argTypes = {
  backgroundColor: {
    description: '[1] Form Background Color <b><i>background.default<i></b>',
  },

  cancelButtonColor: {
    description:
      'Secondary (Cancel) Button Color <b><i>background.default<i></b>',
  },
  cancelButtonTextColor: {
    description:
      'Secondary (Cancel) Button Text Color <b><i>primary.main<i></b>',
  },
  infoButtonColor: {
    description: 'Information Button Color <b><i>info.main<i></b>',
  },
  inputFillColor: {
    description: '[2] Input Fill Color <b><i>input.fill<i></b>',
  },
  inputTextColor: {
    description: 'Input Active Text Color <b><i>text.primary<i></b>',
  },
  inputDisabledTextColor: {
    description: 'Input Disabled Text Color <b><i>text.disabled<i></b>',
  },
  instructionsTextColor: {
    description: 'Instructions Text Color <b><i>text.hint<i></b>',
  },
  primaryButtonColor: {
    description: 'Primary Button Color',
  },
  primaryButtonTextColor: {
    description: 'Primary Button Text Color <b><i>common.white<i></b>',
  },
  titleTextColor: {
    description: 'Form Title Text Color <b><i>text.primary<i></b>',
  },
};
