/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import { SelectorMainUi } from '../inputs/selectors/selectors';
import { TextFieldMainUi } from '../inputs/textfields/textfields';
import ReadOnlyTextField from './ReadOnlyTextField';

/**
 * @typedef {object} tNoUnitsFieldProps
 * @property {string} fieldName Name of database field in api which contains units (if nested include "path" - e.g., top.next)
 * @property {string} [unitLabel] Units to append to displayed field value
 * @property {string} [infoText] Helper text for field
 * @property {string} [label] Label to display above field
 * @property {any} [options] List of options for a Selector field
 * @property {string} [placeholder] Placeholder text to display when no value is specified
 * @property {boolean} [readOnly] Indication whether field is not editable
 * @property {boolean} [required] Indication whether field is required
 * @property {*} [sxProps] sx props passed to MUI field
 * @property {*} [sxInputProps] sx props passed to internal input field
 * @property {(string, string, number[]) => string} [getValueWithoutUnits] Method to call for special conversion from db value
 * @property {any} error React hook form error for THIS field
 * @property {any} getValues Form function for retrieving field values
 * @property {any} setValue React hook form Fxn to update form field value
 */
type tNoUnitsFieldProps = {
  fieldName: string;
  unitLabel?: string;
  infoText?: string;
  label?: string;
  options?: any;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  sxProps?: any;
  sxInputProps?: any;
  getValueWithoutUnits?: (
    fieldValue: string,
    unitLabel: string,
    options?: number[],
  ) => string;
  error: any;
  getValues: any;
  setValue: any;
  trigger: any;
};

/**
 * Displays a number field that updates form value to include units
 * @param {tNoUnitsFieldProps} props
 * @returns
 */
export function NoUnitsField(props: tNoUnitsFieldProps): JSX.Element {
  const removeUnitLabel = (
    valueWithUnits: string,
    unitLabel: string,
    options?: number[],
  ) => {
    return valueWithUnits.replace(unitLabel, '');
  };

  const {
    fieldName,
    unitLabel = 'h',
    infoText = '',
    label = '',
    options,
    placeholder,
    readOnly = false,
    required = false,
    sxProps,
    sxInputProps,
    getValueWithoutUnits = removeUnitLabel,
    error,
    getValues,
    setValue,
    trigger,
  } = props;

  const [isInit, setIsInit] = useState(false);
  const [noUnitsValue, setNoUnitsValue] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    const fieldValue = getValues(fieldName);
    // this is to prevent a timing issue where this gets rendered initially before form data is initialized
    // so that actual db field is not overwritten as empty for simple "text" field
    if (!isInit && (options || typeof fieldValue !== 'undefined')) {
      setIsInit(true);
      setNoUnitsValue(
        getValueWithoutUnits(fieldValue || '', unitLabel, options),
      );
    }
  }, []);

  /**
   * Use effect listens for user input and updates the form with a value that includes units
   */
  useEffect(() => {
    // MUST have set up value (or be entering value) before trying to change - or field gets blanked out
    if (isInit || typeof noUnitsValue !== 'undefined') {
      if (noUnitsValue) {
        setValue(fieldName, noUnitsValue + unitLabel);
      } else {
        setValue(fieldName, '');
      }
      trigger(fieldName);
    }
  }, [isInit, noUnitsValue]);

  if (readOnly) {
    return (
      <ReadOnlyTextField
        fieldName={fieldName}
        fieldLabel={label}
        fieldValue={noUnitsValue}
        fieldInfo={infoText}
        props={{ disabled: true, fullWidth: true }}
      />
    );
  }
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {!options && (
        <TextFieldMainUi
          key={fieldName}
          id={fieldName}
          defaultValue={noUnitsValue}
          disabled={readOnly}
          error={Boolean(error)}
          helperText={error?.message}
          infoText={infoText}
          label={label}
          placeholder={placeholder}
          required={required}
          sxProps={sxProps}
          sxInputProps={sxInputProps}
          onChange={(textVal) => setNoUnitsValue(textVal)}
          type="number"
        />
      )}
      {options && (
        <SelectorMainUi
          key={fieldName}
          id={fieldName}
          defaultValue={noUnitsValue}
          readOnly={readOnly}
          required={required}
          error={Boolean(error)}
          helperText={error?.message}
          infoText={infoText}
          label={label}
          options={options}
          sxProps={sxProps}
          sxInputProps={sxInputProps}
          onSelect={(sel) => setNoUnitsValue(sel)}
        />
      )}
    </>
  );
}

export default NoUnitsField;
