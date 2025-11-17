import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ButtonOptions } from './buttons';
import { List, ListItem } from '@mui/material';
import { PaperWrapper } from '../../storybook/PaperWrapper';
export default {
  component: ButtonOptions,
  title: 'Inputs/Buttons/ButtonOptions',
} as ComponentMeta<typeof ButtonOptions>;

const Template: ComponentStory<typeof ButtonOptions> = (args) => (
  <PaperWrapper>
    <ButtonOptions {...args} />
  </PaperWrapper>
);

const optionCallback = (index: number) => {
  alert('option index selected ' + index);
};

export const Primary = Template.bind({});
Primary.args = {
  tooltip: 'I am a tooltip!',
  menuOptions: ['item one', 'item two'],
  onOptionSelect: optionCallback,
};

Primary.argTypes = {
  tooltip: {
    description: 'Tooltip for button',
  },
  menuOptions: {
    description: 'List of options to display',
  },
  onOptionSelect: {
    description: 'Function to call when an option is selected',
  },
};
