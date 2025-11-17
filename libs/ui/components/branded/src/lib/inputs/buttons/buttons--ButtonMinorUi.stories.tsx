import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ButtonMinorUi } from './buttons';
import { PaperWrapper } from '../../storybook/PaperWrapper';
export default {
  component: ButtonMinorUi,
  title: 'Inputs/Buttons/ButtonMinor',
} as ComponentMeta<typeof ButtonMinorUi>;

const Template: ComponentStory<typeof ButtonMinorUi> = (args) => (
  <PaperWrapper>
    <ButtonMinorUi {...args} />
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
