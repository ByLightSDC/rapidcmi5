import * as yup from 'yup';
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, UseFormReturn } from 'react-hook-form';

import { brandedTheme } from '../styles/muiTheme';
import { FormControlIntegerField } from './FormControlIntegerField';
import { ThemeProvider } from '@mui/material';
import Form from './Form';
import { useEffect } from 'react';

const defaultFormValues = {
  //Positive Integer Field
  positiveInt: 400,
};

const validationSchema = yup.object().shape({
  positiveInt: yup
    .number()
    .typeError('Must be a positive integer')
    .required('Field is required')
    .integer('Must be a positive integer')
    .min(0, 'Must be a positive integer'),
});

type tFormProps = {
  sendFormMethods: (methods: any) => void;
};

function UnitTestForm(props: tFormProps) {
  const formMethods = useForm({
    defaultValues: defaultFormValues,
    mode: 'all',
    resolver: yupResolver(validationSchema),
  });
  const { formState } = formMethods;
  const { errors } = formState;
  useEffect(() => {
    props.sendFormMethods(formMethods);
  }, []);
  return (
    <Form
      title="Test Form"
      //   formWidth={formWidth}
      //   showBorder={true}
      formFields={
        <FormControlIntegerField
          {...formMethods}
          error={Boolean(errors?.positiveInt)}
          helperText={errors?.positiveInt?.message}
          infoText="This button is for demo purposes only!"
          name="positiveInt"
          required={true}
          label="Positive Integer"
        />
      }
    />
  );
}
describe('FormControlIntegerField', () => {
  const integerFieldName = 'field-positiveInt';
  let formMethods: UseFormReturn | undefined = undefined;

  beforeEach(async () => {
    await act(async () => {
      render(
        <ThemeProvider theme={brandedTheme}>
          <UnitTestForm
            sendFormMethods={(methods: any) => {
              formMethods = methods;
            }}
          />
        </ThemeProvider>,
      );
    });
  });

  it('should render integer field', () => {
    const integerField = screen.getByTestId(integerFieldName);
    expect(integerField).toBeTruthy();
    expect((integerField as HTMLInputElement).value).toEqual(
      defaultFormValues.positiveInt.toString(),
    );
  });

  it('should set integer field value to number', async () => {
    const integerField = screen.getByTestId(integerFieldName);
    expect(integerField).toBeTruthy();

    await act(async () => {
      fireEvent.change(integerField, {
        target: { value: '24' },
      });
    });

    if (formMethods) {
      const value = formMethods.getValues('positiveInt');
      expect(value).toEqual(24);
      expect(typeof value).toEqual('number');
    }
  });

  it('should not allow entry of non-numeric characters', async () => {
    const integerField = screen.getByTestId(integerFieldName);
    expect(integerField).toBeTruthy();
    // Verify Bad Formats
    await act(async () => {
      fireEvent.change(integerField, {
        target: { value: 'a' },
      });
    });

    // expect value not to be empty non-numberic char typed in
    expect((integerField as HTMLInputElement).value).toEqual('');

    // since this is a required field should show error
    expect(screen.getByText('Field is required')).toBeTruthy();
  });

  it('should require positive integer', async () => {
    const integerField = screen.getByTestId(integerFieldName);
    expect(integerField).toBeTruthy();

    await act(async () => {
      fireEvent.change(integerField, {
        target: { value: '-5' },
      });
    });

    expect(screen.getByText('Must be a positive integer')).toBeTruthy();
  });
});
