import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';

import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

import { FormControlPassword } from './FormControlPassword';
import { PaperWrapper } from '../storybook/PaperWrapper';

export default {
  component: FormControlPassword,
  title: 'forms/FormControlPassword',
} as ComponentMeta<typeof FormControlPassword>;

const initialValues = {
  accessKeySecret: 'mysecret',
};

const Template: ComponentStory<typeof FormControlPassword> = (args) => {
  // mock form control
  const { control, getValues, setValue, trigger, watch } = useForm({
    defaultValues: initialValues,
  });

  const passArgs = {
    ...args,
    control,
    getValues,
    setValue,
    trigger,
    watch,
  };
  return (
    <PaperWrapper>
      <form style={{ width: '100%' }}>
        <Grid container spacing={2} style={{ margin: '12px', width: '90%' }}>
          <FormControlPassword {...passArgs} />
        </Grid>
        <div style={{ height: '24px' }} />
      </form>
    </PaperWrapper>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  name: 'accessKeySecret',
  required: true,
};

Primary.parameters = {
  docs: {
    description: {
      component: 'Password Form Field',
      story: 'editable ip address',
    },
  },
};

Primary.argTypes = {
  control: {
    description: 'Form control',
  },
  error: {
    description: 'Form error',
  },
  helperText: {
    description: 'Form helper text',
  },
  infoText: {
    description: 'Details about the field',
  },
  label: {
    description: 'Label for field',
  },
  name: {
    description: 'Name of the field',
  },
  readOnly: {
    description: 'Whether field should be read only or not - default = false',
  },
  required: {
    description: 'Whether field should be required or not - default = false',
  },
};
