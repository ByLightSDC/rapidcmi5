import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ButtonAlertUi } from './buttons';
import { PaperWrapper } from '../../storybook/PaperWrapper';

export default {
  component: ButtonAlertUi,
  title: 'Inputs/Buttons/ButtonAlert',
} as ComponentMeta<typeof ButtonAlertUi>;

const Template: ComponentStory<typeof ButtonAlertUi> = (args) => (
  <PaperWrapper>
    <ButtonAlertUi {...args} />
  </PaperWrapper>
);

export const Primary = Template.bind({});
Primary.args = {
  children: <>Button Text</>,
};

Primary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/b3uDt9fku55RZwMBU1vaHW/Imerzi-Style-Guide?node-id=274%3A16034',
  },
};
