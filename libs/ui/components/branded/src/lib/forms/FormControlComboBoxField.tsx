/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-useless-fragment */

import { useEffect, useState } from 'react';

/* MUI */
import TextField from '@mui/material/TextField';
import { Autocomplete } from '@mui/material';

import { ButtonInfoField } from '../inputs/buttons/buttons';
import ReadOnlyTextField from './ReadOnlyTextField';
import { UseFormReturn } from 'react-hook-form';
import { fieldMarginTop } from '../styles/muiTheme';

/**
 * @typedef {Object} tAutocompleteProps
 * @property {boolean} [multiple] Whether to allow multiple selection
 * @property {boolean} [freeSolo] Whether to allow entry of value other than combobox
 * @property {boolean} [disableClearable] Whether to disable the clear button (X)
 */
type tAutocompleteProps = {
  multiple?: boolean;
  freeSolo?: boolean;
  disableClearable?: boolean;
};

/**
 * @typedef {Object} tFieldProps
 * @property {boolean} [error] Whether field has error or not
 * @property {UseFormReturn} formMethods React hook form methods
 * @property {string} [helperText] Helper text to display for field
 * @property {string} [infoText] Helper text for field
 * @property {string} name Fully qualified form field name (e.g., values.myField)
 * @property {Array<any>} options List of options
 * @property {Array<any>} [disabledOptions] List of option(s) which should be disabled
 * @property {string} [label] Label to display for field
 * @property {boolean} [readOnly=false] Indication whether field is not editable
 * @property {boolean} [required=false] Indication whether field is required
 * @property {any} [triggerField] Optional field to trigger on change instead of field indicated by name (e.g., the parent of the field)
 * @property {tAutoCompleteProps} [autocompleteProps] Optional props for autocomplete
 * @property {any} [onBlur] Optional function to call when onBlur occurs for the field
 */
type tFieldProps = {
  error?: boolean;
  formMethods: UseFormReturn;
  helperText?: string;
  infoText?: string;
  name: string;
  options: Array<any>;
  disabledOptions?: Array<any>;
  label?: string;
  readOnly?: boolean;
  required?: boolean;
  triggerField?: string;
  autocompleteProps?: tAutocompleteProps;
  onBlur?: () => void;
};

/**
 * Provides a combo box selector as a for field
 * @param {tFieldProps} props Component Props
 *  @returns {JSX.Element} React Component
 */
export function FormControlComboBoxField(props: tFieldProps) {
  const {
    error = false,
    formMethods,
    helperText = '',
    infoText = '',
    name,
    options,
    disabledOptions,
    label = '',
    readOnly = false,
    required = false,
    triggerField,
    autocompleteProps = {},
    onBlur,
  } = props;
  const { setValue, trigger, watch } = formMethods;

  const [comboBoxOptions, setComboBoxOptions] = useState<any[]>(options);
  const [comboValue, setComboValue] = useState<
    { label: string; value: string } | string | null
  >(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setComboBoxOptions(options);
  }, [options]);

  /**
   * Returns combo box selection based on value
   * A combo box selection can be a string , or a key pair with label and value
   * @param {unknown} value React hook form field value
   * @return {{ label: string; value: string } | string | null} Render elements
   */
  const getOption = (
    value: unknown,
  ): { label: string; value: string } | string | null => {
    if (comboBoxOptions.length > 0) {
      if (typeof comboBoxOptions[0] === 'string') {
        return value as string;
      } else {
        const entry = comboBoxOptions.find((item) => item.value === value);
        return entry ? entry : null;
      }
    }
    return null;
  };

  /**
   * Returns selected label
   * @param {{ label: string; value: string } | string | null} selection Combo box selection
   * @return {string} Label selected
   */
  const getLabel = (
    selection: { label: string; value: string } | string | null,
  ): string => {
    if (typeof selection === 'string') {
      return selection;
    } else if (selection?.label) {
      return selection?.label;
    }
    return '';
  };

  /** @constant
   * Watch field value
   * @type {unknown}
   */
  const watchComboBox = watch(name);

  useEffect(() => {
    // this forces re-render if now pointing to different form field (name changed)
    setInputValue('');
  }, [name]);

  /**
   * Use Effect waits for field value (or list of options) to change
   * Sets combo box selection based on the value
   * Sets input value based on the selection
   */
  useEffect(() => {
    if (autocompleteProps?.freeSolo) {
      // this is to initially set the value from the form data
      if (watchComboBox && watchComboBox !== inputValue) {
        setInputValue(watchComboBox as string);
      }
      return;
    }
    const optionSelected = getOption(watchComboBox);
    setComboValue(optionSelected);
    setInputValue(getLabel(optionSelected));
  }, [watchComboBox, comboBoxOptions]);

  return (
    <div className="content-row-icons">
      {!readOnly ? (
        <>
          <Autocomplete
            id={'combo-box-' + name}
            data-testid={'combo-box-' + name}
            inputValue={inputValue}
            value={comboValue}
            options={comboBoxOptions}
            disabled={readOnly}
            {...autocompleteProps}
            sx={{
              display: 'flex',
              flexGrow: 1,
            }}
            getOptionDisabled={(option) => {
              if (disabledOptions) {
                return disabledOptions.indexOf(option) >= 0;
              } else {
                return false;
              }
            }}
            isOptionEqualToValue={(option, value) => {
              let match = false;
              if (option?.value) {
                match = option?.value === value?.value;
              } else {
                match = option === value;
              }
              return match;
            }}
            onChange={(event: any, newValue: any) => {
              //user clicked option
              if (newValue?.value) {
                setValue(name, newValue.value);
              } else {
                setValue(name, newValue ? newValue : '');
              }
              trigger(triggerField ? triggerField : name);
            }}
            onInputChange={(event, newInputValue) => {
              //user typed
              if (autocompleteProps?.freeSolo) {
                setInputValue(newInputValue);
                setValue(name, newInputValue);
                trigger(triggerField ? triggerField : name);
              } else {
                //this will filter the options
                setInputValue(newInputValue);
              }
            }}
            onClose={(event, reason) => {
              if (onBlur && (reason === 'blur' || reason === 'selectOption')) {
                onBlur();
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{
                  marginTop: fieldMarginTop,
                  borderRadius: '4px',
                  backgroundColor: (theme: any) => `${theme.input.fill}`, //combo box interior color
                }}
                InputLabelProps={{ shrink: true }} // always put label above box even if empty
                label={label}
                margin="dense"
                key={name}
                name={name}
                variant="outlined"
                disabled={readOnly}
                required={required}
                error={error}
                helperText={helperText}
                size="small"
              />
            )}
          />
        </>
      ) : (
        <ReadOnlyTextField
          fieldName={name}
          fieldLabel={label}
          fieldValue={inputValue}
          props={{
            disabled: true,
            fullWidth: true,
          }}
        />
      )}
      {infoText && <ButtonInfoField message={infoText} />}
    </div>
  );
}

export default FormControlComboBoxField;
