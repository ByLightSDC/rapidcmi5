import { Control, Controller } from 'react-hook-form';
import { useState } from 'react';

/* MUI */
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { ButtonInfoField } from '../inputs/buttons/buttons';

/** @constant
 * Decorator appended to the checkbox label
 * @see requiredDecorator
 * @type {string}
 * @default
 */
const requiredDecorator = '';

type tFieldProps = {
  control: Control;
  boxSxProps?: any;
  checkboxProps?: CheckboxProps;
  error?: string | null;
  infoText?: string | JSX.Element | null;
  label?: string;
  name: string;
  onChange?:
    | ((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void)
    | undefined;
};

/**
 * Checkbox form field
 * @param {tFieldProps} props Component Properties
 * @return {JSX.Element} React Component
 */
export function FormControlCheckboxField(props: tFieldProps) {
  const {
    control,
    boxSxProps = {},
    checkboxProps = { disabled: false, required: false },
    error,
    infoText = null,
    label = '',
    name,
    onChange,
  } = props;

  /**
   * Persist local required state
   * MUI checkbox displays native pop up on hover when required set to true
   * Workaround is to use local state to persist required
   * But pass required false to MUI
   * required validation is handled in parent form via yup
   */
  const [isRequired] = useState(checkboxProps?.required);

  return (
    <FormControl style={{ width: '100%' }}>
      <Controller
        key={name} // this makes controller re-render if now pointing to different form field (name changed)
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                height: '28px',
                paddingTop: '8px',
                ...boxSxProps,
              }}
            >
              <Checkbox
                sx={{ color: 'primary.main' }}
                id={field.name}
                aria-label={label}
                data-testid={'field-' + field.name} // so test id will be consistent with how text fields mark them
                name={field.name}
                checked={field.value ? field.value : false}
                onChange={(e, v) => {
                  field.onChange(e);
                  if (onChange) {
                    onChange(e, v);
                  }
                }}
                {...checkboxProps}
                required={false} //Force required to false to avoid native validation message on hover
              />
              <Typography variant="body1">
                {isRequired ? label + requiredDecorator : label}
              </Typography>

              {infoText && <ButtonInfoField message={infoText} />}
            </Box>
            <FormHelperText error={error ? true : false}>
              {error || ' '}
            </FormHelperText>
          </>
        )}
      />
    </FormControl>
  );
}

export default FormControlCheckboxField;
