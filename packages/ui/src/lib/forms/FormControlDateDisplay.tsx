/*
 *   Copyright (c) 2023 - 2024 By Light Professional IT Services LLC
 *   All rights reserved.
 */
import { Control, Controller } from 'react-hook-form';
import { useDisplayDateFormatter } from '../hooks/useDisplayDateFormatter';

/* MUI */
import FormControl from '@mui/material/FormControl';
import TextField, { TextFieldProps } from '@mui/material/TextField';

import ReadOnlyTextField from './ReadOnlyTextField';

type tFormControlDateDisplayProps = {
  control: Control;
  label?: string;
  name: string;
  textFieldProps?: TextFieldProps;
};

export function FormControlDateDisplay({
  control,
  label = '',
  name,
  textFieldProps = { fullWidth: true, disabled: true },
}: tFormControlDateDisplayProps) {
  const { formatDisplayDateTime } = useDisplayDateFormatter();

  return (
    <FormControl style={{ width: '100%' }}>
      <Controller
        key={name} // this makes controller re-render if now pointing to different form field (name changed)
        name={name}
        control={control}
        render={({ field }) => (
          <ReadOnlyTextField
            fieldName={field.name}
            fieldLabel={label}
            fieldValue={formatDisplayDateTime({
              databaseDate: field.value,
            })}
            props={textFieldProps}
          />
        )}
      />
    </FormControl>
  );
}

export default FormControlDateDisplay;
