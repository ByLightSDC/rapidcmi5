import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useForm } from 'react-hook-form';

/* MUI */
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField, { TextFieldProps } from '@mui/material/TextField';

import ReadOnlyTextField from './ReadOnlyTextField';
import FormControlTextField from './FormControlTextField';
import { letterSpacing } from '@mui/system';
import { PaperWrapper } from '../storybook/PaperWrapper';

export default {
  component: ReadOnlyTextField,
  title: 'forms/ReadOnlyTextField',
} as ComponentMeta<typeof ReadOnlyTextField>;

const initialValues = {
  name: 'Name',
  nameAlt: 'Name Alt',
};

const Template: ComponentStory<typeof ReadOnlyTextField> = (args) => {
  const { control, getValues, setValue, watch } = useForm({
    defaultValues: initialValues,
  });

  const passArgs = {
    ...args,
    control,
    getValues,
    setValue,
    watch,
    props: {
      disabled: false,
      fullWidth: true,
      helperText: 'Read Only',
      multiline: true,
      placeholder: '',
    },
  };

  let disabledPassArgs = {
    ...args,
    control,
    getValues,
    setValue,
    watch,
    props: {
      disabled: true,
      fullWidth: true,
      helperText: 'Disabled',
      multiline: true,
      placeholder: '',
    },
  };

  return (
    <PaperWrapper>
      <Box className={'contentBox'} id="content" sx={{ padding: '12px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ReadOnlyTextField {...disabledPassArgs} />
          </Grid>
          <Grid item xs={12}>
            <ReadOnlyTextField {...passArgs} />
          </Grid>
          <Grid item xs={12}>
            <FormControlTextField
              control={control}
              error=""
              helperText="Editable"
              name="nameAlt"
              required
              label="Name"
              readOnly={false}
            />
          </Grid>
        </Grid>
      </Box>
    </PaperWrapper>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  fieldLabel: 'Name',
  fieldName: 'name',
  fieldValue: 'Mico',
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
  fieldName: {
    description: 'Name for field, used as test id id, id, and form linkage',
  },
  fieldLabel: {
    description: 'Label for field',
  },
  fieldValue: {
    description: 'Value for field',
  },
  props: {
    description: 'Textfield props from MUI',
  },
};
