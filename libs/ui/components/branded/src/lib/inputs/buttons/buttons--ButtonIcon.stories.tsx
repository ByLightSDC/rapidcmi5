import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ButtonIcon } from './buttons';
import DeleteIcon from '@mui/icons-material/Delete';
import { PaperWrapper } from '../../storybook/PaperWrapper';

export default {
  component: ButtonIcon,
  title: 'Inputs/Buttons/ButtonIcon',
} as ComponentMeta<typeof ButtonIcon>;

const Template: ComponentStory<typeof ButtonIcon> = (args) => (
  <PaperWrapper>
    <ButtonIcon {...args}>
      <DeleteIcon fontSize="medium" />
    </ButtonIcon>
  </PaperWrapper>
);

export const Primary = Template.bind({});
Primary.args = {
  key: 'button',
  tooltip: 'I am a tooltip!',
  props: {
    name: 'add button',
    disabled: false,
  },
};

Primary.argTypes = {
  props: {
    description: 'MUI props for IconButton',
  },
};
