/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-no-useless-fragment */
import { useContext, useEffect, useRef, useState } from 'react';

/* Branded */
import {
  DataFetcher,
  FormControlUIContext,
  FormCrudType,
  TimePickerContext,
} from '@rangeos-nx/ui/branded';

/* MUI */
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import DynamicPropertyFormFields from './DynamicPropertyFormFields';
import { useDynamicSchemaValidation } from '@rangeos-nx/ui/redux';
import {
  DynamicPropertyContext,
  propertiesKey,
} from './DynamicPropertyContext';

const dynamicSchemaPropertyHeaders = ['values', 'rangeVolumes'];
const noDynamicPropertiesMessage = 'No Properties found';

/**
 * @typedef {Object} tDynamicSchemaProps
 * @property {*} [apiHook] API hook for getting the list of items (if retrieval is needed)
 * @property {FormCrudType} crudType APi request method type
 * @property {*} errors Form Errors
 * @property {boolean} [handleAsSingleYupValidation=false] Whether to handle schema as a single validation item (use getFullYupValidation to retrieve from context)
 * @property {boolean} [isModal] Whether form is presented in a modal
 * @property {boolean} [isValid] React hook form valid indicator
 * @property {*} [payload] Payload to go with apihook
 * @property {*} [schemaData] Actual schema data for dynamic fields already known
 * @property {string} [valuesFieldName] Top level in form data where dynamic field values are stored (e.g. values)
 * @property {string} [warningMessage] Warning message to display to user
 */
type tDynamicSchemaProps = {
  apiHook?: any;
  crudType: FormCrudType;
  errors: any;
  handleAsSingleYupValidation?: boolean;
  isModal?: boolean;
  isValid?: boolean;
  schemaData?: any;
  valuesFieldName?: string; // top level in form data where dynamic field values are stored (e.g. values)
  warningMessage?: string;
  payload?: any;
};

/**
 * DynamicSchema
 * Wraps the processing of dynamic schema properties within the context of a react-hook-form
 * The schema is fetched via the api hook (or passed in with schemaData prop)
 * NOTE: Parent Form must be defined within FormControlUIProvider so that the form context methods
 *  (e.g. getValues, setValue...) can be used in DynamicPropertyFields without passing through multiple layers
 * @param {tDynamicSchemaProps} props Component props
 * @returns {React.ReactElement}
 */
export function DynamicSchema(props: tDynamicSchemaProps) {
  const {
    apiHook,
    crudType,
    errors,
    handleAsSingleYupValidation = false,
    isModal = false,
    isValid,
    valuesFieldName,
    warningMessage = '',
    payload,
  } = props;
  const [errorMessage, setErrorMessage] = useState('');
  const [schemaData, setSchemaData] = useState<any>(
    props.schemaData ? props.schemaData : null,
  );

  const {
    createSchemaYupValidator,
    resetSingleYupValidationSchema,
    resetYupValidationSchemaForKey,
    setSingleYupValidationSchema,
    setYupValidationSchemaForKey,
  } = useContext(DynamicPropertyContext);

  const { clearValidation, setIsValidationSetUp } =
    useDynamicSchemaValidation();
  const { formMethods } = useContext(FormControlUIContext);
  const { trigger } = formMethods;

  // need to use data: any so that we can check Object.keys for properties
  const hasProperties = (data: any) => {
    return (
      data &&
      data.hasOwnProperty(propertiesKey) &&
      Object.keys(data[propertiesKey]).length > 0
    );
  };

  useEffect(() => {
    if (schemaData) {
      setUpValidationSchema(schemaData);
      // trigger here when schema data changes so user knows if properties have errors
      trigger();
    }
  }, [schemaData]);

  const setUpValidationSchema = (data: any) => {
    clearValidation();
    if (!hasProperties(data)) {
      if (handleAsSingleYupValidation) {
        resetSingleYupValidationSchema();
      } else if (dynamicSchemaPropertyHeaders.length > 0) {
        dynamicSchemaPropertyHeaders.forEach((propertyName) => {
          resetYupValidationSchemaForKey(propertyName);
        });
      }
    } else {
      // create necessary yup validators based on schema data
      if (handleAsSingleYupValidation) {
        setSingleYupValidationSchema(createSchemaYupValidator(data));
      } else if (dynamicSchemaPropertyHeaders.length > 0) {
        dynamicSchemaPropertyHeaders.forEach((propertyName) => {
          if (
            data[propertiesKey].hasOwnProperty(propertyName) &&
            hasProperties(data[propertiesKey][propertyName])
          ) {
            setYupValidationSchemaForKey(
              propertyName,
              createSchemaYupValidator(data[propertiesKey][propertyName]),
            );
          } else {
            resetYupValidationSchemaForKey(propertyName);
          }
        });
      }
    }
    setIsValidationSetUp(true);
    setErrorMessage('');
  };

  const handleSchemaDataError = (error: string) => {
    setErrorMessage(error);
  };

  return (
    <>
      {warningMessage ? (
        <Box sx={{ margin: '12px' }}>
          <Alert severity="warning" sx={{ padding: '12px', maxWidth: '480px' }}>
            {warningMessage}
          </Alert>
        </Box>
      ) : (
        <>
          {errorMessage && (
            <Box sx={{ margin: '12px' }}>
              <Alert
                severity="warning"
                sx={{ padding: '12px', maxWidth: '480px' }}
              >
                {errorMessage}
              </Alert>
            </Box>
          )}
          {apiHook && (
            <DataFetcher
              apiHook={apiHook}
              payload={payload}
              onDataLoad={(data: any) => setSchemaData(data)}
              onError={handleSchemaDataError}
              shouldSuppressToaster={true}
            />
          )}
          {schemaData && (
            <>
              {hasProperties(schemaData) ? (
                <DynamicPropertyFormFields
                  valuesFieldName={valuesFieldName}
                  isModal={isModal}
                  isValid={isValid}
                  properties={schemaData}
                  errors={errors}
                />
              ) : (
                <Box sx={{ margin: '12px' }}>
                  <Alert
                    severity="info"
                    sx={{ padding: '12px', maxWidth: '480px' }}
                  >
                    {noDynamicPropertiesMessage}
                  </Alert>
                </Box>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
export default DynamicSchema;
