/*
 *   Copyright (c) 2023 - 2024 By Light Professional IT Services LLC
 *   All rights reserved.
 */
/* eslint-disable react/jsx-no-useless-fragment */
import { useState } from 'react';
import { Control, Controller } from 'react-hook-form';

/* MUI */
import FormControl from '@mui/material/FormControl';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

/*Icons */
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { fieldMarginTop } from '../styles/muiTheme';
import { ButtonIcon, ButtonInfoField } from '@rapid-cmi5/ui/api/hooks';

type tFormControlPasswordProps = {
  control?: Control;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  hidden?: boolean;
  infoText?: string | null;
  props?: TextFieldProps;
  onTogglePassword?: boolean;
  onClear?: (fieldName: string) => void;
  readOnly?: boolean;
  required?: boolean;
  label?: string;
  name: string;
  minRows?: number;
  maxRows?: number;
  placeholder?: string;
};

export function FormControlPassword({
  control,
  disabled = false,
  error = false,
  helperText = '',
  hidden = false,
  infoText = null,
  props = {},
  onClear,
  onTogglePassword = true,
  readOnly = false,
  label = 'Password',
  name,
  placeholder = '',
  required = false,
}: tFormControlPasswordProps) {
  const [isPassword, setIsPassword] = useState(true);
  const handleTogglePassword = () => {
    setIsPassword(!isPassword);
  };

  const togglePasswordButton = onTogglePassword ? (
    <InputAdornment position="end">
      <ButtonIcon
        id="button-toggle-password"
        props={{
          name: 'Toggle Password',
          onClick: (event) => {
            event.stopPropagation();
            handleTogglePassword();
          },
        }}
        tooltip={isPassword ? 'Show ' + label : 'Hide ' + label}
      >
        <>
          {isPassword && <VisibilityIcon fontSize="medium" />}
          {!isPassword && <VisibilityOffIcon fontSize="medium" />}
        </>
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
                <TextField
                  {...props}
                  id={field.name}
                  data-testid={field.name}
                  aria-label={label}
                  label={label}
                  name={field.name}
                  required={required}
                  type={isPassword ? 'password' : 'text'}
                  value={field.value ?? ''}
                  autoComplete="current-password"
                  error={error}
                  helperText={helperText}
                  margin="dense"
                  variant="outlined"
                  size="small"
                  spellCheck={false}
                  placeholder={placeholder}
                  sx={{
                    width: '100%',
                    borderRadius: '4px',
                    marginTop: fieldMarginTop,
                  }}
                  InputProps={{
                    endAdornment: togglePasswordButton,
                    sx: {
                      backgroundColor: (theme: any) =>
                        props.disabled || readOnly
                          ? `${theme.input.disabledFill}`
                          : `${theme.input.fill}`,
                      color: (theme: any) =>
                        props.disabled
                          ? `${theme.palette.text.disabled}`
                          : `${theme.palette.text.primary}`,
                      borderRadius: '4px',
                      '& .MuiOutlinedInput-root.Mui-disabled': {
                        '& > fieldset': { border: '1px solid #88888860' },
                      },
                    },
                    inputProps: {
                      'data-testid': 'field-' + field.name,
                      disabled: disabled,
                      readOnly: readOnly,
                    },
                  }}
                  InputLabelProps={{ shrink: true }} // always put label above box even if empty
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                />

                {infoText && <ButtonInfoField message={infoText} />}
              </div>
            )}
          </>
        )}
      />
    </FormControl>
  );
}

export default FormControlPassword;
