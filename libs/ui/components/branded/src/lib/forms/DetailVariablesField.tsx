/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

/* Branded */
import {
  ButtonInfoField,
  ButtonInfoFormHeaderLayout,
  ButtonMainUi,
  DynamicSelectorFieldGroup,
  FormCrudType,
  tFormFieldRendererProps,
} from '@rangeos-nx/ui/branded';

/* MUI */
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

/* Icons */
import EditNoteIcon from '@mui/icons-material/EditNote';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/* API Topic */
import DetailVariablesModal from './DetailVariablesModal';

/**
 * @interface fieldGroupProps
 * @extends tFormFieldRendererProps
 * @property {FormCrudType} crudType Mode for displaying data
 * @property {any} detailApiHook Hook for getting individual detail by uuid
 * @property {string} detailQueryKey Key for query cache
 * @property {string} [detailEditRoute] Optional route for editting the item
 * @property {string} detailsField form field for details
 * @property {string} detailSchemaField schema field inside the detailsField
 * @property {string} detailTopic ID of DetailTopic
 * @property {string} detailVariablesField variables field inside the detailsField
 * @property {string} [displayVariablesField='displayVariables'] top-level dynamic UI schema field to be used by modal. values are copied from/to detailVariablesField on open/close of modal
 * @property {*} [formErrors] Top level form errors
 * @property {string} [selectionTargetId] Id for applying selection (typically to a form)
 * @property {(data: any, schema: any) => any}[defaultOverrideFields] Method to call to default override values to current data values
 * @property {(rowIndex: number, schema: any, details: any)} [onApplyDetails] Method to call when variables have been applied (for any additional processing)
 */
interface fieldGroupProps {
  crudType: FormCrudType;
  detailApiHook: any;
  detailQueryKey: string;
  detailEditRoute?: string;
  detailsField: string;
  detailSchemaField: string;
  detailTopic: string;
  detailVariablesField: string;
  displayVariablesField?: string;
  formErrors?: any;
  formProps: tFormFieldRendererProps;
  selectionTargetId?: string;
  defaultOverrideFields?: (data: any, schema: any) => void;
  onApplyDetails?: (rowIndex: number, schema: any, details: any) => void;
}

/**
 * Encapsulates the button used for editing detail variables based on associated Details
 * (examples: Ansible Role Variables / Traffic Variables)
 * NOTE: need to have
 *  #1 a top-level field in the "form data" to track the schema while making the edits
 *     it should be called something like displayVariables and have validation on it as
 *       displayVariables: getSingleYupValidationSchema()
 *     the name needs to be passed to DetailVariablesField for use by it if different
 *  #2 within the details array element, there needs to be a field to keep track of errors for the variables
 *     it should be called variablesDisplayError and have validation within the details array as
 *       variablesDisplayError: yup
 *            .string()
 *             .nullable()
 *            .max(0, mustEnterVariablesError),
 * @param {fieldGroupProps} props Props defining the details information
 * @returns {React.ReactElement}
 */

export function DetailVariablesField(props: fieldGroupProps) {
  const {
    crudType,
    detailApiHook,
    detailQueryKey,
    detailEditRoute,
    detailsField,
    detailSchemaField,
    detailTopic,
    detailVariablesField,
    displayVariablesField = 'displayVariables',
    formErrors,
    formProps,
    selectionTargetId,
    defaultOverrideFields,
    onApplyDetails,
  } = props;

  const { formMethods, indexedArrayField, isValid, rowIndex } = formProps;

  const { getValues, setValue, watch } = formMethods;

  const [variablesSchema, setVariablesSchema] = useState({});
  const [detailsName, setDetailsName] = useState('');

  const [hasProperties, setHasProperties] = useState(false);

  const watchDisplayId = watch(`${indexedArrayField}`);

  /**
   * Sets state for details data for this row when loaded (on mount)
   * and determines whether to hide the Variables button
   * @param data details data loaded
   */
  const handleDetailsLoaded = (data?: any) => {
    if (data) {
      setDetailsName(data.name || '');
      let schema: any = {};
      // make a copy so we can add in the defaults without affecting original data
      if (data[`${detailSchemaField}`]) {
        schema = structuredClone(data[`${detailSchemaField}`] as any);
      }

      const schemaKeys =
        schema && schema.properties ? Object.keys(schema.properties) : [];
      setHasProperties(schemaKeys.length > 0);

      // optionally default the overrides to current data values
      if (defaultOverrideFields && data && schemaKeys.length > 0) {
        schema = defaultOverrideFields(data, schema);
      }

      setVariablesSchema(schema);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditVariables = () => {
    // set the "displayVariables" to current variables for this details element
    setValue(
      displayVariablesField,
      getValues(`${detailsField}[${rowIndex}].${detailVariablesField}`),
    );
    setIsModalOpen(true);
  };

  const handleModalClose = (apply?: boolean) => {
    setIsModalOpen(false);
    if (apply && onApplyDetails) {
      onApplyDetails(
        rowIndex || 0, // to keep typescript happy
        variablesSchema,
        getValues(`${detailsField}[${rowIndex}]`),
      );
    }
    formMethods.trigger(`${detailsField}[${rowIndex}]`);
  };

  const isSelected = Boolean(watchDisplayId);

  const displayError = getValues(
    `${detailsField}[${rowIndex}].variablesDisplayError`,
  );

  return (
    <>
      <DetailVariablesModal
        detailName={detailsName}
        detailVariablesField={detailVariablesField}
        displayVariablesField={displayVariablesField}
        schema={variablesSchema}
        crudType={crudType}
        indexedArrayField={`${detailsField}[${rowIndex}]`}
        formErrors={formErrors}
        isValid={isValid}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
      <Grid container spacing={0.5} sx={{ marginLeft: '12px' }}>
        <Grid item xs={8}>
          <DynamicSelectorFieldGroup
            crudType={crudType}
            formProps={formProps}
            apiHook={detailApiHook}
            inspectorProps={{
              crudType:
                crudType === FormCrudType.design ? FormCrudType.edit : crudType, // always need to fetch here
              editRoute: detailEditRoute,
              shouldFetch: true, //always fetch & resolve assets
              shouldResolve: true,
              shouldApplyErrors: true,
              onDataLoaded: handleDetailsLoaded,
            }}
            queryKey={detailQueryKey}
            textFieldProps={{ required: true }}
            selectionTargetId={selectionTargetId}
            shouldShowButtonText={false}
            topicId={detailTopic}
          />
        </Grid>
        {isSelected && hasProperties && (
          <Grid item xs={3}>
            <Box
              sx={{
                alignItems: 'center',
                height: '100%',
                display: 'flex',
                fiexDirection: 'row',
              }}
            >
              <ButtonMainUi
                id={'button-edit-variables'}
                startIcon={
                  crudType === FormCrudType.view ? undefined : <EditNoteIcon />
                }
                onClick={handleEditVariables}
              >
                Variables
              </ButtonMainUi>
              {displayError && displayError.length > 0 && (
                <ButtonInfoField
                  alertProps={{
                    icon: <ErrorOutlineIcon color="error" />,
                    severity: 'error',
                  }}
                  infoIcon={
                    <ErrorOutlineIcon fontSize="inherit" color="error" />
                  }
                  name="variables-error-icon"
                  message={displayError}
                  props={{ sx: ButtonInfoFormHeaderLayout }}
                />
              )}
            </Box>
          </Grid>
        )}
      </Grid>
    </>
  );
}

export default DetailVariablesField;
