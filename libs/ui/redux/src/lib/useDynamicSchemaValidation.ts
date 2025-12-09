import { useDispatch, useSelector } from 'react-redux';
import { fieldAttributes, isYupValidationSetUp, resetValidation, setAttribute, setIsYupValidationSetUp } from './dynamicSchemaReducer';
// DO NOT CHANGE - this is the required delimiter for the react-hook-form nested fields
export const keyDelim = '.';

/**
 * @enum {string} Attribute properties supported
 */
export enum AttributeProperty {
  ReadOnly = 'readOnly',
  Required = 'required',
  Deprecated = 'deprecated',
  WriteOnly = 'writeOnly',
}

/**
 * Hook that handles status of schema data field validation
 * Persists the field attributes so that validation can be determined
 * AND form data can be sanitized before submitting to api
 * @returns The hook
 */

export const useDynamicSchemaValidation = () => {
  const dispatch = useDispatch();
  const fieldAttributeSet = useSelector(fieldAttributes);
  const validationSetUp = useSelector(isYupValidationSetUp);

  /**
   * Clears the schema data validation from redux store
   */
  const clearValidation = (v : any) => {
    dispatch(resetValidation(v));
  };

  /**
   * Gets individual field attribute
   * @param {string} fieldName schema data form field name (with . notation)
   * @param {AttributeProperty} attribute attribute to get for field
   * @returns {*} current value of attribute or undefined if not in redux
   */
  const getFieldAttribute = (
    fieldName: string,
    attribute: AttributeProperty,
  ) => {
    if (fieldAttributeSet && fieldAttributeSet.hasOwnProperty(fieldName)) {
      const attributes = fieldAttributeSet[fieldName];
      if (attributes.hasOwnProperty(attribute)) {
        return attributes[attribute];
      }
    }
    return; // undefined
  };

  /**
   * Gets set of current field attributes
   * @returns set of field attributes currently defined
   */
  const getFieldAttributes = () => {
    return fieldAttributeSet;
  };

  /**
   * Sanitizes the given form data for schema values using recursion over given form data values
   *   - removes properties with empty values
   *   - removes properties which are read only
   * @param {any} [values] form data values to sanitize
   * @param {string} [parentFormField=''] form data field which schema data values are under if not at top level
   * @returns sanitized values
   */
  const sanitizeValues = (values?: any, parentFormField = '') => {
    // recursively loop over entries - removing any empty or readOnly ones
    const recurseSanitize = (object: any, prefix: string) => {
      Object.entries(object).forEach(([k, value]) => {
        const dottedFieldKey = (prefix ? prefix + keyDelim : '') + k;

        if (value && typeof value === 'object') {
          // recurse so that we remove any empty children - in case that makes this item empty as well
          recurseSanitize(value, dottedFieldKey);
        }
        // now handle - empty object type OR individual field
        if (
          (value && typeof value === 'object' && !Object.keys(value).length) ||
          value === null ||
          value === undefined ||
          (value as any)?.length === 0 || // any - to handle string or array
          getFieldAttribute(dottedFieldKey, AttributeProperty.ReadOnly) === true
        ) {
          if (Array.isArray(object)) {
            const index = Number(k);
            object.splice(index, 1);
          } else {
            delete object[k];
          }
        }
      });
      return object;
    };

    if (values) {
      let newValues = { ...values };
      recurseSanitize(newValues, parentFormField || '');
      return newValues;
    }
    return {};
  };

  /**
   * Sets the given attribute for a field
   * Persists info in the redux store
   * @param {string} fieldName schema data form field name (with . notation)
   * @param {AttributeProperty} attribute attribute to set on field
   * @param {*} value value of the attribute
   */
  const setFieldAttribute = (
    fieldName: string,
    attribute: AttributeProperty,
    value: any,
  ) => {
    dispatch(setAttribute({ fieldName, attribute, value }));
  };

  /**
   * Updates status of schema dat yup validation setup
   * Persists info in the redux store
   * @param {boolean} isSetUp Indication whether yup validation has been set up
   */
  const setIsValidationSetUp = (isSetUp: boolean) => {
    dispatch(setIsYupValidationSetUp(isSetUp));
  };

  return {
    clearValidation,
    getFieldAttribute,
    getFieldAttributes,
    isValidationSetUp: validationSetUp,
    sanitizeValues,
    setFieldAttribute,
    setIsValidationSetUp,
  };
};
