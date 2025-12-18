/* MUI */
import TextField, { TextFieldProps } from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import InputAdornment from '@mui/material/InputAdornment';
import { fieldMarginTop } from '../styles/muiTheme';
import { ButtonIcon, ButtonInfoField } from '@rapid-cmi5/ui/api/hooks';

export function ReadOnlyTextField({
  children,
  fieldInfo = '',
  fieldName = '',
  fieldValue = '',
  fieldLabel = '',
  onClear,
  props = {},
  sxProps = { marginTop: fieldMarginTop },
  sxInputProps = {},
}: {
  children?: JSX.Element | null;
  fieldInfo?: string | JSX.Element;
  fieldLabel?: string;
  fieldName?: string;
  fieldValue?: string;
  onClear?: (fieldName: string) => void;
  props?: TextFieldProps;
  sxProps?: any;
  sxInputProps?: any;
}) {
  const isDisabled = props.hasOwnProperty('disabled')
    ? props['disabled']
    : true;
  const error = props.hasOwnProperty('error') ? props['error'] : false;
  const helperText = props.hasOwnProperty('helperText')
    ? props['helperText']
    : '';

  const clearButton =
    !isDisabled && onClear ? (
      <InputAdornment position="end">
        <ButtonIcon
          props={{
            name: 'Clear',
            onClick: (event) => {
              event.stopPropagation();
              if (!props.disabled && onClear) {
                onClear(fieldName);
              }
            },
          }}
          tooltip="Clear"
          sxProps={{ marginLeft: '0px', marginRight: '0px', ...sxProps }}
        >
          <CloseIcon color="primary" fontSize="small" />
        </ButtonIcon>
      </InputAdornment>
    ) : null;

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {/* keeps the info text on same line as text field */}
      <TextField
        {...props}
        sx={{
          borderRadius: '4px',
          '& .MuiOutlinedInput-root.Mui-disabled': {
            '& > fieldset': {
              borderStyle: 'solid',
              borderWidth: '1px',
              borderColor: (theme: any) =>
                `${theme.input.disabledOutlineColor}`,
            },
          },
          '& .MuiOutlinedInput-root': {
            width: 'inherit',
            height: 'inherit',
          },
          ...sxProps,
          marginBottom: '8px',
          //REF marginTop:'8px', //without this readonly text fields were crowded, now moved to FormControl components sxProps = { marginTop: fieldMarginTop }
        }}
        data-testid={fieldName}
        id={fieldName}
        name={fieldName}
        label={fieldLabel}
        value={fieldValue}
        error={error}
        helperText={helperText}
        InputLabelProps={{ shrink: true }}
        margin="none" //this works
        variant="outlined"
        size="small"
        InputProps={{
          endAdornment: fieldValue ? clearButton : null,
          sx: {
            backgroundColor: (theme: any) =>
              props.disabled
                ? `${theme.input.disabledFill}`
                : `${theme.input.fill}`,
            color: (theme: any) =>
              props.disabled
                ? `${theme.palette.text.disabled}`
                : `${theme.palette.text.primary}`,
            ...sxInputProps,
          },
          disabled: isDisabled,
          readOnly: true,
          inputProps: {
            'data-testid': 'field-' + fieldName,
            tabIndex: -1,
          },
        }}
      />
      {fieldInfo && <ButtonInfoField message={fieldInfo} />}
    </div>
  );
}

export default ReadOnlyTextField;
