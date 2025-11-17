import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import {
  accordionReducer,
  ModalDialog,
  PaperWrapper,
} from '@rangeos-nx/ui/branded';

import { Meta } from '@storybook/react';

export default {
  title: 'Colors/Components/Modal Dialog',
} as Meta;

const store = configureStore({
  reducer: {
    accordion: accordionReducer,
  },
});

const Template = ({ args }) => (
  <Provider store={store}>
    <PaperWrapper>
      <ModalDialog
        {...{
          dialogProps: { open: true },
          message: 'dialog message goes here',
          title: 'Title Goes Here',
        }}
      />
    </PaperWrapper>
  </Provider>
);

export const Primary = Template.bind({});
Primary.args = {
  backgroundColor: 'background.default',
  textColor: 'text.primary',
  primaryButtonColor: 'linear-gradient(180deg, #405CA7 0%, #2C4B93 100%)',
  primaryButtonTextColor: 'common.white',
};

Primary.argTypes = {
  backgroundColor: {
    description:
      'Modal Background Color<b><i>background.default<i></b>See Color Variables story for swatches',
  },
  textColor: {
    description: 'Text Color <b><i>text.primary<i></b>',
  },
  primaryButtonColor: {
    description: 'Primary Button Color ',
  },
  primaryButtonTextColor: {
    description: 'Primary Button Text Color<b><i>common.white<i></b>',
  },
};
