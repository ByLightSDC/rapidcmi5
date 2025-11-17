import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ModalDialog } from './ModalDialog';
import { PaperWrapper } from '../storybook/PaperWrapper';
import { Box } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { accordionReducer } from '../surfaces/accordion/accordionReducer';
import { Provider } from 'react-redux';

export default {
  component: ModalDialog,
  title: 'Modals/ModalDialog',
} as ComponentMeta<typeof ModalDialog>;

const store = configureStore({
  reducer: {
    accordion: accordionReducer,
  },
});

const Template: ComponentStory<typeof ModalDialog> = (args) => (
  <Provider store={store}>
    <PaperWrapper>
      <ModalDialog {...args} />
    </PaperWrapper>
  </Provider>
);

export const Primary = Template.bind({});
Primary.args = {
  message: 'Content Goes Here',
  dialogProps: { open: true },
  maxWidth: 'md',
  title: 'Modal Title Goes Here',
};

Primary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/b3uDt9fku55RZwMBU1vaHW/Imerzi-Style-Guide?node-id=354%3A18956',
  },
  docs: {
    description: {
      component: 'Styled Material UI modal Dialog.',
      story: 'An example story description',
    },
  },
};

export const WithAlert = Template.bind({});
WithAlert.args = {
  alertMessage: 'alert message',
  alertTitle: 'Alert Title Goes Here',
  alertSeverity: 'error',
  dialogProps: { open: true },
  message: 'dialog message goes here',
  title: 'Title Goes Here',
};
