/* eslint-disable @typescript-eslint/no-explicit-any */

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { LoadingUi } from './Loading';
import { PaperWrapper } from '../storybook/PaperWrapper';

export default {
  component: LoadingUi,
  title: 'Indicators/Loading',
} as ComponentMeta<typeof LoadingUi>;

const Template: ComponentStory<typeof LoadingUi> = (args) => (
  <PaperWrapper>
    <LoadingUi {...args} />
  </PaperWrapper>
);

export const Primary = Template.bind({});
Primary.args = {
  message: 'Loading ...',
};

Primary.argTypes = {
  message: {
    description: 'Loading message to display ',
  },
};
