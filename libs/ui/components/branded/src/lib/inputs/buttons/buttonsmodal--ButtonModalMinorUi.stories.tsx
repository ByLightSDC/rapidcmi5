import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ButtonModalMinorUi } from './buttonsmodal';
import { PaperWrapper } from '../../storybook/PaperWrapper';
export default {
  component: ButtonModalMinorUi,
  title: 'Inputs/Buttons/ButtonModalMinor',
} as ComponentMeta<typeof ButtonModalMinorUi>;

const Template: ComponentStory<typeof ButtonModalMinorUi> = (args) => (
  <PaperWrapper>
    <ButtonModalMinorUi {...args} />
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
