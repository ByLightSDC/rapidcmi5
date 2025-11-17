import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ButtonMainUi } from './buttons';
import { brandedTheme } from '../../styles/muiTheme';
import { PaperWrapper } from '../../storybook/PaperWrapper';
export default {
  component: ButtonMainUi,
  title: 'Inputs/Buttons/ButtonMain',
} as ComponentMeta<typeof ButtonMainUi>;

const Template: ComponentStory<typeof ButtonMainUi> = (args) => (
  <PaperWrapper>
    <ButtonMainUi {...args} />
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
