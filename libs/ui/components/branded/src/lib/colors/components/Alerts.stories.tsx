import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { accordionReducer, PaperWrapper } from '@rangeos-nx/ui/branded';

import { Meta } from '@storybook/react';

import { Box } from '@mui/system';
import { Alert, AlertTitle } from '@mui/material';

export default {
  title: 'Colors/Components/Alerts',
} as Meta;

const store = configureStore({
  reducer: {
    accordion: accordionReducer,
  },
});

const Template = ({ args }) => (
  <Provider store={store}>
    <PaperWrapper>
      <Box sx={{ margin: '4px' }}>
        <Alert severity="info">
          <AlertTitle>Info</AlertTitle>
          Here is some information.
          {/* <ButtonAlertUi sxProps={{ marginLeft: '24px' }}>Resume</ButtonAlertUi>
          <ButtonAlertUi>Clear</ButtonAlertUi> */}
        </Alert>
      </Box>
      <Box sx={{ margin: '4px' }}>
        <strong>
          <Alert severity="warning" sx={{ width: 'auto' }}>
            <AlertTitle>Warning</AlertTitle>
            Something might be wrong!
            {/* <ButtonAlertUi severity="warning">Button</ButtonAlertUi> */}
          </Alert>
        </strong>
      </Box>
      <Box sx={{ margin: '4px' }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          Something went wrong!
          {/* <ButtonAlertUi severity="error">Button</ButtonAlertUi> */}
        </Alert>
      </Box>
      <Box sx={{ margin: '4px' }}>
        <Alert severity="success">
          <AlertTitle>Success</AlertTitle>
          Success!
          {/* <ButtonAlertUi severity="success">Button</ButtonAlertUi> */}
        </Alert>
      </Box>
    </PaperWrapper>
  </Provider>
);

export const Primary = Template.bind({});
Primary.args = {
  infoColor: 'info.main',
  warningColor: 'warning.main',
  errorColor: 'error.main',
  successColor: 'success.main',
};

Primary.argTypes = {
  infoColor: {
    description:
      'Information Alert Color Color<b><i>info.main<i></b>See Color Variables story for swatches',
  },
  warningColor: {
    description: 'Warning Alert Color <b><i>warning.main<i></b>',
  },
  errorColor: {
    description: 'Error Alert Color <b><i>error.main<i></b>',
  },
  successColor: {
    description: 'Success Alert Color <b><i>success.white<i></b>',
  },
};
