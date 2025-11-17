import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

import { FormControlComboBoxField } from './FormControlComboBoxField';
import { PaperWrapper } from '../storybook/PaperWrapper';

export default {
  component: FormControlComboBoxField,
  title: 'forms/FormControlComboBoxField',
} as ComponentMeta<typeof FormControlComboBoxField>;

const initialValues = {
  comboBoxField: 'AA',
  comboBoxListField: 'second',
};

const Template: ComponentStory<typeof FormControlComboBoxField> = (args) => {
  // mock form control
  const validationSchema = yup.object().shape({
    comboBoxField: yup.string().required('Field is required'),
  });
  const methods: any = useForm({
    defaultValues: initialValues,
    mode: 'all',
    resolver: yupResolver(validationSchema),
  });

  const { formState } = methods;
  const { errors } = formState;

  const error =
    args.name === 'comboBoxField'
      ? errors?.comboBoxField
      : errors?.comboBoxListField;

  const passArgs = {
    ...args,
    error: Boolean(error),
    formMethods: methods,
    helperText: error?.message,
  };

  return (
    <PaperWrapper>
      <form style={{ width: '100%' }}>
        <Grid container spacing={2} style={{ width: '100%' }}>
          <Grid item xs={6}>
            <FormControlComboBoxField {...passArgs} />
          </Grid>
        </Grid>
        <div style={{ height: '24px' }} />
        <Divider orientation="horizontal" variant="fullWidth" />
        <div style={{ height: '12px' }} />
      </form>
    </PaperWrapper>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  name: 'comboBoxField',
  label: 'Combo Box Label',
  options: [
    { label: 'first item', value: 'AA' },
    { label: 'second item', value: 'BB' },
    { label: 'third item', value: 'CC' },
  ],
  readOnly: false,
  required: true,
};
export const SimpleListCombo = Template.bind({});
SimpleListCombo.args = {
  name: 'comboBoxListField',
  label: 'Simple Combo Box Label',
  options: ['first', 'second', 'third'],
  readOnly: false,
  required: false,
};

Primary.parameters = {
  // design: {
  //   type: 'figma',
  //   url: 'https://www.figma.com/file/b3uDt9fku55RZwMBU1vaHW/Imerzi-Style-Guide-v1.0?node-id=101%3A8060',
  // },
  docs: {
    description: {
      component: 'Combo Box Form Field',
      story: 'editable combo box',
    },
  },
};

Primary.argTypes = {
  name: {
    description: 'Form field name for combo box field',
  },
  label: {
    description: 'Label for combo box field',
  },
  options: {
    description:
      'List of options for combo box - format can be array of strings or array of {label: string, value: string}',
  },
  readOnly: {
    description: 'Whether field should be read only or not - default = false',
  },
  required: {
    description: 'Whether field should be required or not - default = false',
  },
};
