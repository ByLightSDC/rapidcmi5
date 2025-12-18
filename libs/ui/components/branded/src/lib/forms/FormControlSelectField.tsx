/*
 *   Copyright (c) 2023 - 2024 By Light Professional IT Services LLC
 *   All rights reserved.
 */
import { useEffect, useState } from 'react';
import { Control, Controller } from 'react-hook-form';

import ReadOnlyTextField from './ReadOnlyTextField';

/* MUI */
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { fieldMarginTop } from '../styles/muiTheme';
import { ButtonInfoField } from '@rapid-cmi5/ui/api/hooks';
/**
 * @typedef MenuOptionsProps - menu option props
 * @property { [key: string]: string } options enumerated list of options
 * @property {boolean} [allowNoneOption=false] Include an empty entry at top of list
 * @property {boolean} [displayByKey=true] Display the Key of option item to user (vs value)
 * @property {boolean} [ignoreNull=true] Whether to ignore "Null" option if it exists in options list
 */
type MenuOptionsProps = {
  options: { [key: string]: string };
  allowNoneOption?: boolean;
  displayByKey?: boolean;
  ignoreNull?: boolean;
};
/**
 * Displays Menu Options
 * @param {MenuOptionsProps} props Component Prop
 *  @returns {JSX.Element[]} React Component
 */
export function getMenuOptions({
  options,
  allowNoneOption = false,
  displayByKey = true,
  ignoreNull = true,
}: MenuOptionsProps) {
  let menuOptions = [];

  // minHeight is so that the "default" - empty value has same height as other(s)
  const itemStyle = allowNoneOption ? { minHeight: '24px' } : {};

  if (allowNoneOption) {
    menuOptions.push(
      <MenuItem key={''} value={''} style={itemStyle}></MenuItem>,
    );
  }
  for (const [optionKey, option] of Object.entries(options)) {
    if (optionKey === 'Null' && ignoreNull) {
      continue;
    } else {
      menuOptions.push(
        <MenuItem key={optionKey} value={option} style={itemStyle}>
          {displayByKey ? optionKey : option}
        </MenuItem>,
      );
    }
  }
  return menuOptions;
}

export enum EmptyValueSetting {
  Undefined = 'undefined',
  Null = 'null',
}

type FormControlSelectFieldProps = {
  control: Control;
  error?: boolean;
  helperText?: string;
  infoText?: string | JSX.Element | null;
  label?: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  emptyValueSetting?: EmptyValueSetting;
  shouldDisableSelection?: boolean;
  setValue?: any;
  watch?: any;
  sxProps?: any;
  styleOverride?: any;
  children: JSX.Element[];
  onSelect?: (sel?: any) => void;
};
export function FormControlSelectField({
  control,
  error = false,
  helperText = '',
  infoText = null,
  label = '',
  name,
  required = false,
  readOnly = false,
  fullWidth = true,
  emptyValueSetting,
  shouldDisableSelection = false,
  setValue,
  watch,
  sxProps = { marginTop: fieldMarginTop },
  styleOverride = { width: '100%' },
  children,
  onSelect,
}: FormControlSelectFieldProps) {
  // only watch the actual value if the watch method is passed in
  const watchValue = watch ? watch(name) : name;
  // underlying MUI TextField does not update internal value when we set formvalue to undefined or null
  // so maintain a flag here in state
  const [displayAsEmpty, setDisplayAsEmpty] = useState(false);
  useEffect(() => {
    // this handles when user selects "empty" OR if initial data coming in has it set to null
    if (
      emptyValueSetting &&
      (watchValue === '' || watchValue === null) &&
      setValue
    ) {
      switch (emptyValueSetting) {
        case EmptyValueSetting.Undefined: {
          setValue(name, undefined);
          setDisplayAsEmpty(true);
          break;
        }
        case EmptyValueSetting.Null: {
          setValue(name, null);
          setDisplayAsEmpty(true);
          break;
        }
        default:
          setDisplayAsEmpty(false);
          break;
      }
    } else if (watchValue) {
      setDisplayAsEmpty(false);
    }
  }, [watchValue]);

  return (
    //Notes
    //02 / 22 - width was auto but combo boxes were not stretching to fit parent
    //03 /13 - above messed up IP selection field so updated it to be an override default
    <FormControl error={error} style={styleOverride}>
      <Controller
        key={name} // this makes controller re-render if now pointing to different form field (name changed)
        name={name}
        control={control}
        render={({ field }) => (
          <div className="content-row">
            {!readOnly ? (
              <TextField
                sx={{
                  borderRadius: '4px',
                  width: '100%',
                  ...sxProps,
                }}
                InputLabelProps={{ shrink: true }} // always put label above box even if empty
                InputProps={{
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
                value={displayAsEmpty ? '' : field.value || ''}
                required={required}
                error={error}
                helperText={helperText}
                select
                margin="dense"
                variant="outlined"
                autoComplete="off" // to prevent console warning from [DOM]
                fullWidth={fullWidth}
                size="small"
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event);
                  if (onSelect) {
                    onSelect(event.target.value);
                  }
                }}
                disabled={children?.length === 0 || shouldDisableSelection}
              >
                {children}
              </TextField>
            ) : (
              <ReadOnlyTextField
                fieldName={field.name}
                fieldLabel={label}
                fieldValue={field.value || ''}
                props={{
                  disabled: true,
                  fullWidth: fullWidth,
                  required: required,
                }}
              />
            )}
            {infoText && <ButtonInfoField message={infoText} />}
          </div>
        )}
      />
    </FormControl>
  );
}

export default FormControlSelectField;
