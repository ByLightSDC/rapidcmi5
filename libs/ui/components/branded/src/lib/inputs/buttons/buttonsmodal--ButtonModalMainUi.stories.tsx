import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ButtonModalMainUi } from './buttonsmodal';
import { PaperWrapper } from '../../storybook/PaperWrapper';
export default {
  component: ButtonModalMainUi,
  title: 'Inputs/Buttons/ButtonModalMain',
} as ComponentMeta<typeof ButtonModalMainUi>;

const Template: ComponentStory<typeof ButtonModalMainUi> = (args) => (
  <PaperWrapper>
    <ButtonModalMainUi {...args} />
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
