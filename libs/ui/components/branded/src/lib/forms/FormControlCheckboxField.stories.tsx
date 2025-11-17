import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';

import { FormControlCheckboxField } from './FormControlCheckboxField';
import { PaperWrapper } from '../storybook/PaperWrapper';

export default {
  component: FormControlCheckboxField,
  title: 'forms/FormControlCheckboxField',
} as ComponentMeta<typeof FormControlCheckboxField>;

const Template: ComponentStory<typeof FormControlCheckboxField> = (args) => {
  // mock form control
  const { control } = useForm();
  const passArgs = { ...args, control };
  return (
    <PaperWrapper>
      <FormControlCheckboxField {...passArgs} />
    </PaperWrapper>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  checkboxProps: { disabled: false },
  label: 'Checkbox',
  name: 'fieldName',
};
Primary.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/b3uDt9fku55RZwMBU1vaHW/Imerzi-Style-Guide?node-id=354%3A19025',
  },
  docs: {
    description: {
      component: 'Checkbox Form Field',
      story: 'editable checkbox',
    },
  },
};

Primary.argTypes = {
  control: {
    description: 'Form control (from call to useForm hook)',
  },
  checkboxProps: {
    description:
      'CheckboxProps for overriding normal props (e.g. disabled: true)',
  },
  label: {
    description: 'Label for checkbox field',
  },
  name: {
    description: 'Form field name',
  },
};
