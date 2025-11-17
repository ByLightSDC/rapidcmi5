import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';

import Grid from '@mui/material/Grid';

import { NumberWithUnitsField } from './NumberWithUnitsField';
import { PaperWrapper } from '../storybook/PaperWrapper';
import FormControlTextField from './FormControlTextField';

export default {
  component: NumberWithUnitsField,
  title: 'forms/NumberWithUnitsField',
} as ComponentMeta<typeof NumberWithUnitsField>;

const initialValues = {
  accessKeySecret: 'mysecret',
};

const Template: ComponentStory<typeof NumberWithUnitsField> = (args) => {
  // mock form control
  const { control, getValues, setValue, trigger, watch } = useForm({
    defaultValues: initialValues,
  });

  const passArgs = {
    ...args,
    getValues,
    setValue,
    trigger,
    watch,
  };
  return (
    <PaperWrapper>
      <form style={{ width: '900px' }}>
        <Grid container spacing={2} style={{ margin: '12px', width: '90%' }}>
          <Grid item xs={4}>
            <NumberWithUnitsField {...passArgs} />
          </Grid>
        </Grid>
        <div style={{ height: '24px' }} />
      </form>
    </PaperWrapper>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  fieldName: 'minMemory',
  infoText: 'Minimum memory allowed',
  label: 'Min Memory',
  options: ['Ki', 'Mi', 'Gi', 'Ti', 'Pi'],
  required: true,
  readOnly: false,
  allowNoneOption: false,
  forceInteger: true,
};

Primary.parameters = {
  docs: {
    description: {
      component: 'Integer with Units Form Field',
      story: 'editable integer with units field',
    },
  },
};

Primary.argTypes = {
  fieldName: {
    description: 'Name of database field (with units)',
  },
  infoText: {
    description: 'Details about the field',
  },
  label: {
    description: 'Label for field',
  },
  options: {
    description: 'List of options for field units (array of strings)',
  },
  readOnly: {
    description: 'Whether field should be read only or not - default = false',
  },
  required: {
    description: 'Whether field should be required or not - default = false',
  },
  allowNoneOption: {
    description: 'Whether to include an empty option for units',
  },
  forceInteger: {
    description: 'Whether field should be forced as integer (no decimal) ',
  },
};
