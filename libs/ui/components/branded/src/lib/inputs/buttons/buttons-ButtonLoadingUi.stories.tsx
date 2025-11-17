import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ButtonLoadingUi } from './buttons';
import { brandedTheme } from '../../styles/muiTheme';
import { PaperWrapper } from '../../storybook/PaperWrapper';
export default {
  component: ButtonLoadingUi,
  title: 'Inputs/Buttons/ButtonLoading',
} as ComponentMeta<typeof ButtonLoadingUi>;

const Template: ComponentStory<typeof ButtonLoadingUi> = (args) => (
  <PaperWrapper>
    <ButtonLoadingUi {...args} />
  </PaperWrapper>
);

export const Primary = Template.bind({});
Primary.args = {
  children: <>Button Text</>,
  loading: true,
};

Primary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/b3uDt9fku55RZwMBU1vaHW/Imerzi-Style-Guide?node-id=274%3A16034',
  },
};

Primary.argTypes = {
  children: {
    description: 'JSX.Elements to render inside the Button',
  },
  loading: {
    description: 'Whether to show loading indicator',
  },
};
