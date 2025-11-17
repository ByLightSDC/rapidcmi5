import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ButtonChipUi } from './buttons';
import { PaperWrapper } from '../../storybook/PaperWrapper';

export default {
  component: ButtonChipUi,
  title: 'Inputs/Buttons/ButtonChipUi',
} as ComponentMeta<typeof ButtonChipUi>;

const Template: ComponentStory<typeof ButtonChipUi> = (args) => (
  <PaperWrapper>
    <ButtonChipUi {...args} />
  </PaperWrapper>
);

export const Primary = Template.bind({});
Primary.args = {
  label: 'My Chip',
  sxprops: {},
};

Primary.argTypes = {
  label: {
    description: 'Label prop (inherited)',
  },
  sxprops: {
    description: 'sx prop (inherited)',
  },
};
