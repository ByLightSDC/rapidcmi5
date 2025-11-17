import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Provider } from 'react-redux';
import { commonAppReducer, commonAppTransReducer } from '@rangeos-nx/ui/redux';
import { configureStore } from '@reduxjs/toolkit';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

import FormFieldArray, { tFormFieldRendererProps } from './FormFieldArray';
import FormControlTextField from './FormControlTextField';
import { PaperWrapper } from '../storybook/PaperWrapper';

const store = configureStore({
  reducer: {
    commonApp: commonAppReducer,
    commonAppTrans: commonAppTransReducer,
  },
});

function DemoArrayRenderItem(props: tFormFieldRendererProps) {
  const { formMethods, indexedArrayField, indexedErrors, readOnly } = props;
  const { control } = formMethods;
  const field1Error = indexedErrors?.field1;
  const field2Error = indexedErrors?.field2;

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <FormControlTextField
          control={control}
          label="Field 1"
          error={Boolean(field1Error)}
          helperText={field1Error?.message}
          name={`${indexedArrayField}.field1`}
          required
          readOnly={readOnly}
          placeholder="type string here"
        />
      </Grid>
      <Grid item xs={6}>
        <FormControlTextField
          control={control}
          label="Field 2"
          error={Boolean(field2Error)}
          helperText={field2Error?.message}
          name={`${indexedArrayField}.field2`}
          readOnly={readOnly}
          placeholder="type string here"
        />
      </Grid>
    </Grid>
  );
}

//Default renderer renders an Array of Strings
function DefaultRenderItem(props: tFormFieldRendererProps) {
  const {
    formMethods,
    indexedArrayField,
    indexedErrors,
    label = '',
    multiline = true,
    placeholder,
    readOnly,
    onChange,
  } = props;

  const { control, setValue } = formMethods;
  const handleChangeValue = (value: string) => {
    setValue(indexedArrayField, value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <FormControlTextField
      control={control}
      label={label}
      error={Boolean(indexedErrors)}
      helperText={indexedErrors?.message}
      name={indexedArrayField}
      placeholder={placeholder}
      multiline={multiline}
      required
      readOnly={readOnly}
      onChange={onChange ? handleChangeValue : undefined}
    />
  );
}

export default {
  component: FormFieldArray,
  title: 'forms/FormFieldArray',
} as ComponentMeta<typeof FormFieldArray>;

const initialValues = {
  xtra: 'not part of array',
  testArray: [
    {
      field1: 'one',
      field2: 'two',
    },
  ],
  testList: ['first', 'second'],
};

const Template: ComponentStory<typeof FormFieldArray> = (args) => {
  // mock form control
  const validationSchema = yup.object().shape({
    testArray: yup.array().of(
      yup.object().shape({
        field1: yup.string().required('Field 1 is required'),
        field2: yup.string().max(5, 'max length 5'),
      }),
    ),
    testList: yup.array().of(yup.string().required('Field is required')),
  });
  const methods: any = useForm({
    defaultValues: initialValues,
    mode: 'all',
    resolver: yupResolver(validationSchema),
  });
  const { formState } = methods;
  const { errors, isValid } = formState;

  const arrayRenderItem =
    args.arrayFieldName === 'testArray'
      ? DemoArrayRenderItem
      : DefaultRenderItem;

  const passArgs = {
    ...args,
    formMethods: methods,
    arrayRenderItem,
  };
  return (
    <Provider store={store}>
      <PaperWrapper>
        <form>
          <FormFieldArray {...passArgs} />
          <Divider orientation="horizontal" variant="fullWidth" />
        </form>
      </PaperWrapper>
    </Provider>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  arrayFieldName: 'testArray',
  defaultValues: { field1: 'A', field2: 'B' },
  isExpandable: true,
  defaultIsExpanded: true,
  title: 'My List',
  maxArrayLength: 4,
  width: '600px',
  readOnly: false,
};

Primary.parameters = {
  docs: {
    description: {
      component: 'Form Field Array',
      story: 'handle array of items',
    },
  },
};

Primary.argTypes = {
  formMethods: {
    description: 'Form methods (from call to useForm hook)',
  },
  arrayFieldName: {
    description: 'Name of array field in form',
  },
  defaultValues: {
    description: 'Default values for field(s) when row appended',
  },
  isExpandable: {
    description:
      'Indication that list can be expanded/collapsed (optional - default=false)',
  },
  defaultIsExpanded: {
    description:
      'Whether array area should initially be expanded (optional - default=true)',
  },
  maxArrayLength: {
    description:
      'Maximum number of entries in array (optional), add button will be disabled when max entries exist',
  },
  readOnly: {
    description:
      'Whether buttons / array field(s) should be read only or not - default = false',
  },
  title: {
    description: 'Title for array',
  },
  width: {
    description: 'Width for array "list" - defaults to 100%',
  },
  arrayRenderItem: {
    description: 'Functional component with the field(s) for a given array row',
  },
};

export const SimpleList = Template.bind({});
SimpleList.args = {
  arrayFieldName: 'testList',
  defaultValues: '',
  title: 'My List',
  width: '600px',
  readOnly: false,
  placeholder: 'type value here',
};

SimpleList.parameters = {
  docs: {
    description: {
      component: 'Form Field Array',
      story: 'handle array of items',
    },
  },
};

SimpleList.argTypes = {
  formMethods: {
    description: 'Form methods (from call to useForm hook)',
  },
  arrayFieldName: {
    description: 'Name of array field in form',
  },
  defaultValues: {
    description:
      "A single string entry for default value when row appended -- '' or '<desired value>'",
  },
  maxArrayLength: {
    description:
      'Maximum number of entries in array (optional), add button will be disabled when max entries exist',
  },
  readOnly: {
    description:
      'Whether buttons / array field(s) should be read only or not - default = false',
  },
  placeholder: {
    description: 'Text to place in field when empty',
  },
  title: {
    description: 'Title for array',
  },
  width: {
    description: 'Width for array "list" - defaults to 100%',
  },
  arrayRenderItem: {
    description: 'Functional component with the field(s) for a given array row',
  },
};
