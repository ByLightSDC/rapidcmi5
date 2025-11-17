import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Provider } from 'react-redux';
import { commonAppReducer, commonAppTransReducer } from '@rangeos-nx/ui/redux';
import { configureStore } from '@reduxjs/toolkit';
import { DemoForm } from './DemoForm';
import Box from '@mui/material/Box';

export default {
  component: DemoForm,
  title: 'Forms/DemoForm',
} as ComponentMeta<typeof DemoForm>;

const store = configureStore({
  reducer: {
    commonApp: commonAppReducer,
    commonAppTrans: commonAppTransReducer,
  },
});

const Template: ComponentStory<typeof DemoForm> = (args) => (
  <Provider store={store}>
    <div id="app-content">
      <Box className={'contentBox'} id="content">
        <DemoForm {...args} />
        <Box id="footer_nav" sx={{ margin: '0px' }} />
      </Box>
    </div>
  </Provider>
);

export const Primary = Template.bind({});
Primary.args = {
  editable: true,
};
