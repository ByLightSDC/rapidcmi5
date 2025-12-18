/*
 *   Copyright (c) 2023 - 2024 By Light Professional IT Services LLC
 *   All rights reserved.
 */
import { Control, Controller } from 'react-hook-form';
import ReadOnlyTextField from './ReadOnlyTextField';

/* MUI */
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { useEffect } from 'react';
import { fieldMarginTop } from '../styles/muiTheme';
import { ButtonInfoField } from '@rapid-cmi5/ui/api/hooks';

const leadingZeroRegex = /^([0][0-9]+)$|^([-][0][0-9]+)$/; // don't allow -0n or 0n at beginning

/**
 * @typedef {Object} tFieldProps
 * @property {*} control Form Control
 * @property {string} name Fully qualified form field name (e.g., values.myField)
 * @property {boolean} [error] Whether field has error or not
 * @property {boolean} [fullWidth=true] Whether component should stretch to fit parent width
 * @property {string} [helperText] Helper text to display for field
 * @property {boolean} [hidden=false] Whether component should be hidden
 * @property {string | null} [infoText] Helper text for field
 * @property {string} [label] Label to display for field
 * @property {string} [placeholder] Placeholder text for field when no value has been entered
 * @property {boolean} [readOnly=false] Indication whether field is not editable
 * @property {boolean} [required=false] Indication whether field is required
 * @property {*} [sxProps] Style props to apply to field
 * @property {value: any) => void} [onChange] Optional Callback for field change instead of form control field.onChange
 * @property {any} setValue Form function for updating form field value
 * @property {any} trigger Form trigger for initiating validation
 * @property {any} watch Form watch for tracking changes to form fields
 */
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
  watch: (names?: string | string[]) => unknown;
};

/**
 * Form Controlled Field for an Integer
 * @param tFieldProps props Field Component props
 * @returns {React.ReactElement}
 * NOTE: Validation for integer field needs to be defined in the validationSchema sent to useForm
 *       @see DemoForm for example
 */
export function FormControlIntegerField(props: tFieldProps) {
  const {
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
    sxProps = {  marginTop: fieldMarginTop },
    onChange,
    setValue,
    trigger,
    watch,
  } = props;

  const watchValue = watch ? watch(name) : '';
  useEffect(() => {
    //rerender when value is changed
  }, [watchValue]);

  const handleValueChange = (value: string) => {
    if (value === '') {
      // clear the value - setting to undefined which the BE will understand
      setValue(name, undefined);
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
            //test for hidden requires empty react element to wrap
            // eslint-disable-next-line react/jsx-no-useless-fragment
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
                      value={watchValue ?? ''} // not using field.value here because we need to be able to set to "undefined'"
                      required={required}
                      error={error}
                      helperText={helperText ? helperText : ''}
                      margin="dense"
                      variant="outlined"
                      fullWidth={fullWidth}
                      size="small"
                      spellCheck={false}
                      placeholder={placeholder}
                      type="number"
                      onKeyDown={(event) => {
                        // prevent exponent or decimal for integer field - to handle correctly
                        // prevent enter from causing submit of form...
                        if (
                          event.key === 'e' ||
                          event.key === '.' ||
                          event.code === 'Enter'
                        ) {
                          event.preventDefault();
                        }
                      }}
                      onBlur={field.onBlur}
                      onChange={(event) => {
                        // prevent character errors NOT handled by yup number for integer
                        const value = event.target.value;
                        const error = leadingZeroRegex.test(value);

                        if (!error) {
                          if (onChange) {
                            onChange(value);
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

export default FormControlIntegerField;
