/* eslint-disable react/jsx-no-useless-fragment */
import { Control, Controller } from 'react-hook-form';

import ReadOnlyTextField from './ReadOnlyTextField';
import { ButtonIcon, ButtonInfoField } from '../inputs/buttons/buttons';

/* MUI */
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import InputAdornment from '@mui/material/InputAdornment';
import { fieldMarginTop } from '../styles/muiTheme';

export type tFormControlTextFieldProps = {
  control?: Control;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  hidden?: boolean;
  infoText?: string | JSX.Element | null;
  onBlur?: () => void;
  onChange?: (value: any) => void; //function to call for special handling of change - should setValue on the field
  onClear?: (fieldName: string) => void;
  readOnly?: boolean;
  label?: string;
  name: string;
  required?: boolean;
  fullWidth?: boolean;
  minRows?: number;
  maxRows?: number;
  multiline?: boolean;
  placeholder?: string;
  sxProps?: any;
};

export function FormControlTextField({
  control,
  disabled = true,
  error = false,
  helperText = '',
  hidden = false,
  infoText = null,
  onBlur,
  onChange,
  onClear,
  readOnly = false,
  label = '',
  name,
  required = false,
  fullWidth = true,
  multiline = label === 'Description' ? true : false,
  minRows = 1,
  maxRows, // if NOT passed, it is "unlimited"
  placeholder = '',
  sxProps = { marginTop: fieldMarginTop },
}: tFormControlTextFieldProps) {
  const clearButton = onClear ? (
    <InputAdornment position="end">
      <ButtonIcon
        name="Clear"
        props={{
          name: 'Clear',
          onClick: (event) => {
            event.stopPropagation();
            if (!readOnly && onClear) {
              onClear(name);
            }
          },
        }}
        tooltip="Clear"
        sxProps={{ marginLeft: '0px', marginRight: '0px' }}
      >
        <CloseIcon color="primary" fontSize="small" />
      </ButtonIcon>
    </InputAdornment>
  ) : null;

  return (
    <FormControl
      error={error}
      style={{ width: hidden ? '0px' : '100%', height: '100%' }}
    >
      <Controller
        key={name} // this makes controller re-render if now pointing to different form field (name changed)
        name={name}
        control={control}
        render={({ field }) => (
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
                      endAdornment: field.value ? clearButton : null,
                      sx: {
                        backgroundColor: (theme: any) => `${theme.input.fill}`,
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
                    helperText={helperText}
                    margin="dense"
                    variant="outlined"
                    fullWidth={fullWidth}
                    size="small"
                    spellCheck={false}
                    multiline={multiline}
                    minRows={minRows}
                    maxRows={maxRows}
                    placeholder={placeholder}
                    onBlur={() => {
                      if (onBlur) {
                        onBlur();
                      }
                      field.onBlur();
                    }}
                    onChange={(event) => {
                      if (onChange) {
                        onChange(event.target.value);
                      } else {
                        field.onChange(event);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (!multiline && event.code === 'Enter') {
                        // prevent enter from causing submit of form...
                        event.preventDefault();
                      }
                    }}
                  />
                ) : (
                  <ReadOnlyTextField
                    //REF fieldInfo={infoText ?? ''}
                    fieldName={field.name}
                    fieldLabel={label}
                    fieldValue={field.value ?? ''}
                    props={{
                      disabled: disabled,
                      fullWidth: fullWidth,
                      multiline: multiline,
                      placeholder: placeholder,
                      required: required,
                      error: error,
                      helperText: helperText,
                    }}
                    sxProps={sxProps}
                  />
                )}
                {infoText && <ButtonInfoField message={infoText} />}
              </div>
            )}
          </>
        )}
      />
    </FormControl>
  );
}

export default FormControlTextField;
