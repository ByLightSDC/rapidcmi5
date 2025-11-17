import { ComponentStory, ComponentMeta } from '@storybook/react';
import { TextFieldMainUi } from './textfields';
import { PaperWrapper } from '../../storybook/PaperWrapper';

export default {
  component: TextFieldMainUi,
  title: 'Inputs/Textfields/TextfieldMainUi',
} as ComponentMeta<typeof TextFieldMainUi>;

const Template: ComponentStory<typeof TextFieldMainUi> = (args) => (
  <PaperWrapper>
    <TextFieldMainUi {...args} />
  </PaperWrapper>
);

/**
 * Controls
 */
export const Primary = Template.bind({});
Primary.args = {
  defaultValue: 'Default Name',
  label: 'Name',
};

/**
 * Docs Name, Description, Default
 */
Primary.argTypes = {
  defaultValue: {
    description: 'Default value',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: '' },
    },
  },
  id: {
    description: 'Id',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: 'field' },
    },
  },
  isFullWidth: {
    description: 'Whether component should stretch to fit parent width',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: true },
    },
  },
  label: {
    description: 'Label to display',
  },
  placeholder: {
    description: 'Placeholder text to display when no value is specified',
  },
  sxProps: {
    description: 'Sx props passed to MUI Textfield',
  },
  onChange: {
    description: 'Callback for text changed',
  },
};
