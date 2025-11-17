/* eslint-disable @typescript-eslint/no-explicit-any */

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { LinearProgressDisplayUi } from './LinearProgressDisplay';
import { PaperWrapper } from '../storybook/PaperWrapper';

export default {
  component: LinearProgressDisplayUi,
  title: 'Indicators/LinearProgressDisplay',
} as ComponentMeta<typeof LinearProgressDisplayUi>;

const Template: ComponentStory<typeof LinearProgressDisplayUi> = (args) => (
  <PaperWrapper>
    <LinearProgressDisplayUi />
  </PaperWrapper>
);

export const Primary = Template.bind({});
