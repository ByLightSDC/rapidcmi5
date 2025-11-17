/* eslint-disable react/jsx-no-useless-fragment */
/*
 * This component provides a form controlled Float (decimal number) Field
 *
 * params:
 *   - name - Database name of field
 *   - error (optional)- Indication of error detected on this field (from useForm - formState.errors for this field)
 *   - fullwidth (optional) - Indication that this field should span the width of the grid item (defaule: true)
 *   - helperText (optional) - Error text to be displayed when an error exists (from useForm - formState.errors -- message for this field)
 *   - hidden (optional)- Indication that this field should be hidden (default: false)
 *   - infoText - (optional): text to display with ? icon for additional info about field
 *   - label (optional): Text to label the field with
 *   - placeholder (optional): Text to place in field when empty
 *   - readOnly (optional): indicate that fields/buttons should be disabled (default: false)
 *   - required (optional): Indication that this field is required (default: true)
 *   - sxProps (optional): additional styling props for this field (default: {})
 *   - onChange (optional): function to call for special handling of change - should setValue on the field
 *
 *   form functions (returned from useForm) are required to access the field information
 *    - control -- for handling field directly
 *
 * NOTE: Validation for float field needs to be defined in the validationSchema sent to useForm
 *       See DemoForm for example
 *
 */
import { Control, Controller, useFormContext } from 'react-hook-form';
import ReadOnlyTextField from './ReadOnlyTextField';
import { ButtonInfoField } from '../inputs/buttons/buttons';

/* MUI */
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

const leadingZeroRegex = /^([0][0-9]+[.]?[0-9]*)$|^([-][0][0-9]+[.]?[0-9]*)$/; // don't allow -0n or 0n at beginning (0.n is ok)
const decimalNumbersOnlyRegex = /^-?\d*(\.\d*)?$/;

type tFieldProps = {
  control: Control;
  name: string;
  error?: boolean;
  fullWidth?: boolean;
  helperText?: string;
  hidden?: boolean;
  infoText?: string | JSX.Element | null;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  sxProps?: any;
  onChange?: (value: any) => void;
  setValue: (name: string, value: unknown, config?: Object) => void;
  trigger: (name?: string | string[]) => Promise<boolean>;
};

export function FormControlFloatField({
  control,
  name,
  error = false,
  fullWidth = true,
  helperText = '',
  hidden = false,
  infoText = null,
  label = '',
  placeholder = '',
  readOnly = false,
  required = false,
  sxProps = {},
  onChange,
  setValue,
  trigger,
}: tFieldProps) {
  // TODO refactor all forms with context so we can use setValue directly
  const context = useFormContext();
  // const { setValue } = useFormContext();

  /**
   * Converts the entered value to a number for form data
   * @param {string} value value entered in field
   */
  const handleValueChange = (value: string) => {
    if (value === '') {
      // clear the value - setting to undefined which the BE will understand
      setValue(name, undefined);
    } else if (value.endsWith('.')) {
      setValue(name, value); // in process of entering a decimal number
    } else {
      setValue(name, +value); // convert to a number for form data
    }
    trigger(name);
  };

  return (
    <FormControl error={error} style={{ width: '100%' }}>
      <Controller
        key={name} // this makes controller re-render if now pointing to different form field (name changed)
        name={name}
        control={control}
        render={({ field }) => {
          return (
            <>
              {!hidden && (
                <div className="content-row">
                  {!readOnly ? (
                    <TextField
                      autoComplete="off"
                      sx={{
                        borderRadius: '4px',
                        ...sxProps,
                      }}
                      InputLabelProps={{ shrink: true }} // always put label above box even if empty
                      InputProps={{
                        sx: {
                          backgroundColor: (theme: any) =>
                            `${theme.input.fill}`,
                        },
                        inputProps: {
                          'data-testid': 'field-' + field.name,
                        },
                      }}
                      data-testid={field.name}
                      id={field.name}
                      aria-label={label}
                      label={label}
                      name={field.name}
                      value={field.value ?? ''}
                      required={required}
                      error={error}
                      helperText={helperText ? helperText : ''}
                      margin="dense"
                      variant="outlined"
                      fullWidth={fullWidth}
                      size="small"
                      spellCheck={false}
                      placeholder={placeholder}
                      onBlur={field.onBlur}
                      onChange={(event) => {
                        // prevent character errors NOT handled by yup number for float
                        const value = event.target.value;
                        const error =
                          leadingZeroRegex.test(value) ||
                          !decimalNumbersOnlyRegex.test(value);
                        if (!error) {
                          if (onChange) {
                            onChange(event.target.value);
                          } else {
                            handleValueChange(value);
                          }
                        }
                      }}
                    />
                  ) : (
                    <ReadOnlyTextField
                      fieldName={field.name}
                      fieldLabel={label}
                      fieldValue={field.value ?? ''}
                      props={{
                        disabled: true,
                        fullWidth: fullWidth,
                      }}
                      sxProps={sxProps}
                    />
                  )}
                  {infoText && <ButtonInfoField message={infoText} />}
                </div>
              )}
            </>
          );
        }}
      />
    </FormControl>
  );
}

export default FormControlFloatField;
