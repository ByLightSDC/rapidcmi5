/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
/* eslint-disable no-prototype-builtins */

/*
Displays dynamic form fields based on properties contained in schema property passed in
There is one special property named x-volume-type
Where this appears, the UI displays a volume selector
*/
import React, { useContext, useEffect, useState } from 'react';
import { FieldValues } from 'react-hook-form';

/* Branded */
import {
  debugLog,
  DynamicSelectorFieldGroup,
  FormControlCheckboxField,
  FormControlFloatField,
  FormControlIntegerField,
  FormControlSelectField,
  FormControlTextField,
  FormControlTimeField,
  FormControlUIContext,
  FormCrudType,
  FormFieldArray,
  LoadingUi,
  ReadOnlyTextField,
  tFormFieldRendererProps,
  useDisplayFocus,
  ViewExpander,
} from '@rangeos-nx/ui/branded';

/* MUI */
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

/* Form */
import {
  DynamicPropertyContext,
  propertiesKey,
} from './DynamicPropertyContext';

/* API */
import {
  useGetRangeVolume,
  queryKeyRangeVolumes,
} from '@rangeos-nx/ui/api/hooks';

import { xReplaceTimeFields } from './constants';

/* Constants */
import { AttributeProperty, keyDelim } from '@rangeos-nx/ui/redux';

const TopicDPVolume = 'DPVolume';
const TopicRoutesDPVolume = '/templates/volumes';
const fieldTypeVolumePicker = 'volume_picker';
const showExpandIndToLevel = 1;
// allow field to grow to cover large variables (such as ansible role config variable which can be hundreds of lines long)
const maxDynamicFieldRows = 1000;

/**
 * @typedef {Object} tDynamicPropertyFieldsProps
 * @property {any} errors Form errors
 * @property {boolean} [isModal] Whether form is presented in a modal
 * @property {boolean} [isValid] React hook form valid indicator
 * @property {object} properties dynamic schema
 * @property {string} [valuesFieldName] nested field in form data where property values are sourced from
 */
type tDynamicPropertyFieldsProps = {
  errors: any;
  isModal?: boolean;
  isValid?: boolean;
  properties: object;
  valuesFieldName?: string; // property values are sourced from this react-hook-form field
};

interface LooseObject {
  [key: string]: any;
}

/**
 * Dynamic Property Fields
 * Handles processing of dynamic schema properties within the context of a react-hook-form
 * NOTE: Parent Form must be defined within FormProvider AND DynamicPropertyProvider
 *  so that the form context methods can be used here without passing through multiple layers
 * @param {tDynamicPropertyFieldsProps} props Component props
 * @returns {React.ReactElement}
 */
export default function DynamicPropertyFormFields(
  props: tDynamicPropertyFieldsProps,
) {
  const {
    errors,
    isModal = false,
    isValid,
    properties,
    valuesFieldName, // react-hook-form-data value
  } = props;

  const { formMethods } = useContext(FormControlUIContext);
  const { getValues, setValue } = formMethods;
  const { setFieldAttribute } = useContext(DynamicPropertyContext);

  let formValues: FieldValues;
  if (valuesFieldName === undefined) {
    formValues = getValues();
  } else {
    formValues = getValues(valuesFieldName);
  }

  const [isParsing, setIsParsing] = useState(true);

  //#region recursion
  /**
   * Build Values and Required Fields Objects
   * @param {string} prefix Current prefix to prepend to "field" (e.g., values)
   * @param {LooseObject} fieldValues current set of fields determined
   * @param {LooseObject} insertAt fields determined at current level of recursion
   * @param {LooseObject}fieldProps Properties for current level of recursion
   * @param {LooseObject} currentValues Current form data values
   */
  const recurseProperties = (
    prefix: string,
    fieldValues: LooseObject,
    insertAt: LooseObject,
    fieldProps: LooseObject,
    currentValues?: LooseObject,
  ) => {
    for (const [key, value] of Object.entries(fieldProps)) {
      //console.log(`${key}: ${value}`);

      switch (key) {
        // these schema keys do not need to be handled separately here for setting up the properties
        case '$schema':
        case 'default': // default value handled when adding actual field
        case 'description': // displayed with info text for actual field
        case 'const': // handled at parent level
        case 'enum': // handled at parent level
        case 'examples': // displayed with info text for actual field
        case 'format': // need to handle this in rendering (e.g. type: string, format: ipv4)
        case 'minItems':
        case 'maxItems':
        case 'uniqueItems':
        case 'minimum':
        case 'maximum':
        case 'exclusiveMinimum':
        case 'exclusiveMaximum':
        case 'maxLength': // need to handle this in rendering (e.g. type: string, maxLength: 10)
        case 'minLength': // need to handle this in rendering (e.g. type: string, minLength: 3)
        case 'pattern': // need to handle this in rendering (e.g. type: string, pattern: \some regex pattern\)
        case 'title':
        case 'type':
        case 'x-replace': // special case for dynamic variable overrides
        case 'x-volume-type': // special case for range volume filtering
          break;
        case 'required':
          const requiredItems = value as string[];
          if (requiredItems.length > 0) {
            requiredItems.forEach((item) => {
              setFieldAttribute(
                (prefix ? prefix + keyDelim : '') + item,
                AttributeProperty.Required,
                true,
              );
            });
          }
          break;
        case 'readOnly':
          setFieldAttribute(prefix, AttributeProperty.ReadOnly, true);
          break;
        case 'deprecated':
          setFieldAttribute(prefix, AttributeProperty.Deprecated, true);
          break;
        case 'writeOnly':
          setFieldAttribute(prefix, AttributeProperty.WriteOnly, true);
          break;
        case 'items': // need to traverse array properties to determine any required items...
          recurseProperties(
            prefix, // really just the array
            fieldValues,
            insertAt,
            value,
            currentValues, // now going to look at the individual properties of this item
          );
          break;
        case propertiesKey:
          // prefix does not change here - just looking at properties of "current item"
          recurseProperties(
            prefix,
            fieldValues,
            insertAt,
            value,
            currentValues, // now going to look at the individual properties of this item
          );
          break;
        default:
          //console.log(`Add ${key}: ${value}`);
          if (insertAt) {
            if (value.hasOwnProperty('enum')) {
              // for enums - initialize to current value if it exists OR defualt value from schema OR first option
              const currentValue = currentValues ? currentValues[key] : null;
              if (currentValue) {
                insertAt[key] = currentValue;
              } else if (value.default) {
                insertAt[key] = value.default;
              } else {
                const options = value.enum;
                if (options.length > 0) {
                  insertAt[key] = options[0];
                } else {
                  insertAt[key] = '';
                }
              }
            } else if (value.hasOwnProperty('const')) {
              // read only constant value
              insertAt[key] = value.const;
            } else if (value.hasOwnProperty('type')) {
              const whichType = value['type'];
              if (whichType === 'object') {
                const insertObj: LooseObject = {};
                insertAt[key] = insertObj;
              } else {
                // initialize to current value if it exists OR default value from schema OR "empty" based on type
                const currentValue = currentValues ? currentValues[key] : null;
                if (currentValue) {
                  insertAt[key] = currentValue;
                } else if (value.default) {
                  insertAt[key] = value.default;
                } else {
                  switch (whichType) {
                    case 'string':
                      insertAt[key] = '';
                      break;
                    case 'boolean':
                      // needs to be defaulted so that UI makes sense even if the user doesn't set it
                      insertAt[key] = false;
                      break;
                    case 'integer':
                    case 'number':
                      insertAt[key] = undefined;
                      break;
                    default:
                      insertAt[key] = null;
                      break;
                  }
                }
              }
            } else {
              // property not handled - ignore
              debugLog(
                '--- dynamic schema property not processed ' + key,
                value,
              );
            }
            recurseProperties(
              prefix ? prefix + keyDelim + key : key,
              fieldValues,
              insertAt[key],
              value,
              currentValues ? currentValues[key] : null,
            );
          }

          break;
      }
    }
  };

  useEffect(() => {
    // only want to do this once - NOT when fieldValues change
    //there may be default values to show from previously filled out form
    // since it be a "subset" of all the fields still need to recurse
    // and just substitute in the current value(s)

    const newFieldValues = {};

    recurseProperties(
      valuesFieldName ?? '',
      newFieldValues,
      newFieldValues,
      properties,
      formValues,
    );
    if (valuesFieldName !== undefined) {
      setValue(valuesFieldName, newFieldValues);
    } else {
      // set the top property values into the form
      for (const [key, value] of Object.entries(newFieldValues)) {
        setValue(key, value);
      }
    }

    setIsParsing(false);
  }, []);
  //#endregion

  return (
    //test for loading OR display elements requires empty react element to wrap
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isParsing ? (
        <LoadingUi />
      ) : (
        <DPRoot
          meta={{ isModal: isModal, isValid: isValid }}
          name=""
          fieldName={valuesFieldName}
          properties={properties} //at top level: this is schema data
          fieldErrors={errors}
        />
      )}
    </>
  );
}

/**
 * Processes a level of data
 * @param {string} name key being processed
 * @param {LooseObject} properties Properties of item being processed
 * @param {string} [fieldName] Dotted Notation field name being processed
 * @param {number} [level] Current level of data being processed - used for indentation of fields
 * @prop {any} fieldErrors React hook form error(s) for this field
 * @param {LooseObject} [meta] any meta data that needs to be passed down
 * @returns {JSX.Element}
 */
function DPRoot({
  name,
  properties,
  fieldName = '',
  level = -1,
  fieldErrors,
  meta,
}: {
  name: string;
  properties: LooseObject;
  fieldName?: string;
  level?: number;
  fieldErrors?: any;
  meta?: LooseObject;
}): JSX.Element {
  level++;

  //Special Volume Picker
  const isSpecialVolumePicker = properties.hasOwnProperty('x-volume-type');
  const volumeTypeFilter = properties['x-volume-type'];

  if (isSpecialVolumePicker) {
    return (
      <DPComponent
        fieldName={fieldName}
        level={level}
        name={name}
        fieldErrors={fieldErrors}
        fieldType={fieldTypeVolumePicker}
        fieldProperties={properties}
        meta={{
          filters: { volumeType: volumeTypeFilter },
          key: name,
          ...meta,
        }}
      />
    );
  }

  // Handle Enum
  const isEnum = properties.hasOwnProperty('enum');
  if (isEnum) {
    const options = properties['enum'];
    return (
      <DPComponent
        fieldName={fieldName}
        level={level}
        name={name}
        fieldErrors={fieldErrors}
        fieldType="enum"
        fieldProperties={properties}
        meta={{
          ...meta,
          options: options,
        }}
      />
    );
  }

  // Handle constant
  const isConstant = properties.hasOwnProperty('const');
  if (isConstant) {
    return (
      <DPComponent
        fieldName={fieldName}
        level={level}
        name={name}
        fieldErrors={fieldErrors}
        fieldType="const"
        fieldProperties={properties}
      />
    );
  }

  // Handle by type
  if (properties.hasOwnProperty('type')) {
    const fieldType = properties['type'];

    switch (fieldType) {
      case 'object': // recurse
        return (
          <div key={'div' + fieldName}>
            <DPProperties
              fieldName={fieldName}
              level={level}
              // fieldErrors={fieldErrors}
              fieldErrors={
                fieldErrors ? (name ? fieldErrors[name] : fieldErrors) : null
              }
              meta={{
                ...meta,
              }}
              properties={properties[propertiesKey]}
            />
          </div>
        );
      default:
        // other field types
        return (
          <div key={'div-' + fieldName}>
            <DPComponent
              fieldName={fieldName}
              level={level}
              meta={{
                ...meta,
              }}
              name={name}
              fieldErrors={fieldErrors}
              fieldType={properties['type']}
              fieldProperties={properties}
            />
          </div>
        );
    }
  }
  // returning empty fragment when there is nothing to process - key is so that it's unique
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <React.Fragment key={fieldName}></React.Fragment>;
}

/**
 * Processes Properties of a schema entry
 * @param {string} fieldName Dotted Notation field name being processed
 * @param {number} level Current level of data being processed - used for indentation of fields
 * @prop {any} fieldErrors React hook form error(s) for this field
 * @param {LooseObject} [meta] any meta data that needs to be passed down
 * @param {LooseObject} properties Properties of item being processed
 * @returns {JSX.Element}
 */
function DPProperties({
  fieldName,
  level,
  fieldErrors,
  meta,
  properties,
}: {
  fieldName: string;
  level: number;
  fieldErrors: any;
  meta?: LooseObject;
  properties: object;
}): JSX.Element {
  const { isPickerButtonVisible, shouldIgnoreField } = useContext(
    DynamicPropertyContext,
  );

  // Expandable area should be used when item has properties
  // - at top level
  // - more than one element at lower level
  const shouldBeExpandable = (value: any) => {
    if (propertiesKey in value) {
      if (level === 0) {
        return true;
      }
      if (
        level <= showExpandIndToLevel &&
        Object.keys(value[propertiesKey]).length > 1
      ) {
        return true;
      }
    }
    return false;
  };

  // indent the header and size icon based on level
  const headerSxProps = { marginLeft: level * 24 + 'px' };
  const iconSxProps = level > 0 ? { fontSize: 'medium' } : {};

  return (
    <>
      {Object.entries(properties).map(([key, value], index: number) => {
        if (shouldIgnoreField(key)) {
          // returning empty fragment when there is nothing to process - key is so that it's unique
          return <React.Fragment key={fieldName + index}></React.Fragment>;
        }
        const title = value.hasOwnProperty('title') ? value['title'] : key;

        return (
          <div key={fieldName + index}>
            {shouldBeExpandable(value) ? (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {(isPickerButtonVisible || key !== 'rangeVolumes') && (
                  <div style={{ width: '98%' }}>
                    <ViewExpander
                      title={title}
                      headerSxProps={headerSxProps}
                      iconSxProps={iconSxProps}
                    >
                      <DPRoot
                        properties={value}
                        fieldName={
                          fieldName.length === 0
                            ? key
                            : fieldName + keyDelim + key
                        }
                        level={level}
                        fieldErrors={fieldErrors}
                        meta={meta}
                        name={key}
                      />
                    </ViewExpander>
                  </div>
                )}
              </>
            ) : (
              <>
                {/*Dont render property name when it contains a component*/}
                {propertiesKey in value && (
                  <Typography
                    key={fieldName + index}
                    sx={{ paddingLeft: level * 2 }}
                    variant="h5"
                  >
                    {/*  {key} indent={level} fieldName={fieldName + '_' + key}*/}
                    {title}
                  </Typography>
                )}

                {/*Type and Properties keys have special meaning. All other property names should recurse*/}
                {key !== 'type' && (
                  <DPRoot
                    properties={value}
                    fieldName={
                      fieldName.length === 0 ? key : fieldName + keyDelim + key
                    }
                    level={level}
                    fieldErrors={fieldErrors}
                    meta={meta}
                    name={key}
                  />
                )}
              </>
            )}
          </div>
        );
      })}
    </>
  );
}

/**
 * Processes an actual schema field component
 * @param {string} fieldName Dotted Notation field name being processed
 * @param {number} level Current level of data being processed - used for indentation of fields
 * @param {string} name Name of the field
 * @prop {any} fieldErrors React hook form error(s) for this field
 * @param {string} fieldType Type of field to process
 * @param {LooseObject} [fieldProperties] Properties of field being processed
 * @param {LooseObject} [meta] Any meta data that needs to be passed down
 * @returns {JSX.Element}
 */
function DPComponent({
  fieldName,
  level,
  name,
  fieldErrors,
  fieldType,
  fieldProperties,
  meta,
}: {
  fieldName: string;
  level: number;
  name: string;
  fieldErrors: any;
  fieldType: string;
  fieldProperties?: LooseObject;
  meta?: LooseObject;
}): JSX.Element {
  if (fieldType === 'array') {
    return (
      <DPArrayField
        fieldName={fieldName}
        fieldErrors={fieldErrors}
        fieldProperties={fieldProperties}
        level={level}
        name={name}
        meta={meta}
      />
    );
  }
  return (
    <DPFormField
      fieldName={fieldName}
      fieldErrors={fieldErrors ? fieldErrors[name] : null}
      fieldType={fieldType}
      fieldProperties={fieldProperties}
      level={level}
      name={name}
      meta={meta}
    />
  );
}

/**
 * Handles non-array field component
 * @param {string} fieldName Dotted Notation field name being processed
 * @param {any} fieldErrors React hook form error(s) for this field
 * @param {string} fieldType Type of field to process
 * @param {LooseObject} [fieldProperties] Properties of field being processed
 * @param {number} level Current level of data being processed - used for indentation of fields
 * @param {string} name Name of the field
 * @param {LooseObject} [meta] Any meta data that needs to be passed down
 * @returns {JSX.Element}
 */
function DPFormField({
  fieldName,
  fieldErrors,
  fieldType,
  fieldProperties,
  level,
  name,
  meta,
}: {
  fieldName: string;
  fieldErrors: any;
  fieldType: string;
  fieldProperties?: LooseObject;
  level: number;
  name: string;
  meta?: LooseObject;
}): JSX.Element {
  const { crudType, getFieldAttribute, isPickerButtonVisible } = useContext(
    DynamicPropertyContext,
  );
  const { formMethods } = useContext(FormControlUIContext);
  const { control, setValue, trigger, watch } = formMethods;

  //#region prop info for child components
  const required = getFieldAttribute(fieldName, AttributeProperty.Required);
  const readOnly =
    crudType === FormCrudType.view ||
    getFieldAttribute(fieldName, AttributeProperty.ReadOnly);
  const isDeprecated = getFieldAttribute(
    fieldName,
    AttributeProperty.Deprecated,
  );
  const isWriteOnly = getFieldAttribute(fieldName, AttributeProperty.WriteOnly);
  const fieldLabel =
    (fieldProperties && fieldProperties.hasOwnProperty('title')
      ? fieldProperties['title']
      : name) +
    (isDeprecated ? ' (deprecated)' : isWriteOnly ? ' (writeOnly)' : '');

  const enumOptions = meta ? meta['options'] : [];

  const textFieldSxProps = {
    marginLeft: level * 2,
    width: '90%',
  };

  const sharedFormProps = {
    control: control,
    crudType: crudType,
    isModal: meta ? meta['isModal'] : false,
    isValid: meta ? meta['isValid'] : false,
    readOnly: readOnly,
    required: required,
    watch: watch,
    setValue: setValue,
    trigger: trigger,
  };
  // #endregion

  /**
   * Returns info text string for a field containing
   *  description and any examples
   * @param fieldProperties
   * @returns string
   */
  const getInfoText = (fieldProperties?: LooseObject) => {
    if (
      fieldProperties?.hasOwnProperty('examples') &&
      fieldProperties['examples'].length > 0
    ) {
      const examples = fieldProperties['examples'];
      return (
        <div>
          {fieldProperties?.hasOwnProperty('description') &&
            fieldProperties['description']}
          <br />
          {examples.length === 1 && (
            <>
              <strong>Example&nbsp;&nbsp;</strong>
              <i>{examples[0]}</i>
            </>
          )}
          {examples.length > 1 && (
            <>
              <strong>Examples</strong>
              {/* listing on separate lines because a string value might have its own comma in it */}
              {examples.map((example: string) => (
                <>
                  <br />
                  &nbsp;&nbsp;
                  <i>{example}</i>
                </>
              ))}
            </>
          )}
        </div>
      );
    }

    if (fieldProperties?.hasOwnProperty('description')) {
      return fieldProperties['description'];
    }
    return '';
  };

  if (fieldType === 'string') {
    const formattedString = Boolean(
      fieldProperties && fieldProperties.hasOwnProperty('format'),
    );

    const isTimeFormatString = Boolean(
      fieldProperties &&
        formattedString &&
        fieldProperties['format'] === 'time',
    );
    const isReplaceTimeString = Boolean(
      fieldProperties &&
        fieldProperties.hasOwnProperty('x-replace') &&
        xReplaceTimeFields.includes(fieldProperties['x-replace']),
    );
    if (isTimeFormatString || isReplaceTimeString) {
      return (
        <FormControlTimeField
          error={Boolean(fieldErrors)}
          helperText={fieldErrors ? fieldErrors.message : ''}
          infoText={getInfoText(fieldProperties)}
          name={fieldName}
          label={fieldLabel}
          sxProps={textFieldSxProps}
          {...sharedFormProps}
        />
      );
    }

    return (
      <FormControlTextField
        error={Boolean(fieldErrors)}
        helperText={fieldErrors ? fieldErrors.message : ''}
        infoText={getInfoText(fieldProperties)}
        name={fieldName}
        label={fieldLabel}
        minRows={1}
        maxRows={maxDynamicFieldRows}
        multiline={!formattedString}
        sxProps={textFieldSxProps}
        {...sharedFormProps}
      />
    );
  }

  return (
    <>
      {fieldType === 'integer' && (
        <FormControlIntegerField
          error={Boolean(fieldErrors)}
          helperText={fieldErrors ? fieldErrors.message : ''}
          infoText={getInfoText(fieldProperties)}
          name={fieldName}
          label={fieldLabel}
          sxProps={textFieldSxProps}
          {...sharedFormProps}
        />
      )}
      {fieldType === 'number' && (
        <FormControlFloatField
          error={Boolean(fieldErrors)}
          helperText={fieldErrors ? fieldErrors.message : ''}
          infoText={getInfoText(fieldProperties)}
          name={fieldName}
          label={fieldLabel}
          sxProps={textFieldSxProps}
          {...sharedFormProps}
        />
      )}
      {fieldType === 'boolean' && (
        <FormControlCheckboxField
          control={control}
          infoText={getInfoText(fieldProperties)}
          name={fieldName}
          label={fieldLabel}
          boxSxProps={{ marginLeft: level * 2 }}
          checkboxProps={{ disabled: readOnly }}
        />
      )}
      {fieldType === 'enum' && (
        <div style={{ width: '300px' }}>
          <FormControlSelectField
            error={Boolean(fieldErrors)}
            helperText={fieldErrors ? fieldErrors.message : ''}
            infoText={getInfoText(fieldProperties)}
            name={fieldName}
            label={fieldLabel}
            sxProps={textFieldSxProps}
            {...sharedFormProps}
          >
            {enumOptions.map((item: any) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </FormControlSelectField>
        </div>
      )}
      {fieldType === 'const' && (
        <ReadOnlyTextField
          fieldName={fieldName}
          fieldLabel={fieldLabel}
          fieldValue={
            fieldProperties?.hasOwnProperty('const')
              ? fieldProperties['const']
              : ''
          }
          fieldInfo={getInfoText(fieldProperties)}
          sxProps={textFieldSxProps}
          props={{ fullWidth: true, disabled: true }}
        />
      )}
      {fieldType === 'null' && (
        <ReadOnlyTextField
          fieldName={fieldName}
          fieldLabel={fieldLabel}
          fieldValue="null"
          fieldInfo={getInfoText(fieldProperties)}
          sxProps={textFieldSxProps}
          props={{ fullWidth: true, disabled: true }}
        />
      )}
      {fieldType === fieldTypeVolumePicker && (
        // need fragment to do nested test for pickerbutton...
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {isPickerButtonVisible ? (
            <Grid
              item
              xs={11}
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                marginLeft: level * 2,
                marginTop: '8px', //not sure why this doesnt match the other properties, but this is needed
              }}
            >
              <DynamicSelectorFieldGroup
                crudType={crudType}
                itemLabel={fieldLabel}
                formProps={{
                  formMethods,
                  fieldName: fieldName,
                  indexedArrayField: fieldName,
                  indexedErrors: fieldErrors,
                  isModal: sharedFormProps.isModal,
                  isValid: sharedFormProps.isValid,
                  placeholder: '',
                  readOnly: crudType === FormCrudType.view,
                }}
                allowClear={true}
                apiHook={useGetRangeVolume}
                inspectorProps={{
                  editRoute: TopicRoutesDPVolume,
                }}
                selectionFilters={meta ? meta['filters'] : undefined}
                selectionTargetId={TopicDPVolume}
                shouldApplySelections={true}
                shouldShowButtonText={false}
                shouldShowLabelText={true}
                queryKey={queryKeyRangeVolumes}
                textFieldProps={{
                  disabled: crudType === FormCrudType.view,
                  required: required,
                }}
                topicId={TopicDPVolume}
              />
            </Grid>
          ) : null}
        </>
      )}
    </>
  );
}

/**
 * Handles an Array Field entry
 * @param {string} fieldName Dotted Notation field name being processed
 * @prop {any} fieldErrors React hook form error(s) for this field
 * @param {LooseObject} [fieldProperties] Properties of field being processed
 * @param {number} level Current level of data being processed - used for indentation of fields
 * @param {string} name Name of the field
 * @param {LooseObject} [meta] Any meta data that needs to be passed down
 * @returns {JSX.Element}
 */
function DPArrayField({
  fieldName,
  fieldErrors,
  fieldProperties,
  level,
  name,
  meta,
}: {
  fieldName: string;
  fieldErrors: any;
  fieldProperties?: LooseObject;
  level: number;
  name: string;
  meta?: LooseObject;
}): JSX.Element {
  const { crudType, getFieldAttribute, setFieldAttribute } = useContext(
    DynamicPropertyContext,
  );
  const { formMethods } = useContext(FormControlUIContext);
  const { watch } = formMethods;
  const watchValue = watch(fieldName);

  const readOnly =
    crudType === FormCrudType.view ||
    getFieldAttribute(fieldName, AttributeProperty.ReadOnly);
  const isDeprecated = getFieldAttribute(
    fieldName,
    AttributeProperty.Deprecated,
  );
  const isWriteOnly = getFieldAttribute(fieldName, AttributeProperty.WriteOnly);
  const fieldLabel =
    (fieldProperties && fieldProperties.hasOwnProperty('title')
      ? fieldProperties['title']
      : name) +
    (isDeprecated ? ' (deprecated)' : isWriteOnly ? ' (writeOnly)' : '');

  useEffect(() => {
    // handle required array child fields - for disabling submit
    if (watchValue && watchValue.length > 0) {
      // for arrays - the children are required if array is
      //TMP this assumes simple string arrays - revisit when we add functionality for arrays of objects (later ticket)
      for (let i = 0; i < watchValue.length; i++) {
        setFieldAttribute(
          fieldName + '[' + i + ']',
          AttributeProperty.Required,
          true,
        );
      }
    }
  }, [watchValue]);

  const arrayFieldSxProps = {
    marginLeft: (level + 1) * 8, // so array will indent under parent (values)
    width: '90%',
  };

  const arrayItemProperties = fieldProperties ? fieldProperties['items'] : null;
  // info text for array is either description on array itself
  // OR description on "simple item" (e.g., string, number, enum...)
  // OR ''
  const arrayInfoText = fieldProperties?.hasOwnProperty('description')
    ? fieldProperties['description']
    : arrayItemProperties?.hasOwnProperty('type') &&
        arrayItemProperties.type !== 'object' &&
        arrayItemProperties.hasOwnProperty('description')
      ? arrayItemProperties['description']
      : '';

  // for array "objects" need to default the value to an object
  const defaultValues = arrayItemProperties['type'] === 'object' ? {} : '';

  return (
    <div style={arrayFieldSxProps}>
      <FormFieldArray
        errors={fieldErrors}
        formMethods={formMethods}
        arrayFieldName={fieldName}
        arrayRenderItem={(props: tFormFieldRendererProps) => {
          return (
            <DPArrayRenderItem
              level={level}
              arrayItemProperties={arrayItemProperties}
              parentFieldName={fieldName}
              meta={{ ...meta }}
              {...props}
            />
          );
        }}
        defaultValues={defaultValues}
        isExpandable={true}
        title={fieldLabel}
        isModal={meta ? meta['isModal'] : false}
        infoTextTitle={arrayInfoText}
        maxArrayLength={fieldProperties ? fieldProperties['maxItems'] : null}
        readOnly={readOnly}
      />
    </div>
  );
}

/**
 * @interface iArrayRenderFieldProps
 * @property {tFormFieldRendererProps}
 * @property {LooseObject} [arrayItemProperties] Properties of array items being processed
 * @property {number} level Current level of data being processed - used for indentation of fields
 * @property {LooseObject} [meta] Any meta data that needs to be passed down
 * @property {string} parentFieldName parent array field name for triggering on change to check for uniqueness
 */
interface iArrayRenderFieldProps extends tFormFieldRendererProps {
  arrayItemProperties?: LooseObject;
  level: number;
  meta?: LooseObject;
  parentFieldName: string;
}
/**
 *
 * @param props {iArrayRenderFieldProps}
 * @returns
 */
function DPArrayRenderItem(props: iArrayRenderFieldProps) {
  const {
    arrayItemProperties,
    indexedArrayField,
    indexedErrors,
    isFocused,
    level,
    meta,
    parentFieldName,
  } = props;

  const { crudType, getFieldAttribute } = useContext(DynamicPropertyContext);

  const { formMethods } = useContext(FormControlUIContext);
  const { control, setValue, trigger, watch } = formMethods;
  const focusHelper = useDisplayFocus();

  //#region prop info for child components
  const required =
    getFieldAttribute(indexedArrayField, AttributeProperty.Required) === true;
  const readOnly =
    crudType === FormCrudType.view ||
    getFieldAttribute(indexedArrayField, AttributeProperty.ReadOnly) === true;

  // put in local state because it won't rerender just because
  // context for required has changed (only happens for a state change)
  // for array items, the parent array component sets these on add of item to array
  // so it may initially render it before they are set
  const [isRequired, setIsRequired] = useState(required);
  useEffect(() => {
    setIsRequired(required);
  }, [required]);

  useEffect(() => {
    if (isFocused) {
      if (arrayItemProperties) {
        if (arrayItemProperties['type'] !== 'object') {
          focusHelper.focusOnElementById(indexedArrayField);
        } else {
          // focus on first item field in object array properties
          const firstItemField =
            indexedArrayField +
            keyDelim +
            Object.keys(arrayItemProperties[propertiesKey])[0];
          focusHelper.focusOnElementById(firstItemField);
        }
      }
    }
  }, [isFocused]);

  const textFieldSxProps = {
    marginLeft: level * 2,
    width: '90%',
  };

  const sharedFormProps = {
    control: control,
    crudType: crudType,
    isModal: meta ? meta['isModal'] : false,
    readOnly: readOnly,
    required: isRequired,
    watch: watch,
    setValue: setValue,
    trigger: trigger,
  };

  if (arrayItemProperties) {
    if (arrayItemProperties.hasOwnProperty('enum')) {
      return (
        <div style={{ width: '300px' }}>
          <FormControlSelectField
            error={Boolean(indexedErrors)}
            helperText={indexedErrors ? indexedErrors.message : ''}
            infoText={
              arrayItemProperties?.hasOwnProperty('description')
                ? arrayItemProperties['description']
                : ''
            }
            name={indexedArrayField}
            label={''}
            sxProps={textFieldSxProps}
            {...sharedFormProps}
            onSelect={() => {
              trigger(parentFieldName);
            }}
          >
            {arrayItemProperties['enum'].map((item: any) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </FormControlSelectField>
        </div>
      );
    }
    if (arrayItemProperties['type'] === 'integer') {
      return (
        <Grid container spacing={2}>
          <Grid item xs={11}>
            <FormControlIntegerField
              error={Boolean(indexedErrors)}
              helperText={indexedErrors ? indexedErrors.message : ''}
              infoText={
                arrayItemProperties?.hasOwnProperty('description')
                  ? arrayItemProperties['description']
                  : ''
              }
              name={indexedArrayField}
              label={''}
              sxProps={textFieldSxProps}
              {...sharedFormProps}
              onChange={(value) => {
                setValue(indexedArrayField, value);
                trigger(parentFieldName);
              }}
            />
          </Grid>
        </Grid>
      );
    }
    if (arrayItemProperties['type'] === 'number') {
      return (
        <Grid container spacing={2}>
          <Grid item xs={11}>
            <FormControlFloatField
              error={Boolean(indexedErrors)}
              helperText={indexedErrors ? indexedErrors.message : ''}
              infoText={
                arrayItemProperties?.hasOwnProperty('description')
                  ? arrayItemProperties['description']
                  : ''
              }
              name={indexedArrayField}
              label={''}
              sxProps={textFieldSxProps}
              {...sharedFormProps}
              onChange={(value) => {
                setValue(indexedArrayField, value);
                trigger(parentFieldName);
              }}
            />
          </Grid>
        </Grid>
      );
    }

    if (arrayItemProperties['type'] === 'object') {
      return (
        <Grid container spacing={2} sx={{ paddingTop: '16px' }}>
          {Object.entries(arrayItemProperties[propertiesKey]).map(
            ([key, value], index: number) => (
              <div key={indexedArrayField + index} style={{ width: '100%' }}>
                {/*Dont render property name when it contains a component*/}
                {propertiesKey in (value as LooseObject) && (
                  <Typography
                    key={indexedArrayField + keyDelim + key}
                    sx={{ paddingLeft: (level + 1) * 2 }}
                    variant="h5"
                  >
                    {key}
                  </Typography>
                )}
                <Grid item xs={11}>
                  <DPRoot
                    properties={value as LooseObject}
                    fieldName={indexedArrayField + keyDelim + key}
                    level={level}
                    fieldErrors={indexedErrors}
                    meta={meta}
                    name={key}
                  />
                </Grid>
              </div>
            ),
          )}
          <Grid item xs={11} sx={{ paddingTop: '4px', paddingBottom: '4px' }}>
            <Divider />
          </Grid>
        </Grid>
      );
    }
  }
  // default to text field
  const formattedString = Boolean(
    arrayItemProperties && arrayItemProperties.hasOwnProperty('format'),
  );
  return (
    <Grid container spacing={2}>
      <Grid item xs={11}>
        <FormControlTextField
          error={Boolean(indexedErrors)}
          helperText={indexedErrors ? indexedErrors.message : ''}
          name={indexedArrayField}
          label={''}
          minRows={1}
          maxRows={maxDynamicFieldRows}
          multiline={!formattedString}
          sxProps={textFieldSxProps}
          {...sharedFormProps}
          onChange={(value) => {
            setValue(indexedArrayField, value);
            trigger(parentFieldName);
          }}
        />
      </Grid>
    </Grid>
  );
}
