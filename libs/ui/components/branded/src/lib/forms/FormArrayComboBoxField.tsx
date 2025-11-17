import { useEffect } from 'react';

import { useDisplayFocus } from '../hooks/useDisplayFocus';
import FormControlComboBoxField from './FormControlComboBoxField';
import { tFormFieldRendererProps } from './FormFieldArray';

/**
 * @interface tFieldProps
 * @extends tFormFieldRendererProps
 * @property {boolean} [allowValueEntry = true] Whether to allow entry of value other than combobox
 * @property {Array<any>} options List of options (when NOT retrieving via apiHook)
 * @property {string} [infoText] Helper text for field
 * @property {string} [label] Label to display for field
 * @property {boolean} [required=false] Indication whether field is required
 * @property {any} [triggerField] Optional field to trigger on change instead of field indicated by name (e.g., the parent of the field)
 * @property {any} [onBlur] Optional function to call when onBlur occurs for the field
 */
interface tFieldProps extends tFormFieldRendererProps {
  allowValueEntry?: boolean;
  infoText?: string;
  label?: string;
  options: Array<any>;
  required?: boolean;
  triggerField?: string;
  onBlur?: () => void;
}

/**
 * Array Combobox form field
 * Handles focus on the item when added to array (isFocused)
 * @param {tFieldProps} props Component Properties
 * @return {JSX.Element} React Component
 */
export function FormArrayComboBoxField(props: tFieldProps) {
  const {
    formMethods,
    allowValueEntry = true,
    options,
    infoText = '',
    label = '',
    required = false,
    triggerField,
    onBlur,
    // tFormFieldRendererProps
    indexedArrayField,
    indexedErrors,
    isFocused = false,
    readOnly,
  } = props;

  const focusHelper = useDisplayFocus();

  // this effect is for focusing on this comboboxfield when added as row to an array
  useEffect(() => {
    if (isFocused) {
      focusHelper.focusOnElementById(`combo-box-${indexedArrayField}`);
    }
  }, [isFocused]);
  return (
    <FormControlComboBoxField
      name={indexedArrayField}
      label={label}
      options={options}
      autocompleteProps={allowValueEntry ? { freeSolo: true } : {}}
      readOnly={readOnly}
      required={required}
      triggerField={triggerField}
      error={Boolean(indexedErrors)}
      formMethods={formMethods}
      helperText={indexedErrors?.message}
      infoText={infoText}
      onBlur={onBlur}
    />
  );
}

export default FormArrayComboBoxField;
