import { useEffect, useState } from 'react';
import { SelectorMainUi } from '../inputs/selectors/selectors';
import { TextFieldMainUi } from '../inputs/textfields/textfields';
import ReadOnlyTextField from './ReadOnlyTextField';
import { fieldMarginTop } from '../styles/muiTheme';

/**
 * @typedef {Object} tFieldProps
 * @property {string} fieldName Fully qualified form field name (e.g., values.myField)
 * @property {boolean} [hidden=false] Whether component should be hidden
 * @property {string | null} [infoText] Helper text for field
 * @property {string} [label] Label to display for field
 * @property {string[]} [options] List of unit options for a Selector field
 * @property {string} [placeholder] Placeholder text for field when no value has been entered
 * @property {boolean} [readOnly=false] Indication whether field is not editable
 * @property {boolean} [required=false] Indication whether field is required
 * @property {boolean} [allowNoneOption=false] Include an empty entry at top of list
 * @property {boolean} [allowExponent=false] Allow number entered to use scientific notation (ex. 1e10)
 * @property {boolean} [disableUnitsWithExponent=true] Whether to clear/disable units when scientific notation is present
 * @property {boolean} [forceInteger=false] Force number entered to be an integer (no decimal)
 * @property {*} [sxProps] Style props to apply to field
 * @property {*} [sxInputProps] sx props passed to internal input field
 * @property {any} error React hook form error for THIS field
 * @property {any} getValues Form function for retrieving field values
 * @property {any} setValue React hook form Fxn to update form field value
 * @property {any} trigger React hook form Fxn to trigger validation
 */

type tFieldProps = {
  fieldName: string;
  hidden?: boolean;
  infoText?: string | null;
  label?: string;
  options: string[];
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  allowNoneOption?: boolean;
  allowExponent?: boolean;
  disableUnitsWithExponent?: boolean;
  forceInteger?: boolean;
  sxProps?: any;
  sxInputProps?: any;
  error: any;
  getValues: any;
  setValue: any;
  watch: any;
  trigger: any;
};

/**
 * Form Field for an Integer stored with choice of units
 * @param tFieldProps props Field Component props
 * @returns {React.ReactElement}
 * NOTE: Validation for integer field with units needs to be defined in the validationSchema sent to useForm
 *       @see DemoForm for example
 */
export function NumberWithUnitsField(props: tFieldProps) {
  const {
    fieldName,
    hidden = false,
    infoText = null,
    label = '',
    options,
    placeholder = '',
    readOnly = false,
    required = false,
    allowNoneOption = false,
    allowExponent = false,
    disableUnitsWithExponent = true,
    forceInteger = false,
    sxProps = { margin: '0px 2px 0px 0px', marginTop: fieldMarginTop },
    sxInputProps = { margin: '0px 0px 0px 0px', minWidth: '90px' },
    error,
    setValue,
    watch,
    trigger,
  } = props;

  const [isInit, setIsInit] = useState(false);
  const [numberValue, setNumberValue] = useState<string | undefined>(undefined);
  const [unitsValue, setUnitsValue] = useState<string | undefined>('');

  const watchFieldValue = watch(fieldName);
  const numberField = fieldName + '_value';
  const unitsField = fieldName + '_units';

  useEffect(() => {
    // this is to prevent a timing issue where this gets rendered initially before form data is initialized
    // so that actual db field is not overwritten as empty for simple "text" field
    if (options && typeof watchFieldValue !== 'undefined') {
      // need to check for scientific notation (ex. 4.5e7) prior to checking for units at end of fieldValue
      const exponentIndex = watchFieldValue.indexOf('e');
      const checkString = watchFieldValue.substring(exponentIndex + 1);
      const unitsIndex = checkString.search(/[a-zA-Z]/);

      let newNumberValue = watchFieldValue;
      let newUnitsValue = '';
      if (unitsIndex > -1) {
        newNumberValue = watchFieldValue.substring(
          0,
          exponentIndex + unitsIndex + 1,
        );
        newUnitsValue = watchFieldValue.substring(
          exponentIndex + unitsIndex + 1,
        );
      }

      // only update if it really changed
      if (newNumberValue !== numberValue || newUnitsValue !== unitsValue) {
        setNumberValue(newNumberValue);
        setUnitsValue(newUnitsValue);
      }
      if (!isInit) {
        setIsInit(true);
      }
    }
  }, [watchFieldValue]);

  const containsExponent = Boolean(
    numberValue && numberValue.indexOf('e') > -1,
  );
  /**
   * Use effect listens for user input and updates the form with a value that includes units
   */
  useEffect(() => {
    // MUST have set up value (or be entering value) before trying to change - or field gets blanked out
    if (isInit || typeof numberValue !== 'undefined') {
      if (numberValue) {
        if (containsExponent && disableUnitsWithExponent) {
          setValue(fieldName, numberValue);
          if (unitsValue) {
            setUnitsValue('');
          }
        } else {
          setValue(fieldName, numberValue + unitsValue);
        }
      } else {
        setValue(fieldName, '');
      }
      trigger(fieldName);
    }
  }, [isInit, numberValue, unitsValue]);

  if (hidden) {
    return null;
  }

  if (readOnly) {
    return (
      //must have margin top to match invisible formfield label height
      <div className="content-row" style={{ width: '100%' }}>
        <ReadOnlyTextField
          fieldName={numberField}
          fieldLabel={label}
          fieldValue={numberValue ?? ''}
          props={{ disabled: true }}
        />
        <ReadOnlyTextField
          fieldName={unitsField}
          fieldValue={unitsValue}
          fieldInfo={infoText || ''}
          props={{ disabled: true }}
          // marginLeft of 0px puts next to the Integer field
          sxProps={{ marginLeft: '0px' }}
        />
      </div>
    );
  }

  return (
    <div className="content-row">
      <TextFieldMainUi
        key={numberField}
        id={numberField}
        defaultValue={numberValue ?? ''}
        disabled={readOnly}
        error={Boolean(error)}
        helperText={error?.message}
        isFullWidth={false}
        label={label}
        placeholder={placeholder}
        required={required}
        type="number"
        allowNumberExponent={allowExponent}
        forceNumberAsInteger={forceInteger}
        // padding right of 0px puts closer to units dropdown
        // minWidth of 90px allows for visibility of "max 32 bit integer" (2147483647)
        sxProps={{ paddingRight: '0px', minWidth: '90px', ...sxProps }}
        sxInputProps={sxInputProps}
        onChange={(textVal) => setNumberValue(textVal)}
      />
      {options && (
        <SelectorMainUi
          key={unitsField}
          id={unitsField}
          defaultValue={unitsValue ?? ''}
          isFullWidth={false}
          infoText={infoText}
          readOnly={readOnly || (disableUnitsWithExponent && containsExponent)}
          required={required}
          options={options}
          allowNoneOption={allowNoneOption}
          // padding left of 0px puts closer to Integer field
          // minWidth of 60px allows for visibility of two char units
          sxProps={{ paddingLeft: '0px', ...sxProps }}
          onSelect={(sel) => setUnitsValue(sel)}
        />
      )}
    </div>
  );
}

export default NumberWithUnitsField;
