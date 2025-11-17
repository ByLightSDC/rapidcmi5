import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

/* MUI */
import Grid from '@mui/material/Grid';

import KeyAlgorithmField from './KeyAlgorithmField';
import { ButtonMainUi } from '@rangeos-nx/ui/branded';

export default {
  component: KeyAlgorithmField,
  title: 'Forms/KeyAlgorithmField',
} as ComponentMeta<typeof KeyAlgorithmField>;

const initialValues = {
  algo: 'rsa',
  size: 2048,
};

const Template: ComponentStory<typeof KeyAlgorithmField> = (args) => {
  // mock form control
  const validationSchema = yup.object().shape({
    displayError_keyAlgorithm: yup.boolean().oneOf([false], 'hidden message'), // this is used inside the Key Algorithm component so form knows if there's an error
  });

  const formMethods = useForm({
    defaultValues: initialValues,
    mode: 'all',
    resolver: yupResolver(validationSchema),
  });
  const { errors } = formMethods.formState;
  const passArgs = {
    ...args,
    formMethods,
    errors,
  };

  const handleDebugClick = () => {
    console.log(
      '%c **********debug form data*********',
      'background: pink',
      formMethods.getValues(),
    );
  };
  return (
    <form style={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <KeyAlgorithmField {...passArgs} />
        </Grid>
      </Grid>
      <ButtonMainUi onClick={handleDebugClick}>Print Form Data</ButtonMainUi>
    </form>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  label: 'Key Algorithm',
  displayName: 'keyAlgorithm',
  algorithmField: 'algo',
  sizeField: 'size',
  infoText: 'Key algorithm / size (bytes)',
  readOnly: false,
};

Primary.parameters = {
  docs: {
    description: {
      component: 'Read Only Text Field',
      story: 'read only text field',
    },
  },
};

Primary.argTypes = {
  label: {
    description: 'Label for field',
  },
  displayName: {
    description:
      'Name for combined algo/size field, used as test id, id, and form linkage for displayError',
  },
  algorithmField: {
    description: 'Name of form algorithm field',
  },
  sizeField: {
    description: 'Name of form size field',
  },
  infoText: {
    description: 'Information to display with ? tooltip',
  },
  readOnly: {
    description: 'Whether or not this field is read only',
  },
};
