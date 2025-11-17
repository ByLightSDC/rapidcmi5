/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Control, Controller } from 'react-hook-form';

import ReadOnlyTextField from './ReadOnlyTextField';
import { ButtonInfoField } from '../inputs/buttons/buttons';

/* MUI */
import FormControl from '@mui/material/FormControl';
import { fieldMarginTop } from '../styles/muiTheme';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import { TimePickerContext } from './TimePickerContext';

export type tFormControlTimeFieldProps = {
  control?: Control;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  hidden?: boolean;
  infoText?: string | JSX.Element | null;
  onChange?: (value: any) => void; //function to call for special handling of change - should setValue on the field
  readOnly?: boolean;
  label?: string;
  name: string;
  required?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  watch?: any;
  sxProps?: any;
};

export function FormControlTimeField({
  control,
  disabled = true,
  error = false,
  helperText = '',
  hidden = false,
  infoText = null,
  onChange,
  readOnly = false,
  label = '',
  name,
  required = false,
  fullWidth = true,
  placeholder = '',
  watch,
  sxProps = { marginTop: fieldMarginTop },
}: tFormControlTimeFieldProps) {
  //#region display time
  const [hasDateError, setHasDateError] = useState(false);

  const watchTime = watch ? watch(name) : '';

  const dateFromTimeString = (hhmmss: string) => {
    if (hhmmss && hhmmss.length > 0) {
      const splitTime = hhmmss.split(':');

      const date = new Date(); // we only care about the hh:mm:ss
      date.setHours(+splitTime[0]);
      date.setMinutes(+splitTime[1]);
      date.setSeconds(+splitTime[2]);
      return date;
    }
    return null;
  };

  const displayDate: Date | null = useMemo(() => {
    return dateFromTimeString(watchTime);
  }, [watchTime]);
  // #endregion

  // #region timePicker
  const [isInitialized, setIsInitialized] = useState(false);
  const { lastTimePickerId, updateLastTimePickerId } =
    useContext(TimePickerContext);
  const mouseDownRef = useRef<number[]>([0, 0]);
  // need ref so mouse listeners can "see" the latest
  const timePickerIdRef = useRef<string>('');

  const handleClose = (evt?: any) => {
    if (timePickerIdRef.current === label) {
      timePickerIdRef.current = '';
      updateLastTimePickerId('');
    }
    if (evt) {
      evt.preventDefault();
    }
  };

  const handleOpen = () => {
    timePickerIdRef.current = label;
    updateLastTimePickerId(label);
  };

  useEffect(() => {
    // rerender if lastTimePickerId changes
    if (!isInitialized) {
      // clear timepicker on initial mount in case it was left open
      updateLastTimePickerId('');
      setIsInitialized(true);
    } else {
      timePickerIdRef.current = lastTimePickerId;
    }
  }, [lastTimePickerId, updateLastTimePickerId]);

  const onMouseDownWindow = (evt: MouseEvent) => {
    mouseDownRef.current = [evt.clientX, evt.clientY];
  };

  const onMouseUpWindow = (evt: MouseEvent) => {
    if (timePickerIdRef.current === label) {
      const elements = document.getElementsByClassName('MuiPickersLayout-root');
      if (elements.length > 0) {
        const box = elements[0].getBoundingClientRect();
        const x = mouseDownRef.current[0];
        const y = mouseDownRef.current[1];
        const isWithinBounds =
          x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
        if (!isWithinBounds) {
          handleClose();
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousedown', onMouseDownWindow);
    window.addEventListener('mouseup', onMouseUpWindow);

    return () => {
      window.removeEventListener('mousedown', onMouseDownWindow);
      window.removeEventListener('mouseup', onMouseUpWindow);
    };
  }, []);
  // #endregion

  return (
    <FormControl
      error={error}
      style={{ width: hidden ? '0px' : '100%', height: '100%' }}
    >
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
                    <TimePicker
                      ampm={false}
                      closeOnSelect={true}
                      views={['hours', 'minutes', 'seconds']}
                      data-testid={field.name}
                      aria-label={label}
                      label={`${label}${required ? ' *' : ''}`}
                      timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                      name={field.name}
                      value={displayDate}
                      slotProps={{
                        textField: {
                          error: error || hasDateError,
                          helperText: hasDateError
                            ? 'Must fill in HH:MM:SS'
                            : helperText,
                          sx: { ...sxProps, marginTop: '8px' }, // time picker is a little taller, so needs some spacing
                        },
                      }}
                      onChange={(value: any, context) => {
                        let time = '';
                        let isValid = true;
                        // first check for TimePicker's date validation error
                        if (context.validationError) {
                          isValid = false;
                        } else if (value) {
                          const hour = (value as Date).getHours();
                          const min = (value as Date).getMinutes();
                          const sec = (value as Date).getSeconds();
                          time =
                            String(hour).padStart(2, '0') +
                            ':' +
                            String(min).padStart(2, '0') +
                            ':' +
                            String(sec).padStart(2, '0');
                        }
                        setHasDateError(!isValid);

                        if (isValid) {
                          if (onChange) {
                            onChange(time);
                          } else {
                            field.onChange(time);
                          }
                        }
                      }}
                      open={label === lastTimePickerId} // Bind the open state
                      onClose={handleClose} // Handle closing
                      onOpen={handleOpen} // Handle opening (optional, but good practice)
                    />
                  ) : (
                    <ReadOnlyTextField
                      fieldName={field.name}
                      fieldLabel={label}
                      fieldValue={field.value ?? ''}
                      props={{
                        disabled: disabled,
                        fullWidth: fullWidth,
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
          );
        }}
      />
    </FormControl>
  );
}

export default FormControlTimeField;
