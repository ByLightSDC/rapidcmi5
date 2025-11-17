import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';

import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

import { FormControlIpField } from './FormControlIpField';
import { PaperWrapper } from '../storybook/PaperWrapper';

export default {
  component: FormControlIpField,
  title: 'forms/FormControlIpField',
} as ComponentMeta<typeof FormControlIpField>;

const initialValues = {
  ipv4FieldName: '10.10.10.10',
  ipv6FieldName: '2001:db8:3333:4444:5555:6666:7777:8888',
  ipv4TypeFieldName: 4,
  ipv6TypeFieldName: 6,
};

const Template: ComponentStory<typeof FormControlIpField> = (args) => {
  // mock form control
  const formMethods = useForm({
    defaultValues: initialValues,
  });

  const passArgs = {
    ...args,
    ...formMethods,
  };
  return (
    <PaperWrapper>
      <form style={{ width: '100%' }}>
        <FormControlIpField {...passArgs} />
      </form>
    </PaperWrapper>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  ipFieldName: 'ipv4FieldName',
  ipTypeFieldName: 'ipv4TypeFieldName',
  label: 'IP Address',
  readOnly: false,
  required: true,
};
export const Ipv6 = Template.bind({});
Ipv6.args = {
  ipTypes: 'IPv6',
  ipFieldName: 'ipv6FieldName',
  ipTypeFieldName: 'ipv6TypeFieldName',
  label: 'IP Label',
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
      component: 'IP Form Field',
      story: 'editable ip address',
    },
  },
};

Primary.argTypes = {
  control: {
    description: 'Form control (from call to useForm hook)',
  },
  label: {
    description: 'Label for IP field',
  },
  ipFieldName: {
    description: 'Form field name for IP',
  },
  ipTypeFieldName: {
    description: 'Form field name for IP Type',
  },
  ipTypes: {
    description:
      'Comma separated string of allowed types - default = "IPv4, IPv6"',
  },
  fullWidth: {
    description: 'Whether IP should take full width or not - default = true',
  },
  readOnly: {
    description: 'Whether IP should be read only or not - default = false',
  },
  required: {
    description: 'Whether IP should be required or not - default = false',
  },
};
