import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';

import { FormControlDateDisplay } from './FormControlDateDisplay';
import { PaperWrapper } from '../storybook/PaperWrapper';

export default {
  component: FormControlDateDisplay,
  title: 'forms/FormControlDateDisplay',
} as ComponentMeta<typeof FormControlDateDisplay>;

const mockValues = {
  uuid: 'b14bfac0-e981-47c7-92d4-aefc49820f1c',
  dateCreated: '2025-05-01T00:19:22.998Z',
  dateEdited: '2025-05-01T00:19:22.998Z',
  description: '',
  name: 'item',
  author: 'michelle.gabele@bylight.com',
};

const Template: ComponentStory<typeof FormControlDateDisplay> = (args) => {
  // mock form control
  const { control } = useForm({
    defaultValues: mockValues,
  });
  const passArgs = { ...args, control };
  return (
    <PaperWrapper>
      <FormControlDateDisplay {...passArgs} />
    </PaperWrapper>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  label: 'Date',
  name: 'dateCreated',
};
Primary.parameters = {
  docs: {
    description: {
      component: 'Date Display Field',
      story: 'read only date field',
    },
  },
};

Primary.argTypes = {
  control: {
    description: 'Form control (from call to useForm hook)',
  },
  label: {
    description: 'Label for date field',
  },
  name: {
    description: 'Form field name',
  },
  textFieldProps: {
    description:
      'TextFieldProps for overriding normal props (e.g. helperText: "something")',
  },
};
