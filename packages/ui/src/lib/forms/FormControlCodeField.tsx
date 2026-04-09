import { Control, Controller } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import { MonacoEditor } from './MonacoEditor';

export type tFormControlMonacoFieldProps = {
  control?: Control;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  hidden?: boolean;
  label?: string;
  language?: string;
  name: string;
  readOnly?: boolean;
  height?: string | number;
  onBlur?: () => void;
  onChange?: (value: string | undefined) => void;
};

export function FormControlMonacoField({
  control,
  disabled,
  error = false,
  helperText = '',
  hidden = false,
  label = '',
  language = 'javascript',
  name,
  readOnly = false,
  height = 200,
  onBlur,
  onChange,
}: tFormControlMonacoFieldProps) {
  return (
    <FormControl
      error={error}
      style={{ width: hidden ? '0px' : '100%', display: hidden ? 'none' : undefined }}
    >
      <Controller
        key={name}
        name={name}
        control={control}
        render={({ field }) => (
          <>
            {label && (
              <InputLabel
                shrink
                sx={{
                  position: 'relative',
                  transform: 'none',
                  fontSize: '0.75rem',
                  color: error ? 'error.main' : 'text.secondary',
                  mb: 0.5,
                }}
              >
                {label}
              </InputLabel>
            )}
            <MonacoEditor
              value={field.value ?? ''}
              language={language}
              readOnly={readOnly}
              disabled={disabled}
              height={height}
              error={error}
              onChange={(value) => {
                if (onChange) {
                  onChange(value);
                } else {
                  field.onChange(value);
                }
              }}
              onBlur={() => {
                field.onBlur();
                if (onBlur) onBlur();
              }}
            />
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
          </>
        )}
      />
    </FormControl>
  );
}

export default FormControlMonacoField;
