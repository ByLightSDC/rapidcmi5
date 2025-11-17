/* eslint-disable react-hooks/exhaustive-deps */

import { LooseObject, SelectorMainUi } from '@rangeos-nx/ui/branded';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

export const KeyAlgorithmOptions = [
  'rsa 2048',
  'rsa 4096',
  'rsa 8192',
  'ecdsa 256',
  'ecdsa 384',
  'ecdsa 521',
  'ed25519 256',
];
const KeyAlgorithmOptionsOptional = ['', ...KeyAlgorithmOptions];

const invalidSelectionMessage = 'Please select a valid value from dropdown';

/**
 * @typedef {object} tFieldProps
 * @property {string} [label] Label for displayed Key Algorithm field (which includes the size)
 * @property {string} displayName Name to use for combined algorithm/size display field
 * @property {string} algorithmField: Form name for algorithm portion of the key
 * @property {string} sizeField: Form name for size portion of the key
 * @property {string | null} [infoText] Helper text for field
 * @property {boolean} [readOnly=false] Whether the component fields are read only
 * @property {boolean} [required=false] Whether the component fields are required
 * @param {UseFormReturn} formMethods React hook form methods
 */
type tFieldProps = {
  label?: string;
  displayName: string;
  algorithmField: string;
  sizeField: string;
  infoText?: string;
  readOnly?: boolean;
  required?: boolean;
  formMethods: UseFormReturn;
};
/**
 * KeyAlgorithmField
 * @param {tFieldProps} props Component props
 * @returns {React.ReactElement}
 *
 * Note:
 * While database stores the info separately (algorithmField and sizeField),
 * this component combines then together and provides a dropdown of valid "combined" values.
 * It then calls setValue to store back into the individual fields.
 * A manual value is set on "displayError_"+ fieldName so that the parent form
 * can do a validate to update isValid appropriately for the form
 * -- example in form validationSchema:
 *  displayError_keyAlgorithm: yup.boolean().oneOf([false], 'hidden message'), // this is used inside the Key Algorithm component so form knows if there's an error
 */
export function KeyAlgorithmField(props: tFieldProps) {
  const {
    algorithmField,
    label = 'Key Algorithm',
    displayName = 'keyAlgorithm',
    infoText,
    readOnly = false,
    required = false,
    sizeField,
    formMethods,
  } = props;
  const { getValues, setValue, trigger } = formMethods;

  const [lookUpValues, setLookupValues] = useState<LooseObject>({});
  const [fieldValue, setFieldValue] = useState('');
  const [keyAlgorithmError, setKeyAlgorithmError] = useState('');

  const options = required ? KeyAlgorithmOptions : KeyAlgorithmOptionsOptional;
  const displayErrorFieldName = 'displayError_' + displayName;

  // initialize lookup values table from options and determine combined field value
  useEffect(() => {
    const lookUp: LooseObject = {};
    options.forEach((option) => {
      const splitValue = option.split(' ');
      if (splitValue.length > 0) {
        lookUp[option] = { algo: splitValue[0], size: splitValue[1] };
      }
    });
    setLookupValues(lookUp);

    const algoValue = getValues(algorithmField);
    const sizeValue = getValues(sizeField);
    let keyAlgorithm = algoValue || '';
    if (sizeValue) {
      keyAlgorithm += ' ' + sizeValue;
    }
    if (lookUp[keyAlgorithm]) {
      setFieldValue(keyAlgorithm);
      setKeyAlgorithmError('');
    } else {
      setFieldValue('');
      setKeyAlgorithmError(invalidSelectionMessage);
    }
  }, []);

  const handleSelect = (newValue: string) => {
    setFieldValue(newValue);
    const values = lookUpValues[newValue];
    setValue(algorithmField, values.algo);
    setValue(sizeField, values.size);
    setKeyAlgorithmError('');
  };

  // set or clear manual displayError field based on keyAlgorithmError changes
  useEffect(() => {
    // to force form to know whether there's an error on this field
    setValue(displayErrorFieldName, Boolean(keyAlgorithmError));
    trigger(displayErrorFieldName);
  }, [keyAlgorithmError]);

  return (
    <SelectorMainUi
      key={displayName}
      id={displayName}
      defaultValue={fieldValue}
      readOnly={readOnly}
      required={required}
      error={Boolean(keyAlgorithmError)}
      helperText={keyAlgorithmError}
      infoText={infoText}
      label={label}
      options={options}
      sxProps={{ minWidth: '150px' }}
      isFormStyle={false}
      listItemProps={{
        fontWeight: '400 !important',
        textTransform: 'uppercase',
      }}
      onSelect={handleSelect}
    />
  );
}
export default KeyAlgorithmField;
