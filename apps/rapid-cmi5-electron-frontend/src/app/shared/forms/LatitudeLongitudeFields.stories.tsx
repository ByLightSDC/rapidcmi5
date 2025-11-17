import { ComponentStory, ComponentMeta } from '@storybook/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

import { LatitudeLongitudeFields } from './LatitudeLongitudeFields';
import { latitudeRegex, longitudeRegex } from '@rangeos-nx/ui/validation';

export default {
  component: LatitudeLongitudeFields,
  title: 'Forms/LatitudeLongitudeFields',
} as ComponentMeta<typeof LatitudeLongitudeFields>;

const initialValues = {
  latitudeField: '21.3099',
  longitudeField: '-157.8581',
};

const Template: ComponentStory<typeof LatitudeLongitudeFields> = (args) => {
  // mock form control
  const validationSchema = yup.object().shape({
    latitudeField: yup
      .string()
      .matches(latitudeRegex, 'invalid latitude')
      .test('is-longitude-exists', 'Latitude required', function (code) {
        const { latitudeField, longitudeField } = this.parent;
        // either longitude is empty OR both need values
        return (
          !longitudeField ||
          longitudeField.length === 0 ||
          (latitudeField.length > 0 && longitudeField.length > 0)
        );
      }),
    longitudeField: yup
      .string()
      .matches(longitudeRegex, 'invalid longitude')
      .test('is-latitude-exists', 'Longitude required', function (code) {
        const { latitudeField, longitudeField } = this.parent;
        // either latitude is empty OR both need values
        return (
          !latitudeField ||
          latitudeField.length === 0 ||
          (latitudeField.length > 0 && longitudeField.length > 0)
        );
      }),
  });
  const { control, setValue, trigger, watch, formState } = useForm({
    defaultValues: initialValues,
    mode: 'all',
    resolver: yupResolver(validationSchema),
  });
  const { errors } = formState;

  const passArgs = {
    ...args,
    control,
    errors,
    setValue,
    trigger,
    watch,
  };
  return (
    <form style={{ width: '100%' }}>
      <Grid container spacing={2}>
        <LatitudeLongitudeFields {...passArgs} />
      </Grid>
      <div style={{ height: '24px' }} />
      <Divider orientation="horizontal" variant="fullWidth" />
    </form>
  );
};

export const Primary = Template.bind({});

Primary.args = {
  latitudeFieldName: 'latitudeField',
  longitudeFieldName: 'longitudeField',
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
      component: 'Latitude/Longitude Form Field',
      story: 'editable location',
    },
  },
};

Primary.argTypes = {
  control: {
    description: 'Form control (from call to useForm hook)',
  },
  latitudeFieldName: {
    description: 'Form field name for latitude',
  },
  longitudeFieldName: {
    description: 'Form field name for longitude',
  },
  readOnly: {
    description:
      'Whether location should be read only or not - default = false',
  },
  required: {
    description: 'Whether location should be required or not - default = false',
  },
};
