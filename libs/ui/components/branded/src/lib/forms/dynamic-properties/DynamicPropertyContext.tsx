/* eslint-disable no-prototype-builtins */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */

/*
 * Context for tracking fields, field errors, and field attributes such as readOnly
 */
import { createContext, useState } from 'react';
import * as yup from 'yup';

import {
  AttributeProperty,
  useDynamicSchemaValidation,
} from '@rangeos-nx/ui/redux';

/* Constants */
import { FormCrudType } from '@rangeos-nx/ui/branded';

import {
  ENUM_GROUP,
  INTEGER_ERROR,
  INTEGER_GROUP,
  NO_SPECIAL_CHARACTERS_ERROR,
  NUMBER_ERROR,
  NUMBER_GROUP,
  REGEX_GROUP,
  REQUIRED_ENTRY,
  REQUIRED_ERROR,
  UUID_GROUP_OPTIONS,
  dateYYYYMMDDRegex,
  descriptionRegex,
  emailRegex,
  internetHostNameRegex,
  ipv4Regex,
  ipv6Regex,
  timeHHMMSSRegex,
  uriRegex,
  uuidRegex,
} from '@rangeos-nx/ui/validation';

/**
 * @constant propertiesKey json schema properties entry
 */
export const propertiesKey = 'properties';

/* to replace any array index notation for field annotations for storing / retrieving attributes
 * Example: values.myArray[0].reqField would become values.myArray.reqField */
const arrayIndexRegex = /\[\d+\]/g;
/**
 * @interface iPropertyContext properties available from DynamiPropertyContext
 * @property {FormCrudType} crudType Current mode of form
 * @property {(fieldName: string, attribute: AttributeProperty) => any} getFieldAttribute Method to call to retrieve individual field attribute value
 * @property {(fieldName: string, attribute: AttributeProperty, value: any) => void} setFieldAttribute Method to call to set individual field attribute value
 * @property {(schemaData: any) => any)}  createSchemaYupValidator Method to call to create a yup validation for given field schema data
 * @property {() => any} getSingleYupValidationSchema Method to cal to retrieve yup validation for full object
 * @property {(fieldName: string) => any} getYupValidationSchemaForKey Method to cal to retrieve yup validation for given field
 * @property {(validationSchema: any) => any} setSingleYupValidationSchema Method to call to set yup validation for full object
 * @property {(fieldName: string, validationSchema: any) => any} setYupValidationSchemaForKey Method to cal to set yup validation for given field
 * @property {() => void} resetSingleYupValidationSchema Method to call to reset yup validation for full object
 * @property {(fieldName: string) => void} resetYupValidationSchemaForKey Method to call to reset yup validation for given field
 * @property {(fieldsToIgnore: string[]) => void} setFieldsToIgnore Method to call to set which fields should be ignored
 * @property {(fieldName: string) => boolean} shouldIgnoreField Method to call to see if this field should be ignored (based on those set by call to setFieldsToIgnore)
 */
interface iPropertyContext {
  crudType: FormCrudType;
  isPickerButtonVisible: boolean;
  getFieldAttribute: (fieldName: string, attribute: AttributeProperty) => any;
  setFieldAttribute: (
    fieldName: string,
    attribute: AttributeProperty,
    value: any,
  ) => void;
  createSchemaYupValidator: (schemaData: any) => any;
  getSingleYupValidationSchema: () => any;
  getYupValidationSchemaForKey: (fieldName: string) => any;
  setSingleYupValidationSchema: (validationSchema: any) => any;
  setYupValidationSchemaForKey: (
    fieldName: string,
    validationSchema: any,
  ) => any;
  resetSingleYupValidationSchema: () => void;
  resetYupValidationSchemaForKey: (fieldName: string) => void;
  setFieldsToIgnore: (fieldsToIgnore: string[]) => void;
  shouldIgnoreField: (fieldName: string) => boolean;
}

/**
 * Create Context
 */
export const DynamicPropertyContext = createContext<iPropertyContext>(
  {} as iPropertyContext, // this allows us to create the context without having to default values
);

/**
 * @interface tProviderProps Props to be defined when rendering the Provider for DynamicPropertyContext
 * @property {*} [children] Children
 * @property {FormCrudType} crudType Current mode of form
 */
interface tProviderProps {
  children?: any;
  crudType: FormCrudType;
  isPickerEnabled?: boolean;
}

/**
 * React context for dynamic properties including
 *    current mode of form
 *    validation status (per field and as a whole)
 *    attribute properties per field (such as ReadOnly, Required)
 * @param {tProviderProps} props Component props
 * @return {JSX.Element} React context
 */
export const DynamicPropertyProvider: any = (props: tProviderProps) => {
  const { children, crudType, isPickerEnabled = true } = props;

  const schemaValidationHelper = useDynamicSchemaValidation();

  //#region attributes
  /**
   * Gets current value of field attribute
   * @param {string} fieldName schema data form field name (with delimiter notation @see keyDelim )
   * @param {AttributeProperty} attribute attribute to set on field
   * @returns {*} current value of attribute or undefined
   */
  const getFieldAttribute = (
    fieldName: string,
    attribute: AttributeProperty,
  ) => {
    // remove any array indexes from fieldName
    const attributeFieldName = fieldName.replace(arrayIndexRegex, '');
    return schemaValidationHelper.getFieldAttribute(
      attributeFieldName,
      attribute,
    );
  };

  /**
   * Sets the field attribute property
   * @param {string} fieldName schema data form field name (with delimiter notation @see keyDelim )
   * @param {AttributeProperty} attribute attribute to set on field
   * @param {*} value value of the attribute
   */
  const setFieldAttribute = (
    fieldName: string,
    attribute: AttributeProperty,
    value: any,
  ) => {
    // remove any array indexes from fieldName
    const attributeFieldName = fieldName.replace(arrayIndexRegex, '');
    schemaValidationHelper.setFieldAttribute(
      attributeFieldName,
      attribute,
      value,
    );
  };
  //#endregion

  //#region validations
  const [yupValidationSchemas, setYupValidationSchemas] = useState<{
    [key: string]: any;
  }>({});
  const defaultValidationSchema = yup.mixed().notRequired() as any;

  const [fullYupValidationSchema, setFullYupValidationSchema] = useState<any>(
    defaultValidationSchema,
  );

  /**
   * Retrieves the current dynamic yup validation schema for full object
   * @returns yup schema validator
   */
  const getSingleYupValidationSchema = () => {
    return fullYupValidationSchema;
  };

  /**
   * Retrieves the current dynamic yup validation schema for given field
   * @param fieldName form field needing dynamic validation
   * @returns yup schema validator
   */
  const getYupValidationSchemaForKey = (fieldName: string) => {
    return yupValidationSchemas[fieldName]
      ? yupValidationSchemas[fieldName]
      : defaultValidationSchema;
  };

  /**
   * Sets the current dynamic yup validation schema for full object
   * @param validationSchema yup schema validator
   */
  const setSingleYupValidationSchema = (validationSchema: any) => {
    setFullYupValidationSchema(validationSchema);
  };

  /**
   * Sets the current dynamic yup validation schema for given field
   * @param fieldName form field needing dynamic validation
   * @param validationSchema yup schema validator
   */
  const setYupValidationSchemaForKey = (
    fieldName: string,
    validationSchema: any,
  ) => {
    const newSchemas = yupValidationSchemas;
    newSchemas[fieldName] = validationSchema;
    setYupValidationSchemas(newSchemas);
  };

  /**
   * Resets dynamic yup validation schema for full object
   */
  const resetSingleYupValidationSchema = () => {
    setFullYupValidationSchema(defaultValidationSchema);
  };

  /**
   * Resets dynamic yup validation schema for given field
   * @param fieldName form field needing dynamic validation reset
   */
  const resetYupValidationSchemaForKey = (fieldName: string) => {
    const newSchemas = yupValidationSchemas;
    newSchemas[fieldName] = defaultValidationSchema;
    setYupValidationSchemas(newSchemas);
  };

  /**
   * Creates a yup validation schema for given schema data
   * @param schemaData schema data starting at level of the field to validate (e.g. data.properties.values)
   * @return {*} Yup schema validation
   */
  const createSchemaYupValidator = (schemaData: any) => {
    let schemaValidations: { [key: string]: any } = {};

    if (
      schemaData &&
      schemaData.hasOwnProperty(propertiesKey) &&
      Object.keys(schemaData[propertiesKey]).length > 0
    ) {
      schemaValidations = recurseCreateYupValidation(
        schemaData[propertiesKey],
        schemaData.required,
      );
      if (Object.keys(schemaValidations).length > 0) {
        return yup.object().shape({ ...schemaValidations }) as any;
      }
    }
    return yup.mixed().notRequired() as any;
  };

  /**
   * Recursively loops thru schema to find fields which need validation
   * @param schemaData
   * @param requiredFields
   */
  const recurseCreateYupValidation = (
    schemaData: any,
    requiredFields?: string[],
  ) => {
    const isRequired = (key: string) => {
      if (requiredFields && requiredFields.includes(key)) {
        return true;
      }
      return false;
    };
    // dynamic field validations
    const fieldValidations: { [key: string]: any } = {};

    if (schemaData) {
      for (const [key, value] of Object.entries(schemaData)) {
        const valueObject = value as any;
        if (valueObject.hasOwnProperty('type')) {
          const whichType = valueObject['type'];
          switch (whichType) {
            case 'object':
              const subFieldValidations = recurseCreateYupValidation(
                valueObject[propertiesKey],
                valueObject.required,
              );
              if (Object.keys(subFieldValidations).length > 0) {
                fieldValidations[key] = yup
                  .object()
                  .shape({ ...subFieldValidations }) as any;
              }
              break;
            case 'string':
              // handle enum, format, pattern, min/max length
              if (valueObject.hasOwnProperty('enum')) {
                fieldValidations[key] = ENUM_GROUP(
                  valueObject.enum,
                  isRequired(key),
                );
                break;
              }
              if (valueObject.hasOwnProperty('format')) {
                fieldValidations[key] = dynamicRegexFormatGroup(
                  isRequired(key),
                  valueObject.format,
                );
                break;
              }
              if (valueObject.hasOwnProperty('pattern')) {
                fieldValidations[key] = REGEX_GROUP(
                  new RegExp(valueObject.pattern),
                  isRequired(key),
                  'Must match pattern: ' + valueObject.pattern,
                );
                break;
              }
              if (valueObject.hasOwnProperty('x-volume-type')) {
                fieldValidations[key] = UUID_GROUP_OPTIONS(isRequired(key));
                break;
              }
              // basic string
              fieldValidations[key] = dynamicStringGroup(
                isRequired(key),
                valueObject.minLength,
                valueObject.maxLength,
              );
              break;
            case 'boolean':
              // no validation
              break;
            case 'integer':
              fieldValidations[key] = dynamicIntegerGroup(
                isRequired(key),
                valueObject.minimum,
                valueObject.maximum,
                valueObject.exclusiveMinimum,
                valueObject.exclusiveMaximum,
              );
              break;
            case 'number':
              fieldValidations[key] = dynamicNumberGroup(
                isRequired(key),
                valueObject.minimum,
                valueObject.maximum,
                valueObject.exclusiveMinimum,
                valueObject.exclusiveMaximum,
              );
              break;
            case 'array':
              fieldValidations[key] = dynamicArrayGroup(
                isRequired(key),
                valueObject,
              );
              break;
            default:
              console.warn('  _*_*_ missed type? ' + key + ' -- ' + whichType);
            // are there other types we need to handle???
          }
        }
      }
    }
    return fieldValidations;
  };

  /**
   * Determines the dynamic YUP validation for a string field based on if it is required
   * AND optional min / max values
   * @param required Whether field is required
   * @param minLength minimum length of field value
   * @param maxLength maximum length of field value
   * @return {*} Yup field validation
   */
  const dynamicStringGroup = (
    required: boolean,
    minLength?: number,
    maxLength?: number,
  ) => {
    if (required) {
      if (minLength && maxLength) {
        return yup
          .string()
          .required(REQUIRED_ERROR)
          .min(minLength, 'There is a minimum of ' + minLength + ' characters')
          .max(maxLength, 'There is a maximum of ' + maxLength + ' characters')
          .matches(descriptionRegex, NO_SPECIAL_CHARACTERS_ERROR);
      }
      if (minLength) {
        return yup
          .string()
          .required(REQUIRED_ERROR)
          .min(minLength, 'There is a minimum of ' + minLength + ' characters')
          .matches(descriptionRegex, NO_SPECIAL_CHARACTERS_ERROR);
      }
      if (maxLength) {
        return yup
          .string()
          .required(REQUIRED_ERROR)
          .max(maxLength, 'There is a maximum of ' + maxLength + ' characters')
          .matches(descriptionRegex, NO_SPECIAL_CHARACTERS_ERROR);
      }
      return yup
        .string()
        .required(REQUIRED_ERROR)
        .matches(descriptionRegex, NO_SPECIAL_CHARACTERS_ERROR);
    } else {
      // OPTIONAL
      if (minLength && maxLength) {
        return yup.lazy((value) =>
          !value
            ? yup.string().nullable()
            : yup
                .string()
                .min(
                  minLength,
                  'There is a minimum of ' + minLength + ' characters',
                )
                .max(
                  maxLength,
                  'There is a maximum of ' + maxLength + ' characters',
                )
                .matches(descriptionRegex, NO_SPECIAL_CHARACTERS_ERROR),
        );
      }
      if (minLength) {
        return yup.lazy((value) =>
          !value
            ? yup.string().nullable()
            : yup
                .string()
                .min(
                  minLength,
                  'There is a minimum of ' + minLength + ' characters',
                )
                .matches(descriptionRegex, NO_SPECIAL_CHARACTERS_ERROR),
        );
      }
      if (maxLength) {
        return yup.lazy((value) =>
          !value
            ? yup.string().nullable()
            : yup
                .string()
                .max(
                  maxLength,
                  'There is a maximum of ' + maxLength + ' characters',
                )
                .matches(descriptionRegex, NO_SPECIAL_CHARACTERS_ERROR),
        );
      }
      return yup.lazy((value) =>
        !value
          ? yup.string().nullable()
          : yup
              .string()
              .nullable()
              .matches(descriptionRegex, NO_SPECIAL_CHARACTERS_ERROR),
      );
    }
  };

  /**
   * Determines the dynamic YUP validation for an integer field based on if it is required
   * AND optional min or exclusiveMinimum and/or max or exclusiveMaximum values
   * @param required Whether field is required
   * @param minimum minimum field value
   * @param maximum maximum field value
   * @param exclusiveMinimum Exclusive minimum field value
   * @param exclusivemaximum Exclusive maximum  field value
   * @return {*} Yup field validation
   */
  const dynamicIntegerGroup = (
    required: boolean,
    minimum?: number,
    maximum?: number,
    exclusiveMinimum?: number,
    exclusiveMaximum?: number,
  ) => {
    if (required) {
      //minimum with maximum or exclusiveMaximum or by itself
      if (minimum && maximum) {
        return yup
          .number()
          .typeError(INTEGER_ERROR)
          .required(REQUIRED_ERROR)
          .integer(INTEGER_ERROR)
          .min(minimum, 'There is a minimum value of ' + minimum)
          .max(maximum, 'There is a maximum value of ' + maximum);
      }
      if (minimum && exclusiveMaximum) {
        return yup
          .number()
          .typeError(INTEGER_ERROR)
          .required(REQUIRED_ERROR)
          .integer(INTEGER_ERROR)
          .min(minimum, 'There is a minimum value of ' + minimum)
          .lessThan(exclusiveMaximum, 'Must be less than ' + exclusiveMaximum);
      }
      if (minimum) {
        return yup
          .number()
          .typeError(INTEGER_ERROR)
          .required(REQUIRED_ERROR)
          .integer(INTEGER_ERROR)
          .min(minimum, 'There is a minimum value of ' + minimum);
      }
      //exclusiveMinimum with maximum or exclusiveMaximum or by itself
      if (exclusiveMinimum && maximum) {
        return yup
          .number()
          .typeError(INTEGER_ERROR)
          .required(REQUIRED_ERROR)
          .integer(INTEGER_ERROR)
          .moreThan(
            exclusiveMinimum,
            'Must be greater than ' + exclusiveMinimum,
          )
          .max(maximum, 'There is a maximum value of ' + maximum);
      }
      if (exclusiveMinimum && exclusiveMaximum) {
        return yup
          .number()
          .typeError(INTEGER_ERROR)
          .required(REQUIRED_ERROR)
          .integer(INTEGER_ERROR)
          .moreThan(
            exclusiveMinimum,
            'Must be greater than ' + exclusiveMinimum,
          )
          .lessThan(exclusiveMaximum, 'Must be less than ' + exclusiveMaximum);
      }
      if (exclusiveMinimum) {
        return yup
          .number()
          .typeError(INTEGER_ERROR)
          .required(REQUIRED_ERROR)
          .integer(INTEGER_ERROR)
          .moreThan(
            exclusiveMinimum,
            'Must be greater than ' + exclusiveMinimum,
          );
      }
      // maximum by itself (already tested with min or exclusive nmin)
      if (maximum) {
        return yup
          .number()
          .typeError(INTEGER_ERROR)
          .required(REQUIRED_ERROR)
          .integer(INTEGER_ERROR)
          .max(maximum, 'There is a maximum value of ' + maximum);
      }
      // excusiveMaximum by itself (already tested with min or exclusive nmin)
      if (exclusiveMaximum) {
        return yup
          .number()
          .typeError(INTEGER_ERROR)
          .required(REQUIRED_ERROR)
          .integer(INTEGER_ERROR)
          .lessThan(exclusiveMaximum, 'Must be less than ' + exclusiveMaximum);
      }
      return INTEGER_GROUP(required);
    } else {
      //minimum with maximum or exclusiveMaximum or by itself
      if (minimum && maximum) {
        return yup
          .number()
          .nullable()
          .integer(INTEGER_ERROR)
          .min(minimum, 'There is a minimum value of ' + minimum)
          .max(maximum, 'There is a maximum value of ' + maximum);
      }
      if (minimum && exclusiveMaximum) {
        return yup
          .number()
          .nullable()
          .integer(INTEGER_ERROR)
          .min(minimum, 'There is a minimum value of ' + minimum)
          .lessThan(exclusiveMaximum, 'Must be less than ' + exclusiveMaximum);
      }
      if (minimum) {
        return yup
          .number()
          .nullable()
          .integer(INTEGER_ERROR)
          .min(minimum, 'There is a minimum value of ' + minimum);
      }
      //exclusiveMinimum with maximum or exclusiveMaximum or by itself
      if (exclusiveMinimum && maximum) {
        return yup
          .number()
          .nullable()
          .integer(INTEGER_ERROR)
          .moreThan(
            exclusiveMinimum,
            'Must be greater than ' + exclusiveMinimum,
          )
          .max(maximum, 'There is a maximum value of ' + maximum);
      }
      if (exclusiveMinimum && exclusiveMaximum) {
        return yup
          .number()
          .nullable()
          .integer(INTEGER_ERROR)
          .moreThan(
            exclusiveMinimum,
            'Must be greater than ' + exclusiveMinimum,
          )
          .lessThan(exclusiveMaximum, 'Must be less than ' + exclusiveMaximum);
      }
      if (exclusiveMinimum) {
        return yup
          .number()
          .nullable()
          .integer(INTEGER_ERROR)
          .moreThan(
            exclusiveMinimum,
            'Must be greater than ' + exclusiveMinimum,
          );
      }
      // maximum by itself (already tested with min or exclusive nmin)
      if (maximum) {
        return yup
          .number()
          .nullable()
          .integer(INTEGER_ERROR)
          .max(maximum, 'There is a maximum value of ' + maximum);
      }
      // excusiveMaximum by itself (already tested with min or exclusive nmin)
      if (exclusiveMaximum) {
        return yup
          .number()
          .nullable()
          .integer(INTEGER_ERROR)
          .lessThan(exclusiveMaximum, 'Must be less than ' + exclusiveMaximum);
      }
      return INTEGER_GROUP(false);
    }
  };

  /**
   * Determines the dynamic YUP validation for a number field based on if it is required
   * AND optional min or exclusiveMinimum and/or max or exclusiveMaximum values
   * @param required Whether field is required
   * @param minimum minimum field value
   * @param maximum maximum field value
   * @param exclusiveMinimum Exclusive minimum field value
   * @param exclusivemaximum Exclusive maximum  field value
   * @return {*} Yup field validation
   */
  const dynamicNumberGroup = (
    required: boolean,
    minimum?: number,
    maximum?: number,
    exclusiveMinimum?: number,
    exclusiveMaximum?: number,
  ) => {
    if (required) {
      //minimum with maximum or exclusiveMaximum or by itself
      if (minimum && maximum) {
        return yup
          .number()
          .typeError(NUMBER_ERROR)
          .required(REQUIRED_ERROR)
          .min(minimum, 'There is a minimum value of ' + minimum)
          .max(maximum, 'There is a maximum value of ' + maximum);
      }
      if (minimum && exclusiveMaximum) {
        return yup
          .number()
          .typeError(NUMBER_ERROR)
          .required(REQUIRED_ERROR)
          .min(minimum, 'There is a minimum value of ' + minimum)
          .lessThan(exclusiveMaximum, 'Must be less than ' + exclusiveMaximum);
      }
      if (minimum) {
        return yup
          .number()
          .typeError(NUMBER_ERROR)
          .required(REQUIRED_ERROR)
          .min(minimum, 'There is a minimum value of ' + minimum);
      }
      //exclusiveMinimum with maximum or exclusiveMaximum or by itself
      if (exclusiveMinimum && maximum) {
        return yup
          .number()
          .typeError(NUMBER_ERROR)
          .required(REQUIRED_ERROR)
          .moreThan(
            exclusiveMinimum,
            'Must be greater than ' + exclusiveMinimum,
          )
          .max(maximum, 'There is a maximum value of ' + maximum);
      }
      if (exclusiveMinimum && exclusiveMaximum) {
        return yup
          .number()
          .typeError(NUMBER_ERROR)
          .required(REQUIRED_ERROR)
          .moreThan(
            exclusiveMinimum,
            'Must be greater than ' + exclusiveMinimum,
          )
          .lessThan(exclusiveMaximum, 'Must be less than ' + exclusiveMaximum);
      }
      if (exclusiveMinimum) {
        return yup
          .number()
          .typeError(NUMBER_ERROR)
          .required(REQUIRED_ERROR)
          .moreThan(
            exclusiveMinimum,
            'Must be greater than ' + exclusiveMinimum,
          );
      }
      // maximum by itself (already tested with min or exclusive nmin)
      if (maximum) {
        return yup
          .number()
          .typeError(NUMBER_ERROR)
          .required(REQUIRED_ERROR)
          .max(maximum, 'There is a maximum value of ' + maximum);
      }
      // excusiveMaximum by itself (already tested with min or exclusive nmin)
      if (exclusiveMaximum) {
        return yup
          .number()
          .typeError(NUMBER_ERROR)
          .required(REQUIRED_ERROR)
          .lessThan(exclusiveMaximum, 'Must be less than ' + exclusiveMaximum);
      }
      return NUMBER_GROUP(required);
    } else {
      //minimum with maximum or exclusiveMaximum or by itself
      if (minimum && maximum) {
        return yup
          .number()
          .nullable()
          .typeError(NUMBER_ERROR)
          .min(minimum, 'There is a minimum value of ' + minimum)
          .max(maximum, 'There is a maximum value of ' + maximum);
      }
      if (minimum && exclusiveMaximum) {
        return yup
          .number()
          .nullable()
          .typeError(NUMBER_ERROR)
          .min(minimum, 'There is a minimum value of ' + minimum)
          .lessThan(exclusiveMaximum, 'Must be less than ' + exclusiveMaximum);
      }
      if (minimum) {
        return yup
          .number()
          .nullable()
          .typeError(NUMBER_ERROR)
          .min(minimum, 'There is a minimum value of ' + minimum);
      }
      //exclusiveMinimum with maximum or exclusiveMaximum or by itself
      if (exclusiveMinimum && maximum) {
        return yup
          .number()
          .nullable()
          .typeError(NUMBER_ERROR)
          .moreThan(
            exclusiveMinimum,
            'Must be greater than ' + exclusiveMinimum,
          )
          .max(maximum, 'There is a maximum value of ' + maximum);
      }
      if (exclusiveMinimum && exclusiveMaximum) {
        return yup
          .number()
          .nullable()
          .typeError(NUMBER_ERROR)
          .moreThan(
            exclusiveMinimum,
            'Must be greater than ' + exclusiveMinimum,
          )
          .lessThan(exclusiveMaximum, 'Must be less than ' + exclusiveMaximum);
      }
      if (exclusiveMinimum) {
        return yup
          .number()
          .nullable()
          .typeError(NUMBER_ERROR)
          .moreThan(
            exclusiveMinimum,
            'Must be greater than ' + exclusiveMinimum,
          );
      }
      // maximum by itself (already tested with min or exclusive nmin)
      if (maximum) {
        return yup
          .number()
          .nullable()
          .typeError(NUMBER_ERROR)
          .max(maximum, 'There is a maximum value of ' + maximum);
      }
      // excusiveMaximum by itself (already tested with min or exclusive nmin)
      if (exclusiveMaximum) {
        return yup
          .number()
          .nullable()
          .typeError(NUMBER_ERROR)
          .lessThan(exclusiveMaximum, 'Must be less than ' + exclusiveMaximum);
      }
      return NUMBER_GROUP(required);
    }
  };

  /**
   * Determines the dynamic YUP validation for a regex field based on if it is required
   * @param required Whether field is required
   * @param format regular expression string
   * @return {*} Yup field validation
   */
  const dynamicRegexFormatGroup = (required: boolean, format: string) => {
    switch (format) {
      case 'date':
        return REGEX_GROUP(
          dateYYYYMMDDRegex,
          required,
          'Must match date format of YYYY-MM-DD',
        );
      case 'email':
        return REGEX_GROUP(
          emailRegex,
          required,
          'Must be a valid email address',
        );
      case 'hostname':
        return REGEX_GROUP(
          internetHostNameRegex,
          required,
          'Must be a valid host name',
        );
      case 'ipv4':
        return REGEX_GROUP(ipv4Regex, required, 'Invalid IPv4 Address');
      case 'ipv6':
        return REGEX_GROUP(ipv6Regex, required, 'Invalid IPv6 Address');
      case 'time':
        return REGEX_GROUP(
          timeHHMMSSRegex,
          required,
          'Must match time format of HH:MM:SS',
        );
      case 'uri':
        return REGEX_GROUP(uriRegex, required, 'Must be a valid URI');
      case 'uuid':
        return REGEX_GROUP(uuidRegex, required, 'Must be a valid UUID');
      default:
        console.warn(
          '** unhandled dynamic "format" field ' + ' format: ' + format,
        );
        return required ? REQUIRED_ENTRY : yup.string().nullable();
    }
  };

  /**
   * Determines the dynamic YUP validation for an field based on if it is required
   * AND items type, min/maxItems, uniqueItems (all contained in the valueObject of the array field)
   * @param required Whether field is required
   * @param valueObject Array field schema value object
   * @return {*} Yup field validation
   */
  const dynamicArrayGroup = (required: boolean, valueObject: any) => {
    const items = valueObject.items;
    let itemsValidation: yup.AnySchema = yup.mixed().nullable();

    switch (items.type) {
      case 'string':
        if (items.hasOwnProperty('enum')) {
          itemsValidation = ENUM_GROUP(items.enum, true);
          break;
        }
        if (items.hasOwnProperty('format')) {
          itemsValidation = dynamicRegexFormatGroup(true, items.format);
          break;
        }
        if (items.hasOwnProperty('pattern')) {
          itemsValidation = REGEX_GROUP(
            new RegExp(items.pattern),
            true,
            'Must match pattern: ' + items.pattern,
          );
          break;
        }
        // basic string
        itemsValidation = dynamicStringGroup(
          true,
          items.minLength,
          items.maxLength,
        ) as yup.AnySchema;
        break;
      case 'integer':
        itemsValidation = dynamicIntegerGroup(
          true,
          items.minimum,
          items.maximum,
          items.exclusiveMinimum,
          items.exclusiveMaximum,
        ) as yup.AnySchema;
        break;
      case 'number':
        itemsValidation = dynamicNumberGroup(
          true,
          items.minimum,
          items.maximum,
          items.exclusiveMinimum,
          items.exclusiveMaximum,
        ) as yup.AnySchema;
        break;
      case 'object':
        const subFieldValidations = recurseCreateYupValidation(
          items[propertiesKey],
          items['required'],
        );
        if (Object.keys(subFieldValidations).length > 0) {
          itemsValidation = yup
            .object()
            .shape({ ...subFieldValidations }) as any;
        }
        break;
      default:
        console.warn('  *** missing array item type? ' + items.type);
    }
    const minItems = valueObject['minItems'];
    const maxItems = valueObject['maxItems'];
    const uniqueItems = valueObject['uniqueItems'];

    if (required) {
      // always a minimum of at least one
      const reqMinItems = minItems || 1;
      if (uniqueItems === true) {
        // unique with maximum and required minimum or with required minimum
        if (maxItems) {
          return yup
            .array()
            .test('unique', 'Values must be unique', (values) => {
              return new Set(values).size === (values ? values.length : 0);
            })
            .min(
              reqMinItems,
              'There is a minimum of ' + reqMinItems + ' entries',
            )
            .max(maxItems, 'There is a maximum of ' + maxItems + ' entries')
            .of(itemsValidation);
        }
        return yup
          .array()
          .test('unique', 'Values must be unique', (values) => {
            return new Set(values).size === (values ? values.length : 0);
          })
          .min(reqMinItems, 'There is a minimum of ' + reqMinItems + ' entries')
          .of(itemsValidation);
      }
      // maximum with required minimum or minimum by itself
      if (maxItems) {
        return yup
          .array()
          .min(reqMinItems, 'There is a minimum of ' + reqMinItems + ' entries')
          .max(maxItems, 'There is a maximum of ' + maxItems + ' entries')
          .of(itemsValidation);
      }
      return yup
        .array()
        .min(reqMinItems, 'There is a minimum of ' + reqMinItems + ' entries')
        .of(itemsValidation);
    } else {
      if (uniqueItems === true) {
        // unique with maximum and minimum or with maximum or with minimum or by itself
        if (minItems && maxItems) {
          return yup
            .array()
            .test('unique', 'Values must be unique', (values) => {
              return new Set(values).size === (values ? values.length : 0);
            })
            .min(minItems, 'There is a minimum of ' + maxItems + ' entries')
            .max(maxItems, 'There is a maximum of ' + maxItems + ' entries')
            .of(itemsValidation);
        }
        if (maxItems) {
          return yup
            .array()
            .test('unique', 'Values must be unique', (values) => {
              return new Set(values).size === (values ? values.length : 0);
            })
            .max(maxItems, 'There is a maximum of ' + maxItems + ' entries')
            .of(itemsValidation);
        }
        if (minItems) {
          return yup
            .array()
            .test('unique', 'Values must be unique', (values) => {
              return new Set(values).size === (values ? values.length : 0);
            })
            .min(minItems, 'There is a minimum of ' + maxItems + ' entries')
            .of(itemsValidation);
        }
        return yup
          .array()
          .test('unique', 'Values must be unique', (values) => {
            return new Set(values).size === (values ? values.length : 0);
          })
          .of(itemsValidation);
      }
      // maximum with minimum or max/min by itself or just optional
      if (minItems && maxItems) {
        return yup
          .array()
          .min(minItems, 'There is a minimum of ' + maxItems + ' entries')
          .max(maxItems, 'There is a maximum of ' + maxItems + ' entries')
          .of(itemsValidation);
      }
      if (maxItems) {
        return yup
          .array()
          .max(maxItems, 'There is a maximum of ' + maxItems + ' entries')
          .of(itemsValidation);
      }
      if (minItems) {
        return yup
          .array()
          .min(minItems, 'There is a minimum of ' + maxItems + ' entries')
          .of(itemsValidation);
      }
      return yup.array().of(itemsValidation);
    }
  };
  //#endregion

  //#region ignore fields -- don't include these in dynamic fields
  const [ignoreFields, setIgnoreFields] = useState<string[]>([]);

  const setFieldsToIgnore = (fieldsToIgnore: string[]) => {
    setIgnoreFields(fieldsToIgnore);
  };

  const shouldIgnoreField = (fieldName: string) => {
    return ignoreFields.includes(fieldName);
  };
  //#endregion

  return (
    <DynamicPropertyContext.Provider
      value={{
        crudType,
        isPickerButtonVisible:
          isPickerEnabled && crudType !== FormCrudType.view,
        getFieldAttribute,
        setFieldAttribute,
        createSchemaYupValidator,
        resetSingleYupValidationSchema,
        resetYupValidationSchemaForKey,
        getSingleYupValidationSchema,
        getYupValidationSchemaForKey,
        setSingleYupValidationSchema,
        setYupValidationSchemaForKey,
        setFieldsToIgnore,
        shouldIgnoreField,
      }}
    >
      {children}
    </DynamicPropertyContext.Provider>
  );
};
