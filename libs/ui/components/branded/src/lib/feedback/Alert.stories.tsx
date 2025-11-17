import { ComponentStory, ComponentMeta } from '@storybook/react';

import { ButtonAlertUi } from '../inputs/buttons/buttons';

/* MUI */
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Paper, Stack } from '@mui/material';
import { PaperWrapper } from '../storybook/PaperWrapper';

export default {
  component: Alert,
  title: 'feedback/Alert',
};

const Template: ComponentStory<typeof Alert> = (args) => {
  const handleCloseAlert = () => {
    //
  };

  return (
    <PaperWrapper>
      <Box sx={{ margin: '4px' }}>
        <Alert severity="info" onClose={handleCloseAlert}>
          <AlertTitle>Info</AlertTitle>
          You have something in progress.
          <ButtonAlertUi sxProps={{ marginLeft: '24px' }}>Resume</ButtonAlertUi>
          <ButtonAlertUi>Clear</ButtonAlertUi>
        </Alert>
      </Box>
      <Box sx={{ margin: '4px' }}>
        <strong>
          <Alert
            severity="warning"
            sx={{ width: 'auto' }}
            onClose={handleCloseAlert}
          >
            <AlertTitle>Warning</AlertTitle>
            You must select a Helms Chart before editing Properties. <br />
            Click the PREV button to navigate to Basic Info.
            <ButtonAlertUi severity="warning">Button</ButtonAlertUi>
          </Alert>
        </strong>
      </Box>
      <Box sx={{ margin: '4px' }}>
        <Alert severity="error" onClose={handleCloseAlert}>
          <AlertTitle>Error</AlertTitle>
          Something went wrong!
          <ButtonAlertUi severity="error">Button</ButtonAlertUi>
        </Alert>
      </Box>
      <Box sx={{ margin: '4px' }}>
        <Alert severity="success" onClose={handleCloseAlert}>
          <AlertTitle>Success</AlertTitle>
          Success!
          <ButtonAlertUi severity="success">Button</ButtonAlertUi>
        </Alert>
      </Box>
    </PaperWrapper>
  );
};

export const Primary = Template.bind({});
Primary.args = {};

Primary.parameters = {
  docs: {
    description: {
      component: 'Alert Styles',
      story: 'Alert Styles',
    },
  },
};
