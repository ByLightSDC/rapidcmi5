import { useEffect, useState } from 'react';

/* MUI */
import TextField, { StandardTextFieldProps } from '@mui/material/TextField';
import { InputAdornment } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ButtonIcon, ButtonInfoField } from '@rangeos-nx/ui/api/hooks';

const leadingZeroRegex = /^([0][0-9]+)$|^([-][0][0-9]+)$/; // don't allow -0n or 0n at beginning

/**
 * @interface BrandedTextfieldProps
 * @property {string} [id] Id
 * @property {string} [defaultValue] Default value
 * @property {string} [infoText] Helper text for field
 * @property {boolean} [isFullWidth] Whether component should stretch to fit parent width
 * @property {string} [label] Label to display above field
 * @property {string} [placeholder] Placeholder text to display when no value is specified
 * @property {boolean} [allowNumberExponent=false] Allow textField with type "number" entry to use scientific notation (ex. 1e10)
 * @property {boolean} [forceNumberAsInteger=true] Force textField with type "number" entry to be an integer (no decimal)
 * @property {*} [sxProps] sx props passed to MUI Textfield
 * @property {*} [sxInputProps] sx props passed to internal input field
 * @property {(val?: any) => void} [onChange] Callback for text change
 * @property {(val?: any) => void} [onEnter] Callback for enter pressed
 */
interface BrandedTextfieldProps extends StandardTextFieldProps {
  id?: string;
  defaultValue?: string;
  infoText?: string | null;
  isClearable?: boolean;
  isFullWidth?: boolean;
  label?: string;
  placeholder?: string;
  allowNumberExponent?: boolean;
  forceNumberAsInteger?: boolean;
  sxProps?: any;
  sxInputProps?: any;
  onChange?: (val?: any) => void;
  onEnter?: (val?: any) => void;
}

export function TextFieldMainUi(props: BrandedTextfieldProps) {
  const {
    defaultValue = '',
    id = 'field',
    inputRef,
    isClearable = true,
    isFullWidth = false,
    infoText = null,
    label,
    placeholder,
    allowNumberExponent = false,
    forceNumberAsInteger = true,
    sxProps,
    sxInputProps,
    onChange,
    onEnter,
    ...textFieldProps
  } = props;

  const [textValue, setTextValue] = useState(defaultValue);

  useEffect(() => {
    setTextValue(defaultValue);
  }, [defaultValue]);

  const clearButton = isClearable ? (
    <InputAdornment position="end">
      <ButtonIcon
        name="Clear"
        props={{
          name: 'Clear',
          onClick: (event) => {
            event.stopPropagation();
            setTextValue('');
            if (onChange) {
              onChange('');
            }
          },
        }}
        tooltip="Clear"
        sxProps={{
          //backgroundColor: 'pink',
          marginLeft: '0px',
          marginRight: '0px',
        }}
      >
        <CloseIcon color="primary" fontSize="small" />
      </ButtonIcon>
    </InputAdornment>
  ) : null;

  return (
    <div className="content-row">
      <TextField
        autoComplete="off"
        inputRef={inputRef}
        sx={{
          borderRadius: '4px',
          paddingLeft: '4px',
          paddingRight: '4px',
          ...sxProps,
        }}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: textValue ? clearButton : null,
          sx: {
            backgroundColor: (theme: any) => `${theme.input.fill}`,
            minWidth: '180px',
            ...sxInputProps,
          },
          inputProps: {
            'data-testid': 'field-' + id,
          },
        }}
        name={id}
        id={id}
        data-testid={id}
        aria-label={label}
        label={label}
        placeholder={placeholder}
        value={textValue}
        margin="dense"
        variant="outlined"
        fullWidth={isFullWidth}
        size="small"
        {...textFieldProps}
        onChange={(event) => {
          let error = false;
          // prevent leading zero for number field
          if (textFieldProps?.type === 'number') {
            error = leadingZeroRegex.test(event.target.value);
          }
          if (!error) {
            setTextValue(event.target.value);
            if (onChange) {
              onChange(event.target.value);
            }
          }
        }}
        onKeyDown={(event) => {
          // prevent exponent (if not allowed), decimal (for integer field), or negative - to handle correctly
          if (textFieldProps?.type === 'number') {
            if (!allowNumberExponent && event.key === 'e') {
              event.preventDefault();
            }
            if (forceNumberAsInteger && event.key === '.') {
              event.preventDefault();
            }
            if (textValue.length > 0 && event.key === '-') {
              event.preventDefault();
            }
          }
          //REF bad logic preventing - for non numbers
          // if (
          //   (textFieldProps?.type === 'number' &&
          //     !allowNumberExponent &&
          //     event.key === 'e') ||
          //   (forceNumberAsInteger && event.key === '.') ||
          //   (textValue.length > 0 && event.key === '-')
          // ) {
          //   event.preventDefault();
          // }
          if (event.key === 'Enter' && onEnter) {
            event.preventDefault();
            onEnter(textValue);
          }
        }}
      />
      {infoText && <ButtonInfoField message={infoText} />}
    </div>
  );
}
